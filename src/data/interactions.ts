export interface InteractionPoint {
  id: string;
  type: 'mission' | 'studio' | 'club' | 'recruit' | 'travel' | 'cabin' | 'cave' | 'stash' | 'character' | 'store' | 'cafe' | 'drugmarket' | 'meetup' | 'car' | 'citizen' | 'interior' | 'interior-exit';
  label: string;
  position: [number, number, number];
  missionId?: string;
  crewId?: string;
  characterId?: string;
  storeType?: string;
}

// Interior room definitions — spawn positions are far from main world (x=500+)
export const INTERIOR_DEFS: Record<string, {
  label: string;
  entrancePos: [number, number, number];
  spawnPos: [number, number, number];
  exitPos: [number, number, number];
}> = {
  bar: {
    label: 'CHIPPEWA TAVERN',
    entrancePos: [-64, 1, -20],
    spawnPos: [500, 1, 3],
    exitPos: [-64, 1, -17],
  },
  studio: {
    label: 'RECORDING STUDIO',
    entrancePos: [-14, 1, -37.5],
    spawnPos: [550, 1, 3],
    exitPos: [-14, 1, -34],
  },
  nbahq: {
    label: 'NBA HQ LOBBY',
    entrancePos: [5, 1, -30],
    spawnPos: [600, 1, 3],
    exitPos: [5, 1, -26],
  },
  house1: {
    label: 'SHOTGUN HOUSE',
    entrancePos: [-20, 1, -12],
    spawnPos: [650, 1, 3],
    exitPos: [-20, 1, -9],
  },
  // South Side Bar — shares BarInterior room
  southbar: {
    label: 'SOUTH SIDE BAR',
    entrancePos: [64, 1, 20],
    spawnPos: [500, 1, 3],
    exitPos: [64, 1, 17],
  },
  // Additional houses — all share HouseInterior room, exit to own street position
  house2: { label: 'SHOTGUN HOUSE', entrancePos: [-46, 1, -22], spawnPos: [650, 1, 3], exitPos: [-46, 1, -15] },
  house3: { label: 'SHOTGUN HOUSE', entrancePos: [-33, 1, -22], spawnPos: [650, 1, 3], exitPos: [-33, 1, -15] },
  house4: { label: 'SHOTGUN HOUSE', entrancePos: [-5,  1, -22], spawnPos: [650, 1, 3], exitPos: [-5,  1, -15] },
  house5: { label: 'SHOTGUN HOUSE', entrancePos: [23,  1, -22], spawnPos: [650, 1, 3], exitPos: [23,  1, -15] },
  house6: { label: 'SHOTGUN HOUSE', entrancePos: [36,  1, -22], spawnPos: [650, 1, 3], exitPos: [36,  1, -15] },
  house7: { label: 'SHOTGUN HOUSE', entrancePos: [-48, 1,  22], spawnPos: [650, 1, 3], exitPos: [-48, 1,  15] },
  house8: { label: 'SHOTGUN HOUSE', entrancePos: [-6,  1,  22], spawnPos: [650, 1, 3], exitPos: [-6,  1,  15] },
  house9: { label: 'SHOTGUN HOUSE', entrancePos: [22,  1,  22], spawnPos: [650, 1, 3], exitPos: [22,  1,  15] },
  house10:{ label: 'SHOTGUN HOUSE', entrancePos: [35,  1,  22], spawnPos: [650, 1, 3], exitPos: [35,  1,  15] },
  // Creole cottages — share HouseInterior room
  cottage1: { label: 'CREOLE COTTAGE', entrancePos: [-19, 1, -27], spawnPos: [650, 1, 3], exitPos: [-19, 1, -16] },
  cottage2: { label: 'CREOLE COTTAGE', entrancePos: [9,   1, -27], spawnPos: [650, 1, 3], exitPos: [9,   1, -16] },
  cottage3: { label: 'CREOLE COTTAGE', entrancePos: [50,  1, -27], spawnPos: [650, 1, 3], exitPos: [50,  1, -16] },
  cottage4: { label: 'CREOLE COTTAGE', entrancePos: [-34, 1,  27], spawnPos: [650, 1, 3], exitPos: [-34, 1,  16] },
  cottage5: { label: 'CREOLE COTTAGE', entrancePos: [8,   1,  27], spawnPos: [650, 1, 3], exitPos: [8,   1,  16] },
  cottage6: { label: 'CREOLE COTTAGE', entrancePos: [49,  1,  27], spawnPos: [650, 1, 3], exitPos: [49,  1,  16] },
  // Cinema — YouTube music video theater
  cinema: {
    label: 'NBA YOUNGBOY THEATER',
    entrancePos: [20, 1, -37],
    spawnPos: [700, 1, -5],
    exitPos: [20, 1, -34],
  },
  // Virtual Studio — cyber music production lab
  vstudio: {
    label: 'VIRTUAL STUDIO',
    entrancePos: [-5, 1, -37.5],
    spawnPos: [750, 1, -5],
    exitPos: [-5, 1, -34],
  },
};

