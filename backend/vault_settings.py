import json
from pathlib import Path

SETTINGS_FILE = Path(__file__).parent / "vault_settings.json"

DEFAULT_NOTES_DIR = "./test_notes"


def get_vault_path() -> str:
    if SETTINGS_FILE.exists():
        data = json.loads(SETTINGS_FILE.read_text(encoding="utf-8"))
        saved_path = data.get("notes_dir")
        if saved_path and Path(saved_path).exists():
            return saved_path

    return str(Path(DEFAULT_NOTES_DIR).resolve())


def set_vault_path(new_path: str) -> None:
    SETTINGS_FILE.write_text(
        json.dumps({"notes_dir": new_path}, indent=2),
        encoding="utf-8",
    )
