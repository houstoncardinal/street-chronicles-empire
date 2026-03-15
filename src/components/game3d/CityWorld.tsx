import { useMemo, useRef, useState } from 'react';
import { RigidBody } from '@react-three/rapier';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { Environment, Stars } from '@react-three/drei';
import { cityInteractions } from '@/data/interactions';
import { seededRandom } from '@/utils/terrain';
import { Headquarters } from './Headquarters';
import { drivingState, parkedPositions } from '@/stores/drivingStore';

// ═══════════════════════════════════════════════════════
// PROCEDURAL TEXTURE GENERATORS
// ═══════════════════════════════════════════════════════

function hexToRgba(hex: string, alpha: string): string {
  // Convert hex to rgba
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function makeWindowTex(seed: number): THREE.CanvasTexture {
  const rng = seededRandom(seed * 7 + 13);
  const W = 256, H = 512;
  const canvas = document.createElement('canvas');
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext('2d')!;

  // Facade base — much lighter
  ctx.fillStyle = '#1a1c30';
  ctx.fillRect(0, 0, W, H);

  // Concrete variation noise
  for (let i = 0; i < 100; i++) {
    ctx.globalAlpha = rng() * 0.18;
    ctx.fillStyle = `rgb(${Math.floor(22 + rng() * 35)},${Math.floor(22 + rng() * 35)},${Math.floor(38 + rng() * 50)})`;
    ctx.fillRect(rng() * W, rng() * H, rng() * 18 + 2, rng() * 6 + 1);
  }
  ctx.globalAlpha = 1;

  // Floor dividers
  const floors = 14 + Math.floor(rng() * 8);
  const cols = 4 + Math.floor(rng() * 4);
  const cellW = W / cols;
  const cellH = H / floors;

  for (let row = 0; row < floors; row++) {
    for (let col = 0; col < cols; col++) {
      const r = rng();
      if (r < 0.08) continue; // dark/off window

      const wx = col * cellW + 3;
      const wy = row * cellH + 3;
      const ww = cellW - 6;
      const wh = cellH - 6;

      let winColor: string;
      const cr = rng();
      if (cr > 0.90) winColor = '#00f0d0';
      else if (cr > 0.82) winColor = '#f000b8';
      else if (cr > 0.75) winColor = '#4488ff';
      else winColor = `rgb(${Math.floor(235 + rng() * 20)},${Math.floor(210 + rng() * 40)},${Math.floor(140 + rng() * 80)})`;

      ctx.globalAlpha = 0.25 + rng() * 0.75;
      ctx.fillStyle = winColor;
      ctx.fillRect(wx, wy, ww, wh);

      // Inner glow
      if (rng() > 0.5) {
        const grd = ctx.createRadialGradient(wx + ww / 2, wy + wh / 2, 0, wx + ww / 2, wy + wh / 2, ww);
        // Convert hex to rgba for gradient, keep rgb as is
        const gradientColor = winColor.startsWith('#') ? hexToRgba(winColor, '0.53') : winColor.replace('rgb', 'rgba').replace(')', ', 0.53)');
        grd.addColorStop(0, gradientColor);
        grd.addColorStop(1, 'transparent');
        ctx.globalAlpha = 0.4;
        ctx.fillStyle = grd;
        ctx.fillRect(wx - ww * 0.5, wy - wh * 0.5, ww * 2, wh * 2);
      }
    }
  }
  ctx.globalAlpha = 1;

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function makeSignTex(label: string, color: string, sub = ''): THREE.CanvasTexture {
  const W = 512, H = 128;
  const canvas = document.createElement('canvas');
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#000308';
  ctx.fillRect(0, 0, W, H);

  // Border
  ctx.strokeStyle = color;
  ctx.lineWidth = 3;
  ctx.strokeRect(3, 3, W - 6, H - 6);

  // Main label
  ctx.font = 'bold 48px monospace';
  ctx.textAlign = 'center';
  ctx.fillStyle = color;
  ctx.shadowColor = color;
  ctx.shadowBlur = 18;
  ctx.fillText(label, W / 2, sub ? 52 : 72);

  if (sub) {
    ctx.font = '22px monospace';
    ctx.fillStyle = '#ffffffaa';
    ctx.shadowBlur = 6;
    ctx.fillText(sub, W / 2, 95);
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function makeRoadTex(): THREE.CanvasTexture {
  const W = 512, H = 512;
  const canvas = document.createElement('canvas');
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext('2d')!;

  // Brighter asphalt base
  ctx.fillStyle = '#181c2e';
  ctx.fillRect(0, 0, W, H);

  // Asphalt grain
  for (let i = 0; i < 800; i++) {
    ctx.fillStyle = `rgba(${Math.floor(20 + Math.random() * 30)},${Math.floor(20 + Math.random() * 35)},${Math.floor(35 + Math.random() * 45)},${Math.random() * 0.6})`;
    const s = Math.random() * 3.5 + 0.5;
    ctx.fillRect(Math.random() * W, Math.random() * H, s, s);
  }

  // Neon puddle reflections — brighter
  const puddles: [string, number, number, number][] = [
    ['#00f0d0', 120, 200, 65], ['#f000b8', 380, 350, 55], ['#4488ff', 200, 440, 70],
    ['#ff6600', 450, 120, 50], ['#ffaa00', 80, 420, 60], ['#44ff88', 300, 100, 45],
  ];
  puddles.forEach(([c, px, py, rad]) => {
    const grd = ctx.createRadialGradient(px, py, 0, px, py, rad);
    const r = parseInt(c.slice(1, 3), 16);
    const g = parseInt(c.slice(3, 5), 16);
    const b = parseInt(c.slice(5, 7), 16);
    grd.addColorStop(0, `rgba(${r}, ${g}, ${b}, 0.45)`);
    grd.addColorStop(0.5, `rgba(${r}, ${g}, ${b}, 0.15)`);
    grd.addColorStop(1, 'transparent');
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, W, H);
  });

  // Subtle lane cracks
  for (let i = 0; i < 12; i++) {
    ctx.strokeStyle = `rgba(40,50,80,${0.3 + Math.random() * 0.3})`;
    ctx.lineWidth = Math.random() * 1.5 + 0.5;
    ctx.beginPath();
    ctx.moveTo(Math.random() * W, Math.random() * H);
    ctx.lineTo(Math.random() * W, Math.random() * H);
    ctx.stroke();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(3, 3);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

// ═══════════════════════════════════════════════════════
// HOLOGRAPHIC BILLBOARD
// ═══════════════════════════════════════════════════════

function HoloBillboard({
  position, heading, subtext, color = '#00f0d0', width = 12, height = 5, rotation = 0
}: {
  position: [number, number, number]; heading: string; subtext: string;
  color?: string; width?: number; height?: number; rotation?: number;
}) {
  const frameRef = useRef(0);
  const [tex] = useState(() => {
    const c = document.createElement('canvas');
    c.width = 512; c.height = 256;
    return new THREE.CanvasTexture(c);
  });

  useFrame(({ clock }) => {
    frameRef.current++;
    if (frameRef.current % 6 !== 0) return;
    const c = tex.image as HTMLCanvasElement;
    const ctx = c.getContext('2d')!;
    const t = clock.elapsedTime;

    ctx.fillStyle = '#000510';
    ctx.fillRect(0, 0, 512, 256);

    // Scan line
    const scanY = (t * 80) % 256;
    ctx.fillStyle = color + '28';
    ctx.fillRect(0, scanY, 512, 8);
    ctx.fillRect(0, (scanY + 4) % 256, 512, 2);

    // Glitch
    const glitch = Math.sin(t * 19.3) > 0.96;

    // Main heading
    ctx.font = 'bold 54px monospace';
    ctx.textAlign = 'center';
    ctx.shadowColor = color;
    ctx.shadowBlur = 22;
    ctx.fillStyle = glitch ? '#f000b8' : color;
    ctx.fillText(heading, glitch ? 256 + (Math.random() - 0.5) * 14 : 256, 90);

    // Subtext
    ctx.font = '26px monospace';
    ctx.fillStyle = '#ffffffbb';
    ctx.shadowBlur = 8;
    ctx.fillText(subtext, 256, 148);

    // Border
    ctx.shadowBlur = 0;
    ctx.strokeStyle = color + 'cc';
    ctx.lineWidth = 3;
    ctx.strokeRect(4, 4, 504, 248);

    // Corner brackets
    ctx.strokeStyle = color;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(4, 30); ctx.lineTo(4, 4); ctx.lineTo(30, 4);
    ctx.moveTo(482, 4); ctx.lineTo(508, 4); ctx.lineTo(508, 30);
    ctx.moveTo(4, 226); ctx.lineTo(4, 252); ctx.lineTo(30, 252);
    ctx.moveTo(482, 252); ctx.lineTo(508, 252); ctx.lineTo(508, 226);
    ctx.stroke();

    // Ticker
    const ticker = 'NEO CITY 2077  //  STREET CHRONICLES  //  EMPIRE STATE  //  NO SNITCHING  //  ';
    const off = -((t * 55) % (ticker.length * 8.5));
    ctx.font = '17px monospace';
    ctx.fillStyle = color + '77';
    ctx.shadowBlur = 4;
    ctx.fillText(ticker + ticker, off + 256, 228);
    ctx.fillText(ticker + ticker, off + 256 + ticker.length * 8.5, 228);

    tex.needsUpdate = true;
  });

  return (
    <group position={position} rotation={[0, rotation, 0]}>
      {/* Back frame */}
      <mesh position={[0, 0, -0.22]}>
        <boxGeometry args={[width + 1.2, height + 1, 0.45]} />
        <meshStandardMaterial color="#0f0f14" metalness={0.85} roughness={0.25} />
      </mesh>
      {/* Display */}
      <mesh>
        <planeGeometry args={[width, height]} />
        <meshBasicMaterial map={tex} toneMapped={false} />
      </mesh>
      {/* Glow */}
      <pointLight position={[0, 0, 0.8]} color={color} intensity={5} distance={22} />
      {/* Support arm */}
      <mesh position={[0, -(height / 2 + 4.5), 0]}>
        <cylinderGeometry args={[0.12, 0.18, 9, 6]} />
        <meshStandardMaterial color="#1a1a22" metalness={0.8} roughness={0.35} />
      </mesh>
    </group>
  );
}

// ═══════════════════════════════════════════════════════
// BACKGROUND SKYSCRAPERS
// ═══════════════════════════════════════════════════════

function Skyscraper({ position, height, accentColor }: {
  position: [number, number, number]; height: number; accentColor: string;
}) {
  const windowTex = useMemo(() => makeWindowTex(position[0] * 17 + position[2] * 11), [position]);

  return (
    <group position={position}>
      {/* Podium */}
      <mesh position={[0, 3.5, 0]}>
        <boxGeometry args={[16, 7, 16]} />
        <meshStandardMaterial color="#080810" roughness={0.8} metalness={0.5} />
      </mesh>
      {/* Tower */}
      <mesh position={[0, height / 2 + 7, 0]}>
        <boxGeometry args={[9, height, 9]} />
        <meshStandardMaterial
          color="#181828"
          roughness={0.48}
          metalness={0.52}
          map={windowTex}
          emissiveMap={windowTex}
          emissiveIntensity={1.8}
        />
      </mesh>
      {/* Spire */}
      <mesh position={[0, height + 7 + 10, 0]}>
        <coneGeometry args={[0.9, 20, 4]} />
        <meshStandardMaterial color="#141420" emissive={accentColor} emissiveIntensity={0.45} metalness={0.9} />
      </mesh>
      {/* Beacon — emissive spire, no extra light */}
    </group>
  );
}

// ═══════════════════════════════════════════════════════
// RAIN
// ═══════════════════════════════════════════════════════

function Rain() {
  const pointsRef = useRef<THREE.Points>(null);
  const count = 200;

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 200;
      pos[i * 3 + 1] = Math.random() * 65;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 200;
    }
    return pos;
  }, []);

  useFrame((_, delta) => {
    if (!pointsRef.current) return;
    const pos = pointsRef.current.geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < count; i++) {
      pos[i * 3 + 1] -= delta * 30;
      if (pos[i * 3 + 1] < 0) pos[i * 3 + 1] = 65;
    }
    pointsRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" array={positions} count={count} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.055} color="#55aaee" transparent opacity={0.32} sizeAttenuation />
    </points>
  );
}

// ═══════════════════════════════════════════════════════
// BUILDING DATA
// ═══════════════════════════════════════════════════════

interface BuildingData {
  x: number; z: number; w: number; d: number; h: number; neonSide: number;
}

// ═══════════════════════════════════════════════════════
// MAIN CITY WORLD
// ═══════════════════════════════════════════════════════

export function CityWorld() {
  const buildings = useMemo(() => {
    const rng = seededRandom(42);
    const result: BuildingData[] = [];

    for (let bx = -3; bx <= 3; bx++) {
      for (let bz = -3; bz <= 3; bz++) {
        if (Math.abs(bx) <= 0 && Math.abs(bz) <= 0) continue;
        if (bx === 0 && bz === -1) continue;
        if (bx === 0 && bz === -2) continue;

        const baseX = bx * 18;
        const baseZ = bz * 18;
        const count = 1 + Math.floor(rng() * 2);

        for (let i = 0; i < count; i++) {
          const w = 5 + rng() * 8;
          const d = 5 + rng() * 8;
          const h = 8 + rng() * 28;
          const x = baseX + (rng() - 0.5) * 7;
          const z = baseZ + (rng() - 0.5) * 7;
          result.push({ x, z, w, d, h, neonSide: Math.floor(rng() * 4) });
        }
      }
    }
    return result;
  }, []);

  const roadTex = useMemo(() => makeRoadTex(), []);

  return (
    <group>
      {/* ── Environment & Atmosphere ── */}
      <Environment preset="city" environmentIntensity={0.7} />
      <Stars radius={150} depth={30} count={300} factor={5} saturation={0.4} fade speed={0.3} />
      <ambientLight intensity={0.88} color="#1a2248" />
      <ambientLight intensity={0.38} color="#2a0a38" />
      <ambientLight intensity={0.24} color="#221408" />
      <hemisphereLight args={['#404090', '#0a0818', 0.80]} />
      <directionalLight position={[40, 80, 30]}  intensity={1.6}  color="#5577ee" castShadow={false} />
      <directionalLight position={[-40, 60, -20]} intensity={0.75} color="#ee5580" castShadow={false} />
      <directionalLight position={[0, 50, 60]}    intensity={0.45} color="#aaaaff" castShadow={false} />
      <fogExp2 attach="fog" args={['#0c0e20', 0.0045]} />

      {/* ── Physics Ground (invisible) ── */}
      <RigidBody type="fixed">
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[300, 300]} />
          <meshStandardMaterial visible={false} />
        </mesh>
      </RigidBody>

      {/* ── Visual Ground ── */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <planeGeometry args={[300, 300]} />
        <meshStandardMaterial color="#111428" roughness={0.82} metalness={0.55} />
      </mesh>

      {/* ── Road surface overlay ── */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.015, 0]}>
        <planeGeometry args={[8, 200]} />
        <meshStandardMaterial map={roadTex} roughness={0.75} metalness={0.25} transparent opacity={0.9} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.015, 0]}>
        <planeGeometry args={[200, 8]} />
        <meshStandardMaterial map={roadTex} roughness={0.75} metalness={0.25} transparent opacity={0.9} />
      </mesh>
      {/* ── Center lane dashes (Z road) ── */}
      {Array.from({ length: 18 }, (_, i) => i * 12 - 108).map(z => (
        <mesh key={`ld-z${z}`} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.022, z]}>
          <planeGeometry args={[0.18, 5]} />
          <meshBasicMaterial color="#ffee44" transparent opacity={0.55} />
        </mesh>
      ))}
      {/* ── Center lane dashes (X road) ── */}
      {Array.from({ length: 18 }, (_, i) => i * 12 - 108).map(x => (
        <mesh key={`ld-x${x}`} rotation={[-Math.PI / 2, 0, 0]} position={[x, 0.022, 0]}>
          <planeGeometry args={[5, 0.18]} />
          <meshBasicMaterial color="#ffee44" transparent opacity={0.55} />
        </mesh>
      ))}

      {/* ── Sidewalks ── */}
      {[-6, 6].map(offset => (
        <mesh key={`swx${offset}`} rotation={[-Math.PI / 2, 0, 0]} position={[offset, 0.04, 0]}>
          <planeGeometry args={[2.5, 200]} />
          <meshStandardMaterial color="#1e2038" roughness={0.92} metalness={0.12} />
        </mesh>
      ))}
      {[-6, 6].map(offset => (
        <mesh key={`swz${offset}`} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.04, offset]}>
          <planeGeometry args={[200, 2.5]} />
          <meshStandardMaterial color="#1e2038" roughness={0.92} metalness={0.12} />
        </mesh>
      ))}
      {/* ── Sidewalk curb edges ── */}
      {([-4.8, 4.8] as number[]).map((x, i) => (
        <mesh key={`curb-x${i}`} position={[x, 0.06, 0]}>
          <boxGeometry args={[0.15, 0.12, 200]} />
          <meshStandardMaterial color="#252840" roughness={0.85} metalness={0.2} />
        </mesh>
      ))}
      {([-4.8, 4.8] as number[]).map((z, i) => (
        <mesh key={`curb-z${i}`} position={[0, 0.06, z]}>
          <boxGeometry args={[200, 0.12, 0.15]} />
          <meshStandardMaterial color="#252840" roughness={0.85} metalness={0.2} />
        </mesh>
      ))}

      {/* ── Neon Road Edge Strips ── */}
      {([-4.3, 4.3] as number[]).map((x, i) => (
        <mesh key={`rs-x${i}`} rotation={[-Math.PI / 2, 0, 0]} position={[x, 0.018, 0]}>
          <planeGeometry args={[0.22, 200]} />
          <meshBasicMaterial color={i === 0 ? '#00f0d0' : '#f000b8'} transparent opacity={0.88} />
        </mesh>
      ))}
      {([-4.3, 4.3] as number[]).map((z, i) => (
        <mesh key={`rs-z${i}`} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.018, z]}>
          <planeGeometry args={[200, 0.22]} />
          <meshBasicMaterial color={i === 0 ? '#4488ff' : '#ffaa00'} transparent opacity={0.88} />
        </mesh>
      ))}

      {/* ── Crosswalk stripes ── */}
      {([-25, 0, 25] as number[]).map(z =>
        Array.from({ length: 7 }, (_, i) => (
          <mesh key={`cw-${z}-${i}`} rotation={[-Math.PI / 2, 0, 0]} position={[-3 + i * 1, 0.022, z]}>
            <planeGeometry args={[0.55, 2.2]} />
            <meshBasicMaterial color="#e0e8ff" transparent opacity={0.38} />
          </mesh>
        ))
      )}
      {/* Crosswalk horizontal for X-road */}
      {([-25, 0, 25] as number[]).map(x =>
        Array.from({ length: 7 }, (_, i) => (
          <mesh key={`cwx-${x}-${i}`} rotation={[-Math.PI / 2, 0, 0]} position={[x, 0.022, -3 + i * 1]}>
            <planeGeometry args={[2.2, 0.55]} />
            <meshBasicMaterial color="#e0e8ff" transparent opacity={0.38} />
          </mesh>
        ))
      )}

      {/* ── HQ ── */}
      <Headquarters />

      {/* ── Store Buildings ── */}
      <DealershipBuilding position={[25, 0, -45]} />
      <ArmoryBuilding position={[-40, 0, 10]} />
      <MusicStoreBuilding position={[-15, 0, -45]} />
      <ToolShopBuilding position={[40, 0, 30]} />

      {/* ── Cafe & Drug ── */}
      <ChromeCafeBuilding position={[-45, 0, -20]} />
      <NoodleBarBuilding position={[18, 0, 45]} />
      <DrugAlley position={[-22, 0, -55]} />
      <DrugAlley position={[45, 0, 10]} />

      {/* ── Nightclub & Food ── */}
      <NightClubBuilding position={[35, 0, -35]} />
      <TrapKitchenTruck position={[55, 0, 20]} />

      {/* ── Graffiti & Street Art ── */}
      <GraffitiDecals />

      {/* ── Procedural Buildings ── */}
      {buildings.map((b, i) => (
        <Building key={i} data={b} seed={i} />
      ))}

      {/* ── Background Skyscrapers ── */}
      <Skyscraper position={[90, 0, -90]} height={75} accentColor="#00f0d0" />
      <Skyscraper position={[-90, 0, -90]} height={60} accentColor="#f000b8" />
      <Skyscraper position={[90, 0, 90]} height={50} accentColor="#4488ff" />
      <Skyscraper position={[-90, 0, 90]} height={65} accentColor="#ff6600" />
      <Skyscraper position={[0, 0, -115]} height={90} accentColor="#00f0d0" />
      <Skyscraper position={[115, 0, 0]} height={70} accentColor="#ffaa00" />
      <Skyscraper position={[-115, 0, 0]} height={55} accentColor="#f000b8" />
      <Skyscraper position={[0, 0, 115]} height={48} accentColor="#44ffaa" />

      {/* ── Holographic Billboards ── */}
      <HoloBillboard position={[12, 22, -48]} heading="NEO CITY 2077" subtext="POPULATION: 2.5 MILLION" color="#00f0d0" />
      <HoloBillboard position={[-50, 18, -22]} heading="CHROME CAFE" subtext="BUFFS · BREWS · UPGRADES" color="#00f0d0" rotation={Math.PI / 2} />
      <HoloBillboard position={[28, 20, -42]} heading="CYBER AUTO" subtext="BUY · SELL · RACE" color="#00ff88" rotation={0.3} />
      <HoloBillboard position={[-42, 16, 8]} heading="ARMORY" subtext="WEAPONS & CYBER GEAR" color="#ff4444" rotation={Math.PI / 2} />
      <HoloBillboard position={[0, 28, -20]} heading="STREET CHRONICLES" subtext="THE EMPIRE" color="#f000b8" />
      <HoloBillboard position={[-25, 19, -52]} heading="BLACK MARKET" subtext="CONNECT · SUPPLY · SURVIVE" color="#f000b8" rotation={0.15} />

      {/* ── Neon City Lights (4 key lights only) ── */}
      <pointLight position={[0, 8, -30]}  color="#f000b8" intensity={55}  distance={90} />
      <pointLight position={[0, 7, 28]}   color="#00f0d0" intensity={48}  distance={85} />
      <pointLight position={[48, 8, 0]}   color="#4488ff" intensity={45}  distance={80} />
      <pointLight position={[-48, 8, 0]}  color="#ffaa00" intensity={45}  distance={80} />
      {/* Center fill — white */}
      <pointLight position={[0, 6, 0]}    color="#ffffff" intensity={22}  distance={50} />

      {/* ── DeeBaby Corner ── */}
      <pointLight position={[-30, 5, 20]} color="#ff6600" intensity={12} distance={20} />
      <DeeBabyCorner />


