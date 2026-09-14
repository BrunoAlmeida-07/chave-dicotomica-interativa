/**
 * mapaMissoes.js
 *
 * Mapa de Missões: lista os casos de UM grupo zoológico (`dados.grupoId`,
 * escolhido na tela de Seleção de Grupo) para o jogador escolher.
 *
 * Não conhece a lógica de status — pede a lista pronta (já filtrada pelo
 * grupo e com status calculado) para nucleo/missoes.js. Nenhuma missão fica
 * fixa no código: a ordem, o título, a descrição e o status vêm todos da
 * camada de missões; o nome do grupo (cabeçalho) vem de database.js.
 *
 * "Voltar" leva explicitamente para a Seleção de Grupo (`irPara`), não para
 * o histórico de navegação (`voltar()`): é uma tela de menu, alcançável a
 * partir de vários lugares (Seleção de Grupo, Resultado, Encerramento), e
 * seu destino de retorno deve ser sempre o mesmo, independente de como o
 * jogador chegou aqui.
 */

import { irPara } from "../navegacao.js";
import { criarCartaoMissao } from "../componentes/cartaoMissao.js";
import { criarIcone } from "../componentes/icone.js";
import { listarMissoesPorGrupo } from "../nucleo/missoes.js";
import { obterGrupoPorId } from "../../database/scripts/database.js";

export async function renderMapaMissoes(container, dados = {}) {
  const { grupoId } = dados;

  container.innerHTML = `
    <section class="tela tela-mapa-missoes">
      <header class="tela-cabecalho">
        <button type="button" class="botao botao-fantasma" data-acao="voltar">
          <span class="icone">${criarIcone("voltar")}</span> Voltar
        </button>
        <div class="mapa-missoes__titulo">
          <span class="etiqueta">Mapa de Missões</span>
          <h1 data-titulo-grupo>Carregando...</h1>
        </div>
      </header>
      <div class="lista-missoes" data-lista-missoes></div>
    </section>
  `;

  container.querySelector('[data-acao="voltar"]').addEventListener("click", () => {
    irPara("selecaoGrupo");
  });

  const tituloGrupo = container.querySelector("[data-titulo-grupo]");
  const listaMissoes = container.querySelector("[data-lista-missoes]");

  if (!grupoId) {
    tituloGrupo.textContent = "Grupo não encontrado";
    listaMissoes.innerHTML = '<p class="mensagem-vazia">Volte e escolha um grupo para ver suas missões.</p>';
    return;
  }

  const [grupo, missoes] = await Promise.all([obterGrupoPorId(grupoId), listarMissoesPorGrupo(grupoId)]);

  tituloGrupo.textContent = grupo ? grupo.nome : "Grupo não encontrado";

  if (missoes.length === 0) {
    listaMissoes.innerHTML = '<p class="mensagem-vazia">Nenhuma missão disponível para este grupo ainda.</p>';
    return;
  }

  for (const missao of missoes) {
    const cartao = criarCartaoMissao({
      titulo: missao.titulo,
      descricao: missao.descricaoCurta,
      status: missao.status,
      aoClicar: () => irPara("selecaoEspecie", { missaoId: missao.id, grupoId }),
    });
    listaMissoes.appendChild(cartao);
  }
}
