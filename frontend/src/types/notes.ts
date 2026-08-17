import type { FileTree } from "./fileTree";

export interface NotesStats {
    total: number;
    orphans: number;
    tags: Record<string, number>;
}

export interface NotesCalendar {
    dates: Record<string, string>;
}

export interface Notes {
    title: string;
    created_at: string;
    tags: string[];
}

export interface NoteFrontmatter {
    tags?: string[];
    compromisso?: string;
    date?: string;
}

export interface NoteDetail {
    title: string;
    content: string;
    frontmatter: NoteFrontmatter;
    tags: string[];
}

export interface NoteEditorProps {
    selectedNote: string;
    onClose: () => void;
    onSaved: () => void;
    onDeleted: () => void;
    onNoteClick: (title: string) => void;
}

export interface VaultData {
    stats: NotesStats | null;
    calendar: NotesCalendar | null;
    notes: Notes[];
    fileTree: FileTree | null;
    isLoading: boolean;
    refresh: () => void;
}
