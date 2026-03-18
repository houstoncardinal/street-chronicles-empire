/**
 * Highway110.tsx — I-110 elevated highway (x = +130, y deck = +7, z = -200 to +200)
 * Concrete deck, guardrails, support piers, on-ramps, overhead signs.
 * Entire structure positioned via a parent <group position={[130, 0, 0]}>
 */
import { RigidBody } from '@react-three/rapier';
import * as THREE from 'three';

const CONCRETE = '#303038';
const GUARDRAIL = '#3a3a44';
const ASPHALT   = '#252530';

function Box({ pos, size, color, roughness = 0.82, metalness = 0 }: {
  pos: [number, number, number];
  size: [number, number, number];
  color: string;
  roughness?: number;
  metalness?: number;
}) {
  return (
    <mesh position={pos}>
      <boxGeometry args={size} />
      <meshStandardMaterial color={color} roughness={roughness} metalness={metalness} />
    </mesh>
  );
}

// ── Highway Deck Segment ──────────────────────────────────────────────────
// Each segment: solid slab + two guardrails, each with its own RigidBody
function HighwayDeck({ zFrom, zTo }: { zFrom: number; zTo: number }) {
  const len = zTo - zFrom;
  const mid = (zFrom + zTo) / 2;
  return (
    <group>
      {/* Deck slab */}
      <RigidBody type="fixed">
        <mesh position={[0, 7.0, mid]}>
          <boxGeometry args={[12, 0.5, len]} />
          <meshStandardMaterial color={ASPHALT} roughness={0.7} metalness={0.1} />
        </mesh>
      </RigidBody>
      {/* Left guardrail */}
      <RigidBody type="fixed">
        <mesh position={[-6.15, 7.62, mid]}>
          <boxGeometry args={[0.3, 1.15, len]} />
          <meshStandardMaterial color={GUARDRAIL} roughness={0.75} />
        </mesh>
      </RigidBody>
      {/* Right guardrail */}
      <RigidBody type="fixed">
        <mesh position={[6.15, 7.62, mid]}>
          <boxGeometry args={[0.3, 1.15, len]} />
          <meshStandardMaterial color={GUARDRAIL} roughness={0.75} />
        </mesh>
      </RigidBody>
      {/* Lane markings — center dashed */}
      {Array.from({ length: Math.floor(len / 8) }, (_, i) => (
        <mesh key={i} position={[0, 7.52, zFrom + 4 + i * 8]}>
          <boxGeometry args={[0.18, 0.02, 4.5]} />
          <meshStandardMaterial color="#ccaa00" roughness={0.6} transparent opacity={0.85} />
        </mesh>
      ))}
      {/* Edge stripes */}
      <mesh position={[-4.5, 7.52, mid]}>
        <boxGeometry args={[0.15, 0.02, len]} />
        <meshStandardMaterial color="#ffffff" roughness={0.6} transparent opacity={0.5} />
      </mesh>
      <mesh position={[4.5, 7.52, mid]}>
        <boxGeometry args={[0.15, 0.02, len]} />
        <meshStandardMaterial color="#ffffff" roughness={0.6} transparent opacity={0.5} />
      </mesh>
    </group>
  );
}

// ── Support Pier ──────────────────────────────────────────────────────────
function Pier({ z }: { z: number }) {
  return (
    <group position={[0, 0, z]}>
      {/* Column */}
      <mesh position={[0, 3.6, 0]}>
        <cylinderGeometry args={[0.55, 0.7, 7.2, 8]} />
        <meshStandardMaterial color={CONCRETE} roughness={0.88} />
      </mesh>
      {/* Cap beam */}
      <mesh position={[0, 7.2, 0]}>
        <boxGeometry args={[14, 0.8, 1.4]} />
        <meshStandardMaterial color="#2a2a30" roughness={0.86} />
      </mesh>
    </group>
  );
}

