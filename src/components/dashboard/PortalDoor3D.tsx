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
      className="relative select-none group w-full max-w-[270px] sm:max-w-[290px] mx-auto cursor-pointer"
      style={{ perspective: 1400 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => {
        if (!disabled && !isOpening) onClick();
      }}
    >
      {/* ── 3D PIVOTING ARCHITECTURAL PORTAL CONTAINER ── */}
      <motion.div
        animate={{
          rotateX: isHovered ? -5 : 0,
          rotateY: isHovered ? 6 : 0,
          z: isOpening ? 200 : isHovered ? 40 : 0,
          scale: isOpening ? 1.12 : isHovered ? 1.04 : 1,
        }}
        transition={{
          type: 'spring',
          damping: 24,
          stiffness: 240,
          mass: 0.85,
        }}
        style={{ transformStyle: 'preserve-3d' }}
        className="relative rounded-2xl p-1 transition-shadow duration-500"
      >
        {/* Exterior Atmospheric Aura Light */}
        <div
          className="absolute -inset-2 rounded-2xl opacity-30 group-hover:opacity-100 transition-opacity duration-500 blur-xl pointer-events-none"
          style={{
            background: `radial-gradient(circle at 50% 50%, rgba(${theme.glowColor}, 0.75), transparent 75%)`,
          }}
        />

        {/* ── ARCHITECTURAL PORTAL FRAME (Sci-Fi Door Jamb with Corner Chamfers) ── */}
        <div
          className={`relative rounded-xl overflow-hidden border ${theme.borderGlow} bg-[#0b101e] flex flex-col justify-between transition-all duration-300 min-h-[400px] sm:min-h-[440px]`}
          style={{
            boxShadow: isHovered
              ? `0 25px 50px -10px rgba(${theme.glowColor}, 0.5), inset 0 0 35px rgba(${theme.glowColor}, 0.25)`
              : `0 12px 30px -5px rgba(0, 0, 0, 0.7), inset 0 0 12px rgba(${theme.glowColor}, 0.1)`,
          }}
        >
          {/* Vertical Energy Conduit Pillars (Left and Right Frame Edge) */}
          <div
            className="absolute top-0 bottom-0 left-0 w-1.5 z-20 pointer-events-none transition-all duration-300"
            style={{
              backgroundColor: isHovered ? theme.primary : `rgba(${theme.glowColor}, 0.3)`,
              boxShadow: isHovered ? `0 0 12px ${theme.primary}` : 'none',
            }}
          />
          <div
            className="absolute top-0 bottom-0 right-0 w-1.5 z-20 pointer-events-none transition-all duration-300"
            style={{
              backgroundColor: isHovered ? theme.primary : `rgba(${theme.glowColor}, 0.3)`,
              boxShadow: isHovered ? `0 0 12px ${theme.primary}` : 'none',
            }}
          />

          {/* Top Archway / Portal Lintel */}
          <div className="relative p-3.5 border-b border-slate-800/90 bg-slate-900/80 backdrop-blur-sm flex items-center justify-between z-20">
            <div className="flex items-center gap-2">
              <span
                className="font-mono text-xs font-bold tracking-widest px-2.5 py-0.5 rounded-md border text-slate-100 shadow-xs"
                style={{
                  borderColor: `rgba(${theme.glowColor}, 0.6)`,
                  backgroundColor: `rgba(${theme.glowColor}, 0.18)`,
                }}
              >
                DOOR {doorNumber}
              </span>
              <span
                className="w-2 h-2 rounded-full animate-ping"
                style={{ backgroundColor: theme.primary }}
              />
            </div>

            <div className="flex items-center gap-1 text-[11px] font-mono font-semibold text-slate-400 group-hover:text-white transition-colors">
              <span>ENGAGE</span>
              <ArrowUpRight
                size={14}
                className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"
                style={{ color: theme.primary }}
              />
            </div>
          </div>

          {/* ── PORTAL CHAMBER: DUAL SWINGING DOORS & VORTEX LIGHT ── */}
          <div className="relative flex-1 flex flex-col items-center justify-center p-6 overflow-hidden">
            {/* Interior Volumetric Vortex Beam (Blasts through open doorway) */}
            <div
              className="absolute inset-0 transition-all duration-700 pointer-events-none"
              style={{
                opacity: isOpening ? 1 : isHovered ? 0.95 : 0.3,
                background: `radial-gradient(ellipse at 50% 45%, rgba(${theme.glowColor}, ${isOpening ? 0.95 : 0.7}) 0%, rgba(${theme.glowColor}, 0.25) 55%, transparent 85%)`,
                transform: isOpening ? 'scale(1.4)' : isHovered ? 'scale(1.1)' : 'scale(1)',
              }}
            />

            {/* Futuristic Interior Floor Grid Matrix */}
            <div
              className="absolute inset-0 opacity-20 pointer-events-none"
              style={{
                backgroundImage: `linear-gradient(rgba(${theme.glowColor}, 0.35) 1px, transparent 1px), linear-gradient(90deg, rgba(${theme.glowColor}, 0.35) 1px, transparent 1px)`,
                backgroundSize: '22px 22px',
              }}
            />

            {/* ── LEFT PHYSICAL DOOR WING (Hinged on Left) ── */}
            <div
              className="absolute inset-y-0 left-0 w-1/2 bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 border-r border-slate-700/80 transition-transform duration-700 ease-out origin-left pointer-events-none flex flex-col justify-between p-2 z-10"
              style={{
                transform: isOpening
                  ? 'perspective(700px) rotateY(-88deg)'
                  : isHovered
                  ? 'perspective(700px) rotateY(-28deg)'
                  : 'perspective(700px) rotateY(0deg)',
                boxShadow: 'inset 2px 0 8px rgba(0,0,0,0.8)',
              }}
            >
              {/* Door Panel Industrial Rivets & Texture */}
              <div className="flex justify-between items-center opacity-40">
                <div className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                <div className="w-1.5 h-1.5 rounded-full bg-slate-500" />
              </div>
              <div className="my-auto self-end pr-1">
                <div
                  className="h-14 w-1 rounded-full transition-colors duration-300"
                  style={{
                    backgroundColor: isHovered ? theme.primary : 'rgba(100, 116, 139, 0.4)',
                    boxShadow: isHovered ? `0 0 8px ${theme.primary}` : 'none',
                  }}
                />
              </div>
              <div className="flex justify-between items-center opacity-40">
                <div className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                <div className="w-1.5 h-1.5 rounded-full bg-slate-500" />
              </div>
            </div>

            {/* ── RIGHT PHYSICAL DOOR WING (Hinged on Right) ── */}
            <div
              className="absolute inset-y-0 right-0 w-1/2 bg-gradient-to-l from-slate-900 via-slate-950 to-slate-900 border-l border-slate-700/80 transition-transform duration-700 ease-out origin-right pointer-events-none flex flex-col justify-between p-2 z-10"
              style={{
                transform: isOpening
                  ? 'perspective(700px) rotateY(88deg)'
                  : isHovered
                  ? 'perspective(700px) rotateY(28deg)'
                  : 'perspective(700px) rotateY(0deg)',
                boxShadow: 'inset -2px 0 8px rgba(0,0,0,0.8)',
              }}
            >
              <div className="flex justify-between items-center opacity-40">
                <div className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                <div className="w-1.5 h-1.5 rounded-full bg-slate-500" />
              </div>
              <div className="my-auto self-start pl-1">
                <div
                  className="h-14 w-1 rounded-full transition-colors duration-300"
                  style={{
                    backgroundColor: isHovered ? theme.primary : 'rgba(100, 116, 139, 0.4)',
                    boxShadow: isHovered ? `0 0 8px ${theme.primary}` : 'none',
                  }}
                />
              </div>
              <div className="flex justify-between items-center opacity-40">
                <div className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                <div className="w-1.5 h-1.5 rounded-full bg-slate-500" />
              </div>
            </div>

            {/* ── CENTER FLOATING 3D HOLOGRAPHIC CORE EMBLEM ── */}
            <div
              className="relative z-20 flex flex-col items-center text-center space-y-3"
              style={{ transform: 'translateZ(30px)' }}
            >
              <div
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-xl border"
                style={{
                  background: isHovered
                    ? `linear-gradient(135deg, rgba(${theme.glowColor}, 0.45), rgba(15, 23, 42, 0.95))`
                    : 'linear-gradient(135deg, rgba(30, 41, 59, 0.92), rgba(11, 16, 30, 0.98))',
                  borderColor: isHovered ? theme.primary : 'rgba(71, 85, 105, 0.5)',
                  boxShadow: isHovered
                    ? `0 0 30px rgba(${theme.glowColor}, 0.7), inset 0 0 20px rgba(${theme.glowColor}, 0.35)`
                    : '0 8px 20px rgba(0, 0, 0, 0.6)',
                }}
              >
                <Icon
                  size={36}
                  className="transition-transform duration-300 group-hover:scale-110"
                  style={{ color: theme.primary }}
                />
              </div>

              <div>
                <h3 className="text-lg sm:text-xl font-extrabold tracking-tight text-white group-hover:text-cyan-200 transition-colors">
                  {title}
                </h3>
                <p className="text-xs text-slate-300 font-semibold mt-0.5">
                  {subtitle}
                </p>
              </div>

              {/* Destination preview revealed on hover */}
              <p className="text-[12px] text-slate-400 leading-relaxed max-w-[210px] line-clamp-2 opacity-80 group-hover:opacity-100 transition-opacity">
                {description}
              </p>
            </div>
          </div>

          {/* ── THRESHOLD PLINTH & TELEMETRY STATUS ── */}
          <div className="relative p-3.5 border-t border-slate-800/90 bg-slate-950/95 z-20">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0 shadow-xs"
                  style={{
                    backgroundColor: theme.primary,
                    boxShadow: `0 0 8px ${theme.primary}`,
                  }}
                />
                <span className="text-xs font-bold text-slate-200 truncate">
                  {telemetryBadge}
                </span>
              </div>

              {telemetrySub && (
                <span className="font-mono text-[10px] px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-slate-400 shrink-0">
                  {telemetrySub}
                </span>
              )}
            </div>

            {/* Glowing Floor Threshold Beam */}
            <div
              className="h-1.5 w-full rounded-full mt-2.5 transition-all duration-300"
              style={{
                backgroundColor: isHovered ? theme.primary : 'rgba(51, 65, 85, 0.6)',
                boxShadow: isHovered ? `0 0 14px ${theme.primary}` : 'none',
              }}
            />
          </div>
        </div>

        {/* 3D Floor Perspective Cast Shadow */}
        <div
          className="w-4/5 mx-auto h-4 rounded-full blur-md opacity-40 group-hover:opacity-80 transition-opacity duration-300 -mt-2"
          style={{
            background: `radial-gradient(ellipse at 50% 50%, rgba(${theme.glowColor}, 0.8), transparent 70%)`,
          }}
        />
      </motion.div>
    </div>
  );
}
