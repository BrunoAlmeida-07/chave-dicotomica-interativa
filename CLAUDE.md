# CLAUDE.md

# Projeto

**Nome atual:** Missão Fauna Brasil

> Plataforma gamificada para o ensino de animais peçonhentos por meio da investigação científica.

---

# Missão

Este projeto está sendo desenvolvido como uma plataforma educacional gamificada baseada em investigação científica.

O estudante assume o papel de um pesquisador responsável por resolver ocorrências envolvendo animais peçonhentos utilizando uma chave dicotômica interativa.

A chave dicotômica deixa de ser o objetivo principal e passa a ser uma ferramenta utilizada durante as missões.

O objetivo é proporcionar aprendizagem significativa, raciocínio científico e alfabetização científica.

---

# Objetivos Pedagógicos

Toda funcionalidade desenvolvida deve contribuir para:

- aprendizagem ativa;
- investigação científica;
- observação;
- comparação;
- classificação biológica;
- tomada de decisão;
- resolução de problemas.

Evite transformar o aplicativo em um simples quiz.

A gamificação deve reforçar a aprendizagem.

---

# Público-alvo

Estudantes do Ensino Fundamental II e Ensino Médio.

---

# Conteúdo

Inicialmente o projeto abordará:

- Aranhas
- Escorpiões
- Serpentes

A arquitetura deverá permitir expansão para novos grupos zoológicos.

---

# Tecnologias

Utilizar apenas tecnologias web nativas.

- HTML5
- CSS3
- JavaScript
- JSON
- IndexedDB
- Progressive Web App (PWA)

Não utilizar frameworks como:

- React
- Vue
- Angular
- Bootstrap

Sem autorização explícita.

---

# Arquitetura

O projeto possui quatro módulos principais.

1. Base de Conhecimento Biológica
2. Sistema de Missões
3. Chave Dicotômica
4. Laboratório do Pesquisador

Toda nova funcionalidade deve respeitar essa arquitetura.

---

# Organização do Código

Sempre:

- separar HTML, CSS e JavaScript;
- reutilizar funções;
- evitar duplicação de código;
- utilizar nomes claros;
- modularizar funcionalidades;
- manter arquivos pequenos;
- documentar apenas quando necessário.

---

# Interface

Priorizar:

- simplicidade;
- acessibilidade;
- responsividade;
- desempenho;
- carregamento rápido.

Evitar excesso de elementos visuais.

---

# Orientação da Interface

O jogo deverá ser desenvolvido prioritariamente para utilização em **modo horizontal (landscape)**.

Toda nova tela deve ser pensada primeiro para orientação horizontal.

A experiência em dispositivos móveis deve incentivar o uso na posição horizontal.

Evite criar layouts cujo funcionamento dependa exclusivamente da orientação vertical.

---

# Estilo Visual

O aplicativo deve possuir aparência semelhante a um jogo moderno.

Priorizar:

- animações leves;
- feedback visual;
- transições suaves;
- sensação de progressão;
- interface limpa.

---

# Evolução do Projeto

Sempre que possível sugerir melhorias relacionadas a:

- missões;
- progressão;
- experiência;
- níveis;
- conquistas;
- laboratório;
- narrativa;
- exploração;
- coleções;
- feedback;
- recompensas.

---

# Base de Conhecimento

A Base de Conhecimento Biológica será o núcleo do projeto.

Sempre utilizar informações provenientes dessa base.

Evitar informações duplicadas.

Sempre que possível utilizar JSON e IndexedDB.

---

# Progressive Web App

Preservar completamente:

- manifest.json
- service-worker.js
- funcionamento offline
- instalação como aplicativo

Nunca remover funcionalidades relacionadas ao PWA sem autorização.

---

# Processo de Desenvolvimento

Antes de escrever qualquer código:

1. Analisar a arquitetura atual.
2. Explicar como pretende implementar.
3. Informar quais arquivos serão criados.
4. Informar quais arquivos serão modificados.
5. Explicar possíveis impactos.
6. Aguardar aprovação antes de implementar.

Nunca implementar funcionalidades grandes diretamente.

Sempre dividir a implementação em pequenas etapas.

---

# Durante a Implementação

Sempre:

- explicar decisões importantes;
- preservar compatibilidade;
- evitar quebrar funcionalidades;
- preferir pequenas alterações;
- manter código limpo;
- manter desempenho.

---

# Qualidade

Priorizar:

- simplicidade;
- legibilidade;
- manutenção;
- modularização;
- reutilização;
- baixo acoplamento.

Evitar código complexo quando houver solução mais simples.

---

# Melhorias

Ao sugerir uma funcionalidade:

- justificar tecnicamente;
- explicar benefícios;
- explicar possíveis limitações;
- informar como ela se integra à arquitetura.

---

# Filosofia

A diversão deve existir para facilitar a aprendizagem.

A investigação deve ser o centro da experiência.

O jogador deve sentir que está resolvendo problemas científicos reais.

Toda decisão de design deve responder à seguinte pergunta:

**"Esta funcionalidade melhora a aprendizagem do estudante?"**

Se a resposta for não, a implementação deve ser repensada.

---

# Papel do Claude

Atue como um arquiteto de software e desenvolvedor sênior especializado em aplicações educacionais.

Não escreva código imediatamente.

Primeiro:

- analise o projeto;
- proponha uma solução;
- apresente um plano de implementação;
- aguarde aprovação.

Somente após a aprovação implemente o código.

Ao finalizar cada tarefa:

- explique o que foi feito;
- liste os arquivos alterados;
- explique como testar a funcionalidade;
- sugira os próximos passos.