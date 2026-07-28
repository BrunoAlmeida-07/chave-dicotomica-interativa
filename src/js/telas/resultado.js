/**
 * resultado.js
 *
 * Resultado: mostra a espécie a que a investigação levou. Ainda não compara
 * com uma resposta "correta" de missão (depende de missoes.json ter
 * conteúdo real) — só confirma qual foi a identificação.
 */

import { irPara, voltar } from "../navegacao.js";
import { obterEspeciePorId } from "../../../database/scripts/database.js";
import { resolverCaminhoImagem } from "../utils/assets.js";

export async function renderResultado(container, dados = {}) {
  container.innerHTML = `
    <section class="tela tela-resultado">
      <h1>Resultado</h1>
      <div data-conteudo-resultado><p>Carregando resultado...</p></div>
      <button type="button" data-acao="voltar">Voltar</button>
      <button type="button" data-acao="avancar">Ver explicação científica</button>
    </section>
  `;

  container.querySelector('[data-acao="voltar"]').addEventListener("click", voltar);
  container.querySelector('[data-acao="avancar"]').addEventListener("click", () => {
    irPara("explicacaoCientifica", dados);
  });

  const areaResultado = container.querySelector("[data-conteudo-resultado]");

  if (!dados.especieId) {
    areaResultado.innerHTML = "<p>Nenhuma identificação foi realizada.</p>";
    return;
  }

  const especie = await obterEspeciePorId(dados.especieId);
  if (!especie) {
    areaResultado.innerHTML = "<p>Não foi possível carregar o resultado.</p>";
    return;
  }

  const imagemPrincipal = especie.imagens.find((img) => img.principal) ?? especie.imagens[0];

  areaResultado.innerHTML = `
    <p>Você identificou:</p>
    <strong>${especie.nomePopular}</strong>
    ${imagemPrincipal ? `<img src="${resolverCaminhoImagem(imagemPrincipal.src)}" alt="${imagemPrincipal.alt}">` : ""}
  `;
}
