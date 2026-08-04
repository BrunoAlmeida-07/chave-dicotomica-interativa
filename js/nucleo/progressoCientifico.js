/**
 * progressoCientifico.js
 *
 * Camada de progresso científico do jogador, para o Laboratório do
 * Pesquisador. Usa `listarMissoes()` de `missoes.js` (mesmo módulo que já
 * calcula o `status` de cada missão para o Mapa de Missões) e consulta
 * `progressoMissoes` diretamente só para saber se a Missão de Treinamento
 * (`missao-0`) foi concluída, já que ela não aparece em `listarMissoes()`
 * (não é visível no Mapa de Missões).
 *
 * "Espécies catalogadas" vem da store `especiesDescobertas` — um registro
 * por espécie individual realmente identificada ao final de uma
 * investigação (ver `registrarDescoberta`, chamada pela tela de
 * Encerramento). Antes disso, o Catálogo aproximava "descoberta" por grupo
 * inteiro assim que a missão do grupo era concluída; essa aproximação foi
 * removida (ver database/schema.md, seção 9).
 */

import { listarMissoes } from "./missoes.js";
import { listarGrupos, listarEspecies, listarConquistas } from "../../database/scripts/database.js";
import { lerProgressoMissoes, lerEspeciesDescobertas, salvarEspecieDescoberta } from "../../database/scripts/indexeddb.js";

const ID_MISSAO_TREINAMENTO = "missao-0";

/**
 * Registra que o jogador identificou uma espécie ao final de uma
 * investigação. Gravar a mesma espécie de novo (missão revisitada) só
 * sobrescreve o mesmo registro — nunca duplica (a store é keyPath por
 * `especieId`).
 *
 * @param {string} especieId
 * @returns {Promise<void>}
 */
export async function registrarDescoberta(especieId) {
  if (!especieId) {
    return;
  }
  await salvarEspecieDescoberta({ especieId, descobertaEm: new Date().toISOString() });
}

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
  const [missoesCampanha, grupos, especies, conquistasDefinidas, registrosProgresso, registrosDescobertas] =
    await Promise.all([
      listarMissoes(),
      listarGrupos(),
      listarEspecies(),
      listarConquistas(),
      lerProgressoMissoes(),
      lerEspeciesDescobertas(),
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

  const idsEspeciesValidos = new Set(especies.map((especie) => especie.id));
  const especiesCatalogadas = new Set(
    registrosDescobertas.map((registro) => registro.especieId).filter((id) => idsEspeciesValidos.has(id))
  );

  const contexto = { treinamentoConcluido, totalGruposConcluidos, gruposConcluidosIds, especiesCatalogadas };
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
 * (database/schema.md, seção 7) e do progresso já calculado. Tipos
 * avaliados: `"completar_missoes_fase"` (interpretado como "concluiu ao
 * menos uma missão, de qualquer tipo — Treinamento ou de grupo", único caso
 * do conteúdo atual), `"completar_grupo"` e `"identificar_especie"` (mesmo
 * padrão de `completar_grupo`: `referenciaId` verifica uma espécie
 * específica, ausência de `referenciaId` verifica uma quantidade). Nenhuma
 * conquista atual usa `"identificar_especie"` nem `"sequencia_acertos"`
 * (ver nota na seção 7 do schema) — o primeiro já é avaliável aqui, pronto
 * para quando/se uma conquista desse tipo for criada em conquistas.json.
 *
 * @param {object} conquista
 * @param {{
 *   treinamentoConcluido: boolean,
 *   totalGruposConcluidos: number,
 *   gruposConcluidosIds: Set<string>,
 *   especiesCatalogadas: Set<string>,
 * }} contexto
 */
function avaliarConquista(
  conquista,
  { treinamentoConcluido, totalGruposConcluidos, gruposConcluidosIds, especiesCatalogadas }
) {
  const { tipo, referenciaId, quantidade } = conquista.criterio;
  let desbloqueada = false;

  if (tipo === "completar_missoes_fase") {
    desbloqueada = treinamentoConcluido || totalGruposConcluidos >= 1;
  } else if (tipo === "completar_grupo") {
    desbloqueada = referenciaId ? gruposConcluidosIds.has(referenciaId) : totalGruposConcluidos >= (quantidade ?? 1);
  } else if (tipo === "identificar_especie") {
    desbloqueada = referenciaId ? especiesCatalogadas.has(referenciaId) : especiesCatalogadas.size >= (quantidade ?? 1);
  }

  return {
    id: conquista.id,
    nome: conquista.nome,
    descricao: conquista.descricao,
    icone: conquista.icone,
    desbloqueada,
  };
}
