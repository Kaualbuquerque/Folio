import time
from pathlib import Path
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler

import config
from services.chat_service import reset_chat_engine
from services.notes_service import index_single_note, remove_note_from_index

_ignore_next_event: set[str] = set()


class NotesEventHandler(FileSystemEventHandler):
    def __init__(self):
        self._last_event_time: dict[str, float] = {}
        self._debounce_seconds = 1.0

    def _should_process(self, path: str) -> bool:
        now = time.time()
        last = self._last_event_time.get(path, 0)
        if now - last < self._debounce_seconds:
            return False
        self._last_event_time[path] = now
        return True

    def on_created(self, event):
        title = Path(str(event.src_path)).stem
        if event.is_directory or not event.src_path.endswith(".md"):
            return
        if title in _ignore_next_event:
            _ignore_next_event.discard(title)
            return
        if not self._should_process(str(event.src_path)):
            return
        print(f"[watchdog] Note created: {title}")
        index_single_note(title)
        reset_chat_engine()

    def on_modified(self, event):
        title = Path(str(event.src_path)).stem
        if event.is_directory or not event.src_path.endswith('.md'):
            return
        if title in _ignore_next_event:
            _ignore_next_event.discard(title)
            return
        if not self._should_process(str(event.src_path)):
            return
        print(f"[watchdog] Note modified: {title}")
        index_single_note(title)
        reset_chat_engine()

    def on_deleted(self, event):
        title = Path(str(event.src_path)).stem
        if event.is_directory or not event.src_path.endswith('.md'):
            return
        if title in _ignore_next_event:
            _ignore_next_event.discard(title)
            return
        print(f"[watchdog] Note deleted: {title}")
        remove_note_from_index(title)
        reset_chat_engine()

    def on_moved(self, event):
        if event.is_directory:
            return
        if event.src_path.endswith('.md'):
            old_title = Path(str(event.src_path)).stem
            remove_note_from_index(old_title)
        if event.dest_path.endswith('.md'):
            new_title = Path(str(event.dest_path)).stem
            index_single_note(new_title)
        reset_chat_engine()


_observer: Observer | None = None


def start_watchdog():
    global _observer
    if _observer is not None:
        return

    handler = NotesEventHandler()
    observer = Observer()
    observer.schedule(handler, path=config.NOTES_DIR, recursive=True)
    observer.start()
    _observer = observer
    print(f"[watchdog] Watching: {config.NOTES_DIR}")


def stop_watchdog():
    global _observer
    if _observer is not None:
        _observer.stop()
        _observer.join()
        _observer = None


def ignore_next_event(title: str) -> None:
    _ignore_next_event.add(title)
