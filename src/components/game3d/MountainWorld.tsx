import { useMemo, useRef, useEffect } from 'react';
import { RigidBody } from '@react-three/rapier';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { getTerrainHeight, seededRandom } from '@/utils/terrain';
import { mountainInteractions } from '@/data/interactions';

export function MountainWorld() {
  return (
    <group>
      {/* Lighting */}
      <ambientLight intensity={0.4} color="#aabbcc" />
      <directionalLight position={[50, 80, 30]} intensity={0.8} color="#ddeeff" castShadow />
      <fog attach="fog" args={['#b8c4d0', 30, 150]} />

      {/* Terrain */}
      <Terrain />

      {/* Trees */}
      <Trees />

      {/* Cabins */}
      <Cabin position={[25, getTerrainHeight(25, 20), 20]} />
      <Cabin position={[-40, getTerrainHeight(-40, 10), 10]} />

      {/* Cave entrance */}
      <CaveEntrance position={[-35, getTerrainHeight(-35, -30), -30]} />

      {/* Snow particles */}
      <SnowParticles />

      {/* Interaction markers */}
      {mountainInteractions.map(point => (
        <MountainMarker key={point.id} position={point.position} type={point.type} />
      ))}

      {/* Frozen lake */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[15, getTerrainHeight(15, -10) - 1, -10]}>
        <circleGeometry args={[12, 32]} />
        <meshStandardMaterial color="#8899bb" roughness={0.1} metalness={0.5} transparent opacity={0.7} />
      </mesh>
    </group>
  );
}

function Terrain() {
  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(250, 250, 80, 80);
    const positions = geo.attributes.position;

    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i);
      const y = positions.getY(i);
      const height = getTerrainHeight(x, y);
      positions.setZ(i, height);
    }

    positions.needsUpdate = true;
    geo.computeVertexNormals();
    return geo;
  }, []);

  return (
    <RigidBody type="fixed" colliders="trimesh">
      <mesh rotation={[-Math.PI / 2, 0, 0]} geometry={geometry} receiveShadow>
        <meshStandardMaterial color="#e8e8e8" roughness={0.85} />
      </mesh>
    </RigidBody>
  );
}

function Trees() {
  const trunkRef = useRef<THREE.InstancedMesh>(null);
  const foliageRef = useRef<THREE.InstancedMesh>(null);

  const treeData = useMemo(() => {
    const rng = seededRandom(77);
    const positions: [number, number, number][] = [];
    const scales: number[] = [];

    for (let i = 0; i < 150; i++) {
      const x = (rng() - 0.5) * 200;
      const z = (rng() - 0.5) * 200;
      const y = getTerrainHeight(x, z);

      if (y > -3 && y < 18) {
        positions.push([x, y, z]);
        scales.push(0.6 + rng() * 0.6);
      }
    }

    return { positions, scales };
  }, []);

  useEffect(() => {
    if (!trunkRef.current || !foliageRef.current) return;

    const dummy = new THREE.Object3D();

    treeData.positions.forEach(([x, y, z], i) => {
      const s = treeData.scales[i];

      // Trunk
      dummy.position.set(x, y + 1.5 * s, z);
      dummy.scale.set(s * 0.3, s * 3, s * 0.3);
      dummy.updateMatrix();
      trunkRef.current!.setMatrixAt(i, dummy.matrix);

      // Foliage
      dummy.position.set(x, y + 4 * s, z);
      dummy.scale.set(s * 2, s * 4, s * 2);
      dummy.updateMatrix();
      foliageRef.current!.setMatrixAt(i, dummy.matrix);
    });

    trunkRef.current.instanceMatrix.needsUpdate = true;
    foliageRef.current.instanceMatrix.needsUpdate = true;
  }, [treeData]);

  const count = treeData.positions.length;

  return (
    <>
      <instancedMesh ref={trunkRef} args={[undefined, undefined, count]} castShadow>
        <cylinderGeometry args={[0.15, 0.2, 1, 6]} />
        <meshStandardMaterial color="#3d2b1f" />
      </instancedMesh>
      <instancedMesh ref={foliageRef} args={[undefined, undefined, count]} castShadow>
        <coneGeometry args={[1, 1, 6]} />
        <meshStandardMaterial color="#1a3a1a" />
      </instancedMesh>
    </>
  );
}

