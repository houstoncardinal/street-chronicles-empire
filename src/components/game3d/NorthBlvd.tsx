/**
 * NorthBlvd.tsx — Government Street block (z = -75 to -120)
 * Commercial row on the north side, residential on the south side.
 */
import { RigidBody } from '@react-three/rapier';
import * as THREE from 'three';

const ASPHALT   = '#252530';
const SIDEWALK  = '#8a7460';
const GRASS     = '#1e2e14';
const WOOD_DARK = '#2a1e0e';

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

// ── Row Shop ──────────────────────────────────────────────────────────────
// 1-story commercial storefront (6 w × 4 h × 5 d)
function RowShop({ x, z, rot = 0, name, color = '#1e1c28', accentColor = '#00f0d0' }: {
  x: number; z: number; rot?: number; name: string; color?: string; accentColor?: string;
}) {
  return (
    <group position={[x, 0, z]} rotation={[0, rot, 0]}>
      {/* Body */}
      <Box pos={[0, 2.0, 0]} size={[6, 4, 5]} color={color} roughness={0.88} />
      {/* Flat parapet */}
      <Box pos={[0, 4.22, 0]} size={[6.2, 0.44, 5.2]} color={color} roughness={0.85} />
      {/* Storefront window */}
      <mesh position={[0, 1.8, 2.51]}>
        <boxGeometry args={[4.2, 1.8, 0.07]} />
        <meshStandardMaterial color="#0a1a28" roughness={0.1} metalness={0.3} transparent opacity={0.6} />
      </mesh>
      {/* Emissive sign strip */}
      <mesh position={[0, 3.45, 2.55]}>
        <boxGeometry args={[5.6, 0.55, 0.08]} />
        <meshStandardMaterial color={accentColor} emissive={new THREE.Color(accentColor)} emissiveIntensity={1.2} roughness={0.2} />
      </mesh>
      {/* Door */}
      <Box pos={[0, 1.1, 2.52]} size={[1.0, 2.0, 0.07]} color={WOOD_DARK} />
      {/* Awning */}
      <mesh position={[0, 2.85, 2.9]} rotation={[-0.3, 0, 0]}>
        <boxGeometry args={[5.8, 0.08, 1.1]} />
        <meshStandardMaterial color={accentColor} roughness={0.7} />
      </mesh>
      {/* Collider */}
      <RigidBody type="fixed">
        <mesh position={[0, 2.0, 0]} visible={false}>
          <boxGeometry args={[6, 4, 5]} />
          <meshBasicMaterial />
        </mesh>
      </RigidBody>
    </group>
  );
}

// ── Simple Residential House ───────────────────────────────────────────────
function NorthHouse({ x, z, rot = 0, wallColor = '#c8bca0', roofColor = '#1c1408' }: {
  x: number; z: number; rot?: number; wallColor?: string; roofColor?: string;
}) {
  return (
    <group position={[x, 0, z]} rotation={[0, rot, 0]}>
      {/* Body */}
      <Box pos={[0, 1.5, 0]} size={[7, 3, 5.5]} color={wallColor} roughness={0.9} />
      {/* Porch */}
      <Box pos={[0, 0.1, 3.1]} size={[5, 0.12, 1.4]} color={WOOD_DARK} roughness={0.92} />
      {/* Roof (gable) */}
      <mesh position={[0, 3.06, 0]}>
        <boxGeometry args={[7.4, 0.12, 5.9]} />
        <meshStandardMaterial color={roofColor} roughness={0.95} />
      </mesh>
      <mesh position={[0, 3.5, -2.6]} rotation={[-0.55, 0, 0]}>
        <boxGeometry args={[7.38, 0.12, 3.1]} />
        <meshStandardMaterial color={roofColor} roughness={0.95} />
      </mesh>
      <mesh position={[0, 3.5, 2.6]} rotation={[0.55, 0, 0]}>
        <boxGeometry args={[7.38, 0.12, 3.1]} />
        <meshStandardMaterial color={roofColor} roughness={0.95} />
      </mesh>
      {/* Door */}
      <Box pos={[0, 1.0, 2.76]} size={[0.9, 1.9, 0.07]} color={WOOD_DARK} />
      {/* Window */}
      <mesh position={[-2.0, 1.5, 2.76]}>
        <boxGeometry args={[1.2, 1.0, 0.06]} />
        <meshStandardMaterial color="#ffcc44" transparent opacity={0.55} />
      </mesh>
      <mesh position={[2.0, 1.5, 2.76]}>
        <boxGeometry args={[1.2, 1.0, 0.06]} />
        <meshStandardMaterial color="#ffcc44" transparent opacity={0.55} />
      </mesh>
      {/* Porch globe */}
      <mesh position={[0, 2.8, 2.85]}>
        <sphereGeometry args={[0.07, 6, 6]} />
        <meshBasicMaterial color="#ffe8aa" />
      </mesh>
      {/* Collider */}
      <RigidBody type="fixed">
        <mesh position={[0, 1.5, 0]} visible={false}>
          <boxGeometry args={[7.3, 3.2, 7.0]} />
          <meshBasicMaterial />
        </mesh>
      </RigidBody>
    </group>
  );
}

