/**
 * mapaMissoes.js
 *
 * Mapa de Missões: lista os casos disponíveis para o jogador escolher.
 *
 * Não conhece "grupo" nem `database.js` diretamente — pede a lista pronta
 * (já com status calculado) para nucleo/missoes.js. Nenhuma missão fica
 * fixa no código: a ordem, o título, a descrição e o status vêm todos da
 * camada de missões.
 */

import { irPara, voltar } from "../navegacao.js";
import { criarCartaoMissao } from "../componentes/cartaoMissao.js";
import { criarIcone } from "../componentes/icone.js";
import { listarMissoes } from "../nucleo/missoes.js";

export async function renderMapaMissoes(container) {
  container.innerHTML = `
    <section class="tela tela-mapa-missoes">
      <header class="tela-cabecalho">
        <button type="button" class="botao botao-fantasma" data-acao="voltar">
          <span class="icone">${criarIcone("voltar")}</span> Voltar
        </button>
        <h1>Mapa de Missões</h1>
      </header>
      <div class="lista-missoes" data-lista-missoes></div>
    </section>
  `;

  container.querySelector('[data-acao="voltar"]').addEventListener("click", voltar);

  const listaMissoes = container.querySelector("[data-lista-missoes]");
  const missoes = await listarMissoes();

  for (const missao of missoes) {
    const cartao = criarCartaoMissao({
      titulo: missao.titulo,
      descricao: missao.descricaoCurta,
      status: missao.status,
      aoClicar: () => irPara("introducaoMissao", { missaoId: missao.id }),
    });
    listaMissoes.appendChild(cartao);
  }
}