// ── On-Ramp ───────────────────────────────────────────────────────────────
// Ramp angles from ground level to deck height (7m) over ~42 units
function OnRamp({ zCenter, facingSign }: { zCenter: number; facingSign: 1 | -1 }) {
  // Slope angle: atan(7 / 42) ≈ 0.165 rad
  const angle = 0.165 * facingSign;
  const rampLen = 44;
  const rampMidY = 3.5; // midpoint height
  const rampMidZ = zCenter;

  return (
    <group>
      {/* Ramp slab */}
      <RigidBody type="fixed">
        <mesh
          position={[0, rampMidY, rampMidZ]}
          rotation={[-angle, 0, 0]}
        >
          <boxGeometry args={[9, 0.5, rampLen]} />
          <meshStandardMaterial color={ASPHALT} roughness={0.72} metalness={0.1} />
        </mesh>
      </RigidBody>
      {/* Left guard */}
      <mesh position={[-4.65, rampMidY + 0.62, rampMidZ]} rotation={[-angle, 0, 0]}>
        <boxGeometry args={[0.28, 1.1, rampLen]} />
        <meshStandardMaterial color={GUARDRAIL} roughness={0.75} />
      </mesh>
      {/* Right guard */}
      <mesh position={[4.65, rampMidY + 0.62, rampMidZ]} rotation={[-angle, 0, 0]}>
        <boxGeometry args={[0.28, 1.1, rampLen]} />
        <meshStandardMaterial color={GUARDRAIL} roughness={0.75} />
      </mesh>
      {/* Ramp support pillars (3 under the ramp) */}
      {[0, 1, 2].map(i => {
        const zOff = -rampLen / 2 + rampLen / 4 * (i + 0.5);
        const progress = (i + 0.5) / 3;
        const pHeight = rampMidY * 2 * progress; // taller toward deck end
        return (
          <mesh key={i} position={[0, pHeight / 2, rampMidZ + zOff * facingSign]}>
            <boxGeometry args={[0.5, pHeight, 0.5]} />
            <meshStandardMaterial color={CONCRETE} roughness={0.88} />
          </mesh>
        );
      })}
    </group>
  );
}

// ── Overhead Sign ─────────────────────────────────────────────────────────
function OverheadSign({ z, line1, line2 }: { z: number; line1: string; line2: string }) {
  return (
    <group position={[0, 0, z]}>
      {/* Posts */}
      <mesh position={[-5.5, 5.0, 0]}>
        <cylinderGeometry args={[0.12, 0.12, 4, 6]} />
        <meshStandardMaterial color="#2a2a30" roughness={0.8} />
      </mesh>
      <mesh position={[5.5, 5.0, 0]}>
        <cylinderGeometry args={[0.12, 0.12, 4, 6]} />
        <meshStandardMaterial color="#2a2a30" roughness={0.8} />
      </mesh>
      {/* Cross beam */}
      <mesh position={[0, 7.2, 0]}>
        <boxGeometry args={[12, 0.2, 0.2]} />
        <meshStandardMaterial color="#2a2a30" roughness={0.8} />
      </mesh>
      {/* Sign board (highway green) */}
      <mesh position={[0, 10.2, -0.1]}>
        <boxGeometry args={[9, 1.8, 0.15]} />
        <meshStandardMaterial color="#1a4a1a" roughness={0.72} />
      </mesh>
      {/* Emissive text strip */}
      <mesh position={[0, 10.2, -0.19]}>
        <boxGeometry args={[8.5, 0.6, 0.06]} />
        <meshStandardMaterial color="#a0ffa0" emissive={new THREE.Color('#a0ffa0')} emissiveIntensity={0.5} roughness={0.3} />
      </mesh>
    </group>
  );
}

// ── Main Export ───────────────────────────────────────────────────────────
export function Highway110() {
  const pierZPositions: number[] = [];
  for (let z = -185; z <= 185; z += 20) {
    pierZPositions.push(z);
  }

  return (
    <group position={[130, 0, 0]}>

      {/* ══ Service road below (ground level, alongside highway) ════════ */}
      <mesh position={[0, 0.005, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[8, 400]} />
        <meshStandardMaterial color="#2a2a38" roughness={0.72} metalness={0.15} />
      </mesh>

      {/* ══ Deck segments (3 sections) ══════════════════════════════════ */}
      {/* South section: z=-200 to z=-70 */}
      <HighwayDeck zFrom={-200} zTo={-70} />
      {/* Mid section: z=-70 to z=+70 */}
      <HighwayDeck zFrom={-70} zTo={70} />
      {/* North section: z=+70 to z=+200 */}
      <HighwayDeck zFrom={70} zTo={200} />

      {/* ══ Support piers ════════════════════════════════════════════════ */}
      {pierZPositions.map(z => (
        <Pier key={z} z={z} />
      ))}

      {/* ══ On-ramps ════════════════════════════════════════════════════ */}
      {/* South ramp (z=-160), sloping up as z decreases → facingSign=-1 */}
      <OnRamp zCenter={-160} facingSign={-1} />
      {/* North ramp (z=+160), sloping up as z increases → facingSign=+1 */}
      <OnRamp zCenter={160} facingSign={1} />

      {/* ══ Overhead signs ═══════════════════════════════════════════════ */}
      <OverheadSign z={-45} line1="I-110 N  EXIT 1B" line2="GOVERNMENT ST" />
      <OverheadSign z={45}  line1="I-110 S  DOWNTOWN" line2="CHIPPEWA ST" />

      {/* ══ Sodium vapor highway light (single budget point light) ═══════ */}
      <pointLight position={[0, 9.5, 0]} color="#ffcc88" intensity={14} distance={45} decay={2} />

    </group>
  );
}
