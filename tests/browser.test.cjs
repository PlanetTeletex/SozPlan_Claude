/* Optional real-browser checks: install playwright and its Chromium, then run
   node --test tests/browser.test.cjs. PECHA_BROWSER_EXECUTABLE can select an
   existing Chromium. PECHA_FONT_DIR can supply @fontsource/crimson-pro/files. */
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const http=require('node:http');
const {chromium}=require('playwright');
const root=path.resolve(__dirname,'..');
test('storage, actual title bounds, print layout and shared-origin offline apps',async()=>{
  const server=http.createServer((req,res)=>{
    const pathname=decodeURIComponent(new URL(req.url,'http://local').pathname);
    const file=path.join(root,pathname.endsWith('/')?pathname+'index.html':pathname);
    if(!file.startsWith(root+path.sep)){res.writeHead(403).end();return}
    try{const types={'.html':'text/html','.js':'text/javascript','.json':'application/json','.svg':'image/svg+xml','.png':'image/png'};
      res.setHeader('Content-Type',types[path.extname(file)]||'application/octet-stream');res.end(fs.readFileSync(file));
    }catch{res.writeHead(404).end()}
  });
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  let browser;
  try{
    browser=await chromium.launch({headless:true,executablePath:process.env.PECHA_BROWSER_EXECUTABLE||undefined,
      args:['--no-sandbox','--disable-dev-shm-usage']});
    const context=await browser.newContext();const page=await context.newPage();const errors=[];
    page.on('pageerror',e=>errors.push(e.message));
    if(process.env.PECHA_FONT_DIR){
      await context.route('https://fonts.googleapis.com/**',route=>route.fulfill({contentType:'text/css',body:
        [400,600].map(weight=>`@font-face{font-family:'Crimson Pro';font-style:normal;font-weight:${weight};src:url(https://fonts.gstatic.com/test-${weight}.woff2) format('woff2')}`).join('\n')}));
      await context.route('https://fonts.gstatic.com/test-*.woff2',route=>{
        const weight=/test-(\d+)/.exec(route.request().url())[1];
        return route.fulfill({contentType:'font/woff2',body:fs.readFileSync(path.join(process.env.PECHA_FONT_DIR,`crimson-pro-latin-${weight}-normal.woff2`))});
      });
    }
    const origin=`http://127.0.0.1:${server.address().port}`;
    await page.goto(origin+'/pecha/');await page.evaluate(()=>document.fonts.ready);
    await page.locator('#new-text').click();await page.locator('#f-title').fill('Saved text');
    await page.locator('#f-body').fill('A prayer line.');
    await page.waitForFunction(()=>document.querySelector('#savebar').dataset.state==='saved');
    const original=await page.evaluate(()=>localStorage.getItem('pecha.library'));
    await page.evaluate(()=>{window.originalSet=Storage.prototype.setItem;Storage.prototype.setItem=function(){throw new DOMException('full','QuotaExceededError')}});
    await page.locator('#f-body').fill('An unsaved revision.');
    await page.waitForFunction(()=>document.querySelector('#savebar').dataset.state==='error');
    assert.equal(await page.locator('#save-retry').isVisible(),true);
    await page.locator('#import').setInputFiles({name:'collection.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify({texts:[{id:'imported',title:'Imported',body:'Text'}]}))});
    await page.waitForFunction(()=>document.querySelector('#toast').textContent.includes('nicht übernommen'));
    assert.equal(await page.evaluate(()=>lib.some(t=>t.id==='imported')),false);
    assert.equal(await page.evaluate(()=>localStorage.getItem('pecha.library')),original);
    await page.evaluate(()=>Storage.prototype.setItem=window.originalSet);
    await page.locator('#save-retry').click();
    await page.waitForFunction(()=>document.querySelector('#savebar').dataset.state==='saved');
    assert.match(await page.evaluate(()=>localStorage.getItem('pecha.library')),/An unsaved revision/);
    // Clearing an existing record is still saved, rather than silently ignored.
    await page.locator('#f-title').fill('');await page.locator('#f-body').fill('');
    await page.waitForFunction(()=>document.querySelector('#savebar').dataset.state==='saved');
    assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('pecha.library')).texts[0].body),'');
    await page.locator('#setbox').evaluate(el=>el.open=true);
    for(const format of ['A','B','C']){
      await page.locator('#f-format').selectOption(format);
      await page.locator('#f-title').fill('A moderately long prayer title about compassion and patience '.repeat(3));
      await page.locator('#f-subtitle').fill('An author with dates and a descriptive subtitle');
      await page.locator('#f-body').fill('# Opening\nMay all beings be happy.\nMay all beings be free.');
      assert.equal(await page.locator('#print-leaves').isDisabled(),false);
      const bounds=await page.evaluate(()=>{
        const leaf=document.querySelector('#preview .leaf'),lr=leaf.getBoundingClientRect();
        return [...leaf.querySelectorAll('.titlepage .tl,.titlepage .tls,.titlepage .orn')].every(el=>{
          const r=el.getBoundingClientRect();return r.top>=lr.top-1&&r.bottom<=lr.bottom+1&&r.left>=lr.left-1&&r.right<=lr.right+1;
        });
      });assert.equal(bounds,true,format+' title overflow');
      await page.evaluate(()=>buildLeafSheets(current));await page.emulateMedia({media:'print'});
      const printBounds=await page.evaluate(()=>{
        const leaf=document.querySelector('#print-root .leaf'),lr=leaf.getBoundingClientRect();
        return [...leaf.querySelectorAll('.tl,.tls,.orn')].every(el=>{
          const r=el.getBoundingClientRect();return r.top>=lr.top-1&&r.bottom<=lr.bottom+1;
        });
      });assert.equal(printBounds,true,format+' print overflow');
      await page.emulateMedia({media:'screen'});
    }
    await page.locator('#f-title').fill('A title much too long '.repeat(1000));
    assert.equal(await page.locator('#print-leaves').isDisabled(),true);
    assert.match(await page.locator('#layout-report').textContent(),/kürzen/);
    await page.locator('#f-title').fill('A short title');
    await page.locator('#f-body').fill('# An isolated heading\n---\nBody');
    assert.match(await page.locator('#layout-report').textContent(),/ohne folgenden Text/);
    // Test both service workers on one origin. Force an upgrade by unregistering
    // the worker but retaining its cache and another app's cache.
    await page.evaluate(()=>navigator.serviceWorker.ready);
    const lojong=await context.newPage();await lojong.goto(origin+'/lojong/');
    await lojong.evaluate(()=>navigator.serviceWorker.ready);
    const both=await page.evaluate(()=>caches.keys());
    assert.ok(both.some(n=>n.startsWith('pecha-')));assert.ok(both.some(n=>n.startsWith('lojong-')));
    for(const app of ['pecha','lojong']){
      await page.evaluate(async app=>{
        const reg=(await navigator.serviceWorker.getRegistrations()).find(r=>r.scope.endsWith('/'+app+'/'));
        await reg.unregister();await caches.open(app+'-stale');
        await navigator.serviceWorker.register('/'+app+'/sw.js',{scope:'/'+app+'/'});
      },app);
      await page.waitForFunction(async app=>{
        const names=await caches.keys();return !names.includes(app+'-stale')&&names.some(n=>n.startsWith(app+'-'));
      },app);
      const names=await page.evaluate(()=>caches.keys());
      assert.ok(names.some(n=>n.startsWith('pecha-')));assert.ok(names.some(n=>n.startsWith('lojong-')));
    }
    await context.setOffline(true);await page.goto(origin+'/pecha/');await lojong.goto(origin+'/lojong/');
    assert.equal(await page.title(),'Pecha');assert.match(await lojong.title(),/Lojong/i);
    assert.deepEqual(errors,[]);
  }finally{if(browser)await browser.close();await new Promise(resolve=>server.close(resolve))}
});
