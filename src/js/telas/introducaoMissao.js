/**
 * introducaoMissao.js
 *
 * Introdução da Missão: contextualiza o caso antes da investigação começar.
 * Nesta etapa é um placeholder — o conteúdo narrativo real de cada missão
 * ainda não existe (missoes.json está vazio).
 */

import { irPara, voltar } from "../navegacao.js";

export function renderIntroducaoMissao(container, dados) {
  container.innerHTML = `
    <section class="tela tela-introducao-missao">
      <h1>Introdução da Missão</h1>
      <p>Conteúdo narrativo do caso (em construção).</p>
      <button type="button" data-acao="voltar">Voltar</button>
      <button type="button" data-acao="investigar">Investigar</button>
    </section>
  `;

  container.querySelector('[data-acao="voltar"]').addEventListener("click", voltar);
  container.querySelector('[data-acao="investigar"]').addEventListener("click", () => {
    irPara("investigacao", dados);
  });
}
