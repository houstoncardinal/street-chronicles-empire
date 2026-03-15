import { VehicleItem, WeaponItem, MusicAlbum, ToolItem } from '@/types/game';

export const VEHICLES: VehicleItem[] = [
  // Classic street cars
  { id: 'v-hellcat',    name: 'HELLCAT',       type: 'car',       price: 2000,  speed: 95, handling: 70, description: 'Supercharged muscle. King of the streets.', color: '#1a1a2e', customization: { paintColor: '#1a1a2e', rims: 'stock', engine: 'stock', neon: false } },
  { id: 'v-trackhawk',  name: 'TRACKHAWK',     type: 'suv',       price: 3500,  speed: 88, handling: 75, description: 'Luxury meets raw power. SUV dominance.', color: '#2d2d44', customization: { paintColor: '#2d2d44', rims: 'stock', engine: 'stock', neon: false } },
  { id: 'v-g-wagon',    name: 'G-WAGON',       type: 'suv',       price: 5000,  speed: 72, handling: 80, description: 'Ultimate status symbol. Built for the boss.', color: '#0f0f0f', customization: { paintColor: '#0f0f0f', rims: 'stock', engine: 'stock', neon: false } },
  { id: 'v-raptor',     name: 'RAPTOR',        type: 'truck',     price: 4000,  speed: 78, handling: 85, description: 'Off-road beast. Eats mountains for breakfast.', color: '#1e3a1e', customization: { paintColor: '#1e3a1e', rims: 'stock', engine: 'stock', neon: false } },
  { id: 'v-snowrunner', name: 'SNOWRUNNER',    type: 'snow',      price: 3000,  speed: 60, handling: 90, description: 'Built for GraveDigger Mountain. Snow chains included.', color: '#2a3a5c', customization: { paintColor: '#2a3a5c', rims: 'stock', engine: 'stock', neon: false } },
  { id: 'v-wraith',     name: 'WRAITH',        type: 'car',       price: 8000,  speed: 98, handling: 65, description: 'Ghost mode. Silent and lethal on the streets.', color: '#1a0a2e', customization: { paintColor: '#1a0a2e', rims: 'stock', engine: 'stock', neon: false } },
  { id: 'v-reaper',     name: 'REAPER',        type: 'car',       price: 6000,  speed: 92, handling: 72, description: 'Custom built. No one outruns the reaper.', color: '#2e0a0a', customization: { paintColor: '#2e0a0a', rims: 'stock', engine: 'stock', neon: false } },
  { id: 'v-viper',      name: 'VIPER',         type: 'motorcycle',price: 1500,  speed: 99, handling: 55, description: 'Two wheels of fury. Lane-split everything.', color: '#ff2222', customization: { paintColor: '#ff2222', rims: 'stock', engine: 'stock', neon: false } },
  { id: 'v-phantom',    name: 'PHANTOM',       type: 'motorcycle',price: 2500,  speed: 96, handling: 60, description: 'Blacked out. You never see it coming.', color: '#111111', customization: { paintColor: '#111111', rims: 'stock', engine: 'stock', neon: false } },
  // Cyberpunk tier
  { id: 'v-neuromancer',name: 'NEUROMANCER',   type: 'cybercar',  price: 12000, speed: 97, handling: 88, description: 'Neural-linked drive system. The city is the circuit.', color: '#001a2e', customization: { paintColor: '#001a2e', rims: 'stock', engine: 'stock', neon: true } },
  { id: 'v-spectre',    name: 'SPECTRE-X',     type: 'cybercar',  price: 18000, speed: 100, handling: 92, description: 'Corporate prototype. Stolen from the grid.', color: '#0a0a1a', customization: { paintColor: '#0a0a1a', rims: 'stock', engine: 'stock', neon: true } },
  { id: 'v-hk-blade',   name: 'BLADE RUNNER',  type: 'hoverbike', price: 9500,  speed: 99, handling: 70, description: 'Mag-lev two-wheeler. Rides the city grid at altitude.', color: '#1a0a2e', customization: { paintColor: '#1a0a2e', rims: 'stock', engine: 'stock', neon: true } },
  { id: 'v-sherpa',     name: 'SHERPA 4x4',    type: 'truck',     price: 4500,  speed: 65, handling: 92, description: 'Mountain expedition vehicle. Goes where roads end.', color: '#3a3a2a', customization: { paintColor: '#3a3a2a', rims: 'stock', engine: 'stock', neon: false } },
];

