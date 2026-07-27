# Schema — Base de Conhecimento Biológica

> Documento de modelagem de dados do projeto **Missão Fauna Brasil**.
> Define a estrutura oficial das entidades que compõem a Base de Conhecimento Biológica e como elas se relacionam entre si.
>
> Este documento **não contém código nem arquivos JSON**. Ele é o contrato que os arquivos `database/json/*.json` e os scripts de acesso a dados deverão respeitar.

---

## 1. Decisões já fixadas para o projeto

- O JSON é a **fonte oficial** dos dados de conteúdo (grupos, espécies, perguntas, missões, conquistas, configurações).
- O **IndexedDB** é o banco local usado pelo aplicativo para funcionamento offline. Os dados são importados do JSON para o IndexedDB; o aplicativo, em uso normal, consulta o IndexedDB.
- Essas duas decisões não precisam ser reavaliadas nas próximas etapas.

---

## 2. Visão geral das entidades

```text
Configuração (global, não relacionada às demais)

Grupo (1) ───< (N) Espécie
   │
   └──< (N) Pergunta ──┐
                        ├── aponta para outra Pergunta (nó intermediário)
                        └── aponta para uma Espécie (nó folha / resultado)

Missão (N) >─── (1) Grupo
Missão (N) >─── (1) Espécie   (resposta correta do caso)
Missão (N) >─── (0..1) Pergunta   (ponto de entrada na chave, opcional)
Missão (N) >─── (0..N) Conquista  (recompensas associadas)

Conquista — pode referenciar (0..1) Grupo ou (0..1) Espécie, quando o critério for específico
```

**Leitura resumida:**
- Um **Grupo** (ex.: Aranhas) tem várias **Espécies** e uma árvore de **Perguntas** (a chave dicotômica daquele grupo).
- Cada **Pergunta** tem dois caminhos (Sim / Não), e cada caminho leva a outra Pergunta ou a uma Espécie (resultado final da identificação).
- Uma **Missão** usa um Grupo e sua árvore de Perguntas como ferramenta de investigação, e tem uma Espécie como resposta correta do caso.
- Uma **Conquista** é desbloqueada por critérios que podem envolver Grupos, Espécies ou Missões.
- **Configuração** é um objeto único e global, sem relação direta com as demais entidades.

---

## 3. Grupo

Representa um grupo zoológico estudado no aplicativo (Aranhas, Escorpiões, Serpentes, e futuros grupos).

| Campo | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| `id` | string (slug) | Sim | Identificador único. Ex.: `"aranhas"`. |
| `nome` | string | Sim | Nome de exibição. Ex.: `"Aranhas"`. |
| `nomeCientificoOrdem` | string | Sim | Nome científico da ordem/classe taxonômica. Ex.: `"Araneae"`. |
| `descricao` | string | Sim | Texto curto usado na tela inicial/apresentação do grupo. |
| `imagemCard` | string (caminho) | Sim | Imagem de destaque usada no card do grupo. |
| `perguntaInicialId` | string (FK → Pergunta) | Sim | Nó raiz da árvore de perguntas desse grupo. |
| `ordemExibicao` | number | Sim | Posição do grupo na navegação (0, 1, 2...). |

**Relacionamentos:** um Grupo possui N Espécies e N Perguntas; `perguntaInicialId` indica por onde a chave dicotômica do grupo começa.

---

## 4. Espécie

Representa cada nó terminal (resultado) da chave dicotômica. Nem todo resultado é uma "espécie" no sentido taxonômico estrito — por isso existe o campo `tipoRegistro`, que descreve os três padrões já observados no conteúdo atual do projeto.

| Campo | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| `id` | string (slug) | Sim | Identificador único. Ex.: `"cascavel"`. |
| `grupoId` | string (FK → Grupo) | Sim | Grupo zoológico ao qual pertence. |
| `tipoRegistro` | enum | Sim | Ver tabela de valores abaixo. |
| `nomePopular` | string | Sim | Ex.: `"Cascavel"`. |
| `nomeCientifico` | string ou null | Não | Ex.: `"Crotalus durissus"`. `null` quando o registro representa um grupo genérico sem espécie única (ver `tipoRegistro`). |
| `familia` | string | Não | Família taxonômica, quando aplicável. |
| `distribuicaoGeografica` | string | Não | Regiões/biomas de ocorrência. |
| `habitat` | string | Sim | Texto descritivo do habitat. |
| `caracteristicasMorfologicas` | string | Sim | Texto descritivo (equivalente à seção "Identificação" atual). |
| `caracteristicasChave` | array de objetos `{ caracteristica, valor }` | Não | Traços estruturados usados pela chave dicotômica (ex.: `{ "corpo": "grande" }`). Permite, no futuro, montar ou validar a árvore de perguntas automaticamente. |
| `peconhenta` | boolean | Sim | Indica se o animal possui peçonha. |
| `grauImportanciaMedica` | enum: `"nenhuma"` \| `"baixa"` \| `"moderada"` \| `"alta"` | Sim | Relevância clínica em caso de acidente. |
| `primeirosSocorros` | string | Não | Orientações em caso de acidente. Presente sobretudo quando `grauImportanciaMedica` é `"moderada"` ou `"alta"`. |
| `importanciaEcologica` | string | Sim | Papel ecológico da espécie. |
| `comportamento` | string | Sim | Texto descritivo (seção "Comportamento" já usada em todas as páginas atuais). |
| `curiosidades` | array de string | Não | Fatos adicionais, usados futuramente no Laboratório do Pesquisador. |
| `referenciasCientificas` | array de string | Não | Fontes (Ministério da Saúde, Instituto Butantan, ICMBio, etc.). |
| `imagens` | array de objetos `{ src, alt, principal }` | Sim | Uma ou mais imagens. `principal: true` marca a imagem de destaque. |
| `textoConservacao` | string | Sim | Texto de fechamento (seção destacada ao final da página, já existente em todo o conteúdo atual). |

