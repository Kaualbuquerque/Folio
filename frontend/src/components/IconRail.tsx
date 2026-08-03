import { FolderTree, MessageSquare, RefreshCw, SlidersHorizontal } from "lucide-react";
import type { IconRailProps, RailButtonProps } from "../types/iconRail";

function RailButton({ icon, label, onClick, disabled, isActive }: RailButtonProps) {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            title={label}
            className={`
                relative w-10 h-10 flex items-center justify-center rounded-lg transition-colors
                ${isActive
                    ? 'text-accent bg-accent-soft'
                    : 'text-foreground/40 hover:text-foreground/70 hover:bg-surface-2'
                }
                disabled:opacity-30 disabled:cursor-not-allowed
            `}
        >
            {isActive && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-accent rounded-r-full" />
            )}
            {icon}
        </button>
    );
}

export default function IconRail({
    activePage,
    onNavigate,
    isDrawerOpen,
    onToggleDrawer,
    onReindex,
    isReindexing
}: IconRailProps) {
    return (
        <aside className="w-14 h-full bg-surface/40 border-r border-border-hairline flex flex-col items-center py-3 gap-1 shrink-0">

            {/* Home */}
            <div className="mb-3">
                <RailButton
                    icon={<span className="w-2.5 h-2.5 rounded-full bg-accent block" />}
                    label="Início"
                    isActive={activePage === 'home'}
                    onClick={() => onNavigate('home')}
                />
            </div>

            {/* Main navigation */}
            <RailButton
                icon={<MessageSquare size={18} />}
                label="Conversa"
                isActive={activePage === 'chat'}
                onClick={() => onNavigate('chat')}
            />

            <RailButton
                icon={<SlidersHorizontal size={18} />}
                label="Filtros"
                isActive={activePage === 'filters'}
                onClick={() => onNavigate('filters')}
            />

            <span className="border-b border-border-hairline w-12"/>

            {/* File drawer */}
            <RailButton
                icon={<FolderTree size={18} />}
                label="Arquivos"
                isActive={isDrawerOpen}
                onClick={onToggleDrawer}
            />

            {/* Reindex in footer */}
            <RailButton
                icon={<RefreshCw size={16} className={isReindexing ? 'animate-spin' : ''} />}
                label="Reindexar cofre"
                onClick={onReindex}
                disabled={isReindexing}
            />

        </aside>
    )
}