import { useState, useEffect, useRef } from 'react';
import { useGame } from '@/context/GameContext';

interface PlayableCharacter {
  id: string;
  name: string;
  fullName: string;
  title: string;
  tagline: string;
  image: string;
  accentColor: string;
  bgColor: string;
  abilities: { name: string; desc: string }[];
  stats: { label: string; value: number }[];
  bio: string;
}

const PLAYABLE: PlayableCharacter[] = [
  {
    id: 'yb',
    name: 'YB',
    fullName: 'NBA YOUNGBOY',
    title: 'STORY GATEKEEPER',
    tagline: 'NEVER BROKE AGAIN',
    image: '/yb.png',
    accentColor: '#FFD700',
    bgColor: '#1a1200',
    abilities: [
      { name: 'MAJOR MOVES', desc: 'Unlocks new regions and campaign missions' },
      { name: 'STREET ROYALTY', desc: '+20% mission reward multiplier at all times' },
      { name: 'LEADERSHIP AURA', desc: 'Crew members deal 15% more damage nearby' },
    ],
    stats: [
      { label: 'HUSTLE',    value: 95 },
      { label: 'INFLUENCE', value: 98 },
      { label: 'LOYALTY',   value: 100 },
      { label: 'STREET',    value: 92 },
    ],
    bio: 'Born in the trenches of Baton Rouge, built for the throne. He controls the story — the movement starts and ends with him.',
  },
  {
    id: 'quando',
    name: 'QUANDO',
    fullName: 'QUANDO RONDO',
    title: 'TERRITORY GENERAL',
    tagline: 'COLD WORLD',
    image: '/quando.png',
    accentColor: '#ff2244',
    bgColor: '#1a0005',
    abilities: [
      { name: 'TRAP EMPIRE', desc: 'Unlock trap income points across the map' },
      { name: 'GHOST MODE', desc: 'Reduces wanted level stars instantly' },
      { name: 'IRON GRIP', desc: 'Territory once claimed cannot be contested' },
    ],
    stats: [
      { label: 'HUSTLE',    value: 92 },
      { label: 'INFLUENCE', value: 72 },
      { label: 'LOYALTY',   value: 85 },
      { label: 'STREET',    value: 100 },
    ],
    bio: 'Ice cold under pressure. The streets forged him into something different. Quando runs territory — quietly and completely.',
  },
  {
    id: 'lultimm',
    name: 'LUL TIMM',
    fullName: 'LUL TIMM',
    title: 'ICON & FAME MASTER',
    tagline: 'PLATINUM TOUCH',
    image: '/lultimm.png',
    accentColor: '#00f0d0',
    bgColor: '#001a18',
    abilities: [
      { name: 'PLATINUM SESSION', desc: '10x fame multiplier in studio sessions' },
      { name: 'VIRAL MOMENT', desc: 'Instantly boost crew reputation citywide' },
      { name: 'DRIP DROP', desc: 'Access exclusive gear drops unavailable elsewhere' },
    ],
    stats: [
      { label: 'HUSTLE',    value: 96 },
      { label: 'INFLUENCE', value: 100 },
      { label: 'LOYALTY',   value: 78 },
      { label: 'STREET',    value: 82 },
    ],
    bio: 'Unmatched creativity. Transcends the streets through music, drip, and influence. One session with Lul Timm changes everything.',
  },
];

const CSS = `
  @keyframes nba-float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-8px); }
  }
  @keyframes nba-slide-in-right {
    from { opacity: 0; transform: translateX(40px); }
    to { opacity: 1; transform: translateX(0); }
  }
  @keyframes nba-slide-in-up {
    from { opacity: 0; transform: translateY(30px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes nba-stat-fill {
    from { width: 0%; }
    to { width: var(--stat-w); }
  }
  @keyframes nba-pulse-border {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.4; }
  }
  @keyframes nba-scan {
    0% { top: -2px; }
    100% { top: 100%; }
  }
  @keyframes nba-grain {
    0%, 100% { transform: translate(0,0); }
    10% { transform: translate(-2%,-2%); }
    20% { transform: translate(2%,-1%); }
    30% { transform: translate(-1%,2%); }
    40% { transform: translate(2%,1%); }
    50% { transform: translate(-2%,1%); }
    60% { transform: translate(1%,-2%); }
    70% { transform: translate(-1%,2%); }
    80% { transform: translate(2%,-1%); }
    90% { transform: translate(-2%,2%); }
  }
  @keyframes nba-confirm-pulse {
    0%, 100% { box-shadow: 0 0 20px var(--accent); }
    50% { box-shadow: 0 0 40px var(--accent), 0 0 60px var(--accent-dim); }
  }
  @keyframes nba-portrait-reveal {
    from { clip-path: inset(0 100% 0 0); }
    to { clip-path: inset(0 0% 0 0); }
  }
  @keyframes nba-shimmer {
    0% { background-position: -200% center; }
    100% { background-position: 200% center; }
  }
`;

