import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { playerState } from '@/stores/playerStore';
import { combatStore } from '@/stores/combatStore';

// ── Sidewalk waypoints (along Chippewa Street sidewalks) ─────────────────────
const SIDEWALK_WAYPOINTS: [number, number][] = [
  // North sidewalk (z ~ -11) — walk east/west
  [-60, -11], [-45, -11], [-30, -11], [-15, -11], [0, -11], [15, -11], [30, -11], [50, -11],
  // South sidewalk (z ~ +11) — walk east/west
  [-60,  11], [-45,  11], [-30,  11], [-15,  11], [0,  11], [15,  11], [30,  11], [50,  11],
  // Cross streets
  [-50, -5], [-50,  5], [-35, -5], [-35,  5], [-20, -5], [-20,  5],
  [20,  -5], [20,   5], [35, -5],  [35,  5],
];

const PEDESTRIAN_COLORS = [
  '#cc8844', '#dd9944', '#bb7733', '#e0a060', '#a06030',
  '#c0c0c0', '#444488', '#884444', '#448844', '#dd4444',
];

interface PedState {
  x: number; z: number;
  targetX: number; targetZ: number;
  speed: number;
  yaw: number;
  panicTime: number;
  panicDx: number; panicDz: number;
  bodyColor: string;
  phase: number; // walk animation phase
}

function makePed(i: number): PedState {
  const wp = SIDEWALK_WAYPOINTS[i % SIDEWALK_WAYPOINTS.length];
  return {
    x: wp[0] + (Math.random() - 0.5) * 3,
    z: wp[1] + (Math.random() - 0.5) * 2,
    targetX: wp[0], targetZ: wp[1],
    speed: 1.2 + Math.random() * 0.8,
    yaw: Math.random() * Math.PI * 2,
    panicTime: 0,
    panicDx: 0, panicDz: 0,
    bodyColor: PEDESTRIAN_COLORS[i % PEDESTRIAN_COLORS.length],
    phase: Math.random() * Math.PI * 2,
  };
}

function pickNextWaypoint(ped: PedState) {
  // Pick a random waypoint that's not the current position
  const candidates = SIDEWALK_WAYPOINTS.filter(
    wp => Math.abs(wp[0] - ped.targetX) > 5 || Math.abs(wp[1] - ped.targetZ) > 5
  );
  const wp = candidates[Math.floor(Math.random() * candidates.length)];
  ped.targetX = wp[0] + (Math.random() - 0.5) * 2;
  ped.targetZ = wp[1] + (Math.random() - 0.5) * 1;
}

const NUM_PEDS = 14;

