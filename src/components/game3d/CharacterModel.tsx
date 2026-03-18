/**
 * CharacterModel.tsx — Artist-accurate character models
 * Sphere heads, dreadlocks, torus gold chains, Jordan sneakers, hoodie bodies.
 */
import { useRef, memo } from 'react';
import { useFrame } from '@react-three/fiber';
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

// ── Per-character dread config ────────────────────────────────────────────
const DREAD_CONFIG: Record<string, { count: number; maxLength: number } | null> = {
  yb:      { count: 14, maxLength: 0.60 },
  quando:  { count: 10, maxLength: 0.38 },
  deebaby: { count: 10, maxLength: 0.33 },
  lultimm: { count: 8,  maxLength: 0.26 },
  rondo:   { count: 9,  maxLength: 0.32 },
  timm:    null,
  herm:    null,
  porter:  null,
  ben:     null,
};

// ── Per-character chain config ────────────────────────────────────────────
const CHAIN_CONFIG: Record<string, { count: number; color: string }> = {
  yb:      { count: 3, color: '#FFD700' },
  quando:  { count: 1, color: '#cc3344' },
  deebaby: { count: 2, color: '#ff7700' },
  lultimm: { count: 1, color: '#00f0d0' },
  rondo:   { count: 1, color: '#ff4488' },
  timm:    { count: 0, color: '#FFD700' },
  herm:    { count: 0, color: '#44ff44' },
  porter:  { count: 1, color: '#FFD700' },
  ben:     { count: 0, color: '#4488ff' },
};

// ── Dreadlocks ────────────────────────────────────────────────────────────
function Dreads({ headY, s, count = 12, maxLength = 0.45 }: {
  headY: number; s: number; count?: number; maxLength?: number;
}) {
  const dreads = Array.from({ length: count }, (_, i) => {
    const angle = (i / count) * Math.PI * 2;
    const r = 0.11 * s * (0.85 + (i % 3) * 0.08);
    const x = Math.sin(angle) * r;
    const z = Math.cos(angle) * r;
    // Back dreads are longer (z negative = back of head for default forward facing)
    const isBack = Math.cos(angle) < -0.2;
    const len = maxLength * s * (isBack ? 1.0 : 0.52 + Math.abs(Math.sin(angle)) * 0.2);
    const tiltX = Math.sin(angle) * 0.14;
    const tiltZ = Math.cos(angle) * 0.14;
    return { x, z, len, tiltX, tiltZ };
  });

  return (
    <group position={[0, headY + 0.10 * s, 0]}>
      {dreads.map(({ x, z, len, tiltX, tiltZ }, i) => (
        <mesh key={i} position={[x, -len / 2, z]} rotation={[tiltZ, 0, -tiltX]}>
          <cylinderGeometry args={[0.019 * s, 0.012 * s, len, 5]} />
          <meshStandardMaterial color="#130907" roughness={0.88} />
        </mesh>
      ))}
    </group>
  );
}

// ── Gold Chain (torus links) ──────────────────────────────────────────────
function GoldChain({ y, s, chainColor = '#ffd700', chainRadius = 0.13 }: {
  y: number; s: number; chainColor?: string; chainRadius?: number;
}) {
  const linkCount = 10;
  return (
    <group position={[0, y, 0]}>
      {Array.from({ length: linkCount }, (_, i) => {
        const angle = (i / linkCount) * Math.PI * 2;
        const r = chainRadius * s;
        return (
          <mesh key={i} position={[Math.sin(angle) * r, 0, Math.cos(angle) * r]} rotation={[0, -angle, 0]}>
            <torusGeometry args={[0.016 * s, 0.005 * s, 4, 8]} />
            <meshStandardMaterial
              color={chainColor}
              metalness={0.94}
              roughness={0.07}
              emissive={new THREE.Color(chainColor)}
              emissiveIntensity={0.25}
            />
          </mesh>
        );
      })}
      {/* Center medallion / pendant */}
      <mesh position={[0, -0.02 * s, chainRadius * s]}>
        <boxGeometry args={[0.07 * s, 0.07 * s, 0.025 * s]} />
        <meshStandardMaterial
          color={chainColor}
          metalness={0.96}
          roughness={0.05}
          emissive={new THREE.Color(chainColor)}
          emissiveIntensity={0.4}
        />
      </mesh>
    </group>
  );
}

