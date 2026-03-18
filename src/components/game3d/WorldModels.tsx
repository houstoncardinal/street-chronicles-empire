/**
 * WorldModels.tsx — All imported GLB/GLTF models placed as animated world inhabitants.
 *
 * Existing:
 *   OWL.glb              — Ambient owl on lamp post
 *   RABBIT.glb           — Rabbit in West Suburbs park
 *   TIGER.glb            — Tiger prowling the park
 *   RETRO GAME GHOST.glb — Floating ghost easter egg near cinema
 *   30.Warrior.glb       — Warrior NPC on Government St
 *   76.glb               — Street-art figure in Downtown plaza
 *   14_Game Console.glb  — Interactive retro console near Virtual Studio
 *
 * New:
 *   14_Palm Tree.glb     — Bayou palm trees (8 instances along Chippewa)
 *   1.Hotel.glb          — Cartoon hotel building in Downtown
 *   10_Courthouse.glb    — Courthouse landmark in civic center
 *   House_04.gltf        — Medieval stone house in West Suburbs
 *   GAMES GUN.glb        — Interactive colorful gun pickup
 *   christmas_tree.glb   — Seasonal tree in West Suburbs park
 *   10.gltf              — Large building prop in Downtown east
 *
 * 1.gltf  — SKIPPED: 143 MB embedded buffer, cannot be streamed in real-time.
 */
import { useRef, useState, Suspense } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF, Clone, Text } from '@react-three/drei';
import * as THREE from 'three';
import { playerState } from '@/stores/playerStore';
import { CityBus } from './CityBus';
import { SecurityGuards } from './SecurityGuards';

function distSq(ax: number, az: number, bx: number, bz: number) {
  return (ax - bx) ** 2 + (az - bz) ** 2;
}

// ─────────────────────────────────────────────────────────────────────────────
// OWL — perched on lamp post at east end of Chippewa
// ─────────────────────────────────────────────────────────────────────────────
function OwlModel() {
  const { scene } = useGLTF('/OWL.glb') as any;
  const bodyRef = useRef<THREE.Group>(null);
  useFrame(state => {
    if (!bodyRef.current) return;
    const t = state.clock.elapsedTime;
    bodyRef.current.rotation.y = Math.sin(t * 0.42) * 0.72;
    bodyRef.current.position.y = Math.sin(t * 1.1) * 0.025;
    bodyRef.current.rotation.z = Math.sin(t * 0.28) * 0.05;
  });
  return (
    <group position={[52, 0, -8]}>
      <mesh position={[0, 2.2, 0]}>
        <cylinderGeometry args={[0.055, 0.075, 4.4, 8]} />
        <meshStandardMaterial color="#1a1a22" metalness={0.75} roughness={0.35} />
      </mesh>
      <mesh position={[0, 4.3, 0.3]}>
        <boxGeometry args={[0.08, 0.08, 0.7]} />
        <meshStandardMaterial color="#1a1a22" metalness={0.75} roughness={0.35} />
      </mesh>
      <mesh position={[0, 4.3, 0.65]}>
        <sphereGeometry args={[0.16, 8, 6]} />
        <meshStandardMaterial color="#ffee88" emissive="#ffee88" emissiveIntensity={1.0} roughness={0.3} />
      </mesh>
      <group position={[0, 4.55, 0]} scale={0.55}>
        <group ref={bodyRef}><primitive object={scene} /></group>
      </group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <ringGeometry args={[0.3, 0.7, 14]} />
        <meshBasicMaterial color="#ffee88" transparent opacity={0.12} />
      </mesh>
    </group>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// RABBIT
// ─────────────────────────────────────────────────────────────────────────────
function RabbitModel() {
  const { scene } = useGLTF('/RABBIT.glb') as any;
  const ref = useRef<THREE.Group>(null);
  const hopPhase = useRef(Math.random() * Math.PI * 2);
  useFrame((state, delta) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime;
    hopPhase.current += delta * 2.0;
    const hop = Math.pow(Math.max(0, Math.sin(hopPhase.current)), 2) * 0.55;
    ref.current.position.y = hop;
    ref.current.rotation.x = -hop * 0.28;
    ref.current.position.x = -148 + Math.sin(t * 0.17) * 5;
    ref.current.position.z = 14 + Math.cos(t * 0.21) * 4;
    ref.current.rotation.y = Math.atan2(Math.cos(t * 0.17) * 0.17, -Math.sin(t * 0.21) * 0.21);
  });
  return <group><group ref={ref} scale={0.65}><primitive object={scene} /></group></group>;
}

// ─────────────────────────────────────────────────────────────────────────────
// TIGER
// ─────────────────────────────────────────────────────────────────────────────
function TigerModel() {
  const { scene } = useGLTF('/TIGER.glb') as any;
  const ref = useRef<THREE.Group>(null);
  const CX = -140, CZ = -20, R = 7;
  useFrame(state => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime * 0.18;
    ref.current.position.x = CX + Math.sin(t) * R;
    ref.current.position.z = CZ + Math.cos(t) * R;
    ref.current.rotation.y = -(t + Math.PI * 0.5);
    ref.current.rotation.z = Math.sin(t * 8) * 0.045;
    ref.current.position.y = Math.abs(Math.sin(t * 4)) * 0.12;
  });
  return <group ref={ref} scale={1.15}><primitive object={scene} /></group>;
}

