// ============================================================================
// DevPilot — Animated Neural Network / Abstract Identity Element (Framer Motion)
// ============================================================================
import React from 'react';
import { motion } from 'framer-motion';

export default function AnimatedNeuralNetwork() {
  // Pre-calculated node coordinates for balanced, elegant geometry
  const nodes = [
    { id: 1, x: 28, y: 35 },
    { id: 2, x: 50, y: 18 },
    { id: 3, x: 72, y: 35 },
    { id: 4, x: 64, y: 68 },
    { id: 5, x: 36, y: 68 },
    { id: 6, x: 50, y: 46 }, // center hub
  ];

  const connections = [
    [1, 2], [2, 3], [3, 4], [4, 5], [5, 1], // outer perimeter
    [1, 6], [2, 6], [3, 6], [4, 6], [5, 6], // spokes to center hub
  ];

  return (
    <div className="relative w-28 h-28 flex items-center justify-center select-none pointer-events-none">
      {/* Soft ambient glow ring */}
      <motion.div
        animate={{
          scale: [1, 1.08, 1],
          opacity: [0.35, 0.6, 0.35],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute inset-0 rounded-full bg-gradient-to-tr from-blue-500/20 via-indigo-500/20 to-violet-500/20 blur-xl"
      />

      {/* SVG Canvas for interactive nodes and synaptic pulse connections */}
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full relative z-10 overflow-visible"
      >
        {/* Synaptic connection lines */}
        {connections.map(([fromId, toId], i) => {
          const from = nodes.find(n => n.id === fromId)!;
          const to = nodes.find(n => n.id === toId)!;
          return (
            <motion.line
              key={`line-${i}`}
              x1={from.x}
              y1={from.y}
              x2={to.x}
              y2={to.y}
              stroke="currentColor"
              strokeWidth="1.2"
              className="text-indigo-400/40 dark:text-indigo-300/30"
              initial={{ pathLength: 0.2, opacity: 0.3 }}
              animate={{
                opacity: [0.25, 0.7, 0.25],
                strokeWidth: [1, 1.6, 1],
              }}
              transition={{
                duration: 2.8 + (i % 3) * 0.7,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: (i * 0.2) % 1.5,
              }}
            />
          );
        })}

        {/* Outer rotating geometric orbiting ring */}
        <motion.circle
          cx="50"
          cy="46"
          r="38"
          fill="none"
          stroke="currentColor"
          strokeWidth="0.8"
          strokeDasharray="4 6"
          className="text-blue-500/30 dark:text-blue-400/20"
          animate={{ rotate: 360 }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: 'linear',
          }}
          style={{ transformOrigin: '50px 46px' }}
        />

        {/* Synaptic nodes with subtle breathing pulse */}
        {nodes.map((node, i) => {
          const isCenter = node.id === 6;
          return (
            <motion.g key={`node-${node.id}`}>
              {/* Outer halo */}
              <motion.circle
                cx={node.x}
                cy={node.y}
                r={isCenter ? 6 : 4}
                className={isCenter ? 'fill-blue-500/30' : 'fill-indigo-500/25'}
                animate={{
                  r: isCenter ? [5, 7.5, 5] : [3.5, 5.5, 3.5],
                  opacity: [0.4, 0.8, 0.4],
                }}
                transition={{
                  duration: 2.5,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: i * 0.3,
                }}
              />
              {/* Core solid dot */}
              <circle
                cx={node.x}
                cy={node.y}
                r={isCenter ? 3.5 : 2.5}
                className={isCenter ? 'fill-blue-600 dark:fill-blue-400' : 'fill-indigo-600 dark:fill-indigo-400'}
              />
            </motion.g>
          );
        })}
      </svg>
    </div>
  );
}
