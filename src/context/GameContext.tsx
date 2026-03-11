import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { GameState, GameSection, CrewMember, VehicleCustomization } from '@/types/game';
import { loadGameState, saveGameState, initialGameState } from '@/data/gameData';
import { MUSIC_CATALOG, VEHICLES, WEAPONS, TOOLS } from '@/data/storeData';

type GameAction =
  | { type: 'SET_SECTION'; section: GameSection }
  | { type: 'COMPLETE_MISSION'; missionId: string }
  | { type: 'RECORD_SONG'; songId: string }
  | { type: 'RECRUIT_MEMBER'; member: CrewMember }
  | { type: 'RESET_GAME' }
  | { type: 'UNLOCK_MISSIONS' }
  | { type: 'SET_REGION'; region: 'city' | 'mountain' }
  | { type: 'SET_NEAR_INTERACTION'; interaction: { type: string; id: string; label: string } | null }
  | { type: 'SET_SHOW_PANEL'; panel: string | null }
  | { type: 'ADD_MONEY'; amount: number }
  | { type: 'UPDATE_COLD'; delta: number }
  | { type: 'CHAT_WITH_CHARACTER'; characterId: string }
  | { type: 'BOOST_RELATIONSHIP'; characterId: string; amount: number }
  | { type: 'RECRUIT_CHARACTER'; characterId: string }
  | { type: 'TOGGLE_CHARACTER_FOLLOW'; characterId: string }
  | { type: 'BUY_VEHICLE'; vehicleId: string }
  | { type: 'SET_ACTIVE_VEHICLE'; vehicleId: string | null }
  | { type: 'BUY_WEAPON'; weaponId: string }
  | { type: 'EQUIP_WEAPON'; weaponId: string | null }
  | { type: 'BUY_MUSIC'; albumId: string }
  | { type: 'BUY_TOOL'; toolId: string }
  | { type: 'EQUIP_TOOL'; toolId: string | null }
  | { type: 'CUSTOMIZE_VEHICLE'; vehicleId: string; customization: Partial<VehicleCustomization> }
  | { type: 'MUSIC_PLAY'; albumId: string; trackIndex: number }
  | { type: 'MUSIC_PAUSE' }
  | { type: 'MUSIC_NEXT' }
  | { type: 'MUSIC_PREV' }
  | { type: 'MUSIC_TOGGLE_SHUFFLE' }
  | { type: 'MUSIC_TOGGLE_REPEAT' };

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

