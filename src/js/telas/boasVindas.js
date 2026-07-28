/**
 * boasVindas.js
 *
 * Tela de Boas-vindas: aparece só na primeira abertura do aplicativo,
 * apresentando a Missão Fauna Brasil e o papel do jogador como pesquisador.
 * Depois de "Começar", leva direto à Tela Inicial — não existe nenhuma
 * etapa de tutorial separada (o aprendizado inicial acontece na Missão 0,
 * dentro do fluxo normal de missão).
 */

import { irPara } from "../navegacao.js";

const CHAVE_JA_VIU = "missaoFaunaBrasil.jaViuBoasVindas";

/**
 * Indica se o jogador já passou pela tela de Boas-vindas antes.
 * @returns {boolean}
 */
export function jaViuBoasVindas() {
  return localStorage.getItem(CHAVE_JA_VIU) === "true";
}

/**
 * Desenha a tela de Boas-vindas.
 * @param {HTMLElement} container
 */
export function renderBoasVindas(container) {
  container.innerHTML = `
    <section class="tela tela-boas-vindas">
      <div class="boas-vindas-cartao">
        <span class="etiqueta">Bem-vindo(a)</span>
        <h1>Missão Fauna Brasil</h1>
        <p>
          Você foi convidado a integrar uma equipe de pesquisa responsável por
          investigar ocorrências envolvendo animais peçonhentos.
        </p>
        <button type="button" class="botao botao-primario" data-acao="continuar">Começar</button>
      </div>
    </section>
  `;

  container.querySelector('[data-acao="continuar"]').addEventListener("click", () => {
    localStorage.setItem(CHAVE_JA_VIU, "true");
    irPara("telaInicial");
  });
}
