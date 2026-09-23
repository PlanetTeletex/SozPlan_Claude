/* Pecha — offline support.
   Bump VERSION to retire the old cache; the page itself is fetched
   network-first, so edits reach an installed app as soon as it is online. */
const VERSION = "2026-09-23-fresh-icons";
const CACHE = "pecha-" + VERSION;
const CORE = [
  "./", "./index.html", "./manifest.json",
  "./icon.svg", "./favicon.svg",
  "./apple-touch-icon.png", "./icon-192.png", "./icon-512.png",
  "./icon-maskable-192.png", "./icon-maskable-512.png"
];
const FONT_HOSTS = ["fonts.googleapis.com", "fonts.gstatic.com"];
/* the manifest and the icons, which a home screen asks for again at install time */
const FRESH = /\/(manifest\.json|favicon\.svg|icon[\w-]*\.(png|svg)|apple-touch-icon\.png)$/;

self.addEventListener("install", event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    await Promise.allSettled(CORE.map(url => cache.add(new Request(url, { cache: "reload" }))));
    self.skipWaiting();
  })());
});

self.addEventListener("activate", event => {
  event.waitUntil((async () => {
    const names = await caches.keys();
    await Promise.all(names.filter(n => n !== CACHE).map(n => caches.delete(n)));
    await self.clients.claim();
  })());
});

self.addEventListener("fetch", event => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  const sameOrigin = url.origin === self.location.origin;
  const isFont = FONT_HOSTS.includes(url.hostname);
  if (!sameOrigin && !isFont) return;

  if (req.mode === "navigate"){
    event.respondWith((async () => {
      try {
        const fresh = await fetch(req);
        (await caches.open(CACHE)).put("./index.html", fresh.clone());
        return fresh;
      } catch {
        return (await caches.match("./index.html")) || (await caches.match("./")) || Response.error();
      }
    })());
    return;
  }

  /* The manifest and the icons are fetched anew when the page is added to a
     home screen. A stale copy served from here shows up as a wrong icon, so
     these go to the network first and fall back to the cache only offline. */
  if (sameOrigin && FRESH.test(url.pathname)){
    event.respondWith((async () => {
      try {
        const fresh = await fetch(req);
        if (fresh && fresh.ok) (await caches.open(CACHE)).put(req, fresh.clone());
        return fresh;
      } catch {
        return (await caches.match(req)) || Response.error();
      }
    })());
    return;
  }

  event.respondWith((async () => {
    const cached = await caches.match(req);
    const network = fetch(req).then(res => {
      if (res && (res.ok || res.type === "opaque")){
        caches.open(CACHE).then(c => c.put(req, res.clone()));
      }
      return res;
    }).catch(() => null);
    return cached || (await network) || Response.error();
  })());
});
