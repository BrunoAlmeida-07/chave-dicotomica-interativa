/**
 * laboratorio.js
 *
 * Laboratório do Pesquisador: coleção de espécies descobertas pelo jogador.
 * Placeholder nesta etapa — funcionalidade completa (busca, filtros,
 * progresso de descoberta) fica para uma etapa futura.
 */

import { voltar } from "../navegacao.js";

export function renderLaboratorio(container) {
  container.innerHTML = `
    <section class="tela tela-laboratorio">
      <h1>Laboratório do Pesquisador</h1>
      <p>Coleção de espécies descobertas (em construção).</p>
      <button type="button" data-acao="voltar">Voltar</button>
    </section>
  `;

  container.querySelector('[data-acao="voltar"]').addEventListener("click", voltar);
}
