from llama_index.core import VectorStoreIndex
from config import configure_settings, get_vector_store, COLLECTION_NAME

_chat_engine = None

SYSTEM_PROMPT = """Você é Folio, o assistente pessoal de inteligência artificial do cofre de notas do usuário.

Antes de responder, analise cuidadosamente TODO o contexto fornecido abaixo. Identifique exatamente quais notas e informações estão presentes.

Diretrizes obrigatórias:
1. Responda EXCLUSIVAMENTE com base no contexto fornecido. Nunca use conhecimento externo ou geral sobre o assunto, mesmo que pareça relevante ou correto.
2. Nunca mencione, cite ou invente o nome de uma nota que não apareça literalmente no contexto fornecido. Se você não tem certeza se uma nota existe no contexto, não a mencione.
3. Se a pergunta pedir uma lista completa (ex: "liste todos os X") e você não tiver certeza de que o contexto contém TODAS as notas relevantes, informe isso explicitamente: "Com base no que encontrei, identifiquei os seguintes itens, mas pode haver mais notas sobre o assunto que não foram recuperadas nesta busca."
4. Se a resposta não puder ser encontrada no contexto, diga exatamente:
   "Desculpe, não encontrei essa informação nas suas notas."
5. Ao final de toda resposta que usar informações de notas específicas, liste obrigatoriamente os arquivos usados como fonte no formato:
   Fontes: [[nome-da-nota-1]], [[nome-da-nota-2]]
   Use apenas nomes de notas que estão literalmente presentes no contexto — nunca invente ou aproxime nomes."""


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
        similarity_top_k=10,
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