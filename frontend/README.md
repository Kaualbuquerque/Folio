# Folio — Frontend

Aplicativo desktop em Electron + React, com um editor Markdown próprio construído sobre CodeMirror 6.

## Stack

- **Electron** — empacotamento desktop, janela customizada (sem barra de título nativa)
- **React 19** + **TypeScript**
- **Vite** — build e dev server
- **Tailwind CSS v4** — estilização, com tema claro/escuro via variáveis CSS
- **CodeMirror 6** — editor Markdown com Live Preview
- **react-resizable-panels** — painéis redimensionáveis com layout persistente
- **lucide-react** — ícones

## Setup

```bash
npm install
npm run electron:dev
```

Isso sobe o Vite (porta `5173`) e abre a janela do Electron apontando para ele, com hot-reload.

O backend (`../backend`) precisa estar rodando em paralelo em `http://localhost:8000`.

## Estrutura

```
frontend/
├── electron.ts               # processo principal do Electron
├── preload.ts                  # ponte segura entre Electron e o React (IPC)
├── src/
│   ├── components/
│   │   ├── pages/              # HomePage, FilterPage
│   │   ├── markdownWidgets/     # widgets do editor (Bullet, Checkbox, Table, HR)
│   │   ├── IconRail.tsx          # navegação principal (rail de ícones)
│   │   ├── FileDrawer.tsx         # explorador de arquivos em árvore
│   │   ├── Chat.tsx                # interface de chat com a IA
│   │   ├── NoteEditor.tsx           # painel de edição de nota
│   │   ├── MarkdownEditor.tsx        # wrapper do CodeMirror
│   │   └── TitleBar.tsx               # barra de título customizada
│   ├── lib/
│   │   ├── liveMarkdownPlugin.ts      # decorações do Live Preview (StateField do CodeMirror)
│   │   └── markdownHighlight.ts        # syntax highlighting customizado
│   ├── hooks/
│   │   ├── useVaultData.ts             # stats, calendário, notas e árvore de arquivos centralizados
│   │   └── useTheme.ts                  # tema claro/escuro
│   ├── types/                            # tipos TypeScript centralizados
│   └── utils/                             # funções auxiliares (calendário, datas)
└── build/                                  # ícones do app
```

## O editor Markdown

O editor é construído diretamente sobre o CodeMirror 6 (sem wrapper de terceiros — testado e descartado por incompatibilidade com React 19). A experiência de "Live Preview" — sintaxe visível só na linha ativa, como no Obsidian — é implementada com um `StateField` que:

1. Percorre a árvore de sintaxe Markdown a cada atualização
2. Esconde marcadores (`#`, `**`, `~~`, etc.) fora da linha do cursor via `Decoration.replace`
3. Substitui listas, checkboxes, divisores horizontais e tabelas por widgets interativos (`Decoration.widget`/`Decoration.replace` com `block: true`)

Tabelas são editáveis via células `contentEditable`, sincronizadas de volta para o Markdown a cada edição.

## Scripts

```bash
npm run electron:dev      # desenvolvimento com hot-reload
npm run build              # build de produção do React
npm run electron:build      # compila electron.ts e preload.ts
```