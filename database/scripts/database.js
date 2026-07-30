/**
 * database.js
 *
 * Fachada de acesso à Base de Conhecimento Biológica.
 *
 * Decide automaticamente de onde carregar os dados (IndexedDB ou os JSON
 * originais, via importer.js) e expõe funções de consulta somente leitura
 * sobre o resultado. Quem consome as funções exportadas por este módulo não
 * precisa saber se os dados vieram do IndexedDB ou de um fetch recém-feito.
 *
 * Fluxo de inicialização (ver `inicializarBase`), executado uma única vez:
 *   1. Na primeira chamada a qualquer função de consulta, tenta ler a Base
 *      de Conhecimento já salva no IndexedDB (indexeddb.js).
 *   2. Se as quatro coleções existirem e estiverem íntegras, usa esses dados.
 *   3. Caso contrário, importa os JSON originais (importer.js).
 *   4. Salva o resultado importado no IndexedDB, para a próxima visita.
 *   5. Retorna a Base de Conhecimento (do IndexedDB ou recém-importada).
 *   6. Chamadas seguintes reaproveitam o mesmo resultado em memória
 *      (`promessaBase`), sem repetir os passos 1-5.
 *
 * Fora do escopo atual: comparar `configuracoes.versaoBaseDados` para decidir
 * se os dados salvos no IndexedDB estão desatualizados frente a uma nova
 * versão do JSON. O fluxo acima já está estruturado para receber essa
 * checagem futuramente dentro de `tentarCarregarDoIndexedDB`, sem exigir
 * mudança na API pública deste módulo.
 *
 * Não implementa lógica de navegação da chave dicotômica (isso pertence ao
 * módulo Chave Dicotômica). importer.js e indexeddb.js permanecem
 * independentes entre si — só database.js conhece os dois.
 */

import { importarBaseDeConhecimento } from "./importer.js";
import {
  lerGrupos,
  lerPerguntas,
  lerEspecies,
  lerMissoes,
  lerConquistas,
  lerConfiguracoes,
  salvarGrupos,
  salvarPerguntas,
  salvarEspecies,
  salvarMissoes,
  salvarConquistas,
  salvarConfiguracoes,
} from "./indexeddb.js";

/**
 * Promise memoizada com a Base de Conhecimento já resolvida (do IndexedDB ou
 * recém-importada). Garante que o fluxo de inicialização completo rode uma
 * única vez, mesmo que várias funções de consulta sejam chamadas em paralelo.
 * @type {Promise<{grupos: object[], perguntas: object[], especies: object[], missoes: object[], configuracoes: object}> | null}
 */
let promessaBase = null;

/**
 * Garante que a Base de Conhecimento foi carregada e devolve seus dados.
 * Dispara o fluxo de inicialização na primeira chamada; reaproveita o
 * resultado nas seguintes (passo 6 do fluxo descrito no topo do arquivo).
 *
 * @returns {Promise<{grupos: object[], perguntas: object[], especies: object[], missoes: object[], configuracoes: object}>}
 */
function obterBase() {
  if (!promessaBase) {
    promessaBase = inicializarBase();
  }
  return promessaBase;
}

/**
 * Executa o fluxo de inicialização da Base de Conhecimento: tenta reaproveitar
 * o que já está salvo no IndexedDB (passos 1-2) e, se não houver nada íntegro
 * salvo, importa os JSON originais e persiste o resultado para a próxima
 * visita (passos 3-5).
 *
 * @returns {Promise<{grupos: object[], perguntas: object[], especies: object[], missoes: object[], configuracoes: object}>}
 * @throws {Error} Se não houver dados íntegros no IndexedDB e a importação dos JSON também falhar.
 */
async function inicializarBase() {
  const dadosSalvos = await tentarCarregarDoIndexedDB();
  if (dadosSalvos) {
    return dadosSalvos;
  }

  const dadosImportados = await importarBaseDeConhecimento();
  await salvarNoIndexedDB(dadosImportados);
  return dadosImportados;
}

