// ============================================================================
// DevPilot — ChatGPT-Style Conversation Stream & Message Layout
// ============================================================================
import React, { useRef, useEffect, useState } from 'react';
import {
  Sparkles, Copy, Check, RotateCw, ThumbsUp, ThumbsDown,
  Bookmark, BookmarkCheck, AlertCircle, ArrowRight, User
} from 'lucide-react';
import MarkdownRenderer from './MarkdownRenderer';
import type { ChatMessage } from './AICopilotChat';

interface ConversationViewProps {
  messages: ChatMessage[];
  streamingText: string | null;
  isStreaming: boolean;
  onRegenerate: () => void;
  onBookmarkToggle: (id: string) => void;
  onPromptClick: (prompt: string) => void;
  userName?: string;
  error?: string | null;
  onRetry?: () => void;
}

const STARTER_PROMPTS = [
  {
    category: 'Roadmap',
    icon: '🗺️',
    title: 'Full-Stack Developer Roadmap',
    prompt: 'Provide a structured, multi-stage roadmap to master modern Full-Stack Web Development from scratch to production readiness.',
  },
  {
    category: 'Code Lab',
    icon: '⚡',
    title: 'Pointers & Memory in C++',
    prompt: 'Explain dynamic memory allocation, pointers, and memory leaks in C++ with runnable code and best practices.',
  },
  {
    category: 'Architecture',
    icon: '🏛️',
    title: 'Distributed System Design',
    prompt: 'Design a scalable, highly available URL shortener service like TinyURL. Break down data model, hashing, and caching with Redis.',
  },
  {
    category: 'DSA & Algorithms',
    icon: '🧠',
    title: 'Dynamic Programming Patterns',
    prompt: 'Explain the core intuition behind Dynamic Programming (Memoization vs Tabulation) using the 0/1 Knapsack problem with Big-O analysis.',
  },
];

