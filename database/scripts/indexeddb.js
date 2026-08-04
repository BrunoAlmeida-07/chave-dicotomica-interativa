/**
 * indexeddb.js
 *
 * Camada de persistência local da Base de Conhecimento Biológica.
 *
 * Responsável por abrir/versionar o banco IndexedDB e expor operações
 * básicas de leitura, escrita e limpeza das seis coleções de conteúdo
 * definidas em `database/schema.md` (grupos, perguntas, espécies, missões,
 * conquistas e configurações) e das stores de progresso do jogador
 * (`progressoMissoes`, `especiesDescobertas`).
 *
 * As stores de progresso não são conteúdo — não vêm de nenhum arquivo JSON,
 * não são tocadas por `importer.js`, e são gravadas aos poucos (um registro
 * de cada vez), diferente das stores de conteúdo, que são sempre
 * substituídas por inteiro. Ver database/schema.md, seção 9.
 *
 * Este módulo não sabe de onde os dados de conteúdo vêm — não importa
 * `importer.js` nem `database.js`. A ligação entre eles é responsabilidade
 * de `database.js`. Quem grava/lê progresso (`js/nucleo/missoes.js`)
 * também importa este módulo diretamente, sem passar por `database.js`,
 * já que progresso não participa do fluxo de cache/import da Base de
 * Conhecimento.
 */

const DATABASE_NAME = "MissaoFaunaBrasil";
// v5: adiciona a store "especiesDescobertas" (progresso — qual espécie
// individual cada investigação concluída realmente identificou; antes
// disso, o Catálogo aproximava "descoberta" por grupo inteiro, ver
// database/schema.md seção 9). Bump não destrutivo — quem já tinha as
// stores anteriores ganha a nova no próximo carregamento, sem perder nada.
const DATABASE_VERSION = 5;

/** Nomes das object stores: seis de conteúdo + duas de progresso do jogador. */
const STORES = {
  grupos: "grupos",
  perguntas: "perguntas",
  especies: "especies",
  missoes: "missoes",
  conquistas: "conquistas",
  configuracoes: "configuracoes",
  progressoMissoes: "progressoMissoes",
  especiesDescobertas: "especiesDescobertas",
};

/** Chave fixa usada para gravar o objeto único de configurações. */
const CHAVE_CONFIGURACOES = "atual";

/**
 * Chave fixa usada para gravar o mapa de hashes de conteúdo (um hash por
 * coleção), na mesma store de configurações — não é conteúdo em si (não vem
 * de nenhum JSON), é bookkeeping da sincronização (ver `database.js`,
 * `sincronizarComConteudoAtual`). Reaproveita a store `configuracoes`
 * (que já não tem keyPath próprio, aceita qualquer chave externa) em vez de
 * criar uma store nova só para isto.
 */
const CHAVE_HASHES_CONTEUDO = "hashesConteudo";

/**
 * Promise memoizada com a conexão aberta do banco. Evita abrir uma nova
 * conexão a cada operação de leitura/escrita.
 * @type {Promise<IDBDatabase> | null}
 */
let promessaConexao = null;

/**
 * Abre (criando ou atualizando, se necessário) o banco IndexedDB da Base de
 * Conhecimento, reaproveitando a conexão em chamadas seguintes.
 *
 * @returns {Promise<IDBDatabase>}
 * @throws {Error} Se o IndexedDB não estiver disponível no navegador, ou se a abertura falhar/for bloqueada.
 */
