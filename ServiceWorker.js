
const CACHE_VERSION = '0.4_2024.10.25.07.57';
const CACHE_NAME = `game-cache-0.4_2024.10.25.07.57`;

const CACHE_TARGETS = [
    'index.html',
    'Build/WEB.js',
    'Build/WEB.wasm',
    'Build/WEB.data',
    'Build/WEB.framework.js',
    'TemplateData/style.css'
];
self.addEventListener('install', function (e) {
  console.log('[Service Worker] Install');

  e.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => {
            return name !== CACHE_NAME;
          })
          .map((name) => {
            console.log('[Service Worker] Deleting old cache:', name);
            return caches.delete(name);
          })
      );
    })
  );

  e.waitUntil(
    (async function () {
      const cache = await caches.open(CACHE_NAME);
      console.log('[Service Worker] Caching all: app shell and content');
      await cache.addAll(CACHE_TARGETS);
    })()
  );
});

self.addEventListener('fetch', function (e) {
  e.respondWith(
    (async function () {
      let response = await caches.match(e.request);
      console.log(`[Service Worker] Fetching resource: ${e.request.url}`);
      if (response) {
        return response;
      }

      response = await fetch(e.request);
      const cache = await caches.open(CACHE_NAME);
      console.log(`[Service Worker] Caching new resource: ${e.request.url}`);
      cache.put(e.request, response.clone());
      return response;
    })()
  );
});

self.addEventListener('message', function (event) {
    if (event.data === 'skipWaiting') {
        self.skipWaiting();
    }
});
