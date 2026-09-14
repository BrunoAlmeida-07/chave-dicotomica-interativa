/**
 * selecaoGrupo.js
 *
 * Seleção de Grupo: etapa entre a Tela Inicial e o Mapa de Missões. O
 * jogador escolhe qual grupo zoológico (Aranhas, Escorpiões, Serpentes) vai
 * explorar — a escolha vira `dados.grupoId`, repassado ao Mapa de Missões,
 * que filtra as missões daquele grupo (ver mapaMissoes.js).
 *
 * Tela de menu (diretriz de navegação do projeto): "Voltar" tem destino
 * fixo (Tela Inicial), via `irPara`, não `voltar()` — é alcançável tanto
 * direto da Tela Inicial quanto, na primeira visita, depois do tutorial
 * "Como Jogar" (ver telaInicial.js/comoJogar.js).
 *
 * Tela fixa (não entra em TELAS_ROLAVEIS, navegacao.js): só 3 cards, cabe
 * na viewport sem precisar rolar — mesma filosofia de .menu-principal na
 * Tela Inicial.
 */

import { irPara } from "../navegacao.js";
import { criarIcone } from "../componentes/icone.js";
import { criarCartaoGrupo } from "../componentes/cartaoGrupo.js";
import { listarGrupos } from "../../database/scripts/database.js";

export async function renderSelecaoGrupo(container) {
  container.innerHTML = `
    <section class="tela tela-selecao-grupo">
      <header class="tela-cabecalho">
        <button type="button" class="botao botao-fantasma" data-acao="voltar">
          <span class="icone">${criarIcone("voltar")}</span> Voltar
        </button>
        <h1>Escolha um grupo</h1>
      </header>
      <div class="selecao-grupo__lista" data-lista>
        <p class="mensagem-carregando">Carregando grupos...</p>
      </div>
    </section>
  `;

  container.querySelector('[data-acao="voltar"]').addEventListener("click", () => {
    irPara("telaInicial");
  });

  const lista = container.querySelector("[data-lista]");
  const grupos = await listarGrupos();

  if (grupos.length === 0) {
    lista.innerHTML = '<p class="mensagem-vazia">Nenhum grupo disponível ainda.</p>';
    return;
  }

  lista.innerHTML = "";
  for (const grupo of grupos) {
    const cartao = criarCartaoGrupo({
      grupo,
      aoClicar: () => irPara("mapaMissoes", { grupoId: grupo.id }),
    });
    lista.appendChild(cartao);
  }
}
