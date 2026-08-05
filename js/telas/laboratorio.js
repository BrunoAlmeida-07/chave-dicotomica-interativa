/**
 * laboratorio.js
 *
 * Laboratório do Pesquisador: central de progresso do jogador — perfil,
 * progresso científico, catálogo de espécies e conquistas. Todo o progresso
 * exibido é calculado por `progressoCientifico.js` a partir de dados que já
 * existem (progresso de missões + conteúdo); esta tela só desenha o
 * resultado.
 *
 * Ao clicar numa espécie catalogada, abre a Ficha Científica (o mesmo
 * componente já usado no Resultado) num modal simples dentro da própria
 * tela — não é uma tela nova, não duplica a ficha.
 *
 * "Voltar" leva explicitamente para a Tela Inicial (`irPara`), mesma
 * diretriz de navegação das demais telas de menu.
 */

import { irPara } from "../navegacao.js";
import { criarIcone } from "../componentes/icone.js";
import { criarCartaoEspecie } from "../componentes/cartaoEspecie.js";
import { criarCartaoConquista } from "../componentes/cartaoConquista.js";
import { criarFichaCientifica } from "../componentes/fichaCientifica.js";
import { obterProgressoCientifico } from "../nucleo/progressoCientifico.js";
import { listarEspecies } from "../../database/scripts/database.js";

export async function renderLaboratorio(container) {
  container.innerHTML = `
    <section class="tela tela-laboratorio">
      <header class="tela-cabecalho laboratorio__cabecalho">
        <button type="button" class="botao botao-fantasma" data-acao="voltar">
          <span class="icone">${criarIcone("voltar")}</span> Voltar
        </button>
        <span class="etiqueta laboratorio__etiqueta">Central do pesquisador</span>
      </header>

      <div class="laboratorio__topo">
        <h1 class="laboratorio__titulo">Laboratório do Pesquisador</h1>
        <p class="laboratorio__subtitulo">Acompanhe sua evolução científica e o progresso das suas descobertas.</p>
      </div>

      <div class="laboratorio__perfil cartao" data-perfil>
        <p class="mensagem-carregando">Carregando progresso...</p>
      </div>

      <div class="laboratorio__cards" data-cards></div>

      <div class="laboratorio__modal" data-modal hidden>
        <div class="laboratorio__modal-fundo" data-acao="fechar-modal"></div>
        <div class="laboratorio__modal-painel">
          <button type="button" class="botao botao-fantasma laboratorio__modal-fechar" data-acao="fechar-modal">
            <span class="icone">${criarIcone("voltar")}</span> Fechar
          </button>
          <div data-ficha-container></div>
        </div>
      </div>
    </section>
  `;

  container.querySelector('[data-acao="voltar"]').addEventListener("click", () => {
    irPara("telaInicial");
  });

  const modal = container.querySelector("[data-modal]");
  const areaFicha = container.querySelector("[data-ficha-container]");

  const fecharModal = () => {
    modal.hidden = true;
    areaFicha.innerHTML = "";
  };

  for (const botao of container.querySelectorAll('[data-acao="fechar-modal"]')) {
    botao.addEventListener("click", fecharModal);
  }

  const abrirFichaDaEspecie = async (especie) => {
    areaFicha.innerHTML = "";
    areaFicha.appendChild(await criarFichaCientifica(especie));
    modal.hidden = false;
  };

  const [progresso, todasEspecies] = await Promise.all([obterProgressoCientifico(), listarEspecies()]);

  renderizarPerfil(container.querySelector("[data-perfil]"), progresso);

  const areaCards = container.querySelector("[data-cards]");
  areaCards.appendChild(criarCardProgresso(progresso));
  areaCards.appendChild(criarCardCatalogo(progresso, todasEspecies, abrirFichaDaEspecie));
  areaCards.appendChild(criarCardConquistas(progresso));
}

/**
 * Preenche o card de Perfil do Pesquisador com três métricas reais,
 * derivadas do progresso já calculado (nenhum número inventado).
 */