function updateCharState(state: GameState, charId: string, update: Partial<GameState['characterStates'][string]>): GameState {
  const current = state.characterStates[charId];
  if (!current) return state;
  return {
    ...state,
    characterStates: {
      ...state.characterStates,
      [charId]: { ...current, ...update },
    },
  };
}

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'SET_SECTION':
      return { ...state, activeSection: action.section };

    case 'SET_REGION':
      return { ...state, currentRegion: action.region, showPanel: null, nearInteraction: null };

    case 'SET_NEAR_INTERACTION':
      return { ...state, nearInteraction: action.interaction };

    case 'SET_SHOW_PANEL':
      return { ...state, showPanel: action.panel };

    case 'ADD_MONEY':
      return { ...state, money: state.money + action.amount };

    case 'UPDATE_COLD':
      return { ...state, coldMeter: Math.max(0, Math.min(100, state.coldMeter + action.delta)) };

    case 'CHAT_WITH_CHARACTER': {
      const cs = state.characterStates[action.characterId];
      if (!cs) return state;
      return updateCharState(state, action.characterId, {
        relationship: Math.min(100, cs.relationship + 3),
        xp: cs.xp + 5,
      });
    }

    case 'BOOST_RELATIONSHIP': {
      const cs = state.characterStates[action.characterId];
      if (!cs) return state;
      return updateCharState(state, action.characterId, {
        relationship: Math.min(100, cs.relationship + action.amount),
        xp: cs.xp + 10,
        level: cs.xp + 10 >= cs.level * 50 ? cs.level + 1 : cs.level,
      });
    }

    case 'RECRUIT_CHARACTER': {
      if (state.money < 300) return state;
      return {
        ...updateCharState(state, action.characterId, { isRecruited: true }),
        money: state.money - 300,
        showPanel: null,
      };
    }

    case 'TOGGLE_CHARACTER_FOLLOW': {
      const cs = state.characterStates[action.characterId];
      if (!cs || !cs.isRecruited) return state;
      return {
        ...updateCharState(state, action.characterId, { isFollowing: !cs.isFollowing }),
        showPanel: null,
      };
    }

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
        showPanel: null,
      };

      const newLevel = Math.floor(newState.completedMissions / 2) + 1;
      newState.level = Math.max(state.level, newLevel);

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
        showPanel: null,
      };
    }

    case 'RECRUIT_MEMBER':
      if (state.money < 300) return state;
      return {
        ...state,
        money: state.money - 300,
        crew: [...state.crew, { ...action.member, recruited: true }],
        showPanel: null,
      };

    case 'BUY_VEHICLE': {
      const vehicle = VEHICLES.find(v => v.id === action.vehicleId);
      if (!vehicle || state.money < vehicle.price || state.ownedVehicles.includes(action.vehicleId)) return state;
      return {
        ...state,
        money: state.money - vehicle.price,
        ownedVehicles: [...state.ownedVehicles, action.vehicleId],
        vehicleCustomizations: {
          ...state.vehicleCustomizations,
          [action.vehicleId]: { ...vehicle.customization },
        },
      };
    }

    case 'SET_ACTIVE_VEHICLE':
      return { ...state, activeVehicle: action.vehicleId };

    case 'CUSTOMIZE_VEHICLE': {
      const current = state.vehicleCustomizations[action.vehicleId];
      if (!current) return state;
      return {
        ...state,
        vehicleCustomizations: {
          ...state.vehicleCustomizations,
          [action.vehicleId]: { ...current, ...action.customization },
        },
      };
    }

    case 'BUY_WEAPON': {
      const weapon = WEAPONS.find(w => w.id === action.weaponId);
      if (!weapon || state.money < weapon.price || state.ownedWeapons.includes(action.weaponId)) return state;
      return {
        ...state,
        money: state.money - weapon.price,
        ownedWeapons: [...state.ownedWeapons, action.weaponId],
      };
    }

    case 'EQUIP_WEAPON':
      return { ...state, equippedWeapon: action.weaponId };

    case 'BUY_TOOL': {
      const tool = TOOLS.find(t => t.id === action.toolId);
      if (!tool || state.money < tool.price || state.ownedTools.includes(action.toolId)) return state;
      return {
        ...state,
        money: state.money - tool.price,
        ownedTools: [...state.ownedTools, action.toolId],
      };
    }

    case 'EQUIP_TOOL':
      return { ...state, equippedTool: action.toolId };

    case 'BUY_MUSIC': {
      const album = MUSIC_CATALOG.find(a => a.id === action.albumId);
      if (!album || state.money < album.price || state.ownedMusic.includes(action.albumId)) return state;
      return {
        ...state,
        money: state.money - album.price,
        fans: state.fans + album.fansBoost,
        industryFame: Math.min(100, state.industryFame + album.fameBoost),
        ownedMusic: [...state.ownedMusic, action.albumId],
      };
    }

    // Music Player
    case 'MUSIC_PLAY':
      return {
        ...state,
        musicPlayer: { ...state.musicPlayer, isPlaying: true, currentAlbumId: action.albumId, currentTrackIndex: action.trackIndex },
      };

    case 'MUSIC_PAUSE':
      return {
        ...state,
        musicPlayer: { ...state.musicPlayer, isPlaying: !state.musicPlayer.isPlaying },
      };

    case 'MUSIC_NEXT': {
      const mp = state.musicPlayer;
      if (!mp.currentAlbumId) return state;
      const alb = MUSIC_CATALOG.find(a => a.id === mp.currentAlbumId);
      if (!alb) return state;
      const nextIdx = mp.shuffle
        ? Math.floor(Math.random() * alb.tracks.length)
        : (mp.currentTrackIndex + 1) % alb.tracks.length;
      return { ...state, musicPlayer: { ...mp, currentTrackIndex: nextIdx, isPlaying: true } };
    }

    case 'MUSIC_PREV': {
      const mp = state.musicPlayer;
      if (!mp.currentAlbumId) return state;
      const alb = MUSIC_CATALOG.find(a => a.id === mp.currentAlbumId);
      if (!alb) return state;
      const prevIdx = mp.currentTrackIndex > 0 ? mp.currentTrackIndex - 1 : alb.tracks.length - 1;
      return { ...state, musicPlayer: { ...mp, currentTrackIndex: prevIdx, isPlaying: true } };
    }

    case 'MUSIC_TOGGLE_SHUFFLE':
      return { ...state, musicPlayer: { ...state.musicPlayer, shuffle: !state.musicPlayer.shuffle } };

    case 'MUSIC_TOGGLE_REPEAT':
      return { ...state, musicPlayer: { ...state.musicPlayer, repeat: !state.musicPlayer.repeat } };

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
