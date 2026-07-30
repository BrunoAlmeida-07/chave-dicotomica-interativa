/**
 * mapaMissoes.js
 *
 * Mapa de Missões: lista os casos disponíveis para o jogador escolher.
 *
 * Não conhece "grupo" nem `database.js` diretamente — pede a lista pronta
 * (já com status calculado) para nucleo/missoes.js. Nenhuma missão fica
 * fixa no código: a ordem, o título, a descrição e o status vêm todos da
 * camada de missões.
 *
 * "Voltar" leva explicitamente para a Tela Inicial (`irPara`), não para o
 * histórico de navegação (`voltar()`): é uma tela de menu, alcançável a
 * partir de vários lugares (Tela Inicial, Resultado, Encerramento), e seu
 * destino de retorno deve ser sempre o mesmo, independente de como o
 * jogador chegou aqui.
 */

import { irPara } from "../navegacao.js";
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

  container.querySelector('[data-acao="voltar"]').addEventListener("click", () => {
    irPara("telaInicial");
  });

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
