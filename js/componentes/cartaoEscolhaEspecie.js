/**
 * cartaoEscolhaEspecie.js
 *
 * Componente reutilizável: cartão de uma espécie na tela de Seleção de
 * Espécime, usado só para escolher qual espécie será investigada — não
 * para o Catálogo do Laboratório (esse é `cartaoEspecie.js`, com a semântica
 * diferente de "descoberta/bloqueada" que não se aplica aqui).
 *
 * Nunca mostra o nome científico/popular da espécie: só a fotografia e um
 * rótulo genérico ("Espécime N"), recebido de quem chama — o nome só é
 * revelado ao final da investigação, para não entregar a resposta antes da
 * hora.
 */

import { resolverCaminhoImagem } from "../utils/assets.js";

/**
 * @param {{
 *   especie: object,
 *   rotulo: string,
 *   aoClicar: () => void,
 * }} opcoes
 * @returns {HTMLElement}
 */
export function criarCartaoEscolhaEspecie({ especie, rotulo, aoClicar }) {
  const imagemPrincipal = (especie.imagens ?? []).find((imagem) => imagem.principal) ?? especie.imagens?.[0];

  const cartao = document.createElement("button");
  cartao.type = "button";
  cartao.className = "cartao-escolha-especie";
  cartao.innerHTML = `
    <div class="cartao-escolha-especie__imagem-wrapper">
      ${
        imagemPrincipal
          ? `<img class="cartao-escolha-especie__imagem" src="${resolverCaminhoImagem(imagemPrincipal.src)}" alt="${rotulo}">`
          : ""
      }
    </div>
    <span class="cartao-escolha-especie__rotulo">${rotulo}</span>
  `;

  cartao.addEventListener("click", aoClicar);

  return cartao;
}
