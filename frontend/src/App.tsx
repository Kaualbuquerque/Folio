import { Group, Panel, Separator, useDefaultLayout } from 'react-resizable-panels';
import TitleBar from './components/TitleBar';
import Sidebar from './components/Sidebar';
import Chat from './components/Chat';
import NoteEditor from './components/NoteEditor';
import { useTheme } from './hooks/useTheme';
import { useVaultData } from './hooks/useVaultData';
import { useState, useEffect } from 'react';

export default function App() {
    const { isDark, toggleTheme } = useTheme();
    const [selectedNote, setSelectedNote] = useState<string | null>(null);
    const { stats, calendar, notes, isLoading, refresh } = useVaultData();

    const { defaultLayout, onLayoutChanged } = useDefaultLayout({
        id: "vault-layout",
    });

    useEffect(() => {
        refresh();
    }, []);

    function handleSaved() {
        refresh();
        setSelectedNote(null);
    }

    function handleDeleted() {
        refresh();
        setSelectedNote(null);
    }

    return (
        <div className="flex flex-col h-screen overflow-hidden bg-background">
            <TitleBar />

            <Group
                orientation="horizontal"
                className="flex-1"
                defaultLayout={defaultLayout}
                onLayoutChanged={onLayoutChanged}
            >

                <Panel defaultSize="22" minSize="15" maxSize="35" id="sidebar">
                    <Sidebar
                        stats={stats}
                        calendar={calendar}
                        notes={notes}
                        isLoading={isLoading}
                        onNoteSelect={setSelectedNote}
                        onNewNote={() => setSelectedNote('__new__')}
                        onReindex={() => {
                            fetch('http://localhost:8000/reindex', { method: 'POST' })
                                .then(() => refresh());
                        }}
                    />
                </Panel>

                <Separator className="w-px bg-border-hairline hover:bg-accent/40 transition-colors cursor-col-resize" />

                <Panel minSize="30" id="chat">
                    <Chat
                        isDark={isDark}
                        toggleTheme={toggleTheme}
                        onNoteSelect={setSelectedNote}
                    />
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
                                isDark={isDark}
                                onNoteClick={setSelectedNote}
                            />
                        </Panel>
                    </>
                )}

            </Group>
        </div>
    );
}