{/* ── Street Lights ── */}
      <StreetLights />

      {/* ── Interaction Markers — skip cars & citizens (too many, purely cosmetic) ── */}
      {cityInteractions.filter(p => p.type !== 'car' && p.type !== 'citizen').map(point => (
        <InteractionMarker key={point.id} position={point.position} type={point.type} />
      ))}

      {/* ── Street Props ── */}
      <StreetProps />

      {/* ── NPCs ── */}
      <NPCs />
      <StoreNPCs />
      <StreetCitizens />

      {/* ── Driveable Cars ── */}
      <DrivableCars />

      {/* ── Traffic Lights ── */}
      <TrafficLights />

      {/* ── Hover Traffic ── */}
      <HoverTraffic />

      {/* ── Rain ── */}
      <Rain />
    </group>
  );
}

// ═══════════════════════════════════════════════════════
// BUILDING (Procedural with window textures)
// ═══════════════════════════════════════════════════════

function Building({ data, seed }: { data: BuildingData; seed: number }) {
  const { x, z, w, d, h, neonSide } = data;
  const windowTex = useMemo(() => makeWindowTex(seed), [seed]);
  const neonColors = ['#00f0d0', '#f000b8', '#ff6600', '#4488ff', '#ffaa00', '#44ff88'];
  const neonColor = neonColors[seed % neonColors.length];

  const neonX = neonSide === 0 ? w / 2 + 0.07 : neonSide === 1 ? -w / 2 - 0.07 : 0;
  const neonZ = neonSide === 2 ? d / 2 + 0.07 : neonSide === 3 ? -d / 2 - 0.07 : 0;
  const neonRotY = neonSide >= 2 ? Math.PI / 2 : 0;

  return (
    <group>
      <RigidBody type="fixed" position={[x, h / 2, z]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[w, h, d]} />
          <meshStandardMaterial
            color="#1c1c32"
            roughness={0.58}
            metalness={0.42}
            map={windowTex}
            emissiveMap={windowTex}
            emissiveIntensity={1.6}
          />
        </mesh>
      </RigidBody>

      {/* Neon horizontal band */}
      <mesh position={[x + neonX, h * 0.18, z + neonZ]} rotation={[0, neonRotY, 0]}>
        <planeGeometry args={[w * 0.65, 0.3]} />
        <meshBasicMaterial color={neonColor} transparent opacity={0.98} />
      </mesh>
      {/* Second neon band at different height */}
      <mesh position={[x + neonX, h * 0.55, z + neonZ]} rotation={[0, neonRotY, 0]}>
        <planeGeometry args={[w * 0.4, 0.18]} />
        <meshBasicMaterial color={neonColor} transparent opacity={0.7} />
      </mesh>
      {/* Rooftop glow strip */}
      <mesh position={[x, h + 0.1, z]}>
        <boxGeometry args={[w, 0.12, d]} />
        <meshBasicMaterial color={neonColor} transparent opacity={0.5} />
      </mesh>
    </group>
  );
}

