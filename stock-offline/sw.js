// Service worker: guarda a app no tablet para abrir sem rede.
// Se mudares algum ficheiro da app, aumenta o número da versão abaixo.
const VERSAO = 'stock-v1';
const FICHEIROS = ['./', './index.html', './manifest.json', './icon.svg', './icon-192.png', './icon-512.png'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(VERSAO).then((c) => c.addAll(FICHEIROS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((ks) => Promise.all(ks.filter((k) => k !== VERSAO).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  e.respondWith((async () => {
    const cache = await caches.open(VERSAO);
    const guardado = await cache.match(e.request, { ignoreSearch: true });
    const rede = fetch(e.request)
      .then((r) => { if (r && r.ok) cache.put(e.request, r.clone()); return r; })
      .catch(() => null);
    if (guardado) { e.waitUntil(rede); return guardado; }
    return (await rede) || (await cache.match('./index.html')) || Response.error();
  })());
});