// ── Pedestrian mesh (instanced for performance) ───────────────────────────────
export function PedestrianSystem() {
  const peds = useMemo<PedState[]>(() => Array.from({ length: NUM_PEDS }, (_, i) => makePed(i)), []);
  const groupRefs = useRef<(THREE.Group | null)[]>([]);
  const lastPanic = useRef(0);

  useFrame((_, delta) => {
    const now = performance.now() / 1000;
    // Check if shots fired recently (combatStore tracks hitTime as a timestamp)
    const recentShots = (now - (combatStore as any).lastShotTime ?? 0) < 3;
    if (recentShots && now - lastPanic.current > 2) {
      lastPanic.current = now;
      for (const ped of peds) {
        ped.panicTime = 4 + Math.random() * 3;
        const angle = Math.random() * Math.PI * 2;
        ped.panicDx = Math.sin(angle);
        ped.panicDz = Math.cos(angle);
      }
    }

    const px = playerState.x;
    const pz = playerState.z;

    for (let i = 0; i < peds.length; i++) {
      const ped = peds[i];
      const grp = groupRefs.current[i];
      if (!grp) continue;

      ped.panicTime = Math.max(0, ped.panicTime - delta);

      let mx = 0, mz = 0;
      let spd = ped.speed;

      if (ped.panicTime > 0) {
        // Panic — run away from player
        spd = 6;
        const dx = ped.x - px;
        const dz = ped.z - pz;
        const dist = Math.sqrt(dx * dx + dz * dz) + 0.01;
        mx = (dx / dist) * 0.7 + ped.panicDx * 0.3;
        mz = (dz / dist) * 0.7 + ped.panicDz * 0.3;
      } else {
        // Walk toward next waypoint
        const dx = ped.targetX - ped.x;
        const dz = ped.targetZ - ped.z;
        const distSq = dx * dx + dz * dz;
        if (distSq < 1.5) {
          pickNextWaypoint(ped);
        } else {
          const dist = Math.sqrt(distSq);
          mx = dx / dist;
          mz = dz / dist;
        }
      }

      // Move
      ped.x += mx * spd * delta;
      ped.z += mz * spd * delta;

      // Face direction of movement
      if (Math.abs(mx) + Math.abs(mz) > 0.01) {
        ped.yaw = Math.atan2(mx, mz);
      }

      // Clamp to world bounds
      ped.x = Math.max(-70, Math.min(70, ped.x));
      ped.z = Math.max(-60, Math.min(60, ped.z));

      // Update group transform
      grp.position.set(ped.x, 0, ped.z);
      grp.rotation.y = ped.yaw;

      // Walk animation — bobbing
      ped.phase += delta * (ped.panicTime > 0 ? 12 : 6);
      const bob = Math.abs(Math.sin(ped.phase)) * 0.04;
      const legSwing = Math.sin(ped.phase) * 0.25;
      const armSwing = -Math.sin(ped.phase) * 0.3;

      // Animate child meshes (body at index 0, left leg 1, right leg 2, left arm 3, right arm 4)
      const body = grp.children[0] as THREE.Mesh;
      if (body) body.position.y = 0.85 + bob;

      const legL = grp.children[1] as THREE.Mesh;
      const legR = grp.children[2] as THREE.Mesh;
      if (legL) legL.rotation.x = legSwing;
      if (legR) legR.rotation.x = -legSwing;

      const armL = grp.children[3] as THREE.Mesh;
      const armR = grp.children[4] as THREE.Mesh;
      if (armL) armL.rotation.x = armSwing;
      if (armR) armR.rotation.x = -armSwing;
    }
  });

  return (
    <>
      {peds.map((ped, i) => (
        <group
          key={i}
          ref={el => { groupRefs.current[i] = el; }}
          position={[ped.x, 0, ped.z]}
        >
          {/* Body */}
          <mesh position={[0, 0.85, 0]}>
            <capsuleGeometry args={[0.22, 0.65, 4, 6]} />
            <meshStandardMaterial color={ped.bodyColor} roughness={0.9} />
          </mesh>
          {/* Left leg */}
          <mesh position={[-0.12, 0.35, 0]}>
            <capsuleGeometry args={[0.09, 0.4, 4, 6]} />
            <meshStandardMaterial color="#333" />
          </mesh>
          {/* Right leg */}
          <mesh position={[0.12, 0.35, 0]}>
            <capsuleGeometry args={[0.09, 0.4, 4, 6]} />
            <meshStandardMaterial color="#333" />
          </mesh>
          {/* Left arm */}
          <mesh position={[-0.32, 0.85, 0]}>
            <capsuleGeometry args={[0.07, 0.38, 4, 6]} />
            <meshStandardMaterial color={ped.bodyColor} />
          </mesh>
          {/* Right arm */}
          <mesh position={[0.32, 0.85, 0]}>
            <capsuleGeometry args={[0.07, 0.38, 4, 6]} />
            <meshStandardMaterial color={ped.bodyColor} />
          </mesh>
          {/* Head */}
          <mesh position={[0, 1.52, 0]}>
            <sphereGeometry args={[0.18, 8, 8]} />
            <meshStandardMaterial color="#e8c8a0" roughness={0.8} />
          </mesh>
        </group>
      ))}
    </>
  );
}