// ═══════════════════════════════════════════════════════
// STORE BUILDINGS
// ═══════════════════════════════════════════════════════

function DealershipBuilding({ position }: { position: [number, number, number] }) {
  const platformRef = useRef<THREE.Group>(null);
  const signTex = useMemo(() => makeSignTex('CYBER AUTO', '#00ff88', 'BUY · SELL · RACE'), []);

  useFrame((_, delta) => {
    if (platformRef.current) platformRef.current.rotation.y += delta * 0.45;
  });

  return (
    <group position={position}>
      <RigidBody type="fixed" position={[0, 5, 0]}>
        <mesh castShadow>
          <boxGeometry args={[14, 10, 12]} />
          <meshStandardMaterial color="#080812" roughness={0.5} metalness={0.5} />
        </mesh>
      </RigidBody>
      {/* Glass front */}
      <mesh position={[0, 4, 6.06]}>
        <planeGeometry args={[12, 8]} />
        <meshStandardMaterial color="#1a3a5a" transparent opacity={0.25} metalness={0.9} roughness={0.05} />
      </mesh>
      {/* Sign panel */}
      <mesh position={[0, 8.8, 6.1]}>
        <planeGeometry args={[10, 2.2]} />
        <meshBasicMaterial map={signTex} toneMapped={false} />
      </mesh>
      <pointLight position={[0, 9, 7]} color="#00ff88" intensity={10} distance={18} />

      {/* Showroom platform */}
      <group ref={platformRef} position={[0, 0.32, 0]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[3.2, 3.2, 0.18, 36]} />
          <meshStandardMaterial color="#1a1a2e" metalness={0.7} roughness={0.25} emissive="#001a10" emissiveIntensity={0.5} />
        </mesh>
        {/* Car body */}
        <mesh position={[0, 0.65, 0]}>
          <boxGeometry args={[2.2, 0.75, 3.8]} />
          <meshStandardMaterial color="#1a0535" metalness={0.6} roughness={0.3} />
        </mesh>
        <mesh position={[0, 1.28, -0.25]}>
          <boxGeometry args={[2, 0.6, 2]} />
          <meshStandardMaterial color="#1a0535" metalness={0.6} roughness={0.3} />
        </mesh>
      </group>

      {/* Side display vehicles */}
      {[-4.5, 4.5].map(x => (
        <group key={x} position={[x, 0, 0]}>
          <mesh position={[0, 0.55, 0]}>
            <boxGeometry args={[1.6, 0.6, 2.8]} />
            <meshStandardMaterial color="#1a1a2e" metalness={0.4} />
          </mesh>
        </group>
      ))}

      {/* Canopy */}
      <mesh position={[0, -0.4, 7.2]}>
        <boxGeometry args={[15, 0.3, 3.5]} />
        <meshStandardMaterial color="#00ff88" transparent opacity={0.2} emissive="#00ff88" emissiveIntensity={0.3} />
      </mesh>
    </group>
  );
}

function ArmoryBuilding({ position }: { position: [number, number, number] }) {
  const signTex = useMemo(() => makeSignTex('ARMORY', '#ff4444', 'WEAPONS & CYBER GEAR'), []);

  return (
    <group position={position}>
      <RigidBody type="fixed" position={[0, 4.5, 0]}>
        <mesh castShadow>
          <boxGeometry args={[10, 9, 10]} />
          <meshStandardMaterial color="#0a0808" roughness={0.8} metalness={0.35} />
        </mesh>
      </RigidBody>
      {/* Reinforced door */}
      <mesh position={[0, 2.5, 5.06]}>
        <boxGeometry args={[3, 5, 0.3]} />
        <meshStandardMaterial color="#1a1a1a" metalness={0.8} roughness={0.2} />
      </mesh>
      {/* Sign */}
      <mesh position={[0, 7.8, 5.12]}>
        <planeGeometry args={[8, 2]} />
        <meshBasicMaterial map={signTex} toneMapped={false} />
      </mesh>
      {/* Weapon racks */}
      {[-3, 0, 3].map(x => (
        <group key={x} position={[x, 3, -4.2]}>
          <mesh>
            <boxGeometry args={[0.08, 4.5, 0.5]} />
            <meshStandardMaterial color="#2a2a2a" metalness={0.7} />
          </mesh>
          {[0.9, 1.7, 2.5].map(y => (
            <mesh key={y} position={[0, y - 1.2, 0.32]}>
              <boxGeometry args={[0.9, 0.1, 0.15]} />
              <meshStandardMaterial color="#555" metalness={0.85} emissive="#110000" emissiveIntensity={0.4} />
            </mesh>
          ))}
        </group>
      ))}
      {/* Glass cases */}
      {[-2.5, 2.5].map(x => (
        <mesh key={x} position={[x, 1.2, 0]}>
          <boxGeometry args={[2, 1.2, 1.5]} />
          <meshStandardMaterial color="#1a2a3a" transparent opacity={0.18} metalness={0.95} roughness={0.04} />
        </mesh>
      ))}
    </group>
  );
}

