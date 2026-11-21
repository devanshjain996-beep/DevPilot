// ============================================================================
// DevPilot — Premium Animated AI Copilot (Linear + Claude Aesthetics)
// ============================================================================
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import {
  Sparkles, Send, Bot, User, Key, RefreshCw, Copy, Check,
  Trash2, Plus, MessageSquare, Paperclip, Mic, ChevronLeft,
  ChevronRight, Settings, Bookmark, BookmarkCheck, ArrowUpRight,
  Code2, CheckCircle2, AlertCircle, CornerDownLeft, X, Layers,
  Cpu, Zap, ExternalLink
} from 'lucide-react';
import AnimatedNeuralNetwork from './AnimatedNeuralNetwork';
import { CS_SUBJECTS, queryCSKnowledgeBase, type CSSubject } from '../../data/csKnowledgeBase';
import {
  queryGeminiFlash,
  getActiveGeminiKey,
  saveActiveGeminiKey
} from '../../services/geminiService';
import { useAuth } from '../../context/AuthContext';
import { useProfile } from '../../store/useStore';
import { cn } from '../../utils/helpers';

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
const STORAGE_KEY_API = 'devpilot_ai_key';

export default function AICopilotChat({
  isFullScreen = true,
  onClose,
  onExpand,
}: AICopilotChatProps) {
  const { user } = useAuth();
  const { profile } = useProfile();

  // ── States ──
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

  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [streamingText, setStreamingText] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(isFullScreen);
  const [activeTab, setActiveTab] = useState<'chats' | 'subjects' | 'saved' | 'settings'>('chats');
  const [apiKey, setApiKey] = useState(() => getActiveGeminiKey());
  const [tempKeyInput, setTempKeyInput] = useState('');
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<CSSubject | null>(null);
  const [isRecording, setIsRecording] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Active Session
  const currentSession = sessions.find(s => s.id === activeSessionId) || sessions[0];
  const messages = currentSession?.messages || [];

  // Persist sessions
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_SESSIONS, JSON.stringify(sessions));
      localStorage.setItem(STORAGE_KEY_ACTIVE, activeSessionId);
    } catch {}
  }, [sessions, activeSessionId]);

  // Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingText, isTyping]);

  // Toast Helper
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  // ── Create New Chat ──
  const handleNewChat = (subject?: CSSubject) => {
    const newId = `session-${Date.now()}`;
    const newSession: ChatSession = {
      id: newId,
      title: subject ? `${subject.shortName} Discussion` : 'New Exploration',
      messages: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      subjectId: subject?.id,
    };

    setSessions(prev => [newSession, ...prev]);
    setActiveSessionId(newId);
    setSelectedSubject(subject || null);
    setInput('');
    showToast('Started new conversation');

    setTimeout(() => {
      textareaRef.current?.focus();
    }, 100);
  };

  // ── Delete Chat ──
  const handleDeleteSession = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (sessions.length <= 1) {
      // Clear messages instead of deleting sole session
      setSessions([
        {
          id: 'session-default',
          title: 'Welcome to DevPilot AI',
          messages: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ]);
      setActiveSessionId('session-default');
      showToast('Cleared conversation');
      return;
    }

    const filtered = sessions.filter(s => s.id !== id);
    setSessions(filtered);
    if (activeSessionId === id) {
      setActiveSessionId(filtered[0].id);
    }
    showToast('Conversation deleted');
  };

  // ── Toggle Bookmark Message ──
  const handleToggleBookmark = (msgId: string) => {
    setSessions(prev =>
      prev.map(s => {
        if (s.id !== activeSessionId) return s;
        return {
          ...s,
          messages: s.messages.map(m =>
            m.id === msgId ? { ...m, isBookmarked: !m.isBookmarked } : m
          ),
        };
      })
    );
    showToast('Bookmark updated');
  };

  // ── Copy to Clipboard ──
  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    showToast('Copied to clipboard');
    setTimeout(() => setCopiedId(null), 2000);
  };

  // ── Send Message ──
  const handleSendMessage = async (customPrompt?: string) => {
    const textToSend = (customPrompt || input).trim();
    if (!textToSend || isTyping) return;

    const userMessage: ChatMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      content: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    // Update session title on first message
    const isFirstMessage = messages.length === 0;
    const newTitle = isFirstMessage
      ? textToSend.slice(0, 32) + (textToSend.length > 32 ? '...' : '')
      : currentSession.title;

    setSessions(prev =>
      prev.map(s => {
        if (s.id !== activeSessionId) return s;
        return {
          ...s,
          title: newTitle,
          updatedAt: new Date().toISOString(),
          messages: [...s.messages, userMessage],
        };
      })
    );

    setInput('');
    setIsTyping(true);

    // ── Generate AI Response via Gemini Flash or Knowledge Base ──
    try {
      const activeKey = apiKey || getActiveGeminiKey();
      if (activeKey) {
        try {
          const geminiResult = await queryGeminiFlash(
            textToSend,
            messages.map(m => ({ role: m.role, content: m.content })),
            activeKey
          );
          if (geminiResult.text) {
            simulateStreamingReply(geminiResult.text);
            return;
          }
        } catch (geminiErr: any) {
          console.warn('[DevPilot AI] Gemini Flash query notice:', geminiErr);
          if (geminiErr?.message?.includes('INVALID_API_KEY')) {
            showToast('Invalid Gemini API Key. Please verify in settings.');
          }
        }
      }

      // 2. Built-in W3Schools / GeeksforGeeks Knowledge Base Engine (Offline & Fast)
      setTimeout(() => {
        const kbResult = queryCSKnowledgeBase(textToSend);
        let finalReply = '';

        if (kbResult.found && kbResult.entry) {
          finalReply = `**Source: ${kbResult.entry.subject}**\n\n${kbResult.entry.content}`;
        } else if (kbResult.outOfScopeResponse) {
          finalReply = kbResult.outOfScopeResponse;
        } else {
          finalReply = `### Computer Science Analysis for: "${textToSend}"\n\n1. **Core Concept:** Break this down into foundational components.\n2. **Algorithmic Flow:** Identify the input types, state transitions, and edge conditions.\n3. **Practical Implementation:** Apply standard design patterns and ensure modularity.\n\n*Would you like a code snippet in Python, C++, or JavaScript, or a step-by-step walkthrough of this topic?*`;
        }

        if (!activeKey) {
          finalReply += `\n\n---\n*💡 **Pro Tip:** Connect **Google Gemini Flash** via the top toolbar or Settings to enable dynamic AI reasoning over all CS problems!*`;
        }

        simulateStreamingReply(finalReply);
      }, 250);
    } catch {
      simulateStreamingReply(
        'I encountered a temporary connection issue. Falling back to offline Computer Science knowledge base. Please ask your question again!'
      );
    }
  };

  // ── Streaming Typewriter Effect ──
  const simulateStreamingReply = (fullText: string) => {
    setIsTyping(false);
    let index = 0;
    const chunkSize = Math.max(1, Math.floor(fullText.length / 40));
    setStreamingText('');

    const interval = setInterval(() => {
      index += chunkSize;
      if (index >= fullText.length) {
        clearInterval(interval);
        setStreamingText(null);

        const aiMessage: ChatMessage = {
          id: `a-${Date.now()}`,
          role: 'assistant',
          content: fullText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };

        setSessions(prev =>
          prev.map(s => {
            if (s.id !== activeSessionId) return s;
            return {
              ...s,
              updatedAt: new Date().toISOString(),
              messages: [...s.messages, aiMessage],
            };
          })
        );
      } else {
        setStreamingText(fullText.slice(0, index));
      }
    }, 15);
  };

  // ── Regenerate Last Response ──
  const handleRegenerate = () => {
    const lastUserMsg = [...messages].reverse().find(m => m.role === 'user');
    if (lastUserMsg) {
      handleSendMessage(lastUserMsg.content);
    }
  };

  // ── Voice Input Simulation ──
  const handleToggleVoice = () => {
    if (!isRecording) {
      setIsRecording(true);
      showToast('Listening... Speak your CS question');
      setTimeout(() => {
        setIsRecording(false);
        setInput('Explain the difference between TCP and UDP with examples');
        showToast('Voice captured!');
      }, 2500);
    } else {
      setIsRecording(false);
    }
  };

  // ── Keyboard Shortcuts ──
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Saved / Bookmarked Messages
  const savedMessages = messages.filter(m => m.isBookmarked);

  return (
    <div className={cn(
      'flex h-full w-full bg-[#fbfbfd] dark:bg-[#0c0e14] text-slate-800 dark:text-slate-100 font-sans overflow-hidden relative select-text',
      !isFullScreen && 'rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl'
    )}>
      {/* ── SUBTLE BACKGROUND AMBIENT PARTICLES / GRID ── */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] dark:opacity-[0.05] bg-[radial-gradient(#4f46e5_1px,transparent_1px)] [background-size:24px_24px]" />

      {/* ── TOAST NOTIFICATION ── */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="absolute top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2 bg-slate-900/90 dark:bg-white/95 text-white dark:text-slate-900 text-xs font-semibold rounded-full shadow-lg backdrop-blur-md flex items-center gap-2 border border-white/10 dark:border-slate-300"
          >
            <CheckCircle2 size={14} className="text-emerald-400 dark:text-emerald-600" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── COLLAPSIBLE SAAS SIDEBAR ── */}
      <AnimatePresence initial={false}>
        {sidebarOpen && (
          <motion.aside
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 280, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="h-full border-r border-slate-200/80 dark:border-slate-800/80 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl flex flex-col shrink-0 overflow-hidden z-20"
          >
            {/* Sidebar Header */}
            <div className="p-4 border-b border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-blue-500 flex items-center justify-center text-white shadow-sm">
                  <Sparkles size={16} />
                </div>
                <div>
                  <h2 className="text-xs font-bold tracking-tight text-slate-900 dark:text-white leading-none">
                    DevPilot Copilot
                  </h2>
                  <span className="text-[10px] text-slate-400 font-medium">CS AI Assistant</span>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSidebarOpen(false)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                title="Collapse sidebar"
              >
                <ChevronLeft size={16} />
              </motion.button>
            </div>

            {/* New Chat Button */}
            <div className="p-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleNewChat()}
                className="w-full py-2.5 px-3.5 bg-slate-900 hover:bg-slate-800 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
              >
                <Plus size={15} />
                <span>New Conversation</span>
              </motion.button>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center px-3 py-1.5 gap-1 border-b border-slate-200/50 dark:border-slate-800/50 text-[11px] font-medium text-slate-500">
              <button
                onClick={() => setActiveTab('chats')}
                className={cn(
                  'flex-1 py-1 px-2 rounded-lg text-center transition-colors cursor-pointer',
                  activeTab === 'chats' ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold' : 'hover:text-slate-800 dark:hover:text-slate-200'
                )}
              >
                Chats
              </button>
              <button
                onClick={() => setActiveTab('subjects')}
                className={cn(
                  'flex-1 py-1 px-2 rounded-lg text-center transition-colors cursor-pointer',
                  activeTab === 'subjects' ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold' : 'hover:text-slate-800 dark:hover:text-slate-200'
                )}
              >
                Subjects
              </button>
              <button
                onClick={() => setActiveTab('saved')}
                className={cn(
                  'flex-1 py-1 px-2 rounded-lg text-center transition-colors cursor-pointer',
                  activeTab === 'saved' ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold' : 'hover:text-slate-800 dark:hover:text-slate-200'
                )}
              >
                Saved
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className={cn(
                  'p-1.5 rounded-lg transition-colors cursor-pointer',
                  activeTab === 'settings' ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white' : 'hover:text-slate-800 dark:hover:text-slate-200'
                )}
                title="Settings"
              >
                <Settings size={13} />
              </button>
            </div>

            {/* Tab Content List */}
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {activeTab === 'chats' && (
                <>
                  <div className="px-2 pt-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Recent Chats ({sessions.length})
                  </div>
                  {sessions.map(s => {
                    const isActive = s.id === activeSessionId;
                    return (
                      <div
                        key={s.id}
                        onClick={() => {
                          setActiveSessionId(s.id);
                          setSelectedSubject(null);
                        }}
                        className={cn(
                          'group flex items-center justify-between p-2.5 rounded-xl text-xs transition-all cursor-pointer',
                          isActive
                            ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-200 font-semibold border border-indigo-200/50 dark:border-indigo-800/40'
                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100/70 dark:hover:bg-slate-800/50'
                        )}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <MessageSquare size={13} className={isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'} />
                          <span className="truncate">{s.title || 'Untitled Session'}</span>
                        </div>
                        <button
                          onClick={e => handleDeleteSession(s.id, e)}
                          className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-500 rounded transition-opacity"
                          title="Delete chat"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    );
                  })}
                </>
              )}

              {activeTab === 'subjects' && (
                <>
                  <div className="px-2 pt-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Explore Curriculum (9)
                  </div>
                  {CS_SUBJECTS.map(subj => {
                    const Icon = subj.icon;
                    return (
                      <button
                        key={subj.id}
                        onClick={() => handleNewChat(subj)}
                        className="w-full text-left flex items-center gap-2.5 p-2 rounded-xl text-xs hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors group cursor-pointer"
                      >
                        <div className={cn('p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400')}>
                          <Icon size={14} />
                        </div>
                        <div className="truncate">
                          <p className="font-semibold text-slate-800 dark:text-slate-200 truncate">{subj.shortName}</p>
                          <p className="text-[10px] text-slate-400 truncate">{subj.recommendedQuestions.length} guided prompts</p>
                        </div>
                      </button>
                    );
                  })}
                </>
              )}

              {activeTab === 'saved' && (
                <>
                  <div className="px-2 pt-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Bookmarked Notes ({savedMessages.length})
                  </div>
                  {savedMessages.length === 0 ? (
                    <div className="p-4 text-center text-[11px] text-slate-400">
                      No bookmarked messages yet. Click the bookmark icon on any AI response to save key notes!
                    </div>
                  ) : (
                    savedMessages.map(m => (
                      <div
                        key={m.id}
                        className="p-2.5 rounded-xl bg-slate-100/60 dark:bg-slate-800/40 border border-slate-200/50 dark:border-slate-800/50 text-xs space-y-1"
                      >
                        <p className="text-[10px] font-semibold text-indigo-500 uppercase">{m.role} • {m.timestamp}</p>
                        <p className="line-clamp-3 text-slate-700 dark:text-slate-300 text-[11px]">{m.content}</p>
                        <div className="pt-1 flex justify-end">
                          <button
                            onClick={() => handleCopy(m.content, m.id)}
                            className="text-[10px] text-slate-400 hover:text-indigo-500 flex items-center gap-1 cursor-pointer"
                          >
                            <Copy size={11} /> Copy Note
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </>
              )}

              {activeTab === 'settings' && (
                <div className="p-2 space-y-4 text-xs">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <Key size={13} className="text-indigo-500" />
                      Google Gemini API Key
                    </label>
                    <input
                      type="password"
                      placeholder="AIzaSy..."
                      value={apiKey}
                      onChange={e => {
                        const val = e.target.value.trim();
                        setApiKey(val);
                        saveActiveGeminiKey(val);
                      }}
                      className="w-full px-2.5 py-1.5 text-xs bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                    />
                    <p className="text-[10px] text-slate-400">
                      Optional. DevPilot includes a built-in offline CS Knowledge Base. Adding a Gemini key enables dynamic multimodal LLM streaming.
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800/60">
                    <button
                      onClick={() => {
                        setSessions([
                          {
                            id: 'session-default',
                            title: 'Welcome to DevPilot AI',
                            messages: [],
                            createdAt: new Date().toISOString(),
                            updatedAt: new Date().toISOString(),
                          },
                        ]);
                        setActiveSessionId('session-default');
                        showToast('History cleared');
                      }}
                      className="w-full py-1.5 px-2 text-xs text-red-500 hover:bg-red-500/10 rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Trash2 size={13} />
                      <span>Clear All Chat History</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar Footer User Card */}
            <div className="p-3 border-t border-slate-200/60 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-900/50 flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-700 dark:text-slate-300 shrink-0">
                {user?.displayName?.[0] || profile?.name?.[0] || 'D'}
              </div>
              <div className="truncate flex-1">
                <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                  {user?.displayName || profile?.name || 'Computer Science Student'}
                </p>
                <p className="text-[10px] text-slate-400 truncate">
                  {user?.email || 'DevPilot Free Tier'}
                </p>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* ── MAIN CHAT WORKSPACE ── */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Top Minimal Toolbar */}
        <header className="h-14 px-4 border-b border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between shrink-0 bg-white/40 dark:bg-slate-900/40 backdrop-blur-md z-10">
          <div className="flex items-center gap-2.5">
            {!sidebarOpen && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSidebarOpen(true)}
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                title="Expand sidebar"
              >
                <ChevronRight size={18} />
              </motion.button>
            )}

            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <h1 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                {currentSession.title}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-400 hidden md:inline-block">
              Grounded in GeeksforGeeks & W3Schools
            </span>

            {/* 3D Gemini Flash Status Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setTempKeyInput(apiKey);
                setShowKeyModal(true);
              }}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold border transition-all cursor-pointer shadow-xs',
                apiKey
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                  : 'bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 border-indigo-500/30'
              )}
            >
              <span className={cn('w-2 h-2 rounded-full', apiKey ? 'bg-emerald-500 animate-pulse' : 'bg-indigo-500')} />
              <span>{apiKey ? 'Gemini Flash' : '⚡ Connect Gemini Flash'}</span>
            </motion.button>

            {onExpand && (
              <button
                onClick={onExpand}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                title="Expand to Full Page"
              >
                <ArrowUpRight size={16} />
              </button>
            )}

            {onClose && (
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer"
                title="Close Assistant"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </header>

        {/* ── CONVERSATION CONTAINER ── */}
        <div className="flex-1 overflow-y-auto px-4 py-6 md:px-8">
          <div className="max-w-3xl mx-auto space-y-6">
            {/* ── HERO WELCOME SCREEN (When no messages in current session) ── */}
            {messages.length === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="py-6 sm:py-10 text-center space-y-6"
              >
                {/* Animated Identity Element */}
                <div className="flex justify-center">
                  <AnimatedNeuralNetwork />
                </div>

                {/* Hero Headings */}
                <div className="space-y-2 max-w-xl mx-auto">
                  <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                    Your Computer Science Learning Companion.
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                    Explore concepts, solve problems, and become a better developer. Ask code explanations, algorithmic hints, and engineering fundamentals.
                  </p>
                </div>

                {/* ── 9 COMPUTER SCIENCE SUBJECT CARDS ── */}
                <div className="pt-4 text-left">
                  <div className="flex items-center justify-between mb-3 px-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Explore Core CS Subjects
                    </span>
                    <span className="text-[10px] text-indigo-500 font-semibold">9 Disciplines Available</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5" style={{ perspective: 1200 }}>
                    {CS_SUBJECTS.map((subj, index) => {
                      const Icon = subj.icon;
                      return (
                        <motion.div
                          key={subj.id}
                          initial={{ opacity: 0, y: 15 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.35, delay: index * 0.04 }}
                          whileHover={{
                            scale: 1.04,
                            rotateX: -6,
                            rotateY: 6,
                            z: 24,
                            transition: { duration: 0.18, ease: 'easeOut' },
                          }}
                          whileTap={{ scale: 0.98 }}
                          style={{
                            transformStyle: 'preserve-3d',
                            perspective: 1000,
                          }}
                          onClick={() => {
                            setSelectedSubject(subj);
                            handleSendMessage(subj.recommendedQuestions[0]);
                          }}
                          className={cn(
                            'p-4 rounded-2xl bg-white/95 dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] dark:shadow-[0_4px_20px_-4px_rgba(0,0,0,0.4)] hover:shadow-xl transition-all cursor-pointer group relative overflow-hidden backdrop-blur-xs',
                            subj.borderHover
                          )}
                        >
                          <div className="flex items-center gap-2.5 mb-2" style={{ transform: 'translateZ(20px)' }}>
                            <div className={cn('p-2.5 rounded-xl bg-gradient-to-br shadow-xs', subj.accentBg, subj.color)}>
                              <Icon size={18} />
                            </div>
                            <h3 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                              {subj.shortName}
                            </h3>
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed" style={{ transform: 'translateZ(12px)' }}>
                            {subj.description}
                          </p>
                          <div className="mt-3.5 flex items-center justify-between text-[10px] font-semibold text-slate-400 group-hover:text-indigo-500 transition-colors" style={{ transform: 'translateZ(16px)' }}>
                            <span className="flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500/50" />
                              Explore 3D prompts
                            </span>
                            <ArrowUpRight size={13} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>

                {/* Popular Recommended Prompts Bar */}
                <div className="pt-2 text-left">
                  <p className="text-[11px] font-semibold text-slate-400 mb-2 px-1">Trending Questions:</p>
                  <div className="flex flex-wrap gap-2">
                    {[
                      'Explain pointers and dynamic memory in C/C++',
                      'What are the 4 Pillars of OOP with real examples?',
                      'Explain ACID properties in DBMS with banking flow',
                      'Process vs Thread: core difference in OS',
                      'Difference between TCP and UDP three-way handshake',
                    ].map((prompt, i) => (
                      <motion.button
                        key={i}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleSendMessage(prompt)}
                        className="px-3 py-1.5 rounded-full text-[11px] font-medium bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors shadow-2xs cursor-pointer"
                      >
                        {prompt}
                      </motion.button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* ── MESSAGE THREAD ── */}
            {messages.map(msg => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                className={cn(
                  'flex gap-3 md:gap-4',
                  msg.role === 'user' ? 'justify-end' : 'justify-start'
                )}
              >
                {/* AI Avatar */}
                {msg.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-500 text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                    <Bot size={16} />
                  </div>
                )}

                {/* Message Bubble Card */}
                <div className={cn(
                  'group relative max-w-[88%] sm:max-w-[80%] rounded-2xl p-4 text-xs leading-relaxed transition-all',
                  msg.role === 'user'
                    ? 'bg-slate-900 text-white dark:bg-indigo-600 rounded-tr-xs shadow-sm font-medium'
                    : 'bg-white dark:bg-slate-900/90 text-slate-800 dark:text-slate-200 border border-slate-200/80 dark:border-slate-800/80 rounded-tl-xs shadow-xs'
                )}>
                  {/* Markdown formatted content */}
                  <div className="prose dark:prose-invert max-w-none prose-xs prose-headings:font-bold prose-headings:text-slate-900 dark:prose-headings:text-white prose-pre:bg-slate-950 prose-pre:text-slate-100 prose-pre:rounded-xl prose-pre:border prose-pre:border-slate-800 prose-code:font-mono">
                    <ReactMarkdown
                      components={{
                        code({ className, children, ...props }) {
                          const match = /language-(\w+)/.exec(className || '');
                          const isInline = !match && !String(children).includes('\n');
                          return isInline ? (
                            <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 rounded font-mono text-[11px]" {...props}>
                              {children}
                            </code>
                          ) : (
                            <div className="relative my-2 rounded-xl overflow-hidden border border-slate-800 bg-slate-950 text-slate-100">
                              <div className="flex items-center justify-between px-3 py-1.5 bg-slate-900 border-b border-slate-800 text-[10px] text-slate-400 font-mono">
                                <span>{match ? match[1].toUpperCase() : 'CODE'}</span>
                                <button
                                  type="button"
                                  onClick={() => handleCopy(String(children), `code-${msg.id}`)}
                                  className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer"
                                >
                                  {copiedId === `code-${msg.id}` ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                                  <span>{copiedId === `code-${msg.id}` ? 'Copied' : 'Copy Code'}</span>
                                </button>
                              </div>
                              <pre className="p-3 text-[11px] leading-relaxed overflow-x-auto font-mono">
                                <code>{children}</code>
                              </pre>
                            </div>
                          );
                        },
                      }}
                    >
                      {msg.content}
                    </ReactMarkdown>
                  </div>

                  {/* Message Action Footer */}
                  {msg.role === 'assistant' && (
                    <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-[10px] text-slate-400">
                      <span>{msg.timestamp}</span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleCopy(msg.content, msg.id)}
                          className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer"
                          title="Copy response"
                        >
                          {copiedId === msg.id ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleToggleBookmark(msg.id)}
                          className={cn(
                            'p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer',
                            msg.isBookmarked ? 'text-amber-500' : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                          )}
                          title={msg.isBookmarked ? 'Remove bookmark' : 'Bookmark response'}
                        >
                          {msg.isBookmarked ? <BookmarkCheck size={12} /> : <Bookmark size={12} />}
                        </button>
                        <button
                          type="button"
                          onClick={handleRegenerate}
                          className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer"
                          title="Regenerate response"
                        >
                          <RefreshCw size={12} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* User Avatar */}
                {msg.role === 'user' && (
                  <div className="w-8 h-8 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center shrink-0 shadow-sm mt-0.5 font-bold text-xs">
                    <User size={15} />
                  </div>
                )}
              </motion.div>
            ))}

            {/* ── STREAMING TEXT TYPEWRITER BUBBLE ── */}
            {streamingText !== null && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-3 md:gap-4 justify-start"
              >
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-500 text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                  <Bot size={16} />
                </div>
                <div className="max-w-[88%] sm:max-w-[80%] rounded-2xl p-4 text-xs leading-relaxed bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 shadow-xs">
                  <ReactMarkdown>{streamingText}</ReactMarkdown>
                  <span className="inline-block w-1.5 h-3.5 bg-indigo-500 ml-1 animate-pulse" />
                </div>
              </motion.div>
            )}

            {/* ── ANIMATED BOUNCING TYPING INDICATOR ── */}
            {isTyping && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3 pl-1"
              >
                <div className="w-7 h-7 rounded-lg bg-indigo-500/10 text-indigo-600 flex items-center justify-center">
                  <Bot size={14} />
                </div>
                <div className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs flex items-center gap-1.5">
                  <motion.span
                    animate={{ y: [0, -4, 0] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                    className="w-1.5 h-1.5 rounded-full bg-indigo-500"
                  />
                  <motion.span
                    animate={{ y: [0, -4, 0] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                    className="w-1.5 h-1.5 rounded-full bg-indigo-500"
                  />
                  <motion.span
                    animate={{ y: [0, -4, 0] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                    className="w-1.5 h-1.5 rounded-full bg-indigo-500"
                  />
                  <span className="text-[11px] text-slate-400 font-medium ml-1">Analyzing CS curriculum...</span>
                </div>
              </motion.div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* ── FLOATING / BOTTOM SAAS CHAT INPUT CONTAINER ── */}
        <div className="p-4 sm:p-5 border-t border-slate-200/80 dark:border-slate-800/80 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl shrink-0 z-10">
          <div className="max-w-3xl mx-auto">
            {/* Input Container with Animated Focus Border */}
            <form
              onSubmit={e => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="relative bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700/80 focus-within:border-indigo-500 dark:focus-within:border-indigo-400 focus-within:ring-3 focus-within:ring-indigo-500/15 rounded-2xl shadow-sm transition-all overflow-hidden"
            >
              <textarea
                ref={textareaRef}
                rows={2}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask any programming concept, debug code, or explore a CS subject..."
                className="w-full px-4 pt-3 pb-2 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 bg-transparent resize-none focus:outline-none leading-relaxed"
              />

              {/* Input Action Controls Strip */}
              <div className="flex items-center justify-between px-3 pb-2.5 pt-1">
                <div className="flex items-center gap-1.5">
                  {/* Subject Badge if active */}
                  {selectedSubject && (
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                      <Code2 size={11} />
                      {selectedSubject.shortName}
                    </span>
                  )}

                  {/* Attachment Icon */}
                  <button
                    type="button"
                    onClick={() => {
                      setInput('Please review this algorithm implementation and suggest optimizations:\n\n```python\ndef solve():\n    pass\n```');
                      textareaRef.current?.focus();
                      showToast('Attached code template');
                    }}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                    title="Insert Code Snippet / Attachment"
                  >
                    <Paperclip size={15} />
                  </button>

                  {/* Microphone Icon */}
                  <button
                    type="button"
                    onClick={handleToggleVoice}
                    className={cn(
                      'p-1.5 rounded-lg transition-colors cursor-pointer',
                      isRecording
                        ? 'text-red-500 bg-red-500/10 animate-pulse'
                        : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                    )}
                    title="Voice dictation"
                  >
                    <Mic size={15} />
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-400 hidden sm:inline">
                    <kbd className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded text-[9px] font-mono">Enter</kbd> to send
                  </span>

                  {/* Animated Send Button */}
                  <motion.button
                    type="submit"
                    disabled={!input.trim() || isTyping}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={cn(
                      'p-2 rounded-xl flex items-center justify-center transition-all cursor-pointer shadow-xs',
                      input.trim() && !isTyping
                        ? 'bg-indigo-600 text-white hover:bg-indigo-500'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                    )}
                    title="Send message"
                  >
                    <Send size={14} />
                  </motion.button>
                </div>
              </div>
            </form>

            {/* Grounding Attribution & Policy Notice */}
            <div className="mt-2 flex items-center justify-between px-1 text-[10px] text-slate-400">
              <span className="truncate">
                Knowledge grounded in W3Schools & GeeksforGeeks CS curriculum.
              </span>
              <span className="hidden sm:inline">
                Polite out-of-scope classifier active.
              </span>
            </div>
          </div>
        </div>
      </main>

      {/* ── 3D GEMINI FLASH CONFIGURATION MODAL ── */}
      <AnimatePresence>
        {showKeyModal && (
          <div
            className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/65 backdrop-blur-md"
            style={{ perspective: 1200 }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.35, rotateX: 20, z: -120 }}
              animate={{ opacity: 1, scale: 1, rotateX: 0, z: 0 }}
              exit={{ opacity: 0, scale: 0.35, rotateX: -20, z: -120 }}
              transition={{ type: 'spring', damping: 22, stiffness: 280 }}
              style={{ transformStyle: 'preserve-3d' }}
              className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 p-6 rounded-3xl max-w-md w-full space-y-4 text-xs shadow-2xl relative"
            >
              <div className="flex justify-between items-center" style={{ transform: 'translateZ(15px)' }}>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/30">
                    <Zap size={16} />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                      Connect Google Gemini Flash
                    </h4>
                    <span className="text-[10px] text-emerald-500 font-bold uppercase tracking-wider">
                      Ultra-Fast CS AI Model
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowKeyModal(false)}
                  className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-[11px]" style={{ transform: 'translateZ(10px)' }}>
                Gemini Flash delivers lightning-fast code explanations and answers any Computer Science question in milliseconds. Paste your free Google AI Studio key below:
              </p>

              <div className="space-y-1.5" style={{ transform: 'translateZ(12px)' }}>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Google AI Studio API Key
                </label>
                <div className="relative">
                  <input
                    type="password"
                    placeholder="AIzaSy..."
                    value={tempKeyInput}
                    onChange={e => setTempKeyInput(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800/80 border-2 border-slate-200 dark:border-slate-700 focus:border-indigo-500 dark:focus:border-indigo-400 rounded-xl text-slate-900 dark:text-white font-mono focus:outline-none transition-all shadow-2xs"
                  />
                  {tempKeyInput && (
                    <button
                      type="button"
                      onClick={() => setTempKeyInput('')}
                      className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/50 dark:border-slate-700/50 text-[10px] text-slate-500 dark:text-slate-400 space-y-1" style={{ transform: 'translateZ(8px)' }}>
                <p>• Stored safely in your local browser storage only.</p>
                <p>
                  • Get a 100% free key with no credit card at{' '}
                  <a
                    href="https://aistudio.google.com/app/apikey"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-600 dark:text-indigo-400 underline font-semibold inline-flex items-center gap-0.5"
                  >
                    aistudio.google.com <ExternalLink size={9} />
                  </a>
                </p>
                <p>• If no key is set, the offline W3Schools/GeeksforGeeks engine is used automatically.</p>
              </div>

              <div className="flex justify-end gap-2 pt-2" style={{ transform: 'translateZ(15px)' }}>
                <button
                  type="button"
                  onClick={() => setShowKeyModal(false)}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  type="button"
                  onClick={() => {
                    const cleanKey = tempKeyInput.trim();
                    setApiKey(cleanKey);
                    saveActiveGeminiKey(cleanKey);
                    setShowKeyModal(false);
                    showToast(cleanKey ? 'Gemini Flash model connected!' : 'Key cleared (using offline engine)');
                  }}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
                >
                  Save & Connect
                </motion.button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
