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
| `explicacaoImportanciaMedica` | string ou null | Não | O "porquê" por trás de `grauImportanciaMedica`: sintomas, mecanismo de ação, texto original da seção "Peçonhento(a)?" das páginas de origem. |
| `primeirosSocorros` | string | Não | Orientações em caso de acidente. Presente sobretudo quando `grauImportanciaMedica` é `"moderada"` ou `"alta"`. |
| `importanciaEcologica` | string | Sim | Papel ecológico da espécie. |
| `comportamento` | string | Sim | Texto descritivo (seção "Comportamento" já usada em todas as páginas atuais). |
| `prevencao` | array de string | Não | Recomendações práticas para evitar acidentes (ex.: "Sacudir roupas antes de vestir."). Cada item é uma recomendação distinta — nunca um texto corrido. |
| `curiosidades` | array de string | Não | Fatos adicionais, usados futuramente no Laboratório do Pesquisador. |
| `referenciasCientificas` | array de string | Não | Fontes (Ministério da Saúde, Instituto Butantan, ICMBio, etc.). |
| `imagens` | array de objetos `{ src, alt, principal }` | Sim | Uma ou mais imagens. `principal: true` marca a imagem de destaque. |
| `textoConservacao` | string | Sim | Texto de fechamento (seção destacada ao final da página, já existente em todo o conteúdo atual). |

### Status de preenchimento (2026-07-29)

Nem todo campo "Não obrigatório" está no mesmo estágio — a tabela acima define o *tipo*, esta lista define o *estado atual* das 16 espécies migradas:

- **Obrigatórios, sempre preenchidos:** `id`, `grupoId`, `tipoRegistro`, `nomePopular`, `habitat`, `caracteristicasMorfologicas`, `peconhenta`, `grauImportanciaMedica`, `importanciaEcologica`, `comportamento`, `imagens`, `textoConservacao`.
- **Opcionais, já preenchidos quando a fonte original tinha o dado:** `nomeCientifico` (null só nos registros `grupo_generico` sem nome taxonômico próprio), `caracteristicasChave` (parcial — só quando havia um traço distintivo claro na pergunta que levou à espécie), `explicacaoImportanciaMedica` (recuperado da seção "Peçonhento(a)?" original — **16/16 espécies**).
- **Opcionais, aguardando curadoria científica futura (hoje `null`/`[]` em todas as 16 espécies):** `familia`, `distribuicaoGeografica`, `primeirosSocorros`, `prevencao`, `curiosidades`, `referenciasCientificas`.

Sobre `distribuicaoGeografica`: duas espécies (`escorpiao_nordeste`, `escorpiao_preto`) têm menção de região ("Nordeste do Brasil", "região Amazônica") embutida no texto de `habitat`, mas não como frase isolável sem reescrita — decisão de extrair ou não fica para a curadoria, não foi feita automaticamente.

Sobre `prevencao`: parte do texto de `textoConservacao` de espécies com importância médica já contém recomendações de prevenção em prosa (ex.: escorpião-amarelo), mas não foi convertido em lista automaticamente — isso exigiria decidir onde cada recomendação começa/termina, o que é curadoria, não migração.

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

## 6. Missão

*Estrutura definitiva (2026-07-28), com conteúdo real parcial em `missoes.json` — narrativa completa, resposta correta e recompensas ainda ficam para quando o Sistema de Missões (v2.x) existir de fato.*

