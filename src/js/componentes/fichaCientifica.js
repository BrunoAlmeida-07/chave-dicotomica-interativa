/**
 * fichaCientifica.js
 *
 * Componente reutilizável: exibe a ficha completa de uma espécie (cabeçalho
 * + cards de conteúdo). Recebe um objeto `especie` já resolvido (vindo de
 * `obterEspeciePorId`) e devolve um elemento DOM pronto para ser inserido em
 * qualquer tela — não conhece Resultado, Laboratório, Missões, navegação ou
 * o Motor de Investigação. Usado hoje pela tela de Resultado; pensado para
 * ser reaproveitado sem alterações pelo futuro Laboratório do Pesquisador.
 *
 * Os cards são orientados a dados: cada entrada de CONFIGURACAO_CARDS define
 * título, ícone, condição de exibição e forma de renderização. Adicionar um
 * card novo (ex.: "Primeiros socorros") significa acrescentar uma entrada
 * nessa lista — não alterar a lógica principal do componente.
 */

import { criarIcone } from "./icone.js";
import { resolverCaminhoImagem } from "../utils/assets.js";

const ROTULOS_RISCO = {
  nenhuma: "Sem risco relevante",
  baixa: "Risco baixo",
  moderada: "Risco moderado",
  alta: "Risco alto",
};

const NIVEIS_RISCO = ["nenhuma", "baixa", "moderada", "alta"];

const CONFIGURACAO_CARDS = [
  {
    id: "caracteristicas",
    titulo: "Características",
    icone: "lupa",
    condicao: (especie) => especie.caracteristicasMorfologicas || especie.habitat || especie.comportamento,
    renderizar: (especie) => {
      const subitens = [
        { rotulo: "Aparência", texto: especie.caracteristicasMorfologicas },
        { rotulo: "Habitat", texto: especie.habitat },
        { rotulo: "Comportamento", texto: especie.comportamento },
      ].filter((item) => item.texto);

      return subitens
        .map((item) => `<p class="ficha-cientifica__subitem"><strong>${item.rotulo}:</strong> ${item.texto}</p>`)
        .join("");
    },
  },
  {
    id: "importancia-medica",
    titulo: "Importância médica",
    icone: "alerta",
    condicao: (especie) => Boolean(especie.grauImportanciaMedica),
    renderizar: (especie) => {
      const nivel = especie.grauImportanciaMedica;
      const rotulo = ROTULOS_RISCO[nivel] ?? nivel;
      const indiceAtual = NIVEIS_RISCO.indexOf(nivel);

      const medidor = NIVEIS_RISCO.map((chave, indice) => {
        const ativo = indice <= indiceAtual ? " ficha-cientifica__medidor-segmento--ativo" : "";
        return `<span class="ficha-cientifica__medidor-segmento ficha-cientifica__medidor-segmento--${chave}${ativo}"></span>`;
      }).join("");

      return `
        <div class="risco-caixa risco-caixa--${nivel}">
          <span class="icone">${criarIcone("alerta")}</span>
          <span class="risco-caixa__rotulo">${rotulo}</span>
        </div>
        ${indiceAtual >= 0 ? `<div class="ficha-cientifica__medidor" role="presentation">${medidor}</div>` : ""}
        ${
          especie.explicacaoImportanciaMedica
            ? `<p class="ficha-cientifica__texto">${especie.explicacaoImportanciaMedica}</p>`
            : ""
        }
      `;
    },
  },
  {
    id: "prevencao",
    titulo: "Prevenção",
    icone: "escudo",
    condicao: (especie) => (especie.prevencao ?? []).length > 0,
    renderizar: (especie) =>
      `<ul class="ficha-cientifica__lista">${especie.prevencao.map((item) => `<li>${item}</li>`).join("")}</ul>`,
  },
  {
    id: "curiosidades",
    titulo: "Curiosidades",
    icone: "lampada",
    condicao: (especie) => (especie.curiosidades ?? []).length > 0,
    renderizar: (especie) =>
      `<ul class="ficha-cientifica__lista">${especie.curiosidades.map((item) => `<li>${item}</li>`).join("")}</ul>`,
  },
  {
    id: "importancia-ecologica",
    titulo: "Importância ecológica",
    icone: "folha",
    condicao: (especie) => Boolean(especie.importanciaEcologica),
    renderizar: (especie) => `<p class="ficha-cientifica__texto">${especie.importanciaEcologica}</p>`,
  },
  {
    id: "distribuicao",
    titulo: "Distribuição geográfica",
    icone: "mapa",
    condicao: (especie) => Boolean(especie.distribuicaoGeografica),
    renderizar: (especie) => `<p class="ficha-cientifica__texto">${especie.distribuicaoGeografica}</p>`,
  },
];

/**
 * Cria a ficha científica completa de uma espécie.
 *
 * @param {object} especie - Registro de espécie já resolvido (ver database/schema.md).
 * @returns {HTMLElement}
 */
export function criarFichaCientifica(especie) {
  const ficha = document.createElement("article");
  ficha.className = "ficha-cientifica";

  const imagemPrincipal = (especie.imagens ?? []).find((imagem) => imagem.principal) ?? especie.imagens?.[0];

  ficha.innerHTML = `
    <div class="ficha-cientifica__cabecalho">
      ${
        imagemPrincipal
          ? `<div class="ficha-cientifica__imagem-wrapper">
               <img class="ficha-cientifica__imagem" src="${resolverCaminhoImagem(imagemPrincipal.src)}" alt="${imagemPrincipal.alt ?? ""}">
             </div>`
          : ""
      }
      <div class="ficha-cientifica__identificacao">
        <span class="etiqueta ficha-cientifica__selo">Nova espécie catalogada</span>
        <h2 class="ficha-cientifica__nome">${especie.nomePopular}</h2>
        ${
          especie.nomeCientifico
            ? `<p class="ficha-cientifica__nome-cientifico"><em>${especie.nomeCientifico}</em></p>`
            : ""
        }
      </div>
    </div>
    <div class="ficha-cientifica__cards" data-cards></div>
  `;

  const areaCards = ficha.querySelector("[data-cards]");

  for (const card of CONFIGURACAO_CARDS) {
    if (!card.condicao(especie)) {
      continue;
    }

    const conteudo = card.renderizar(especie);
    if (!conteudo) {
      continue;
    }

    const secao = document.createElement("section");
    secao.className = `ficha-cientifica__card ficha-cientifica__card--${card.id}`;
    secao.innerHTML = `
      <h3 class="ficha-cientifica__card-titulo">
        <span class="icone">${criarIcone(card.icone)}</span> ${card.titulo}
      </h3>
      <div class="ficha-cientifica__card-conteudo">${conteudo}</div>
    `;
    areaCards.appendChild(secao);
  }

  return ficha;
}
