/**
 * investigacao.js
 *
 * Investigação: onde a chave dicotômica acontece dentro da missão. Nesta
 * etapa é um placeholder — a navegação real pela árvore de perguntas
 * (via database.js: obterPerguntaPorId) fica para quando o conteúdo de
 * missão existir de fato.
 */

import { irPara, voltar } from "../navegacao.js";

export function renderInvestigacao(container, dados) {
  container.innerHTML = `
    <section class="tela tela-investigacao">
      <h1>Investigação</h1>
      <p>Perguntas da chave dicotômica (em construção).</p>
      <button type="button" data-acao="voltar">Voltar</button>
      <button type="button" data-acao="concluir">Concluir investigação</button>
    </section>
  `;

  container.querySelector('[data-acao="voltar"]').addEventListener("click", voltar);
  container.querySelector('[data-acao="concluir"]').addEventListener("click", () => {
    irPara("resultado", dados);
  });
}
