# Folio — Frontend

Aplicativo desktop em Electron + React, com um editor Markdown próprio construído sobre CodeMirror 6.

## Stack

- **Electron** — empacotamento desktop, janela customizada (sem barra de título nativa), inicia o backend automaticamente em produção
- **React 19** + **TypeScript**
- **Vite** — build e dev server
- **Tailwind CSS v4** — estilização, com tema claro/escuro via variáveis CSS
- **CodeMirror 6** — editor Markdown com Live Preview
- **Prism.js** — syntax highlighting nos blocos de código do editor e do chat
- **react-markdown** + **react-syntax-highlighter** — renderização das respostas da IA no chat
- **react-resizable-panels** — painéis redimensionáveis com layout persistente
- **electron-builder** — empacotamento do instalador `.exe`
- **lucide-react** — ícones

## Setup (desenvolvimento)

```bash
npm install
npm run electron:dev
```

Isso sobe o Vite (porta `5173`) e abre a janela do Electron apontando para ele, com hot-reload.

O backend (`../backend`) precisa estar rodando em paralelo em `http://localhost:8000` — em desenvolvimento, o Electron **não** inicia o backend automaticamente (só faz isso na versão empacotada).

## Estrutura

```
frontend/
├── electron.ts               # processo principal do Electron (janela, IPC, inicia/encerra o backend)
├── preload.ts                  # ponte segura entre Electron e o React (IPC)
├── src/
│   ├── components/
│   │   ├── pages/              # HomePage, FilterPage
│   │   ├── modal/               # GroqKeyModal, NewFolderModal, ConfirmModal
│   │   ├── markdownWidgets/      # widgets do editor (Bullet, Checkbox, Table, HR, CodeBlock)
│   │   ├── IconRail.tsx           # navegação principal (rail de ícones)
│   │   ├── FileDrawer.tsx          # explorador de arquivos em árvore (com criar/apagar pasta e drag-and-drop)
│   │   ├── Chat.tsx                 # interface de chat com a IA
│   │   ├── MarkdownMessage.tsx       # renderização Markdown das respostas da IA
│   │   ├── NoteEditor.tsx             # painel de edição de nota
│   │   ├── MarkdownEditor.tsx          # wrapper do CodeMirror
│   │   └── TitleBar.tsx                 # barra de título customizada (vault, tema, chave da IA)
│   ├── lib/
│   │   ├── liveMarkdownPlugin.ts        # decorações do Live Preview (StateField do CodeMirror)
│   │   └── markdownHighlight.ts          # syntax highlighting customizado
│   ├── hooks/
│   │   ├── useVaultData.ts               # stats, calendário, notas e árvore de arquivos centralizados
│   │   └── useTheme.ts                    # tema claro/escuro, persistido em localStorage
│   ├── types/                              # tipos TypeScript centralizados
│   └── utils/                               # funções auxiliares (calendário, datas, espera pelo backend)
└── build/                                     # ícones do app
```

## O editor Markdown

O editor é construído diretamente sobre o CodeMirror 6 (sem wrapper de terceiros — testado e descartado por incompatibilidade com React 19). A experiência de "Live Preview" — sintaxe visível só na linha ativa, como no Obsidian — é implementada com um `StateField` que:

1. Percorre a árvore de sintaxe Markdown a cada atualização
2. Esconde marcadores (`#`, `**`, `~~`, etc.) fora da linha do cursor via `Decoration.replace`
3. Substitui listas, checkboxes, divisores horizontais, tabelas e blocos de código por widgets interativos (`Decoration.widget`/`Decoration.replace` com `block: true`)

Tabelas e blocos de código são editáveis via `contentEditable`, sincronizados de volta para o Markdown ao perder o foco. Os blocos de código usam Prism.js para colorir a sintaxe (Python, JS/TS, HTML, CSS, JSON, SQL, Java, Rust, C/C++, PHP) — o parsing misto nativo do CodeMirror para linguagens aninhadas foi tentado e descartado por instabilidade.

## Empacotamento

O app é distribuído como um instalador `.exe` autocontido: o backend Python é compilado separadamente com PyInstaller e incluído como recurso extra do Electron Builder, iniciado automaticamente via `child_process.spawn` quando o app abre (e encerrado ao fechar). Veja `backend/README.md` para o processo de empacotamento do backend.

```bash
# 1. Gerar o executável do backend (veja backend/README.md)
# 2. Copiar backend/dist/folio-backend/ para frontend/backend-dist/
# 3. Gerar o instalador
npm run dist
```

O instalador final fica em `frontend/release/`.

## Scripts

```bash
npm run electron:dev      # desenvolvimento com hot-reload
npm run build              # build de produção do React
npm run electron:build      # compila electron.ts e preload.ts
npm run dist                 # gera o instalador .exe completo (React + Electron + backend empacotado)
```