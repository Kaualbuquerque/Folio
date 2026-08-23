import json

from pathlib import Path

SETTINGS_FILE = Path(__file__).parent / "groq_settings.json"


def get_groq_key() -> str | None:
    if SETTINGS_FILE.exists():
        data = json.loads(SETTINGS_FILE.read_text(encoding="utf-8"))
        return data.get("groq_api_key")
    return None


def set_groq_key(key: str) -> None:
    SETTINGS_FILE.write_text(
        json.dumps({"groq_api_key": key}, indent=2),
        encoding="utf-8"
    )
