export interface CharacterVisual {
  bodyColor: string;
  accentColor: string;
  skinColor: string;
  heightScale: number;
  accessory: 'chain' | 'glasses' | 'mic' | 'vest' | 'cap' | 'tie';
  buildType: 'lean' | 'medium' | 'stocky';
}

export interface CharacterDialogue {
  greeting: { low: string; mid: string; high: string };
  missionIntro: string;
  casual: string[];
  recruitAccept: string;
  recruitDeny: string;
  followStart: string;
  followStop: string;
  combat: string;
}

export interface CharacterDef {
  id: string;
  name: string;
  title: string;
  role: string;
  // What this character actually DOES for you in the game world
  purpose: string;
  // Unique gameplay mechanic they unlock or provide
  specialization: string;
  unlocks: string[];
  personality: string[];
  abilities: { name: string; desc: string }[];
  homePosition: [number, number, number];
  visual: CharacterVisual;
  dialogue: CharacterDialogue;
  missionId: string;
  recruitThreshold: number;
}

export function getRelationshipLevel(value: number): string {
  if (value <= 20) return 'DISTRUST';
  if (value <= 40) return 'NEUTRAL';
  if (value <= 60) return 'FRIEND';
  if (value <= 80) return 'TRUSTED CREW';
  return 'BROTHERHOOD';
}

export function getRelationshipTier(value: number): 'low' | 'mid' | 'high' {
  if (value <= 35) return 'low';
  if (value <= 65) return 'mid';
  return 'high';
}

