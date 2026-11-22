// ============================================================================
// DevPilot — ChatGPT-Style Conversation History & Navigation Sidebar
// ============================================================================
import React, { useState } from 'react';
import {
  Plus, MessageSquare, Trash2, Search, Bookmark,
  Layers, Code2, ChevronLeft, Sparkles, BookOpen
} from 'lucide-react';
import { CS_SUBJECTS, type CSSubject } from '../../data/csKnowledgeBase';
import type { ChatSession } from './AICopilotChat';

interface ChatSidebarProps {
  sessions: ChatSession[];
  activeSessionId: string;
  onSelectSession: (id: string) => void;
  onNewChat: (subject?: CSSubject) => void;
  onDeleteSession: (id: string, e: React.MouseEvent) => void;
  isOpen: boolean;
  onClose: () => void;
}

export default function ChatSidebar({
  sessions,
  activeSessionId,
  onSelectSession,
  onNewChat,
  onDeleteSession,
  isOpen,
  onClose,
}: ChatSidebarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'chats' | 'subjects' | 'bookmarks'>('chats');

  // Filter sessions by search query
  const filteredSessions = sessions.filter((s) =>
    s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.messages.some((m) => m.content.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Bookmarked messages across all sessions
  const bookmarkedItems = sessions.flatMap((s) =>
    s.messages
      .filter((m) => m.isBookmarked)
      .map((m) => ({ ...m, sessionId: s.id, sessionTitle: s.title }))
  );

  if (!isOpen) return null;

  return (
    <aside className="w-72 sm:w-80 h-full flex flex-col bg-slate-50/95 dark:bg-slate-950/95 border-r border-slate-200 dark:border-slate-800/80 shrink-0 select-none transition-all">
      {/* Top Action Header: New Chat Button */}
      <div className="p-3.5 border-b border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => onNewChat()}
          className="flex-1 inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-950 font-medium text-xs sm:text-sm transition-all cursor-pointer shadow-xs"
        >
          <Plus size={16} strokeWidth={2.5} />
          <span>New Chat</span>
        </button>

        <button
          type="button"
          onClick={onClose}
          title="Close sidebar"
          className="p-2 rounded-xl hover:bg-slate-200/60 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors cursor-pointer"
        >
          <ChevronLeft size={18} />
        </button>
      </div>

      {/* Mode Navigation Tabs */}
      <div className="flex px-3 pt-3 gap-1 border-b border-slate-200/60 dark:border-slate-800/60 text-xs font-semibold">
        <button
          type="button"
          onClick={() => setActiveTab('chats')}
          className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
            activeTab === 'chats'
              ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-cyan-400 shadow-xs'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <MessageSquare size={13} />
          <span>Chats</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('subjects')}
          className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
            activeTab === 'subjects'
              ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-cyan-400 shadow-xs'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <BookOpen size={13} />
          <span>Subjects</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('bookmarks')}
          className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
            activeTab === 'bookmarks'
              ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-cyan-400 shadow-xs'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Bookmark size={13} />
          <span>Saved</span>
        </button>
      </div>

      {/* Search Input (For Chats Tab) */}
      {activeTab === 'chats' && (
        <div className="px-3 pt-3">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search conversations..."
              className="w-full bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-2.5 space-y-1 chat-scroll">
        {activeTab === 'chats' && (
          <>
            {filteredSessions.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-400 dark:text-slate-500">
                No conversations found
              </div>
            ) : (
              filteredSessions.map((s) => {
                const isActive = s.id === activeSessionId;
                return (
                  <div
                    key={s.id}
                    onClick={() => onSelectSession(s.id)}
                    className={`group relative flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium cursor-pointer transition-all ${
                      isActive
                        ? 'bg-indigo-50/80 dark:bg-slate-800/90 text-indigo-700 dark:text-cyan-300 font-semibold shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 pr-2">
                      <MessageSquare
                        size={14}
                        className={isActive ? 'text-indigo-600 dark:text-cyan-400 shrink-0' : 'text-slate-400 shrink-0'}
                      />
                      <span className="truncate">{s.title || 'Untitled Chat'}</span>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => onDeleteSession(s.id, e)}
                      title="Delete chat"
                      className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-rose-100 dark:hover:bg-rose-950/60 hover:text-rose-600 transition-all cursor-pointer"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                );
              })
            )}
          </>
        )}

        {/* CS Subjects Quick Launcher */}
        {activeTab === 'subjects' && (
          <div className="space-y-1.5 pt-1">
            <div className="px-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Engineering Stacks
            </div>
            {CS_SUBJECTS.map((sub) => {
              const Icon = sub.icon;
              return (
                <button
                  key={sub.id}
                  type="button"
                  onClick={() => onNewChat(sub)}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left border border-transparent hover:border-slate-200 dark:hover:border-slate-800 hover:bg-white dark:hover:bg-slate-900 transition-all cursor-pointer group"
                >
                  <div className={`p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 ${sub.color}`}>
                    <Icon size={14} />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-cyan-400 truncate">
                      {sub.name}
                    </div>
                    <div className="text-[10px] text-slate-400 truncate">
                      {sub.recommendedQuestions.length} guided topics
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Bookmarks Tab */}
        {activeTab === 'bookmarks' && (
          <div className="space-y-2 pt-1">
            <div className="px-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Saved Snippets ({bookmarkedItems.length})
            </div>
            {bookmarkedItems.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-400 dark:text-slate-500">
                No bookmarked messages yet. Click the bookmark icon on any answer to save it here.
              </div>
            ) : (
              bookmarkedItems.map((bm) => (
                <div
                  key={bm.id}
                  onClick={() => onSelectSession(bm.sessionId)}
                  className="p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:border-indigo-400 transition-all cursor-pointer text-left"
                >
                  <div className="text-[10px] font-semibold text-indigo-500 dark:text-cyan-400 mb-1 truncate">
                    From: {bm.sessionTitle}
                  </div>
                  <p className="text-xs text-slate-700 dark:text-slate-300 line-clamp-3 leading-relaxed">
                    {bm.content}
                  </p>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="p-3 border-t border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500">
        <span>DevPilot AI Copilot</span>
        <span>v3.0 3D</span>
      </div>
    </aside>
  );
}
