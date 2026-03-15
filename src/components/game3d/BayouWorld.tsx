import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import {
  LSUColonialHome,
  FraternityHouse,
  SuburbanHome,
  SplitLevelHome,
  RanchHome,
  ModernHome,
  CampusBuilding,
  StudentApartment,
  BayouMansion
} from './BatonRougeHomes';

// Bayou/Swamp water material
function BayouWater({ position }: { position: [number, number, number] }) {
  const waterRef = useRef<THREE.Mesh>(null);
  
  const waterMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: '#2d4a3e',
      roughness: 0.2,
      metalness: 0.1,
      transparent: true,
      opacity: 0.85,
    });
  }, []);

  useFrame(({ clock }) => {
    if (waterRef.current) {
      waterRef.current.position.y = position[1] + Math.sin(clock.elapsedTime * 0.5) * 0.05;
    }
  });

  return (
    <mesh ref={waterRef} position={position} rotation={[-Math.PI / 2, 0, 0]} material={waterMaterial}>
      <planeGeometry args={[200, 200, 32, 32]} />
    </mesh>
  );
}

// Cypress tree - iconic Louisiana swamp tree
function CypressTree({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  const trunkColor = '#3d2817';
  const mossColor = '#4a5d23';
  
  return (
    <group position={position} scale={scale}>
      {/* Trunk */}
      <mesh position={[0, 3, 0]}>
        <cylinderGeometry args={[0.3, 0.5, 6, 8]} />
        <meshStandardMaterial color={trunkColor} roughness={0.9} />
      </mesh>
      {/* Branches/ Knees */}
      <mesh position={[0.5, 1, 0.3]} rotation={[0.3, 0, 0.2]}>
        <cylinderGeometry args={[0.1, 0.15, 1.5, 6]} />
        <meshStandardMaterial color={trunkColor} roughness={0.9} />
      </mesh>
      <mesh position={[-0.4, 0.8, -0.2]} rotation={[-0.2, 0, -0.3]}>
        <cylinderGeometry args={[0.08, 0.12, 1.2, 6]} />
        <meshStandardMaterial color={trunkColor} roughness={0.9} />
      </mesh>
      {/* Spanish Moss hanging */}
      <mesh position={[0, 5, 0]}>
        <sphereGeometry args={[0.4, 8, 8]} />
        <meshStandardMaterial color={mossColor} roughness={1} />
      </mesh>
      <mesh position={[0.3, 4.5, 0.2]}>
        <sphereGeometry args={[0.25, 6, 6]} />
        <meshStandardMaterial color={mossColor} roughness={1} />
      </mesh>
    </group>
  );
}

// Southern style house - Louisiana/Cajun architecture
function SouthernHouse({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Main building */}
      <mesh position={[0, 1.5, 0]}>
        <boxGeometry args={[4, 3, 5]} />
        <meshStandardMaterial color="#d4c4a8" roughness={0.8} />
      </mesh>
      {/* Roof - steep pitch for rain */}
      <mesh position={[0, 3.5, 0]} rotation={[0, 0, 0]}>
        <coneGeometry args={[3.5, 2, 4]} />
        <meshStandardMaterial color="#5c4033" roughness={0.7} />
      </mesh>
      {/* Front porch */}
      <mesh position={[0, 0.75, 2.8]}>
        <boxGeometry args={[4, 1.5, 1.2]} />
        <meshStandardMaterial color="#8b7355" roughness={0.8} />
      </mesh>
      {/* Porch pillars */}
      {[-1.5, 1.5].map((x) => (
        <mesh key={x} position={[x, 1.25, 2.8]}>
          <cylinderGeometry args={[0.1, 0.1, 2.5, 6]} />
          <meshStandardMaterial color="#f5f5dc" roughness={0.6} />
        </mesh>
      ))}
      {/* Windows */}
      {[-1, 1].map((x) => (
        <mesh key={x} position={[x, 1.8, 2.51]}>
          <planeGeometry args={[0.8, 1]} />
          <meshStandardMaterial color="#87ceeb" emissive="#87ceeb" emissiveIntensity={0.1} />
        </mesh>
      ))}
      {/* Door */}
      <mesh position={[0, 1, 2.51]}>
        <planeGeometry args={[1, 2]} />
        <meshStandardMaterial color="#4a3728" roughness={0.6} />
      </mesh>
      {/* Stairs */}
      <mesh position={[0, 0.1, 3.5]}>
        <boxGeometry args={[1.5, 0.2, 1]} />
        <meshStandardMaterial color="#a08060" roughness={0.8} />
      </mesh>
    </group>
  );
}

