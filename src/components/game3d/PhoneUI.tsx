import { useState } from 'react';
import { useGame } from '@/context/GameContext';
import { CHARACTERS } from '@/data/characters';
import { MUSIC_CATALOG } from '@/data/storeData';

type PhoneTab = 'contacts' | 'missions' | 'music' | 'map';

interface PhoneUIProps {
  onClose: () => void;
}

export function PhoneUI({ onClose }: PhoneUIProps) {
  const { state, dispatch } = useGame();
  const [tab, setTab] = useState<PhoneTab>('contacts');
  const [callTarget, setCallTarget] = useState<string | null>(null);

  const handleCall = (charId: string) => {
    setCallTarget(charId);
    dispatch({ type: 'CHAT_WITH_CHARACTER', characterId: charId });
    setTimeout(() => setCallTarget(null), 2500);
  };

  const activeMissions = state.missions.filter(m => !m.completed && !m.locked);

  const ICON_MAP: Record<string, string> = {
    yb: '👑', ben: '🎤', rondo: '⚡', timm: '🔥', herm: '💰', porter: '🎵',
    deebaby: '🧲', quando: '🌆', lultimm: '🚀',
  };

  return (
    <div
      className="fixed inset-0 z-[8000] flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.7)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Phone frame */}
      <div
        className="relative flex flex-col"
        style={{
          width: 340,
          height: 620,
          background: 'linear-gradient(180deg, #0a0a12 0%, #080810 100%)',
          border: '2px solid #333',
          borderRadius: 32,
          boxShadow: '0 0 40px rgba(0,240,208,0.3), 0 0 80px rgba(0,0,0,0.8)',
          overflow: 'hidden',
        }}
      >
        {/* Notch */}
        <div style={{ height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', borderBottom: '1px solid #1a1a2a' }}>
          <div style={{ width: 80, height: 8, background: '#1a1a2a', borderRadius: 4 }} />
        </div>

        {/* Status bar */}
        <div style={{ padding: '6px 16px', display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#888', fontFamily: "'Roboto Mono', monospace" }}>
          <span>NBA ◆ 5G</span>
          <span style={{ color: '#00f0d0' }}>3800 CHIPPEWA</span>
          <span>{'■■■■'}</span>
        </div>

        {/* Screen time / wallpaper area */}
        <div style={{ padding: '8px 16px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 11, color: '#ffaa00', letterSpacing: 2 }}>NEVER BROKE AGAIN</span>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer', fontSize: 16 }}
          >✕</button>
        </div>

        {/* Tab bar */}
        <div style={{ display: 'flex', gap: 2, padding: '8px 8px 0', borderBottom: '1px solid #1a1a2a' }}>
          {(['contacts', 'missions', 'music', 'map'] as PhoneTab[]).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                flex: 1,
                padding: '6px 0',
                fontSize: 9,
                fontFamily: "'Orbitron', sans-serif",
                letterSpacing: 1,
                background: tab === t ? 'rgba(0,240,208,0.15)' : 'transparent',
                border: 'none',
                borderBottom: tab === t ? '2px solid #00f0d0' : '2px solid transparent',
                color: tab === t ? '#00f0d0' : '#666',
                cursor: 'pointer',
                textTransform: 'uppercase',
              }}
            >
              {t === 'contacts' ? '👤' : t === 'missions' ? '🎯' : t === 'music' ? '🎵' : '🗺️'} {t}
            </button>
          ))}
        </div>

        {/* Content area */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '10px 12px' }}>

          {/* CONTACTS TAB */}
          {tab === 'contacts' && (
            <div>
              <p style={{ fontSize: 9, color: '#666', fontFamily: "'Roboto Mono', monospace", marginBottom: 8 }}>
                {Object.values(state.characterStates).filter(c => c.isRecruited).length} crew members
              </p>
              {CHARACTERS.map(char => {
                const cs = state.characterStates[char.id];
                if (!cs) return null;
                const isCalling = callTarget === char.id;
                return (
                  <div
                    key={char.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      padding: '8px 10px',
                      marginBottom: 4,
                      background: 'rgba(255,255,255,0.04)',
                      borderRadius: 10,
                      border: cs.isRecruited ? '1px solid rgba(0,240,208,0.2)' : '1px solid rgba(255,255,255,0.06)',
                    }}
                  >
                    {/* Avatar */}
                    <div style={{
                      width: 40, height: 40,
                      borderRadius: '50%',
                      background: `radial-gradient(circle, ${char.visual.accentColor}33, ${char.visual.accentColor}11)`,
                      border: `2px solid ${char.visual.accentColor}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 18,
                    }}>
                      {ICON_MAP[char.id] ?? '👤'}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 11, color: '#fff', letterSpacing: 1 }}>
                        {char.name.toUpperCase()}
                      </div>
                      <div style={{ fontSize: 9, color: char.visual.accentColor, marginTop: 2, fontFamily: "'Roboto Mono', monospace" }}>
                        {char.title}
                      </div>
                      <div style={{ fontSize: 8, color: '#555', fontFamily: "'Roboto Mono', monospace" }}>
                        REP {cs.relationship}
                      </div>
                    </div>
                    <button
                      onClick={() => cs.isRecruited && handleCall(char.id)}
                      style={{
                        padding: '5px 10px',
                        background: isCalling ? '#00aa44' : cs.isRecruited ? 'rgba(0,240,208,0.15)' : 'rgba(255,255,255,0.05)',
                        border: `1px solid ${isCalling ? '#00ff66' : cs.isRecruited ? '#00f0d0' : '#333'}`,
                        borderRadius: 6,
                        color: isCalling ? '#00ff66' : cs.isRecruited ? '#00f0d0' : '#555',
                        fontSize: 10,
                        cursor: cs.isRecruited ? 'pointer' : 'not-allowed',
                        fontFamily: "'Orbitron', sans-serif",
                      }}
                    >
                      {isCalling ? '📞...' : cs.isRecruited ? 'CALL' : 'LOCKED'}
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* MISSIONS TAB */}
          {tab === 'missions' && (
            <div>
              <p style={{ fontSize: 9, color: '#666', fontFamily: "'Roboto Mono', monospace", marginBottom: 8 }}>
                {activeMissions.length} active missions
              </p>
              {activeMissions.length === 0 && (
                <p style={{ color: '#555', fontSize: 10, fontFamily: "'Roboto Mono', monospace", textAlign: 'center', marginTop: 40 }}>
                  No active missions.<br />Explore the block.
                </p>
              )}
              {activeMissions.map(m => (
                <div
                  key={m.id}
                  style={{
                    padding: '10px 12px',
                    marginBottom: 6,
                    background: 'rgba(255,255,255,0.04)',
                    borderRadius: 10,
                    border: `1px solid rgba(0,240,208,0.15)`,
                  }}
                >
                  <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 11, color: '#00f0d0', letterSpacing: 1 }}>
                    {m.title}
                  </div>
                  <div style={{ fontSize: 9, color: '#aaa', marginTop: 3, fontFamily: "'Roboto Mono', monospace" }}>
                    {m.description}
                  </div>
                  <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
                    <span style={{ fontSize: 9, color: '#ffaa00', fontFamily: "'Roboto Mono', monospace" }}>
                      💰 ${m.rewards.money.toLocaleString()}
                    </span>
                    <span style={{ fontSize: 9, color: '#f000b8', fontFamily: "'Roboto Mono', monospace" }}>
                      ⭐ {m.rewards.fans} fans
                    </span>
                    <span style={{ fontSize: 9, color: '#888', marginLeft: 'auto', fontFamily: "'Roboto Mono', monospace" }}>
                      LVL {m.requiredLevel}
                    </span>
                  </div>
                </div>
              ))}

              {/* Completed */}
              <p style={{ fontSize: 9, color: '#555', fontFamily: "'Roboto Mono', monospace", margin: '12px 0 6px' }}>
                COMPLETED ({state.missions.filter(m => m.completed).length})
              </p>
              {state.missions.filter(m => m.completed).map(m => (
                <div key={m.id} style={{ padding: '6px 10px', marginBottom: 3, background: 'rgba(0,255,0,0.04)', borderRadius: 8, border: '1px solid rgba(0,255,0,0.1)', opacity: 0.6 }}>
                  <span style={{ fontSize: 10, color: '#00cc44', fontFamily: "'Orbitron', sans-serif" }}>✓ {m.title}</span>
                </div>
              ))}
            </div>
          )}

          {/* MUSIC TAB */}
          {tab === 'music' && (
            <div>
              {/* Now playing */}
              {state.musicPlayer.currentAlbumId && (
                <div style={{
                  padding: '12px',
                  marginBottom: 12,
                  background: 'rgba(0,240,208,0.08)',
                  borderRadius: 12,
                  border: '1px solid rgba(0,240,208,0.3)',
                }}>
                  <div style={{ fontSize: 9, color: '#00f0d0', fontFamily: "'Orbitron', sans-serif", letterSpacing: 2, marginBottom: 4 }}>
                    ▶ NOW PLAYING
                  </div>
                  {(() => {
                    const alb = MUSIC_CATALOG.find(a => a.id === state.musicPlayer.currentAlbumId);
                    if (!alb) return null;
                    return (
                      <>
                        <div style={{ color: '#fff', fontFamily: "'Orbitron', sans-serif", fontSize: 12 }}>{alb.title}</div>
                        <div style={{ color: '#888', fontSize: 10, fontFamily: "'Roboto Mono', monospace", marginTop: 2 }}>{alb.artist}</div>
                        <div style={{ color: '#00f0d0', fontSize: 10, fontFamily: "'Roboto Mono', monospace", marginTop: 2 }}>
                          Track {state.musicPlayer.currentTrackIndex + 1}: {alb.tracks[state.musicPlayer.currentTrackIndex]}
                        </div>
                        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                          <button onClick={() => dispatch({ type: 'MUSIC_PREV' })} style={btnStyle}>⏮</button>
                          <button onClick={() => dispatch({ type: 'MUSIC_PAUSE' })} style={btnStyle}>
                            {state.musicPlayer.isPlaying ? '⏸' : '▶'}
                          </button>
                          <button onClick={() => dispatch({ type: 'MUSIC_NEXT' })} style={btnStyle}>⏭</button>
                          <button onClick={() => dispatch({ type: 'MUSIC_TOGGLE_SHUFFLE' })} style={{ ...btnStyle, color: state.musicPlayer.shuffle ? '#00f0d0' : '#666' }}>🔀</button>
                        </div>
                      </>
                    );
                  })()}
                </div>
              )}

              <p style={{ fontSize: 9, color: '#666', fontFamily: "'Roboto Mono', monospace", marginBottom: 8 }}>
                OWNED ({state.ownedMusic.length}) ALBUMS
              </p>

              {state.ownedMusic.length === 0 && (
                <p style={{ color: '#555', fontSize: 10, fontFamily: "'Roboto Mono', monospace", textAlign: 'center', marginTop: 20 }}>
                  No albums yet. Visit the Music Store.
                </p>
              )}

              {MUSIC_CATALOG.filter(a => state.ownedMusic.includes(a.id)).map(alb => (
                <div
                  key={alb.id}
                  style={{
                    padding: '8px 12px',
                    marginBottom: 4,
                    background: 'rgba(255,255,255,0.04)',
                    borderRadius: 10,
                    border: '1px solid rgba(255,255,255,0.06)',
                    cursor: 'pointer',
                  }}
                  onClick={() => dispatch({ type: 'MUSIC_PLAY', albumId: alb.id, trackIndex: 0 })}
                >
                  <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 11, color: '#fff' }}>{alb.title}</div>
                  <div style={{ fontSize: 9, color: '#888', fontFamily: "'Roboto Mono', monospace" }}>{alb.artist} · {alb.year}</div>
                  <div style={{ fontSize: 8, color: '#555', marginTop: 3, fontFamily: "'Roboto Mono', monospace" }}>
                    {alb.tracks.length} tracks
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* MAP TAB */}
          {tab === 'map' && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{
                width: 280, height: 280,
                background: '#0a1810',
                border: '1px solid rgba(0,240,208,0.3)',
                borderRadius: 12,
                position: 'relative',
                overflow: 'hidden',
              }}>
                {/* Grid */}
                <div style={{
                  position: 'absolute', inset: 0,
                  backgroundImage: 'linear-gradient(rgba(0,240,208,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0,240,208,0.05) 1px, transparent 1px)',
                  backgroundSize: '28px 28px',
                }} />
                {/* Street */}
                <div style={{ position: 'absolute', left: 0, right: 0, top: '50%', height: 12, background: 'rgba(0,240,208,0.06)', transform: 'translateY(-50%)' }} />
                <div style={{ position: 'absolute', top: 0, bottom: 0, left: '50%', width: 12, background: 'rgba(0,240,208,0.04)', transform: 'translateX(-50%)' }} />

                {/* Buildings */}
                {[
                  { x: 20, z: 25, w: 40, h: 25, color: '#1a4a1a', label: 'NBA HQ' },
                  { x: 180, z: 25, w: 35, h: 20, color: '#1a1a4a', label: 'BAR' },
                  { x: 20, z: 180, w: 40, h: 20, color: '#3a1a1a', label: 'STUDIO' },
                  { x: 120, z: 60, w: 20, h: 15, color: '#1a2a1a', label: '' },
                  { x: 60, z: 200, w: 25, h: 18, color: '#1a1a2a', label: '' },
                ].map((b, i) => (
                  <div key={i} style={{
                    position: 'absolute',
                    left: b.x, top: b.z,
                    width: b.w, height: b.h,
                    background: b.color,
                    border: '1px solid rgba(0,240,208,0.2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {b.label && <span style={{ fontSize: 6, color: '#00f0d0', fontFamily: "'Orbitron', sans-serif" }}>{b.label}</span>}
                  </div>
                ))}

                {/* Player dot */}
                <div style={{
                  position: 'absolute',
                  left: 130, top: 125,
                  width: 10, height: 10,
                  borderRadius: '50%',
                  background: '#00f0d0',
                  boxShadow: '0 0 8px #00f0d0',
                  zIndex: 10,
                }} />

                {/* Region label */}
                <div style={{
                  position: 'absolute', bottom: 6, left: 0, right: 0,
                  textAlign: 'center',
                  fontSize: 8, color: '#ffaa00',
                  fontFamily: "'Orbitron', sans-serif",
                  letterSpacing: 2,
                }}>
                  3800 CHIPPEWA · {state.currentRegion.toUpperCase()}
                </div>
              </div>

              {/* Legend */}
              <div style={{ marginTop: 12, width: '100%' }}>
                {[
                  { color: '#00f0d0', label: 'YOU' },
                  { color: '#ffaa00', label: 'MISSIONS' },
                  { color: '#ff2244', label: 'ENEMIES' },
                  { color: '#1a4a1a', label: 'NBA HQ' },
                ].map((item, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: item.color }} />
                    <span style={{ fontSize: 9, color: '#888', fontFamily: "'Roboto Mono', monospace" }}>{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Bottom home bar */}
        <div style={{
          height: 24,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          borderTop: '1px solid #1a1a2a',
        }}>
          <div style={{ width: 80, height: 4, background: '#333', borderRadius: 2 }} />
        </div>
      </div>
    </div>
  );
}

const btnStyle: React.CSSProperties = {
  padding: '4px 10px',
  background: 'rgba(0,240,208,0.1)',
  border: '1px solid rgba(0,240,208,0.3)',
  borderRadius: 6,
  color: '#00f0d0',
  fontSize: 12,
  cursor: 'pointer',
};
