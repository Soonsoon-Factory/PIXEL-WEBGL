const cacheName = "DefaultCompany-PixelEditor-0.4";
const contentToCache = [
    "Build/c87d6c93e7e124840d10db9bbf1cbeac.loader.js",
    "Build/2fba48a26417cef0b990b66c9aa769cf.framework.js",
    "Build/fde14c6df6553a83279dbc55ccee67df.data",
    "Build/1645f2ad134856fe528d75c74c0d8163.wasm",
    "TemplateData/style.css"

];

self.addEventListener('install', function (e) {
    console.log('[Service Worker] Install');
    
    e.waitUntil((async function () {
      const cache = await caches.open(cacheName);
      console.log('[Service Worker] Caching all: app shell and content');
      await cache.addAll(contentToCache);
    })());
});

self.addEventListener('fetch', function (e) {
    e.respondWith((async function () {
      let response = await caches.match(e.request);
      console.log(`[Service Worker] Fetching resource: ${e.request.url}`);
      if (response) { return response; }

      response = await fetch(e.request);
      const cache = await caches.open(cacheName);
      console.log(`[Service Worker] Caching new resource: ${e.request.url}`);
      cache.put(e.request, response.clone());
      return response;
    })());
});