function MusicStoreBuilding({ position }: { position: [number, number, number] }) {
  const hologramRef = useRef<THREE.Group>(null);
  const signTex = useMemo(() => makeSignTex('DIGITAL MUSIC', '#9b59b6', 'STREAMS · DROPS · CULTURE'), []);

  useFrame((state) => {
    if (hologramRef.current) {
      hologramRef.current.position.y = 6.2 + Math.sin(state.clock.elapsedTime * 1.4) * 0.35;
      hologramRef.current.rotation.y = state.clock.elapsedTime * 0.75;
    }
  });

  return (
    <group position={position}>
      <RigidBody type="fixed" position={[0, 5, 0]}>
        <mesh castShadow>
          <boxGeometry args={[12, 10, 10]} />
          <meshStandardMaterial color="#0a0515" roughness={0.55} metalness={0.4} />
        </mesh>
      </RigidBody>
      <mesh position={[0, 8.8, 5.12]}>
        <planeGeometry args={[10, 2.2]} />
        <meshBasicMaterial map={signTex} toneMapped={false} />
      </mesh>
      {/* Floating album */}
      <group ref={hologramRef} position={[0, 6.2, 0]}>
        <mesh>
          <boxGeometry args={[2.2, 2.2, 0.06]} />
          <meshStandardMaterial color="#9b59b6" transparent opacity={0.55} emissive="#9b59b6" emissiveIntensity={0.5} />
        </mesh>
      </group>
      {[[-3.2, 4.5, 2], [3.2, 5.2, -2], [-2, 5.8, -3.2], [2.2, 4.2, 3]].map(([x, y, z], i) => (
        <FloatingAlbum key={i} position={[x, y, z]} delay={i * 0.5} />
      ))}
      {/* Listening stations */}
      {[-3, 0, 3].map(x => (
        <group key={x} position={[x, 0, 3.2]}>
          <mesh position={[0, 0.65, 0]}>
            <cylinderGeometry args={[0.52, 0.52, 1.3, 10]} />
            <meshStandardMaterial color="#1a0a2e" emissive="#9b59b6" emissiveIntensity={0.35} metalness={0.65} />
          </mesh>
        </group>
      ))}
      {/* DJ booth */}
      <mesh position={[0, 1, -3.8]}>
        <boxGeometry args={[4.5, 1.5, 2.2]} />
        <meshStandardMaterial color="#1a0a2e" metalness={0.55} emissive="#9b59b6" emissiveIntensity={0.1} />
      </mesh>
      {/* Floor ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]}>
        <ringGeometry args={[3.2, 3.5, 20]} />
        <meshBasicMaterial color="#9b59b6" transparent opacity={0.4} />
      </mesh>
    </group>
  );
}

function FloatingAlbum({ position, delay }: { position: [number, number, number]; delay: number }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (ref.current) {
      ref.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 1.2 + delay) * 0.45;
      ref.current.rotation.y = state.clock.elapsedTime * 0.55 + delay;
    }
  });
  return (
    <mesh ref={ref} position={position}>
      <boxGeometry args={[1.3, 1.3, 0.05]} />
      <meshStandardMaterial color="#9b59b6" transparent opacity={0.5} emissive="#9b59b6" emissiveIntensity={0.3} />
    </mesh>
  );
}

function ToolShopBuilding({ position }: { position: [number, number, number] }) {
  const signTex = useMemo(() => makeSignTex('GEAR & TOOLS', '#FFD700', 'HACK · SCAN · BREACH'), []);

  return (
    <group position={position}>
      <RigidBody type="fixed" position={[0, 4, 0]}>
        <mesh castShadow>
          <boxGeometry args={[9, 8, 9]} />
          <meshStandardMaterial color="#0a0f0a" roughness={0.75} metalness={0.3} />
        </mesh>
      </RigidBody>
      <mesh position={[0, 6.8, 4.6]}>
        <planeGeometry args={[7.5, 2]} />
        <meshBasicMaterial map={signTex} toneMapped={false} />
      </mesh>
      {[-2, 0, 2].map(x => (
        <group key={x} position={[x, 1.2, 0]}>
          <mesh>
            <boxGeometry args={[1.5, 1.8, 1]} />
            <meshStandardMaterial color="#1a1a0a" metalness={0.5} emissive="#111100" emissiveIntensity={0.3} />
          </mesh>
          <mesh position={[0, 1.25, 0]} rotation={[0, 0, Math.PI / 4]}>
            <boxGeometry args={[0.1, 0.85, 0.1]} />
            <meshStandardMaterial color="#aaa" metalness={0.75} />
          </mesh>
        </group>
      ))}
      <mesh position={[0, -0.4, 5.6]}>
        <boxGeometry args={[10, 0.3, 2.2]} />
        <meshStandardMaterial color="#FFD700" transparent opacity={0.22} emissive="#FFD700" emissiveIntensity={0.2} />
      </mesh>
    </group>
  );
}

// ═══════════════════════════════════════════════════════
// CAFE & DRUG BUILDINGS
// ═══════════════════════════════════════════════════════

function ChromeCafeBuilding({ position }: { position: [number, number, number] }) {
  const signRef = useRef<THREE.Mesh>(null);
  const signTex = useMemo(() => makeSignTex('CHROME CAFE', '#00f0d0', 'BUFFS · BREWS · STIMS'), []);

  useFrame((state) => {
    if (signRef.current) {
      const flicker = Math.sin(state.clock.elapsedTime * 9) > 0.96 ? 0.45 : 1;
      (signRef.current.material as THREE.MeshBasicMaterial).opacity = flicker;
    }
  });

  return (
    <group position={position}>
      <RigidBody type="fixed" position={[0, 3.5, 0]}>
        <mesh castShadow>
          <boxGeometry args={[9, 7, 8]} />
          <meshStandardMaterial color="#050910" roughness={0.65} metalness={0.4} />
        </mesh>
      </RigidBody>
      <mesh ref={signRef} position={[0, 6.8, 4.12]}>
        <planeGeometry args={[7.5, 2]} />
        <meshBasicMaterial map={signTex} toneMapped={false} transparent />
      </mesh>
      {/* Awning */}
      <mesh position={[0, 1.8, 5.3]}>
        <boxGeometry args={[10, 0.2, 3]} />
        <meshStandardMaterial color="#00f0d0" transparent opacity={0.22} emissive="#00f0d0" emissiveIntensity={0.3} />
      </mesh>
      {/* Outdoor tables */}
      {[-2.5, 0, 2.5].map(x => (
        <group key={x} position={[x, 0, 6.2]}>
          <mesh position={[0, 0.65, 0]}>
            <cylinderGeometry args={[0.45, 0.45, 0.06, 10]} />
            <meshStandardMaterial color="#1a2828" metalness={0.75} emissive="#002222" emissiveIntensity={0.3} />
          </mesh>
          <mesh position={[0, 0.3, 0]}>
            <cylinderGeometry args={[0.04, 0.04, 0.62, 6]} />
            <meshStandardMaterial color="#333" metalness={0.85} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function NoodleBarBuilding({ position }: { position: [number, number, number] }) {
  const signTex = useMemo(() => makeSignTex('NOODLE BAR', '#ff6622', 'SYNTH FOOD · REAL FLAVOR'), []);

  return (
    <group position={position}>
      <RigidBody type="fixed" position={[0, 3, 0]}>
        <mesh castShadow>
          <boxGeometry args={[8, 6, 7]} />
          <meshStandardMaterial color="#0a0505" roughness={0.78} metalness={0.25} />
        </mesh>
      </RigidBody>
      <mesh position={[0, 5.7, 3.62]}>
        <planeGeometry args={[6.5, 2]} />
        <meshBasicMaterial map={signTex} toneMapped={false} />
      </mesh>
      <mesh position={[0, 4, 3.85]}>
        <cylinderGeometry args={[0.04, 0.32, 1.6, 8]} />
        <meshBasicMaterial color="#ff6622" transparent opacity={0.14} />
      </mesh>
      <mesh position={[0, 1.5, 4.6]}>
        <boxGeometry args={[9, 0.2, 2.5]} />
        <meshStandardMaterial color="#cc4400" transparent opacity={0.28} emissive="#662200" emissiveIntensity={0.3} />
      </mesh>
    </group>
  );
}

function DrugAlley({ position }: { position: [number, number, number] }) {
  const glowRef = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (glowRef.current) {
      const flicker = Math.sin(state.clock.elapsedTime * 16 + position[0]) > 0.94 ? 0.15 : 1;
      (glowRef.current.material as THREE.MeshBasicMaterial).opacity = 0.88 * flicker;
    }
  });

  return (
    <group position={position}>
      <RigidBody type="fixed" position={[0, 3.5, -2.5]}>
        <mesh castShadow>
          <boxGeometry args={[7, 7, 0.4]} />
          <meshStandardMaterial color="#060606" roughness={0.98} />
        </mesh>
      </RigidBody>
      <RigidBody type="fixed" position={[-3.5, 3.5, 0]}>
        <mesh castShadow>
          <boxGeometry args={[0.4, 7, 5]} />
          <meshStandardMaterial color="#060606" roughness={0.98} />
        </mesh>
      </RigidBody>
      <RigidBody type="fixed" position={[3.5, 3.5, 0]}>
        <mesh castShadow>
          <boxGeometry args={[0.4, 7, 5]} />
          <meshStandardMaterial color="#060606" roughness={0.98} />
        </mesh>
      </RigidBody>
      <mesh ref={glowRef} position={[0, 5.5, -2.3]}>
        <planeGeometry args={[5, 0.65]} />
        <meshBasicMaterial color="#f000b8" transparent opacity={0.88} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]}>
        <ringGeometry args={[1.25, 1.75, 18]} />
        <meshBasicMaterial color="#f000b8" transparent opacity={0.22} />
      </mesh>
      {[-1.8, 1.8].map(x => (
        <mesh key={x} position={[x, 0.52, -1.2]}>
          <cylinderGeometry args={[0.28, 0.28, 1.05, 8]} />
          <meshStandardMaterial color="#151500" roughness={0.92} />
        </mesh>
      ))}
      {[0, 0.55].map((y, i) => (
        <mesh key={i} position={[0, 0.3 + y, -2]}>
          <boxGeometry args={[0.6 - i * 0.08, 0.5, 0.5]} />
          <meshStandardMaterial color="#0f0f00" roughness={0.96} />
        </mesh>
      ))}
    </group>
  );
}

// ═══════════════════════════════════════════════════════
// DEEBABY CORNER
// ═══════════════════════════════════════════════════════

function DeeBabyCorner() {
  const signRef = useRef<THREE.Mesh>(null);
  const signTex = useMemo(() => makeSignTex('H-TOWN', '#ff6600', "PEOPLE'S CHAMP"), []);

  useFrame((state) => {
    if (signRef.current) {
      const t = state.clock.elapsedTime;
      const flicker = Math.sin(t * 12) > 0.97 ? 0.3 : 1;
      (signRef.current.material as THREE.MeshBasicMaterial).opacity = 0.92 * flicker;
    }
  });

  return (
    <group position={[-30, 0, 18]}>
      <RigidBody type="fixed">
        <mesh position={[0, 3, -2]} castShadow>
          <boxGeometry args={[8, 6, 0.4]} />
          <meshStandardMaterial color="#0d0804" roughness={0.96} />
        </mesh>
      </RigidBody>
      <RigidBody type="fixed">
        <mesh position={[-4, 3, 0]} castShadow>
          <boxGeometry args={[0.4, 6, 4]} />
          <meshStandardMaterial color="#0d0804" roughness={0.96} />
        </mesh>
      </RigidBody>
      <mesh ref={signRef} position={[0, 5, -1.78]}>
        <planeGeometry args={[6, 2]} />
        <meshBasicMaterial map={signTex} toneMapped={false} transparent />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]}>
        <ringGeometry args={[2.1, 2.6, 22]} />
        <meshBasicMaterial color="#ff6600" transparent opacity={0.28} />
      </mesh>
      {[[-1.5, 0], [1.5, 0.3], [-2.5, 0.5]].map(([x, y], i) => (
        <mesh key={i} position={[x, 0.22 + y * 0.3, -0.5]} castShadow>
          <boxGeometry args={[0.5, 0.4, 0.5]} />
          <meshStandardMaterial color="#1a0a00" roughness={0.92} />
        </mesh>
      ))}
    </group>
  );
}

// ═══════════════════════════════════════════════════════
// STREET LIGHTS
// ═══════════════════════════════════════════════════════

function StreetLights() {
  const positions = useMemo(() => {
    const pts: [number, number, number][] = [];
    for (let i = -4; i <= 4; i++) {
      if (i === 0) continue;
      pts.push([7.5, 0, i * 15]);
      pts.push([-7.5, 0, i * 15]);
    }
    return pts;
  }, []);

  return (
    <>
      {positions.map((pos, i) => (
        <group key={i} position={pos}>
          {/* Pole */}
          <mesh position={[0, 3, 0]}>
            <cylinderGeometry args={[0.06, 0.09, 6.5, 6]} />
            <meshStandardMaterial color="#222" metalness={0.85} roughness={0.3} />
          </mesh>
          {/* Arm */}
          <mesh position={[pos[0] < 0 ? 0.6 : -0.6, 6.3, 0]} rotation={[0, 0, pos[0] < 0 ? -0.15 : 0.15]}>
            <cylinderGeometry args={[0.04, 0.04, 1.4, 5]} />
            <meshStandardMaterial color="#222" metalness={0.85} roughness={0.3} />
          </mesh>
          {/* Lamp head */}
          <mesh position={[pos[0] < 0 ? 1.1 : -1.1, 6.6, 0]}>
            <boxGeometry args={[0.5, 0.2, 0.5]} />
            <meshStandardMaterial color="#1a1a1a" emissive="#ffddaa" emissiveIntensity={2.5} />
          </mesh>
        </group>
      ))}
    </>
  );
}

// ═══════════════════════════════════════════════════════
// INTERACTION MARKER
// ═══════════════════════════════════════════════════════

function InteractionMarker({ position, type }: { position: [number, number, number]; type: string }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);

  const color = type === 'travel' ? '#00ff88'
    : type === 'mission' ? '#f000b8'
    : type === 'recruit' ? '#ffaa00'
    : type === 'character' ? '#44ddff'
    : type === 'store' ? '#9b59b6'
    : type === 'cafe' ? '#00f0d0'
    : type === 'drugmarket' ? '#ff8800'
    : type === 'meetup' ? '#ff6600'
    : '#f000b8';

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 2.2;
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 3) * 0.32;
    }
    if (ringRef.current) {
      ringRef.current.rotation.z += delta * 0.8;
    }
  });

  return (
    <group position={[position[0], 0, position[2]]}>
      {/* Vertical beam */}
      <mesh position={[0, 0.6, 0]}>
        <cylinderGeometry args={[0.08, 0.08, 1.2, 6]} />
        <meshBasicMaterial color={color} transparent opacity={0.28} />
      </mesh>
      {/* Spinning octahedron */}
      <mesh ref={meshRef} position={[0, position[1], 0]}>
        <octahedronGeometry args={[0.35]} />
        <meshBasicMaterial color={color} transparent opacity={0.85} />
      </mesh>
      {/* Ground ring */}
      <mesh ref={ringRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]}>
        <ringGeometry args={[0.75, 1.05, 18]} />
        <meshBasicMaterial color={color} transparent opacity={0.22} />
      </mesh>
      {/* Inner dot */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.04, 0]}>
        <circleGeometry args={[0.15, 8]} />
        <meshBasicMaterial color={color} transparent opacity={0.5} />
      </mesh>
    </group>
  );
}

