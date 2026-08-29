interface ConfirmModalProps {
    title: string;
    message: string;
    confirmLabel?: string;
    onConfirm: () => void;
    onCancel: () => void;
}

export default function ConfirmModal({ title, message, confirmLabel, onConfirm, onCancel }: ConfirmModalProps) {
    return (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="w-full max-w-sm bg-surface border border-border-hairline rounded-xl p-6 flex flex-col gap-4">
                <h2 className="font-serif text-xl text-foreground">{title}</h2>
                <p className="text-[13px] text-foreground/60 leading-relaxed">{message}</p>

                <div className="flex items-center justify-end gap-2 mt-2">
                    <button
                        onClick={onCancel}
                        className="px-3 py-1.5 rounded-lg text-[13px] text-foreground/60 hover:text-foreground/80 transition-colors"
                    >
                        Cancelar
                    </button>

                    <button
                        onClick={onConfirm}
                        className="px-3 py-1.5 rounded-lg bg-destructive text-accent-foreground text-[13px] hover:opacity-90 transition-opacity"
                    >
                        {confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    )
}