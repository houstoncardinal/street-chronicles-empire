import { Canvas } from '@react-three/fiber';
import { Physics } from '@react-three/rapier';
import { Player } from './Player';
import { CityWorld } from './CityWorld';
import { MountainWorld } from './MountainWorld';
import { CharacterModel } from './CharacterModel';
import { useGame } from '@/context/GameContext';
import { CHARACTERS } from '@/data/characters';
import { Suspense } from 'react';

export function GameCanvas() {
  const { state, dispatch } = useGame();

  return (
    <Canvas
      camera={{ fov: 75, near: 0.1, far: 500 }}
      style={{ width: '100%', height: '100%' }}
      shadows
    >
      <Suspense fallback={null}>
        <Physics key={state.currentRegion} gravity={[0, -20, 0]}>
          {state.currentRegion === 'city' ? <CityWorld /> : <MountainWorld />}
          <Player state={state} dispatch={dispatch} />
        </Physics>

        {/* Characters rendered outside physics (purely visual) */}
        {CHARACTERS.map(char => {
          const charState = state.characterStates[char.id];
          if (!charState) return null;
          // Show in city always, or in mountain only if following
          if (state.currentRegion !== 'city' && !charState.isFollowing) return null;
          return (
            <CharacterModel
              key={char.id}
              character={char}
              isFollowing={charState.isFollowing}
              relationship={charState.relationship}
              currentRegion={state.currentRegion}
            />
          );
        })}
      </Suspense>
    </Canvas>
  );
}
