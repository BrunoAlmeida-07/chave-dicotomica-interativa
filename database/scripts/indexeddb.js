/**
 * indexeddb.js
 *
 * Camada de persistência local da Base de Conhecimento Biológica.
 *
 * Responsável por abrir/versionar o banco IndexedDB e expor operações
 * básicas de leitura, escrita e limpeza das cinco coleções definidas em
 * `database/schema.md`: grupos, perguntas, espécies, missões e configurações.
 *
 * Este módulo não sabe de onde os dados vêm — não importa `importer.js` nem
 * `database.js`. A ligação entre eles é responsabilidade de uma etapa futura.
 */

const DATABASE_NAME = "MissaoFaunaBrasil";
// v2: adiciona a store "missoes" (missões passaram a ter conteúdo real).
// Bump não destrutivo — quem já tinha as 4 stores da v1 ganha a 5ª no
// próximo carregamento, sem perder nada.
const DATABASE_VERSION = 2;

/** Nomes das object stores, um por coleção do schema. */
const STORES = {
  grupos: "grupos",
  perguntas: "perguntas",
  especies: "especies",
  missoes: "missoes",
  configuracoes: "configuracoes",
};

/** Chave fixa usada para gravar o objeto único de configurações. */
const CHAVE_CONFIGURACOES = "atual";

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
        if (!db.objectStoreNames.contains(STORES.configuracoes)) {
          // Configuração é um objeto único, não uma coleção — sem keyPath
          // próprio; a chave é fornecida por fora (ver CHAVE_CONFIGURACOES).
          db.createObjectStore(STORES.configuracoes);
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
 * Limpa as cinco stores (grupos, perguntas, espécies, missões e
 * configurações) em uma única transação.
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
