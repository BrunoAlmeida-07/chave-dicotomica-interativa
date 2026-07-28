/**
 * resultado.js
 *
 * Resultado: informa a que identificação a investigação levou. Placeholder
 * nesta etapa — comparar com a resposta correta da missão depende de
 * missoes.json, que ainda não tem conteúdo.
 */

import { irPara, voltar } from "../navegacao.js";

export function renderResultado(container, dados) {
  container.innerHTML = `
    <section class="tela tela-resultado">
      <h1>Resultado</h1>
      <p>Resultado da identificação (em construção).</p>
      <button type="button" data-acao="voltar">Voltar</button>
      <button type="button" data-acao="avancar">Ver explicação científica</button>
    </section>
  `;

  container.querySelector('[data-acao="voltar"]').addEventListener("click", voltar);
  container.querySelector('[data-acao="avancar"]').addEventListener("click", () => {
    irPara("explicacaoCientifica", dados);
  });
}
