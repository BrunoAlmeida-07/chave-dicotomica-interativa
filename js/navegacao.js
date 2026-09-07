/**
 * navegacao.js
 *
 * Motor de navegação da nova interface do Missão Fauna Brasil.
 *
 * Mantém qual tela está ativa e como trocar entre elas. Não sabe nada sobre
 * o conteúdo de cada tela — só chama a função de renderização registrada
 * para o nome da tela pedida, dentro do elemento container definido em
 * `iniciar`.
 *
 * Diretriz de navegação do projeto: telas de menu (Tela Inicial, Mapa de
 * Missões, Laboratório) têm destino de "voltar" fixo e previsível — usam
 * `irPara(nomeFixo)` explicitamente, não `voltar()`, porque podem ser
 * alcançadas de vários lugares e devem sempre retornar ao mesmo lugar. Só as
 * telas do fluxo de investigação (Introdução da Missão, Investigação) usam
 * `voltar()`, porque ali o retorno depender do caminho percorrido pelo
 * jogador é o comportamento desejado.
 *
 * Rolagem da página: por padrão o documento é `overflow: hidden` (ver
 * estilo.css, seletor `html`) — a maioria das telas foi projetada para
 * caber exatamente na viewport, e "hidden" torna a rolagem impossível de
 * verdade nelas, em vez de só improvável (nenhuma dependência de pixel
 * perfeito ou de comportamento específico de navegador/dispositivo).
 * `desenharTela` é o único lugar que sabe qual tela está ativa, então é
 * aqui que a classe `html.permite-rolagem` é ligada/desligada — só para as
 * telas em TELAS_ROLAVEIS, que são naturalmente mais altas que a viewport
 * por conteúdo real (não por bug): Mapa de Missões (grade de casos),
 * Resultado (Ficha Científica com vários cards, painel fixo por
 * `position: sticky`) e Laboratório (perfil + catálogo + conquistas).
 *
 * Botão/gesto Voltar do sistema (Android, inclusive como PWA instalado): o
 * app nunca tocava no histórico do navegador, então não havia nenhuma
 * entrada anterior "dentro" dele para onde ir — o gesto simplesmente
 * fechava o app. `irPara` agora empilha uma entrada real do navegador
 * (`history.pushState`) a cada avanço, só para existir "para onde voltar";
 * `voltar` (chamada tanto pelos botões visíveis quanto, indiretamente, pelo
 * listener de `popstate` no fim deste arquivo) continua sendo a única
 * lógica que decide qual tela mostrar — o conteúdo do `pushState` nunca é
 * lido de volta, quem manda é sempre `historico`, abaixo.
 */

/** @type {Map<string, (container: HTMLElement, dados?: object) => void>} */
const telasRegistradas = new Map();

/**
 * Nomes de tela cujo conteúdo é naturalmente mais alto que a viewport —
 * únicas que devem permitir rolagem da página. Qualquer tela fora desta
 * lista foi projetada para caber exatamente: se algum dia isso deixar de
 * ser verdade (conteúdo novo, texto maior), o sintoma correto a corrigir é
 * o layout daquela tela, não adicionar seu nome aqui.
 */
const TELAS_ROLAVEIS = new Set(["mapaMissoes", "resultado", "laboratorio"]);

/** Pilha de telas visitadas, usada por `voltar()`. */
const historico = [];

/**
 * Quantas chamadas a `history.back()` feitas por `voltar()` ainda não
 * geraram seu `popstate` correspondente. Cada uma é contada aqui antes de
 * disparar, e descontada quando o evento chega — o que sobra depois disso é
 * sempre um `popstate` genuíno (gesto/botão do sistema), nunca um eco do
 * nosso próprio `voltar()`. Um contador (não um booleano) é necessário
 * porque um `voltar()` pode ser chamado de novo antes do `popstate` do
 * anterior chegar (ex.: cliques rápidos), e cada um teria, senão, sua
 * própria chamada de `history.back()` esperando ser descontada.
 */
let backsProgramados = 0;

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
    // Uma entrada de histórico do navegador por avanço — ver nota no topo
    // do arquivo. O estado em si (null) não importa: ninguém volta a lê-lo.
    history.pushState(null, "");
  }

  desenharTela(nome, dados);
}

/**
 * Volta para a tela anterior do histórico, se houver alguma. Usada tanto
 * pelos botões "Voltar" visíveis quanto, indiretamente, pelo listener de
 * `popstate` abaixo — a única lógica que decide para onde voltar.
 */
export function voltar() {
  const trocou = aplicarTelaAnterior();

  // Mantém o histórico do navegador em sincronia com `historico`, uma
  // entrada por tela: sem isto, um clique no botão "Voltar" visível
  // deixaria uma entrada "sobrando" lá, e o próximo back do sistema
  // andaria uma tela a mais ou a menos do que deveria.
  if (trocou) {
    backsProgramados++;
    history.back();
  }
}

/** Efetivamente troca para a tela anterior do histórico interno, se houver. */
function aplicarTelaAnterior() {
  const anterior = historico.pop();
  if (!anterior) {
    return false;
  }
  desenharTela(anterior.nome, anterior.dados);
  return true;
}

function desenharTela(nome, dados) {
  const render = telasRegistradas.get(nome);
  elementoContainer.innerHTML = "";
  render(elementoContainer, dados);
  telaAtual = { nome, dados };
  document.documentElement.classList.toggle("permite-rolagem", TELAS_ROLAVEIS.has(nome));
}

// Botão/gesto Voltar do sistema: como `irPara` agora empilha uma entrada de
// histórico do navegador a cada avanço, esse gesto dispara `popstate` (em
// vez de simplesmente fechar o app, que era o comportamento sem nenhuma
// entrada própria para onde ir). Reaproveita `aplicarTelaAnterior` — a
// mesma lógica usada por `voltar()`, não uma segunda forma de navegar.
window.addEventListener("popstate", () => {
  if (backsProgramados > 0) {
    backsProgramados--;
    return;
  }
  aplicarTelaAnterior();
});
