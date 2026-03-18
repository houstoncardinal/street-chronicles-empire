/**
 * CityBus.tsx — Animated KB3D city bus driving Chippewa Blvd.
 * Drives east-west on a loop, stops at 3 bus stops for 3 seconds each.
 * Player can approach a stopped bus and see "[E] BOARD BUS".
 */
import { useRef, useMemo, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useFBX, Text } from '@react-three/drei';
import * as THREE from 'three';
import { playerState } from '@/stores/playerStore';

const ROUTE_WEST = -52;
const ROUTE_EAST =  52;
const BUS_SPEED  = 5.2;   // units / second
const BUS_Z      = -4.5;  // inner southbound lane
const STOP_TIME  = 3.2;   // seconds to dwell at each stop
const BOARD_DSQ  = 36;    // 6-unit detection radius

const STOPS: { x: number; name: string }[] = [
  { x: -42, name: 'WEST CHIPPEWA' },
  { x:   0, name: 'DOWNTOWN CENTER' },
  { x:  42, name: 'EAST SIDE' },
];

// Mutable bus state (no React re-renders per frame)
const busState = {
  x: ROUTE_WEST,
  dir:        1 as 1 | -1,
  phase:      'driving' as 'driving' | 'stopped',
  stopTimer:  0,
  stopIdx:    0,     // index into STOPS of next stop going east
};

function distSq2(ax: number, az: number, bx: number, bz: number) {
  return (ax - bx) ** 2 + (az - bz) ** 2;
}