export default function ConversationView({
  messages,
  streamingText,
  isStreaming,
  onRegenerate,
  onBookmarkToggle,
  onPromptClick,
  userName = 'Developer',
  error,
  onRetry,
}: ConversationViewProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const bottomAnchorRef = useRef<HTMLDivElement | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [feedbackState, setFeedbackState] = useState<Record<string, 'up' | 'down' | null>>({});
  const [userHasScrolledUp, setUserHasScrolledUp] = useState(false);

  // Detect user manual scroll to avoid hijacking scroll position while user is reading
  const handleScroll = () => {
    if (!containerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    const distanceToBottom = scrollHeight - scrollTop - clientHeight;
    setUserHasScrolledUp(distanceToBottom > 120);
  };

  // Auto-scroll on new message or streaming chunk unless user intentionally scrolled up
  useEffect(() => {
    if (!userHasScrolledUp) {
      bottomAnchorRef.current?.scrollIntoView({ behavior: isStreaming ? 'auto' : 'smooth' });
    }
  }, [messages, streamingText, isStreaming, userHasScrolledUp]);

  const handleCopyMessage = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleFeedback = (id: string, type: 'up' | 'down') => {
    setFeedbackState((prev) => ({
      ...prev,
      [id]: prev[id] === type ? null : type,
    }));
  };

  // ── Empty Conversation State (ChatGPT-Style Hero) ──
  if (messages.length === 0 && !streamingText && !isStreaming) {
    return (
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto px-4 py-8 chat-scroll flex flex-col justify-center items-center select-none"
      >
        <div className="max-w-2xl w-full mx-auto text-center space-y-6 my-auto">
          {/* Logo Badge */}
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-400 via-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-500/25">
            <Sparkles size={28} className="animate-pulse" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              How can I assist your code today, {userName}?
            </h1>
            <p className="text-sm sm:text-base text-slate-300 font-medium leading-relaxed max-w-lg mx-auto">
              DevPilot AI provides instant full-stack mentoring, roadmap creation, algorithmic problem solving, and architecture reviews.
            </p>
          </div>

          {/* Quick Starter Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left pt-3">
            {STARTER_PROMPTS.map((item, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => onPromptClick(item.prompt)}
                className="group p-3.5 rounded-xl border border-slate-800 bg-slate-900/80 hover:bg-slate-800/90 hover:border-cyan-400/60 transition-all cursor-pointer shadow-xs text-left"
              >
                <div className="flex items-center justify-between text-xs font-bold text-cyan-300 mb-1">
                  <span>{item.icon} {item.category}</span>
                  <ArrowRight size={13} className="opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all text-cyan-400" />
                </div>
                <h3 className="font-bold text-sm text-white group-hover:text-cyan-300 transition-colors">
                  {item.title}
                </h3>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className="flex-1 overflow-y-auto px-3 sm:px-6 py-6 chat-scroll"
    >
      <div className="max-w-3xl mx-auto space-y-7">
        {messages.map((msg, index) => {
          const isUser = msg.role === 'user';
          const isLastAssistantMessage =
            !isUser && index === messages.length - 1 && !isStreaming;

          if (isUser) {
            return (
              <div key={msg.id || index} className="flex justify-end items-start gap-2.5">
                <div className="rounded-2xl rounded-tr-xs bg-indigo-600 dark:bg-indigo-600 text-white px-4 py-3 text-[15px] leading-relaxed max-w-[85%] shadow-sm">
                  <p className="whitespace-pre-wrap select-text">{msg.content}</p>
                </div>
                <div className="w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center text-xs font-semibold shrink-0 select-none">
                  <User size={14} />
                </div>
              </div>
            );
          }

          // ── Assistant Message (Document Flow Layout) ──
          return (
            <div key={msg.id || index} className="flex items-start gap-3.5 group">
              {/* DevPilot Assistant Avatar */}
              <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-cyan-400 to-indigo-600 text-white flex items-center justify-center shrink-0 mt-1 shadow-sm select-none">
                <Sparkles size={14} />
              </div>

              {/* Message Content Container */}
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-xs text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-2 select-none">
                  <span>DevPilot AI</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-mono">
                    Gemini Flash
                  </span>
                </div>

                {/* Markdown Rendered Content */}
                <div className="text-slate-800 dark:text-slate-100">
                  <MarkdownRenderer content={msg.content} />
                </div>

                {/* Response Action Bar */}
                <div className="flex items-center gap-1 mt-2.5 text-slate-400 dark:text-slate-500 select-none opacity-80 group-hover:opacity-100 transition-opacity">
                  {/* Copy Button */}
                  <button
                    type="button"
                    onClick={() => handleCopyMessage(msg.content, msg.id)}
                    title="Copy full response"
                    className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer text-xs flex items-center gap-1"
                  >
                    {copiedId === msg.id ? (
                      <>
                        <Check size={13} className="text-emerald-500" />
                        <span className="text-emerald-500 font-medium">Copied</span>
                      </>
                    ) : (
                      <Copy size={13} />
                    )}
                  </button>

                  {/* Regenerate (shown for last message) */}
                  {isLastAssistantMessage && (
                    <button
                      type="button"
                      onClick={onRegenerate}
                      title="Regenerate response"
                      className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer"
                    >
                      <RotateCw size={13} />
                    </button>
                  )}

                  {/* Thumbs Up Feedback */}
                  <button
                    type="button"
                    onClick={() => handleFeedback(msg.id, 'up')}
                    title="Good response"
                    className={`p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer ${
                      feedbackState[msg.id] === 'up'
                        ? 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/40'
                        : 'hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    <ThumbsUp size={13} />
                  </button>

                  {/* Thumbs Down Feedback */}
                  <button
                    type="button"
                    onClick={() => handleFeedback(msg.id, 'down')}
                    title="Poor response"
                    className={`p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer ${
                      feedbackState[msg.id] === 'down'
                        ? 'text-rose-500 bg-rose-50 dark:bg-rose-950/40'
                        : 'hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    <ThumbsDown size={13} />
                  </button>

                  {/* Bookmark Toggle */}
                  <button
                    type="button"
                    onClick={() => onBookmarkToggle(msg.id)}
                    title={msg.isBookmarked ? 'Remove bookmark' : 'Bookmark message'}
                    className={`p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer ${
                      msg.isBookmarked
                        ? 'text-amber-500 bg-amber-50 dark:bg-amber-950/40'
                        : 'hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    {msg.isBookmarked ? <BookmarkCheck size={13} /> : <Bookmark size={13} />}
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {/* ── Active Streaming Message Display ── */}
        {isStreaming && (
          <div className="flex items-start gap-3.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-cyan-400 to-indigo-600 text-white flex items-center justify-center shrink-0 mt-1 shadow-sm select-none">
              <Sparkles size={14} className="animate-spin" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="font-semibold text-xs text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-2 select-none">
                <span>DevPilot AI</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-cyan-100 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400 font-mono animate-pulse">
                  Streaming answer...
                </span>
              </div>

              <div className="text-slate-800 dark:text-slate-100">
                <MarkdownRenderer content={streamingText || ''} isStreaming={true} />
              </div>
            </div>
          </div>
        )}

        {/* ── Error Banner & Retry ── */}
        {error && (
          <div className="p-3.5 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/70 dark:bg-rose-950/30 text-rose-800 dark:text-rose-200 text-sm flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <AlertCircle size={16} className="text-rose-500 shrink-0" />
              <span>{error}</span>
            </div>
            {onRetry && (
              <button
                type="button"
                onClick={onRetry}
                className="px-3 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold transition-colors cursor-pointer shrink-0"
              >
                Retry
              </button>
            )}
          </div>
        )}

        <div ref={bottomAnchorRef} className="h-4" />
      </div>
    </div>
  );
}