// ── Street Lamp ───────────────────────────────────────────────────────────
function GovtLamp({ x, z }: { x: number; z: number }) {
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, 3, 0]}>
        <cylinderGeometry args={[0.06, 0.1, 6, 6]} />
        <meshStandardMaterial color="#2a2828" roughness={0.8} />
      </mesh>
      <mesh position={[0.4, 5.5, 0]}>
        <cylinderGeometry args={[0.04, 0.04, 1.0, 5]} />
        <meshStandardMaterial color="#2a2828" roughness={0.8} />
      </mesh>
      <mesh position={[0.55, 5.8, 0]}>
        <sphereGeometry args={[0.14, 7, 7]} />
        <meshBasicMaterial color="#ffe8bb" />
      </mesh>
    </group>
  );
}

// ── Parked Car ────────────────────────────────────────────────────────────
function ParkedCar({ x, z, rot = 0, color = '#1a2235' }: {
  x: number; z: number; rot?: number; color?: string;
}) {
  return (
    <group position={[x, 0, z]} rotation={[0, rot, 0]}>
      <Box pos={[0, 0.48, 0]}   size={[2.0, 0.68, 4.4]} color={color} roughness={0.4} metalness={0.4} />
      <Box pos={[0, 0.96, 0.2]} size={[1.8, 0.58, 2.4]} color={color} roughness={0.4} metalness={0.3} />
      <mesh position={[0, 0.96, 0.2]}>
        <boxGeometry args={[1.78, 0.55, 2.38]} />
        <meshStandardMaterial color="#0a1a28" roughness={0.1} metalness={0.3} transparent opacity={0.5} />
      </mesh>
    </group>
  );
}