// ═══════════════════════════════════════════════════════
// NPCs
// ═══════════════════════════════════════════════════════

function NPCs() {
  const npcData = useMemo(() => {
    const rng = seededRandom(99);
    return Array.from({ length: 5 }, (_, i) => ({
      x: (rng() - 0.5) * 80,
      z: (rng() - 0.5) * 80,
      color: ['#44aaff', '#aaaaaa', '#ff6644', '#44ffaa', '#dddddd', '#ff44aa'][i % 6],
      accent: ['#00f0d0', '#f000b8', '#ffaa00', '#4488ff', '#ff6600', '#44ff88'][i % 6],
    }));
  }, []);

  return (
    <>
      {npcData.map((npc, i) => (
        <CyberpunkNPC key={i} x={npc.x} z={npc.z} color={npc.color} accent={npc.accent} seed={i} />
      ))}
    </>
  );
}

function StoreNPCs() {
  const storeNPCs = useMemo(() => [
    { x: 23, z: -43, color: '#44ddff', accent: '#00ff88', seed: 100 },
    { x: 27, z: -47, color: '#cccccc', accent: '#00ff88', seed: 101 },
    { x: -38, z: 12, color: '#ff4444', accent: '#ff4444', seed: 102 },
    { x: -42, z: 8, color: '#888888', accent: '#ff4444', seed: 103 },
    { x: -13, z: -43, color: '#cc88ff', accent: '#9b59b6', seed: 104 },
    { x: -17, z: -47, color: '#9b59b6', accent: '#9b59b6', seed: 105 },
    { x: 38, z: 28, color: '#FFD700', accent: '#FFD700', seed: 106 },
    { x: 42, z: 32, color: '#aaaaaa', accent: '#FFD700', seed: 107 },
  ], []);

  return (
    <>
      {storeNPCs.map((npc, i) => (
        <CyberpunkNPC key={`store-${i}`} x={npc.x} z={npc.z} color={npc.color} accent={npc.accent} seed={npc.seed} />
      ))}
    </>
  );
}

function CyberpunkNPC({ x, z, color, accent, seed }: {
  x: number; z: number; color: string; accent: string; seed: number;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const leftLegRef = useRef<THREE.Mesh>(null);
  const rightLegRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!groupRef.current) return;
    // Distance cull — skip animation when far from player
    const pdx = groupRef.current.position.x - (state.camera.position.x);
    const pdz = groupRef.current.position.z - (state.camera.position.z);
    if (pdx * pdx + pdz * pdz > 2000) { groupRef.current.visible = false; return; }
    groupRef.current.visible = true;
    const t = state.clock.elapsedTime + seed * 100;
    const newX = x + Math.sin(t * 0.28 + seed) * 3.5;
    const newZ = z + Math.cos(t * 0.22 + seed) * 3.5;

    const dx = newX - groupRef.current.position.x;
    const dz = newZ - groupRef.current.position.z;
    groupRef.current.position.x = newX;
    groupRef.current.position.z = newZ;

    if (Math.abs(dx) + Math.abs(dz) > 0.01) {
      groupRef.current.rotation.y = Math.atan2(dx, dz);
    }

    const legSwing = Math.sin(t * 4) * 0.35;
    if (leftLegRef.current) leftLegRef.current.rotation.x = legSwing;
    if (rightLegRef.current) rightLegRef.current.rotation.x = -legSwing;
  });

  return (
    <group ref={groupRef} position={[x, 0, z]}>
      {/* Legs */}
      <mesh ref={leftLegRef} position={[-0.1, 0.38, 0]}>
        <boxGeometry args={[0.15, 0.72, 0.17]} />
        <meshStandardMaterial color={color} roughness={0.7} />
      </mesh>
      <mesh ref={rightLegRef} position={[0.1, 0.38, 0]}>
        <boxGeometry args={[0.15, 0.72, 0.17]} />
        <meshStandardMaterial color={color} roughness={0.7} />
      </mesh>
      {/* Torso */}
      <mesh position={[0, 1.05, 0]}>
        <boxGeometry args={[0.42, 0.65, 0.26]} />
        <meshStandardMaterial color={color} roughness={0.6} metalness={0.25} />
      </mesh>
      {/* Cyber chest strip */}
      <mesh position={[0, 1.1, 0.14]}>
        <planeGeometry args={[0.28, 0.08]} />
        <meshBasicMaterial color={accent} transparent opacity={0.9} />
      </mesh>
      {/* Arms */}
      <mesh position={[-0.31, 0.95, 0]}>
        <boxGeometry args={[0.13, 0.6, 0.14]} />
        <meshStandardMaterial color={color} roughness={0.7} />
      </mesh>
      <mesh position={[0.31, 0.95, 0]}>
        <boxGeometry args={[0.13, 0.6, 0.14]} />
        <meshStandardMaterial color={color} roughness={0.7} />
      </mesh>
      {/* Neck */}
      <mesh position={[0, 1.47, 0]}>
        <boxGeometry args={[0.13, 0.18, 0.13]} />
        <meshStandardMaterial color={color} roughness={0.8} />
      </mesh>
      {/* Head */}
      <mesh position={[0, 1.73, 0]}>
        <boxGeometry args={[0.3, 0.3, 0.27]} />
        <meshStandardMaterial color={color} roughness={0.75} />
      </mesh>
      {/* Cyber eye glow */}
      <mesh position={[-0.06, 1.75, 0.14]}>
        <planeGeometry args={[0.05, 0.03]} />
        <meshBasicMaterial color={accent} transparent opacity={0.95} />
      </mesh>
      <mesh position={[0.06, 1.75, 0.14]}>
        <planeGeometry args={[0.05, 0.03]} />
        <meshBasicMaterial color={accent} transparent opacity={0.95} />
      </mesh>
    </group>
  );
}

// ═══════════════════════════════════════════════════════
// NIGHTCLUB
// ═══════════════════════════════════════════════════════

function NightClubBuilding({ position }: { position: [number, number, number] }) {
  const glowRef = useRef<THREE.Mesh>(null);
  const archRef = useRef<THREE.Mesh>(null);
  const signTex = useMemo(() => makeSignTex('KLUB NEON', '#f000b8', 'DANCE · VIBE · SURVIVE'), []);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (glowRef.current) {
      const r = Math.sin(t * 1.4) * 0.5 + 0.5;
      const b = Math.sin(t * 1.4 + 2.1) * 0.5 + 0.5;
      (glowRef.current.material as THREE.MeshBasicMaterial).color.setRGB(r * 0.6, 0.05, b);
    }
    if (archRef.current) {
      const pulse = 0.7 + Math.abs(Math.sin(t * 3.5)) * 0.3;
      (archRef.current.material as THREE.MeshBasicMaterial).opacity = pulse;
    }
  });

  return (
    <group position={position}>
      {/* Main structure */}
      <RigidBody type="fixed" position={[0, 5.5, 0]}>
        <mesh castShadow>
          <boxGeometry args={[18, 11, 15]} />
          <meshStandardMaterial color="#050510" roughness={0.85} metalness={0.6} />
        </mesh>
      </RigidBody>
      {/* Sign */}
      <mesh position={[0, 10.2, 7.62]}>
        <planeGeometry args={[14, 2.5]} />
        <meshBasicMaterial map={signTex} toneMapped={false} />
      </mesh>
      {/* Dynamic color facade */}
      <mesh ref={glowRef} position={[0, 5.5, 7.56]}>
        <planeGeometry args={[16, 10]} />
        <meshBasicMaterial color="#8800ff" transparent opacity={0.14} />
      </mesh>
      {/* Entrance arch */}
      <mesh ref={archRef} position={[0, 4, 7.6]}>
        <ringGeometry args={[2.2, 2.6, 28]} />
        <meshBasicMaterial color="#f000b8" transparent opacity={0.85} />
      </mesh>
      {/* Door */}
      <mesh position={[0, 2.5, 7.62]}>
        <boxGeometry args={[3.5, 5, 0.15]} />
        <meshStandardMaterial color="#0a0a1a" metalness={0.95} roughness={0.05} transparent opacity={0.35} />
      </mesh>
      {/* Velvet rope posts */}
      {([-4, 4] as number[]).map(x => (
        <group key={x} position={[x, 0, 10]}>
          <mesh position={[0, 1, 0]}>
            <cylinderGeometry args={[0.05, 0.07, 2.2, 6]} />
            <meshStandardMaterial color="#c0a020" metalness={0.9} roughness={0.1} />
          </mesh>
          <mesh position={[0, 2.1, 0]}>
            <sphereGeometry args={[0.13, 8, 8]} />
            <meshStandardMaterial color="#c0a020" metalness={0.9} roughness={0.1} />
          </mesh>
        </group>
      ))}
      {/* Rope */}
      <mesh position={[0, 1.1, 10]} rotation={[0, Math.PI / 2, 0]}>
        <cylinderGeometry args={[0.025, 0.025, 8, 5]} />
        <meshStandardMaterial color="#8b0000" metalness={0.3} roughness={0.7} />
      </mesh>
      {/* Floor glow ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 6]}>
        <ringGeometry args={[3.5, 5.5, 28]} />
        <meshBasicMaterial color="#f000b8" transparent opacity={0.16} />
      </mesh>
      {/* Side neon strips */}
      {([-9.05, 9.05] as number[]).map((x, i) => (
        <mesh key={i} position={[x, 5.5, 0]}>
          <planeGeometry args={[0.12, 10]} />
          <meshBasicMaterial color={i === 0 ? '#00f0d0' : '#f000b8'} transparent opacity={0.85} />
        </mesh>
      ))}
    </group>
  );
}

// ═══════════════════════════════════════════════════════
// TRAP KITCHEN FOOD TRUCK
// ═══════════════════════════════════════════════════════

