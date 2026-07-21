import { useEffect, useState } from 'react';
import { FolderOpen, Menu, Minus, Square, X } from 'lucide-react';

export default function TitleBar() {
    const [vaultName, setVaultName] = useState('');
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isChanging, setIsChanging] = useState(false);

    function fetchVaultName() {
        fetch('http://localhost:8000/vault/name')
            .then((r) => r.json())
            .then((data) => setVaultName(data.name.toLowerCase()));
    }

    useEffect(() => {
        fetchVaultName()
    }, []);

    async function handleChangeVault() {
        setIsMenuOpen(false);
        const folderPath = await window.electron.selectFolder();
        if (!folderPath) return;

        setIsChanging(true);
        fetch('http://localhost:8000/vault/path', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ path: folderPath }),
        })
            .then((r) => r.json())
            .then(() => {
                fetchVaultName();
                window.location.reload();
            })
            .finally(() => setIsChanging(false));
    }

    return (
        <div
            className="h-10 flex items-center justify-between px-4 border-b border-border-hairline bg-background select-none relative"
            style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
        >
            <div
                className="relative flex items-center gap-2"
                style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
            >
                <span className="w-2 h-2 rounded-full bg-accent" />

                <button
                    onClick={() => setIsMenuOpen((prev) => !prev)}
                    disabled={isChanging}
                    className="flex items-center gap-2 text-foreground/50 hover:text-foreground/80 transition-colors px-2 py-1 rounded-md hover:bg-surface-2 disabled:opacity-50"
                >
                    <span className="text-[12px] tracking-[0.04em] lowercase">
                        {isChanging ? 'trocando...' : vaultName}
                    </span>
                    <Menu size={16} className="opacity-50" />
                </button>

                {isMenuOpen && (
                    <div className="absolute top-full mt-1 left-0 bg-surface border border-border-hairline rounded-lg shadow-sm py-1 min-w-45 z-50">
                        <button
                            onClick={handleChangeVault}
                            className="w-full flex items-center gap-2 px-3 py-2 text-[12px] text-foreground/70 hover:bg-surface-2 hover:text-foreground transition-colors text-left"
                        >
                            <FolderOpen size={14} className="opacity-50" />
                            Trocar cofre
                        </button>
                    </div>
                )}
            </div>

            <div
                className="flex items-center gap-1"
                style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
            >
                <button
                    onClick={() => window.electron.minimize()}
                    className="w-8 h-8 flex items-center justify-center text-foreground/40 hover:text-foreground/80 hover:bg-surface-2 rounded transition-colors"
                >
                    <Minus size={12} />
                </button>
                <button
                    onClick={() => window.electron.maximize()}
                    className="w-8 h-8 flex items-center justify-center text-foreground/40 hover:text-foreground/80 hover:bg-surface-2 rounded transition-colors"
                >
                    <Square size={12} />
                </button>
                <button
                    onClick={() => window.electron.close()}
                    className="w-8 h-8 flex items-center justify-center text-foreground/40 hover:text-destructive hover:bg-destructive/10 rounded transition-colors"
                >
                    <X size={12} />
                </button>
            </div>
        </div>
    );
}