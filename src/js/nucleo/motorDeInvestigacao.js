/**
 * motorDeInvestigacao.js
 *
 * Controlador puro da navegação pela árvore de perguntas da chave
 * dicotômica. Não toca no DOM e não importa database.js diretamente — recebe
 * a função de busca de pergunta por injeção (`buscarPergunta`), o que
 * permite testar a lógica de navegação isoladamente, passando uma função
 * falsa no lugar do acesso real aos dados.
 *
 * Nenhuma pergunta, resposta ou destino fica fixo aqui: tudo vem dos campos
 * opcaoSim/opcaoNao de cada Pergunta carregada.
 */

/**
 * @param {(id: string) => Promise<object|null>} buscarPergunta
 */
export function criarMotorDeInvestigacao(buscarPergunta) {
  /**
   * Carrega a pergunta inicial da investigação.
   * @param {string} perguntaInicialId
   * @returns {Promise<object|null>}
   */
  function iniciar(perguntaInicialId) {
    return buscarPergunta(perguntaInicialId);
  }

  /**
   * Avança a investigação a partir da resposta dada a uma pergunta.
   *
   * @param {object} pergunta - A pergunta respondida.
   * @param {"sim"|"nao"} resposta
   * @returns {Promise<
   *   { tipo: "pergunta", pergunta: object|null } |
   *   { tipo: "especie", especieId: string }
   * >}
   */
  async function responder(pergunta, resposta) {
    const opcao = resposta === "sim" ? pergunta.opcaoSim : pergunta.opcaoNao;

    if (opcao.tipo === "especie") {
      return { tipo: "especie", especieId: opcao.destinoId };
    }

    if (opcao.tipo === "pergunta") {
      const proxima = await buscarPergunta(opcao.destinoId);
      return { tipo: "pergunta", pergunta: proxima };
    }

    throw new Error(`Tipo de opção desconhecido: "${opcao.tipo}"`);
  }

  return { iniciar, responder };
}
