import { useGame } from '@/context/GameContext';
import { motion } from 'framer-motion';
import { Disc3, Music2 } from 'lucide-react';

export function MusicStudio() {
  const { state, dispatch } = useGame();

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <h2 className="font-display text-lg px-6 py-4 border-b border-border">MUSIC STUDIO</h2>
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {state.songs.map((song, i) => {
          const cost = song.type === 'mixtape' ? 500 : 200;
          const canAfford = state.money >= cost;

          return (
            <motion.div
              key={song.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`panel-hover p-4 ${song.recorded ? 'opacity-60' : ''}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 flex items-center justify-center ${
                    song.recorded ? 'bg-primary/20 text-primary' : 'bg-secondary text-muted-foreground'
                  }`}>
                    {song.type === 'mixtape' ? <Disc3 className="w-5 h-5" /> : <Music2 className="w-5 h-5" />}
                  </div>
                  <div>
                    <div className="font-display text-xs">{song.title}</div>
                    <div className="text-[9px] text-muted-foreground mt-0.5">
                      {song.type === 'mixtape' ? 'MIXTAPE' : 'SINGLE'} · +{song.fans} FANS · +{song.fame} FAME
                    </div>
                  </div>
                </div>
                {song.recorded ? (
                  <span className="text-[9px] text-primary font-display">RELEASED</span>
                ) : (
                  <button
                    onClick={() => dispatch({ type: 'RECORD_SONG', songId: song.id })}
                    disabled={!canAfford}
                    className="px-3 py-1.5 bg-primary text-primary-foreground text-[10px] font-display disabled:opacity-30 hover:glow-pink transition-all"
                  >
                    RECORD ${cost}
                  </button>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
