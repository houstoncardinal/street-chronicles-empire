import { useState, useEffect, useRef } from 'react';
import { useGame } from '@/context/GameContext';
import { motion, AnimatePresence } from 'framer-motion';
import { cityInteractions as cityInteractionsData, mountainInteractions as mountainInteractionsData } from '@/data/interactions';
import { CAFE_ITEMS, DRUGS, MEETUP_SPOTS } from '@/data/cyberData';
import { X, Zap, UserPlus, Music2, Disc3, Coffee, AlertTriangle, Users } from 'lucide-react';

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
    content = <InfoPanel title="THE CHROME LOUNGE" text="VIP only. The bass shakes the walls. Deals get made in the back booths. Build your fame to unlock this." />;
  } else if (state.showPanel === 'cabin') {
    content = <InfoPanel title="ABANDONED CABIN" text="Signs of recent activity. Scattered supplies and encrypted data chips left behind." />;
  } else if (state.showPanel === 'cave') {
    content = <InfoPanel title="CAVE ENTRANCE" text="Darkness stretches deep into the mountain. Signal cuts out. You need better gear to explore." />;
  } else if (state.showPanel === 'cafe') {
    content = <CafePanel />;
  } else if (state.showPanel === 'drugmarket') {
    content = <DrugMarketPanel />;
  } else if (state.showPanel.startsWith('meetup:')) {
    const meetupId = state.showPanel.split(':').slice(1).join(':');
    content = <MeetupPanel meetupId={meetupId} />;
  } else if (state.showPanel.startsWith('citizen:')) {
    const citizenId = state.showPanel.split(':')[1];
    content = <CitizenPanel citizenId={citizenId} />;
  }

  if (!content) return null;

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