// Convert Phong materials (from FBX loader) → Standard (PBR)
function upgradeMaterials(root: THREE.Group) {
  root.traverse(child => {
    if (!(child as THREE.Mesh).isMesh) return;
    const mesh = child as THREE.Mesh;
    const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    mesh.material = mats.map((m: THREE.Material) => {
      const ph = m as THREE.MeshPhongMaterial;
      return new THREE.MeshStandardMaterial({
        name:        ph.name,
        map:         ph.map         ?? null,
        color:       ph.color       ?? new THREE.Color(0x334455),
        emissiveMap: ph.emissiveMap ?? null,
        emissive:    ph.emissive    ?? new THREE.Color(0),
        roughness:   0.55,
        metalness:   0.15,
        alphaMap:    ph.alphaMap    ?? null,
        transparent: ph.transparent,
        opacity:     ph.opacity,
        side:        ph.side,
      });
    });
    if (!Array.isArray(mesh.material) && (mesh.material as unknown as THREE.Material[]).length) {
      mesh.material = (mesh.material as unknown as THREE.Material[])[0];
    }
    mesh.castShadow    = false;
    mesh.receiveShadow = false;
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Bus Stop Sign — placed at each stop
// ─────────────────────────────────────────────────────────────────────────────
function BusStopSign({ x, z, name }: { x: number; z: number; name: string }) {
  return (
    <group position={[x, 0, z]}>
      {/* Pole */}
      <mesh position={[0, 2.5, 0]}>
        <cylinderGeometry args={[0.04, 0.04, 5.0, 6]} />
        <meshStandardMaterial color="#2a2a32" metalness={0.72} roughness={0.38} />
      </mesh>
      {/* Sign board */}
      <mesh position={[0, 4.85, 0.06]}>
        <boxGeometry args={[1.55, 0.72, 0.07]} />
        <meshStandardMaterial color="#0033aa" roughness={0.68} metalness={0.08} />
      </mesh>
      {/* Bus icon bar */}
      <mesh position={[0, 5.25, 0.10]}>
        <boxGeometry args={[1.55, 0.09, 0.04]} />
        <meshStandardMaterial color="#ffdd00" emissive="#ffdd00" emissiveIntensity={0.4} roughness={0.5} />
      </mesh>
      <Text position={[0, 4.90, 0.12]} fontSize={0.145} color="#ffffff"
        anchorX="center" anchorY="middle" outlineWidth={0.012} outlineColor="#00009f">
        {`BUS STOP\n${name}`}
      </Text>
      {/* Bench */}
      <mesh position={[0, 0.55, z > 0 ? -0.55 : 0.55]}>
        <boxGeometry args={[1.4, 0.07, 0.44]} />
        <meshStandardMaterial color="#1a1a22" metalness={0.5} roughness={0.55} />
      </mesh>
      {/* Bench legs */}
      {[-0.55, 0.55].map((lx, i) => (
        <mesh key={i} position={[lx, 0.28, z > 0 ? -0.55 : 0.55]}>
          <boxGeometry args={[0.07, 0.55, 0.42]} />
          <meshStandardMaterial color="#1a1a22" metalness={0.5} roughness={0.55} />
        </mesh>
      ))}
    </group>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CityBus
// ─────────────────────────────────────────────────────────────────────────────
export function CityBus() {
  const raw    = useFBX('/asset/KB3D_City%20Bus.fbx');
  const busRef = useRef<THREE.Group>(null);
  const [nearby, setNearby] = useState(false);
  const [stopName, setStopName] = useState('');

  // Deep-clone + upgrade materials once
  const bus = useMemo(() => {
    const clone = raw.clone(true);
    upgradeMaterials(clone);
    // Auto-scale: measure bounding box and scale to ~13 world units (≈ bus length)
    const box  = new THREE.Box3().setFromObject(clone);
    const size = box.getSize(new THREE.Vector3());
    const longest = Math.max(size.x, size.y, size.z);
    if (longest > 0) {
      const s = 13 / longest;
      clone.scale.setScalar(s);
    }
    return clone;
  }, [raw]);

  // Lift bus off ground after scale is set
  useEffect(() => {
    if (!busRef.current) return;
    const box = new THREE.Box3().setFromObject(busRef.current);
    const minY = box.min.y;
    if (minY < 0) busRef.current.position.y = -minY;
  });

  useFrame((_, delta) => {
    if (!busRef.current) return;
    const bs = busState;

    // ── Stopped at a bus stop ──────────────────────────────────────────────
    if (bs.phase === 'stopped') {
      bs.stopTimer -= delta;
      if (bs.stopTimer <= 0) {
        bs.phase = 'driving';
        // Advance next expected stop index
        bs.stopIdx += bs.dir;
        if (bs.stopIdx >= STOPS.length) {
          bs.dir    = -1;
          bs.stopIdx = STOPS.length - 2;
        } else if (bs.stopIdx < 0) {
          bs.dir    = 1;
          bs.stopIdx = 1;
        }
      }
    } else {
      // ── Driving ───────────────────────────────────────────────────────────
      bs.x += bs.dir * BUS_SPEED * delta;

      // Turnarounds
      if (bs.x >= ROUTE_EAST) {
        bs.x    = ROUTE_EAST;
        bs.dir  = -1;
        bs.stopIdx = STOPS.length - 2;
      } else if (bs.x <= ROUTE_WEST) {
        bs.x    = ROUTE_WEST;
        bs.dir  = 1;
        bs.stopIdx = 1;
      }

      // Check for bus stop arrival
      const targetStop = STOPS[bs.stopIdx];
      if (targetStop && Math.abs(bs.x - targetStop.x) < 0.8 * BUS_SPEED * delta + 0.4) {
        bs.x        = targetStop.x;
        bs.phase    = 'stopped';
        bs.stopTimer = STOP_TIME;
        setStopName(targetStop.name);
      }
    }

    // Update 3D position/rotation
    busRef.current.position.x = bs.x;
    busRef.current.position.z = BUS_Z;
    busRef.current.rotation.y = bs.dir === 1 ? -Math.PI * 0.5 : Math.PI * 0.5;

    // Slight suspension bounce while moving
    if (bs.phase === 'driving') {
      busRef.current.rotation.z = Math.sin(bs.x * 0.45) * 0.005;
    }

    // Player proximity for boarding prompt
    const near = bs.phase === 'stopped' &&
      distSq2(playerState.x, playerState.z, bs.x, BUS_Z) < BOARD_DSQ;
    if (near !== nearby) setNearby(near);
  });

  return (
    <>
      {/* Animated bus */}
      <group ref={busRef}>
        <primitive object={bus} />
      </group>

      {/* Boarding prompt */}
      {nearby && (
        <group position={[busState.x, 5.5, BUS_Z]}>
          <Text fontSize={0.30} color="#FFD700" anchorX="center" anchorY="middle"
            outlineWidth={0.04} outlineColor="#000000">
            {`[E]  BOARD BUS\n${stopName}`}
          </Text>
        </group>
      )}

      {/* Bus stop signs — south side of road, near curb */}
      {STOPS.map(s => (
        <BusStopSign key={s.x} x={s.x} z={9.8} name={s.name} />
      ))}
    </>
  );
}

useFBX.preload('/asset/KB3D_City%20Bus.fbx');
