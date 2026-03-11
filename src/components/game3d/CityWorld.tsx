import { useMemo, useRef } from 'react';
import { RigidBody } from '@react-three/rapier';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { cityInteractions } from '@/data/interactions';
import { seededRandom } from '@/utils/terrain';
import { Headquarters } from './Headquarters';

interface BuildingData {
  x: number;
  z: number;
  w: number;
  d: number;
  h: number;
  neon: boolean;
  neonSide: number;
}

export function CityWorld() {
  const buildings = useMemo(() => {
    const rng = seededRandom(42);
    const result: BuildingData[] = [];

    for (let bx = -3; bx <= 3; bx++) {
      for (let bz = -3; bz <= 3; bz++) {
        // Skip road center and HQ area
        if (Math.abs(bx) <= 0 && Math.abs(bz) <= 0) continue;
        if (bx === 0 && bz === -1) continue; // HQ area
        if (bx === 0 && bz === -2) continue;

        const baseX = bx * 18;
        const baseZ = bz * 18;
        const count = 1 + Math.floor(rng() * 2);

        for (let i = 0; i < count; i++) {
          const w = 5 + rng() * 6;
          const d = 5 + rng() * 6;
          const h = 6 + rng() * 22;
          const x = baseX + (rng() - 0.5) * 6;
          const z = baseZ + (rng() - 0.5) * 6;
          result.push({ x, z, w, d, h, neon: rng() > 0.5, neonSide: Math.floor(rng() * 4) });
        }
      }
    }
    return result;
  }, []);

  return (
    <group>
      {/* Lighting */}
      <ambientLight intensity={0.08} color="#334" />
      <directionalLight position={[30, 50, 20]} intensity={0.3} color="#4466aa" />
      <fog attach="fog" args={['#050508', 20, 120]} />

      {/* Ground */}
      <RigidBody type="fixed">
        <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[200, 200]} />
          <meshStandardMaterial color="#0d0d0d" roughness={0.9} />
        </mesh>
      </RigidBody>

      {/* Road markings */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <planeGeometry args={[1, 200]} />
        <meshBasicMaterial color="#222" />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <planeGeometry args={[200, 1]} />
        <meshBasicMaterial color="#222" />
      </mesh>

      {/* Sidewalks */}
      {[-5, 5].map(offset => (
        <group key={`sw-x-${offset}`}>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[offset, 0.05, 0]}>
            <planeGeometry args={[2, 200]} />
            <meshStandardMaterial color="#1a1a1a" roughness={0.8} />
          </mesh>
        </group>
      ))}
      {[-5, 5].map(offset => (
        <group key={`sw-z-${offset}`}>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, offset]}>
            <planeGeometry args={[200, 2]} />
            <meshStandardMaterial color="#1a1a1a" roughness={0.8} />
          </mesh>
        </group>
      ))}

      {/* HQ Building */}
      <Headquarters />

      {/* Store Buildings */}
      <StoreBuilding position={[25, 0, -45]} label="AUTO" color="#00ff88" />
      <StoreBuilding position={[-40, 0, 10]} label="ARMS" color="#FF4444" />
      <StoreBuilding position={[-15, 0, -45]} label="MUSIC" color="#9b59b6" />

      {/* Buildings */}
      {buildings.map((b, i) => (
        <Building key={i} data={b} />
      ))}

      {/* Street lights */}
      <StreetLights />

      {/* Neon accent lights */}
      <pointLight position={[-30, 4, -25]} color="#F000B8" intensity={8} distance={15} />
      <pointLight position={[35, 4, -35]} color="#F000B8" intensity={8} distance={15} />
      <pointLight position={[15, 3, 18]} color="#F000B8" intensity={5} distance={12} />
      <pointLight position={[-18, 3, 30]} color="#F000B8" intensity={5} distance={12} />
      <pointLight position={[25, 5, -45]} color="#00ff88" intensity={6} distance={15} />
      <pointLight position={[-40, 5, 10]} color="#FF4444" intensity={6} distance={15} />
      <pointLight position={[-15, 5, -45]} color="#9b59b6" intensity={6} distance={15} />

      {/* Interaction markers */}
      {cityInteractions.map(point => (
        <InteractionMarker key={point.id} position={point.position} type={point.type} />
      ))}

      {/* NPC pedestrians */}
      <NPCs />
    </group>
  );
}

