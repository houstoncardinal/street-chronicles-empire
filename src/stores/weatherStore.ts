// Simple mutable weather store — read in useFrame without triggering React re-renders
export type WeatherState = 'clear' | 'cloudy' | 'rain' | 'storm';

export const weatherStore: {
  state: WeatherState;
  rainVisible: boolean;
  cloudOpacity: number;
  fogNear: number;
  fogFar: number;
  ambientIntensity: number;
  sunIntensity: number;
} = {
  state: 'clear',
  rainVisible: false,
  cloudOpacity: 0.7,
  fogNear: 60,
  fogFar: 280,
  ambientIntensity: 1.8,
  sunIntensity: 3.0,
};

export const WEATHER_CYCLE: WeatherState[] = ['clear', 'clear', 'cloudy', 'rain', 'cloudy', 'clear'];

export function applyWeather(w: WeatherState) {
  weatherStore.state = w;
  weatherStore.rainVisible = w === 'rain' || w === 'storm';
  if (w === 'clear') {
    weatherStore.cloudOpacity = 0.7;
    weatherStore.fogNear = 60;
    weatherStore.fogFar = 280;
    weatherStore.ambientIntensity = 1.8;
    weatherStore.sunIntensity = 3.0;
  } else if (w === 'cloudy') {
    weatherStore.cloudOpacity = 0.9;
    weatherStore.fogNear = 30;
    weatherStore.fogFar = 160;
    weatherStore.ambientIntensity = 1.2;
    weatherStore.sunIntensity = 1.4;
  } else if (w === 'rain') {
    weatherStore.cloudOpacity = 0.95;
    weatherStore.fogNear = 15;
    weatherStore.fogFar = 90;
    weatherStore.ambientIntensity = 0.8;
    weatherStore.sunIntensity = 0.5;
  } else if (w === 'storm') {
    weatherStore.cloudOpacity = 1.0;
    weatherStore.fogNear = 10;
    weatherStore.fogFar = 60;
    weatherStore.ambientIntensity = 0.5;
    weatherStore.sunIntensity = 0.2;
  }
}
