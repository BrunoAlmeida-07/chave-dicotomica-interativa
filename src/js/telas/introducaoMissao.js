/**
 * introducaoMissao.js
 *
 * Introdução da Missão: contextualiza o caso antes da investigação começar.
 *
 * Não conhece o conceito de "grupo" diretamente — pede a missão para
 * nucleo/missoes.js, que hoje sintetiza uma missão a partir de um grupo
 * zoológico (porque missoes.json ainda está vazio) e futuramente vai ler de
 * missoes.json de verdade, sem que esta tela precise mudar.
 */

import { irPara, voltar } from "../navegacao.js";
import { obterMissao } from "../nucleo/missoes.js";

export async function renderIntroducaoMissao(container, dados = {}) {
  container.innerHTML = `
    <section class="tela tela-introducao-missao">
      <h1>Introdução da Missão</h1>
      <p>Conteúdo narrativo do caso (em construção).</p>
      <button type="button" data-acao="voltar">Voltar</button>
      <button type="button" data-acao="investigar">Investigar</button>
    </section>
  `;

  container.querySelector('[data-acao="voltar"]').addEventListener("click", voltar);

  const missao = await obterMissao(dados);
  const perguntaInicialId = missao ? missao.perguntaInicialId : null;

  container.querySelector('[data-acao="investigar"]').addEventListener("click", () => {
    irPara("investigacao", { ...dados, perguntaInicialId });
  });
}
