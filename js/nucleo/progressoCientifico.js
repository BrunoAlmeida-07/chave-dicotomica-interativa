/**
 * progressoCientifico.js
 *
 * Camada de leitura do progresso científico do jogador, para o Laboratório
 * do Pesquisador. Só leitura — não grava nada, não introduz nenhuma store
 * nova de progresso. Usa `listarMissoes()` de `missoes.js` (mesmo módulo que
 * já calcula o `status` de cada missão para o Mapa de Missões) e consulta
 * `progressoMissoes` diretamente só para saber se a Missão de Treinamento
 * (`missao-0`) foi concluída, já que ela não aparece em `listarMissoes()`
 * (não é visível no Mapa de Missões).
 *
 * Limitação conhecida e deliberada (ver database/schema.md, seção 9): não
 * existe registro de qual espécie individual o jogador descobriu, então
 * "espécies catalogadas" e o Catálogo tratam todas as espécies de um grupo
 * como catalogadas assim que a missão daquele grupo é concluída.
 */

import { listarMissoes } from "./missoes.js";
import { listarGrupos, listarEspecies, listarConquistas } from "../../database/scripts/database.js";
import { lerProgressoMissoes } from "../../database/scripts/indexeddb.js";

const ID_MISSAO_TREINAMENTO = "missao-0";

/**
 * Calcula o progresso científico do jogador a partir de dados já existentes.
 *
 * @returns {Promise<{
 *   totalMissoesConcluidas: number,
 *   totalMissoesCampanha: number,
 *   grupos: Array<{ id: string, nome: string, concluido: boolean, totalEspecies: number }>,
 *   totalGruposConcluidos: number,
 *   totalGrupos: number,
 *   especiesCatalogadas: Set<string>,
 *   totalEspeciesCatalogadas: number,
 *   totalEspecies: number,
 *   conquistas: Array<{ id: string, nome: string, descricao: string, icone: string, desbloqueada: boolean }>,
 * }>}
 */
export async function obterProgressoCientifico() {
  const [missoesCampanha, grupos, especies, conquistasDefinidas, registrosProgresso] = await Promise.all([
    listarMissoes(),
    listarGrupos(),
    listarEspecies(),
    listarConquistas(),
    lerProgressoMissoes(),
  ]);

  const treinamentoConcluido = registrosProgresso.some((registro) => registro.missaoId === ID_MISSAO_TREINAMENTO);

  const grupos_ = grupos.map((grupo) => {
    const missaoDoGrupo = missoesCampanha.find((missao) => missao.grupoId === grupo.id);
    const concluido = missaoDoGrupo?.status === "concluida";
    const totalEspecies = especies.filter((especie) => especie.grupoId === grupo.id).length;
    return { id: grupo.id, nome: grupo.nome, concluido, totalEspecies };
  });

  const gruposConcluidosIds = new Set(grupos_.filter((grupo) => grupo.concluido).map((grupo) => grupo.id));
  const totalGruposConcluidos = gruposConcluidosIds.size;
  const totalMissoesConcluidas = missoesCampanha.filter((missao) => missao.status === "concluida").length;

  const especiesCatalogadas = new Set(
    especies.filter((especie) => gruposConcluidosIds.has(especie.grupoId)).map((especie) => especie.id)
  );

  const contexto = { treinamentoConcluido, totalGruposConcluidos, gruposConcluidosIds };
  const conquistas = conquistasDefinidas.map((conquista) => avaliarConquista(conquista, contexto));

  return {
    totalMissoesConcluidas,
    totalMissoesCampanha: missoesCampanha.length,
    grupos: grupos_,
    totalGruposConcluidos,
    totalGrupos: grupos.length,
    especiesCatalogadas,
    totalEspeciesCatalogadas: especiesCatalogadas.size,
    totalEspecies: especies.length,
    conquistas,
  };
}

/**
 * Avalia se uma conquista está desbloqueada, a partir do seu `criterio`
 * (database/schema.md, seção 7) e do progresso já calculado. Só os tipos
 * `"completar_missoes_fase"` (interpretado como "concluiu ao menos uma
 * missão, de qualquer tipo — Treinamento ou de grupo", único caso do
 * conteúdo atual) e `"completar_grupo"` são avaliados — nenhuma conquista
 * atual usa `"identificar_especie"` nem `"sequencia_acertos"` (ver nota na
 * seção 7 do schema).
 *
 * @param {object} conquista
 * @param {{ treinamentoConcluido: boolean, totalGruposConcluidos: number, gruposConcluidosIds: Set<string> }} contexto
 */
function avaliarConquista(conquista, { treinamentoConcluido, totalGruposConcluidos, gruposConcluidosIds }) {
  const { tipo, referenciaId, quantidade } = conquista.criterio;
  let desbloqueada = false;

  if (tipo === "completar_missoes_fase") {
    desbloqueada = treinamentoConcluido || totalGruposConcluidos >= 1;
  } else if (tipo === "completar_grupo") {
    desbloqueada = referenciaId ? gruposConcluidosIds.has(referenciaId) : totalGruposConcluidos >= (quantidade ?? 1);
  }

  return {
    id: conquista.id,
    nome: conquista.nome,
    descricao: conquista.descricao,
    icone: conquista.icone,
    desbloqueada,
  };
}