/* ─── Cafe Panel ─── */
function CafePanel() {
  const { state, dispatch } = useGame();
  const buffRemaining = state.activeBuff
    ? Math.max(0, Math.ceil((state.activeBuff.expiresAt - Date.now()) / 1000))
    : 0;

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <Coffee className="w-4 h-4 text-primary" />
        <h3 className="font-display text-sm text-primary">CHROME CAFE</h3>
        <span className="ml-auto text-[10px] text-muted-foreground">${state.money.toLocaleString()}</span>
      </div>

      {state.activeBuff && (
        <div
          className="mb-3 p-2 bg-secondary/50 border text-[9px] flex items-center gap-2"
          style={{ borderColor: state.activeBuff.color }}
        >
          <span style={{ color: state.activeBuff.color }}>ACTIVE: {state.activeBuff.label}</span>
          <span className="text-muted-foreground ml-auto">{buffRemaining}s remaining</span>
        </div>
      )}

      <div className="space-y-2">
        {CAFE_ITEMS.map(item => {
          const canAfford = state.money >= item.price;
          return (
            <div key={item.id} className="flex items-center gap-3 p-3 bg-secondary/30 border border-border">
              <span className="text-xl">{item.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="font-display text-[10px]">{item.name}</div>
                <div className="text-[9px] text-muted-foreground leading-snug">{item.description}</div>
              </div>
              <button
                onClick={() => dispatch({ type: 'BUY_CAFE_ITEM', itemId: item.id })}
                disabled={!canAfford}
                className="shrink-0 px-3 py-1 font-display text-[9px] btn-cyber disabled:opacity-30"
              >
                ${item.price}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Drug Market Panel ─── */
function DrugMarketPanel() {
  const { state, dispatch } = useGame();
  const [tab, setTab] = useState<'buy' | 'sell'>('buy');

  const heatPct = Math.min(100, state.drugHeat);
  const heatColor = heatPct > 70 ? '#ff4444' : heatPct > 40 ? '#ffaa00' : '#00f0d0';

  const ownedDrugs = DRUGS.filter(d => (state.drugInventory[d.id] ?? 0) > 0);

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <AlertTriangle className="w-4 h-4 text-accent" />
        <h3 className="font-display text-sm text-accent">BLACK MARKET</h3>
        <span className="ml-auto text-[10px] text-muted-foreground">${state.money.toLocaleString()}</span>
      </div>

      {/* Heat meter */}
      <div className="flex items-center gap-2 mb-3">
        <span className="text-[9px] text-muted-foreground w-8">HEAT</span>
        <div className="flex-1 h-1 bg-secondary">
          <div className="h-full transition-all duration-300" style={{ width: `${heatPct}%`, background: heatColor }} />
        </div>
        <span className="text-[9px] w-8 text-right" style={{ color: heatColor }}>{Math.round(heatPct)}%</span>
      </div>

      {/* Wanted level */}
      {state.wantedLevel > 0 && (
        <div className="flex items-center gap-1 mb-3">
          <span className="text-[9px] text-muted-foreground mr-1">WANTED</span>
          {Array.from({ length: 5 }).map((_, i) => (
            <span key={i} className="text-xs" style={{ color: i < state.wantedLevel ? '#ff4444' : '#333' }}>★</span>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 mb-3">
        {(['buy', 'sell'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-1.5 font-display text-[10px] border transition-colors ${
              tab === t ? 'border-accent text-accent bg-accent/10' : 'border-border text-muted-foreground hover:border-border/60'
            }`}
          >
            {t.toUpperCase()}
          </button>
        ))}
      </div>

      {tab === 'buy' && (
        <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
          {DRUGS.map(drug => {
            const owned = state.drugInventory[drug.id] ?? 0;
            return (
              <div key={drug.id} className="p-3 bg-secondary/30 border border-border">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="font-display text-[10px]">{drug.name}</span>
                    <span className="text-[8px] text-muted-foreground">T{drug.tier}</span>
                    {owned > 0 && <span className="text-[8px] text-primary">×{owned}</span>}
                  </div>
                  <span className="text-[9px] text-muted-foreground">${drug.buyPrice}/ea</span>
                </div>
                <div className="text-[8px] text-muted-foreground mb-2 leading-snug">{drug.description}</div>
                <div className="flex gap-1.5">
                  {[1, 5, 10].map(qty => (
                    <button
                      key={qty}
                      onClick={() => dispatch({ type: 'BUY_DRUG', drugId: drug.id, qty })}
                      disabled={state.money < drug.buyPrice * qty}
                      className="flex-1 py-1 font-display text-[9px] bg-accent/10 border border-accent/40 text-accent hover:bg-accent/20 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                      ×{qty}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {tab === 'sell' && (
        <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
          {ownedDrugs.length === 0 ? (
            <p className="text-[10px] text-muted-foreground text-center py-6">No product in inventory.</p>
          ) : (
            ownedDrugs.map(drug => {
              const owned = state.drugInventory[drug.id] ?? 0;
              const minSell = Math.floor(drug.buyPrice * drug.sellMultiplierMin);
              const maxSell = Math.floor(drug.buyPrice * drug.sellMultiplierMax);
              return (
                <div key={drug.id} className="p-3 bg-secondary/30 border border-border">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-display text-[10px]">{drug.name}</span>
                    <span className="text-[9px] text-primary">×{owned} OWNED</span>
                  </div>
                  <div className="text-[8px] text-muted-foreground mb-2">
                    SELL: ${minSell}–${maxSell}/ea &nbsp;·&nbsp; RISK {drug.riskLevel}/5
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => dispatch({ type: 'SELL_DRUG', drugId: drug.id, qty: 1 })}
                      className="flex-1 py-1 font-display text-[9px] btn-cyber"
                    >
                      SELL 1
                    </button>
                    <button
                      onClick={() => dispatch({ type: 'SELL_DRUG', drugId: drug.id, qty: owned })}
                      className="flex-1 py-1 font-display text-[9px] btn-cyber"
                    >
                      SELL ALL
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}

/* ─── Meetup Panel ─── */
function MeetupPanel({ meetupId }: { meetupId: string }) {
  const { state, dispatch } = useGame();
  const [done, setDone] = useState(false);
  const spot = MEETUP_SPOTS.find(s => s.id === meetupId);

  if (!spot) return <InfoPanel title="MEETUP" text="Location not found." />;

  const handleHangout = () => {
    if (spot.moneyBonus > 0) dispatch({ type: 'ADD_MONEY', amount: spot.moneyBonus });
    Object.keys(state.characterStates).forEach(charId => {
      const cs = state.characterStates[charId];
      if (cs.isRecruited || cs.isFollowing) {
        dispatch({ type: 'BOOST_RELATIONSHIP', characterId: charId, amount: spot.relBoost });
      }
    });
    setDone(true);
  };

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <Users className="w-4 h-4 text-primary" />
        <h3 className="font-display text-sm text-primary">{spot.name}</h3>
      </div>

      <div className="text-[9px] text-muted-foreground mb-2 uppercase tracking-widest">{spot.location}</div>
      <p className="text-xs text-foreground mb-4 leading-relaxed">{spot.description}</p>

      <div className="flex flex-wrap gap-2 mb-4">
        {spot.vibes.map(v => (
          <span key={v} className="text-[8px] px-2 py-0.5 bg-secondary border border-primary/20 text-muted-foreground uppercase tracking-wide">
            {v}
          </span>
        ))}
      </div>

      <div className="flex items-center gap-4 mb-4 text-[10px] p-2 bg-secondary/30 border border-border">
        {spot.moneyBonus > 0 && <span className="text-primary font-display">+${spot.moneyBonus}</span>}
        <span className="text-foreground">+{spot.relBoost} CREW LOYALTY</span>
      </div>

      {done ? (
        <div className="w-full py-2 text-center font-display text-[10px] text-primary border border-primary/40">
          GOOD TIMES — COME BACK LATER
        </div>
      ) : (
        <button
          onClick={handleHangout}
          className="w-full py-2 btn-cyber font-display text-xs flex items-center justify-center gap-2"
        >
          <Users className="w-3 h-3" />
          HANG OUT
        </button>
      )}
    </div>
  );
}

/* ─── Studio Panel ─── */
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
                  className="px-2 py-1 btn-cyber text-[9px] font-display disabled:opacity-30"
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

/* ─── Mission Panel ─── */
const MISSION_STEPS: Record<string, string[]> = {
  errand:  ['LOCATING TARGET…', 'MOVING INTO POSITION…', 'PACKAGE SECURED…', 'EXTRACTION COMPLETE'],
  perform: ['CROWD ASSEMBLING…', 'SOUND CHECK…', 'TAKING THE STAGE…', 'CROWD GOES WILD'],
  defend:  ['SCOUTS DEPLOYED…', 'PERIMETER LOCKED…', 'RIVALS PUSHED BACK…', 'BLOCK SECURED'],
  rival:   ['TRACKING RIVAL…', 'CLOSING IN…', 'CONFRONTATION…', 'MESSAGE DELIVERED'],
  record:  ['BOOTH READY…', 'TRACKING VOCALS…', 'MIXING DOWN…', 'FIRE TRACK LOCKED IN'],
};

function MissionPanel({ interactionId }: { interactionId: string }) {
  const { state, dispatch } = useGame();
  const [phase, setPhase] = useState<'info' | 'executing' | 'complete'>('info');
  const [progress, setProgress] = useState(0);
  const [stepIdx, setStepIdx] = useState(0);
  const [displayed, setDisplayed] = useState<Record<string, number>>({});
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const allInteractions = [...cityInteractionsData, ...mountainInteractionsData];
  const interaction = allInteractions.find((p) => p.id === interactionId);
  const mission = interaction?.missionId ? state.missions.find(m => m.id === interaction.missionId) : null;

  // Animate reward numbers counting up
  useEffect(() => {
    if (phase !== 'complete' || !mission) return;
    const targets = mission.rewards;
    const keys = ['money', 'fans', 'streetRep', 'industryFame', 'crewLoyalty'] as const;
    const start = Date.now();
    const duration = 1200;
    const tick = () => {
      const elapsed = Date.now() - start;
      const t = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      const next: Record<string, number> = {};
      keys.forEach(k => { next[k] = Math.round((targets[k] ?? 0) * eased); });
      setDisplayed(next);
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [phase]);

  // Cleanup interval on unmount
  useEffect(() => () => { if (intervalRef.current) clearInterval(intervalRef.current); }, []);

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
      <div className="text-center py-4">
        <div className="font-display text-2xl text-primary mb-2">✓</div>
        <h3 className="font-display text-sm mb-1 text-primary">{mission.title}</h3>
        <p className="text-[10px] text-muted-foreground">MISSION COMPLETE</p>
      </div>
    );
  }

  if (mission.locked) {
    return (
      <div>
        <div className="text-center py-3 mb-3 border border-border/40 bg-secondary/20">
          <div className="font-display text-xs text-muted-foreground mb-1">LOCKED</div>
          <div className="text-[10px] text-muted-foreground">Requires Level {mission.requiredLevel}</div>
          <div className="mt-1 text-[10px] text-primary">You are Level {state.level}</div>
          <div className="mt-2 w-full h-1 bg-secondary">
            <div className="h-full" style={{ width: `${Math.min(100, (state.level / mission.requiredLevel) * 100)}%`, background: '#00f0d0' }} />
          </div>
        </div>
        <h3 className="font-display text-xs mb-1 text-muted-foreground">{mission.title}</h3>
        <p className="text-[10px] text-muted-foreground">{mission.description}</p>
      </div>
    );
  }

  const steps = MISSION_STEPS[mission.type] ?? MISSION_STEPS.errand;
  const difficultyStars = '★'.repeat(mission.difficulty) + '☆'.repeat(5 - mission.difficulty);

  /* Executing phase */
  if (phase === 'executing') {
    return (
      <div className="py-2">
        <div className="font-display text-xs text-primary mb-3 text-center animate-pulse">
          {steps[stepIdx] ?? 'FINALIZING…'}
        </div>
        <div className="w-full h-2 bg-secondary border border-border/40 mb-1">
          <div
            className="h-full transition-none"
            style={{ width: `${progress}%`, background: 'linear-gradient(90deg, #00f0d0, #f000b8)' }}
          />
        </div>
        <div className="text-[9px] text-muted-foreground text-right">{Math.round(progress)}%</div>
        <div className="mt-4 flex flex-wrap gap-2 text-[9px] text-muted-foreground/60">
          {mission.rewards.money > 0 && <span>+${mission.rewards.money}</span>}
          {mission.rewards.fans > 0 && <span>+{mission.rewards.fans} FANS</span>}
          {mission.rewards.streetRep > 0 && <span>+{mission.rewards.streetRep} REP</span>}
        </div>
      </div>
    );
  }

  /* Complete phase */
  if (phase === 'complete') {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="py-2">
        <div className="text-center mb-4">
          <div className="font-display text-3xl glow-text-cyan mb-1">COMPLETE</div>
          <div className="font-display text-sm text-primary">{mission.title}</div>
        </div>
        <div className="neon-line h-px mb-4 opacity-40" />
        <div className="space-y-2 mb-5">
          {(displayed.money ?? 0) > 0 && (
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">CASH</span>
              <span className="font-display text-primary">+${displayed.money ?? 0}</span>
            </div>
          )}
          {(displayed.fans ?? 0) > 0 && (
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">FANS</span>
              <span className="font-display text-accent">+{displayed.fans ?? 0}</span>
            </div>
          )}
          {(displayed.streetRep ?? 0) > 0 && (
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">STREET REP</span>
              <span className="font-display" style={{ color: '#00f0d0' }}>+{displayed.streetRep ?? 0}</span>
            </div>
          )}
          {(displayed.industryFame ?? 0) > 0 && (
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">INDUSTRY FAME</span>
              <span className="font-display" style={{ color: '#f000b8' }}>+{displayed.industryFame ?? 0}</span>
            </div>
          )}
          {(displayed.crewLoyalty ?? 0) > 0 && (
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">CREW LOYALTY</span>
              <span className="font-display" style={{ color: '#ffaa00' }}>+{displayed.crewLoyalty ?? 0}</span>
            </div>
          )}
        </div>
        <button
          onClick={() => dispatch({ type: 'SET_SHOW_PANEL', panel: null })}
          className="w-full py-2 btn-cyber font-display text-xs"
        >
          CLOSE
        </button>
      </motion.div>
    );
  }

  /* Info phase */
  const startMission = () => {
    setPhase('executing');
    setProgress(0);
    setStepIdx(0);
    const totalMs = 800 + mission.difficulty * 600;
    const tickMs = 50;
    let elapsed = 0;
    intervalRef.current = setInterval(() => {
      elapsed += tickMs;
      const pct = Math.min((elapsed / totalMs) * 100, 100);
      setProgress(pct);
      setStepIdx(Math.floor((pct / 100) * (steps.length - 1)));
      if (elapsed >= totalMs) {
        clearInterval(intervalRef.current!);
        dispatch({ type: 'COMPLETE_MISSION', missionId: mission.id });
        setPhase('complete');
      }
    }, tickMs);
  };

  return (
    <div>
      <div className="flex items-start justify-between mb-1">
        <h3 className="font-display text-sm text-primary">{mission.title}</h3>
        <span className="text-[10px] text-yellow-400/80 ml-2">{difficultyStars}</span>
      </div>
      <div className="text-[9px] text-muted-foreground mb-1 uppercase">{mission.type} · {mission.district.replace('-', ' ')}</div>
      <p className="text-[11px] text-muted-foreground mb-4 leading-relaxed">{mission.description}</p>

      <div className="grid grid-cols-2 gap-1.5 mb-4">
        {mission.rewards.money > 0 && (
          <div className="p-2 bg-secondary/30 border border-primary/20 text-center">
            <div className="font-display text-sm text-primary">+${mission.rewards.money}</div>
            <div className="text-[8px] text-muted-foreground">CASH</div>
          </div>
        )}
        {mission.rewards.fans > 0 && (
          <div className="p-2 bg-secondary/30 border border-accent/20 text-center">
            <div className="font-display text-sm text-accent">+{mission.rewards.fans}</div>
            <div className="text-[8px] text-muted-foreground">FANS</div>
          </div>
        )}
        {mission.rewards.streetRep > 0 && (
          <div className="p-2 bg-secondary/30 border border-border text-center">
            <div className="font-display text-sm" style={{ color: '#00f0d0' }}>+{mission.rewards.streetRep}</div>
            <div className="text-[8px] text-muted-foreground">REP</div>
          </div>
        )}
        {mission.rewards.industryFame > 0 && (
          <div className="p-2 bg-secondary/30 border border-border text-center">
            <div className="font-display text-sm" style={{ color: '#f000b8' }}>+{mission.rewards.industryFame}</div>
            <div className="text-[8px] text-muted-foreground">FAME</div>
          </div>
        )}
      </div>

      <button
        onClick={startMission}
        className="w-full py-2.5 btn-cyber font-display text-xs flex items-center justify-center gap-2"
      >
        <Zap className="w-3 h-3" />
        EXECUTE MISSION
      </button>
    </div>
  );
}

/* ─── Recruit Panel ─── */
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
          className="w-full py-2 btn-cyber font-display text-xs flex items-center justify-center gap-2 disabled:opacity-30"
        >
          <UserPlus className="w-3 h-3" />
          RECRUIT — $300
        </button>
      )}
    </div>
  );
}

/* ─── Info Panel ─── */
function InfoPanel({ title, text }: { title: string; text: string }) {
  return (
    <div>
      <h3 className="font-display text-sm mb-2 text-primary">{title}</h3>
      <p className="text-xs text-muted-foreground leading-relaxed">{text}</p>
    </div>
  );
}

/* ─── Citizen Panel ─── */
interface CitizenDef {
  name: string;
  title: string;
  avatar: string;
  topics: Array<{ label: string; text: string }>;
}

const CITIZEN_DATA: Record<string, CitizenDef> = {
  'citizen-1': {
    name: 'OLD MAN JAMES', title: 'Chippewa OG', avatar: '👴',
    topics: [
      { label: 'The Block', text: 'Been on 3800 Chippewa since \'78. Seen everything. Young Kentrell used to run right up and down this street as a shorty — no shoes half the time. You could see the fire in him even then. Ain\'t nobody surprised he made it.' },
      { label: 'NBA Label', text: 'Never Broke Again. That name means something real to people from here. We know what broke looks like. We lived it. When he put that name on everything, it wasn\'t just a rap label — it was a statement for the whole north side.' },
      { label: 'The Struggle', text: 'This neighborhood raised some legends. But it also took a lot of good people. That\'s the truth about 3800. The same streets that made him coulda broke him. He chose different.' },
    ],
  },
  'citizen-2': {
    name: 'KEISHA', title: 'Neighborhood Mom', avatar: '👩',
    topics: [
      { label: 'YB\'s Music', text: 'My son plays his music all day. AI YoungBoy, 4, Outside Today — I know every word now whether I want to or not. But I understand it. That pain is real. He put Baton Rouge on the map in a way that\'s hard to explain to outsiders.' },
      { label: 'Safety', text: 'I worry about my kids on these streets. But I also see the pride this community has. We look out for each other. Kentrell\'s success gave a lot of young boys something to believe in — that you can come from nothing and build something.' },
      { label: 'The Future', text: 'Change is slow here. But it\'s coming. You see the young ones now — they got ambition. They got the blueprint. NBA YoungBoy showed them: grind hard, stay loyal, never let \'em see you broke.' },
    ],
  },
  'citizen-3': {
    name: 'CORNROW KENNY', title: 'Corner Store Owner', avatar: '🧔',
    topics: [
      { label: 'Back in the Day', text: 'I had this store when Kentrell was coming up. He\'d come in here with no money and I\'d let him grab something anyway. Told him one day he\'d pay it back. Years later, he sent somebody by here with a envelope. More than I ever expected.' },
      { label: 'The Rap Game', text: 'He went from these corners to platinum records. Dropped mixtapes from jail, dropped albums from the studio, never stopped. That work ethic — that\'s Baton Rouge. We don\'t take days off down here.' },
      { label: 'Street Code', text: 'Out here there\'s rules. You respect the people who was here before you. You take care of your own. You don\'t switch up when things get good. YB never forgot where he came from. That\'s why he still got love on these blocks.' },
    ],
  },
  'citizen-4': {
    name: 'DEON', title: 'NBA Superfan', avatar: '🎧',
    topics: [
      { label: 'Favorite Songs', text: 'Outside Today hit different when it dropped. Then Murder Business, Drawing Symbols, Lonely Child — bro is the most consistent rapper out of Louisiana. Period. I got every tape, every feature, every freestyle. The catalog is unmatched.' },
      { label: 'YB vs The World', text: 'He been fighting since day one. Charges, court dates, labels trying to own him, internet haters — he just keep dropping fire. AI YoungBoy 2 went #1 while he was locked up. That don\'t happen for everybody.' },
      { label: 'The Come Up', text: 'Started with mixtapes on DatPiff. Lost his grandma, lost friends, had his first kid young. All of that went into the music. That\'s why it hits so hard — it\'s not performance. It\'s documentation.' },
    ],
  },
  'citizen-5': {
    name: 'BIG ROME', title: 'Block Captain', avatar: '💪',
    topics: [
      { label: 'Respect', text: 'You want respect on these streets, you earn it. Not by talking. By showing up, day after day, handling business, taking care of your people. That\'s what YB did. That\'s what this block expects from anyone trying to run something.' },
      { label: 'Rivalries', text: 'Competition is healthy. Beef is wasteful. Real ones know the difference. You build your empire by outworking everybody else, not by tearing them down. Keep your eyes on your own paper.' },
      { label: 'The Game', text: 'I seen dudes come and go. The ones who last have one thing: loyalty. To the block, to the people who was with them from nothing. Flip on your people for a come-up and you\'ll fall alone. Ride for yours and they\'ll ride for you.' },
    ],
  },
  'citizen-6': {
    name: 'UNCLE JEROME', title: 'OG from the North Side', avatar: '🧓',
    topics: [
      { label: 'The Early Days', text: 'I knew his people. Real solid family. When Kentrell started making noise in these streets, wasn\'t nobody surprised. That boy had hunger in his eyes from the jump. Ain\'t nothing manufactured about him — he\'s the real product of this environment.' },
      { label: 'Prison System', text: 'This system was designed to keep us down. You make a mistake at seventeen, they want to take your whole life. Kentrell came out stronger every time. Used the time to write, to think, to build. That\'s rare mental strength.' },
      { label: 'Legacy', text: 'Legacy ain\'t about hit records. It\'s about what you gave back. Did you uplift your community? Did the next generation have something better because you existed? That\'s the real measure. He\'s building toward something real.' },
    ],
  },
  'citizen-7': {
    name: 'LIL TRAVIS', title: 'Trap Boy', avatar: '🧢',
    topics: [
      { label: 'The Grind', text: 'Ain\'t no shortcuts, bro. Every dime I got cost me something. YB said it best — life is a gamble. You put in the work, take the risk, and pray the reward comes. Sometimes it do. Sometimes you gotta bet again.' },
      { label: 'Music & Hustle', text: 'Rap game is just another hustle with different rules. You still gotta move smart. YB built NBA like a real business — merchandise, shows, streaming, label deals. That\'s not luck, that\'s strategy.' },
      { label: 'North Side Pride', text: '3800 til I die. This block built something bigger than any of us individually. When one of ours wins, we all win. Keep that mentality and watch how far we go.' },
    ],
  },
  'citizen-8': {
    name: 'QUIET MIKE', title: 'Mysterious Figure', avatar: '🕶️',
    topics: [
      { label: '...', text: '...' },
      { label: 'The Shadows', text: 'I see everything that happens on this block. Who comes, who goes, who switches. You\'d be surprised what people do when they think nobody\'s watching. I\'m always watching.' },
      { label: 'Warning', text: 'Be careful what you build here. Success attracts attention — the kind you want and the kind you don\'t. Watch who you let close. The biggest threats always come from the inside.' },
    ],
  },
  'citizen-9': {
    name: 'AALIYAH', title: 'Neighborhood Girl', avatar: '👸',
    topics: [
      { label: 'The Block Life', text: 'Growing up here teaches you to read people fast. You learn who\'s real and who\'s performing. YB never performed — everything in his music is straight from his chest. That authenticity is rare and people feel it.' },
      { label: 'Beyond Rap', text: 'He\'s a father first, above everything. That\'s something people miss about him. All those kids, he takes care of them. That\'s real character — what you do when the cameras aren\'t on.' },
      { label: 'Dreams', text: 'This block doesn\'t have to define your ceiling. It can be your foundation. That\'s the lesson. Where you\'re from is your story, not your sentence. Build from here. Go anywhere.' },
    ],
  },
  'citizen-10': {
    name: 'DJ SMOKE', title: 'Block DJ', avatar: '🎵',
    topics: [
      { label: 'The Sound', text: 'Baton Rouge has its own lane in hip-hop. Lil Boosie laid the foundation. Kevin Gates expanded it. YB took it to a different level. That melodic style over hard beats — it\'s a whole sub-genre at this point.' },
      { label: 'Best Projects', text: 'I\'d tell you AI YoungBoy 2 is the peak, but then I spin 4 and change my mind. Sincerely Kentrell showed another dimension. The range is what separates him. He can rap circles around most, then turn around and make something that makes your chest hurt.' },
      { label: 'NBA Artists', text: 'He built a roster too. Quando Rondo, BlocBoy JB, Quando — whole crew eating. That\'s what it means to be Never Broke Again. Not just you — everybody around you eats. That\'s empire building.' },
    ],
  },
};

function CitizenPanel({ citizenId }: { citizenId: string }) {
  const citizen = CITIZEN_DATA[citizenId] ?? {
    name: 'STRANGER', title: 'UNKNOWN', avatar: '👤',
    topics: [
      { label: 'Hey', text: '"Keep it moving. Nothing to say."' },
    ],
  };
  const [activeIdx, setActiveIdx] = useState(0);

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <span className="text-2xl">{citizen.avatar}</span>
        <div>
          <h3 className="font-display text-sm text-primary">{citizen.name}</h3>
          <span className="text-[9px] text-muted-foreground">{citizen.title} · 3800 CHIPPEWA</span>
        </div>
      </div>
      <div style={{ height: '1px', background: 'linear-gradient(90deg, #00f0d0, transparent)', marginBottom: '12px', opacity: 0.4 }} />

      {/* Topic selector */}
      <div className="flex gap-1.5 flex-wrap mb-3">
        {citizen.topics.map((t, i) => (
          <button
            key={i}
            onClick={() => setActiveIdx(i)}
            className="px-2 py-0.5 text-[9px] font-display border transition-colors"
            style={{
              borderColor: activeIdx === i ? '#00f0d0' : 'rgba(255,255,255,0.15)',
              color: activeIdx === i ? '#00f0d0' : 'rgba(255,255,255,0.5)',
              background: activeIdx === i ? 'rgba(0,240,208,0.08)' : 'transparent',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Response */}
      <div className="bg-secondary/30 border border-border/40 p-4 mb-4 min-h-[90px]">
        <p className="text-xs text-foreground leading-relaxed">{citizen.topics[activeIdx].text}</p>
      </div>

      <div className="text-[8px] text-muted-foreground/40 text-center">ESC · WALK AWAY</div>
    </div>
  );
}

/* ─── Stat Bar ─── */
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
