/**
 * resultado.js
 *
 * Resultado: mostra o desfecho da investigação. Dois caminhos, decididos por
 * `dados.identificacaoCorreta` (calculado em investigacao.js, comparando o
 * resultado real do Motor com a espécie escolhida na Seleção de Espécime):
 *
 *   - Correto: banner de sucesso, Ficha Científica da espécie identificada
 *     e, logo abaixo dela, a mensagem pedagógica curta da missão
 *     (`missao.feedbackSucesso`, quando existir — texto curado por caso, não
 *     por espécie, já que a espécie é sorteada na Seleção de Espécime).
 *     Vem DEPOIS da ficha, não antes: nas telas mais baixas suportadas, o
 *     painel da ficha já usa praticamente todo o espaço vertical
 *     disponível — colocar o texto antes o empurraria para fora da tela.
 *     Depois dela, na pior das hipóteses só o próprio texto (curto) e os
 *     botões abaixo pedem uma pequena rolagem, nunca a ficha em si. Botão
 *     "Encerrar missão" grava progresso.
 *   - Incorreto: mensagem de revisão, sem revelar a espécie correta de
 *     imediato. "Tentar novamente" reinicia a investigação com a mesma
 *     espécie escolhida; "Visualizar a resposta correta" revela, só sob
 *     demanda, a Ficha Científica da espécie que deveria ter sido
 *     identificada — o nome já aparece com destaque no próprio painel da
 *     ficha, e o card "Aparência" (sempre o primeiro) já traz as
 *     características decisivas, então não há texto duplicado aqui.
 *     Nenhum dos dois botões desse caminho grava progresso — só
 *     "Encerrar missão" (caminho correto) chega a `encerramento.js`.
 *
 * "Tentar novamente" usa `voltar()`, não `irPara()`: a tela de Resultado
 * (revisão) nunca chega a ser empilhada no histórico por essa ação — o
 * histórico, ao entrar na Investigação que terminou errada, já tem no topo
 * a própria Investigação com os dados originais (perguntaInicialId,
 * missaoId, especieEscolhidaId intactos), então "voltar" a partir daí a
 * reinicia do zero. Isso também é o que garante que, dentro da nova
 * tentativa, o botão "Voltar" da Investigação leve para a tela anterior de
 * verdade (Introdução da Missão) e não de volta para "Identificação não
 * confirmada" — ela deixa de existir no histórico depois desse clique.
 *
 * "Voltar às missões" leva direto ao Mapa de Missões (não ao histórico de
 * navegação): depois de concluída (ou revisada), voltar para dentro da
 * investigação não faz sentido — faz mais sentido escolher outro caso.
 */

import { irPara, voltar } from "../navegacao.js";
import { obterEspeciePorId } from "../../database/scripts/database.js";
import { obterMissao } from "../nucleo/missoes.js";
import { criarIcone } from "../componentes/icone.js";
import { criarFichaCientifica } from "../componentes/fichaCientifica.js";

export async function renderResultado(container, dados = {}) {
  if (dados.identificacaoCorreta === false) {
    renderRevisao(container, dados);
    return;
  }

  container.innerHTML = `
    <section class="tela tela-resultado">
      <div class="banner-conquista banner-conquista--resultado">
        <span class="icone banner-conquista__icone">${criarIcone("check")}</span>
        <strong class="banner-conquista__titulo">Investigação concluída</strong>
      </div>
      <div data-conteudo-resultado class="resultado-corpo">
        <p class="mensagem-carregando">Carregando resultado...</p>
      </div>
      <div class="resultado-acoes">
        <button type="button" class="botao botao-primario" data-acao="avancar">Encerrar missão</button>
        <button type="button" class="botao botao-fantasma" data-acao="voltar">Voltar às missões</button>
      </div>
    </section>
  `;

  container.querySelector('[data-acao="voltar"]').addEventListener("click", () => {
    irPara("mapaMissoes");
  });
  container.querySelector('[data-acao="avancar"]').addEventListener("click", () => {
    irPara("encerramento", { ...dados, especieId: dados.especieIdentificada });
  });

  const areaResultado = container.querySelector("[data-conteudo-resultado]");

  if (!dados.especieIdentificada) {
    areaResultado.innerHTML = '<p class="mensagem-vazia">Nenhuma identificação foi realizada.</p>';
    return;
  }

  const [especie, missao] = await Promise.all([obterEspeciePorId(dados.especieIdentificada), obterMissao(dados)]);
  if (!especie) {
    areaResultado.innerHTML = '<p class="mensagem-vazia">Não foi possível carregar o resultado.</p>';
    return;
  }

  areaResultado.innerHTML = "";
  areaResultado.appendChild(await criarFichaCientifica(especie, { mostrarRegistro: false }));
  if (missao?.feedbackSucesso) {
    const feedback = document.createElement("p");
    feedback.className = "resultado-feedback";
    feedback.textContent = missao.feedbackSucesso;
    areaResultado.appendChild(feedback);
  }
}

/**
 * Caminho de identificação incorreta: mensagem de revisão + "Tentar
 * novamente" / "Visualizar a resposta correta". A revelação (espécie
 * correta + características decisivas + Ficha Científica) só é buscada e
 * montada quando o botão é clicado — nunca antes.
 */
function renderRevisao(container, dados) {
  container.innerHTML = `
    <section class="tela tela-resultado">
      <div class="banner-conquista banner-conquista--revisao">
        <span class="icone banner-conquista__icone">${criarIcone("alerta")}</span>
        <strong class="banner-conquista__titulo">Identificação não confirmada</strong>
      </div>
      <div class="resultado-corpo" data-corpo>
        <p class="mensagem-revisao">
          A identificação realizada não corresponde ao espécime investigado. Revise as características
          observadas e tente novamente.
        </p>
        <div class="resultado-acoes">
          <button type="button" class="botao botao-primario" data-acao="tentar-novamente">Tentar novamente</button>
          <button type="button" class="botao botao-fantasma" data-acao="ver-resposta">Visualizar a resposta correta</button>
        </div>
      </div>
    </section>
  `;

  container.querySelector('[data-acao="tentar-novamente"]').addEventListener("click", voltar);

  container.querySelector('[data-acao="ver-resposta"]').addEventListener("click", async (evento) => {
    const botao = evento.currentTarget;
    botao.disabled = true;

    const especie = dados.especieEscolhidaId ? await obterEspeciePorId(dados.especieEscolhidaId) : null;
    const corpo = container.querySelector("[data-corpo]");

    if (!especie) {
      corpo.innerHTML = '<p class="mensagem-vazia">Não foi possível carregar a resposta correta.</p>';
      return;
    }

    corpo.innerHTML = `
      <div data-conteudo-ficha></div>
      <div class="resultado-acoes">
        <button type="button" class="botao botao-primario" data-acao="tentar-novamente-2">Tentar novamente</button>
        <button type="button" class="botao botao-fantasma" data-acao="voltar-mapa">Voltar às missões</button>
      </div>
    `;

    corpo.querySelector('[data-acao="tentar-novamente-2"]').addEventListener("click", voltar);
    corpo.querySelector('[data-acao="voltar-mapa"]').addEventListener("click", () => {
      irPara("mapaMissoes");
    });

    corpo.querySelector("[data-conteudo-ficha]").appendChild(await criarFichaCientifica(especie, { mostrarRegistro: false }));
  });
}
