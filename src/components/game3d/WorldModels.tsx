/**
 * WorldModels.tsx
 * Every imported GLB/OBJ model placed as an animated, interactive world inhabitant.
 *
 * Models and their roles:
 *   OWL.glb              — Ambient owl on a lamp post, swivels + blinks
 *   RABBIT.glb           — Rabbit hopping through West Suburbs park
 *   TIGER.glb            — Tiger prowling a slow circle in the park
 *   RETRO GAME GHOST.glb — Floating ghost in the alley, interactive easter egg
 *   30.Warrior.glb       — Warrior NPC on Government St (NorthBlvd)
 *   76.glb               — Street-art character in Downtown plaza
 *   14_Game Console.glb  — Interactive retro console near Virtual Studio
 *
 * 1.gltf — SKIPPED: 112 MB embedded buffer, cannot be streamed in real-time.
 *
 * All animations are procedural (useFrame) — none of the models contain
 * embedded skeletal animations.
 */
import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF, Text } from '@react-three/drei';
import * as THREE from 'three';
import { playerState } from '@/stores/playerStore';

// Squared distance check — cheaper than sqrt every frame
function distSq(ax: number, az: number, bx: number, bz: number) {
  return (ax - bx) ** 2 + (az - bz) ** 2;
}

// ─────────────────────────────────────────────────────────────────────────────
// OWL — perched on a lamp post at the east end of Chippewa
// Head swivels slowly, body bobs, glows at night
// ─────────────────────────────────────────────────────────────────────────────
function OwlModel() {
  const { scene } = useGLTF('/OWL.glb') as any;
  const bodyRef = useRef<THREE.Group>(null);

  useFrame(state => {
    if (!bodyRef.current) return;
    const t = state.clock.elapsedTime;
    // Slow head-swivel (applied to whole model since no rig)
    bodyRef.current.rotation.y = Math.sin(t * 0.42) * 0.72;
    // Subtle breathing bob
    bodyRef.current.position.y = Math.sin(t * 1.1) * 0.025;
    // Occasional tilt
    bodyRef.current.rotation.z = Math.sin(t * 0.28) * 0.05;
  });

  return (
    <group position={[52, 0, -8]}>
      {/* Lamp post — thin metal pole */}
      <mesh position={[0, 2.2, 0]}>
        <cylinderGeometry args={[0.055, 0.075, 4.4, 8]} />
        <meshStandardMaterial color="#1a1a22" metalness={0.75} roughness={0.35} />
      </mesh>
      {/* Crossbar */}
      <mesh position={[0, 4.3, 0.3]}>
        <boxGeometry args={[0.08, 0.08, 0.7]} />
        <meshStandardMaterial color="#1a1a22" metalness={0.75} roughness={0.35} />
      </mesh>
      {/* Lamp globe */}
      <mesh position={[0, 4.3, 0.65]}>
        <sphereGeometry args={[0.16, 8, 6]} />
        <meshStandardMaterial color="#ffee88" emissive="#ffee88" emissiveIntensity={1.0} roughness={0.3} />
      </mesh>

      {/* Owl sits on top of the pole */}
      <group position={[0, 4.55, 0]} scale={0.55}>
        <group ref={bodyRef}>
          <primitive object={scene} />
        </group>
      </group>

      {/* Faint glow on ground below */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <ringGeometry args={[0.3, 0.7, 14]} />
        <meshBasicMaterial color="#ffee88" transparent opacity={0.12} />
      </mesh>
    </group>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// RABBIT — hops through the West Suburbs park
// Discrete hop cycle, slow wandering drift
// ─────────────────────────────────────────────────────────────────────────────
function RabbitModel() {
  const { scene } = useGLTF('/RABBIT.glb') as any;
  const ref = useRef<THREE.Group>(null);
  const hopPhase = useRef(Math.random() * Math.PI * 2);

  useFrame((state, delta) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime;
    hopPhase.current += delta * 2.0;

    // Sharp hop shape: sin²(phase) clipped to 0–1
    const hop = Math.pow(Math.max(0, Math.sin(hopPhase.current)), 2) * 0.55;
    ref.current.position.y = hop;
    // Nose-down tilt on the way up
    ref.current.rotation.x = -hop * 0.28;

    // Slow oval wander around park centre
    ref.current.position.x = -148 + Math.sin(t * 0.17) * 5;
    ref.current.position.z = 14 + Math.cos(t * 0.21) * 4;
    // Face direction of travel
    const dx = Math.cos(t * 0.17) * 0.17;
    const dz = -Math.sin(t * 0.21) * 0.21;
    ref.current.rotation.y = Math.atan2(dx, dz);
  });

  return (
    <group>
      <group ref={ref} scale={0.65}>
        <primitive object={scene} />
      </group>
    </group>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TIGER — prowls a slow circle in the West Suburbs park
// Rolling gait, head bob, predatory confidence
// ─────────────────────────────────────────────────────────────────────────────
function TigerModel() {
  const { scene } = useGLTF('/TIGER.glb') as any;
  const ref = useRef<THREE.Group>(null);
  const CX = -140, CZ = -20, R = 7;

  useFrame(state => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime * 0.18;
    // Circular prowl
    ref.current.position.x = CX + Math.sin(t) * R;
    ref.current.position.z = CZ + Math.cos(t) * R;
    // Always face direction of travel
    ref.current.rotation.y = -(t + Math.PI * 0.5);
    // Rolling body sway (gait)
    ref.current.rotation.z = Math.sin(t * 8) * 0.045;
    // Head bob while walking
    ref.current.position.y = Math.abs(Math.sin(t * 4)) * 0.12;
  });

  return (
    <group ref={ref} scale={1.15}>
      <primitive object={scene} />
    </group>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// RETRO GAME GHOST — floating in the alley near the cinema
// Pulses, spins, reacts to player proximity. Interactive easter egg.
// Walk up and press [E] for a secret encounter.
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

    // Float up and down
    ref.current.position.y = 1.5 + Math.sin(t * 1.6) * 0.28;
    // Spin — faster when player is close
    ref.current.rotation.y = t * (near ? 2.8 : 0.55);
    // Pulse scale
    const pulse = 1.0 + Math.sin(t * 2.4) * 0.06;
    ref.current.scale.setScalar(pulse * 0.9);

    // Glow ring opacity
    if (glowRef.current) {
      (glowRef.current.material as THREE.MeshBasicMaterial).opacity =
        0.20 + Math.sin(t * 3.0) * 0.10 + (near ? 0.25 : 0);
    }
  });

  return (
    <group position={GHOST_POS}>
      <group ref={ref}>
        <primitive object={scene} />
      </group>

      {/* Ground glow ring */}
      <mesh ref={glowRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.04, 0]}>
        <ringGeometry args={[0.55, 0.90, 18]} />
        <meshBasicMaterial color="#a0ffa0" transparent opacity={0.22} />
      </mesh>

      {/* Point light — eerie green tint */}
      <pointLight position={[0, 1.8, 0]} color="#88ffaa" intensity={6} distance={7} decay={2} />

      {/* Interaction prompt */}
      {nearby && (
        <Text
          position={[0, 4.0, 0]}
          fontSize={0.22}
          color="#a0ffa0"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.03}
          outlineColor="#000000"
        >
          {'[E]  GHOST ENCOUNTER'}
        </Text>
      )}
    </group>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 30. WARRIOR — stands guard on Government St (NorthBlvd)
// Materials: Metal, Gold, Skin, White, Black, Red — fully detailed fighter.
// Idle: slow sway + breathing. Reacts when player gets close.
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
      // Alert stance — turn toward player
      const dx = playerState.x - ref.current.position.x;
      const dz = playerState.z - ref.current.position.z;
      const targetRot = Math.atan2(dx, dz);
      ref.current.rotation.y = THREE.MathUtils.lerp(ref.current.rotation.y, targetRot, 0.06);
      // Tense micro-sway
      ref.current.rotation.z = Math.sin(t * 4) * 0.015;
    } else {
      // Idle: slow scan + breathing
      ref.current.rotation.y = Math.sin(t * 0.22) * 0.35 + Math.PI;
      ref.current.position.y = Math.sin(t * 1.05) * 0.025;
      ref.current.rotation.z = Math.sin(t * 0.24) * 0.02;
    }
  });

  return (
    <group ref={ref} position={[-50, 0, -90]} scale={1.05}>
      <primitive object={scene} />
      {nearby && (
        <Text
          position={[0, 2.8, 0]}
          fontSize={0.20}
          color="#ff4444"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.025}
          outlineColor="#000000"
        >
          {'WARRIOR'}
        </Text>
      )}
    </group>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 76 — Street-art character in Downtown plaza
