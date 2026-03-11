import { VehicleItem, WeaponItem, MusicAlbum } from '@/types/game';

export const VEHICLES: VehicleItem[] = [
  { id: 'v-hellcat', name: 'HELLCAT', type: 'car', price: 2000, speed: 95, handling: 70, description: 'Supercharged muscle. King of the streets.', color: '#1a1a2e' },
  { id: 'v-trackhawk', name: 'TRACKHAWK', type: 'suv', price: 3500, speed: 88, handling: 75, description: 'Luxury meets raw power. SUV dominance.', color: '#2d2d44' },
  { id: 'v-g-wagon', name: 'G-WAGON', type: 'suv', price: 5000, speed: 72, handling: 80, description: 'Ultimate status symbol. Built for the boss.', color: '#0f0f0f' },
  { id: 'v-raptor', name: 'RAPTOR', type: 'truck', price: 4000, speed: 78, handling: 85, description: 'Off-road beast. Eats mountains for breakfast.', color: '#1e3a1e' },
  { id: 'v-snowrunner', name: 'SNOWRUNNER', type: 'snow', price: 3000, speed: 60, handling: 90, description: 'Built for GraveDigger Mountain. Snow chains included.', color: '#2a3a5c' },
  { id: 'v-wraith', name: 'WRAITH', type: 'car', price: 8000, speed: 98, handling: 65, description: 'Ghost mode. Silent and lethal on the streets.', color: '#1a0a2e' },
  { id: 'v-reaper', name: 'REAPER', type: 'car', price: 6000, speed: 92, handling: 72, description: 'Custom built. No one outruns the reaper.', color: '#2e0a0a' },
  { id: 'v-sherpa', name: 'SHERPA 4x4', type: 'truck', price: 4500, speed: 65, handling: 92, description: 'Mountain expedition vehicle. Goes where roads end.', color: '#3a3a2a' },
];

export const WEAPONS: WeaponItem[] = [
  { id: 'w-9mm', name: '9MM CLASSIC', type: 'pistol', price: 500, damage: 25, range: 30, description: 'Reliable sidearm. Every hustler needs one.' },
  { id: 'w-deagle', name: 'DESERT EAGLE', type: 'pistol', price: 1500, damage: 55, range: 35, description: 'Hand cannon. Makes a statement.' },
  { id: 'w-mac10', name: 'MAC-10', type: 'rifle', price: 2000, damage: 40, range: 25, description: 'Spray and pray. Street legend.' },
  { id: 'w-ak', name: 'DRACO', type: 'rifle', price: 3500, damage: 65, range: 50, description: 'Heavy hitter. Territory defense essential.' },
  { id: 'w-pump', name: 'PUMP ACTION', type: 'shotgun', price: 1800, damage: 80, range: 10, description: 'Close quarters king. One shot, one chance.' },
  { id: 'w-bat', name: 'LOUISVILLE SLUGGER', type: 'melee', price: 200, damage: 35, range: 3, description: 'Classic street tool. Silent but effective.' },
  { id: 'w-machete', name: 'MACHETE', type: 'melee', price: 350, damage: 45, range: 2, description: 'Mountain survival blade. Multi-purpose.' },
  { id: 'w-gold-45', name: 'GOLD .45', type: 'pistol', price: 5000, damage: 60, range: 35, description: 'Custom gold plated. For the boss only.' },
];

export const MUSIC_CATALOG: MusicAlbum[] = [
  {
    id: 'alb-1', title: 'AI YOUNGBOY', artist: 'YB', year: '2017',
    tracks: ['No Smoke', 'Untouchable', 'GG', 'Graffiti', 'Left Hand Right Hand', 'Twilight', 'What I Was Taught', 'Dark Into Light'],
    price: 500, fansBoost: 200, fameBoost: 15, owned: false,
  },
  {
    id: 'alb-2', title: 'UNTIL DEATH CALL MY NAME', artist: 'YB', year: '2018',
    tracks: ['Outside Today', 'Diamond Teeth Samurai', 'Overdose', 'Preach', 'Astronaut Kid', 'We Poppin', 'Right or Wrong'],
    price: 600, fansBoost: 300, fameBoost: 20, owned: false,
  },
  {
    id: 'alb-3', title: 'AI YOUNGBOY 2', artist: 'YB', year: '2019',
    tracks: ['Self Control', 'Carter Son', 'Lonely Child', 'Slime Mentality', 'Make No Sense', 'Fine By Time', 'Red Eye', 'Time I\'m On'],
    price: 700, fansBoost: 400, fameBoost: 25, owned: false,
  },
  {
    id: 'alb-4', title: 'TOP', artist: 'YB', year: '2020',
    tracks: ['Drug Addiction', 'My Window', 'Lil Top', 'All In', 'House Arrest Tingz', 'Bandit', 'Dead Trollz', 'Callin'],
    price: 800, fansBoost: 500, fameBoost: 30, owned: false,
  },
  {
    id: 'alb-5', title: 'SINCERELY KENTRELL', artist: 'YB', year: '2021',
    tracks: ['Life Support', 'Toxic Punk', 'Nevada', 'On My Side', 'Forgiato', 'Break Or Make Me', 'Kickstand', 'Rich Shit'],
    price: 900, fansBoost: 600, fameBoost: 35, owned: false,
  },
  {
    id: 'alb-6', title: 'THE LAST SLIMETO', artist: 'YB', year: '2022',
    tracks: ['Mr. Grim Reaper', 'I Got The Bag', 'Vette Motors', 'Purge Me', 'Gangsta', 'Know Like I Know', 'Proof', 'My Killa'],
    price: 1000, fansBoost: 700, fameBoost: 40, owned: false,
  },
  {
    id: 'alb-7', title: 'RICHEST OPP', artist: 'YB', year: '2023',
    tracks: ['F*ck Da Industry', 'Catch Him', 'Ryte Night', 'Put It On Me', 'Dope Lamp', 'War', 'Demons', 'Level I Want'],
    price: 1200, fansBoost: 800, fameBoost: 45, owned: false,
  },
  {
    id: 'alb-8', title: 'NEVER BROKE AGAIN: THE COMPILATION', artist: 'NBA', year: '2024',
    tracks: ['Movement', 'Stack It Up', 'Ride or Die', 'Crew Love', 'Block Party', 'Empire State', 'GraveDigger Anthem', 'Final Chapter'],
    price: 2000, fansBoost: 1500, fameBoost: 60, owned: false,
  },
];
