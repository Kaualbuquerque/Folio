from fastapi import FastAPI
from notes_service import analyze_notes

app = FastAPI()


@app.get("/")
def root():
    return {"status": "Obsidius API rodando"}


@app.get("/notes/stats")
def get_notes_stats():
    data = analyze_notes()
    return {
        "total": data["total"],
        "orphans": data["orphans"],
        "tags": data["tags"],
    }