// ── Air Jordan Sneaker ────────────────────────────────────────────────────
function AirJordan({ offsetX, s, shoeColor = '#f0f0f0', accentColor = '#cc0000' }: {
  offsetX: number; s: number; shoeColor?: string; accentColor?: string;
}) {
  return (
    <group position={[offsetX, 0, 0.02 * s]}>
      {/* Rubber outsole */}
      <mesh position={[0, 0.038 * s, 0]}>
        <boxGeometry args={[0.18 * s, 0.072 * s, 0.28 * s]} />
        <meshStandardMaterial color="#0e0e0e" roughness={0.72} />
      </mesh>
      {/* Midsole / Air unit (accent colored strip) */}
      <mesh position={[0, 0.10 * s, 0]}>
        <boxGeometry args={[0.17 * s, 0.04 * s, 0.265 * s]} />
        <meshStandardMaterial color={accentColor} roughness={0.5} metalness={0.1} />
      </mesh>
      {/* Upper body */}
      <mesh position={[0, 0.175 * s, 0]}>
        <boxGeometry args={[0.162 * s, 0.135 * s, 0.225 * s]} />
        <meshStandardMaterial color={shoeColor} roughness={0.5} />
      </mesh>
      {/* Toe cap (slightly lighter / different texture) */}
      <mesh position={[0, 0.155 * s, 0.115 * s]}>
        <boxGeometry args={[0.162 * s, 0.092 * s, 0.06 * s]} />
        <meshStandardMaterial color={shoeColor} roughness={0.42} />
      </mesh>
      {/* Tongue + collar opening */}
      <mesh position={[0, 0.245 * s, 0.065 * s]}>
        <boxGeometry args={[0.10 * s, 0.09 * s, 0.07 * s]} />
        <meshStandardMaterial color={shoeColor} roughness={0.52} />
      </mesh>
      {/* Lace panel */}
      <mesh position={[0, 0.224 * s, 0.09 * s]}>
        <boxGeometry args={[0.11 * s, 0.018 * s, 0.13 * s]} />
        <meshStandardMaterial color="#e8e8e8" roughness={0.65} />
      </mesh>
      {/* Jordan swoosh (side accent strip) */}
      <mesh position={[0.084 * s, 0.175 * s, 0]}>
        <boxGeometry args={[0.006 * s, 0.062 * s, 0.175 * s]} />
        <meshStandardMaterial color={accentColor} roughness={0.38} />
      </mesh>
    </group>
  );
}

