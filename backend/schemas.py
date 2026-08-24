from pydantic import BaseModel


class ChatRequest(BaseModel):
    question: str


class NoteCreateRequest(BaseModel):
    title: str
    content: str | None = None


class NoteUpdateRequest(BaseModel):
    content: str


class NoteRenameRequest(BaseModel):
    new_title: str


class VaultPathRequest(BaseModel):
    path: str


class GroqKeyRequest(BaseModel):
    key: str