function TrapKitchenTruck({ position }: { position: [number, number, number] }) {
  const signTex = useMemo(() => makeSignTex('TRAP KITCHEN', '#ff8800', 'STREET FOOD · REAL HEAT'), []);

  return (
    <group position={position}>
      {/* Truck body */}
      <RigidBody type="fixed" position={[0, 1.8, 0]}>
        <mesh castShadow>
          <boxGeometry args={[6, 3.6, 3]} />
          <meshStandardMaterial color="#1a0f00" roughness={0.7} metalness={0.5} />
        </mesh>
      </RigidBody>
      {/* Cab */}
      <mesh position={[-3.5, 1.4, 0]}>
        <boxGeometry args={[1.8, 2.8, 2.8]} />
        <meshStandardMaterial color="#150900" roughness={0.7} metalness={0.5} />
      </mesh>
      {/* Windshield */}
      <mesh position={[-4.3, 1.6, 0]}>
        <planeGeometry args={[1.5, 1.4]} />
        <meshStandardMaterial color="#1a3a2a" transparent opacity={0.3} metalness={0.9} roughness={0.05} />
      </mesh>
      {/* Sign */}
      <mesh position={[0, 3.9, 1.56]}>
        <planeGeometry args={[5, 1.2]} />
        <meshBasicMaterial map={signTex} toneMapped={false} />
      </mesh>
      {/* Serving window */}
      <mesh position={[0.5, 2, 1.52]}>
        <boxGeometry args={[2.5, 1.5, 0.1]} />
        <meshStandardMaterial color="#1a3a1a" transparent opacity={0.22} metalness={0.9} roughness={0.05} />
      </mesh>
      {/* Awning */}
      <mesh position={[0.5, 3.7, 2.6]} rotation={[0.3, 0, 0]}>
        <boxGeometry args={[5.5, 0.15, 2.5]} />
        <meshStandardMaterial color="#ff8800" transparent opacity={0.35} emissive="#ff8800" emissiveIntensity={0.2} />
      </mesh>
      {/* Neon top strip */}
      <mesh position={[0, 3.62, 1.56]}>
        <planeGeometry args={[6, 0.1]} />
        <meshBasicMaterial color="#ff8800" transparent opacity={0.9} />
      </mesh>
      {/* Wheels */}
      {([[-1.5, -1.7], [1.8, -1.7], [-1.5, 1.7], [1.8, 1.7]] as [number, number][]).map(([x, z], i) => (
        <mesh key={i} position={[x, 0.46, z]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.46, 0.46, 0.32, 12]} />
          <meshStandardMaterial color="#111" metalness={0.5} roughness={0.8} />
        </mesh>
      ))}
      {/* Ground glow */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 1]}>
        <ringGeometry args={[3, 5, 20]} />
        <meshBasicMaterial color="#ff8800" transparent opacity={0.13} />
      </mesh>
      {/* A few food crates around the truck */}
      {([[-2, -2.5], [2, -2.5], [3, -2]] as [number, number][]).map(([x, z], i) => (
        <mesh key={`crate-${i}`} position={[x, 0.4, z]}>
          <boxGeometry args={[0.7, 0.7, 0.7]} />
          <meshStandardMaterial color="#2a1500" roughness={0.9} />
        </mesh>
      ))}
    </group>
  );
}

// ═══════════════════════════════════════════════════════
// GRAFFITI DECALS
// ═══════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════
// STREET PROPS
// ═══════════════════════════════════════════════════════

function Bench({ position, rotation = 0 }: { position: [number,number,number]; rotation?: number }) {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      {/* Seat */}
      <mesh position={[0, 0.48, 0]}>
        <boxGeometry args={[1.6, 0.1, 0.55]} />
        <meshStandardMaterial color="#2a1a0a" roughness={0.85} metalness={0.1} />
      </mesh>
      {/* Back */}
      <mesh position={[0, 0.85, -0.22]} rotation={[0.1, 0, 0]}>
        <boxGeometry args={[1.6, 0.6, 0.08]} />
        <meshStandardMaterial color="#2a1a0a" roughness={0.85} metalness={0.1} />
      </mesh>
      {/* Legs */}
      {([-0.65, 0.65] as number[]).map(x => (
        <mesh key={x} position={[x, 0.22, 0]}>
          <boxGeometry args={[0.08, 0.44, 0.5]} />
          <meshStandardMaterial color="#555" metalness={0.75} roughness={0.3} />
        </mesh>
      ))}
    </group>
  );
}

function VendingMachine({ position, color = '#00f0d0', rotation = 0 }: { position: [number,number,number]; color?: string; rotation?: number }) {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      <mesh position={[0, 1.0, 0]}>
        <boxGeometry args={[0.9, 2.0, 0.55]} />
        <meshStandardMaterial color="#111122" roughness={0.5} metalness={0.6} />
      </mesh>
      {/* Screen */}
      <mesh position={[0, 1.1, 0.285]}>
        <planeGeometry args={[0.65, 0.8]} />
        <meshBasicMaterial color={color} transparent opacity={0.7} />
      </mesh>
      {/* Logo strip */}
      <mesh position={[0, 1.72, 0.285]}>
        <planeGeometry args={[0.82, 0.18]} />
        <meshBasicMaterial color={color} transparent opacity={0.92} />
      </mesh>
      {/* Slot */}
      <mesh position={[0.15, 0.38, 0.29]}>
        <boxGeometry args={[0.18, 0.05, 0.04]} />
        <meshStandardMaterial color="#333" metalness={0.8} roughness={0.2} />
      </mesh>
    </group>
  );
}

function BusStop({ position, rotation = 0 }: { position: [number,number,number]; rotation?: number }) {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      {/* Back panel (glass) */}
      <mesh position={[0, 1.8, 0]}>
        <boxGeometry args={[3.5, 3.6, 0.08]} />
        <meshStandardMaterial color="#1a2a4a" transparent opacity={0.25} metalness={0.9} roughness={0.05} />
      </mesh>
      {/* Roof */}
      <mesh position={[0, 3.65, 0.6]}>
        <boxGeometry args={[3.8, 0.12, 1.5]} />
        <meshStandardMaterial color="#222233" metalness={0.8} roughness={0.3} />
      </mesh>
      {/* Side panel */}
      <mesh position={[-1.78, 1.8, 0.6]}>
        <boxGeometry args={[0.08, 3.4, 1.2]} />
        <meshStandardMaterial color="#1a2a4a" transparent opacity={0.25} metalness={0.9} roughness={0.05} />
      </mesh>
      {/* Poles */}
      {([-1.75, 1.75] as number[]).map(x => (
        <mesh key={x} position={[x, 1.8, 0]}>
          <boxGeometry args={[0.06, 3.6, 0.06]} />
          <meshStandardMaterial color="#333344" metalness={0.85} roughness={0.2} />
        </mesh>
      ))}
      {/* Bench */}
      <Bench position={[0, 0, 0.4]} />
      {/* Neon sign */}
      <mesh position={[0, 3.2, 0.05]}>
        <planeGeometry args={[2.5, 0.35]} />
        <meshBasicMaterial color="#00f0d0" transparent opacity={0.88} />
      </mesh>
    </group>
  );
}

function PhoneBooth({ position, rotation = 0 }: { position: [number,number,number]; rotation?: number }) {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      {/* Frame */}
      <mesh position={[0, 1.25, 0]}>
        <boxGeometry args={[0.95, 2.5, 0.95]} />
        <meshStandardMaterial color="#0a1a0a" roughness={0.5} metalness={0.5} />
      </mesh>
      {/* Glass panels */}
      {([0, Math.PI / 2, Math.PI, -Math.PI / 2] as number[]).map((rot, i) => (
        <mesh key={i} position={[Math.sin(rot) * 0.485, 1.25, Math.cos(rot) * 0.485]} rotation={[0, rot, 0]}>
          <planeGeometry args={[0.85, 2.0]} />
          <meshStandardMaterial color="#003322" transparent opacity={0.3} metalness={0.9} roughness={0.05} />
        </mesh>
      ))}
      {/* Roof */}
      <mesh position={[0, 2.62, 0]}>
        <boxGeometry args={[1.05, 0.18, 1.05]} />
        <meshStandardMaterial color="#001a00" emissive="#00ff44" emissiveIntensity={0.4} metalness={0.7} />
      </mesh>
    </group>
  );
}

function FireHydrant({ position }: { position: [number,number,number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.3, 0]}>
        <cylinderGeometry args={[0.15, 0.18, 0.55, 8]} />
        <meshStandardMaterial color="#cc2200" roughness={0.5} metalness={0.4} />
      </mesh>
      <mesh position={[0, 0.58, 0]}>
        <cylinderGeometry args={[0.18, 0.15, 0.18, 8]} />
        <meshStandardMaterial color="#cc2200" roughness={0.5} metalness={0.4} />
      </mesh>
      {([-0.2, 0.2] as number[]).map(x => (
        <mesh key={x} position={[x, 0.38, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.045, 0.045, 0.22, 6]} />
          <meshStandardMaterial color="#881500" metalness={0.7} roughness={0.3} />
        </mesh>
      ))}
    </group>
  );
}

function Dumpster({ position, color = '#1a3a1a', rotation = 0 }: { position: [number,number,number]; color?: string; rotation?: number }) {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      <mesh position={[0, 0.6, 0]}>
        <boxGeometry args={[1.8, 1.2, 0.9]} />
        <meshStandardMaterial color={color} roughness={0.85} metalness={0.35} />
      </mesh>
      <mesh position={[0, 1.25, 0]}>
        <boxGeometry args={[1.85, 0.12, 0.95]} />
        <meshStandardMaterial color="#333" metalness={0.5} roughness={0.5} />
      </mesh>
      {/* Graffiti-ish accent */}
      <mesh position={[0, 0.6, 0.46]}>
        <planeGeometry args={[0.8, 0.4]} />
        <meshBasicMaterial color="#00f0d0" transparent opacity={0.3} />
      </mesh>
    </group>
  );
}

function Planter({ position }: { position: [number,number,number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.3, 0]}>
        <boxGeometry args={[0.9, 0.55, 0.9]} />
        <meshStandardMaterial color="#1a1a2a" roughness={0.9} metalness={0.1} />
      </mesh>
      {/* Soil */}
      <mesh position={[0, 0.6, 0]}>
        <cylinderGeometry args={[0.36, 0.38, 0.08, 8]} />
        <meshStandardMaterial color="#1a0a00" roughness={0.95} />
      </mesh>
      {/* Plant */}
      <mesh position={[0, 0.85, 0]}>
        <sphereGeometry args={[0.28, 6, 5]} />
        <meshStandardMaterial color="#0a2a08" roughness={0.9} />
      </mesh>
    </group>
  );
}

function SecurityCamera({ position, rotation = 0 }: { position: [number,number,number]; rotation?: number }) {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      {/* Bracket */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[0.08, 0.4, 0.08]} />
        <meshStandardMaterial color="#222" metalness={0.8} roughness={0.2} />
      </mesh>
      {/* Camera body */}
      <mesh position={[0.12, -0.15, 0]} rotation={[0.4, 0, 0]}>
        <boxGeometry args={[0.22, 0.1, 0.12]} />
        <meshStandardMaterial color="#111" metalness={0.9} roughness={0.15} />
      </mesh>
      {/* Lens */}
      <mesh position={[0.25, -0.15, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <cylinderGeometry args={[0.035, 0.035, 0.06, 6]} />
        <meshBasicMaterial color="#00f0d0" />
      </mesh>
    </group>
  );
}

function MarketStall({ position, color = '#f000b8', label = 'SHOP', rotation = 0 }: {
  position: [number,number,number]; color?: string; label?: string; rotation?: number;
}) {
  const signTex = useMemo(() => makeSignTex(label, color), [label, color]);
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      {/* Counter */}
      <mesh position={[0, 0.6, 0]}>
        <boxGeometry args={[2.4, 1.2, 1.0]} />
        <meshStandardMaterial color="#1a1a28" roughness={0.7} metalness={0.3} />
      </mesh>
      {/* Canopy */}
      <mesh position={[0, 2.2, 0.2]} rotation={[-0.18, 0, 0]}>
        <boxGeometry args={[2.6, 0.1, 1.5]} />
        <meshStandardMaterial color={color} transparent opacity={0.55} emissive={color} emissiveIntensity={0.25} />
      </mesh>
      {/* Sign */}
      <mesh position={[0, 1.55, 0.52]}>
        <planeGeometry args={[1.8, 0.4]} />
        <meshBasicMaterial map={signTex} toneMapped={false} transparent opacity={0.9} />
      </mesh>
      {/* Items on counter */}
      {[-0.6, 0, 0.6].map(x => (
        <mesh key={x} position={[x, 1.28, 0]}>
          <boxGeometry args={[0.3, 0.25, 0.3]} />
          <meshStandardMaterial color={color} roughness={0.7} metalness={0.3} transparent opacity={0.7} />
        </mesh>
      ))}
    </group>
  );
}

