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
        if (Math.abs(bx) <= 0 && Math.abs(bz) <= 0) continue;
        if (bx === 0 && bz === -1) continue;
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

      {/* Store Buildings - 4 immersive stores */}
      <DealershipBuilding position={[25, 0, -45]} />
      <ArmoryBuilding position={[-40, 0, 10]} />
      <MusicStoreBuilding position={[-15, 0, -45]} />
      <ToolShopBuilding position={[40, 0, 30]} />

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

      {/* Interaction markers */}
      {cityInteractions.map(point => (
        <InteractionMarker key={point.id} position={point.position} type={point.type} />
      ))}

      {/* NPC pedestrians + store shoppers */}
      <NPCs />
      <StoreNPCs />
    </group>
  );
}

/* ─── Dealership ─── */
function DealershipBuilding({ position }: { position: [number, number, number] }) {
  const platformRef = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    if (platformRef.current) platformRef.current.rotation.y += delta * 0.5;
  });

  return (
    <group position={position}>
      {/* Main building */}
      <RigidBody type="fixed" position={[0, 5, 0]}>
        <mesh castShadow>
          <boxGeometry args={[14, 10, 12]} />
          <meshStandardMaterial color="#080812" roughness={0.6} metalness={0.4} />
        </mesh>
      </RigidBody>
      {/* Glass front */}
      <mesh position={[0, 4, 6.05]}>
        <planeGeometry args={[12, 8]} />
        <meshStandardMaterial color="#1a2a3a" transparent opacity={0.3} metalness={0.8} roughness={0.1} />
      </mesh>
      {/* Neon sign */}
      <mesh position={[0, 8.5, 6.1]}>
        <planeGeometry args={[10, 2]} />
        <meshBasicMaterial color="#00ff88" transparent opacity={0.9} />
      </mesh>
      <pointLight position={[0, 8, 7]} color="#00ff88" intensity={8} distance={15} />
      {/* Showroom rotating platform */}
      <group ref={platformRef} position={[0, 0.3, 0]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[3, 3, 0.15, 32]} />
          <meshStandardMaterial color="#1a1a2e" metalness={0.6} roughness={0.3} />
        </mesh>
        {/* Display car */}
        <mesh position={[0, 0.6, 0]}>
          <boxGeometry args={[2, 0.8, 3.5]} />
          <meshStandardMaterial color="#2a0a3e" metalness={0.4} roughness={0.4} />
        </mesh>
        <mesh position={[0, 1.2, -0.3]}>
          <boxGeometry args={[1.8, 0.6, 1.8]} />
          <meshStandardMaterial color="#2a0a3e" metalness={0.4} roughness={0.4} />
        </mesh>
      </group>
      {/* Side vehicles on display */}
      {[-4, 4].map(x => (
        <group key={x} position={[x, 0, 0]}>
          <mesh position={[0, 0.5, 0]}>
            <boxGeometry args={[1.5, 0.6, 2.5]} />
            <meshStandardMaterial color="#1a1a2e" metalness={0.3} />
          </mesh>
        </group>
      ))}
      {/* Awning */}
      <mesh position={[0, -0.5, 7]}>
        <boxGeometry args={[15, 0.3, 3]} />
        <meshStandardMaterial color="#00ff88" transparent opacity={0.3} />
      </mesh>
      {/* Floor lights */}
      <pointLight position={[0, 1, 0]} color="#00ff88" intensity={3} distance={8} />
    </group>
  );
}

