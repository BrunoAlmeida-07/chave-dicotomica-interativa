/**
 * comoJogar.js
 *
 * Tutorial "Como Jogar": carrossel horizontal de 4 páginas (uma imagem
 * anotada por página), navegado por arraste/deslize (Pointer Events cobrem
 * touch, mouse e caneta com o mesmo código — funciona igual em celular e
 * desktop). Substitui o antigo fluxo jogável da Missão de Treinamento.
 *
 * Duas formas de chegar aqui, mesmo comportamento em ambas:
 *   - Automaticamente, na primeira vez que o jogador abre "Missões" na Tela
 *     Inicial (telaInicial.js checa `lerTutorialVisto()` antes de decidir
 *     para onde ir).
 *   - Manualmente, a qualquer momento, pelo botão "Como Jogar" da Tela
 *     Inicial — replay, não depende da flag, sempre reabre da primeira
 *     página.
 *
 * Ao chegar na última página, o botão "Começar investigação" marca o
 * tutorial como visto (`salvarTutorialVisto`, IndexedDB) e leva ao Mapa de
 * Missões. Não há ramificação por "como cheguei aqui".
 *
 * As 4 imagens em si nunca são alteradas (mesmos arquivos de
 * tutorial/*.png). O que muda é só a moldura: cada uma traz, na própria
 * composição, uma faixa verde decorativa no topo — CROP_FRACAO_TOPO recorta
 * essa faixa por cima de um <canvas> (nunca escreve no arquivo original),
 * desenhando só a região abaixo dela. O valor cobre a faixa mais alta
 * medida entre as 4 imagens (~4,1%) com uma margem de segurança.
 */

import { irPara } from "../navegacao.js";
import { criarIcone } from "../componentes/icone.js";
import { resolverCaminhoImagem } from "../utils/assets.js";
import { salvarTutorialVisto } from "../../database/scripts/indexeddb.js";

const CROP_FRACAO_TOPO = 0.05;

const PAGINAS = [
  { src: "tutorial/passo-1-mapa-missoes.png", alt: "Mapa de Missões: cada cartão representa uma missão disponível." },
  { src: "tutorial/passo-2-selecao-especime.png", alt: "Seleção de Espécime: escolha uma fotografia para iniciar o caso." },
  { src: "tutorial/passo-3-investigacao.png", alt: "Investigação: observe as imagens e responda Sim ou Não a cada pergunta." },
  { src: "tutorial/passo-4-resultado.png", alt: "Resultado: veja a espécie identificada, curiosidades e encerre a missão." },
];

/** Distância mínima de arraste (px) para trocar de página; abaixo disso, a página volta pra posição. */
const LIMIAR_ARRASTE_PX = 60;

/**
 * % de translateX correspondente a UMA página. A trilha é `100 * N`% de
 * largura (N páginas lado a lado, cada uma `100 / N`% da trilha — ver CSS),
 * então mover translateX em `100 / N`% desloca exatamente uma página.
 */
const PERCENTUAL_POR_PAGINA = 100 / PAGINAS.length;

