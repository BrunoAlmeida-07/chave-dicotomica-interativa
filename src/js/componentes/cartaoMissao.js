/**
 * cartaoMissao.js
 *
 * Componente reutilizável: um cartão clicável representando uma missão (ou,
 * nesta etapa, um grupo zoológico usado como caso provisório) no Mapa de
 * Missões.
 */

/**
 * Cria o elemento de um cartão de missão.
 *
 * @param {{ titulo: string, descricao?: string, aoClicar: () => void }} opcoes
 * @returns {HTMLElement}
 */
export function criarCartaoMissao({ titulo, descricao = "", aoClicar }) {
  const cartao = document.createElement("button");
  cartao.type = "button";
  cartao.className = "cartao-missao";
  cartao.innerHTML = `
    <strong class="cartao-missao__titulo">${titulo}</strong>
    ${descricao ? `<span class="cartao-missao__descricao">${descricao}</span>` : ""}
  `;
  cartao.addEventListener("click", aoClicar);
  return cartao;
}
