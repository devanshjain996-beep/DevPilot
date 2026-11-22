// ============================================================================
// DevPilot — Premium ChatGPT-Grade AI Chatbot with 3D Neural Companion
// ============================================================================
import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Menu, X, Sparkles, Maximize2, Minimize2, RotateCw,
  Plus, Eye, EyeOff, ShieldCheck, Cpu, ChevronRight,
  Bookmark, Layers, BookOpen, Volume2, ArrowUpRight
} from 'lucide-react';
import NeuralCoreCanvas, { type CompanionOrbState } from './NeuralCoreCanvas';
import ConversationView from './ConversationView';
import ChatComposer from './ChatComposer';
import ChatSidebar from './ChatSidebar';
import {
  streamGeminiFlash,
  queryGeminiFlash,
  getActiveGeminiKey
} from '../../services/geminiService';
import { queryCSKnowledgeBase, type CSSubject } from '../../data/csKnowledgeBase';
import { useAuth } from '../../context/AuthContext';
import { useProfile } from '../../store/useStore';

export interface ChatMessage {
  id: string;
  role: 'assistant' | 'user';
  content: string;
  timestamp: string;
  subject?: string;
  isBookmarked?: boolean;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
  subjectId?: string;
}

interface AICopilotChatProps {
  isFullScreen?: boolean;
  onClose?: () => void;
  onExpand?: () => void;
}

const STORAGE_KEY_SESSIONS = 'devpilot_copilot_sessions';
const STORAGE_KEY_ACTIVE = 'devpilot_copilot_active_id';

