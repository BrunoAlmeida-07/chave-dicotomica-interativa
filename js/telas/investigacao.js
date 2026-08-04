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
 *   - "Voltar à introdução": sai da tela e volta para a Introdução da
 *     Missão via navegacao.js (voltar()) — comportamento já existente,
 *     inalterado.
 *
 * Recebe em `dados.perguntaInicialId` o ponto de partida na árvore,
 * resolvido pela tela anterior (introducaoMissao.js). `dados.missaoId`,
 * quando presente, é usado para exibir o nome da missão no cabeçalho e para
 * resolver a fotografia do espécime (`missao.especieRespostaCorreta` +
 * `missao.imagemPrincipalIndice`) — não afeta a navegação da árvore, que
 * continua inteiramente determinada pelas respostas reais do jogador.
 *
 * A fotografia do espécime (`imagemPrincipal`, fixa durante toda a
 * investigação) é só um dado extra passado ao cartão — o Motor de
 * Investigação não sabe que ela existe.
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
  const { perguntaInicialId, missaoId } = dados;

  const missao = missaoId ? await obterMissao({ missaoId }) : null;
  const imagemPrincipal = await resolverImagemPrincipal(missao);

  container.innerHTML = `
    <section class="tela tela-investigacao">
      <header class="investigacao-cabecalho">
        <div class="investigacao-cabecalho__navegacao">
          <button type="button" class="botao botao-fantasma" data-acao="voltar">
            <span class="icone">${criarIcone("voltar")}</span> Voltar à introdução
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
      irPara("resultado", { ...dados, especieId: resultado.especieId });
      return;
    }

    desenharPergunta(resultado.pergunta);
  }
}

/**
 * Resolve a fotografia do espécime investigado nesta missão: busca a
 * espécie-alvo (`missao.especieRespostaCorreta`) e usa `imagemPrincipalIndice`
 * para escolher qual das fotos de `especie.imagens` representa este caso.
 * Retorna "" (sem imagem principal) para missões sem espécie-alvo definida
 * (ex.: a Missão de Treinamento) — a tela continua funcionando normalmente,
 * só sem a segunda imagem.
 *
 * @param {object|null} missao
 * @returns {Promise<string>}
 */
async function resolverImagemPrincipal(missao) {
  if (!missao?.especieRespostaCorreta) {
    return "";
  }

  const especie = await obterEspeciePorId(missao.especieRespostaCorreta);
  const imagens = especie?.imagens ?? [];
  const imagem = imagens[missao.imagemPrincipalIndice ?? 0];

  return imagem ? resolverCaminhoImagem(imagem.src) : "";
}
