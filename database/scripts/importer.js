/**
 * importer.js
 *
 * Camada de importação da Base de Conhecimento Biológica.
 *
 * Responsável por carregar os arquivos JSON de `database/json/` (a fonte
 * oficial dos dados — ver `database/schema.md`) e disponibilizá-los como um
 * único objeto em memória.
 *
 * Esta etapa NÃO grava nada no IndexedDB. Persistência local offline será
 * responsabilidade de `indexeddb.js`, orquestrada futuramente por
 * `database.js`.
 */

// Pasta dos arquivos JSON, resolvida a partir da localização deste módulo
// (e não da página que o importa). Assim o import funciona da mesma forma
// seja chamado a partir da raiz do projeto ou de uma página dentro de
// aranhas/, escorpioes/ ou serpentes/.
const PASTA_JSON = new URL("../json/", import.meta.url);

const ARQUIVOS = {
  grupos: "grupos.json",
  perguntas: "perguntas.json",
  especies: "especies.json",
  missoes: "missoes.json",
  conquistas: "conquistas.json",
  configuracoes: "configuracoes.json",
};

/**
 * Busca e faz o parse de um único arquivo JSON da Base de Conhecimento.
 *
 * @param {string} nome - Nome lógico do arquivo, usado apenas nas mensagens de erro.
 * @param {string} arquivo - Nome do arquivo dentro de `database/json/`.
 * @returns {Promise<unknown>} Conteúdo do arquivo já convertido para objeto/array.
 * @throws {Error} Se a requisição falhar, a resposta não for OK, ou o conteúdo não for um JSON válido.
 */
async function carregarArquivoJSON(nome, arquivo) {
  const url = new URL(arquivo, PASTA_JSON);
  let resposta;

  try {
    resposta = await fetch(url);
  } catch (erro) {
    throw new Error(`Falha ao buscar "${nome}" (${url}): ${erro.message}`);
  }

  if (!resposta.ok) {
    throw new Error(`Falha ao carregar "${nome}" (${url}): HTTP ${resposta.status}`);
  }

  try {
    return await resposta.json();
  } catch (erro) {
    throw new Error(`Falha ao interpretar "${nome}" (${url}) como JSON: ${erro.message}`);
  }
}

/**
 * Valida que os seis arquivos da Base de Conhecimento foram carregados
 * corretamente, conforme os tipos definidos em `database/schema.md`:
 * grupos, perguntas, espécies, missões e conquistas devem ser listas não
 * vazias; configurações deve ser um único objeto.
 *
 * @param {{grupos: unknown, perguntas: unknown, especies: unknown, missoes: unknown, conquistas: unknown, configuracoes: unknown}} dados
 * @throws {Error} Se algum dos arquivos não tiver o formato esperado.
 */
function validarBaseDeConhecimento({ grupos, perguntas, especies, missoes, conquistas, configuracoes }) {
  const listas = { grupos, perguntas, especies, missoes, conquistas };

  for (const [nome, valor] of Object.entries(listas)) {
    if (!Array.isArray(valor)) {
      throw new Error(`"${nome}" deveria ser uma lista, mas veio: ${typeof valor}`);
    }
    if (valor.length === 0) {
      throw new Error(`"${nome}" foi carregado, mas está vazio`);
    }
  }

  if (typeof configuracoes !== "object" || configuracoes === null || Array.isArray(configuracoes)) {
    throw new Error(`"configuracoes" deveria ser um único objeto, mas veio: ${typeof configuracoes}`);
  }
}

/**
 * Importa a Base de Conhecimento Biológica completa (grupos, perguntas,
 * espécies, missões, conquistas e configurações) a partir dos arquivos JSON
 * oficiais, validando que todos foram carregados corretamente.
 *
 * @returns {Promise<{
 *   grupos: object[],
 *   perguntas: object[],
 *   especies: object[],
 *   missoes: object[],
 *   conquistas: object[],
 *   configuracoes: object
 * }>} Um único objeto contendo toda a Base de Conhecimento.
 * @throws {Error} Se qualquer arquivo não puder ser carregado ou não passar na validação.
 */
export async function importarBaseDeConhecimento() {
  const [grupos, perguntas, especies, missoes, conquistas, configuracoes] = await Promise.all([
    carregarArquivoJSON("grupos", ARQUIVOS.grupos),
    carregarArquivoJSON("perguntas", ARQUIVOS.perguntas),
    carregarArquivoJSON("especies", ARQUIVOS.especies),
    carregarArquivoJSON("missoes", ARQUIVOS.missoes),
    carregarArquivoJSON("conquistas", ARQUIVOS.conquistas),
    carregarArquivoJSON("configuracoes", ARQUIVOS.configuracoes),
  ]);

  const baseDeConhecimento = { grupos, perguntas, especies, missoes, conquistas, configuracoes };

  validarBaseDeConhecimento(baseDeConhecimento);

  return baseDeConhecimento;
}
