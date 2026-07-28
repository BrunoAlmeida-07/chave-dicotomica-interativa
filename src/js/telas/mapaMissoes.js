/**
 * mapaMissoes.js
 *
 * Mapa de Missões: lista os casos disponíveis para o jogador escolher.
 *
 * `missoes.json` ainda não tem conteúdo real (é um scaffold vazio — ver
 * database/schema.md). Por isso, os "casos" mostrados aqui nesta etapa são:
 * a Missão 0 - Treinamento (fixa, sempre disponível) e um cartão por grupo
 * zoológico já existente na Base de Conhecimento (listarGrupos()), como
 * marcador de posição até existirem missões de verdade.
 */

import { irPara, voltar } from "../navegacao.js";
import { criarCartaoMissao } from "../componentes/cartaoMissao.js";
import { listarGrupos } from "../../../database/scripts/database.js";

export async function renderMapaMissoes(container) {
  container.innerHTML = `
    <section class="tela tela-mapa-missoes">
      <h1>Mapa de Missões</h1>
      <button type="button" data-acao="voltar">Voltar</button>
      <div class="lista-missoes" data-lista-missoes></div>
    </section>
  `;

  container.querySelector('[data-acao="voltar"]').addEventListener("click", voltar);

  const listaMissoes = container.querySelector("[data-lista-missoes]");

  const cartaoMissaoZero = criarCartaoMissao({
    titulo: "Missão 0 - Treinamento",
    descricao: "Aprenda a investigar respondendo ao seu primeiro caso.",
    aoClicar: () => irPara("introducaoMissao", { missaoId: "missao-0" }),
  });
  listaMissoes.appendChild(cartaoMissaoZero);

  const grupos = await listarGrupos();
  for (const grupo of grupos) {
    const cartao = criarCartaoMissao({
      titulo: grupo.nome,
      descricao: grupo.descricao,
      aoClicar: () => irPara("introducaoMissao", { grupoId: grupo.id }),
    });
    listaMissoes.appendChild(cartao);
  }
}
