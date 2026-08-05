/**
 * selecaoEspecie.js
 *
 * Seleção de Espécime: etapa entre o Mapa de Missões e a Introdução da
 * Missão. O jogador escolhe, só pela fotografia, qual espécie do grupo da
 * missão será investigada — o nome nunca é exibido aqui, só "Espécime 1",
 * "Espécime 2"... (ordem embaralhada a cada visita, pra não virar
 * metajogo de posição). A escolha vira `dados.especieEscolhidaId`, estado
 * de sessão que segue pela Introdução, pela Investigação e depois para o
 * Resultado, onde é comparado ao que a árvore de perguntas realmente
 * devolve.
 *
 * Mostra todas as espécies cadastradas do grupo, sem filtro — inclusive as
 * entradas genéricas (ex.: "aranha não peçonhenta"), que também são alvos
 * válidos de investigação.
 */

import { irPara, voltar } from "../navegacao.js";
import { listarEspeciesPorGrupo } from "../../database/scripts/database.js";
import { obterMissao } from "../nucleo/missoes.js";
import { criarCartaoEscolhaEspecie } from "../componentes/cartaoEscolhaEspecie.js";
import { criarIcone } from "../componentes/icone.js";

export async function renderSelecaoEspecie(container, dados = {}) {
  container.innerHTML = `
    <section class="tela tela-selecao-especie">
      <header class="tela-cabecalho">
        <button type="button" class="botao botao-fantasma" data-acao="voltar">
          <span class="icone">${criarIcone("voltar")}</span> Voltar
        </button>
        <h1>Qual espécime será investigado?</h1>
      </header>
      <p class="selecao-especie__instrucao">
        Escolha uma fotografia para iniciar o caso. A espécie só será revelada ao final da investigação.
      </p>
      <div class="selecao-especie__grade" data-grade>
        <p class="mensagem-carregando">Carregando espécimes...</p>
      </div>
    </section>
  `;

  container.querySelector('[data-acao="voltar"]').addEventListener("click", voltar);

  const grade = container.querySelector("[data-grade]");
  const missao = dados.missaoId ? await obterMissao({ missaoId: dados.missaoId }) : null;

  if (!missao) {
    grade.innerHTML = '<p class="mensagem-vazia">Não foi possível carregar esta missão.</p>';
    return;
  }

  const especies = await listarEspeciesPorGrupo(missao.grupoId);

  if (especies.length === 0) {
    grade.innerHTML = '<p class="mensagem-vazia">Nenhum espécime disponível para este caso ainda.</p>';
    return;
  }

  grade.innerHTML = "";
  for (const especie of embaralhar(especies)) {
    const posicao = grade.childElementCount + 1;
    const cartao = criarCartaoEscolhaEspecie({
      especie,
      rotulo: `Espécime ${posicao}`,
      aoClicar: () => irPara("introducaoMissao", { ...dados, especieEscolhidaId: especie.id }),
    });
    grade.appendChild(cartao);
  }
}

/** Embaralha uma lista (Fisher-Yates), sem alterar o array original. */
function embaralhar(lista) {
  const copia = [...lista];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}
