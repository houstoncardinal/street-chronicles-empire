import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { GameState, GameSection, CrewMember, VehicleCustomization } from '@/types/game';
import { loadGameState, saveGameState, initialGameState } from '@/data/gameData';
import { MUSIC_CATALOG, VEHICLES, WEAPONS, TOOLS } from '@/data/storeData';
import { CAFE_ITEMS, DRUGS } from '@/data/cyberData';

type GameAction =
  | { type: 'SET_SECTION'; section: GameSection }
  | { type: 'COMPLETE_MISSION'; missionId: string }
  | { type: 'RECORD_SONG'; songId: string }
  | { type: 'RECRUIT_MEMBER'; member: CrewMember }
  | { type: 'RESET_GAME' }
  | { type: 'UNLOCK_MISSIONS' }
  | { type: 'SET_REGION'; region: 'city' | 'mountain' | 'bayou' }
  | { type: 'SET_PLAYER_CHARACTER'; characterId: string }
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
  | { type: 'MUSIC_TOGGLE_REPEAT' }
  // ── Cyberpunk ──────────────────────────────────────────────────────────────
  | { type: 'TAKE_DAMAGE'; amount: number }
  | { type: 'HEAL'; amount: number }
  | { type: 'SHOOT'; weaponId: string }
  | { type: 'RELOAD'; weaponId: string }
  | { type: 'REGISTER_KILL' }
  | { type: 'SET_IN_VEHICLE'; value: boolean }
  | { type: 'SET_WANTED'; level: number }
  | { type: 'INC_WANTED' }
  | { type: 'DEC_WANTED' }
  | { type: 'BUY_DRUG'; drugId: string; qty: number }
  | { type: 'SELL_DRUG'; drugId: string; qty: number }
  | { type: 'UPDATE_DRUG_HEAT'; delta: number }
  | { type: 'BUY_CAFE_ITEM'; itemId: string }
  | { type: 'TICK_BUFFS' }
  | { type: 'SET_INTERIOR'; interiorId: string | null };

function unlockMissions(state: GameState): GameState {
  const missions = state.missions.map(m => ({ ...m, locked: m.requiredLevel > state.level }));
  const districts = state.districts.map(d => {
    const hasMission = missions.some(m => m.district === d.id && !m.locked);
    return { ...d, unlocked: d.unlocked || hasMission };
  });
  return { ...state, missions, districts };
}

