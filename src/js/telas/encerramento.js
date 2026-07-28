/**
 * encerramento.js
 *
 * Encerramento: fecha formalmente o caso. Placeholder nesta etapa —
 * recompensas (XP, progressão de fase, conquistas) ficam para quando esses
 * sistemas existirem. As duas saídas são sempre para a frente (Mapa de
 * Missões ou Tela Inicial), nunca de volta para dentro da missão concluída.
 */

import { irPara } from "../navegacao.js";
import { criarIcone } from "../componentes/icone.js";

export function renderEncerramento(container) {
  container.innerHTML = `
    <section class="tela tela-encerramento">
      <div class="encerramento-cartao">
        <span class="icone icone-sucesso">${criarIcone("check")}</span>
        <h1>Missão concluída</h1>
        <p>Resumo da missão (em construção).</p>
      </div>
      <div class="resultado-acoes">
        <button type="button" class="botao botao-primario" data-acao="mapa-missoes">Próximo caso</button>
        <button type="button" class="botao botao-fantasma" data-acao="tela-inicial">Tela inicial</button>
      </div>
    </section>
  `;

  container.querySelector('[data-acao="mapa-missoes"]').addEventListener("click", () => {
    irPara("mapaMissoes");
  });
  container.querySelector('[data-acao="tela-inicial"]').addEventListener("click", () => {
    irPara("telaInicial");
  });
}