export const CHARACTERS: CharacterDef[] = [
  {
    id: 'yb',
    name: 'YB',
    title: 'THE GENERAL',
    role: 'Commander of the movement',
    purpose: 'Gives the main story missions that push the narrative forward. Each conversation unlocks a new region of the city or escalates the war with rivals. He is your mission board for the biggest plays.',
    specialization: 'STORY GATEKEEPER',
    unlocks: ['Main campaign missions', 'Region unlock codes', 'Rival boss locations', '+20% reward on all missions while recruited'],
    personality: ['intense', 'strategic', 'loyal', 'focused'],
    abilities: [
      { name: 'General\'s Orders', desc: 'Unlocks the next story mission in the campaign chain' },
      { name: 'Call to Arms', desc: 'Temporarily spawns 2 allied combat NPCs to fight alongside you (60 sec)' },
      { name: 'Command Bonus', desc: '+20% money & street rep from every completed mission' },
    ],
    homePosition: [2, 0, -28],
    visual: {
      bodyColor: '#0d0d0d',
      accentColor: '#FFD700',
      skinColor: '#8B5E3C',
      heightScale: 1.05,
      accessory: 'chain',
      buildType: 'lean',
    },
    dialogue: {
      greeting: {
        low: "Who sent you? You better have a reason to be here.",
        mid: "What's good. You been putting in work. I see you.",
        high: "My brother. The movement wouldn't be the same without you.",
      },
      missionIntro: "I got something big planned. This changes everything. You ready?",
      casual: [
        "Every move we make is calculated. Nothing is random.",
        "Loyalty runs the whole operation. Break that and everything falls.",
        "I've been watching the whole city. I know where the money is.",
        "They think they can stop this movement? They don't understand what we built.",
      ],
      recruitAccept: "You're official now. Follow my lead and we eat together.",
      recruitDeny: "Nah. I don't know you like that yet. Prove yourself first.",
      followStart: "I'm with you. Let's move.",
      followStop: "I'll be at headquarters. Come find me when it's time.",
      combat: "They want war? We built for this.",
    },
    missionId: 'm-yb',
    recruitThreshold: 40,
  },
  {
    id: 'ben',
    name: 'BEN',
    title: 'THE ARMORER',
    role: 'Weapons & tactical upgrades specialist',
    purpose: 'Your weapons dealer and combat strategist. Talk to Ben to unlock weapon upgrades, tactical loadouts, and intel on enemy positions. He reveals the locations of rival stash houses and reduces mission difficulty by 1 tier when recruited.',
    specialization: 'WEAPONS & INTEL',
    unlocks: ['Weapon upgrade tree', 'Enemy stash house map markers', 'Tactical loadout slots', 'Mission difficulty reduction'],
    personality: ['calm', 'calculating', 'observant', 'tactical'],
    abilities: [
      { name: 'Arms Deal', desc: 'Reveals 3 hidden weapon stash locations on the map' },
      { name: 'Intel Drop', desc: 'Marks all active enemy positions for 90 seconds' },
      { name: 'Tactical Edge', desc: 'Reduces incoming damage by 15% during missions' },
    ],
    homePosition: [-5, 0, -32],
    visual: {
      bodyColor: '#0a1a2a',
      accentColor: '#4488ff',
      skinColor: '#7a5c3a',
      heightScale: 0.95,
      accessory: 'glasses',
      buildType: 'medium',
    },
    dialogue: {
      greeting: {
        low: "State your business. I don't deal with unknowns.",
        mid: "Good timing. I've been running the numbers on your next move.",
        high: "Perfect. I have three new loadouts ready for you.",
      },
      missionIntro: "I've mapped every exit, every guard rotation, every blind spot. Here's the plan.",
      casual: [
        "The right weapon changes everything. Let me show you what I have.",
        "I've tracked seventeen rival stash locations. We can hit two tonight.",
        "Information is the most powerful weapon. And I have all of it.",
        "Never walk into a fight without knowing the layout. That's how you win.",
      ],
      recruitAccept: "Smart. I'll keep your loadout sharp.",
      recruitDeny: "The data doesn't support this arrangement yet.",
      followStart: "I'll call out enemy positions as we move.",
      followStop: "I'll be running analysis. Find me when you need intel.",
      combat: "Predicted this. Twelve o'clock, two tangos.",
    },
    missionId: 'm-ben',
    recruitThreshold: 35,
  },
  {
    id: 'rondo',
    name: 'RONDO',
    title: 'THE PERFORMER',
    role: 'Music career manager & studio gatekeeper',
    purpose: 'Runs the music side of the empire. Talk to Rondo to unlock studio sessions, live performance missions, and fan-building activities. Every show you do with Rondo multiplies your fan count. He also books club appearances that earn passive income.',
    specialization: 'MUSIC CAREER',
    unlocks: ['Studio recording sessions', 'Live show missions (x3 fan multiplier)', 'Club appearance bookings', 'Passive fan income while recruited'],
    personality: ['energetic', 'emotional', 'charismatic', 'creative'],
    abilities: [
      { name: 'Stage Presence', desc: 'Next performance mission pays 3x fans' },
      { name: 'Radio Push', desc: '+500 fans immediately when activated' },
      { name: 'Club Network', desc: 'Unlocks 3 club appearance missions worth $800 each' },
    ],
    homePosition: [35, 0, -33],
    visual: {
      bodyColor: '#2a0a2a',
      accentColor: '#ff4488',
      skinColor: '#6B4226',
      heightScale: 0.98,
      accessory: 'mic',
      buildType: 'lean',
    },
    dialogue: {
      greeting: {
        low: "Yo, you don't look like you're about this life. What you want?",
        mid: "Aye! You caught me right on time. Studio session in an hour.",
        high: "THERE HE IS! My day one! You know what time it is — let's record.",
      },
      missionIntro: "I got a show lined up and the crowd is going to be INSANE. I need you there keeping things smooth.",
      casual: [
        "Music is the weapon. The beat is the battlefield.",
        "Every bar I drop tells part of the story. You in it too.",
        "The fans feel everything. Authenticity can't be faked.",
        "I booked three shows this week. We need to be ready.",
      ],
      recruitAccept: "Let's go! Every stage in the city is about to know our name!",
      recruitDeny: "I only rock with real ones. Not there yet.",
      followStart: "Bet! Let's go make some memories out here.",
      followStop: "I'll be at the club. Come find me when it's showtime.",
      combat: "They interrupting my grind? Nah.",
    },
    missionId: 'm-rondo',
    recruitThreshold: 30,
  },
  {
    id: 'timm',
    name: 'TIMM',
    title: 'THE BODYGUARD',
    role: 'Personal protection & wanted level management',
    purpose: 'Timm keeps the heat off you. When recruited, he reduces your wanted level by 1 star every 30 seconds and takes damage before you do. Talk to him to access safe house locations, bribe contacts, and protection racket missions.',
    specialization: 'PROTECTION & HEAT REDUCTION',
    unlocks: ['Safe house network (3 locations)', 'Wanted level reduction passive', 'Bribe contact missions', 'Damage buffer (absorbs first hit each fight)'],
    personality: ['quiet', 'loyal', 'fearless', 'protective'],
    abilities: [
      { name: 'Iron Guard', desc: 'Absorbs the next 3 hits that would damage you (recharges between fights)' },
      { name: 'Clean Sweep', desc: 'Removes 2 wanted stars immediately' },
      { name: 'Safe House', desc: 'Instantly teleports you to the nearest safe location' },
    ],
    homePosition: [5, 0, -25],
    visual: {
      bodyColor: '#0a0a0a',
      accentColor: '#555',
      skinColor: '#6B4226',
      heightScale: 1.1,
      accessory: 'vest',
      buildType: 'stocky',
    },
    dialogue: {
      greeting: {
        low: "...",
        mid: "*nods* ...You're clear. I've been watching.",
        high: "I got your back. No matter what. No questions asked.",
      },
      missionIntro: "Someone's been making moves on our perimeter. We handle it tonight. Quiet.",
      casual: [
        "...",
        "Silence means safety.",
        "Three entrances on this block. I've covered all of them.",
        "They've been watching since Tuesday. I've been watching them longer.",
      ],
      recruitAccept: "...*nods* ...You're covered.",
      recruitDeny: "...*stares* ...Not yet.",
      followStart: "*falls into position* Let's move.",
      followStop: "*posts up at the nearest corner*",
      combat: "Finally.",
    },
    missionId: 'm-timm',
    recruitThreshold: 45,
  },
  {
    id: 'herm',
    name: 'HERM',
    title: 'THE SCOUT',
    role: 'Intel broker & crew recruitment hub',
    purpose: 'Herm is your eyes on the street. Talk to him to get intel on rival movements, unlock side missions, and recruit new crew members. He updates your minimap with enemy patrol routes and mission bonus objectives that double your reward.',
    specialization: 'INTEL & SIDE MISSIONS',
    unlocks: ['Rival patrol map overlays', 'Crew recruitment side missions', 'Bonus objective markers (2x reward)', 'New contact introductions'],
    personality: ['humorous', 'loyal', 'social', 'energetic'],
    abilities: [
      { name: 'Street Eyes', desc: 'Reveals all enemy patrols and rival activity for 2 minutes' },
      { name: 'Bonus Intel', desc: 'Next mission has a secret bonus objective worth 2x normal reward' },
      { name: 'Crew Hook', desc: 'Unlocks a new crew member recruitment mission' },
    ],
    homePosition: [-15, 0, -20],
    visual: {
      bodyColor: '#0a1a0a',
      accentColor: '#44ff44',
      skinColor: '#8B6914',
      heightScale: 0.95,
      accessory: 'cap',
      buildType: 'medium',
    },
    dialogue: {
      greeting: {
        low: "Aye who's this? You rolling with us or nah?",
        mid: "My guy! I got something for you. You're gonna want to hear this.",
        high: "THERE HE IS! Brother I've been waiting for you — I got MAJOR intel.",
      },
      missionIntro: "I found some new faces who want in. But first I need you to prove it's safe for them to link up.",
      casual: [
        "I know everybody on these blocks. And I mean EVERYBODY.",
        "Rival crew just switched up their route. I clocked it this morning.",
        "There's a bonus objective on the next run nobody knows about. I'll tell you.",
        "I keep the energy up so nobody loses their edge.",
      ],
      recruitAccept: "YES! The whole squad just got sharper!",
      recruitDeny: "Hmm. Give it a minute. I'm still reading you.",
      followStart: "Say less! I'm spotting for you the whole way.",
      followStop: "I'll post up and keep watch. Come back when you need the drop.",
      combat: "Ain't nobody touching the family!",
    },
    missionId: 'm-herm',
    recruitThreshold: 25,
  },
  {
    id: 'porter',
    name: 'PORTER',
    title: 'THE BANKER',
    role: 'Money multiplication & property empire',
    purpose: 'Porter runs the financial side. Talk to him to invest money for returns, buy properties that generate passive cash, and access high-value business deal missions. When recruited, he doubles the cash payout on all completed missions.',
    specialization: 'MONEY & INVESTMENTS',
    unlocks: ['Property purchase missions', 'Money investment (2x return in 10 min)', 'Business deal missions ($5k+)', '2x mission cash payout while recruited'],
    personality: ['ambitious', 'business-minded', 'flashy', 'confident'],
    abilities: [
      { name: 'Double Down', desc: 'Next mission cash reward is doubled' },
      { name: 'Investment Flip', desc: 'Invest $500 now, receive $1200 in 10 real minutes' },
      { name: 'Property Connect', desc: 'Unlocks 2 property buyout missions generating $200/min passive income' },
    ],
    homePosition: [25, 0, -40],
    visual: {
      bodyColor: '#1a1a1a',
      accentColor: '#FFD700',
      skinColor: '#7a5c3a',
      heightScale: 1.0,
      accessory: 'tie',
      buildType: 'lean',
    },
    dialogue: {
      greeting: {
        low: "You got a proposition? Otherwise I don't have time.",
        mid: "I've been watching your numbers. Smart plays. Let's talk.",
        high: "Partner. You and me are about to be the wealthiest people in this city.",
      },
      missionIntro: "I have a deal worth seven figures. I need someone I can trust completely. You're it.",
      casual: [
        "Money is a tool. Most people treat it like a goal. That's why they're broke.",
        "I have three properties generating income right now. Want in on the next one?",
        "Every dollar I touch multiplies. That's not luck — it's systems.",
        "The best investment? People who won't fold under pressure.",
      ],
      recruitAccept: "Smart investment on both our parts. Let's build.",
      recruitDeny: "The numbers don't support it yet. Bring me more results.",
      followStart: "Time is money. You have my attention. Move.",
      followStop: "I'll be running numbers. Come back ready to close a deal.",
      combat: "You just made the most expensive mistake of your life.",
    },
    missionId: 'm-porter',
    recruitThreshold: 50,
  },
  {
    id: 'deebaby',
    name: 'DEEBABY',
    title: "THE ENFORCER",
    role: 'Combat specialist & territory war general',
    purpose: 'DeeBaby runs the combat operations. Talk to him to get high-risk territory takeover missions, access to heavy weapons drops, and war contracts that pay large. He coordinates drive-by raids and defend missions. When recruited, enemy NPCs take +30% damage from you.',
    specialization: 'COMBAT OPERATIONS',
    unlocks: ['Territory war missions', 'Heavy weapons drop coordinates', 'Drive-by raid missions', '+30% enemy damage dealt while recruited'],
    personality: ['melodic', 'emotional', 'proud', 'loyal', 'real'],
    abilities: [
      { name: "War Ready", desc: 'Spawns a weapons cache nearby with 3 rare weapons' },
      { name: 'Suppressive Fire', desc: 'All enemies in the current zone are pinned (slowed 50%) for 20 seconds' },
      { name: 'H-Town Backup', desc: 'Calls in 3 heavy allied NPCs for 90 seconds' },
    ],
    homePosition: [-30, 0, 20],
    visual: {
      bodyColor: '#1a0a00',
      accentColor: '#ff6600',
      skinColor: '#7B4022',
      heightScale: 1.02,
      accessory: 'chain',
      buildType: 'medium',
    },
    dialogue: {
      greeting: {
        low: "Bro who are you? You gotta earn your spot out here.",
        mid: "Aye. I've seen you hold it down. That means something.",
        high: "That's my brother. Real recognizes real. Let's get to work.",
      },
      missionIntro: "I got a war contract on the east side. High payout, high stakes. I need somebody with no fear. You in?",
      casual: [
        "I come from nothing. That's where the hunger comes from.",
        "Every block we take, we hold. No retreat.",
        "They can't match our firepower AND our loyalty. That's the difference.",
        "I've been through real pain, bro. That's why I don't fold.",
        "Houston built me. This bayou sharpened me. I'm ready for anything.",
      ],
      recruitAccept: "Let's ride. Till the wheels fall off, bro.",
      recruitDeny: "Not yet. Show me you're built for real combat.",
      followStart: "Say less. I'm right here. Let's move.",
      followStop: "I'll hold the block down. Come back when it's time.",
      combat: "They picked the wrong day to pull up.",
    },
    missionId: 'm-deebaby',
    recruitThreshold: 40,
  },
  {
    id: 'quando',
    name: 'QUANDO',
    title: 'THE TRAPPER',
    role: 'Territory control & trap network operator',
    purpose: 'Quando controls the trap network — the passive income engine of the city. Talk to him to set up trap points across the map that generate cash over time, and to access block defense missions. He also has access to covert contracts that bypass police attention.',
    specialization: 'TERRITORY & PASSIVE INCOME',
    unlocks: ['Trap point setup missions (passive $100/min each)', 'Block defense contracts', 'Covert missions (0 wanted stars)', 'Territory control percentage bonuses'],
    personality: ['cold', 'loyal', 'ruthless', 'streetwise'],
    abilities: [
      { name: 'Trap Set', desc: 'Plants a trap income point at your current location — earns $100/min passively' },
      { name: 'Ghost Mode', desc: 'Wanted level cannot increase for 60 seconds' },
      { name: 'Cold World', desc: 'Unlocks the most dangerous high-reward contract on the map' },
    ],
    homePosition: [18, 0, 14],
    visual: {
      bodyColor: '#1a0608',
      accentColor: '#ff2244',
      skinColor: '#6B3A2A',
      heightScale: 1.06,
      accessory: 'chain',
      buildType: 'lean',
    },
    dialogue: {
      greeting: {
        low: "I don't know you. Keep moving.",
        mid: "You still out here? Respect. Most don't last this long.",
        high: "My brother. These blocks already know your name. Let's move.",
      },
      missionIntro: "I need somebody to set up three new trap points before sunrise. No noise. You with me?",
      casual: [
        "Cold world out here. Stay sharp or get caught slipping.",
        "Every block I own is locked in. Nobody moves unless I say so.",
        "I been through too much to fold over nothing.",
        "The trap don't sleep. I don't either.",
        "Loyalty is the only currency that actually matters.",
      ],
      recruitAccept: "Bet. You ride, I ride. No questions.",
      recruitDeny: "Not yet. Show me you understand how this works.",
      followStart: "Right behind you. Silent.",
      followStop: "I'll hold the network down. Come back when it's time.",
      combat: "They knew what this was.",
    },
    missionId: 'm-quando',
    recruitThreshold: 45,
  },
  {
    id: 'lultimm',
    name: 'LUL TIMM',
    title: 'THE PLUG',
    role: 'Exclusive gear & industry clout broker',
    purpose: 'Lul Timm has access to things nobody else can get you — exclusive drip drops, industry connections, platinum recording opportunities, and social clout missions that spike your fame. Talk to him to access the best non-combat upgrades in the game.',
    specialization: 'EXCLUSIVE GEAR & FAME',
    unlocks: ['Exclusive outfit & gear drops', 'Platinum recording sessions (10x fame)', 'Social media mission chain (viral clout)', 'Industry contact missions worth $10k+'],
    personality: ['eccentric', 'fearless', 'creative', 'rebellious'],
    abilities: [
      { name: 'Alien Drop', desc: 'Gives you an exclusive outfit set that boosts industry fame by +200' },
      { name: 'Platinum Session', desc: 'Next studio session earns 10x industry fame instead of normal' },
      { name: 'Viral Moment', desc: 'Instantly +2000 fans and unlocks a viral follow-up mission' },
    ],
    homePosition: [-18, 0, 12],
    visual: {
      bodyColor: '#0a0a2e',
      accentColor: '#00f0d0',
      skinColor: '#C68642',
      heightScale: 0.97,
      accessory: 'chain',
      buildType: 'lean',
    },
    dialogue: {
      greeting: {
        low: "You don't even know who I am yet, do you?",
        mid: "Aye, you got taste. That's rare out here.",
        high: "There go my people! The city is ours. Let's go absolutely crazy.",
      },
      missionIntro: "I need somebody with zero fear. I got a session that's about to change everything — and I need it protected.",
      casual: [
        "I got gear nobody else in the city can touch. Come talk to me.",
        "Fashion, music, life — it's all one art form.",
        "They told me I was too different. I turned that into $10 million.",
        "The drip is the flex. The mind is the weapon.",
        "I been operating on a different frequency since day one.",
      ],
      recruitAccept: "You passed the vibe check. Let's create something that lasts forever.",
      recruitDeny: "Nah you ain't on my frequency yet. Level up first.",
      followStart: "Say less. I'm already moving.",
      followStop: "I'll be in the studio. Come find me when the energy is right.",
      combat: "I don't run from anything. Never have, never will.",
    },
    missionId: 'm-lultimm',
    recruitThreshold: 35,
  },
];