// ═══════════════════════════════════════════════════════
// TRAFFIC LIGHTS
// ═══════════════════════════════════════════════════════

const TRAFFIC_POSITIONS: [number, number, number][] = [
  [9.5, 0, -9.5], [-9.5, 0, -9.5],
  [9.5, 0, 9.5],  [-9.5, 0, 9.5],
  [9.5, 0, -30],  [-9.5, 0, -30],
];

function TrafficLight({ position }: { position: [number, number, number] }) {
  const redRef   = useRef<THREE.Mesh>(null);
  const yelRef   = useRef<THREE.Mesh>(null);
  const grnRef   = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    // 3s green, 1s yellow, 3s red per 7s cycle
    const phase = t % 7;
    const isGreen  = phase < 3;
    const isYellow = phase >= 3 && phase < 4;
    const isRed    = phase >= 4;
    if (redRef.current) (redRef.current.material as THREE.MeshBasicMaterial).color.set(isRed ? '#ff2222' : '#330000');
    if (yelRef.current) (yelRef.current.material as THREE.MeshBasicMaterial).color.set(isYellow ? '#ffcc00' : '#332200');
    if (grnRef.current) (grnRef.current.material as THREE.MeshBasicMaterial).color.set(isGreen ? '#00ff44' : '#003300');
  });

  return (
    <group position={position}>
      {/* Pole */}
      <mesh position={[0, 3, 0]}>
        <cylinderGeometry args={[0.06, 0.07, 6, 6]} />
        <meshStandardMaterial color="#222233" metalness={0.85} roughness={0.2} />
      </mesh>
      {/* Housing */}
      <mesh position={[0, 6.2, 0]}>
        <boxGeometry args={[0.32, 0.85, 0.28]} />
        <meshStandardMaterial color="#111122" metalness={0.7} roughness={0.3} />
      </mesh>
      {/* Red */}
      <mesh ref={redRef} position={[0, 6.52, 0.15]}>
        <circleGeometry args={[0.09, 8]} />
        <meshBasicMaterial color="#330000" />
      </mesh>
      {/* Yellow */}
      <mesh ref={yelRef} position={[0, 6.22, 0.15]}>
        <circleGeometry args={[0.09, 8]} />
        <meshBasicMaterial color="#332200" />
      </mesh>
      {/* Green */}
      <mesh ref={grnRef} position={[0, 5.92, 0.15]}>
        <circleGeometry args={[0.09, 8]} />
        <meshBasicMaterial color="#003300" />
      </mesh>
    </group>
  );
}

function TrafficLights() {
  return (
    <>
      {TRAFFIC_POSITIONS.map((pos, i) => (
        <TrafficLight key={i} position={pos} />
      ))}
    </>
  );
}

// ═══════════════════════════════════════════════════════
// HOVER TRAFFIC
// ═══════════════════════════════════════════════════════

const HOVER_ROUTES: { x: number; z: number; altitude: number; speed: number; color: string; accent: string }[] = [
  { x: -60, z: -20, altitude: 32, speed:  8, color: '#1a1a3a', accent: '#00f0d0' },
  { x:  60, z:  10, altitude: 38, speed: -6, color: '#2a1a2a', accent: '#f000b8' },
];

function HoverCar({ route }: { route: typeof HOVER_ROUTES[0] }) {
  const groupRef = useRef<THREE.Group>(null);
  const blinkRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.elapsedTime;
    // Fly in a simple oval path
    const radius = 80;
    const angle = (t * route.speed * 0.01) % (Math.PI * 2);
    groupRef.current.position.set(
      Math.cos(angle) * radius + route.x * 0.2,
      route.altitude + Math.sin(t * 0.5) * 1.5,
      Math.sin(angle) * radius * 0.5 + route.z * 0.2,
    );
    groupRef.current.rotation.y = -angle - Math.PI / 2;
    // Blink navigation light
    if (blinkRef.current) {
      (blinkRef.current.material as THREE.MeshBasicMaterial).color.set(
        Math.sin(t * 8) > 0 ? route.accent : '#000000'
      );
    }
  });

  return (
    <group ref={groupRef}>
      {/* Body */}
      <mesh>
        <boxGeometry args={[2.4, 0.4, 1.0]} />
        <meshStandardMaterial color={route.color} metalness={0.8} roughness={0.2} />
      </mesh>
      {/* Cabin */}
      <mesh position={[0, 0.28, 0]}>
        <boxGeometry args={[1.2, 0.32, 0.7]} />
        <meshStandardMaterial color={route.accent} transparent opacity={0.25} metalness={0.9} roughness={0.05} />
      </mesh>
      {/* Engines (rear) */}
      {([-0.35, 0.35] as number[]).map(z => (
        <mesh key={z} position={[-1.1, -0.1, z]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.12, 0.15, 0.4, 6]} />
          <meshBasicMaterial color={route.accent} />
        </mesh>
      ))}
      {/* Nav blink light */}
      <mesh ref={blinkRef} position={[1.2, 0, 0]}>
        <sphereGeometry args={[0.06, 4, 4]} />
        <meshBasicMaterial color={route.accent} />
      </mesh>
    </group>
  );
}

function HoverTraffic() {
  return (
    <>
      {HOVER_ROUTES.map((r, i) => <HoverCar key={i} route={r} />)}
    </>
  );
}

function StreetProps() {
  return (
    <>
      {/* ── Benches ── */}
      <Bench position={[7.5, 0, -15]} rotation={Math.PI / 2} />
      <Bench position={[-7.5, 0, 25]}  rotation={-Math.PI / 2} />
      <Bench position={[-18, 0, 7.5]}  />
      <Bench position={[18,  0, 7.5]}  />

      {/* ── Vending machines ── */}
      <VendingMachine position={[7.8, 0, -8]}  color="#00f0d0" rotation={Math.PI / 2} />
      <VendingMachine position={[-7.8, 0, 32]}  color="#4488ff" rotation={-Math.PI / 2} />
      <VendingMachine position={[20, 0, 7.8]}   color="#44ff88" rotation={0} />

      {/* ── Bus stops ── */}
      <BusStop position={[9, 0, -30]}  rotation={Math.PI / 2} />
      <BusStop position={[-9, 0, 10]}  rotation={-Math.PI / 2} />

      {/* ── Phone booths ── */}
      <PhoneBooth position={[7.5, 0, -5]}  rotation={Math.PI / 2} />
      <PhoneBooth position={[-7.5, 0, 5]}  rotation={-Math.PI / 2} />

      {/* ── Fire hydrants ── */}
      <FireHydrant position={[5.2, 0, -12]} />
      <FireHydrant position={[-5.2, 0, 18]} />
      <FireHydrant position={[22, 0, 5.2]}  />

      {/* ── Dumpsters ── */}
      <Dumpster position={[8.5, 0, -35]}  color="#1a3a1a" />
      <Dumpster position={[22, 0, -7.5]}  color="#1a1a3a" rotation={Math.PI / 2} />
      <Dumpster position={[-22, 0, 7.5]}  color="#2a1a0a" rotation={-Math.PI / 2} />

      {/* ── Planters ── */}
      {[-10, 10, 30].map(z => (
        <Planter key={`pl-rz${z}`} position={[8.0, 0, z]} />
      ))}
      {[-10, 10, 30].map(z => (
        <Planter key={`pl-lz${z}`} position={[-8.0, 0, z]} />
      ))}
      {[-10, 0, 10].map(x => (
        <Planter key={`pl-x${x}`} position={[x, 0, 8.0]} />
      ))}

      {/* ── Security cameras on buildings ── */}
      <SecurityCamera position={[7.2, 5, 0]}   rotation={-Math.PI / 2} />
      <SecurityCamera position={[-7.2, 4.5, 0]} rotation={Math.PI / 2} />

      {/* ── Market stalls ── */}
      <MarketStall position={[12, 0, -18]}  color="#00f0d0" label="TECH"   rotation={0} />
      <MarketStall position={[-14, 0, -18]} color="#f000b8" label="STYLE"  rotation={0} />
      <MarketStall position={[12, 0, 22]}   color="#ffaa00" label="FOOD"   rotation={Math.PI} />

      {/* ── Decorative barriers / bollards ── */}
      {([-2, -1, 0, 1, 2] as number[]).map(i => (
        <mesh key={`bol${i}`} position={[i * 0.9 - 0.1, 0.4, 10.2]}>
          <cylinderGeometry args={[0.08, 0.1, 0.8, 6]} />
          <meshStandardMaterial color="#f000b8" emissive="#f000b8" emissiveIntensity={0.5} metalness={0.7} roughness={0.2} />
        </mesh>
      ))}
      {([-2, -1, 0, 1, 2] as number[]).map(i => (
        <mesh key={`bol2${i}`} position={[i * 0.9 - 0.1, 0.4, -10.2]}>
          <cylinderGeometry args={[0.08, 0.1, 0.8, 6]} />
          <meshStandardMaterial color="#00f0d0" emissive="#00f0d0" emissiveIntensity={0.5} metalness={0.7} roughness={0.2} />
        </mesh>
      ))}
    </>
  );
}

// ═══════════════════════════════════════════════════════
// DRIVEABLE CAR
// ═══════════════════════════════════════════════════════

const CAR_CONFIGS: { id: string; position: [number,number,number]; yaw: number; color: string; accentColor: string }[] = [
  { id: 'car-1',  position: [8,   0,  5],  yaw: 0.3,         color: '#1a0535', accentColor: '#00f0d0' },
  { id: 'car-2',  position: [-12, 0, -8],  yaw: -0.4,        color: '#0a1a30', accentColor: '#4488ff' },
  { id: 'car-3',  position: [22,  0,  8],  yaw: 0,           color: '#2a1010', accentColor: '#ff4444' },
  { id: 'car-4',  position: [-8,  0, 35],  yaw: Math.PI / 2, color: '#0a2010', accentColor: '#44ff88' },
  { id: 'car-5',  position: [30,  0, -10], yaw: 0.15,        color: '#1a1500', accentColor: '#ffaa00' },
  { id: 'car-6',  position: [-25, 0, -15], yaw: -0.2,        color: '#1a001a', accentColor: '#f000b8' },
];

