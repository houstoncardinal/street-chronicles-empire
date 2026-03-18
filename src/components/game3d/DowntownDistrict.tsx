/**
 * DowntownDistrict.tsx — Commercial/office district (x = +90 to +240, z = -80 to +80)
 * Office towers with emissive accent strips, retail storefronts, parking garage.
 */
import { RigidBody } from '@react-three/rapier';
import * as THREE from 'three';

const ASPHALT  = '#252530';
const SIDEWALK = '#8a7460';
const CONCRETE = '#3a3a40';

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

// ── Office Tower ──────────────────────────────────────────────────────────
function OfficeTower({ x, z, height, width, color, accentColor }: {
  x: number; z: number; height: number; width: number;
  color: string; accentColor: string;
}) {
  // Window rows — emissive horizontal strips at regular intervals
  const windowRows: number[] = [];
  for (let y = 4; y < height - 1; y += 3.5) windowRows.push(y);

  return (
    <group position={[x, 0, z]}>
      {/* Core body */}
      <mesh position={[0, height / 2, 0]}>
        <boxGeometry args={[width, height, width]} />
        <meshStandardMaterial color={color} roughness={0.72} metalness={0.18} />
      </mesh>
      {/* Window strips */}
      {windowRows.map(y => (
        <mesh key={y} position={[0, y, width / 2 + 0.02]}>
          <boxGeometry args={[width - 0.4, 1.4, 0.06]} />
          <meshStandardMaterial color={accentColor} emissive={new THREE.Color(accentColor)} emissiveIntensity={0.55} roughness={0.3} transparent opacity={0.85} />
        </mesh>
      ))}
      {/* Window strips back */}
      {windowRows.map(y => (
        <mesh key={`b${y}`} position={[0, y, -(width / 2 + 0.02)]}>
          <boxGeometry args={[width - 0.4, 1.4, 0.06]} />
          <meshStandardMaterial color={accentColor} emissive={new THREE.Color(accentColor)} emissiveIntensity={0.55} roughness={0.3} transparent opacity={0.85} />
        </mesh>
      ))}
      {/* Rooftop emissive parapet */}
      <mesh position={[0, height + 0.22, 0]}>
        <boxGeometry args={[width + 0.4, 0.44, width + 0.4]} />
        <meshStandardMaterial color={accentColor} emissive={new THREE.Color(accentColor)} emissiveIntensity={1.4} roughness={0.2} />
      </mesh>
      {/* Rooftop antenna */}
      <mesh position={[0, height + 2.0, 0]}>
        <cylinderGeometry args={[0.05, 0.05, 3.2, 5]} />
        <meshStandardMaterial color={CONCRETE} roughness={0.8} />
      </mesh>
      {/* Blinking antenna light */}
      <mesh position={[0, height + 3.7, 0]}>
        <sphereGeometry args={[0.09, 5, 5]} />
        <meshBasicMaterial color="#ff2020" />
      </mesh>
      {/* Ground-floor lobby facade */}
      <mesh position={[0, 1.8, width / 2 + 0.05]}>
        <boxGeometry args={[width - 0.2, 3.2, 0.1]} />
        <meshStandardMaterial color="#0a1a28" roughness={0.12} metalness={0.4} transparent opacity={0.7} />
      </mesh>
      {/* Collider */}
      <RigidBody type="fixed">
        <mesh position={[0, height / 2, 0]} visible={false}>
          <boxGeometry args={[width, height, width]} />
          <meshBasicMaterial />
        </mesh>
      </RigidBody>
    </group>
  );
}

// ── Retail Strip ─────────────────────────────────────────────────────────
function RetailStrip({ x, z, len, name, accentColor = '#00f0d0' }: {
  x: number; z: number; len: number; name: string; accentColor?: string;
}) {
  return (
    <group position={[x, 0, z]}>
      {/* Body */}
      <mesh position={[0, 1.75, 0]}>
        <boxGeometry args={[len, 3.5, 8]} />
        <meshStandardMaterial color="#181a24" roughness={0.88} />
      </mesh>
      {/* Parapet */}
      <mesh position={[0, 3.72, 0]}>
        <boxGeometry args={[len + 0.2, 0.48, 8.2]} />
        <meshStandardMaterial color="#202230" roughness={0.86} />
      </mesh>
      {/* Emissive sign strip */}
      <mesh position={[0, 3.0, 4.05]}>
        <boxGeometry args={[len - 0.5, 0.65, 0.08]} />
        <meshStandardMaterial color={accentColor} emissive={new THREE.Color(accentColor)} emissiveIntensity={1.5} roughness={0.2} />
      </mesh>
      {/* Storefront windows */}
      {([-len / 3, 0, len / 3] as number[]).map((wx, i) => (
        <mesh key={i} position={[wx, 1.6, 4.05]}>
          <boxGeometry args={[len / 4.5, 2.0, 0.07]} />
          <meshStandardMaterial color="#0a1a28" roughness={0.1} metalness={0.3} transparent opacity={0.55} />
        </mesh>
      ))}
      {/* Awning */}
      <mesh position={[0, 2.7, 4.6]} rotation={[-0.25, 0, 0]}>
        <boxGeometry args={[len, 0.09, 1.2]} />
        <meshStandardMaterial color={accentColor} roughness={0.7} />
      </mesh>
      {/* Collider */}
      <RigidBody type="fixed">
        <mesh position={[0, 1.75, 0]} visible={false}>
          <boxGeometry args={[len, 3.5, 8]} />
          <meshBasicMaterial />
        </mesh>
      </RigidBody>
    </group>
  );
}

