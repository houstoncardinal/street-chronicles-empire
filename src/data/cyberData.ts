import { DrugItem, CafeItem } from '@/types/game';

export const DRUGS: DrugItem[] = [
  {
    id: 'stims', name: 'NEURAL STIMS', tier: 1,
    buyPrice: 40, sellMultiplierMin: 1.6, sellMultiplierMax: 2.4,
    description: 'Low-grade reflex enhancers. Every corner boy has them.',
    riskLevel: 1,
  },
  {
    id: 'icepatch', name: 'ICE PATCH', tier: 2,
    buyPrice: 120, sellMultiplierMin: 1.8, sellMultiplierMax: 2.8,
    description: 'Synthetic pain suppressor. Popular in the clubs.',
    riskLevel: 2,
  },
  {
    id: 'chromedust', name: 'CHROME DUST', tier: 3,
    buyPrice: 350, sellMultiplierMin: 2.0, sellMultiplierMax: 3.2,
    description: 'High-grade neurotransponder. Illegal in six districts.',
    riskLevel: 3,
  },
  {
    id: 'synthblue', name: 'SYNTH BLUE', tier: 4,
    buyPrice: 800, sellMultiplierMin: 2.5, sellMultiplierMax: 4.0,
    description: 'Rare synthetic compound. Corp-exclusive. Move fast.',
    riskLevel: 5,
  },
];

export const CAFE_ITEMS: CafeItem[] = [
  {
    id: 'stim-coffee', name: 'STIM-COFFEE', price: 60,
    buffType: 'speed', buffDuration: 30,
    description: 'Double sprint speed for 30 seconds. Electric.',
    icon: '⚡',
  },
  {
    id: 'neural-jack', name: 'NEURAL JACK', price: 120,
    buffType: 'radar', buffDuration: 60,
    description: 'Enhanced minimap scan — see threats further out for 60s.',
    icon: '📡',
  },
  {
    id: 'synth-meal', name: 'SYNTH MEAL', price: 180,
    buffType: 'heal', buffDuration: 0,
    description: 'Restores 50 HP. Tastes like copper and regret.',
    icon: '🍜',
  },
  {
    id: 'adreno-shot', name: 'ADRENO SHOT', price: 250,
    buffType: 'damage', buffDuration: 30,
    description: '+50% weapon damage for 30 seconds. Heart will thank you later.',
    icon: '💉',
  },
  {
    id: 'ghost-blend', name: 'GHOST BLEND', price: 400,
    buffType: 'stealth', buffDuration: 20,
    description: 'Reduces NPC detection radius for 20s. Stay low.',
    icon: '👁️',
  },
];

// Meetup spot data (used by InteractionPanel)
export const MEETUP_SPOTS = [
  {
    id: 'meetup-club', name: 'CHROME LOUNGE', location: 'Club District',
    description: 'Your crew hangs here when the night is right. Drinks, deals, and debriefs.',
    vibes: ['music', 'drinks', 'connections'],
    moneyBonus: 150,
    relBoost: 8,
  },
  {
    id: 'meetup-rooftop', name: 'SIGNAL ROOFTOP', location: 'Downtown',
    description: 'Above the noise. Where real moves get planned.',
    vibes: ['strategic', 'private', 'high-ground'],
    moneyBonus: 0,
    relBoost: 12,
  },
  {
    id: 'meetup-block', name: "THE BLOCK", location: "H-Town Corner",
    description: "DeeBaby's turf. Where the Houston sound was born.",
    vibes: ['authentic', 'street', 'music'],
    moneyBonus: 200,
    relBoost: 10,
  },
];
