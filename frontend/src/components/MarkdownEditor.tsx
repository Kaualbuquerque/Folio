import { Editor, defaultValueCtx, editorViewCtx, rootCtx } from '@milkdown/core'
import { Milkdown, MilkdownProvider, useEditor } from '@milkdown/react'
import { commonmark } from '@milkdown/preset-commonmark';
import { listener, listenerCtx } from '@milkdown/plugin-listener';
import { TextSelection } from '@milkdown/prose/state';
import { markdownSyntaxPlugin } from '../lib/markdownSyntaxPlugin';
import type { MarkdownEditorProps } from '../types/editor';
import { automd } from '@milkdown/plugin-automd';

function MarkdownEditorInternal({ value, onChange }: MarkdownEditorProps) {

    const { get } = useEditor((root) => {
        return Editor.make()
            .config((ctx) => {
                ctx.set(rootCtx, root);
                ctx.set(defaultValueCtx, value);
            })
            .use(commonmark)
            .use(automd)
            .use(listener)
            .use(markdownSyntaxPlugin)
            .config((ctx) => {
                ctx.get(listenerCtx).markdownUpdated((_, markdown, prev) => {
                    if (markdown !== prev) {
                        onChange(markdown);
                    }
                });
            });
    }, []);

    function focusEnd(e: React.MouseEvent) {
        const target = e.target as HTMLElement;
        if (target.closest('.ProseMirror')) {
            const proseMirror = target.closest('.ProseMirror') as HTMLElement;
            const lastChild = proseMirror.lastElementChild;

            if (lastChild) {
                const lastRect = lastChild.getBoundingClientRect();
                if (e.clientY < lastRect.bottom) return;
            }
        }

        const editor = get();
        if (!editor) return;

        editor.action((ctx) => {
            const view = ctx.get(editorViewCtx);
            const endPos = view.state.doc.content.size;
            view.focus();
            const selection = TextSelection.near(view.state.doc.resolve(endPos));
            view.dispatch(view.state.tr.setSelection(selection));
        });
    }

    return (
        <div className="h-full w-full cursor-text" onClick={focusEnd}>
            <Milkdown />
        </div>
    );
}

export default function MarkdownEditor({ value, onChange }: MarkdownEditorProps) {
    return (
        <MilkdownProvider>
            <div className="milkdown-editor h-full w-full overflow-auto custom-scrollbar px-1">
                <MarkdownEditorInternal value={value} onChange={onChange} />
            </div>
        </MilkdownProvider>
    )
}