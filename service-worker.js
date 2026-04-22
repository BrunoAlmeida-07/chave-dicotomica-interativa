const CACHE_NAME = "chave-bio-v4";

const urlsToCache = [
  "./",
  "./index.html",
  "./manifest.json",
  "./css/estilo.css",
  "./icone-192.png",
  "./icone-512.png",

  // ARANHAS
  "./aranhas/pergunta1.html",
  "./aranhas/pergunta2.html",
  "./aranhas/pergunta3.html",
  "./aranhas/pergunta4.html",
  "./aranhas/pergunta5.html",
  "./aranhas/aranha_armadeira.html",
  "./aranhas/aranha_marrom.html",
  "./aranhas/aranha_nao_peconhenta.html",
  "./aranhas/viuva_negra.html",
  "./aranhas/caranguejeira_sem_importancia_medica.html",

  // IMAGENS ARANHAS
  "./aranhas/imagens/imagem1.png",
  "./aranhas/imagens/aranha armadeira.jpg",
  "./aranhas/imagens/aranha comum.png",
  "./aranhas/imagens/aranha marom.webp",
  "./aranhas/imagens/caranguejeira.png",
  "./aranhas/imagens/viuva negra.png",

  // ESCORPIÕES
  "./escorpioes/pergunta1.html",
  "./escorpioes/pergunta2.html",
  "./escorpioes/pergunta3.html",
  "./escorpioes/pergunta4.html",
  "./escorpioes/pergunta5.html",
  "./escorpioes/escorpiao_amarelo.html",
  "./escorpioes/escorpiao_marrom.html",
  "./escorpioes/escorpiao_nordeste.html",
  "./escorpioes/escorpiao_preto.html",
  "./escorpioes/nao_escorpiao.html",
  "./escorpioes/outro_escorpiao.html",

  // IMAGENS ESCORPIÕES
  "./escorpioes/imagens/image.png",
  "./escorpioes/imagens/escorpiao_amarelo.jpg",
  "./escorpioes/imagens/escorpiao_amarelo_do_nordeste.webp",
  "./escorpioes/imagens/escorpiao_marrom.png",
  "./escorpioes/imagens/escorpiao_preto.jpeg",
  "./escorpioes/imagens/pseudo.png",
  "./escorpioes/imagens/vermelho.jpg",

  // SERPENTES
  "./serpentes/pergunta1.html",
  "./serpentes/pergunta2.html",
  "./serpentes/pergunta3.html",
  "./serpentes/pergunta4.html",
  "./serpentes/pergunta5.html",
  "./serpentes/pergunta6.html",
  "./serpentes/pergunta7.html",
  "./serpentes/pergunta8.html",
  "./serpentes/cascavel.html",
  "./serpentes/jararaca.html",
  "./serpentes/coral_falsa.html",
  "./serpentes/coral_verdadeira.html",
  "./serpentes/serpente_sem_importancia_medica.html",

  // IMAGENS SERPENTES
  "./serpentes/imagens/image.png",
  "./serpentes/imagens/Cascavel.webp",
  "./serpentes/imagens/coral_falsa.webp",
  "./serpentes/imagens/coral_verdadeira.webp",
  "./serpentes/imagens/jararaca.jpg",
  "./serpentes/imagens/jiboia.webp"
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