/**
 * Tenta ler a Base de Conhecimento já salva no IndexedDB. Qualquer falha de
 * leitura (ex.: IndexedDB indisponível no navegador) é tratada da mesma forma
 * que "ainda não existe", para não impedir o funcionamento da aplicação.
 *
 * @returns {Promise<{grupos: object[], perguntas: object[], especies: object[], missoes: object[], configuracoes: object} | null>}
 *   Os dados salvos, se existirem e estiverem íntegros; `null` caso contrário.
 */
async function tentarCarregarDoIndexedDB() {
  let dados;

  try {
    const [grupos, perguntas, especies, missoes, conquistas, configuracoes] = await Promise.all([
      lerGrupos(),
      lerPerguntas(),
      lerEspecies(),
      lerMissoes(),
      lerConquistas(),
      lerConfiguracoes(),
    ]);
    dados = { grupos, perguntas, especies, missoes, conquistas, configuracoes };
  } catch (erro) {
    console.warn("Não foi possível ler a Base de Conhecimento do IndexedDB:", erro);
    return null;
  }

  return baseEstaIntegra(dados) ? dados : null;
}

/**
 * Verifica se os dados lidos do IndexedDB formam uma Base de Conhecimento
 * íntegra: grupos, perguntas, espécies e missões precisam ser listas não
 * vazias, e configurações precisa ser um único objeto. Critério equivalente
 * ao que `importer.js` já usa para validar o JSON recém-importado — mantido
 * como uma verificação privada e independente aqui, para não acoplar
 * database.js aos detalhes internos de importer.js.
 *
 * @param {{grupos: unknown, perguntas: unknown, especies: unknown, missoes: unknown, configuracoes: unknown}} dados
 * @returns {boolean}
 */
function baseEstaIntegra({ grupos, perguntas, especies, missoes, conquistas, configuracoes }) {
  const listasValidas = [grupos, perguntas, especies, missoes, conquistas].every(
    (lista) => Array.isArray(lista) && lista.length > 0
  );
  const configuracoesValidas =
    typeof configuracoes === "object" && configuracoes !== null && !Array.isArray(configuracoes);

  return listasValidas && configuracoesValidas;
}

/**
 * Salva a Base de Conhecimento recém-importada no IndexedDB, para que a
 * próxima visita já a encontre pronta (passo 4 do fluxo). Uma falha aqui não
 * impede a aplicação de continuar funcionando com os dados recém-importados.
 *
 * @param {{grupos: object[], perguntas: object[], especies: object[], missoes: object[], configuracoes: object}} dados
 * @returns {Promise<void>}
 */
async function salvarNoIndexedDB({ grupos, perguntas, especies, missoes, conquistas, configuracoes }) {
  try {
    await Promise.all([
      salvarGrupos(grupos),
      salvarPerguntas(perguntas),
      salvarEspecies(especies),
      salvarMissoes(missoes),
      salvarConquistas(conquistas),
      salvarConfiguracoes(configuracoes),
    ]);
  } catch (erro) {
    console.warn("Não foi possível salvar a Base de Conhecimento no IndexedDB:", erro);
  }
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
 * Lista todas as espécies (ou resultados), na ordem em que aparecem na
 * Base de Conhecimento. Usada por telas que precisam da coleção completa
 * (ex.: posição de uma espécie no catálogo), não só de um grupo.
 * @returns {Promise<object[]>}
 */
export async function listarEspecies() {
  const { especies } = await obterBase();
  return especies;
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

/**
 * Lista todas as missões, ordenadas por `ordemProgressao`.
 * @returns {Promise<object[]>}
 */
export async function listarMissoes() {
  const { missoes } = await obterBase();
  return [...missoes].sort((a, b) => a.ordemProgressao - b.ordemProgressao);
}

/**
 * Obtém uma missão pelo seu id.
 * @param {string} id
 * @returns {Promise<object|null>} A missão encontrada, ou `null` se não existir.
 */
export async function obterMissaoPorId(id) {
  const { missoes } = await obterBase();
  return missoes.find((missao) => missao.id === id) ?? null;
}

/**
 * Lista todas as conquistas definidas na Base de Conhecimento.
 * @returns {Promise<object[]>}
 */
export async function listarConquistas() {
  const { conquistas } = await obterBase();
  return conquistas;
}
