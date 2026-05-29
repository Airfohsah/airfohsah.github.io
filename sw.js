const CACHE = 'watinbethis-v1';
const ASSETS = [
  '/',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);

  // Network first for index.html — always get fresh version
  if(url.pathname === '/' || url.pathname === '/index.html'){
    e.respondWith(
      fetch(e.request)
        .then(response => {
          // Cache the fresh copy as backup
          const clone = response.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
          return response;
        })
        .catch(() => caches.match(e.request)) // offline fallback
    );
    return;
  }

  // Cache first for everything else (icons, manifest, fonts)
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request))
  );
});
