import { useState } from 'react';
import { useGame } from '@/context/GameContext';

interface PlayableCharacter {
  id: string;
  name: string;
  title: string;
  image: string;
  accentColor: string;
  glowColor: string;
  abilities: string[];
  stats: { label: string; value: number }[];
  bio: string;
}

const PLAYABLE: PlayableCharacter[] = [
  {
    id: 'yb',
    name: 'YB',
    title: 'THE LEADER',
    image: '/yb.png',
    accentColor: '#FFD700',
    glowColor: '#FFD70055',
    abilities: ['Leadership Aura', 'Major Moves', 'Street Royalty'],
    stats: [
      { label: 'STREET',   value: 95 },
      { label: 'INFLUENCE', value: 90 },
      { label: 'LOYALTY',   value: 100 },
      { label: 'HUSTLE',    value: 88 },
    ],
    bio: 'Born in the trenches. Built for the throne. The movement starts with him.',
  },
  {
    id: 'quando',
    name: 'QUANDO',
    title: 'THE ENFORCER',
    image: '/quando.png',
    accentColor: '#ff2244',
    glowColor: '#ff224455',
    abilities: ['Trap General', 'Cold World', 'Iron Grip'],
    stats: [
      { label: 'STREET',   value: 100 },
      { label: 'INFLUENCE', value: 72 },
      { label: 'LOYALTY',   value: 85 },
      { label: 'HUSTLE',    value: 92 },
    ],
    bio: 'Ice cold under pressure. The streets forged him into something different.',
  },
  {
    id: 'lultimm',
    name: 'LUL TIMM',
    title: 'THE LEGEND',
    image: '/lultimm.png',
    accentColor: '#00f0d0',
    glowColor: '#00f0d055',
    abilities: ['Icon Status', 'Alien Flow', 'Platinum Touch'],
    stats: [
      { label: 'STREET',   value: 82 },
      { label: 'INFLUENCE', value: 100 },
      { label: 'LOYALTY',   value: 78 },
      { label: 'HUSTLE',    value: 96 },
    ],
    bio: 'Unmatched creativity. Built a legacy that transcends the streets.',
  },
];

interface Props {
  onDone: () => void;
}

