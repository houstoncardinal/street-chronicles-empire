import { useGame } from '@/context/GameContext';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Zap, UserPlus, Music2, Disc3 } from 'lucide-react';

const availableRecruits = [
  { id: 'c3', name: 'BONES', role: 'Lookout', loyalty: 50, strength: 60, influence: 40, skill: 55, avatar: '👁️', recruited: false },
  { id: 'c4', name: 'REDD', role: 'Driver', loyalty: 45, strength: 70, influence: 25, skill: 65, avatar: '🚗', recruited: false },
  { id: 'c5', name: 'NOVA', role: 'Hacker', loyalty: 55, strength: 15, influence: 60, skill: 95, avatar: '💻', recruited: false },
  { id: 'c6', name: 'BLAZE', role: 'Muscle', loyalty: 40, strength: 95, influence: 20, skill: 30, avatar: '🔥', recruited: false },
];

export function InteractionPanel() {
  const { state, dispatch } = useGame();

  if (!state.showPanel) return null;

  const close = () => dispatch({ type: 'SET_SHOW_PANEL', panel: null });

  let content: React.ReactNode = null;

  if (state.showPanel === 'studio') {
    content = <StudioPanel />;
  } else if (state.showPanel.startsWith('mission:')) {
    const interactionId = state.showPanel.split(':')[1];
    content = <MissionPanel interactionId={interactionId} />;
  } else if (state.showPanel.startsWith('recruit:')) {
    const interactionId = state.showPanel.split(':')[1];
    content = <RecruitPanel interactionId={interactionId} />;
  } else if (state.showPanel === 'club') {
    content = <InfoPanel title="THE CLUB" text="The bass thumps through the walls. VIPs only beyond this point. Build your fame to unlock exclusive opportunities." />;
  } else if (state.showPanel === 'cabin') {
    content = <InfoPanel title="ABANDONED CABIN" text="The cabin is empty. Snow drifts through broken windows. Someone was here recently — supplies are scattered." />;
  } else if (state.showPanel === 'cave') {
    content = <InfoPanel title="CAVE ENTRANCE" text="Darkness stretches deep into the mountain. You'll need better equipment to explore further. The air is cold and damp." />;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-background/85 pointer-events-auto"
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="w-full max-w-md panel border border-border p-6 relative mx-4"
        >
          <button
            onClick={close}
            className="absolute top-3 right-3 text-muted-foreground hover:text-primary transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
          {content}
          <div className="text-[9px] text-muted-foreground mt-4 text-center">ESC OR CLICK OUTSIDE TO CLOSE</div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function StudioPanel() {
  const { state, dispatch } = useGame();
  const unrecorded = state.songs.filter(s => !s.recorded);

  return (
    <div>
      <h3 className="font-display text-sm mb-4 text-primary">RECORDING STUDIO</h3>
      {unrecorded.length === 0 ? (
        <p className="text-xs text-muted-foreground">All tracks have been recorded.</p>
      ) : (
        <div className="space-y-2">
          {unrecorded.map(song => {
            const cost = song.type === 'mixtape' ? 500 : 200;
            return (
              <div key={song.id} className="flex items-center justify-between p-3 bg-secondary/50 border border-border">
                <div className="flex items-center gap-2">
                  {song.type === 'mixtape' ? <Disc3 className="w-4 h-4 text-primary" /> : <Music2 className="w-4 h-4 text-primary" />}
                  <div>
                    <div className="font-display text-[10px]">{song.title}</div>
                    <div className="text-[9px] text-muted-foreground">+{song.fans} FANS · +{song.fame} FAME</div>
                  </div>
                </div>
                <button
                  onClick={() => dispatch({ type: 'RECORD_SONG', songId: song.id })}
                  disabled={state.money < cost}
                  className="px-2 py-1 bg-primary text-primary-foreground text-[9px] font-display disabled:opacity-30 hover:glow-pink transition-all"
                >
                  ${cost}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function MissionPanel({ interactionId }: { interactionId: string }) {
  const { state, dispatch } = useGame();

  // Find the mission linked to this interaction
  const allInteractions = [...cityInteractionsData, ...mountainInteractionsData];
  const interaction = allInteractions.find((p) => p.id === interactionId);
  const mission = interaction?.missionId ? state.missions.find(m => m.id === interaction.missionId) : null;

  if (!mission) {
    return (
      <div>
        <h3 className="font-display text-sm mb-2 text-primary">MISSION UNAVAILABLE</h3>
        <p className="text-xs text-muted-foreground">This mission is not available yet.</p>
      </div>
    );
  }

  if (mission.completed) {
    return (
      <div>
        <h3 className="font-display text-sm mb-2 text-primary">{mission.title}</h3>
        <p className="text-xs text-muted-foreground">Mission already completed.</p>
      </div>
    );
  }

  if (mission.locked) {
    return (
      <div>
        <h3 className="font-display text-sm mb-2 text-primary">{mission.title}</h3>
        <p className="text-xs text-muted-foreground">Requires Level {mission.requiredLevel}. You are Level {state.level}.</p>
      </div>
    );
  }

  return (
    <div>
      <h3 className="font-display text-sm mb-2 text-primary">{mission.title}</h3>
      <p className="text-xs text-muted-foreground mb-4">{mission.description}</p>
      <div className="flex gap-3 text-[9px] text-muted-foreground mb-4">
        {mission.rewards.money > 0 && <span>${mission.rewards.money}</span>}
        {mission.rewards.fans > 0 && <span>+{mission.rewards.fans} FANS</span>}
        {mission.rewards.streetRep > 0 && <span>+{mission.rewards.streetRep} REP</span>}
        {mission.rewards.industryFame > 0 && <span>+{mission.rewards.industryFame} FAME</span>}
      </div>
      <button
        onClick={() => dispatch({ type: 'COMPLETE_MISSION', missionId: mission.id })}
        className="w-full py-2 bg-primary text-primary-foreground font-display text-xs flex items-center justify-center gap-2 hover:glow-pink transition-all"
      >
        <Zap className="w-3 h-3" />
        EXECUTE MISSION
      </button>
    </div>
  );
}

function RecruitPanel({ interactionId }: { interactionId: string }) {
  const { state, dispatch } = useGame();

  const allInteractions = [...cityInteractionsData, ...mountainInteractionsData];
  const interaction = allInteractions.find((p) => p.id === interactionId);
  const recruit = interaction?.crewId ? availableRecruits.find(r => r.id === interaction.crewId) : null;

  if (!recruit) return <p className="text-xs text-muted-foreground">No recruit found.</p>;

  const alreadyRecruited = state.crew.some(c => c.id === recruit.id);

  return (
    <div>
      <h3 className="font-display text-sm mb-2 text-primary">RECRUIT: {recruit.name}</h3>
      <p className="text-xs text-muted-foreground mb-3">{recruit.role}</p>

      <div className="space-y-1 mb-4">
        <StatBar label="LOYALTY" value={recruit.loyalty} />
        <StatBar label="STRENGTH" value={recruit.strength} />
        <StatBar label="SKILL" value={recruit.skill} />
        <StatBar label="INFLUENCE" value={recruit.influence} />
      </div>

      {alreadyRecruited ? (
        <p className="text-xs text-primary font-display text-center">ALREADY IN YOUR CREW</p>
      ) : (
        <button
          onClick={() => dispatch({ type: 'RECRUIT_MEMBER', member: recruit })}
          disabled={state.money < 300}
          className="w-full py-2 bg-primary text-primary-foreground font-display text-xs flex items-center justify-center gap-2 hover:glow-pink transition-all disabled:opacity-30"
        >
          <UserPlus className="w-3 h-3" />
          RECRUIT — $300
        </button>
      )}
    </div>
  );
}

function InfoPanel({ title, text }: { title: string; text: string }) {
  return (
    <div>
      <h3 className="font-display text-sm mb-2 text-primary">{title}</h3>
      <p className="text-xs text-muted-foreground leading-relaxed">{text}</p>
    </div>
  );
}

function StatBar({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[9px] text-muted-foreground w-16">{label}</span>
      <div className="flex-1 h-1 bg-secondary">
        <div className="h-full neon-line" style={{ width: `${value}%` }} />
      </div>
      <span className="text-[9px] w-5 text-right">{value}</span>
    </div>
  );
}
