/**
 * WestSuburbs.tsx — West suburban residential district (x = -90 to -200, z = -70 to +70)
 * Larger houses with garages, a small park, gas station, corner shop.
 */
import { RigidBody } from '@react-three/rapier';
import * as THREE from 'three';

const ASPHALT  = '#252530';
const SIDEWALK = '#8a7460';
const GRASS    = '#1e2e14';
const GRASS2   = '#1a2c10';
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

// ── Suburban House ────────────────────────────────────────────────────────
// Larger than shotgun: 8×3.5×7 body + 3.5×3×6 attached garage
function SuburbanHouse({ x, z, rot = 0, wallColor = '#c8bca0', roofColor = '#1c1408' }: {
  x: number; z: number; rot?: number; wallColor?: string; roofColor?: string;
}) {
  return (
    <group position={[x, 0, z]} rotation={[0, rot, 0]}>
      {/* Foundation */}
      <Box pos={[0, 0.18, 0]} size={[8.4, 0.36, 7.4]} color="#6a5a4a" roughness={0.96} />
      {/* Main body */}
      <Box pos={[0, 1.93, 0]} size={[8, 3.5, 7]} color={wallColor} roughness={0.88} />
      {/* Attached garage */}
      <Box pos={[4.5, 1.7, 0.5]} size={[3.5, 3.0, 6]} color={wallColor} roughness={0.90} />
      {/* Garage door */}
      <Box pos={[4.5, 1.45, 3.51]} size={[3.0, 2.5, 0.08]} color="#1a1a22" roughness={0.85} />
      {/* Garage door panels */}
      <Box pos={[4.5, 2.0, 3.56]}  size={[2.8, 0.12, 0.04]} color="#282830" roughness={0.8} />
      <Box pos={[4.5, 1.55, 3.56]} size={[2.8, 0.12, 0.04]} color="#282830" roughness={0.8} />

      {/* Hip roof — main house */}
      <mesh position={[0, 3.75, 0]}>
        <boxGeometry args={[8.4, 0.15, 7.4]} />
        <meshStandardMaterial color={roofColor} roughness={0.95} />
      </mesh>
      {/* Hip slopes */}
      <mesh position={[0, 4.5, 0]}>
        <coneGeometry args={[5.8, 2.0, 4, 1]} />
        <meshStandardMaterial color={roofColor} roughness={0.95} />
      </mesh>
      {/* Garage roof */}
      <mesh position={[4.5, 3.08, 0.5]}>
        <boxGeometry args={[3.7, 0.15, 6.2]} />
        <meshStandardMaterial color={roofColor} roughness={0.95} />
      </mesh>
      <mesh position={[4.5, 3.7, 0.5]}>
        <coneGeometry args={[2.6, 1.2, 4, 1]} />
        <meshStandardMaterial color={roofColor} roughness={0.95} />
      </mesh>

      {/* Front porch */}
      <Box pos={[0, 0.2, 3.85]} size={[5, 0.12, 1.6]} color={WOOD_DARK} roughness={0.92} />
      {/* Porch columns */}
      {([-1.8, 0, 1.8] as number[]).map((cx, i) => (
        <mesh key={i} position={[cx, 1.2, 4.4]}>
          <cylinderGeometry args={[0.1, 0.1, 2.2, 7]} />
          <meshStandardMaterial color="#ddd0b8" roughness={0.85} />
        </mesh>
      ))}
      {/* Porch roof beam */}
      <Box pos={[0, 2.4, 4.4]} size={[5, 0.12, 0.12]} color="#ddd0b8" />

      {/* Door */}
      <Box pos={[0, 1.15, 3.51]} size={[1.0, 2.1, 0.07]} color={WOOD_DARK} />
      {/* Windows */}
      <mesh position={[-2.4, 2.0, 3.51]}>
        <boxGeometry args={[1.6, 1.3, 0.07]} />
        <meshStandardMaterial color="#ffcc44" transparent opacity={0.5} />
      </mesh>
      <mesh position={[2.4, 2.0, 3.51]}>
        <boxGeometry args={[1.6, 1.3, 0.07]} />
        <meshStandardMaterial color="#ffcc44" transparent opacity={0.5} />
      </mesh>
      {/* Side window */}
      <mesh position={[-4.01, 2.0, 0]}>
        <boxGeometry args={[0.07, 1.3, 1.6]} />
        <meshStandardMaterial color="#ffcc44" transparent opacity={0.5} />
      </mesh>

      {/* Porch globe */}
      <mesh position={[0, 2.62, 4.2]}>
        <sphereGeometry args={[0.08, 6, 6]} />
        <meshBasicMaterial color="#ffe8aa" />
      </mesh>

      {/* Driveway */}
      <mesh position={[4.5, 0.006, 8.0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[3.5, 8]} />
        <meshStandardMaterial color="#2e2e38" roughness={0.85} />
      </mesh>

      {/* Collider — body + garage combined */}
      <RigidBody type="fixed">
        <mesh position={[0, 1.93, 0]} visible={false}>
          <boxGeometry args={[8.3, 3.7, 7.4]} />
          <meshBasicMaterial />
        </mesh>
      </RigidBody>
      <RigidBody type="fixed">
        <mesh position={[4.5, 1.7, 0.5]} visible={false}>
          <boxGeometry args={[3.6, 3.1, 6.2]} />
          <meshBasicMaterial />
        </mesh>
      </RigidBody>
    </group>
  );
}

// ── Simple Tree (cheap, not LiveOak) ─────────────────────────────────────
function SimpleTree({ x, z, scale = 1 }: { x: number; z: number; scale?: number }) {
  return (
    <group position={[x, 0, z]} scale={[scale, scale, scale]}>
      <mesh position={[0, 2.5, 0]}>
        <cylinderGeometry args={[0.18, 0.26, 5, 7]} />
        <meshStandardMaterial color="#3a2a18" roughness={0.95} />
      </mesh>
      <mesh position={[0, 6.2, 0]}>
        <sphereGeometry args={[2.2, 7, 6]} />
        <meshStandardMaterial color="#2a4a18" roughness={0.92} />
      </mesh>
      <mesh position={[1.2, 5.5, 0.8]}>
        <sphereGeometry args={[1.4, 6, 5]} />
        <meshStandardMaterial color="#233c14" roughness={0.92} />
      </mesh>
      <mesh position={[-1.0, 5.2, -0.6]}>
        <sphereGeometry args={[1.3, 6, 5]} />
        <meshStandardMaterial color="#2e4a1a" roughness={0.92} />
      </mesh>
    </group>
  );
}

// ── Gas Station ───────────────────────────────────────────────────────────
function GasStation({ x, z }: { x: number; z: number }) {
  return (
    <group position={[x, 0, z]}>
      {/* Canopy */}
      <mesh position={[0, 4.4, 0]}>
        <boxGeometry args={[12, 0.22, 10]} />
        <meshStandardMaterial color="#ffe8cc" emissive={new THREE.Color('#ffe8cc')} emissiveIntensity={0.7} roughness={0.5} />
      </mesh>
      {/* Canopy supports */}
      {([-4.5, 4.5] as number[]).map((cx, i) => (
        <mesh key={i} position={[cx, 2.2, 0]}>
          <cylinderGeometry args={[0.18, 0.18, 4.4, 6]} />
          <meshStandardMaterial color="#2a2828" roughness={0.85} />
        </mesh>
      ))}
      {/* Pump islands */}
      {([-2.5, 2.5] as number[]).map((cx, i) => (
        <group key={i} position={[cx, 0, 0]}>
          <Box pos={[0, 0.3, 0]} size={[0.7, 0.6, 2.0]} color="#1a1a22" roughness={0.8} />
          <Box pos={[0, 0.85, 0.5]} size={[0.5, 0.5, 0.5]} color="#0a0a12" roughness={0.6} />
          <mesh position={[0, 0.85, 0.5]}>
            <boxGeometry args={[0.48, 0.48, 0.48]} />
            <meshStandardMaterial color="#1a3a2a" emissive={new THREE.Color('#00f0d0')} emissiveIntensity={0.5} roughness={0.3} />
          </mesh>
        </group>
      ))}
      {/* Convenience store building */}
      <mesh position={[0, 2.2, -7.5]}>
        <boxGeometry args={[8, 4.4, 8]} />
        <meshStandardMaterial color="#1e2018" roughness={0.88} />
      </mesh>
      {/* "GAS" sign */}
      <mesh position={[0, 4.2, -3.51]}>
        <boxGeometry args={[5, 0.8, 0.1]} />
        <meshStandardMaterial color="#ff8800" emissive={new THREE.Color('#ff8800')} emissiveIntensity={1.5} roughness={0.2} />
      </mesh>
      {/* Store window */}
      <mesh position={[0, 1.8, -3.51]}>
        <boxGeometry args={[5.5, 2.2, 0.08]} />
        <meshStandardMaterial color="#0a1a28" roughness={0.1} metalness={0.3} transparent opacity={0.6} />
      </mesh>
      {/* Collider: store */}
      <RigidBody type="fixed">
        <mesh position={[0, 2.2, -7.5]} visible={false}>
          <boxGeometry args={[8, 4.4, 8]} />
          <meshBasicMaterial />
        </mesh>
      </RigidBody>
    </group>
  );
}

// ── Corner Shop ───────────────────────────────────────────────────────────
function CornerShop({ x, z }: { x: number; z: number }) {
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, 2.0, 0]}>
        <boxGeometry args={[9, 4, 7]} />
        <meshStandardMaterial color="#1e2018" roughness={0.88} />
      </mesh>
      {/* Sign */}
      <mesh position={[0, 3.6, 3.56]}>
        <boxGeometry args={[7, 0.8, 0.1]} />
        <meshStandardMaterial color="#00f0d0" emissive={new THREE.Color('#00f0d0')} emissiveIntensity={1.4} roughness={0.2} />
      </mesh>
      {/* Window */}
      <mesh position={[0, 1.8, 3.56]}>
        <boxGeometry args={[5.5, 2.0, 0.08]} />
        <meshStandardMaterial color="#0a1a28" roughness={0.1} metalness={0.3} transparent opacity={0.6} />
      </mesh>
      {/* Collider */}
      <RigidBody type="fixed">
        <mesh position={[0, 2.0, 0]} visible={false}>
          <boxGeometry args={[9, 4, 7]} />
          <meshBasicMaterial />
        </mesh>
      </RigidBody>
    </group>
  );
}