import { CHARACTERS } from '@/data/characters';

const characterInteractions: InteractionPoint[] = CHARACTERS.map(char => ({
  id: `char-${char.id}`,
  type: 'character' as const,
  label: `TALK TO ${char.name}`,
  position: char.homePosition,
  characterId: char.id,
}));

export const cityInteractions: InteractionPoint[] = [
  // ── Existing ────────────────────────────────────────────────────────────────
  { id: 'studio-1',       type: 'studio',    label: 'RECORDING STUDIO',              position: [-14, 1.5, -36] },
  { id: 'club-1',         type: 'club',      label: 'ENTER KLUB NEON',               position: [35, 1.5, -35] },
  { id: 'store-vehicles', type: 'store',     label: 'CYBER AUTO DEALERSHIP',         position: [25, 1.5, -40],  storeType: 'vehicles' },
  { id: 'store-weapons',  type: 'store',     label: 'ARMORY — WEAPONS & CYBER GEAR', position: [-40, 1.5, 15],  storeType: 'weapons' },
  { id: 'store-music',    type: 'store',     label: 'DIGITAL MUSIC STORE',           position: [-15, 1.5, -40], storeType: 'music' },
  { id: 'store-tools',    type: 'store',     label: 'GEAR & TOOLS SHOP',             position: [40, 1.5, 35],   storeType: 'tools' },
  { id: 'store-garage',   type: 'store',     label: 'YOUR GARAGE',                   position: [10, 1.5, -30],  storeType: 'garage' },
  { id: 'store-inventory',type: 'store',     label: 'INVENTORY',                     position: [-10, 1.5, 20],  storeType: 'inventory' },
  { id: 'mission-m1',     type: 'mission',   label: 'MISSION: FIRST DROP',           position: [15, 1.5, 18],   missionId: 'm1' },
  { id: 'mission-m2',     type: 'mission',   label: 'MISSION: BLOCK PARTY',          position: [-18, 1.5, 30],  missionId: 'm2' },
  { id: 'mission-m3',     type: 'mission',   label: 'MISSION: HOLD THE LINE',        position: [30, 1.5, 25],   missionId: 'm3' },
  { id: 'mission-m5',     type: 'mission',   label: 'MISSION: CLUB TAKEOVER',        position: [40, 1.5, -30],  missionId: 'm5' },
  { id: 'mission-m6',     type: 'mission',   label: 'MISSION: RIVAL MEETING',        position: [-35, 1.5, -40], missionId: 'm6' },
  { id: 'recruit-c3',     type: 'recruit',   label: 'RECRUIT: BONES',                position: [20, 1.5, -15],  crewId: 'c3' },
  { id: 'recruit-c4',     type: 'recruit',   label: 'RECRUIT: REDD',                 position: [-20, 1.5, 15],  crewId: 'c4' },
  { id: 'mission-deebaby',   type: 'mission', label: "MISSION: H-TOWN TAKEOVER [DEEBABY]",  position: [-30, 1.5, 22], missionId: 'm-deebaby' },
  { id: 'mission-deebaby-2', type: 'mission', label: "MISSION: BROKEN PROMISES [DEEBABY]",  position: [-36, 1.5, -38], missionId: 'm-deebaby-2' },
  { id: 'highway-exit',   type: 'travel',    label: 'HIGHWAY → GRAVEDIGGER MOUNTAIN', position: [0, 1.5, -65] },

  // ── Building Entrances ────────────────────────────────────────────────────────
  { id: 'interior-bar',      type: 'interior', label: 'ENTER CHIPPEWA TAVERN [E]',  position: [-64, 1.5, -20] },
  { id: 'interior-southbar', type: 'interior', label: 'ENTER SOUTH SIDE BAR [E]',   position: [64,  1.5,  20] },
  { id: 'interior-studio',   type: 'interior', label: 'ENTER RECORDING STUDIO [E]', position: [-14, 1.5, -37.5] },
  { id: 'interior-nbahq',    type: 'interior', label: 'ENTER NBA HQ [E]',           position: [0,   1.5, -30] },
  // Shotgun houses — north side
  { id: 'interior-house1',  type: 'interior', label: 'ENTER HOUSE [E]', position: [-20, 1.5, -22] },
  { id: 'interior-house2',  type: 'interior', label: 'ENTER HOUSE [E]', position: [-46, 1.5, -22] },
  { id: 'interior-house3',  type: 'interior', label: 'ENTER HOUSE [E]', position: [-33, 1.5, -22] },
  { id: 'interior-house4',  type: 'interior', label: 'ENTER HOUSE [E]', position: [-5,  1.5, -22] },
  { id: 'interior-house5',  type: 'interior', label: 'ENTER HOUSE [E]', position: [23,  1.5, -22] },
  { id: 'interior-house6',  type: 'interior', label: 'ENTER HOUSE [E]', position: [36,  1.5, -22] },
  // Shotgun houses — south side
  { id: 'interior-house7',  type: 'interior', label: 'ENTER HOUSE [E]', position: [-48, 1.5,  22] },
  { id: 'interior-house8',  type: 'interior', label: 'ENTER HOUSE [E]', position: [-6,  1.5,  22] },
  { id: 'interior-house9',  type: 'interior', label: 'ENTER HOUSE [E]', position: [22,  1.5,  22] },
  { id: 'interior-house10', type: 'interior', label: 'ENTER HOUSE [E]', position: [35,  1.5,  22] },
  // Creole cottages
  { id: 'interior-cottage1', type: 'interior', label: 'ENTER COTTAGE [E]', position: [-19, 1.5, -27] },
  { id: 'interior-cottage2', type: 'interior', label: 'ENTER COTTAGE [E]', position: [9,   1.5, -27] },
  { id: 'interior-cottage3', type: 'interior', label: 'ENTER COTTAGE [E]', position: [50,  1.5, -27] },
  { id: 'interior-cottage4', type: 'interior', label: 'ENTER COTTAGE [E]', position: [-34, 1.5,  27] },
  { id: 'interior-cottage5', type: 'interior', label: 'ENTER COTTAGE [E]', position: [8,   1.5,  27] },
  { id: 'interior-cottage6', type: 'interior', label: 'ENTER COTTAGE [E]', position: [49,  1.5,  27] },

  // Cinema + Virtual Studio + Corner Store entrances (positioned at the actual door)
  { id: 'interior-cinema',  type: 'interior', label: 'ENTER NBA YOUNGBOY THEATER [E]', position: [20,  1.5, -37] },
  { id: 'interior-vstudio', type: 'interior', label: 'ENTER VIRTUAL STUDIO [E]',       position: [-5,  1.5, -37.5] },
  { id: 'store-cornerstore', type: 'store',   label: 'NBA CORNER STORE — BEER & SNACKS [E]', position: [-16, 1.5, -32], storeType: 'tools' },

  // ── Interior Exit Points (positioned near door at z=-5 of each room) ──────
  { id: 'exit-bar',      type: 'interior-exit', label: 'EXIT [E]', position: [500, 1.5, -3.5] },
  { id: 'exit-studio',   type: 'interior-exit', label: 'EXIT [E]', position: [550, 1.5, -5.5] },
  { id: 'exit-nbahq',    type: 'interior-exit', label: 'EXIT [E]', position: [600, 1.5, -8.5] },
  { id: 'exit-house1',   type: 'interior-exit', label: 'EXIT [E]', position: [650, 1.5, -1.5] },
  { id: 'exit-cinema',   type: 'interior-exit', label: 'EXIT THEATER [E]', position: [700, 1.5, -7.0] },
  { id: 'exit-vstudio',  type: 'interior-exit', label: 'EXIT STUDIO [E]',  position: [750, 1.5, -6.5] },
  // southbar and extra houses/cottages all share the same interior exit points above

  // ── Cafe & Food ─────────────────────────────────────────────────────────────
  { id: 'cafe-chrome',    type: 'cafe',      label: 'CHROME CAFE — BUY BUFFS',       position: [-45, 1.5, -20] },
  { id: 'cafe-noodle',    type: 'cafe',      label: 'NOODLE BAR — SYNTH FOOD',       position: [18, 1.5, 45] },
  { id: 'cafe-trap',      type: 'cafe',      label: 'TRAP KITCHEN — STREET FOOD',    position: [55, 1.5, 20] },

  // ── Drug Market ─────────────────────────────────────────────────────────────
  { id: 'drug-corner-1',  type: 'drugmarket', label: 'BLACK MARKET — BUY/SELL',      position: [-22, 1.5, -55] },
  { id: 'drug-corner-2',  type: 'drugmarket', label: 'ALLEY DEALER — BUY/SELL',      position: [45, 1.5, 10] },
  { id: 'drug-corner-3',  type: 'drugmarket', label: 'CLUB DISTRICT CONNECT',         position: [55, 1.5, -25] },

  // ── Friend Meetups ──────────────────────────────────────────────────────────
  { id: 'meetup-club',    type: 'meetup',    label: 'MEETUP: CHROME LOUNGE',         position: [35, 1.5, -30] },
  { id: 'meetup-rooftop', type: 'meetup',    label: 'MEETUP: SIGNAL ROOFTOP',        position: [-5, 1.5, -50] },
  { id: 'meetup-block',   type: 'meetup',    label: "MEETUP: DEEBABY'S CORNER",      position: [-28, 1.5, 25] },

  // ── Driveable Cars ───────────────────────────────────────────────────────────
  { id: 'car-1',  type: 'car', label: 'ENTER VEHICLE [E]',  position: [8,   1.5,  5] },
  { id: 'car-2',  type: 'car', label: 'ENTER VEHICLE [E]',  position: [-12, 1.5, -8] },
  { id: 'car-3',  type: 'car', label: 'ENTER VEHICLE [E]',  position: [22,  1.5,  8] },
  { id: 'car-4',  type: 'car', label: 'ENTER VEHICLE [E]',  position: [-8,  1.5, 35] },
  { id: 'car-5',  type: 'car', label: 'ENTER VEHICLE [E]',  position: [30,  1.5, -10] },
  { id: 'car-6',  type: 'car', label: 'ENTER VEHICLE [E]',  position: [-25, 1.5, -15] },

  // ── Street Citizens ──────────────────────────────────────────────────────────
  { id: 'citizen-1',  type: 'citizen', label: 'TALK [E]', position: [5,   1.5,  20] },
  { id: 'citizen-2',  type: 'citizen', label: 'TALK [E]', position: [-15, 1.5,  12] },
  { id: 'citizen-3',  type: 'citizen', label: 'TALK [E]', position: [18,  1.5, -12] },
  { id: 'citizen-4',  type: 'citizen', label: 'TALK [E]', position: [-8,  1.5, -20] },
  { id: 'citizen-5',  type: 'citizen', label: 'TALK [E]', position: [38,  1.5,  5] },
  { id: 'citizen-6',  type: 'citizen', label: 'TALK [E]', position: [-35, 1.5,  5] },
  { id: 'citizen-7',  type: 'citizen', label: 'TALK [E]', position: [10,  1.5, -48] },
  { id: 'citizen-8',  type: 'citizen', label: 'TALK [E]', position: [-50, 1.5, -10] },
  { id: 'citizen-9',  type: 'citizen', label: 'TALK [E]', position: [50,  1.5,  40] },
  { id: 'citizen-10', type: 'citizen', label: 'TALK [E]', position: [0,   1.5,  50] },

  ...characterInteractions,
];

