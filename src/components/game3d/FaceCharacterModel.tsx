import { useRef, memo, useEffect } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import * as THREE from 'three';
import { Text } from '@react-three/drei';
import { CharacterDef } from '@/data/characters';
import { playerState } from '@/stores/playerStore';
import { getTerrainHeight } from '@/utils/terrain';

interface FaceCharacterModelProps {
  character: CharacterDef;
  isFollowing: boolean;
  relationship: number;
  currentRegion: 'city' | 'mountain' | 'bayou';
  texturePath: string;
  label?: string;
}

// 15% bigger than the old blocky model for more in-world presence
const SC = 1.15;

export const FaceCharacterModel = memo(function FaceCharacterModel({
  character,
  isFollowing,
  relationship,
  currentRegion,
  texturePath,
}: FaceCharacterModelProps) {
  const groupRef    = useRef<THREE.Group>(null);
  const leftLegRef  = useRef<THREE.Mesh>(null);
  const rightLegRef = useRef<THREE.Mesh>(null);
  const leftArmRef  = useRef<THREE.Mesh>(null);
  const rightArmRef = useRef<THREE.Mesh>(null);
  const headRef     = useRef<THREE.Group>(null);
  const glowRef     = useRef<THREE.Mesh>(null);
  const labelRef    = useRef<THREE.Group>(null);

  const posRef    = useRef(new THREE.Vector3(...character.homePosition));
  const walkPhase = useRef(0);

  const { visual } = character;
  const s = visual.heightScale;
  const buildType = visual.buildType;

  // Body dimensions
  const bodyW = (buildType === 'stocky' ? 0.55 : buildType === 'lean' ? 0.40 : 0.46) * SC;
  const bodyH = 0.9 * s * SC;
  const bodyD = 0.3 * SC;
  const legH  = 0.72 * SC;

  // Portrait panel dimensions — large & prominent so the PNG is clearly visible
  const portW = 0.64 * s * SC;
  const portH = 0.82 * s * SC;

  // Vertical layout
  const torsoY = legH + bodyH * 0.5;
  const neckY  = legH + bodyH + 0.10 * SC;
  const headY  = legH + bodyH + 0.20 * SC + portH * 0.5;

  const charCode0 = character.id.charCodeAt(0);
  const charCode1 = character.id.charCodeAt(1) || 0;

  // useLoader suspends until the texture is ready — fully loaded on first render
  const faceTexture = useLoader(THREE.TextureLoader, texturePath);
  useEffect(() => {
    if (faceTexture) {
      faceTexture.colorSpace = THREE.SRGBColorSpace;
      faceTexture.needsUpdate = true;
    }
  }, [faceTexture]);

  useFrame((state, delta) => {
    if (!groupRef.current) return;

    // Distance culling
    const pdx = groupRef.current.position.x - state.camera.position.x;
    const pdz = groupRef.current.position.z - state.camera.position.z;
    if (pdx * pdx + pdz * pdz > 2500) { groupRef.current.visible = false; return; }
    groupRef.current.visible = true;

    const t = state.clock.elapsedTime;
    let targetX: number, targetZ: number;
    let isMoving = false;

    if (isFollowing) {
      targetX = playerState.x + Math.sin(playerState.yaw + Math.PI) * 3;
      targetZ = playerState.z + Math.cos(playerState.yaw + Math.PI) * 3;
    } else {
      targetX = character.homePosition[0] + Math.sin(t * 0.22 + charCode0) * 2.2;
      targetZ = character.homePosition[2] + Math.cos(t * 0.17 + charCode1) * 2.2;
      if (currentRegion !== 'city') { groupRef.current.visible = false; return; }
    }

    const dx = targetX - posRef.current.x;
    const dz = targetZ - posRef.current.z;
    const dist = Math.sqrt(dx * dx + dz * dz);

    if (dist > 0.3) {
      const spd  = isFollowing ? 8 : 1.5;
      const move = Math.min(spd * delta, dist);
      posRef.current.x += (dx / dist) * move;
      posRef.current.z += (dz / dist) * move;
      isMoving = true;
      groupRef.current.rotation.y = THREE.MathUtils.lerp(
        groupRef.current.rotation.y,
        Math.atan2(dx, dz),
        5 * delta,
      );
    }

    posRef.current.y = currentRegion === 'mountain'
      ? getTerrainHeight(posRef.current.x, posRef.current.z)
      : 0;
    groupRef.current.position.copy(posRef.current);

    // Walk animation
    if (isMoving) {
      walkPhase.current += delta * 8;
      const swing = Math.sin(walkPhase.current) * 0.42;
      if (leftLegRef.current)  leftLegRef.current.rotation.x  =  swing;
      if (rightLegRef.current) rightLegRef.current.rotation.x = -swing;
      if (leftArmRef.current)  leftArmRef.current.rotation.x  = -swing * 0.6;
      if (rightArmRef.current) rightArmRef.current.rotation.x =  swing * 0.6;
    } else {
      [leftLegRef, rightLegRef, leftArmRef, rightArmRef].forEach(r => {
        if (r.current) r.current.rotation.x = THREE.MathUtils.lerp(r.current.rotation.x, 0, 3 * delta);
      });
    }

    // Portrait billboard — always rotates to face the camera so the PNG is always visible
    if (headRef.current) headRef.current.lookAt(state.camera.position);

    // Glow halo pulse
    if (glowRef.current) {
      const pulse = 0.20 + Math.sin(t * 2.4 + charCode0) * 0.10;
      (glowRef.current.material as THREE.MeshBasicMaterial).opacity = pulse;
    }

    if (labelRef.current) labelRef.current.lookAt(state.camera.position);
  });

  return (
    <group ref={groupRef} position={character.homePosition}>

      {/* ── Legs ── */}
      <mesh ref={leftLegRef}  position={[-0.13 * SC, legH / 2, 0]} castShadow>
        <boxGeometry args={[0.17 * SC, legH, 0.20 * SC]} />
        <meshStandardMaterial color={visual.bodyColor} roughness={0.6} metalness={0.35} />
      </mesh>
      <mesh ref={rightLegRef} position={[ 0.13 * SC, legH / 2, 0]} castShadow>
        <boxGeometry args={[0.17 * SC, legH, 0.20 * SC]} />
        <meshStandardMaterial color={visual.bodyColor} roughness={0.6} metalness={0.35} />
      </mesh>

      {/* ── Boots ── */}
      <mesh position={[-0.13 * SC, 0.07 * SC, 0.03 * SC]} castShadow>
        <boxGeometry args={[0.22 * SC, 0.14 * SC, 0.28 * SC]} />
        <meshStandardMaterial color="#080808" metalness={0.7} roughness={0.3} />
      </mesh>
      <mesh position={[ 0.13 * SC, 0.07 * SC, 0.03 * SC]} castShadow>
        <boxGeometry args={[0.22 * SC, 0.14 * SC, 0.28 * SC]} />
        <meshStandardMaterial color="#080808" metalness={0.7} roughness={0.3} />
      </mesh>

      {/* ── Torso ── */}
      <mesh position={[0, torsoY, 0]} castShadow>
        <boxGeometry args={[bodyW, bodyH, bodyD]} />
        <meshStandardMaterial color={visual.bodyColor} roughness={0.5} metalness={0.4} />
      </mesh>

      {/* Chest accent panel */}
      <mesh position={[0, torsoY + bodyH * 0.08, bodyD / 2 + 0.012]}>
        <planeGeometry args={[bodyW * 0.58, bodyH * 0.42]} />
        <meshBasicMaterial color={visual.accentColor} transparent opacity={0.72} />
      </mesh>

      {/* Chain / medallion — emissive glow */}
      <mesh position={[0, torsoY - bodyH * 0.18, bodyW * 0.40]}>
        <boxGeometry args={[0.19 * SC, 0.19 * SC, 0.05 * SC]} />
        <meshStandardMaterial
          color={visual.accentColor}
          metalness={0.95} roughness={0.06}
          emissive={visual.accentColor} emissiveIntensity={0.5}
        />
      </mesh>

      {/* ── Arms ── */}
      <mesh ref={leftArmRef}  position={[-(bodyW / 2 + 0.11 * SC), torsoY - bodyH * 0.06, 0]} castShadow>
        <boxGeometry args={[0.15 * SC, 0.76 * SC, 0.17 * SC]} />
        <meshStandardMaterial color={visual.skinColor} roughness={0.72} />
      </mesh>
      <mesh ref={rightArmRef} position={[ bodyW / 2 + 0.11 * SC, torsoY - bodyH * 0.06, 0]} castShadow>
        <boxGeometry args={[0.15 * SC, 0.76 * SC, 0.17 * SC]} />
        <meshStandardMaterial color={visual.skinColor} roughness={0.72} />
      </mesh>

      {/* ── Neck ── */}
      <mesh position={[0, neckY, 0]}>
        <boxGeometry args={[0.16 * SC, 0.20 * SC, 0.16 * SC]} />
        <meshStandardMaterial color={visual.skinColor} roughness={0.8} />
      </mesh>

      {/* ══════════════════════════════════════════════════════════════
          HEAD — Large billboard portrait panel
          Calls lookAt(camera) every frame so the PNG face is ALWAYS
          visible no matter which angle you approach from.
          ══════════════════════════════════════════════════════════════ */}
      <group ref={headRef} position={[0, headY, 0]}>

        {/* Outer glow halo — pulses with character accent color */}
        <mesh ref={glowRef} position={[0, 0, -0.06]}>
          <planeGeometry args={[portW + 0.22, portH + 0.22]} />
          <meshBasicMaterial color={visual.accentColor} transparent opacity={0.22} />
        </mesh>

        {/* Dark backing gives depth behind portrait */}
        <mesh position={[0, 0, -0.025]}>
          <boxGeometry args={[portW + 0.07, portH + 0.07, 0.07]} />
          <meshStandardMaterial color="#030303" roughness={0.95} metalness={0.1} />
        </mesh>

        {/* ★ Main portrait — PNG face fills this plane ★ */}
        <mesh position={[0, 0, 0.04]}>
          <planeGeometry args={[portW, portH]} />
          <meshBasicMaterial map={faceTexture} toneMapped={false} />
        </mesh>

        {/* Cyber corner bracket accents */}
        {([[-1, 1], [1, 1], [-1, -1], [1, -1]] as [number, number][]).map(([sx, sy], i) => {
          const cx = sx * (portW / 2 - 0.030);
          const cy = sy * (portH / 2 - 0.030);
          return (
            <group key={i} position={[cx, cy, 0.055]}>
              <mesh position={[sx * 0.030, 0, 0]}>
                <planeGeometry args={[0.065, 0.012]} />
                <meshBasicMaterial color={visual.accentColor} />
              </mesh>
              <mesh position={[0, sy * 0.030, 0]}>
                <planeGeometry args={[0.012, 0.065]} />
                <meshBasicMaterial color={visual.accentColor} />
              </mesh>
            </group>
          );
        })}

      </group>

      {/* ── Ground glow ring ── */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <ringGeometry args={[0.52, 0.82, 20]} />
        <meshBasicMaterial color={visual.accentColor} transparent opacity={0.32} />
      </mesh>

      {/* ── Name label (billboards) ── */}
      <group ref={labelRef} position={[0, headY + portH * 0.56 + 0.34, 0]}>
        <Text
          fontSize={0.24}
          color={visual.accentColor}
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.028}
          outlineColor="#000000"
        >
          {character.name}
        </Text>
        <Text
          position={[0, -0.30, 0]}
          fontSize={0.14}
          color="#bbbbbb"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.016}
          outlineColor="#000000"
        >
          {character.title}
        </Text>
        {relationship > 0 && (
          <>
            <mesh position={[0, -0.50, 0]}>
              <planeGeometry args={[0.85, 0.05]} />
              <meshBasicMaterial color="#111" transparent opacity={0.7} />
            </mesh>
            <mesh position={[(-0.425 + 0.425 * (relationship / 100)), -0.50, 0.001]}>
              <planeGeometry args={[0.85 * (relationship / 100), 0.05]} />
              <meshBasicMaterial color={relationship > 60 ? '#44ff44' : relationship > 30 ? '#FFD700' : '#ff4444'} />
            </mesh>
          </>
        )}
      </group>

    </group>
  );
});