// ─────────────────────────────────────────────────────────────────────────────
// RETRO GAME GHOST — floating easter egg near cinema
// ─────────────────────────────────────────────────────────────────────────────
const GHOST_POS: [number, number, number] = [8, 0, -38];
function GhostModel() {
  const { scene } = useGLTF('/RETRO%20GAME%20GHOST.glb') as any;
  const ref = useRef<THREE.Group>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const [nearby, setNearby] = useState(false);
  useFrame(state => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime;
    const near = distSq(playerState.x, playerState.z, GHOST_POS[0], GHOST_POS[2]) < 36;
    if (near !== nearby) setNearby(near);
    ref.current.position.y = 1.5 + Math.sin(t * 1.6) * 0.28;
    ref.current.rotation.y = t * (near ? 2.8 : 0.55);
    ref.current.scale.setScalar((1.0 + Math.sin(t * 2.4) * 0.06) * 0.9);
    if (glowRef.current)
      (glowRef.current.material as THREE.MeshBasicMaterial).opacity =
        0.20 + Math.sin(t * 3.0) * 0.10 + (near ? 0.25 : 0);
  });
  return (
    <group position={GHOST_POS}>
      <group ref={ref}><primitive object={scene} /></group>
      <mesh ref={glowRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.04, 0]}>
        <ringGeometry args={[0.55, 0.90, 18]} />
        <meshBasicMaterial color="#a0ffa0" transparent opacity={0.22} />
      </mesh>
      <pointLight position={[0, 1.8, 0]} color="#88ffaa" intensity={6} distance={7} decay={2} />
      {nearby && (
        <Text position={[0, 4.0, 0]} fontSize={0.22} color="#a0ffa0"
          anchorX="center" anchorY="middle" outlineWidth={0.03} outlineColor="#000000">
          {'[E]  GHOST ENCOUNTER'}
        </Text>
      )}
    </group>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 30. WARRIOR — guard on Government St
