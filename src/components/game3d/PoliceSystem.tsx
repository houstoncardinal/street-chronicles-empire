import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { playerState } from '@/stores/playerStore';

// ── Police store (mutable, no React re-renders) ───────────────────────────────
interface OfficerState {
  id: string;
  x: number;
  y: number;
  z: number;
  yaw: number;
  hp: number;
  alertLevel: number; // 0=patrol 1=chase 2=shooting
  shootCooldown: number;
  active: boolean;
}

export const policeStore = {
  officers: [] as OfficerState[],
  helicopterActive: false,
  helicopterX: 0,
  helicopterZ: 0,
};

// Spawn ring positions around the block edges
const SPAWN_RING = [
  [45, 0, 20], [-45, 0, 20], [45, 0, -20], [-45, 0, -20],
  [0, 0, 50], [0, 0, -60], [30, 0, 45], [-30, 0, 45],
];

function ensureOfficers(wantedLevel: number) {
  const target = wantedLevel === 0 ? 0 : wantedLevel === 1 ? 1 : wantedLevel === 2 ? 2 : wantedLevel === 3 ? 3 : wantedLevel === 4 ? 4 : 6;
  while (policeStore.officers.length < target) {
    const i = policeStore.officers.length % SPAWN_RING.length;
    const [sx, sy, sz] = SPAWN_RING[i];
    policeStore.officers.push({
      id: `cop-${Date.now()}-${i}`,
      x: sx + (Math.random() - 0.5) * 8,
      y: sy,
      z: sz + (Math.random() - 0.5) * 8,
      yaw: 0,
      hp: 3,
      alertLevel: 1,
      shootCooldown: 0,
      active: true,
    });
  }
  // Remove excess
  while (policeStore.officers.length > target) {
    policeStore.officers.pop();
  }
  policeStore.helicopterActive = wantedLevel >= 4;
}