function Building({ data }: { data: BuildingData }) {
  const { x, z, w, d, h, neon, neonSide } = data;
  return (
    <RigidBody type="fixed" position={[x, h / 2, z]}>
      <mesh castShadow>
        <boxGeometry args={[w, h, d]} />
        <meshStandardMaterial color="#111118" roughness={0.8} metalness={0.2} />
      </mesh>
      {neon && (
        <mesh position={[
          neonSide === 0 ? w / 2 + 0.05 : neonSide === 1 ? -w / 2 - 0.05 : 0,
          h * 0.2,
          neonSide === 2 ? d / 2 + 0.05 : neonSide === 3 ? -d / 2 - 0.05 : 0,
        ]} rotation={[0, neonSide >= 2 ? Math.PI / 2 : 0, 0]}>
          <planeGeometry args={[w * 0.6, 1.5]} />
          <meshBasicMaterial color="#F000B8" transparent opacity={0.9} />
        </mesh>
      )}
    </RigidBody>
  );
}

function StreetLights() {
  const positions = useMemo(() => {
    const pts: [number, number, number][] = [];
    for (let i = -4; i <= 4; i++) {
      if (i === 0) continue;
      pts.push([7, 0, i * 15]);
      pts.push([-7, 0, i * 15]);
    }
    return pts;
  }, []);

  return (
    <>
      {positions.map((pos, i) => (
        <group key={i} position={pos}>
          <mesh position={[0, 3, 0]}>
            <cylinderGeometry args={[0.05, 0.08, 6, 6]} />
            <meshStandardMaterial color="#333" metalness={0.8} />
          </mesh>
          <pointLight position={[0, 6, 0]} color="#ffddaa" intensity={2} distance={12} />
        </group>
      ))}
    </>
  );
}

function StoreBuilding({ position, label, color }: { position: [number, number, number]; label: string; color: string }) {
  return (
    <RigidBody type="fixed" position={[position[0], 5, position[2]]}>
      <mesh castShadow>
        <boxGeometry args={[8, 10, 8]} />
        <meshStandardMaterial color="#0a0a15" roughness={0.7} metalness={0.3} />
      </mesh>
      {/* Neon sign */}
      <mesh position={[0, 3, 4.05]}>
        <planeGeometry args={[6, 2]} />
        <meshBasicMaterial color={color} transparent opacity={0.9} />
      </mesh>
      <mesh position={[0, 3, -4.05]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[6, 2]} />
        <meshBasicMaterial color={color} transparent opacity={0.9} />
      </mesh>
      {/* Awning */}
      <mesh position={[0, -4, 5]}>
        <boxGeometry args={[9, 0.3, 2]} />
        <meshStandardMaterial color={color} transparent opacity={0.4} />
      </mesh>
    </RigidBody>
  );
}

function InteractionMarker({ position, type }: { position: [number, number, number]; type: string }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const color = type === 'travel' ? '#00ff88'
    : type === 'mission' ? '#F000B8'
    : type === 'recruit' ? '#ffaa00'
    : type === 'character' ? '#44ddff'
    : type === 'store' ? '#9b59b6'
    : '#F000B8';

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 2;
      meshRef.current.position.y = position[1] + Math.sin(Date.now() * 0.003) * 0.3;
    }
  });

  return (
    <group position={[position[0], 0, position[2]]}>
      <mesh position={[0, 0.5, 0]}>
        <cylinderGeometry args={[0.15, 0.15, 1, 6]} />
        <meshBasicMaterial color={color} transparent opacity={0.3} />
      </mesh>
      <mesh ref={meshRef} position={[0, position[1], 0]}>
        <octahedronGeometry args={[0.3]} />
        <meshBasicMaterial color={color} transparent opacity={0.8} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <ringGeometry args={[0.8, 1, 16]} />
        <meshBasicMaterial color={color} transparent opacity={0.2} />
      </mesh>
    </group>
  );
}

function NPCs() {
  const npcPositions = useMemo(() => {
    const rng = seededRandom(99);
    return Array.from({ length: 8 }, () => ({
      x: (rng() - 0.5) * 70,
      z: (rng() - 0.5) * 70,
      color: rng() > 0.5 ? '#E5E5E5' : '#888',
    }));
  }, []);

  return (
    <>
      {npcPositions.map((npc, i) => (
        <NPCFigure key={i} x={npc.x} z={npc.z} color={npc.color} seed={i} />
      ))}
    </>
  );
}

function NPCFigure({ x, z, color, seed }: { x: number; z: number; color: string; seed: number }) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      const t = state.clock.elapsedTime + seed * 100;
      groupRef.current.position.x = x + Math.sin(t * 0.3) * 3;
      groupRef.current.position.z = z + Math.cos(t * 0.2) * 3;
    }
  });

  return (
    <group ref={groupRef} position={[x, 0, z]}>
      <mesh position={[0, 0.8, 0]}>
        <boxGeometry args={[0.4, 1, 0.3]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh position={[0, 1.5, 0]}>
        <boxGeometry args={[0.3, 0.3, 0.3]} />
        <meshStandardMaterial color={color} />
      </mesh>
    </group>
  );
}
