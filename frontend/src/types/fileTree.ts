export type FileTreeNode = FileTreeFile | FileTreeFolder;

export interface FileTreeFile {
    type: 'file';
    name: string;
    path: string;
}

export interface FileTreeFolder {
    type: 'folder';
    name: string;
    children: FileTreeFile[];
}

export interface FileTree {
    name: string;
    children: FileTreeNode[];
}

export interface TreeNodeProps {
    node: FileTreeNode;
    onNoteSelect: (title: string) => void;
    depth: number;
}