import { X } from "lucide-react";
import { useState } from "react";

interface NewFolderModalProps {
    onClose: () => void;
    onCreated: () => void;
}

export default function NewFolderModal({ onClose, onCreated }: NewFolderModalProps) {
    const [name, setName] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    function handleCreate() {
        if (!name.trim()) return;
        setIsSaving(true);
        setError(null);

        fetch('http://localhost:8000/vault/folder', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ path: name.trim() }),
        })
            .then(async (r) => {
                if (!r.ok) {
                    const data = await r.json();
                    throw new Error(data.detail || 'Não foi possível criar a pasta');
                }
                return r.json();
            })
            .then(() => {
                onCreated();
                onClose();
            })
            .catch((err) => setError(err.message))
            .finally(() => setIsSaving(false));
    }

    function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
        if (e.key === 'Enter') handleCreate();
    }

    return (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="w-full max-w-sm bg-surface border border-border-hairline rounded-xl p-6 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                    <h2 className="font-serif text-xl text-foreground">Nova pasta</h2>
                    <button onClick={onClose} className="text-foreground/40 hover:text-foreground/80 transition-colors">
                        <X size={16} />
                    </button>
                </div>

                <input
                    autoFocus
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Nome da pasta"
                    className="w-full bg-surface-2 border border-border-hairline rounded-lg px-3 py-2 text-[13px] text-foreground placeholder:text-foreground/30 outline-none focus:border-accent/40"
                />

                {error && <p className="text-[12px] text-destructive">{error}</p>}

                <div className="flex items-center justify-end gap-2 mt-2">
                    <button
                        onClick={onClose}
                        className="px-3 py-1.5 rounded-lg text-[13px] text-foreground/60 hover:text-foreground/80 transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleCreate}
                        disabled={isSaving || !name.trim()}
                        className="px-3 py-1.5 rounded-lg bg-accent text-accent-foreground text-[13px] disabled:opacity-50 transition-opacity"
                    >
                        {isSaving ? 'Criando...' : 'Criar pasta'}
                    </button>
                </div>
            </div>
        </div>
    );
}