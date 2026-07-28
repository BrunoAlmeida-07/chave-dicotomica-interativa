/**
 * database.js
 *
 * Fachada de acesso à Base de Conhecimento Biológica.
 *
 * Nesta etapa, os dados vêm apenas de `importer.js` e ficam em cache em
 * memória (válido enquanto a página estiver aberta). Quando `indexeddb.js`
 * existir, a expectativa é que apenas a implementação interna deste módulo
 * mude (passando a ler do IndexedDB); as funções exportadas aqui devem
 * continuar com a mesma assinatura para quem já as consome.
 *
 * Não implementa persistência nem lógica de navegação da chave dicotômica
 * (isso pertence ao módulo Chave Dicotômica).
 */

import { importarBaseDeConhecimento } from "./importer.js";

/**
 * Promise memoizada com o resultado de `importarBaseDeConhecimento()`.
 * Garante que os arquivos JSON só sejam buscados uma única vez, mesmo que
 * várias funções de consulta sejam chamadas em paralelo.
 * @type {Promise<{grupos: object[], perguntas: object[], especies: object[], configuracoes: object}> | null}
 */
let promessaBase = null;

/**
 * Garante que a Base de Conhecimento foi carregada e devolve seus dados.
 * Dispara o carregamento na primeira chamada; reaproveita o resultado nas seguintes.
 *
 * @returns {Promise<{grupos: object[], perguntas: object[], especies: object[], configuracoes: object}>}
 */
function obterBase() {
  if (!promessaBase) {
    promessaBase = importarBaseDeConhecimento();
  }
  return promessaBase;
}

/**
 * Lista todos os grupos zoológicos, ordenados por `ordemExibicao`.
 * @returns {Promise<object[]>}
 */
export async function listarGrupos() {
  const { grupos } = await obterBase();
  return [...grupos].sort((a, b) => a.ordemExibicao - b.ordemExibicao);
}

/**
 * Obtém um grupo pelo seu id.
 * @param {string} id
 * @returns {Promise<object|null>} O grupo encontrado, ou `null` se não existir.
 */
export async function obterGrupoPorId(id) {
  const { grupos } = await obterBase();
  return grupos.find((grupo) => grupo.id === id) ?? null;
}

/**
 * Lista as espécies (ou resultados) que pertencem a um grupo.
 * @param {string} grupoId
 * @returns {Promise<object[]>}
 */
export async function listarEspeciesPorGrupo(grupoId) {
  const { especies } = await obterBase();
  return especies.filter((especie) => especie.grupoId === grupoId);
}

/**
 * Obtém uma espécie (ou resultado) pelo seu id.
 * @param {string} id
 * @returns {Promise<object|null>} A espécie encontrada, ou `null` se não existir.
 */
export async function obterEspeciePorId(id) {
  const { especies } = await obterBase();
  return especies.find((especie) => especie.id === id) ?? null;
}

/**
 * Lista as perguntas que pertencem a um grupo.
 * @param {string} grupoId
 * @returns {Promise<object[]>}
 */
export async function listarPerguntasPorGrupo(grupoId) {
  const { perguntas } = await obterBase();
  return perguntas.filter((pergunta) => pergunta.grupoId === grupoId);
}

/**
 * Obtém uma pergunta pelo seu id.
 * @param {string} id
 * @returns {Promise<object|null>} A pergunta encontrada, ou `null` se não existir.
 */
export async function obterPerguntaPorId(id) {
  const { perguntas } = await obterBase();
  return perguntas.find((pergunta) => pergunta.id === id) ?? null;
}

/**
 * Obtém o objeto único de configurações da Base de Conhecimento.
 * @returns {Promise<object>}
 */
export async function obterConfiguracoes() {
  const { configuracoes } = await obterBase();
  return configuracoes;
}