export function renderComoJogar(container) {
  let paginaAtual = 0;
  let dicaSwipeEscondida = false;

  container.innerHTML = `
    <section class="tela tela-como-jogar">
      <header class="tela-cabecalho">
        <button type="button" class="botao botao-fantasma" data-acao="voltar">
          <span class="icone">${criarIcone("voltar")}</span> Voltar
        </button>
        <span class="como-jogar__dica-swipe" data-dica-swipe>Deslize →</span>
      </header>
      <div class="como-jogar__carrossel" data-carrossel>
        <div class="como-jogar__trilha" data-trilha>
          ${PAGINAS.map(
            (pagina, indice) => `
              <div class="como-jogar__pagina">
                <div class="como-jogar__imagem-wrapper" data-wrapper="${indice}"></div>
              </div>
            `
          ).join("")}
        </div>
      </div>
      <div class="como-jogar__indicador" data-indicador></div>
      <div class="como-jogar__acoes" data-acoes hidden>
        <button type="button" class="botao botao-primario" data-acao="comecar">Começar investigação</button>
      </div>
    </section>
  `;

  container.querySelector('[data-acao="voltar"]').addEventListener("click", () => {
    irPara("telaInicial");
  });

  container.querySelector('[data-acao="comecar"]').addEventListener("click", () => {
    salvarTutorialVisto().catch((erro) => {
      console.warn("Não foi possível salvar que o tutorial foi visto:", erro);
    });
    irPara("mapaMissoes");
  });

  const dicaSwipe = container.querySelector("[data-dica-swipe]");
  const carrossel = container.querySelector("[data-carrossel]");
  const trilha = container.querySelector("[data-trilha]");
  const acoes = container.querySelector("[data-acoes]");
  const indicador = container.querySelector("[data-indicador]");

  indicador.innerHTML = PAGINAS.map((_, indice) => `<span class="como-jogar__ponto" data-ponto="${indice}"></span>`).join(
    ""
  );
  const pontos = Array.from(indicador.querySelectorAll("[data-ponto]"));

  // Recorta a faixa verde de cada imagem num <canvas> (arquivo original
  // intacto) e só então preenche a página correspondente — em paralelo,
  // pra não atrasar a exibição de nenhuma página em função das outras.
  PAGINAS.forEach((pagina, indice) => {
    criarCanvasRecortado(resolverCaminhoImagem(pagina.src), pagina.alt).then((canvas) => {
      container.querySelector(`[data-wrapper="${indice}"]`).appendChild(canvas);
    });
  });

  irParaPagina(0, { instantaneo: true });
  configurarArraste();

  function irParaPagina(indice, { instantaneo = false } = {}) {
    paginaAtual = Math.max(0, Math.min(PAGINAS.length - 1, indice));

    trilha.classList.toggle("como-jogar__trilha--sem-transicao", instantaneo);
    trilha.style.transform = `translateX(${-paginaAtual * PERCENTUAL_POR_PAGINA}%)`;

    pontos.forEach((ponto, i) => ponto.classList.toggle("como-jogar__ponto--ativo", i === paginaAtual));

    acoes.hidden = paginaAtual !== PAGINAS.length - 1;

    // A dica só existe na página 1, e uma vez escondida (jogador já saiu
    // dela) não volta mais nesta sessão do tutorial, mesmo se ele arrastar
    // de volta pra página 1.
    if (paginaAtual !== 0 && !dicaSwipeEscondida) {
      dicaSwipeEscondida = true;
    }
    dicaSwipe.hidden = dicaSwipeEscondida || paginaAtual !== 0;
  }

  function configurarArraste() {
    let arrastando = false;
    let xInicial = 0;
    let deltaAtual = 0;

    carrossel.addEventListener("pointerdown", (evento) => {
      arrastando = true;
      xInicial = evento.clientX;
      deltaAtual = 0;
      trilha.classList.add("como-jogar__trilha--sem-transicao");
      carrossel.setPointerCapture(evento.pointerId);
    });

    carrossel.addEventListener("pointermove", (evento) => {
      if (!arrastando) {
        return;
      }
      deltaAtual = evento.clientX - xInicial;

      // Resistência nas pontas (primeira/última página): arrasta, mas
      // menos, em vez de simplesmente travar.
      const naPrimeira = paginaAtual === 0 && deltaAtual > 0;
      const naUltima = paginaAtual === PAGINAS.length - 1 && deltaAtual < 0;
      const deltaComResistencia = naPrimeira || naUltima ? deltaAtual / 3 : deltaAtual;

      // deltaComResistencia é em px, relativo à largura visível de UMA
      // página (o próprio carrossel) — converter para "% da trilha"
      // (referência do translateX) precisa da mesma escala de
      // PERCENTUAL_POR_PAGINA, não de 100%.
      const larguraPagina = carrossel.clientWidth || 1;
      const percentualBase = -paginaAtual * PERCENTUAL_POR_PAGINA;
      const percentualArraste = (deltaComResistencia / larguraPagina) * PERCENTUAL_POR_PAGINA;
      trilha.style.transform = `translateX(${percentualBase + percentualArraste}%)`;
    });

    const finalizarArraste = (evento) => {
      if (!arrastando) {
        return;
      }
      arrastando = false;
      trilha.classList.remove("como-jogar__trilha--sem-transicao");

      if (deltaAtual <= -LIMIAR_ARRASTE_PX) {
        irParaPagina(paginaAtual + 1);
      } else if (deltaAtual >= LIMIAR_ARRASTE_PX) {
        irParaPagina(paginaAtual - 1);
      } else {
        irParaPagina(paginaAtual);
      }

      if (evento?.pointerId !== undefined && carrossel.hasPointerCapture?.(evento.pointerId)) {
        carrossel.releasePointerCapture(evento.pointerId);
      }
    };

    carrossel.addEventListener("pointerup", finalizarArraste);
    carrossel.addEventListener("pointercancel", finalizarArraste);
  }
}

/**
 * Carrega uma imagem e devolve um <canvas> com a região de
 * `CROP_FRACAO_TOPO` mais alta descartada — a foto original nunca é
 * escrita, só lida e redesenhada.
 *
 * @param {string} src
 * @param {string} alt
 * @returns {Promise<HTMLCanvasElement>}
 */
function criarCanvasRecortado(src, alt) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const corteTopoPx = Math.round(img.naturalHeight * CROP_FRACAO_TOPO);
      const alturaRecortada = img.naturalHeight - corteTopoPx;

      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = alturaRecortada;
      canvas.className = "como-jogar__imagem";
      canvas.setAttribute("role", "img");
      canvas.setAttribute("aria-label", alt);

      const contexto = canvas.getContext("2d");
      contexto.drawImage(
        img,
        0,
        corteTopoPx,
        img.naturalWidth,
        alturaRecortada,
        0,
        0,
        img.naturalWidth,
        alturaRecortada
      );

      resolve(canvas);
    };
    img.onerror = reject;
    img.src = src;
  });
}
