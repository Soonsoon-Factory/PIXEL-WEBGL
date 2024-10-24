
const CACHE_VERSION = '0.4_2024.10.25.05.55';
const CACHE_NAME = `game-cache-${CACHE_VERSION}`;

const CACHE_TARGETS = [
    'index.html',
    'Build/WEB.js',
    'Build/WEB.wasm',
    'Build/WEB.data',
    'Build/WEB.framework.js',
    'TemplateData/style.css'
];

self.addEventListener('install', event => {
    console.log('[ServiceWorker] Installing version:', CACHE_VERSION);
    
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(name => {
                    if (name !== CACHE_NAME) {
                        console.log('[ServiceWorker] Deleting old cache:', name);
                        return caches.delete(name);
                    }
                })
            );
        }).then(() => {
            return caches.open(CACHE_NAME).then(cache => {
                console.log('[ServiceWorker] Creating new cache:', CACHE_NAME);
                return cache.addAll(CACHE_TARGETS);
            });
        })
    );
});

self.addEventListener('activate', event => {
    console.log('[ServiceWorker] Activated');
    event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', event => {
    event.respondWith(
        fetch(event.request)
            .then(response => {
                if (event.request.url.includes('.framework.js')) {
                    return response;
                }
                
                const clonedResponse = response.clone();
                caches.open(CACHE_NAME).then(cache => {
                    cache.put(event.request, clonedResponse);
                });
                
                return response;
            })
            .catch(() => {
                return caches.match(event.request);
            })
    );
});

self.addEventListener('message', event => {
    if (event.data === 'skipWaiting') {
        self.skipWaiting();
    }
});