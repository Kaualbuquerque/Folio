import { useState } from "react";
import type { FileTree, FileTreeNode, TreeNodeProps } from "../types/fileTree";
import { ChevronDown, ChevronRight, FilePlus, FileText, Folder } from "lucide-react";

interface FileDrawerProps {
    fileTree: FileTree | null;
    onNoteSelect: (title: string) => void;
    onNewNote: () => void;
}

function countFiles(node: FileTreeNode): number {
    if (node.type === 'file') return 1;
    return node.children.reduce((sum, child) => sum + countFiles(child), 0);
}

function TreeNode({ node, onNoteSelect, depth }: TreeNodeProps) {
    const [isExpanded, setIsExpanded] = useState(true);

    if (node.type === 'file') {
        return (
            <button
                onClick={() => onNoteSelect(node.name)}
                style={{ paddingLeft: `${depth * 14 + 8}px` }}
                className="w-full flex items-center gap-2 py-1.5 pr-2 text-[13px] text-foreground/70  hover:bg-surface-2 hover:text-foreground rounded-md transition-colors text-left"
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
                style={{ paddingLeft: `${depth * 14 + 8}px` }}
                className="w-full flex items-center gap-1.5 py-1.5 pr-2 text-[13px] text-foreground/80 hover:bg-surface-2 rounded-md transition-colors text-left"
            >
                {isExpanded ? <ChevronDown size={13} className="opacity-50" /> : <ChevronRight size={13} className="opacity-50" />}
                <Folder size={13} className="opacity-50" />
                <span className="truncate flex-1">{node.name}</span>
                <span className="text-[11px] text-foreground/30">{fileCount}</span>
            </button>

            {isExpanded && (
                <div>
                    {node.children.map((child, i) => (
                        <TreeNode key={i} node={child} onNoteSelect={onNoteSelect} depth={depth + 1} />
                    ))}
                </div>
            )}
        </div>
    );
}

export default function FileDrawer({ fileTree, onNoteSelect, onNewNote }: FileDrawerProps) {
    if (!fileTree) {
        return (
            <aside className="w-60 h-full bg-surface/30 border-r border-border-hairline flex items-center justify-center shrink-0">
                <p className="text-[13px] text-foreground/40">Carregando...</p>
            </aside>
        );
    }

    return (
        <aside className="w-60 h-full bg-surface/30 border-r border-border-hairline flex flex-col shrink-0">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border-hairline">
                <span className="text-[10px] uppercase tracking-[0.12em] text-foreground/50">
                    {fileTree.name}
                </span>
                <button
                    onClick={onNewNote}
                    title="Nova nota"
                    className="text-foreground/40 hover:text-foreground/80 transition-colors"
                >
                    <FilePlus size={14} />
                </button>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar py-2">
                {fileTree.children.map((node, i) => (
                    <TreeNode key={i} node={node} onNoteSelect={onNoteSelect} depth={0} />
                ))}
            </div>
        </aside>
    );
}