// Cajun style shack/cabin
function CajunShack({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Main structure on stilts (typical for bayou) */}
      <mesh position={[0, 1, 0]}>
        <boxGeometry args={[3, 2, 3.5]} />
        <meshStandardMaterial color="#8b6914" roughness={0.9} />
      </mesh>
      {/* Metal roof */}
      <mesh position={[0, 2.2, 0]}>
        <boxGeometry args={[3.4, 0.1, 3.9]} />
        <meshStandardMaterial color="#4a4a4a" metalness={0.6} roughness={0.4} />
      </mesh>
      {/* Stilts/piers */}
      {[[-1.2, -1.4], [1.2, -1.4], [-1.2, 1.4], [1.2, 1.4]].map(([x, z], i) => (
        <mesh key={i} position={[x, 0.4, z]}>
          <cylinderGeometry args={[0.15, 0.15, 1.2, 6]} />
          <meshStandardMaterial color="#3d2817" roughness={0.9} />
        </mesh>
      ))}
      {/* Window */}
      <mesh position={[0, 1.2, 1.76]}>
        <planeGeometry args={[0.6, 0.6]} />
        <meshStandardMaterial color="#87ceeb" emissive="#87ceeb" emissiveIntensity={0.1} />
      </mesh>
    </group>
  );
}

// Waterfront dock/pier
function Dock({ position, rotation = 0 }: { position: [number, number, number]; rotation?: number }) {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      {/* Main platform */}
      <mesh position={[0, 0.1, 0]}>
        <boxGeometry args={[15, 0.2, 2]} />
        <meshStandardMaterial color="#5c4033" roughness={0.9} />
      </mesh>
      {/* Support posts */}
      {[-6, -3, 0, 3, 6].map((x) => (
        <mesh key={x} position={[x, -0.5, 0]}>
          <cylinderGeometry args={[0.15, 0.15, 1.4, 6]} />
          <meshStandardMaterial color="#3d2817" roughness={0.9} />
        </mesh>
      ))}
      {/* Railings */}
      <mesh position={[0, 0.7, 0.9]}>
        <boxGeometry args={[15, 0.1, 0.1]} />
        <meshStandardMaterial color="#4a3728" roughness={0.8} />
      </mesh>
      <mesh position={[0, 0.7, -0.9]}>
        <boxGeometry args={[15, 0.1, 0.1]} />
        <meshStandardMaterial color="#4a3728" roughness={0.8} />
      </mesh>
    </group>
  );
}

// Marsh grass patches
function MarshGrass({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {Array.from({ length: 8 }).map((_, i) => (
        <mesh key={i} position={[(Math.random() - 0.5) * 2, 0.3, (Math.random() - 0.5) * 2]}>
          <coneGeometry args={[0.05, 0.6 + Math.random() * 0.3, 4]} />
          <meshStandardMaterial color="#4a5d23" roughness={0.9} />
        </mesh>
      ))}
    </group>
  );
}

// Boat - typical bayou transportation
function BayouBoat({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Hull */}
      <mesh position={[0, 0.2, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.4, 0.5, 3, 12, 1, false, 0, Math.PI]} />
        <meshStandardMaterial color="#5c4033" roughness={0.8} />
      </mesh>
      {/* Motor */}
      <mesh position={[1.5, 0.3, 0]}>
        <boxGeometry args={[0.5, 0.4, 0.3]} />
        <meshStandardMaterial color="#333333" metalness={0.7} roughness={0.3} />
      </mesh>
    </group>
  );
}

