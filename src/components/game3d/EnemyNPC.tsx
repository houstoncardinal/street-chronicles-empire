import { useRef, useEffect, memo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { Text } from '@react-three/drei';
import { enemyStore, enemyMeshes, EnemyRecord, spawnEnemy } from '@/stores/enemyStore';
import { playerState } from '@/stores/playerStore';

interface EnemyNPCProps {
  id: string;
  spawnX: number;
  spawnZ: number;
}

// Rival / OPPS color palette — dark red, charcoal, enemy look
const SKIN_PALETTE  = ['#8d5524', '#c68642', '#4a3728', '#6a4a30', '#7a5a38'];
const CLOTH_OPP     = ['#3a0808', '#2a0a0a', '#1a1a1a', '#2a2010', '#1e0e0e'];

function seededItem<T>(arr: T[], seed: number): T {
  return arr[Math.abs(seed | 0) % arr.length];
}

// Shared alert broadcast — when one opp spots player, nearby opps also alert
export const oppAlertStore = { alertX: 0, alertZ: 0, alertTime: -9999 };

// ── Respawn helper — called from wave manager ──────────────────────────────
export function respawnEnemy(id: string, x: number, z: number) {
  const record = enemyStore.get(id);
  if (record) {
    record.health = 100;
    record.alive  = true;
    record.x = x;
    record.z = z;
    record.alertLevel = 0;
  } else {
    spawnEnemy(id, x, 0, z);
  }
}

export const EnemyNPC = memo(function EnemyNPC({ id, spawnX, spawnZ }: EnemyNPCProps) {
  const groupRef    = useRef<THREE.Group>(null);
  const bodyRef     = useRef<THREE.Mesh>(null);
  const headRef     = useRef<THREE.Mesh>(null);
  const leftLegRef  = useRef<THREE.Mesh>(null);
  const rightLegRef = useRef<THREE.Mesh>(null);
  const leftArmRef  = useRef<THREE.Mesh>(null);
  const rightArmRef = useRef<THREE.Mesh>(null);
  const hpFillRef   = useRef<THREE.Mesh>(null);
  const hpGroupRef  = useRef<THREE.Group>(null);
  const labelRef    = useRef<THREE.Group>(null);
  const muzzleRef   = useRef<THREE.Mesh>(null);

  const posRef       = useRef(new THREE.Vector3(spawnX, 0, spawnZ));
  const walkPhase    = useRef(0);
  const patrolAngle  = useRef(Math.random() * Math.PI * 2);
  const deathTimer   = useRef(-1);
  const flashTimer   = useRef(0);
  const shootTimer   = useRef(Math.random() * 2.5); // stagger initial shots
  const muzzleTimer  = useRef(0);
  const respawnTimer = useRef(-1);

  const seed  = spawnX * 1000 + spawnZ;
  const skin  = seededItem(SKIN_PALETTE, seed);
  const cloth = seededItem(CLOTH_OPP, seed + 5);

  const { camera } = useThree();

  useEffect(() => {
    const record = enemyStore.get(id);
    if (!record) return;
    const meshes: THREE.Mesh[] = [];
    const reg = (ref: React.RefObject<THREE.Mesh | null>) => {
      if (ref.current) {
        ref.current.userData.enemyId = id;
        enemyMeshes.add(ref.current);
        meshes.push(ref.current);
      }
    };
    reg(bodyRef); reg(headRef); reg(leftLegRef); reg(rightLegRef); reg(leftArmRef); reg(rightArmRef);
    return () => { meshes.forEach(m => enemyMeshes.delete(m)); };
  }, [id]);

  useFrame((_, delta) => {
    if (!groupRef.current) return;

    // Distance cull
    const pdx = posRef.current.x - camera.position.x;
    const pdz = posRef.current.z - camera.position.z;
    if (pdx * pdx + pdz * pdz > 3600) { groupRef.current.visible = false; return; }
    groupRef.current.visible = true;

    const record: EnemyRecord | undefined = enemyStore.get(id);
    if (!record) return;

    // ── Respawn logic ──────────────────────────────────────────────────────
    if (!record.alive) {
      if (deathTimer.current < 0) {
        deathTimer.current = 0;
        respawnTimer.current = 6.0; // respawn after 6 seconds
      }
      deathTimer.current += delta;
      groupRef.current.rotation.z = Math.min(deathTimer.current * 1.8, Math.PI / 2);
      groupRef.current.position.y = Math.max(-0.6, -deathTimer.current * 0.4);

      // Respawn
      respawnTimer.current -= delta;
      if (respawnTimer.current <= 0) {
        // Spawn behind player or off-screen
        const ang  = Math.random() * Math.PI * 2;
        const dist = 28 + Math.random() * 12;
        const nx   = playerState.x + Math.sin(ang) * dist;
        const nz   = playerState.z + Math.cos(ang) * dist;
        respawnEnemy(id, nx, nz);
        posRef.current.set(nx, 0, nz);
        groupRef.current.position.set(nx, 0, nz);
        groupRef.current.rotation.z = 0;
        deathTimer.current  = -1;
        respawnTimer.current = -1;
      }
      return;
    }

    // ── Hit flash ──────────────────────────────────────────────────────────
    flashTimer.current  = Math.max(0, flashTimer.current - delta);
    muzzleTimer.current = Math.max(0, muzzleTimer.current - delta);

    // ── AI ─────────────────────────────────────────────────────────────────
    const px = playerState.x, pz = playerState.z;
    const toPx = px - posRef.current.x;
    const toPz = pz - posRef.current.z;
    const distToPlayer = Math.sqrt(toPx * toPx + toPz * toPz);

    // Check shared alert (buddy spotted player)
    const timeSinceAlert = performance.now() * 0.001 - oppAlertStore.alertTime;
    const nearAlert = timeSinceAlert < 4.0 &&
      Math.hypot(oppAlertStore.alertX - posRef.current.x, oppAlertStore.alertZ - posRef.current.z) < 22;

    let targetX: number, targetZ: number;
    let isMoving = false;
    const CHASE   = 22;
    const ATTACK  = 10;
    const SPEED_PATROL = 2.0;
    const SPEED_CHASE  = 5.2;

    if (distToPlayer < CHASE || nearAlert) {
      record.alertLevel = 2;
      // Broadcast alert position to buddy opps
      if (distToPlayer < CHASE && oppAlertStore.alertTime < performance.now() * 0.001 - 1.0) {
        oppAlertStore.alertX    = posRef.current.x;
        oppAlertStore.alertZ    = posRef.current.z;
        oppAlertStore.alertTime = performance.now() * 0.001;
      }

      if (distToPlayer > ATTACK * 0.6) {
        targetX = px;
        targetZ = pz;
      } else {
        // Strafe in attack range
        const t = performance.now() * 0.001;
        const strafe = Math.sin(t * 1.4 + seed * 0.01) * 2.5;
        const perp   = Math.atan2(toPx, toPz) + Math.PI / 2;
        targetX = posRef.current.x + Math.sin(perp) * strafe;
        targetZ = posRef.current.z + Math.cos(perp) * strafe;
      }

      // ── Shoot back at player ─────────────────────────────────────────
      if (distToPlayer < ATTACK + 4) {
        shootTimer.current -= delta;
        if (shootTimer.current <= 0) {
          shootTimer.current  = 0.8 + Math.random() * 1.2;
          muzzleTimer.current = 0.08;
          // Cosmetic only — muzzle flash fires but no damage to player in this version
        }
      }
    } else {
      record.alertLevel = 0;
      patrolAngle.current += delta * 0.35;
      targetX = spawnX + Math.sin(patrolAngle.current) * 7;
      targetZ = spawnZ + Math.cos(patrolAngle.current) * 7;
    }

    const dx   = targetX - posRef.current.x;
    const dz   = targetZ - posRef.current.z;
    const dist = Math.sqrt(dx * dx + dz * dz);

    if (dist > 0.3) {
      const spd  = record.alertLevel === 2 ? SPEED_CHASE : SPEED_PATROL;
      const move = Math.min(spd * delta, dist);
      posRef.current.x += (dx / dist) * move;
      posRef.current.z += (dz / dist) * move;
      isMoving = true;
      groupRef.current.rotation.y = THREE.MathUtils.lerp(
        groupRef.current.rotation.y, Math.atan2(dx, dz), 8 * delta,
      );
    }

    groupRef.current.position.set(posRef.current.x, 0, posRef.current.z);
    record.x = posRef.current.x;
    record.z = posRef.current.z;

    // Walk animation
    if (isMoving) {
      walkPhase.current += delta * (record.alertLevel === 2 ? 11 : 7);
      const sw = Math.sin(walkPhase.current) * 0.50;
      if (leftLegRef.current)  leftLegRef.current.rotation.x  =  sw;
      if (rightLegRef.current) rightLegRef.current.rotation.x = -sw;
      if (leftArmRef.current)  leftArmRef.current.rotation.x  = -sw * 0.5;
      if (rightArmRef.current) rightArmRef.current.rotation.x =  sw * 0.5;
    } else {
      [leftLegRef, rightLegRef, leftArmRef, rightArmRef].forEach(r => {
        if (r.current) r.current.rotation.x = THREE.MathUtils.lerp(r.current.rotation.x, 0, 4 * delta);
      });
    }

    if (hpGroupRef.current) hpGroupRef.current.lookAt(camera.position);
    if (labelRef.current)   labelRef.current.lookAt(camera.position);

    if (hpFillRef.current) {
      const pct = record.health / record.maxHealth;
      hpFillRef.current.scale.x = Math.max(0, pct);
      hpFillRef.current.position.x = -0.4 * (1 - pct);
      (hpFillRef.current.material as THREE.MeshBasicMaterial).color.setHex(
        pct > 0.55 ? 0xff2222 : pct > 0.25 ? 0xff6600 : 0xff0000
      );
    }

    if (bodyRef.current) {
      const mat = bodyRef.current.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = flashTimer.current > 0 ? 1.0 : 0;
    }

    // Muzzle flash visibility
    if (muzzleRef.current) muzzleRef.current.visible = muzzleTimer.current > 0;
  });

  return (
    <group ref={groupRef} position={[spawnX, 0, spawnZ]}>

      {/* ── Legs ── */}
      <mesh ref={leftLegRef}  position={[-0.12, 0.36, 0]} castShadow>
        <boxGeometry args={[0.16, 0.72, 0.18]} />
        <meshStandardMaterial color={cloth} roughness={0.7} />
      </mesh>
      <mesh ref={rightLegRef} position={[ 0.12, 0.36, 0]} castShadow>
        <boxGeometry args={[0.16, 0.72, 0.18]} />
        <meshStandardMaterial color={cloth} roughness={0.7} />
      </mesh>

      {/* Boots */}
      <mesh position={[-0.12, 0.07, 0.03]} castShadow>
        <boxGeometry args={[0.20, 0.12, 0.26]} />
        <meshStandardMaterial color="#0a0808" metalness={0.5} roughness={0.5} />
      </mesh>
      <mesh position={[ 0.12, 0.07, 0.03]} castShadow>
        <boxGeometry args={[0.20, 0.12, 0.26]} />
        <meshStandardMaterial color="#0a0808" metalness={0.5} roughness={0.5} />
      </mesh>

      {/* ── Torso — dark red hoodie ── */}
      <mesh ref={bodyRef} position={[0, 1.14, 0]} castShadow>
        <boxGeometry args={[0.50, 0.64, 0.28]} />
        <meshStandardMaterial color={cloth} roughness={0.6} metalness={0.1}
          emissive="#ff0000" emissiveIntensity={0} />
      </mesh>

      {/* Arms */}
      <mesh ref={leftArmRef}  position={[-0.35, 1.14, 0]} castShadow>
        <boxGeometry args={[0.14, 0.58, 0.16]} />
        <meshStandardMaterial color={cloth} roughness={0.7} />
      </mesh>
      <mesh ref={rightArmRef} position={[ 0.35, 1.14, 0]} castShadow>
        <boxGeometry args={[0.14, 0.58, 0.16]} />
        <meshStandardMaterial color={cloth} roughness={0.7} />
      </mesh>

      {/* ── Neck ── */}
      <mesh position={[0, 1.52, 0]}>
        <boxGeometry args={[0.14, 0.18, 0.14]} />
        <meshStandardMaterial color={skin} roughness={0.8} />
      </mesh>

      {/* ── Head ── */}
      <mesh ref={headRef} position={[0, 1.78, 0]} castShadow>
        <boxGeometry args={[0.30, 0.30, 0.28]} />
        <meshStandardMaterial color={skin} roughness={0.75} />
      </mesh>
      {/* Red bandana / face cover */}
      <mesh position={[0, 1.74, 0.146]}>
        <planeGeometry args={[0.28, 0.14]} />
        <meshBasicMaterial color="#880000" transparent opacity={0.9} />
      </mesh>
      {/* Eyes */}
      <mesh position={[-0.08, 1.82, 0.146]}>
        <planeGeometry args={[0.065, 0.035]} />
        <meshBasicMaterial color="#ff2200" />
      </mesh>
      <mesh position={[ 0.08, 1.82, 0.146]}>
        <planeGeometry args={[0.065, 0.035]} />
        <meshBasicMaterial color="#ff2200" />
      </mesh>

      {/* Gun in right hand */}
      <mesh position={[0.42, 1.0, 0.22]} rotation={[0, 0, 0.12]}>
        <boxGeometry args={[0.06, 0.14, 0.32]} />
        <meshStandardMaterial color="#1a1a1a" metalness={0.85} roughness={0.25} />
      </mesh>
      {/* Muzzle flash */}
      <mesh ref={muzzleRef} position={[0.42, 1.0, 0.40]} visible={false}>
        <sphereGeometry args={[0.09, 5, 4]} />
        <meshBasicMaterial color="#ffaa22" />
      </mesh>

      {/* ── HP bar ── */}
      <group ref={hpGroupRef} position={[0, 2.25, 0]}>
        <mesh>
          <planeGeometry args={[0.8, 0.08]} />
          <meshBasicMaterial color="#220000" transparent opacity={0.85} />
        </mesh>
        <mesh ref={hpFillRef} position={[0, 0, 0.001]}>
          <planeGeometry args={[0.8, 0.08]} />
          <meshBasicMaterial color="#ff2222" />
        </mesh>
      </group>

      {/* ── OPPS label ── */}
      <group ref={labelRef} position={[0, 2.42, 0]}>
        <Text fontSize={0.14} color="#ff3333"
          anchorX="center" anchorY="middle"
          outlineWidth={0.016} outlineColor="#000">
          OPPS
        </Text>
      </group>

    </group>
  );
});

// ── Enemy spawn config — spread around the 3800 block ─────────────────────
export const ENEMY_SPAWNS: Array<{ id: string; x: number; z: number }> = [
  { id: 'e1',  x:  20, z: -26 },
  { id: 'e2',  x: -22, z: -24 },
  { id: 'e3',  x:  32, z:  10 },
  { id: 'e4',  x: -34, z:  18 },
  { id: 'e5',  x:  12, z: -42 },
  { id: 'e6',  x: -16, z:  38 },
  { id: 'e7',  x:  44, z: -12 },
  { id: 'e8',  x: -40, z: -32 },
];
