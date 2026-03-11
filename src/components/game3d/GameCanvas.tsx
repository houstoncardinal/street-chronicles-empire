import { Canvas } from '@react-three/fiber';
import { Physics } from '@react-three/rapier';
import { Player } from './Player';
import { CityWorld } from './CityWorld';
import { MountainWorld } from './MountainWorld';
import { useGame } from '@/context/GameContext';
import { Suspense } from 'react';

export function GameCanvas() {
  const { state } = useGame();

  return (
    <Canvas
      camera={{ fov: 75, near: 0.1, far: 500 }}
      style={{ width: '100%', height: '100%' }}
      shadows
    >
      <Suspense fallback={null}>
        <Physics key={state.currentRegion} gravity={[0, -20, 0]}>
          {state.currentRegion === 'city' ? <CityWorld /> : <MountainWorld />}
          <Player />
        </Physics>
      </Suspense>
    </Canvas>
  );
}
