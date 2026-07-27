# ROADMAP

# Missão Fauna Brasil
## Plataforma Gamificada para o Ensino de Animais Peçonhentos

---

# Visão do Projeto

O projeto nasceu como uma Chave Dicotômica Interativa desenvolvida para auxiliar o ensino sobre animais peçonhentos.

Nesta nova etapa, o objetivo é transformá-lo em uma plataforma gamificada de aprendizagem baseada em investigação científica.

O estudante deixa de ser apenas um usuário da chave dicotômica e passa a assumir o papel de um pesquisador responsável por investigar ocorrências, identificar corretamente espécies e ampliar seus conhecimentos sobre a fauna.

Toda funcionalidade adicionada ao projeto deve contribuir para a aprendizagem, o desenvolvimento do raciocínio científico e a alfabetização científica.

---

# Objetivos

- Tornar o aprendizado mais envolvente.
- Desenvolver o raciocínio classificatório.
- Incentivar a observação científica.
- Estimular a aprendizagem ativa.
- Promover o pensamento investigativo.
- Integrar ciência e gamificação.
- Manter funcionamento offline (PWA).

---

# Arquitetura Geral

O projeto será composto por quatro módulos principais.

```text
Banco de Dados Biológico
           │
           ▼
Sistema de Missões
           │
           ▼
Chave Dicotômica
           │
           ▼
Laboratório do Pesquisador
```

Cada módulo poderá evoluir de forma independente.

---

# Tecnologias

- HTML
- CSS
- JavaScript
- Progressive Web App (PWA)

O projeto continuará utilizando tecnologias web nativas, priorizando simplicidade, desempenho e compatibilidade com dispositivos móveis.

---

# Roadmap

---

# Versão 1.1 — Consolidação da Base

## Objetivo

Organizar o projeto e preparar sua evolução.

### Funcionalidades

- Reorganizar HTML.
- Reorganizar CSS.
- Reorganizar JavaScript.
- Melhorar responsividade.
- Melhorar acessibilidade.
- Melhorar desempenho.
- Revisar funcionamento offline.
- Corrigir bugs.

Status

⬜ Não iniciado

---

# Versão 1.2 — Nova Experiência do Usuário

## Objetivo

Modernizar a interface do aplicativo.

### Funcionalidades

- Nova tela inicial.
- Nova identidade visual.
- Tutorial inicial.
- Sons opcionais.
- Animações leves.
- Melhor experiência de navegação.

Status

⬜ Não iniciado

---

# Versão 1.3 — Banco de Dados Biológico

## Objetivo

Criar uma base de dados estruturada que centralize todas as informações científicas utilizadas pelo aplicativo.

Essa base alimentará automaticamente o sistema de missões, a chave dicotômica, o laboratório do pesquisador e futuras funcionalidades.

### Funcionalidades

- Criar estrutura de dados em JSON.
- Separar dados da lógica do sistema.
- Organizar informações por grupos zoológicos.
- Padronizar cadastro das espécies.
- Permitir expansão para novos grupos.
- Garantir funcionamento offline.

### Estrutura Inicial

```text
database/
├── grupos.json
├── especies.json
├── perguntas.json
├── missoes.json
├── conquistas.json
└── configuracoes.json
```

### Cada espécie deverá conter

- Identificador único.
- Nome popular.
- Nome científico.
- Grupo zoológico.
- Família.
- Distribuição geográfica.
- Habitat.
- Características morfológicas.
- Características utilizadas na chave dicotômica.
- Grau de importância médica.
- Peçonhenta ou não.
- Primeiros socorros.
- Importância ecológica.
- Curiosidades.
- Referências científicas.
- Imagens.

Status

⬜ Não iniciado

---

# Versão 2.0 — Missão Fauna Brasil

## Objetivo

Transformar o aplicativo em uma experiência de investigação científica.

O estudante fará parte de uma equipe fictícia responsável por investigar ocorrências envolvendo animais peçonhentos.

