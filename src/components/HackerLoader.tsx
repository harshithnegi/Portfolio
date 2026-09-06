import React, { useState, useEffect, useRef } from 'react';
import { Shield, FastForward, CheckCircle2, Lock, Terminal } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface HackerLoaderProps {
  onComplete: () => void;
}

const PHASES = [
  { text: 'INITIALIZING ENCRYPTED CORE...', code: '0x01_SYS_BOOT' },
  { text: 'VERIFYING SECURITY PROTOCOLS...', code: '0x02_ZERO_TRUST' },
  { text: 'AUTHORIZING OPERATOR CREDENTIALS...', code: '0x03_KEY_VERIFY' },
  { text: 'ACCESS GRANTED // SYSTEM READY', code: '0x04_SESSION_OK' },
];

export const HackerLoader: React.FC<HackerLoaderProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [currentPhaseIndex, setCurrentPhaseIndex] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Background subtle digital matrix rain
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let lastRenderTime = 0;
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const columns = Math.floor(canvas.width / 32);
    const drops: number[] = Array(columns).fill(1);
    const chars = '0123456789ABCDEF<>/*';

    const render = (currentTime: number) => {
      animationFrameId = requestAnimationFrame(render);
      // Cap at ~30 FPS for buttery smooth performance on mobile & low-end chips
      if (currentTime - lastRenderTime < 33) return;
      lastRenderTime = currentTime;

      ctx.fillStyle = 'rgba(10, 15, 28, 0.18)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.font = '12px monospace';

      for (let i = 0; i < drops.length; i++) {
        const text = chars[Math.floor(Math.random() * chars.length)];
        const x = i * 32;
        const y = drops[i] * 22;

        if (Math.random() > 0.95) {
          ctx.fillStyle = 'rgba(0, 229, 255, 0.6)';
        } else {
          ctx.fillStyle = 'rgba(0, 255, 159, 0.18)';
        }

        ctx.fillText(text, x, y);

        if (y > canvas.height && Math.random() > 0.98) {
          drops[i] = 0;
        }
        drops[i]++;
      }
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  // Smooth progress sequence (~2.1 seconds total, crisp and responsive)
  useEffect(() => {
    const startTime = Date.now();
    const duration = 2100;

    const progressInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const currentPct = Math.min(100, Math.floor((elapsed / duration) * 100));
      setProgress(currentPct);

      // Map progress to the 4 concise phases
      if (currentPct < 28) {
        setCurrentPhaseIndex(0);
      } else if (currentPct < 60) {
        setCurrentPhaseIndex(1);
      } else if (currentPct < 90) {
        setCurrentPhaseIndex(2);
      } else {
        setCurrentPhaseIndex(3);
      }

      if (currentPct >= 100) {
        clearInterval(progressInterval);
        setIsCompleted(true);
        setTimeout(() => {
          onComplete();
        }, 400);
      }
    }, 40);

    return () => clearInterval(progressInterval);
  }, [onComplete]);

  // Keyboard shortcut (Escape, Space, Enter) to skip immediately
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === ' ' || e.key === 'Enter') {
        onComplete();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onComplete]);

  const activePhase = PHASES[currentPhaseIndex];

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.02, filter: 'blur(6px)' }}
      transition={{ duration: 0.4, ease: 'easeInOut' }}
      className="fixed inset-0 z-[9999] bg-primary-bg text-white font-mono flex flex-col items-center justify-center p-6 select-none overflow-hidden"
    >
      {/* Background Matrix Rain */}
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none opacity-40" />

      {/* Subtle Cyber Grid & Ambient Glows */}
      <div className="absolute inset-0 cyber-grid pointer-events-none opacity-20" />
      <div className="absolute w-[500px] h-[500px] bg-neon-green/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Top Bar: Minimal Status & Skip Button */}
      <div className="absolute top-6 left-6 right-6 flex justify-between items-center z-10">
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <div className="w-2 h-2 rounded-full bg-neon-green animate-pulse" />
          <span className="tracking-widest uppercase text-neon-green font-semibold">SECURE_BOOT</span>
          <span className="text-gray-600 hidden sm:inline">// v2.4</span>
        </div>

        <button
          type="button"
          onClick={onComplete}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 hover:border-neon-green/50 hover:bg-neon-green/10 hover:text-neon-green transition-all text-xs text-gray-300 font-sans cursor-pointer"
        >
          <span>Skip</span>
          <FastForward className="w-3.5 h-3.5" />
          <span className="hidden sm:inline text-[10px] text-gray-500">[ESC]</span>
        </button>
      </div>

      {/* Clean, Focused Central HUD */}
      <div className="relative z-10 flex flex-col items-center text-center max-w-md w-full px-4">
        
        {/* Animated Cyber Shield Reticle (Pure Circle) */}
        <div className="relative mb-6 flex items-center justify-center">
          {/* Outer rotating decorative ring */}
          <div className="absolute w-28 h-28 rounded-full border border-dashed border-neon-cyan/30 animate-[spin_10s_linear_infinite] pointer-events-none" />
          
          {/* Central Circular Housing with glowing border */}
          <div className="w-24 h-24 rounded-full flex items-center justify-center bg-black/60 border border-neon-green/50 shadow-[0_0_25px_rgba(0,255,159,0.3)] animate-pulse backdrop-blur-sm relative z-10">
            {isCompleted ? (
              <CheckCircle2 className="w-10 h-10 text-neon-green animate-in zoom-in-75 duration-200" />
            ) : progress > 50 ? (
              <Terminal className="w-9 h-9 text-neon-cyan animate-pulse" />
            ) : (
              <Lock className="w-9 h-9 text-neon-green" />
            )}
          </div>
        </div>

        {/* Status Badge */}
        <div className="mb-5">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-neon-cyan/40 bg-neon-cyan/10 text-xs font-mono text-neon-cyan tracking-widest uppercase shadow-[0_0_15px_rgba(0,229,255,0.15)]">
            <Shield className="w-3.5 h-3.5" />
            <span>AUTHENTICATING</span>
          </div>
        </div>

        {/* Single Clean Animated Status Message */}
        <div className="w-full h-8 mb-4 flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={activePhase.text}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18 }}
              className="flex items-center gap-2 text-xs font-mono"
            >
              <span className="text-neon-cyan font-semibold">[{activePhase.code}]</span>
              <span className={`${isCompleted ? 'text-neon-green font-bold' : 'text-gray-300'}`}>
                {activePhase.text}
              </span>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Minimal High-Precision Progress Bar */}
        <div className="w-full space-y-2">
          <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden p-0.5">
            <motion.div
              className="h-full bg-gradient-to-r from-neon-cyan to-neon-green rounded-full shadow-[0_0_12px_rgba(0,255,159,0.9)]"
              style={{ width: `${progress}%` }}
              transition={{ ease: 'easeOut', duration: 0.08 }}
            />
          </div>

          <div className="flex justify-between items-center text-[11px] text-gray-500 font-mono">
            <span>READY STATE</span>
            <span className="text-neon-green font-bold">{progress}%</span>
          </div>
        </div>
      </div>

      {/* Bottom Subtle Note */}
      <div className="absolute bottom-6 text-center z-10">
        <span className="text-[11px] text-gray-600 font-mono tracking-wider">
          PRESS [SPACE] OR [ESC] TO SKIP
        </span>
      </div>
    </motion.div>
  );
};

export default HackerLoader;
