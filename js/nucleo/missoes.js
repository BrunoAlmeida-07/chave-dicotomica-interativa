/**
 * missoes.js
 *
 * Camada de missões: ponto único que a interface usa para listar e obter
 * missões (já com o `status` de cada uma calculado) e para registrar quando
 * uma missão é concluída.
 *
 * Duas fontes de dados, com propósitos diferentes:
 *   - `database.js` (Base de Conhecimento): definição das missões (id,
 *     título, `preRequisito`, `perguntaInicialId`...), vinda de
 *     missoes.json. Conteúdo — igual para qualquer jogador.
 *   - `indexeddb.js`, importado diretamente (sem passar por `database.js`):
 *     a store `progressoMissoes`, com quais missões este jogador já
 *     concluiu. Progresso — não vem de JSON, não participa do fluxo de
 *     cache/import da Base de Conhecimento (ver database/schema.md, seção 9).
 *
 * `status` continua não sendo um campo armazenado em lugar nenhum — é
 * calculado aqui, cruzando as duas fontes acima com o campo `preRequisito`
 * de cada missão. Nenhuma regra fixa sobre qual missão depende de qual:
 * tudo vem do dado.
 *
 * `listarMissoes()` só devolve missões com `visivelNoMapaDeMissoes !== false`
 * — permite que uma missão futura fique de fora do Mapa de Missões sem
 * precisar de nenhuma regra específica no código, só o dado. Nenhuma missão
 * usa isso hoje (o antigo tutorial jogável, Missão 0, foi substituído pela
 * tela estática "Como Jogar" — ver js/telas/comoJogar.js).
 */

import { listarMissoes as listarMissoesDoBanco, obterMissaoPorId } from "../../database/scripts/database.js";
import { salvarProgressoMissao, lerProgressoMissoes } from "../../database/scripts/indexeddb.js";

export const STATUS_DISPONIVEL = "disponivel";
export const STATUS_BLOQUEADA = "bloqueada";
export const STATUS_CONCLUIDA = "concluida";

/**
 * Lista as missões visíveis no Mapa de Missões (`visivelNoMapaDeMissoes !==
 * false`), na ordem de progressão, cada uma com seu `status` calculado.
 * Uma missão marcada como não visível continuaria acessível por id via
 * `obterMissao`, só não entraria nesta listagem — nenhuma missão usa isso
 * hoje.
 *
 * @returns {Promise<object[]>}
 */
export async function listarMissoes() {
  const [missoes, idsConcluidas] = await Promise.all([listarMissoesDoBanco(), obterIdsConcluidas()]);

  return missoes
    .filter((missao) => missao.visivelNoMapaDeMissoes !== false)
    .map((missao) => ({
      ...missao,
      status: calcularStatus(missao, idsConcluidas),
    }));
}

/**
 * Obtém uma missão pelo id informado em `dados.missaoId`.
 *
 * @param {{ missaoId?: string }} referencia
 * @returns {Promise<object|null>}
 */
export async function obterMissao({ missaoId } = {}) {
  if (!missaoId) {
    return null;
  }
  return obterMissaoPorId(missaoId);
}

/**
 * Registra que o jogador concluiu uma missão. Idempotente: concluir a mesma
 * missão de novo só atualiza a data de conclusão, não duplica registro.
 *
 * @param {string} missaoId
 * @returns {Promise<void>}
 */
export async function concluirMissao(missaoId) {
  if (!missaoId) {
    return;
  }
  await salvarProgressoMissao({ missaoId, concluidaEm: new Date().toISOString() });
}

/**
 * @returns {Promise<Set<string>>} ids das missões já concluídas pelo jogador.
 */
async function obterIdsConcluidas() {
  const registros = await lerProgressoMissoes();
  return new Set(registros.map((registro) => registro.missaoId));
}

/**
 * Calcula o status de uma missão a partir do progresso do jogador e do
 * campo `preRequisito` da própria missão (dado, não regra fixa no código):
 *
 *   1. `sempreDisponivel: true` sempre vence — a missão nunca fica
 *      bloqueada nem "some" atrás do rótulo concluída, mesmo depois de
 *      concluída. Nenhuma missão usa isso hoje.
 *   2. Se já foi concluída, o status é "concluida".
 *   3. Sem `preRequisito`, a missão começa disponível.
 *   4. Com `preRequisito`, só fica disponível quando a missão referenciada
 *      estiver entre as concluídas; senão, fica bloqueada.
 *
 * @param {object} missao
 * @param {Set<string>} idsConcluidas
 * @returns {"disponivel"|"bloqueada"|"concluida"}
 */
function calcularStatus(missao, idsConcluidas) {
  if (missao.sempreDisponivel) {
    return STATUS_DISPONIVEL;
  }

  if (idsConcluidas.has(missao.id)) {
    return STATUS_CONCLUIDA;
  }

  if (!missao.preRequisito) {
    return STATUS_DISPONIVEL;
  }

  return idsConcluidas.has(missao.preRequisito) ? STATUS_DISPONIVEL : STATUS_BLOQUEADA;
}
