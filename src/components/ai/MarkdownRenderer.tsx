// ============================================================================
// DevPilot — ChatGPT-Grade Markdown & Technical Code Renderer
// ============================================================================
import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Check, Copy, Code2, Terminal, FileCode } from 'lucide-react';

interface MarkdownRendererProps {
  content: string;
  isStreaming?: boolean;
}

interface CodeBlockProps {
  language: string;
  code: string;
}

function CodeBlock({ language, code }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const cleanLang = (language || 'code').replace(/^language-/, '').toLowerCase();

  return (
    <div className="my-4 rounded-xl overflow-hidden border border-slate-200/90 dark:border-slate-800 bg-slate-900 shadow-sm text-slate-100 font-mono text-[13px]">
      {/* Code Header Bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-slate-950/80 border-b border-slate-800/80 select-none">
        <div className="flex items-center gap-2">
          {cleanLang === 'bash' || cleanLang === 'sh' || cleanLang === 'terminal' ? (
            <Terminal size={14} className="text-emerald-400" />
          ) : cleanLang === 'python' || cleanLang === 'py' ? (
            <FileCode size={14} className="text-yellow-400" />
          ) : cleanLang === 'typescript' || cleanLang === 'ts' || cleanLang === 'tsx' ? (
            <FileCode size={14} className="text-blue-400" />
          ) : cleanLang === 'cpp' || cleanLang === 'c++' || cleanLang === 'c' ? (
            <FileCode size={14} className="text-indigo-400" />
          ) : (
            <Code2 size={14} className="text-cyan-400" />
          )}
          <span className="font-semibold text-xs tracking-wide text-slate-300 uppercase">
            {cleanLang}
          </span>
        </div>

        <button
          type="button"
          onClick={handleCopy}
          aria-label="Copy code to clipboard"
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
        >
          {copied ? (
            <>
              <Check size={13} className="text-emerald-400" />
              <span className="text-emerald-400">Copied!</span>
            </>
          ) : (
            <>
              <Copy size={13} />
              <span>Copy code</span>
            </>
          )}
        </button>
      </div>

      {/* Code Content */}
      <div className="overflow-x-auto p-4 leading-relaxed font-mono">
        <pre className="m-0 p-0 text-[13px] leading-[1.65] font-mono text-slate-100 whitespace-pre">
          <code>{code}</code>
        </pre>
      </div>
    </div>
  );
}

export default function MarkdownRenderer({ content, isStreaming }: MarkdownRendererProps) {
  // Graceful fallback for empty responses
  if (!content && isStreaming) {
    return (
      <div className="flex items-center gap-1.5 py-1">
        <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
        <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse delay-100" />
        <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse delay-200" />
      </div>
    );
  }

  return (
    <div className="prose-chat text-slate-800 dark:text-slate-100 max-w-none select-text">
      <ReactMarkdown
        components={{
          // Paragraphs
          p({ children }) {
            return <p className="mb-4 last:mb-0 leading-[1.7] text-[15.5px]">{children}</p>;
          },

          // Headings
          h1({ children }) {
            return (
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white mt-6 mb-3 pb-2 border-b border-slate-200/80 dark:border-slate-800">
                {children}
              </h1>
            );
          },
          h2({ children }) {
            return (
              <h2 className="text-lg sm:text-xl font-semibold tracking-tight text-slate-900 dark:text-slate-100 mt-5 mb-2.5">
                {children}
              </h2>
            );
          },
          h3({ children }) {
            return (
              <h3 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-slate-200 mt-4 mb-2">
                {children}
              </h3>
            );
          },
          h4({ children }) {
            return (
              <h4 className="text-sm sm:text-base font-semibold text-slate-800 dark:text-slate-300 mt-3 mb-1.5">
                {children}
              </h4>
            );
          },

          // Lists
          ul({ children }) {
            return <ul className="list-disc pl-5 my-3 space-y-1.5">{children}</ul>;
          },
          ol({ children }) {
            return <ol className="list-decimal pl-5 my-3 space-y-1.5">{children}</ol>;
          },
          li({ children }) {
            return <li className="leading-[1.7] text-[15.5px] pl-1">{children}</li>;
          },

          // Bold & Emphasis
          strong({ children }) {
            return <strong className="font-semibold text-slate-900 dark:text-white">{children}</strong>;
          },
          em({ children }) {
            return <em className="italic text-slate-800 dark:text-slate-200">{children}</em>;
          },

          // Blockquotes
          blockquote({ children }) {
            return (
              <blockquote className="border-l-4 border-indigo-500/80 dark:border-cyan-400 pl-4 py-1.5 my-4 bg-indigo-50/50 dark:bg-slate-900/60 rounded-r-lg italic text-slate-700 dark:text-slate-300">
                {children}
              </blockquote>
            );
          },

          // Horizontal Divider
          hr() {
            return <hr className="my-6 border-slate-200 dark:border-slate-800" />;
          },

          // Links
          a({ href, children }) {
            return (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-600 dark:text-cyan-400 underline decoration-indigo-400/50 dark:decoration-cyan-400/50 underline-offset-2 hover:text-indigo-700 dark:hover:text-cyan-300 transition-colors"
              >
                {children}
              </a>
            );
          },

          // Tables
          table({ children }) {
            return (
              <div className="overflow-x-auto my-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
                <table className="w-full text-left text-sm border-collapse">{children}</table>
              </div>
            );
          },
          thead({ children }) {
            return (
              <thead className="bg-slate-100/80 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 border-b border-slate-200 dark:border-slate-700 font-semibold text-xs uppercase tracking-wider">
                {children}
              </thead>
            );
          },
          tbody({ children }) {
            return <tbody className="divide-y divide-slate-200/60 dark:divide-slate-800/60">{children}</tbody>;
          },
          tr({ children }) {
            return <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">{children}</tr>;
          },
          th({ children }) {
            return <th className="px-4 py-3 font-semibold text-xs tracking-wider">{children}</th>;
          },
          td({ children }) {
            return <td className="px-4 py-2.5 text-[14px] leading-normal">{children}</td>;
          },

          // Code blocks & Inline code
          code(props: any) {
            const { inline, className, children, ...rest } = props;
            const match = /language-(\w+)/.exec(className || '');
            const codeString = String(children).replace(/\n$/, '');

            if (!inline && (match || codeString.includes('\n'))) {
              return (
                <CodeBlock
                  language={match ? match[1] : 'text'}
                  code={codeString}
                />
              );
            }

            return (
              <code
                className="px-1.5 py-0.5 rounded-md font-mono text-[13px] bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-cyan-300 border border-slate-200/70 dark:border-slate-700/60 font-medium"
                {...rest}
              >
                {children}
              </code>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>

      {/* Streaming pulse cursor */}
      {isStreaming && (
        <span
          className="inline-block w-2 h-4 ml-1 align-middle bg-cyan-500 dark:bg-cyan-400 animate-pulse rounded-xs"
          aria-hidden="true"
        />
      )}
    </div>
  );
}