### Valores de `tipoRegistro`

| Valor | Significado | Exemplos no conteúdo atual |
|---|---|---|
| `"especie"` | Identificação de uma espécie (ou gênero) específico. | `cascavel`, `escorpiao_amarelo`, `caranguejeira` |
| `"grupo_generico"` | Representa um conjunto de espécies do mesmo grupo zoológico que compartilham a característica observada, sem apontar para uma espécie única. | `aranha_nao_peconhenta`, `outro_escorpiao` |
| `"organismo_similar"` | Organismo frequentemente confundido com o grupo, mas taxonomicamente distinto. | `nao_escorpiao` (pseudoescorpião — ordem *Pseudoscorpiones*, não *Scorpiones*) |

Essa distinção é importante porque as três situações exigem textos e talvez tratamentos visuais diferentes (ex.: destacar ao estudante que "isso não é bem uma serpente/aranha/escorpião").

**Relacionamentos:** uma Espécie pertence a um Grupo; é referenciada como nó-folha por uma ou mais Perguntas; pode ser referenciada por Missões (como resposta correta) e por Conquistas (como critério de desbloqueio).

---

## 5. Pergunta

Representa um nó da árvore de decisão da chave dicotômica (equivalente aos atuais `perguntaN.html`).

| Campo | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| `id` | string (slug) | Sim | Identificador único. Ex.: `"aranhas-p1"`. |
| `grupoId` | string (FK → Grupo) | Sim | Grupo ao qual a pergunta pertence. |
| `texto` | string | Sim | Enunciado da pergunta. |
| `imagem` | string (caminho) | Não | Imagem de apoio à observação. |
| `opcaoSim` | objeto `{ tipo, destinoId }` | Sim | Caminho ao responder "Sim". |
| `opcaoNao` | objeto `{ tipo, destinoId }` | Sim | Caminho ao responder "Não". |

Onde `tipo` em `opcaoSim`/`opcaoNao` é `"pergunta"` (segue para outro nó da árvore, `destinoId` é um id de Pergunta) ou `"especie"` (chegou a um resultado, `destinoId` é um id de Espécie).

**Relacionamentos:** uma Pergunta pertence a um Grupo; referencia outra Pergunta ou uma Espécie em cada um dos dois caminhos possíveis. O conjunto de Perguntas de um Grupo forma uma árvore binária cuja raiz é `Grupo.perguntaInicialId`.

---

## 6. Missão *(estrutura prevista para a v2.x — schema definido agora para permitir expansão futura, sem conteúdo populado nesta fase)*

| Campo | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| `id` | string (slug) | Sim | Identificador único. |
| `titulo` | string | Sim | Título do caso investigativo. |
| `grupoId` | string (FK → Grupo) | Sim | Grupo zoológico envolvido no caso. |
| `perguntaInicialId` | string (FK → Pergunta) | Não | Ponto de entrada na chave dicotômica para esta missão (se diferente da raiz padrão do grupo). |
| `contextoNarrativo` | string | Sim | Texto de introdução/história do caso. |
| `descricaoOcorrencia` | string | Sim | Descrição da ocorrência a ser investigada. |
| `imagemCaso` | string (caminho) | Não | Imagem ilustrativa do caso. |
| `especieRespostaCorreta` | string (FK → Espécie) | Sim | Espécie que representa a identificação correta do caso. |
| `explicacaoCientificaFinal` | string | Sim | Texto exibido ao final, reforçando o conteúdo científico. |
| `feedbackSucesso` | string | Sim | Mensagem exibida quando o estudante acerta. |
| `feedbackErro` | string | Sim | Mensagem exibida quando o estudante erra. |
| `faseProgressao` | enum (conforme v2.2 do ROADMAP: `"treinamento"`, `"casos_urbanos"`, `"casos_rurais"`, `"casos_mata"`, `"casos_complexos"`, `"especialista"`, `"mestre_taxonomista"`) | Sim | Fase da progressão à qual a missão pertence. |
| `recompensaXp` | number | Sim | Experiência concedida ao concluir. |
| `conquistasAssociadas` | array de string (FK → Conquista) | Não | Conquistas que podem ser desbloqueadas por esta missão. |

