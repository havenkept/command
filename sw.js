const CACHE_NAME = 'havenkept-command-center-v1';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(names) {
      return Promise.all(
        names.filter(function(n) { return n !== CACHE_NAME; }).map(function(n) { return caches.delete(n); })
      );
    })
  );
  self.clients.claim();
});

// Network-first for everything (so Airtable syncs / edits are always fresh when online),
// falling back to cache only when offline.
self.addEventListener('fetch', function(e) {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request).then(function(res) {
      var resClone = res.clone();
      caches.open(CACHE_NAME).then(function(cache) { cache.put(e.request, resClone); });
      return res;
    }).catch(function() {
      return caches.match(e.request);
    })
  );
});
