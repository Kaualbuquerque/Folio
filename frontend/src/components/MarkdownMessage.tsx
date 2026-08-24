import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useTheme } from '../hooks/useTheme';

interface MarkdownMessageProps {
    content: string;
}

export default function MarkdownMessage({ content }: MarkdownMessageProps) {
    const { isDark } = useTheme();

    return (
        <div className="markdown-message">
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                    code({ className, children, ...props }) {
                        const match = /language-(\w+)/.exec(className || '');
                        const isInline = !match;

                        if (isInline) {
                            return (
                                <code className="markdown-inline-code" {...props}>
                                    {children}
                                </code>
                            );
                        }

                        return (
                            <SyntaxHighlighter
                                style={isDark ? oneDark : oneLight}
                                language={match[1]}
                                PreTag="div"
                                customStyle={{
                                    margin: '0.6em 0',
                                    borderRadius: '8px',
                                    fontSize: '12.5px',
                                    background: 'var(--color-surface)',
                                }}
                                codeTagProps={{
                                    style: {
                                        background: 'transparent',
                                    },
                                }}
                            >
                                {String(children).replace(/\n$/, '')}
                            </SyntaxHighlighter>
                        );
                    },
                }}
            >
                {content}
            </ReactMarkdown>
        </div>
    );
}