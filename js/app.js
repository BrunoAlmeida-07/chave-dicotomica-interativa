/**
 * app.js
 *
 * Ponto de entrada da nova interface do Missão Fauna Brasil.
 *
 * Registra todas as telas no motor de navegação (navegacao.js) e decide qual
 * delas mostrar primeiro: Boas-vindas na primeira abertura, Tela Inicial nas
 * seguintes (a marcação de "já viu a Boas-vindas" é responsabilidade de
 * telas/boasVindas.js, não deste arquivo).
 */

import { registrarTela, iniciar } from "./navegacao.js";
import { renderBoasVindas, jaViuBoasVindas } from "./telas/boasVindas.js";
import { renderTelaInicial } from "./telas/telaInicial.js";
import { renderMapaMissoes } from "./telas/mapaMissoes.js";
import { renderIntroducaoMissao } from "./telas/introducaoMissao.js";
import { renderSelecaoEspecie } from "./telas/selecaoEspecie.js";
import { renderInvestigacao } from "./telas/investigacao.js";
import { renderResultado } from "./telas/resultado.js";
import { renderEncerramento } from "./telas/encerramento.js";
import { renderLaboratorio } from "./telas/laboratorio.js";

registrarTela("boasVindas", renderBoasVindas);
registrarTela("telaInicial", renderTelaInicial);
registrarTela("mapaMissoes", renderMapaMissoes);
registrarTela("introducaoMissao", renderIntroducaoMissao);
registrarTela("selecaoEspecie", renderSelecaoEspecie);
registrarTela("investigacao", renderInvestigacao);
registrarTela("resultado", renderResultado);
registrarTela("encerramento", renderEncerramento);
registrarTela("laboratorio", renderLaboratorio);

const container = document.getElementById("tela-atual");

iniciar(container, jaViuBoasVindas() ? "telaInicial" : "boasVindas");
