import { useGame } from '@/context/GameContext';
import { MUSIC_CATALOG } from '@/data/storeData';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, SkipBack, SkipForward, Shuffle, Repeat, Music, X } from 'lucide-react';

export function MusicPlayerWidget() {
  const { state, dispatch } = useGame();
  const { musicPlayer } = state;

  if (!musicPlayer.currentAlbumId) return null;

  const album = MUSIC_CATALOG.find(a => a.id === musicPlayer.currentAlbumId);
  if (!album) return null;

  const track = album.tracks[musicPlayer.currentTrackIndex] || album.tracks[0];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 80, opacity: 0 }}
        className="fixed bottom-4 left-1/2 -translate-x-1/2 z-30 pointer-events-auto"
      >
        <div className="flex items-center gap-3 bg-card/95 border border-border px-4 py-2 backdrop-blur-sm"
          style={{ boxShadow: '0 0 30px rgba(240,0,184,0.15)' }}
        >
          {/* Album art mini */}
          <div className="w-10 h-10 border border-primary/30 flex items-center justify-center flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, rgba(240,0,184,0.15), rgba(0,0,0,0.6))' }}
          >
            {musicPlayer.isPlaying ? (
              <div className="flex gap-0.5 items-end">
                {[1,2,3].map(i => (
                  <motion.div
                    key={i}
                    animate={{ height: [3, 10, 3] }}
                    transition={{ repeat: Infinity, duration: 0.5, delay: i * 0.12 }}
                    className="w-0.5 bg-primary"
                  />
                ))}
              </div>
            ) : (
              <Music className="w-4 h-4 text-primary/60" />
            )}
          </div>

          {/* Track info */}
          <div className="min-w-0 max-w-[140px]">
            <div className="text-[9px] font-display truncate text-foreground">{track}</div>
            <div className="text-[8px] text-muted-foreground truncate">{album.title}</div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => dispatch({ type: 'MUSIC_TOGGLE_SHUFFLE' })}
              className={`p-1.5 transition-colors ${musicPlayer.shuffle ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
            >
              <Shuffle className="w-3 h-3" />
            </button>
            <button
              onClick={() => dispatch({ type: 'MUSIC_PREV' })}
              className="p-1.5 text-muted-foreground hover:text-foreground transition-colors"
            >
              <SkipBack className="w-3 h-3" />
            </button>
            <button
              onClick={() => dispatch({ type: 'MUSIC_PAUSE' })}
              className="p-2 bg-primary text-primary-foreground hover:brightness-110 transition-all"
            >
              {musicPlayer.isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
            </button>
            <button
              onClick={() => dispatch({ type: 'MUSIC_NEXT' })}
              className="p-1.5 text-muted-foreground hover:text-foreground transition-colors"
            >
              <SkipForward className="w-3 h-3" />
            </button>
            <button
              onClick={() => dispatch({ type: 'MUSIC_TOGGLE_REPEAT' })}
              className={`p-1.5 transition-colors ${musicPlayer.repeat ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
            >
              <Repeat className="w-3 h-3" />
            </button>
          </div>

          {/* Close */}
          <button
            onClick={() => dispatch({ type: 'MUSIC_PLAY', albumId: '', trackIndex: 0 })}
            className="p-1 text-muted-foreground hover:text-primary transition-colors ml-1"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
