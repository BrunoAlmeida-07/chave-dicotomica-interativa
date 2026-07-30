/**
 * cartaoEspecie.js
 *
 * Componente reutilizável: card de uma espécie na grade do Catálogo, no
 * Laboratório do Pesquisador. Duas variantes, decididas pelo parâmetro
 * `descoberta` (quem chama já sabe se a espécie está catalogada ou não —
 * este componente só desenha o resultado):
 *
 *   - descoberta: mostra a foto e o nome, e é clicável.
 *   - não descoberta: mostra a mesma foto como silhueta (filtro CSS, sem
 *     nenhum asset novo) e o nome oculto; não é clicável.
 */

import { resolverCaminhoImagem } from "../utils/assets.js";

/**
 * @param {{
 *   especie: object,
 *   descoberta: boolean,
 *   aoClicar?: () => void,
 * }} opcoes
 * @returns {HTMLElement}
 */
export function criarCartaoEspecie({ especie, descoberta, aoClicar }) {
  const imagemPrincipal = (especie.imagens ?? []).find((imagem) => imagem.principal) ?? especie.imagens?.[0];

  const cartao = document.createElement(descoberta ? "button" : "div");
  if (descoberta) {
    cartao.type = "button";
  }
  cartao.className = `cartao-especie ${descoberta ? "cartao-especie--descoberta" : "cartao-especie--bloqueada"}`;
  cartao.innerHTML = `
    <div class="cartao-especie__imagem-wrapper">
      ${
        imagemPrincipal
          ? `<img class="cartao-especie__imagem" src="${resolverCaminhoImagem(imagemPrincipal.src)}" alt="${descoberta ? (imagemPrincipal.alt ?? "") : "Espécie ainda não catalogada"}">`
          : ""
      }
    </div>
    <span class="cartao-especie__nome">${descoberta ? especie.nomePopular : "???"}</span>
  `;

  if (descoberta && aoClicar) {
    cartao.addEventListener("click", aoClicar);
  }

  return cartao;
}
