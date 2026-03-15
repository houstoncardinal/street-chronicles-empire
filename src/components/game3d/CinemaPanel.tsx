import { useState, useEffect, useCallback } from 'react';

// NBA YoungBoy official music videos
// These are his most-viewed YouTube videos — update IDs if any show as unavailable
const YB_VIDEOS = [
  { title: 'No Smoke',              id: '3gB3Mu1IOXo' },
  { title: 'Outside Today',         id: 'vEPm-VlicfQ' },
  { title: 'Bandit ft. Juice WRLD', id: 'sA1sMoZiAbo' },
  { title: 'Valuable Pain',         id: 'EyxXBnEo-MI' },
  { title: 'Untouchable',           id: 'XqZsoesa55w' },
  { title: 'Rich As In Spirit',     id: 'uq-gYOrU8bA' },
  { title: 'Kacey Talk',            id: 'M6y3yS5lBhE' },
  { title: 'GTA',                   id: 'ZIBcUXqFzCE' },
];

const btn: React.CSSProperties = {
  background: '#111',
  color: '#ffaa00',
  border: '1px solid #ffaa0055',
  padding: '6px 16px',
  fontFamily: 'Orbitron, sans-serif',
  fontSize: 11,
  letterSpacing: 2,
  cursor: 'pointer',
  borderRadius: 2,
};

interface CinemaPanelProps {
  onClose: () => void;
}

export function CinemaPanel({ onClose }: CinemaPanelProps) {
  const [idx, setIdx] = useState(0);

  const prev = useCallback(() => setIdx(i => (i - 1 + YB_VIDEOS.length) % YB_VIDEOS.length), []);
  const next = useCallback(() => setIdx(i => (i + 1) % YB_VIDEOS.length), []);

  // E key exits cinema
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.code === 'KeyE') onClose();
      if (e.code === 'ArrowLeft') prev();
      if (e.code === 'ArrowRight') next();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose, prev, next]);

  const video = YB_VIDEOS[idx];

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: '#000',
      zIndex: 200,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'Orbitron, sans-serif',
    }}>

      {/* Top marquee */}
      <div style={{
        color: '#ffaa00',
        fontSize: 18,
        letterSpacing: 8,
        marginBottom: 6,
        textShadow: '0 0 24px #ffaa0088',
      }}>
        ★ NBA YOUNGBOY THEATER ★
      </div>

      {/* Now playing */}
      <div style={{
        color: '#ffffff66',
        fontFamily: 'Roboto Mono, monospace',
        fontSize: 12,
        letterSpacing: 3,
        marginBottom: 14,
      }}>
        NOW PLAYING — {video.title.toUpperCase()}
      </div>

      {/* Screen border */}
      <div style={{
        position: 'relative',
        border: '3px solid #ffaa0033',
        borderRadius: 3,
        boxShadow: '0 0 40px #ffaa0022, inset 0 0 20px #00000088',
      }}>
        <iframe
          key={video.id}
          width="854"
          height="480"
          src={`https://www.youtube.com/embed/${video.id}?autoplay=1&rel=0&modestbranding=1`}
          title={video.title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          style={{ display: 'block', border: 'none', borderRadius: 1 }}
        />
      </div>

      {/* Prev / counter / next */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginTop: 14 }}>
        <button onClick={prev} style={btn}>◀ PREV</button>
        <span style={{ color: '#555', fontFamily: 'Roboto Mono', fontSize: 11 }}>
          {idx + 1} / {YB_VIDEOS.length}
        </span>
        <button onClick={next} style={btn}>NEXT ▶</button>
      </div>

      {/* Playlist chips */}
      <div style={{
        display: 'flex', flexWrap: 'wrap', gap: 6,
        marginTop: 12, maxWidth: 870, justifyContent: 'center',
      }}>
        {YB_VIDEOS.map((v, i) => (
          <button
            key={i}
            onClick={() => setIdx(i)}
            style={{
              ...btn,
              background: i === idx ? '#ffaa00' : '#111',
              color: i === idx ? '#000' : '#555',
              fontSize: 10,
              padding: '4px 10px',
            }}
          >
            {v.title}
          </button>
        ))}
      </div>

      {/* Exit hint */}
      <div style={{
        marginTop: 18,
        color: '#ff444466',
        fontFamily: 'Roboto Mono',
        fontSize: 11,
        letterSpacing: 3,
      }}>
        [E] / [←][→] NAVIGATE · CLICK FULLSCREEN FOR IMMERSIVE VIEW
      </div>
      <button
        onClick={onClose}
        style={{ ...btn, marginTop: 8, color: '#ff6644', border: '1px solid #ff444433' }}
      >
        EXIT THEATER
      </button>
    </div>
  );
}
