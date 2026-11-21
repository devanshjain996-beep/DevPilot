// ============================================================================
// DevPilot — DevPilot AI Learning Assistant (Animated Floating Launcher & Drawer)
// ============================================================================
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, Maximize2 } from 'lucide-react';
import AICopilotChat from './AICopilotChat';
import { Badge } from '../ui';

export default function DevPilotAIAssistant() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  // Close on ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) {
        setOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open]);

  return (
    <>
      {/* ── FLOATING ACTION PILL (BOTTOM RIGHT) ── */}
      <AnimatePresence>
        {!open && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="button"
            onClick={() => setOpen(true)}
            aria-label="Open DevPilot AI Copilot"
            className="fixed bottom-6 right-6 z-40 bg-slate-900 hover:bg-slate-800 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white px-4 py-2.5 rounded-full shadow-2xl flex items-center gap-2.5 font-bold text-xs transition-colors border border-white/20 dark:border-indigo-400/30 cursor-pointer group"
          >
            <div className="relative">
              <Sparkles size={16} className="text-amber-400 animate-pulse" />
            </div>
            <span className="font-semibold tracking-tight">AI Copilot</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-white/15 text-white/90 font-medium">
              CS Tutor
            </span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* ── ANIMATED SLIDE-OVER MODAL DRAWER ── */}
      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-50 flex items-center justify-center sm:justify-end p-2 sm:p-6 pointer-events-none">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs cursor-pointer pointer-events-auto"
              onClick={() => setOpen(false)}
            />

            {/* Chatbot Window Container */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="relative z-10 pointer-events-auto w-full sm:w-[620px] md:w-[720px] h-[88vh] max-h-[720px] rounded-2xl shadow-2xl overflow-hidden flex flex-col border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
              onClick={e => e.stopPropagation()}
            >
              <AICopilotChat
                isFullScreen={false}
                onClose={() => setOpen(false)}
                onExpand={() => {
                  setOpen(false);
                  navigate('/copilot');
                }}
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
