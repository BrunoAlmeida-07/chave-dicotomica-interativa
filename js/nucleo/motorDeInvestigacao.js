/**
 * motorDeInvestigacao.js
 *
 * Controlador puro da navegação pela árvore de perguntas da chave
 * dicotômica. Não toca no DOM e não importa database.js diretamente — recebe
 * a função de busca de pergunta por injeção (`buscarPergunta`), o que
 * permite testar a lógica de navegação isoladamente, passando uma função
 * falsa no lugar do acesso real aos dados.
 *
 * Mantém uma pilha interna com as perguntas percorridas na investigação
 * atual (da raiz até a pergunta corrente), para permitir voltar uma etapa
 * sem depender do histórico do navegador nem da navegação entre telas
 * (navegacao.js) — são mecanismos independentes, com propósitos diferentes:
 * este é o histórico *dentro* de uma investigação; o outro é o histórico
 * *entre telas* da aplicação.
 *
 * Nenhuma pergunta, resposta ou destino fica fixo aqui: tudo vem dos campos
 * opcaoSim/opcaoNao de cada Pergunta carregada.
 */

/**
 * @param {(id: string) => Promise<object|null>} buscarPergunta
 */
export function criarMotorDeInvestigacao(buscarPergunta) {
  /** Perguntas já percorridas na investigação atual, da raiz até a atual. */
  let pilha = [];

  /**
   * Inicia (ou reinicia) uma investigação a partir de uma pergunta,
   * substituindo qualquer pilha de uma investigação anterior.
   *
   * @param {string} perguntaInicialId
   * @returns {Promise<object|null>}
   */
  async function iniciar(perguntaInicialId) {
    const pergunta = await buscarPergunta(perguntaInicialId);
    pilha = pergunta ? [pergunta] : [];
    return pergunta;
  }

  /**
   * Avança a investigação a partir da resposta dada à pergunta atual (o
   * topo da pilha). Se levar a outra pergunta, ela é empilhada; se levar a
   * uma espécie, a investigação termina ali.
   *
   * @param {"sim"|"nao"} resposta
   * @returns {Promise<
   *   { tipo: "pergunta", pergunta: object|null } |
   *   { tipo: "especie", especieId: string }
   * >}
   * @throws {Error} Se não houver uma pergunta atual (iniciar() não foi chamado, ou falhou).
   */
  async function responder(resposta) {
    const perguntaAtual = pilha[pilha.length - 1];
    if (!perguntaAtual) {
      throw new Error("Não há uma pergunta atual para responder.");
    }

    const opcao = resposta === "sim" ? perguntaAtual.opcaoSim : perguntaAtual.opcaoNao;

    if (opcao.tipo === "especie") {
      return { tipo: "especie", especieId: opcao.destinoId };
    }

    if (opcao.tipo === "pergunta") {
      const proxima = await buscarPergunta(opcao.destinoId);
      if (proxima) {
        pilha.push(proxima);
      }
      return { tipo: "pergunta", pergunta: proxima };
    }

    throw new Error(`Tipo de opção desconhecido: "${opcao.tipo}"`);
  }

  /**
   * Volta uma etapa na pilha de perguntas já percorridas nesta investigação.
   * Ao responder de novo a partir daqui, `responder` empilha o novo caminho
   * a partir deste ponto normalmente — o restante do caminho antigo (se
   * havia um) é descartado.
   *
   * @returns {object|null} A pergunta anterior, ou `null` se já está na primeira pergunta.
   */
  function voltarUmaEtapa() {
    if (pilha.length <= 1) {
      return null;
    }
    pilha.pop();
    return pilha[pilha.length - 1];
  }

  /** @returns {boolean} Se há uma etapa anterior na investigação atual para voltar. */
  function podeVoltar() {
    return pilha.length > 1;
  }

  /** @returns {number} Profundidade atual na árvore (1 = primeira pergunta). */
  function profundidadeAtual() {
    return pilha.length;
  }

  return { iniciar, responder, voltarUmaEtapa, podeVoltar, profundidadeAtual };
}