function updateCharState(state: GameState, charId: string, update: Partial<GameState['characterStates'][string]>): GameState {
  const current = state.characterStates[charId];
  if (!current) return state;
  return { ...state, characterStates: { ...state.characterStates, [charId]: { ...current, ...update } } };
}

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {

    case 'SET_SECTION': return { ...state, activeSection: action.section };
    case 'SET_REGION': return { ...state, currentRegion: action.region, showPanel: null, nearInteraction: null };
    case 'SET_NEAR_INTERACTION': return { ...state, nearInteraction: action.interaction };
    case 'SET_SHOW_PANEL': return { ...state, showPanel: action.panel };
    case 'ADD_MONEY': return { ...state, money: state.money + action.amount };
    case 'UPDATE_COLD': return { ...state, coldMeter: Math.max(0, Math.min(100, state.coldMeter + action.delta)) };

    case 'CHAT_WITH_CHARACTER': {
      const cs = state.characterStates[action.characterId];
      if (!cs) return state;
      return updateCharState(state, action.characterId, { relationship: Math.min(100, cs.relationship + 3), xp: cs.xp + 5 });
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
      return { ...updateCharState(state, action.characterId, { isRecruited: true }), money: state.money - 300, showPanel: null };
    }

    case 'TOGGLE_CHARACTER_FOLLOW': {
      const cs = state.characterStates[action.characterId];
      if (!cs || !cs.isRecruited) return state;
      return { ...updateCharState(state, action.characterId, { isFollowing: !cs.isFollowing }), showPanel: null };
    }

    case 'COMPLETE_MISSION': {
      const mission = state.missions.find(m => m.id === action.missionId);
      if (!mission || mission.completed) return state;
      const ns: GameState = {
        ...state,
        money: state.money + mission.rewards.money,
        fans: state.fans + mission.rewards.fans,
        streetRep: Math.min(100, state.streetRep + mission.rewards.streetRep),
        industryFame: Math.min(100, state.industryFame + mission.rewards.industryFame),
        crewLoyalty: Math.min(100, state.crewLoyalty + mission.rewards.crewLoyalty),
        completedMissions: state.completedMissions + 1,
        missions: state.missions.map(m => m.id === action.missionId ? { ...m, completed: true } : m),
        showPanel: null,
      };
      ns.level = Math.max(state.level, Math.floor(ns.completedMissions / 2) + 1);
      if (state.districts.find(d => d.id === mission.district)) {
        ns.districts = ns.districts.map(d =>
          d.id === mission.district
            ? { ...d, controlPercent: Math.min(100, d.controlPercent + 20), controlled: d.controlPercent + 20 >= 50, color: '#00f0d0' }
            : d
        );
      }
      return unlockMissions(ns);
    }

    case 'RECORD_SONG': {
      const song = state.songs.find(s => s.id === action.songId);
      if (!song || song.recorded) return state;
      const cost = song.type === 'mixtape' ? 500 : 200;
      if (state.money < cost) return state;
      return { ...state, money: state.money - cost, fans: state.fans + song.fans, industryFame: Math.min(100, state.industryFame + song.fame), songs: state.songs.map(s => s.id === action.songId ? { ...s, recorded: true } : s), showPanel: null };
    }

    case 'RECRUIT_MEMBER':
      if (state.money < 300) return state;
      return { ...state, money: state.money - 300, crew: [...state.crew, { ...action.member, recruited: true }], showPanel: null };

    case 'BUY_VEHICLE': {
      const vehicle = VEHICLES.find(v => v.id === action.vehicleId);
      if (!vehicle || state.money < vehicle.price || state.ownedVehicles.includes(action.vehicleId)) return state;
      return { ...state, money: state.money - vehicle.price, ownedVehicles: [...state.ownedVehicles, action.vehicleId], vehicleCustomizations: { ...state.vehicleCustomizations, [action.vehicleId]: { ...vehicle.customization } } };
    }

    case 'SET_ACTIVE_VEHICLE': return { ...state, activeVehicle: action.vehicleId };

    case 'CUSTOMIZE_VEHICLE': {
      const current = state.vehicleCustomizations[action.vehicleId];
      if (!current) return state;
      return { ...state, vehicleCustomizations: { ...state.vehicleCustomizations, [action.vehicleId]: { ...current, ...action.customization } } };
    }

    case 'BUY_WEAPON': {
      const weapon = WEAPONS.find(w => w.id === action.weaponId);
      if (!weapon || state.money < weapon.price || state.ownedWeapons.includes(action.weaponId)) return state;
      return { ...state, money: state.money - weapon.price, ownedWeapons: [...state.ownedWeapons, action.weaponId], ammo: { ...state.ammo, [action.weaponId]: weapon.ammoCapacity } };
    }

    case 'EQUIP_WEAPON': return { ...state, equippedWeapon: action.weaponId };
    case 'BUY_TOOL': {
      const tool = TOOLS.find(t => t.id === action.toolId);
      if (!tool || state.money < tool.price || state.ownedTools.includes(action.toolId)) return state;
      return { ...state, money: state.money - tool.price, ownedTools: [...state.ownedTools, action.toolId] };
    }
    case 'EQUIP_TOOL': return { ...state, equippedTool: action.toolId };

    case 'BUY_MUSIC': {
      const album = MUSIC_CATALOG.find(a => a.id === action.albumId);
      if (!album || state.money < album.price || state.ownedMusic.includes(action.albumId)) return state;
      return { ...state, money: state.money - album.price, fans: state.fans + album.fansBoost, industryFame: Math.min(100, state.industryFame + album.fameBoost), ownedMusic: [...state.ownedMusic, action.albumId] };
    }

    case 'MUSIC_PLAY': return { ...state, musicPlayer: { ...state.musicPlayer, isPlaying: true, currentAlbumId: action.albumId, currentTrackIndex: action.trackIndex } };
    case 'MUSIC_PAUSE': return { ...state, musicPlayer: { ...state.musicPlayer, isPlaying: !state.musicPlayer.isPlaying } };
    case 'MUSIC_NEXT': {
      const mp = state.musicPlayer;
      if (!mp.currentAlbumId) return state;
      const alb = MUSIC_CATALOG.find(a => a.id === mp.currentAlbumId);
      if (!alb) return state;
      const idx = mp.shuffle ? Math.floor(Math.random() * alb.tracks.length) : (mp.currentTrackIndex + 1) % alb.tracks.length;
      return { ...state, musicPlayer: { ...mp, currentTrackIndex: idx, isPlaying: true } };
    }
    case 'MUSIC_PREV': {
      const mp = state.musicPlayer;
      if (!mp.currentAlbumId) return state;
      const alb = MUSIC_CATALOG.find(a => a.id === mp.currentAlbumId);
      if (!alb) return state;
      const idx = mp.currentTrackIndex > 0 ? mp.currentTrackIndex - 1 : alb.tracks.length - 1;
      return { ...state, musicPlayer: { ...mp, currentTrackIndex: idx, isPlaying: true } };
    }
    case 'MUSIC_TOGGLE_SHUFFLE': return { ...state, musicPlayer: { ...state.musicPlayer, shuffle: !state.musicPlayer.shuffle } };
    case 'MUSIC_TOGGLE_REPEAT': return { ...state, musicPlayer: { ...state.musicPlayer, repeat: !state.musicPlayer.repeat } };

    // ── Cyberpunk ────────────────────────────────────────────────────────────

    case 'TAKE_DAMAGE': return { ...state, health: Math.max(0, state.health - action.amount) };
    case 'HEAL': return { ...state, health: Math.min(state.maxHealth, state.health + action.amount) };

    case 'SHOOT': {
      const cur = state.ammo[action.weaponId] ?? 0;
      if (cur <= 0) return state;
      return { ...state, ammo: { ...state.ammo, [action.weaponId]: cur - 1 }, totalShots: state.totalShots + 1 };
    }

    case 'RELOAD': {
      const weapon = WEAPONS.find(w => w.id === action.weaponId);
      if (!weapon) return state;
      return { ...state, ammo: { ...state.ammo, [action.weaponId]: weapon.ammoCapacity } };
    }

    case 'REGISTER_KILL': return { ...state, totalKills: state.totalKills + 1 };
    case 'SET_IN_VEHICLE': return { ...state, isInVehicle: action.value };
    case 'SET_WANTED': return { ...state, wantedLevel: Math.max(0, Math.min(5, action.level)) };
    case 'INC_WANTED': return { ...state, wantedLevel: Math.min(5, state.wantedLevel + 1) };
    case 'DEC_WANTED': return { ...state, wantedLevel: Math.max(0, state.wantedLevel - 1) };

    case 'BUY_DRUG': {
      const drug = DRUGS.find(d => d.id === action.drugId);
      if (!drug) return state;
      const cost = drug.buyPrice * action.qty;
      if (state.money < cost) return state;
      return {
        ...state,
        money: state.money - cost,
        drugInventory: { ...state.drugInventory, [action.drugId]: (state.drugInventory[action.drugId] || 0) + action.qty },
        drugHeat: Math.min(100, state.drugHeat + drug.riskLevel * action.qty),
      };
    }

    case 'SELL_DRUG': {
      const drug = DRUGS.find(d => d.id === action.drugId);
      if (!drug) return state;
      const held = state.drugInventory[action.drugId] || 0;
      if (held < action.qty) return state;
      const mult = drug.sellMultiplierMin + Math.random() * (drug.sellMultiplierMax - drug.sellMultiplierMin);
      const earned = Math.floor(drug.buyPrice * mult * action.qty);
      const newHeld = held - action.qty;
      const inv = { ...state.drugInventory };
      if (newHeld <= 0) delete inv[action.drugId]; else inv[action.drugId] = newHeld;
      return {
        ...state,
        money: state.money + earned,
        drugInventory: inv,
        streetRep: Math.min(100, state.streetRep + drug.riskLevel),
        wantedLevel: Math.min(5, state.wantedLevel + (drug.tier >= 3 ? 1 : 0)),
      };
    }

    case 'UPDATE_DRUG_HEAT': return { ...state, drugHeat: Math.max(0, Math.min(100, state.drugHeat + action.delta)) };

    case 'BUY_CAFE_ITEM': {
      const item = CAFE_ITEMS.find(i => i.id === action.itemId);
      if (!item || state.money < item.price) return state;
      let ns = { ...state, money: state.money - item.price };
      if (item.buffType === 'heal') {
        ns.health = Math.min(state.maxHealth, state.health + 50);
      } else {
        ns.activeBuff = {
          type: item.buffType,
          label: item.name,
          color: item.buffType === 'speed' ? '#00f0d0' : item.buffType === 'damage' ? '#ff2244' : item.buffType === 'radar' ? '#f000b8' : '#f0e000',
          expiresAt: Date.now() + item.buffDuration * 1000,
        };
      }
      return { ...ns, showPanel: null };
    }

    case 'TICK_BUFFS': {
      if (!state.activeBuff || Date.now() < state.activeBuff.expiresAt) return state;
      return { ...state, activeBuff: null };
    }

    case 'SET_INTERIOR': return { ...state, currentInterior: action.interiorId, showPanel: null };
    case 'RESET_GAME': return { ...initialGameState };
    case 'UNLOCK_MISSIONS': return unlockMissions(state);
    case 'SET_PLAYER_CHARACTER': return { ...state, playerCharacterId: action.characterId, playerName: action.characterId.toUpperCase() };
    default: return state;
  }
}

const GameContext = createContext<{ state: GameState; dispatch: React.Dispatch<GameAction> } | null>(null);

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, loadGameState());

  useEffect(() => { saveGameState(state); }, [state]);
  useEffect(() => { dispatch({ type: 'UNLOCK_MISSIONS' }); }, []);
  useEffect(() => {
    const id = setInterval(() => dispatch({ type: 'TICK_BUFFS' }), 1000);
    return () => clearInterval(id);
  }, []);

  return <GameContext.Provider value={{ state, dispatch }}>{children}</GameContext.Provider>;
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be inside GameProvider');
  return ctx;
}
