/**
 * fichaCientifica.js
 *
 * Componente reutilizável: exibe a ficha completa de uma espécie em duas
 * colunas — painel da espécie (foto + identificação, fixo/sticky via CSS) e
 * conteúdo científico (cards empilhados, rolável). Recebe um objeto
 * `especie` já resolvido (vindo de `obterEspeciePorId`) e devolve uma
 * Promise de elemento DOM pronto para ser inserido em qualquer tela — não
 * conhece Resultado, Laboratório, Missões, navegação ou o Motor de
 * Investigação. Usado hoje pela tela de Resultado; pensado para ser
 * reaproveitado sem alterações pelo futuro Laboratório do Pesquisador.
 *
 * É assíncrono só por causa do "Registro nº X de Y" do painel: para isso
 * consulta `listarEspecies()` (database.js) e calcula a posição da espécie
 * na coleção. Todo o resto do conteúdo vem inteiramente do objeto `especie`
 * recebido, sem nenhuma outra consulta à Base de Conhecimento.
 *
 * Os cards são orientados a dados: cada entrada de CONFIGURACAO_CARDS define
 * título, ícone, condição de exibição e forma de renderização, e são
 * exibidos empilhados verticalmente, na ordem da lista — uma leitura
 * contínua, como um guia de campo. Adicionar um card novo significa
 * acrescentar uma entrada nessa lista — não alterar a lógica principal do
 * componente.
 */

import { criarIcone } from "./icone.js";
import { resolverCaminhoImagem } from "../utils/assets.js";
import { listarEspecies } from "../../../database/scripts/database.js";

const ROTULOS_RISCO = {
  nenhuma: "Sem risco relevante",
  baixa: "Risco baixo",
  moderada: "Risco moderado",
  alta: "Risco alto",
};

const NIVEIS_RISCO = ["nenhuma", "baixa", "moderada", "alta"];

const CONFIGURACAO_CARDS = [
  {
    id: "aparencia",
    titulo: "Aparência",
    icone: "lupa",
    condicao: (especie) => Boolean(especie.caracteristicasMorfologicas),
    renderizar: (especie) => `<p class="ficha-cientifica__texto">${especie.caracteristicasMorfologicas}</p>`,
  },
  {
    id: "habitat",
    titulo: "Habitat",
    icone: "arvore",
    condicao: (especie) => Boolean(especie.habitat),
    renderizar: (especie) => `<p class="ficha-cientifica__texto">${especie.habitat}</p>`,
  },
  {
    id: "comportamento",
    titulo: "Comportamento",
    icone: "pata",
    condicao: (especie) => Boolean(especie.comportamento),
    renderizar: (especie) => `<p class="ficha-cientifica__texto">${especie.comportamento}</p>`,
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
        <div class="ficha-cientifica__medica">
          <div class="ficha-cientifica__medica-selo">
            <div class="risco-caixa risco-caixa--${nivel}">
              <span class="icone">${criarIcone("alerta")}</span>
              <span class="risco-caixa__rotulo">${rotulo}</span>
            </div>
            ${indiceAtual >= 0 ? `<div class="ficha-cientifica__medidor" role="presentation">${medidor}</div>` : ""}
          </div>
          <p class="ficha-cientifica__texto ficha-cientifica__medica-texto">${
            especie.explicacaoImportanciaMedica || "Informação científica indisponível."
          }</p>
        </div>
      `;
    },
  },
  {
    id: "importancia-ecologica",
    titulo: "Importância ecológica",
    icone: "folha",
    condicao: (especie) => Boolean(especie.importanciaEcologica),
    renderizar: (especie) => `<p class="ficha-cientifica__texto">${especie.importanciaEcologica}</p>`,
  },
  {
    id: "primeiros-socorros",
    titulo: "Primeiros socorros",
    icone: "frasco",
    condicao: (especie) => Boolean(especie.primeirosSocorros),
    renderizar: (especie) => `<p class="ficha-cientifica__texto">${especie.primeirosSocorros}</p>`,
  },
  {
    id: "prevencao",
    titulo: "Prevenção",
    icone: "escudo",
    condicao: (especie) => (especie.prevencao ?? []).length > 0,
    renderizar: (especie) =>
      `<ul class="ficha-cientifica__lista ficha-cientifica__lista--marcador">${especie.prevencao
        .map((item) => `<li><span class="ficha-cientifica__marcador icone">${criarIcone("check")}</span>${item}</li>`)
        .join("")}</ul>`,
  },
  {
    id: "distribuicao",
    titulo: "Distribuição geográfica",
    icone: "mapa",
    condicao: (especie) => Boolean(especie.distribuicaoGeografica),
    renderizar: (especie) => `<p class="ficha-cientifica__selo-local">${especie.distribuicaoGeografica}</p>`,
  },
  {
    id: "curiosidades",
    titulo: "Curiosidades",
    icone: "lampada",
    condicao: (especie) => (especie.curiosidades ?? []).length > 0,
    renderizar: (especie) =>
      `<div class="ficha-cientifica__notas">${especie.curiosidades
        .map((item) => `<p class="ficha-cientifica__nota">${item}</p>`)
        .join("")}</div>`,
  },
];

/**
 * Cria a ficha científica completa de uma espécie.
 *
 * @param {object} especie - Registro de espécie já resolvido (ver database/schema.md).
 * @returns {Promise<HTMLElement>}
 */
export async function criarFichaCientifica(especie) {
  const ficha = document.createElement("article");
  ficha.className = "ficha-cientifica";

  const imagemPrincipal = (especie.imagens ?? []).find((imagem) => imagem.principal) ?? especie.imagens?.[0];
  const rotuloRisco = ROTULOS_RISCO[especie.grauImportanciaMedica] ?? especie.grauImportanciaMedica;

  const todasEspecies = await listarEspecies();
  const posicaoCatalogo = todasEspecies.findIndex((item) => item.id === especie.id);
  const registro =
    posicaoCatalogo >= 0
      ? `Registro nº ${String(posicaoCatalogo + 1).padStart(2, "0")} de ${todasEspecies.length}`
      : null;

  ficha.innerHTML = `
    <aside class="ficha-cientifica__painel">
      <span class="etiqueta ficha-cientifica__selo">Nova espécie catalogada</span>
      ${
        imagemPrincipal
          ? `<div class="ficha-cientifica__imagem-wrapper">
               <img class="ficha-cientifica__imagem" src="${resolverCaminhoImagem(imagemPrincipal.src)}" alt="${imagemPrincipal.alt ?? ""}">
             </div>`
          : ""
      }
      <h2 class="ficha-cientifica__nome">${especie.nomePopular}</h2>
      ${
        especie.nomeCientifico
          ? `<p class="ficha-cientifica__nome-cientifico"><em>${especie.nomeCientifico}</em></p>`
          : ""
      }
      <span class="ficha-cientifica__selo-risco ficha-cientifica__selo-risco--${especie.grauImportanciaMedica}">${rotuloRisco}</span>
      ${
        especie.familia
          ? `<p class="ficha-cientifica__metadado">Família <strong>${especie.familia}</strong></p>`
          : ""
      }
      ${registro ? `<p class="ficha-cientifica__registro">${registro}</p>` : ""}
    </aside>
    <div class="ficha-cientifica__conteudo">
      <div class="ficha-cientifica__cards" data-cards></div>
    </div>
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