**Observação:** o *estado do jogador* (se a missão está bloqueada/concluída, pontuação obtida) **não faz parte deste schema de conteúdo**. Esse estado é dado de progressão, gerado durante o uso e armazenado apenas no IndexedDB local (ver seção 9).

**Relacionamentos:** uma Missão referencia um Grupo, uma Espécie (resposta correta), opcionalmente uma Pergunta (entrada customizada na árvore) e zero ou mais Conquistas.

---

## 7. Conquista *(estrutura prevista para a v2.x)*

| Campo | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| `id` | string (slug) | Sim | Identificador único. |
| `nome` | string | Sim | Nome da conquista. Ex.: `"Especialista em Aranhas"`. |
| `descricao` | string | Sim | Texto explicativo do critério. |
| `icone` | string (caminho) | Sim | Ícone/emblema exibido no Laboratório do Pesquisador. |
| `criterio.tipo` | enum: `"identificar_especie"` \| `"completar_grupo"` \| `"completar_missoes_fase"` \| `"sequencia_acertos"` | Sim | Tipo de regra que desbloqueia a conquista. |
| `criterio.referenciaId` | string (FK → Grupo, Espécie ou fase) | Não | Alvo específico do critério, quando aplicável (ex.: id do grupo em `"completar_grupo"`). |
| `criterio.quantidade` | number | Não | Quantidade necessária, quando aplicável (ex.: nº de acertos seguidos). |

**Relacionamentos:** uma Conquista pode referenciar opcionalmente um Grupo ou uma Espécie através de `criterio.referenciaId`, e pode ser associada a uma ou mais Missões.

---

## 8. Configuração

Objeto único e global (não é uma coleção de registros).

| Campo | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| `versaoBaseDados` | string | Sim | Versão do conteúdo JSON, usada para decidir quando reimportar os dados para o IndexedDB. |
| `grupoDisponiveis` | array de string (FK → Grupo) | Sim | Lista de grupos atualmente habilitados no aplicativo (permite desativar um grupo sem removê-lo do JSON). |
| `funcionalidades` | objeto de flags booleanas | Não | Feature flags simples, ex.: `{ "missoesHabilitadas": false, "conquistasHabilitadas": false }`, usadas para ligar funcionalidades da v2.x gradualmente. |

**Relacionamentos:** nenhum relacionamento direto (`grupoDisponiveis` referencia ids de Grupo apenas como lista de controle, não como propriedade do Grupo).

---

## 9. Fronteira entre dados de conteúdo e dados de progresso

Este schema descreve **apenas o conteúdo científico e estrutural** do aplicativo (o que existe, independente de quem joga).

Dados de **progresso do jogador** — missões concluídas, espécies descobertas no Laboratório, XP, sequência de acertos, conquistas obtidas por um usuário específico — são gerados em tempo de uso e vivem **somente no IndexedDB local**, em coleções separadas das coleções de conteúdo. Eles não fazem parte deste documento e serão modelados quando o Sistema de Missões e o Laboratório do Pesquisador forem implementados (v2.x).

---

## 10. Camada de acesso aos dados — responsabilidades (visão geral, sem implementação)

Nomes já definidos para os scripts em `database/scripts/`:

| Script | Responsabilidade |
|---|---|
| `database.js` | Ponto de entrada/fachada. Orquestra `importer.js` e `indexeddb.js` para garantir que os dados estejam disponíveis antes de qualquer consulta. |
| `indexeddb.js` | Camada de persistência local: abrir/versionar o banco IndexedDB e expor operações básicas de leitura/escrita das coleções (Grupo, Espécie, Pergunta, Missão, Conquista, Configuração). |
| `importer.js` | Lê os arquivos `database/json/*.json` e popula/atualiza o IndexedDB, respeitando `versaoBaseDados` de `Configuração` para evitar reimportações desnecessárias. |
| `search.js` | Funções de consulta usadas pelas páginas/telas (ex.: obter espécie por id, listar espécies por grupo, obter pergunta por id), sempre lendo do IndexedDB. |

Nenhum desses scripts será implementado nesta etapa — a tabela acima serve apenas para registrar a divisão de responsabilidades já combinada, para orientar a implementação futura.

---

## 11. Próximos passos

1. Revisão e aprovação deste schema.
2. Criação dos arquivos JSON em `database/json/` (`grupos.json`, `especies.json`, `perguntas.json`) com o conteúdo migrado das páginas atuais.
3. Criação dos scaffolds vazios de `missoes.json`, `conquistas.json` e `configuracoes.json`.
4. Implementação de `database.js`, `indexeddb.js`, `importer.js` e `search.js`.
5. Atualização do `service-worker.js` para cache dos novos arquivos JSON.
