/**
 * telaInicial.js
 *
 * Tela Inicial: hub de toda sessão a partir da segunda abertura. Oferece os
 * três pontos de entrada do fluxo aprovado: Mapa de Missões, Laboratório do
 * Pesquisador e Como Jogar (atalho direto para a Missão 0 - Treinamento).
 */

import { irPara } from "../navegacao.js";
import { criarIcone } from "../componentes/icone.js";

export function renderTelaInicial(container) {
  container.innerHTML = `
    <section class="tela tela-inicial">
      <div class="tela-inicial__topo">
        <span class="etiqueta">Missão Fauna Brasil</span>
        <h1>Olá, pesquisador(a)!</h1>
        <p>Escolha um caminho para continuar sua investigação.</p>
      </div>
      <nav class="menu-principal">
        <button type="button" class="botao-menu" data-acao="mapa-missoes">
          <span class="icone">${criarIcone("mapa")}</span>
          <span>Missões</span>
        </button>
        <button type="button" class="botao-menu" data-acao="laboratorio">
          <span class="icone">${criarIcone("frasco")}</span>
          <span>Laboratório do Pesquisador</span>
        </button>
        <button type="button" class="botao-menu" data-acao="como-jogar">
          <span class="icone">${criarIcone("livro")}</span>
          <span>Como Jogar</span>
        </button>
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