// ── Main Export ───────────────────────────────────────────────────────────
export function NorthBlvd() {
  const shopAccents = ['#00f0d0', '#f000b8', '#ffaa00', '#4488ff', '#ff4400', '#00f0d0'];
  const shopColors  = ['#1a1828', '#1e1620', '#181e14', '#141018', '#1e1614', '#181422'];
  const shopNames   = ['GOVT ST MARKET', 'SOUL FOOD', 'PAWN SHOP', 'LAUNDROMAT', 'CORNER CUTS', 'GOVT LIQUORS'];

  const northHouseColors = ['#c8bca0', '#b8c0b0', '#c4b8a8', '#bcc4b4'];

  return (
    <group>
      {/* ══ Government Street road (E-W, z=-96) ══════════════════════════ */}
      <mesh position={[0, 0.005, -96]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[160, 18]} />
        <meshStandardMaterial color={ASPHALT} roughness={0.58} metalness={0.25} />
      </mesh>
      {/* Center line */}
      <mesh position={[0, 0.026, -96]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[155, 0.18]} />
        <meshStandardMaterial color="#ccaa00" roughness={0.6} transparent opacity={0.7} />
      </mesh>

      {/* ══ Sidewalks ════════════════════════════════════════════════════ */}
      {/* South sidewalk of Govt St */}
      <mesh position={[0, 0.022, -87.2]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[155, 2.6]} />
        <meshStandardMaterial color={SIDEWALK} roughness={0.93} />
      </mesh>
      {/* North sidewalk of Govt St */}
      <mesh position={[0, 0.022, -104.8]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[155, 2.6]} />
        <meshStandardMaterial color={SIDEWALK} roughness={0.93} />
      </mesh>

      {/* ══ Grass yards ══════════════════════════════════════════════════ */}
      {/* Between Chippewa and Govt St (north of existing Chippewa) */}
      <mesh position={[0, 0.01, -56]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[155, 22]} />
        <meshStandardMaterial color={GRASS} roughness={0.97} />
      </mesh>
      {/* North of Govt St */}
      <mesh position={[0, 0.01, -112]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[155, 18]} />
        <meshStandardMaterial color={GRASS} roughness={0.97} />
      </mesh>

      {/* ══ N-S connecting roads ══════════════════════════════════════════ */}
      {/* West connector at x=-60 */}
      <mesh position={[-60, 0.006, -65]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[12, 60]} />
        <meshStandardMaterial color={ASPHALT} roughness={0.55} metalness={0.2} />
      </mesh>
      {/* East connector at x=+60 */}
      <mesh position={[60, 0.006, -65]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[12, 60]} />
        <meshStandardMaterial color={ASPHALT} roughness={0.55} metalness={0.2} />
      </mesh>

      {/* ══ Commercial Row — North side (z=-112) ══════════════════════════ */}
      {([-55, -42, -29, -16, -3, 10] as number[]).map((bx, i) => (
        <RowShop
          key={`shop-${bx}`}
          x={bx} z={-112} rot={Math.PI}
          name={shopNames[i]}
          color={shopColors[i]}
          accentColor={shopAccents[i]}
        />
      ))}

      {/* ══ Residential row — South side (z=-80) ═════════════════════════ */}
      {([-50, -32, -12, 8] as number[]).map((bx, i) => (
        <NorthHouse
          key={`house-${bx}`}
          x={bx} z={-80}
          rot={0}
          wallColor={northHouseColors[i]}
        />
      ))}

      {/* ══ Street lamps ═══════════════════════════════════════════════ */}
      {([-52, -34, -16, 0, 16, 34, 52] as number[]).map(lx => (
        <GovtLamp key={`lamp-${lx}`} x={lx} z={-92} />
      ))}
      {([-52, -34, -16, 0, 16, 34, 52] as number[]).map(lx => (
        <GovtLamp key={`lamp2-${lx}`} x={lx} z={-100} />
      ))}

      {/* ══ Parked cars ════════════════════════════════════════════════ */}
      <ParkedCar x={-38} z={-91} color="#1e2840" />
      <ParkedCar x={-18} z={-91} rot={Math.PI} color="#2a1820" />
      <ParkedCar x={5}   z={-100} color="#1a2a1a" />
      <ParkedCar x={28}  z={-100} rot={Math.PI} color="#1e1e28" />
      <ParkedCar x={-55} z={-100} color="#201820" />

      {/* ══ Street signs ════════════════════════════════════════════════ */}
      {/* Sign post */}
      <mesh position={[-2, 2.0, -88]}>
        <cylinderGeometry args={[0.04, 0.04, 4, 5]} />
        <meshStandardMaterial color="#3a3838" roughness={0.8} />
      </mesh>
      <mesh position={[-2, 3.8, -88]}>
        <boxGeometry args={[2.8, 0.5, 0.08]} />
        <meshStandardMaterial color="#1a3a1a" roughness={0.7} />
      </mesh>

      {/* ══ North-block billboard ════════════════════════════════════════ */}
      <group position={[30, 0, -118]}>
        {/* Poles */}
        <mesh position={[-4.5, 5.5, 0]}>
          <cylinderGeometry args={[0.14, 0.16, 11, 7]} />
          <meshStandardMaterial color="#2a2828" roughness={0.85} />
        </mesh>
        <mesh position={[4.5, 5.5, 0]}>
          <cylinderGeometry args={[0.14, 0.16, 11, 7]} />
          <meshStandardMaterial color="#2a2828" roughness={0.85} />
        </mesh>
        {/* Board */}
        <mesh position={[0, 10.5, 0]}>
          <boxGeometry args={[10, 2.8, 0.22]} />
          <meshStandardMaterial color="#0e0e16" roughness={0.7} />
        </mesh>
        {/* Emissive text strip */}
        <mesh position={[0, 10.5, 0.12]}>
          <boxGeometry args={[9.6, 1.0, 0.06]} />
          <meshStandardMaterial color="#ffd700" emissive={new THREE.Color('#ffd700')} emissiveIntensity={1.0} roughness={0.3} />
        </mesh>
      </group>

      {/* ══ Utility poles ════════════════════════════════════════════════ */}
      {([-48, -16, 16, 48] as number[]).map(px => (
        <group key={`pole-${px}`} position={[px, 0, -96]}>
          <mesh position={[0, 4.5, 0]}>
            <cylinderGeometry args={[0.07, 0.1, 9, 6]} />
            <meshStandardMaterial color="#3a3020" roughness={0.9} />
          </mesh>
          <mesh position={[0, 8.5, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.04, 0.04, 2.6, 5]} />
            <meshStandardMaterial color="#3a3020" roughness={0.9} />
          </mesh>
        </group>
      ))}

    </group>
  );
}
