import { useEffect, useRef, useState, useCallback } from 'react';
import { useGame } from '@/context/GameContext';
import { playerState, movementState, cameraStore } from '@/stores/playerStore';
import { drivingState } from '@/stores/drivingStore';
import { combatStore } from '@/stores/combatStore';
import { cityInteractions, mountainInteractions, INTERIOR_DEFS } from '@/data/interactions';
import { CHARACTERS } from '@/data/characters';
import { VEHICLES, WEAPONS, TOOLS } from '@/data/storeData';
import { PhoneUI } from './PhoneUI';
import { CinemaPanel } from './CinemaPanel';
import { EventToasts, eventStore } from './DynamicEvents';

/* ─── Notification types ─── */
interface Notif {
  id: number;
  text: string;
  color: string;
  icon: string;
}

let _notifId = 0;

/* ─── Objective Compass ─── */
function ObjectiveCompass() {
  const { state } = useGame();
  const [angle, setAngle] = useState(0);
  const [dist, setDist] = useState(0);
  const [label, setLabel] = useState('');

  useEffect(() => {
    let raf: number;
    let lastTime = 0;
    const INTERVAL = 100; // 10fps is plenty for a compass
    const tick = (timestamp: number) => {
      raf = requestAnimationFrame(tick);
      if (timestamp - lastTime < INTERVAL) return;
      lastTime = timestamp;

      const interactions = state.currentRegion === 'city' ? cityInteractions : mountainInteractions;
      const missions = interactions.filter(p => p.type === 'mission');
      const activeMissions = missions.filter(p => {
        const m = state.missions.find(m => m.id === p.missionId);
        return m && !m.completed && !m.locked;
      });

      if (activeMissions.length === 0) return;

      // Find nearest (squared distance)
      let nearest = activeMissions[0];
      let nearDistSq = Infinity;
      for (const p of activeMissions) {
        const dx = p.position[0] - playerState.x;
        const dz = p.position[2] - playerState.z;
        const dSq = dx * dx + dz * dz;
        if (dSq < nearDistSq) { nearDistSq = dSq; nearest = p; }
      }

      const dx = nearest.position[0] - playerState.x;
      const dz = nearest.position[2] - playerState.z;
      const worldAngle = Math.atan2(dx, dz);
      const relAngle = worldAngle - playerState.yaw;
      setAngle((relAngle * 180) / Math.PI);
      setDist(Math.round(Math.sqrt(nearDistSq)));
      setLabel(nearest.label.replace(/^MISSION: /, ''));
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [state.currentRegion, state.missions]);

  const hasActive = state.missions.some(m => !m.completed && !m.locked);
  if (!hasActive) return null;

  return (
    <div className="absolute bottom-[7.5rem] left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 pointer-events-none">
      <div
        className="w-5 h-5 flex items-center justify-center"
        style={{
          transform: `rotate(${angle}deg)`,
          transition: 'transform 0.15s linear',
          filter: 'drop-shadow(0 0 4px #f000b8)',
        }}
      >
        <svg width="16" height="20" viewBox="0 0 16 20" fill="none">
          <polygon points="8,0 16,20 8,14 0,20" fill="#f000b8" />
        </svg>
      </div>
      <div className="text-[8px] font-display text-center" style={{ color: '#f000b8' }}>
        {label.length > 24 ? label.slice(0, 22) + '…' : label}
      </div>
      <div className="text-[7px] text-muted-foreground">{dist}m</div>
    </div>
  );
}

/* ─── Mission Tracker Widget ─── */
function MissionTracker() {
  const { state, dispatch } = useGame();

  const active = state.missions
    .filter(m => !m.completed && !m.locked)
    .slice(0, 4);

  if (active.length === 0) return null;

  const typeIcon: Record<string, string> = {
    errand: '📦', perform: '🎤', defend: '🛡️', rival: '⚔️', record: '🎙️',
  };

  return (
    <div className="absolute top-12 right-4 space-y-1.5 w-44">
      {active.map(m => (
        <button
          key={m.id}
          onClick={() => {
            // Find the interaction for this mission and open panel
            const all = [...cityInteractions, ...mountainInteractions];
            const inter = all.find(p => p.missionId === m.id);
            if (inter) dispatch({ type: 'SET_SHOW_PANEL', panel: `mission:${inter.id}` });
          }}
          className="w-full p-2 bg-card/80 border border-border/50 text-left hover:border-primary/50 transition-colors pointer-events-auto"
          style={{ backdropFilter: 'blur(4px)' }}
        >
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className="text-[9px]">{typeIcon[m.type] ?? '◆'}</span>
            <span className="font-display text-[9px] text-primary truncate">{m.title}</span>
          </div>
          <div className="flex gap-2 text-[7px] text-muted-foreground">
            {m.rewards.money > 0 && <span className="text-primary/80">+${m.rewards.money}</span>}
            {m.rewards.fans > 0 && <span>+{m.rewards.fans} fans</span>}
            {m.rewards.streetRep > 0 && <span>+{m.rewards.streetRep} rep</span>}
          </div>
        </button>
      ))}
    </div>
  );
}

/* ─── Notification Toast ─── */
function NotifToast({ notifs }: { notifs: Notif[] }) {
  return (
    <div className="absolute top-1/3 right-6 space-y-1.5 pointer-events-none">
      {notifs.map(n => (
        <div
          key={n.id}
          className="flex items-center gap-2 px-3 py-1.5 bg-card/90 border text-[10px] font-display animate-notif"
          style={{ borderColor: n.color, color: n.color }}
        >
          <span>{n.icon}</span>
          <span>{n.text}</span>
        </div>
      ))}
    </div>
  );
}

/* ─── Combat Overlay: CoD-style crosshair + hit marker + damage vignette ─── */
function CombatOverlay() {
  const canvasRef   = useRef<HTMLCanvasElement>(null);
  const vignetteRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let raf: number;
    const tick = () => {
      raf = requestAnimationFrame(tick);
      const now = performance.now();
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const W = canvas.width, H = canvas.height;
      ctx.clearRect(0, 0, W, H);

      // Decay spread each frame
      combatStore.spread = Math.max(0, combatStore.spread - 0.04);

      const cx = W / 2, cy = H / 2;
      const gap     = 5 + combatStore.spread * 14;  // rest=5px, max=19px
      const lineLen = 9;
      const lineW   = 1.8;

      const hitAge  = now - combatStore.hitTime;
      const killAge = now - combatStore.killTime;

      // Color: white → gold on hit → red on kill
      let alpha = 0.90;
      let r = 255, g = 255, b = 255;
      if (killAge < 250) {
        const t = 1 - killAge / 250;
        r = 255; g = Math.round(60 + 40 * t); b = Math.round(60 * t);
        alpha = 0.85 + t * 0.1;
      } else if (hitAge < 140) {
        const t = 1 - hitAge / 140;
        r = 255; g = Math.round(200 + 55 * t); b = Math.round(80 * t);
        alpha = 0.85 + t * 0.1;
      }
      const color = `rgba(${r},${g},${b},${alpha})`;

      ctx.strokeStyle = color;
      ctx.lineWidth   = lineW;
      ctx.lineCap     = 'round';
      ctx.shadowColor = 'rgba(0,0,0,0.9)';
      ctx.shadowBlur  = 3;

      // Top
      ctx.beginPath(); ctx.moveTo(cx, cy - gap - lineLen); ctx.lineTo(cx, cy - gap); ctx.stroke();
      // Bottom
      ctx.beginPath(); ctx.moveTo(cx, cy + gap); ctx.lineTo(cx, cy + gap + lineLen); ctx.stroke();
      // Left
      ctx.beginPath(); ctx.moveTo(cx - gap - lineLen, cy); ctx.lineTo(cx - gap, cy); ctx.stroke();
      // Right
      ctx.beginPath(); ctx.moveTo(cx + gap, cy); ctx.lineTo(cx + gap + lineLen, cy); ctx.stroke();

      // Center dot
      ctx.shadowBlur = 0;
      ctx.fillStyle  = color;
      ctx.beginPath(); ctx.arc(cx, cy, 1.6, 0, Math.PI * 2); ctx.fill();

      // Hit marker — X flash
      if (hitAge < 220) {
        const fade = 1 - hitAge / 220;
        ctx.globalAlpha = fade;
        ctx.strokeStyle = killAge < 220 ? `rgba(255,50,50,${fade})` : `rgba(255,255,255,${fade})`;
        ctx.lineWidth   = 2.2;
        ctx.shadowColor = killAge < 220 ? 'rgba(255,0,0,0.8)' : 'rgba(255,180,0,0.7)';
        ctx.shadowBlur  = 5;
        const m = 8;
        ctx.beginPath(); ctx.moveTo(cx - m, cy - m); ctx.lineTo(cx + m, cy + m); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(cx + m, cy - m); ctx.lineTo(cx - m, cy + m); ctx.stroke();
        ctx.globalAlpha = 1;
        ctx.shadowBlur  = 0;
      }

      // Damage vignette
      if (vignetteRef.current) {
        const dmgAge   = now - combatStore.damageTime;
        const strength = dmgAge < 900 ? (1 - dmgAge / 900) * 0.75 : 0;
        vignetteRef.current.style.opacity = strength.toFixed(3);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <>
      {/* Damage vignette — red edges flash on hit */}
      <div
        ref={vignetteRef}
        style={{
          position: 'absolute', inset: 0, opacity: 0, pointerEvents: 'none',
          background: 'radial-gradient(ellipse at center, transparent 38%, rgba(220,0,0,0.30) 68%, rgba(160,0,0,0.72) 100%)',
        }}
      />
      {/* Crosshair + hit marker */}
      <canvas
        ref={canvasRef}
        width={220}
        height={220}
        style={{
          position: 'absolute',
          top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          pointerEvents: 'none',
        }}
      />
    </>
  );
}

/* ─── Kill Feed ─── */
function KillFeed() {
  const [feed, setFeed] = useState<Array<{ id: number; time: number; text: string }>>([]);

  useEffect(() => {
    const iv = setInterval(() => {
      const now = performance.now();
      const active = combatStore.killFeed.filter(k => now - k.time < 4500);
      setFeed([...active].reverse().slice(0, 4));
    }, 150);
    return () => clearInterval(iv);
  }, []);

  if (feed.length === 0) return null;

  return (
    <div className="absolute pointer-events-none" style={{ top: '3.5rem', right: '11rem' }}>
      {feed.map(k => {
        const age = performance.now() - k.time;
        const opacity = age > 3200 ? Math.max(0, 1 - (age - 3200) / 1300) : 1;
        return (
          <div
            key={k.id}
            className="font-display text-[11px] text-right mb-0.5"
            style={{
              color: '#ff4444',
              opacity,
              textShadow: '0 0 8px rgba(255,0,0,0.7), 0 1px 2px rgba(0,0,0,0.9)',
              letterSpacing: '0.06em',
            }}
          >
            ✕&nbsp;{k.text}
          </div>
        );
      })}
    </div>
  );
}

/* ─── Level Progress Bar ─── */
function LevelProgress() {
  const { state } = useGame();
  const missionsForNextLevel = 2;
  const completedSinceLevel = state.completedMissions % missionsForNextLevel;
  const pct = (completedSinceLevel / missionsForNextLevel) * 100;

  return (
    <div className="flex items-center gap-1.5">
      <span className="text-[8px] text-muted-foreground">XP</span>
      <div className="w-16 h-0.5 bg-secondary">
        <div
          className="h-full transition-all duration-700"
          style={{ width: `${pct}%`, background: 'linear-gradient(90deg, #00f0d0, #f000b8)' }}
        />
      </div>
      <span className="text-[8px] text-muted-foreground">{completedSinceLevel}/{missionsForNextLevel}</span>
    </div>
  );
}

/* ─── Perspective Mode Badge ─── */
function PerspectiveBadge() {
  const [mode, setMode] = useState(cameraStore.mode);
  useEffect(() => {
    const iv = setInterval(() => setMode(cameraStore.mode), 200);
    return () => clearInterval(iv);
  }, []);
  return (
    <div
      className="font-display text-[9px] px-1.5 py-0.5 border ml-1"
      style={{
        borderColor: mode === 'fp' ? '#00f0d0' : '#f000b8',
        color: mode === 'fp' ? '#00f0d0' : '#f000b8',
        background: mode === 'fp' ? 'rgba(0,240,208,0.08)' : 'rgba(240,0,184,0.08)',
      }}
    >
      {mode === 'fp' ? '1P' : '3P'}
    </div>
  );
}

/* ─── Main HUD ─── */
export function GameHUD() {
  const { state, dispatch } = useGame();
  const [isLocked, setIsLocked] = useState(false);
  const [notifs, setNotifs] = useState<Notif[]>([]);
  const [phoneOpen, setPhoneOpen] = useState(false);

  // Sprint vignette overlay ref — updated via rAF, no re-renders
  const vignetteRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let raf: number;
    const tick = () => {
      raf = requestAnimationFrame(tick);
      if (vignetteRef.current) {
        const target = movementState.isSprinting ? 1 : 0;
        const cur = parseFloat(vignetteRef.current.style.opacity || '0');
        const next = cur + (target - cur) * 0.12;
        vignetteRef.current.style.opacity = String(Math.abs(next) < 0.002 ? 0 : next);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  // Previous state tracking for notifications
  const prevMoney = useRef(state.money);
  const prevLevel = useRef(state.level);
  const prevMissions = useRef(state.completedMissions);
  const prevHealth = useRef(state.health);
  const prevFans = useRef(state.fans);

  const addNotif = useCallback((text: string, color: string, icon: string) => {
    const id = ++_notifId;
    setNotifs(n => [...n.slice(-4), { id, text, color, icon }]);
    setTimeout(() => setNotifs(n => n.filter(x => x.id !== id)), 2800);
  }, []);

  // Watch for state changes to fire notifications
  useEffect(() => {
    const moneyDiff = state.money - prevMoney.current;
    if (moneyDiff > 0) addNotif(`+$${moneyDiff.toLocaleString()}`, '#00f0d0', '💰');
    else if (moneyDiff < 0) addNotif(`-$${Math.abs(moneyDiff).toLocaleString()}`, '#ff4444', '💸');
    prevMoney.current = state.money;
  }, [state.money]);

  useEffect(() => {
    if (state.level > prevLevel.current) {
      addNotif(`LEVEL ${state.level} UNLOCKED`, '#f000b8', '⚡');
    }
    prevLevel.current = state.level;
  }, [state.level]);

  useEffect(() => {
    if (state.completedMissions > prevMissions.current) {
      addNotif('MISSION COMPLETE', '#ffaa00', '✓');
    }
    prevMissions.current = state.completedMissions;
  }, [state.completedMissions]);

  useEffect(() => {
    if (state.health < prevHealth.current && state.health < prevHealth.current - 5) {
      addNotif(`-${prevHealth.current - state.health} HP`, '#ff4444', '💔');
    }
    prevHealth.current = state.health;
  }, [state.health]);

  useEffect(() => {
    const diff = state.fans - prevFans.current;
    if (diff >= 50) addNotif(`+${diff} FANS`, '#f000b8', '🎤');
    prevFans.current = state.fans;
  }, [state.fans]);

  useEffect(() => {
    const onChange = () => setIsLocked(!!document.pointerLockElement);
    document.addEventListener('pointerlockchange', onChange);
    return () => document.removeEventListener('pointerlockchange', onChange);
  }, []);

  // [P] key — toggle phone
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === 'KeyP' && !state.showPanel) {
        setPhoneOpen(prev => {
          if (!prev) document.exitPointerLock();
          else document.body.requestPointerLock();
          return !prev;
        });
      }
      if (e.code === 'Escape') setPhoneOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [state.showPanel]);

  // Release pointer lock when inside cinema (YouTube iframe needs mouse)
  useEffect(() => {
    if (state.currentInterior === 'cinema') {
      document.exitPointerLock();
    }
  }, [state.currentInterior]);


  const followers = CHARACTERS.filter(c => state.characterStates[c.id]?.isFollowing);
  const equippedWeaponData = state.equippedWeapon ? WEAPONS.find(w => w.id === state.equippedWeapon) : null;
  const currentAmmo = state.equippedWeapon ? (state.ammo[state.equippedWeapon] ?? 0) : 0;
  const maxAmmo = equippedWeaponData?.ammoCapacity ?? 0;

  const hpPct = Math.round((state.health / state.maxHealth) * 100);
  const hpClass = hpPct > 60 ? 'hp-bar-high' : hpPct > 30 ? 'hp-bar-mid' : 'hp-bar-low';

  const buffRemaining = state.activeBuff
    ? Math.max(0, Math.ceil((state.activeBuff.expiresAt - Date.now()) / 1000))
    : 0;

  return (
    <>
    <div className="fixed inset-0 pointer-events-none z-10" style={{ fontFamily: "'Roboto Mono', monospace" }}>

      {/* ── Sprint vignette ── */}
      <div
        ref={vignetteRef}
        style={{
          position: 'absolute', inset: 0, opacity: 0, pointerEvents: 'none',
          background: 'radial-gradient(ellipse at center, transparent 48%, rgba(0,240,208,0.18) 72%, rgba(0,0,0,0.72) 100%)',
        }}
      />

      {/* ── Click to play overlay ── */}
      {!isLocked && !state.showPanel && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/85 pointer-events-auto cursor-pointer">
          <div className="text-center corner-bracket px-10 py-8 max-w-sm w-full">

            {/* Title */}
            <div className="mb-1 text-[8px] font-display text-muted-foreground tracking-[0.4em]">3800 CHIPPEWA · BATON ROUGE</div>
            <h1 className="font-display text-3xl tracking-widest mb-0.5" style={{ color: '#fff', textShadow: '0 0 20px #00f0d0, 0 0 40px rgba(0,240,208,0.4)' }}>NEVER BROKE</h1>
            <h1 className="font-display text-3xl glow-text-cyan tracking-widest mb-1">AGAIN</h1>
            <h2 className="font-display text-sm text-accent tracking-wider mb-1">NBA · STREET CHRONICLES EMPIRE</h2>
            <div className="neon-line h-px mb-5 opacity-50" />

            <p className="text-xs text-muted-foreground mb-5 animate-pulse">CLICK TO ENTER THE WORLD</p>

            {/* Stats summary if mid-game */}
            {state.completedMissions > 0 && (
              <div className="flex justify-center gap-6 text-[10px] mb-5 p-2 bg-secondary/30 border border-border/40">
                <div><span className="text-primary font-display">{state.level}</span><span className="text-muted-foreground ml-1">LVL</span></div>
                <div><span className="text-primary font-display">${state.money.toLocaleString()}</span></div>
                <div><span className="text-accent font-display">{state.fans.toLocaleString()}</span><span className="text-muted-foreground ml-1">fans</span></div>
              </div>
            )}

            {/* Control grid */}
            <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-[10px] text-muted-foreground mb-5">
              <div className="flex justify-between"><span className="text-primary/60">WASD</span><span>MOVE</span></div>
              <div className="flex justify-between"><span className="text-primary/60">MOUSE</span><span>LOOK</span></div>
              <div className="flex justify-between"><span className="text-primary/60">SHIFT</span><span>SPRINT</span></div>
              <div className="flex justify-between"><span className="text-primary/60">SPACE</span><span>JUMP</span></div>
              <div className="flex justify-between"><span className="text-primary/60">E</span><span>INTERACT</span></div>
              <div className="flex justify-between"><span className="text-primary/60">LMB</span><span>SHOOT</span></div>
              <div className="flex justify-between"><span className="text-primary/60">R</span><span>RELOAD</span></div>
              <div className="flex justify-between"><span className="text-primary/60">V</span><span>1ST / 3RD PERSON</span></div>
              <div className="flex justify-between"><span className="text-primary/60">I / G</span><span>INV / GARAGE</span></div>
              <div className="flex justify-between"><span className="text-primary/60">F</span><span>EXIT VEHICLE</span></div>
            </div>

            {/* Quick start tips */}
            <div className="text-left p-2 bg-secondary/20 border border-border/30 space-y-1 mb-4">
              <div className="text-[8px] font-display text-primary mb-1">QUICK START</div>
              <div className="text-[9px] text-muted-foreground">◆ Walk to glowing markers to interact</div>
              <div className="text-[9px] text-muted-foreground">◆ Pink arrow (bottom) points to missions</div>
              <div className="text-[9px] text-muted-foreground">◆ Right panel shows active missions</div>
              <div className="text-[9px] text-muted-foreground">◆ Buy weapons at the Armory, drugs at the Alley</div>
            </div>

            {followers.length > 0 && (
              <div className="text-[10px] text-primary font-display">
                {followers.map(f => f.name).join(', ')} WITH YOU
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Combat overlay: CoD crosshair + hit marker + damage vignette ── */}
      {isLocked && <CombatOverlay />}

      {/* ── Kill Feed (top-right, beside mission tracker) ── */}
      {isLocked && <KillFeed />}

      {/* ── Top HUD Bar ── */}
      <div className="absolute top-0 left-0 right-0 h-9 bg-card/90 border-b border-primary/20 flex items-center px-4 gap-5 text-[10px]">
        <span className="font-display text-xs tracking-widest" style={{ color: '#ffd700', textShadow: '0 0 8px #ffd700' }}>NBA</span>

        <div className="w-px h-4 bg-border" />

        <div className="flex items-center gap-1">
          <span className="text-primary">$</span>
          <span className="text-foreground font-display">{state.money.toLocaleString()}</span>
        </div>

        <div className="flex items-center gap-1">
          <span className="text-muted-foreground">FAN</span>
          <span className="text-accent">{state.fans.toLocaleString()}</span>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-muted-foreground">LVL</span>
          <span className="text-primary font-display text-xs">{state.level}</span>
          <LevelProgress />
        </div>

        <div className="hidden sm:flex items-center gap-4 ml-auto">
          <HudBar label="STREET" value={state.streetRep} color="#00f0d0" />
          <HudBar label="FAME" value={state.industryFame} color="#f000b8" />
          <HudBar label="LOYALTY" value={state.crewLoyalty} color="#ffaa00" />
        </div>

        {/* Wanted stars */}
        {state.wantedLevel > 0 && (
          <div className="flex gap-0.5 ml-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <span
                key={i}
                className="text-[10px] transition-colors"
                style={{ color: i < state.wantedLevel ? '#ff4444' : '#333' }}
              >
                ★
              </span>
            ))}
          </div>
        )}

        <div className="font-display text-[9px] text-muted-foreground ml-2">
          {state.currentRegion === 'city' ? '3800 CHIPPEWA' : state.currentRegion === 'bayou' ? 'BAYOU' : 'GRAVEDIGGER MTN'}
        </div>

        {/* Perspective mode badge */}
        {isLocked && (
          <PerspectiveBadge />
        )}
      </div>

      {/* ── Companion indicators ── */}
      {followers.length > 0 && isLocked && (
        <div className="absolute top-12 left-4 space-y-1">
          {followers.map(f => (
            <div key={f.id} className="flex items-center gap-2 text-[9px]">
              <div className="w-1.5 h-1.5" style={{ background: f.visual.accentColor }} />
              <span className="text-foreground">{f.name}</span>
              <span className="text-muted-foreground">— {f.title}</span>
            </div>
          ))}
        </div>
      )}

      {/* ── Mission Tracker (right) ── */}
      {isLocked && <MissionTracker />}

      {/* ── Active Buff ── */}
      {state.activeBuff && isLocked && (
        <div
          className="absolute top-12 left-1/2 -translate-x-1/2 px-3 py-1.5 border text-[9px] font-display buff-active flex items-center gap-2"
          style={{ borderColor: state.activeBuff.color, color: state.activeBuff.color }}
        >
          <span>{state.activeBuff.label}</span>
          <span className="text-muted-foreground">{buffRemaining}s</span>
        </div>
      )}

      {/* ── Cold meter (mountain) ── */}
      {state.currentRegion === 'mountain' && isLocked && (
        <div className="absolute top-12 right-48 flex items-center gap-2">
          <span className="text-[9px] text-muted-foreground">❄ COLD</span>
          <div className="w-16 h-1 bg-secondary">
            <div className="h-full transition-all duration-500" style={{ width: `${state.coldMeter}%`, background: '#88ccff' }} />
          </div>
          {state.coldMeter > 70 && <span className="text-[8px] text-blue-400 animate-pulse">FREEZING</span>}
        </div>
      )}

      {/* ── Interaction prompt ── */}
      {state.nearInteraction && isLocked && !state.showPanel && (
        <div className="absolute bottom-32 left-1/2 -translate-x-1/2">
          <div className="corner-bracket px-6 py-2.5 text-center bg-card/70" style={{ backdropFilter: 'blur(4px)' }}>
            <div className="text-[8px] text-muted-foreground mb-0.5">PRESS TO INTERACT</div>
            <div className="flex items-center justify-center gap-2">
              <span
                className="px-1.5 py-0.5 text-[10px] font-display border border-primary/50 text-primary"
                style={{ background: 'rgba(0,240,208,0.08)' }}
              >
                E
              </span>
              <span className="font-display text-xs text-foreground">{state.nearInteraction.label}</span>
            </div>
          </div>
        </div>
      )}

      {/* ── Objective Compass ── */}
      {isLocked && !state.showPanel && <ObjectiveCompass />}

      {/* ── Notifications ── */}
      <NotifToast notifs={notifs} />

      {/* ── Minimap ── */}
      <MiniMap />

      {/* ── Driving speedometer ── */}
      <Speedometer />

      {/* ── Bottom Left: Health + Stats ── */}
      <div className="absolute bottom-4 left-4 space-y-1.5">
        {/* Health bar */}
        <div className="flex items-center gap-2">
          <span className="text-[9px] text-muted-foreground w-3">HP</span>
          <div className="w-32 h-2 bg-secondary border border-border/40">
            <div
              className={`h-full transition-all duration-300 ${hpClass}`}
              style={{ width: `${hpPct}%` }}
            />
          </div>
          <span className="text-[9px] font-display" style={{ color: hpPct > 60 ? '#44ff44' : hpPct > 30 ? '#ffaa00' : '#ff4444' }}>
            {state.health}
          </span>
        </div>

        {/* Drug heat */}
        {state.drugHeat > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-[9px] text-muted-foreground w-3">HT</span>
            <div className="w-32 h-1 bg-secondary border border-border/40">
              <div
                className="h-full transition-all duration-300"
                style={{
                  width: `${Math.min(100, state.drugHeat)}%`,
                  background: state.drugHeat > 70 ? '#ff4444' : state.drugHeat > 40 ? '#ffaa00' : '#f000b8',
                }}
              />
            </div>
            {state.drugHeat > 70 && <span className="text-[7px] text-red-500 animate-pulse">HOT</span>}
          </div>
        )}

        {/* Crew / missions */}
        <div className="text-[9px] text-muted-foreground">
          CREW {state.crew.length + Object.values(state.characterStates).filter(c => c.isRecruited).length}
          &nbsp;·&nbsp;
          {state.completedMissions} MISSIONS DONE
        </div>

        {/* Active vehicle */}
        {state.activeVehicle && (
          <div className="text-[9px] text-accent">
            🚗 {VEHICLES.find(v => v.id === state.activeVehicle)?.name}
          </div>
        )}

        {/* Equipped tool */}
        {state.equippedTool && (
          <div className="text-[9px] text-primary">
            🔧 {TOOLS.find(t => t.id === state.equippedTool)?.name}
          </div>
        )}
      </div>

      {/* ── Bottom Right: Ammo counter (above minimap) ── */}
      {equippedWeaponData && isLocked && (
        <div className="absolute bottom-32 right-4 text-right">
          <div className="font-display text-xs text-muted-foreground mb-0.5">
            {equippedWeaponData.name}
          </div>
          <div className="font-display text-xl">
            <span className={currentAmmo === 0 ? 'text-destructive' : 'text-foreground'}>
              {currentAmmo}
            </span>
            <span className="text-muted-foreground text-sm"> / {maxAmmo}</span>
          </div>
          {currentAmmo === 0 && (
            <div className="text-[9px] text-destructive animate-pulse">[R] RELOAD</div>
          )}
        </div>
      )}

      {/* ── Quick key hints ── */}
      {isLocked && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-3 text-[8px] text-muted-foreground/35">
          <span>[I] INV</span>
          <span>[G] GARAGE</span>
          <span>[P] PHONE</span>
          <span>[LMB] SHOOT</span>
          <span>[R] RELOAD</span>
          <span>[V] VIEW</span>
          <span>[E] INTERACT</span>
        </div>
      )}

      {/* ── Interior indicator ── */}
      {state.currentInterior && (
        <div style={{
          position: 'absolute', top: 48, left: '50%', transform: 'translateX(-50%)',
          padding: '4px 14px',
          background: 'rgba(0,0,0,0.6)',
          border: '1px solid rgba(0,240,208,0.4)',
          borderRadius: 6,
          fontFamily: "'Orbitron', sans-serif",
          fontSize: 9,
          color: '#00f0d0',
          letterSpacing: 2,
          pointerEvents: 'none',
        }}>
          ◆ INSIDE: {state.currentInterior.toUpperCase()} &nbsp;·&nbsp; [E] EXIT
        </div>
      )}

      {/* Phone [P] key indicator when unlocked */}
      {isLocked && !state.currentInterior && (
        <div style={{
          position: 'absolute', bottom: 68, right: 6,
          padding: '3px 8px',
          background: 'rgba(0,0,0,0.5)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 4,
          fontSize: 8,
          color: '#555',
          fontFamily: "'Roboto Mono', monospace",
          pointerEvents: 'none',
        }}>
          [P] PHONE
        </div>
      )}
    </div>

    {/* Phone overlay — rendered outside the HUD div for full-screen */}
    {phoneOpen && <PhoneUI onClose={() => { setPhoneOpen(false); document.body.requestPointerLock(); }} />}

    {/* Cinema YouTube overlay — shows when player is inside cinema */}
    {state.currentInterior === 'cinema' && (
      <CinemaPanel onClose={() => {
        const def = INTERIOR_DEFS['cinema'];
        if (def) playerState.teleportRequest = { x: def.exitPos[0], y: def.exitPos[1], z: def.exitPos[2] };
        dispatch({ type: 'SET_INTERIOR', interiorId: null });
        document.body.requestPointerLock();
      }} />
    )}

    {/* Dynamic event toasts */}
    {state.currentRegion === 'city' && <EventToasts events={eventStore.events} />}
  </>
  );
}

