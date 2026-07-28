/**
 * laboratorio.js
 *
 * Laboratório do Pesquisador: coleção de espécies descobertas pelo jogador.
 * Placeholder nesta etapa — funcionalidade completa (busca, filtros,
 * progresso de descoberta) fica para uma etapa futura.
 */

import { voltar } from "../navegacao.js";
import { criarIcone } from "../componentes/icone.js";

export function renderLaboratorio(container) {
  container.innerHTML = `
    <section class="tela tela-laboratorio">
      <header class="tela-cabecalho">
        <button type="button" class="botao botao-fantasma" data-acao="voltar">
          <span class="icone">${criarIcone("voltar")}</span> Voltar
        </button>
        <h1>Laboratório do Pesquisador</h1>
      </header>
      <div class="cartao conteudo-cartao">
        <span class="icone">${criarIcone("frasco")}</span>
        <p>Coleção de espécies descobertas (em construção).</p>
      </div>
    </section>
  `;

  container.querySelector('[data-acao="voltar"]').addEventListener("click", voltar);
}