export const WEAPONS: WeaponItem[] = [
  // Street tier
  { id: 'w-9mm',      name: '9MM CLASSIC',       type: 'pistol',   price: 500,   damage: 25, range: 30, ammoCapacity: 15, description: 'Reliable sidearm. Every hustler needs one.' },
  { id: 'w-deagle',   name: 'DESERT EAGLE',       type: 'pistol',   price: 1500,  damage: 55, range: 35, ammoCapacity: 7,  description: 'Hand cannon. Makes a statement.' },
  { id: 'w-mac10',    name: 'MAC-10',              type: 'rifle',    price: 2000,  damage: 40, range: 25, ammoCapacity: 30, description: 'Spray and pray. Street legend.' },
  { id: 'w-ak',       name: 'DRACO',               type: 'rifle',    price: 3500,  damage: 65, range: 50, ammoCapacity: 30, description: 'Heavy hitter. Territory defense essential.' },
  { id: 'w-pump',     name: 'PUMP ACTION',         type: 'shotgun',  price: 1800,  damage: 80, range: 10, ammoCapacity: 6,  description: 'Close quarters king. One shot, one chance.' },
  { id: 'w-bat',      name: 'LOUISVILLE SLUGGER',  type: 'melee',    price: 200,   damage: 35, range: 3,  ammoCapacity: 999, description: 'Classic street tool. Silent but effective.' },
  { id: 'w-machete',  name: 'MACHETE',             type: 'melee',    price: 350,   damage: 45, range: 2,  ammoCapacity: 999, description: 'Mountain survival blade. Multi-purpose.' },
  { id: 'w-gold-45',  name: 'GOLD .45',            type: 'pistol',   price: 5000,  damage: 60, range: 35, ammoCapacity: 8,  description: 'Custom gold plated. For the boss only.' },
  { id: 'w-vest',     name: 'BODY ARMOR',          type: 'armor',    price: 1200,  damage: 0,  range: 0,  ammoCapacity: 0,  description: 'Kevlar vest. +50 damage reduction.' },
  { id: 'w-tac-vest', name: 'TACTICAL VEST',       type: 'armor',    price: 3000,  damage: 0,  range: 0,  ammoCapacity: 0,  description: 'Military grade. +80 damage reduction.' },
  // Mid-tier additions
  { id: 'w-katana',    name: 'KATANA',              type: 'melee',    price: 3000,  damage: 65, range: 3,  ammoCapacity: 999, description: 'Japanese steel. Silent and surgical in close quarters.' },
  { id: 'w-sniper',    name: 'GHOST SNIPER',        type: 'rifle',    price: 7500,  damage: 90, range: 120, ammoCapacity: 5,  description: 'Long-range precision. One trigger pull, one body bag.' },
  { id: 'w-smg',       name: 'TECH SMG',            type: 'rifle',    price: 4500,  damage: 45, range: 35, ammoCapacity: 45, description: 'High-capacity smart-linked submachine gun. Shreds everything.' },
  { id: 'w-auto-sg',   name: 'AUTO SHOTGUN',        type: 'shotgun',  price: 5500,  damage: 85, range: 15, ammoCapacity: 12, description: 'Semi-auto street sweeper. Clears a room in seconds.' },
  // Cyberpunk tier
  { id: 'w-plasma',    name: 'PLASMA PISTOL',       type: 'energy',   price: 6000,  damage: 70, range: 45, ammoCapacity: 12, description: 'Corp-tech plasma rounds. Cauterizes on impact.' },
  { id: 'w-railgun',   name: 'MICRO RAILGUN',       type: 'energy',   price: 12000, damage: 95, range: 80, ammoCapacity: 5,  description: 'Magnetically-accelerated slug. Punches through walls.' },
  { id: 'w-neuroblade',name: 'NEURO-BLADE',         type: 'melee',    price: 4500,  damage: 75, range: 2,  ammoCapacity: 999, description: 'Neural-linked mono-blade. Reads your intent.' },
  { id: 'w-flamer',    name: 'INCINERATOR',         type: 'energy',   price: 9000,  damage: 80, range: 12, ammoCapacity: 20, description: 'Nano-therm fuel projector. Burns hotter than the sun.' },
  { id: 'w-launcher',  name: 'MICRO LAUNCHER',      type: 'launcher', price: 15000, damage: 100, range: 60, ammoCapacity: 3, description: 'Smart-guided micro-rockets. One-shot problem solver.' },
];

