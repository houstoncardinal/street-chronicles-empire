import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { playerState } from '@/stores/playerStore';

// ── Event types ───────────────────────────────────────────────────────────────
type EventType = 'gang_fight' | 'drive_by' | 'street_race' | 'drug_bust';

interface WorldEvent {
  id: string;
  type: EventType;
  x: number; z: number;
  startTime: number;
  duration: number;   // seconds
  active: boolean;
}

// Mutable event store
export const eventStore = {
  events: [] as WorldEvent[],
  nextEventTime: 0,
};

let _eid = 0;

const EVENT_SPAWN_ZONES = [
  [20, 15], [-20, 15], [35, -10], [-35, -10], [0, 30], [45, 5], [-45, 5],
];

function spawnRandomEvent() {
  const types: EventType[] = ['gang_fight', 'drive_by', 'street_race', 'drug_bust'];
  const type = types[Math.floor(Math.random() * types.length)];
  const zone = EVENT_SPAWN_ZONES[Math.floor(Math.random() * EVENT_SPAWN_ZONES.length)];
  eventStore.events.push({
    id: `evt-${++_eid}`,
    type,
    x: zone[0] + (Math.random() - 0.5) * 8,
    z: zone[1] + (Math.random() - 0.5) * 8,
    startTime: performance.now() / 1000,
    duration: 25 + Math.random() * 20,
    active: true,
  });
  // Keep max 4 simultaneous events
  if (eventStore.events.length > 4) eventStore.events.shift();
}

// ── Gang Fight visual (NPC brawlers circling each other) ──────────────────────
function GangFight({ event }: { event: WorldEvent }) {
  const groupRef = useRef<THREE.Group>(null);
  const t = useRef(0);

  useFrame((_, delta) => {
    t.current += delta;
    if (!groupRef.current) return;

    // Animate fighters in a rough circle
    for (let i = 0; i < groupRef.current.children.length; i++) {
      const child = groupRef.current.children[i] as THREE.Group;
      if (!child) continue;
      const angle = (i / groupRef.current.children.length) * Math.PI * 2 + t.current * 1.5;
      const radius = 1.8 + Math.sin(t.current * 2 + i) * 0.4;
      child.position.x = Math.sin(angle) * radius;
      child.position.z = Math.cos(angle) * radius;
      child.rotation.y = angle + Math.PI;
    }
  });

  const colors = ['#cc2200', '#ff4400', '#881100', '#ff6600', '#cc4400'];
  return (
    <group ref={groupRef} position={[event.x, 0, event.z]}>
      {Array.from({ length: 5 }, (_, i) => (
        <group key={i}>
          <mesh position={[0, 0.85, 0]}>
            <capsuleGeometry args={[0.22, 0.65, 4, 6]} />
            <meshStandardMaterial color={colors[i % colors.length]} />
          </mesh>
          <mesh position={[0, 1.52, 0]}>
            <sphereGeometry args={[0.18, 8, 8]} />
            <meshStandardMaterial color="#e8c8a0" />
          </mesh>
        </group>
      ))}
      {/* Fight dust particles */}
      <pointLight position={[0, 2, 0]} intensity={20} color="#ff4400" distance={8} />
    </group>
  );
}

// ── Drive-By (car driving fast + muzzle flashes) ──────────────────────────────
function DriveBy({ event }: { event: WorldEvent }) {
  const carRef = useRef<THREE.Group>(null);
  const t = useRef(0);
  const flashRef = useRef<THREE.PointLight>(null);

  useFrame((_, delta) => {
    t.current += delta;
    if (!carRef.current) return;

    // Car drives in a circle around the event zone
    const radius = 12;
    const speed = 2.5;
    const angle = t.current * speed;
    carRef.current.position.x = event.x + Math.sin(angle) * radius;
    carRef.current.position.z = event.z + Math.cos(angle) * radius;
    carRef.current.rotation.y = -angle + Math.PI / 2;

    // Random muzzle flash
    if (flashRef.current) {
      flashRef.current.intensity = Math.random() > 0.85 ? 60 : 0;
    }
  });

  return (
    <group ref={carRef} position={[event.x, 0, event.z]}>
      {/* Car body */}
      <mesh position={[0, 0.5, 0]}>
        <boxGeometry args={[1.8, 0.8, 4]} />
        <meshStandardMaterial color="#111" metalness={0.7} roughness={0.3} />
      </mesh>
      <mesh position={[0, 0.95, -0.3]}>
        <boxGeometry args={[1.6, 0.6, 2.2]} />
        <meshStandardMaterial color="#1a1a1a" metalness={0.5} />
      </mesh>
      {/* Wheels */}
      {[[-0.95, 0.3, 1.3], [0.95, 0.3, 1.3], [-0.95, 0.3, -1.3], [0.95, 0.3, -1.3]].map(([wx, wy, wz], i) => (
        <mesh key={i} position={[wx, wy, wz]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.3, 0.3, 0.2, 10]} />
          <meshStandardMaterial color="#222" />
        </mesh>
      ))}
      {/* Muzzle flash */}
      <pointLight ref={flashRef} position={[0.8, 0.9, -1.5]} intensity={0} color="#ffee44" distance={6} />
    </group>
  );
}

