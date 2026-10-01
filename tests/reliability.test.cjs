/* Run with node --test tests/reliability.test.cjs; no browser dependencies.
   Exercise the actual inline functions and service-worker activation handlers.
   Text measurement is stubbed here; browser geometry needs the browser suite. */
const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const html = fs.readFileSync(path.join(__dirname, '../pecha/index.html'), 'utf8');
const code = html.split('<script>')[1].split('</script>')[0];
function fn(name){
  const start = code.indexOf('function ' + name + '(');
  assert.ok(start >= 0, name);
  return code.slice(start, code.indexOf('\n}', start) + 2);
}
function context(source){
  const ctx = vm.createContext({console, setTimeout, clearTimeout});
  vm.runInContext(source, ctx);
  return ctx;
}
function storageContext(){
  const start = code.indexOf('document.getElementById("import").addEventListener("change"');
  const handler = code.slice(start, code.indexOf('\n});', start) + 4);
  return context(`
    const FORMATS={C:{w:210,h:99,lines:6,fs:6.6,ml:21}};
    const BANDS={wine:{c:null}}; const LIB_KEY='library';
    let fail=false, persisted=null, lib=[], current=null, saveTimer=null;
    let saveState='saved',saveWarned=false,toasts=[], imported;
    let importHandler; const nodes = new Map();
    const document={getElementById(id){
      if(!nodes.has(id)) nodes.set(id,{dataset:{},hidden:false,textContent:'',
        addEventListener:(event, callback)=>{if(id==='import') importHandler=callback}});
      return nodes.get(id);
    }};
    const store={set(k,v){if(fail)return false;persisted=v;return true}};
    function toast(s){toasts.push(s)}; function drawLib(){};
    class FileReader{readAsText(){this.result=JSON.stringify(imported);this.onload()}}
    ${['newText','fix','setSaveStatus','saveLib'].map(fn).join('\n')}
    ${handler}
    function importNow(){importHandler({target:{files:[{}]}})}
  `);
}
test('failed import leaves live and persisted collection unchanged, without success toast',()=>{
  const c=storageContext();
  vm.runInContext(`lib=[fix({id:'original',title:'Keep',updated:1})];saveLib();
    const before=persisted; imported={texts:[{id:'new',title:'New'}]};fail=true;importNow();
    if(lib.length!==1||lib[0].id!=='original'||persisted!==before)throw Error('import mutated library');
    if(toasts.some(t=>t.includes('neu,')))throw Error('false success');
    if(!toasts.at(-1).includes('nicht übernommen'))throw Error('failure missing');`,c);
});
test('successful import merges newer entries and keeps current reference',()=>{
  const c=storageContext();
  vm.runInContext(`lib=[fix({id:'original',title:'Old',updated:2})];current=lib[0];
    imported={texts:[{id:'original',title:'Older',updated:1},{id:'new',title:'New',updated:3},
    {id:'original',title:'Latest',updated:4}]};importNow();
    if(lib.length!==2||current.title!=='Latest')throw Error('merge');
    if(JSON.parse(persisted).texts[0].title!=='Latest')throw Error('not persisted');`,c);
});
test('failed write remains visible until retry succeeds',()=>{
  const c=storageContext();
  vm.runInContext(`fail=true;saveLib();saveLib();
    if(saveState!=='error'||nodes.get('save-retry').hidden||toasts.length!==1)throw Error('status');
    fail=false;saveLib();
    if(saveState!=='saved'||!nodes.get('save-retry').hidden)throw Error('retry');`,c);
});
test('invalid trailing import record cannot partially modify the collection',()=>{
  const c=storageContext();
  vm.runInContext(`lib=[fix({id:'original'})];saveLib();const before=persisted;
    imported={texts:[{id:'valid',title:'Valid'},null]};importNow();
    if(lib.length!==1||persisted!==before)throw Error('partial import');`,c);
});
test('legacy records normalize invalid layout fields and image counter',()=>{
  const c=storageContext();
  vm.runInContext(`const t=fix({title:123,format:'bad',lines:0,lh:0,columns:99,
    images:{'7':'data:image/png;base64,abc',bad:'https://example.org'},imgSeq:1});
    if(t.title!==''||t.format!=='C'||t.lines!==3||t.lh!==1.2||t.columns!==3||t.imgSeq!==7)
      throw Error('normalization');`,c);
});
for(const app of ['pecha','lojong'])test(app+' activation removes only its own stale caches',async()=>{
  const src=fs.readFileSync(path.join(__dirname,'..',app,'sw.js'),'utf8');
  let activate, pending;const deleted=[];
  const version=/const VERSION = "([^"]+)"/.exec(src)[1];
  const current=app+'-'+version;
  const other=app==='pecha'?'lojong':'pecha';
  const c=vm.createContext({self:{addEventListener:(event,cb)=>{if(event==='activate')activate=cb},
    clients:{claim:async()=>{}}},caches:{keys:async()=>[current,app+'-old',other+'-current','unrelated'],
    delete:async name=>deleted.push(name)}});
  vm.runInContext(src,c);activate({waitUntil:p=>pending=p});await pending;
  assert.deepEqual(deleted,[app+'-old']);
});
function layoutContext(){
  return context(`const FORMATS={B:{w:297,h:70,per:3,orient:'landscape',name:'B'}};
    const BANDS={wine:{c:null}};const meas={style:{}};
    function splitPara(s){
      if(s==='Long heading')return ['H1','H2','H3','H4','H5','H6'];
      const n=Math.max(1,Math.ceil(s.length*parseFloat(meas.style.fontSize)*.5/parseFloat(meas.style.width)));
      return Array.from({length:n},(_,i)=>s.slice(Math.floor(i*s.length/n),Math.floor((i+1)*s.length/n)));
    }
    function fitGeometry(t,g){return g}
    ${['geometry','titleBlockHeight','composeTitlePage','parseBody','compose'].map(fn).join('\n')}
    const base={format:'B',fs:5.2,lh:2,ml:26,lines:6,columns:1,band:'wine',
      title:'',subtitle:'',showTitle:true,keepBreaks:true,body:''};
  `);
}
test('oversized heading keeps last heading line with first body line; warns about split',()=>{
  const c=layoutContext();
  vm.runInContext(`const out=compose({...base,body:'# Long heading\\nBody'});
    const boxes=out.sides.flat();
    if(boxes[0].length!==5||boxes[1][0].text!=='H6'||boxes[1][1].text!=='Body')throw Error('orphan');
    if(!out.warnings.some(w=>w.message.includes('wird geteilt')))throw Error('missing warning');`,c);
});
test('short stanzas remain together and forced column break is preserved',()=>{
  const c=layoutContext();
  vm.runInContext(`const out=compose({...base,body:'A1\\nA2\\n\\nB1\\nB2\\n|||\\nC1'});
    if(out.sides[0][0].map(r=>r.text).join(',')!=='A1,A2,,B1,B2'||out.sides[1][0][0].text!=='C1')
      throw Error('flow changed');`,c);
});
test('title adapts independently; extremely long title blocks print',()=>{
  const c=layoutContext();
  vm.runInContext(`const t={...base,title:'A moderately long title '.repeat(4),subtitle:'Author and dates'};
    const g=geometry(t);const page=composeTitlePage(t,g);
    if(page.titleOverflow||page.titleScale>=1||g.fs!==base.fs)throw Error('title fit');
    const out=compose({...base,title:'Very long title '.repeat(1000)});
    if(!out.warnings.some(w=>w.blocking))throw Error('missing block');
    if(meas.style.fontWeight!=='400'||meas.style.letterSpacing!=='')throw Error('measurement leaked');`,c);
});
test('title verso image and folio sequence remain intact',()=>{
  const c=layoutContext();
  vm.runInContext(`const image='data:image/jpeg;base64,abc';
    const out=compose({...base,title:'Title',body:'[[Bild 1]]\\nBody',images:{1:image}});
    if(!out.sides[0].title||out.sides[1].image!==image||out.sides[2][0][0].text!=='Body')
      throw Error('title verso changed');`,c);
});
// Validate the full inline script as well as the extracted functions.
new vm.Script(code);
