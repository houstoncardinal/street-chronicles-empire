import { GameState } from '@/types/game';

export const initialGameState: GameState = {
  playerName: 'PLAYER ONE',
  level: 1,
  money: 500,
  fans: 0,
  streetRep: 10,
  industryFame: 0,
  crewLoyalty: 20,
  currentRegion: 'city',
  nearInteraction: null,
  showPanel: null,
  coldMeter: 0,
  characterStates: {
    yb: { relationship: 30, level: 1, xp: 0, isFollowing: false, isRecruited: false },
    ben: { relationship: 20, level: 1, xp: 0, isFollowing: false, isRecruited: false },
    rondo: { relationship: 25, level: 1, xp: 0, isFollowing: false, isRecruited: false },
    timm: { relationship: 15, level: 1, xp: 0, isFollowing: false, isRecruited: false },
    herm: { relationship: 35, level: 1, xp: 0, isFollowing: false, isRecruited: false },
    porter: { relationship: 10, level: 1, xp: 0, isFollowing: false, isRecruited: false },
  },
  crew: [
    { id: 'c1', name: 'DRAY', role: 'Enforcer', loyalty: 70, strength: 85, influence: 30, skill: 50, avatar: '💪', recruited: true },
    { id: 'c2', name: 'SILK', role: 'Producer', loyalty: 60, strength: 20, influence: 50, skill: 90, avatar: '🎹', recruited: true },
  ],
  missions: [
    { id: 'm1', title: 'FIRST DROP', description: 'Run a package across The Block.', district: 'the-block', type: 'errand', difficulty: 1, rewards: { money: 200, fans: 10, streetRep: 5, industryFame: 0, crewLoyalty: 3 }, requiredLevel: 1, completed: false, locked: false },
    { id: 'm2', title: 'BLOCK PARTY', description: 'Perform at the neighborhood cookout.', district: 'the-block', type: 'perform', difficulty: 1, rewards: { money: 100, fans: 50, streetRep: 3, industryFame: 5, crewLoyalty: 2 }, requiredLevel: 1, completed: false, locked: false },
    { id: 'm3', title: 'HOLD THE LINE', description: 'Defend your corner from a rival push.', district: 'the-block', type: 'defend', difficulty: 2, rewards: { money: 300, fans: 20, streetRep: 10, industryFame: 0, crewLoyalty: 8 }, requiredLevel: 2, completed: false, locked: true },
    { id: 'm4', title: 'RECOVER ARTIFACT', description: 'Find the artifact deep in the caves.', district: 'studio-row', type: 'record', difficulty: 2, rewards: { money: 500, fans: 100, streetRep: 5, industryFame: 15, crewLoyalty: 5 }, requiredLevel: 2, completed: false, locked: true },
    { id: 'm5', title: 'CLUB TAKEOVER', description: 'Perform at the hottest club Downtown.', district: 'club-district', type: 'perform', difficulty: 3, rewards: { money: 500, fans: 200, streetRep: 5, industryFame: 20, crewLoyalty: 5 }, requiredLevel: 3, completed: false, locked: true },
    { id: 'm6', title: 'RIVAL MEETING', description: 'Confront the rival crew leader.', district: 'rival-territory', type: 'rival', difficulty: 4, rewards: { money: 1000, fans: 50, streetRep: 20, industryFame: 5, crewLoyalty: 15 }, requiredLevel: 4, completed: false, locked: true },
    { id: 'm7', title: 'CABIN SEARCH', description: 'Search the abandoned cabin on the mountain.', district: 'downtown', type: 'errand', difficulty: 3, rewards: { money: 800, fans: 30, streetRep: 8, industryFame: 10, crewLoyalty: 5 }, requiredLevel: 3, completed: false, locked: true },
    { id: 'm8', title: 'LUXURY MOVE', description: 'Make your play in Luxury Hills.', district: 'luxury-hills', type: 'errand', difficulty: 5, rewards: { money: 2000, fans: 500, streetRep: 10, industryFame: 30, crewLoyalty: 10 }, requiredLevel: 5, completed: false, locked: true },
    // Character missions
    { id: 'm-yb', title: 'BUILD THE MOVEMENT', description: 'YB needs you to rally the city. Major territory takeover.', district: 'the-block', type: 'defend', difficulty: 1, rewards: { money: 500, fans: 100, streetRep: 15, industryFame: 10, crewLoyalty: 10 }, requiredLevel: 1, completed: false, locked: false },
    { id: 'm-ben', title: 'STRATEGIC OPERATION', description: 'Ben has a plan. Execute it with precision.', district: 'downtown', type: 'errand', difficulty: 1, rewards: { money: 400, fans: 50, streetRep: 10, industryFame: 5, crewLoyalty: 8 }, requiredLevel: 1, completed: false, locked: false },
    { id: 'm-rondo', title: 'HEADLINE SHOW', description: 'Rondo has a show tonight. Make it legendary.', district: 'club-district', type: 'perform', difficulty: 1, rewards: { money: 300, fans: 200, streetRep: 5, industryFame: 20, crewLoyalty: 5 }, requiredLevel: 1, completed: false, locked: false },
    { id: 'm-timm', title: 'SECURITY DETAIL', description: 'Timm needs backup securing the perimeter.', district: 'the-block', type: 'defend', difficulty: 2, rewards: { money: 350, fans: 30, streetRep: 15, industryFame: 0, crewLoyalty: 12 }, requiredLevel: 1, completed: false, locked: false },
    { id: 'm-herm', title: 'RALLY THE CREW', description: 'Herm found new recruits. Help bring them in.', district: 'the-block', type: 'errand', difficulty: 1, rewards: { money: 200, fans: 80, streetRep: 5, industryFame: 5, crewLoyalty: 15 }, requiredLevel: 1, completed: false, locked: false },
    { id: 'm-porter', title: 'BUSINESS DEAL', description: 'Porter has a deal worth big money. Handle it.', district: 'downtown', type: 'errand', difficulty: 2, rewards: { money: 800, fans: 100, streetRep: 5, industryFame: 10, crewLoyalty: 5 }, requiredLevel: 1, completed: false, locked: false },
  ],
  songs: [
    { id: 's1', title: 'FROM THE BOTTOM', type: 'single', fans: 50, fame: 10, recorded: false },
    { id: 's2', title: 'BLOCK ANTHEM', type: 'single', fans: 80, fame: 15, recorded: false },
    { id: 's3', title: 'NEVER BROKE VOL. 1', type: 'mixtape', fans: 300, fame: 40, recorded: false },
    { id: 's4', title: 'NIGHT SHIFT', type: 'single', fans: 120, fame: 20, recorded: false },
    { id: 's5', title: 'EMPIRE STATE', type: 'mixtape', fans: 500, fame: 60, recorded: false },
  ],
  districts: [
    { id: 'the-block', name: 'THE BLOCK', description: 'Where it all starts.', controlled: true, controlPercent: 60, unlocked: true, x: 20, y: 60, color: '#F000B8' },
    { id: 'downtown', name: 'DOWNTOWN', description: 'The city center.', controlled: false, controlPercent: 0, unlocked: false, x: 45, y: 30, color: '#666' },
    { id: 'club-district', name: 'CLUB DISTRICT', description: 'Nightlife hub.', controlled: false, controlPercent: 0, unlocked: false, x: 70, y: 45, color: '#666' },
    { id: 'studio-row', name: 'STUDIO ROW', description: 'Where hits are made.', controlled: false, controlPercent: 0, unlocked: false, x: 35, y: 55, color: '#666' },
    { id: 'rival-territory', name: 'RIVAL TERRITORY', description: 'Enemy turf.', controlled: false, controlPercent: 0, unlocked: false, x: 75, y: 70, color: '#666' },
    { id: 'luxury-hills', name: 'LUXURY HILLS', description: 'The endgame.', controlled: false, controlPercent: 0, unlocked: false, x: 55, y: 15, color: '#666' },
  ],
  completedMissions: 0,
  totalTerritories: 6,
  activeSection: 'map',
  ownedVehicles: [],
  ownedWeapons: [],
  ownedMusic: [],
  equippedWeapon: null,
  activeVehicle: null,
};

const STORAGE_KEY = 'nba-game-state';

export function loadGameState(): GameState {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        ...initialGameState,
        ...parsed,
        characterStates: { ...initialGameState.characterStates, ...(parsed.characterStates || {}) },
      };
    }
  } catch {}
  return { ...initialGameState };
}

export function saveGameState(state: GameState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {}
}
