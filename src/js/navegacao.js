/**
 * navegacao.js
 *
 * Motor de navegação da nova interface do Missão Fauna Brasil.
 *
 * Mantém qual tela está ativa e como trocar entre elas. Não sabe nada sobre
 * o conteúdo de cada tela — só chama a função de renderização registrada
 * para o nome da tela pedida, dentro do elemento container definido em
 * `iniciar`.
 */

/** @type {Map<string, (container: HTMLElement, dados?: object) => void>} */
const telasRegistradas = new Map();

/** Pilha de telas visitadas, usada por `voltar()`. */
const historico = [];

/** @type {HTMLElement | null} */
let elementoContainer = null;

/** @type {{ nome: string, dados: object|undefined } | null} */
let telaAtual = null;

/**
 * Registra a função responsável por desenhar uma tela.
 *
 * @param {string} nome - Nome único da tela (ex.: "telaInicial").
 * @param {(container: HTMLElement, dados?: object) => void} render
 */
export function registrarTela(nome, render) {
  telasRegistradas.set(nome, render);
}

/**
 * Inicializa o motor de navegação e mostra a primeira tela.
 *
 * @param {HTMLElement} container - Elemento onde as telas são desenhadas.
 * @param {string} nomeTelaInicial
 * @param {object} [dados]
 */
export function iniciar(container, nomeTelaInicial, dados) {
  elementoContainer = container;
  desenharTela(nomeTelaInicial, dados);
}

/**
 * Troca para outra tela, empilhando a tela atual no histórico de navegação.
 *
 * @param {string} nome
 * @param {object} [dados]
 */
export function irPara(nome, dados) {
  if (!telasRegistradas.has(nome)) {
    throw new Error(`Tela "${nome}" não foi registrada.`);
  }

  if (telaAtual) {
    historico.push(telaAtual);
  }

  desenharTela(nome, dados);
}

/**
 * Volta para a tela anterior do histórico, se houver alguma.
 */
export function voltar() {
  const anterior = historico.pop();
  if (anterior) {
    desenharTela(anterior.nome, anterior.dados);
  }
}

function desenharTela(nome, dados) {
  const render = telasRegistradas.get(nome);
  elementoContainer.innerHTML = "";
  render(elementoContainer, dados);
  telaAtual = { nome, dados };
}
