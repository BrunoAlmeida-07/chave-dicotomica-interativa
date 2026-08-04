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
 *   1. Busca os JSON originais (importer.js) e o que já está salvo no
 *      IndexedDB (indexeddb.js) em paralelo.
 *   2. Se não houver nada salvo (primeira visita, ou dados corrompidos):
 *      grava tudo do zero e sai.
 *   3. Caso contrário, compara — coleção por coleção (grupos, perguntas,
 *      espécies, missões, conquistas, configurações) — um hash SHA-256 do
 *      conteúdo recém-importado com o hash salvo na visita anterior.
 *      Só as coleções cujo hash mudou são regravadas; as demais continuam
 *      com os dados já salvos, sem escrita desnecessária. Ver
 *      `sincronizarComConteudoAtual`.
 *   4. Se a busca dos JSON falhar (ex.: sem rede) mas já houver dados
 *      salvos, usa só o que está salvo — nunca quebra o funcionamento
 *      offline por causa de uma tentativa de sincronização.
 *   5. Chamadas seguintes reaproveitam o mesmo resultado em memória
 *      (`promessaBase`), sem repetir os passos 1-4.
 *
 * Esta sincronização automática substitui o que antes era uma lacuna
 * documentada ("comparar configuracoes.versaoBaseDados"): hash de conteúdo
 * não depende de ninguém lembrar de incrementar um número a cada mudança em
 * database/json/*.json — qualquer mudança real de conteúdo já é detectada
 * sozinha. `versaoBaseDados` continua existindo em configuracoes.json como
 * campo informativo, mas não é mais o que decide a sincronização.
 *
 * Progresso do jogador (`progressoMissoes`, `especiesDescobertas`) nunca é
 * tocado por este fluxo — vive em stores completamente separadas das seis
 * coleções de conteúdo tratadas aqui.
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
  lerHashesConteudo,
  salvarHashesConteudo,
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
 * Executa o fluxo de inicialização da Base de Conhecimento: busca os JSON
 * originais e o que já está salvo no IndexedDB em paralelo, e decide o que
 * fazer a partir da combinação dos dois (ver comentário no topo do arquivo).
 *
 * @returns {Promise<{grupos: object[], perguntas: object[], especies: object[], missoes: object[], configuracoes: object}>}
 * @throws {Error} Se não houver dados íntegros no IndexedDB e a importação dos JSON também falhar.
 */
async function inicializarBase() {
  const [dadosImportados, dadosSalvos] = await Promise.all([
    tentarImportarBaseDeConhecimento(),
    tentarCarregarDoIndexedDB(),
  ]);

  if (!dadosSalvos) {
    if (!dadosImportados) {
      throw new Error(
        "Não foi possível carregar a Base de Conhecimento: nada salvo localmente e a importação dos JSON também falhou."
      );
    }
    await salvarNoIndexedDB(dadosImportados);
    await salvarHashesConteudo(await calcularHashes(dadosImportados));
    return dadosImportados;
  }

  if (!dadosImportados) {
    // Sem rede (ou falha ao buscar os JSON): usa só o que já está salvo,
    // sem tentar sincronizar. Nunca deixa uma tentativa de atualização
    // quebrar o funcionamento offline.
    return dadosSalvos;
  }

  return sincronizarComConteudoAtual(dadosSalvos, dadosImportados);
}

/**
 * Tenta importar os JSON originais; qualquer falha (ex.: sem rede) é tratada
 * como "não foi possível verificar atualizações agora", não como erro fatal
 * — quem chama decide o que fazer com `null` (ver `inicializarBase`).
 *
 * @returns {Promise<{grupos: object[], perguntas: object[], especies: object[], missoes: object[], conquistas: object[], configuracoes: object} | null>}
 */
async function tentarImportarBaseDeConhecimento() {
  try {
    return await importarBaseDeConhecimento();
  } catch (erro) {
    console.warn("Não foi possível verificar atualizações da Base de Conhecimento (offline?):", erro);
    return null;
  }
}

