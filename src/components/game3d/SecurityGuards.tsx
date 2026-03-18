/**
 * SecurityGuards.tsx — Security officer NPCs using the KB3D SEC1LOD1 FBX asset.
 * 4 guards patrol key city locations. Faces player when nearby.
 * At wanted level 3+ they go hostile (visual alert only — damage via PoliceSystem).
 */
import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useFBX, Text } from '@react-three/drei';
import * as THREE from 'three';
import { playerState } from '@/stores/playerStore';

// Patrol definitions — home position + patrol axis + range
const GUARD_DEFS = [
  { id: 'g1', x:   8, z: -12.5, axis: 'x' as const, range: 5, speed: 0.90, label: 'SECURITY' },
  { id: 'g2', x: -22, z: -12.5, axis: 'x' as const, range: 4, speed: 0.75, label: 'SECURITY' },
  { id: 'g3', x:  35, z:   9.2, axis: 'x' as const, range: 6, speed: 0.85, label: 'SECURITY' },
  { id: 'g4', x: -50, z:   9.2, axis: 'x' as const, range: 4, speed: 0.70, label: 'SECURITY' },
] as const;

const NOTICE_DSQ   = 64;  // 8 units — guard notices player
const HOSTILE_DSQ  = 25;  // 5 units — guard goes alert when wanted

// Convert FBX Phong → PBR Standard, force security uniform
function applySecurityMaterial(root: THREE.Group) {
  const uniformColor  = new THREE.Color('#1c2a42');   // dark navy
  const badgeColor    = new THREE.Color('#c8a820');    // gold badge
  const beltColor     = new THREE.Color('#111116');
  const skinColor     = new THREE.Color('#c8a074');    // neutral skin

  let meshCount = 0;
  root.traverse(child => {
    if (!(child as THREE.Mesh).isMesh) return;
    const mesh = child as THREE.Mesh;
    meshCount++;

    // Heuristic: assign materials based on mesh index to break up the uniform
    const mat = new THREE.MeshStandardMaterial({
      roughness: 0.72,
      metalness: 0.08,
    });

    if (meshCount === 1) {
      // First mesh → body/uniform
      mat.color.copy(uniformColor);
    } else if (meshCount === 2) {
      // Second mesh → head/skin
      mat.color.copy(skinColor);
    } else if (meshCount % 5 === 0) {
      // Every 5th → gold accent (badge, buttons)
      mat.color.copy(badgeColor);
      mat.metalness = 0.85;
      mat.roughness = 0.25;
    } else if (meshCount % 3 === 0) {
      // Every 3rd → belt/dark trim
      mat.color.copy(beltColor);
      mat.metalness = 0.35;
    } else {
      mat.color.copy(uniformColor);
    }

    mesh.material       = mat;
    mesh.castShadow     = false;
    mesh.receiveShadow  = false;
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Single guard — uses shared FBX scene, cloned per instance
// ─────────────────────────────────────────────────────────────────────────────
interface GuardProps {
  def: typeof GUARD_DEFS[number];
  sharedScene: THREE.Group;
  wantedLevel: number;
}

function Guard({ def, sharedScene, wantedLevel }: GuardProps) {
  const ref    = useRef<THREE.Group>(null);
  const tRef   = useRef(Math.random() * Math.PI * 2);   // phase offset
  const scene  = useMemo(() => {
    const clone = sharedScene.clone(true);
    applySecurityMaterial(clone);
    // Auto-scale to 1.8 world units tall
    const box  = new THREE.Box3().setFromObject(clone);
    const h    = box.getSize(new THREE.Vector3()).y;
    if (h > 0) clone.scale.setScalar(1.8 / h);
    return clone;
  }, [sharedScene]);

  useFrame((_, delta) => {
    if (!ref.current) return;
    tRef.current += delta;
    const t = tRef.current;

    const dx = playerState.x - def.x;
    const dz = playerState.z - def.z;
    const pDist = dx * dx + dz * dz;
    const nearPlayer = pDist < NOTICE_DSQ;
    const hostile    = wantedLevel >= 3 && pDist < HOSTILE_DSQ;

    if (nearPlayer) {
      // Face toward player
      const angle = Math.atan2(dx, dz);
      ref.current.rotation.y = THREE.MathUtils.lerp(
        ref.current.rotation.y, angle, delta * 4.5
      );
      // Alert sway when hostile
      if (hostile) {
        ref.current.rotation.z = Math.sin(t * 6.0) * 0.028;
      }
    } else {
      // Patrol loop using sine wave
      const patrolOffset = Math.sin(t * def.speed) * def.range;
      if (def.axis === 'x') {
        ref.current.position.x = def.x + patrolOffset;
        ref.current.position.z = def.z;
        ref.current.rotation.y = patrolOffset > 0 ? -Math.PI * 0.5 : Math.PI * 0.5;
      } else {
        ref.current.position.x = def.x;
        ref.current.position.z = def.z + patrolOffset;
        ref.current.rotation.y = patrolOffset > 0 ? 0 : Math.PI;
      }
      // Walking bob
      ref.current.position.y = Math.abs(Math.sin(t * def.speed * 4)) * 0.025;
    }
  });

  return (
    <group
      ref={ref}
      position={[def.x, 0, def.z]}
    >
      <primitive object={scene} />

      {/* Overhead label — always show name, color shifts when hostile */}
      <Text
        position={[0, 2.4, 0]}
        fontSize={0.18}
        color={wantedLevel >= 3 ? '#ff4444' : '#88aaff'}
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.025}
        outlineColor="#000000"
      >
        {def.label}
      </Text>

      {/* Hostile indicator */}
      {wantedLevel >= 3 && (
        <pointLight position={[0, 2.0, 0]} color="#ff2200" intensity={6} distance={5} decay={2} />
      )}
    </group>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SecurityGuards — exported, renders all 4 guards
// ─────────────────────────────────────────────────────────────────────────────
interface Props {
  wantedLevel?: number;
}

export function SecurityGuards({ wantedLevel = 0 }: Props) {
  // Load lowest-LOD version for performance (4 instances)
  const raw = useFBX(
    '/security-officer-with-lods-2026-02-10-20-10-53-utc/%5BFBX%5D%20SEC1LOD1NR/SEC1LOD1NR.FBX'
  );

  return (
    <>
      {GUARD_DEFS.map(def => (
        <Guard
          key={def.id}
          def={def}
          sharedScene={raw}
          wantedLevel={wantedLevel}
        />
      ))}
    </>
  );
}

useFBX.preload(
  '/security-officer-with-lods-2026-02-10-20-10-53-utc/%5BFBX%5D%20SEC1LOD1NR/SEC1LOD1NR.FBX'
);
