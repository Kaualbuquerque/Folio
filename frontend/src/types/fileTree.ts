export type FileTreeNode = FileTreeFile | FileTreeFolder;

export interface FileTreeFile {
    type: 'file';
    name: string;
    path: string;
}

export interface FileTreeFolder {
    type: 'folder';
    name: string;
    path: string;
    children: FileTreeNode[];
}

export interface FileTree {
    name: string;
    children: FileTreeNode[];
}

export interface TreeNodeProps {
    node: FileTreeNode;
    onNoteSelect: (title: string) => void;
    depth: number;
    onDeleteFolder : (path: string) => void;
    onMoveItem: (source: string, destination: string) => void;
}