import { getTerrainHeight } from '@/utils/terrain';

const mtnY = (x: number, z: number) => getTerrainHeight(x, z) + 1.5;

export const mountainInteractions: InteractionPoint[] = [
  { id: 'cabin-1',       type: 'cabin',   label: 'ENTER ABANDONED CABIN',     position: [25, mtnY(25, 20), 20] },
  { id: 'cave-1',        type: 'cave',    label: 'EXPLORE CAVE ENTRANCE',     position: [-35, mtnY(-35, -30), -30] },
  { id: 'stash-1',       type: 'stash',   label: 'DIG: HIDDEN STASH',         position: [40, mtnY(40, -15), -15] },
  { id: 'stash-2',       type: 'stash',   label: 'DIG: MONEY CACHE',          position: [-20, mtnY(-20, 35), 35] },
  { id: 'mission-cave',  type: 'mission', label: 'MISSION: RECOVER ARTIFACT', position: [-30, mtnY(-30, -25), -25], missionId: 'm4' },
  { id: 'mission-cabin', type: 'mission', label: 'MISSION: SEARCH CABIN',     position: [30, mtnY(30, 25), 25],    missionId: 'm7' },
  { id: 'recruit-c5',    type: 'recruit', label: 'RECRUIT: NOVA (EXPLORER)',  position: [10, mtnY(10, -40), -40],  crewId: 'c5' },
  { id: 'highway-city',  type: 'travel',  label: 'HIGHWAY → RETURN TO CITY',  position: [0, mtnY(0, 60), 60] },
  { id: 'drug-mtn',      type: 'drugmarket', label: 'MOUNTAIN CONNECT — PREMIUM', position: [15, mtnY(15, -30), -30] },
];