// ── Street Race (2 fast cars) ────────────────────────────────────────────────
function StreetRace({ event }: { event: WorldEvent }) {
  const car1Ref = useRef<THREE.Group>(null);
  const car2Ref = useRef<THREE.Group>(null);
  const t = useRef(Math.random() * Math.PI);

  useFrame((_, delta) => {
    t.current += delta;

    if (car1Ref.current) {
      car1Ref.current.position.x = event.x + Math.sin(t.current * 3.2) * 15;
      car1Ref.current.position.z = event.z + Math.cos(t.current * 3.2) * 8;
      car1Ref.current.rotation.y = -t.current * 3.2;
    }
    if (car2Ref.current) {
      car2Ref.current.position.x = event.x + Math.sin(t.current * 3.2 + 0.6) * 15;
      car2Ref.current.position.z = event.z + Math.cos(t.current * 3.2 + 0.6) * 8;
      car2Ref.current.rotation.y = -t.current * 3.2 - 0.6;
    }
  });

  const SportsCar = ({ groupRef, color }: { groupRef: React.RefObject<THREE.Group | null>; color: string }) => (
    <group ref={groupRef}>
      <mesh position={[0, 0.38, 0]}>
        <boxGeometry args={[1.7, 0.6, 3.8]} />
        <meshStandardMaterial color={color} metalness={0.7} roughness={0.2} />
      </mesh>
      <mesh position={[0, 0.75, 0]}>
        <boxGeometry args={[1.5, 0.5, 2]} />
        <meshStandardMaterial color={color} metalness={0.5} />
      </mesh>
      {/* Neon underglow */}
      <pointLight position={[0, -0.1, 0]} intensity={8} color={color} distance={4} />
    </group>
  );

  return (
    <>
      <SportsCar groupRef={car1Ref} color="#ff2200" />
      <SportsCar groupRef={car2Ref} color="#0066ff" />
    </>
  );
}

// ── Drug Bust (police + perp) ─────────────────────────────────────────────────
function DrugBust({ event }: { event: WorldEvent }) {
  const lightRef = useRef<THREE.PointLight>(null);
  const t = useRef(0);

  useFrame((_, delta) => {
    t.current += delta;
    if (lightRef.current) {
      // Alternating red/blue flashing
      const phase = Math.floor(t.current * 3) % 2;
      lightRef.current.color.setHex(phase === 0 ? 0xff2200 : 0x0044ff);
      lightRef.current.intensity = 50 + Math.sin(t.current * 12) * 20;
    }
  });

  return (
    <group position={[event.x, 0, event.z]}>
      {/* Police cruiser */}
      <mesh position={[0, 0.5, 0]}>
        <boxGeometry args={[1.8, 0.8, 4]} />
        <meshStandardMaterial color="#1a1a8a" metalness={0.5} />
      </mesh>
      <mesh position={[0, 1.0, -0.3]}>
        <boxGeometry args={[1.6, 0.55, 2]} />
        <meshStandardMaterial color="#1a1a8a" />
      </mesh>
      {/* Light bar */}
      <pointLight ref={lightRef} position={[0, 1.6, -0.3]} intensity={50} color="#ff2200" distance={12} />

      {/* Officers */}
      {[[-2, 0, 1.5], [2, 0, 1.5]].map(([ox, oy, oz], i) => (
        <group key={i} position={[ox, oy, oz]}>
          <mesh position={[0, 0.85, 0]}>
            <capsuleGeometry args={[0.22, 0.65, 4, 6]} />
            <meshStandardMaterial color="#1a2a8a" />
          </mesh>
          <mesh position={[0, 1.52, 0]}>
            <sphereGeometry args={[0.18, 8, 8]} />
            <meshStandardMaterial color="#e8c8a0" />
          </mesh>
        </group>
      ))}

      {/* Perp on ground */}
      <mesh position={[0, 0.1, 2.5]} rotation={[Math.PI / 2, 0, 0]}>
        <capsuleGeometry args={[0.22, 0.65, 4, 6]} />
        <meshStandardMaterial color="#444" />
      </mesh>
    </group>
  );
}

// ── Event notification toast (HTML overlay) ────────────────────────────────────
interface EventToastProps {
  events: WorldEvent[];
}

export function EventToasts({ events }: EventToastProps) {
  const ICON: Record<EventType, string> = {
    gang_fight: '⚔️ GANG FIGHT NEARBY',
    drive_by: '🚗 DRIVE-BY SHOOTING',
    street_race: '🏎️ STREET RACE',
    drug_bust: '🚔 DRUG BUST IN PROGRESS',
  };

  return (
    <div style={{
      position: 'fixed',
      top: 48,
      left: 8,
      zIndex: 9500,
      display: 'flex',
      flexDirection: 'column',
      gap: 4,
      pointerEvents: 'none',
    }}>
      {events.filter(e => e.active).map(e => (
        <div key={e.id} style={{
          padding: '4px 10px',
          background: 'rgba(0,0,0,0.7)',
          border: '1px solid rgba(255,170,0,0.4)',
          borderRadius: 5,
          fontFamily: "'Orbitron', sans-serif",
          fontSize: 9,
          color: '#ffaa00',
          letterSpacing: 1,
        }}>
          {ICON[e.type]}
        </div>
      ))}
    </div>
  );
}

// ── Main DynamicEvents component ──────────────────────────────────────────────
export function DynamicEvents() {
  useFrame((_, delta) => {
    const now = performance.now() / 1000;

    // Schedule next event
    if (now >= eventStore.nextEventTime) {
      spawnRandomEvent();
      eventStore.nextEventTime = now + 20 + Math.random() * 30;
    }

    // Expire old events
    for (const evt of eventStore.events) {
      if (evt.active && now - evt.startTime > evt.duration) {
        evt.active = false;
      }
    }
  });

  const active = eventStore.events.filter(e => e.active);

  return (
    <>
      {active.map(evt => {
        if (evt.type === 'gang_fight') return <GangFight key={evt.id} event={evt} />;
        if (evt.type === 'drive_by') return <DriveBy key={evt.id} event={evt} />;
        if (evt.type === 'street_race') return <StreetRace key={evt.id} event={evt} />;
        if (evt.type === 'drug_bust') return <DrugBust key={evt.id} event={evt} />;
        return null;
      })}
    </>
  );
}