export const TOOLS: ToolItem[] = [
  { id: 't-shovel',    name: 'SHOVEL',            price: 300,  description: 'Dig for hidden stashes and buried loot.',           ability: 'dig',    icon: '⛏️' },
  { id: 't-pickaxe',  name: 'PICKAXE',           price: 500,  description: 'Break through rock walls. Access hidden caves.',    ability: 'mine',   icon: '⛏️' },
  { id: 't-detector', name: 'METAL DETECTOR',    price: 800,  description: 'Scan for buried treasure and caches nearby.',      ability: 'detect', icon: '📡' },
  { id: 't-drill',    name: 'ADVANCED DRILL',    price: 2000, description: 'Breach reinforced doors and safes.',                ability: 'breach', icon: '🔧' },
  { id: 't-flashlight',name: 'TACT FLASHLIGHT',  price: 200,  description: 'See in the dark. Essential for cave exploration.',  ability: 'light',  icon: '🔦' },
  { id: 't-climbing', name: 'CLIMBING GEAR',     price: 1500, description: 'Scale cliffs on GraveDigger Mountain.',             ability: 'climb',  icon: '🧗' },
  { id: 't-survival', name: 'SURVIVAL KIT',      price: 1000, description: 'Reduces cold meter drain by 50%.',                 ability: 'warmth', icon: '🎒' },
  { id: 't-grapple',  name: 'GRAPPLE HOOK',      price: 2500, description: 'Reach inaccessible areas. Swing across gaps.',     ability: 'grapple',icon: '🪝' },
  // Cyber tools
  { id: 't-cyberdeck',name: 'CYBERDECK MK1',     price: 4000, description: 'Hack access panels, cameras, and vehicle locks.',  ability: 'hack',   icon: '💻' },
  { id: 't-scanner',  name: 'OPTIC SCANNER',     price: 3000, description: 'Tag enemies and items through walls up to 30m.',   ability: 'scan',   icon: '👁️' },
  { id: 't-emp',      name: 'EMP GRENADE (x3)',  price: 2200, description: 'Disable electronics and vehicles in 8m radius.',   ability: 'emp',    icon: '💥' },
];

