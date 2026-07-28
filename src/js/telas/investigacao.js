/**
 * investigacao.js
 *
 * Investigação: conduz o jogador pela chave dicotômica até chegar a uma
 * espécie. Esta tela só renderiza e responde a cliques — a navegação pela
 * árvore de perguntas fica inteiramente em nucleo/motorDeInvestigacao.js.
 * Nenhuma pergunta é fixa no código; tudo vem de perguntas.json via
 * database.js.
 *
 * Recebe em `dados.perguntaInicialId` o ponto de partida na árvore,
 * resolvido pela tela anterior (introducaoMissao.js).
 */

import { irPara, voltar } from "../navegacao.js";
import { obterPerguntaPorId } from "../../../database/scripts/database.js";
import { criarMotorDeInvestigacao } from "../nucleo/motorDeInvestigacao.js";
import { criarCartaoPergunta } from "../componentes/cartaoPergunta.js";
import { resolverCaminhoImagem } from "../utils/assets.js";

const motor = criarMotorDeInvestigacao(obterPerguntaPorId);

export async function renderInvestigacao(container, dados = {}) {
  const { perguntaInicialId } = dados;

  container.innerHTML = `
    <section class="tela tela-investigacao">
      <h1>Investigação</h1>
      <button type="button" data-acao="voltar">Voltar</button>
      <div data-conteudo-pergunta></div>
    </section>
  `;
  container.querySelector('[data-acao="voltar"]').addEventListener("click", voltar);

  const areaPergunta = container.querySelector("[data-conteudo-pergunta]");

  if (!perguntaInicialId) {
    areaPergunta.innerHTML = "<p>Nenhuma investigação disponível para este caso ainda.</p>";
    return;
  }

  areaPergunta.innerHTML = "<p>Carregando pergunta...</p>";
  const primeiraPergunta = await motor.iniciar(perguntaInicialId);
  desenharPergunta(areaPergunta, dados, primeiraPergunta);
}

function desenharPergunta(areaPergunta, dados, pergunta) {
  areaPergunta.innerHTML = "";

  if (!pergunta) {
    areaPergunta.innerHTML = "<p>Não foi possível carregar esta pergunta.</p>";
    return;
  }

  const cartao = criarCartaoPergunta({
    texto: pergunta.texto,
    imagem: pergunta.imagem ? resolverCaminhoImagem(pergunta.imagem) : "",
    aoResponderSim: () => responder(areaPergunta, dados, pergunta, "sim"),
    aoResponderNao: () => responder(areaPergunta, dados, pergunta, "nao"),
  });
  areaPergunta.appendChild(cartao);
}

async function responder(areaPergunta, dados, pergunta, resposta) {
  areaPergunta.innerHTML = "<p>Carregando...</p>";
  const resultado = await motor.responder(pergunta, resposta);

  if (resultado.tipo === "especie") {
    irPara("resultado", { ...dados, especieId: resultado.especieId });
    return;
  }

  desenharPergunta(areaPergunta, dados, resultado.pergunta);
}
