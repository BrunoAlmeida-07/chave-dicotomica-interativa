/**
 * encerramento.js
 *
 * Encerramento: fecha formalmente o caso. É o único ponto da interface que
 * sabe "o jogador terminou este caso", então é aqui que a conclusão da
 * missão e a espécie identificada são registradas (camada de missões e
 * camada de progresso científico, respectivamente) — isso acontece de
 * imediato, sem esperar a missão carregar. As duas saídas são sempre para a
 * frente (Mapa de Missões ou Tela Inicial), nunca de volta para dentro da
 * missão concluída.
 *
 * O texto do cartão é `missao.explicacaoCientificaFinal` — mensagem curta,
 * diferente por missão, reforçando observação cuidadosa e uso da chave
 * dicotômica (não é um resumo do caso nem repete a Ficha Científica, já
 * mostrada no Resultado um passo antes). Renderizado em duas etapas, como
 * as demais telas assíncronas do app: o cartão aparece de imediato com um
 * texto neutro, substituído assim que a missão carrega — sem bloquear a
 * navegação nem deixar a tela em branco.
 */

import { irPara } from "../navegacao.js";
import { criarIcone } from "../componentes/icone.js";
import { concluirMissao, obterMissao } from "../nucleo/missoes.js";
import { registrarDescoberta } from "../nucleo/progressoCientifico.js";

export async function renderEncerramento(container, dados = {}) {
  container.innerHTML = `
    <section class="tela tela-encerramento">
      <div class="encerramento-cartao">
        <div class="banner-conquista banner-conquista--encerramento">
          <span class="icone banner-conquista__icone">${criarIcone("medalha")}</span>
          <strong class="banner-conquista__titulo">Missão concluída</strong>
        </div>
        <p data-conteudo-encerramento>Caso registrado com sucesso.</p>
      </div>
      <div class="resultado-acoes">
        <button type="button" class="botao botao-primario" data-acao="mapa-missoes">Próximo caso</button>
        <button type="button" class="botao botao-fantasma" data-acao="tela-inicial">Tela inicial</button>
      </div>
    </section>
  `;

  container.querySelector('[data-acao="mapa-missoes"]').addEventListener("click", () => {
    irPara("mapaMissoes");
  });
  container.querySelector('[data-acao="tela-inicial"]').addEventListener("click", () => {
    irPara("telaInicial");
  });

  if (dados.missaoId) {
    concluirMissao(dados.missaoId).catch((erro) => {
      console.warn("Não foi possível registrar a conclusão da missão:", erro);
    });
  }

  if (dados.especieId) {
    registrarDescoberta(dados.especieId).catch((erro) => {
      console.warn("Não foi possível registrar a espécie descoberta:", erro);
    });
  }

  const missao = await obterMissao(dados);
  if (missao?.explicacaoCientificaFinal) {
    container.querySelector("[data-conteudo-encerramento]").textContent = missao.explicacaoCientificaFinal;
  }
}
