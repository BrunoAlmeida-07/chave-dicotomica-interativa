/**
 * encerramento.js
 *
 * Encerramento: fecha formalmente o caso. Placeholder nesta etapa —
 * recompensas (XP, progressão de fase, conquistas) ficam para quando esses
 * sistemas existirem. As duas saídas são sempre para a frente (Mapa de
 * Missões ou Tela Inicial), nunca de volta para dentro da missão concluída.
 */

import { irPara } from "../navegacao.js";

export function renderEncerramento(container) {
  container.innerHTML = `
    <section class="tela tela-encerramento">
      <h1>Missão concluída</h1>
      <p>Resumo da missão (em construção).</p>
      <button type="button" data-acao="mapa-missoes">Próximo caso</button>
      <button type="button" data-acao="tela-inicial">Tela inicial</button>
    </section>
  `;

  container.querySelector('[data-acao="mapa-missoes"]').addEventListener("click", () => {
    irPara("mapaMissoes");
  });
  container.querySelector('[data-acao="tela-inicial"]').addEventListener("click", () => {
    irPara("telaInicial");
  });
}
