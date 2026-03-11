import { useGame } from '@/context/GameContext';
import { motion } from 'framer-motion';
import { DollarSign, Users, Map, Star, Music2, RotateCcw } from 'lucide-react';

export function PlayerProfile() {
  const { state, dispatch } = useGame();

  const stats = [
    { icon: DollarSign, label: 'MONEY', value: `$${state.money.toLocaleString()}` },
    { icon: Users, label: 'FANS', value: state.fans.toLocaleString() },
    { icon: Users, label: 'CREW', value: `${state.crew.length} MEMBERS` },
    { icon: Map, label: 'TERRITORY', value: `${state.districts.filter(d => d.controlled).length}/${state.totalTerritories}` },
    { icon: Star, label: 'LEVEL', value: state.level.toString() },
    { icon: Music2, label: 'SONGS', value: `${state.songs.filter(s => s.recorded).length} RELEASED` },
  ];

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <h2 className="font-display text-lg px-6 py-4 border-b border-border">PLAYER PROFILE</h2>
      <div className="flex-1 overflow-y-auto p-6">
        {/* Avatar card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="panel p-6 mb-6 text-center"
        >
          <div className="w-20 h-20 mx-auto mb-4 bg-secondary flex items-center justify-center border-2 border-primary glow-pink">
            <span className="text-3xl">👤</span>
          </div>
          <h3 className="font-display text-sm">{state.playerName}</h3>
          <div className="text-[10px] text-muted-foreground mt-1">LEVEL {state.level} · {state.completedMissions} MISSIONS COMPLETED</div>
        </motion.div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="panel p-3"
            >
              <stat.icon className="w-4 h-4 text-primary mb-2" />
              <div className="font-display text-lg">{stat.value}</div>
              <div className="text-[9px] text-muted-foreground">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Reset */}
        <button
          onClick={() => {
            if (confirm('Reset all progress?')) dispatch({ type: 'RESET_GAME' });
          }}
          className="w-full p-3 border border-destructive/30 text-destructive text-[10px] font-display flex items-center justify-center gap-2 hover:bg-destructive/10 transition-colors"
        >
          <RotateCcw className="w-3 h-3" />
          RESET PROGRESS
        </button>
      </div>
    </div>
  );
}
