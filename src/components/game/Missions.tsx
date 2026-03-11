import { useGame } from '@/context/GameContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { Check, Lock, Zap } from 'lucide-react';

export function Missions() {
  const { state, dispatch } = useGame();
  const [completing, setCompleting] = useState<string | null>(null);
  const [showReward, setShowReward] = useState<string | null>(null);

  const handleComplete = (missionId: string) => {
    setCompleting(missionId);
    setTimeout(() => {
      dispatch({ type: 'COMPLETE_MISSION', missionId });
      setCompleting(null);
      setShowReward(missionId);
      setTimeout(() => setShowReward(null), 2000);
    }, 1500);
  };

  const typeLabel: Record<string, string> = {
    errand: 'ERRAND',
    perform: 'PERFORM',
    defend: 'DEFEND',
    record: 'RECORD',
    rival: 'RIVAL',
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <h2 className="font-display text-lg px-6 py-4 border-b border-border">MISSIONS</h2>
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {state.missions.map((mission, i) => (
          <motion.div
            key={mission.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className={`panel-hover p-4 ${mission.completed ? 'opacity-50' : ''} ${mission.locked ? 'opacity-30' : ''}`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-display text-xs">{mission.title}</span>
                  <span className="text-[9px] px-1.5 py-0.5 bg-secondary text-muted-foreground">
                    {typeLabel[mission.type]}
                  </span>
                  <span className="text-[9px] text-muted-foreground">
                    LVL {mission.requiredLevel}
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">{mission.description}</p>
                <div className="flex gap-3 mt-2 text-[9px] text-muted-foreground">
                  {mission.rewards.money > 0 && <span>${mission.rewards.money}</span>}
                  {mission.rewards.fans > 0 && <span>+{mission.rewards.fans} fans</span>}
                  {mission.rewards.streetRep > 0 && <span>+{mission.rewards.streetRep} rep</span>}
                  {mission.rewards.industryFame > 0 && <span>+{mission.rewards.industryFame} fame</span>}
                </div>
              </div>
              <div className="shrink-0">
                {mission.completed ? (
                  <div className="w-8 h-8 flex items-center justify-center text-primary">
                    <Check className="w-4 h-4" />
                  </div>
                ) : mission.locked ? (
                  <div className="w-8 h-8 flex items-center justify-center text-muted-foreground">
                    <Lock className="w-4 h-4" />
                  </div>
                ) : (
                  <button
                    onClick={() => handleComplete(mission.id)}
                    disabled={completing !== null}
                    className="w-8 h-8 flex items-center justify-center bg-primary text-primary-foreground hover:glow-pink transition-all disabled:opacity-50"
                  >
                    {completing === mission.id ? (
                      <div className="w-3 h-3 border border-primary-foreground border-t-transparent animate-spin" />
                    ) : (
                      <Zap className="w-4 h-4" />
                    )}
                  </button>
                )}
              </div>
            </div>

            {/* Reward popup */}
            <AnimatePresence>
              {showReward === mission.id && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mt-3 p-2 bg-primary/10 border border-primary/30 text-primary text-[10px] font-display text-center"
                >
                  MISSION COMPLETE — REWARDS CLAIMED
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>

      {/* Mission completion overlay */}
      <AnimatePresence>
        {completing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/90"
          >
            <div className="text-center">
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 1, ease: 'easeInOut' }}
                className="w-48 h-0.5 neon-line mx-auto mb-6"
              />
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="font-display text-sm text-primary glow-text-pink animate-pulse-glow"
              >
                EXECUTING...
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
