/**
 * resultado.js
 *
 * Resultado: mostra a espécie a que a investigação levou. Ainda não compara
 * com uma resposta "correta" de missão (depende de missoes.json ter conteúdo
 * narrativo real) — só confirma qual foi a identificação.
 *
 * "Voltar às missões" leva direto ao Mapa de Missões (não ao histórico de
 * navegação): depois de concluída, voltar para dentro da investigação não
 * faz sentido — faz mais sentido escolher outro caso.
 */

import { irPara } from "../navegacao.js";
import { obterEspeciePorId } from "../../../database/scripts/database.js";
import { resolverCaminhoImagem } from "../utils/assets.js";
import { criarIcone } from "../componentes/icone.js";

const ROTULOS_RISCO = {
  nenhuma: "Sem risco relevante",
  baixa: "Risco baixo",
  moderada: "Risco moderado",
  alta: "Risco alto",
};

export async function renderResultado(container, dados = {}) {
  container.innerHTML = `
    <section class="tela tela-resultado">
      <div class="resultado-cabecalho">
        <span class="icone icone-sucesso">${criarIcone("check")}</span>
        <h1>Investigação concluída</h1>
      </div>
      <div data-conteudo-resultado class="resultado-corpo">
        <p class="mensagem-carregando">Carregando resultado...</p>
      </div>
      <div class="resultado-acoes">
        <button type="button" class="botao botao-primario" data-acao="avancar">Ver explicação científica</button>
        <button type="button" class="botao botao-fantasma" data-acao="voltar">Voltar às missões</button>
      </div>
    </section>
  `;

  container.querySelector('[data-acao="voltar"]').addEventListener("click", () => {
    irPara("mapaMissoes");
  });
  container.querySelector('[data-acao="avancar"]').addEventListener("click", () => {
    irPara("explicacaoCientifica", dados);
  });

  const areaResultado = container.querySelector("[data-conteudo-resultado]");

  if (!dados.especieId) {
    areaResultado.innerHTML = '<p class="mensagem-vazia">Nenhuma identificação foi realizada.</p>';
    return;
  }

  const especie = await obterEspeciePorId(dados.especieId);
  if (!especie) {
    areaResultado.innerHTML = '<p class="mensagem-vazia">Não foi possível carregar o resultado.</p>';
    return;
  }

  const imagemPrincipal = especie.imagens.find((img) => img.principal) ?? especie.imagens[0];
  const rotuloRisco = ROTULOS_RISCO[especie.grauImportanciaMedica] ?? especie.grauImportanciaMedica;

  areaResultado.innerHTML = `
    <p class="resultado-rotulo">Você identificou:</p>
    <h2 class="resultado-nome">${especie.nomePopular}</h2>
    ${especie.nomeCientifico ? `<p class="resultado-nome-cientifico"><em>${especie.nomeCientifico}</em></p>` : ""}
    ${
      imagemPrincipal
        ? `<img class="resultado-imagem" src="${resolverCaminhoImagem(imagemPrincipal.src)}" alt="${imagemPrincipal.alt}">`
        : ""
    }
    <p class="resultado-resumo">${especie.caracteristicasMorfologicas}</p>
    <div class="risco-caixa risco-caixa--${especie.grauImportanciaMedica}">
      <span class="icone">${criarIcone("alerta")}</span>
      <span>Nível de risco: <strong>${rotuloRisco}</strong></span>
    </div>
  `;
}