/* ─── Hud Bar ─── */
function HudBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-muted-foreground">{label}</span>
      <div className="w-12 h-0.5 bg-secondary">
        <div className="h-full transition-all duration-700" style={{ width: `${Math.min(100, value)}%`, background: color }} />
      </div>
    </div>
  );
}

/* ─── MiniMap ─── */
function MiniMap() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { state } = useGame();

  useEffect(() => {
    let rafId: number;
    let lastDrawTime = 0;
    const DRAW_INTERVAL = 80; // ~12fps for the minimap
    const draw = (timestamp: number) => {
      rafId = requestAnimationFrame(draw);
      if (timestamp - lastDrawTime < DRAW_INTERVAL) return;
      lastDrawTime = timestamp;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const size = 120;
      ctx.clearRect(0, 0, size, size);

      // Background
      ctx.fillStyle = state.currentRegion === 'city' ? '#050508' : '#0a1020';
      ctx.fillRect(0, 0, size, size);

      // Border — cyan glow
      ctx.strokeStyle = '#00f0d0';
      ctx.lineWidth = 1;
      ctx.strokeRect(0.5, 0.5, size - 1, size - 1);

      const scale = 0.8;
      const cx = size / 2;
      const cy = size / 2;

      const interactions = state.currentRegion === 'city' ? cityInteractions : mountainInteractions;
      interactions.forEach(p => {
        const px = cx + (p.position[0] - playerState.x) * scale;
        const pz = cy + (p.position[2] - playerState.z) * scale;
        if (px < 2 || px > size - 2 || pz < 2 || pz > size - 2) return;

        const mission = p.missionId ? state.missions.find(m => m.id === p.missionId) : null;
        const isMissionDone = mission?.completed;
        const isMissionLocked = mission?.locked;

        ctx.fillStyle = isMissionDone ? '#333'
          : isMissionLocked ? '#444'
          : p.type === 'travel' ? '#00ff88'
          : p.type === 'mission' ? '#f000b8'
          : p.type === 'character' ? '#44ddff'
          : p.type === 'cafe' ? '#00f0d0'
          : p.type === 'drugmarket' ? '#ffaa00'
          : p.type === 'meetup' ? '#ff6600'
          : '#888';

        if (p.type === 'character') {
          ctx.save();
          ctx.translate(px, pz);
          ctx.rotate(Math.PI / 4);
          ctx.fillRect(-2.5, -2.5, 5, 5);
          ctx.restore();
        } else if (p.type === 'mission' && !isMissionDone && !isMissionLocked) {
          // Pulsing mission marker
          ctx.save();
          ctx.globalAlpha = 0.3;
          ctx.fillStyle = '#f000b8';
          ctx.beginPath();
          ctx.arc(px, pz, 5, 0, Math.PI * 2);
          ctx.fill();
          ctx.globalAlpha = 1;
          ctx.fillStyle = '#f000b8';
          ctx.fillRect(px - 2, pz - 2, 4, 4);
          ctx.restore();
        } else {
          ctx.fillRect(px - 2, pz - 2, 4, 4);
        }
      });

      // Following characters
      const followers = CHARACTERS.filter(c => state.characterStates[c.id]?.isFollowing);
      followers.forEach(f => {
        ctx.fillStyle = f.visual.accentColor;
        ctx.beginPath();
        ctx.arc(cx + 3, cy + 3, 2, 0, Math.PI * 2);
        ctx.fill();
      });

      // Player dot
      ctx.fillStyle = '#fff';
      ctx.fillRect(cx - 2, cy - 2, 4, 4);

      // Direction arrow
      ctx.strokeStyle = '#00f0d0';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.sin(playerState.yaw) * -8, cy + Math.cos(playerState.yaw) * -8);
      ctx.stroke();

      // Region label on minimap
      ctx.fillStyle = 'rgba(0,240,208,0.5)';
      ctx.font = '7px monospace';
      ctx.fillText(state.currentRegion === 'city' ? 'NEO CITY' : 'MOUNTAIN', 4, 10);

    };

    rafId = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafId);
  }, [state.currentRegion]);

  return (
    <canvas
      ref={canvasRef}
      width={120}
      height={120}
      className="absolute bottom-4 right-4"
      style={{ imageRendering: 'pixelated' }}
    />
  );
}

