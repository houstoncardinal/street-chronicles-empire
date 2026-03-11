import { useGame } from '@/context/GameContext';
import { motion } from 'framer-motion';

export function WorldMap() {
  const { state, dispatch } = useGame();

  return (
    <div className="h-full flex flex-col">
      <h2 className="font-display text-lg px-6 py-4 border-b border-border">WORLD MAP</h2>
      <div className="flex-1 relative overflow-hidden bg-background">
        {/* Grid lines */}
        <svg className="absolute inset-0 w-full h-full opacity-5" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>

        {/* Connection lines */}
        <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
          {state.districts.map((d, i) =>
            state.districts.slice(i + 1).map(d2 => {
              if (!d.unlocked && !d2.unlocked) return null;
              return (
                <line
                  key={`${d.id}-${d2.id}`}
                  x1={`${d.x}%`} y1={`${d.y}%`}
                  x2={`${d2.x}%`} y2={`${d2.y}%`}
                  stroke="hsl(0 0% 20%)"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                />
              );
            })
          )}
        </svg>

        {/* Districts */}
        {state.districts.map((district, i) => (
          <motion.div
            key={district.id}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
            style={{ left: `${district.x}%`, top: `${district.y}%` }}
            onClick={() => {
              if (district.unlocked) dispatch({ type: 'SET_SECTION', section: 'missions' });
            }}
          >
            {/* Node */}
            <div className={`w-4 h-4 border-2 transition-all duration-300 ${
              district.controlled
                ? 'bg-primary border-primary glow-pink'
                : district.unlocked
                  ? 'bg-secondary border-muted-foreground'
                  : 'bg-muted border-border opacity-40'
            }`} />

            {/* Label */}
            <div className={`absolute top-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-center transition-opacity ${
              district.unlocked ? 'opacity-100' : 'opacity-30'
            }`}>
              <div className="font-display text-[10px] tracking-wider">{district.name}</div>
              {district.unlocked && (
                <div className="text-[9px] text-muted-foreground mt-0.5">
                  {district.controlPercent}% CONTROL
                </div>
              )}
            </div>

            {/* Pulse for controlled */}
            {district.controlled && (
              <div className="absolute inset-0 w-4 h-4 bg-primary opacity-30 animate-pulse-glow" />
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
