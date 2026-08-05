/**
 * comoJogar.js
 *
 * Tutorial "Como Jogar": guia visual estático de 4 páginas (uma imagem
 * anotada por página), substituindo o antigo fluxo jogável da Missão de
 * Treinamento. Cada imagem já traz suas próprias anotações explicativas —
 * este componente só as exibe, uma de cada vez, com navegação Anterior/
 * Próximo e um indicador de página. Não altera nem lê nada do conteúdo das
 * imagens; são exibidas exatamente como fornecidas.
 *
 * Duas formas de chegar aqui, mesmo comportamento em ambas:
 *   - Automaticamente, na primeira vez que o jogador abre "Missões" na Tela
 *     Inicial (telaInicial.js checa `lerTutorialVisto()` antes de decidir
 *     para onde ir).
 *   - Manualmente, a qualquer momento, pelo botão "Como Jogar" da Tela
 *     Inicial — replay, não depende da flag, sempre reabre da primeira
 *     página.
 *
 * A última página marca o tutorial como visto (`salvarTutorialVisto`,
 * IndexedDB — mesma store `configuracoes` já usada para outras flags de
 * configuração, ver database/scripts/indexeddb.js) e leva ao Mapa de
 * Missões. Não há ramificação por "como cheguei aqui".
 */

import { irPara } from "../navegacao.js";
import { criarIcone } from "../componentes/icone.js";
import { resolverCaminhoImagem } from "../utils/assets.js";
import { salvarTutorialVisto } from "../../database/scripts/indexeddb.js";

const PAGINAS = [
  { src: "tutorial/passo-1-mapa-missoes.png", alt: "Mapa de Missões: cada cartão representa uma missão disponível." },
  { src: "tutorial/passo-2-selecao-especime.png", alt: "Seleção de Espécime: escolha uma fotografia para iniciar o caso." },
  { src: "tutorial/passo-3-investigacao.png", alt: "Investigação: observe as imagens e responda Sim ou Não a cada pergunta." },
  { src: "tutorial/passo-4-resultado.png", alt: "Resultado: veja a espécie identificada, curiosidades e encerre a missão." },
];

export function renderComoJogar(container) {
  let paginaAtual = 0;

  container.innerHTML = `
    <section class="tela tela-como-jogar">
      <header class="tela-cabecalho">
        <button type="button" class="botao botao-fantasma" data-acao="voltar">
          <span class="icone">${criarIcone("voltar")}</span> Voltar
        </button>
        <h1>Como Jogar</h1>
      </header>
      <div class="como-jogar__imagem-wrapper">
        <img class="como-jogar__imagem" data-imagem alt="">
      </div>
      <div class="como-jogar__indicador" data-indicador></div>
      <div class="como-jogar__navegacao">
        <button type="button" class="botao botao-fantasma" data-acao="anterior">
          <span class="icone">${criarIcone("retroceder")}</span> Anterior
        </button>
        <button type="button" class="botao botao-primario" data-acao="proximo">Próximo</button>
      </div>
    </section>
  `;

  container.querySelector('[data-acao="voltar"]').addEventListener("click", () => {
    irPara("telaInicial");
  });

  const imagem = container.querySelector("[data-imagem]");
  const indicador = container.querySelector("[data-indicador]");
  const botaoAnterior = container.querySelector('[data-acao="anterior"]');
  const botaoProximo = container.querySelector('[data-acao="proximo"]');

  indicador.innerHTML = PAGINAS.map((_, indice) => `<span class="como-jogar__ponto" data-ponto="${indice}"></span>`).join(
    ""
  );
  const pontos = Array.from(indicador.querySelectorAll("[data-ponto]"));

  botaoAnterior.addEventListener("click", () => {
    if (paginaAtual === 0) {
      return;
    }
    paginaAtual--;
    desenharPagina();
  });

  botaoProximo.addEventListener("click", () => {
    if (paginaAtual < PAGINAS.length - 1) {
      paginaAtual++;
      desenharPagina();
      return;
    }

    salvarTutorialVisto().catch((erro) => {
      console.warn("Não foi possível salvar que o tutorial foi visto:", erro);
    });
    irPara("mapaMissoes");
  });

  desenharPagina();

  function desenharPagina() {
    const pagina = PAGINAS[paginaAtual];
    imagem.src = resolverCaminhoImagem(pagina.src);
    imagem.alt = pagina.alt;

    pontos.forEach((ponto, indice) => {
      ponto.classList.toggle("como-jogar__ponto--ativo", indice === paginaAtual);
    });

    // Sem "Anterior" na primeira página: não há para onde voltar dentro do
    // tutorial (sair de vez é o botão "Voltar" do cabeçalho).
    botaoAnterior.hidden = paginaAtual === 0;
    botaoProximo.textContent = paginaAtual === PAGINAS.length - 1 ? "Começar investigação" : "Próximo";
  }
}
