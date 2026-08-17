# Folio — Backend

API em FastAPI responsável pelo CRUD de notas, indexação vetorial e chat com IA sobre o vault.

## Stack

- **FastAPI** — servidor da API
- **LlamaIndex** — orquestração do pipeline RAG
- **ChromaDB** — banco de vetores, persistido em disco
- **Groq** (Llama 3.3 70B) — modelo de linguagem usado no chat
- **HuggingFace `sentence-transformers/all-MiniLM-L6-v2`** — modelo de embeddings
- **watchdog** — observa o sistema de arquivos e reindexa notas alteradas fora do app

## Setup

```bash
python -m venv .venv
.venv\Scripts\activate        # Windows
# source .venv/bin/activate   # macOS/Linux

pip install -r requirements.txt
```

Crie um arquivo `.env` na raiz do backend com sua chave da Groq:

```
GROQ_API_KEY=sua_chave_aqui
```

Rode o servidor:

```bash
uvicorn main:app --reload --port 8000
```

A documentação interativa da API fica disponível em `http://localhost:8000/docs`.

## Estrutura

```
backend/
├── main.py                 # rotas da API
├── config.py                # configurações e settings do LlamaIndex
├── schemas.py                # modelos Pydantic (request/response)
├── vault_settings.py          # persistência do caminho do vault ativo
├── monitor.py                 # watchdog: observa o vault e reindexa automaticamente
├── indexer.py                  # script standalone para reindexar via terminal
├── services/
│   ├── notes_service.py        # CRUD de notas, análise do vault, indexação
│   └── chat_service.py          # engine de chat (RAG) com a Groq
└── legacy/                      # MVP original em Streamlit, mantido como histórico
```

## Principais rotas

| Rota | Método | Descrição |
|---|---|---|
| `/notes` | GET | Lista todas as notas do vault |
| `/notes/{title}` | GET / PUT / DELETE | Ler, atualizar ou apagar uma nota |
| `/notes` | POST | Criar uma nota |
| `/notes/{title}/rename` | PATCH | Renomear uma nota |
| `/notes/stats` | GET | Estatísticas do vault (total, órfãs, tags) |
| `/notes/calendar` | GET | Datas de criação das notas |
| `/chat` | POST | Pergunta para a IA sobre o vault |
| `/reindex` | POST | Reindexação completa do vault |
| `/vault/path` | GET / POST | Ler ou trocar a pasta do vault ativo |
| `/vault/tree` | GET | Árvore de pastas e arquivos do vault |

## Notas de implementação

- A reindexação é **incremental** por padrão (`index_single_note`/`remove_note_from_index`) — apenas a nota alterada é reprocessada no ChromaDB, não o vault inteiro. Isso reduz o tempo de reindexação de segundos para frações de segundo.
- O modelo de embeddings é carregado uma única vez na inicialização do servidor (via `lifespan` do FastAPI), evitando o custo de recarregá-lo a cada requisição.
- O `watchdog` usa um mecanismo de debounce e de "ignorar próximo evento" para não reagir a mudanças feitas pelo próprio backend, evitando reindexações duplicadas ou condições de corrida.