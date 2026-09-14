/**
 * cartaoGrupo.js
 *
 * Componente reutilizável: card de um grupo zoológico na tela de Seleção de
 * Grupo — a imagem representativa (`grupo.imagemCard`), o nome em destaque e
 * a descrição, vindos direto de grupos.json (database.js). O cartão inteiro
 * é o botão, mesmo padrão já usado em cartaoMissao.js/cartaoEscolhaEspecie.js
 * (nenhum botão separado dentro do card).
 */

import { resolverCaminhoImagem } from "../utils/assets.js";

/**
 * @param {{
 *   grupo: object,
 *   aoClicar: () => void,
 * }} opcoes
 * @returns {HTMLElement}
 */
export function criarCartaoGrupo({ grupo, aoClicar }) {
  const cartao = document.createElement("button");
  cartao.type = "button";
  cartao.className = "cartao-grupo";
  cartao.innerHTML = `
    <div class="cartao-grupo__imagem-wrapper">
      <img class="cartao-grupo__imagem" src="${resolverCaminhoImagem(grupo.imagemCard)}" alt="">
    </div>
    <div class="cartao-grupo__conteudo">
      <strong class="cartao-grupo__nome">${grupo.nome}</strong>
      <span class="cartao-grupo__descricao">${grupo.descricao}</span>
    </div>
  `;

  cartao.addEventListener("click", aoClicar);

  return cartao;
}
