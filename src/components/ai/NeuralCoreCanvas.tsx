// ============================================================================
// DevPilot — 3D Liquid-Metal Neural Core Companion (60fps Canvas Renderer)
// ============================================================================
import React, { useEffect, useRef } from 'react';

export type CompanionOrbState = 'IDLE' | 'LISTENING' | 'THINKING' | 'RESPONDING' | 'ERROR';

interface NeuralCoreCanvasProps {
  state: CompanionOrbState;
  className?: string;
  size?: number;
}

interface LatticeNode {
  x: number;
  y: number;
  z: number;
  phase: number;
  layer: number;
}

interface LatticeEdge {
  a: number;
  b: number;
  pulseOffset: number;
  active: boolean;
}

interface FloatingParticle {
  angle: number;
  elevation: number;
  dist: number;
  size: number;
  speed: number;
  alpha: number;
  colorSlot: number;
}

interface StateVisualConfig {
  label: string;
  dotClass: string;
  rotSpeed: number;
  ringSpeed: number;
  ringScale: number;
  pSpeed: number;
  pulseAmp: number;
  coreBrightness: number;
  synapseSpeed: number;
  c1: [number, number, number];
  c2: [number, number, number];
  c3: [number, number, number];
}

export const ORB_STATE_CONFIGS: Record<CompanionOrbState, StateVisualConfig> = {
  IDLE: {
    label: 'Ready',
    dotClass: 'bg-cyan-400',
    rotSpeed: 0.0024,
    ringSpeed: 0.005,
    ringScale: 1.0,
    pSpeed: 0.35,
    pulseAmp: 0.025,
    coreBrightness: 0.42,
    synapseSpeed: 0.6,
    c1: [0, 216, 255],     // Cyan
    c2: [138, 76, 252],    // Violet
    c3: [56, 189, 248],    // Electric Blue
  },
  LISTENING: {
    label: 'Listening',
    dotClass: 'bg-emerald-400',
    rotSpeed: 0.004,
    ringSpeed: 0.012,
    ringScale: 1.2,
    pSpeed: 0.85,
    pulseAmp: 0.065,
    coreBrightness: 0.52,
    synapseSpeed: 1.0,
    c1: [52, 211, 153],    // Emerald
    c2: [0, 216, 255],     // Cyan
    c3: [99, 102, 241],    // Indigo
  },
  THINKING: {
    label: 'Processing',
    dotClass: 'bg-violet-400',
    rotSpeed: 0.01,
    ringSpeed: 0.022,
    ringScale: 0.94,
    pSpeed: 2.2,
    pulseAmp: 0.055,
    coreBrightness: 0.65,
    synapseSpeed: 2.6,
    c1: [138, 76, 252],    // Violet
    c2: [168, 85, 247],    // Purple
    c3: [0, 216, 255],     // Cyan
  },
  RESPONDING: {
    label: 'Responding',
    dotClass: 'bg-cyan-400',
    rotSpeed: 0.006,
    ringSpeed: 0.014,
    ringScale: 1.12,
    pSpeed: 1.15,
    pulseAmp: 0.09,
    coreBrightness: 0.8,
    synapseSpeed: 1.8,
    c1: [0, 216, 255],     // Cyan
    c2: [56, 189, 248],    // Sky
    c3: [147, 197, 253],   // Light Blue
  },
  ERROR: {
    label: 'Warning',
    dotClass: 'bg-rose-400',
    rotSpeed: 0.0016,
    ringSpeed: 0.0035,
    ringScale: 1.05,
    pSpeed: 0.22,
    pulseAmp: 0.05,
    coreBrightness: 0.45,
    synapseSpeed: 0.4,
    c1: [248, 113, 113],   // Red
    c2: [239, 68, 68],     // Deep Red
    c3: [251, 146, 60],    // Amber
  },
};

