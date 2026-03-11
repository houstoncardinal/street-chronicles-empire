export interface InteractionPoint {
  id: string;
  type: 'mission' | 'studio' | 'club' | 'recruit' | 'travel' | 'cabin' | 'cave' | 'stash' | 'character' | 'store';
  label: string;
  position: [number, number, number];
  missionId?: string;
  crewId?: string;
  characterId?: string;
  storeType?: string;
}

import { CHARACTERS } from '@/data/characters';

const characterInteractions: InteractionPoint[] = CHARACTERS.map(char => ({
  id: `char-${char.id}`,
  type: 'character' as const,
  label: `TALK TO ${char.name}`,
  position: char.homePosition,
  characterId: char.id,
}));

export const cityInteractions: InteractionPoint[] = [
  { id: 'studio-1', type: 'studio', label: 'ENTER RECORDING STUDIO', position: [-30, 1.5, -25] },
  { id: 'club-1', type: 'club', label: 'ENTER THE CLUB', position: [35, 1.5, -35] },
  { id: 'store-vehicles', type: 'store', label: 'NBA AUTO DEALERSHIP', position: [25, 1.5, -40], storeType: 'vehicles' },
  { id: 'store-weapons', type: 'store', label: 'ARMORY — WEAPONS & GEAR', position: [-40, 1.5, 15], storeType: 'weapons' },
  { id: 'store-music', type: 'store', label: 'YB DIGITAL MUSIC STORE', position: [-15, 1.5, -40], storeType: 'music' },
  { id: 'store-tools', type: 'store', label: 'GEAR & TOOLS SHOP', position: [40, 1.5, 35], storeType: 'tools' },
  { id: 'store-garage', type: 'store', label: 'YOUR GARAGE', position: [10, 1.5, -30], storeType: 'garage' },
  { id: 'store-inventory', type: 'store', label: 'INVENTORY', position: [-10, 1.5, 20], storeType: 'inventory' },
  { id: 'mission-m1', type: 'mission', label: 'MISSION: FIRST DROP', position: [15, 1.5, 18], missionId: 'm1' },
  { id: 'mission-m2', type: 'mission', label: 'MISSION: BLOCK PARTY', position: [-18, 1.5, 30], missionId: 'm2' },
  { id: 'mission-m3', type: 'mission', label: 'MISSION: HOLD THE LINE', position: [30, 1.5, 25], missionId: 'm3' },
  { id: 'mission-m5', type: 'mission', label: 'MISSION: CLUB TAKEOVER', position: [40, 1.5, -30], missionId: 'm5' },
  { id: 'mission-m6', type: 'mission', label: 'MISSION: RIVAL MEETING', position: [-35, 1.5, -40], missionId: 'm6' },
  { id: 'recruit-c3', type: 'recruit', label: 'RECRUIT: BONES', position: [20, 1.5, -15], crewId: 'c3' },
  { id: 'recruit-c4', type: 'recruit', label: 'RECRUIT: REDD', position: [-20, 1.5, 15], crewId: 'c4' },
  { id: 'highway-exit', type: 'travel', label: 'HIGHWAY → GRAVEDIGGER MOUNTAIN', position: [0, 1.5, -65] },
  ...characterInteractions,
];

import { getTerrainHeight } from '@/utils/terrain';

const mtnY = (x: number, z: number) => getTerrainHeight(x, z) + 1.5;

export const mountainInteractions: InteractionPoint[] = [
  { id: 'cabin-1', type: 'cabin', label: 'ENTER ABANDONED CABIN', position: [25, mtnY(25, 20), 20] },
  { id: 'cave-1', type: 'cave', label: 'EXPLORE CAVE ENTRANCE', position: [-35, mtnY(-35, -30), -30] },
  { id: 'stash-1', type: 'stash', label: 'DIG: HIDDEN STASH', position: [40, mtnY(40, -15), -15] },
  { id: 'stash-2', type: 'stash', label: 'DIG: MONEY CACHE', position: [-20, mtnY(-20, 35), 35] },
  { id: 'mission-cave', type: 'mission', label: 'MISSION: RECOVER ARTIFACT', position: [-30, mtnY(-30, -25), -25], missionId: 'm4' },
  { id: 'mission-cabin', type: 'mission', label: 'MISSION: SEARCH CABIN', position: [30, mtnY(30, 25), 25], missionId: 'm7' },
  { id: 'recruit-c5', type: 'recruit', label: 'RECRUIT: NOVA (EXPLORER)', position: [10, mtnY(10, -40), -40], crewId: 'c5' },
  { id: 'highway-city', type: 'travel', label: 'HIGHWAY → RETURN TO CITY', position: [0, mtnY(0, 60), 60] },
];