function Cabin({ position }: { position: [number, number, number] }) {
  return (
    <RigidBody type="fixed" position={[position[0], position[1] + 1.5, position[2]]}>
      {/* Walls */}
      <mesh castShadow>
        <boxGeometry args={[5, 3, 4]} />
        <meshStandardMaterial color="#4a3728" roughness={0.9} />
      </mesh>
      {/* Roof */}
      <mesh position={[0, 2.2, 0]} rotation={[0, 0, 0]} castShadow>
        <boxGeometry args={[6, 0.3, 5]} />
        <meshStandardMaterial color="#2a1a0a" roughness={0.9} />
      </mesh>
      {/* Snow on roof */}
      <mesh position={[0, 2.4, 0]}>
        <boxGeometry args={[5.8, 0.15, 4.8]} />
        <meshStandardMaterial color="#e8e8e8" />
      </mesh>
      {/* Door */}
      <mesh position={[0, -0.3, 2.02]}>
        <planeGeometry args={[1, 2]} />
        <meshStandardMaterial color="#2a1a0a" />
      </mesh>
    </RigidBody>
  );
}

function CaveEntrance({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Rock formation */}
      <RigidBody type="fixed">
        <mesh position={[-2, 2, 0]} castShadow>
          <boxGeometry args={[2, 5, 4]} />
          <meshStandardMaterial color="#444" roughness={0.95} />
        </mesh>
        <mesh position={[2, 2, 0]} castShadow>
          <boxGeometry args={[2, 5, 4]} />
          <meshStandardMaterial color="#444" roughness={0.95} />
        </mesh>
        <mesh position={[0, 4, 0]} castShadow>
          <boxGeometry args={[6, 1.5, 4]} />
          <meshStandardMaterial color="#555" roughness={0.95} />
        </mesh>
      </RigidBody>
      {/* Dark interior */}
      <mesh position={[0, 1.5, -1]}>
        <boxGeometry args={[2, 3, 2]} />
        <meshBasicMaterial color="#000" />
      </mesh>
    </group>
  );
}

function SnowParticles() {
  const count = 800;
  const pointsRef = useRef<THREE.Points>(null);

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 120;
      pos[i * 3 + 1] = Math.random() * 40;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 120;
    }
    return pos;
  }, []);

  useFrame((state, delta) => {
    if (!pointsRef.current) return;
    const posAttr = pointsRef.current.geometry.attributes.position;
    const arr = posAttr.array as Float32Array;

    for (let i = 0; i < count; i++) {
      arr[i * 3] += Math.sin(state.clock.elapsedTime + i) * delta * 0.5;
      arr[i * 3 + 1] -= delta * 3;
      arr[i * 3 + 2] += Math.cos(state.clock.elapsedTime + i * 0.7) * delta * 0.3;

      if (arr[i * 3 + 1] < -2) {
        arr[i * 3 + 1] = 40;
        arr[i * 3] = (Math.random() - 0.5) * 120;
        arr[i * 3 + 2] = (Math.random() - 0.5) * 120;
      }
    }
    posAttr.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial size={0.12} color="#ffffff" transparent opacity={0.7} sizeAttenuation />
    </points>
  );
}

function MountainMarker({ position, type }: { position: [number, number, number]; type: string }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const color = type === 'travel' ? '#00ff88' : type === 'stash' ? '#ffaa00' : type === 'cave' ? '#6688ff' : '#F000B8';

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 1.5;
      meshRef.current.position.y = position[1] + 1 + Math.sin(Date.now() * 0.003) * 0.3;
    }
  });

  return (
    <group position={[position[0], 0, position[2]]}>
      <mesh ref={meshRef} position={[0, position[1] + 1, 0]}>
        <octahedronGeometry args={[0.4]} />
        <meshBasicMaterial color={color} transparent opacity={0.8} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, position[1] + 0.1, 0]}>
        <ringGeometry args={[0.6, 1, 12]} />
        <meshBasicMaterial color={color} transparent opacity={0.15} />
      </mesh>
    </group>
  );
}
