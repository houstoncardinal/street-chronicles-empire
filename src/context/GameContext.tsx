import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { GameState, GameSection, CrewMember } from '@/types/game';
import { loadGameState, saveGameState, initialGameState } from '@/data/gameData';

type GameAction =
  | { type: 'SET_SECTION'; section: GameSection }
  | { type: 'COMPLETE_MISSION'; missionId: string }
  | { type: 'RECORD_SONG'; songId: string }
  | { type: 'RECRUIT_MEMBER'; member: CrewMember }
  | { type: 'RESET_GAME' }
  | { type: 'UNLOCK_MISSIONS' };

function unlockMissions(state: GameState): GameState {
  const missions = state.missions.map(m => ({
    ...m,
    locked: m.requiredLevel > state.level,
  }));
  const districts = state.districts.map(d => {
    const hasMission = missions.some(m => m.district === d.id && !m.locked);
    return { ...d, unlocked: d.unlocked || hasMission };
  });
  return { ...state, missions, districts };
}

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'SET_SECTION':
      return { ...state, activeSection: action.section };

    case 'COMPLETE_MISSION': {
      const mission = state.missions.find(m => m.id === action.missionId);
      if (!mission || mission.completed) return state;

      const newState: GameState = {
        ...state,
        money: state.money + mission.rewards.money,
        fans: state.fans + mission.rewards.fans,
        streetRep: Math.min(100, state.streetRep + mission.rewards.streetRep),
        industryFame: Math.min(100, state.industryFame + mission.rewards.industryFame),
        crewLoyalty: Math.min(100, state.crewLoyalty + mission.rewards.crewLoyalty),
        completedMissions: state.completedMissions + 1,
        missions: state.missions.map(m =>
          m.id === action.missionId ? { ...m, completed: true } : m
        ),
      };

      // Level up every 2 completed missions
      const newLevel = Math.floor(newState.completedMissions / 2) + 1;
      newState.level = Math.max(state.level, newLevel);

      // Update territory control
      const district = newState.districts.find(d => d.id === mission.district);
      if (district) {
        newState.districts = newState.districts.map(d =>
          d.id === mission.district
            ? { ...d, controlPercent: Math.min(100, d.controlPercent + 20), controlled: d.controlPercent + 20 >= 50, color: '#F000B8' }
            : d
        );
      }

      return unlockMissions(newState);
    }

    case 'RECORD_SONG': {
      const song = state.songs.find(s => s.id === action.songId);
      if (!song || song.recorded) return state;
      const cost = song.type === 'mixtape' ? 500 : 200;
      if (state.money < cost) return state;

      return {
        ...state,
        money: state.money - cost,
        fans: state.fans + song.fans,
        industryFame: Math.min(100, state.industryFame + song.fame),
        songs: state.songs.map(s =>
          s.id === action.songId ? { ...s, recorded: true } : s
        ),
      };
    }

    case 'RECRUIT_MEMBER':
      if (state.money < 300) return state;
      return {
        ...state,
        money: state.money - 300,
        crew: [...state.crew, { ...action.member, recruited: true }],
      };

    case 'RESET_GAME':
      return { ...initialGameState };

    case 'UNLOCK_MISSIONS':
      return unlockMissions(state);

    default:
      return state;
  }
}

const GameContext = createContext<{
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
} | null>(null);

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, loadGameState());

  useEffect(() => {
    saveGameState(state);
  }, [state]);

  useEffect(() => {
    dispatch({ type: 'UNLOCK_MISSIONS' });
  }, []);

  return (
    <GameContext.Provider value={{ state, dispatch }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be inside GameProvider');
  return ctx;
}
