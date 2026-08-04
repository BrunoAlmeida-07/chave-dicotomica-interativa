/**
 * cartaoPergunta.js
 *
 * Componente reutilizável: apresenta uma pergunta da chave dicotômica
 * (imagens + texto + botões Sim/Não) e delega a decisão de para onde ir a
 * quem o usa. Não conhece perguntas.json, missoes.json nem database.js — só
 * desenha o que recebe.
 *
 * Duas imagens, papéis diferentes:
 *   - `imagemPrincipal` (opcional): a fotografia fixa do espécime da
 *     missão — a mesma em todas as perguntas de uma investigação. Quem
 *     decide qual foto é essa (missão → espécie-alvo → imagens[]) é
 *     investigacao.js, não este componente.
 *   - `imagem` (a de sempre): a foto de apoio da pergunta atual, muda a
 *     cada etapa da chave, destacando a característica observada.
 */

/**
 * Cria o elemento de uma pergunta.
 *
 * @param {{
 *   texto: string,
 *   imagem?: string,
 *   imagemPrincipal?: string,
 *   dica?: string,
 *   etapa?: string,
 *   aoResponderSim: () => void,
 *   aoResponderNao: () => void,
 * }} opcoes
 * @returns {HTMLElement}
 */
export function criarCartaoPergunta({
  texto,
  imagem = "",
  imagemPrincipal = "",
  dica = "Observe atentamente a imagem antes de responder.",
  etapa = "",
  aoResponderSim,
  aoResponderNao,
}) {
  const cartao = document.createElement("div");
  cartao.className = "cartao-pergunta";
  cartao.innerHTML = `
    ${etapa ? `<span class="cartao-pergunta__etapa">${etapa}</span>` : ""}
    ${
      imagemPrincipal || imagem
        ? `<div class="cartao-pergunta__imagens">
             ${
               imagemPrincipal
                 ? `<div class="cartao-pergunta__imagem-principal-wrapper">
                      <img class="cartao-pergunta__imagem-principal" src="${imagemPrincipal}" alt="Espécime encontrado nesta investigação">
                    </div>`
                 : ""
             }
             ${
               imagem
                 ? `<div class="cartao-pergunta__imagem-wrapper">
                      <img class="cartao-pergunta__imagem" src="${imagem}" alt="">
                    </div>`
                 : ""
             }
           </div>`
        : ""
    }
    <div class="cartao-pergunta__conteudo">
      ${dica ? `<p class="cartao-pergunta__dica">${dica}</p>` : ""}
      <p class="cartao-pergunta__texto">${texto}</p>
      <div class="cartao-pergunta__botoes">
        <button type="button" class="botao botao-resposta" data-resposta="sim">Sim</button>
        <button type="button" class="botao botao-resposta" data-resposta="nao">Não</button>
      </div>
    </div>
  `;

  cartao.querySelector('[data-resposta="sim"]').addEventListener("click", aoResponderSim);
  cartao.querySelector('[data-resposta="nao"]').addEventListener("click", aoResponderNao);

  return cartao;
}