function DrivableCar({ carId, position, initialYaw, color, accentColor }: {
  carId: string; position: [number,number,number]; initialYaw: number; color: string; accentColor: string;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const headlightLRef = useRef<THREE.Mesh>(null);
  const headlightRRef = useRef<THREE.Mesh>(null);
  const frameRef = useRef(0);

  // Register parked position
  useMemo(() => {
    parkedPositions[carId] = { x: position[0], y: 0, z: position[2], yaw: initialYaw };
  }, [carId, position, initialYaw]);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;

    if (drivingState.active && drivingState.carId === carId) {
      groupRef.current.position.set(drivingState.x, 0, drivingState.z);
      groupRef.current.rotation.y = drivingState.yaw;

      // Headlight flicker when driving at speed
      frameRef.current++;
      if (headlightLRef.current && frameRef.current % 3 === 0) {
        const t = clock.elapsedTime;
        const pulse = 0.85 + Math.sin(t * 18) * 0.15;
        (headlightLRef.current.material as THREE.MeshBasicMaterial).opacity = pulse;
        (headlightRRef.current!.material as THREE.MeshBasicMaterial).opacity = pulse;
      }
    } else {
      groupRef.current.position.set(position[0], 0, position[2]);
      groupRef.current.rotation.y = initialYaw;
    }
  });

  return (
    <group ref={groupRef} position={position} rotation={[0, initialYaw, 0]}>
      {/* Body */}
      <mesh position={[0, 0.6, 0]} castShadow>
        <boxGeometry args={[2.1, 0.7, 4.4]} />
        <meshStandardMaterial color={color} metalness={0.75} roughness={0.18} />
      </mesh>
      {/* Cabin */}
      <mesh position={[0, 1.25, -0.22]} castShadow>
        <boxGeometry args={[1.95, 0.62, 2.3]} />
        <meshStandardMaterial color={color} metalness={0.7} roughness={0.2} />
      </mesh>
      {/* Windshield */}
      <mesh position={[0, 1.22, 0.93]}>
        <planeGeometry args={[1.75, 0.55]} />
        <meshStandardMaterial color="#1a2a3a" transparent opacity={0.45} metalness={0.95} roughness={0.05} />
      </mesh>
      {/* Rear window */}
      <mesh position={[0, 1.22, -1.4]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[1.75, 0.5]} />
        <meshStandardMaterial color="#1a2a3a" transparent opacity={0.35} metalness={0.95} roughness={0.05} />
      </mesh>
      {/* Wheels */}
      {([[-0.92, -1.42], [0.92, -1.42], [-0.92, 1.42], [0.92, 1.42]] as [number,number][]).map(([x, z], i) => (
        <group key={i} position={[x, 0.34, z]}>
          <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
            <cylinderGeometry args={[0.34, 0.34, 0.24, 14]} />
            <meshStandardMaterial color="#0d0d0d" metalness={0.4} roughness={0.85} />
          </mesh>
          {/* Rim */}
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.2, 0.2, 0.26, 8]} />
            <meshStandardMaterial color={accentColor} metalness={0.9} roughness={0.15} />
          </mesh>
        </group>
      ))}
      {/* Headlights */}
      <mesh ref={headlightLRef} position={[0.65, 0.72, 2.22]}>
        <planeGeometry args={[0.38, 0.18]} />
        <meshBasicMaterial color="#ccffff" transparent opacity={0.92} />
      </mesh>
      <mesh ref={headlightRRef} position={[-0.65, 0.72, 2.22]}>
        <planeGeometry args={[0.38, 0.18]} />
        <meshBasicMaterial color="#ccffff" transparent opacity={0.92} />
      </mesh>
      {/* Taillights */}
      <mesh position={[0.65, 0.72, -2.22]}>
        <planeGeometry args={[0.38, 0.18]} />
        <meshBasicMaterial color="#ff2200" transparent opacity={0.9} />
      </mesh>
      <mesh position={[-0.65, 0.72, -2.22]}>
        <planeGeometry args={[0.38, 0.18]} />
        <meshBasicMaterial color="#ff2200" transparent opacity={0.9} />
      </mesh>
      {/* Neon underglow */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]}>
        <planeGeometry args={[2.2, 4.6]} />
        <meshBasicMaterial color={accentColor} transparent opacity={0.1} />
      </mesh>
      {/* Side accent stripe */}
      <mesh position={[1.07, 0.6, 0]}>
        <planeGeometry args={[4.2, 0.06]} />
        <meshBasicMaterial color={accentColor} transparent opacity={0.8} />
      </mesh>
      <mesh position={[-1.07, 0.6, 0]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[4.2, 0.06]} />
        <meshBasicMaterial color={accentColor} transparent opacity={0.8} />
      </mesh>
    </group>
  );
}

function DrivableCars() {
  return (
    <>
      {CAR_CONFIGS.map(c => (
        <DrivableCar key={c.id} carId={c.id} position={c.position} initialYaw={c.yaw} color={c.color} accentColor={c.accentColor} />
      ))}
    </>
  );
}

// ═══════════════════════════════════════════════════════
// STREET CITIZENS (talkable NPCs)
// ═══════════════════════════════════════════════════════

const CITIZEN_DATA = [
  { id: 'citizen-1',  x:  5,   z:  20,  skin: '#8B4513', outfit: '#2244aa', accent: '#44aaff', seed: 200 },
  { id: 'citizen-2',  x: -15,  z:  12,  skin: '#5a2d0c', outfit: '#1a2a1a', accent: '#44ff88', seed: 201 },
  { id: 'citizen-3',  x:  18,  z: -12,  skin: '#c68642', outfit: '#22001a', accent: '#f000b8', seed: 202 },
  { id: 'citizen-4',  x:  -8,  z: -20,  skin: '#f5d0a9', outfit: '#111122', accent: '#00f0d0', seed: 203 },
];

function StreetCitizen({ x, z, skin, outfit, accent, seed }: {
  x: number; z: number; skin: string; outfit: string; accent: string; seed: number;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const leftLegRef = useRef<THREE.Mesh>(null);
  const rightLegRef = useRef<THREE.Mesh>(null);
  const headRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!groupRef.current) return;
    const pdx = groupRef.current.position.x - state.camera.position.x;
    const pdz = groupRef.current.position.z - state.camera.position.z;
    if (pdx * pdx + pdz * pdz > 1800) { groupRef.current.visible = false; return; }
    groupRef.current.visible = true;
    const t = state.clock.elapsedTime + seed * 50;
    // Slow idle wander
    const newX = x + Math.sin(t * 0.18 + seed) * 2.5;
    const newZ = z + Math.cos(t * 0.14 + seed) * 2.5;
    const dx = newX - groupRef.current.position.x;
    const dz = newZ - groupRef.current.position.z;
    groupRef.current.position.x = newX;
    groupRef.current.position.z = newZ;
    if (Math.abs(dx) + Math.abs(dz) > 0.008) {
      groupRef.current.rotation.y = Math.atan2(dx, dz);
    }
    const legSwing = Math.sin(t * 3.5) * 0.32;
    if (leftLegRef.current) leftLegRef.current.rotation.x = legSwing;
    if (rightLegRef.current) rightLegRef.current.rotation.x = -legSwing;
    // Idle head look-around
    if (headRef.current) {
      headRef.current.rotation.y = Math.sin(t * 0.4 + seed) * 0.25;
    }
  });

  return (
    <group ref={groupRef} position={[x, 0, z]}>
      {/* Legs */}
      <mesh ref={leftLegRef} position={[-0.1, 0.38, 0]}>
        <boxGeometry args={[0.14, 0.72, 0.16]} />
        <meshStandardMaterial color={outfit} roughness={0.75} />
      </mesh>
      <mesh ref={rightLegRef} position={[0.1, 0.38, 0]}>
        <boxGeometry args={[0.14, 0.72, 0.16]} />
        <meshStandardMaterial color={outfit} roughness={0.75} />
      </mesh>
      {/* Shoes */}
      <mesh position={[-0.1, 0.06, 0.03]}>
        <boxGeometry args={[0.17, 0.09, 0.2]} />
        <meshStandardMaterial color="#111" metalness={0.5} roughness={0.5} />
      </mesh>
      <mesh position={[0.1, 0.06, 0.03]}>
        <boxGeometry args={[0.17, 0.09, 0.2]} />
        <meshStandardMaterial color="#111" metalness={0.5} roughness={0.5} />
      </mesh>
      {/* Torso */}
      <mesh position={[0, 1.05, 0]}>
        <boxGeometry args={[0.44, 0.68, 0.27]} />
        <meshStandardMaterial color={outfit} roughness={0.65} metalness={0.1} />
      </mesh>
      {/* Hoodie/jacket detail */}
      <mesh position={[0, 1.1, 0.145]}>
        <planeGeometry args={[0.22, 0.3]} />
        <meshBasicMaterial color={accent} transparent opacity={0.45} />
      </mesh>
      {/* Arms */}
      <mesh position={[-0.3, 0.95, 0]}>
        <boxGeometry args={[0.13, 0.62, 0.15]} />
        <meshStandardMaterial color={skin} roughness={0.78} />
      </mesh>
      <mesh position={[0.3, 0.95, 0]}>
        <boxGeometry args={[0.13, 0.62, 0.15]} />
        <meshStandardMaterial color={skin} roughness={0.78} />
      </mesh>
      {/* Neck */}
      <mesh position={[0, 1.47, 0]}>
        <boxGeometry args={[0.12, 0.17, 0.12]} />
        <meshStandardMaterial color={skin} roughness={0.8} />
      </mesh>
      {/* Head */}
      <mesh ref={headRef} position={[0, 1.74, 0]}>
        <boxGeometry args={[0.29, 0.3, 0.27]} />
        <meshStandardMaterial color={skin} roughness={0.75} />
      </mesh>
      {/* Eyes */}
      <mesh position={[-0.065, 1.76, 0.14]}>
        <planeGeometry args={[0.045, 0.03]} />
        <meshBasicMaterial color="#1a0800" />
      </mesh>
      <mesh position={[0.065, 1.76, 0.14]}>
        <planeGeometry args={[0.045, 0.03]} />
        <meshBasicMaterial color="#1a0800" />
      </mesh>
      {/* Interaction glow ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <ringGeometry args={[0.38, 0.52, 12]} />
        <meshBasicMaterial color={accent} transparent opacity={0.18} />
      </mesh>
    </group>
  );
}

function StreetCitizens() {
  return (
    <>
      {CITIZEN_DATA.map(c => (
        <StreetCitizen key={c.id} x={c.x} z={c.z} skin={c.skin} outfit={c.outfit} accent={c.accent} seed={c.seed} />
      ))}
    </>
  );
}

function GraffitiDecals() {
  const tags = useMemo(() => {
    const makeTag = (text: string, sub: string, color: string) => makeSignTex(text, color, sub);
    return [
      { tex: makeTag('NO SNITCHING', 'CODE OF THE STREETS', '#00f0d0'), pos: [18, 2.5, -7.15] as [number,number,number], rot: Math.PI, w: 4, h: 1.4 },
      { tex: makeTag('NBA', 'NEVER BROKE AGAIN', '#f000b8'),             pos: [-18, 2.5, 7.15] as [number,number,number],  rot: 0,      w: 3.5, h: 1.3 },
      { tex: makeTag('EMPIRE', 'NEO CITY 2077', '#ffaa00'),              pos: [7.15, 2.5, -18] as [number,number,number],  rot: -Math.PI/2, w: 4, h: 1.4 },
      { tex: makeTag('H-TOWN', "DEEBABY'S BLOCK", '#ff6600'),            pos: [-32, 2.2, 14] as [number,number,number],    rot: 0,      w: 3.5, h: 1.2 },
      { tex: makeTag('RUN IT', 'STACK OR STARVE', '#44ff88'),            pos: [-7.15, 2.5, 18] as [number,number,number],  rot: Math.PI/2, w: 3.5, h: 1.3 },
    ];
  }, []);

  return (
    <>
      {tags.map((g, i) => (
        <mesh key={i} position={g.pos} rotation={[0, g.rot, 0]}>
          <planeGeometry args={[g.w, g.h]} />
          <meshBasicMaterial map={g.tex} toneMapped={false} transparent opacity={0.82} />
        </mesh>
      ))}
    </>
  );
}