// Alligator (stylized)
function Alligator({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Body */}
      <mesh position={[0, 0.15, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <capsuleGeometry args={[0.2, 0.8, 4, 8]} />
        <meshStandardMaterial color="#2d4a2d" roughness={0.8} />
      </mesh>
      {/* Head */}
      <mesh position={[0, 0.2, 0.7]} rotation={[Math.PI / 2, 0, 0]}>
        <capsuleGeometry args={[0.12, 0.4, 4, 6]} />
        <meshStandardMaterial color="#2d4a2d" roughness={0.8} />
      </mesh>
      {/* Eyes */}
      <mesh position={[0.1, 0.28, 0.55]}>
        <sphereGeometry args={[0.03, 8, 8]} />
        <meshStandardMaterial color="#ffcc00" emissive="#ffcc00" emissiveIntensity={0.5} />
      </mesh>
      <mesh position={[-0.1, 0.28, 0.55]}>
        <sphereGeometry args={[0.03, 8, 8]} />
        <meshStandardMaterial color="#ffcc00" emissive="#ffcc00" emissiveIntensity={0.5} />
      </mesh>
    </group>
  );
}

// Fireflies - magical swamp ambiance
function Fireflies() {
  const count = 30;
  const positions = useMemo(() => {
    return Array.from({ length: count }).map(() => ({
      x: (Math.random() - 0.5) * 80,
      y: 1 + Math.random() * 4,
      z: (Math.random() - 0.5) * 80,
    }));
  }, []);

  const pointsRef = useRef<THREE.Points>(null);

  useFrame(({ clock }) => {
    if (pointsRef.current) {
      const positions = pointsRef.current.geometry.attributes.position;
      for (let i = 0; i < count; i++) {
        positions.setY(i, positions.getY(i) + Math.sin(clock.elapsedTime * 2 + i) * 0.002);
        positions.setX(i, positions.getX(i) + Math.cos(clock.elapsedTime + i * 0.5) * 0.003);
      }
      positions.needsUpdate = true;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={new Float32Array(positions.flatMap(p => [p.x, p.y, p.z]))}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial size={0.15} color="#ffff99" transparent opacity={0.8} sizeAttenuation />
    </points>
  );
}

// Lightning bugs / atmospheric particles
function AtmosphericParticles() {
  const count = 100;
  const positions = useMemo(() => {
    return new Float32Array(Array.from({ length: count * 3 }).map(() => (Math.random() - 0.5) * 100));
  }, []);

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.05} color="#88aa88" transparent opacity={0.4} sizeAttenuation />
    </points>
  );
}

// Fog effect for swamp atmosphere
function SwampFog() {
  return (
    <fog attach="fog" args={['#1a2f1a', 10, 80]} />
  );
}

// Main Bayou World component
export function BayouWorld() {
  return (
    <group>
      <SwampFog />
      
      {/* Ambient lighting for swamp */}
      <ambientLight intensity={0.4} color="#88aa88" />
      <directionalLight position={[10, 20, 10]} intensity={0.6} color="#ffdd88" />
      <pointLight position={[0, 5, 0]} intensity={0.3} color="#88ff88" distance={20} />

      {/* Ground/Swamp floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]} receiveShadow>
        <planeGeometry args={[200, 200]} />
        <meshStandardMaterial color="#2d3d2d" roughness={1} />
      </mesh>

      {/* Water areas */}
      <BayouWater position={[0, -0.3, 0]} />
      <BayouWater position={[-30, -0.3, 20]} />
      <BayouWater position={[25, -0.3, -15]} />

      {/* Cypress trees */}
      {[
        [-8, 0, -5], [-12, 0, 8], [-15, 0, -10], [-20, 0, 5],
        [8, 0, 10], [12, 0, -8], [18, 0, 12], [22, 0, -5],
        [-5, 0, 15], [15, 0, 18], [-25, 0, -15], [28, 0, -20],
        [-18, 0, 20], [5, 0, -18], [-10, 0, -20], [20, 0, 25],
      ].map((pos, i) => (
        <CypressTree key={i} position={pos as [number, number, number]} scale={0.8 + Math.random() * 0.6} />
      ))}

      {/* Southern Houses */}
      <SouthernHouse position={[-15, 0, -20]} />
      <SouthernHouse position={[20, 0, -25]} />
      <SouthernHouse position={[-25, 0, 15]} />

      {/* Cajun Shacks */}
      <CajunShack position={[10, 0, 15]} />
      <CajunShack position={[-20, 0, -8]} />
      <CajunShack position={[25, 0, 5]} />

      {/* ═══════════════════════════════════════════════════════════════
          BATON ROUGE HOMES - LSU / Baton Rouge Area
          Based on location: 30.4733737,-91.1516449 (Baton Rouge, LA)
      ═══════════════════════════════════════════════════════════════ */}

      {/* LSU Colonial Homes - Traditional Baton Rouge */}
      <LSUColonialHome position={[35, 0, -30]} />
      <LSUColonialHome position={[40, 0, -35]} />
      <LSUColonialHome position={[-35, 0, -35]} />

      {/* Fraternity Houses - LSU Greek Row style */}
      <FraternityHouse position={[30, 0, 25]} color="#8B4513" />
      <FraternityHouse position={[35, 0, 30]} color="#4a2c2a" />
      <FraternityHouse position={[28, 0, 35]} color="#2f4f4f" />

      {/* Suburban Baton Rouge Homes */}
      <SuburbanHome position={[-30, 0, -30]} />
      <SuburbanHome position={[-35, 0, -25]} />
      <SuburbanHome position={[45, 0, -20]} />
      <SuburbanHome position={[50, 0, -15]} />

      {/* Split Level Homes */}
      <SplitLevelHome position={[-40, 0, 30]} />
      <SplitLevelHome position={[45, 0, 35]} />

      {/* Ranch Style Homes */}
      <RanchHome position={[30, 0, -40]} />
      <RanchHome position={[-30, 0, 40]} />
      <RanchHome position={[50, 0, 10]} />

      {/* Modern Baton Rouge Homes */}
      <ModernHome position={[-45, 0, -15]} />
      <ModernHome position={[55, 0, -25]} />

      {/* LSU Campus Buildings */}
      <CampusBuilding position={[40, 0, 0]} />
      <CampusBuilding position={[-40, 0, 5]} />

      {/* Student Apartments */}
      <StudentApartment position={[45, 0, 20]} />
      <StudentApartment position={[-45, 0, -5]} />
      <StudentApartment position={[50, 0, -5]} />

      {/* Bayou Mansions - Waterfront Louisiana homes */}
      <BayouMansion position={[-50, 0, 20]} />
      <BayouMansion position={[55, 0, 30]} />
      <BayouMansion position={[-55, 0, -25]} />

      {/* Docks */}
      <Dock position={[-5, 0, 0]} rotation={Math.PI / 4} />
      <Dock position={[15, 0, -10]} rotation={-Math.PI / 6} />
      <Dock position={[-25, 0, 10]} rotation={Math.PI / 3} />

      {/* Marsh grass patches */}
      {[
        [-3, 0, 5], [5, 0, -3], [-8, 0, 12], [12, 0, 8],
        [-18, 0, -5], [18, 0, -12], [-12, 0, 18], [8, 0, 20],
      ].map((pos, i) => (
        <MarshGrass key={i} position={pos as [number, number, number]} />
      ))}

      {/* Boats */}
      <BayouBoat position={[-6, 0.3, 2]} />
      <BayouBoat position={[16, 0.3, -8]} />
      <BayouBoat position={[-24, 0.3, 8]} />

      {/* Alligators (ambient creatures) */}
      <Alligator position={[5, 0, -15]} />
      <Alligator position={[-10, 0, 8]} />
      <Alligator position={[20, 0, 15]} />

      {/* Fireflies */}
      <Fireflies />
      <AtmosphericParticles />
    </group>
  );
}
