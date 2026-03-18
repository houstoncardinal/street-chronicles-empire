import { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { RigidBody, CapsuleCollider } from '@react-three/rapier';
import type { RapierRigidBody } from '@react-three/rapier';
import * as THREE from 'three';
import { GameState } from '@/types/game';
import { cityInteractions, mountainInteractions } from '@/data/interactions';
import { playerState, movementState, cameraStore } from '@/stores/playerStore';
import { playGunshot, playDryFire, playHitMarker, playKillSound, weaponSoundType, updateAudioListener, startRainAmbient, startFootsteps, stopFootsteps, startEngineSound, stopEngineSound } from '@/utils/audioManager';
import { drivingState, parkedPositions } from '@/stores/drivingStore';
import { enemyMeshes, hitEnemy } from '@/stores/enemyStore';
import { registerHit, registerKill, addSpread, registerShot } from '@/stores/combatStore';
import { INTERIOR_DEFS } from '@/data/interactions';

const BASE_SPEED = 11;
const SPRINT_SPEED = 22;
const JUMP_IMPULSE = 9;
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
  const shootCooldown = useRef(0);
  const reloadCooldown = useRef(0);
// Raycaster for hit detection — reused each frame
  const _raycaster = useRef(new THREE.Raycaster());
  const _shootDir  = useRef(new THREE.Vector3());

  // Cached objects to avoid per-frame allocations
  const _euler = useRef(new THREE.Euler(0, 0, 0, 'YXZ'));
  const _forward = useRef(new THREE.Vector3());
  const _right = useRef(new THREE.Vector3());
  const _yAxis = useRef(new THREE.Vector3(0, 1, 0));
  const _camTarget = useRef(new THREE.Vector3());
  const _frameCount = useRef(0);

  const speedMult = state.activeBuff?.type === 'speed' ? 1.8 : 1;
  const wasMoving = useRef(false);
  const wasDriving = useRef(false);

  // Start rain ambient on mount
  useEffect(() => {
    startRainAmbient();
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      keys.current[e.code] = true;

      // Toggle first/third person
      if (e.code === 'KeyV') {
        cameraStore.mode = cameraStore.mode === 'fp' ? 'tp' : 'fp';
        return;
      }

      // Exit vehicle
      if (e.code === 'KeyF' && drivingState.active) {
        const parked = parkedPositions[drivingState.carId];
        if (parked) {
          parked.x = drivingState.x;
          parked.z = drivingState.z;
          parked.yaw = drivingState.yaw;
        }
        drivingState.active = false;
        drivingState.speed = 0;
        document.body.requestPointerLock();
        return;
      }

      if (e.code === 'KeyI' && !state.showPanel) {
        dispatch({ type: 'SET_SHOW_PANEL', panel: 'inventory' });
        document.exitPointerLock();
        return;
      }
      if (e.code === 'KeyG' && !state.showPanel) {
        dispatch({ type: 'SET_SHOW_PANEL', panel: 'garage' });
        document.exitPointerLock();
        return;
      }
      if (e.code === 'KeyR' && state.equippedWeapon && document.pointerLockElement) {
        dispatch({ type: 'RELOAD', weaponId: state.equippedWeapon });
        reloadCooldown.current = 1.5;
        return;
      }

      if (e.code === 'KeyE' && state.nearInteraction && !state.showPanel) {
        const i = state.nearInteraction;

        if (i.type === 'travel') {
          // Cycle through regions: city -> mountain -> bayou -> city
          const regions: ('city' | 'mountain' | 'bayou')[] = ['city', 'mountain', 'bayou'];
          const currentIndex = regions.indexOf(state.currentRegion);
          const nextIndex = (currentIndex + 1) % regions.length;
          dispatch({ type: 'SET_REGION', region: regions[nextIndex] });
        } else if (i.type === 'character') {
          dispatch({ type: 'SET_SHOW_PANEL', panel: `dialogue:${i.id.replace('char-', '')}` });
          document.exitPointerLock();
        } else if (i.type === 'mission') {
          dispatch({ type: 'SET_SHOW_PANEL', panel: `mission:${i.id}` });
          document.exitPointerLock();
        } else if (i.type === 'studio') {
          dispatch({ type: 'SET_SHOW_PANEL', panel: 'studio' });
          document.exitPointerLock();
        } else if (i.type === 'recruit') {
          dispatch({ type: 'SET_SHOW_PANEL', panel: `recruit:${i.id}` });
          document.exitPointerLock();
        } else if (i.type === 'stash') {
          dispatch({ type: 'ADD_MONEY', amount: 200 + Math.floor(Math.random() * 300) });
        } else if (i.type === 'cabin' || i.type === 'cave' || i.type === 'club') {
          dispatch({ type: 'SET_SHOW_PANEL', panel: i.type });
          document.exitPointerLock();
        } else if (i.type === 'store') {
          const t = i.id.replace('store-', '');
          dispatch({ type: 'SET_SHOW_PANEL', panel: (t === 'garage' || t === 'inventory') ? t : `store:${t}` });
          document.exitPointerLock();
        } else if (i.type === 'cafe') {
          dispatch({ type: 'SET_SHOW_PANEL', panel: 'cafe' });
          document.exitPointerLock();
        } else if (i.type === 'drugmarket') {
          dispatch({ type: 'SET_SHOW_PANEL', panel: 'drugmarket' });
          document.exitPointerLock();
        } else if (i.type === 'meetup') {
          dispatch({ type: 'SET_SHOW_PANEL', panel: `meetup:${i.id}` });
          document.exitPointerLock();
        } else if (i.type === 'car') {
          // Enter vehicle — find its parked position
          const parked = parkedPositions[i.id];
          drivingState.active = true;
          drivingState.carId = i.id;
          drivingState.x = parked?.x ?? 0;
          drivingState.y = 0;
          drivingState.z = parked?.z ?? 0;
          drivingState.yaw = parked?.yaw ?? 0;
          drivingState.speed = 0;
          document.exitPointerLock();
        } else if (i.type === 'citizen') {
          dispatch({ type: 'SET_SHOW_PANEL', panel: `citizen:${i.id}` });
          document.exitPointerLock();
        } else if (i.type === 'interior') {
          const interiorId = i.id.replace('interior-', '');
          const def = INTERIOR_DEFS[interiorId];
          if (def) {
            dispatch({ type: 'SET_INTERIOR', interiorId });
            playerState.teleportRequest = { x: def.spawnPos[0], y: def.spawnPos[1], z: def.spawnPos[2] };
          }
        } else if (i.type === 'interior-exit') {
          const interiorId = i.id.replace('exit-', '');
          const def = INTERIOR_DEFS[interiorId];
          if (def) {
            dispatch({ type: 'SET_INTERIOR', interiorId: null });
            playerState.teleportRequest = { x: def.exitPos[0], y: def.exitPos[1], z: def.exitPos[2] };
            document.body.requestPointerLock();
          }
        }
      }
    };

    const onKeyUp = (e: KeyboardEvent) => { keys.current[e.code] = false; };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, [state.nearInteraction, state.showPanel, state.currentRegion, state.equippedWeapon, dispatch]);

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!document.pointerLockElement) return;
      yaw.current -= e.movementX * 0.002;
      pitch.current -= e.movementY * 0.002;
      pitch.current = Math.max(-Math.PI / 2 + 0.1, Math.min(Math.PI / 2 - 0.1, pitch.current));
    };

    const onMouseDown = (e: MouseEvent) => {
      if (e.button !== 0) return; // left button only

      // ── Pointer lock acquisition ───────────────────────────────────────
      if (!document.pointerLockElement && !state.showPanel) {
        const canvas = document.querySelector('canvas');
        (canvas ?? document.body).requestPointerLock();
        return;
      }

      // ── FPS shoot ─────────────────────────────────────────────────────
      if (!document.pointerLockElement) return;
      if (!state.equippedWeapon) return;
      if (shootCooldown.current > 0 || reloadCooldown.current > 0) return;

      const ammoLeft = state.ammo[state.equippedWeapon] ?? 0;
      if (ammoLeft > 0) {
        dispatch({ type: 'SHOOT', weaponId: state.equippedWeapon });
        shootCooldown.current = 0.12;
        addSpread(0.28);

        // ── Sound ─────────────────────────────────────────────────────────
        playGunshot(weaponSoundType(state.equippedWeapon));

        // ── Raycast hit detection ────────────────────────────────────────
        _shootDir.current.set(0, 0, -1).applyQuaternion(camera.quaternion);
        _raycaster.current.set(camera.position, _shootDir.current);
        const targets = Array.from(enemyMeshes) as THREE.Mesh[];
        const hits = _raycaster.current.intersectObjects(targets, false);
        const mp = camera.position;
        if (hits.length > 0) {
          const hp = hits[0].point;
          registerShot(mp.x, mp.y, mp.z, hp.x, hp.y, hp.z, true);
          const enemyId = (hits[0].object as THREE.Mesh).userData?.enemyId as string | undefined;
          if (enemyId) {
            registerHit();
            playHitMarker();
            const killed = hitEnemy(enemyId, 34);
            if (killed) {
              registerKill('OPP DOWN');
              playKillSound();
              dispatch({ type: 'REGISTER_KILL' });
            }
          }
        } else {
          // Register shot with no impact (tracer goes to max range)
          const dir = _shootDir.current;
          registerShot(mp.x, mp.y, mp.z, mp.x + dir.x * 60, mp.y + dir.y * 60, mp.z + dir.z * 60, false);
        }

      } else {
        // dry fire + auto-reload on empty
        playDryFire();
        dispatch({ type: 'RELOAD', weaponId: state.equippedWeapon });
        reloadCooldown.current = 1.5;
      }
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mousedown', onMouseDown);
    return () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mousedown', onMouseDown);
    };
  }, [state.showPanel, state.equippedWeapon, state.ammo, dispatch]);

  useFrame((_, delta) => {
    if (!rigidBody.current) return;
    const body = rigidBody.current;

    shootCooldown.current  = Math.max(0, shootCooldown.current - delta);
    reloadCooldown.current = Math.max(0, reloadCooldown.current - delta);

    // ── Teleport request (interior enter/exit) ────────────────────────────────
    if (playerState.teleportRequest) {
      const { x, y, z } = playerState.teleportRequest;
      body.setTranslation({ x, y, z }, true);
      body.setLinvel({ x: 0, y: 0, z: 0 }, true);
      body.setAngvel({ x: 0, y: 0, z: 0 }, true);
      playerState.teleportRequest = null;
    }

    // ── DRIVING MODE ──────────────────────────────────────────────────────────
    if (drivingState.active) {
      const fwd  = keys.current['KeyW'];
      const back = keys.current['KeyS'];
      const left = keys.current['KeyA'];
      const rght = keys.current['KeyD'];

      // Acceleration / friction
      const accel = 22;
      const friction = 3.5;
      const maxSpeed = keys.current['ShiftLeft'] ? 40 : 28;
      if (fwd)  drivingState.speed = Math.min(drivingState.speed + accel * delta, maxSpeed);
      else if (back) drivingState.speed = Math.max(drivingState.speed - accel * 0.7 * delta, -10);
      else drivingState.speed *= Math.max(0, 1 - friction * delta);

      // Steering (speed-scaled)
      if (Math.abs(drivingState.speed) > 0.4) {
        const steerRate = 1.9 * delta * Math.sign(drivingState.speed) * Math.min(Math.abs(drivingState.speed) / 12, 1);
        if (left) drivingState.yaw += steerRate;
        if (rght) drivingState.yaw -= steerRate;
      }

      // Move car
      const sinY = Math.sin(drivingState.yaw);
      const cosY = Math.cos(drivingState.yaw);
      drivingState.x += sinY * drivingState.speed * delta;
      drivingState.z += cosY * drivingState.speed * delta;

      // Keep physics body co-located so collision still works
      body.setTranslation({ x: drivingState.x, y: 1.2, z: drivingState.z }, true);
      body.setLinvel({ x: 0, y: 0, z: 0 }, true);

      // Third-person camera — behind and above
      const camDist = 9;
      const camH = 4.0;
      const tgtCamX = drivingState.x - sinY * camDist;
      const tgtCamZ = drivingState.z - cosY * camDist;
      _camTarget.current.set(tgtCamX, camH, tgtCamZ);
      camera.position.lerp(_camTarget.current, 6 * delta);
      camera.lookAt(drivingState.x, 1.2, drivingState.z);

      playerState.x = drivingState.x;
      playerState.y = 1.2;
      playerState.z = drivingState.z;

      // Spatial audio — engine + listener
      startEngineSound(drivingState.speed);
      wasDriving.current = true;
      updateAudioListener(drivingState.x, 1.2, drivingState.z, drivingState.yaw);

      // Detect nearby cars to show "press F to exit" prompt
      const exitInteraction = { type: 'car', id: drivingState.carId, label: 'EXIT VEHICLE [F]' };
      if (state.nearInteraction?.label !== exitInteraction.label) {
        dispatch({ type: 'SET_NEAR_INTERACTION', interaction: exitInteraction });
      }
      return;
    }

    // ── ON-FOOT MODE ─────────────────────────────────────────────────────────
    // Stop engine if just switched from driving
    if (wasDriving.current) { stopEngineSound(); wasDriving.current = false; }

    const pos = body.translation();
    const vel = body.linvel();

    playerState.x = pos.x;
    playerState.y = pos.y;
    playerState.z = pos.z;
    playerState.yaw = yaw.current;

    if (cameraStore.mode === 'tp') {
      // Third-person: orbit camera 5m behind + 2.5m up, looking at head
      const tpDist = 5.0;
      const tpHeight = 2.5;
      const tpX = pos.x + Math.sin(yaw.current) * tpDist;
      const tpZ = pos.z + Math.cos(yaw.current) * tpDist;
      _camTarget.current.set(tpX, pos.y + tpHeight, tpZ);
      camera.position.lerp(_camTarget.current, 12 * delta);
      camera.lookAt(pos.x, pos.y + 1.2, pos.z);
    } else {
      _euler.current.set(pitch.current, yaw.current, 0);
      camera.quaternion.setFromEuler(_euler.current);
      camera.position.set(pos.x, pos.y + 0.7, pos.z);
    }

    if (state.showPanel) {
      body.setLinvel({ x: 0, y: vel.y, z: 0 }, true);
      return;
    }

    _forward.current.set(0, 0, -1).applyAxisAngle(_yAxis.current, yaw.current);
    _right.current.set(1, 0, 0).applyAxisAngle(_yAxis.current, yaw.current);
    const forward = _forward.current;
    const right   = _right.current;
    const sprint  = keys.current['ShiftLeft'] || keys.current['ShiftRight'];
    const speed   = (sprint ? SPRINT_SPEED : BASE_SPEED) * speedMult;

    let moveX = 0, moveZ = 0;
    if (keys.current['KeyW']) { moveX += forward.x; moveZ += forward.z; }
    if (keys.current['KeyS']) { moveX -= forward.x; moveZ -= forward.z; }
    if (keys.current['KeyA']) { moveX -= right.x;   moveZ -= right.z; }
    if (keys.current['KeyD']) { moveX += right.x;   moveZ += right.z; }

    const len = Math.sqrt(moveX * moveX + moveZ * moveZ);
    const isMoving = len > 0;
    if (isMoving) { moveX = (moveX / len) * speed; moveZ = (moveZ / len) * speed; }
    body.setLinvel({ x: moveX, y: vel.y, z: moveZ }, true);

    // ── Spatial audio — listener + footsteps ─────────────────────────────────
    updateAudioListener(pos.x, pos.y, pos.z, yaw.current);
    if (isMoving && !wasMoving.current) { startFootsteps(sprint); wasMoving.current = true; }
    else if (!isMoving && wasMoving.current) { stopFootsteps(); wasMoving.current = false; }

    // ── Head bob (FP only) ────────────────────────────────────────────────────
    movementState.isSprinting = sprint && isMoving;
    movementState.speed = isMoving ? speed : 0;
    if (cameraStore.mode === 'fp') {
      if (isMoving) {
        const bobFreq = sprint ? 14 : 9;
        movementState.bobPhase += delta * bobFreq;
        const bobAmt = sprint ? 0.055 : 0.032;
        camera.position.y = pos.y + 0.7 + Math.sin(movementState.bobPhase) * bobAmt;
      } else {
        movementState.bobPhase = 0;
      }
    }

    jumpCooldown.current = Math.max(0, jumpCooldown.current - delta);
    if (keys.current['Space'] && Math.abs(vel.y) < 0.5 && pos.y < 100 && jumpCooldown.current <= 0) {
      body.setLinvel({ x: vel.x, y: JUMP_IMPULSE, z: vel.z }, true);
      jumpCooldown.current = 0.3;
    }

    if (pos.y < -20) {
      body.setTranslation({ x: 0, y: 5, z: 10 }, true);
      body.setLinvel({ x: 0, y: 0, z: 0 }, true);
    }

    // Interaction proximity — only check every 4th frame
    _frameCount.current++;
    if (_frameCount.current % 4 !== 0) return;
    // When inside a building (x > 400), only check exit interactions
    const isInsideBuilding = pos.x > 400;
    const interactions = isInsideBuilding
      ? cityInteractions.filter(i => i.type === 'interior-exit')
      : (state.currentRegion === 'city' ? cityInteractions : mountainInteractions);
    let nearest: { type: string; id: string; label: string } | null = null;
    let nearestDistSq = INTERACTION_DISTANCE * INTERACTION_DISTANCE;

    for (const point of interactions) {
      // For cars, use the live parked position so moved cars are detectable
      let px = point.position[0];
      let pz = point.position[2];
      if (point.type === 'car') {
        const live = parkedPositions[point.id];
        if (live) { px = live.x; pz = live.z; }
      }
      const dx = pos.x - px;
      const dz = pos.z - pz;
      const distSq = dx * dx + dz * dz;
      if (distSq < nearestDistSq) {
        nearestDistSq = distSq;
        nearest = { type: point.type, id: point.id, label: point.label };
      }
    }

    if (nearest?.id !== state.nearInteraction?.id) {
      dispatch({ type: 'SET_NEAR_INTERACTION', interaction: nearest });
    }
  });

  const spawnPos: [number, number, number] = state.currentRegion === 'city' ? [0, 3, 10] : state.currentRegion === 'bayou' ? [0, 1, 10] : [0, 25, 10];

  return (
    <RigidBody ref={rigidBody} position={spawnPos} lockRotations mass={1} linearDamping={0.5} enabledRotations={[false, false, false]} ccd>
      <CapsuleCollider args={[0.5, 0.35]} />
    </RigidBody>
  );
}
