import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { RigidBody } from '@react-three/rapier';
import * as THREE from 'three';

// ── Interior room geometry ────────────────────────────────────────────────────
// Each interior is placed at x=500+ to be far from the main world (x ∈ [-80,80])
// Player is teleported here when entering a building.

function WallBox({ pos, size, color = '#1a1510' }: { pos: [number,number,number]; size: [number,number,number]; color?: string }) {
  return (
    <mesh position={pos} castShadow receiveShadow>
      <boxGeometry args={size} />
      <meshStandardMaterial color={color} roughness={0.9} />
    </mesh>
  );
}

function NeonSign({ pos, text, color }: { pos: [number,number,number]; text: string; color: string }) {
  return (
    <group position={pos}>
      <mesh>
        <boxGeometry args={[2.2, 0.6, 0.06]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.4} />
      </mesh>
    </group>
  );
}

// ── Animated interior NPC ────────────────────────────────────────────────────
type AnimType = 'sway' | 'wipe' | 'lean' | 'sit' | 'nod';
function InteriorNPC({ position, rot = 0, color = '#1a3a8a', skin = '#e8c8a0', anim = 'sway' as AnimType }: {
  position: [number,number,number]; rot?: number; color?: string; skin?: string; anim?: AnimType;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const armRef   = useRef<THREE.Mesh>(null);
  const headRef  = useRef<THREE.Mesh>(null);
  const phase = useRef(Math.random() * Math.PI * 2);

  useFrame((_, delta) => {
    phase.current += delta;
    const t = phase.current;
    if (!groupRef.current) return;
    if (anim === 'sway') {
      groupRef.current.rotation.z = Math.sin(t * 0.7) * 0.04;
    } else if (anim === 'wipe') {
      groupRef.current.rotation.z = Math.sin(t * 1.1) * 0.04;
      if (armRef.current)  armRef.current.rotation.x  = -0.3 + Math.sin(t * 2.8) * 0.4;
    } else if (anim === 'lean') {
      groupRef.current.rotation.x = -0.18 + Math.sin(t * 0.5) * 0.04;
      if (headRef.current) headRef.current.rotation.x = 0.2 + Math.sin(t * 0.7) * 0.06;
    } else if (anim === 'sit') {
      if (headRef.current) headRef.current.rotation.y = Math.sin(t * 0.35) * 0.12;
    } else if (anim === 'nod') {
      if (headRef.current) headRef.current.rotation.x = Math.sin(t * 1.2) * 0.08;
    }
  });

  return (
    <group ref={groupRef} position={position} rotation={[0, rot, 0]}>
      {/* Body */}
      <mesh>
        <capsuleGeometry args={[0.25, 0.65, 4, 8]} />
        <meshStandardMaterial color={color} roughness={0.8} />
      </mesh>
      {/* Head */}
      <mesh ref={headRef} position={[0, 0.62, 0]}>
        <sphereGeometry args={[0.17, 8, 8]} />
        <meshStandardMaterial color={skin} roughness={0.6} />
      </mesh>
      {/* Right arm */}
      <mesh ref={armRef} position={[0.28, 0.12, 0.1]} rotation={[0.4, 0, 0.35]}>
        <capsuleGeometry args={[0.06, 0.4, 4, 6]} />
        <meshStandardMaterial color={skin} roughness={0.6} />
      </mesh>
      {/* Left arm */}
      <mesh position={[-0.28, 0.12, 0.1]} rotation={[0.3, 0, -0.35]}>
        <capsuleGeometry args={[0.06, 0.4, 4, 6]} />
        <meshStandardMaterial color={skin} roughness={0.6} />
      </mesh>
    </group>
  );
}

// ── Bar Interior — Chippewa Tavern (base: x=500, z=0) ──────────────────────
function BarInterior() {
  const bx = 500, bz = 0;
  return (
    <group>
      {/* Ambient + point lights */}
      <ambientLight intensity={0.4} color="#ff9944" />
      <pointLight position={[bx, 2.8, bz]} intensity={60} color="#ffaa55" distance={20} />
      <pointLight position={[bx - 3, 2.5, bz - 2]} intensity={30} color="#ff3333" distance={10} />

      {/* Floor */}
      <WallBox pos={[bx, -0.15, bz]} size={[14, 0.3, 10]} color="#3a2a18" />
      {/* Ceiling */}
      <WallBox pos={[bx, 3.35, bz]} size={[14, 0.3, 10]} color="#111008" />

      {/* Walls — with physics */}
      <RigidBody type="fixed">
        {/* Front wall (door gap in center) */}
        <mesh position={[bx - 3.5, 1.75, bz - 5]} castShadow>
          <boxGeometry args={[7, 3.5, 0.25]} />
          <meshStandardMaterial color="#2a1f14" />
        </mesh>
        <mesh position={[bx + 3.5, 1.75, bz - 5]} castShadow>
          <boxGeometry args={[7, 3.5, 0.25]} />
          <meshStandardMaterial color="#2a1f14" />
        </mesh>
        {/* Back wall */}
        <mesh position={[bx, 1.75, bz + 5]} castShadow>
          <boxGeometry args={[14, 3.5, 0.25]} />
          <meshStandardMaterial color="#221810" />
        </mesh>
        {/* Left wall */}
        <mesh position={[bx - 7, 1.75, bz]} castShadow>
          <boxGeometry args={[0.25, 3.5, 10]} />
          <meshStandardMaterial color="#201a0e" />
        </mesh>
        {/* Right wall */}
        <mesh position={[bx + 7, 1.75, bz]} castShadow>
          <boxGeometry args={[0.25, 3.5, 10]} />
          <meshStandardMaterial color="#201a0e" />
        </mesh>
      </RigidBody>

      {/* Bar counter */}
      <RigidBody type="fixed">
        <mesh position={[bx, 0.55, bz - 2.5]}>
          <boxGeometry args={[7, 1.1, 1.2]} />
          <meshStandardMaterial color="#5a3a1a" roughness={0.6} />
        </mesh>
        {/* Bar top */}
        <mesh position={[bx, 1.12, bz - 2.5]}>
          <boxGeometry args={[7.1, 0.12, 1.3]} />
          <meshStandardMaterial color="#8a5a2a" roughness={0.3} metalness={0.2} />
        </mesh>
      </RigidBody>

      {/* Bar stools */}
      {[-2.5, -1, 0.5, 2, 3.5].map((ox, i) => (
        <group key={i} position={[bx + ox, 0, bz - 1]}>
          <mesh position={[0, 0.55, 0]}>
            <cylinderGeometry args={[0.02, 0.02, 1.1, 6]} />
            <meshStandardMaterial color="#333" />
          </mesh>
          <mesh position={[0, 1.15, 0]}>
            <cylinderGeometry args={[0.22, 0.22, 0.1, 8]} />
            <meshStandardMaterial color="#8B4513" roughness={0.7} />
          </mesh>
        </group>
      ))}

      {/* Neon signs on back wall */}
      <NeonSign pos={[bx - 3, 2.6, bz + 4.8]} text="OPEN" color="#ff3333" />
      <NeonSign pos={[bx + 2, 2.6, bz + 4.8]} text="NBA" color="#ffaa00" />
      <NeonSign pos={[bx, 2.8, bz - 4.8]} text="CHIPPEWA TAVERN" color="#00aaff" />

      {/* Tables */}
      {[[bx - 4, bz + 1.5], [bx + 3, bz + 1.5], [bx - 1, bz + 3]].map(([tx, tz], i) => (
        <group key={i} position={[tx, 0, tz]}>
          <mesh position={[0, 0.7, 0]}>
            <cylinderGeometry args={[0.55, 0.55, 0.08, 8]} />
            <meshStandardMaterial color="#6B3a1a" roughness={0.7} />
          </mesh>
          <mesh position={[0, 0.3, 0]}>
            <cylinderGeometry args={[0.03, 0.03, 0.62, 6]} />
            <meshStandardMaterial color="#333" />
          </mesh>
        </group>
      ))}

      {/* ── NPCs ── */}
      {/* Bartender behind the counter */}
      <InteriorNPC position={[bx + 0.5, 0.85, bz - 3.8]} rot={0} color="#3a1a0a" skin="#c87840" anim="wipe" />
      {/* Patron on stool 1 */}
      <InteriorNPC position={[bx - 2.5, 0.85, bz - 1.0]} rot={Math.PI} color="#1a3a1a" skin="#e8c8a0" anim="nod" />
      {/* Patron on stool 2 */}
      <InteriorNPC position={[bx + 0.5, 0.85, bz - 1.0]} rot={Math.PI} color="#2a0a2a" skin="#b87050" anim="sway" />
      {/* Patron at table */}
      <InteriorNPC position={[bx - 4, 0.85, bz + 1.5]} rot={Math.PI * 0.3} color="#1a1a3a" skin="#e8c8a0" anim="nod" />

      {/* Door frame glow — marks exit at z=-5 */}
      <mesh position={[bx, 1.2, bz - 4.88]}>
        <boxGeometry args={[1.8, 2.4, 0.05]} />
        <meshStandardMaterial color="#ffaa33" emissive="#ffaa33" emissiveIntensity={0.5} transparent opacity={0.3} />
      </mesh>
      <pointLight position={[bx, 2, bz - 4.9]} intensity={15} color="#ffaa33" distance={5} />
    </group>
  );
}

// ── Recording Studio Interior (base: x=550, z=0) ───────────────────────────
function StudioInterior() {
  const bx = 550, bz = 0;
  return (
    <group>
      <ambientLight intensity={0.25} color="#002244" />
      <pointLight position={[bx, 2.8, bz]} intensity={40} color="#0044ff" distance={18} />
      <pointLight position={[bx - 5, 2.5, bz + 2]} intensity={25} color="#00f0d0" distance={12} />
      <pointLight position={[bx + 5, 2.5, bz - 2]} intensity={20} color="#f000b8" distance={10} />

      {/* Floor — dark grey foam tiles */}
      <WallBox pos={[bx, -0.15, bz]} size={[18, 0.3, 14]} color="#1a1a1a" />
      {/* Ceiling */}
      <WallBox pos={[bx, 3.35, bz]} size={[18, 0.3, 14]} color="#0a0a0a" />

      <RigidBody type="fixed">
        {/* Front wall — door gap */}
        <mesh position={[bx - 4, 1.75, bz - 7]}>
          <boxGeometry args={[10, 3.5, 0.25]} />
          <meshStandardMaterial color="#111" />
        </mesh>
        <mesh position={[bx + 5, 1.75, bz - 7]}>
          <boxGeometry args={[8, 3.5, 0.25]} />
          <meshStandardMaterial color="#111" />
        </mesh>
        {/* Back wall */}
        <mesh position={[bx, 1.75, bz + 7]}>
          <boxGeometry args={[18, 3.5, 0.25]} />
          <meshStandardMaterial color="#0e0e0e" />
        </mesh>
        {/* Left wall */}
        <mesh position={[bx - 9, 1.75, bz]}>
          <boxGeometry args={[0.25, 3.5, 14]} />
          <meshStandardMaterial color="#0e0e0e" />
        </mesh>
        {/* Right wall */}
        <mesh position={[bx + 9, 1.75, bz]}>
          <boxGeometry args={[0.25, 3.5, 14]} />
          <meshStandardMaterial color="#0e0e0e" />
        </mesh>
      </RigidBody>

      {/* Recording booth glass wall */}
      <RigidBody type="fixed">
        <mesh position={[bx + 4, 1.5, bz]}>
          <boxGeometry args={[0.1, 3, 6]} />
          <meshStandardMaterial color="#00aaff" transparent opacity={0.25} metalness={0.9} roughness={0.1} />
        </mesh>
      </RigidBody>

      {/* Soundboard / mixing console */}
      <RigidBody type="fixed">
        <mesh position={[bx - 3, 0.85, bz - 3]}>
          <boxGeometry args={[5, 1.7, 2.5]} />
          <meshStandardMaterial color="#111" roughness={0.5} />
        </mesh>
        {/* Knob grid */}
        {Array.from({ length: 8 }, (_, i) => (
          <mesh key={i} position={[bx - 5.2 + i * 0.7, 1.75, bz - 2.8]}>
            <cylinderGeometry args={[0.06, 0.06, 0.12, 8]} />
            <meshStandardMaterial color="#00f0d0" emissive="#00f0d0" emissiveIntensity={1.5} />
          </mesh>
        ))}
      </RigidBody>

      {/* Studio monitors (speakers) */}
      {[[-1.5, -4.5], [1.5, -4.5]].map(([ox, oz], i) => (
        <group key={i} position={[bx + ox, 1.4, bz + oz]}>
          <mesh>
            <boxGeometry args={[0.55, 0.85, 0.4]} />
            <meshStandardMaterial color="#222" />
          </mesh>
          <mesh position={[0, 0.12, 0.22]}>
            <circleGeometry args={[0.2, 12]} />
            <meshStandardMaterial color="#555" />
          </mesh>
        </group>
      ))}

      {/* Mic stand in booth */}
      <group position={[bx + 6.5, 0, bz]}>
        <mesh position={[0, 0.75, 0]}>
          <cylinderGeometry args={[0.02, 0.02, 1.5, 6]} />
          <meshStandardMaterial color="#888" metalness={0.9} />
        </mesh>
        <mesh position={[0, 1.55, 0]}>
          <sphereGeometry args={[0.08, 8, 8]} />
          <meshStandardMaterial color="#aaa" metalness={0.9} />
        </mesh>
      </group>

      {/* NBA signs */}
      <NeonSign pos={[bx - 7, 2.7, bz + 6.8]} text="NEVER BROKE AGAIN" color="#ffaa00" />
      <NeonSign pos={[bx + 5, 2.7, bz + 6.8]} text="RECORDING" color="#f000b8" />

      {/* ── NPCs ── */}
      {/* Studio engineer at the mixing board — leaning forward */}
      <InteriorNPC position={[bx - 3, 1.15, bz - 1.5]} rot={Math.PI} color="#111" skin="#c87840" anim="lean" />
      {/* Vocalist in the booth — facing mic */}
      <InteriorNPC position={[bx + 6.5, 0.85, bz + 0.8]} rot={Math.PI * 1.5} color="#2a0a3a" skin="#e8c8a0" anim="nod" />
      {/* A&R rep on the couch side */}
      <InteriorNPC position={[bx - 7, 0.85, bz + 3]} rot={0.4} color="#3a2a1a" skin="#b87050" anim="sway" />

      {/* Door glow */}
      <mesh position={[bx + 1, 1.2, bz - 6.88]}>
        <boxGeometry args={[1.8, 2.4, 0.05]} />
        <meshStandardMaterial color="#00f0d0" emissive="#00f0d0" emissiveIntensity={0.5} transparent opacity={0.3} />
      </mesh>
      <pointLight position={[bx + 1, 2, bz - 6.9]} intensity={15} color="#00f0d0" distance={5} />
    </group>
  );
}

// ── NBA HQ Lobby (base: x=600, z=0) ─────────────────────────────────────────
function NBAHQLobby() {
  const bx = 600, bz = 0;
  return (
    <group>
      <ambientLight intensity={0.35} color="#ffcc44" />
      <pointLight position={[bx, 5.5, bz]} intensity={120} color="#ffdd88" distance={30} />
      <pointLight position={[bx - 6, 4, bz + 4]} intensity={40} color="#ffaa00" distance={15} />
      <pointLight position={[bx + 6, 4, bz - 4]} intensity={40} color="#ff8800" distance={15} />

      {/* Floor — gold marble */}
      <WallBox pos={[bx, -0.15, bz]} size={[22, 0.3, 20]} color="#c8a840" />
      {/* Ceiling — high */}
      <WallBox pos={[bx, 6.35, bz]} size={[22, 0.3, 20]} color="#1a1408" />

      <RigidBody type="fixed">
        {/* Front wall — large double door */}
        <mesh position={[bx - 6, 3, bz - 10]}>
          <boxGeometry args={[10, 6, 0.25]} />
          <meshStandardMaterial color="#2a2010" />
        </mesh>
        <mesh position={[bx + 6, 3, bz - 10]}>
          <boxGeometry args={[10, 6, 0.25]} />
          <meshStandardMaterial color="#2a2010" />
        </mesh>
        {/* Back wall */}
        <mesh position={[bx, 3, bz + 10]}>
          <boxGeometry args={[22, 6, 0.25]} />
          <meshStandardMaterial color="#181208" />
        </mesh>
        {/* Left wall */}
        <mesh position={[bx - 11, 3, bz]}>
          <boxGeometry args={[0.25, 6, 20]} />
          <meshStandardMaterial color="#181208" />
        </mesh>
        {/* Right wall */}
        <mesh position={[bx + 11, 3, bz]}>
          <boxGeometry args={[0.25, 6, 20]} />
          <meshStandardMaterial color="#181208" />
        </mesh>
      </RigidBody>

      {/* Columns */}
      {[[-7, -6], [7, -6], [-7, 6], [7, 6]].map(([ox, oz], i) => (
        <RigidBody key={i} type="fixed">
          <mesh position={[bx + ox, 3, bz + oz]}>
            <cylinderGeometry args={[0.45, 0.55, 6, 12]} />
            <meshStandardMaterial color="#d4a820" metalness={0.5} roughness={0.3} />
          </mesh>
        </RigidBody>
      ))}

      {/* Reception desk */}
      <RigidBody type="fixed">
        <mesh position={[bx, 0.7, bz - 3]}>
          <boxGeometry args={[6, 1.4, 2]} />
          <meshStandardMaterial color="#1a1008" roughness={0.6} />
        </mesh>
        <mesh position={[bx, 1.4, bz - 3]}>
          <boxGeometry args={[6.2, 0.08, 2.1]} />
          <meshStandardMaterial color="#c8a840" metalness={0.6} roughness={0.2} />
        </mesh>
      </RigidBody>

      {/* NBA LOGO — back wall */}
      <mesh position={[bx, 3.8, bz + 9.7]}>
        <boxGeometry args={[8, 3.5, 0.1]} />
        <meshStandardMaterial color="#ffaa00" emissive="#ffaa00" emissiveIntensity={1.2} />
      </mesh>
      <pointLight position={[bx, 3.8, bz + 9.5]} intensity={80} color="#ffaa00" distance={12} />

      {/* "NEVER BROKE AGAIN" text panel */}
      <mesh position={[bx, 5.2, bz + 9.6]}>
        <boxGeometry args={[10, 0.8, 0.08]} />
        <meshStandardMaterial color="#fff" emissive="#fff" emissiveIntensity={0.6} />
      </mesh>

      {/* Gold trophy cases on sides */}
      {[[-9, 2], [-9, -2], [9, 2], [9, -2]].map(([ox, oz], i) => (
        <group key={i} position={[bx + ox, 0, bz + oz]}>
          <mesh>
            <boxGeometry args={[0.8, 2, 0.5]} />
            <meshStandardMaterial color="#111" transparent opacity={0.7} metalness={0.8} />
          </mesh>
          <mesh position={[0, 1.2, 0]}>
            <cylinderGeometry args={[0.1, 0.14, 0.5, 8]} />
            <meshStandardMaterial color="#ffd700" emissive="#ffd700" emissiveIntensity={0.8} metalness={0.9} />
          </mesh>
        </group>
      ))}

      {/* ── NPCs ── */}
      {/* Receptionist behind the desk */}
      <InteriorNPC position={[bx, 1.1, bz - 4.8]} rot={0} color="#1a1a1a" skin="#e8c8a0" anim="nod" />
      {/* Security guard by the door */}
      <InteriorNPC position={[bx - 3, 0.85, bz - 8.5]} rot={0.3} color="#0a1a3a" skin="#b87050" anim="sway" />
      {/* Executive walking */}
      <InteriorNPC position={[bx + 5, 0.85, bz + 3]} rot={-0.8} color="#111" skin="#c87840" anim="nod" />

      {/* Door glow */}
      <mesh position={[bx, 1.5, bz - 9.88]}>
        <boxGeometry args={[2.5, 3, 0.05]} />
        <meshStandardMaterial color="#ffaa00" emissive="#ffaa00" emissiveIntensity={0.5} transparent opacity={0.35} />
      </mesh>
      <pointLight position={[bx, 2, bz - 9.9]} intensity={20} color="#ffaa00" distance={6} />
    </group>
  );
}

// ── Shotgun House Interior (base: x=650, z=0) ────────────────────────────────
function HouseInterior() {
  const bx = 650, bz = 0;
  return (
    <group>
      <ambientLight intensity={0.5} color="#ffeecc" />
      <pointLight position={[bx, 2.5, bz]} intensity={35} color="#ffcc88" distance={14} />

      {/* Floor */}
      <WallBox pos={[bx, -0.15, bz]} size={[9, 0.3, 6]} color="#7a5a30" />
      {/* Ceiling */}
      <WallBox pos={[bx, 2.85, bz]} size={[9, 0.3, 6]} color="#2a2010" />

      <RigidBody type="fixed">
        <mesh position={[bx - 2, 1.5, bz - 3]}>
          <boxGeometry args={[5, 3, 0.2]} />
          <meshStandardMaterial color="#5a4020" />
        </mesh>
        <mesh position={[bx + 2.5, 1.5, bz - 3]}>
          <boxGeometry args={[4, 3, 0.2]} />
          <meshStandardMaterial color="#5a4020" />
        </mesh>
        <mesh position={[bx, 1.5, bz + 3]}>
          <boxGeometry args={[9, 3, 0.2]} />
          <meshStandardMaterial color="#4a3018" />
        </mesh>
        <mesh position={[bx - 4.5, 1.5, bz]}>
          <boxGeometry args={[0.2, 3, 6]} />
          <meshStandardMaterial color="#4a3018" />
        </mesh>
        <mesh position={[bx + 4.5, 1.5, bz]}>
          <boxGeometry args={[0.2, 3, 6]} />
          <meshStandardMaterial color="#4a3018" />
        </mesh>
      </RigidBody>

      {/* Furniture */}
      <RigidBody type="fixed">
        <mesh position={[bx - 2, 0.4, bz + 1.5]}>
          <boxGeometry args={[2.5, 0.8, 1.2]} />
          <meshStandardMaterial color="#8B4513" roughness={0.9} />
        </mesh>
        <mesh position={[bx + 2.5, 0.25, bz + 1.5]}>
          <boxGeometry args={[3, 0.5, 1.5]} />
          <meshStandardMaterial color="#6B3a1a" roughness={0.9} />
        </mesh>
      </RigidBody>

      {/* TV on wall */}
      <mesh position={[bx - 3.5, 1.7, bz + 2.85]}>
        <boxGeometry args={[1.8, 1.0, 0.12]} />
        <meshStandardMaterial color="#111" emissive="#002244" emissiveIntensity={0.5} />
      </mesh>

      {/* ── NPCs ── */}
      {/* Person on couch watching TV */}
      <InteriorNPC position={[bx - 2, 0.85, bz + 1.5]} rot={Math.PI} color="#2a1a3a" skin="#e8c8a0" anim="sit" />
      {/* Second person in doorway */}
      <InteriorNPC position={[bx + 3, 0.85, bz - 1]} rot={2.5} color="#1a2a1a" skin="#b87050" anim="sway" />

      {/* Door glow */}
      <mesh position={[bx + 0.5, 1.2, bz - 2.88]}>
        <boxGeometry args={[1.5, 2.4, 0.05]} />
        <meshStandardMaterial color="#ffcc88" emissive="#ffcc88" emissiveIntensity={0.4} transparent opacity={0.3} />
      </mesh>
    </group>
  );
}

// ── Cinema Interior (base: x=700, z=0) ───────────────────────────────────────
// NOTE: When player enters cinema, GameHUD overlays the YouTube iframe panel.
// This 3D room provides the in-world cinema feel.
function CinemaInterior() {
  const bx = 700, bz = 0;
  const screenRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!screenRef.current) return;
    const mat = screenRef.current.material as THREE.MeshStandardMaterial;
    // Subtle flicker to simulate projector
    mat.emissiveIntensity = 0.55 + Math.sin(state.clock.elapsedTime * 28) * 0.06;
  });

  return (
    <group>
      <ambientLight intensity={0.08} color="#0a0620" />
      {/* Main screen glow — blue-white projector light */}
      <pointLight position={[bx, 3.5, bz + 6.5]} intensity={80} color="#6688ff" distance={22} decay={1.6} />
      {/* Row aisle lights — deep red */}
      {[-4, -1, 2].map((ax, i) => (
        <pointLight key={i} position={[bx + ax, 0.25, bz - 1]} intensity={2.5} color="#550020" distance={3} />
      ))}
      {/* Entrance light */}
      <pointLight position={[bx, 2.5, bz - 7.5]} intensity={12} color="#4488ff" distance={8} decay={2} />

      {/* Floor — dark carpet */}
      <WallBox pos={[bx, -0.15, bz]} size={[20, 0.3, 16]} color="#120a18" />
      {/* Ceiling */}
      <WallBox pos={[bx, 5.35, bz]} size={[20, 0.3, 16]} color="#080610" />

      {/* Walls */}
      <RigidBody type="fixed">
        {/* Front wall — door gap */}
        <mesh position={[bx - 5, 2.5, bz - 8]}>
          <boxGeometry args={[10, 5, 0.25]} />
          <meshStandardMaterial color="#0e0c14" />
        </mesh>
        <mesh position={[bx + 5, 2.5, bz - 8]}>
          <boxGeometry args={[10, 5, 0.25]} />
          <meshStandardMaterial color="#0e0c14" />
        </mesh>
        {/* Back wall (screen wall) */}
        <mesh position={[bx, 2.5, bz + 8]}>
          <boxGeometry args={[20, 5, 0.25]} />
          <meshStandardMaterial color="#0a0812" />
        </mesh>
        {/* Side walls */}
        <mesh position={[bx - 10, 2.5, bz]}>
          <boxGeometry args={[0.25, 5, 16]} />
          <meshStandardMaterial color="#0e0c14" />
        </mesh>
        <mesh position={[bx + 10, 2.5, bz]}>
          <boxGeometry args={[0.25, 5, 16]} />
          <meshStandardMaterial color="#0e0c14" />
        </mesh>
      </RigidBody>

      {/* Screen frame */}
      <mesh position={[bx, 3.0, bz + 7.65]}>
        <boxGeometry args={[13, 5.2, 0.08]} />
        <meshStandardMaterial color="#050408" roughness={0.95} />
      </mesh>
      {/* Projection screen — glowing blue-white */}
      <mesh ref={screenRef} position={[bx, 3.0, bz + 7.7]}>
        <boxGeometry args={[12.5, 4.8, 0.1]} />
        <meshStandardMaterial color="#aabbff" emissive="#3355dd" emissiveIntensity={0.55} roughness={0.1} />
      </mesh>

      {/* "NOW SHOWING" marquee above screen */}
      <mesh position={[bx, 5.75, bz + 7.62]}>
        <boxGeometry args={[8, 0.45, 0.08]} />
        <meshStandardMaterial color="#ffaa00" emissive="#ffaa00" emissiveIntensity={1.8} />
      </mesh>

      {/* Seat rows — 3 rows, 6 seats each, slightly elevated back */}
      {[0, 1, 2].map(row => (
        <group key={row}>
          {[-3.5, -2.1, -0.7, 0.7, 2.1, 3.5].map((ox, si) => (
            <group key={si} position={[bx + ox, 0.36 + row * 0.28, bz + 1.0 + row * 1.9]}>
              {/* Seat cushion */}
              <mesh>
                <boxGeometry args={[0.56, 0.1, 0.48]} />
                <meshStandardMaterial color="#4a1018" roughness={0.95} />
              </mesh>
              {/* Seat back */}
              <mesh position={[0, 0.3, -0.2]}>
                <boxGeometry args={[0.56, 0.52, 0.1]} />
                <meshStandardMaterial color="#3a0c14" roughness={0.95} />
              </mesh>
              {/* Armrests */}
              <mesh position={[-0.31, 0.18, 0]}>
                <boxGeometry args={[0.06, 0.16, 0.48]} />
                <meshStandardMaterial color="#1a0a0a" roughness={0.9} />
              </mesh>
              <mesh position={[0.31, 0.18, 0]}>
                <boxGeometry args={[0.06, 0.16, 0.48]} />
                <meshStandardMaterial color="#1a0a0a" roughness={0.9} />
              </mesh>
            </group>
          ))}
        </group>
      ))}

      {/* Concession stand near entrance */}
      <group position={[bx + 7.5, 0, bz - 5.5]}>
        <RigidBody type="fixed">
          <mesh position={[0, 0.65, 0]}>
            <boxGeometry args={[2.5, 1.3, 1.0]} />
            <meshStandardMaterial color="#cc4400" roughness={0.8} />
          </mesh>
          <mesh position={[0, 1.3, 0]}>
            <boxGeometry args={[2.6, 0.08, 1.1]} />
            <meshStandardMaterial color="#ffaa44" roughness={0.6} metalness={0.3} />
          </mesh>
        </RigidBody>
        <pointLight position={[0, 1.8, 0]} intensity={8} color="#ffcc88" distance={6} />
        {/* Popcorn bucket */}
        <mesh position={[0.6, 1.55, 0]}>
          <cylinderGeometry args={[0.15, 0.12, 0.4, 8]} />
          <meshStandardMaterial color="#ff2200" roughness={0.8} />
        </mesh>
      </group>

      {/* Projector box at back of room (above) */}
      <mesh position={[bx, 4.6, bz - 5]}>
        <boxGeometry args={[0.5, 0.35, 0.7]} />
        <meshStandardMaterial color="#111" roughness={0.8} metalness={0.5} />
      </mesh>

      {/* Gold star floor decals (aisle markings) */}
      {[-2, 0, 2].map((ax, i) => (
        <mesh key={i} position={[bx + ax, 0.02, bz - 3.5]} rotation={[-Math.PI/2, 0, 0]}>
          <planeGeometry args={[0.25, 0.25]} />
          <meshStandardMaterial color="#ffaa00" emissive="#ffaa00" emissiveIntensity={1.2} />
        </mesh>
      ))}

      {/* Door glow */}
      <mesh position={[bx, 1.5, bz - 7.88]}>
        <boxGeometry args={[2, 3, 0.05]} />
        <meshStandardMaterial color="#4488ff" emissive="#4488ff" emissiveIntensity={0.5} transparent opacity={0.35} />
      </mesh>
      <pointLight position={[bx, 2, bz - 7.9]} intensity={12} color="#4488ff" distance={5} />
    </group>
  );
}

