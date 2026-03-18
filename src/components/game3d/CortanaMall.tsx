/**
 * CortanaMall.tsx — Cortana Mall shopping complex (x = +90 to +230, z = +100 to +200)
 * Anchor stores, inline shops, food court, parking lot.
 */
import { RigidBody } from '@react-three/rapier';
import * as THREE from 'three';

const ASPHALT   = '#252530';
const PARKING   = '#2a2a30';
const CONCRETE  = '#3a3a40';
const SIDEWALK  = '#8a7460';

function Box({ pos, size, color, roughness = 0.82, metalness = 0, emissive, emissiveIntensity = 1 }: {
  pos: [number, number, number];
  size: [number, number, number];
  color: string;
  roughness?: number;
  metalness?: number;
  emissive?: string;
  emissiveIntensity?: number;
}) {
  return (
    <mesh position={pos}>
      <boxGeometry args={size} />
      <meshStandardMaterial
        color={color}
        roughness={roughness}
        metalness={metalness}
        emissive={emissive ? new THREE.Color(emissive) : undefined}
        emissiveIntensity={emissive ? emissiveIntensity : 0}
      />
    </mesh>
  );
}

// ── Anchor Store (large box, 30×8×24) ────────────────────────────────────
function AnchorStore({ x, z, rot = 0, name, color = '#1e1a28', accentColor = '#ffd700' }: {
  x: number; z: number; rot?: number; name: string; color?: string; accentColor?: string;
}) {
  return (
    <group position={[x, 0, z]} rotation={[0, rot, 0]}>
      {/* Main body */}
      <mesh position={[0, 4, 0]}>
        <boxGeometry args={[30, 8, 24]} />
        <meshStandardMaterial color={color} roughness={0.88} />
      </mesh>
      {/* Parapet */}
      <mesh position={[0, 8.25, 0]}>
        <boxGeometry args={[30.4, 0.5, 24.4]} />
        <meshStandardMaterial color={color} roughness={0.85} />
      </mesh>
      {/* Emissive logo fascia */}
      <mesh position={[0, 6.2, 12.07]}>
        <boxGeometry args={[22, 1.4, 0.1]} />
        <meshStandardMaterial color={accentColor} emissive={new THREE.Color(accentColor)} emissiveIntensity={1.8} roughness={0.2} />
      </mesh>
      {/* Entrance canopy */}
      <mesh position={[0, 4.2, 13.5]} rotation={[-0.2, 0, 0]}>
        <boxGeometry args={[10, 0.18, 3.5]} />
        <meshStandardMaterial color={accentColor} roughness={0.7} />
      </mesh>
      {/* Roll-up doors (2) */}
      <Box pos={[-4.5, 1.8, 12.08]} size={[4, 3.2, 0.08]} color="#1a1a22" roughness={0.85} />
      <Box pos={[ 4.5, 1.8, 12.08]} size={[4, 3.2, 0.08]} color="#1a1a22" roughness={0.85} />
      {/* Side windows */}
      {([-10, -4, 4, 10] as number[]).map((wx, i) => (
        <mesh key={i} position={[wx, 4.5, 12.08]}>
          <boxGeometry args={[3.5, 2.5, 0.07]} />
          <meshStandardMaterial color="#0a1a28" roughness={0.1} metalness={0.3} transparent opacity={0.5} />
        </mesh>
      ))}
      {/* Collider */}
      <RigidBody type="fixed">
        <mesh position={[0, 4, 0]} visible={false}>
          <boxGeometry args={[30, 8, 24]} />
          <meshBasicMaterial />
        </mesh>
      </RigidBody>
    </group>
  );
}

