import { useCallback, useState } from "react";
import { type NotesCalendar, type NotesStats, type Notes, type VaultData } from "../types/notes";
import type { FileTree } from "../types/fileTree";

export function useVaultData(): VaultData {
    const [stats, setStats] = useState<NotesStats | null>(null);
    const [calendar, setCalendar] = useState<NotesCalendar | null>(null);
    const [notes, setNotes] = useState<Notes[]>([]);
    const [fileTree, setFileTree] = useState<FileTree | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const refresh = useCallback(() => {
        setIsLoading(true);
        Promise.all([
            fetch('http://localhost:8000/notes/stats').then((r) => r.json()),
            fetch('http://localhost:8000/notes/calendar').then((r) => r.json()),
            fetch('http://localhost:8000/notes').then((r) => r.json()),
            fetch('http://localhost:8000/vault/tree').then((r) => r.json()),
        ])
            .then(([newStats, newCalendar, newNotes, newTree]) => {
                setStats(newStats);
                setCalendar(newCalendar);
                setNotes(newNotes);
                setFileTree(newTree);
            })
            .finally(() => setIsLoading(false));
    }, []);

    return { stats, calendar, notes, fileTree, isLoading, refresh };
}