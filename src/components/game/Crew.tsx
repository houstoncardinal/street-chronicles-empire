import { useGame } from '@/context/GameContext';
import { motion } from 'framer-motion';
import { UserPlus } from 'lucide-react';
import { CrewMember } from '@/types/game';

const availableRecruits: CrewMember[] = [
  { id: 'c3', name: 'BONES', role: 'Lookout', loyalty: 50, strength: 60, influence: 40, skill: 55, avatar: '👁️', recruited: false },
  { id: 'c4', name: 'REDD', role: 'Driver', loyalty: 45, strength: 70, influence: 25, skill: 65, avatar: '🚗', recruited: false },
  { id: 'c5', name: 'NOVA', role: 'Hacker', loyalty: 55, strength: 15, influence: 60, skill: 95, avatar: '💻', recruited: false },
  { id: 'c6', name: 'BLAZE', role: 'Muscle', loyalty: 40, strength: 95, influence: 20, skill: 30, avatar: '🔥', recruited: false },
];

export function Crew() {
  const { state, dispatch } = useGame();

  const unrecruitedMembers = availableRecruits.filter(
    r => !state.crew.find(c => c.id === r.id)
  );

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <h2 className="font-display text-lg px-6 py-4 border-b border-border">
        CREW <span className="text-muted-foreground text-xs ml-2">{state.crew.length} MEMBERS</span>
      </h2>
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Active crew */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {state.crew.map((member, i) => (
            <CrewCard key={member.id} member={member} index={i} />
          ))}
        </div>

        {/* Recruits */}
        {unrecruitedMembers.length > 0 && (
          <>
            <div className="border-t border-border pt-4">
              <h3 className="font-display text-xs text-muted-foreground mb-3">AVAILABLE RECRUITS — $300 EACH</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {unrecruitedMembers.map((member, i) => (
                <motion.div
                  key={member.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.1 }}
                  className="panel-hover p-4"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{member.avatar}</span>
                      <div>
                        <div className="font-display text-xs">{member.name}</div>
                        <div className="text-[9px] text-muted-foreground">{member.role}</div>
                      </div>
                    </div>
                    <button
                      onClick={() => dispatch({ type: 'RECRUIT_MEMBER', member })}
                      disabled={state.money < 300}
                      className="flex items-center gap-1 px-2 py-1 bg-primary text-primary-foreground text-[10px] font-display disabled:opacity-30 hover:glow-pink transition-all"
                    >
                      <UserPlus className="w-3 h-3" />
                      RECRUIT
                    </button>
                  </div>
                  <StatMini label="STR" value={member.strength} />
                  <StatMini label="SKL" value={member.skill} />
                  <StatMini label="INF" value={member.influence} />
                </motion.div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function CrewCard({ member, index }: { member: CrewMember; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="panel p-4"
    >
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg">{member.avatar}</span>
        <div>
          <div className="font-display text-xs">{member.name}</div>
          <div className="text-[9px] text-muted-foreground">{member.role}</div>
        </div>
      </div>
      <div className="space-y-1.5">
        <StatMini label="LOY" value={member.loyalty} />
        <StatMini label="STR" value={member.strength} />
        <StatMini label="SKL" value={member.skill} />
        <StatMini label="INF" value={member.influence} />
      </div>
    </motion.div>
  );
}

function StatMini({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[9px] text-muted-foreground w-6">{label}</span>
      <div className="flex-1 stat-bar">
        <div className="stat-bar-fill" style={{ width: `${value}%` }} />
      </div>
      <span className="text-[9px] w-5 text-right">{value}</span>
    </div>
  );
}
