export interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
    sources?: string[];
}

export interface ParsedResponse {
    text: string;
    sources: string[];
}

export interface ChatProps {
    onNoteSelect: (title: string) => void;
    hasGroqKey: boolean | null;
    onOpenGroqModal: () => void;
}

export interface UserMessageProps {
    content: string;
}