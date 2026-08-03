import { FolderTree, MessageSquare, SlidersHorizontal } from "lucide-react";
import type { HomePageProps } from "../../types/pages";



interface ShortcutCard {
    icon: React.ReactNode;
    label: string;
    hint: string;
    onClick: () => void;
}

export default function HomePage({ vaultName, onNavigate, onOpenDrawer }: HomePageProps) {
    const shortcuts: ShortcutCard[] = [
        {
            icon: <MessageSquare size={16} className="opacity-60 text-foreground" />,
            label: 'Conversar',
            hint: 'Perguntar ao cofre',
            onClick: () => onNavigate('chat'),
        },
        {
            icon: <SlidersHorizontal size={16} className="opacity-60 text-foreground" />,
            label: 'Filtrar',
            hint: 'Calendário e tags',
            onClick: () => onNavigate('filters'),
        },
        {
            icon: <FolderTree size={16} className="opacity-60 text-foreground" />,
            label: 'Arquivos',
            hint: 'Explorar pastas',
            onClick: onOpenDrawer,
        },
    ];

    return (
        <div className="h-full flex flex-col items-center justify-center gap-8 px-6">
            <div className="flex flex-col items-center gap-6 text-center">
                <div className="w-14 h-14 rounded-2xl bg-surface-2 flex items-center justify-center">
                    <span className="w-3 h-3 rounded-full bg-accent block" />
                </div>

                <div className="flex flex-col gap-3">
                    <h1 className="font-serif italic text-4xl text-foreground">Folio</h1>
                    <p className="text-[14px] text-foreground/50 max-w-md">
                        Conectado a <span className="text-foreground/80 font-medium">{vaultName}</span>. Escolha por onde começar — ou apenas fique nesta página em silêncio.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-3 w-full max-w-xl">
                {shortcuts.map((shortcut) => (
                    <button
                        key={shortcut.label}
                        onClick={shortcut.onClick}
                        className="flex flex-col gap-1 p-4 rounded-xl bg-surface/40 border border-border-hairline hover:border-accent/40 hover:bg-surface-2 transition-colors text-left cursor-pointer"
                    >
                        {shortcut.icon}
                        <span className="text-[14px] font-medium text-foreground">{shortcut.label}</span>
                        <span className="text-[12px] text-foreground/40">{shortcut.hint}</span>
                    </button>
                ))}
            </div>
        </div>
    )
}