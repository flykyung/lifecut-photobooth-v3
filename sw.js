// 인터넷이 되면 항상 최신 파일을 받고, 인터넷이 끊기면 마지막으로 받아 둔 파일로 열린다.
const CACHE_PREFIX = 'lifecut-photobooth-';
const CACHE = CACHE_PREFIX + 'v3';

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(['./', './index.html']))
  );
});

self.addEventListener('activate', (event) => {
  // 같은 주소(flykyung.github.io) 아래 다른 앱의 캐시는 건드리지 않고, 이 앱의 옛 버전 캐시만 지운다
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys.filter((k) => k.startsWith(CACHE_PREFIX) && k !== CACHE).map((k) => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;

  event.respondWith(
    fetch(req)
      .then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((cache) => cache.put(req, copy));
        return res;
      })
      .catch(() => caches.match(req).then((cached) => cached || caches.match('./index.html')))
  );
});
