import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import type { MarkdownEditorHandle, MarkdownEditorProps } from "../types/editor";
import { EditorView, keymap } from "@codemirror/view";
import { EditorState } from "@codemirror/state";
import { markdown, markdownLanguage } from '@codemirror/lang-markdown'
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands'
import { languages } from '@codemirror/language-data'
import { syntaxHighlighting } from "@codemirror/language";
import { liveMarkdownField } from "../lib/liveMarkdownPlugin";
import { markdownHighlightStyle } from "../lib/markdownHighlight";
import { Table } from "@lezer/markdown";

const MarkdownEditor = forwardRef<MarkdownEditorHandle, MarkdownEditorProps>(
    ({ value, onChange, onNoteClick }, ref) => {
        const containerRef = useRef<HTMLDivElement>(null);
        const viewRef = useRef<EditorView | null>(null);
        const onNoteClickRef = useRef(onNoteClick);
        onNoteClickRef.current = onNoteClick;

        useImperativeHandle(ref, () => ({
            insertTable() {
                const view = viewRef.current;
                if (!view) return;

                const template = '| Coluna 1 | Coluna 2 |\n| --- | --- |\n|  |  |';
                const pos = view.state.selection.main.head;
                const line = view.state.doc.lineAt(pos);
                const needsNewlineBefore = line.text.trim() !== '';

                const insertText = needsNewlineBefore ? '\n' + template : template;

                view.dispatch({
                    changes: { from: pos, to: pos, insert: insertText },
                    selection: { anchor: pos + insertText.length },
                });
                view.focus();
            },
        }));

        useEffect(() => {
            if (!containerRef.current) return;

            const view = new EditorView({
                state: EditorState.create({
                    doc: value,
                    extensions: [
                        history(),
                        keymap.of([...defaultKeymap, ...historyKeymap]),
                        markdown({
                            base: markdownLanguage,
                            codeLanguages: languages,
                            extensions: [Table],
                        }),
                        syntaxHighlighting(markdownHighlightStyle),
                        liveMarkdownField,
                        EditorView.lineWrapping,
                        EditorView.updateListener.of((update) => {
                            if (update.docChanged) {
                                onChange(update.state.doc.toString());
                            }
                        }),
                        EditorView.domEventHandlers({
                            mousedown(event) {
                                const target = event.target as HTMLElement;

                                const wikilinkEl = target.closest('.cm-wikilink') as HTMLElement | null;
                                if (wikilinkEl) {
                                    const title = wikilinkEl.getAttribute('data-note-title');
                                    if (title && onNoteClickRef.current) {
                                        event.preventDefault();
                                        onNoteClickRef.current(title);
                                        return true;
                                    }
                                }

                                const urlEl = target.closest('.cm-url-link') as HTMLElement | null;
                                if (urlEl) {
                                    const url = urlEl.getAttribute('data-url');
                                    if (url) {
                                        event.preventDefault();
                                        const normalizedUrl = /^https?:\/\//i.test(url) ? url : `https://${url}`;
                                        window.electron.openExternal(normalizedUrl);
                                        return true;
                                    }
                                }

                                return false;
                            },
                        }),
                        EditorView.theme({
                            '&': {
                                height: '100%',
                                fontFamily: 'var(--font-mono)',
                                fontSize: '13px',
                                backgroundColor: 'transparent',
                                color: 'var(--color-foreground)',
                            },
                            '.cm-content': {
                                padding: '0 4px 4rem 4px',
                                caretColor: 'var(--color-accent)',

                            },
                            '.cm-line': {
                                lineHeight: '1.7',
                            },
                            '.cm-focused': {
                                outline: 'none',
                            },
                            '.cm-editor': {
                                height: '100%',
                            },
                            '.cm-scroller': {
                                fontFamily: 'var(--font-mono)',
                                overflow: 'auto',
                            },
                            '&.cm-focused .cm-cursor': {
                                borderLeftColor: 'var(--color-accent)',
                            },
                            '.cm-gutters': {
                                display: 'none',
                            },
                        }),
                    ],
                }),
                parent: containerRef.current,
            });

            viewRef.current = view;

            return () => {
                view.destroy();
            };
        }, []);

        useEffect(() => {
            const view = viewRef.current;
            if (!view) return;

            const current = view.state.doc.toString();
            if (current !== value) {
                view.dispatch({
                    changes: { from: 0, to: current.length, insert: value },
                });
            }
        }, [value]);

        return (
            <div
                ref={containerRef}
                className="h-full w-full overflow-auto custom-scrollbar"
            />
        )
    }
)

export default MarkdownEditor;