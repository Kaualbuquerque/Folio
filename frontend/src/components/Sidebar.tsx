import { useEffect, useState } from "react";
import type { NotesStats } from "../types/notes";

export default function Sidebar() {
    const [stats, setStats] = useState<NotesStats | null>(null);

    useEffect(() => {
        fetch('http://localhost:8000/notes/stats')
            .then((response) => response.json())
            .then((data: NotesStats) => setStats(data))
    }, [])

    return (
        <div>
            <h2>Obsidius</h2>
            <p>Notas: {stats?.total}</p>
            <p>Órfãs: {stats?.orphans}</p>
        </div>
    );
}