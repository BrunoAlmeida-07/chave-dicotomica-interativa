const CACHE_NAME = "missao-fauna-v5"; // MUDE sempre que atualizar

// Pré-cache só do essencial para o app abrir (HTML, CSS, JS, manifest,
// ícones, dados de conteúdo). As imagens de espécies/perguntas (~40 MB) NÃO
// entram aqui de propósito — ficam de fora da instalação e são cacheadas sob
// demanda pelo próprio handler de "fetch" abaixo, na primeira vez que cada
// uma é realmente usada (a mesma lógica de "rede primeiro, guarda em cache"
// já se aplica a qualquer requisição, precache ou não).
const urlsToCache = [
  "./",
  "./index.html",
  "./manifest.json",
  "./css/estilo.css",
  "./css/imagens/fundo.webp",
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

  // As imagens de aranhas/, escorpioes/ e serpentes/ (espécies, perguntas,
  // ficha, laboratório — ~40 MB ao todo) foram removidas de propósito deste
  // pré-cache. Continuam funcionando offline normalmente: o handler de
  // "fetch" abaixo já cacheia qualquer requisição na primeira vez que ela
  // acontece, então cada imagem entra em cache sozinha, sob demanda, na
  // primeira vez que a Investigação, a Ficha Científica ou o Laboratório
  // realmente a exibem — não mais todas de uma vez na instalação.
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