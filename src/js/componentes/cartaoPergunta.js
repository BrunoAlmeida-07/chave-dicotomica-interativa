/**
 * cartaoPergunta.js
 *
 * Componente reutilizável: apresenta uma pergunta da chave dicotômica
 * (imagem + texto + botões Sim/Não) e delega a decisão de para onde ir a
 * quem o usa. Não conhece perguntas.json nem database.js — só desenha o que
 * recebe.
 */

/**
 * Cria o elemento de uma pergunta.
 *
 * @param {{
 *   texto: string,
 *   imagem?: string,
 *   aoResponderSim: () => void,
 *   aoResponderNao: () => void,
 * }} opcoes
 * @returns {HTMLElement}
 */
export function criarCartaoPergunta({ texto, imagem = "", aoResponderSim, aoResponderNao }) {
  const cartao = document.createElement("div");
  cartao.className = "cartao-pergunta";
  cartao.innerHTML = `
    ${imagem ? `<img class="cartao-pergunta__imagem" src="${imagem}" alt="">` : ""}
    <p class="cartao-pergunta__texto">${texto}</p>
    <div class="cartao-pergunta__botoes">
      <button type="button" data-resposta="sim">Sim</button>
      <button type="button" data-resposta="nao">Não</button>
    </div>
  `;

  cartao.querySelector('[data-resposta="sim"]').addEventListener("click", aoResponderSim);
  cartao.querySelector('[data-resposta="nao"]').addEventListener("click", aoResponderNao);

  return cartao;
}
