const CACHE_NAME = "missao-fauna-v3"; // MUDE sempre que atualizar

const urlsToCache = [
  "./",
  "./index.html",
  "./manifest.json",
  "./css/estilo.css",
  "./css/imagens/fundo.png",
  "./icone-192.png",
  "./icone-512.png",

  // JAVASCRIPT (Missão Fauna Brasil)
  "./js/app.js",
  "./js/navegacao.js",
  "./js/componentes/cartaoConquista.js",
  "./js/componentes/cartaoEspecie.js",
  "./js/componentes/cartaoMissao.js",
  "./js/componentes/cartaoPergunta.js",
  "./js/componentes/fichaCientifica.js",
  "./js/componentes/icone.js",
  "./js/nucleo/missoes.js",
  "./js/nucleo/motorDeInvestigacao.js",
  "./js/nucleo/progressoCientifico.js",
  "./js/telas/boasVindas.js",
  "./js/telas/encerramento.js",
  "./js/telas/explicacaoCientifica.js",
  "./js/telas/introducaoMissao.js",
  "./js/telas/investigacao.js",
  "./js/telas/laboratorio.js",
  "./js/telas/mapaMissoes.js",
  "./js/telas/resultado.js",
  "./js/telas/telaInicial.js",
  "./js/utils/assets.js",

  // BASE DE CONHECIMENTO (JSON)
  "./database/scripts/database.js",
  "./database/scripts/importer.js",
  "./database/scripts/indexeddb.js",
  "./database/json/configuracoes.json",
  "./database/json/conquistas.json",
  "./database/json/especies.json",
  "./database/json/grupos.json",
  "./database/json/missoes.json",
  "./database/json/perguntas.json",

  // IMAGENS ARANHAS
  "./aranhas/imagens/imagem1.jpg",
  "./aranhas/imagens/aranha armadeira.jpg",
  "./aranhas/imagens/aranha comum.png",
  "./aranhas/imagens/aranha marom.jpg",
  "./aranhas/imagens/caranguejeira.jpg",
  "./aranhas/imagens/viuva negra.jpg",
  "./aranhas/imagens/img-pergunta1.png",
  "./aranhas/imagens/img-pergunta2.png",
  "./aranhas/imagens/img-pergunta3.png",
  "./aranhas/imagens/img-pergunta4.png",
  "./aranhas/imagens/img-pergunta5.png",
  "./aranhas/imagens/img-pergunta6.png",
  "./aranhas/imagens/img-pergunta7.png",
  "./aranhas/imagens/img-pergunta8.png",

  // IMAGENS ESCORPIÕES
  "./escorpioes/imagens/escorpiao_amarelo.jpg",
  "./escorpioes/imagens/escorpiao_amarelo_do_nordeste.webp",
  "./escorpioes/imagens/escorpiao_marrom.jpg",
  "./escorpioes/imagens/escorpiao_preto.jpeg",
  "./escorpioes/imagens/pseudo.png",
  "./escorpioes/imagens/vermelho.jpg",
  "./escorpioes/imagens/img-pergunta1.png",
  "./escorpioes/imagens/img-pergunta2.png",
  "./escorpioes/imagens/img-pergunta3.png",
  "./escorpioes/imagens/img-pergunta4.png",
  "./escorpioes/imagens/img-pergunta5.png",

  // IMAGENS SERPENTES
  "./serpentes/imagens/Cascavel.jpg",
  "./serpentes/imagens/coral_falsa.jpeg",
  "./serpentes/imagens/coral_verdadeira.jpg",
  "./serpentes/imagens/jararaca.jpg",
  "./serpentes/imagens/jiboia.jpeg",
  "./serpentes/imagens/img-pergunta1.png",
  "./serpentes/imagens/img-pergunta2.png",
  "./serpentes/imagens/img-pergunta3.png",
  "./serpentes/imagens/img-pergunta4.png",
  "./serpentes/imagens/img-pergunta5.png",
  "./serpentes/imagens/img-pergunta6.png",
  "./serpentes/imagens/img-pergunta7.png",
  "./serpentes/imagens/img-pergunta8.png"
];


// 🔽 INSTALAÇÃO (cache inicial)
self.addEventListener("install", event => {
  self.skipWaiting(); // ativa imediatamente

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});


// 🔽 ATIVAÇÃO (limpa cache antigo)
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );

  self.clients.claim(); // assume controle das páginas
});


// 🔽 FETCH (estratégia: online primeiro)
self.addEventListener("fetch", event => {
  event.respondWith(
    fetch(event.request)
      .then(response => {
        return caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, response.clone());
          return response;
        });
      })
      .catch(() => {
        return caches.match(event.request);
      })
  );
});
// 🔔 escuta mensagens da página
self.addEventListener("message", event => {
  if (event.data === "SKIP_WAITING") {
    self.skipWaiting();
  }
});