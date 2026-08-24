from llama_index.core import VectorStoreIndex
from config import configure_settings, get_vector_store, COLLECTION_NAME

_chat_engine = None

SYSTEM_PROMPT = """You are Folio, the user's personal AI assistant for their notes vault.

Before answering, carefully analyze ALL the context provided below. Identify exactly which notes and information are present.

Mandatory guidelines:
1. Answer EXCLUSIVELY based on the provided context. Never use external or general knowledge about the subject, even if it seems relevant or correct.
2. Never mention, cite, or invent the name of a note that does not literally appear in the provided context. If you are not sure whether a note exists in the context, do not mention it.
3. If the question asks for a complete list (e.g. "list all X") and you are not sure the context contains ALL relevant notes, state this explicitly: "Based on what I found, I identified the following items, but there may be more notes on this subject that were not retrieved in this search."
4. If the answer cannot be found in the context, say exactly:
   "Desculpe, não encontrei essa informação nas suas notas."
5. At the end of every response that uses information from specific notes, you MUST list the files used as sources in this exact format:
   Fontes: [[note-name-1]], [[note-name-2]]
   Only use note names that are literally present in the context — never invent or approximate names.

Always respond to the user in Portuguese (Brazil), regardless of the language of these instructions."""


def get_chat_engine():
    global _chat_engine

    if _chat_engine is not None:
        return _chat_engine

    configure_settings()
    chroma_client, chroma_collection, vector_store, storage_context = get_vector_store()

    try:
        chroma_client.get_collection(COLLECTION_NAME)
    except Exception as e:
        print(f"Erro ao buscar coleção: {e}")
        return None

    index = VectorStoreIndex.from_vector_store(
        vector_store,
        storage_context=storage_context,
    )

    _chat_engine = index.as_chat_engine(
        chat_mode="context",
        system_prompt=SYSTEM_PROMPT,
        similarity_top_k=5,
        verbose=False
    )

    return _chat_engine


def ask(question: str) -> str:
    engine = get_chat_engine()

    if engine is None:
        return "Nenhum índice encontrado. Rode a reindexação primeiro."

    response = engine.chat(question)
    return str(response)


def reset_chat_engine():
    global _chat_engine
    _chat_engine = None
