import { Group, Panel, Separator, useDefaultLayout } from 'react-resizable-panels';
import TitleBar from './components/TitleBar';
import Chat from './components/Chat';
import NoteEditor from './components/NoteEditor';
import { useTheme } from './hooks/useTheme';
import { useVaultData } from './hooks/useVaultData';
import { useState, useEffect } from 'react';
import IconRail from './components/IconRail';
import HomePage from './components/pages/HomePage';
import type { ActivePage } from './types/pages';
import FilterPage from './components/pages/FilterPage';

export default function App() {
    const { isDark, toggleTheme } = useTheme();
    const [selectedNote, setSelectedNote] = useState<string | null>(null);
    const [activePage, setActivePage] = useState<ActivePage>('home');
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [isReindexing, setIsReindexing] = useState(false);
    const [vaultName, setVaultName] = useState('')
    const { stats, calendar, notes, isLoading, refresh } = useVaultData();

    const { defaultLayout, onLayoutChanged } = useDefaultLayout({
        id: "vault-layout",
    });

    useEffect(() => {
        refresh();
    }, []);

    useEffect(() => {
        fetch('http://localhost:8000/vault/name')
            .then((r) => r.json())
            .then((data) => setVaultName(data.name))
    }, [])

    function handleSaved() {
        refresh();
        setSelectedNote(null);
    }

    function handleDeleted() {
        refresh();
        setSelectedNote(null);
    }

    function handleReindex() {
        setIsReindexing(true);
        fetch('http://localhost:8000/reindex', { method: 'POST' })
            .then(() => refresh())
            .finally(() => setIsReindexing(false));
    }

    return (
        <div className="flex flex-col h-screen overflow-hidden bg-background">
            <TitleBar isDark={isDark} toggleTheme={toggleTheme} />

            <div className="flex flex-1 overflow-hidden">

                <IconRail
                    activePage={activePage}
                    onNavigate={setActivePage}
                    isDrawerOpen={isDrawerOpen}
                    onToggleDrawer={() => setIsDrawerOpen((prev) => !prev)}
                    onReindex={handleReindex}
                    isReindexing={isReindexing}
                />

                <Group
                    orientation="horizontal"
                    className="flex-1"
                    defaultLayout={defaultLayout}
                    onLayoutChanged={onLayoutChanged}
                >
                    <Panel minSize="30" id="main">
                        {activePage === 'chat' && (
                            <Chat
                                onNoteSelect={setSelectedNote}
                            />
                        )}
                        {activePage === 'home' && (
                            <HomePage
                                vaultName={vaultName}
                                onNavigate={setActivePage}
                                onOpenDrawer={() => setIsDrawerOpen(!isDrawerOpen)}
                            />
                        )}
                        {activePage === 'filters' && (
                            <FilterPage
                                stats={stats}
                                calendar={calendar}
                                notes={notes}
                                isLoading={isLoading}
                                onNoteSelect={setSelectedNote}
                            />
                        )}
                    </Panel>

                    {selectedNote && (
                        <>
                            <Separator className="w-px bg-border-hairline hover:bg-accent/40 transition-colors cursor-col-resize" />
                            <Panel defaultSize="28" minSize="20" maxSize="45" id="editor">
                                <NoteEditor
                                    selectedNote={selectedNote}
                                    onClose={() => setSelectedNote(null)}
                                    onSaved={handleSaved}
                                    onDeleted={handleDeleted}
                                    onNoteClick={setSelectedNote}
                                />
                            </Panel>
                        </>
                    )}
                </Group>

            </div>
        </div>
    );
}