// ── Officer mesh (single officer rendered) ──────────────────────────────────
function OfficerMesh({ officer }: { officer: OfficerState }) {
  const groupRef = useRef<THREE.Group>(null);
  const flashRef = useRef<THREE.PointLight>(null);

  useFrame((_, delta) => {
    if (!groupRef.current || !officer.active) return;

    groupRef.current.position.set(officer.x, officer.y + 0.85, officer.z);
    groupRef.current.rotation.y = officer.yaw;

    // Flash light on shoot
    if (flashRef.current) {
      flashRef.current.intensity = officer.shootCooldown > 0.55 ? 30 : 0;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Body */}
      <mesh position={[0, 0, 0]}>
        <capsuleGeometry args={[0.28, 0.9, 4, 8]} />
        <meshStandardMaterial color="#1a2a8a" roughness={0.8} />
      </mesh>
      {/* Head */}
      <mesh position={[0, 0.8, 0]}>
        <sphereGeometry args={[0.2, 8, 8]} />
        <meshStandardMaterial color="#e8c8a0" />
      </mesh>
      {/* Police cap */}
      <mesh position={[0, 0.96, 0]}>
        <cylinderGeometry args={[0.22, 0.22, 0.1, 8]} />
        <meshStandardMaterial color="#0a1a6a" />
      </mesh>
      {/* Badge */}
      <mesh position={[0, 0.1, 0.3]}>
        <boxGeometry args={[0.15, 0.12, 0.03]} />
        <meshStandardMaterial color="#ffd700" metalness={0.9} emissive="#ffd700" emissiveIntensity={0.5} />
      </mesh>
      {/* Muzzle flash light */}
      <pointLight ref={flashRef} intensity={0} color="#ffff88" distance={6} />
      {/* POLICE label */}
      <mesh position={[0, 1.5, 0]}>
        <planeGeometry args={[0.7, 0.18]} />
        <meshStandardMaterial color="#0000cc" emissive="#2222ff" emissiveIntensity={1} />
      </mesh>
    </group>
  );
}

// ── Helicopter ───────────────────────────────────────────────────────────────
function Helicopter() {
  const groupRef = useRef<THREE.Group>(null);
  const rotorRef = useRef<THREE.Mesh>(null);
  const t = useRef(0);

  useFrame((_, delta) => {
    t.current += delta;
    if (!groupRef.current) return;

    // Circle above player
    const px = playerState.x;
    const pz = playerState.z;
    const radius = 18;
    const hx = px + Math.cos(t.current * 0.4) * radius;
    const hz = pz + Math.sin(t.current * 0.4) * radius;
    groupRef.current.position.set(hx, 22, hz);
    groupRef.current.rotation.y = -t.current * 0.4 + Math.PI / 2;

    if (rotorRef.current) {
      rotorRef.current.rotation.y += delta * 25;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Fuselage */}
      <mesh>
        <boxGeometry args={[3.5, 1.2, 1.4]} />
        <meshStandardMaterial color="#1a1a8a" metalness={0.4} roughness={0.5} />
      </mesh>
      {/* Tail boom */}
      <mesh position={[-2.8, 0, 0]}>
        <boxGeometry args={[2, 0.35, 0.35]} />
        <meshStandardMaterial color="#1a1a8a" metalness={0.4} />
      </mesh>
      {/* Main rotor */}
      <mesh ref={rotorRef} position={[0, 0.7, 0]}>
        <boxGeometry args={[6, 0.06, 0.18]} />
        <meshStandardMaterial color="#333" metalness={0.6} />
      </mesh>
      {/* Spotlight */}
      <spotLight
        position={[0, -0.7, 0]}
        target-position={[0, -22, 0]}
        intensity={300}
        angle={0.25}
        penumbra={0.3}
        color="#ffffff"
        distance={35}
        castShadow={false}
      />
      {/* Nav lights */}
      <pointLight position={[1.8, 0, 0.8]} intensity={8} color="#ff0000" distance={4} />
      <pointLight position={[1.8, 0, -0.8]} intensity={8} color="#00ff00" distance={4} />
    </group>
  );
}

// ── Main PoliceSystem component ──────────────────────────────────────────────
interface PoliceSystemProps {
  wantedLevel: number;
  onDamagePlayer: (amount: number) => void;
}

export function PoliceSystem({ wantedLevel, onDamagePlayer }: PoliceSystemProps) {
  const lastWanted = useRef(-1);
  const damageTimer = useRef(0);

  useFrame((_, delta) => {
    // Sync officer count to wanted level
    if (wantedLevel !== lastWanted.current) {
      ensureOfficers(wantedLevel);
      lastWanted.current = wantedLevel;
    }

    if (wantedLevel === 0) return;

    const px = playerState.x;
    const pz = playerState.z;
    damageTimer.current = Math.max(0, damageTimer.current - delta);

    for (const cop of policeStore.officers) {
      if (!cop.active || cop.hp <= 0) continue;

      cop.shootCooldown = Math.max(0, cop.shootCooldown - delta);

      const dx = px - cop.x;
      const dz = pz - cop.z;
      const distSq = dx * dx + dz * dz;
      const dist = Math.sqrt(distSq);

      // Face player
      cop.yaw = Math.atan2(dx, dz) + Math.PI;

      if (dist < 3.5) {
        // In range — shoot player
        cop.alertLevel = 2;
        if (cop.shootCooldown <= 0 && damageTimer.current <= 0) {
          onDamagePlayer(8);
          cop.shootCooldown = 1.8;
          damageTimer.current = 0.4;
        }
      } else if (dist < 35) {
        // Chase
        cop.alertLevel = 1;
        const speed = 5.5 * delta;
        cop.x += (dx / dist) * speed;
        cop.z += (dz / dist) * speed;
      } else {
        // Patrol in place
        cop.alertLevel = 0;
        cop.x += Math.sin(Date.now() * 0.001 + cop.x) * 0.4 * delta;
        cop.z += Math.cos(Date.now() * 0.001 + cop.z) * 0.4 * delta;
      }
    }

    // Helicopter spotlight / strafing run at 5 stars
    if (wantedLevel >= 5 && damageTimer.current <= 0) {
      const nearHeli = Math.abs(playerState.x - policeStore.helicopterX) < 3 &&
                       Math.abs(playerState.z - policeStore.helicopterZ) < 3;
      if (nearHeli) {
        onDamagePlayer(15);
        damageTimer.current = 2;
      }
    }
  });

  if (wantedLevel === 0) return null;

  return (
    <>
      {policeStore.officers.map(cop => (
        <OfficerMesh key={cop.id} officer={cop} />
      ))}
      {policeStore.helicopterActive && <Helicopter />}
    </>
  );
}

// ── Hit a police officer (called from Player.tsx raycast) ────────────────────
export function hitPolice(id: string, damage: number): boolean {
  const cop = policeStore.officers.find(c => c.id === id);
  if (!cop) return false;
  cop.hp -= damage;
  if (cop.hp <= 0) {
    cop.active = false;
    // Respawn after 12s
    setTimeout(() => {
      const i = policeStore.officers.indexOf(cop);
      if (i >= 0) {
        const [sx, , sz] = SPAWN_RING[i % SPAWN_RING.length];
        cop.x = sx + (Math.random() - 0.5) * 6;
        cop.z = sz + (Math.random() - 0.5) * 6;
        cop.hp = 3;
        cop.active = true;
      }
    }, 12000);
    return true;
  }
  return false;
}

// Registry of police meshes for raycast targeting
export const policeMeshes = new Set<THREE.Mesh>();
