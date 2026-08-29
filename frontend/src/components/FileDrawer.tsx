import { useState } from "react";
import type { FileTree, FileTreeNode, TreeNodeProps } from "../types/fileTree";
import { ChevronDown, ChevronRight, FilePlus, FileText, Folder, FolderPlus, Trash2 } from "lucide-react";
import NewFolderModal from "./modal/NewFolderModal";
import ConfirmModal from "./modal/ConfirmModal";

interface FileDrawerProps {
    fileTree: FileTree | null;
    onNoteSelect: (title: string) => void;
    onNewNote: () => void;
    onFolderCreated: () => void;
}

function countFiles(node: FileTreeNode): number {
    if (node.type === 'file') return 1;
    return node.children.reduce((sum, child) => sum + countFiles(child), 0);
}

function TreeNode({ node, onNoteSelect, depth, onDeleteFolder }: TreeNodeProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);
    const [showConfirmDelete, setShowConfirmDelete] = useState(false);

    function handleContextMenu(e: React.MouseEvent) {
        e.preventDefault();
        setContextMenu({ x: e.clientX, y: e.clientY });
    }

    function handleDeleteClick() {
        setContextMenu(null);
        setShowConfirmDelete(true);
    }

    function handleConfirmDelete() {
        setShowConfirmDelete(false);
        if (node.type === 'folder') {
            onDeleteFolder(node.path);
        }
    }

    if (node.type === 'file') {
        return (
            <button
                onClick={() => onNoteSelect(node.name)}
                style={{ paddingLeft: `${depth * 14 + 8}px` }}
                className="w-full flex items-center gap-2 py-1.5 pr-2 text-[13px] text-foreground/70 hover:bg-surface-2 hover:text-foreground rounded-md transition-colors text-left"
            >
                <FileText size={13} className="opacity-40 shrink-0" />
                <span className="truncate">{node.name}</span>
            </button>
        );
    }

    const fileCount = countFiles(node);

    return (
        <div>
            <button
                onClick={() => setIsExpanded((prev) => !prev)}
                onContextMenu={handleContextMenu}
                style={{ paddingLeft: `${depth * 14 + 8}px` }}
                className="w-full flex items-center gap-1.5 py-1.5 pr-2 text-[13px] text-foreground/80 hover:bg-surface-2 rounded-md transition-colors text-left"
            >
                {isExpanded ? <ChevronDown size={13} className="opacity-50" /> : <ChevronRight size={13} className="opacity-50" />}
                <Folder size={13} className="opacity-50" />
                <span className="truncate flex-1">{node.name}</span>
                <span className="text-[11px] text-foreground/30">{fileCount}</span>
            </button>

            {contextMenu && (
                <>
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setContextMenu(null)}
                    />
                    <div
                        className="fixed z-50 bg-surface border border-border-hairline rounded-lg shadow-sm p-1 min-w-40"
                        style={{ top: contextMenu.y, left: contextMenu.x }}
                    >
                        <button
                            onClick={handleDeleteClick}
                            className="w-full flex items-center gap-2 px-3 py-2 text-[12px] text-destructive hover:bg-destructive/10 transition-colors text-left"
                        >
                            <Trash2 size={13} />
                            Apagar pasta
                        </button>
                    </div>
                </>
            )}

            {isExpanded && (
                <div>
                    {node.children.map((child, i) => (
                        <TreeNode key={i} node={child} onNoteSelect={onNoteSelect} depth={depth + 1} onDeleteFolder={onDeleteFolder} />
                    ))}
                </div>
            )}

            {showConfirmDelete && node.type === 'folder' && (
                <ConfirmModal
                    title="Apagar pasta"
                    message={`Tem certeza que deseja apagar a pasta "${node.name}" e todo o seu conteúdo? Essa ação não pode ser desfeita.`}
                    confirmLabel="Apagar"
                    onConfirm={handleConfirmDelete}
                    onCancel={() => setShowConfirmDelete(false)}
                />
            )}
        </div>
    );
}

export default function FileDrawer({ fileTree, onNoteSelect, onNewNote, onFolderCreated }: FileDrawerProps) {
    const [isNewFolderModalOpen, setIsNewFolderModalOpen] = useState(false);

    function handleDeleteFolder(path: string) {
        fetch(`http://localhost:8000/vault/folder?path=${encodeURIComponent(path)}`, {
            method: 'DELETE',
        })
            .then(() => onFolderCreated())
            .catch(() => alert('Não foi possível apagar a pasta'));
    }

    if (!fileTree) {
        return (
            <aside className="w-full h-full bg-surface/30 border-r border-border-hairline flex items-center justify-center shrink-0 ">
                <p className="text-[13px] text-foreground/40">Carregando...</p>
            </aside>
        );
    }

    return (
        <aside className="w-full h-full bg-surface/30 border-r border-border-hairline flex flex-col shrink-0">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border-hairline">
                <span className="text-[10px] uppercase tracking-[0.12em] text-foreground/50">
                    {fileTree.name}
                </span>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setIsNewFolderModalOpen(true)}
                        title="Nova pasta"
                        className="text-foreground/40 hover:text-foreground/80 transition-colors"
                    >
                        <FolderPlus size={14} />
                    </button>
                    <button
                        onClick={onNewNote}
                        title="Nova nota"
                        className="text-foreground/40 hover:text-foreground/80 transition-colors"
                    >
                        <FilePlus size={14} />
                    </button>
                </div>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar py-2">
                {fileTree.children.map((node, i) => (
                    <TreeNode key={i} node={node} onNoteSelect={onNoteSelect} depth={0} onDeleteFolder={handleDeleteFolder} />
                ))}
            </div>

            {isNewFolderModalOpen && (
                <NewFolderModal
                    onClose={() => setIsNewFolderModalOpen(false)}
                    onCreated={onFolderCreated}
                />
            )}
        </aside>
    );
}