export const CharacterModel = memo(function CharacterModel({ character, isFollowing, relationship, currentRegion }: CharacterModelProps) {
  // Route face-texture characters to dedicated models
  if (character.id === 'yb') {
    return <YBCharacterModel character={character} isFollowing={isFollowing} relationship={relationship} currentRegion={currentRegion} />;
  }
  if (character.id === 'quando') {
    return <FaceCharacterModel character={character} isFollowing={isFollowing} relationship={relationship} currentRegion={currentRegion} texturePath="/quando.png" label="QR" dreadsCount={10} dreadsLength={0.38} chainCount={1} chainColor="#cc3344" jordanColor="#111111" jordanAccent="#cc3344" />;
  }
  if (character.id === 'lultimm') {
    return <FaceCharacterModel character={character} isFollowing={isFollowing} relationship={relationship} currentRegion={currentRegion} texturePath="/lultimm.png" label="UZI" dreadsCount={8} dreadsLength={0.26} chainCount={1} chainColor="#00f0d0" jordanColor="#0a0a2e" jordanAccent="#00f0d0" />;
  }

  const groupRef    = useRef<THREE.Group>(null);
  const leftLegRef  = useRef<THREE.Mesh>(null);
  const rightLegRef = useRef<THREE.Mesh>(null);
  const leftArmRef  = useRef<THREE.Mesh>(null);
  const rightArmRef = useRef<THREE.Mesh>(null);
  const headRef     = useRef<THREE.Mesh>(null);
  const labelRef    = useRef<THREE.Group>(null);

  const posRef             = useRef(new THREE.Vector3(...character.homePosition));
  const walkPhase          = useRef(0);
  const allyShootCooldown  = useRef(1.5 + Math.random() * 2);
  const allyMuzzleTimer    = useRef(0);
  const allyMuzzleRef      = useRef<THREE.Mesh>(null);
  const { visual } = character;
  const s = visual.heightScale;
  const bodyW = visual.buildType === 'stocky' ? 0.52 : visual.buildType === 'lean' ? 0.38 : 0.44;
  const bodyH = 0.88 * s;
  const bodyD = 0.28;
  const legH  = 0.70 * s;
  const headY = legH + bodyH + 0.22 * s;

  const dreadCfg = DREAD_CONFIG[character.id] ?? null;
  const chainCfg = CHAIN_CONFIG[character.id] ?? { count: 0, color: '#FFD700' };

  // Jordan colors per character
  const jordanShoe    = character.id === 'timm' ? '#1a1a1a' : '#f0f0f0';
  const jordanAccent  = visual.accentColor;

  useFrame((state, delta) => {
    if (!groupRef.current) return;

    const t = state.clock.elapsedTime;
    let targetX: number, targetZ: number;
    let isMoving = false;

    if (isFollowing) {
      const followDist = 3;
      targetX = playerState.x + Math.sin(playerState.yaw + Math.PI) * followDist;
      targetZ = playerState.z + Math.cos(playerState.yaw + Math.PI) * followDist;
    } else {
      targetX = character.homePosition[0] + Math.sin(t * 0.2 + character.id.charCodeAt(0)) * 2;
      targetZ = character.homePosition[2] + Math.cos(t * 0.15 + character.id.charCodeAt(1)) * 2;
      if (currentRegion !== 'city') { groupRef.current.visible = false; return; }
    }

    groupRef.current.visible = true;

    const dx = targetX - posRef.current.x;
    const dz = targetZ - posRef.current.z;
    const dist = Math.sqrt(dx * dx + dz * dz);

    if (dist > 0.3) {
      const speed = isFollowing ? 8 : 1.5;
      const moveSpeed = Math.min(speed * delta, dist);
      posRef.current.x += (dx / dist) * moveSpeed;
      posRef.current.z += (dz / dist) * moveSpeed;
      isMoving = true;
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, Math.atan2(dx, dz), 5 * delta);
    }

    let groundY = 0;
    if (currentRegion === 'mountain') groundY = getTerrainHeight(posRef.current.x, posRef.current.z);
    posRef.current.y = groundY;
    groupRef.current.position.copy(posRef.current);

    if (isMoving) {
      walkPhase.current += delta * 8;
      const legSwing = Math.sin(walkPhase.current) * 0.42;
      if (leftLegRef.current)  leftLegRef.current.rotation.x  =  legSwing;
      if (rightLegRef.current) rightLegRef.current.rotation.x = -legSwing;
      if (leftArmRef.current)  leftArmRef.current.rotation.x  = -legSwing * 0.6;
      if (rightArmRef.current) rightArmRef.current.rotation.x =  legSwing * 0.6;
    } else {
      const idleBob = Math.sin(t * 2 + character.id.charCodeAt(0)) * 0.018;
      if (leftLegRef.current)  leftLegRef.current.rotation.x  = THREE.MathUtils.lerp(leftLegRef.current.rotation.x, 0, 3 * delta);
      if (rightLegRef.current) rightLegRef.current.rotation.x = THREE.MathUtils.lerp(rightLegRef.current.rotation.x, 0, 3 * delta);
      if (leftArmRef.current)  leftArmRef.current.rotation.x  = THREE.MathUtils.lerp(leftArmRef.current.rotation.x, 0, 3 * delta);
      if (rightArmRef.current) rightArmRef.current.rotation.x = THREE.MathUtils.lerp(rightArmRef.current.rotation.x, 0, 3 * delta);
      if (headRef.current) headRef.current.position.y = headY + idleBob;
    }

    // Ally combat
    allyShootCooldown.current = Math.max(0, allyShootCooldown.current - delta);
    allyMuzzleTimer.current   = Math.max(0, allyMuzzleTimer.current - delta);

    if (allyShootCooldown.current <= 0) {
      let nearestId: string | null = null;
      let nearestDist = 20;
      enemyStore.forEach((record, eid) => {
        if (!record.alive) return;
        const edx = record.x - posRef.current.x;
        const edz = record.z - posRef.current.z;
        const d = Math.sqrt(edx * edx + edz * edz);
        if (d < nearestDist) { nearestDist = d; nearestId = eid; }
      });
      if (nearestId) {
        hitEnemy(nearestId, 20);
        allyShootCooldown.current = 0.55 + Math.random() * 0.8;
        allyMuzzleTimer.current   = 0.07;
        const et = enemyStore.get(nearestId)!;
        groupRef.current.rotation.y = THREE.MathUtils.lerp(
          groupRef.current.rotation.y,
          Math.atan2(et.x - posRef.current.x, et.z - posRef.current.z),
          1,
        );
      } else {
        allyShootCooldown.current = 0.4;
      }
    }
    if (allyMuzzleRef.current) allyMuzzleRef.current.visible = allyMuzzleTimer.current > 0;
    if (labelRef.current) labelRef.current.lookAt(state.camera.position);
  });

  return (
    <group ref={groupRef} position={character.homePosition}>

      {/* ── Legs (jogger/trackpant style — slightly baggy) ── */}
      <mesh ref={leftLegRef} position={[-0.115, legH * 0.5, 0]} castShadow>
        <boxGeometry args={[0.16, legH, 0.19]} />
        <meshStandardMaterial color={visual.bodyColor} roughness={0.68} />
      </mesh>
      <mesh ref={rightLegRef} position={[0.115, legH * 0.5, 0]} castShadow>
        <boxGeometry args={[0.16, legH, 0.19]} />
        <meshStandardMaterial color={visual.bodyColor} roughness={0.68} />
      </mesh>

      {/* ── Jordan Sneakers ── */}
      <AirJordan offsetX={-0.115} s={s} shoeColor={jordanShoe} accentColor={jordanAccent} />
      <AirJordan offsetX={0.115}  s={s} shoeColor={jordanShoe} accentColor={jordanAccent} />

      {/* ── Hoodie torso ── */}
      <mesh position={[0, legH + bodyH * 0.5, 0]} castShadow>
        <boxGeometry args={[bodyW, bodyH, bodyD]} />
        <meshStandardMaterial color={visual.bodyColor} roughness={0.62} />
      </mesh>
      {/* Kangaroo pocket strip */}
      <mesh position={[0, legH + bodyH * 0.18, bodyD * 0.5 + 0.005]}>
        <boxGeometry args={[bodyW * 0.72, bodyH * 0.22, 0.012]} />
        <meshStandardMaterial
          color={new THREE.Color(visual.bodyColor).multiplyScalar(0.72).getStyle()}
          roughness={0.65}
        />
      </mesh>
      {/* Hood lump at back of neck */}
      <mesh position={[0, legH + bodyH * 0.88, -bodyD * 0.46]}>
        <sphereGeometry args={[0.14 * s, 8, 6]} />
        <meshStandardMaterial color={visual.bodyColor} roughness={0.62} />
      </mesh>
      {/* Sleeve cuffs */}
      <mesh position={[-(bodyW * 0.5 + 0.12), legH + bodyH * 0.10, 0]}>
        <boxGeometry args={[0.04, 0.07, 0.16]} />
        <meshStandardMaterial color={visual.accentColor} roughness={0.55} />
      </mesh>
      <mesh position={[bodyW * 0.5 + 0.12, legH + bodyH * 0.10, 0]}>
        <boxGeometry args={[0.04, 0.07, 0.16]} />
        <meshStandardMaterial color={visual.accentColor} roughness={0.55} />
      </mesh>

      {/* ── Arms ── */}
      <mesh ref={leftArmRef} position={[-(bodyW * 0.5 + 0.10), legH + bodyH * 0.42, 0]} castShadow>
        <boxGeometry args={[0.13, 0.68 * s, 0.14]} />
        <meshStandardMaterial color={visual.bodyColor} roughness={0.65} />
      </mesh>
      <mesh ref={rightArmRef} position={[bodyW * 0.5 + 0.10, legH + bodyH * 0.42, 0]} castShadow>
        <boxGeometry args={[0.13, 0.68 * s, 0.14]} />
        <meshStandardMaterial color={visual.bodyColor} roughness={0.65} />
      </mesh>
      {/* Forearms / hands (skin showing at cuffs) */}
      <mesh position={[-(bodyW * 0.5 + 0.10), legH + bodyH * 0.08, 0]}>
        <boxGeometry args={[0.12, 0.22 * s, 0.13]} />
        <meshStandardMaterial color={visual.skinColor} roughness={0.72} />
      </mesh>
      <mesh position={[bodyW * 0.5 + 0.10, legH + bodyH * 0.08, 0]}>
        <boxGeometry args={[0.12, 0.22 * s, 0.13]} />
        <meshStandardMaterial color={visual.skinColor} roughness={0.72} />
      </mesh>

      {/* ── Neck ── */}
      <mesh position={[0, legH + bodyH + 0.06 * s, 0]}>
        <cylinderGeometry args={[0.075 * s, 0.085 * s, 0.18 * s, 8]} />
        <meshStandardMaterial color={visual.skinColor} roughness={0.76} />
      </mesh>

      {/* ── Head (sphere — much more natural than box) ── */}
      <mesh ref={headRef} position={[0, headY, 0]} castShadow>
        <sphereGeometry args={[0.17 * s, 12, 9]} />
        <meshStandardMaterial color={visual.skinColor} roughness={0.72} />
      </mesh>
      {/* Eyes */}
      <mesh position={[-0.065 * s, headY + 0.02 * s, 0.165 * s]}>
        <boxGeometry args={[0.032, 0.018, 0.01]} />
        <meshBasicMaterial color="#0a0a0a" />
      </mesh>
      <mesh position={[0.065 * s, headY + 0.02 * s, 0.165 * s]}>
        <boxGeometry args={[0.032, 0.018, 0.01]} />
        <meshBasicMaterial color="#0a0a0a" />
      </mesh>
      {/* Eye whites */}
      <mesh position={[-0.065 * s, headY + 0.02 * s, 0.163 * s]}>
        <boxGeometry args={[0.038, 0.024, 0.008]} />
        <meshBasicMaterial color="#e8e0d0" />
      </mesh>
      <mesh position={[0.065 * s, headY + 0.02 * s, 0.163 * s]}>
        <boxGeometry args={[0.038, 0.024, 0.008]} />
        <meshBasicMaterial color="#e8e0d0" />
      </mesh>

      {/* ── Dreadlocks ── */}
      {dreadCfg && (
        <Dreads headY={headY} s={s} count={dreadCfg.count} maxLength={dreadCfg.maxLength} />
      )}
      {/* Cap / flat-top for characters without dreads */}
      {!dreadCfg && visual.accessory === 'cap' && (
        <group position={[0, headY + 0.14 * s, 0]}>
          <mesh>
            <boxGeometry args={[0.35 * s, 0.06 * s, 0.35 * s]} />
            <meshStandardMaterial color={visual.accentColor} roughness={0.6} />
          </mesh>
          <mesh position={[0, -0.01 * s, 0.18 * s]}>
            <boxGeometry args={[0.30 * s, 0.03 * s, 0.12 * s]} />
            <meshStandardMaterial color={visual.accentColor} roughness={0.6} />
          </mesh>
        </group>
      )}

      {/* ── Gold Chains (torus links) ── */}
      {Array.from({ length: chainCfg.count }, (_, ci) => (
        <GoldChain
          key={ci}
          y={legH + bodyH * 0.72 - ci * 0.088 * s}
          s={s}
          chainColor={chainCfg.color}
          chainRadius={0.12 + ci * 0.015}
        />
      ))}

      {/* ── Ally weapon + muzzle flash ── */}
      <mesh position={[bodyW * 0.5 + 0.12, legH + bodyH * 0.28, 0.22]} rotation={[0, 0, 0.1]}>
        <boxGeometry args={[0.055, 0.12, 0.30]} />
        <meshStandardMaterial color="#1a1a1a" metalness={0.85} roughness={0.25} />
      </mesh>
      <mesh ref={allyMuzzleRef} position={[bodyW * 0.5 + 0.14, legH + bodyH * 0.28, 0.40]} visible={false}>
        <sphereGeometry args={[0.08, 5, 4]} />
        <meshBasicMaterial color={visual.accentColor} />
      </mesh>

      {/* ── Glasses (for ben) ── */}
      {visual.accessory === 'glasses' && (
        <group position={[0, headY + 0.022 * s, 0.162 * s]}>
          <mesh position={[-0.062 * s, 0, 0]}>
            <boxGeometry args={[0.075 * s, 0.038 * s, 0.012]} />
            <meshStandardMaterial color={visual.accentColor} metalness={0.85} roughness={0.15} />
          </mesh>
          <mesh position={[0.062 * s, 0, 0]}>
            <boxGeometry args={[0.075 * s, 0.038 * s, 0.012]} />
            <meshStandardMaterial color={visual.accentColor} metalness={0.85} roughness={0.15} />
          </mesh>
          <mesh>
            <boxGeometry args={[0.035 * s, 0.010, 0.010]} />
            <meshStandardMaterial color={visual.accentColor} metalness={0.85} roughness={0.15} />
          </mesh>
        </group>
      )}

      {/* ── Mic (for rondo) ── */}
      {visual.accessory === 'mic' && (
        <mesh position={[bodyW * 0.5 + 0.14, legH + bodyH * 0.38, 0.12]}>
          <cylinderGeometry args={[0.025, 0.022, 0.28, 7]} />
          <meshStandardMaterial color="#2a2a2a" metalness={0.8} roughness={0.2} />
        </mesh>
      )}

      {/* ── Vest (for timm) ── */}
      {visual.accessory === 'vest' && (
        <mesh position={[0, legH + bodyH * 0.52, bodyD * 0.02]}>
          <boxGeometry args={[bodyW + 0.06, bodyH * 0.72, bodyD * 1.1 + 0.04]} />
          <meshStandardMaterial color={visual.accentColor} transparent opacity={0.35} roughness={0.5} />
        </mesh>
      )}

      {/* ── Name label ── */}
      <group ref={labelRef} position={[0, headY + 0.38 * s, 0]}>
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
        {relationship > 0 && (
          <>
            <mesh position={[0, -0.46, 0]}>
              <planeGeometry args={[0.7, 0.04]} />
              <meshBasicMaterial color="#111" transparent opacity={0.7} />
            </mesh>
            <mesh position={[(-0.35 + 0.35 * (relationship / 100)), -0.46, 0.001]}>
              <planeGeometry args={[0.7 * (relationship / 100), 0.04]} />
              <meshBasicMaterial color={relationship > 60 ? '#44ff44' : relationship > 30 ? '#FFD700' : '#ff4444'} />
            </mesh>
          </>
        )}
      </group>

      {/* ── Ground marker ring ── */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <ringGeometry args={[0.52, 0.72, 14]} />
        <meshBasicMaterial color={visual.accentColor} transparent opacity={0.14} />
      </mesh>

    </group>
  );
});
