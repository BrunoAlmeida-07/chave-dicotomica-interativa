/**
 * encerramento.js
 *
 * Encerramento: fecha formalmente o caso. Placeholder visualmente —
 * recompensas (XP, conquistas) ficam para quando esses sistemas existirem —
 * mas é o único ponto da interface que sabe "o jogador terminou este caso",
 * então é aqui que a conclusão da missão é registrada na camada de missões.
 * As duas saídas são sempre para a frente (Mapa de Missões ou Tela Inicial),
 * nunca de volta para dentro da missão concluída.
 */

import { irPara } from "../navegacao.js";
import { criarIcone } from "../componentes/icone.js";
import { concluirMissao } from "../nucleo/missoes.js";

export function renderEncerramento(container, dados = {}) {
  container.innerHTML = `
    <section class="tela tela-encerramento">
      <div class="encerramento-cartao">
        <div class="banner-conquista banner-conquista--encerramento">
          <span class="icone banner-conquista__icone">${criarIcone("medalha")}</span>
          <div class="banner-conquista__texto">
            <strong class="banner-conquista__titulo">Missão concluída</strong>
            <span class="banner-conquista__subtitulo">Caso encerrado com sucesso.</span>
          </div>
        </div>
        <p>Resumo da missão (em construção).</p>
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
}
