import os
from dotenv import load_dotenv
from llama_index.core import VectorStoreIndex, SimpleDirectoryReader, Settings
from llama_index.core.storage.storage_context import StorageContext
from llama_index.llms.groq import Groq
from llama_index.embeddings.huggingface import HuggingFaceEmbedding
from llama_index.vector_stores.chroma import ChromaVectorStore
from llama_index.core import PromptTemplate
import chromadb
import logging

# ── 1. Carregar variáveis de ambiente
load_dotenv()
logging.getLogger("httpx").setLevel(logging.WARNING)
GROQ_API_KEY = os.getenv("GROQ_API_KEY")

# ── 2. Configurar o modelo de linguagem (Groq)
llm = Groq(
    model="llama-3.3-70b-versatile",
    api_key=GROQ_API_KEY
)

# ── 3. Configurar o modelo de embeddings

embed_model = HuggingFaceEmbedding(
    model_name="sentence-transformers/all-MiniLM-L6-v2"
)

# ── 4. Aplicar configurações globais do LlamaIndex
Settings.llm = llm
Settings.embed_model = embed_model

# ── 5. Configurar o banco vetorial ChromaDB
chroma_client = chromadb.PersistentClient(path="./data")
chroma_collection = chroma_client.get_or_create_collection("obsidian_notes")
vector_store = ChromaVectorStore(chroma_collection=chroma_collection)
storage_context = StorageContext.from_defaults(vector_store=vector_store)

# ── 6. Ler e indexar as notas
print("Carregando e indexando suas notas...")

documents = SimpleDirectoryReader("./notas_teste").load_data()
index = VectorStoreIndex.from_documents(
    documents,
    storage_context=storage_context,
    show_progress=True
)

print(f"\n✓ {len(documents)} nota(s) indexada(s) com sucesso!\n")

# ── 7. Criar o motor de consulta com o system prompt
PROMPT_TEMPLATE = PromptTemplate(
    """Você é o assistente pessoal de inteligência artificial do cofre de notas do usuário.
Responda à pergunta utilizando estritamente o contexto abaixo.

Diretrizes obrigatórias:
1. Se a resposta não puder ser encontrada no contexto, diga exatamente:
   "Desculpe, não encontrei essa informação nas suas notas do Obsidian."
2. Ao final de toda resposta, liste obrigatoriamente os arquivos usados como fonte no formato:
   Fontes: [[nome-da-nota-1]], [[nome-da-nota-2]]

Contexto:
{context_str}

Pergunta: {query_str}
Resposta:"""
)

query_engine = index.as_query_engine(
    similarity_top_k=3,
    text_qa_template=PROMPT_TEMPLATE
)

# ── 8. Loop de chat no termianl
print("=" * 50)
print("Obsidian AI ── Digite 'sair' para encerrar")
print("=" * 50)

while True:
    pergunta = input("\nVocê: ").strip()

    if not pergunta:
        continue

    if pergunta.lower() in ["sair", "exit", "quit"]:
        print("Encerrando...")
        break

    print("\nIA: Buscando nas suas notas...\n")
    resposta = query_engine.query(pergunta)
    print(f"IA: {resposta}\n")
    print("-" * 50)
