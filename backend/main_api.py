from fastapi import FastAPI
from pydantic import BaseModel

from services.chat_service import ask
from services.notes_service import analyze_notes


app = FastAPI()

class ChatRequest(BaseModel):
    question: str

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


@app.get("/notes/calendar")
def get_notes_calendar():
    data = analyze_notes()

    dates = {
        note: creation_date.isoformat()
        for note, creation_date in data["creation_dates"].items()
    }

    events = {
        event_date.isoformat(): description
        for event_date, description in data["events"].items()
    }

    return {
        "dates": dates,
        "events": events
    }


@app.post("/chat")
def post_chat(request: ChatRequest):
    answer = ask(request.question)
    return {"answer": answer}