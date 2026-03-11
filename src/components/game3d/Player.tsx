import { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { RigidBody, CapsuleCollider } from '@react-three/rapier';
import type { RapierRigidBody } from '@react-three/rapier';
import * as THREE from 'three';
import { GameState } from '@/types/game';
import { cityInteractions, mountainInteractions } from '@/data/interactions';
import { playerState } from '@/stores/playerStore';

const SPEED = 6;
const SPRINT_SPEED = 12;
const JUMP_IMPULSE = 6;
const INTERACTION_DISTANCE = 5;

interface PlayerProps {
  state: GameState;
  dispatch: React.Dispatch<any>;
}

export function Player({ state, dispatch }: PlayerProps) {
  const rigidBody = useRef<RapierRigidBody>(null);
  const { camera } = useThree();

  const keys = useRef<Record<string, boolean>>({});
  const yaw = useRef(0);
  const pitch = useRef(0);
  const jumpCooldown = useRef(0);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      keys.current[e.code] = true;

      if (e.code === 'KeyE' && state.nearInteraction && !state.showPanel) {
        const interaction = state.nearInteraction;

        if (interaction.type === 'travel') {
          const newRegion = state.currentRegion === 'city' ? 'mountain' : 'city';
          dispatch({ type: 'SET_REGION', region: newRegion as 'city' | 'mountain' });
        } else if (interaction.type === 'character') {
          // Open dialogue panel for character
          const charId = interaction.id.replace('char-', '');
          dispatch({ type: 'SET_SHOW_PANEL', panel: `dialogue:${charId}` });
          document.exitPointerLock();
        } else if (interaction.type === 'mission') {
          dispatch({ type: 'SET_SHOW_PANEL', panel: `mission:${interaction.id}` });
          document.exitPointerLock();
        } else if (interaction.type === 'studio') {
          dispatch({ type: 'SET_SHOW_PANEL', panel: 'studio' });
          document.exitPointerLock();
        } else if (interaction.type === 'recruit') {
          dispatch({ type: 'SET_SHOW_PANEL', panel: `recruit:${interaction.id}` });
          document.exitPointerLock();
        } else if (interaction.type === 'stash') {
          dispatch({ type: 'ADD_MONEY', amount: 200 + Math.floor(Math.random() * 300) });
        } else if (interaction.type === 'cabin' || interaction.type === 'cave' || interaction.type === 'club') {
          dispatch({ type: 'SET_SHOW_PANEL', panel: interaction.type });
          document.exitPointerLock();
        } else if (interaction.type === 'store') {
          // Find store type from interaction data
          const storeInteraction = [...(require('@/data/interactions').cityInteractions), ...(require('@/data/interactions').mountainInteractions)]
            .find((p: any) => p.id === interaction.id);
          const storeType = storeInteraction?.storeType || 'vehicles';
          dispatch({ type: 'SET_SHOW_PANEL', panel: `store:${storeType}` });
          document.exitPointerLock();
        }
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      keys.current[e.code] = false;
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, [state.nearInteraction, state.showPanel, state.currentRegion, dispatch]);

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!document.pointerLockElement) return;
      yaw.current -= e.movementX * 0.002;
      pitch.current -= e.movementY * 0.002;
      pitch.current = Math.max(-Math.PI / 2 + 0.1, Math.min(Math.PI / 2 - 0.1, pitch.current));
    };

    const onClick = () => {
      if (!document.pointerLockElement && !state.showPanel) {
        document.body.requestPointerLock();
      }
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('click', onClick);
    return () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('click', onClick);
    };
  }, [state.showPanel]);

  useFrame((_, delta) => {
    if (!rigidBody.current) return;

    const body = rigidBody.current;
    const pos = body.translation();
    const vel = body.linvel();

    playerState.x = pos.x;
    playerState.y = pos.y;
    playerState.z = pos.z;
    playerState.yaw = yaw.current;

    const euler = new THREE.Euler(pitch.current, yaw.current, 0, 'YXZ');
    camera.quaternion.setFromEuler(euler);
    camera.position.set(pos.x, pos.y + 0.7, pos.z);

    if (state.showPanel) {
      body.setLinvel({ x: 0, y: vel.y, z: 0 }, true);
      return;
    }

    const forward = new THREE.Vector3(0, 0, -1).applyAxisAngle(new THREE.Vector3(0, 1, 0), yaw.current);
    const right = new THREE.Vector3(1, 0, 0).applyAxisAngle(new THREE.Vector3(0, 1, 0), yaw.current);

    const sprint = keys.current['ShiftLeft'] || keys.current['ShiftRight'];
    const speed = sprint ? SPRINT_SPEED : SPEED;

    let moveX = 0, moveZ = 0;
    if (keys.current['KeyW']) { moveX += forward.x; moveZ += forward.z; }
    if (keys.current['KeyS']) { moveX -= forward.x; moveZ -= forward.z; }
    if (keys.current['KeyA']) { moveX -= right.x; moveZ -= right.z; }
    if (keys.current['KeyD']) { moveX += right.x; moveZ += right.z; }

    const len = Math.sqrt(moveX * moveX + moveZ * moveZ);
    if (len > 0) {
      moveX = (moveX / len) * speed;
      moveZ = (moveZ / len) * speed;
    }

    body.setLinvel({ x: moveX, y: vel.y, z: moveZ }, true);

    jumpCooldown.current = Math.max(0, jumpCooldown.current - delta);
    const grounded = Math.abs(vel.y) < 0.5 && pos.y < 100;
    if (keys.current['Space'] && grounded && jumpCooldown.current <= 0) {
      body.setLinvel({ x: vel.x, y: JUMP_IMPULSE, z: vel.z }, true);
      jumpCooldown.current = 0.3;
    }

    if (pos.y < -20) {
      body.setTranslation({ x: 0, y: 5, z: 10 }, true);
      body.setLinvel({ x: 0, y: 0, z: 0 }, true);
    }

    // Proximity check for interactions
    const interactions = state.currentRegion === 'city' ? cityInteractions : mountainInteractions;
    let nearest: { type: string; id: string; label: string } | null = null;
    let nearestDist = INTERACTION_DISTANCE;

    for (const point of interactions) {
      const dx = pos.x - point.position[0];
      const dz = pos.z - point.position[2];
      const dist = Math.sqrt(dx * dx + dz * dz);
      if (dist < nearestDist) {
        nearestDist = dist;
        nearest = { type: point.type, id: point.id, label: point.label };
      }
    }

    if (nearest?.id !== state.nearInteraction?.id) {
      dispatch({ type: 'SET_NEAR_INTERACTION', interaction: nearest });
    }
  });

  const spawnPos: [number, number, number] = state.currentRegion === 'city'
    ? [0, 3, 10]
    : [0, 25, 10];

  return (
    <RigidBody
      ref={rigidBody}
      position={spawnPos}
      lockRotations
      mass={1}
      linearDamping={0.5}
      enabledRotations={[false, false, false]}
    >
      <CapsuleCollider args={[0.5, 0.3]} />
    </RigidBody>
  );
}
