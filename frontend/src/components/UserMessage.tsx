import { useState } from "react";
import type { UserMessageProps } from "../types/chat";

const CHAR_LIMIT = 280;

export default function UserMessage({ content }: UserMessageProps) {
    const [isExpanded, setIsExpanded] = useState(false);

    const isLong = content.length > CHAR_LIMIT;
    const displayContent = isLong && !isExpanded
        ? content.slice(0, CHAR_LIMIT).trimEnd() + '...'
        : content;

    return (
        <div className="flex justify-end w-full min-w-0">
            <div className="flex flex-col items-end gap-1 max-w-3xl min-w-0">
                <div className="bg-accent text-accent-foreground px-4 py-2.5 rounded-2xl rounded-tr-sm text-[14px] break-all overflow-hidden w-full whitespace-pre-wrap text-justify">
                    {displayContent}
                </div>
                {isLong && (
                    <button
                        onClick={() => setIsExpanded((prev) => !prev)}
                        className="text-[12px] text-foreground/40 hover:text-foreground/70 transition-colors px-1"
                    >
                        {isExpanded ? 'Mostrar menos' : 'Mostrar mais'}
                    </button>
                )}
            </div>
        </div>
    );
}