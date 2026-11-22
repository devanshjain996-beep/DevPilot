// ============================================================================
// DevPilot — Dimensional Architectural 3D Interactive Door Component
// ============================================================================
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUpRight, Sparkles, type LucideIcon } from 'lucide-react';

export interface DoorThemeConfig {
  primary: string;       // Primary glowing hex or tailwind class
  secondary: string;     // Complementary accent
  glowColor: string;     // Box shadow rgb
  borderGlow: string;    // Border color class
  textAccent: string;    // Text accent class
  bgGradient: string;    // Inner portal background
  runeSymbol: string;    // Cybernetic rune / character
}

interface PortalDoor3DProps {
  id: string;
  doorNumber: string;
  title: string;
  subtitle: string;
  description: string;
  icon: LucideIcon;
  theme: DoorThemeConfig;
  telemetryBadge: string;
  telemetrySub?: string;
  onClick: () => void;
  isOpening?: boolean;
  disabled?: boolean;
}

export default function PortalDoor3D({
  doorNumber,
  title,
  subtitle,
  description,
  icon: Icon,
  theme,
  telemetryBadge,
  telemetrySub,
  onClick,
  isOpening = false,
  disabled = false,
}: PortalDoor3DProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="relative select-none group w-full max-w-[280px] sm:max-w-[300px] mx-auto cursor-pointer"
      style={{ perspective: 1200 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => {
        if (!disabled && !isOpening) onClick();
      }}
    >
      {/* ── 3D PIVOTING DOOR CONTAINER ── */}
      <motion.div
        animate={{
          rotateX: isHovered ? -4 : 0,
          rotateY: isHovered ? 6 : 0,
          z: isOpening ? 180 : isHovered ? 35 : 0,
          scale: isOpening ? 1.08 : isHovered ? 1.03 : 1,
        }}
        transition={{
          type: 'spring',
          damping: 22,
          stiffness: 260,
          mass: 0.8,
        }}
        style={{ transformStyle: 'preserve-3d' }}
        className="relative rounded-2xl p-1 bg-slate-900/90 border border-slate-800 transition-shadow duration-500"
      >
        {/* Dynamic Glowing Outer Frame */}
        <div
          className="absolute -inset-1 rounded-2xl opacity-40 group-hover:opacity-100 transition-opacity duration-500 blur-md pointer-events-none"
          style={{
            background: `radial-gradient(circle at 50% 50%, rgba(${theme.glowColor}, 0.65), transparent 70%)`,
          }}
        />

        {/* Outer Door Frame with Futuristic Chamfered Border */}
        <div
          className={`relative rounded-xl overflow-hidden border ${theme.borderGlow} bg-slate-950/90 flex flex-col justify-between transition-colors duration-300 min-h-[380px] sm:min-h-[420px]`}
          style={{
            boxShadow: isHovered
              ? `0 20px 40px -10px rgba(${theme.glowColor}, 0.45), inset 0 0 25px rgba(${theme.glowColor}, 0.2)`
              : `0 10px 25px -5px rgba(0, 0, 0, 0.6), inset 0 0 10px rgba(${theme.glowColor}, 0.08)`,
          }}
        >
          {/* Top Archway Header with Door Number */}
          <div className="p-3.5 border-b border-slate-800/80 bg-slate-900/60 flex items-center justify-between z-10">
            <div className="flex items-center gap-2">
              <span
                className="font-mono text-xs font-bold tracking-widest px-2 py-0.5 rounded-md border text-slate-200"
                style={{
                  borderColor: `rgba(${theme.glowColor}, 0.4)`,
                  backgroundColor: `rgba(${theme.glowColor}, 0.12)`,
                }}
              >
                DOOR {doorNumber}
              </span>
              <span className="w-1.5 h-1.5 rounded-full animate-ping" style={{ backgroundColor: theme.primary }} />
            </div>

            <div className="flex items-center gap-1 text-[11px] font-mono text-slate-400 group-hover:text-white transition-colors">
              <span>ENTER</span>
              <ArrowUpRight size={13} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </div>
          </div>

          {/* ── INTERNAL PORTAL APERTURE & DUAL HINGED PANELS ── */}
          <div className="relative flex-1 flex flex-col items-center justify-center p-6 overflow-hidden">
            {/* Volumetric Portal Glow inside the Door */}
            <div
              className="absolute inset-0 transition-opacity duration-700 pointer-events-none"
              style={{
                opacity: isOpening ? 1 : isHovered ? 0.85 : 0.25,
                background: `radial-gradient(ellipse at 50% 45%, rgba(${theme.glowColor}, 0.6) 0%, rgba(${theme.glowColor}, 0.15) 50%, transparent 80%)`,
              }}
            />

            {/* Futuristic Grid Lines Inside Portal */}
            <div
              className="absolute inset-0 opacity-15 pointer-events-none"
              style={{
                backgroundImage: `linear-gradient(rgba(${theme.glowColor}, 0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(${theme.glowColor}, 0.3) 1px, transparent 1px)`,
                backgroundSize: '20px 20px',
              }}
            />

            {/* Split Door Wings (Left and Right swinging panels that open on hover & click) */}
            <div
              className="absolute inset-y-0 left-0 w-1/2 bg-slate-900/80 border-r border-slate-700/60 transition-transform duration-700 ease-out origin-left pointer-events-none flex items-center justify-end pr-1"
              style={{
                transform: isOpening
                  ? 'perspective(600px) rotateY(-85deg)'
                  : isHovered
                  ? 'perspective(600px) rotateY(-24deg)'
                  : 'perspective(600px) rotateY(0deg)',
              }}
            >
              <div className="h-16 w-1 rounded-full bg-slate-700/60" />
            </div>

            <div
              className="absolute inset-y-0 right-0 w-1/2 bg-slate-900/80 border-l border-slate-700/60 transition-transform duration-700 ease-out origin-right pointer-events-none flex items-center justify-start pl-1"
              style={{
                transform: isOpening
                  ? 'perspective(600px) rotateY(85deg)'
                  : isHovered
                  ? 'perspective(600px) rotateY(24deg)'
                  : 'perspective(600px) rotateY(0deg)',
              }}
            >
              <div className="h-16 w-1 rounded-full bg-slate-700/60" />
            </div>

            {/* Center Dimensional Emblem & Icon */}
            <div className="relative z-10 flex flex-col items-center text-center space-y-3" style={{ transform: 'translateZ(20px)' }}>
              <div
                className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-lg border"
                style={{
                  background: isHovered
                    ? `linear-gradient(135deg, rgba(${theme.glowColor}, 0.4), rgba(15, 23, 42, 0.9))`
                    : 'linear-gradient(135deg, rgba(30, 41, 59, 0.9), rgba(15, 23, 42, 0.95))',
                  borderColor: isHovered ? theme.primary : 'rgba(71, 85, 105, 0.4)',
                  boxShadow: isHovered
                    ? `0 0 25px rgba(${theme.glowColor}, 0.6), inset 0 0 15px rgba(${theme.glowColor}, 0.3)`
                    : '0 4px 15px rgba(0, 0, 0, 0.4)',
                }}
              >
                <Icon
                  size={32}
                  className="transition-transform duration-300 group-hover:scale-110"
                  style={{ color: theme.primary }}
                />
              </div>

              <div>
                <h3 className="text-lg sm:text-xl font-bold tracking-tight text-white group-hover:text-cyan-300 transition-colors">
                  {title}
                </h3>
                <p className="text-xs text-slate-400 group-hover:text-slate-300 font-medium mt-0.5">
                  {subtitle}
                </p>
              </div>

              {/* Description preview revealed on hover */}
              <p className="text-[12px] text-slate-400 leading-relaxed max-w-[210px] line-clamp-2 opacity-80 group-hover:opacity-100 transition-opacity">
                {description}
              </p>
            </div>
          </div>

          {/* ── BOTTOM THRESHOLD & TELEMETRY HUD ── */}
          <div className="p-3.5 border-t border-slate-800/80 bg-slate-950/90 z-10">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: theme.primary }} />
                <span className="text-xs font-semibold text-slate-200 truncate">
                  {telemetryBadge}
                </span>
              </div>

              {telemetrySub && (
                <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400 shrink-0">
                  {telemetrySub}
                </span>
              )}
            </div>

            {/* Glowing Floor Threshold Beam */}
            <div
              className="h-1 w-full rounded-full mt-2 transition-all duration-300"
              style={{
                backgroundColor: isHovered ? theme.primary : 'rgba(51, 65, 85, 0.5)',
                boxShadow: isHovered ? `0 0 10px ${theme.primary}` : 'none',
              }}
            />
          </div>
        </div>
      </motion.div>
    </div>
  );
}