interface Props {
  onDone: () => void;
}

export function CharacterSelectScreen({ onDone }: Props) {
  const { dispatch } = useGame();
  const [selected, setSelected] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string>(PLAYABLE[0].id);
  const [confirming, setConfirming] = useState(false);
  const [panelKey, setPanelKey] = useState(0); // force re-animation on change
  const [statsVisible, setStatsVisible] = useState(false);
  const statsTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const activeChar = PLAYABLE.find(c => c.id === activeId)!;

  const handleSelect = (id: string) => {
    if (id === activeId) return;
    setActiveId(id);
    setSelected(id);
    setPanelKey(k => k + 1);
    setStatsVisible(false);
    if (statsTimeout.current) clearTimeout(statsTimeout.current);
    statsTimeout.current = setTimeout(() => setStatsVisible(true), 200);
  };

  const handleConfirm = () => {
    const id = selected ?? activeId;
    setConfirming(true);
    dispatch({ type: 'SET_PLAYER_CHARACTER', characterId: id });
    setTimeout(onDone, 800);
  };

  useEffect(() => {
    const t = setTimeout(() => setStatsVisible(true), 400);
    return () => clearTimeout(t);
  }, []);

  return (
    <>
      <style>{CSS}</style>
      <div
        className="fixed inset-0 z-50 overflow-hidden select-none"
        style={{
          background: '#000',
          fontFamily: "'Roboto Mono', monospace",
        }}
      >
        {/* ── Animated background ── */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(ellipse 80% 60% at 35% 50%, ${activeChar.bgColor} 0%, #000 65%)`,
            transition: 'background 0.6s ease',
          }}
        />
        {/* Film grain */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.035]"
          style={{
            backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\'/%3E%3C/svg%3E")',
            backgroundSize: '180px 180px',
            animation: 'nba-grain 0.15s steps(1) infinite',
          }}
        />
        {/* Scanline */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.18) 3px, rgba(0,0,0,0.18) 4px)',
          }}
        />

        {/* ── Top bar ── */}
        <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-8 py-4">
          <div>
            <div className="text-[9px] tracking-[0.5em] text-white/30 mb-0.5">ATLANTIS CITY</div>
            <div
              className="text-[11px] font-black tracking-[0.35em]"
              style={{
                background: `linear-gradient(90deg, ${activeChar.accentColor}, #fff)`,
                backgroundSize: '200% auto',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                animation: 'nba-shimmer 3s linear infinite',
              }}
            >
              NEVER BROKE AGAIN
            </div>
          </div>
          <div className="text-right">
            <div className="text-[9px] tracking-[0.4em] text-white/30">CHAPTER SELECT</div>
            <div className="text-[9px] tracking-[0.4em]" style={{ color: activeChar.accentColor }}>
              {PLAYABLE.findIndex(c => c.id === activeId) + 1} / {PLAYABLE.length}
            </div>
          </div>
        </div>

        {/* ── Accent horizontal lines ── */}
        <div className="absolute top-16 left-0 right-0 h-px pointer-events-none"
          style={{ background: `linear-gradient(90deg, transparent, ${activeChar.accentColor}44, transparent)`, transition: 'background 0.4s' }} />

        {/* ── Main layout: portrait left + info right ── */}
        <div className="absolute inset-0 flex" style={{ paddingTop: 64 }}>

          {/* LEFT — large portrait */}
          <div
            className="relative flex-shrink-0"
            style={{ width: '48%', height: '100%' }}
          >
            {/* Character name behind portrait */}
            <div
              className="absolute bottom-0 left-0 right-0 pointer-events-none"
              style={{ zIndex: 1 }}
            >
              <div
                className="font-black leading-none px-8 pb-4"
                style={{
                  fontSize: 'clamp(48px, 7vw, 88px)',
                  color: activeChar.accentColor,
                  opacity: 0.12,
                  letterSpacing: '0.08em',
                  filter: 'blur(1px)',
                }}
              >
                {activeChar.name}
              </div>
            </div>

            {/* Portrait image */}
            {PLAYABLE.map(char => (
              <div
                key={char.id}
                className="absolute inset-0"
                style={{
                  opacity: char.id === activeId ? 1 : 0,
                  transition: 'opacity 0.45s ease',
                  zIndex: 2,
                }}
              >
                <img
                  src={char.image}
                  alt={char.name}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    objectPosition: 'top center',
                    filter: `drop-shadow(0 0 40px ${char.accentColor}55)`,
                  }}
                />
                {/* Bottom gradient */}
                <div
                  className="absolute bottom-0 left-0 right-0 pointer-events-none"
                  style={{
                    height: '55%',
                    background: 'linear-gradient(to top, #000 0%, transparent 100%)',
                    zIndex: 3,
                  }}
                />
              </div>
            ))}

            {/* Character selector thumbnails — bottom of portrait */}
            <div
              className="absolute bottom-6 left-0 right-0 flex gap-3 px-8 z-10"
              style={{ zIndex: 10 }}
            >
              {PLAYABLE.map((char, i) => {
                const isActive = char.id === activeId;
                return (
                  <button
                    key={char.id}
                    onClick={() => handleSelect(char.id)}
                    className="relative flex-1 overflow-hidden transition-all duration-200 focus:outline-none"
                    style={{
                      height: 80,
                      border: `2px solid ${isActive ? char.accentColor : '#333'}`,
                      background: isActive ? `${char.accentColor}15` : '#0a0a0a',
                      transform: isActive ? 'scale(1.05)' : 'scale(0.98)',
                      boxShadow: isActive ? `0 0 18px ${char.accentColor}66` : 'none',
                    }}
                  >
                    <img
                      src={char.image}
                      alt={char.name}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        objectPosition: 'top center',
                        filter: isActive ? 'none' : 'grayscale(60%) brightness(0.5)',
                        transition: 'filter 0.3s',
                      }}
                    />
                    <div
                      className="absolute bottom-0 left-0 right-0 text-center py-1"
                      style={{
                        background: 'linear-gradient(transparent, rgba(0,0,0,0.85))',
                        fontSize: 8,
                        fontWeight: 900,
                        letterSpacing: '0.25em',
                        color: isActive ? char.accentColor : '#666',
                      }}
                    >
                      {char.name}
                    </div>
                    {isActive && (
                      <div
                        className="absolute bottom-0 left-0 right-0 h-0.5"
                        style={{ background: char.accentColor, animation: 'nba-pulse-border 1.5s ease-in-out infinite' }}
                      />
                    )}
                    {/* Number badge */}
                    <div
                      className="absolute top-1.5 left-1.5 text-[8px] font-bold px-1"
                      style={{
                        background: isActive ? char.accentColor : '#222',
                        color: isActive ? '#000' : '#555',
                      }}
                    >
                      {String(i + 1).padStart(2, '0')}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Left accent line */}
            <div
              className="absolute top-0 bottom-0 right-0 w-px pointer-events-none"
              style={{
                background: `linear-gradient(to bottom, transparent, ${activeChar.accentColor}44 20%, ${activeChar.accentColor}88 50%, ${activeChar.accentColor}44 80%, transparent)`,
                transition: 'background 0.4s',
                zIndex: 15,
              }}
            />
          </div>

          {/* RIGHT — character info */}
          <div
            key={panelKey}
            className="flex-1 flex flex-col justify-center px-10 py-8 overflow-hidden"
            style={{ animation: 'nba-slide-in-right 0.4s ease forwards' }}
          >
            {/* Title line */}
            <div className="mb-6">
              <div
                className="text-[9px] tracking-[0.55em] mb-2 font-bold"
                style={{ color: activeChar.accentColor, opacity: 0.8 }}
              >
                {activeChar.title}
              </div>
              <h2
                className="font-black leading-none mb-1"
                style={{
                  fontSize: 'clamp(38px, 5.5vw, 68px)',
                  color: '#fff',
                  letterSpacing: '0.04em',
                  textShadow: `0 0 40px ${activeChar.accentColor}66`,
                }}
              >
                {activeChar.fullName}
              </h2>
              <div
                className="text-[10px] tracking-[0.4em] font-bold mt-1"
                style={{ color: activeChar.accentColor }}
              >
                "{activeChar.tagline}"
              </div>
            </div>

            {/* Divider */}
            <div style={{ height: 1, background: `linear-gradient(90deg, ${activeChar.accentColor}66, transparent)`, marginBottom: 20 }} />

            {/* Bio */}
            <p
              className="text-sm leading-relaxed mb-6"
              style={{ color: '#aaa', maxWidth: 440, fontSize: 12 }}
            >
              {activeChar.bio}
            </p>

            {/* Stats */}
            <div className="mb-6">
              <div className="text-[9px] tracking-[0.5em] mb-3 font-bold" style={{ color: activeChar.accentColor, opacity: 0.7 }}>
                ATTRIBUTES
              </div>
              <div className="space-y-3" style={{ maxWidth: 400 }}>
                {activeChar.stats.map((s, i) => (
                  <div key={s.label} style={{ animationDelay: `${i * 80}ms` }}>
                    <div className="flex justify-between mb-1">
                      <span className="text-[9px] tracking-[0.35em] font-bold" style={{ color: '#666' }}>{s.label}</span>
                      <span className="text-[10px] font-black" style={{ color: activeChar.accentColor }}>{s.value}</span>
                    </div>
                    <div className="relative h-1.5 rounded-none overflow-hidden" style={{ background: '#111' }}>
                      <div
                        className="absolute inset-y-0 left-0 rounded-none"
                        style={{
                          width: statsVisible ? `${s.value}%` : '0%',
                          background: `linear-gradient(90deg, ${activeChar.accentColor}55 0%, ${activeChar.accentColor} 100%)`,
                          transition: `width 0.7s cubic-bezier(0.22, 1, 0.36, 1) ${i * 80}ms`,
                          boxShadow: `0 0 8px ${activeChar.accentColor}88`,
                        }}
                      />
                      {/* Tick marks */}
                      {[25, 50, 75].map(tick => (
                        <div
                          key={tick}
                          className="absolute inset-y-0 w-px"
                          style={{ left: `${tick}%`, background: '#222', zIndex: 2 }}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Abilities */}
            <div className="mb-8">
              <div className="text-[9px] tracking-[0.5em] mb-3 font-bold" style={{ color: activeChar.accentColor, opacity: 0.7 }}>
                ABILITIES
              </div>
              <div className="space-y-2" style={{ maxWidth: 440 }}>
                {activeChar.abilities.map((a, i) => (
                  <div
                    key={a.name}
                    className="flex items-start gap-3 px-3 py-2.5"
                    style={{
                      background: `${activeChar.accentColor}08`,
                      borderLeft: `2px solid ${activeChar.accentColor}44`,
                      animation: `nba-slide-in-up 0.35s ease forwards`,
                      animationDelay: `${i * 60 + 100}ms`,
                      opacity: 0,
                    }}
                  >
                    <div
                      className="mt-0.5 flex-shrink-0 w-4 h-4 flex items-center justify-center text-[8px] font-black"
                      style={{ background: activeChar.accentColor, color: '#000' }}
                    >
                      {i + 1}
                    </div>
                    <div>
                      <div className="text-[10px] font-bold tracking-wider mb-0.5" style={{ color: '#fff' }}>{a.name}</div>
                      <div className="text-[9px] leading-relaxed" style={{ color: '#666' }}>{a.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Confirm button */}
            <div>
              <button
                onClick={handleConfirm}
                disabled={confirming}
                className="relative group overflow-hidden px-10 py-4 font-black tracking-[0.35em] text-sm transition-all duration-200 focus:outline-none disabled:opacity-50"
                style={{
                  ['--accent' as string]: activeChar.accentColor,
                  ['--accent-dim' as string]: activeChar.accentColor + '55',
                  background: confirming ? `${activeChar.accentColor}22` : `linear-gradient(135deg, ${activeChar.accentColor}22, ${activeChar.accentColor}44)`,
                  border: `2px solid ${activeChar.accentColor}`,
                  color: activeChar.accentColor,
                  animation: 'nba-confirm-pulse 2s ease-in-out infinite',
                  minWidth: 260,
                }}
              >
                {/* Hover shimmer */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200"
                  style={{ background: `linear-gradient(135deg, ${activeChar.accentColor}15, ${activeChar.accentColor}30)` }}
                />
                <span className="relative z-10">
                  {confirming ? 'ENTERING THE WORLD...' : `ENTER AS ${activeChar.name}`}
                </span>
              </button>

              <div className="mt-3 text-[8px] tracking-[0.45em] text-white/20">
                CLICK A CHARACTER THUMBNAIL TO SWITCH • CONFIRM TO START
              </div>
            </div>
          </div>
        </div>

        {/* ── Bottom accent bar ── */}
        <div
          className="absolute bottom-0 left-0 right-0 h-0.5 pointer-events-none"
          style={{
            background: `linear-gradient(90deg, transparent, ${activeChar.accentColor}55, transparent)`,
            transition: 'background 0.4s',
          }}
        />

        {/* ── Corner marks (GTA-style) ── */}
        {[
          { top: 8, left: 8, borderTop: true, borderLeft: true },
          { top: 8, right: 8, borderTop: true, borderRight: true },
          { bottom: 8, left: 8, borderBottom: true, borderLeft: true },
          { bottom: 8, right: 8, borderBottom: true, borderRight: true },
        ].map((c, i) => (
          <div
            key={i}
            className="absolute pointer-events-none"
            style={{
              top: c.top,
              left: (c as any).left,
              right: (c as any).right,
              bottom: c.bottom,
              width: 20,
              height: 20,
              borderTop: c.borderTop ? `2px solid ${activeChar.accentColor}66` : undefined,
              borderBottom: c.borderBottom ? `2px solid ${activeChar.accentColor}66` : undefined,
              borderLeft: c.borderLeft ? `2px solid ${activeChar.accentColor}66` : undefined,
              borderRight: c.borderRight ? `2px solid ${activeChar.accentColor}66` : undefined,
              transition: 'border-color 0.4s',
            }}
          />
        ))}
      </div>
    </>
  );
}
