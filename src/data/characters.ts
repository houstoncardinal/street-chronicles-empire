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
    title: 'THE LEADER',
    role: 'Leader of the movement',
    personality: ['intense', 'strategic', 'loyal', 'focused'],
    abilities: [
      { name: 'Leadership Aura', desc: '+20% crew performance' },
      { name: 'Major Moves', desc: 'Unlocks story missions' },
    ],
    homePosition: [2, 0, -28],
    visual: {
      bodyColor: '#111',
      accentColor: '#FFD700',
      skinColor: '#8B6914',
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
        "This empire won't build itself. Every move counts.",
        "Loyalty is everything out here. Remember that.",
        "The streets are watching. Make every step count.",
        "We building something that's gonna last forever.",
      ],
      recruitAccept: "Let's move. Together we're unstoppable.",
      recruitDeny: "Nah. I don't know you like that yet. Prove yourself first.",
      followStart: "I'm with you. Let's ride.",
      followStop: "I'll be at the headquarters. Come find me.",
      combat: "They want war? Let's give it to them.",
    },
    missionId: 'm-yb',
    recruitThreshold: 40,
  },
  {
    id: 'ben',
    name: 'BEN',
    title: 'THE STRATEGIST',
    role: 'Mastermind planner',
    personality: ['calm', 'calculating', 'observant', 'tactical'],
    abilities: [
      { name: 'Tactical Mind', desc: '+15% mission rewards' },
      { name: 'Risk Reduction', desc: 'Lowers mission difficulty' },
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
        low: "State your business. I don't have time for unknowns.",
        mid: "Good timing. I've been analyzing our next move.",
        high: "The best strategist needs the best operator. That's us.",
      },
      missionIntro: "I've mapped out every angle. This operation requires precision. Here's the plan.",
      casual: [
        "Every chess piece has its role. Know yours.",
        "I've calculated seventeen possible outcomes. We win in twelve.",
        "Information is more valuable than money. Remember that.",
        "The smartest move is the one they don't see coming.",
      ],
      recruitAccept: "A calculated decision. We'll work well together.",
      recruitDeny: "The data doesn't support this partnership yet.",
      followStart: "I'll observe and advise. Let's move.",
      followStop: "I'll be in the planning room. I have models to run.",
      combat: "They made a tactical error engaging us.",
    },
    missionId: 'm-ben',
    recruitThreshold: 35,
  },
  {
    id: 'rondo',
    name: 'RONDO',
    title: 'THE PERFORMER',
    role: 'Music performer & crowd influencer',
    personality: ['energetic', 'emotional', 'charismatic', 'creative'],
    abilities: [
      { name: 'Crowd Control', desc: '+30% fan growth' },
      { name: 'Stage Presence', desc: 'Unlocks performance missions' },
    ],
    homePosition: [35, 0, -33],
    visual: {
      bodyColor: '#2a0a2a',
      accentColor: '#ff4488',
      skinColor: '#8B6914',
      heightScale: 0.98,
      accessory: 'mic',
      buildType: 'lean',
    },
    dialogue: {
      greeting: {
        low: "Yo, you look lost. This ain't a spot for tourists.",
        mid: "Aye! My guy. You tryna hit the studio?",
        high: "There he is! My day one! Let's make some noise!",
      },
      missionIntro: "I got a show lined up. The crowd's gonna be insane. I need you there.",
      casual: [
        "Music is the weapon. The beat is the battlefield.",
        "Every song I drop is a chapter in the story.",
        "The fans feel the energy. You can't fake that.",
        "Studio sessions at 3 AM hit different.",
      ],
      recruitAccept: "Let's go! We about to take over every stage in the city!",
      recruitDeny: "I rock with real ones only. Not there yet.",
      followStart: "Bet! Let's go make some memories!",
      followStop: "I'll be at the club. Come find me when it's showtime.",
      combat: "They interrupting my set? Big mistake.",
    },
    missionId: 'm-rondo',
    recruitThreshold: 30,
  },
  {
    id: 'timm',
    name: 'TIMM',
    title: 'THE ENFORCER',
    role: 'Security & protection',
    personality: ['quiet', 'loyal', 'fearless', 'protective'],
    abilities: [
      { name: 'Iron Guard', desc: '+25% defense in territory' },
      { name: 'Bodyguard', desc: 'Protects crew members' },
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
        mid: "*nods* ...You're good. I've been watching you.",
        high: "I got your back. Always. No questions asked.",
      },
      missionIntro: "Someone's been making moves on our territory. Time to handle it.",
      casual: [
        "Silence says more than words.",
        "I don't talk. I act.",
        "Every corner has eyes. I see all of them.",
        "Loyalty isn't spoken. It's proven.",
      ],
      recruitAccept: "...*nods* ...I'm in. Let's move.",
      recruitDeny: "...*stares* ...Not yet.",
      followStart: "*falls into position behind you*",
      followStop: "*posts up at the entrance*",
      combat: "Finally.",
    },
    missionId: 'm-timm',
    recruitThreshold: 45,
  },
  {
    id: 'herm',
    name: 'HERM',
    title: 'THE CONNECTOR',
    role: 'Morale builder & connector',
    personality: ['humorous', 'loyal', 'social', 'energetic'],
    abilities: [
      { name: 'Rally Cry', desc: '+20% crew loyalty' },
      { name: 'Network', desc: 'Unlocks crew recruitment missions' },
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
        low: "Aye who's this? You rolling with us or what?",
        mid: "My guy! What's the word? You always bringing energy!",
        high: "THERE HE IS! The whole squad's here now! Let's gooo!",
      },
      missionIntro: "Yo I found some new people who wanna join up. Help me bring 'em in?",
      casual: [
        "Man, this crew is family. For real for real.",
        "Vibes are everything. Bad vibes? I don't know her.",
        "I keep the energy up so nobody loses focus.",
        "Every person in this crew has a story. I know 'em all.",
      ],
      recruitAccept: "YES! Let's gooo! The crew just got stronger!",
      recruitDeny: "Hmm, give it a minute. I'm still reading your energy.",
      followStart: "Say less! I'm right behind you!",
      followStop: "I'll keep the vibes going here. Come back!",
      combat: "Ain't nobody messing with the family!",
    },
    missionId: 'm-herm',
    recruitThreshold: 25,
  },
  {
    id: 'porter',
    name: 'PORTER',
    title: 'THE ENTREPRENEUR',
    role: 'Money strategist & businessman',
    personality: ['ambitious', 'business-minded', 'flashy', 'confident'],
    abilities: [
      { name: 'Money Moves', desc: '+25% cash from missions' },
      { name: 'Hidden Markets', desc: 'Unlocks money stash locations' },
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
        low: "You got a business proposition? Otherwise, I'm busy.",
        mid: "I've been hearing about your moves. Smart plays.",
        high: "Partner! We're about to make more money than God.",
      },
      missionIntro: "I've got a deal that's worth millions. But I need someone I trust.",
      casual: [
        "Money isn't the goal. It's the tool.",
        "Every dollar has a story. Make yours legendary.",
        "The best investment? People who are loyal.",
        "I see opportunity where others see problems.",
      ],
      recruitAccept: "Smart investment on both our parts. Let's build.",
      recruitDeny: "The numbers don't add up yet. Show me more ROI.",
      followStart: "Time is money. Let's make both.",
      followStop: "I'll be in the business district. Opportunities don't wait.",
      combat: "You just made the most expensive mistake of your life.",
    },
    missionId: 'm-porter',
    recruitThreshold: 50,
  },
];