// ── Parking Structure ─────────────────────────────────────────────────────
function ParkingStructure({ x, z }: { x: number; z: number }) {
  return (
    <group position={[x, 0, z]}>
      {/* Deck 1 */}
      <mesh position={[0, 1.5, 0]}>
        <boxGeometry args={[28, 0.4, 18]} />
        <meshStandardMaterial color={CONCRETE} roughness={0.85} />
      </mesh>
      {/* Deck 2 */}
      <mesh position={[0, 4.5, 0]}>
        <boxGeometry args={[28, 0.4, 18]} />
        <meshStandardMaterial color={CONCRETE} roughness={0.85} />
      </mesh>
      {/* Deck 3 */}
      <mesh position={[0, 7.5, 0]}>
        <boxGeometry args={[28, 0.4, 18]} />
        <meshStandardMaterial color={CONCRETE} roughness={0.85} />
      </mesh>
      {/* Corner pillars */}
      {([-13, 13] as number[]).flatMap(px => ([-8, 0, 8] as number[]).map(pz => (
        <mesh key={`${px}-${pz}`} position={[px, 4.5, pz]}>
          <boxGeometry args={[0.5, 9, 0.5]} />
          <meshStandardMaterial color="#2e2e36" roughness={0.88} />
        </mesh>
      )))}
      {/* Low parapets on each deck (front/back) */}
      <Box pos={[0, 2.1, -9.1]} size={[28, 0.8, 0.3]} color="#323240" />
      <Box pos={[0, 2.1, 9.1]}  size={[28, 0.8, 0.3]} color="#323240" />
      <Box pos={[0, 5.1, -9.1]} size={[28, 0.8, 0.3]} color="#323240" />
      <Box pos={[0, 5.1, 9.1]}  size={[28, 0.8, 0.3]} color="#323240" />
      {/* Emissive "P" sign */}
      <mesh position={[0, 8.2, 9.2]}>
        <boxGeometry args={[3.5, 1.2, 0.1]} />
        <meshStandardMaterial color="#4488ff" emissive={new THREE.Color('#4488ff')} emissiveIntensity={1.4} roughness={0.2} />
      </mesh>
      {/* Collider */}
      <RigidBody type="fixed">
        <mesh position={[0, 4.5, 0]} visible={false}>
          <boxGeometry args={[28, 9, 18]} />
          <meshBasicMaterial />
        </mesh>
      </RigidBody>
    </group>
  );
}

