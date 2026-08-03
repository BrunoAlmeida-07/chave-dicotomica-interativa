/**
 * resultado.js
 *
 * Resultado: mostra a espécie a que a investigação levou, usando a Ficha
 * Científica reutilizável (componentes/fichaCientifica.js). Esta tela só
 * cuida do que é específico dela: a mensagem de identificação concluída e
 * os botões de ação — toda a exibição da espécie fica a cargo do componente.
 *
 * Ainda não compara com uma resposta "correta" de missão (depende de
 * missoes.json ter conteúdo narrativo real) — só confirma qual foi a
 * identificação.
 *
 * "Voltar às missões" leva direto ao Mapa de Missões (não ao histórico de
 * navegação): depois de concluída, voltar para dentro da investigação não
 * faz sentido — faz mais sentido escolher outro caso.
 */

import { irPara } from "../navegacao.js";
import { obterEspeciePorId } from "../../database/scripts/database.js";
import { criarIcone } from "../componentes/icone.js";
import { criarFichaCientifica } from "../componentes/fichaCientifica.js";

export async function renderResultado(container, dados = {}) {
  container.innerHTML = `
    <section class="tela tela-resultado">
      <div class="banner-conquista banner-conquista--resultado">
        <span class="icone banner-conquista__icone">${criarIcone("check")}</span>
        <div class="banner-conquista__texto">
          <strong class="banner-conquista__titulo">Investigação concluída</strong>
          <span class="banner-conquista__subtitulo">Espécie identificada — confira o registro científico abaixo.</span>
        </div>
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
    irPara("encerramento", dados);
  });

  const areaResultado = container.querySelector("[data-conteudo-resultado]");

  if (!dados.especieId) {
    areaResultado.innerHTML = '<p class="mensagem-vazia">Nenhuma identificação foi realizada.</p>';
    return;
  }

  const especie = await obterEspeciePorId(dados.especieId);
  if (!especie) {
    areaResultado.innerHTML = '<p class="mensagem-vazia">Não foi possível carregar o resultado.</p>';
    return;
  }

  areaResultado.innerHTML = "";
  areaResultado.appendChild(await criarFichaCientifica(especie));
}
