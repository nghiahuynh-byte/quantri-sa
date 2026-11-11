const CACHE_NAME = 'sa-crm-cache-v3.25_20261111_095113';
const urlsToCache = [
  './',
  './index.html',
  './crm_data.js',
  './crm_mapping.js',
  './manifest.json',
  './logo_sa_gold.png',
  './logo_sa_navy.png'
];

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache).catch(() => { }))
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
    )).then(() => self.clients.claim())
  );
});

// Network-First strategy: luôn ưu tiên lấy dữ liệu và giao diện mới nhất từ server (07:00 AM auto-update), chỉ dùng cache khi mất mạng
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    fetch(event.request, { cache: 'no-store' })
      .then(networkResponse => {
        if (networkResponse && networkResponse.status === 200) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, responseClone));
        }
        return networkResponse;
      })
      .catch(() => caches.match(event.request))
  );
});
