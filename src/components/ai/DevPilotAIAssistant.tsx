// ============================================================================
// DevPilot — 3D Animated AI Launcher & Cinematic Pop-Up Modal
// ============================================================================
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, ArrowUpRight, Cpu } from 'lucide-react';
import AICopilotChat from './AICopilotChat';

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
      {/* ── 3D FLOATING INTERACTIVE LAUNCHER CAPSULE (BOTTOM RIGHT) ── */}
      <AnimatePresence>
        {!open && (
          <div
            className="fixed bottom-6 right-6 z-40 select-none"
            style={{ perspective: 1000 }}
          >
            <motion.button
              initial={{ scale: 0, opacity: 0, y: 30 }}
              animate={{
                scale: 1,
                opacity: 1,
                y: [0, -5, 0],
              }}
              exit={{ scale: 0, opacity: 0, y: 20 }}
              transition={{
                y: { duration: 3.5, repeat: Infinity, ease: 'easeInOut' },
                scale: { type: 'spring', damping: 18, stiffness: 300 },
              }}
              whileHover={{
                scale: 1.1,
                rotateX: -10,
                rotateY: 12,
                transition: { duration: 0.2 },
              }}
              whileTap={{ scale: 0.94 }}
              type="button"
              onClick={() => setOpen(true)}
              aria-label="Open 3D DevPilot AI Copilot"
              style={{ transformStyle: 'preserve-3d' }}
              className="relative group bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 dark:from-indigo-700 dark:via-blue-600 dark:to-violet-700 text-white px-4 py-3 rounded-2xl shadow-[0_15px_30px_-5px_rgba(79,70,229,0.45)] dark:shadow-[0_15px_35px_-5px_rgba(99,102,241,0.6)] flex items-center gap-3 border border-indigo-400/30 cursor-pointer overflow-visible"
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
                <div className="flex items-center gap-1 text-[9px] text-indigo-200 dark:text-blue-100 font-semibold mt-1">
                  <Cpu size={10} className="text-cyan-300" />
                  <span>Gemini Flash 3D</span>
                </div>
              </div>

              {/* Floating 3D "Open" Prompt Badge */}
              <div
                className="ml-1 px-2 py-0.5 rounded-lg bg-white/15 border border-white/20 text-[10px] font-bold text-white group-hover:bg-white group-hover:text-slate-900 transition-colors flex items-center gap-0.5"
                style={{ transform: 'translateZ(14px)' }}
              >
                <span>Ask</span>
                <ArrowUpRight size={11} />
              </div>
            </motion.button>
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
              className="relative z-10 pointer-events-auto w-full max-w-4xl h-[90vh] max-h-[760px] rounded-3xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.6)] overflow-hidden flex flex-col border border-slate-300/60 dark:border-slate-700/60 bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl"
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