export const MUSIC_CATALOG: MusicAlbum[] = [
  { id: 'alb-1', title: 'AI YOUNGBOY',      artist: 'YB',      year: '2017', tracks: ['No Smoke','Untouchable','GG','Graffiti','Left Hand Right Hand','Twilight','What I Was Taught','Dark Into Light'],                              price: 500,  fansBoost: 200,  fameBoost: 15, owned: false },
  { id: 'alb-2', title: 'UNTIL DEATH CALL MY NAME', artist: 'YB', year: '2018', tracks: ['Outside Today','Diamond Teeth Samurai','Overdose','Preach','Astronaut Kid','We Poppin','Right or Wrong'],                                   price: 600,  fansBoost: 300,  fameBoost: 20, owned: false },
  { id: 'alb-3', title: 'AI YOUNGBOY 2',    artist: 'YB',      year: '2019', tracks: ['Self Control','Carter Son','Lonely Child','Slime Mentality','Make No Sense','Fine By Time','Red Eye','Time I\'m On'],                          price: 700,  fansBoost: 400,  fameBoost: 25, owned: false },
  { id: 'alb-4', title: 'TOP',              artist: 'YB',      year: '2020', tracks: ['Drug Addiction','My Window','Lil Top','All In','House Arrest Tingz','Bandit','Dead Trollz','Callin'],                                          price: 800,  fansBoost: 500,  fameBoost: 30, owned: false },
  { id: 'alb-5', title: 'SINCERELY KENTRELL', artist: 'YB',    year: '2021', tracks: ['Life Support','Toxic Punk','Nevada','On My Side','Forgiato','Break Or Make Me','Kickstand','Rich Shit'],                                       price: 900,  fansBoost: 600,  fameBoost: 35, owned: false },
  { id: 'alb-6', title: 'THE LAST SLIMETO', artist: 'YB',      year: '2022', tracks: ['Mr. Grim Reaper','I Got The Bag','Vette Motors','Purge Me','Gangsta','Know Like I Know','Proof','My Killa'],                                   price: 1000, fansBoost: 700,  fameBoost: 40, owned: false },
  { id: 'alb-7', title: 'RICHEST OPP',      artist: 'YB',      year: '2023', tracks: ['F*ck Da Industry','Catch Him','Ryte Night','Put It On Me','Dope Lamp','War','Demons','Level I Want'],                                         price: 1200, fansBoost: 800,  fameBoost: 45, owned: false },
  { id: 'alb-8', title: 'NEVER BROKE AGAIN: THE COMPILATION', artist: 'NBA', year: '2024', tracks: ['Movement','Stack It Up','Ride or Die','Crew Love','Block Party','Empire State','GraveDigger Anthem','Final Chapter'],           price: 2000, fansBoost: 1500, fameBoost: 60, owned: false },
  { id: 'alb-db-1', title: 'THE BLACK SHEEP', artist: 'DeeBaby', year: '2020', tracks: ['Broken Promises','Never Gon End','Bank Statements & Deposits','Billboard','Marz','California Quarantine','Pain Talkin','H-Town Forever'],   price: 750,  fansBoost: 350,  fameBoost: 22, owned: false },
  { id: 'alb-db-2', title: 'SUPERBAD',       artist: 'DeeBaby', year: '2022', tracks: ['Millions For My Pain','Diamonds On My Wrist','TexaMexian','People\'s Champ','No Smoke (H-Town Mix)','Real Street Sh*t','Outlaw Season','Gates Approved'], price: 950, fansBoost: 500, fameBoost: 32, owned: false },
];

export const PAINT_COLORS = [
  { id: 'black',   name: 'MIDNIGHT BLACK',  hex: '#0a0a0a' },
  { id: 'white',   name: 'ARCTIC WHITE',    hex: '#e8e8e8' },
  { id: 'red',     name: 'BLOOD RED',       hex: '#8b0000' },
  { id: 'blue',    name: 'OCEAN BLUE',      hex: '#1a3a6a' },
  { id: 'green',   name: 'JUNGLE GREEN',    hex: '#1e5a1e' },
  { id: 'gold',    name: 'CHAMPAGNE GOLD',  hex: '#d4a017' },
  { id: 'purple',  name: 'ROYAL PURPLE',    hex: '#4a0080' },
  { id: 'cyan',    name: 'NEON CYAN',       hex: '#00f0d0' },
  { id: 'magenta', name: 'NEON MAGENTA',    hex: '#f000b8' },
  { id: 'orange',  name: 'HOUSTON ORANGE',  hex: '#ff6600' },
  { id: 'chrome',  name: 'CHROME',          hex: '#c0c0c0' },
  { id: 'matte',   name: 'MATTE GREY',      hex: '#3a3a3a' },
];

export const RIM_OPTIONS = [
  { id: 'stock',   name: 'STOCK',        price: 0 },
  { id: 'sport',   name: 'SPORT 20"',    price: 500 },
  { id: 'forgiato',name: 'FORGIATO 22"', price: 1500 },
  { id: 'dub',     name: 'DUB 24"',      price: 2500 },
  { id: 'wire',    name: 'WIRE SPOKE',   price: 800 },
  { id: 'cyber',   name: 'CYBER DISC',   price: 3500 },
];

export const ENGINE_OPTIONS = [
  { id: 'stock',        name: 'STOCK ENGINE',     price: 0,    speedBoost: 0 },
  { id: 'tuned',        name: 'STREET TUNE',       price: 1000, speedBoost: 5 },
  { id: 'turbo',        name: 'TWIN TURBO',        price: 3000, speedBoost: 12 },
  { id: 'supercharged', name: 'SUPERCHARGED',      price: 5000, speedBoost: 18 },
  { id: 'neural',       name: 'NEURAL DRIVE V2',   price: 9000, speedBoost: 25 },
];
