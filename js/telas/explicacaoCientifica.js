/**
 * explicacaoCientifica.js
 *
 * Explicação Científica: aprofunda o conteúdo da espécie do caso,
 * independente de acerto ou erro. Placeholder nesta etapa.
 */

import { irPara, voltar } from "../navegacao.js";
import { criarIcone } from "../componentes/icone.js";

export function renderExplicacaoCientifica(container, dados) {
  container.innerHTML = `
    <section class="tela tela-explicacao-cientifica">
      <header class="tela-cabecalho">
        <button type="button" class="botao botao-fantasma" data-acao="voltar">
          <span class="icone">${criarIcone("voltar")}</span> Voltar
        </button>
      </header>
      <div class="cartao conteudo-cartao">
        <span class="etiqueta">Explicação Científica</span>
        <h1>Entenda mais sobre esta espécie</h1>
        <p>Conteúdo científico do caso (em construção).</p>
      </div>
      <div class="resultado-acoes">
        <button type="button" class="botao botao-primario" data-acao="encerrar">Encerrar missão</button>
      </div>
    </section>
  `;

  container.querySelector('[data-acao="voltar"]').addEventListener("click", voltar);
  container.querySelector('[data-acao="encerrar"]').addEventListener("click", () => {
    irPara("encerramento", dados);
  });
}
