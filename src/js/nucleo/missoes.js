/**
 * missoes.js
 *
 * Camada de missões: ponto único que a interface usa para listar e obter
 * missões, já com o `status` de cada uma calculado (disponível / bloqueada /
 * concluída).
 *
 * `status` não é um campo de `missoes.json` (ver database/schema.md, seção
 * 6) — é calculado aqui a partir de `ordemProgressao`/`sempreDisponivel`
 * (conteúdo) cruzados com o progresso do jogador, que ainda não existe como
 * camada de dados (ver schema.md, seção 9). Enquanto isso, a regra é
 * temporária e fica isolada nesta função: nenhuma outra parte da interface
 * decide status de missão.
 */

import { listarMissoes as listarMissoesDoBanco, obterMissaoPorId } from "../../../database/scripts/database.js";

export const STATUS_DISPONIVEL = "disponivel";
export const STATUS_BLOQUEADA = "bloqueada";
export const STATUS_CONCLUIDA = "concluida";

/**
 * Lista todas as missões, na ordem de progressão, cada uma com seu `status` calculado.
 * @returns {Promise<object[]>}
 */
export async function listarMissoes() {
  const missoes = await listarMissoesDoBanco();
  return missoes.map((missao, indice) => ({
    ...missao,
    status: calcularStatus(missao, indice),
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
 * Regra temporária de status, sem camada de progresso do jogador ainda:
 * a missão marcada como `sempreDisponivel` (ex.: Missão 0) ou a primeira da
 * trilha fica disponível; as demais ficam bloqueadas. "Concluída" nunca é
 * retornado nesta etapa. Quando o progresso do jogador existir, só esta
 * função muda — quem a chama continua recebendo `status` pronto.
 */
function calcularStatus(missao, indice) {
  if (missao.sempreDisponivel || indice === 0) {
    return STATUS_DISPONIVEL;
  }
  return STATUS_BLOQUEADA;
}
