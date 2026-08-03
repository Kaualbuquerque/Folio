import type { ActivePage } from "./pages";

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

