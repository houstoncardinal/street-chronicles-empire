import { useGame } from '@/context/GameContext';
import { motion } from 'framer-motion';

export function Reputation() {
  const { state } = useGame();

  const meters = [
    { label: 'STREET RESPECT', value: state.streetRep, desc: 'Earned through missions and defending territory' },
    { label: 'INDUSTRY FAME', value: state.industryFame, desc: 'Built by recording songs and performing shows' },
    { label: 'CREW LOYALTY', value: state.crewLoyalty, desc: 'Grows when you complete missions and recruit' },
  ];

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <h2 className="font-display text-lg px-6 py-4 border-b border-border">REPUTATION</h2>
      <div className="flex-1 overflow-y-auto p-6 space-y-8">
        {meters.map((meter, i) => (
          <motion.div
            key={meter.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.15 }}
          >
            <div className="flex items-baseline justify-between mb-2">
              <span className="font-display text-xs">{meter.label}</span>
              <span className="font-display text-2xl text-primary glow-text-pink">{meter.value}</span>
            </div>
            <div className="h-2 bg-secondary mb-2">
              <motion.div
                className="h-full neon-line"
                initial={{ width: 0 }}
                animate={{ width: `${meter.value}%` }}
                transition={{ duration: 1, delay: i * 0.2 }}
              />
            </div>
            <p className="text-[10px] text-muted-foreground">{meter.desc}</p>
          </motion.div>
        ))}

        <div className="border-t border-border pt-6">
          <h3 className="font-display text-xs text-muted-foreground mb-4">COMBINED POWER</h3>
          <div className="text-center">
            <motion.span
              className="font-display text-5xl text-primary glow-text-pink"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
            >
              {Math.round((state.streetRep + state.industryFame + state.crewLoyalty) / 3)}
            </motion.span>
            <div className="text-[10px] text-muted-foreground mt-2">OVERALL INFLUENCE</div>
          </div>
        </div>
      </div>
    </div>
  );
}