function abrirBanco() {
  if (typeof indexedDB === "undefined") {
    return Promise.reject(new Error("IndexedDB não está disponível neste navegador."));
  }

  if (!promessaConexao) {
    promessaConexao = new Promise((resolve, reject) => {
      const requisicao = indexedDB.open(DATABASE_NAME, DATABASE_VERSION);

      requisicao.onupgradeneeded = (evento) => {
        const db = evento.target.result;

        if (!db.objectStoreNames.contains(STORES.grupos)) {
          db.createObjectStore(STORES.grupos, { keyPath: "id" });
        }
        if (!db.objectStoreNames.contains(STORES.perguntas)) {
          db.createObjectStore(STORES.perguntas, { keyPath: "id" });
        }
        if (!db.objectStoreNames.contains(STORES.especies)) {
          db.createObjectStore(STORES.especies, { keyPath: "id" });
        }
        if (!db.objectStoreNames.contains(STORES.missoes)) {
          db.createObjectStore(STORES.missoes, { keyPath: "id" });
        }
        if (!db.objectStoreNames.contains(STORES.conquistas)) {
          db.createObjectStore(STORES.conquistas, { keyPath: "id" });
        }
        if (!db.objectStoreNames.contains(STORES.configuracoes)) {
          // Configuração é um objeto único, não uma coleção — sem keyPath
          // próprio; a chave é fornecida por fora (ver CHAVE_CONFIGURACOES).
          db.createObjectStore(STORES.configuracoes);
        }
        if (!db.objectStoreNames.contains(STORES.progressoMissoes)) {
          db.createObjectStore(STORES.progressoMissoes, { keyPath: "missaoId" });
        }
        if (!db.objectStoreNames.contains(STORES.especiesDescobertas)) {
          // keyPath por especieId: gravar a mesma espécie de novo (missão
          // revisitada) apenas sobrescreve o mesmo registro — nunca duplica.
          db.createObjectStore(STORES.especiesDescobertas, { keyPath: "especieId" });
        }
      };

      requisicao.onsuccess = () => resolve(requisicao.result);
      requisicao.onerror = () => reject(requisicao.error);
      requisicao.onblocked = () =>
        reject(new Error("Abertura do banco bloqueada: feche outras abas usando uma versão anterior do banco."));
    });
  }

  return promessaConexao;
}

/**
 * Substitui todo o conteúdo de uma store por uma nova lista de itens
 * (cada item precisa ter a propriedade usada como `keyPath` da store).
 *
 * @param {string} nomeStore
 * @param {object[]} itens
 * @returns {Promise<void>}
 */
async function salvarNaStore(nomeStore, itens) {
  const db = await abrirBanco();

  return new Promise((resolve, reject) => {
    const transacao = db.transaction(nomeStore, "readwrite");
    const store = transacao.objectStore(nomeStore);

    store.clear();
    for (const item of itens) {
      store.put(item);
    }

    transacao.oncomplete = () => resolve();
    transacao.onerror = () => reject(transacao.error);
  });
}

/**
 * Lê todos os itens armazenados em uma store.
 *
 * @param {string} nomeStore
 * @returns {Promise<object[]>}
 */
async function lerDaStore(nomeStore) {
  const db = await abrirBanco();

  return new Promise((resolve, reject) => {
    const transacao = db.transaction(nomeStore, "readonly");
    const requisicao = transacao.objectStore(nomeStore).getAll();

    requisicao.onsuccess = () => resolve(requisicao.result);
    requisicao.onerror = () => reject(requisicao.error);
  });
}

/** Salva a lista de grupos, substituindo o conteúdo atual da store. */
export function salvarGrupos(grupos) {
  return salvarNaStore(STORES.grupos, grupos);
}

/** Lê todos os grupos salvos no IndexedDB. */
export function lerGrupos() {
  return lerDaStore(STORES.grupos);
}

/** Salva a lista de perguntas, substituindo o conteúdo atual da store. */
export function salvarPerguntas(perguntas) {
  return salvarNaStore(STORES.perguntas, perguntas);
}

/** Lê todas as perguntas salvas no IndexedDB. */
export function lerPerguntas() {
  return lerDaStore(STORES.perguntas);
}

/** Salva a lista de espécies, substituindo o conteúdo atual da store. */
export function salvarEspecies(especies) {
  return salvarNaStore(STORES.especies, especies);
}

/** Lê todas as espécies salvas no IndexedDB. */
export function lerEspecies() {
  return lerDaStore(STORES.especies);
}

/** Salva a lista de missões, substituindo o conteúdo atual da store. */
export function salvarMissoes(missoes) {
  return salvarNaStore(STORES.missoes, missoes);
}

/** Lê todas as missões salvas no IndexedDB. */
export function lerMissoes() {
  return lerDaStore(STORES.missoes);
}

/** Salva a lista de conquistas, substituindo o conteúdo atual da store. */
export function salvarConquistas(conquistas) {
  return salvarNaStore(STORES.conquistas, conquistas);
}

/** Lê todas as conquistas salvas no IndexedDB. */
export function lerConquistas() {
  return lerDaStore(STORES.conquistas);
}

/**
 * Salva o objeto único de configurações, substituindo o valor atual.
 * @param {object} configuracoes
 * @returns {Promise<void>}
 */
export async function salvarConfiguracoes(configuracoes) {
  const db = await abrirBanco();

  return new Promise((resolve, reject) => {
    const transacao = db.transaction(STORES.configuracoes, "readwrite");
    transacao.objectStore(STORES.configuracoes).put(configuracoes, CHAVE_CONFIGURACOES);

    transacao.oncomplete = () => resolve();
    transacao.onerror = () => reject(transacao.error);
  });
}

