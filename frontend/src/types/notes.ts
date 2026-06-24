export interface NotesStats {
    total: number;
    orphans: number;
    tags: Record<string, number>;
}