export default function NeuralCoreCanvas({
  state,
  className = '',
}: NeuralCoreCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const stateRef = useRef<CompanionOrbState>(state);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId = 0;
    let width = 280;
    let height = 280;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        width = rect.width;
        height = rect.height;
        canvas.width = Math.round(width * dpr);
        canvas.height = Math.round(height * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      }
    };

    resize();
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);

    // 110-node Fibonacci spherical lattice
    const NUM_NODES = 110;
    const nodes: LatticeNode[] = [];
    const goldenAngle = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < NUM_NODES; i++) {
      const y = 1 - (i / (NUM_NODES - 1)) * 2;
      const radiusAtY = Math.sqrt(1 - y * y);
      const theta = goldenAngle * i;
      nodes.push({
        x: Math.cos(theta) * radiusAtY,
        y,
        z: Math.sin(theta) * radiusAtY,
        phase: Math.random() * Math.PI * 2,
        layer: i % 4 === 0 ? 0.82 : 1.0,
      });
    }

    const edges: LatticeEdge[] = [];
    for (let i = 0; i < NUM_NODES; i++) {
      for (let j = i + 1; j < NUM_NODES; j++) {
        const dx = nodes[i].x - nodes[j].x;
        const dy = nodes[i].y - nodes[j].y;
        const dz = nodes[i].z - nodes[j].z;
        if (Math.sqrt(dx * dx + dy * dy + dz * dz) < 0.44) {
          edges.push({
            a: i,
            b: j,
            pulseOffset: Math.random(),
            active: (i + j) % 3 === 0,
          });
        }
      }
    }

    // 900 floating 3D orbital particles
    const NUM_PARTICLES = 900;
    const particles: FloatingParticle[] = Array.from({ length: NUM_PARTICLES }, (_, idx) => {
      const isOuter = idx > 300;
      return {
        angle: Math.random() * Math.PI * 2,
        elevation: (Math.random() - 0.5) * Math.PI,
        dist: isOuter ? 1.1 + Math.random() * 0.9 : 0.35 + Math.random() * 0.65,
        size: isOuter ? 0.6 + Math.random() * 0.9 : 0.8 + Math.random() * 1.1,
        speed: (0.001 + Math.random() * 0.0025) * (idx % 2 === 0 ? 1 : -0.75),
        alpha: isOuter ? 0.15 + Math.random() * 0.35 : 0.2 + Math.random() * 0.4,
        colorSlot: idx % 3,
      };
    });

    const initial = ORB_STATE_CONFIGS[stateRef.current];
    let curRotSpeed = initial.rotSpeed;
    let curRingSpeed = initial.ringSpeed;
    let curRingScale = initial.ringScale;
    let curPulseAmp = initial.pulseAmp;
    let curCoreBrightness = initial.coreBrightness;
    let curSynapseSpeed = initial.synapseSpeed;
    let curPSpeed = initial.pSpeed;
    const c1: [number, number, number] = [...initial.c1];
    const c2: [number, number, number] = [...initial.c2];
    const c3: [number, number, number] = [...initial.c3];

    let rotY = 0;
    let rotX = 0.25;
    let tick = 0;
    let targetTiltX = 0.25;
    let targetTiltY = 0;
    let isDragging = false;
    let lastPointerX = 0;
    let lastPointerY = 0;

    const handlePointerDown = (e: PointerEvent) => {
      isDragging = true;
      lastPointerX = e.clientX;
      lastPointerY = e.clientY;
      canvas.setPointerCapture(e.pointerId);
    };

    const handlePointerMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      if (isDragging) {
        const dx = e.clientX - lastPointerX;
        const dy = e.clientY - lastPointerY;
        lastPointerX = e.clientX;
        lastPointerY = e.clientY;
        rotY += dx * 0.008;
        targetTiltX = Math.max(-1.0, Math.min(1.0, targetTiltX + dy * 0.008));
      } else {
        const nx = (e.clientX - rect.left) / rect.width - 0.5;
        const ny = (e.clientY - rect.top) / rect.height - 0.5;
        targetTiltX = 0.25 + ny * 0.4;
        targetTiltY = nx * 0.3;
      }
    };

    const handlePointerUp = (e: PointerEvent) => {
      if (isDragging) {
        isDragging = false;
        if (canvas.hasPointerCapture(e.pointerId)) {
          canvas.releasePointerCapture(e.pointerId);
        }
      }
    };

    const handlePointerLeave = () => {
      if (!isDragging) {
        targetTiltY = 0;
      }
    };

    canvas.addEventListener('pointerdown', handlePointerDown);
    canvas.addEventListener('pointermove', handlePointerMove);
    canvas.addEventListener('pointerup', handlePointerUp);
    canvas.addEventListener('pointercancel', handlePointerUp);
    canvas.addEventListener('pointerleave', handlePointerLeave);

    const project = (
      x: number,
      y: number,
      z: number,
      radius: number,
      cx: number,
      cy: number
    ) => {
      const fov = 500;
      const scale = fov / (fov + z * radius);
      return { px: cx + x * radius * scale, py: cy + y * radius * scale, scale, z };
    };

    const drawRing = (
      cx: number,
      cy: number,
      radius: number,
      tiltX: number,
      tiltZ: number,
      angleOffset: number,
      rgb: [number, number, number],
      alpha: number,
      lineWidth: number
    ) => {
      const segments = 64;
      ctx.save();
      ctx.beginPath();
      for (let i = 0; i <= segments; i++) {
        const t = (i / segments) * Math.PI * 2 + angleOffset;
        const x = Math.cos(t);
        const y = Math.sin(t) * 0.18;
        const z = Math.sin(t);
        const y1 = y * Math.cos(tiltX) - z * Math.sin(tiltX);
        const z1 = y * Math.sin(tiltX) + z * Math.cos(tiltX);
        const x2 = x * Math.cos(tiltZ) - y1 * Math.sin(tiltZ);
        const y2 = x * Math.sin(tiltZ) + y1 * Math.cos(tiltZ);
        const p = project(x2, y2, z1, radius, cx, cy);
        if (i === 0) ctx.moveTo(p.px, p.py);
        else ctx.lineTo(p.px, p.py);
      }
      ctx.strokeStyle = `rgba(${Math.round(rgb[0])}, ${Math.round(rgb[1])}, ${Math.round(rgb[2])}, ${alpha})`;
      ctx.lineWidth = lineWidth;
      ctx.stroke();

      // Satellite energy beacon on ring
      const bt = angleOffset * 1.5;
      const bx = Math.cos(bt);
      const by = Math.sin(bt) * 0.18;
      const bz = Math.sin(bt);
      const by1 = by * Math.cos(tiltX) - bz * Math.sin(tiltX);
      const bz1 = by * Math.sin(tiltX) + bz * Math.cos(tiltX);
      const bx2 = bx * Math.cos(tiltZ) - by1 * Math.sin(tiltZ);
      const by2 = bx * Math.sin(tiltZ) + by1 * Math.cos(tiltZ);
      const bp = project(bx2, by2, bz1, radius, cx, cy);
      ctx.beginPath();
      ctx.arc(bp.px, bp.py, 2.5 * bp.scale, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${Math.round(rgb[0])}, ${Math.round(rgb[1])}, ${Math.round(rgb[2])}, ${Math.min(1, alpha * 2.2)})`;
      ctx.fill();
      ctx.restore();
    };

    const render = () => {
      tick += 1;
      const targetConfig = ORB_STATE_CONFIGS[stateRef.current];

      // Smooth interpolation between states
      curRotSpeed += (targetConfig.rotSpeed - curRotSpeed) * 0.05;
      curRingSpeed += (targetConfig.ringSpeed - curRingSpeed) * 0.05;
      curRingScale += (targetConfig.ringScale - curRingScale) * 0.05;
      curPulseAmp += (targetConfig.pulseAmp - curPulseAmp) * 0.05;
      curCoreBrightness += (targetConfig.coreBrightness - curCoreBrightness) * 0.05;
      curSynapseSpeed += (targetConfig.synapseSpeed - curSynapseSpeed) * 0.05;
      curPSpeed += (targetConfig.pSpeed - curPSpeed) * 0.05;

      for (let i = 0; i < 3; i++) {
        c1[i] += (targetConfig.c1[i] - c1[i]) * 0.05;
        c2[i] += (targetConfig.c2[i] - c2[i]) * 0.05;
        c3[i] += (targetConfig.c3[i] - c3[i]) * 0.05;
      }

      rotY += curRotSpeed + targetTiltY * 0.04;
      rotX += (targetTiltX - rotX) * 0.06;

      ctx.clearRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2;
      const minDim = Math.min(width, height);
      const baseRadius = minDim * 0.28 * curRingScale;
      const pulse = Math.sin(tick * 0.05) * curPulseAmp;
      const currentRadius = baseRadius * (1 + pulse);

      // ── Outer Volumetric Glow ──
      const outerGlow = ctx.createRadialGradient(cx, cy, currentRadius * 0.2, cx, cy, currentRadius * 2.2);
      outerGlow.addColorStop(0, `rgba(${Math.round(c1[0])}, ${Math.round(c1[1])}, ${Math.round(c1[2])}, ${0.35 * curCoreBrightness})`);
      outerGlow.addColorStop(0.5, `rgba(${Math.round(c2[0])}, ${Math.round(c2[1])}, ${Math.round(c2[2])}, ${0.15 * curCoreBrightness})`);
      outerGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = outerGlow;
      ctx.fillRect(0, 0, width, height);

      // ── 3D Rotating Rings ──
      drawRing(cx, cy, currentRadius * 1.38, 0.45, 0.2, tick * curRingSpeed, c1, 0.45, 1.4);
      drawRing(cx, cy, currentRadius * 1.55, -0.6, -0.35, -tick * curRingSpeed * 0.85, c2, 0.4, 1.2);
      drawRing(cx, cy, currentRadius * 1.72, 0.2, 0.65, tick * curRingSpeed * 0.6, c3, 0.3, 1.0);

      // ── Project Lattice Nodes ──
      const cosY = Math.cos(rotY);
      const sinY = Math.sin(rotY);
      const cosX = Math.cos(rotX);
      const sinX = Math.sin(rotX);

      const projectedNodes = nodes.map((node) => {
        // Rotate around Y
        const x1 = node.x * cosY + node.z * sinY;
        const z1 = -node.x * sinY + node.z * cosY;
        // Rotate around X
        const y2 = node.y * cosX - z1 * sinX;
        const z2 = node.y * sinX + z1 * cosX;

        const rad = currentRadius * node.layer;
        const proj = project(x1, y2, z2, rad, cx, cy);
        return { ...proj, rawZ: z2 };
      });

      // ── Draw Synapse Edges ──
      for (const edge of edges) {
        const p1 = projectedNodes[edge.a];
        const p2 = projectedNodes[edge.b];
        const avgZ = (p1.rawZ + p2.rawZ) / 2;
        const depthAlpha = Math.max(0.08, Math.min(0.65, (avgZ + 1.2) / 2.4));

        ctx.beginPath();
        ctx.moveTo(p1.px, p1.py);
        ctx.lineTo(p2.px, p2.py);
        ctx.strokeStyle = `rgba(${Math.round(c2[0])}, ${Math.round(c2[1])}, ${Math.round(c2[2])}, ${depthAlpha * 0.4})`;
        ctx.lineWidth = 0.8 * ((p1.scale + p2.scale) / 2);
        ctx.stroke();

        // Synapse pulse travel
        if (edge.active) {
          const pulseT = (tick * 0.02 * curSynapseSpeed + edge.pulseOffset) % 1;
          const px = p1.px + (p2.px - p1.px) * pulseT;
          const py = p1.py + (p2.py - p1.py) * pulseT;
          ctx.beginPath();
          ctx.arc(px, py, 1.5, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${Math.round(c1[0])}, ${Math.round(c1[1])}, ${Math.round(c1[2])}, ${depthAlpha * 0.9})`;
          ctx.fill();
        }
      }

      // ── Draw Nodes ──
      for (const p of projectedNodes) {
        const depthAlpha = Math.max(0.12, Math.min(0.9, (p.rawZ + 1.2) / 2.2));
        ctx.beginPath();
        ctx.arc(p.px, p.py, 2.0 * p.scale, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${Math.round(c1[0])}, ${Math.round(c1[1])}, ${Math.round(c1[2])}, ${depthAlpha})`;
        ctx.fill();
      }

      // ── Floating 3D Orbital Particles ──
      for (const part of particles) {
        part.angle += part.speed * curPSpeed;
        const px3d = Math.cos(part.angle) * Math.cos(part.elevation) * part.dist;
        const py3d = Math.sin(part.elevation) * part.dist;
        const pz3d = Math.sin(part.angle) * Math.cos(part.elevation) * part.dist;

        // Apply rotation
        const x1 = px3d * cosY + pz3d * sinY;
        const z1 = -px3d * sinY + pz3d * cosY;
        const y2 = py3d * cosX - z1 * sinX;
        const z2 = py3d * sinX + z1 * cosX;

        const proj = project(x1, y2, z2, currentRadius, cx, cy);
        const depthAlpha = Math.max(0.05, Math.min(0.85, (z2 + 1.5) / 3));

        const color = part.colorSlot === 0 ? c1 : part.colorSlot === 1 ? c2 : c3;
        ctx.beginPath();
        ctx.arc(proj.px, proj.py, part.size * proj.scale, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${Math.round(color[0])}, ${Math.round(color[1])}, ${Math.round(color[2])}, ${part.alpha * depthAlpha})`;
        ctx.fill();
      }

      // ── Inner Core Specular Glow ──
      const coreGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, currentRadius * 0.6);
      coreGrad.addColorStop(0, `rgba(255, 255, 255, ${0.85 * curCoreBrightness})`);
      coreGrad.addColorStop(0.35, `rgba(${Math.round(c1[0])}, ${Math.round(c1[1])}, ${Math.round(c1[2])}, ${0.65 * curCoreBrightness})`);
      coreGrad.addColorStop(0.75, `rgba(${Math.round(c2[0])}, ${Math.round(c2[1])}, ${Math.round(c2[2])}, ${0.25 * curCoreBrightness})`);
      coreGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = coreGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, currentRadius * 0.6, 0, Math.PI * 2);
      ctx.fill();

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      resizeObserver.disconnect();
      canvas.removeEventListener('pointerdown', handlePointerDown);
      canvas.removeEventListener('pointermove', handlePointerMove);
      canvas.removeEventListener('pointerup', handlePointerUp);
      canvas.removeEventListener('pointercancel', handlePointerUp);
      canvas.removeEventListener('pointerleave', handlePointerLeave);
    };
  }, []);

  return (
    <div className={`relative flex items-center justify-center select-none ${className}`}>
      <canvas
        ref={canvasRef}
        className="w-full h-full cursor-grab active:cursor-grabbing touch-none"
        title="3D DevPilot Neural Core — Drag to rotate"
      />
    </div>
  );
}