| Campo | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| `id` | string (slug) | Sim | Identificador único. |
| `titulo` | string | Sim | Título do caso investigativo. |
| `descricaoCurta` | string | Sim | Texto curto usado no cartão da Tela/Mapa de Missões. |
| `grupoId` | string (FK → Grupo) | Sim | Grupo zoológico envolvido no caso. |
| `perguntaInicialId` | string (FK → Pergunta) | Sim | Ponto de entrada na chave dicotômica desta missão. |
| `ordemProgressao` | number | Sim | Posição de exibição da missão na trilha (0, 1, 2...). Não é o que desbloqueia a próxima — ver `preRequisito`. |
| `sempreDisponivel` | boolean | Não (padrão `false`) | Quando `true`, a missão nunca fica bloqueada nem mostra "concluída" (o que a tornaria não clicável), independente de progresso ou de `preRequisito` — usado pela Missão 0 (treinamento), que deve continuar jogável mesmo depois de concluída. |
| `preRequisito` | string ou null (FK → Missão) | Não | Id da missão que precisa estar concluída para esta ficar disponível. `null` = sem pré-requisito (disponível desde o início, sujeito a `sempreDisponivel`). É o campo que define o desbloqueio — não há nenhuma cadeia fixa no código. |
| `visivelNoMapaDeMissoes` | boolean | Não (padrão `true`) | Quando `false`, a missão não aparece na listagem do Mapa de Missões (`listarMissoes()`), mas continua acessível por id via `obterMissao` — usado pela Missão de Treinamento, alcançável só pelo botão "Como Jogar" da Tela Inicial. |
| `contextoNarrativo` | string | Sim | Texto de introdução/história do caso. |
| `descricaoOcorrencia` | string | Sim | Descrição da ocorrência a ser investigada. |
| `imagemCaso` | string (caminho) | Não | Imagem ilustrativa do caso. |
| `especieRespostaCorreta` | string (FK → Espécie) | Não | Espécie que representa a identificação correta do caso. `null` quando a missão ainda não tem um caso narrativo com resposta única definida (ex.: missões que só convidam a explorar a chave inteira de um grupo). |
| `explicacaoCientificaFinal` | string | Não | Texto exibido ao final, reforçando o conteúdo científico. |
| `feedbackSucesso` | string | Não | Mensagem exibida quando o estudante acerta. |
| `feedbackErro` | string | Não | Mensagem exibida quando o estudante erra. |
| `faseProgressao` | enum (conforme v2.2 do ROADMAP: `"treinamento"`, `"casos_urbanos"`, `"casos_rurais"`, `"casos_mata"`, `"casos_complexos"`, `"especialista"`, `"mestre_taxonomista"`) | Não | Fase da progressão à qual a missão pertence. |
| `recompensaXp` | number | Não | Experiência concedida ao concluir. |
| `conquistasAssociadas` | array de string (FK → Conquista) | Não | Conquistas que podem ser desbloqueadas por esta missão. |

**`status` não é um campo desta entidade.** `disponível` / `bloqueada` / `concluída` é um valor **calculado** em `src/js/nucleo/missoes.js`, não armazenado em `missoes.json` nem nas telas — cruza `sempreDisponivel`/`preRequisito` (conteúdo, acima) com a store de progresso do jogador `progressoMissoes` (ver seção 9): `sempreDisponivel` sempre vence; senão, concluída se há registro de progresso; senão, disponível se não há `preRequisito` ou se o `preRequisito` já foi concluído; bloqueada nos demais casos.

**Nota temporária:** a Missão de Treinamento (`missao-0`) reaproveita a árvore de perguntas de Escorpiões (`grupoId: "escorpioes"`) só porque ainda não existe uma missão de treinamento própria, focada em ensinar a mecânica do jogo (observar, responder, interpretar) em vez de conteúdo zoológico específico. Isso é uma solução temporária, registrada para ser revisitada quando o conteúdo real de missões for escrito — nesse momento, `missao-escorpioes` continua existindo como a missão dedicada ao grupo, independente do que acontecer com a Missão de Treinamento.

**Nota (2026-07-28):** desde que `visivelNoMapaDeMissoes` foi introduzido, `missao-0` saiu da campanha principal do Mapa de Missões — a campanha agora começa em `missao-aranhas` (sem `preRequisito`), seguida de `missao-escorpioes` (exige `missao-aranhas`) e `missao-serpentes` (exige `missao-escorpioes`). `missao-0` continua existindo só como o destino do botão "Como Jogar".

**Relacionamentos:** uma Missão referencia um Grupo, uma Pergunta (entrada na chave) e, opcionalmente, uma Espécie (resposta correta) e zero ou mais Conquistas.

---

## 7. Conquista *(conteúdo real implementado em 2026-07-30, junto com o Laboratório do Pesquisador)*

| Campo | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| `id` | string (slug) | Sim | Identificador único. |
| `nome` | string | Sim | Nome da conquista. Ex.: `"Especialista em Aranhas"`. |
| `descricao` | string | Sim | Texto explicativo do critério. |
| `icone` | string (chave de `js/componentes/icone.js`) | Sim | Ícone exibido no Laboratório do Pesquisador. Reaproveita o mesmo sistema de ícones SVG inline usado no resto do app (não é um caminho de arquivo de imagem). |
| `criterio.tipo` | enum: `"identificar_especie"` \| `"completar_grupo"` \| `"completar_missoes_fase"` \| `"sequencia_acertos"` | Sim | Tipo de regra que desbloqueia a conquista. |
| `criterio.referenciaId` | string ou null (FK → Grupo, Espécie ou fase) | Não | Alvo específico do critério, quando aplicável (ex.: id do grupo em `"completar_grupo"`). `null` = qualquer grupo/missão conta para o critério (usado com `criterio.quantidade` para limiares gerais, ex.: "complete 2 grupos quaisquer"). |
| `criterio.quantidade` | number ou null | Não | Quantidade necessária, quando aplicável (ex.: nº de grupos concluídos). |