/**
 * Lê o objeto único de configurações salvo no IndexedDB.
 * @returns {Promise<object|null>} As configurações salvas, ou `null` se nunca foram salvas.
 */
export async function lerConfiguracoes() {
  const db = await abrirBanco();

  return new Promise((resolve, reject) => {
    const transacao = db.transaction(STORES.configuracoes, "readonly");
    const requisicao = transacao.objectStore(STORES.configuracoes).get(CHAVE_CONFIGURACOES);

    requisicao.onsuccess = () => resolve(requisicao.result ?? null);
    requisicao.onerror = () => reject(requisicao.error);
  });
}

/**
 * Salva o mapa de hashes de conteúdo (um hash SHA-256 por coleção),
 * calculado a partir do JSON recém-importado — usado para decidir, na
 * próxima visita, quais coleções realmente mudaram desde então.
 *
 * @param {{grupos: string, perguntas: string, especies: string, missoes: string, conquistas: string, configuracoes: string}} hashes
 * @returns {Promise<void>}
 */
export async function salvarHashesConteudo(hashes) {
  const db = await abrirBanco();

  return new Promise((resolve, reject) => {
    const transacao = db.transaction(STORES.configuracoes, "readwrite");
    transacao.objectStore(STORES.configuracoes).put(hashes, CHAVE_HASHES_CONTEUDO);

    transacao.oncomplete = () => resolve();
    transacao.onerror = () => reject(transacao.error);
  });
}

/**
 * Lê o mapa de hashes de conteúdo salvo na visita anterior.
 * @returns {Promise<object|null>} O mapa salvo, ou `null` se nunca foi salvo.
 */
export async function lerHashesConteudo() {
  const db = await abrirBanco();

  return new Promise((resolve, reject) => {
    const transacao = db.transaction(STORES.configuracoes, "readonly");
    const requisicao = transacao.objectStore(STORES.configuracoes).get(CHAVE_HASHES_CONTEUDO);

    requisicao.onsuccess = () => resolve(requisicao.result ?? null);
    requisicao.onerror = () => reject(requisicao.error);
  });
}

/**
 * Salva (ou atualiza) um único registro de progresso de missão, sem apagar
 * os demais já salvos — diferente de `salvarNaStore`, que substitui a store
 * inteira. Progresso é gravado aos poucos, uma conclusão de cada vez.
 *
 * @param {{missaoId: string, concluidaEm: string}} registro
 * @returns {Promise<void>}
 */
export async function salvarProgressoMissao(registro) {
  const db = await abrirBanco();

  return new Promise((resolve, reject) => {
    const transacao = db.transaction(STORES.progressoMissoes, "readwrite");
    transacao.objectStore(STORES.progressoMissoes).put(registro);

    transacao.oncomplete = () => resolve();
    transacao.onerror = () => reject(transacao.error);
  });
}

/** Lê todos os registros de progresso de missões salvos no IndexedDB. */
export function lerProgressoMissoes() {
  return lerDaStore(STORES.progressoMissoes);
}

/**
 * Salva (ou atualiza) um único registro de espécie descoberta, sem apagar
 * os demais já salvos. Mesmo padrão de `salvarProgressoMissao`: gravado aos
 * poucos, uma descoberta de cada vez.
 *
 * @param {{especieId: string, descobertaEm: string}} registro
 * @returns {Promise<void>}
 */
export async function salvarEspecieDescoberta(registro) {
  const db = await abrirBanco();

  return new Promise((resolve, reject) => {
    const transacao = db.transaction(STORES.especiesDescobertas, "readwrite");
    transacao.objectStore(STORES.especiesDescobertas).put(registro);

    transacao.oncomplete = () => resolve();
    transacao.onerror = () => reject(transacao.error);
  });
}

/** Lê todos os registros de espécies descobertas salvos no IndexedDB. */
export function lerEspeciesDescobertas() {
  return lerDaStore(STORES.especiesDescobertas);
}

/**
 * Limpa as oito stores (grupos, perguntas, espécies, missões, conquistas,
 * configurações, progresso de missões e espécies descobertas) em uma única
 * transação.
 * @returns {Promise<void>}
 */
export async function limparTudo() {
  const db = await abrirBanco();
  const nomes = Object.values(STORES);

  return new Promise((resolve, reject) => {
    const transacao = db.transaction(nomes, "readwrite");

    for (const nome of nomes) {
      transacao.objectStore(nome).clear();
    }

    transacao.oncomplete = () => resolve();
    transacao.onerror = () => reject(transacao.error);
  });
}
