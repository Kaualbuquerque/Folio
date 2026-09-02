# Folio — Backend

API em FastAPI responsável pelo CRUD de notas, gerenciamento de arquivos, indexação vetorial e chat com IA sobre o vault.

## Stack

- **FastAPI** — servidor da API
- **LlamaIndex** — orquestração do pipeline RAG
- **ChromaDB** — banco de vetores, persistido em disco
- **Groq** (`openai/gpt-oss-120b`) — modelo de linguagem usado no chat
- **HuggingFace `sentence-transformers/all-MiniLM-L6-v2`** — modelo de embeddings
- **watchdog** — observa o sistema de arquivos e reindexa notas alteradas fora do app
- **keyring** — guarda a chave da Groq no gerenciador de credenciais do sistema operacional (nunca em texto puro em disco)
- **send2trash** — move notas e pastas apagadas para a Lixeira do sistema, em vez de apagar permanentemente
- **PyInstaller** — empacota o backend como executável standalone

## Setup (desenvolvimento)

```bash
python -m venv .venv
.venv\Scripts\activate        # Windows
# source .venv/bin/activate   # macOS/Linux

pip install -r requirements.txt
```

A chave da Groq pode vir de um arquivo `.env` na raiz do backend (útil em desenvolvimento):

```
GROQ_API_KEY=sua_chave_aqui
```

Ou ser configurada pela própria interface do app (recomendado — é assim que funciona na versão empacotada, já que não há `.env` nesse cenário). A chave configurada pela interface tem prioridade sobre a do `.env`.

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
├── groq_settings.py            # persistência da chave da Groq via keyring
├── monitor.py                   # watchdog: observa o vault e reindexa automaticamente
├── indexer.py                    # script standalone para reindexar via terminal
├── services/
│   ├── notes_service.py          # CRUD de notas e pastas, análise do vault, indexação
│   └── chat_service.py            # engine de chat (RAG) com a Groq
└── legacy/                        # MVP original em Streamlit, mantido como histórico
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
| `/vault/name` | GET | Nome da pasta do vault ativo |
| `/vault/tree` | GET | Árvore de pastas e arquivos do vault |
| `/vault/folder` | POST / DELETE | Criar ou apagar uma pasta (envia para a Lixeira) |
| `/vault/move` | POST | Mover uma nota ou pasta para outro local (drag-and-drop) |
| `/settings/groq-key` | GET / POST | Verificar se há chave configurada / salvar uma nova chave |

## Notas de implementação

- A reindexação é **incremental** por padrão (`index_single_note`/`remove_note_from_index`) — apenas a nota alterada é reprocessada no ChromaDB, não o vault inteiro. Isso reduz o tempo de reindexação de segundos para frações de segundo.
- O modelo de embeddings **não** é carregado no `lifespan` de inicialização — isso é intencional, para o servidor subir instantaneamente mesmo sem chave da Groq configurada. O carregamento acontece sob demanda, na primeira vez que o chat ou a indexação forem usados, com cache (`_settings_configured`) para não recarregar a cada chamada.
- O `watchdog` usa um mecanismo de debounce e de "ignorar próximo evento" para não reagir a mudanças feitas pelo próprio backend, evitando reindexações duplicadas ou condições de corrida.
- O CORS usa `allow_origin_regex` para aceitar tanto o Vite em desenvolvimento (`http://localhost:5173`) quanto o protocolo `file://` usado pelo app empacotado.

## Empacotando como executável

```bash
pip install pyinstaller
pyinstaller --onedir --name folio-backend main.py
```

O `main.py` inclui um bloco `if __name__ == "__main__": uvicorn.run(app, ...)` especificamente para permitir essa execução direta — ao rodar via `uvicorn main:app`, esse bloco é ignorado normalmente.

O resultado fica em `dist/folio-backend/` (o `.exe` mais a pasta `_internal/` com as dependências). Essa pasta inteira deve ser copiada para `frontend/backend-dist/` antes de gerar o instalador do Electron — veja `frontend/README.md`.