/**
 * FaceCharacterModel.tsx
 * Billboard portrait model for characters with face textures (quando, lultimm, yb via YBCharacterModel).
 * Upgraded: sphere head, dreadlocks, torus gold chains, AirJordan sneakers, hoodie torso.
 */
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
  dreadsCount?: number;
  dreadsLength?: number;
  chainCount?: number;
  chainColor?: string;
  jordanColor?: string;
  jordanAccent?: string;
}

const SC = 1.15;

// ── Dreadlocks ────────────────────────────────────────────────────────────────
function Dreads({ headY, s, count = 10, maxLength = 0.40, color = '#100805' }: {
  headY: number; s: number; count?: number; maxLength?: number; color?: string;
}) {
  const dreads: JSX.Element[] = [];
  for (let i = 0; i < count; i++) {
    const t = i / count;
    // Fan around top/back of head — front top and sides hang forward, back ones hang down/back
    const azimuth = (t * Math.PI * 2) - Math.PI * 0.25; // offset so none are directly forward
    const polar   = Math.PI * 0.08 + t * Math.PI * 0.30; // 0 = straight up, PI/2 = horizontal
    const len     = maxLength * (0.7 + 0.5 * Math.sin(t * Math.PI * 3.3));
    const thick   = 0.025 * s;
    const rx      = Math.sin(azimuth) * Math.sin(polar);
    const ry      = -Math.cos(polar);
    const rz      = Math.cos(azimuth) * Math.sin(polar);
    // Dread origin on sphere surface
    const ox = Math.sin(azimuth) * Math.cos(polar) * 0.17 * s;
    const oy = headY + Math.sin(Math.PI * 0.5 - polar) * 0.17 * s;
    const oz = Math.cos(azimuth) * Math.cos(polar) * 0.17 * s;
    const angle = Math.atan2(rx, -ry);
    dreads.push(
      <mesh
        key={i}
        position={[ox, oy - len * 0.5, oz]}
        rotation={[
          Math.atan2(Math.sqrt(rx * rx + rz * rz), -ry) - Math.PI / 2,
          -Math.atan2(rx, rz),
          0,
        ]}
      >
        <cylinderGeometry args={[thick * 0.55, thick, len, 5]} />
        <meshStandardMaterial color={color} roughness={0.88} />
      </mesh>
    );
  }
  return <>{dreads}</>;
}

// ── Gold Chain (torus links in a ring) ────────────────────────────────────────
function GoldChain({ y, s, chainColor = '#FFD700', chainRadius = 0.14 }: {
  y: number; s: number; chainColor?: string; chainRadius?: number;
}) {
  const links = 10;
  return (
    <>
      {Array.from({ length: links }, (_, i) => {
        const angle = (i / links) * Math.PI * 2;
        return (
          <mesh
            key={i}
            position={[Math.sin(angle) * chainRadius * s, y, Math.cos(angle) * chainRadius * s]}
            rotation={[Math.PI / 2, 0, angle]}
          >
            <torusGeometry args={[0.018 * s, 0.006 * s, 4, 8]} />
            <meshStandardMaterial
              color={chainColor}
              metalness={0.92}
              roughness={0.08}
              emissive={chainColor}
              emissiveIntensity={0.25}
            />
          </mesh>
        );
      })}
    </>
  );
}

