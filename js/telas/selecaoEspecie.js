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
 *
 * A grade é dividida em linhas (ver `agruparEmLinhas`), cada uma um flex
 * item de `.selecao-especie__grade` (`flex-direction: column`) — isso deixa
 * as linhas dividirem a altura disponível de forma real (`flex: 1` em cada
 * uma, sem nenhuma fração fixa tipo "50%"), mesma filosofia usada no resto
 * do app (ver `.cartao-pergunta__imagens` em estilo.css).
 *
 * O tamanho da linha é decidido pela quantidade de espécies, não pelo
 * dispositivo: até `MAX_POR_LINHA_UNICA` (5) cabem numa linha só — o melhor
 * aproveitamento de espaço quando todas cabem lado a lado. Acima disso, a
 * grade quebra em linhas de 3 (assim 6 vira [3, 3], uma eventual 7ª espécie
 * viraria [3, 3, 1]), sem exigir nenhum ajuste aqui ou no CSS.
 */

const MAX_POR_LINHA_UNICA = 5;
const CARTOES_POR_LINHA = 3;

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
  grade.classList.toggle("selecao-especie__grade--linha-unica", especies.length <= MAX_POR_LINHA_UNICA);
  let posicao = 0;
  const tamanhoLinha = especies.length <= MAX_POR_LINHA_UNICA ? especies.length : CARTOES_POR_LINHA;
  for (const linhaEspecies of agruparEmLinhas(embaralhar(especies), tamanhoLinha)) {
    const linha = document.createElement("div");
    linha.className = "selecao-especie__linha";
    for (const especie of linhaEspecies) {
      posicao++;
      const cartao = criarCartaoEscolhaEspecie({
        especie,
        rotulo: `Espécime ${posicao}`,
        aoClicar: () => irPara("introducaoMissao", { ...dados, especieEscolhidaId: especie.id }),
      });
      linha.appendChild(cartao);
    }
    grade.appendChild(linha);
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

/** Divide uma lista em sublistas de até `tamanho` itens, na ordem original. */
function agruparEmLinhas(lista, tamanho) {
  const linhas = [];
  for (let i = 0; i < lista.length; i += tamanho) {
    linhas.push(lista.slice(i, i + tamanho));
  }
  return linhas;
}
