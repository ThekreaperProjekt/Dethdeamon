// Very small cache-first service worker for the static safe demo.
// Keeps app shell available offline.
const CACHE_NAME = 'deth-demo-cache-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/style.css',
  '/app.js',
  '/manifest.json'
];

// Install: cache core assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(c => c.addAll(ASSETS))
  );
  self.skipWaiting();
});

// Activate: cleanup old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(keys.map(k => (k !== CACHE_NAME ? caches.delete(k) : null))))
  );
  self.clients.claim();
});

// Fetch: try cache first, then network
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request).then(cached => cached || fetch(event.request).then(r => {
      // only cache same-origin successful responses
      if (!r || r.status !== 200 || new URL(event.request.url).origin !== location.origin) return r;
      const copy = r.clone();
      caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
      return r;
    }).catch(() => caches.match('/index.html')))
  );
});
