# Folio

Um editor de notas desktop com IA embutida, construído do zero com Python (FastAPI) e Electron + React.

![status](https://img.shields.io/badge/status-funcional-3E6B57)

## Sobre o projeto

A ideia surgiu de uma necessidade simples: conforme minhas anotações no Obsidian iam crescendo, ficava cada vez mais difícil consultá-las rapidamente. Comecei tentando replicar a ideia de uma IA que trabalha em conjunto com o Obsidian, lendo e respondendo perguntas com base nas notas.

Conforme o projeto avançou, a proposta mudou. O Folio deixou de ser um complemento do Obsidian e se tornou um **editor de notas autônomo e independente**: você pode criar e editar notas, organizá-las em pastas, filtrar por tags e data, trocar entre diferentes vaults (pastas de notas) — e, mantendo a ideia original, conversar com uma IA que lê suas anotações e responde com base no que está escrito.

O projeto evoluiu de um MVP simples em Streamlit até o aplicativo desktop atual, construído com Electron, e hoje é distribuído como um instalador `.exe` autocontido — sem precisar de Python ou Node instalado na máquina do usuário.

## Funcionalidades

**Editor de notas**
- Editor Markdown com **Live Preview** construído sobre CodeMirror 6 — sintaxe (`#`, `**`, `*`, etc.) visível apenas quando o cursor está na linha, do mesmo jeito que o Obsidian faz
- Tabelas editáveis, renderizadas como HTML real, com controles para adicionar/remover linhas e colunas
- Blocos de código com syntax highlighting (Python, JavaScript/TypeScript, HTML, CSS, JSON, SQL, Java, Rust, C/C++, PHP), editáveis diretamente no bloco renderizado
- Checkboxes, listas, citações, divisores
- Links internos (`[[nota]]` e `[[nota|apelido]]`) e externos clicáveis, abrindo no navegador padrão do sistema
- Indentação com Tab, igual a um editor de código

**Organização**
- Calendário e tags com filtro combinado (múltiplas tags, comportamento AND)
- Explorador de arquivos em árvore, com suporte a notas em subpastas
- Criação e exclusão de pastas (exclusão envia para a Lixeira do sistema, não apaga permanentemente)
- Organização por arrastar e soltar (drag-and-drop) entre pastas
- Multi-vault — troque de pasta de notas pela interface, sem editar nenhum arquivo de configuração

**Chat com IA (RAG)**
- Pergunte sobre suas notas e receba respostas com citação das fontes, usando LlamaIndex + ChromaDB + Groq
- Respostas renderizadas em Markdown, incluindo blocos de código com syntax highlighting
- Configuração da chave de API da Groq diretamente pela interface, sem editar arquivos — a chave fica protegida no gerenciador de credenciais do sistema operacional

**Sincronização e desempenho**
- Reindexação incremental — só a nota alterada é reprocessada, não o vault inteiro
- Um `watchdog` monitora o sistema de arquivos e reindexa automaticamente notas criadas ou editadas fora do app (direto no Explorer, por exemplo)

**Interface**
- Tema claro/escuro persistente entre sessões
- Painéis redimensionáveis com layout salvo
- Interface própria, sem barra de título do sistema operacional
- Navegação por rail de ícones (Início, Conversa, Filtros, Arquivos)

## Stack

**Backend:** Python, FastAPI, LlamaIndex, ChromaDB, Groq, watchdog, keyring, send2trash, PyInstaller
**Frontend:** Electron, React 19, TypeScript, Tailwind CSS v4, CodeMirror 6, Prism.js, react-markdown

Documentação detalhada de cada parte:
- [`backend/README.md`](./backend/README.md)
- [`frontend/README.md`](./frontend/README.md)

## Rodando o projeto (desenvolvimento)

```bash
# Backend
cd backend
python -m venv .venv
.venv\Scripts\activate          # Windows
pip install -r requirements.txt
uvicorn main:app --reload --port 8000

# Frontend (em outro terminal)
cd frontend
npm install
npm run electron:dev
```

## Instalando o app empacotado

Se você recebeu o instalador (`Folio Setup.exe`), basta executá-lo — o backend Python vem empacotado junto e é iniciado automaticamente quando o app abre. Não é necessário instalar Python, Node ou qualquer dependência manualmente.

> **⚠️ Chave de API necessária.** O chat com IA usa a [Groq](https://console.groq.com) para rodar o modelo de linguagem. Cada pessoa que for usar o Folio precisa criar sua própria conta gratuita na Groq e gerar sua própria chave de API — o projeto não inclui nem compartilha nenhuma chave. Configure sua chave pelo menu no topo do app (clique no nome do cofre → "Adicionar chave da IA"). Sem isso, todas as outras funcionalidades (criar, editar, organizar notas) continuam funcionando normalmente; só o chat fica indisponível, com um aviso explicando o que fazer.

## Limitações conhecidas

- Perguntas do tipo "liste todos os X" para a IA podem retornar resultados incompletos. O chat usa busca por similaridade vetorial (RAG) com um `top_k` fixo — perguntas amplas nem sempre trazem todos os trechos relevantes de um assunto, especialmente à medida que o número de notas cresce. O prompt do sistema instrui a IA a avisar quando a lista pode estar incompleta.
- A tabela e o bloco de código recém-carregados só renderizam como conteúdo formatado após a primeira interação do usuário com o editor (bug cosmético conhecido, não afeta o conteúdo salvo).

## Histórico

O projeto começou como um MVP em Streamlit para validar a ideia de RAG sobre notas pessoais. Depois de validado, foi reconstruído como aplicativo desktop com Electron, ganhando um editor Markdown próprio (construído diretamente sobre o CodeMirror 6, após testar e descartar wrappers incompatíveis com React 19), CRUD completo de notas, gerenciamento de arquivos, e uma interface pensada desde o início (design "pergaminho editorial").