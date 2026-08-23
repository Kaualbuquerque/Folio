import { X } from "lucide-react";
import { useState } from "react";

interface GroqKeyModalProps {
    onClose: () => void;
    onSaved: () => void;
}

export default function GroqKeyModal({ onClose, onSaved }: GroqKeyModalProps) {
    const [key, setKey] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    function handleSave() {
        if (!key.trim()) return;
        setIsSaving(true);
        setError(null);

        fetch('http://localhost:8000/settings/groq-key', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ key: key.trim() }),
        }).then((r) => {
            if (!r.ok) throw new Error('Não foi possível salvar a chave');
        }).then(() => {
            onSaved();
            onClose();
        }).catch((err) => setError(err.message))
            .finally(() => setIsSaving(false));
    }

    return (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="w-full max-w-md bg-surface border border-border-hairline rounded-xl p-6 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                    <h2 className="font-serif text-xl text-foreground">Chave da Groq</h2>
                    <button onClick={onClose} className="text-foreground/40 hover:text-foreground/80 transition-colors">
                        <X size={16} />
                    </button>
                </div>

                <p className="text-[13px] text-foreground/60 leading-relaxed">
                    O chat do Folio usa a Groq para responder suas perguntas com base nas notas. Crie uma conta gratuita em{' '}
                    <button
                        onClick={() => window.electron.openExternal('https://console.groq.com')}
                        className="text-accent underline"
                    >
                        console.groq.com
                    </button>{' '}
                    e cole sua chave de API abaixo.
                </p>

                <input
                    type="password"
                    value={key}
                    onChange={(e) => setKey(e.target.value)}
                    placeholder="gsk_..."
                    className="w-full bg-surface-2 border border-border-hairline rounded-lg px-3 py-2 text-[13px] text-foreground placeholder:text-foreground/30 outline-none focus:border-accent/40"
                />

                {error && (
                    <p className="text-[12px] text-destructive">{error}</p>
                )}

                <div className="flex items-center justify-end gap-2 mt-2">
                    <button
                        onClick={onClose}
                        className="px-3 py-1.5 rounded-lg text-[13px] text-foreground/60 hover:text-foreground/80 transition-colors"
                    >
                        Fechar
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isSaving || !key.trim()}
                        className="px-3 py-1.5 rounded-lg bg-accent text-accent-foreground text-[13px] disabled:opacity-50 transition-opacity"
                    >
                        {isSaving ? 'Salvando...' : 'Salvar chave'}
                    </button>
                </div>
            </div>
        </div>
    )
}