Cada atividade será apresentada como uma missão.

### Funcionalidades

- Introdução narrativa.
- Sistema de casos.
- Missões contextualizadas.
- Uso da chave durante a investigação.
- Explicação científica ao final.
- Feedback educativo.

Status

⬜ Não iniciado

---

# Versão 2.1 — Sistema de Missões

Cada missão deverá conter:

- História inicial.
- Contexto da ocorrência.
- Fotografia.
- Descrição do animal.
- Investigação utilizando a chave.
- Resultado.
- Explicação científica.
- Encerramento da missão.

Exemplo

> Um morador encontrou um animal atrás da geladeira. Sua equipe foi chamada para identificá-lo corretamente.

Status

⬜ Não iniciado

---

# Versão 2.2 — Sistema de Progressão

## Objetivo

Criar evolução contínua do jogador.

### Progressão

```text
Treinamento

↓

Casos Urbanos

↓

Casos Rurais

↓

Casos da Mata

↓

Casos Complexos

↓

Especialista

↓

Mestre Taxonomista
```

### Funcionalidades

- Barra de progresso.
- Sistema de níveis.
- Experiência (XP).
- Sequência de acertos.
- Bônus por precisão.

Status

⬜ Não iniciado

---

# Versão 2.3 — Laboratório do Pesquisador

## Objetivo

Criar uma coleção digital das espécies identificadas.

Cada espécie corretamente identificada será adicionada automaticamente ao laboratório.

### Funcionalidades

- Espécies descobertas.
- Informações científicas completas.
- Busca.
- Filtros.
- Favoritos.
- Estatísticas.
- Espécies bloqueadas até serem descobertas.

Status

⬜ Não iniciado

---

# Versão 2.4 — Sistema de Conquistas

## Objetivo

Reconhecer a evolução do estudante.

### Exemplos

🏅 Observador

🏅 Investigador

🏅 Especialista em Aranhas

🏅 Mestre dos Escorpiões

🏅 Especialista em Serpentes

🏅 Guardião da Biodiversidade

Status

⬜ Não iniciado

---

# Versão 3.0 — Plataforma Educacional

## Objetivo

Expandir o projeto para uma plataforma completa.

### Possibilidades

- Novos grupos zoológicos.
- Novos biomas.
- Novas campanhas.
- Desafios semanais.
- Painel do professor.
- Exportação de resultados.
- Estatísticas de aprendizagem.
- Personalização do jogador.

Status

⬜ Não iniciado

---

# Princípios do Projeto

Toda funcionalidade deverá responder à seguinte pergunta:

> Esta funcionalidade melhora a aprendizagem do estudante?

Se a resposta for **não**, ela não deverá ser implementada.

---

# Critérios para Novas Funcionalidades

Toda nova funcionalidade deverá:

- Contribuir para a aprendizagem.
- Incentivar a investigação científica.
- Manter simplicidade de uso.
- Funcionar offline.
- Ser compatível com dispositivos móveis.
- Possuir interface intuitiva.
- Manter consistência visual.

---

# Critérios de Qualidade

Antes de cada versão verificar:

- Funcionamento completo.
- Responsividade.
- Acessibilidade.
- Desempenho.
- Código organizado.
- Ausência de erros.
- Compatibilidade offline.

---

# Ideias Futuras

- Mais grupos zoológicos.
- Plantas de importância médica.
- Fungos.
- Animais marinhos.
- Banco de imagens expandido.
- Inteligência Artificial como assistente de aprendizagem.
- Editor de missões.
- Compartilhamento de missões.
- Multiplayer cooperativo.
- Ranking entre turmas.
- Integração com professores.
- Dashboard de aprendizagem.

---

# Visão de Longo Prazo

O objetivo é transformar o projeto em uma plataforma educacional capaz de apoiar o ensino de Zoologia por meio da investigação científica, da gamificação e do uso de tecnologias digitais, mantendo o rigor científico e proporcionando uma experiência de aprendizagem envolvente para estudantes e professores.