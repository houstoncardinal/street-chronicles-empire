import { GameState } from '@/types/game';

export const initialGameState: GameState = {
  playerName: 'PLAYER ONE',
  playerCharacterId: 'yb',
  level: 10,
  money: 9_999_999,
  fans: 500_000,
  streetRep: 100,
  industryFame: 100,
  crewLoyalty: 100,
  currentRegion: 'city',
  currentInterior: null,
  nearInteraction: null,
  showPanel: null,
  coldMeter: 0,
  characterStates: {
    yb:       { relationship: 80, level: 5, xp: 0, isFollowing: false, isRecruited: true },
    ben:      { relationship: 75, level: 5, xp: 0, isFollowing: false, isRecruited: true },
    rondo:    { relationship: 70, level: 5, xp: 0, isFollowing: false, isRecruited: true },
    timm:     { relationship: 70, level: 5, xp: 0, isFollowing: false, isRecruited: true },
    herm:     { relationship: 80, level: 5, xp: 0, isFollowing: false, isRecruited: true },
    porter:   { relationship: 65, level: 5, xp: 0, isFollowing: false, isRecruited: true },
    deebaby:  { relationship: 75, level: 5, xp: 0, isFollowing: false, isRecruited: true },
    quando:   { relationship: 70, level: 5, xp: 0, isFollowing: false, isRecruited: true },
    lultimm:  { relationship: 75, level: 5, xp: 0, isFollowing: false, isRecruited: true },
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
    { id: 'm-yb', title: 'BUILD THE MOVEMENT', description: 'YB needs you to rally the city. Major territory takeover.', district: 'the-block', type: 'defend', difficulty: 1, rewards: { money: 500, fans: 100, streetRep: 15, industryFame: 10, crewLoyalty: 10 }, requiredLevel: 1, completed: false, locked: false },
    { id: 'm-ben', title: 'STRATEGIC OPERATION', description: 'Ben has a plan. Execute it with precision.', district: 'downtown', type: 'errand', difficulty: 1, rewards: { money: 400, fans: 50, streetRep: 10, industryFame: 5, crewLoyalty: 8 }, requiredLevel: 1, completed: false, locked: false },
    { id: 'm-rondo', title: 'HEADLINE SHOW', description: 'Rondo has a show tonight. Make it legendary.', district: 'club-district', type: 'perform', difficulty: 1, rewards: { money: 300, fans: 200, streetRep: 5, industryFame: 20, crewLoyalty: 5 }, requiredLevel: 1, completed: false, locked: false },
    { id: 'm-timm', title: 'SECURITY DETAIL', description: 'Timm needs backup securing the perimeter.', district: 'the-block', type: 'defend', difficulty: 2, rewards: { money: 350, fans: 30, streetRep: 15, industryFame: 0, crewLoyalty: 12 }, requiredLevel: 1, completed: false, locked: false },
    { id: 'm-herm', title: 'RALLY THE CREW', description: 'Herm found new recruits. Help bring them in.', district: 'the-block', type: 'errand', difficulty: 1, rewards: { money: 200, fans: 80, streetRep: 5, industryFame: 5, crewLoyalty: 15 }, requiredLevel: 1, completed: false, locked: false },
    { id: 'm-porter', title: 'BUSINESS DEAL', description: 'Porter has a deal worth big money. Handle it.', district: 'downtown', type: 'errand', difficulty: 2, rewards: { money: 800, fans: 100, streetRep: 5, industryFame: 10, crewLoyalty: 5 }, requiredLevel: 1, completed: false, locked: false },
    { id: 'm-deebaby', title: "H-TOWN TAKEOVER", description: "DeeBaby's got opps runnin' their mouth before his show. Shut it down, then make the show legendary. Houston to the world.", district: 'club-district', type: 'perform', difficulty: 2, rewards: { money: 1200, fans: 400, streetRep: 25, industryFame: 30, crewLoyalty: 15 }, requiredLevel: 1, completed: false, locked: false },
    { id: 'm-deebaby-2', title: "BROKEN PROMISES", description: "DeeBaby needs to settle a score with someone who burned him. Track them down across the city and deliver a message.", district: 'rival-territory', type: 'rival', difficulty: 3, rewards: { money: 1500, fans: 200, streetRep: 30, industryFame: 15, crewLoyalty: 20 }, requiredLevel: 2, completed: false, locked: true },
    { id: 'm-midnight-run', title: 'MIDNIGHT RUN', description: 'Win 3 street races against rival crews across the city.', district: 'club-district', type: 'errand', difficulty: 2, rewards: { money: 1500, fans: 150, streetRep: 20, industryFame: 15, crewLoyalty: 5 }, requiredLevel: 1, completed: false, locked: false },
    { id: 'm-grand-theft', title: 'GRAND THEFT', description: "Boost a vehicle from the luxury district and deliver it to the chop shop before heat gets too high.", district: 'luxury-hills', type: 'errand', difficulty: 3, rewards: { money: 2500, fans: 75, streetRep: 30, industryFame: 5, crewLoyalty: 8 }, requiredLevel: 1, completed: false, locked: false },
    { id: 'm-quando', title: 'COLD WORLD', description: "Quando's got heat on him from every direction. Ride through enemy blocks and shut it down.", district: 'rival-territory', type: 'defend', difficulty: 3, rewards: { money: 2000, fans: 200, streetRep: 35, industryFame: 10, crewLoyalty: 20 }, requiredLevel: 1, completed: false, locked: false },
    { id: 'm-lultimm', title: 'ALIEN SEASON', description: "Lul Timm needs the city to feel his new sound. Set up guerrilla performances across 4 blocks.", district: 'club-district', type: 'perform', difficulty: 2, rewards: { money: 3000, fans: 800, streetRep: 10, industryFame: 50, crewLoyalty: 10 }, requiredLevel: 1, completed: false, locked: false },
  ],
  songs: [
    { id: 's1', title: 'FROM THE BOTTOM', type: 'single', fans: 50, fame: 10, recorded: false },
    { id: 's2', title: 'BLOCK ANTHEM', type: 'single', fans: 80, fame: 15, recorded: false },
    { id: 's3', title: 'NEVER BROKE VOL. 1', type: 'mixtape', fans: 300, fame: 40, recorded: false },
    { id: 's4', title: 'NIGHT SHIFT', type: 'single', fans: 120, fame: 20, recorded: false },
    { id: 's5', title: 'EMPIRE STATE', type: 'mixtape', fans: 500, fame: 60, recorded: false },
  ],
  districts: [
    { id: 'the-block',       name: 'THE BLOCK',       description: 'Where it all starts.',    controlled: true,  controlPercent: 60, unlocked: true,  x: 20, y: 60, color: '#00f0d0' },
    { id: 'downtown',        name: 'DOWNTOWN',        description: 'The city center.',        controlled: false, controlPercent: 0,  unlocked: false, x: 45, y: 30, color: '#333' },
    { id: 'club-district',   name: 'CLUB DISTRICT',   description: 'Nightlife hub.',          controlled: false, controlPercent: 0,  unlocked: false, x: 70, y: 45, color: '#333' },
    { id: 'studio-row',      name: 'STUDIO ROW',      description: 'Where hits are made.',    controlled: false, controlPercent: 0,  unlocked: false, x: 35, y: 55, color: '#333' },
    { id: 'rival-territory', name: 'RIVAL TERRITORY', description: 'Enemy turf.',             controlled: false, controlPercent: 0,  unlocked: false, x: 75, y: 70, color: '#333' },
    { id: 'luxury-hills',    name: 'LUXURY HILLS',    description: 'The endgame.',            controlled: false, controlPercent: 0,  unlocked: false, x: 55, y: 15, color: '#333' },
  ],
  completedMissions: 0,
  totalTerritories: 6,
  activeSection: 'map',
  ownedVehicles: ['v-hellcat','v-trackhawk','v-g-wagon','v-raptor','v-snowrunner','v-wraith','v-reaper','v-viper','v-phantom','v-neuromancer','v-spectre','v-hk-blade','v-sherpa'],
  ownedWeapons:  ['w-9mm','w-deagle','w-mac10','w-ak','w-pump','w-bat','w-machete','w-gold-45','w-vest','w-tac-vest','w-katana','w-sniper','w-smg','w-auto-sg','w-plasma','w-railgun','w-neuroblade','w-flamer','w-launcher'],
  ownedMusic: [],
  ownedTools:  ['t-shovel','t-pickaxe','t-detector','t-drill','t-flashlight','t-climbing','t-survival','t-grapple','t-cyberdeck','t-scanner','t-emp'],
  equippedWeapon: 'w-railgun',
  activeVehicle: 'v-neuromancer',
  equippedTool: 't-cyberdeck',
  vehicleCustomizations: {},
  musicPlayer: { isPlaying: false, currentAlbumId: null, currentTrackIndex: 0, shuffle: false, repeat: false },
  // Cyberpunk
  health: 100,
  maxHealth: 100,
  ammo: {
    'w-9mm': 9999, 'w-deagle': 9999, 'w-mac10': 9999, 'w-ak': 9999,
    'w-pump': 9999, 'w-gold-45': 9999, 'w-sniper': 9999, 'w-smg': 9999,
    'w-auto-sg': 9999, 'w-plasma': 9999, 'w-railgun': 9999,
    'w-flamer': 9999, 'w-launcher': 9999,
  },
  drugInventory: {},
  drugHeat: 0,
  wantedLevel: 0,
  activeBuff: null,
  totalShots: 0,
  totalKills: 0,
  isInVehicle: false,
};

const STORAGE_KEY = 'sc-empire-v4';

export function loadGameState(): GameState {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        ...initialGameState,
        ...parsed,
        characterStates: { ...initialGameState.characterStates, ...(parsed.characterStates || {}) },
        musicPlayer: { ...initialGameState.musicPlayer, ...(parsed.musicPlayer || {}), isPlaying: false },
        vehicleCustomizations: { ...initialGameState.vehicleCustomizations, ...(parsed.vehicleCustomizations || {}) },
        // Always reset transient cyberpunk state
        activeBuff: null,
        isInVehicle: false,
        currentInterior: null,
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
