/**
 * missoes.js
 *
 * Camada intermediária entre as telas e a origem real do conteúdo de uma
 * missão. `missoes.json` ainda não tem conteúdo (é um scaffold vazio — ver
 * database/schema.md), então, por enquanto, cada "missão" é sintetizada a
 * partir de um grupo zoológico já existente na Base de Conhecimento.
 *
 * Quando missoes.json for populado e database.js ganhar uma função de
 * consulta própria (ex.: obterMissaoPorId), só a implementação de
 * `obterMissao` muda aqui dentro — quem a chama (introducaoMissao.js)
 * continua igual, sem precisar conhecer "grupo" nem "missão real".
 */

import { obterGrupoPorId } from "../../../database/scripts/database.js";

/**
 * Resolve os dados mínimos de uma missão a partir do que foi passado pela
 * navegação.
 *
 * @param {{ grupoId?: string, missaoId?: string }} referencia
 * @returns {Promise<{ titulo: string, perguntaInicialId: string|null } | null>}
 */
export async function obterMissao({ grupoId, missaoId } = {}) {
  if (grupoId) {
    return obterMissaoAPartirDeGrupo(grupoId);
  }

  // missaoId ainda não tem fonte de dados real: missoes.json está vazio.
  return null;
}

async function obterMissaoAPartirDeGrupo(grupoId) {
  const grupo = await obterGrupoPorId(grupoId);
  if (!grupo) {
    return null;
  }

  return {
    titulo: grupo.nome,
    perguntaInicialId: grupo.perguntaInicialId,
  };
}