function renderizarPerfil(area, progresso) {
  area.innerHTML = `
    <div class="laboratorio__stat">
      <span class="icone laboratorio__stat-icone">${criarIcone("frasco")}</span>
      <strong class="laboratorio__stat-numero">${progresso.totalEspeciesCatalogadas}/${progresso.totalEspecies}</strong>
      <span class="laboratorio__stat-rotulo">Espécies catalogadas</span>
    </div>
    <div class="laboratorio__stat">
      <span class="icone laboratorio__stat-icone">${criarIcone("check")}</span>
      <strong class="laboratorio__stat-numero">${progresso.totalMissoesConcluidas}/${progresso.totalMissoesCampanha}</strong>
      <span class="laboratorio__stat-rotulo">Missões concluídas</span>
    </div>
    <div class="laboratorio__stat">
      <span class="icone laboratorio__stat-icone">${criarIcone("mapa")}</span>
      <strong class="laboratorio__stat-numero">${progresso.totalGruposConcluidos}/${progresso.totalGrupos}</strong>
      <span class="laboratorio__stat-rotulo">Grupos explorados</span>
    </div>
  `;
}

/** Card de destaque: barra de progresso do catálogo de espécies. */
function criarCardProgresso(progresso) {
  const card = document.createElement("section");
  card.className = "cartao laboratorio__progresso";

  const percentual =
    progresso.totalEspecies > 0
      ? Math.round((progresso.totalEspeciesCatalogadas / progresso.totalEspecies) * 100)
      : 0;

  card.innerHTML = `
    <h2 class="laboratorio__card-titulo">
      <span class="icone">${criarIcone("estrela")}</span> Progresso científico
    </h2>
    <p class="laboratorio__progresso-legenda">Espécies catalogadas</p>
    <div class="barra-progresso">
      <div class="barra-progresso__trilha">
        <div class="barra-progresso__preenchimento" style="width: ${percentual}%"></div>
      </div>
      <span class="barra-progresso__numero">${progresso.totalEspeciesCatalogadas} / ${progresso.totalEspecies}</span>
    </div>
  `;

  return card;
}

/**
 * Card do Catálogo: grade com as 16 espécies. `progresso.especiesCatalogadas`
 * já diz quais estão catalogadas (todas as de um grupo, assim que a missão
 * daquele grupo é concluída — ver progressoCientifico.js).
 */
function criarCardCatalogo(progresso, todasEspecies, aoClicarEspecie) {
  const card = document.createElement("section");
  card.className = "cartao laboratorio__catalogo";

  const titulo = document.createElement("h2");
  titulo.className = "laboratorio__card-titulo";
  titulo.innerHTML = `<span class="icone">${criarIcone("lupa")}</span> Catálogo`;
  card.appendChild(titulo);

  const grade = document.createElement("div");
  grade.className = "laboratorio__grade-especies";

  for (const especie of todasEspecies) {
    const descoberta = progresso.especiesCatalogadas.has(especie.id);
    grade.appendChild(
      criarCartaoEspecie({
        especie,
        descoberta,
        aoClicar: descoberta ? () => aoClicarEspecie(especie) : undefined,
      })
    );
  }

  card.appendChild(grade);
  return card;
}

/** Card de Conquistas: as 7 conquistas definidas em conquistas.json. */
function criarCardConquistas(progresso) {
  const card = document.createElement("section");
  card.className = "cartao laboratorio__conquistas";

  const titulo = document.createElement("h2");
  titulo.className = "laboratorio__card-titulo";
  titulo.innerHTML = `<span class="icone">${criarIcone("medalha")}</span> Conquistas`;
  card.appendChild(titulo);

  const grade = document.createElement("div");
  grade.className = "laboratorio__grade-conquistas";
  for (const conquista of progresso.conquistas) {
    grade.appendChild(criarCartaoConquista(conquista));
  }
  card.appendChild(grade);

  return card;
}