// ── Virtual Studio Interior (base: x=750, z=0) ───────────────────────────────
// Cyber/holographic music production room — futuristic and digital
function VirtualStudioInterior() {
  const bx = 750, bz = 0;
  const screenRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const t = useRef(0);

  useFrame((_, delta) => {
    t.current += delta;
    // Animate holographic waveform screen
    if (screenRef.current) {
      const mat = screenRef.current.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = 0.8 + Math.sin(t.current * 6) * 0.3;
    }
    // Spin the holographic ring
    if (ringRef.current) {
      ringRef.current.rotation.y = t.current * 0.5;
      ringRef.current.rotation.x = Math.sin(t.current * 0.3) * 0.2;
    }
  });

  return (
    <group>
      <ambientLight intensity={0.15} color="#001828" />
      <pointLight position={[bx, 3, bz]} intensity={50} color="#00f0d0" distance={20} decay={1.6} />
      <pointLight position={[bx - 7, 2.5, bz + 4]} intensity={25} color="#f000b8" distance={12} decay={2} />
      <pointLight position={[bx + 7, 2.5, bz - 4]} intensity={20} color="#0088ff" distance={10} decay={2} />

      {/* Floor — glowing grid pattern */}
      <WallBox pos={[bx, -0.15, bz]} size={[18, 0.3, 14]} color="#050810" />
      {/* Grid lines on floor */}
      {Array.from({ length: 9 }, (_, i) => (
        <mesh key={`gx-${i}`} position={[bx - 8 + i * 2, 0.02, bz]} rotation={[-Math.PI/2, 0, 0]}>
          <planeGeometry args={[0.04, 14]} />
          <meshStandardMaterial color="#00f0d0" emissive="#00f0d0" emissiveIntensity={0.4} transparent opacity={0.5} />
        </mesh>
      ))}
      {Array.from({ length: 8 }, (_, i) => (
        <mesh key={`gz-${i}`} position={[bx, 0.02, bz - 6.5 + i * 2]} rotation={[-Math.PI/2, 0, 0]}>
          <planeGeometry args={[18, 0.04]} />
          <meshStandardMaterial color="#00f0d0" emissive="#00f0d0" emissiveIntensity={0.4} transparent opacity={0.4} />
        </mesh>
      ))}
      {/* Ceiling */}
      <WallBox pos={[bx, 3.85, bz]} size={[18, 0.3, 14]} color="#040608" />

      {/* Walls */}
      <RigidBody type="fixed">
        <mesh position={[bx - 4, 2, bz - 7]}>
          <boxGeometry args={[10, 4, 0.25]} />
          <meshStandardMaterial color="#030508" />
        </mesh>
        <mesh position={[bx + 5, 2, bz - 7]}>
          <boxGeometry args={[8, 4, 0.25]} />
          <meshStandardMaterial color="#030508" />
        </mesh>
        <mesh position={[bx, 2, bz + 7]}>
          <boxGeometry args={[18, 4, 0.25]} />
          <meshStandardMaterial color="#020408" />
        </mesh>
        <mesh position={[bx - 9, 2, bz]}>
          <boxGeometry args={[0.25, 4, 14]} />
          <meshStandardMaterial color="#030508" />
        </mesh>
        <mesh position={[bx + 9, 2, bz]}>
          <boxGeometry args={[0.25, 4, 14]} />
          <meshStandardMaterial color="#030508" />
        </mesh>
      </RigidBody>

      {/* Main DAW screen — back wall */}
      <mesh ref={screenRef} position={[bx, 2.2, bz + 6.7]}>
        <boxGeometry args={[10, 2.8, 0.1]} />
        <meshStandardMaterial color="#00f0d0" emissive="#00d4b8" emissiveIntensity={0.8} roughness={0.1} />
      </mesh>
      {/* Waveform bars — single instanced mesh (was 20 separate useFrame loops) */}
      <WaveBars bx={bx} bz={bz} total={20} />

      {/* Holographic spinning ring above center */}
      <mesh ref={ringRef} position={[bx, 3.2, bz]}>
        <torusGeometry args={[1.2, 0.04, 8, 32]} />
        <meshStandardMaterial color="#00f0d0" emissive="#00f0d0" emissiveIntensity={2} />
      </mesh>
      <pointLight position={[bx, 3.2, bz]} intensity={20} color="#00f0d0" distance={8} decay={2} />

      {/* Beat pad controller */}
      <RigidBody type="fixed">
        <mesh position={[bx, 0.9, bz - 2.5]}>
          <boxGeometry args={[5, 1.8, 2]} />
          <meshStandardMaterial color="#080c10" roughness={0.4} metalness={0.6} />
        </mesh>
      </RigidBody>
      {/* Beat pad buttons — 4x4 grid */}
      {Array.from({ length: 16 }, (_, i) => {
        const row = Math.floor(i / 4);
        const col = i % 4;
        const colors = ['#f000b8', '#00f0d0', '#ffaa00', '#ff4444'];
        return (
          <mesh key={i} position={[bx - 1.5 + col * 1.05, 1.85, bz - 1.6 + row * 0.48]}>
            <boxGeometry args={[0.85, 0.1, 0.38]} />
            <meshStandardMaterial
              color={colors[row]}
              emissive={colors[row]}
              emissiveIntensity={0.6 + (i % 3) * 0.3}
              roughness={0.3}
            />
          </mesh>
        );
      })}

      {/* Side monitor screens */}
      {[[-6.5, bz + 2], [6.5, bz + 2]].map(([ox, oz], i) => (
        <group key={i} position={[bx + ox, 2.2, oz]}>
          <mesh>
            <boxGeometry args={[0.1, 2, 3]} />
            <meshStandardMaterial color="#0088ff" emissive="#0055cc" emissiveIntensity={0.7} roughness={0.1} />
          </mesh>
          <pointLight position={[i === 0 ? 0.5 : -0.5, 0, 0]} intensity={12} color="#0088ff" distance={6} decay={2} />
        </group>
      ))}

      {/* Neon signs */}
      <NeonSign pos={[bx - 6, 3.4, bz + 6.65]} text="VIRTUAL STUDIO" color="#f000b8" />
      <NeonSign pos={[bx + 5, 3.4, bz + 6.65]} text="NBA" color="#00f0d0" />

      {/* NPCs */}
      {/* AI Producer hologram — cyan/translucent look */}
      <InteriorNPC position={[bx, 1.0, bz - 1.0]} rot={Math.PI} color="#002233" skin="#00f0d0" anim="lean" />
      {/* Artist listening */}
      <InteriorNPC position={[bx - 5, 0.85, bz + 2]} rot={0.6} color="#1a0030" skin="#e8c8a0" anim="nod" />
      {/* Engineer */}
      <InteriorNPC position={[bx + 5, 0.85, bz - 3]} rot={-0.4} color="#0a1a0a" skin="#b87050" anim="lean" />

      {/* Door glow */}
      <mesh position={[bx + 1, 1.5, bz - 6.88]}>
        <boxGeometry args={[2, 3, 0.05]} />
        <meshStandardMaterial color="#00f0d0" emissive="#00f0d0" emissiveIntensity={0.5} transparent opacity={0.35} />
      </mesh>
      <pointLight position={[bx + 1, 2, bz - 6.9]} intensity={15} color="#00f0d0" distance={5} />
    </group>
  );
}

