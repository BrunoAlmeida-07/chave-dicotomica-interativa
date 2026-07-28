/**
 * assets.js
 *
 * Utilitário de resolução de caminhos de arquivos estáticos (imagens)
 * guardados na Base de Conhecimento. Não acessa dados nem IndexedDB — só
 * transforma um caminho relativo à raiz do projeto (formato usado em
 * database/json/*.json, ex.: "aranhas/imagens/img-pergunta1.png") numa URL
 * utilizável a partir de qualquer página da aplicação, independente da
 * profundidade de pastas de quem chama.
 */

// Raiz do projeto, calculada a partir da localização deste próprio arquivo
// (src/js/utils/assets.js está sempre 3 níveis abaixo da raiz).
const RAIZ_DO_PROJETO = new URL("../../../", import.meta.url);

/**
 * Resolve um caminho de imagem relativo à raiz do projeto para uma URL absoluta.
 *
 * @param {string} caminhoRelativo - Ex.: "serpentes/imagens/Cascavel.jpg".
 * @returns {string}
 */
export function resolverCaminhoImagem(caminhoRelativo) {
  return new URL(caminhoRelativo, RAIZ_DO_PROJETO).href;
}
