import { useState, useEffect, useCallback } from 'react';
import { useGame } from '@/context/GameContext';
import { CHARACTERS, getRelationshipLevel, getRelationshipTier } from '@/data/characters';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Zap, UserPlus, MessageCircle, Footprints, Hand } from 'lucide-react';

export function DialoguePanel() {
  const { state, dispatch } = useGame();

  if (!state.showPanel || !state.showPanel.startsWith('dialogue:')) return null;

  const charId = state.showPanel.split(':')[1];
  const character = CHARACTERS.find(c => c.id === charId);
  const charState = state.characterStates[charId];

  if (!character || !charState) return null;

  const close = () => dispatch({ type: 'SET_SHOW_PANEL', panel: null });
  const tier = getRelationshipTier(charState.relationship);
  const relLevel = getRelationshipLevel(charState.relationship);
  const canRecruit = charState.relationship >= character.recruitThreshold;
  const mission = state.missions.find(m => m.id === character.missionId);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-end justify-center pb-8 pointer-events-auto"
        style={{ background: 'linear-gradient(transparent 40%, rgba(0,0,0,0.85) 100%)' }}
      >
        <motion.div
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 40, opacity: 0 }}
          className="w-full max-w-2xl mx-4"
        >
          {/* Character info header */}
          <div className="flex items-center gap-4 mb-3">
            {/* Avatar */}
            <div
              className="w-14 h-14 border-2 flex items-center justify-center"
              style={{ borderColor: character.visual.accentColor, background: character.visual.bodyColor }}
            >
              <div
                className="w-6 h-6 rounded-sm"
                style={{ background: character.visual.skinColor }}
              />
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-display text-sm" style={{ color: character.visual.accentColor }}>
                  {character.name}
                </span>
                <span className="text-[9px] text-muted-foreground">— {character.title}</span>
              </div>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-[9px] text-muted-foreground">{relLevel}</span>
                <div className="w-24 h-1 bg-secondary">
                  <div
                    className="h-full transition-all duration-500"
                    style={{
                      width: `${charState.relationship}%`,
                      background: charState.relationship > 60 ? '#44ff44' : charState.relationship > 30 ? '#FFD700' : '#ff4444',
                    }}
                  />
                </div>
                <span className="text-[9px] text-muted-foreground">LVL {charState.level}</span>
              </div>
            </div>

            <button onClick={close} className="text-muted-foreground hover:text-primary transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Dialogue box */}
          <div className="panel border border-border p-4 mb-3">
            <p className="text-xs leading-relaxed text-foreground">
              "{character.dialogue.greeting[tier]}"
            </p>
          </div>

          {/* Abilities */}
          <div className="flex gap-2 mb-3">
            {character.abilities.map(a => (
              <div key={a.name} className="text-[8px] px-2 py-1 bg-secondary border border-border text-muted-foreground">
                {a.name}: {a.desc}
              </div>
            ))}
          </div>

          {/* Response options */}
          <div className="grid grid-cols-2 gap-2">
            {/* Chat */}
            <DialogueOption
              icon={<MessageCircle className="w-3 h-3" />}
              label="CHAT"
              description="Build relationship"
              onClick={() => {
                dispatch({ type: 'CHAT_WITH_CHARACTER', characterId: charId });
              }}
              color={character.visual.accentColor}
            />

            {/* Mission */}
            {mission && !mission.completed && !mission.locked && (
              <DialogueOption
                icon={<Zap className="w-3 h-3" />}
                label={`MISSION: ${mission.title}`}
                description={`$${mission.rewards.money} · +${mission.rewards.fans} fans`}
                onClick={() => {
                  dispatch({ type: 'COMPLETE_MISSION', missionId: mission.id });
                  dispatch({ type: 'BOOST_RELATIONSHIP', characterId: charId, amount: 10 });
                }}
                color="#F000B8"
              />
            )}

            {mission && mission.completed && (
              <div className="p-3 bg-secondary/30 border border-border text-[10px] text-muted-foreground flex items-center gap-2">
                <Zap className="w-3 h-3" /> MISSION COMPLETE
              </div>
            )}

            {/* Recruit / Follow */}
            {!charState.isRecruited ? (
              <DialogueOption
                icon={<UserPlus className="w-3 h-3" />}
                label="RECRUIT"
                description={canRecruit ? 'Join the crew — $300' : `Need ${character.recruitThreshold} relationship`}
                onClick={() => {
                  if (canRecruit && state.money >= 300) {
                    dispatch({ type: 'RECRUIT_CHARACTER', characterId: charId });
                  }
                }}
                disabled={!canRecruit || state.money < 300}
                color="#44ff44"
              />
            ) : (
              <DialogueOption
                icon={<Footprints className="w-3 h-3" />}
                label={charState.isFollowing ? 'WAIT HERE' : 'FOLLOW ME'}
                description={charState.isFollowing ? character.dialogue.followStop : character.dialogue.followStart}
                onClick={() => {
                  dispatch({ type: 'TOGGLE_CHARACTER_FOLLOW', characterId: charId });
                }}
                color={character.visual.accentColor}
              />
            )}

            {/* Leave */}
            <DialogueOption
              icon={<Hand className="w-3 h-3" />}
              label="LEAVE"
              description="End conversation"
              onClick={close}
              color="#666"
            />
          </div>

          {/* Personality traits */}
          <div className="flex gap-2 mt-3">
            {character.personality.map(trait => (
              <span key={trait} className="text-[8px] text-muted-foreground/60 uppercase">{trait}</span>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function DialogueOption({ icon, label, description, onClick, color = '#F000B8', disabled = false }: {
  icon: React.ReactNode;
  label: string;
  description: string;
  onClick: () => void;
  color?: string;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="p-3 bg-card border border-border text-left transition-all hover:border-primary/40 disabled:opacity-30 disabled:cursor-not-allowed group"
    >
      <div className="flex items-center gap-2 mb-1">
        <span style={{ color }}>{icon}</span>
        <span className="font-display text-[10px]">{label}</span>
      </div>
      <p className="text-[9px] text-muted-foreground leading-snug">{description}</p>
    </button>
  );
}
