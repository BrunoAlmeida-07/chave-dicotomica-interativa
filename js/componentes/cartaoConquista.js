/**
 * cartaoConquista.js
 *
 * Componente reutilizável: selo de uma conquista no Laboratório do
 * Pesquisador. Mostra ícone, nome e descrição; conquistas ainda não
 * desbloqueadas aparecem esmaecidas, com um cadeado no lugar do ícone.
 */

import { criarIcone } from "./icone.js";

/**
 * @param {{ nome: string, descricao: string, icone: string, desbloqueada: boolean }} conquista
 * @returns {HTMLElement}
 */
export function criarCartaoConquista({ nome, descricao, icone, desbloqueada }) {
  const cartao = document.createElement("div");
  cartao.className = `cartao-conquista ${desbloqueada ? "cartao-conquista--desbloqueada" : "cartao-conquista--bloqueada"}`;
  cartao.innerHTML = `
    <span class="cartao-conquista__icone icone">${criarIcone(desbloqueada ? icone : "cadeado")}</span>
    <span class="cartao-conquista__nome">${nome}</span>
    <span class="cartao-conquista__descricao">${descricao}</span>
  `;
  return cartao;
}