// ── Mall Corridor (covered walkway connector) ─────────────────────────────
function MallCorridor({ x, z, len, axis = 'x' }: {
  x: number; z: number; len: number; axis?: 'x' | 'z';
}) {
  const rot: [number, number, number] = axis === 'z' ? [0, Math.PI / 2, 0] : [0, 0, 0];
  return (
    <group position={[x, 0, z]} rotation={rot}>
      {/* Roof slab */}
      <mesh position={[0, 4.8, 0]}>
        <boxGeometry args={[len, 0.3, 10]} />
        <meshStandardMaterial color={CONCRETE} roughness={0.85} />
      </mesh>
      {/* Emissive skylight strip */}
      <mesh position={[0, 4.96, 0]}>
        <boxGeometry args={[len - 2, 0.1, 2.2]} />
        <meshStandardMaterial color="#ffe8cc" emissive={new THREE.Color('#ffe8cc')} emissiveIntensity={0.7} roughness={0.3} />
      </mesh>
      {/* Low side walls */}
      <mesh position={[0, 2.4, -5.1]}>
        <boxGeometry args={[len, 4.8, 0.2]} />
        <meshStandardMaterial color="#202230" roughness={0.88} />
      </mesh>
      <mesh position={[0, 2.4, 5.1]}>
        <boxGeometry args={[len, 4.8, 0.2]} />
        <meshStandardMaterial color="#202230" roughness={0.88} />
      </mesh>
      {/* Collider */}
      <RigidBody type="fixed">
        <mesh position={[0, 2.4, 0]} visible={false}>
          <boxGeometry args={[len, 4.8, 10]} />
          <meshBasicMaterial />
        </mesh>
      </RigidBody>
    </group>
  );
}

// ── Inline Mall Store (8×4.5×9) ──────────────────────────────────────────
function InlineStore({ x, z, rot = 0, name, color = '#181e2a', accentColor = '#00f0d0' }: {
  x: number; z: number; rot?: number; name: string; color?: string; accentColor?: string;
}) {
  return (
    <group position={[x, 0, z]} rotation={[0, rot, 0]}>
      {/* Body */}
      <mesh position={[0, 2.25, 0]}>
        <boxGeometry args={[8, 4.5, 9]} />
        <meshStandardMaterial color={color} roughness={0.88} />
      </mesh>
      {/* Storefront glass */}
      <mesh position={[0, 2.0, 4.52]}>
        <boxGeometry args={[6, 2.8, 0.08]} />
        <meshStandardMaterial color="#c8e8ff" roughness={0.1} metalness={0.2} transparent opacity={0.35} />
      </mesh>
      {/* Emissive sign */}
      <mesh position={[0, 4.0, 4.56]}>
        <boxGeometry args={[7.5, 0.8, 0.08]} />
        <meshStandardMaterial color={accentColor} emissive={new THREE.Color(accentColor)} emissiveIntensity={1.5} roughness={0.2} />
      </mesh>
      {/* Collider */}
      <RigidBody type="fixed">
        <mesh position={[0, 2.25, 0]} visible={false}>
          <boxGeometry args={[8, 4.5, 9]} />
          <meshBasicMaterial />
        </mesh>
      </RigidBody>
    </group>
  );
}

// ── Parked Car ────────────────────────────────────────────────────────────
function MallCar({ x, z, rot = 0, color = '#1a2235' }: {
  x: number; z: number; rot?: number; color?: string;
}) {
  return (
    <group position={[x, 0, z]} rotation={[0, rot, 0]}>
      <Box pos={[0, 0.48, 0]}   size={[2.0, 0.68, 4.4]} color={color} roughness={0.4} metalness={0.4} />
      <Box pos={[0, 0.96, 0.2]} size={[1.8, 0.58, 2.4]} color={color} roughness={0.4} metalness={0.3} />
    </group>
  );
}

