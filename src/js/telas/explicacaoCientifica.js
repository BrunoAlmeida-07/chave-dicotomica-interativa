/**
 * explicacaoCientifica.js
 *
 * Explicação Científica: aprofunda o conteúdo da espécie do caso,
 * independente de acerto ou erro. Placeholder nesta etapa.
 */

import { irPara, voltar } from "../navegacao.js";

export function renderExplicacaoCientifica(container, dados) {
  container.innerHTML = `
    <section class="tela tela-explicacao-cientifica">
      <h1>Explicação Científica</h1>
      <p>Conteúdo científico da espécie do caso (em construção).</p>
      <button type="button" data-acao="voltar">Voltar</button>
      <button type="button" data-acao="encerrar">Encerrar missão</button>
    </section>
  `;

  container.querySelector('[data-acao="voltar"]').addEventListener("click", voltar);
  container.querySelector('[data-acao="encerrar"]').addEventListener("click", () => {
    irPara("encerramento", dados);
  });
}
