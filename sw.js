const VERSAO = "visita-v3";
const APP = ["./", "index.html", "manifest.webmanifest", "icon-192.png", "icon-512.png"];
self.addEventListener("install", e => {
  e.waitUntil(caches.open(VERSAO).then(c => c.addAll(APP)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSAO && k !== "visita-libs").map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin === location.origin) {
    // app: tenta a internet (pega atualização), sem sinal usa o que está guardado
    e.respondWith(fetch(req).then(r => { const c = r.clone(); caches.open(VERSAO).then(ca => ca.put(req, c)); return r; })
      .catch(() => caches.match(req).then(r => r || caches.match("index.html"))));
  } else {
    // fontes e leitor de endereço: guarda na primeira vez e usa sem internet depois
    e.respondWith(caches.open("visita-libs").then(ca => ca.match(req).then(hit => hit || fetch(req).then(r => { ca.put(req, r.clone()); return r; }))));
  }
});
