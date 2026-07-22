export interface MarkdownEditorProps {
    value: string;
    onChange: (value: string) => void;
    onNoteClick?: (title: string) => void;
}