// ─────────────────────────────────────────────────────────────────────────────
function WarriorModel() {
  const { scene } = useGLTF('/30.Warrior.glb') as any;
  const ref = useRef<THREE.Group>(null);
  const [nearby, setNearby] = useState(false);
  useFrame(state => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime;
    const near = distSq(playerState.x, playerState.z, -50, -90) < 64;
    if (near !== nearby) setNearby(near);
    if (near) {
      const dx = playerState.x - ref.current.position.x;
      const dz = playerState.z - ref.current.position.z;
      ref.current.rotation.y = THREE.MathUtils.lerp(ref.current.rotation.y, Math.atan2(dx, dz), 0.06);
      ref.current.rotation.z = Math.sin(t * 4) * 0.015;
    } else {
      ref.current.rotation.y = Math.sin(t * 0.22) * 0.35 + Math.PI;
      ref.current.position.y = Math.sin(t * 1.05) * 0.025;
    }
  });
  return (
    <group ref={ref} position={[-50, 0, -90]} scale={1.05}>
      <primitive object={scene} />
      {nearby && (
        <Text position={[0, 2.8, 0]} fontSize={0.20} color="#ff4444"
          anchorX="center" anchorY="middle" outlineWidth={0.025} outlineColor="#000000">
          {'WARRIOR'}
        </Text>
      )}
    </group>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 76 — Street-art character in Downtown plaza
// ─────────────────────────────────────────────────────────────────────────────
function Character76Model() {
  const { scene } = useGLTF('/76.glb') as any;
  const ref = useRef<THREE.Group>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  useFrame(state => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime;
    ref.current.rotation.y = t * 0.14;
    ref.current.position.y = 1.2 + Math.sin(t * 0.7) * 0.08;
    if (glowRef.current)
      (glowRef.current.material as THREE.MeshBasicMaterial).opacity =
        0.25 + Math.sin(t * 1.8) * 0.12;
  });
  return (
    <group position={[112, 0, -8]}>
      <mesh position={[0, 0.5, 0]}>
        <boxGeometry args={[1.6, 1.0, 1.6]} />
        <meshStandardMaterial color="#252530" roughness={0.9} metalness={0.1} />
      </mesh>
      <mesh position={[0, 1.05, 0]}>
        <boxGeometry args={[1.7, 0.12, 1.7]} />
        <meshStandardMaterial color="#1a1a22" roughness={0.85} metalness={0.15} />
      </mesh>
      <group ref={ref} position={[0, 1.2, 0]} scale={1.1}><primitive object={scene} /></group>
      <mesh ref={glowRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <ringGeometry args={[0.85, 1.25, 20]} />
        <meshBasicMaterial color="#00f0d0" transparent opacity={0.28} />
      </mesh>
      <pointLight position={[0, 0.3, 0]} color="#00f0d0" intensity={8} distance={6} decay={2} />
    </group>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// GAME CONSOLE — interactive prop near Virtual Studio
// ─────────────────────────────────────────────────────────────────────────────
const CONSOLE_POS: [number, number, number] = [-6, 0, -46];
function GameConsoleModel() {
  const { scene } = useGLTF('/14_Game%20Console.glb') as any;
  const ref = useRef<THREE.Group>(null);
  const screenRef = useRef<THREE.Mesh>(null);
  const [nearby, setNearby] = useState(false);
  useFrame(state => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime;
    const near = distSq(playerState.x, playerState.z, CONSOLE_POS[0], CONSOLE_POS[2]) < 36;
    if (near !== nearby) setNearby(near);
    ref.current.rotation.y = Math.sin(t * 0.18) * 0.06;
    if (screenRef.current)
      (screenRef.current.material as THREE.MeshBasicMaterial).opacity =
        0.18 + Math.sin(t * 3.2) * 0.08 + (near ? 0.18 : 0);
  });
  return (
    <group position={CONSOLE_POS}>
      <group ref={ref} scale={0.95}><primitive object={scene} /></group>
      <mesh ref={screenRef} position={[0, 0.82, 0.42]}>
        <planeGeometry args={[0.72, 0.46]} />
        <meshBasicMaterial color="#0088ff" transparent opacity={0.22} />
      </mesh>
      <mesh position={[0, 0.04, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.5, 0.82, 16]} />
        <meshBasicMaterial color="#0044ff" transparent opacity={0.35} />
      </mesh>
      <pointLight position={[0, 0.2, 0]} color="#0088ff" intensity={5} distance={5} decay={2} />
      {nearby && (
        <Text position={[0, 2.5, 0]} fontSize={0.21} color="#00aaff"
          anchorX="center" anchorY="middle" outlineWidth={0.028} outlineColor="#000000">
          {'[E]  RETRO CONSOLE'}
        </Text>
      )}
    </group>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PALM TREES — bayou atmosphere, 8 instances scattered across the city
// ─────────────────────────────────────────────────────────────────────────────
const PALM_POSITIONS: { pos: [number, number, number]; scale: number; rot: number }[] = [
  { pos: [-68, 0,  12], scale: 2.2, rot: 0.0  },
  { pos: [-52, 0, -16], scale: 1.9, rot: 0.8  },
  { pos: [ 28, 0,  22], scale: 2.5, rot: 2.2  },
  { pos: [ 58, 0,  -6], scale: 2.0, rot: 1.1  },
  { pos: [-108, 0, 38], scale: 2.8, rot: 3.4  },
  { pos: [-138, 0, -28], scale: 2.3, rot: 0.5 },
  { pos: [  18, 0,  32], scale: 1.8, rot: 4.1 },
  { pos: [ -24, 0,  -8], scale: 2.1, rot: 2.8 },
];

function PalmTrees() {
  const { scene } = useGLTF('/14_Palm%20Tree.glb') as any;
  const refs = useRef<(THREE.Group | null)[]>([]);

  useFrame(state => {
    const t = state.clock.elapsedTime;
    refs.current.forEach((ref, i) => {
      if (!ref) return;
      // Gentle sway in the bayou breeze
      ref.rotation.z = Math.sin(t * 0.6 + i * 1.3) * 0.035;
      ref.rotation.x = Math.cos(t * 0.5 + i * 0.9) * 0.018;
    });
  });

  return (
    <>
      {PALM_POSITIONS.map((p, i) => (
        <group key={i} position={p.pos} rotation={[0, p.rot, 0]} scale={p.scale}
          ref={el => { refs.current[i] = el; }}>
          <Clone object={scene} />
        </group>
      ))}
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// HOTEL BUILDING — cartoon hotel landmark in Downtown
// ─────────────────────────────────────────────────────────────────────────────
function HotelBuilding() {
  const { scene } = useGLTF('/cartoon-hotel-building-structure-2026-02-08-13-35-25-utc/1.Hotel.glb') as any;
  const ref = useRef<THREE.Group>(null);
  useFrame(state => {
    if (!ref.current) return;
    // Subtle window flicker emissive — handled by material, just gentle scale breathe
    const t = state.clock.elapsedTime;
    ref.current.position.y = Math.sin(t * 0.12) * 0.06;
  });
  return (
    <group position={[178, 0, 68]}>
      <group ref={ref} scale={6.5}>
        <primitive object={scene} />
      </group>
      {/* Hotel sign glow */}
      <pointLight position={[0, 18, 5]} color="#ffaaee" intensity={12} distance={30} decay={2} />
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[2, 6, 20]} />
        <meshBasicMaterial color="#ffaaee" transparent opacity={0.08} />
      </mesh>
    </group>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// COURTHOUSE — civic landmark in Downtown
// ─────────────────────────────────────────────────────────────────────────────
function CourthouseBuilding() {
  const { scene } = useGLTF('/courthouse-building-3d-illustration-2026-01-18-02-54-11-utc/10_Courthouse%20Building.glb') as any;
  const flagRef = useRef<THREE.Mesh>(null);
  useFrame(state => {
    if (!flagRef.current) return;
    const t = state.clock.elapsedTime;
    flagRef.current.rotation.y = Math.sin(t * 1.8) * 0.12;
    flagRef.current.position.x = Math.sin(t * 2.2) * 0.12;
  });
  return (
    <group position={[118, 0, -72]}>
      <group scale={5.5}>
        <primitive object={scene} />
      </group>
      {/* Flag pole */}
      <mesh position={[0, 14, 6]}>
        <cylinderGeometry args={[0.06, 0.06, 8, 6]} />
        <meshStandardMaterial color="#d8d0c0" metalness={0.7} roughness={0.3} />
      </mesh>
      {/* Flag */}
      <mesh ref={flagRef} position={[1.0, 17.5, 6]}>
        <planeGeometry args={[2.2, 1.2]} />
        <meshStandardMaterial color="#cc2222" side={THREE.DoubleSide} roughness={0.9} />
      </mesh>
      {/* Spotlight from ground */}
      <pointLight position={[0, 0.5, 8]} color="#ffe8aa" intensity={15} distance={20} decay={2} />
    </group>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// GAMES GUN — interactive colorful gun pickup on the street
// Walk up and press [E] to pick up
// ─────────────────────────────────────────────────────────────────────────────
const GUN_POS: [number, number, number] = [12, 0, 8];
function GamesGunPickup() {
  const { scene } = useGLTF('/vibrantly-colored-toy-gun-2026-02-09-00-00-02-utc/GAMES%20GUN.glb') as any;
  const ref = useRef<THREE.Group>(null);
  const [nearby, setNearby] = useState(false);

  useFrame(state => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime;
    const near = distSq(playerState.x, playerState.z, GUN_POS[0], GUN_POS[2]) < 25;
    if (near !== nearby) setNearby(near);
    // Float + spin
    ref.current.position.y = 0.8 + Math.sin(t * 1.8) * 0.18;
    ref.current.rotation.y = t * 1.2;
    // Scale pulse when nearby
    const s = near ? 1.0 + Math.sin(t * 4) * 0.06 : 1.0;
    ref.current.scale.setScalar(s * 0.55);
  });

  return (
    <group position={GUN_POS}>
      <group ref={ref}>
        <primitive object={scene} />
      </group>
      {/* Glow ring on ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]}>
        <ringGeometry args={[0.35, 0.62, 16]} />
        <meshBasicMaterial color="#ffff00" transparent opacity={0.30} />
      </mesh>
      <pointLight position={[0, 1.0, 0]} color="#ffcc00" intensity={nearby ? 8 : 4} distance={6} decay={2} />
      {nearby && (
        <Text position={[0, 3.2, 0]} fontSize={0.22} color="#ffcc00"
          anchorX="center" anchorY="middle" outlineWidth={0.03} outlineColor="#000000">
          {'[E]  PICK UP WEAPON'}
        </Text>
      )}
    </group>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CHRISTMAS / BARREL TREE — seasonal decoration in the park
// ─────────────────────────────────────────────────────────────────────────────
function ChristmasTree() {
  const { scene } = useGLTF('/icons8_christmas_tree_long_barrel.glb') as any;
  const ref = useRef<THREE.Group>(null);
  useFrame(state => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime;
    // Slow gentle sway
    ref.current.rotation.z = Math.sin(t * 0.5) * 0.025;
  });
  return (
    <group position={[-155, 0, 62]}>
      <group ref={ref} scale={1.8}>
        <primitive object={scene} />
      </group>
      {/* Ornament glow */}
      <pointLight position={[0, 2, 0]} color="#ff4444" intensity={4} distance={8} decay={2} />
    </group>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PROP 10 — Large building from 10.gltf (East Downtown background)
// ─────────────────────────────────────────────────────────────────────────────
function Prop10Building() {
  const { scene } = useGLTF('/10.gltf') as any;
  return (
    <group position={[205, 0, -45]} rotation={[0, Math.PI * 0.5, 0]} scale={5.0}>
      <primitive object={scene} />
    </group>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// WorldModels — render all models
// ─────────────────────────────────────────────────────────────────────────────
export function WorldModels() {
  return (
    <>
      {/* Existing creatures / interactive */}
      <OwlModel />
      <RabbitModel />
      <TigerModel />
      <GhostModel />
      <WarriorModel />
      <Character76Model />
      <GameConsoleModel />

      {/* New: bayou atmosphere */}
      <PalmTrees />

      {/* New: buildings */}
      <HotelBuilding />
      <CourthouseBuilding />
      <Prop10Building />

      {/* New: interactive props */}
      <GamesGunPickup />
      <ChristmasTree />

      {/* City bus — KB3D FBX, drives east-west on Chippewa Blvd */}
      <Suspense fallback={null}>
        <CityBus />
      </Suspense>

      {/* Security guards — patrolling key city spots */}
      <Suspense fallback={null}>
        <SecurityGuards />
      </Suspense>
    </>
  );
}

// Pre-warm asset cache
useGLTF.preload('/OWL.glb');
useGLTF.preload('/RABBIT.glb');
useGLTF.preload('/TIGER.glb');
useGLTF.preload('/RETRO%20GAME%20GHOST.glb');
useGLTF.preload('/30.Warrior.glb');
useGLTF.preload('/76.glb');
useGLTF.preload('/14_Game%20Console.glb');
useGLTF.preload('/14_Palm%20Tree.glb');
useGLTF.preload('/cartoon-hotel-building-structure-2026-02-08-13-35-25-utc/1.Hotel.glb');
useGLTF.preload('/courthouse-building-3d-illustration-2026-01-18-02-54-11-utc/10_Courthouse%20Building.glb');
useGLTF.preload('/vibrantly-colored-toy-gun-2026-02-09-00-00-02-utc/GAMES%20GUN.glb');
useGLTF.preload('/icons8_christmas_tree_long_barrel.glb');
useGLTF.preload('/10.gltf');
