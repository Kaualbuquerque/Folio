from llama_index.core import VectorStoreIndex, SimpleDirectoryReader
from config import configure_settings, get_vector_store, NOTES_DIR, COLLECTION_NAME, DATA_DIR
import chromadb

configure_settings()

print("Clearing previous index...")
chroma_client = chromadb.PersistentClient(path=DATA_DIR)

try:
    chroma_client.delete_collection(COLLECTION_NAME)
    print("✓ Previous index removed")
except Exception:
    print("No previous index found, creating from scratch")

_, _, vector_store, storage_context = get_vector_store()

print("\nReading and indexing your notes...")
documents = SimpleDirectoryReader(NOTES_DIR, recursive=True).load_data()

index = VectorStoreIndex.from_documents(
    documents,
    storage_context=storage_context,
    show_progress=True
)

print(f"\n✓ {len(documents)} Note(s) indexed and saved successfully!")
print("Now run 'python main.py' to talk to the AI..")