/**
 * cartaoMissao.js
 *
 * Componente reutilizável: um cartão representando uma missão no Mapa de
 * Missões. Mostra o status recebido (não decide status sozinho) e só liga o
 * clique quando a missão está disponível — usa o próprio atributo `disabled`
 * do botão para as demais, funcionando para qualquer valor de status, sem
 * regra específica sobre qual missão é qual.
 */

import { criarIcone } from "./icone.js";

const ROTULOS_STATUS = {
  disponivel: "Disponível",
  bloqueada: "Bloqueada",
  concluida: "Concluída",
};

const ICONES_STATUS = {
  bloqueada: "cadeado",
  concluida: "check",
};

/**
 * Cria o elemento de um cartão de missão.
 *
 * @param {{
 *   titulo: string,
 *   descricao?: string,
 *   status?: "disponivel" | "bloqueada" | "concluida",
 *   aoClicar: () => void,
 * }} opcoes
 * @returns {HTMLElement}
 */
export function criarCartaoMissao({ titulo, descricao = "", status = "disponivel", aoClicar }) {
  const disponivel = status === "disponivel";
  const icone = ICONES_STATUS[status];

  const cartao = document.createElement("button");
  cartao.type = "button";
  cartao.className = `cartao cartao-missao cartao-missao--${status}`;
  cartao.disabled = !disponivel;
  cartao.innerHTML = `
    <div class="cartao-missao__topo">
      ${icone ? `<span class="icone">${criarIcone(icone)}</span>` : ""}
      <span class="cartao-missao__status">${ROTULOS_STATUS[status] ?? ""}</span>
    </div>
    <strong class="cartao-missao__titulo">${titulo}</strong>
    ${descricao ? `<span class="cartao-missao__descricao">${descricao}</span>` : ""}
  `;

  if (disponivel) {
    cartao.addEventListener("click", aoClicar);
  }

  return cartao;
}
