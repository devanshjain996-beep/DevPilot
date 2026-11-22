// ============================================================================
// DevPilot — 3D Animated AI Launcher & Cinematic Pop-Up Modal
// ============================================================================
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, ArrowUpRight, Cpu, Minus } from 'lucide-react';
import AICopilotChat from './AICopilotChat';

export default function DevPilotAIAssistant() {
  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(() => {
    return localStorage.getItem('devpilot_copilot_minimized') === 'true';
  });
  const navigate = useNavigate();

  const toggleMinimized = (e: React.MouseEvent) => {
    e.stopPropagation();
    const next = !minimized;
    setMinimized(next);
    localStorage.setItem('devpilot_copilot_minimized', String(next));
  };

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
      {/* ── 3D FLOATING INTERACTIVE LAUNCHER CAPSULE (BOTTOM RIGHT) ── */}
      <AnimatePresence>
        {!open && (
          <div
            className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-40 select-none"
            style={{ perspective: 1000 }}
          >
            {minimized ? (
              <motion.button
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1, y: [0, -4, 0] }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{
                  y: { duration: 3, repeat: Infinity, ease: 'easeInOut' },
                  scale: { type: 'spring', damping: 20 },
                }}
                whileHover={{ scale: 1.15 }}
                whileTap={{ scale: 0.92 }}
                type="button"
                onClick={() => setOpen(true)}
                title="Open DevPilot AI Copilot (Click to open, or expand)"
                className="w-12 h-12 rounded-full bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 border border-cyan-400/60 shadow-[0_10px_25px_-5px_rgba(6,182,212,0.6)] flex items-center justify-center text-white cursor-pointer relative group"
              >
                <Sparkles size={20} className="animate-pulse" />
                <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-400 border-2 border-slate-950 animate-ping" />
                <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-400 border-2 border-slate-950" />
                
                {/* Expand Pill Button on hover */}
                <button
                  type="button"
                  onClick={toggleMinimized}
                  title="Expand to capsule"
                  className="absolute -top-2 -left-2 w-5 h-5 rounded-full bg-slate-900 border border-slate-700 text-slate-300 hover:text-white opacity-0 group-hover:opacity-100 flex items-center justify-center text-[10px] transition-opacity"
                >
                  +
                </button>
              </motion.button>
            ) : (
              <motion.div
                initial={{ scale: 0, opacity: 0, y: 30 }}
                animate={{
                  scale: 1,
                  opacity: 1,
                  y: [0, -4, 0],
                }}
                exit={{ scale: 0, opacity: 0, y: 20 }}
                transition={{
                  y: { duration: 3.5, repeat: Infinity, ease: 'easeInOut' },
                  scale: { type: 'spring', damping: 18, stiffness: 300 },
                }}
                style={{ transformStyle: 'preserve-3d' }}
                className="relative group bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 dark:from-indigo-700 dark:via-blue-600 dark:to-violet-700 text-white pl-3.5 pr-2.5 py-2.5 rounded-2xl shadow-[0_15px_30px_-5px_rgba(79,70,229,0.45)] dark:shadow-[0_15px_35px_-5px_rgba(99,102,241,0.6)] flex items-center gap-2.5 border border-indigo-400/40 cursor-pointer overflow-visible"
                onClick={() => setOpen(true)}
              >
                {/* 3D Rotating Glowing Outer Ring */}
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
                  className="w-7 h-7 rounded-lg bg-gradient-to-tr from-cyan-400 via-blue-500 to-indigo-500 flex items-center justify-center shadow-md shadow-blue-500/50 shrink-0"
                  style={{ transform: 'translateZ(12px)' }}
                >
                  <Sparkles size={15} className="text-white animate-pulse" />
                </motion.div>

                {/* Title & Powered By Badge */}
                <div className="text-left" style={{ transform: 'translateZ(8px)' }}>
                  <div className="flex items-center gap-1.5 leading-none">
                    <span className="font-extrabold text-xs tracking-tight text-white">
                      AI Copilot
                    </span>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  </div>
                  <div className="flex items-center gap-1 text-[9px] text-cyan-200 font-semibold mt-1 font-mono">
                    <Cpu size={10} className="text-cyan-300" />
                    <span>Gemini Flash 3D</span>
                  </div>
                </div>

                {/* Floating 3D "Open" Prompt Badge */}
                <div
                  className="ml-1 px-2 py-0.5 rounded-lg bg-white/20 border border-white/30 text-[10px] font-bold text-white group-hover:bg-white group-hover:text-slate-900 transition-colors flex items-center gap-0.5"
                  style={{ transform: 'translateZ(14px)' }}
                >
                  <span>Ask</span>
                  <ArrowUpRight size={11} />
                </div>

                {/* Minimize Button */}
                <button
                  type="button"
                  onClick={toggleMinimized}
                  title="Minimize AI Copilot button"
                  className="ml-0.5 p-1 rounded-md text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <Minus size={12} />
                </button>
              </motion.div>
            )}
          </div>
        )}
      </AnimatePresence>

      {/* ── 3D CINEMATIC POP-UP TRANSITION & MODAL ── */}
      <AnimatePresence>
        {open && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 select-none"
            style={{ perspective: 1400 }}
          >
            {/* Backdrop with 3D Depth Blur */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="fixed inset-0 bg-slate-950/60 backdrop-blur-md cursor-pointer pointer-events-auto"
              onClick={() => setOpen(false)}
            />

            {/* 3D Pop-up Window with Spring Physics & Depth Perspective */}
            <motion.div
              initial={{
                opacity: 0,
                scale: 0.35,
                rotateX: 25,
                rotateY: -15,
                z: -250,
                y: 100,
              }}
              animate={{
                opacity: 1,
                scale: 1,
                rotateX: 0,
                rotateY: 0,
                z: 0,
                y: 0,
              }}
              exit={{
                opacity: 0,
                scale: 0.3,
                rotateX: -20,
                rotateY: 15,
                z: -200,
                y: 90,
              }}
              transition={{
                type: 'spring',
                damping: 24,
                stiffness: 280,
                mass: 0.85,
              }}
              style={{
                transformStyle: 'preserve-3d',
              }}
              className="relative z-10 pointer-events-auto w-full max-w-5xl h-[92vh] max-h-[820px] rounded-3xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.6)] overflow-hidden flex flex-col border border-slate-300/60 dark:border-slate-800 bg-white dark:bg-slate-950 backdrop-blur-2xl"
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
