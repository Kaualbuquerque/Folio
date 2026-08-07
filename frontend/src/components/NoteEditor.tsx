import { useEffect, useRef, useState } from "react";
import type { NoteDetail, NoteEditorProps } from "../types/notes";
import { Save, Table2, Trash2, X } from "lucide-react";
import MarkdownEditor from "./MarkdownEditor";
import type { MarkdownEditorHandle } from "../types/editor";

const ERROR_MESSAGES: Record<string, string> = {
    'file already exists': 'Já existe uma nota com esse título',
    'Note not found': 'Nota não encontrada',
};

function translateError(detail: string): string {
    return ERROR_MESSAGES[detail] ?? detail;
}

export default function NoteEditor({ selectedNote, onClose, onSaved, onDeleted, onNoteClick }: NoteEditorProps) {
    const isNew = selectedNote === '__new__';

    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);
    const [title, setTitle] = useState('');
    const [tagInput, setTagInput] = useState('');
    const [content, setContent] = useState('');
    const [originalTitle, setOriginalTitle] = useState('');
    const [tags, setTags] = useState<string[]>([]);
    const [saveError, setSaveError] = useState<string | null>(null);
    const markdownEditorRef = useRef<MarkdownEditorHandle>(null);

    useEffect(() => {
        setIsLoaded(false);

        if (isNew) {
            setTitle('Nova nota');
            setTags([]);
            setContent('');
            setIsLoaded(true);
            return;
        }

        fetch(`http://localhost:8000/notes/${encodeURIComponent(selectedNote)}`)
            .then((r) => r.json())
            .then((data: NoteDetail) => {
                setTitle(data.title);
                setOriginalTitle(data.title);

                const titleLinePattern = new RegExp(`^#\\s*${escapeRegExp(data.title)}\\s*\\n*`);
                const bodyWithoutTitle = data.content.replace(titleLinePattern, '');
                setContent(bodyWithoutTitle);

                const fm = data.frontmatter;
                const rawTags = fm.tags ?? [];
                setTags(Array.isArray(rawTags) ? rawTags : [rawTags]);
                setIsLoaded(true);
            });
    }, [selectedNote]);

    useEffect(() => {
        if (!saveError) return;

        const timeout = setTimeout(() => {
            setSaveError(null);
        }, 3000);

        return () => clearTimeout(timeout);
    }, [saveError]);

    function handleTagKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
        if (e.key === 'Enter') {
            e.preventDefault();
            const newTag = tagInput.trim();
            if (newTag && !tags.includes(newTag)) {
                setTags((prev) => [...prev, newTag]);
            }
            setTagInput('');
        }
    }

    function removeTag(tag: string) {
        setTags((prev) => prev.filter((t) => t !== tag));
    }

    function buildFullContent(): string {
        const tagsYaml = tags.length > 0 ? `[${tags.join(', ')}]` : '[]';
        const frontmatter = `---\ntags: ${tagsYaml}\n---`;

        const titleLinePattern = new RegExp(`^#\\s*${escapeRegExp(title)}\\s*\\n*`);
        const cleanContent = content.replace(titleLinePattern, '');

        return `${frontmatter}\n\n# ${title}\n\n${cleanContent}`;
    }

    function escapeRegExp(text: string): string {
        return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    function handleSave() {
        if (!title.trim()) return;
        setIsSaving(true);
        setSaveError(null);

        const fullContent = buildFullContent();

        if (isNew) {
            fetch('http://localhost:8000/notes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, content: fullContent }),
            })
                .then(async (r) => {
                    if (!r.ok) {
                        const data = await r.json();
                        throw new Error(translateError(data.detail));
                    }
                    return r.json();
                })
                .then(() => onSaved())
                .catch((err) => setSaveError(err.message))
                .finally(() => setIsSaving(false));
            return;
        }

        const saveContent = () =>
            fetch(`http://localhost:8000/notes/${encodeURIComponent(originalTitle)}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: fullContent }),
            });

        const renameIfNeeded = (): Promise<Response | void> => {
            if (title.trim() === originalTitle) return Promise.resolve();
            return fetch(`http://localhost:8000/notes/${encodeURIComponent(originalTitle)}/rename`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ new_title: title.trim() }),
            });
        };

        saveContent()
            .then(() => renameIfNeeded())
            .then(() => onSaved())
            .finally(() => setIsSaving(false));
    }

    function handleDelete() {
        if (isNew) { onClose(); return; }
        setIsDeleting(true);
        fetch(`http://localhost:8000/notes/${encodeURIComponent(selectedNote)}`, {
            method: 'DELETE',
        })
            .then(() => onDeleted())
            .finally(() => setIsDeleting(false));
    }

    const wordCount = content.trim().split(/\s+/).filter(Boolean).length;
    const charCount = content.length;


    return (
        <aside className="h-full bg-surface/30 border-l border-border-hairline flex flex-col">

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border-hairline">
                <span className="text-[10px] uppercase tracking-[0.18em] text-foreground/40">
                    Editor de nota
                </span>
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleSave}
                        disabled={isSaving || !isLoaded}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border-hairline text-[12px] text-foreground/70 hover:border-accent/40 hover:text-foreground transition-colors disabled:opacity-40"
                    >
                        <Save size={12} />
                        {isSaving ? 'Salvando...' : 'Salvar'}
                    </button>
                    <button
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border-hairline text-[12px] text-destructive/70 hover:border-destructive/40 hover:text-destructive transition-colors disabled:opacity-40"
                    >
                        <Trash2 size={12} />
                        {isDeleting ? 'Apagando...' : 'Apagar'}
                    </button>
                    <button onClick={onClose} className="text-foreground/40 hover:text-foreground/80 transition-colors">
                        <X size={16} onClick={handleSave} />
                    </button>
                </div>
            </div>

            {/* Title */}
            <div className="px-6 pt-6 pb-3 border-b border-border-hairline">
                <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Título da nota"
                    className="w-full bg-transparent font-serif text-2xl text-foreground placeholder:text-foreground/30 outline-none disabled:opacity-100"
                />
                {saveError && (
                    <div className="flex items-center justify-center py-2 px-3 rounded-md bg-destructive/70">
                        <p className="text-[12px] text-foreground font-bold">{saveError}</p>
                    </div>
                )}
            </div>

            {/* Metadata */}
            <div className="px-6 py-4 border-b border-border-hairline flex flex-row items-center gap-3">

                {/* Tags */}
                <div className="w-full">
                    <p className="text-[10px] uppercase tracking-[0.12em] text-foreground/40 mb-2">Tags</p>
                    <div className="flex flex-wrap gap-1.5 mb-2">
                        {tags.map((tag) => (
                            <span
                                key={tag}
                                className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-accent-soft border border-accent/20 text-[12px] text-accent"
                            >
                                #{tag}
                                <button onClick={() => removeTag(tag)} className="text-accent/60 hover:text-accent transition-colors">
                                    <X size={10} />
                                </button>
                            </span>
                        ))}
                    </div>
                    <input
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={handleTagKeyDown}
                        placeholder="+ Adicionar tag (Enter para confirmar)"
                        className="w-full bg-transparent text-[13px] text-foreground placeholder:text-foreground/30 outline-none border border-surface-2 py-1.5 px-2 rounded-sm"
                    />
                </div>

                <div className="flex items-center px-2 self-end">
                    <button
                        onClick={() => markdownEditorRef.current?.insertTable()}
                        title="Inserir tabela"
                        className="p-2 rounded-md text-foreground/40 border border-accent/40 hover:text-foreground/80 hover:border-accent transition-colors"
                    >
                        <Table2 size={16} />
                    </button>
                </div>
            </div>

            {/* Body */}
            <div className="flex-1 py-4 overflow-hidden">
                <MarkdownEditor
                    ref={markdownEditorRef}
                    value={content}
                    onChange={setContent}
                    onNoteClick={onNoteClick}
                />
            </div>

            {/* Footer */}
            <div className="px-6 py-3 border-t border-border-hairline flex items-center justify-between">
                <span className="text-[11px] text-foreground/30">
                    {wordCount} palavras · {charCount} caracteres
                </span>
                <span className="text-[11px] text-foreground/30 uppercase tracking-wide">
                    Markdown
                </span>
            </div>

        </aside>
    );
}