/**
 * Compara o conteúdo recém-importado dos JSON com o que está salvo no
 * IndexedDB, coleção por coleção, via hash SHA-256 — regrava só as que
 * realmente mudaram desde a última visita. Progresso do jogador nunca é
 * tocado aqui (ver comentário no topo do arquivo).
 *
 * @param {{grupos: object[], perguntas: object[], especies: object[], missoes: object[], conquistas: object[], configuracoes: object}} dadosSalvos
 * @param {{grupos: object[], perguntas: object[], especies: object[], missoes: object[], conquistas: object[], configuracoes: object}} dadosImportados
 * @returns {Promise<{grupos: object[], perguntas: object[], especies: object[], missoes: object[], conquistas: object[], configuracoes: object}>}
 */
async function sincronizarComConteudoAtual(dadosSalvos, dadosImportados) {
  const hashesAtuais = await calcularHashes(dadosImportados);

  let hashesSalvos;
  try {
    hashesSalvos = (await lerHashesConteudo()) ?? {};
  } catch (erro) {
    console.warn("Não foi possível ler os hashes de conteúdo salvos, sincronizando tudo por segurança:", erro);
    hashesSalvos = {};
  }

  const resultado = { ...dadosSalvos };
  const gravacoesPendentes = [];

  if (hashesAtuais.grupos !== hashesSalvos.grupos) {
    resultado.grupos = dadosImportados.grupos;
    gravacoesPendentes.push(salvarGrupos(dadosImportados.grupos));
  }
  if (hashesAtuais.perguntas !== hashesSalvos.perguntas) {
    resultado.perguntas = dadosImportados.perguntas;
    gravacoesPendentes.push(salvarPerguntas(dadosImportados.perguntas));
  }
  if (hashesAtuais.especies !== hashesSalvos.especies) {
    resultado.especies = dadosImportados.especies;
    gravacoesPendentes.push(salvarEspecies(dadosImportados.especies));
  }
  if (hashesAtuais.missoes !== hashesSalvos.missoes) {
    resultado.missoes = dadosImportados.missoes;
    gravacoesPendentes.push(salvarMissoes(dadosImportados.missoes));
  }
  if (hashesAtuais.conquistas !== hashesSalvos.conquistas) {
    resultado.conquistas = dadosImportados.conquistas;
    gravacoesPendentes.push(salvarConquistas(dadosImportados.conquistas));
  }
  if (hashesAtuais.configuracoes !== hashesSalvos.configuracoes) {
    resultado.configuracoes = dadosImportados.configuracoes;
    gravacoesPendentes.push(salvarConfiguracoes(dadosImportados.configuracoes));
  }

  if (gravacoesPendentes.length > 0) {
    try {
      await Promise.all(gravacoesPendentes);
      await salvarHashesConteudo(hashesAtuais);
    } catch (erro) {
      console.warn("Não foi possível sincronizar a Base de Conhecimento com o conteúdo atual:", erro);
    }
  }

  return resultado;
}

/**
 * Calcula um hash SHA-256 (Web Crypto API nativa, sem dependência externa)
 * do conteúdo de cada uma das seis coleções — usado para detectar mudanças
 * em database/json/*.json entre uma visita e outra, sem depender de um
 * número de versão mantido manualmente.
 *
 * @param {{grupos: object[], perguntas: object[], especies: object[], missoes: object[], conquistas: object[], configuracoes: object}} dados
 * @returns {Promise<{grupos: string, perguntas: string, especies: string, missoes: string, conquistas: string, configuracoes: string}>}
 */
async function calcularHashes({ grupos, perguntas, especies, missoes, conquistas, configuracoes }) {
  const [hashGrupos, hashPerguntas, hashEspecies, hashMissoes, hashConquistas, hashConfiguracoes] = await Promise.all([
    calcularHash(grupos),
    calcularHash(perguntas),
    calcularHash(especies),
    calcularHash(missoes),
    calcularHash(conquistas),
    calcularHash(configuracoes),
  ]);

  return {
    grupos: hashGrupos,
    perguntas: hashPerguntas,
    especies: hashEspecies,
    missoes: hashMissoes,
    conquistas: hashConquistas,
    configuracoes: hashConfiguracoes,
  };
}

/**
 * Calcula o hash SHA-256 (em hexadecimal) de um valor serializável.
 * @param {unknown} valor
 * @returns {Promise<string>}
 */
async function calcularHash(valor) {
  const bytes = new TextEncoder().encode(JSON.stringify(valor));
  const buffer = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(buffer))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
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
