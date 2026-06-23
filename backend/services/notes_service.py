import re
from datetime import date
from pathlib import Path
import yaml
from config import NOTES_DIR


def read_fontmatter(path: Path) -> dict:
    try:
        text = Path(path).read_text(encoding="utf-8")
        if text.startswith("---"):
            end = text.find("---", 3)
            if end != -1:
                return yaml.safe_load(text[3:end]) or {}
    except Exception:
        pass
    return {}


def analyze_notes() -> dict:
    notes_dir = Path(NOTES_DIR)
    files = list(notes_dir.glob("**/*.md"))

    total = len(files)
    tags_count = {}
    creation_dates = {}
    events = {}
    received_links = {f.stem: 0 for f in files}

    for file in files:
        fm = read_fontmatter(file)

        tags = fm.get("tags", [])
        if isinstance(tags, str):
            tags = [tags]
        for tag in tags:
            tags_count[tag] = tags_count.get(tag, 0) + 1

        stat = file.stat()
        creation_date = date.fromtimestamp(stat.st_ctime)
        creation_dates[file.stem] = creation_date

        if fm.get("compromisso"):
            events[creation_date] = fm.get("compromisso")

        text = file.read_text(encoding="utf-8", errors="ignore")
        links = re.findall(r'\[\[([^\]]+)\]\]', text)
        for link in links:
            clean_link = link.split("|")[0].strip()
            if clean_link in received_links:
                received_links[clean_link] += 1

    orphans = sum(1 for v in received_links.values() if v == 0)

    return {
        "total": total,
        "tags": dict(sorted(tags_count.items(), key=lambda x: x[1], reverse=True)),
        "creation_dates": creation_dates,
        "events": events,
        "orphans": orphans
    }
