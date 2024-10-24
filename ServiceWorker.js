
const CACHE_VERSION = '0.4_2024.10.25.10.25';
const CACHE_NAME = `game-cache-${CACHE_VERSION}`;

const CACHE_TARGETS = [
    'Build/WEB.loader.js',
    'Build/WEB.framework.js',
    'Build/WEB.data',
    'Build/WEB.wasm',
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

self.addEventListener('fetch', event => {
    event.respondWith(
        fetch(event.request)
            .then(response => {
                // framework.js는 항상 네트워크에서 가져오기
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