**Relacionamentos:** uma Conquista pode referenciar opcionalmente um Grupo ou uma Espécie através de `criterio.referenciaId`, e pode ser associada a uma ou mais Missões.

**Nota de implementação (2026-07-30, atualizada em 2026-08-04):** das 7 conquistas do conteúdo atual, nenhuma usa `"identificar_especie"` nem `"sequencia_acertos"` — o segundo exige um conceito de acerto/erro que a chave dicotômica atual não tem (é determinística, não um quiz). O primeiro, `"identificar_especie"`, já é avaliável em `js/nucleo/progressoCientifico.js` desde que o rastreamento por espécie individual foi implementado (store `especiesDescobertas`, ver seção 9) — segue o mesmo padrão de `"completar_grupo"` (`referenciaId` verifica uma espécie específica; ausência de `referenciaId` verifica `criterio.quantidade` espécies descobertas, de qualquer grupo). Nenhuma conquista desse tipo foi adicionada a `conquistas.json` ainda — é uma decisão de conteúdo em aberto, não uma limitação técnica. Todas as 7 atuais usam `"completar_grupo"`, com ou sem `referenciaId`, calculado a partir de `progressoMissoes` (seção 9) cruzado com o `grupoId` de cada Missão.

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

Dados de **progresso do jogador** — missões concluídas, espécies descobertas no Laboratório, XP, sequência de acertos, conquistas obtidas por um usuário específico — são gerados em tempo de uso e vivem **somente no IndexedDB local**, em coleções separadas das coleções de conteúdo.

**Progresso de missões (implementado em 2026-07-28):** store `progressoMissoes` (`database/scripts/indexeddb.js`, banco `MissaoFaunaBrasil`), com um registro por missão concluída:

| Campo | Tipo | Descrição |
|---|---|---|
| `missaoId` | string (FK → Missão) | Chave da store. |
| `concluidaEm` | string (ISO datetime) | Quando a missão foi concluída (a gravação mais recente vence, se concluída de novo). |

Gravada por `concluirMissao()` em `js/nucleo/missoes.js`, chamada pela tela de Encerramento — o único ponto da interface que sabe que o jogador terminou um caso. Lida por `listarMissoes()` do mesmo módulo, para calcular o `status` de cada missão (seção 6).

**Espécies descobertas (implementado em 2026-08-04, substitui a aproximação por grupo de 2026-07-30):** store `especiesDescobertas` (`database/scripts/indexeddb.js`, `DATABASE_VERSION` 5), com um registro por espécie individual identificada:

| Campo | Tipo | Descrição |
|---|---|---|
| `especieId` | string (FK → Espécie) | Chave da store. |
| `descobertaEm` | string (ISO datetime) | Quando a espécie foi identificada pela primeira vez (a gravação mais recente vence, se a missão for revisitada e chegar à mesma espécie). |

Gravada por `registrarDescoberta()` em `js/nucleo/progressoCientifico.js`, chamada pela tela de Encerramento (junto de `concluirMissao()`, acima) com a `especieId` que a investigação concluída realmente identificou — a mesma que chega até ali via `dados.especieId`, produzida pelo Motor de Investigação em `js/telas/investigacao.js` e só exibida (nunca gravada) pela tela de Resultado. Lida por `obterProgressoCientifico()` do mesmo módulo, que monta `especiesCatalogadas` diretamente dessa store — o Laboratório (`js/telas/laboratorio.js`) e o grid do Catálogo passaram a refletir exatamente a espécie descoberta em cada investigação, não mais o grupo inteiro. Contas com progresso salvo antes desta versão não têm registro de qual espécie encontraram (esse dado nunca existiu) — o Catálogo dessas contas mostra 0 espécies descobertas até que as investigações sejam refeitas; não há reconstrução retroativa, para não recriar a aproximação por grupo.

XP e sequência de acertos continuam em aberto para uma evolução futura do sistema — fora do escopo desta etapa.

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
