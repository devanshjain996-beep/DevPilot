// ============================================================================
// DevPilot — 3D Animated Geometric Neural Matrix (Framer Motion 3D)
// ============================================================================
import React from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';

export default function AnimatedNeuralNetwork() {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Parallax 3D tilt tracking
  const rotateX = useTransform(mouseY, [-60, 60], [20, -20]);
  const rotateY = useTransform(mouseX, [-60, 60], [-20, 20]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    mouseX.set(e.clientX - centerX);
    mouseY.set(e.clientY - centerY);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative w-36 h-36 flex items-center justify-center cursor-grab active:cursor-grabbing select-none"
      style={{ perspective: 1200 }}
    >
      {/* 3D Root Canvas with mouse tilt and smooth continuous rotation */}
      <motion.div
        style={{
          rotateX,
          rotateY,
          transformStyle: 'preserve-3d',
        }}
        animate={{
          y: [0, -8, 0],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="relative w-full h-full flex items-center justify-center"
      >
        {/* Soft 3D Ambient Core Glow */}
        <motion.div
          animate={{
            scale: [1, 1.25, 1],
            opacity: [0.4, 0.75, 0.4],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute w-24 h-24 rounded-full bg-gradient-to-tr from-blue-500/25 via-indigo-500/30 to-violet-500/30 blur-2xl pointer-events-none"
          style={{ transform: 'translateZ(-30px)' }}
        />

        {/* ── 3D ORBITAL RING 1 (Horizontal Inclined) ── */}
        <motion.div
          animate={{ rotateZ: 360 }}
          transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
          className="absolute w-28 h-28 rounded-full border border-indigo-500/40 border-dashed"
          style={{
            transform: 'rotateX(72deg) rotateY(15deg) translateZ(0px)',
            transformStyle: 'preserve-3d',
          }}
        >
          {/* Orbital Satellite Node */}
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_12px_#38bdf8]"
            style={{ transform: 'translateZ(15px)' }}
          />
        </motion.div>

        {/* ── 3D ORBITAL RING 2 (Vertical Cross Inclined) ── */}
        <motion.div
          animate={{ rotateZ: -360 }}
          transition={{ duration: 14, repeat: Infinity, ease: 'linear' }}
          className="absolute w-24 h-24 rounded-full border border-blue-400/30 border-dotted"
          style={{
            transform: 'rotateY(75deg) rotateX(25deg) translateZ(0px)',
            transformStyle: 'preserve-3d',
          }}
        >
          {/* Orbital Satellite Node */}
          <div
            className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-indigo-400 shadow-[0_0_10px_#818cf8]"
            style={{ transform: 'translateZ(10px)' }}
          />
        </motion.div>

        {/* ── 3D CENTRAL ISOMETRIC NEURAL OCTAHEDRON ── */}
        <motion.div
          animate={{
            rotateY: [0, 360],
            rotateX: [15, 30, 15],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: 'linear',
          }}
          className="relative w-16 h-16 flex items-center justify-center"
          style={{ transformStyle: 'preserve-3d' }}
        >
          {/* Core Central Node */}
          <motion.div
            animate={{
              scale: [0.9, 1.15, 0.9],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="w-7 h-7 rounded-full bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-500 shadow-[0_0_20px_rgba(79,70,229,0.7)] flex items-center justify-center text-white text-[10px] font-bold"
            style={{ transform: 'translateZ(10px)' }}
          >
            AI
          </motion.div>

          {/* 3D Polyhedral Nodes (Projected in 3D Space) */}
          {[
            { x: 0, y: -28, z: 15, col: 'bg-blue-400' },
            { x: 26, y: 0, z: -15, col: 'bg-violet-400' },
            { x: -26, y: 0, z: 15, col: 'bg-cyan-400' },
            { x: 0, y: 28, z: -15, col: 'bg-indigo-400' },
            { x: 18, y: -18, z: 20, col: 'bg-emerald-400' },
            { x: -18, y: 18, z: -20, col: 'bg-amber-400' },
          ].map((node, i) => (
            <motion.div
              key={i}
              className={`absolute w-2 h-2 rounded-full ${node.col} shadow-[0_0_8px_currentColor]`}
              style={{
                transform: `translate3d(${node.x}px, ${node.y}px, ${node.z}px)`,
              }}
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.6, 1, 0.6],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.3,
              }}
            />
          ))}

          {/* Connecting 3D Vector Beams */}
          <svg className="absolute inset-0 w-full h-full overflow-visible pointer-events-none opacity-40">
            <line x1="32" y1="32" x2="32" y2="4" stroke="#818cf8" strokeWidth="1" strokeDasharray="2 2" />
            <line x1="32" y1="32" x2="58" y2="32" stroke="#38bdf8" strokeWidth="1" strokeDasharray="2 2" />
            <line x1="32" y1="32" x2="6" y2="32" stroke="#a78bfa" strokeWidth="1" strokeDasharray="2 2" />
            <line x1="32" y1="32" x2="32" y2="60" stroke="#818cf8" strokeWidth="1" strokeDasharray="2 2" />
          </svg>
        </motion.div>
      </motion.div>

      {/* Floating 3D Badge */}
      <motion.div
        className="absolute -bottom-2 px-2.5 py-0.5 rounded-full text-[9px] font-bold tracking-wider uppercase bg-gradient-to-r from-blue-500/10 via-indigo-500/15 to-violet-500/10 text-indigo-600 dark:text-indigo-300 border border-indigo-400/30 backdrop-blur-md shadow-xs"
        style={{ transform: 'translateZ(30px)' }}
      >
        Gemini Flash 3D
      </motion.div>
    </div>
  );
}
