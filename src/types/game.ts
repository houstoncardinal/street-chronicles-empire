export interface CrewMember {
  id: string;
  name: string;
  role: string;
  loyalty: number;
  strength: number;
  influence: number;
  skill: number;
  avatar: string;
  recruited: boolean;
}

export interface Mission {
  id: string;
  title: string;
  description: string;
  district: string;
  type: 'errand' | 'perform' | 'defend' | 'record' | 'rival';
  difficulty: number;
  rewards: {
    money: number;
    fans: number;
    streetRep: number;
    industryFame: number;
    crewLoyalty: number;
  };
  requiredLevel: number;
  completed: boolean;
  locked: boolean;
}

export interface Song {
  id: string;
  title: string;
  type: 'single' | 'mixtape';
  fans: number;
  fame: number;
  recorded: boolean;
}

export interface District {
  id: string;
  name: string;
  description: string;
  controlled: boolean;
  controlPercent: number;
  unlocked: boolean;
  x: number;
  y: number;
  color: string;
}

export interface CharacterState {
  relationship: number;
  level: number;
  xp: number;
  isFollowing: boolean;
  isRecruited: boolean;
}

export interface GameState {
  playerName: string;
  level: number;
  money: number;
  fans: number;
  streetRep: number;
  industryFame: number;
  crewLoyalty: number;
  crew: CrewMember[];
  missions: Mission[];
  songs: Song[];
  districts: District[];
  completedMissions: number;
  totalTerritories: number;
  activeSection: string;
  currentRegion: 'city' | 'mountain';
  nearInteraction: { type: string; id: string; label: string } | null;
  showPanel: string | null;
  coldMeter: number;
  characterStates: Record<string, CharacterState>;
}

export type GameSection = 'map' | 'missions' | 'crew' | 'studio' | 'reputation' | 'profile';
