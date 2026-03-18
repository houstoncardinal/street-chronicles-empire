import { Canvas } from '@react-three/fiber';
import { Physics } from '@react-three/rapier';
import * as THREE from 'three';
import { Player } from './Player';
import { ChippewaWorld } from './ChippewaWorld';
import { NorthBlvd } from './NorthBlvd';
import { DowntownDistrict } from './DowntownDistrict';
import { CortanaMall } from './CortanaMall';
import { WestSuburbs } from './WestSuburbs';
import { Highway110 } from './Highway110';
import { MountainWorld } from './MountainWorld';
import { BayouWorld } from './BayouWorld';
import { CharacterModel } from './CharacterModel';
import { EnemyNPC, ENEMY_SPAWNS } from './EnemyNPC';
import { useGame } from '@/context/GameContext';
import { CHARACTERS } from '@/data/characters';
import { Suspense, useState, useEffect } from 'react';
import { LoadingScreen } from './LoadingScreen';
import { FirstPersonWeapon } from './FirstPersonWeapon';
import { spawnEnemy } from '@/stores/enemyStore';
import { BuildingInteriors } from './BuildingInteriors';
import { PoliceSystem } from './PoliceSystem';
import { PedestrianSystem } from './PedestrianSystem';
import { WeaponEffects } from './WeaponEffects';
import { DynamicEvents } from './DynamicEvents';
import { WorldModels } from './WorldModels';

export function GameCanvas() {
  const { state, dispatch } = useGame();
  const [isLoading, setIsLoading] = useState(true);

  // Seed enemy store on mount
  useEffect(() => {
    ENEMY_SPAWNS.forEach(s => spawnEnemy(s.id, s.x, 0, s.z));
  }, []);

  // Render the appropriate world based on current region
  const renderWorld = () => {
    switch (state.currentRegion) {
      case 'city':
        return (
          <>
            <ChippewaWorld />
            <NorthBlvd />
            <DowntownDistrict />
            <CortanaMall />
            <WestSuburbs />
            <Highway110 />
          </>
        );
      case 'mountain':
        return <MountainWorld />;
      case 'bayou':
        return <BayouWorld />;
      default:
        return (
          <>
            <ChippewaWorld />
            <NorthBlvd />
            <DowntownDistrict />
            <CortanaMall />
            <WestSuburbs />
            <Highway110 />
          </>
        );
    }
  };

  return (
    <>
      {isLoading && <LoadingScreen onLoadingComplete={() => setIsLoading(false)} />}
      <Canvas
        camera={{ fov: 85, near: 0.01, far: 500 }}
        style={{ width: '100%', height: '100%' }}
        dpr={[1.0, 1.2]}
        gl={{
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.2,
          antialias: false,
          powerPreference: 'high-performance',
        }}
      >
        <color attach="background" args={['#87ceeb']} />

        <Suspense fallback={null}>
          <Physics key={state.currentRegion} gravity={[0, -20, 0]}>
            {renderWorld()}
            <Player state={state} dispatch={dispatch} />
            {/* Building interiors — always present (far from main world) */}
            <BuildingInteriors />
          </Physics>

          {/* First Person Weapon */}
          <FirstPersonWeapon weaponId={state.equippedWeapon} />

          {/* Weapon effects — muzzle flash, bullet tracers, impact sparks */}
          <WeaponEffects />

          {/* 3D model inhabitants — city only */}
          {state.currentRegion === 'city' && <WorldModels />}

          {/* Enemy NPCs — only in city region */}
          {state.currentRegion === 'city' && ENEMY_SPAWNS.map(s => (
            <EnemyNPC key={s.id} id={s.id} spawnX={s.x} spawnZ={s.z} />
          ))}

          {/* Police system — spawns officers based on wanted level */}
          {state.currentRegion === 'city' && (
            <PoliceSystem
              wantedLevel={state.wantedLevel}
              onDamagePlayer={(amount) => dispatch({ type: 'TAKE_DAMAGE', amount })}
            />
          )}

          {/* Ambient pedestrians — city only */}
          {state.currentRegion === 'city' && !state.currentInterior && (
            <PedestrianSystem />
          )}

          {/* Dynamic world events — gang fights, drive-bys, etc. */}
          {state.currentRegion === 'city' && !state.currentInterior && (
            <DynamicEvents />
          )}

          {/* Friendly characters — outside physics (purely visual) */}
          {CHARACTERS.map(char => {
            const charState = state.characterStates[char.id];
            if (!charState) return null;
            if (state.currentRegion !== 'city' && state.currentRegion !== 'bayou' && !charState.isFollowing) return null;
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
    </>
  );
}
