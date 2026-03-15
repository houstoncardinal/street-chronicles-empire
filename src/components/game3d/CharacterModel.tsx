import { useRef, memo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { Text } from '@react-three/drei';
import { CharacterDef } from '@/data/characters';
import { playerState } from '@/stores/playerStore';
import { getTerrainHeight } from '@/utils/terrain';
import { YBCharacterModel } from './YBCharacterModel';
import { FaceCharacterModel } from './FaceCharacterModel';
import { enemyStore, hitEnemy } from '@/stores/enemyStore';

interface CharacterModelProps {
  character: CharacterDef;
  isFollowing: boolean;
  relationship: number;
  currentRegion: 'city' | 'mountain' | 'bayou';
}

export const CharacterModel = memo(function CharacterModel({ character, isFollowing, relationship, currentRegion }: CharacterModelProps) {
  // Route face-texture characters to dedicated models
  if (character.id === 'yb') {
    return <YBCharacterModel character={character} isFollowing={isFollowing} relationship={relationship} currentRegion={currentRegion} />;
  }
  if (character.id === 'quando') {
    return <FaceCharacterModel character={character} isFollowing={isFollowing} relationship={relationship} currentRegion={currentRegion} texturePath="/quando.png" label="QR" />;
  }
  if (character.id === 'lultimm') {
    return <FaceCharacterModel character={character} isFollowing={isFollowing} relationship={relationship} currentRegion={currentRegion} texturePath="/lultimm.png" label="UZI" />;
  }

  const groupRef = useRef<THREE.Group>(null);
  const leftLegRef = useRef<THREE.Mesh>(null);
  const rightLegRef = useRef<THREE.Mesh>(null);
  const leftArmRef = useRef<THREE.Mesh>(null);
  const rightArmRef = useRef<THREE.Mesh>(null);
  const headRef = useRef<THREE.Mesh>(null);
  const labelRef = useRef<THREE.Group>(null);

  const posRef = useRef(new THREE.Vector3(...character.homePosition));
  const walkPhase = useRef(0);
  const allyShootCooldown = useRef(1.5 + Math.random() * 2); // stagger allies
  const allyMuzzleTimer   = useRef(0);
  const allyMuzzleRef     = useRef<THREE.Mesh>(null);
  const { camera } = useThree();

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

    // ── Ally combat — find and damage the nearest visible enemy ──────────
    allyShootCooldown.current = Math.max(0, allyShootCooldown.current - delta);
    allyMuzzleTimer.current   = Math.max(0, allyMuzzleTimer.current - delta);

    if (allyShootCooldown.current <= 0) {
      let nearestId: string | null = null;
      let nearestDist = 20; // only engage within 20 units
      enemyStore.forEach((record, eid) => {
        if (!record.alive) return;
        const dx = record.x - posRef.current.x;
        const dz = record.z - posRef.current.z;
        const d  = Math.sqrt(dx * dx + dz * dz);
        if (d < nearestDist) { nearestDist = d; nearestId = eid; }
      });
      if (nearestId) {
        hitEnemy(nearestId, 20);         // allies deal 20 dmg per shot
        allyShootCooldown.current = 0.55 + Math.random() * 0.8;
        allyMuzzleTimer.current   = 0.07;
        // Face the target
        const t = enemyStore.get(nearestId)!;
        groupRef.current.rotation.y = THREE.MathUtils.lerp(
          groupRef.current.rotation.y,
          Math.atan2(t.x - posRef.current.x, t.z - posRef.current.z),
          1,
        );
      } else {
        allyShootCooldown.current = 0.4; // re-check soon
      }
    }
    if (allyMuzzleRef.current) allyMuzzleRef.current.visible = allyMuzzleTimer.current > 0;

    // Label always faces camera
    if (labelRef.current) {
      labelRef.current.lookAt(state.camera.position);
    }
  });

  return (
    <group ref={groupRef} position={character.homePosition}>
      {/* Legs */}
      <mesh ref={leftLegRef} position={[-0.11, 0.36, 0]} castShadow>
        <boxGeometry args={[0.15, 0.68, 0.18]} />
        <meshStandardMaterial color={visual.bodyColor} roughness={0.65} metalness={0.2} />
      </mesh>
      <mesh ref={rightLegRef} position={[0.11, 0.36, 0]} castShadow>
        <boxGeometry args={[0.15, 0.68, 0.18]} />
        <meshStandardMaterial color={visual.bodyColor} roughness={0.65} metalness={0.2} />
      </mesh>

      {/* Boots */}
      <mesh position={[-0.11, 0.05, 0.02]} castShadow>
        <boxGeometry args={[0.18, 0.1, 0.22]} />
        <meshStandardMaterial color="#111" metalness={0.6} roughness={0.4} />
      </mesh>
      <mesh position={[0.11, 0.05, 0.02]} castShadow>
        <boxGeometry args={[0.18, 0.1, 0.22]} />
        <meshStandardMaterial color="#111" metalness={0.6} roughness={0.4} />
      </mesh>

      {/* Torso */}
      <mesh position={[0, bodyH * 0.5 + 0.55, 0]} castShadow>
        <boxGeometry args={[bodyW, bodyH, bodyD]} />
        <meshStandardMaterial color={visual.bodyColor} roughness={0.55} metalness={0.35} />
      </mesh>

      {/* Cyber chest panel */}
      <mesh position={[0, bodyH * 0.55 + 0.55, bodyD / 2 + 0.007]}>
        <planeGeometry args={[bodyW * 0.5, bodyH * 0.35]} />
        <meshBasicMaterial color={visual.accentColor} transparent opacity={0.85} />
      </mesh>

      {/* Arms */}
      <mesh ref={leftArmRef} position={[-(bodyW / 2 + 0.09), bodyH * 0.42 + 0.55, 0]} castShadow>
        <boxGeometry args={[0.13, 0.7, 0.15]} />
        <meshStandardMaterial color={visual.skinColor} roughness={0.75} />
      </mesh>
      <mesh ref={rightArmRef} position={[bodyW / 2 + 0.09, bodyH * 0.42 + 0.55, 0]} castShadow>
        <boxGeometry args={[0.13, 0.7, 0.15]} />
        <meshStandardMaterial color={visual.skinColor} roughness={0.75} />
      </mesh>

      {/* Neck */}
      <mesh position={[0, bodyH + 0.12, 0]} castShadow>
        <boxGeometry args={[0.14, 0.2, 0.14]} />
        <meshStandardMaterial color={visual.skinColor} roughness={0.8} />
      </mesh>

      {/* Head */}
      <mesh ref={headRef} position={[0, bodyH + 0.2, 0]} castShadow>
        <boxGeometry args={[0.32 * s, 0.34 * s, 0.3 * s]} />
        <meshStandardMaterial color={visual.skinColor} roughness={0.75} />
      </mesh>

      {/* Cyber eyes */}
      <mesh position={[-0.07, bodyH + 0.22, 0.15 * s + 0.005]}>
        <planeGeometry args={[0.05, 0.03]} />
        <meshBasicMaterial color={visual.accentColor} transparent opacity={0.95} />
      </mesh>
      <mesh position={[0.07, bodyH + 0.22, 0.15 * s + 0.005]}>
        <planeGeometry args={[0.05, 0.03]} />
        <meshBasicMaterial color={visual.accentColor} transparent opacity={0.95} />
      </mesh>

      {/* Ally weapon + muzzle flash */}
      <mesh position={[bodyW / 2 + 0.11, bodyH * 0.30 + 0.55, 0.22]} rotation={[0, 0, 0.1]}>
        <boxGeometry args={[0.055, 0.12, 0.30]} />
        <meshStandardMaterial color="#1a1a1a" metalness={0.85} roughness={0.25} />
      </mesh>
      <mesh ref={allyMuzzleRef} position={[bodyW / 2 + 0.13, bodyH * 0.30 + 0.55, 0.40]} visible={false}>
        <sphereGeometry args={[0.08, 5, 4]} />
        <meshBasicMaterial color={visual.accentColor} />
      </mesh>

      {/* Accessory */}
      <CharacterAccessory type={visual.accessory} color={visual.accentColor} bodyH={bodyH} bodyW={bodyW} s={s} />

      {/* Name label (Text) */}
      <group ref={labelRef} position={[0, bodyH + 0.78, 0]}>
        <Text
          fontSize={0.2}
          color={visual.accentColor}
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.025}
          outlineColor="#000000"
        >
          {character.name}
        </Text>
        <Text
          position={[0, -0.26, 0]}
          fontSize={0.13}
          color="#aaaaaa"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.015}
          outlineColor="#000000"
        >
          {character.title}
        </Text>
        {/* Relationship bar */}
        {relationship > 0 && (
          <mesh position={[0, -0.46, 0]}>
            <planeGeometry args={[0.7, 0.04]} />
            <meshBasicMaterial color="#111" transparent opacity={0.7} />
          </mesh>
        )}
        {relationship > 0 && (
          <mesh position={[(-0.35 + 0.35 * (relationship / 100)), -0.46, 0.001]}>
            <planeGeometry args={[0.7 * (relationship / 100), 0.04]} />
            <meshBasicMaterial color={relationship > 60 ? '#44ff44' : relationship > 30 ? '#FFD700' : '#ff4444'} />
          </mesh>
        )}
      </group>

      {/* Ground marker ring — emissive glow */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <ringGeometry args={[0.52, 0.72, 14]} />
        <meshBasicMaterial color={visual.accentColor} transparent opacity={0.18} />
      </mesh>
    </group>
  );
});

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