/* ─── Armory ─── */
function ArmoryBuilding({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <RigidBody type="fixed" position={[0, 4.5, 0]}>
        <mesh castShadow>
          <boxGeometry args={[10, 9, 10]} />
          <meshStandardMaterial color="#0a0808" roughness={0.8} metalness={0.2} />
        </mesh>
      </RigidBody>
      {/* Reinforced door */}
      <mesh position={[0, 2.5, 5.05]}>
        <boxGeometry args={[3, 5, 0.3]} />
        <meshStandardMaterial color="#222" metalness={0.7} roughness={0.3} />
      </mesh>
      {/* Neon sign */}
      <mesh position={[0, 7.5, 5.1]}>
        <planeGeometry args={[8, 2]} />
        <meshBasicMaterial color="#FF4444" transparent opacity={0.9} />
      </mesh>
      <pointLight position={[0, 7, 6]} color="#FF4444" intensity={8} distance={15} />
      {/* Weapon display racks */}
      {[-3, 0, 3].map(x => (
        <group key={x} position={[x, 3, -4]}>
          <mesh>
            <boxGeometry args={[0.1, 4, 0.5]} />
            <meshStandardMaterial color="#333" metalness={0.6} />
          </mesh>
          {/* Weapons on rack */}
          {[0.8, 1.6, 2.4].map(y => (
            <mesh key={y} position={[0, y - 1, 0.3]}>
              <boxGeometry args={[0.8, 0.1, 0.15]} />
              <meshStandardMaterial color="#555" metalness={0.8} />
            </mesh>
          ))}
        </group>
      ))}
      {/* Glass cases */}
      {[-2.5, 2.5].map(x => (
        <mesh key={x} position={[x, 1.2, 0]}>
          <boxGeometry args={[2, 1.2, 1.5]} />
          <meshStandardMaterial color="#1a2a3a" transparent opacity={0.2} metalness={0.9} roughness={0.05} />
        </mesh>
      ))}
      {/* Interior red accent lights */}
      <pointLight position={[0, 2, 0]} color="#FF4444" intensity={3} distance={8} />
      <pointLight position={[-3, 4, 0]} color="#FF2222" intensity={2} distance={6} />
      <pointLight position={[3, 4, 0]} color="#FF2222" intensity={2} distance={6} />
    </group>
  );
}

/* ─── Music Store ─── */
function MusicStoreBuilding({ position }: { position: [number, number, number] }) {
  const hologramRef = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (hologramRef.current) {
      hologramRef.current.position.y = 6 + Math.sin(state.clock.elapsedTime * 1.5) * 0.3;
      hologramRef.current.rotation.y = state.clock.elapsedTime * 0.8;
    }
  });

  return (
    <group position={position}>
      <RigidBody type="fixed" position={[0, 5, 0]}>
        <mesh castShadow>
          <boxGeometry args={[12, 10, 10]} />
          <meshStandardMaterial color="#0a0515" roughness={0.6} metalness={0.3} />
        </mesh>
      </RigidBody>
      {/* Neon sign */}
      <mesh position={[0, 8.5, 5.1]}>
        <planeGeometry args={[10, 2]} />
        <meshBasicMaterial color="#9b59b6" transparent opacity={0.9} />
      </mesh>
      <pointLight position={[0, 8, 6]} color="#9b59b6" intensity={8} distance={15} />
      {/* Floating holographic album covers */}
      <group ref={hologramRef} position={[0, 6, 0]}>
        <mesh>
          <boxGeometry args={[2, 2, 0.05]} />
          <meshBasicMaterial color="#9b59b6" transparent opacity={0.6} />
        </mesh>
      </group>
      {/* Additional floating albums */}
      {[[-3, 4.5, 2], [3, 5, -2], [-2, 5.5, -3], [2, 4, 3]].map(([x, y, z], i) => (
        <FloatingAlbum key={i} position={[x, y, z]} delay={i * 0.4} />
      ))}
      {/* Listening stations - glowing cylinders */}
      {[-3, 0, 3].map(x => (
        <group key={x} position={[x, 0, 3]}>
          <mesh position={[0, 0.6, 0]}>
            <cylinderGeometry args={[0.5, 0.5, 1.2, 8]} />
            <meshStandardMaterial color="#1a0a2e" emissive="#9b59b6" emissiveIntensity={0.3} metalness={0.6} />
          </mesh>
          <pointLight position={[0, 1.5, 0]} color="#9b59b6" intensity={2} distance={4} />
        </group>
      ))}
      {/* DJ booth */}
      <mesh position={[0, 1, -3.5]}>
        <boxGeometry args={[4, 1.5, 2]} />
        <meshStandardMaterial color="#1a0a2e" metalness={0.5} />
      </mesh>
      <pointLight position={[0, 3, -3.5]} color="#F000B8" intensity={4} distance={6} />
      {/* Floor neon strips */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <ringGeometry args={[3, 3.2, 16]} />
        <meshBasicMaterial color="#9b59b6" transparent opacity={0.4} />
      </mesh>
      {/* Interior ambient */}
      <pointLight position={[0, 2, 0]} color="#9b59b6" intensity={3} distance={10} />
    </group>
  );
}

