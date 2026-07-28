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
 * resolvido pela tela anterior (introducaoMissao.js). `dados.missaoId`,
 * quando presente, é usado só para exibir o nome da missão e do grupo no
 * cabeçalho — não afeta a navegação da árvore.
 */

import { irPara, voltar } from "../navegacao.js";
import { obterPerguntaPorId, obterGrupoPorId } from "../../../database/scripts/database.js";
import { obterMissao } from "../nucleo/missoes.js";
import { criarMotorDeInvestigacao } from "../nucleo/motorDeInvestigacao.js";
import { criarCartaoPergunta } from "../componentes/cartaoPergunta.js";
import { criarIcone } from "../componentes/icone.js";
import { resolverCaminhoImagem } from "../utils/assets.js";

const motor = criarMotorDeInvestigacao(obterPerguntaPorId);

export async function renderInvestigacao(container, dados = {}) {
  const { perguntaInicialId, missaoId } = dados;

  const missao = missaoId ? await obterMissao({ missaoId }) : null;
  const grupo = missao ? await obterGrupoPorId(missao.grupoId) : null;

  container.innerHTML = `
    <section class="tela tela-investigacao">
      <header class="investigacao-cabecalho">
        <button type="button" class="botao botao-fantasma" data-acao="voltar">
          <span class="icone">${criarIcone("voltar")}</span> Voltar
        </button>
        <div class="investigacao-cabecalho__info">
          <span class="etiqueta">Investigação</span>
          <h1>${missao ? missao.titulo : "Investigação"}</h1>
          ${
            grupo
              ? `<p class="investigacao-cabecalho__grupo">
                   <span class="icone">${criarIcone("lupa")}</span> Grupo investigado: ${grupo.nome}
                 </p>`
              : ""
          }
        </div>
        <div class="investigacao-cabecalho__etapa" data-etapa hidden></div>
      </header>
      <div data-conteudo-pergunta class="investigacao-corpo"></div>
    </section>
  `;

  container.querySelector('[data-acao="voltar"]').addEventListener("click", voltar);

  const areaPergunta = container.querySelector("[data-conteudo-pergunta]");
  const areaEtapa = container.querySelector("[data-etapa]");
  let contadorPerguntas = 0;

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

    contadorPerguntas += 1;
    areaEtapa.hidden = false;
    areaEtapa.textContent = `Pergunta ${contadorPerguntas}`;

    const cartao = criarCartaoPergunta({
      texto: pergunta.texto,
      imagem: pergunta.imagem ? resolverCaminhoImagem(pergunta.imagem) : "",
      aoResponderSim: () => responder(pergunta, "sim"),
      aoResponderNao: () => responder(pergunta, "nao"),
    });
    areaPergunta.appendChild(cartao);
  }

  async function responder(pergunta, resposta) {
    areaPergunta.innerHTML = '<p class="mensagem-carregando">Carregando...</p>';
    const resultado = await motor.responder(pergunta, resposta);

    if (resultado.tipo === "especie") {
      irPara("resultado", { ...dados, especieId: resultado.especieId });
      return;
    }

    desenharPergunta(resultado.pergunta);
  }
}
