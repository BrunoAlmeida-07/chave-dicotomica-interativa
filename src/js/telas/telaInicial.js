/**
 * telaInicial.js
 *
 * Tela Inicial: hub de toda sessão a partir da segunda abertura. Oferece os
 * três pontos de entrada do fluxo aprovado: Mapa de Missões, Laboratório do
 * Pesquisador e Como Jogar (atalho direto para a Missão 0 - Treinamento).
 */

import { irPara } from "../navegacao.js";

export function renderTelaInicial(container) {
  container.innerHTML = `
    <section class="tela tela-inicial">
      <h1>Missão Fauna Brasil</h1>
      <nav class="menu-principal">
        <button type="button" data-acao="mapa-missoes">Missões</button>
        <button type="button" data-acao="laboratorio">Laboratório do Pesquisador</button>
        <button type="button" data-acao="como-jogar">Como Jogar</button>
      </nav>
    </section>
  `;

  container.querySelector('[data-acao="mapa-missoes"]').addEventListener("click", () => {
    irPara("mapaMissoes");
  });

  container.querySelector('[data-acao="laboratorio"]').addEventListener("click", () => {
    irPara("laboratorio");
  });

  container.querySelector('[data-acao="como-jogar"]').addEventListener("click", () => {
    irPara("introducaoMissao", { missaoId: "missao-0" });
  });
}
