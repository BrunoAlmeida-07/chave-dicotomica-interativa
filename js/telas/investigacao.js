/**
 * investigacao.js
 *
 * Investigação: conduz o jogador pela chave dicotômica até chegar a uma
 * espécie. Esta tela só renderiza e responde a cliques — a navegação pela
 * árvore de perguntas e o histórico da sessão atual (para "Pergunta
 * anterior") ficam inteiramente em nucleo/motorDeInvestigacao.js. Nenhuma
 * pergunta é fixa no código; tudo vem de perguntas.json via database.js.
 *
 * Dois botões de retorno, com propósitos diferentes que coexistem:
 *   - "Pergunta anterior": volta uma etapa dentro da árvore
 *     (motor.voltarUmaEtapa), sem sair da tela e sem tocar no histórico do
 *     navegador nem no de navegacao.js.
 *   - "Voltar": sai da tela via navegacao.js (voltar(), baseado no
 *     histórico) — leva para a Seleção de Espécime, de onde esta tela
 *     normalmente é alcançada.
 *
 * Recebe em `dados.perguntaInicialId` o ponto de partida na árvore,
 * resolvido pela tela de Introdução da Missão. `dados.especieEscolhidaId`,
 * resolvido pela tela de Seleção de Espécime, define qual espécie o jogador
 * está realmente investigando nesta sessão — estado efêmero, nunca gravado
 * em `missoes.json`. `dados.missaoId` é usado só para exibir o nome da
 * missão no cabeçalho — não afeta a navegação da árvore, que continua
 * inteiramente determinada pelas respostas reais do jogador.
 *
 * A fotografia do espécime (`imagemPrincipal`, fixa durante toda a
 * investigação) vem da espécie escolhida — é só um dado extra passado ao
 * cartão, o Motor de Investigação não sabe que ela existe.
 *
 * Ao chegar numa folha da árvore, esta tela compara o resultado real do
 * Motor (`resultado.especieId`) com `especieEscolhidaId` — a validação de
 * acerto/erro acontece só aqui, uma camada acima do Motor, que continua
 * sem nenhum conceito de "certo"/"errado".
 */

import { irPara, voltar } from "../navegacao.js";
import { obterPerguntaPorId, obterEspeciePorId } from "../../database/scripts/database.js";
import { obterMissao } from "../nucleo/missoes.js";
import { criarMotorDeInvestigacao } from "../nucleo/motorDeInvestigacao.js";
import { criarCartaoPergunta } from "../componentes/cartaoPergunta.js";
import { criarIcone } from "../componentes/icone.js";
import { resolverCaminhoImagem } from "../utils/assets.js";

const motor = criarMotorDeInvestigacao(obterPerguntaPorId);

export async function renderInvestigacao(container, dados = {}) {
  const { perguntaInicialId, missaoId, especieEscolhidaId } = dados;

  const missao = missaoId ? await obterMissao({ missaoId }) : null;
  const imagemPrincipal = await resolverImagemPrincipal(especieEscolhidaId);

  container.innerHTML = `
    <section class="tela tela-investigacao">
      <header class="investigacao-cabecalho">
        <div class="investigacao-cabecalho__navegacao">
          <button type="button" class="botao botao-fantasma" data-acao="voltar">
            <span class="icone">${criarIcone("voltar")}</span> Voltar
          </button>
        </div>
        <div class="investigacao-cabecalho__titulo">
          <span class="etiqueta">Investigação</span>
          <h1>${missao ? missao.titulo : "Investigação"}</h1>
        </div>
      </header>
      <div data-conteudo-pergunta class="investigacao-corpo"></div>
      <div class="investigacao-rodape">
        <button type="button" class="botao botao-fantasma" data-acao="pergunta-anterior" hidden>
          <span class="icone">${criarIcone("retroceder")}</span> Pergunta anterior
        </button>
      </div>
    </section>
  `;

  container.querySelector('[data-acao="voltar"]').addEventListener("click", voltar);

  const botaoAnterior = container.querySelector('[data-acao="pergunta-anterior"]');
  botaoAnterior.addEventListener("click", () => {
    const perguntaAnterior = motor.voltarUmaEtapa();
    if (perguntaAnterior) {
      desenharPergunta(perguntaAnterior);
    }
  });

  const areaPergunta = container.querySelector("[data-conteudo-pergunta]");

  if (!perguntaInicialId) {
    areaPergunta.innerHTML = '<p class="mensagem-vazia">Nenhuma investigação disponível para este caso ainda.</p>';
    return;
  }

  areaPergunta.innerHTML = '<p class="mensagem-carregando">Carregando pergunta...</p>';
  const primeiraPergunta = await motor.iniciar(perguntaInicialId);
  desenharPergunta(primeiraPergunta);

  function desenharPergunta(pergunta) {
    areaPergunta.innerHTML = "";

    if (!pergunta) {
      areaPergunta.innerHTML = '<p class="mensagem-vazia">Não foi possível carregar esta pergunta.</p>';
      return;
    }

    botaoAnterior.hidden = !motor.podeVoltar();

    const cartao = criarCartaoPergunta({
      texto: pergunta.texto,
      imagem: pergunta.imagem ? resolverCaminhoImagem(pergunta.imagem) : "",
      imagemPrincipal,
      etapa: `Pergunta ${motor.profundidadeAtual()}`,
      aoResponderSim: () => responder("sim"),
      aoResponderNao: () => responder("nao"),
    });
    areaPergunta.appendChild(cartao);
  }

  async function responder(resposta) {
    areaPergunta.innerHTML = '<p class="mensagem-carregando">Carregando...</p>';
    const resultado = await motor.responder(resposta);

    if (resultado.tipo === "especie") {
      const identificacaoCorreta = resultado.especieId === especieEscolhidaId;
      irPara("resultado", {
        ...dados,
        especieIdentificada: resultado.especieId,
        identificacaoCorreta,
      });
      return;
    }

    desenharPergunta(resultado.pergunta);
  }
}

/**
 * Resolve a fotografia do espécime investigado nesta sessão: busca a
 * espécie escolhida pelo jogador na tela de Seleção de Espécime e usa sua
 * imagem principal (`imagens[].principal`). Retorna "" (sem imagem
 * principal) se por algum motivo a tela for aberta sem uma escolha prévia
 * — a investigação continua funcionando normalmente, só sem a segunda
 * imagem.
 *
 * @param {string|undefined} especieEscolhidaId
 * @returns {Promise<string>}
 */
async function resolverImagemPrincipal(especieEscolhidaId) {
  if (!especieEscolhidaId) {
    return "";
  }

  const especie = await obterEspeciePorId(especieEscolhidaId);
  const imagens = especie?.imagens ?? [];
  const imagemPrincipal = imagens.find((imagem) => imagem.principal) ?? imagens[0];

  return imagemPrincipal ? resolverCaminhoImagem(imagemPrincipal.src) : "";
}