export default function AICopilotChat({
  isFullScreen = true,
  onClose,
  onExpand,
}: AICopilotChatProps) {
  const { user } = useAuth();
  const { profile } = useProfile();

  // ── Session State (Preserving Existing Persistence) ──
  const [sessions, setSessions] = useState<ChatSession[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SESSIONS);
      if (saved) return JSON.parse(saved);
    } catch {}
    return [
      {
        id: 'session-default',
        title: 'Welcome to DevPilot AI',
        messages: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];
  });

  const [activeSessionId, setActiveSessionId] = useState<string>(() => {
    return localStorage.getItem(STORAGE_KEY_ACTIVE) || 'session-default';
  });

  // ── Conversation & Streaming States ──
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingText, setStreamingText] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [companionState, setCompanionState] = useState<CompanionOrbState>('IDLE');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [companionPanelOpen, setCompanionPanelOpen] = useState(true);

  const abortControllerRef = useRef<AbortController | null>(null);

  // Active Session
  const currentSession = sessions.find((s) => s.id === activeSessionId) || sessions[0];
  const messages = currentSession?.messages || [];

  // Persist sessions to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_SESSIONS, JSON.stringify(sessions));
      localStorage.setItem(STORAGE_KEY_ACTIVE, activeSessionId);
    } catch {}
  }, [sessions, activeSessionId]);

  // Clean up abort controller on unmount
  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  // ── Create New Chat ──
  const handleNewChat = useCallback((subject?: CSSubject) => {
    abortControllerRef.current?.abort();
    setIsStreaming(false);
    setStreamingText(null);
    setErrorMessage(null);
    setCompanionState('IDLE');

    const newId = `session-${Date.now()}`;
    const newSession: ChatSession = {
      id: newId,
      title: subject ? `${subject.shortName} Discussion` : 'New Conversation',
      messages: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      subjectId: subject?.id,
    };

    setSessions((prev) => [newSession, ...prev]);
    setActiveSessionId(newId);
    setInput('');
  }, []);

  // ── Delete Chat ──
  const handleDeleteSession = useCallback((id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSessions((prev) => {
      if (prev.length <= 1) {
        return [
          {
            id: 'session-default',
            title: 'Welcome to DevPilot AI',
            messages: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ];
      }
      return prev.filter((s) => s.id !== id);
    });

    if (activeSessionId === id) {
      const remaining = sessions.filter((s) => s.id !== id);
      if (remaining.length > 0) {
        setActiveSessionId(remaining[0].id);
      }
    }
  }, [activeSessionId, sessions]);

  // ── Bookmark Toggle ──
  const handleBookmarkToggle = useCallback((msgId: string) => {
    setSessions((prev) =>
      prev.map((s) => {
        if (s.id !== activeSessionId) return s;
        return {
          ...s,
          messages: s.messages.map((m) =>
            m.id === msgId ? { ...m, isBookmarked: !m.isBookmarked } : m
          ),
        };
      })
    );
  }, [activeSessionId]);

  // ── Stop Streaming ──
  const handleStopStreaming = useCallback(() => {
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;
    if (streamingText && streamingText.trim().length > 0) {
      // Save partial text as completed response
      const assistantMessage: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: streamingText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setSessions((prev) =>
        prev.map((s) => (s.id === activeSessionId ? { ...s, messages: [...s.messages, assistantMessage] } : s))
      );
    }
    setIsStreaming(false);
    setStreamingText(null);
    setCompanionState('IDLE');
  }, [activeSessionId, streamingText]);

  // ── Send Message & Real Progressive Streaming ──
  const handleSendMessage = useCallback(
    async (overrideText?: string) => {
      const textToSend = (overrideText || input).trim();
      if (!textToSend || isStreaming) return;

      setErrorMessage(null);

      const userMessage: ChatMessage = {
        id: `user-${Date.now()}`,
        role: 'user',
        content: textToSend,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      // Set initial session title if new
      const isFirstMessage = messages.length === 0 || currentSession.title === 'Welcome to DevPilot AI' || currentSession.title === 'New Conversation';
      const updatedTitle = isFirstMessage
        ? textToSend.length > 34
          ? `${textToSend.slice(0, 34).trim()}…`
          : textToSend
        : currentSession.title;

      const targetSessionId = activeSessionId;

      setSessions((prev) =>
        prev.map((s) => {
          if (s.id !== targetSessionId) return s;
          return {
            ...s,
            title: updatedTitle,
            updatedAt: new Date().toISOString(),
            messages: [...s.messages, userMessage],
          };
        })
      );

      setInput('');
      setIsStreaming(true);
      setStreamingText('');
      setCompanionState('THINKING');

      // Setup AbortController
      abortControllerRef.current?.abort();
      const controller = new AbortController();
      abortControllerRef.current = controller;

      try {
        let accumulatedReply = '';
        let receivedFirstChunk = false;

        const conversationHistory = messages.map((m) => ({
          role: m.role,
          content: m.content,
        }));

        // Execute real SSE streaming with fallback
        const result = await streamGeminiFlash(
          textToSend,
          conversationHistory,
          (_chunk, fullText) => {
            if (!receivedFirstChunk) {
              receivedFirstChunk = true;
              setCompanionState('RESPONDING');
            }
            accumulatedReply = fullText;
            setStreamingText(fullText);
          },
          { signal: controller.signal }
        );

        const finalReply = result.text || accumulatedReply;

        if (finalReply && finalReply.trim().length > 0) {
          const assistantMessage: ChatMessage = {
            id: `ai-${Date.now()}`,
            role: 'assistant',
            content: finalReply,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          };

          setSessions((prev) =>
            prev.map((s) => {
              if (s.id !== targetSessionId) return s;
              return {
                ...s,
                messages: [...s.messages, assistantMessage],
              };
            })
          );
        }

        setStreamingText(null);
        setIsStreaming(false);
        setCompanionState('IDLE');
      } catch (err: any) {
        if (err.name === 'AbortError' || err.message === 'ABORTED') {
          setIsStreaming(false);
          setStreamingText(null);
          setCompanionState('IDLE');
          return;
        }

        // Try local CS knowledge base fallback if network or key issue
        const localKb = queryCSKnowledgeBase(textToSend);
        const fallbackContent = localKb.entry?.content || localKb.outOfScopeResponse;
        if (fallbackContent) {
          const fallbackMsg: ChatMessage = {
            id: `ai-kb-${Date.now()}`,
            role: 'assistant',
            content: fallbackContent,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          };

          setSessions((prev) =>
            prev.map((s) => (s.id === targetSessionId ? { ...s, messages: [...s.messages, fallbackMsg] } : s))
          );
          setStreamingText(null);
          setIsStreaming(false);
          setCompanionState('IDLE');
          return;
        }

        setCompanionState('ERROR');
        setErrorMessage(
          err.message || 'Unable to generate response. Please check your network connection or API settings.'
        );
        setIsStreaming(false);
        setStreamingText(null);
      } finally {
        if (abortControllerRef.current === controller) {
          abortControllerRef.current = null;
        }
      }
    },
    [input, isStreaming, messages, currentSession.title, activeSessionId]
  );

  // ── Regenerate Last Response ──
  const handleRegenerate = useCallback(() => {
    if (messages.length === 0 || isStreaming) return;
    const lastUserMessage = [...messages].reverse().find((m) => m.role === 'user');
    if (!lastUserMessage) return;

    // Remove last assistant message if present
    setSessions((prev) =>
      prev.map((s) => {
        if (s.id !== activeSessionId) return s;
        const newMsgs = [...s.messages];
        if (newMsgs.length > 0 && newMsgs[newMsgs.length - 1].role === 'assistant') {
          newMsgs.pop();
        }
        return { ...s, messages: newMsgs };
      })
    );

    void handleSendMessage(lastUserMessage.content);
  }, [messages, isStreaming, activeSessionId, handleSendMessage]);

  const userName = user?.displayName || profile?.name || 'Developer';

  return (
    <div className="flex h-full w-full bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 overflow-hidden font-sans">
      {/* ── Slide-out Conversation Navigation Sidebar ── */}
      <ChatSidebar
        sessions={sessions}
        activeSessionId={activeSessionId}
        onSelectSession={(id) => {
          handleStopStreaming();
          setActiveSessionId(id);
          setSidebarOpen(false);
        }}
        onNewChat={(sub) => {
          handleNewChat(sub);
          setSidebarOpen(false);
        }}
        onDeleteSession={handleDeleteSession}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* ── Main Conversation Body ── */}
      <div className="flex-1 flex flex-col h-full min-w-0 relative">
        {/* Top Control Bar */}
        <header className="h-14 px-4 sm:px-6 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between shrink-0 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md select-none z-10">
          <div className="flex items-center gap-3 min-w-0">
            {/* Toggle History Sidebar */}
            <button
              type="button"
              onClick={() => setSidebarOpen((prev) => !prev)}
              aria-label="Toggle chat history"
              className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition-colors cursor-pointer"
            >
              <Menu size={18} />
            </button>

            {/* Current Session Title & Model Indicator */}
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm text-slate-900 dark:text-white truncate max-w-[200px] sm:max-w-md">
                  {currentSession?.title || 'DevPilot AI'}
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Gemini Flash</span>
                </span>
              </div>
            </div>
          </div>

          {/* Right Action Icons */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Toggle 3D Companion Panel (Desktop) */}
            <button
              type="button"
              onClick={() => setCompanionPanelOpen((prev) => !prev)}
              title={companionPanelOpen ? 'Hide 3D Neural Companion' : 'Show 3D Neural Companion'}
              className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <Sparkles size={14} className="text-cyan-500" />
              <span>3D Companion</span>
            </button>

            {/* Expand to SaaS Full Page */}
            {onExpand && (
              <button
                type="button"
                onClick={onExpand}
                title="Expand to Full Page"
                className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition-colors cursor-pointer"
              >
                <Maximize2 size={16} />
              </button>
            )}

            {/* Close Button (When rendered inside modal) */}
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                title="Close AI Assistant (Esc)"
                className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            )}
          </div>
        </header>

        {/* ── Chat Stream Layout ── */}
        <div className="flex-1 flex overflow-hidden min-h-0">
          {/* Main ChatGPT Conversation Stream */}
          <div className="flex-1 flex flex-col h-full min-w-0">
            <ConversationView
              messages={messages}
              streamingText={streamingText}
              isStreaming={isStreaming}
              onRegenerate={handleRegenerate}
              onBookmarkToggle={handleBookmarkToggle}
              onPromptClick={(p) => void handleSendMessage(p)}
              userName={userName}
              error={errorMessage}
              onRetry={handleRegenerate}
            />

            {/* Fixed Bottom Composer */}
            <ChatComposer
              input={input}
              setInput={setInput}
              onSend={(text) => void handleSendMessage(text)}
              isStreaming={isStreaming}
              onStopStreaming={handleStopStreaming}
              onQuickPrompt={(p) => void handleSendMessage(p)}
            />
          </div>

          {/* ── 3D AI Neural Companion Right Panel (Desktop) ── */}
          {companionPanelOpen && (
            <aside className="hidden lg:flex w-80 h-full border-l border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 flex-col justify-between p-5 select-none shrink-0 transition-all">
              <div className="space-y-4">
                {/* Companion Status Badge */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                    <span className="font-semibold text-xs text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                      Neural Core 3D
                    </span>
                  </div>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    {companionState}
                  </span>
                </div>

                {/* 3D Interactive Canvas */}
                <div className="relative w-full h-56 rounded-2xl bg-radial from-indigo-950/40 via-slate-950/60 to-slate-950 border border-slate-200/80 dark:border-slate-800 flex items-center justify-center overflow-hidden shadow-inner">
                  <NeuralCoreCanvas state={companionState} className="w-full h-full" />
                </div>

                {/* State Guidance Note */}
                <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 leading-relaxed shadow-xs">
                  {companionState === 'IDLE' && (
                    <p>✨ Ready to review code, explain algorithms, or construct developer roadmaps.</p>
                  )}
                  {companionState === 'THINKING' && (
                    <p className="text-violet-500 dark:text-violet-400 font-medium animate-pulse">
                      ⚡ Synthesizing optimal answer through Gemini Flash model...
                    </p>
                  )}
                  {companionState === 'RESPONDING' && (
                    <p className="text-cyan-500 dark:text-cyan-400 font-medium">
                      🚀 Streaming progressive response with syntax formatting.
                    </p>
                  )}
                  {companionState === 'ERROR' && (
                    <p className="text-rose-500 font-medium">
                      ⚠️ Encountered an issue. You can retry with the button below.
                    </p>
                  )}
                </div>
              </div>

              {/* Quick Tech Highlights Card */}
              <div className="p-3.5 rounded-2xl bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-cyan-500/10 border border-indigo-400/20 text-xs space-y-2">
                <div className="flex items-center gap-1.5 font-semibold text-indigo-600 dark:text-cyan-400">
                  <Cpu size={14} />
                  <span>DevPilot Architecture</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
                  Powered by Google Gemini Flash API with client-side SSE streaming, zero WebGL overhead, and offline IndexedDB resilience.
                </p>
              </div>
            </aside>
          )}
        </div>
      </div>
    </div>
  );
}