// Animated waveform bars — single InstancedMesh replaces 20 individual useFrame loops
const WAVE_COLORS = [new THREE.Color('#00f0d0'), new THREE.Color('#f000b8'), new THREE.Color('#ffaa00')];
function WaveBars({ bx, bz, total = 20 }: { bx: number; bz: number; total?: number }) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const phases = useMemo(() => Float32Array.from({ length: total }, (_, i) => (i / total) * Math.PI * 2), [total]);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.elapsedTime;
    for (let i = 0; i < total; i++) {
      const h = 0.15 + Math.abs(Math.sin(t * 3 + phases[i])) * 1.0;
      const x = bx - 4.8 + (i / total) * 9.6;
      dummy.position.set(x, 2.2 + h * 0.4, bz + 6.72);
      dummy.scale.set(1, h, 1);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
      meshRef.current.setColorAt(i, WAVE_COLORS[i % 3]);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true;
  });
  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, total]}>
      <boxGeometry args={[0.3, 0.8, 0.08]} />
      <meshStandardMaterial emissiveIntensity={1.5} roughness={0.2} toneMapped={false} />
    </instancedMesh>
  );
}

// ── Main export — renders all interiors unconditionally (far from main world)
export function BuildingInteriors() {
  return (
    <>
      <BarInterior />
      <StudioInterior />
      <NBAHQLobby />
      <HouseInterior />
      <CinemaInterior />
      <VirtualStudioInterior />
    </>
  );
}