// ── Air Jordan Sneaker ────────────────────────────────────────────────────────
function AirJordan({ offsetX, s, shoeColor = '#f0f0f0', accentColor = '#cc2200' }: {
  offsetX: number; s: number; shoeColor?: string; accentColor?: string;
}) {
  return (
    <group position={[offsetX, 0, 0]}>
      {/* Sole */}
      <mesh position={[0, 0.035 * s, 0.01 * s]}>
        <boxGeometry args={[0.19 * s, 0.07 * s, 0.30 * s]} />
        <meshStandardMaterial color="#111111" roughness={0.7} />
      </mesh>
      {/* Upper body */}
      <mesh position={[0, 0.145 * s, 0]}>
        <boxGeometry args={[0.17 * s, 0.15 * s, 0.26 * s]} />
        <meshStandardMaterial color={shoeColor} roughness={0.55} metalness={0.1} />
      </mesh>
      {/* Toe cap */}
      <mesh position={[0, 0.13 * s, 0.115 * s]}>
        <boxGeometry args={[0.16 * s, 0.10 * s, 0.07 * s]} />
        <meshStandardMaterial color={shoeColor} roughness={0.45} />
      </mesh>
      {/* Tongue */}
      <mesh position={[0, 0.215 * s, 0.065 * s]}>
        <boxGeometry args={[0.11 * s, 0.11 * s, 0.06 * s]} />
        <meshStandardMaterial color="#eeeeee" roughness={0.6} />
      </mesh>
      {/* Accent lace panel */}
      <mesh position={[0, 0.195 * s, 0.09 * s]}>
        <boxGeometry args={[0.12 * s, 0.02 * s, 0.12 * s]} />
        <meshStandardMaterial color={accentColor} roughness={0.5} />
      </mesh>
      {/* Swoosh hint — side accent stripe */}
      <mesh position={[0.086 * s, 0.12 * s, 0]}>
        <boxGeometry args={[0.005 * s, 0.07 * s, 0.18 * s]} />
        <meshStandardMaterial color={accentColor} roughness={0.4} metalness={0.2} />
      </mesh>
    </group>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export const FaceCharacterModel = memo(function FaceCharacterModel({
  character,
  isFollowing,
  relationship,
  currentRegion,
  texturePath,
  dreadsCount = 10,
  dreadsLength = 0.38,
  chainCount = 1,
  chainColor = '#FFD700',
  jordanColor = '#f0f0f0',
  jordanAccent,
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
  const s = visual.heightScale * SC;
  const buildType = visual.buildType;
  const accent = jordanAccent ?? visual.accentColor;

  // Body dimensions
  const bodyW = (buildType === 'stocky' ? 0.55 : buildType === 'lean' ? 0.40 : 0.46) * s;
  const bodyH = 0.88 * s;
  const bodyD = 0.28 * s;
  const legH  = 0.70 * s;

  // Portrait panel dimensions
  const portW = 0.64 * s;
  const portH = 0.82 * s;

  // Vertical layout
  const torsoY = legH + bodyH * 0.5;
  const neckY  = legH + bodyH + 0.10 * s;
  const headY  = legH + bodyH + 0.22 * s;

  const charCode0 = character.id.charCodeAt(0);
  const charCode1 = character.id.charCodeAt(1) || 0;

  const faceTexture = useLoader(THREE.TextureLoader, texturePath);
  useEffect(() => {
    if (faceTexture) {
      faceTexture.colorSpace = THREE.SRGBColorSpace;
      faceTexture.needsUpdate = true;
    }
  }, [faceTexture]);

  useFrame((state, delta) => {
    if (!groupRef.current) return;

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

    if (headRef.current) headRef.current.lookAt(state.camera.position);

    if (glowRef.current) {
      const pulse = 0.18 + Math.sin(t * 2.4 + charCode0) * 0.09;
      (glowRef.current.material as THREE.MeshBasicMaterial).opacity = pulse;
    }

    if (labelRef.current) labelRef.current.lookAt(state.camera.position);
  });

  // Chain Y offsets based on count
  const chainOffsets = chainCount === 3
    ? [-0.05 * s, -0.14 * s, -0.22 * s]
    : chainCount === 2
    ? [-0.07 * s, -0.18 * s]
    : [-0.10 * s];

  return (
    <group ref={groupRef} position={character.homePosition}>

      {/* ── Jordan Sneakers ── */}
      <AirJordan offsetX={-0.14 * s} s={s} shoeColor={jordanColor} accentColor={accent} />
      <AirJordan offsetX={ 0.14 * s} s={s} shoeColor={jordanColor} accentColor={accent} />

      {/* ── Legs ── */}
      <mesh ref={leftLegRef}  position={[-0.13 * s, legH / 2 + 0.22 * s, 0]}>
        <boxGeometry args={[0.17 * s, legH, 0.20 * s]} />
        <meshStandardMaterial color={visual.bodyColor} roughness={0.6} />
      </mesh>
      <mesh ref={rightLegRef} position={[ 0.13 * s, legH / 2 + 0.22 * s, 0]}>
        <boxGeometry args={[0.17 * s, legH, 0.20 * s]} />
        <meshStandardMaterial color={visual.bodyColor} roughness={0.6} />
      </mesh>

      {/* ── Hoodie Torso ── */}
      <mesh position={[0, torsoY + 0.22 * s, 0]}>
        <boxGeometry args={[bodyW, bodyH, bodyD]} />
        <meshStandardMaterial color={visual.bodyColor} roughness={0.65} />
      </mesh>
      {/* Kangaroo pocket */}
      <mesh position={[0, torsoY - bodyH * 0.22 + 0.22 * s, bodyD * 0.51]}>
        <boxGeometry args={[bodyW * 0.55, bodyH * 0.22, 0.02 * s]} />
        <meshStandardMaterial color={new THREE.Color(visual.bodyColor).multiplyScalar(0.72).getStyle()} roughness={0.7} />
      </mesh>
      {/* Hood lump on back */}
      <mesh position={[0, torsoY + bodyH * 0.45 + 0.22 * s, -bodyD * 0.52]}>
        <sphereGeometry args={[0.15 * s, 8, 6]} />
        <meshStandardMaterial color={visual.bodyColor} roughness={0.65} />
      </mesh>
      {/* Sleeve accent cuffs */}
      <mesh position={[-(bodyW / 2 + 0.11 * s), torsoY + 0.22 * s - 0.32 * s, 0]}>
        <boxGeometry args={[0.17 * s, 0.08 * s, 0.19 * s]} />
        <meshStandardMaterial color={accent} roughness={0.5} />
      </mesh>
      <mesh position={[ bodyW / 2 + 0.11 * s, torsoY + 0.22 * s - 0.32 * s, 0]}>
        <boxGeometry args={[0.17 * s, 0.08 * s, 0.19 * s]} />
        <meshStandardMaterial color={accent} roughness={0.5} />
      </mesh>

      {/* ── Arms ── */}
      <mesh ref={leftArmRef}  position={[-(bodyW / 2 + 0.11 * s), torsoY - bodyH * 0.06 + 0.22 * s, 0]}>
        <boxGeometry args={[0.15 * s, 0.76 * s, 0.17 * s]} />
        <meshStandardMaterial color={visual.bodyColor} roughness={0.7} />
      </mesh>
      <mesh ref={rightArmRef} position={[ bodyW / 2 + 0.11 * s, torsoY - bodyH * 0.06 + 0.22 * s, 0]}>
        <boxGeometry args={[0.15 * s, 0.76 * s, 0.17 * s]} />
        <meshStandardMaterial color={visual.bodyColor} roughness={0.7} />
      </mesh>
      {/* Skin forearms */}
      <mesh position={[-(bodyW / 2 + 0.11 * s), torsoY - bodyH * 0.06 + 0.22 * s - 0.26 * s, 0]}>
        <boxGeometry args={[0.14 * s, 0.28 * s, 0.16 * s]} />
        <meshStandardMaterial color={visual.skinColor} roughness={0.75} />
      </mesh>
      <mesh position={[ bodyW / 2 + 0.11 * s, torsoY - bodyH * 0.06 + 0.22 * s - 0.26 * s, 0]}>
        <boxGeometry args={[0.14 * s, 0.28 * s, 0.16 * s]} />
        <meshStandardMaterial color={visual.skinColor} roughness={0.75} />
      </mesh>

      {/* ── Gold Chains ── */}
      {chainCount > 0 && chainOffsets.map((yo, i) => (
        <GoldChain
          key={i}
          y={torsoY + 0.22 * s + yo}
          s={s}
          chainColor={chainColor}
          chainRadius={0.13 + i * 0.015}
        />
      ))}

      {/* ── Neck ── */}
      <mesh position={[0, neckY + 0.22 * s, 0]}>
        <cylinderGeometry args={[0.095 * s, 0.105 * s, 0.22 * s, 8]} />
        <meshStandardMaterial color={visual.skinColor} roughness={0.78} />
      </mesh>

      {/* ══════════════════════════════════════════════════════════════
          HEAD — Sphere base + large portrait billboard faces camera
          ══════════════════════════════════════════════════════════════ */}
      <group ref={headRef} position={[0, headY + 0.22 * s + portH * 0.5, 0]}>

        {/* Dreads hang behind/above the portrait */}
        {dreadsCount > 0 && (
          <Dreads
            headY={0}
            s={s}
            count={dreadsCount}
            maxLength={dreadsLength}
          />
        )}

        {/* Outer glow halo */}
        <mesh ref={glowRef} position={[0, 0, -0.08 * s]}>
          <planeGeometry args={[portW + 0.20 * s, portH + 0.20 * s]} />
          <meshBasicMaterial color={visual.accentColor} transparent opacity={0.20} />
        </mesh>

        {/* Dark backing */}
        <mesh position={[0, 0, -0.03 * s]}>
          <boxGeometry args={[portW + 0.06 * s, portH + 0.06 * s, 0.06 * s]} />
          <meshStandardMaterial color="#040404" roughness={0.95} />
        </mesh>

        {/* Portrait face */}
        <mesh position={[0, 0, 0.04 * s]}>
          <planeGeometry args={[portW, portH]} />
          <meshBasicMaterial map={faceTexture} toneMapped={false} />
        </mesh>

        {/* Gold/colored Polaroid-style frame border — top, bottom, left, right strips */}
        {/* Top */}
        <mesh position={[0, portH * 0.5 + 0.025 * s, 0.05 * s]}>
          <boxGeometry args={[portW + 0.05 * s, 0.04 * s, 0.01 * s]} />
          <meshStandardMaterial color={accent} metalness={0.85} roughness={0.15} />
        </mesh>
        {/* Bottom */}
        <mesh position={[0, -(portH * 0.5 + 0.025 * s), 0.05 * s]}>
          <boxGeometry args={[portW + 0.05 * s, 0.04 * s, 0.01 * s]} />
          <meshStandardMaterial color={accent} metalness={0.85} roughness={0.15} />
        </mesh>
        {/* Left */}
        <mesh position={[-(portW * 0.5 + 0.025 * s), 0, 0.05 * s]}>
          <boxGeometry args={[0.04 * s, portH, 0.01 * s]} />
          <meshStandardMaterial color={accent} metalness={0.85} roughness={0.15} />
        </mesh>
        {/* Right */}
        <mesh position={[portW * 0.5 + 0.025 * s, 0, 0.05 * s]}>
          <boxGeometry args={[0.04 * s, portH, 0.01 * s]} />
          <meshStandardMaterial color={accent} metalness={0.85} roughness={0.15} />
        </mesh>

      </group>

      {/* ── Ground glow ring ── */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <ringGeometry args={[0.52 * s, 0.80 * s, 20]} />
        <meshBasicMaterial color={visual.accentColor} transparent opacity={0.28} />
      </mesh>

      {/* ── Name label ── */}
      <group ref={labelRef} position={[0, headY + 0.22 * s + portH + 0.32 * s, 0]}>
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
