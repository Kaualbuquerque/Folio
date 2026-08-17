# Folio

Um editor de notas desktop com IA embutida, construído do zero com Python (FastAPI) e Electron + React.

![status](https://img.shields.io/badge/status-em%20desenvolvimento-3E6B57)

## Sobre o projeto

A ideia surgiu de uma necessidade simples: conforme minhas anotações no Obsidian iam crescendo, ficava cada vez mais difícil consultá-las rapidamente. Comecei tentando replicar a ideia de uma IA que trabalha em conjunto com o Obsidian, lendo e respondendo perguntas com base nas notas.

Conforme o projeto avançou, a proposta mudou. O Folio deixou de ser um complemento do Obsidian e se tornou um **editor de notas autônomo e independente**: você pode criar e editar notas, organizá-las em pastas, filtrar por tags e data, trocar entre diferentes vaults (pastas de notas) — e, mantendo a ideia original, conversar com uma IA que lê suas anotações e responde com base no que está escrito.

O projeto evoluiu de um MVP simples em Streamlit até o aplicativo desktop atual, construído com Electron.

## Funcionalidades

- **Editor Markdown com Live Preview** — construído sobre CodeMirror 6, com sintaxe (`#`, `**`, `*`, etc.) visível apenas quando o cursor está na linha, do mesmo jeito que o Obsidian faz
- **Tabelas editáveis** — renderizadas como HTML real, com controles para adicionar/remover linhas e colunas
- **Checkboxes, listas, citações, links internos (`[[nota]]`) e externos** clicáveis
- **Chat com IA (RAG)** — pergunte sobre suas notas e receba respostas com citação das fontes, usando LlamaIndex + ChromaDB + Groq (Llama 3.3 70B)
- **Organização** — calendário, tags com filtro combinado (AND), explorador de arquivos em árvore, notas em subpastas
- **Multi-vault** — troque de pasta de notas pela interface, sem editar nenhum arquivo de configuração
- **Reindexação automática** — um `watchdog` monitora o sistema de arquivos e reindexa notas criadas ou editadas fora do app (direto no Explorer, por exemplo)
- **Tema claro/escuro**, painéis redimensionáveis e interface própria (sem barra de título do sistema)

## Stack

**Backend:** Python, FastAPI, LlamaIndex, ChromaDB, Groq, watchdog
**Frontend:** Electron, React 19, TypeScript, Tailwind CSS v4, CodeMirror 6

Documentação detalhada de cada parte:
- [`backend/README.md`](./backend/README.md)
- [`frontend/README.md`](./frontend/README.md)

## Rodando o projeto

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

> **⚠️ Chave de API necessária.** O chat com IA usa a [Groq](https://console.groq.com) para rodar o modelo de linguagem. Cada pessoa que for usar o Folio precisa criar sua própria conta gratuita na Groq e gerar sua própria chave de API — o projeto não inclui nem compartilha nenhuma chave. Sem isso, todas as outras funcionalidades (criar, editar, organizar notas) continuam funcionando normalmente; só o chat fica indisponível. Veja `backend/README.md` para os detalhes de configuração.

## Limitações conhecidas

- Perguntas do tipo "liste todos os X" para a IA podem retornar resultados incompletos. O chat usa busca por similaridade vetorial (RAG) com um `top_k` fixo — perguntas amplas nem sempre trazem todos os trechos relevantes de um assunto, especialmente à medida que o número de notas cresce. Um `top_k` mais alto ajuda, mas tem custo em tokens e velocidade.
- A tabela recém-carregada só renderiza como HTML após a primeira interação do usuário com o editor (bug cosmético conhecido, não afeta o conteúdo salvo).

## Histórico

O projeto começou como um MVP em Streamlit para validar a ideia de RAG sobre notas pessoais. Depois de validado, foi reconstruído como aplicativo desktop com Electron, ganhando um editor Markdown próprio, CRUD completo de notas e uma interface pensada desde o início (design "pergaminho editorial").