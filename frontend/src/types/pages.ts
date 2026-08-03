export type ActivePage = 'home' | 'chat' | 'filters';

export interface HomePageProps {
    vaultName: string;
    onNavigate: (page: ActivePage) => void;
    onOpenDrawer: () => void;
} 