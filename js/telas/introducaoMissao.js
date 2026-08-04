/**
 * introducaoMissao.js
 *
 * Introdução da Missão: contextualiza o caso antes da investigação começar,
 * exibindo a narrativa (`contextoNarrativo`) e os detalhes da ocorrência
 * (`descricaoOcorrencia`) da missão — nunca a espécie-alvo, que só é
 * revelada ao final da investigação. Missões sem esses campos (ex.: a
 * Missão de Treinamento) caem num texto genérico de apoio.
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

  const contextoNarrativo = missao?.contextoNarrativo ?? "Conteúdo narrativo do caso (em construção).";
  const descricaoOcorrencia = missao?.descricaoOcorrencia ?? "";

  const conteudo = container.querySelector("[data-conteudo]");
  conteudo.innerHTML = `
    <span class="etiqueta">Introdução da Missão</span>
    <h1>${missao ? missao.titulo : "Missão indisponível"}</h1>
    <p>${contextoNarrativo}</p>
    ${
      descricaoOcorrencia
        ? `<p class="introducao-cartao__ocorrencia"><strong>Ocorrência:</strong> ${descricaoOcorrencia}</p>`
        : ""
    }
    <button type="button" class="botao botao-primario" data-acao="investigar">Investigar</button>
  `;

  conteudo.querySelector('[data-acao="investigar"]').addEventListener("click", () => {
    irPara("investigacao", { ...dados, perguntaInicialId });
  });
}
