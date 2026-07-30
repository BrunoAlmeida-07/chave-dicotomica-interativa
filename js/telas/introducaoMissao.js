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
import { criarIcone } from "../componentes/icone.js";

export async function renderIntroducaoMissao(container, dados = {}) {
  container.innerHTML = `
    <section class="tela tela-introducao-missao">
      <header class="tela-cabecalho">
        <button type="button" class="botao botao-fantasma" data-acao="voltar">
          <span class="icone">${criarIcone("voltar")}</span> Voltar
        </button>
      </header>
      <div class="introducao-cartao" data-conteudo>
        <span class="etiqueta">Introdução da Missão</span>
        <h1>Carregando...</h1>
      </div>
    </section>
  `;

  container.querySelector('[data-acao="voltar"]').addEventListener("click", voltar);

  const missao = await obterMissao(dados);
  const perguntaInicialId = missao ? missao.perguntaInicialId : null;

  const conteudo = container.querySelector("[data-conteudo]");
  conteudo.innerHTML = `
    <span class="etiqueta">Introdução da Missão</span>
    <h1>${missao ? missao.titulo : "Missão indisponível"}</h1>
    <p>Conteúdo narrativo do caso (em construção).</p>
    <button type="button" class="botao botao-primario" data-acao="investigar">Investigar</button>
  `;

  conteudo.querySelector('[data-acao="investigar"]').addEventListener("click", () => {
    irPara("investigacao", { ...dados, perguntaInicialId });
  });
}