/* ─── Speedometer (driving only) ─── */
function Speedometer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let raf: number;
    const draw = () => {
      raf = requestAnimationFrame(draw);
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const W = 110, H = 110;
      ctx.clearRect(0, 0, W, H);

      if (!drivingState.active) return;

      const kmh = Math.abs(drivingState.speed) * 3.6;
      const maxKmh = 150;
      const pct = Math.min(kmh / maxKmh, 1);

      // Outer ring
      ctx.strokeStyle = 'rgba(0,240,208,0.18)';
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.arc(W / 2, H / 2, 46, 0, Math.PI * 2);
      ctx.stroke();

      // Speed arc
      const startA = Math.PI * 0.75;
      const endA = startA + Math.PI * 1.5 * pct;
      const arcColor = pct > 0.75 ? '#f000b8' : pct > 0.5 ? '#ffaa00' : '#00f0d0';
      ctx.strokeStyle = arcColor;
      ctx.lineWidth = 8;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.arc(W / 2, H / 2, 46, startA, endA);
      ctx.stroke();

      // Speed number
      ctx.fillStyle = arcColor;
      ctx.font = 'bold 22px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(Math.round(kmh).toString(), W / 2, H / 2 - 4);

      // Unit label
      ctx.fillStyle = 'rgba(255,255,255,0.45)';
      ctx.font = '8px monospace';
      ctx.fillText('KM/H', W / 2, H / 2 + 14);

      // DRIVE label
      ctx.fillStyle = 'rgba(0,240,208,0.5)';
      ctx.font = '7px monospace';
      ctx.fillText('DRIVE', W / 2, H / 2 + 36);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      width={110}
      height={110}
      className="absolute bottom-32 right-4 pointer-events-none"
      style={{ opacity: 1 }}
    />
  );
}