// ── Main Export ───────────────────────────────────────────────────────────
export function CortanaMall() {
  const mallCarColors = ['#1e2840', '#2a1820', '#1a2a1a', '#1e1e28', '#201820', '#282018', '#1a1e28', '#221a1a', '#1e2a20', '#281e18', '#1a1a2a', '#2a2018'];

  return (
    <group>
      {/* ══ Parking lot base ═════════════════════════════════════════════ */}
      <mesh position={[160, 0.005, 120]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[140, 50]} />
        <meshStandardMaterial color={PARKING} roughness={0.7} metalness={0.1} />
      </mesh>
      {/* Parking lot lines (rows) */}
      {Array.from({ length: 14 }, (_, i) => (
        <mesh key={i} position={[95 + i * 9.5, 0.016, 120]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.12, 48]} />
          <meshStandardMaterial color="#ffffff" roughness={0.6} transparent opacity={0.25} />
        </mesh>
      ))}
      {/* Parking lot access road (internal ring) */}
      <mesh position={[160, 0.008, 108]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[140, 12]} />
        <meshStandardMaterial color={ASPHALT} roughness={0.6} metalness={0.18} />
      </mesh>

      {/* ══ Mall base ground ═════════════════════════════════════════════ */}
      <mesh position={[160, 0.005, 162]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[140, 90]} />
        <meshStandardMaterial color={CONCRETE} roughness={0.85} />
      </mesh>

      {/* ══ Access road from Downtown (connects at x=90, z=+145) ════════ */}
      <mesh position={[90, 0.005, 75]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[14, 70]} />
        <meshStandardMaterial color={ASPHALT} roughness={0.6} metalness={0.2} />
      </mesh>
      {/* Sidewalk strips flanking access road */}
      <mesh position={[82.5, 0.022, 75]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[2.8, 68]} />
        <meshStandardMaterial color={SIDEWALK} roughness={0.92} />
      </mesh>
      <mesh position={[97.5, 0.022, 75]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[2.8, 68]} />
        <meshStandardMaterial color={SIDEWALK} roughness={0.92} />
      </mesh>

      {/* ══ Anchor stores ════════════════════════════════════════════════ */}
      {/* Anchor A — Dept store (north anchor) */}
      <AnchorStore x={110} z={162} rot={Math.PI} name="CORTANA DEPT" color="#1e1a28" accentColor="#ffd700" />
      {/* Anchor B — Mega Mart (east anchor, rot=PI/2 so front faces west) */}
      <AnchorStore x={185} z={148} rot={Math.PI / 2} name="MEGA MART" color="#1a1e18" accentColor="#ff4400" />
      {/* Anchor C — Arcade Zone (east anchor south) */}
      <AnchorStore x={185} z={178} rot={Math.PI / 2} name="ARCADE ZONE" color="#0e0e1a" accentColor="#00f0d0" />

      {/* ══ Mall corridors ═══════════════════════════════════════════════ */}
      {/* Main corridor E-W connecting anchors (centered at x=148, z=163) */}
      <MallCorridor x={148} z={163} len={38} axis="x" />
      {/* Short N-S corridor on east end (connecting B to C) */}
      <MallCorridor x={172} z={163} len={30} axis="z" />

      {/* ══ Inline stores — Row A (south-facing, z=137) ════════════════ */}
      <InlineStore x={122} z={137} rot={Math.PI} name="GOLD CHAIN JEWELS"   accentColor="#ffd700" color="#1a1830" />
      <InlineStore x={133} z={137} rot={Math.PI} name="TRAP KICKS"           accentColor="#ff4400" color="#181e14" />
      <InlineStore x={144} z={137} rot={Math.PI} name="PHONE ACCESSORIES"    accentColor="#00f0d0" color="#141018" />
      <InlineStore x={155} z={137} rot={Math.PI} name="VIBE CUTS"            accentColor="#f000b8" color="#1e1614" />

      {/* ══ Inline stores — Row B (north-facing, z=153) ════════════════ */}
      <InlineStore x={122} z={153} name="NBA MERCH STORE"  accentColor="#ffd700" color="#181422" />
      <InlineStore x={133} z={153} name="SNEAKER LAB"      accentColor="#00f0d0" color="#181e14" />
      <InlineStore x={144} z={153} name="BEAUTY SUPPLY"    accentColor="#f000b8" color="#141018" />
      <InlineStore x={155} z={153} name="CORTANA MUSIC"    accentColor="#4488ff" color="#0e1020" />

      {/* ══ Food court building (center, between corridors) ════════════ */}
      <group position={[148, 0, 145]}>
        <mesh position={[0, 3.0, 0]}>
          <boxGeometry args={[18, 6, 12]} />
          <meshStandardMaterial color="#1a1820" roughness={0.88} />
        </mesh>
        {/* Skylights */}
        <mesh position={[0, 6.06, 0]}>
          <boxGeometry args={[14, 0.12, 8]} />
          <meshStandardMaterial color="#ffe8cc" emissive={new THREE.Color('#ffe8cc')} emissiveIntensity={0.6} roughness={0.3} transparent opacity={0.7} />
        </mesh>
        {/* "FOOD COURT" emissive sign */}
        <mesh position={[0, 5.2, 6.08]}>
          <boxGeometry args={[12, 0.9, 0.1]} />
          <meshStandardMaterial color="#ffaa00" emissive={new THREE.Color('#ffaa00')} emissiveIntensity={1.6} roughness={0.2} />
        </mesh>
        <RigidBody type="fixed">
          <mesh position={[0, 3.0, 0]} visible={false}>
            <boxGeometry args={[18, 6, 12]} />
            <meshBasicMaterial />
          </mesh>
        </RigidBody>
      </group>

      {/* ══ Parked cars in lot ════════════════════════════════════════════ */}
      {[0,1,2,3,4,5,6,7,8,9,10,11].map(i => (
        <MallCar
          key={i}
          x={98 + (i % 6) * 12}
          z={113 + Math.floor(i / 6) * 8}
          rot={Math.floor(i / 6) === 0 ? 0 : Math.PI}
          color={mallCarColors[i]}
        />
      ))}

      {/* ══ Mall entrance sign / billboard ═══════════════════════════════ */}
      <group position={[90, 0, 102]}>
        <mesh position={[-3.5, 5.5, 0]}>
          <cylinderGeometry args={[0.14, 0.17, 11, 7]} />
          <meshStandardMaterial color="#2a2828" roughness={0.85} />
        </mesh>
        <mesh position={[3.5, 5.5, 0]}>
          <cylinderGeometry args={[0.14, 0.17, 11, 7]} />
          <meshStandardMaterial color="#2a2828" roughness={0.85} />
        </mesh>
        <mesh position={[0, 10.5, 0]}>
          <boxGeometry args={[10, 2.8, 0.22]} />
          <meshStandardMaterial color="#0e0e16" roughness={0.7} />
        </mesh>
        <mesh position={[0, 10.5, 0.12]}>
          <boxGeometry args={[9.6, 1.1, 0.06]} />
          <meshStandardMaterial color="#ffd700" emissive={new THREE.Color('#ffd700')} emissiveIntensity={1.2} roughness={0.3} />
        </mesh>
      </group>

      {/* ══ Mall lamp posts ══════════════════════════════════════════════ */}
      {([102, 120, 140, 160, 180] as number[]).map(lx => (
        <group key={`mall-lamp-${lx}`} position={[lx, 0, 115]}>
          <mesh position={[0, 4, 0]}>
            <cylinderGeometry args={[0.07, 0.1, 8, 6]} />
            <meshStandardMaterial color="#2a2828" roughness={0.8} />
          </mesh>
          <mesh position={[0, 8.3, 0]}>
            <sphereGeometry args={[0.25, 8, 8]} />
            <meshBasicMaterial color="#ffe8bb" />
          </mesh>
        </group>
      ))}

      {/* ══ Food court accent light (budget allocation #1) ════════════════ */}
      <pointLight position={[148, 9, 148]} color="#ffd700" intensity={18} distance={55} decay={1.8} />

    </group>
  );
}
