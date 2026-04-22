const CACHE_NAME = "chave-bio-v3";

const urlsToCache = [
  "/",
  "/index.html",
  "/css/estilo.css",
  "/aranhas/pergunta1.html",
  "/escorpioes/pergunta1.html",
  "/serpentes/pergunta1.html"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});