function FloatingAlbum({ position, delay }: { position: [number, number, number]; delay: number }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (ref.current) {
      ref.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 1.2 + delay) * 0.4;
      ref.current.rotation.y = state.clock.elapsedTime * 0.5 + delay;
    }
  });
  return (
    <mesh ref={ref} position={position}>
      <boxGeometry args={[1.2, 1.2, 0.04]} />
      <meshBasicMaterial color="#9b59b6" transparent opacity={0.5} />
    </mesh>
  );
}

/* ─── Tool Shop ─── */
function ToolShopBuilding({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <RigidBody type="fixed" position={[0, 4, 0]}>
        <mesh castShadow>
          <boxGeometry args={[9, 8, 9]} />
          <meshStandardMaterial color="#0a0f0a" roughness={0.8} metalness={0.2} />
        </mesh>
      </RigidBody>
      {/* Neon sign */}
      <mesh position={[0, 6.5, 4.55]}>
        <planeGeometry args={[7, 1.5]} />
        <meshBasicMaterial color="#FFD700" transparent opacity={0.9} />
      </mesh>
      <pointLight position={[0, 6, 5.5]} color="#FFD700" intensity={8} distance={15} />
      {/* Tool displays */}
      {[-2, 0, 2].map(x => (
        <group key={x} position={[x, 1.2, 0]}>
          <mesh>
            <boxGeometry args={[1.5, 1.8, 1]} />
            <meshStandardMaterial color="#1a1a0a" metalness={0.4} />
          </mesh>
          {/* Tool on display */}
          <mesh position={[0, 1.2, 0]} rotation={[0, 0, Math.PI / 4]}>
            <boxGeometry args={[0.1, 0.8, 0.1]} />
            <meshStandardMaterial color="#888" metalness={0.7} />
          </mesh>
        </group>
      ))}
      {/* Awning */}
      <mesh position={[0, -0.5, 5.5]}>
        <boxGeometry args={[10, 0.3, 2]} />
        <meshStandardMaterial color="#FFD700" transparent opacity={0.3} />
      </mesh>
      {/* Interior light */}
      <pointLight position={[0, 2, 0]} color="#FFD700" intensity={3} distance={8} />
    </group>
  );
}

/* ─── Common Components ─── */
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

/* Store NPCs - shoppers and security guards */
function StoreNPCs() {
  const storeNPCs = useMemo(() => [
    // Dealership shoppers
    { x: 23, z: -43, color: '#44ddff', seed: 100 },
    { x: 27, z: -47, color: '#dddddd', seed: 101 },
    // Armory guard
    { x: -38, z: 12, color: '#FF4444', seed: 102 },
    { x: -42, z: 8, color: '#888888', seed: 103 },
    // Music store visitors
    { x: -13, z: -43, color: '#9b59b6', seed: 104 },
    { x: -17, z: -47, color: '#cc88ff', seed: 105 },
    // Tool shop
    { x: 38, z: 28, color: '#FFD700', seed: 106 },
    { x: 42, z: 32, color: '#aaaaaa', seed: 107 },
  ], []);

  return (
    <>
      {storeNPCs.map((npc, i) => (
        <NPCFigure key={`store-${i}`} x={npc.x} z={npc.z} color={npc.color} seed={npc.seed} />
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
