// Service worker de Eternia: precache del build completo → funciona sin red después de la primera visita.
const VERSION = '__SW_VERSION__';
const PRECACHE = __PRECACHE_MANIFEST__;
const CACHE = `eternia-${VERSION}`;
self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(['./', ...PRECACHE])).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k.startsWith('eternia-') && k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET' || new URL(e.request.url).origin !== location.origin) return;
  e.respondWith(caches.match(e.request, { ignoreSearch: e.request.mode === 'navigate', ignoreVary: true }).then((hit) => hit || fetch(e.request).catch(() => caches.match('./', { ignoreVary: true }))));
});