// ── Small Park ─────────────────────────────────────────────────────────────
function SmallPark({ x, z }: { x: number; z: number }) {
  return (
    <group position={[x, 0, z]}>
      {/* Grass clearing */}
      <mesh position={[0, 0.012, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[22, 22]} />
        <meshStandardMaterial color={GRASS2} roughness={0.97} />
      </mesh>
      {/* Low fence */}
      {([-11, 11] as number[]).map(fx => (
        <Box key={`fx-${fx}`} pos={[fx, 0.4, 0]} size={[0.12, 0.8, 22.2]} color="#3a3028" roughness={0.9} />
      ))}
      {([-11, 11] as number[]).map(fz => (
        <Box key={`fz-${fz}`} pos={[0, 0.4, fz]} size={[22.2, 0.8, 0.12]} color="#3a3028" roughness={0.9} />
      ))}
      {/* Bench */}
      <Box pos={[4, 0.45, 0]} size={[1.5, 0.12, 0.44]} color="#3a2a1a" roughness={0.9} />
      <Box pos={[4, 0.62, -0.1]} size={[1.5, 0.12, 0.08]} color="#3a2a1a" roughness={0.9} />
      <Box pos={[3.4, 0.26, 0]} size={[0.1, 0.4, 0.44]} color="#3a2a1a" roughness={0.9} />
      <Box pos={[4.6, 0.26, 0]} size={[0.1, 0.4, 0.44]} color="#3a2a1a" roughness={0.9} />
      {/* Path */}
      <mesh position={[0, 0.014, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[2.5, 22]} />
        <meshStandardMaterial color="#5a5040" roughness={0.92} />
      </mesh>
    </group>
  );
}

// ── Main Export ───────────────────────────────────────────────────────────
export function WestSuburbs() {
  const northHouseColors = ['#c8bca0', '#b8c8b0', '#c4b0a8', '#d0c4b0', '#b8bcc0'];
  const southHouseColors = ['#c0b8a4', '#b8c8c0', '#c8c0a8', '#bec4b8', '#c4b8bc'];
  const northRoofColors  = ['#1c1408', '#181c08', '#1e1008', '#14180a', '#181408'];
  const southRoofColors  = ['#181408', '#1c1808', '#141808', '#181c10', '#1a1408'];

  return (
    <group>
      {/* ══ Main west boulevard (E-W at z=0) ═════════════════════════════ */}
      <mesh position={[-145, 0.005, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[110, 12]} />
        <meshStandardMaterial color={ASPHALT} roughness={0.58} metalness={0.22} />
      </mesh>
      {/* Blvd center line */}
      <mesh position={[-145, 0.026, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[108, 0.18]} />
        <meshStandardMaterial color="#ccaa00" roughness={0.6} transparent opacity={0.7} />
      </mesh>
      {/* Blvd sidewalks */}
      <mesh position={[-145, 0.022, -7.8]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[108, 2.6]} />
        <meshStandardMaterial color={SIDEWALK} roughness={0.93} />
      </mesh>
      <mesh position={[-145, 0.022, 7.8]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[108, 2.6]} />
        <meshStandardMaterial color={SIDEWALK} roughness={0.93} />
      </mesh>

      {/* ══ N-S residential side streets ══════════════════════════════════ */}
      {([-105, -140, -175] as number[]).map(sx => (
        <group key={sx}>
          <mesh position={[sx, 0.005, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[8, 140]} />
            <meshStandardMaterial color={ASPHALT} roughness={0.55} metalness={0.2} />
          </mesh>
        </group>
      ))}

      {/* ══ Grass base (covers the whole suburb zone) ═════════════════════ */}
      <mesh position={[-145, 0.008, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[110, 140]} />
        <meshStandardMaterial color={GRASS} roughness={0.97} />
      </mesh>

      {/* ══ North row — 5 houses (z=-32, facing south toward blvd) ════════ */}
      {([-172, -154, -136, -118, -100] as number[]).map((hx, i) => (
        <SuburbanHouse
          key={`nh-${hx}`}
          x={hx} z={-32}
          rot={0}
          wallColor={northHouseColors[i]}
          roofColor={northRoofColors[i]}
        />
      ))}

      {/* ══ South row — 5 houses (z=+32, facing north toward blvd) ═══════ */}
      {([-172, -154, -136, -118, -100] as number[]).map((hx, i) => (
        <SuburbanHouse
          key={`sh-${hx}`}
          x={hx} z={32}
          rot={Math.PI}
          wallColor={southHouseColors[i]}
          roofColor={southRoofColors[i]}
        />
      ))}

      {/* ══ Small park at center ══════════════════════════════════════════ */}
      <SmallPark x={-145} z={0} />

      {/* ══ Gas station (east edge, z=-20) ════════════════════════════════ */}
      <GasStation x={-95} z={-20} />

      {/* ══ Corner shop (east edge, z=+20) ════════════════════════════════ */}
      <CornerShop x={-95} z={20} />

      {/* ══ Trees in yards and along streets ════════════════════════════ */}
      {/* North yard trees */}
      {([-162, -144, -126, -108] as number[]).map(tx => (
        <SimpleTree key={`nt-${tx}`} x={tx} z={-50} scale={0.9 + Math.random() * 0.2} />
      ))}
      {/* South yard trees */}
      {([-160, -142, -124, -106] as number[]).map(tx => (
        <SimpleTree key={`st-${tx}`} x={tx} z={50} scale={0.9 + Math.random() * 0.2} />
      ))}
      {/* Park trees */}
      <SimpleTree x={-156} z={-8} scale={1.1} />
      <SimpleTree x={-134} z={8} scale={1.0} />
      <SimpleTree x={-156} z={8} scale={0.9} />
      <SimpleTree x={-134} z={-8} scale={1.05} />

      {/* ══ Street lamps ══════════════════════════════════════════════════ */}
      {([-170, -152, -134, -116, -98] as number[]).map(lx => (
        <group key={`wl-${lx}`}>
          <mesh position={[lx, 3.0, -8]}>
            <cylinderGeometry args={[0.06, 0.1, 6, 6]} />
            <meshStandardMaterial color="#2a2828" roughness={0.8} />
          </mesh>
          <mesh position={[lx, 5.8, -8.4]}>
            <sphereGeometry args={[0.14, 7, 7]} />
            <meshBasicMaterial color="#ffe8bb" />
          </mesh>
        </group>
      ))}

      {/* ══ West boundary wall (x=-202) ════════════════════════════════ */}
      <RigidBody type="fixed">
        <mesh position={[-202, 2.5, 0]} visible={false}>
          <boxGeometry args={[0.4, 5, 140]} />
          <meshBasicMaterial />
        </mesh>
      </RigidBody>

    </group>
  );
}