// Has a Text.019 node (3D "76" lettering), gradient materials.
// Floats on a plinth, rotates slowly, neon glow beneath.
// ─────────────────────────────────────────────────────────────────────────────
function Character76Model() {
  const { scene } = useGLTF('/76.glb') as any;
  const ref = useRef<THREE.Group>(null);
  const glowRef = useRef<THREE.Mesh>(null);

  useFrame(state => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime;
    // Slow pedestal rotation — like a street-art display
    ref.current.rotation.y = t * 0.14;
    // Gentle float
    ref.current.position.y = 1.2 + Math.sin(t * 0.7) * 0.08;

    if (glowRef.current) {
      (glowRef.current.material as THREE.MeshBasicMaterial).opacity =
        0.25 + Math.sin(t * 1.8) * 0.12;
    }
  });

  return (
    <group position={[112, 0, -8]}>
      {/* Stone plinth */}
      <mesh position={[0, 0.5, 0]}>
        <boxGeometry args={[1.6, 1.0, 1.6]} />
        <meshStandardMaterial color="#252530" roughness={0.9} metalness={0.1} />
      </mesh>
      {/* Plinth top cap */}
      <mesh position={[0, 1.05, 0]}>
        <boxGeometry args={[1.7, 0.12, 1.7]} />
        <meshStandardMaterial color="#1a1a22" roughness={0.85} metalness={0.15} />
      </mesh>

      {/* Model floats above plinth */}
      <group ref={ref} position={[0, 1.2, 0]} scale={1.1}>
        <primitive object={scene} />
      </group>

      {/* Colored neon ring on ground */}
      <mesh ref={glowRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <ringGeometry args={[0.85, 1.25, 20]} />
        <meshBasicMaterial color="#00f0d0" transparent opacity={0.28} />
      </mesh>
      {/* Upward spot light */}
      <pointLight position={[0, 0.3, 0]} color="#00f0d0" intensity={8} distance={6} decay={2} />
    </group>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// GAME CONSOLE — interactive prop near the Virtual Studio entrance
// Screen flickers. Walk up to play. Press [E] for the game console mission.
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

    // Subtle idle wobble
    ref.current.rotation.y = Math.sin(t * 0.18) * 0.06;
    // Screen flicker
    if (screenRef.current) {
      const flicker = 0.18 + Math.sin(t * 3.2) * 0.08 + Math.sin(t * 7.1) * 0.04;
      (screenRef.current.material as THREE.MeshBasicMaterial).opacity =
        flicker + (near ? 0.18 : 0);
    }
  });

  return (
    <group position={CONSOLE_POS}>
      <group ref={ref} scale={0.95}>
        <primitive object={scene} />
      </group>

      {/* Fake screen glow — blue rectangle hovering in front */}
      <mesh ref={screenRef} position={[0, 0.82, 0.42]}>
        <planeGeometry args={[0.72, 0.46]} />
        <meshBasicMaterial color="#0088ff" transparent opacity={0.22} />
      </mesh>

      {/* Under-console LED strip */}
      <mesh position={[0, 0.04, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.5, 0.82, 16]} />
        <meshBasicMaterial color="#0044ff" transparent opacity={0.35} />
      </mesh>
      <pointLight position={[0, 0.2, 0]} color="#0088ff" intensity={5} distance={5} decay={2} />

      {/* Interaction prompt */}
      {nearby && (
        <Text
          position={[0, 2.5, 0]}
          fontSize={0.21}
          color="#00aaff"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.028}
          outlineColor="#000000"
        >
          {'[E]  RETRO CONSOLE'}
        </Text>
      )}
    </group>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// WorldModels — render all models together
// Place inside <Suspense> in GameCanvas so loading doesn't block the scene.
// ─────────────────────────────────────────────────────────────────────────────
export function WorldModels() {
  return (
    <>
      <OwlModel />
      <RabbitModel />
      <TigerModel />
      <GhostModel />
      <WarriorModel />
      <Character76Model />
      <GameConsoleModel />
    </>
  );
}

// Pre-warm the asset cache so models begin loading immediately
useGLTF.preload('/OWL.glb');
useGLTF.preload('/RABBIT.glb');
useGLTF.preload('/TIGER.glb');
useGLTF.preload('/RETRO%20GAME%20GHOST.glb');
useGLTF.preload('/30.Warrior.glb');
useGLTF.preload('/76.glb');
useGLTF.preload('/14_Game%20Console.glb');
