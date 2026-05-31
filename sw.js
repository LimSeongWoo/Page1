const CACHE = 'coding-shorts-v7';
const ICONS = ['icon-192.png', 'icon-512.png', 'manifest.json'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ICONS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});
self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  if (url.origin !== location.origin) return; // 유튜브 등은 그냥 통과
  // HTML / feed.json: 네트워크 우선(항상 최신), 실패 시 캐시
  const netFirst = e.request.mode === 'navigate' || url.pathname.endsWith('.html')
    || url.pathname.endsWith('feed.json') || url.pathname === '/Page1/' || url.pathname.endsWith('/');
  if (netFirst) {
    e.respondWith(
      fetch(e.request).then((r) => { const c = r.clone(); caches.open(CACHE).then((x) => x.put(e.request, c)); return r; })
        .catch(() => caches.match(e.request))
    );
    return;
  }
  // 아이콘 등: 캐시 우선
  e.respondWith(caches.match(e.request).then((r) => r || fetch(e.request)));
});
