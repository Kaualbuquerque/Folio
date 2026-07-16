import type { Mark } from '@milkdown/prose/model';

export const MARK_SYNTAX: Record<string, { open: string; close: string }> = {
    strong: { open: '**', close: '**' },
    emphasis: { open: '*', close: '*' },
    strike_through: { open: '~~', close: '~~' },
    inlineCode: { open: '`', close: '`' },
};

export interface MarkdownEditorProps {
    value: string;
    onChange: (value: string) => void;
}

export interface MarkRange {
    markName: string;
    mark: Mark;
    from: number;
    to: number;
}