export function CharacterSelectScreen({ onDone }: Props) {
  const { dispatch } = useGame();
  const [selected, setSelected] = useState<string | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);

  const activeId = hovered ?? selected ?? PLAYABLE[0].id;
  const activeChar = PLAYABLE.find(c => c.id === activeId)!;

  const handleConfirm = () => {
    if (!selected) return;
    setConfirming(true);
    dispatch({ type: 'SET_PLAYER_CHARACTER', characterId: selected });
    setTimeout(onDone, 600);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden"
      style={{
        background: 'radial-gradient(ellipse at 50% 20%, #0a0218 0%, #000005 100%)',
        fontFamily: "'Roboto Mono', monospace",
      }}
    >
      {/* Scanline overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,240,208,0.025) 2px, rgba(0,240,208,0.025) 4px)',
        }}
      />

      {/* Header */}
      <div className="relative text-center mb-8 z-10">
        <p className="text-[9px] tracking-[0.6em] text-cyan-400/60 mb-1">STREET CHRONICLES EMPIRE</p>
        <h1
          className="font-display text-4xl md:text-5xl font-black tracking-[0.15em] mb-1"
          style={{ color: '#fff', textShadow: '0 0 40px #00f0d0, 0 0 80px #00f0d055' }}
        >
          SELECT YOUR LEGEND
        </h1>
        <div style={{ height: 1, background: `linear-gradient(90deg, transparent, ${activeChar.accentColor}, transparent)`, marginTop: 8 }} />
      </div>

      {/* Character cards */}
      <div className="relative z-10 flex gap-4 md:gap-6 mb-8 px-4">
        {PLAYABLE.map(char => {
          const isActive = char.id === activeId;
          const isSelected = char.id === selected;
          return (
            <button
              key={char.id}
              className="relative flex flex-col items-center cursor-pointer transition-all duration-300 focus:outline-none"
              style={{
                transform: isActive ? 'scale(1.06) translateY(-6px)' : 'scale(0.97)',
                filter: isActive ? 'drop-shadow(0 0 24px ' + char.accentColor + '88)' : 'brightness(0.55)',
              }}
              onMouseEnter={() => setHovered(char.id)}
              onMouseLeave={() => setHovered(null)}
              onClick={() => setSelected(char.id)}
            >
              {/* Card frame */}
              <div
                className="relative overflow-hidden"
                style={{
                  width: 170,
                  border: `2px solid ${isActive ? char.accentColor : '#333'}`,
                  background: isActive ? `linear-gradient(180deg, #0a0a1a, #050510)` : '#07070e',
                  boxShadow: isActive ? `0 0 32px ${char.glowColor}, inset 0 0 20px ${char.glowColor}` : 'none',
                }}
              >
                {/* Character portrait */}
                <div className="relative" style={{ height: 220, overflow: 'hidden', background: `radial-gradient(ellipse at 50% 60%, ${char.glowColor} 0%, transparent 70%)` }}>
                  <img
                    src={char.image}
                    alt={char.name}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      objectPosition: 'top center',
                    }}
                  />
                  {/* Gradient overlay at bottom */}
                  <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 60, background: 'linear-gradient(transparent, #050510)' }} />
                </div>

                {/* Name area */}
                <div className="px-3 py-3 text-center">
                  <div className="text-xs font-bold tracking-[0.25em]" style={{ color: char.accentColor }}>
                    {char.name}
                  </div>
                  <div className="text-[8px] tracking-widest mt-0.5" style={{ color: '#888' }}>
                    {char.title}
                  </div>
                </div>

                {/* Corner brackets */}
                {isActive && (
                  <>
                    <div style={{ position: 'absolute', top: 4, left: 4, width: 12, height: 12, borderTop: `2px solid ${char.accentColor}`, borderLeft: `2px solid ${char.accentColor}` }} />
                    <div style={{ position: 'absolute', top: 4, right: 4, width: 12, height: 12, borderTop: `2px solid ${char.accentColor}`, borderRight: `2px solid ${char.accentColor}` }} />
                    <div style={{ position: 'absolute', bottom: 4, left: 4, width: 12, height: 12, borderBottom: `2px solid ${char.accentColor}`, borderLeft: `2px solid ${char.accentColor}` }} />
                    <div style={{ position: 'absolute', bottom: 4, right: 4, width: 12, height: 12, borderBottom: `2px solid ${char.accentColor}`, borderRight: `2px solid ${char.accentColor}` }} />
                  </>
                )}

                {/* Selected indicator */}
                {isSelected && (
                  <div
                    className="absolute top-2 left-1/2 -translate-x-1/2 text-[7px] tracking-[0.3em] px-2 py-0.5 font-bold"
                    style={{ background: char.accentColor, color: '#000' }}
                  >
                    SELECTED
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Active character detail panel */}
      <div
        className="relative z-10 flex gap-8 items-start px-6 mb-8 w-full max-w-3xl"
        style={{ borderTop: `1px solid ${activeChar.accentColor}33`, paddingTop: 20 }}
      >
        {/* Bio + abilities */}
        <div className="flex-1">
          <p className="text-[9px] tracking-widest mb-2" style={{ color: activeChar.accentColor }}>BACKGROUND</p>
          <p className="text-xs text-gray-400 leading-relaxed mb-4">{activeChar.bio}</p>
          <p className="text-[9px] tracking-widest mb-2" style={{ color: activeChar.accentColor }}>ABILITIES</p>
          <div className="space-y-1">
            {activeChar.abilities.map(a => (
              <div key={a} className="flex items-center gap-2">
                <div className="w-1 h-1 rounded-full" style={{ background: activeChar.accentColor }} />
                <span className="text-[10px] tracking-wider text-gray-300">{a}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="flex-1">
          <p className="text-[9px] tracking-widest mb-3" style={{ color: activeChar.accentColor }}>ATTRIBUTES</p>
          <div className="space-y-2.5">
            {activeChar.stats.map(s => (
              <div key={s.label}>
                <div className="flex justify-between mb-0.5">
                  <span className="text-[9px] tracking-widest text-gray-500">{s.label}</span>
                  <span className="text-[9px]" style={{ color: activeChar.accentColor }}>{s.value}</span>
                </div>
                <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${s.value}%`, background: `linear-gradient(90deg, ${activeChar.accentColor}88, ${activeChar.accentColor})` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="relative z-10 flex flex-col items-center gap-3">
        <button
          onClick={handleConfirm}
          disabled={!selected || confirming}
          className="relative px-12 py-3 text-sm font-bold tracking-[0.3em] transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed"
          style={{
            background: selected ? `linear-gradient(135deg, ${activeChar.accentColor}22, ${activeChar.accentColor}44)` : 'transparent',
            border: `2px solid ${selected ? activeChar.accentColor : '#333'}`,
            color: selected ? activeChar.accentColor : '#555',
            boxShadow: selected ? `0 0 20px ${activeChar.glowColor}` : 'none',
          }}
        >
          {confirming ? 'ENTERING THE WORLD...' : selected ? `ENTER AS ${PLAYABLE.find(c => c.id === selected)?.name}` : 'SELECT A CHARACTER'}
        </button>
        {!selected && (
          <p className="text-[9px] text-gray-600 tracking-widest animate-pulse">CLICK A CHARACTER ABOVE TO SELECT</p>
        )}
      </div>

      {/* Background city silhouette */}
      <div
        className="absolute bottom-0 left-0 right-0 pointer-events-none"
        style={{
          height: 120,
          background: 'linear-gradient(transparent, #000008)',
        }}
      />
    </div>
  );
}
