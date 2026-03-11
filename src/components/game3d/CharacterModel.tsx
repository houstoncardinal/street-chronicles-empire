import { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { CharacterDef } from '@/data/characters';
import { playerState } from '@/stores/playerStore';
import { getTerrainHeight } from '@/utils/terrain';

interface CharacterModelProps {
  character: CharacterDef;
  isFollowing: boolean;
  relationship: number;
  currentRegion: 'city' | 'mountain';
}

export function CharacterModel({ character, isFollowing, relationship, currentRegion }: CharacterModelProps) {
  const groupRef = useRef<THREE.Group>(null);
  const leftLegRef = useRef<THREE.Mesh>(null);
  const rightLegRef = useRef<THREE.Mesh>(null);
  const leftArmRef = useRef<THREE.Mesh>(null);
  const rightArmRef = useRef<THREE.Mesh>(null);
  const headRef = useRef<THREE.Mesh>(null);
  const labelRef = useRef<THREE.Group>(null);

  const posRef = useRef(new THREE.Vector3(...character.homePosition));
  const walkPhase = useRef(0);

  const { visual } = character;
  const s = visual.heightScale;
  const bodyW = visual.buildType === 'stocky' ? 0.55 : visual.buildType === 'lean' ? 0.4 : 0.45;
  const bodyH = 0.9 * s;
  const bodyD = 0.3;

  useFrame((state, delta) => {
    if (!groupRef.current) return;

    const t = state.clock.elapsedTime;
    let targetX: number, targetZ: number;
    let isMoving = false;

    if (isFollowing) {
      // Follow behind the player
      const followDist = 3;
      const yawOffset = Math.PI; // behind
      targetX = playerState.x + Math.sin(playerState.yaw + yawOffset) * followDist;
      targetZ = playerState.z + Math.cos(playerState.yaw + yawOffset) * followDist;
    } else {
      // Idle wander near home position
      targetX = character.homePosition[0] + Math.sin(t * 0.2 + character.id.charCodeAt(0)) * 2;
      targetZ = character.homePosition[2] + Math.cos(t * 0.15 + character.id.charCodeAt(1)) * 2;

      // Only show in city if not following
      if (currentRegion !== 'city') {
        groupRef.current.visible = false;
        return;
      }
    }

    groupRef.current.visible = true;

    // Smoothly move toward target
    const dx = targetX - posRef.current.x;
    const dz = targetZ - posRef.current.z;
    const dist = Math.sqrt(dx * dx + dz * dz);

    if (dist > 0.3) {
      const speed = isFollowing ? 8 : 1.5;
      const moveSpeed = Math.min(speed * delta, dist);
      posRef.current.x += (dx / dist) * moveSpeed;
      posRef.current.z += (dz / dist) * moveSpeed;
      isMoving = true;

      // Face movement direction
      const angle = Math.atan2(dx, dz);
      groupRef.current.rotation.y = THREE.MathUtils.lerp(
        groupRef.current.rotation.y,
        angle,
        5 * delta
      );
    }

    // Set Y position
    let groundY = 0;
    if (currentRegion === 'mountain') {
      groundY = getTerrainHeight(posRef.current.x, posRef.current.z);
    }
    posRef.current.y = groundY;

    groupRef.current.position.copy(posRef.current);

    // Animations
    if (isMoving) {
      walkPhase.current += delta * 8;
      const legSwing = Math.sin(walkPhase.current) * 0.4;

      if (leftLegRef.current) leftLegRef.current.rotation.x = legSwing;
      if (rightLegRef.current) rightLegRef.current.rotation.x = -legSwing;
      if (leftArmRef.current) leftArmRef.current.rotation.x = -legSwing * 0.6;
      if (rightArmRef.current) rightArmRef.current.rotation.x = legSwing * 0.6;
    } else {
      // Idle: gentle bob and breathing
      const idleBob = Math.sin(t * 2 + character.id.charCodeAt(0)) * 0.02;

      if (leftLegRef.current) leftLegRef.current.rotation.x = THREE.MathUtils.lerp(leftLegRef.current.rotation.x, 0, 3 * delta);
      if (rightLegRef.current) rightLegRef.current.rotation.x = THREE.MathUtils.lerp(rightLegRef.current.rotation.x, 0, 3 * delta);
      if (leftArmRef.current) leftArmRef.current.rotation.x = THREE.MathUtils.lerp(leftArmRef.current.rotation.x, 0, 3 * delta);
      if (rightArmRef.current) rightArmRef.current.rotation.x = THREE.MathUtils.lerp(rightArmRef.current.rotation.x, 0, 3 * delta);

      if (headRef.current) {
        headRef.current.position.y = bodyH + 0.2 + idleBob;
      }
    }

    // Label always faces camera
    if (labelRef.current) {
      labelRef.current.lookAt(state.camera.position);
    }
  });

  return (
    <group ref={groupRef} position={character.homePosition}>
      {/* Body / Torso */}
      <mesh position={[0, bodyH * 0.5 + 0.55, 0]} castShadow>
        <boxGeometry args={[bodyW, bodyH, bodyD]} />
        <meshStandardMaterial color={visual.bodyColor} />
      </mesh>

      {/* Accent strip on torso */}
      <mesh position={[0, bodyH * 0.5 + 0.55, bodyD / 2 + 0.005]}>
        <planeGeometry args={[bodyW * 0.3, bodyH * 0.4]} />
        <meshBasicMaterial color={visual.accentColor} />
      </mesh>

      {/* Head */}
      <mesh ref={headRef} position={[0, bodyH + 0.2, 0]} castShadow>
        <boxGeometry args={[0.3 * s, 0.32 * s, 0.28 * s]} />
        <meshStandardMaterial color={visual.skinColor} />
      </mesh>

      {/* Eyes */}
      <mesh position={[-0.06, bodyH + 0.22, 0.14 * s + 0.005]}>
        <planeGeometry args={[0.04, 0.03]} />
        <meshBasicMaterial color="#fff" />
      </mesh>
      <mesh position={[0.06, bodyH + 0.22, 0.14 * s + 0.005]}>
        <planeGeometry args={[0.04, 0.03]} />
        <meshBasicMaterial color="#fff" />
      </mesh>

      {/* Left Leg */}
      <mesh ref={leftLegRef} position={[-0.1, 0.3, 0]} castShadow>
        <boxGeometry args={[0.14, 0.55, 0.16]} />
        <meshStandardMaterial color={visual.bodyColor} />
      </mesh>

      {/* Right Leg */}
      <mesh ref={rightLegRef} position={[0.1, 0.3, 0]} castShadow>
        <boxGeometry args={[0.14, 0.55, 0.16]} />
        <meshStandardMaterial color={visual.bodyColor} />
      </mesh>

      {/* Left Arm */}
      <mesh ref={leftArmRef} position={[-(bodyW / 2 + 0.08), bodyH * 0.4 + 0.55, 0]} castShadow>
        <boxGeometry args={[0.12, 0.65, 0.14]} />
        <meshStandardMaterial color={visual.skinColor} />
      </mesh>

      {/* Right Arm */}
      <mesh ref={rightArmRef} position={[(bodyW / 2 + 0.08), bodyH * 0.4 + 0.55, 0]} castShadow>
        <boxGeometry args={[0.12, 0.65, 0.14]} />
        <meshStandardMaterial color={visual.skinColor} />
      </mesh>

      {/* Accessory */}
      <CharacterAccessory type={visual.accessory} color={visual.accentColor} bodyH={bodyH} bodyW={bodyW} s={s} />

      {/* Name label */}
      <group ref={labelRef} position={[0, bodyH + 0.7, 0]}>
        <mesh>
          <planeGeometry args={[1.2, 0.2]} />
          <meshBasicMaterial color="#000" transparent opacity={0.7} />
        </mesh>
        {/* Accent line under name */}
        <mesh position={[0, -0.11, 0.001]}>
          <planeGeometry args={[0.8, 0.02]} />
          <meshBasicMaterial color={visual.accentColor} />
        </mesh>
      </group>

      {/* Relationship indicator */}
      {relationship > 0 && (
        <mesh position={[0, bodyH + 0.9, 0]} rotation={[0, 0, 0]}>
          <planeGeometry args={[0.6 * (relationship / 100), 0.03]} />
          <meshBasicMaterial color={relationship > 60 ? '#44ff44' : relationship > 30 ? '#FFD700' : '#ff4444'} transparent opacity={0.8} />
        </mesh>
      )}

      {/* Ground marker ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <ringGeometry args={[0.5, 0.7, 12]} />
        <meshBasicMaterial color={visual.accentColor} transparent opacity={0.15} />
      </mesh>
    </group>
  );
}

function CharacterAccessory({ type, color, bodyH, bodyW, s }: {
  type: string; color: string; bodyH: number; bodyW: number; s: number;
}) {
  switch (type) {
    case 'chain':
      return (
        <mesh position={[0, bodyH * 0.3 + 0.55, bodyW * 0.35]}>
          <boxGeometry args={[0.15, 0.15, 0.04]} />
          <meshStandardMaterial color={color} metalness={0.9} roughness={0.1} />
        </mesh>
      );
    case 'glasses':
      return (
        <group position={[0, bodyH + 0.22, 0.14 * s + 0.02]}>
          <mesh position={[-0.06, 0, 0]}>
            <boxGeometry args={[0.08, 0.04, 0.01]} />
            <meshStandardMaterial color={color} metalness={0.8} />
          </mesh>
          <mesh position={[0.06, 0, 0]}>
            <boxGeometry args={[0.08, 0.04, 0.01]} />
            <meshStandardMaterial color={color} metalness={0.8} />
          </mesh>
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[0.04, 0.01, 0.01]} />
            <meshStandardMaterial color={color} metalness={0.8} />
          </mesh>
        </group>
      );
    case 'mic':
      return (
        <mesh position={[bodyW / 2 + 0.15, bodyH * 0.4 + 0.7, 0.1]}>
          <cylinderGeometry args={[0.02, 0.02, 0.25, 6]} />
          <meshStandardMaterial color="#333" metalness={0.7} />
        </mesh>
      );
    case 'vest':
      return (
        <mesh position={[0, bodyH * 0.5 + 0.55, 0]}>
          <boxGeometry args={[bodyW + 0.08, bodyH * 0.7, bodyW * 0.35 + 0.06]} />
          <meshStandardMaterial color={color} transparent opacity={0.4} />
        </mesh>
      );
    case 'cap':
      return (
        <group position={[0, bodyH + 0.38, 0]}>
          <mesh>
            <boxGeometry args={[0.35, 0.06, 0.35]} />
            <meshStandardMaterial color={color} />
          </mesh>
          <mesh position={[0, -0.01, 0.2]}>
            <boxGeometry args={[0.3, 0.03, 0.12]} />
            <meshStandardMaterial color={color} />
          </mesh>
        </group>
      );
    case 'tie':
      return (
        <mesh position={[0, bodyH * 0.3 + 0.55, bodyW * 0.35 + 0.01]}>
          <boxGeometry args={[0.06, 0.4, 0.02]} />
          <meshStandardMaterial color={color} />
        </mesh>
      );
    default:
      return null;
  }
}
