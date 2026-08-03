import type { Notes, NotesCalendar, NotesStats } from "./notes";

export type ActivePage = 'home' | 'chat' | 'filters';

export interface HomePageProps {
    vaultName: string;
    onNavigate: (page: ActivePage) => void;
    onOpenDrawer: () => void;
}

export interface FilterPageProps {
    stats: NotesStats | null;
    calendar: NotesCalendar | null;
    notes: Notes[];
    isLoading: boolean;
    onNoteSelect: (title: string) => void;
}