// ── Parked Car ────────────────────────────────────────────────────────────
function DTCar({ x, z, rot = 0, color = '#1a2235' }: {
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
export function DowntownDistrict() {
  return (
    <group>
      {/* ══ Downtown boulevard (N-S road at x=115) ════════════════════ */}
      <mesh position={[115, 0.005, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[16, 160]} />
        <meshStandardMaterial color={ASPHALT} roughness={0.58} metalness={0.25} />
      </mesh>
      {/* Sidewalks either side of blvd */}
      <mesh position={[106.5, 0.022, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[3.0, 155]} />
        <meshStandardMaterial color={SIDEWALK} roughness={0.93} />
      </mesh>
      <mesh position={[123.5, 0.022, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[3.0, 155]} />
        <meshStandardMaterial color={SIDEWALK} roughness={0.93} />
      </mesh>
      {/* Center lane divider */}
      <mesh position={[115, 0.026, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.18, 155]} />
        <meshStandardMaterial color="#ccaa00" roughness={0.6} transparent opacity={0.7} />
      </mesh>

      {/* ══ E-W cross street at z=0 ════════════════════════════════════ */}
      <mesh position={[165, 0.005, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[110, 14]} />
        <meshStandardMaterial color={ASPHALT} roughness={0.58} metalness={0.25} />
      </mesh>
      {/* E-W cross at z=-45 */}
      <mesh position={[165, 0.005, -45]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[110, 12]} />
        <meshStandardMaterial color={ASPHALT} roughness={0.55} metalness={0.2} />
      </mesh>
      {/* E-W cross at z=+45 */}
      <mesh position={[165, 0.005, 45]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[110, 12]} />
        <meshStandardMaterial color={ASPHALT} roughness={0.55} metalness={0.2} />
      </mesh>

      {/* ══ Office Towers ════════════════════════════════════════════════ */}
      <OfficeTower x={140} z={-32} height={28} width={12} color="#1a1c2e" accentColor="#00f0d0" />
      <OfficeTower x={162} z={-12} height={38} width={14} color="#0e1018" accentColor="#f000b8" />
      <OfficeTower x={150} z={22}  height={22} width={10} color="#181a28" accentColor="#4488ff" />
      <OfficeTower x={176} z={-42} height={32} width={11} color="#12141e" accentColor="#ffd700" />
      <OfficeTower x={196} z={5}   height={44} width={16} color="#0c0e16" accentColor="#00f0d0" />
      <OfficeTower x={220} z={-22} height={26} width={12} color="#16181f" accentColor="#ff4400" />
      <OfficeTower x={210} z={38}  height={36} width={13} color="#0e1020" accentColor="#f000b8" />

      {/* ══ Retail Strips (at x=100, street-facing) ════════════════════ */}
      <RetailStrip x={100} z={-40} len={22} name="CANAL ST MARKET"  accentColor="#00f0d0" />
      <RetailStrip x={100} z={-10} len={18} name="DOWNTOWN PLAZA"   accentColor="#f000b8" />
      <RetailStrip x={100} z={25}  len={20} name="BATON ROUGE ROW"  accentColor="#ffaa00" />

      {/* ══ Parking Structure ════════════════════════════════════════════ */}
      <ParkingStructure x={130} z={55} />

      {/* ══ Parked cars along blvd ════════════════════════════════════ */}
      <DTCar x={109} z={-30} color="#1e2840" />
      <DTCar x={109} z={-15} rot={Math.PI} color="#2a1820" />
      <DTCar x={109} z={10}  color="#1a2a1a" />
      <DTCar x={109} z={30}  rot={Math.PI} color="#1e1e28" />
      <DTCar x={121} z={-35} color="#28201a" />
      <DTCar x={121} z={20}  rot={Math.PI} color="#1e2018" />

      {/* ══ Street lamps on blvd ════════════════════════════════════════ */}
      {([-60, -40, -20, 0, 20, 40, 60] as number[]).map(lz => (
        <group key={`lamp-${lz}`} position={[108, 0, lz]}>
          <mesh position={[0, 3, 0]}>
            <cylinderGeometry args={[0.06, 0.1, 6, 6]} />
            <meshStandardMaterial color="#2a2828" roughness={0.8} />
          </mesh>
          <mesh position={[0.4, 5.6, 0]}>
            <cylinderGeometry args={[0.04, 0.04, 0.9, 5]} />
            <meshStandardMaterial color="#2a2828" roughness={0.8} />
          </mesh>
          <mesh position={[0.55, 5.85, 0]}>
            <sphereGeometry args={[0.14, 7, 7]} />
            <meshBasicMaterial color="#ffe8bb" />
          </mesh>
        </group>
      ))}

      {/* ══ Downtown accent light (single budget point light) ═══════════ */}
      <pointLight position={[168, 18, 0]} color="#00f0d0" intensity={22} distance={70} decay={1.8} />

      {/* ══ Street signs ════════════════════════════════════════════════ */}
      <mesh position={[93, 2.0, -1]}>
        <cylinderGeometry args={[0.04, 0.04, 4, 5]} />
        <meshStandardMaterial color="#3a3838" roughness={0.8} />
      </mesh>
      <mesh position={[93, 3.8, -1]}>
        <boxGeometry args={[3.2, 0.5, 0.08]} />
        <meshStandardMaterial color="#1a3a1a" roughness={0.7} />
      </mesh>

      {/* ══ East boundary wall (x=+242) ════════════════════════════════ */}
      <RigidBody type="fixed">
        <mesh position={[242, 2.5, 0]} visible={false}>
          <boxGeometry args={[0.4, 5, 160]} />
          <meshBasicMaterial />
        </mesh>
      </RigidBody>

    </group>
  );
}
