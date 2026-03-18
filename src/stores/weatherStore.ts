// Mutable weather + season + day-night store — read in useFrame without triggering React re-renders

export type WeatherState = 'clear' | 'cloudy' | 'rain' | 'storm' | 'cold';
export type Season = 'spring' | 'summer' | 'fall' | 'winter';

// ── Bayou weather probability per season ────────────────────────────────────
// Summer: hot & sunny dominates — it's Louisiana
// Fall: mix of clear and occasional rain
// Winter: cold + grey, NO rain — cold fog only
// Spring: clear with occasional afternoon showers
export const SEASON_WEATHER: Record<Season, WeatherState[]> = {
  summer: ['clear', 'clear', 'clear', 'clear', 'clear', 'cloudy', 'clear', 'clear'],
  fall:   ['clear', 'cloudy', 'clear', 'clear', 'cloudy', 'rain', 'clear'],
  winter: ['cold', 'cold', 'cold', 'cloudy', 'cold', 'cold'],
  spring: ['clear', 'clear', 'cloudy', 'rain', 'clear', 'clear', 'cloudy'],
};

// Cycle of seasons — summer shows up twice (long bayou summer)
export const SEASON_CYCLE: Season[] = ['spring', 'summer', 'summer', 'fall', 'winter'];

// ── Sky color table by hour ──────────────────────────────────────────────────
// Returns [upperSky, horizon] hex strings
export function getSkyColors(hour: number, season: Season): [string, string] {
  const isWinter = season === 'winter';
  // Night 21-5
  if (hour >= 21 || hour < 5)  return isWinter ? ['#0a0c14', '#0c1020'] : ['#050810', '#080c18'];
  // Dawn 5-6
  if (hour < 6)  return isWinter ? ['#1a2240', '#3a3050'] : ['#1a1440', '#6030a0'];
  // Sunrise 6-7
  if (hour < 7)  return isWinter ? ['#3a4870', '#7060a0'] : ['#d05020', '#f07830'];
  // Morning 7-8
  if (hour < 8)  return isWinter ? ['#4a5878', '#7888a8'] : ['#4070c0', '#88b8e0'];
  // Full day 8-17
  if (hour < 17) return isWinter ? ['#5068a0', '#8898c8'] : ['#2a5fa8', '#87ceeb'];
  // Sunset 17-19
  if (hour < 18) return isWinter ? ['#607090', '#9090b0'] : ['#e05830', '#f09050'];
  if (hour < 19) return isWinter ? ['#3a3858', '#5a4870'] : ['#582878', '#c04060'];
  // Dusk 19-21
  if (hour < 21) return isWinter ? ['#181c30', '#242030'] : ['#180c28', '#200c28'];
  return ['#050810', '#080c18'];
}

// Sun intensity and color by hour
export function getSunData(hour: number, season: Season): { intensity: number; color: string; moonIntensity: number } {
  const isWinter = season === 'winter';
  const winterMult = isWinter ? 0.55 : 1.0;
  if (hour >= 21 || hour < 5)  return { intensity: 0,                             color: '#c8d8ff', moonIntensity: 0.6 };
  if (hour < 6)                return { intensity: 0.3  * winterMult,             color: '#9060c0', moonIntensity: 0.2 };
  if (hour < 7)                return { intensity: 1.5  * winterMult,             color: '#ff8844', moonIntensity: 0   };
  if (hour < 8)                return { intensity: 2.8  * winterMult,             color: '#ffcc88', moonIntensity: 0   };
  if (hour < 17)               return { intensity: 4.2  * winterMult,             color: '#fff8e0', moonIntensity: 0   };
  if (hour < 18)               return { intensity: 3.0  * winterMult,             color: '#ffaa44', moonIntensity: 0   };
  if (hour < 19)               return { intensity: 1.2  * winterMult,             color: '#ff6633', moonIntensity: 0.1 };
  if (hour < 21)               return { intensity: 0.2  * winterMult,             color: '#6633aa', moonIntensity: 0.4 };
  return { intensity: 0, color: '#c8d8ff', moonIntensity: 0.6 };
}

export const weatherStore: {
  state: WeatherState;
  season: Season;
  seasonIdx: number;
  seasonTimer: number;
  rainVisible: boolean;
  cloudOpacity: number;
  fogNear: number;
  fogFar: number;
  ambientIntensity: number;
  sunIntensity: number;
  // Day / night (0–24 game hours; 1 real second = 1 game minute = 1/60 hour)
  // Full day = 24 * 60 = 1440 real seconds = 24 minutes. Fast enough to see cycles.
  dayTime: number;
  isNight: boolean;
  upperSkyHex: string;
  horizonHex: string;
  moonIntensity: number;
} = {
  state: 'clear',
  season: 'summer',
  seasonIdx: 1,        // start on first summer
  seasonTimer: 300,    // 5 real minutes per season
  rainVisible: false,
  cloudOpacity: 0.3,
  fogNear: 80,
  fogFar: 300,
  ambientIntensity: 2.0,
  sunIntensity: 4.2,
  dayTime: 10.0,       // start at 10AM
  isNight: false,
  upperSkyHex: '#2a5fa8',
  horizonHex: '#87ceeb',
  moonIntensity: 0,
};

export function applyWeather(w: WeatherState) {
  weatherStore.state = w;
  weatherStore.rainVisible = w === 'rain' || w === 'storm';
  if (w === 'clear') {
    weatherStore.cloudOpacity = 0.3;
    weatherStore.fogNear = 80;
    weatherStore.fogFar = 300;
    weatherStore.ambientIntensity = 2.0;
  } else if (w === 'cloudy') {
    weatherStore.cloudOpacity = 0.85;
    weatherStore.fogNear = 50;
    weatherStore.fogFar = 180;
    weatherStore.ambientIntensity = 1.4;
  } else if (w === 'rain') {
    weatherStore.cloudOpacity = 0.95;
    weatherStore.fogNear = 20;
    weatherStore.fogFar = 100;
    weatherStore.ambientIntensity = 0.9;
  } else if (w === 'storm') {
    weatherStore.cloudOpacity = 1.0;
    weatherStore.fogNear = 10;
    weatherStore.fogFar = 60;
    weatherStore.ambientIntensity = 0.6;
  } else if (w === 'cold') {
    weatherStore.cloudOpacity = 0.6;
    weatherStore.fogNear = 30;
    weatherStore.fogFar = 130;
    weatherStore.ambientIntensity = 1.1;
    weatherStore.rainVisible = false;
  }
}
