import { useEffect, useRef, useState } from 'react';
import { useGame } from '@/context/GameContext';
import { playerState } from '@/stores/playerStore';
import { cityInteractions, mountainInteractions } from '@/data/interactions';

export function GameHUD() {
  const { state } = useGame();
  const [isLocked, setIsLocked] = useState(false);

  useEffect(() => {
    const onChange = () => setIsLocked(!!document.pointerLockElement);
    document.addEventListener('pointerlockchange', onChange);
    return () => document.removeEventListener('pointerlockchange', onChange);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-10" style={{ fontFamily: "'Roboto Mono', monospace" }}>
      {/* Click to play overlay */}
      {!isLocked && !state.showPanel && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 pointer-events-auto cursor-pointer">
          <div className="text-center">
            <h1 className="font-display text-2xl text-primary glow-text-pink mb-4">NEVER BROKE AGAIN</h1>
            <p className="text-sm text-muted-foreground mb-2">CLICK TO ENTER THE WORLD</p>
            <div className="text-[10px] text-muted-foreground space-y-1 mt-6">
              <p>WASD — MOVE &nbsp;|&nbsp; MOUSE — LOOK</p>
              <p>SHIFT — SPRINT &nbsp;|&nbsp; SPACE — JUMP</p>
              <p>E — INTERACT &nbsp;|&nbsp; ESC — RELEASE</p>
            </div>
          </div>
        </div>
      )}

      {/* Crosshair */}
      {isLocked && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="w-1 h-1 bg-foreground/60" />
        </div>
      )}

      {/* Top HUD bar */}
      <div className="absolute top-0 left-0 right-0 h-9 bg-card/80 border-b border-border flex items-center px-4 gap-5 text-[10px]">
        <span className="font-display text-xs text-primary glow-text-pink tracking-widest">NBA</span>

        <div className="flex items-center gap-1">
          <span className="text-muted-foreground">$</span>
          <span className="text-foreground">{state.money.toLocaleString()}</span>
        </div>

        <div className="flex items-center gap-1">
          <span className="text-muted-foreground">FANS</span>
          <span className="text-foreground">{state.fans.toLocaleString()}</span>
        </div>

        <div className="flex items-center gap-1">
          <span className="text-muted-foreground">LVL</span>
          <span className="text-foreground">{state.level}</span>
        </div>

        <div className="hidden sm:flex items-center gap-4 ml-auto">
          <HudBar label="STREET" value={state.streetRep} />
          <HudBar label="FAME" value={state.industryFame} />
          <HudBar label="LOYALTY" value={state.crewLoyalty} />
        </div>

        <div className="ml-4 font-display text-[9px] text-muted-foreground">
          {state.currentRegion === 'city' ? 'THE CITY' : 'GRAVEDIGGER MTN'}
        </div>
      </div>

      {/* Cold meter (mountain only) */}
      {state.currentRegion === 'mountain' && (
        <div className="absolute top-12 right-4 flex items-center gap-2">
          <span className="text-[9px] text-muted-foreground">COLD</span>
          <div className="w-16 h-1 bg-secondary">
            <div className="h-full bg-blue-400 transition-all duration-500" style={{ width: `${state.coldMeter}%` }} />
          </div>
        </div>
      )}

      {/* Interaction prompt */}
      {state.nearInteraction && isLocked && !state.showPanel && (
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 bg-card/90 border border-primary/40 px-4 py-2 text-center">
          <div className="font-display text-xs text-primary">[E] {state.nearInteraction.label}</div>
        </div>
      )}

      {/* Minimap */}
      <MiniMap />

      {/* Crew count */}
      <div className="absolute bottom-4 left-4 text-[9px] text-muted-foreground">
        CREW: {state.crew.length} &nbsp;|&nbsp; MISSIONS: {state.completedMissions}
      </div>
    </div>
  );
}

function HudBar({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-muted-foreground">{label}</span>
      <div className="w-12 h-0.5 bg-secondary">
        <div className="h-full neon-line transition-all duration-700" style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

function MiniMap() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { state } = useGame();

  useEffect(() => {
    let rafId: number;
    const draw = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const size = 120;
      ctx.clearRect(0, 0, size, size);

      // Background
      ctx.fillStyle = state.currentRegion === 'city' ? '#0a0a0a' : '#334';
      ctx.fillRect(0, 0, size, size);

      // Border
      ctx.strokeStyle = '#333';
      ctx.lineWidth = 1;
      ctx.strokeRect(0, 0, size, size);

      const scale = 0.8;
      const cx = size / 2;
      const cy = size / 2;

      // Interaction points
      const interactions = state.currentRegion === 'city' ? cityInteractions : mountainInteractions;
      interactions.forEach(p => {
        const px = cx + (p.position[0] - playerState.x) * scale;
        const pz = cy + (p.position[2] - playerState.z) * scale;
        if (px < 2 || px > size - 2 || pz < 2 || pz > size - 2) return;

        ctx.fillStyle = p.type === 'travel' ? '#00ff88' : p.type === 'mission' ? '#F000B8' : '#ffaa00';
        ctx.fillRect(px - 2, pz - 2, 4, 4);
      });

      // Player
      ctx.fillStyle = '#fff';
      ctx.fillRect(cx - 2, cy - 2, 4, 4);

      // Direction indicator
      ctx.strokeStyle = '#F000B8';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.sin(playerState.yaw) * -8, cy + Math.cos(playerState.yaw) * -8);
      ctx.stroke();

      rafId = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(rafId);
  }, [state.currentRegion]);

  return (
    <canvas
      ref={canvasRef}
      width={120}
      height={120}
      className="absolute bottom-4 right-4 border border-border"
      style={{ imageRendering: 'pixelated' }}
    />
  );
}
