import type { Notes, NotesCalendar, NotesStats } from "./notes";

export type ActivePage = 'home' | 'chat' | 'filters';

export interface SideBarProps {
    stats: NotesStats;
    calendar: NotesCalendar | null;
    notes: Notes[];
    isLoading: boolean;
    onNoteSelect: (title: string) => void;
    onNewNote: () => void;
    onReindex: () => void;
}

export interface SidebarHandle {
    refresh: () => void;

}

export interface IconRailProps {
    activePage: ActivePage;
    onNavigate: (page: ActivePage) => void;
    isDrawerOpen: boolean;
    onToggleDrawer: () => void;
    onReindex: () => void;
    isReindexing: boolean;
}

export interface RailButtonProps {
    icon: React.ReactNode;
    label: string;
    isActive?: boolean;
    onClick: () => void;
    disabled?: boolean;
}

