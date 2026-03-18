/**
 * ChippewaWorld — 3800 Chippewa Street, Baton Rouge, Louisiana
 * Louisiana day: massive Live Oaks, shotgun houses, creole cottages,
 * dynamic weather (clear / cloudy / rain), animated cloud layer.
 */
import { useRef, useMemo, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { weatherStore, applyWeather, SEASON_WEATHER, SEASON_CYCLE, getSkyColors, getSunData } from '@/stores/weatherStore';
import * as THREE from 'three';
import { RigidBody } from '@react-three/rapier';
import { Text } from '@react-three/drei';

// ── Luxury Palette ─────────────────────────────────────────────────────────
const LUX_IVORY   = '#f4ede0';   // warm cream stucco
const LUX_PEARL   = '#eee6d8';   // slightly warmer cream variant
const LUX_SLATE   = '#e2dbd0';   // cool grey-cream variant
const LUX_STONE   = '#c4bcb0';   // limestone / foundation
const LUX_DARK    = '#0c0c14';   // near-black trim / frames
const LUX_GLASS   = '#0d1a28';   // dark tinted glass
const LUX_GOLD    = '#c4982a';   // brushed gold / brass
const LUX_ROOF    = '#181820';   // charcoal flat roof
const LUX_COLUMN  = '#f8f4ec';   // bright white columns
const BRICK_DEEP  = '#6b3020';   // dark fired brick
const BRICK_MID   = '#7e3c28';   // mid brick
const MANOR_CREAM = '#ece4d4';   // manor cream trim
const MANOR_ROOF  = '#1a1208';   // dark brown steep slate
const DARK_GREEN  = '#172810';   // manicured hedge

// ── Legacy Louisiana Palette (used by bars / trees / street elements) ──────
const HOUSE_CREAM    = '#f0e0c0';
const HOUSE_YELLOW   = '#e2cc88';
const HOUSE_MINT     = '#b8ccb4';
const HOUSE_GRAY     = '#c4c0b8';
const HOUSE_PINK     = '#d4a898';
const HOUSE_SAGE     = '#a8b89a';
const TRIM_WHITE     = '#e8e0d4';
const TRIM_GREEN     = '#3a5a2e';
const TRIM_MAROON    = '#6a2a2a';
const WOOD_DARK      = '#1e140a';
const BARK           = '#2c1e10';
const BARK_LIGHT     = '#3e2a18';
const MOSS_GREEN     = '#5a6a4a';
const MOSS_LIGHT     = '#788a60';
const FOLIAGE_DARK   = '#162810';
const FOLIAGE_MID    = '#1c3214';
const FOLIAGE_LIGHT  = '#243c1a';
const GRASS_YARD     = '#1e2e14';
const GRASS_STRIP    = '#223416';
const ASPHALT        = '#222228';
const ASPHALT_LIGHT  = '#2a2a30';
const SIDEWALK_TAN   = '#9a8870';
const BRICK_WALK     = '#8a7460';
const CURB           = '#6a6860';

// ── Box Helper ────────────────────────────────────────────────────────────
function Box({ pos, size, color, metalness = 0.04, roughness = 0.88,
  castShadow = true, receiveShadow = false, emissive, emissiveIntensity = 0 }:
  { pos: [number,number,number]; size: [number,number,number]; color: string;
    metalness?: number; roughness?: number; castShadow?: boolean;
    receiveShadow?: boolean; emissive?: string; emissiveIntensity?: number }) {
  return (
    <mesh position={pos} castShadow={castShadow} receiveShadow={receiveShadow}>
      <boxGeometry args={size} />
      <meshStandardMaterial color={color} metalness={metalness} roughness={roughness}
        emissive={emissive ?? color} emissiveIntensity={emissiveIntensity} />
    </mesh>
  );
}

// ── Authentic Live Oak ────────────────────────────────────────────────────
// Southern Live Oaks: LOW trunk, WIDE horizontal spread (wider than tall),
// multiple arching main limbs, dense dark-green canopy, heavy Spanish moss
function LiveOak({ x, z, scale = 1, seed = 0 }:
  { x: number; z: number; scale?: number; seed?: number }) {
  const s = seed;
  return (
    <group position={[x, 0, z]}>
      {/* Thick trunk — splits low */}
      <mesh position={[0, 1.6 * scale, 0]} castShadow scale={[scale, scale, scale]}>
        <cylinderGeometry args={[0.32 * scale, 0.46 * scale, 3.2, 9]} />
        <meshStandardMaterial color={BARK} roughness={0.98} />
      </mesh>

      {/* Surface roots radiating outward */}
      {[0, 1.05, 2.1, 3.15].map((a, i) => (
        <mesh key={i} position={[Math.sin(a + s) * 0.7 * scale, 0.1, Math.cos(a + s) * 0.7 * scale]}
          rotation={[0, a + s, 0.35]} scale={[scale, scale, scale]} castShadow>
          <cylinderGeometry args={[0.08, 0.16, 1.4, 5]} />
          <meshStandardMaterial color={BARK} roughness={0.98} />
        </mesh>
      ))}

      {/* 6 main spreading limbs — nearly horizontal, low */}
      {[0, 1.05, 2.1, 3.14, 4.2, 5.24].map((angle, i) => {
        const spread = (2.8 + (i % 3) * 0.6) * scale;
        const rise   = (0.38 + (i % 2) * 0.18);
        const bx     = Math.sin(angle + s * 0.1) * spread;
        const bz     = Math.cos(angle + s * 0.1) * spread;
        return (
          <mesh key={i} position={[bx * 0.55, (3.0 + (i % 2) * 0.3) * scale, bz * 0.55]}
            rotation={[Math.cos(angle) * rise, angle + s * 0.1, Math.sin(angle) * rise]}
            castShadow>
            <cylinderGeometry args={[0.09 * scale, 0.18 * scale, 3.0 * scale, 6]} />
            <meshStandardMaterial color={BARK_LIGHT} roughness={0.97} />
          </mesh>
        );
      })}

      {/* Secondary branches off main limbs */}
      {[0.52, 1.57, 2.62, 3.67, 4.71].map((angle, i) => {
        const r = (1.8 + (i % 3) * 0.5) * scale;
        return (
          <mesh key={i} position={[Math.sin(angle) * r, (4.2 + (i % 2) * 0.5) * scale, Math.cos(angle) * r]}
            rotation={[0.5 + (i % 2) * 0.2, angle, 0.3]}>
            <cylinderGeometry args={[0.055 * scale, 0.10 * scale, 1.8 * scale, 5]} />
            <meshStandardMaterial color={BARK} roughness={0.98} />
          </mesh>
        );
      })}

      {/* Dense canopy — many overlapping spheres for realistic volume */}
      {/* Central crown */}
      <mesh position={[0, 6.2 * scale, 0]} castShadow>
        <sphereGeometry args={[3.0 * scale, 9, 6]} />
        <meshStandardMaterial color={FOLIAGE_DARK} roughness={0.97} />
      </mesh>
      {/* Wide outer canopy clusters — extends FAR out like real Live Oaks */}
      {[0, 0.78, 1.57, 2.36, 3.14, 3.93, 4.71, 5.50].map((angle, i) => {
        const r = (3.2 + (i % 3) * 0.7) * scale;
        const h = (4.6 + (i % 4) * 0.5) * scale;
        const sz = (1.5 + (i % 3) * 0.4) * scale;
        return (
          <mesh key={i} position={[Math.sin(angle + s * 0.05) * r, h, Math.cos(angle + s * 0.05) * r]} castShadow>
            <sphereGeometry args={[sz, 7, 5]} />
            <meshStandardMaterial color={i % 2 === 0 ? FOLIAGE_DARK : FOLIAGE_MID} roughness={0.97} />
          </mesh>
        );
      })}
      {/* Mid-level fill */}
      {[0.39, 1.18, 1.96, 2.75, 3.53, 4.32, 5.11].map((angle, i) => {
        const r = (1.6 + (i % 3) * 0.6) * scale;
        return (
          <mesh key={i} position={[Math.sin(angle) * r, (5.4 + (i % 2) * 0.4) * scale, Math.cos(angle) * r]} castShadow>
            <sphereGeometry args={[(1.3 + (i % 2) * 0.3) * scale, 6, 4]} />
            <meshStandardMaterial color={i % 3 === 0 ? FOLIAGE_LIGHT : FOLIAGE_DARK} roughness={0.97} />
          </mesh>
        );
      })}

      {/* Spanish Moss — long curtain-like strands from outer branches */}
      {Array.from({ length: 18 }, (_, i) => {
        const a = (i / 18) * Math.PI * 2;
        const r = (1.0 + (i % 4) * 0.8) * scale;
        const h = (4.8 - (i % 4) * 0.3) * scale;
        const len = (1.2 + (i % 6) * 0.35) * scale;
        return (
          <mesh key={i} position={[Math.sin(a + s * 0.2) * r, h, Math.cos(a + s * 0.2) * r]} castShadow>
            <cylinderGeometry args={[0.018 * scale, 0.006 * scale, len, 3]} />
            <meshStandardMaterial color={MOSS_GREEN} roughness={1.0} transparent opacity={0.72} />
          </mesh>
        );
      })}
      {/* Clumped moss wisps */}
      {Array.from({ length: 10 }, (_, i) => {
        const a = (i / 10) * Math.PI * 2 + 0.3;
        const r = (2.2 + (i % 3) * 0.5) * scale;
        return (
          <mesh key={i} position={[Math.sin(a) * r, (4.2 - (i % 3) * 0.2) * scale, Math.cos(a) * r]}>
            <sphereGeometry args={[(0.22 + (i % 3) * 0.08) * scale, 4, 3]} />
            <meshStandardMaterial color={MOSS_LIGHT} roughness={1.0} transparent opacity={0.55} />
          </mesh>
        );
      })}
    </group>
  );
}

// ── Luxury Mansion ─────────────────────────────────────────────────────────
// 2-story modern luxury home. Grand columned portico, floor-to-ceiling
// tinted windows, flat roof with parapet, balcony, gold accents.
// `side='south'` faces -z (toward street); `side='north'` faces +z.
function LuxuryMansion({ x, z, side = 'south', wallColor = LUX_IVORY }: {
  x: number; z: number; side?: 'north' | 'south'; wallColor?: string;
}) {
  const fz   = side === 'south' ? -1 : 1;
  const W    = 10.0;           // facade width
  const GH   = 3.6;            // ground-floor height
  const UH   = 3.2;            // upper-floor height
  const BD   = 9.0;            // body depth (front to back)
  const PD   = 2.6;            // portico depth (projects toward street)
  const FDN  = 0.44;           // foundation height
  const CRN  = 0.28;           // inter-floor cornice height
  const topY = FDN + GH + CRN + UH;   // 7.52 — top of upper wall
  const frontZ = fz * BD * 0.5;       // local z of front wall face
  const portCZ = fz * (BD * 0.5 + PD * 0.5);   // portico centre
  const stepZ  = fz * (BD * 0.5 + PD + 0.35);  // steps

  return (
    <group position={[x, 0, z]}>

      {/* ── PHYSICS COLLIDERS (solid, invisible) ──────────────────────── */}
      {/* Main building block */}
      <RigidBody type="fixed">
        <mesh position={[0, topY * 0.5 + 0.5, 0]} visible={false}>
          <boxGeometry args={[W + 1.0, topY + 3.0, BD + 1.0]} />
          <meshBasicMaterial />
        </mesh>
      </RigidBody>
      {/* Portico approach block */}
      <RigidBody type="fixed">
        <mesh position={[0, 2.5, portCZ]} visible={false}>
          <boxGeometry args={[W + 1.0, 5.5, PD + 0.6]} />
          <meshBasicMaterial />
        </mesh>
      </RigidBody>
      {/* Side-yard hedge walls — stop player cutting around */}
      {([-1, 1] as const).map((sx, si) => (
        <RigidBody key={si} type="fixed">
          <mesh position={[sx * (W * 0.5 + 0.9), 1.5, 0]} visible={false}>
            <boxGeometry args={[0.8, 3.0, BD + 6.0]} />
            <meshBasicMaterial />
          </mesh>
        </RigidBody>
      ))}

      {/* ── FOUNDATION ────────────────────────────────────────────────── */}
      <mesh position={[0, FDN * 0.5, fz * 0.4]} castShadow>
        <boxGeometry args={[W + 0.5, FDN, BD + 1.2]} />
        <meshStandardMaterial color={LUX_STONE} roughness={0.84} metalness={0.06} />
      </mesh>

      {/* ── GROUND FLOOR ──────────────────────────────────────────────── */}
      <mesh position={[0, FDN + GH * 0.5, 0]} castShadow receiveShadow>
        <boxGeometry args={[W, GH, BD]} />
        <meshStandardMaterial color={wallColor} roughness={0.65} />
      </mesh>
      {/* Corner quoins */}
      {([-1, 1] as const).map((sx, si) =>
        [0.45, 1.25, 2.05, 2.85].map((qy, qi) => (
          <mesh key={`q-${si}-${qi}`} position={[sx * (W * 0.5 + 0.08), FDN + qy, 0]}>
            <boxGeometry args={[0.18, 0.30, BD + 0.16]} />
            <meshStandardMaterial color={LUX_STONE} roughness={0.80} />
          </mesh>
        ))
      )}

      {/* ── INTER-FLOOR CORNICE ───────────────────────────────────────── */}
      <mesh position={[0, FDN + GH + CRN * 0.5, 0]}>
        <boxGeometry args={[W + 0.22, CRN, BD + 0.22]} />
        <meshStandardMaterial color={LUX_STONE} roughness={0.76} />
      </mesh>

      {/* ── UPPER FLOOR ───────────────────────────────────────────────── */}
      <mesh position={[0, FDN + GH + CRN + UH * 0.5, 0]} castShadow>
        <boxGeometry args={[W, UH, BD]} />
        <meshStandardMaterial color={wallColor} roughness={0.65} />
      </mesh>

      {/* ── FLAT ROOF + PARAPET ───────────────────────────────────────── */}
      {/* Roof slab */}
      <mesh position={[0, topY + 0.32, 0]}>
        <boxGeometry args={[W + 0.5, 0.64, BD + 0.5]} />
        <meshStandardMaterial color={LUX_ROOF} roughness={0.90} metalness={0.12} />
      </mesh>
      {/* Parapet walls */}
      {[
        [0, topY + 0.88, fz * (BD * 0.5 + 0.14), W + 0.5, 0.9, 0.28],
        [0, topY + 0.88, -fz * (BD * 0.5 + 0.14), W + 0.5, 0.9, 0.28],
        [-(W * 0.5 + 0.14), topY + 0.88, 0, 0.28, 0.9, BD + 0.5],
        [ (W * 0.5 + 0.14), topY + 0.88, 0, 0.28, 0.9, BD + 0.5],
      ].map(([px, py, pz, pw, ph, pd], i) => (
        <mesh key={i} position={[px, py, pz]}>
          <boxGeometry args={[pw, ph, pd]} />
          <meshStandardMaterial color={wallColor} roughness={0.66} />
        </mesh>
      ))}
      {/* Rooftop HVAC box (detail) */}
      <mesh position={[W * 0.28, topY + 0.72, -BD * 0.2]}>
        <boxGeometry args={[1.4, 0.65, 0.9]} />
        <meshStandardMaterial color="#282830" roughness={0.85} metalness={0.3} />
      </mesh>

      {/* ── GRAND PORTICO ─────────────────────────────────────────────── */}
      {/* Portico floor platform */}
      <mesh position={[0, FDN * 0.5, portCZ]}>
        <boxGeometry args={[9.2, FDN, PD]} />
        <meshStandardMaterial color={LUX_STONE} roughness={0.74} metalness={0.08} />
      </mesh>
      {/* Entablature (beam across columns) */}
      <mesh position={[0, FDN + GH + 0.08, portCZ]}>
        <boxGeometry args={[9.4, 0.22, PD + 0.08]} />
        <meshStandardMaterial color={LUX_STONE} roughness={0.72} />
      </mesh>
      {/* Portico soffit (ceiling) */}
      <mesh position={[0, FDN + GH - 0.12, portCZ]}>
        <boxGeometry args={[9.2, 0.10, PD]} />
        <meshStandardMaterial color={LUX_COLUMN} roughness={0.55} />
      </mesh>
      {/* 6 round columns */}
      {[-3.84, -2.30, -0.76, 0.76, 2.30, 3.84].map((cx, ci) => (
        <group key={ci} position={[cx, 0, portCZ]}>
          {/* Base plinth */}
          <mesh position={[0, FDN + 0.14, 0]}>
            <boxGeometry args={[0.40, 0.28, 0.40]} />
            <meshStandardMaterial color={LUX_COLUMN} roughness={0.52} />
          </mesh>
          {/* Column shaft */}
          <mesh position={[0, FDN + 0.28 + (GH - 0.56) * 0.5, 0]}>
            <cylinderGeometry args={[0.155, 0.195, GH - 0.56, 14]} />
            <meshStandardMaterial color={LUX_COLUMN} roughness={0.42} metalness={0.06} />
          </mesh>
          {/* Capital */}
          <mesh position={[0, FDN + GH - 0.12, 0]}>
            <boxGeometry args={[0.44, 0.22, 0.44]} />
            <meshStandardMaterial color={LUX_COLUMN} roughness={0.50} />
          </mesh>
        </group>
      ))}

      {/* ── STEPS (3 toward street) ───────────────────────────────────── */}
      {[0, 1, 2].map((s) => (
        <mesh key={s} position={[0, s * 0.17 + 0.085, stepZ + fz * s * 0.32]}>
          <boxGeometry args={[5.8 - s * 0.55, 0.17, 0.34]} />
          <meshStandardMaterial color={LUX_STONE} roughness={0.76} />
        </mesh>
      ))}

      {/* ── GROUND FLOOR WINDOWS (front, 4 large) ────────────────────── */}
      {[-3.5, -1.17, 1.17, 3.5].map((wx, wi) => (
        <group key={wi} position={[wx, FDN + 1.85, frontZ]}>
          <mesh position={[0, 0, 0.025]}>
            <boxGeometry args={[1.08, 2.15, 0.065]} />
            <meshStandardMaterial color={LUX_DARK} roughness={0.45} metalness={0.32} />
          </mesh>
          <mesh position={[0, 0, 0.065]}>
            <boxGeometry args={[0.86, 1.92, 0.04]} />
            <meshStandardMaterial color={LUX_GLASS} roughness={0.08} metalness={0.85} emissive={LUX_GLASS} emissiveIntensity={0.14} />
          </mesh>
          {/* Sill */}
          <mesh position={[0, -1.15, 0.09]}>
            <boxGeometry args={[1.24, 0.10, 0.22]} />
            <meshStandardMaterial color={LUX_STONE} roughness={0.72} />
          </mesh>
        </group>
      ))}

      {/* ── UPPER FLOOR WINDOWS (front, 4) ───────────────────────────── */}
      {[-3.5, -1.17, 1.17, 3.5].map((wx, wi) => (
        <group key={wi} position={[wx, FDN + GH + CRN + 1.55, frontZ]}>
          <mesh position={[0, 0, 0.025]}>
            <boxGeometry args={[0.98, 1.90, 0.065]} />
            <meshStandardMaterial color={LUX_DARK} roughness={0.45} metalness={0.32} />
          </mesh>
          <mesh position={[0, 0, 0.065]}>
            <boxGeometry args={[0.76, 1.68, 0.04]} />
            <meshStandardMaterial color={LUX_GLASS} roughness={0.08} metalness={0.85} emissive={LUX_GLASS} emissiveIntensity={0.12} />
          </mesh>
          <mesh position={[0, -1.02, 0.09]}>
            <boxGeometry args={[1.12, 0.09, 0.20]} />
            <meshStandardMaterial color={LUX_STONE} roughness={0.72} />
          </mesh>
        </group>
      ))}

      {/* ── SIDE WINDOWS (2 per floor per side) ──────────────────────── */}
      {([-1, 1] as const).map((sx, si) =>
        [FDN + 1.85, FDN + GH + CRN + 1.55].map((wy, fi) =>
          [-BD * 0.24, BD * 0.24].map((wz, wi) => (
            <group key={`s-${si}-${fi}-${wi}`} position={[sx * W * 0.5, wy, wz]}>
              <mesh position={[sx * 0.025, 0, 0]}>
                <boxGeometry args={[0.065, fi === 0 ? 2.15 : 1.90, 1.05]} />
                <meshStandardMaterial color={LUX_DARK} roughness={0.45} metalness={0.32} />
              </mesh>
              <mesh position={[sx * 0.065, 0, 0]}>
                <boxGeometry args={[0.04, fi === 0 ? 1.92 : 1.68, 0.83]} />
                <meshStandardMaterial color={LUX_GLASS} roughness={0.08} metalness={0.85} emissive={LUX_GLASS} emissiveIntensity={0.11} />
              </mesh>
            </group>
          ))
        )
      )}

      {/* ── BALCONY (upper floor, above portico, centre) ─────────────── */}
      <mesh position={[0, FDN + GH + CRN + 0.28, fz * (BD * 0.5 + 0.32)]}>
        <boxGeometry args={[3.6, 0.20, 1.0]} />
        <meshStandardMaterial color={LUX_STONE} roughness={0.62} metalness={0.12} />
      </mesh>
      {Array.from({ length: 9 }, (_, i) => (
        <mesh key={i} position={[-1.6 + i * 0.4, FDN + GH + CRN + 0.55, fz * (BD * 0.5 + 0.5)]}>
          <boxGeometry args={[0.055, 0.60, 0.055]} />
          <meshStandardMaterial color={LUX_DARK} roughness={0.38} metalness={0.65} />
        </mesh>
      ))}
      <mesh position={[0, FDN + GH + CRN + 0.82, fz * (BD * 0.5 + 0.5)]}>
        <boxGeometry args={[3.5, 0.065, 0.065]} />
        <meshStandardMaterial color={LUX_GOLD} roughness={0.22} metalness={0.88} />
      </mesh>

      {/* ── DOUBLE ENTRY DOORS ────────────────────────────────────────── */}
      <mesh position={[0, FDN + 1.58, frontZ + fz * 0.06]}>
        <boxGeometry args={[2.18, 3.16, 0.12]} />
        <meshStandardMaterial color={LUX_STONE} roughness={0.70} />
      </mesh>
      {([-0.52, 0.52] as number[]).map((dx, di) => (
        <mesh key={di} position={[dx, FDN + 1.32, frontZ + fz * 0.12]}>
          <boxGeometry args={[0.88, 2.64, 0.09]} />
          <meshStandardMaterial color="#090912" roughness={0.40} metalness={0.25} />
        </mesh>
      ))}
      {/* Door handles */}
      {([-0.07, 0.07] as number[]).map((hx, hi) => (
        <mesh key={hi} position={[hx, FDN + 1.32, frontZ + fz * 0.18]}>
          <boxGeometry args={[0.045, 0.24, 0.045]} />
          <meshStandardMaterial color={LUX_GOLD} metalness={0.92} roughness={0.12} />
        </mesh>
      ))}
      {/* Transom / fanlight above doors */}
      <mesh position={[0, FDN + 2.88, frontZ + fz * 0.12]}>
        <boxGeometry args={[1.92, 0.52, 0.09]} />
        <meshStandardMaterial color={LUX_GLASS} roughness={0.08} metalness={0.8} emissive={LUX_GLASS} emissiveIntensity={0.22} />
      </mesh>

      {/* ── GOLD ACCENT LINES (cornice strips on facade) ─────────────── */}
      <mesh position={[0, FDN + 0.03, fz * (BD * 0.5 + 0.02)]}>
        <boxGeometry args={[W + 0.06, 0.06, 0.05]} />
        <meshStandardMaterial color={LUX_GOLD} metalness={0.90} roughness={0.16} />
      </mesh>
      <mesh position={[0, topY + 0.04, fz * (BD * 0.5 + 0.02)]}>
        <boxGeometry args={[W + 0.52, 0.06, 0.05]} />
        <meshStandardMaterial color={LUX_GOLD} metalness={0.90} roughness={0.16} />
      </mesh>

      {/* ── WALL-MOUNTED SCONCE LIGHTS ────────────────────────────────── */}
      {([-1.22, 1.22] as number[]).map((lx, li) => (
        <group key={li} position={[lx, FDN + 2.65, frontZ + fz * 0.16]}>
          <mesh>
            <boxGeometry args={[0.09, 0.32, 0.09]} />
            <meshStandardMaterial color={LUX_GOLD} metalness={0.88} roughness={0.20} />
          </mesh>
          <mesh position={[0, 0.24, 0]}>
            <sphereGeometry args={[0.11, 7, 6]} />
            <meshStandardMaterial color="#fff8e0" emissive="#fff8e0" emissiveIntensity={1.2} roughness={0.3} />
          </mesh>
        </group>
      ))}

      {/* ── LANDSCAPING ───────────────────────────────────────────────── */}
      {/* Manicured sphere hedges flanking steps */}
      {([-3.8, 3.8] as number[]).map((hx, hi) => (
        <mesh key={hi} position={[hx, 0.72, fz * (BD * 0.5 + 0.7)]}>
          <sphereGeometry args={[0.74, 9, 7]} />
          <meshStandardMaterial color={DARK_GREEN} roughness={0.95} />
        </mesh>
      ))}
      {/* Box hedges lining the yard */}
      {([-W * 0.44, W * 0.44] as number[]).map((hx, hi) => (
        <mesh key={hi} position={[hx, 0.55, fz * (BD * 0.42 + 1.2)]}>
          <sphereGeometry args={[0.56, 8, 6]} />
          <meshStandardMaterial color={DARK_GREEN} roughness={0.95} />
        </mesh>
      ))}
      {/* Stone path from steps to street */}
      <mesh position={[0, 0.015, fz * (BD * 0.5 + 3.6)]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[1.6, 6.0]} />
        <meshStandardMaterial color="#b0a898" roughness={0.86} />
      </mesh>
      {/* Lawn patch */}
      <mesh position={[0, 0.008, fz * (BD * 0.5 + 2.8)]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[W + 1.0, 7.5]} />
        <meshStandardMaterial color={DARK_GREEN} roughness={0.95} />
      </mesh>

    </group>
  );
}

// ── Grand Estate ────────────────────────────────────────────────────────────
// Traditional luxury manor: warm brick, arched windows, steep hipped roof,
// full verandah, bay window, stone gate posts with lanterns.
// `side='south'` faces -z (toward street); `side='north'` faces +z.
function GrandEstate({ x, z, side = 'south', wallColor = BRICK_DEEP }: {
  x: number; z: number; side?: 'north' | 'south'; wallColor?: string;
}) {
  const fz   = side === 'south' ? -1 : 1;
  const W    = 12.0;
  const BH   = 4.4;            // main wall height
  const BD   = 10.0;           // body depth
  const VD   = 2.8;            // verandah depth
  const FDN  = 0.60;           // stone foundation height
  const topY = FDN + BH;       // top of wall (5.0)
  const frontZ = fz * BD * 0.5;
  const verCZ  = fz * (BD * 0.5 + VD * 0.5);
  const stepZ  = fz * (BD * 0.5 + VD + 0.4);

  return (
    <group position={[x, 0, z]}>

      {/* ── PHYSICS COLLIDERS ─────────────────────────────────────────── */}
      <RigidBody type="fixed">
        <mesh position={[0, (topY + 2.5) * 0.5, 0]} visible={false}>
          <boxGeometry args={[W + 1.2, topY + 5.5, BD + 1.2]} />
          <meshBasicMaterial />
        </mesh>
      </RigidBody>
      <RigidBody type="fixed">
        <mesh position={[0, 3.0, verCZ]} visible={false}>
          <boxGeometry args={[W + 1.2, 6.0, VD + 0.6]} />
          <meshBasicMaterial />
        </mesh>
      </RigidBody>
      {/* Side yard walls */}
      {([-1, 1] as const).map((sx, si) => (
        <RigidBody key={si} type="fixed">
          <mesh position={[sx * (W * 0.5 + 1.0), 1.5, 0]} visible={false}>
            <boxGeometry args={[0.8, 3.0, BD + 7.0]} />
            <meshBasicMaterial />
          </mesh>
        </RigidBody>
      ))}

      {/* ── STONE FOUNDATION ──────────────────────────────────────────── */}
      <mesh position={[0, FDN * 0.5, fz * 0.3]} castShadow>
        <boxGeometry args={[W + 0.7, FDN, BD + 0.9]} />
        <meshStandardMaterial color="#7a7060" roughness={0.92} metalness={0.04} />
      </mesh>

      {/* ── BRICK MAIN BODY ───────────────────────────────────────────── */}
      <mesh position={[0, FDN + BH * 0.5, 0]} castShadow receiveShadow>
        <boxGeometry args={[W, BH, BD]} />
        <meshStandardMaterial color={wallColor} roughness={0.88} metalness={0.02} />
      </mesh>
      {/* Brick horizontal mortar lines (subtle) */}
      {Array.from({ length: 7 }, (_, i) => (
        <mesh key={i} position={[0, FDN + 0.4 + i * 0.58, fz * (BD * 0.5 + 0.01)]}>
          <boxGeometry args={[W + 0.02, 0.04, 0.04]} />
          <meshStandardMaterial color="#5a2818" roughness={0.95} />
        </mesh>
      ))}
      {/* White corner quoins */}
      {([-1, 1] as const).map((sx, si) =>
        Array.from({ length: 5 }, (_, qi) => (
          <mesh key={`qe-${si}-${qi}`} position={[sx * (W * 0.5 + 0.11), FDN + 0.42 + qi * 0.85, 0]}>
            <boxGeometry args={[0.24, 0.65, BD + 0.24]} />
            <meshStandardMaterial color={MANOR_CREAM} roughness={0.82} />
          </mesh>
        ))
      )}

      {/* ── WHITE CORNICE ─────────────────────────────────────────────── */}
      <mesh position={[0, topY + 0.12, 0]}>
        <boxGeometry args={[W + 0.32, 0.24, BD + 0.32]} />
        <meshStandardMaterial color={MANOR_CREAM} roughness={0.70} />
      </mesh>
      <mesh position={[0, topY + 0.28, fz * (BD * 0.5 + 0.16)]}>
        <boxGeometry args={[W + 0.32, 0.18, 0.35]} />
        <meshStandardMaterial color={MANOR_CREAM} roughness={0.70} />
      </mesh>

      {/* ── STEEP HIPPED ROOF ─────────────────────────────────────────── */}
      <mesh position={[0, topY + 0.42 + 1.1, 0]}>
        <coneGeometry args={[Math.hypot(W, BD) * 0.52, 2.6, 4, 1]} />
        <meshStandardMaterial color={MANOR_ROOF} roughness={0.93} />
      </mesh>
      <mesh position={[0, topY + 0.32, 0]}>
        <boxGeometry args={[W + 0.32, 0.20, BD + 0.32]} />
        <meshStandardMaterial color={MANOR_ROOF} roughness={0.92} />
      </mesh>
      {/* Chimney */}
      {([[W * 0.3, -BD * 0.22], [-W * 0.28, BD * 0.18]] as [number, number][]).map(([cx, cz], ci) => (
        <group key={ci} position={[cx, topY + 0.6, cz]}>
          <mesh position={[0, 1.1, 0]}>
            <boxGeometry args={[0.52, 2.2, 0.52]} />
            <meshStandardMaterial color="#5a3020" roughness={0.96} />
          </mesh>
          <mesh position={[0, 2.25, 0]}>
            <boxGeometry args={[0.66, 0.16, 0.66]} />
            <meshStandardMaterial color="#4a2818" roughness={0.96} />
          </mesh>
        </group>
      ))}

      {/* ── FULL-WIDTH VERANDAH ───────────────────────────────────────── */}
      {/* Verandah floor */}
      <mesh position={[0, 0.36, verCZ]}>
        <boxGeometry args={[W + 0.2, 0.06, VD]} />
        <meshStandardMaterial color="#c8c0a0" roughness={0.82} />
      </mesh>
      {/* Verandah ceiling */}
      <mesh position={[0, FDN + BH - 0.22, verCZ]}>
        <boxGeometry args={[W + 0.22, 0.18, VD + 0.18]} />
        <meshStandardMaterial color={MANOR_ROOF} roughness={0.90} />
      </mesh>
      {/* 7 round verandah columns */}
      {Array.from({ length: 7 }, (_, i) => {
        const cx = -W * 0.5 + i * (W / 6);
        return (
          <group key={i} position={[cx, 0, verCZ]}>
            <mesh position={[0, 0.36 + 0.14, 0]}>
              <boxGeometry args={[0.26, 0.28, 0.26]} />
              <meshStandardMaterial color={MANOR_CREAM} roughness={0.58} />
            </mesh>
            <mesh position={[0, 0.36 + 0.28 + (FDN + BH - 0.8) * 0.5, 0]}>
              <cylinderGeometry args={[0.13, 0.16, FDN + BH - 0.8, 12]} />
              <meshStandardMaterial color={MANOR_CREAM} roughness={0.42} metalness={0.06} />
            </mesh>
            <mesh position={[0, FDN + BH - 0.32, 0]}>
              <boxGeometry args={[0.30, 0.22, 0.30]} />
              <meshStandardMaterial color={MANOR_CREAM} roughness={0.58} />
            </mesh>
          </group>
        );
      })}
      {/* Verandah balustrade */}
      <mesh position={[0, 0.36 + 1.02, verCZ + fz * (VD * 0.5 - 0.04)]}>
        <boxGeometry args={[W, 0.09, 0.07]} />
        <meshStandardMaterial color={MANOR_CREAM} roughness={0.52} />
      </mesh>
      {Array.from({ length: 19 }, (_, i) => (
        <mesh key={i} position={[-W * 0.5 + 0.36 + i * (W - 0.5) / 18, 0.36 + 0.62, verCZ + fz * (VD * 0.5 - 0.04)]}>
          <boxGeometry args={[0.065, 0.65, 0.065]} />
          <meshStandardMaterial color={MANOR_CREAM} roughness={0.52} />
        </mesh>
      ))}

      {/* ── ARCHED WINDOWS (front, 4) ─────────────────────────────────── */}
      {[-4.2, -1.4, 1.4, 4.2].map((wx, wi) => (
        <group key={wi} position={[wx, FDN + 2.1, frontZ]}>
          {/* White surround */}
          <mesh position={[0, 0, 0.04]}>
            <boxGeometry args={[1.18, 2.35, 0.10]} />
            <meshStandardMaterial color={MANOR_CREAM} roughness={0.65} />
          </mesh>
          {/* Glass pane */}
          <mesh position={[0, -0.1, 0.10]}>
            <boxGeometry args={[0.94, 1.85, 0.05]} />
            <meshStandardMaterial color={LUX_GLASS} roughness={0.08} metalness={0.85} emissive={LUX_GLASS} emissiveIntensity={0.14} />
          </mesh>
          {/* Arch cap (half cylinder) */}
          <mesh position={[0, 1.1, 0.04]} rotation={[0, 0, Math.PI * 0.5]}>
            <cylinderGeometry args={[0.60, 0.60, 0.10, 10, 1, false, 0, Math.PI]} />
            <meshStandardMaterial color={MANOR_CREAM} roughness={0.65} />
          </mesh>
          {/* Sill */}
          <mesh position={[0, -1.28, 0.12]}>
            <boxGeometry args={[1.34, 0.10, 0.24]} />
            <meshStandardMaterial color={LUX_STONE} roughness={0.75} />
          </mesh>
        </group>
      ))}

      {/* ── GRAND DOUBLE DOORS ────────────────────────────────────────── */}
      <mesh position={[0, FDN + 1.58, frontZ + fz * 0.07]}>
        <boxGeometry args={[2.5, 3.16, 0.14]} />
        <meshStandardMaterial color={MANOR_CREAM} roughness={0.68} />
      </mesh>
      {([-0.58, 0.58] as number[]).map((dx, di) => (
        <mesh key={di} position={[dx, FDN + 1.38, frontZ + fz * 0.13]}>
          <boxGeometry args={[0.95, 2.76, 0.09]} />
          <meshStandardMaterial color="#060810" roughness={0.38} metalness={0.28} />
        </mesh>
      ))}
      {/* Arched transom over doors */}
      <mesh position={[0, FDN + 2.98, frontZ + fz * 0.13]}>
        <boxGeometry args={[2.1, 0.55, 0.09]} />
        <meshStandardMaterial color={LUX_GLASS} roughness={0.08} metalness={0.8} emissive={LUX_GLASS} emissiveIntensity={0.20} />
      </mesh>

      {/* ── BAY WINDOW (side) ─────────────────────────────────────────── */}
      <mesh position={[W * 0.5 + 0.55, FDN + 1.9, fz * BD * 0.12]}>
        <boxGeometry args={[1.1, 2.9, 3.2]} />
        <meshStandardMaterial color={wallColor} roughness={0.88} />
      </mesh>
      <mesh position={[W * 0.5 + 1.04, FDN + 1.9, fz * BD * 0.12]}>
        <boxGeometry args={[0.07, 2.55, 2.7]} />
        <meshStandardMaterial color={LUX_GLASS} roughness={0.08} metalness={0.85} emissive={LUX_GLASS} emissiveIntensity={0.12} />
      </mesh>
      {/* Bay roof */}
      <mesh position={[W * 0.5 + 0.55, FDN + BH - 0.12, fz * BD * 0.12]}>
        <boxGeometry args={[1.14, 0.18, 3.28]} />
        <meshStandardMaterial color={MANOR_ROOF} roughness={0.90} />
      </mesh>

      {/* ── STEPS ─────────────────────────────────────────────────────── */}
      {[0, 1, 2].map((s) => (
        <mesh key={s} position={[0, s * 0.19 + 0.095, stepZ + fz * s * 0.34]}>
          <boxGeometry args={[4.6 - s * 0.55, 0.19, 0.36]} />
          <meshStandardMaterial color={LUX_STONE} roughness={0.78} />
        </mesh>
      ))}

      {/* ── ENTRANCE LANTERNS ─────────────────────────────────────────── */}
      {([-1.4, 1.4] as number[]).map((lx, li) => (
        <group key={li} position={[lx, FDN + 2.6, frontZ + fz * 0.16]}>
          <mesh>
            <boxGeometry args={[0.11, 0.38, 0.11]} />
            <meshStandardMaterial color={LUX_GOLD} metalness={0.88} roughness={0.22} />
          </mesh>
          <mesh position={[0, 0.28, 0]}>
            <sphereGeometry args={[0.13, 7, 6]} />
            <meshStandardMaterial color="#ffe8aa" emissive="#ffe8aa" emissiveIntensity={1.0} roughness={0.3} />
          </mesh>
        </group>
      ))}

      {/* ── STONE GATE POSTS ──────────────────────────────────────────── */}
      {([-W * 0.5 + 0.2, W * 0.5 - 0.2] as number[]).map((gx, gi) => (
        <group key={gi} position={[gx, 0, fz * (BD * 0.5 + 4.0)]}>
          <mesh position={[0, 1.6, 0]}>
            <boxGeometry args={[0.55, 3.2, 0.55]} />
            <meshStandardMaterial color="#7a7060" roughness={0.88} />
          </mesh>
          <mesh position={[0, 3.3, 0]}>
            <boxGeometry args={[0.72, 0.42, 0.72]} />
            <meshStandardMaterial color="#7a7060" roughness={0.85} />
          </mesh>
          <mesh position={[0, 3.62, 0]}>
            <sphereGeometry args={[0.20, 8, 7]} />
            <meshStandardMaterial color="#ffe088" emissive="#ffe088" emissiveIntensity={0.7} roughness={0.3} />
          </mesh>
        </group>
      ))}

      {/* ── GARDEN ────────────────────────────────────────────────────── */}
      <mesh position={[0, 0.015, fz * (BD * 0.5 + 2.2)]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[2.2, 7.5]} />
        <meshStandardMaterial color="#a0988a" roughness={0.87} />
      </mesh>
      <mesh position={[0, 0.008, fz * (BD * 0.5 + 3.0)]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[W + 1.2, 8.0]} />
        <meshStandardMaterial color={DARK_GREEN} roughness={0.95} />
      </mesh>
      {/* Garden hedge boxes */}
      {([-4.2, -1.5, 1.5, 4.2] as number[]).map((hx, hi) => (
        <mesh key={hi} position={[hx, 0.68, fz * (BD * 0.5 + 1.6)]}>
          <boxGeometry args={[1.3, 1.36, 0.65]} />
          <meshStandardMaterial color={DARK_GREEN} roughness={0.96} />
        </mesh>
      ))}

    </group>
  );
}


// ── Creole Cottage ─────────────────────────────────────────────────────────
// Square, hipped roof, full-width front gallery, elegant shutters
function CreoleCottage({ x, z, rot = 0, wallColor = HOUSE_YELLOW,
  shutterColor = TRIM_GREEN, roofColor = '#1a1208' }:
  { x: number; z: number; rot?: number; wallColor?: string;
    shutterColor?: string; roofColor?: string }) {
  return (
    <group position={[x, 0, z]} rotation={[0, rot, 0]}>
      {/* Body */}
      <Box pos={[0, 1.80, 0]} size={[6.2, 3.60, 5.8]} color={wallColor} receiveShadow />

      {/* Horizontal siding */}
      {[0.5, 0.9, 1.3, 1.7, 2.1, 2.5, 2.9].map((y, i) => (
        <Box key={i} pos={[0, y, 2.91]} size={[6.22, 0.025, 0.012]} color={WOOD_DARK} roughness={0.95} />
      ))}

      {/* Full-width gallery */}
      <Box pos={[0, 0.12, 3.30]} size={[6.4, 0.12, 1.55]} color={WOOD_DARK} receiveShadow />
      {[-2.5, -1.2, 0, 1.2, 2.5].map((px, i) => (
        <group key={i}>
          <Box pos={[px, 1.64, 3.85]} size={[0.14, 3.04, 0.14]} color="#ddd0b8" />
          <Box pos={[px, 3.20, 3.85]} size={[0.22, 0.10, 0.22]} color="#ddd0b8" />
        </group>
      ))}
      <Box pos={[0, 3.26, 3.85]} size={[6.4, 0.14, 0.10]} color="#ddd0b8" />
      {/* Gallery railing */}
      <Box pos={[0, 1.18, 4.02]} size={[6.4, 0.07, 0.05]} color="#ddd0b8" />
      <Box pos={[0, 0.82, 4.02]} size={[6.4, 0.07, 0.05]} color="#ddd0b8" />
      {Array.from({ length: 11 }, (_, i) => (
        <Box key={i} pos={[-2.75 + i * 0.55, 1.00, 4.02]} size={[0.04, 0.36, 0.04]} color="#ddd0b8" />
      ))}

      {/* Hipped roof */}
      <mesh position={[0, 3.44, 0]} castShadow>
        <boxGeometry args={[6.6, 0.12, 6.2]} />
        <meshStandardMaterial color={roofColor} roughness={0.95} />
      </mesh>
      <mesh position={[0, 3.44, 0]} castShadow>
        <coneGeometry args={[5.0, 1.50, 4]} />
        <meshStandardMaterial color={roofColor} roughness={0.95} />
      </mesh>

      {/* Windows with shutters */}
      {[-1.8, 1.8].map((px, i) => (
        <group key={i} position={[px, 1.85, 2.91]}>
          <Box pos={[0, 0, 0]} size={[0.82, 1.12, 0.06]} color="#ddd0b8" />
          <mesh position={[0, 0, 0.04]}>
            <planeGeometry args={[0.68, 0.98]} />
            <meshStandardMaterial color="#ffcc44" emissive="#ffcc44" emissiveIntensity={0.18} transparent opacity={0.65} />
          </mesh>
          <Box pos={[-0.55, 0, 0.01]} size={[0.24, 1.12, 0.04]} color={shutterColor} roughness={0.8} />
          <Box pos={[ 0.55, 0, 0.01]} size={[0.24, 1.12, 0.04]} color={shutterColor} roughness={0.8} />
        </group>
      ))}

      {/* Door */}
      <Box pos={[0, 1.00, 2.91]} size={[0.88, 1.92, 0.06]} color={WOOD_DARK} />

      {/* Porch light globe (emissive only) */}
      <mesh position={[0, 3.10, 3.72]}>
        <sphereGeometry args={[0.07, 6, 6]} />
        <meshBasicMaterial color="#ffe8aa" />
      </mesh>
    </group>
  );
}

// ── Corner Bar ────────────────────────────────────────────────────────────
function CornerBar({ x, z, rot = 0, name = "COLD ONES" }:
  { x: number; z: number; rot?: number; name?: string }) {
  return (
    <group position={[x, 0, z]} rotation={[0, rot, 0]}>
      {/* Brick building */}
      <mesh position={[0, 2.5, 0]} castShadow receiveShadow>
        <boxGeometry args={[8.5, 5.0, 7.5]} />
        <meshStandardMaterial color="#5a3028" roughness={0.97} metalness={0.02} />
      </mesh>
      {/* Brick course lines */}
      {Array.from({ length: 8 }, (_, i) => (
        <Box key={i} pos={[0, 0.3 + i * 0.58, 3.76]} size={[8.52, 0.022, 0.015]} color="#3e2018" roughness={0.99} />
      ))}
      {/* Parapet */}
      <Box pos={[0, 5.28, 0]} size={[8.7, 0.56, 7.7]} color="#4a2820" roughness={0.97} />

      {/* Canvas awning */}
      <mesh position={[0, 3.10, 4.15]} rotation={[-0.28, 0, 0]}>
        <boxGeometry args={[8.2, 0.06, 1.9]} />
        <meshStandardMaterial color="#1a1a12" roughness={0.9} />
      </mesh>
      {/* Awning fringe */}
      {Array.from({ length: 12 }, (_, i) => (
        <Box key={i} pos={[-3.75 + i * 0.68, 2.46, 4.84]} size={[0.28, 0.22, 0.03]} color="#1a1a12" roughness={0.9} />
      ))}

      {/* Neon sign — emissive glow */}
      <group position={[0, 3.85, 3.78]}>
        <mesh>
          <boxGeometry args={[5.0, 0.55, 0.10]} />
          <meshStandardMaterial color="#ff4400" emissive="#ff4400" emissiveIntensity={2.0} roughness={0.5} />
        </mesh>
        <Text position={[0, 0, 0.08]} fontSize={0.34} color="#ffcc88"
          anchorX="center" anchorY="middle" outlineWidth={0.02} outlineColor="#000">
          {name}
        </Text>
        <pointLight position={[0, 0, 0.2]} color="#ff5500" intensity={12} distance={8} decay={2} />
      </group>

      {/* Windows — warm orange bar glow */}
      {[-2.4, 0, 2.4].map((px, i) => (
        <group key={i} position={[px, 2.4, 3.76]}>
          <Box pos={[0, 0, 0]} size={[1.4, 1.55, 0.07]} color="#2a1808" roughness={0.85} />
          <mesh position={[0, 0, 0.05]}>
            <planeGeometry args={[1.26, 1.40]} />
            <meshBasicMaterial color="#ff8822" transparent opacity={0.55} />
          </mesh>
        </group>
      ))}

      {/* Bar interior warm glow */}
      <pointLight position={[0, 2.2, 1.5]} color="#ff8822" intensity={10} distance={16} decay={1.6} />

      {/* Door */}
      <Box pos={[0, 1.0, 3.76]} size={[1.2, 2.0, 0.07]} color={WOOD_DARK} />

      {/* A-frame sidewalk sign */}
      <group position={[0, 0, 5.2]}>
        <Box pos={[-0.5, 0.6, 0]} size={[0.04, 1.2, 0.04]} color="#3a3a3a" metalness={0.5} />
        <Box pos={[ 0.5, 0.6, 0]} size={[0.04, 1.2, 0.04]} color="#3a3a3a" metalness={0.5} />
        <Box pos={[0, 0.85, 0]} size={[0.9, 0.52, 0.04]} color="#1a1a1a" roughness={0.8} />
      </group>
    </group>
  );
}

// ── Street Lamp — authentic cast-iron style ────────────────────────────────
function StreetLamp({ x, z, side = 1, withLight = true }:
  { x: number; z: number; side?: number; withLight?: boolean }) {
  return (
    <group position={[x, 0, z]}>
      {/* Fluted pole */}
      <mesh position={[0, 3.0, 0]} castShadow>
        <cylinderGeometry args={[0.055, 0.08, 6.0, 10]} />
        <meshStandardMaterial color="#252520" metalness={0.75} roughness={0.45} />
      </mesh>
      {/* Decorative base collar */}
      <mesh position={[0, 0.18, 0]}>
        <cylinderGeometry args={[0.16, 0.18, 0.36, 8]} />
        <meshStandardMaterial color="#1e1e1a" metalness={0.8} roughness={0.3} />
      </mesh>
      {/* Curved arm */}
      <mesh position={[side * 0.55, 6.14, 0]} rotation={[0, 0, -side * 0.20]}>
        <cylinderGeometry args={[0.038, 0.038, 1.3, 7]} />
        <meshStandardMaterial color="#252520" metalness={0.75} roughness={0.45} />
      </mesh>
      {/* Lantern body */}
      <mesh position={[side * 1.05, 6.3, 0]}>
        <cylinderGeometry args={[0.10, 0.14, 0.30, 8]} />
        <meshStandardMaterial color="#1a1a18" metalness={0.8} roughness={0.3} />
      </mesh>
      {/* Globe */}
      <mesh position={[side * 1.05, 6.12, 0]}>
        <sphereGeometry args={[0.14, 10, 8]} />
        <meshBasicMaterial color={withLight ? "#ffdd88" : "#222222"} />
      </mesh>
      {/* Conical hat */}
      <mesh position={[side * 1.05, 6.50, 0]}>
        <coneGeometry args={[0.18, 0.20, 8]} />
        <meshStandardMaterial color="#1a1a18" metalness={0.8} />
      </mesh>
      {withLight && (
        <pointLight position={[side * 1.05, 6.12, 0]} color="#ffdd66" intensity={14} distance={32} decay={1.6} />
      )}
    </group>
  );
}

// ── Utility Pole with cables ───────────────────────────────────────────────
function UtilityPole({ x, z }:
  { x: number; z: number }) {
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, 4.5, 0]}>
        <cylinderGeometry args={[0.09, 0.13, 9.0, 7]} />
        <meshStandardMaterial color="#2e1e0e" roughness={0.97} />
      </mesh>
      {/* Cross arm */}
      <mesh position={[0, 8.5, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.05, 0.05, 2.8, 6]} />
        <meshStandardMaterial color="#2e1e0e" roughness={0.97} />
      </mesh>
      {/* Insulators */}
      {[-1.2, 0, 1.2].map((ox, i) => (
        <mesh key={i} position={[ox, 8.62, 0]}>
          <cylinderGeometry args={[0.06, 0.06, 0.14, 6]} />
          <meshStandardMaterial color="#303030" metalness={0.6} roughness={0.4} />
        </mesh>
      ))}
    </group>
  );
}

// ── Power/Cable line between two poles ────────────────────────────────────
function CableLine({ x1, z1, x2, z2, height = 8.6 }:
  { x1: number; z1: number; x2: number; z2: number; height?: number }) {
  const dx = x2 - x1;
  const dz = z2 - z1;
  const len = Math.sqrt(dx * dx + dz * dz);
  const cx  = (x1 + x2) / 2;
  const cz  = (z1 + z2) / 2;
  const ang = Math.atan2(dx, dz);
  return (
    <group position={[cx, height, cz]} rotation={[0, ang, 0]}>
      {/* Slight sag in cable — offset center down */}
      <mesh position={[0, -0.18, 0]} rotation={[0, 0, 0]}>
        <cylinderGeometry args={[0.018, 0.018, len, 4]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.9} />
      </mesh>
    </group>
  );
}

// ── Parked Car ────────────────────────────────────────────────────────────
function ParkedCar({ x, z, rot = 0, bodyColor = '#1a1a2a' }:
  { x: number; z: number; rot?: number; bodyColor?: string }) {
  return (
    <group position={[x, 0, z]} rotation={[0, rot, 0]}>
      <Box pos={[0, 0.52, 0]} size={[2.0, 0.68, 4.4]} color={bodyColor} metalness={0.55} roughness={0.38} />
      <Box pos={[0, 1.10, -0.15]} size={[1.78, 0.52, 2.55]} color={bodyColor} metalness={0.45} roughness={0.32} />
      {/* Windshield */}
      <mesh position={[0, 1.08, 1.02]} rotation={[0.46, 0, 0]}>
        <planeGeometry args={[1.52, 0.62]} />
        <meshBasicMaterial color="#0a1a28" transparent opacity={0.85} />
      </mesh>
      {/* Wheels */}
      {[[-0.88, -1.4], [0.88, -1.4], [-0.88, 1.4], [0.88, 1.4]].map(([wx, wz], i) => (
        <mesh key={i} position={[wx, 0.26, wz]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.28, 0.28, 0.24, 11]} />
          <meshStandardMaterial color="#111" roughness={0.95} />
        </mesh>
      ))}
      {/* Tail lights */}
      <mesh position={[0, 0.55, 2.22]}>
        <planeGeometry args={[1.6, 0.20]} />
        <meshBasicMaterial color="#cc1111" transparent opacity={0.7} />
      </mesh>
    </group>
  );
}

// ── Rain Particles ────────────────────────────────────────────────────────
const RAIN_COUNT = 350;
function Rain() {
  const ref = useRef<THREE.Points>(null);
  const positions = useMemo(() => {
    const arr = new Float32Array(RAIN_COUNT * 3);
    for (let i = 0; i < RAIN_COUNT; i++) {
      arr[i * 3]     = (Math.random() - 0.5) * 90;
      arr[i * 3 + 1] = Math.random() * 28;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 90;
    }
    return arr;
  }, []);
  useFrame((_, delta) => {
    if (!ref.current) return;
    ref.current.visible = weatherStore.rainVisible;
    if (!weatherStore.rainVisible) return;
    const pos = ref.current.geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < RAIN_COUNT; i++) {
      pos[i * 3 + 1] -= delta * 14;
      if (pos[i * 3 + 1] < 0) {
        pos[i * 3 + 1] = 28;
        pos[i * 3]     = (Math.random() - 0.5) * 90;
        pos[i * 3 + 2] = (Math.random() - 0.5) * 90;
      }
    }
    ref.current.geometry.attributes.position.needsUpdate = true;
  });
  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial color="#c8d8e8" size={0.05} transparent opacity={0.38} />
    </points>
  );
}

// ── Ground Puddle ─────────────────────────────────────────────────────────
function Puddle({ x, z, w = 2, d = 1 }:
  { x: number; z: number; w?: number; d?: number }) {
  return (
    <mesh position={[x, 0.022, z]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[w, d]} />
      <meshStandardMaterial color="#22222e" metalness={0.95} roughness={0.02} transparent opacity={0.75} />
    </mesh>
  );
}

// ── Mailbox ───────────────────────────────────────────────────────────────
function Mailbox({ x, z }:
  { x: number; z: number }) {
  return (
    <group position={[x, 0, z]}>
      <Box pos={[0, 0.75, 0]} size={[0.12, 0.66, 0.10]} color="#282828" metalness={0.5} />
      <Box pos={[0, 1.18, 0]} size={[0.28, 0.18, 0.22]} color="#bbbaba" metalness={0.65} roughness={0.4} />
      {/* Flag */}
      <Box pos={[0.16, 1.22, 0]} size={[0.035, 0.12, 0.035]} color="#cc3322" roughness={0.7} />
    </group>
  );
}

// ── Dumpster ──────────────────────────────────────────────────────────────
function Dumpster({ x, z }:
  { x: number; z: number }) {
  return (
    <group position={[x, 0, z]}>
      <Box pos={[0, 0.62, 0]} size={[1.35, 1.24, 0.98]} color="#263026" metalness={0.45} roughness={0.72} />
      <Box pos={[0, 1.25, 0]} size={[1.40, 0.10, 1.02]} color="#1c2418" metalness={0.4} roughness={0.65} />
    </group>
  );
}

// ── Chain-Link Fence ─────────────────────────────────────────────────────
function ChainLinkFence({ x1, z1, x2, z2 }:
  { x1: number; z1: number; x2: number; z2: number }) {
  const dx = x2 - x1, dz = z2 - z1;
  const len = Math.sqrt(dx * dx + dz * dz);
  const cx = (x1 + x2) / 2, cz = (z1 + z2) / 2;
  const rot = Math.atan2(dx, dz);
  return (
    <group position={[cx, 0.9, cz]} rotation={[0, rot, 0]}>
      <mesh>
        <boxGeometry args={[len, 1.6, 0.04]} />
        <meshStandardMaterial color="#666" metalness={0.7} roughness={0.5} transparent opacity={0.55} wireframe />
      </mesh>
      {/* Posts */}
      {Array.from({ length: Math.ceil(len / 3) + 1 }, (_, i) => (
        <mesh key={i} position={[-len / 2 + i * (len / Math.ceil(len / 3)), 0, 0]}>
          <cylinderGeometry args={[0.04, 0.04, 1.8, 5]} />
          <meshStandardMaterial color="#555" metalness={0.7} roughness={0.4} />
        </mesh>
      ))}
    </group>
  );
}

// ── Fence (wood picket) ───────────────────────────────────────────────────
function WoodFence({ x1, z1, x2, z2 }:
  { x1: number; z1: number; x2: number; z2: number }) {
  const dx  = x2 - x1;
  const dz  = z2 - z1;
  const len = Math.sqrt(dx * dx + dz * dz);
  const cx  = (x1 + x2) / 2;
  const cz  = (z1 + z2) / 2;
  const ang = Math.atan2(dx, dz);
  const pickets = Math.floor(len / 0.45);
  return (
    <group position={[cx, 0, cz]} rotation={[0, ang, 0]}>
      {/* Rails */}
      <Box pos={[0, 0.70, 0]} size={[len, 0.06, 0.06]} color="#3a2e20" roughness={0.95} />
      <Box pos={[0, 0.38, 0]} size={[len, 0.06, 0.06]} color="#3a2e20" roughness={0.95} />
      {/* Pickets */}
      {Array.from({ length: pickets }, (_, i) => (
        <Box key={i}
          pos={[-len / 2 + 0.22 + i * (len / pickets), 0.54, 0]}
          size={[0.10, 1.06, 0.06]}
          color="#3a2e20" roughness={0.95} />
      ))}
    </group>
  );
}

// ── Cloud puff ─────────────────────────────────────────────────────────────
function Cloud({ cx, cy, cz, scale = 1 }: { cx: number; cy: number; cz: number; scale?: number }) {
  const puffs: [number,number,number,number][] = [
    [0,0,0,1.0], [1.6,0.3,0.4,0.82], [-1.3,0.2,-0.3,0.88],
    [0.9,-0.15,1.1,0.70], [-0.6,0.4,-1.0,0.76], [2.2,-0.1,-0.5,0.65],
  ];
  return (
    <group position={[cx, cy, cz]}>
      {puffs.map(([dx, dy, dz, s], i) => (
        <mesh key={i} position={[dx * scale, dy * scale, dz * scale]}>
          <sphereGeometry args={[s * scale, 7, 5]} />
          <meshStandardMaterial color="#f0f4ff" transparent opacity={0.82} roughness={1} depthWrite={false} />
        </mesh>
      ))}
    </group>
  );
}

// ── Cloud layer — two groups drift at different speeds ────────────────────
function CloudLayer() {
  const g1 = useRef<THREE.Group>(null);
  const g2 = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    if (g1.current) {
      g1.current.position.x += delta * 0.7;
      if (g1.current.position.x > 280) g1.current.position.x = -280;
    }
    if (g2.current) {
      g2.current.position.x += delta * 0.35;
      if (g2.current.position.x > 280) g2.current.position.x = -280;
    }
  });
  return (
    <>
      <group ref={g1}>
        <Cloud cx={-120} cy={65} cz={-90} scale={9} />
        <Cloud cx={40}   cy={72} cz={-130} scale={11} />
        <Cloud cx={200}  cy={58} cz={-50}  scale={8} />
        <Cloud cx={-50}  cy={68} cz={60}   scale={7} />
      </group>
      <group ref={g2}>
        <Cloud cx={-200} cy={60} cz={40}  scale={10} />
        <Cloud cx={10}   cy={75} cz={110} scale={7} />
        <Cloud cx={160}  cy={63} cz={-20} scale={12} />
        <Cloud cx={90}   cy={70} cz={80}  scale={8} />
      </group>
    </>
  );
}

// ── Day/Night + Weather + Season system ─────────────────────────────────────
// • Advances dayTime 1 game-hour per real minute (full day = 24 min)
// • Cycles seasons every 5 real minutes
// • Cycles weather per season weights (bayou = mostly sunny)
// • Lerps sky colors, sun angle, ambient + sun intensity each frame
const _skyC   = new THREE.Color();
const _targetC = new THREE.Color();

function DayNightSystem() {
  const { scene } = useThree();

  const ambientRef  = useRef<THREE.AmbientLight>(null);
  const sunRef      = useRef<THREE.DirectionalLight>(null);
  const moonRef     = useRef<THREE.DirectionalLight>(null);
  const hemiRef     = useRef<THREE.HemisphereLight>(null);
  const upperDomeRef = useRef<THREE.Mesh>(null);
  const horizonRef   = useRef<THREE.Mesh>(null);
  const hazeRef      = useRef<THREE.Mesh>(null);

  // Weather cycle timer
  const weatherTimer = useRef(90);
  const weatherIdx   = useRef(0);
  // Season cycle timer
  const seasonTimer  = useRef(300);
  const seasonIdx    = useRef(1);   // start on first 'summer' in SEASON_CYCLE

  useEffect(() => {
    scene.fog = new THREE.Fog('#c8e4f8', 80, 300);
    return () => { scene.fog = null; };
  }, [scene]);

  useFrame((_, delta) => {
    // ── Advance game time: 1 real second = 1 game minute ──────────────────
    weatherStore.dayTime = (weatherStore.dayTime + delta / 60) % 24;
    const hour = weatherStore.dayTime;
    weatherStore.isNight = hour >= 20 || hour < 6;

    // ── Season cycle (every 5 real minutes) ──────────────────────────────
    weatherStore.seasonTimer -= delta;
    if (weatherStore.seasonTimer <= 0) {
      weatherStore.seasonTimer = 300;
      seasonIdx.current = (seasonIdx.current + 1) % SEASON_CYCLE.length;
      weatherStore.season = SEASON_CYCLE[seasonIdx.current];
      // Reset weather for new season
      weatherIdx.current = 0;
      const cycle = SEASON_WEATHER[weatherStore.season];
      applyWeather(cycle[0]);
      weatherTimer.current = 90 + Math.random() * 60;
    }

    // ── Weather cycle (based on current season weights) ───────────────────
    weatherTimer.current -= delta;
    if (weatherTimer.current <= 0) {
      const cycle = SEASON_WEATHER[weatherStore.season];
      weatherIdx.current = (weatherIdx.current + 1) % cycle.length;
      applyWeather(cycle[weatherIdx.current]);
      weatherTimer.current = 80 + Math.random() * 70;
    }

    // ── Sky colors ────────────────────────────────────────────────────────
    const [upperHex, horizonHex] = getSkyColors(hour, weatherStore.season);
    weatherStore.upperSkyHex = upperHex;
    weatherStore.horizonHex  = horizonHex;

    if (upperDomeRef.current) {
      const mat = upperDomeRef.current.material as THREE.MeshBasicMaterial;
      _targetC.set(upperHex);
      mat.color.lerp(_targetC, delta * 0.8);
    }
    if (horizonRef.current) {
      const mat = horizonRef.current.material as THREE.MeshBasicMaterial;
      _targetC.set(horizonHex);
      mat.color.lerp(_targetC, delta * 0.8);
    }

    // ── Lights ───────────────────────────────────────────────────────────
    const sunData = getSunData(hour, weatherStore.season);
    const targetSun = sunData.intensity * (weatherStore.state === 'rain' ? 0.2 :
                                           weatherStore.state === 'cloudy' ? 0.55 :
                                           weatherStore.state === 'cold' ? 0.6 : 1.0);
    const targetAmbient = weatherStore.ambientIntensity *
      (weatherStore.isNight ? 0.18 : 1.0);

    if (sunRef.current) {
      sunRef.current.intensity += (targetSun - sunRef.current.intensity) * delta * 0.6;
      // Sun arc: position changes with hour (rises east, sets west)
      const angle = (hour - 6) / 12 * Math.PI; // 0 at 6AM, PI at 6PM
      sunRef.current.position.set(
        Math.cos(angle) * 120,
        Math.sin(angle) * 100 + 5,
        -20
      );
    }
    if (ambientRef.current) {
      const ambColor = weatherStore.isNight ? '#1a2040' :
                       weatherStore.season === 'winter' ? '#c8d8f0' : '#e8d8c8';
      _targetC.set(ambColor);
      (ambientRef.current.color as THREE.Color).lerp(_targetC, delta * 0.4);
      ambientRef.current.intensity += (targetAmbient - ambientRef.current.intensity) * delta * 0.6;
    }
    if (moonRef.current) {
      moonRef.current.intensity += (sunData.moonIntensity - moonRef.current.intensity) * delta * 0.5;
    }

    // ── Fog ───────────────────────────────────────────────────────────────
    if (scene.fog) {
      const fog = scene.fog as THREE.Fog;
      fog.near = weatherStore.fogNear;
      fog.far  = weatherStore.fogFar;
      const fogHex = weatherStore.state === 'rain' ? '#7090a0' :
                     weatherStore.state === 'storm' ? '#506070' :
                     weatherStore.state === 'cold' ? '#9098b0' :
                     weatherStore.state === 'cloudy' ? '#a8c0d4' :
                     weatherStore.isNight ? '#08101a' : '#c8e4f8';
      fog.color.set(fogHex);
    }
  });

  return (
    <>
      {/* Upper sky dome — color driven by day/night */}
      <mesh ref={upperDomeRef}>
        <sphereGeometry args={[490, 16, 8]} />
        <meshBasicMaterial color="#2a5fa8" side={THREE.BackSide} />
      </mesh>
      {/* Horizon gradient */}
      <mesh ref={horizonRef} position={[0, -60, 0]}>
        <sphereGeometry args={[488, 16, 6, 0, Math.PI * 2, 0, Math.PI * 0.38]} />
        <meshBasicMaterial color="#87ceeb" side={THREE.BackSide} transparent opacity={0.85} />
      </mesh>
      {/* Horizon haze ring */}
      <mesh ref={hazeRef} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[480, 30, 6, 32]} />
        <meshBasicMaterial color="#c8e4f8" transparent opacity={0.35} />
      </mesh>
      {/* Moon — visible at night */}
      <mesh position={[-80, 130, -200]}>
        <sphereGeometry args={[6, 10, 8]} />
        <meshBasicMaterial color="#e8eeff" />
      </mesh>

      {/* Lights */}
      <ambientLight ref={ambientRef} color="#e8d8c8" intensity={2.0} />
      <directionalLight ref={sunRef} color="#fff8e0" intensity={4.2}
        position={[80, 100, -20]} castShadow={false} />
      <directionalLight ref={moonRef} color="#c8d8ff" intensity={0}
        position={[-80, 120, 60]} castShadow={false} />
      <hemisphereLight ref={hemiRef} args={['#87aad8', '#6a5a3a', 0.5]} />
    </>
  );
}

// ══════════════════════════════════════════════════════════════════════════
// MAIN WORLD
// ══════════════════════════════════════════════════════════════════════════
export function ChippewaWorld() {
  return (
    <>
      {/* ── Day/Night + Weather + Season (all-in-one) ── */}
      <DayNightSystem />

      {/* ── Animated cloud layer ── */}
      <CloudLayer />

      {/* ── Ground Layers ── */}
      <RigidBody type="fixed" colliders="cuboid">
        {/* Expanded ground — covers entire city district (500×500) */}
        <mesh position={[20, 0, 0]} receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[500, 500]} />
          <meshStandardMaterial color={ASPHALT} roughness={0.45} metalness={0.3} envMapIntensity={1.8} />
        </mesh>
      </RigidBody>

      {/* ── Connector roads to new districts ── */}
      {/* North connector: Chippewa → Government St */}
      <mesh position={[0, 0.006, -55]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[12, 40]} />
        <meshStandardMaterial color={ASPHALT} roughness={0.55} metalness={0.2} />
      </mesh>
      {/* East connector: Chippewa → Downtown */}
      <mesh position={[81, 0.006, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[18, 14]} />
        <meshStandardMaterial color={ASPHALT} roughness={0.55} metalness={0.2} />
      </mesh>
      {/* West connector: Chippewa → West Suburbs */}
      <mesh position={[-81, 0.006, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[18, 14]} />
        <meshStandardMaterial color={ASPHALT} roughness={0.55} metalness={0.2} />
      </mesh>

      {/* Grass neutral ground / parkway strips (between road and sidewalk) */}
      {/* North parkway */}
      <mesh position={[0, 0.018, -10.2]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[130, 2.2]} />
        <meshStandardMaterial color={GRASS_STRIP} roughness={0.96} />
      </mesh>
      {/* South parkway */}
      <mesh position={[0, 0.018, 10.2]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[130, 2.2]} />
        <meshStandardMaterial color={GRASS_STRIP} roughness={0.96} />
      </mesh>

      {/* Brick sidewalks */}
      <mesh position={[0, 0.028, -11.8]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[130, 2.6]} />
        <meshStandardMaterial color={BRICK_WALK} roughness={0.94} />
      </mesh>
      <mesh position={[0, 0.028, 11.8]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[130, 2.6]} />
        <meshStandardMaterial color={BRICK_WALK} roughness={0.94} />
      </mesh>
      {/* Curbs */}
      <Box pos={[0, 0.06, -9.15]} size={[130, 0.12, 0.22]} color={CURB} roughness={0.88} castShadow={false} />
      <Box pos={[0, 0.06,  9.15]} size={[130, 0.12, 0.22]} color={CURB} roughness={0.88} castShadow={false} />
      <Box pos={[0, 0.06, -13.0]} size={[130, 0.12, 0.22]} color={CURB} roughness={0.88} castShadow={false} />
      <Box pos={[0, 0.06,  13.0]} size={[130, 0.12, 0.22]} color={CURB} roughness={0.88} castShadow={false} />

      {/* Yard grass behind sidewalks */}
      <mesh position={[0, 0.015, -22]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[130, 20]} />
        <meshStandardMaterial color={GRASS_YARD} roughness={0.97} />
      </mesh>
      <mesh position={[0, 0.015, 22]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[130, 20]} />
        <meshStandardMaterial color={GRASS_YARD} roughness={0.97} />
      </mesh>

      {/* Road lane lines */}
      {[-20, -10, 10, 20].map((x, i) => (
        <mesh key={i} position={[x, 0.025, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.20, 7]} />
          <meshBasicMaterial color="#2e2e32" />
        </mesh>
      ))}
      {/* Center double-yellow */}
      <mesh position={[0, 0.026, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[120, 0.15]} />
        <meshBasicMaterial color="#ccaa00" transparent opacity={0.5} />
      </mesh>
      <mesh position={[0.25, 0.026, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[120, 0.15]} />
        <meshBasicMaterial color="#ccaa00" transparent opacity={0.5} />
      </mesh>

      {/* Rain — visible only during rain/storm weather */}
      <Rain />

      {/* Puddles */}
      <Puddle x={-10} z={2.0}  w={3.5} d={0.9} />
      <Puddle x={8}   z={-1.5} w={2.5} d={1.1} />
      <Puddle x={-28} z={0.8}  w={2.0} d={0.7} />
      <Puddle x={22}  z={1.8}  w={4.0} d={0.8} />
      <Puddle x={-42} z={-0.5} w={1.8} d={0.6} />
      <Puddle x={38}  z={2.5}  w={3.0} d={1.0} />

      {/* ══ NORTH SIDE — Luxury homes, front faces south (side='south') ══ */}
      <LuxuryMansion x={-59} z={-19} side="south" wallColor={LUX_IVORY}  />
      <LuxuryMansion x={-46} z={-19} side="south" wallColor={LUX_PEARL}  />
      <GrandEstate   x={-19} z={-20} side="south" wallColor={BRICK_DEEP} />
      <LuxuryMansion x={-33} z={-19} side="south" wallColor={MANOR_CREAM}/>
      <LuxuryMansion x={-5}  z={-19} side="south" wallColor={LUX_SLATE}  />
      <GrandEstate   x={9}   z={-20} side="south" wallColor={BRICK_MID}  />
      <LuxuryMansion x={23}  z={-19} side="south" wallColor={LUX_IVORY}  />
      <LuxuryMansion x={36}  z={-19} side="south" wallColor={LUX_PEARL}  />
      <GrandEstate   x={50}  z={-20} side="south" wallColor={BRICK_DEEP} />

      {/* ══ SOUTH SIDE — Luxury homes, front faces north (side='north') ══ */}
      <LuxuryMansion x={-60} z={19}  side="north" wallColor={LUX_PEARL}  />
      <LuxuryMansion x={-48} z={19}  side="north" wallColor={MANOR_CREAM}/>
      <GrandEstate   x={-34} z={20}  side="north" wallColor={BRICK_MID}  />
      <LuxuryMansion x={-20} z={19}  side="north" wallColor={LUX_IVORY}  />
      <LuxuryMansion x={-6}  z={19}  side="north" wallColor={LUX_SLATE}  />
      <GrandEstate   x={8}   z={20}  side="north" wallColor={BRICK_DEEP} />
      <LuxuryMansion x={22}  z={19}  side="north" wallColor={LUX_IVORY}  />
      <LuxuryMansion x={35}  z={19}  side="north" wallColor={LUX_PEARL}  />
      <GrandEstate   x={49}  z={20}  side="north" wallColor={BRICK_MID}  />

      {/* ══ CORNER BARS ════════════════════════════════════════════════ */}
      <CornerBar x={-64} z={-25} rot={0}       name="CHIPPEWA TAVERN" />
      <CornerBar x={64}  z={25}  rot={Math.PI} name="SOUTH SIDE BAR"  />
      {/* Closed shop / laundromat type building */}
      <group position={[64, 0, -22]}>
        <Box pos={[0, 2.2, 0]} size={[7.5, 4.4, 6.5]} color="#383028" roughness={0.97} receiveShadow />
        <Box pos={[0, 4.5, 0]} size={[7.7, 0.4, 6.7]} color="#2a2218" roughness={0.97} />
        {[-2.0, 1.5].map((px, i) => (
          <Box key={i} pos={[px, 2.4, 3.26]} size={[1.3, 1.4, 0.07]} color={WOOD_DARK} roughness={0.88} />
        ))}
      </group>

      {/* ══ LIVE OAK TREES (defining feature of the street) ════════════ */}
      {/* Parkway oaks — massive, lining both sides of the street */}
      <LiveOak x={-44} z={-10.5} scale={1.15} seed={1} />
      <LiveOak x={-30} z={-10.5} scale={1.00} seed={3} />
      <LiveOak x={-16} z={-10.5} scale={1.25} seed={7} />
      <LiveOak x={0}   z={-10.5} scale={1.10} seed={2} />
      <LiveOak x={14}  z={-10.5} scale={0.95} seed={5} />
      <LiveOak x={28}  z={-10.5} scale={1.20} seed={8} />
      <LiveOak x={44}  z={-10.5} scale={1.05} seed={4} />
      <LiveOak x={58}  z={-10.5} scale={0.90} seed={9} />

      <LiveOak x={-52} z={10.5}  scale={1.10} seed={11} />
      <LiveOak x={-38} z={10.5}  scale={1.20} seed={6}  />
      <LiveOak x={-24} z={10.5}  scale={0.95} seed={10} />
      <LiveOak x={-8}  z={10.5}  scale={1.15} seed={13} />
      <LiveOak x={6}   z={10.5}  scale={1.00} seed={15} />
      <LiveOak x={20}  z={10.5}  scale={1.25} seed={12} />
      <LiveOak x={36}  z={10.5}  scale={1.05} seed={14} />
      <LiveOak x={52}  z={10.5}  scale={1.15} seed={16} />

      {/* Yard trees behind houses */}
      <LiveOak x={-55} z={-28} scale={1.30} seed={20} />
      <LiveOak x={-18} z={-30} scale={1.10} seed={22} />
      <LiveOak x={15}  z={-28} scale={1.20} seed={24} />
      <LiveOak x={46}  z={-30} scale={0.95} seed={26} />
      <LiveOak x={-40} z={30}  scale={1.15} seed={21} />
      <LiveOak x={0}   z={30}  scale={1.00} seed={23} />
      <LiveOak x={38}  z={30}  scale={1.20} seed={25} />

      {/* ══ STREET LAMPS (daytime — decorative, no point lights) ═══════ */}
      {[-56, -42, -28, -14, 0, 14, 28, 42, 56].map((x, i) => (
        <StreetLamp key={i} x={x} z={i % 2 === 0 ? -9.0 : 9.0} side={i % 2 === 0 ? 1 : -1}
          withLight={false} />
      ))}

      {/* ══ LANDMARK GLOW LIGHTS (minimal — 3 total) ════════════════════ */}
      {/* Corner bar neon */}
      <pointLight position={[-64, 3, -22]} color="#ff4422" intensity={12} distance={12} decay={2} />
      <pointLight position={[64,  3,  28]} color="#ff4422" intensity={12} distance={12} decay={2} />
      {/* NBA HQ gold flood */}
      <pointLight position={[0, 5, -29]} color="#ffaa33" intensity={18} distance={16} decay={2} />

      {/* ══ UTILITY POLES & POWER LINES ════════════════════════════════ */}
      {[-54, -36, -18, 0, 18, 36, 54].map((x, i) => (
        <UtilityPole key={i} x={x} z={i % 2 === 0 ? -13.5 : 13.5} />
      ))}
      {/* Cables strung between poles */}
      {[[-54, -13.5, -36, -13.5], [-36, -13.5, -18, -13.5], [-18, -13.5, 0, -13.5],
        [0, -13.5, 18, -13.5], [18, -13.5, 36, -13.5], [36, -13.5, 54, -13.5]].map(([x1,z1,x2,z2], i) => (
        <CableLine key={i} x1={x1} z1={z1} x2={x2} z2={z2} height={8.5} />
      ))}
      {[[-54, 13.5, -36, 13.5], [-36, 13.5, -18, 13.5], [-18, 13.5, 0, 13.5],
        [0, 13.5, 18, 13.5], [18, 13.5, 36, 13.5], [36, 13.5, 54, 13.5]].map(([x1,z1,x2,z2], i) => (
        <CableLine key={i + 10} x1={x1} z1={z1} x2={x2} z2={z2} height={8.5} />
      ))}

      {/* ══ PARKED CARS ════════════════════════════════════════════════ */}
      <ParkedCar x={-38} z={-7.0} rot={0}         bodyColor="#1a2038" />
      <ParkedCar x={-24} z={-7.0} rot={0}         bodyColor="#2a1a14" />
      <ParkedCar x={-10} z={-7.0} rot={0}         bodyColor="#1a1a22" />
      <ParkedCar x={18}  z={-7.0} rot={0}         bodyColor="#2c2010" />
      <ParkedCar x={34}  z={-7.0} rot={0}         bodyColor="#141428" />
      <ParkedCar x={-46} z={7.0}  rot={Math.PI}   bodyColor="#1e2a1a" />
      <ParkedCar x={-30} z={7.0}  rot={Math.PI}   bodyColor="#2a1e10" />
      <ParkedCar x={2}   z={7.0}  rot={Math.PI}   bodyColor="#1a1834" />
      <ParkedCar x={16}  z={7.0}  rot={Math.PI}   bodyColor="#281818" />
      <ParkedCar x={44}  z={7.0}  rot={Math.PI}   bodyColor="#101018" />

      {/* ══ WOOD FENCES & MAILBOXES ══════════════════════════════════════ */}
      <WoodFence x1={-26} z1={-14} x2={-14} z2={-14} />
      <WoodFence x1={10}  z1={-14} x2={22}  z2={-14} />
      <WoodFence x1={38}  z1={14}  x2={50}  z2={14}  />
      <WoodFence x1={-50} z1={14}  x2={-38} z2={14}  />

      {[-42, -30, -14, 4, 22, 38].map((x, i) => (
        <Mailbox key={i} x={x} z={i % 2 === 0 ? -11.5 : 11.5} />
      ))}

      <Dumpster x={-62} z={20} />
      <Dumpster x={60}  z={-20} />
      <Dumpster x={0}   z={24} />

      {/* ══ STREET SIGNS ════════════════════════════════════════════════ */}
      {/* Main sign — 3800 Chippewa St */}
      <group position={[0, 4.0, -9.2]}>
        <mesh position={[0, -2.0, 0]}>
          <cylinderGeometry args={[0.035, 0.035, 4.0, 7]} />
          <meshStandardMaterial color="#222" metalness={0.8} />
        </mesh>
        <Box pos={[0, 0, 0]} size={[1.95, 0.38, 0.045]} color="#2e4e2e" metalness={0.15} roughness={0.45} />
        <Text position={[0, 0, 0.035]} fontSize={0.155} color="#f0f0e8"
          anchorX="center" anchorY="middle" outlineWidth={0.012} outlineColor="#000">
          3800 CHIPPEWA ST
        </Text>
      </group>

      {/* Cross-street sign */}
      <group position={[-64, 4.0, 0]} rotation={[0, Math.PI / 2, 0]}>
        <mesh position={[0, -2.0, 0]}>
          <cylinderGeometry args={[0.035, 0.035, 4.0, 7]} />
          <meshStandardMaterial color="#222" metalness={0.8} />
        </mesh>
        <Box pos={[0, 0, 0]} size={[1.65, 0.38, 0.045]} color="#2e4e2e" metalness={0.15} roughness={0.45} />
        <Text position={[0, 0, 0.035]} fontSize={0.155} color="#f0f0e8"
          anchorX="center" anchorY="middle" outlineWidth={0.012} outlineColor="#000">
          S ACADIAN THWY
        </Text>
      </group>

      {/* Stop sign */}
      <group position={[-64, 2.8, -9.5]}>
        <mesh position={[0, -1.5, 0]}>
          <cylinderGeometry args={[0.03, 0.03, 3.0, 6]} />
          <meshStandardMaterial color="#222" metalness={0.7} />
        </mesh>
        <mesh rotation={[0, Math.PI / 8, 0]}>
          <cylinderGeometry args={[0.34, 0.34, 0.04, 8]} />
          <meshStandardMaterial color="#cc1a1a" roughness={0.6} />
        </mesh>
        <Text position={[0, 0, 0.04]} fontSize={0.13} color="#ffffff"
          anchorX="center" anchorY="middle" outlineWidth={0.01} outlineColor="#cc0000">
          STOP
        </Text>
      </group>

      {/* ══ N 38TH STREET intersection sign ════════════════════════════ */}
      <group position={[0, 4.0, 9.2]} rotation={[0, Math.PI / 2, 0]}>
        <mesh position={[0, -2.0, 0]}>
          <cylinderGeometry args={[0.035, 0.035, 4.0, 7]} />
          <meshStandardMaterial color="#222" metalness={0.8} />
        </mesh>
        <Box pos={[0, 0.40, 0]} size={[1.50, 0.38, 0.045]} color="#2e4e2e" metalness={0.15} roughness={0.45} />
        <Text position={[0, 0.40, 0.035]} fontSize={0.155} color="#f0f0e8"
          anchorX="center" anchorY="middle" outlineWidth={0.012} outlineColor="#000">
          N 38TH ST
        </Text>
        <Box pos={[0, 0.0, 0]} size={[1.50, 0.38, 0.045]} color="#2e4e2e" metalness={0.15} roughness={0.45} />
        <Text position={[0, 0.0, 0.035]} fontSize={0.155} color="#f0f0e8"
          anchorX="center" anchorY="middle" outlineWidth={0.012} outlineColor="#000">
          CHIPPEWA ST
        </Text>
      </group>

      {/* ══ NEVER BROKE AGAIN — MAIN LANDMARK BUILDING ══════════════════
          The iconic NBA building on the 3800 block.
          Large warehouse-style with massive neon signage.
          ════════════════════════════════════════════════════════════════ */}
      <group position={[0, 0, -35]}>
        {/* Main warehouse / HQ building */}
        <Box pos={[0, 4.5, 0]}   size={[18, 9, 8]}  color="#181410" roughness={0.97} receiveShadow />
        {/* Concrete parapet */}
        <Box pos={[0, 9.18, 0]}  size={[18.4, 0.6, 8.4]} color="#141210" roughness={0.97} />
        {/* Darker cornice trim */}
        <Box pos={[0, 8.85, 0]}  size={[18.4, 0.12, 8.5]} color="#0a0806" roughness={0.97} />

        {/* ── OUTER BILLBOARD FRAME ── */}
        {/* The iconic sign mounted on the roof */}
        <Box pos={[0, 12.5, 0]} size={[17, 0.18, 0.28]} color="#111" roughness={0.95} />
        <Box pos={[0, 7.8,  0]} size={[17, 0.18, 0.28]} color="#111" roughness={0.95} />
        <Box pos={[-8.4, 10.15, 0]} size={[0.28, 4.9, 0.28]} color="#111" roughness={0.95} />
        <Box pos={[ 8.4, 10.15, 0]} size={[0.28, 4.9, 0.28]} color="#111" roughness={0.95} />
        {/* Sign backing */}
        <Box pos={[0, 10.15, -0.1]} size={[16.6, 4.6, 0.12]} color="#0a0a0a" roughness={0.95} />

        {/* ── NEVER BROKE AGAIN — glowing neon letters ── */}
        <group position={[0, 10.9, 0.08]}>
          <Text fontSize={1.05} color="#ffd700"
            anchorX="center" anchorY="middle"
            outlineWidth={0.04} outlineColor="#000">
            NEVER BROKE AGAIN
          </Text>
          {/* Neon glow */}
          <pointLight color="#ffd700" intensity={9.0} distance={35} decay={1.5} position={[0, 0, 1.5]} />
        </group>
        {/* ── NBA sub-line ── */}
        <group position={[0, 9.35, 0.08]}>
          <Text fontSize={0.50} color="#ffd700"
            anchorX="center" anchorY="middle"
            outlineWidth={0.025} outlineColor="#000">
            3800 CHIPPEWA  •  BATON ROUGE  •  NORTH SIDE
          </Text>
        </group>

        {/* Building facade detail */}
        {/* Tall shuttered roll-up doors */}
        <Box pos={[-4.5, 2.4, 4.01]} size={[3.8, 4.2, 0.07]} color="#1a1a1a" roughness={0.9} />
        <Box pos={[ 4.5, 2.4, 4.01]} size={[3.8, 4.2, 0.07]} color="#1a1a1a" roughness={0.9} />
        {/* Roll-door horizontal slats */}
        {Array.from({ length: 7 }, (_, i) => (
          <Box key={i} pos={[-4.5, 0.6 + i * 0.58, 4.02]} size={[3.78, 0.04, 0.015]} color="#333" roughness={0.95} />
        ))}
        {Array.from({ length: 7 }, (_, i) => (
          <Box key={i + 7} pos={[4.5, 0.6 + i * 0.58, 4.02]} size={[3.78, 0.04, 0.015]} color="#333" roughness={0.95} />
        ))}
        {/* Entry door — center */}
        <Box pos={[0, 1.4, 4.01]} size={[1.4, 2.6, 0.07]} color="#111" roughness={0.9} />
        <Box pos={[0, 2.72, 4.01]} size={[1.4, 0.08, 0.07]} color="#222" roughness={0.9} />

        {/* Gold NBA chain-link logo panel */}
        <group position={[0, 5.5, 4.02]}>
          <Box pos={[0, 0, 0]} size={[3.5, 2.0, 0.06]} color="#0a0808" roughness={0.9} />
          <Text position={[0, 0, 0.05]} fontSize={0.75} color="#ffd700"
            anchorX="center" anchorY="middle"
            outlineWidth={0.04} outlineColor="#000">
            NBA
          </Text>
        </group>

        {/* Ground flood — single wide light for building face */}
        <pointLight color="#ffaa33" intensity={5.5} distance={22} decay={1.6} position={[0, 1.5, 6]} />
      </group>

      {/* ══ NBA CORNER STORE — liquor & snacks, barred windows ══════════ */}
      <group position={[-16, 0, -35]}>
        {/* Building */}
        <Box pos={[0, 2.8, 0]} size={[8, 5.6, 7]} color="#2a2218" roughness={0.97} receiveShadow />
        <Box pos={[0, 5.68, 0]} size={[8.2, 0.45, 7.2]} color="#1e1a10" roughness={0.97} />
        {/* Painted CMU blocks */}
        {Array.from({ length: 6 }, (_, i) => (
          <Box key={i} pos={[0, 0.5 + i * 0.82, 3.51]} size={[8.02, 0.035, 0.012]} color="#1e1c14" roughness={0.99} />
        ))}

        {/* Neon "OPEN" sign */}
        <group position={[-1.5, 3.6, 3.52]}>
          <Box pos={[0, 0, 0]} size={[1.4, 0.38, 0.06]} color="#0a0808" roughness={0.9} />
          <Text position={[0, 0, 0.04]} fontSize={0.20} color="#ff3333"
            anchorX="center" anchorY="middle" outlineWidth={0.015} outlineColor="#000">
            OPEN
          </Text>
        </group>

        {/* Beer neon sign */}
        <group position={[1.8, 3.6, 3.52]}>
          <Box pos={[0, 0, 0]} size={[1.8, 0.38, 0.06]} color="#0a0808" roughness={0.9} />
          <Text position={[0, 0, 0.04]} fontSize={0.18} color="#3399ff"
            anchorX="center" anchorY="middle" outlineWidth={0.012} outlineColor="#000">
            COLD BEER
          </Text>
        </group>

        {/* Windows with security bars */}
        {[-2.0, 2.0].map((px, i) => (
          <group key={i} position={[px, 2.8, 3.51]}>
            <Box pos={[0, 0, 0]} size={[1.5, 1.5, 0.06]} color="#1a1a28" roughness={0.85} />
            <mesh position={[0, 0, 0.04]}>
              <planeGeometry args={[1.36, 1.36]} />
              <meshBasicMaterial color="#ffcc44" transparent opacity={0.35} />
            </mesh>
            {/* Security bars */}
            {[-0.4, 0, 0.4].map((bx, j) => (
              <Box key={j} pos={[bx, 0, 0.07]} size={[0.045, 1.5, 0.045]} color="#333" metalness={0.7} roughness={0.4} />
            ))}
          </group>
        ))}

        {/* Door */}
        <Box pos={[0, 1.4, 3.51]} size={[1.0, 2.4, 0.06]} color="#111" roughness={0.9} />
        {/* Door bars */}
        {[-0.25, 0, 0.25].map((bx, i) => (
          <Box key={i} pos={[bx, 1.4, 3.55]} size={[0.04, 2.4, 0.04]} color="#444" metalness={0.7} />
        ))}

        {/* Awning */}
        <mesh position={[0, 3.3, 4.1]} rotation={[-0.3, 0, 0]}>
          <boxGeometry args={[8.2, 0.055, 1.6]} />
          <meshStandardMaterial color="#cc1111" roughness={0.9} />
        </mesh>

      </group>

      {/* ══ NBA YOUNGBOY THEATER — cinema building ═══════════════════════ */}
      <group position={[20, 0, -42]}>
        {/* Main structure */}
        <Box pos={[0, 4.5, 0]} size={[14, 9, 10]} color="#0e0c1a" roughness={0.85} metalness={0.15} receiveShadow />
        {/* Parapet */}
        <Box pos={[0, 9.3, 0]} size={[14.4, 0.6, 10.4]} color="#0a0814" roughness={0.9} />
        {/* Art-deco vertical fins */}
        {[-5, -2.5, 0, 2.5, 5].map((fx, i) => (
          <Box key={i} pos={[fx, 5.5, 5.08]} size={[0.3, 8, 0.15]} color="#1a1430" roughness={0.7} />
        ))}
        {/* Marquee box */}
        <Box pos={[0, 3.5, 5.3]} size={[12, 1.5, 0.4]} color="#0a0818" roughness={0.8} />
        {/* "NBA YOUNGBOY THEATER" text on marquee */}
        <mesh position={[0, 3.5, 5.52]}>
          <boxGeometry args={[11.8, 1.3, 0.08]} />
          <meshStandardMaterial color="#ffaa00" emissive="#ffaa00" emissiveIntensity={1.6} />
        </mesh>
        <Text position={[0, 3.5, 5.62]} fontSize={0.36} color="#000"
          anchorX="center" anchorY="middle" outlineWidth={0}>
          NBA YOUNGBOY THEATER
        </Text>
        {/* Marquee point light */}
        <pointLight position={[0, 3.5, 6]} intensity={30} color="#ffaa00" distance={18} decay={1.8} />
        {/* Star lights along marquee */}
        {[-4.5, -2.5, 0, 2.5, 4.5].map((sx, i) => (
          <mesh key={i} position={[sx, 2.9, 5.6]}>
            <sphereGeometry args={[0.08, 6, 6]} />
            <meshBasicMaterial color="#ffff88" />
          </mesh>
        ))}
        {/* Door */}
        <Box pos={[0, 1.5, 5.08]} size={[2.5, 3.0, 0.1]} color="#111" roughness={0.9} />
        {/* Door frame */}
        <Box pos={[0, 1.5, 5.12]} size={[2.8, 3.3, 0.05]} color="#ffaa00" roughness={0.5} />
        {/* Collider */}
        <RigidBody type="fixed">
          <mesh position={[0, 4.5, 0]} visible={false}>
            <boxGeometry args={[14, 9, 10]} />
            <meshBasicMaterial />
          </mesh>
        </RigidBody>
      </group>

      {/* ══ VIRTUAL STUDIO — cyber music lab ════════════════════════════ */}
      <group position={[-5, 0, -42]}>
        {/* Main structure */}
        <Box pos={[0, 4, 0]} size={[12, 8, 9]} color="#060a10" roughness={0.7} metalness={0.4} receiveShadow />
        {/* Glowing parapet trim */}
        <mesh position={[0, 8.22, 0]}>
          <boxGeometry args={[12.4, 0.44, 9.4]} />
          <meshStandardMaterial color="#00f0d0" emissive="#00f0d0" emissiveIntensity={1.2} />
        </mesh>
        {/* Corner LED strips */}
        {[[-6.08, 4, 0], [6.08, 4, 0]].map(([cx, cy, cz], i) => (
          <mesh key={i} position={[cx, cy, cz]}>
            <boxGeometry args={[0.08, 8, 9.1]} />
            <meshStandardMaterial color="#f000b8" emissive="#f000b8" emissiveIntensity={1.5} />
          </mesh>
        ))}
        {/* Sign */}
        <mesh position={[0, 5.0, 4.56]}>
          <boxGeometry args={[9, 1.2, 0.1]} />
          <meshStandardMaterial color="#00f0d0" emissive="#00f0d0" emissiveIntensity={1.4} />
        </mesh>
        <Text position={[0, 5.0, 4.62]} fontSize={0.38} color="#000"
          anchorX="center" anchorY="middle" outlineWidth={0}>
          VIRTUAL STUDIO
        </Text>
        <pointLight position={[0, 5, 5]} intensity={25} color="#00f0d0" distance={14} decay={2} />
        {/* Door */}
        <Box pos={[0, 1.5, 4.56]} size={[2.2, 3.0, 0.08]} color="#030608" roughness={0.6} metalness={0.6} />
        <Box pos={[0, 1.5, 4.6]} size={[2.5, 3.3, 0.05]} color="#00f0d0" roughness={0.3} />
        {/* Collider */}
        <RigidBody type="fixed">
          <mesh position={[0, 4, 0]} visible={false}>
            <boxGeometry args={[12, 8, 9]} />
            <meshBasicMaterial />
          </mesh>
        </RigidBody>
      </group>

      {/* ══ GRAFFITI WALLS — NBA tags on existing buildings ════════════ */}
      {/* North wall graffiti */}
      <group position={[-33, 1.5, -15.5]}>
        <Text fontSize={0.55} color="#ffd700"
          anchorX="center" anchorY="middle"
          outlineWidth={0.03} outlineColor="#000" rotation={[0, 0, 0]}>
          NBA
        </Text>
      </group>
      <group position={[23, 1.5, -15.5]}>
        <Text fontSize={0.42} color="#ff4444"
          anchorX="center" anchorY="middle"
          outlineWidth={0.025} outlineColor="#000">
          3800
        </Text>
      </group>
      {/* South side tag */}
      <group position={[-20, 1.5, 15.5]}>
        <Text fontSize={0.44} color="#ffd700"
          anchorX="center" anchorY="middle"
          outlineWidth={0.025} outlineColor="#000">
          NORTH SIDE
        </Text>
      </group>
      <group position={[35, 1.5, 15.5]}>
        <Text fontSize={0.38} color="#4488ff"
          anchorX="center" anchorY="middle"
          outlineWidth={0.02} outlineColor="#000">
          FREE YB
        </Text>
      </group>

      {/* ══ SECOND "NEVER BROKE AGAIN" BILLBOARD — street-facing ════════ */}
      {/* Billboard on a pole, visible from down the street */}
      <group position={[0, 0, -14]}>
        {/* Two billboard poles */}
        <mesh position={[-4.5, 5.5, 0]}>
          <cylinderGeometry args={[0.10, 0.14, 11, 7]} />
          <meshStandardMaterial color="#1a1a1a" metalness={0.7} roughness={0.5} />
        </mesh>
        <mesh position={[4.5, 5.5, 0]}>
          <cylinderGeometry args={[0.10, 0.14, 11, 7]} />
          <meshStandardMaterial color="#1a1a1a" metalness={0.7} roughness={0.5} />
        </mesh>
        {/* Billboard face */}
        <Box pos={[0, 10.5, 0]} size={[10, 2.8, 0.18]} color="#0a0808" roughness={0.9} />
        <group position={[0, 11.0, 0.12]}>
          <Text fontSize={0.72} color="#ffd700"
            anchorX="center" anchorY="middle"
            outlineWidth={0.035} outlineColor="#000">
            NEVER BROKE AGAIN
          </Text>
        </group>
        <group position={[0, 9.9, 0.12]}>
          <Text fontSize={0.30} color="#ffffff"
            anchorX="center" anchorY="middle"
            outlineWidth={0.018} outlineColor="#000">
            NBA YOUNGBOY  •  BATON ROUGE, LA
          </Text>
        </group>
      </group>

      {/* House colliders are now embedded inside LuxuryMansion / GrandEstate components */}

      {/* ── Expanded outer boundary walls (covers full city district) ── */}
      {/* West wall x=-220 */}
      <RigidBody type="fixed">
        <mesh position={[-220, 2.5, 0]} visible={false}>
          <boxGeometry args={[2.0, 5, 500]} />
          <meshBasicMaterial />
        </mesh>
      </RigidBody>
      {/* East wall x=+240 */}
      <RigidBody type="fixed">
        <mesh position={[240, 2.5, 0]} visible={false}>
          <boxGeometry args={[2.0, 5, 500]} />
          <meshBasicMaterial />
        </mesh>
      </RigidBody>
      {/* North wall z=-220 */}
      <RigidBody type="fixed">
        <mesh position={[20, 2.5, -220]} visible={false}>
          <boxGeometry args={[500, 5, 2.0]} />
          <meshBasicMaterial />
        </mesh>
      </RigidBody>
      {/* South wall z=+220 */}
      <RigidBody type="fixed">
        <mesh position={[20, 2.5, 220]} visible={false}>
          <boxGeometry args={[500, 5, 2.0]} />
          <meshBasicMaterial />
        </mesh>
      </RigidBody>

      {/* ── NBA Warehouse — solid box (x=0, z=-35, 18×9×8) ── */}
      <RigidBody type="fixed">
        <mesh position={[0, 4.5, -35]} visible={false}>
          <boxGeometry args={[18, 9, 8]} />
          <meshBasicMaterial />
        </mesh>
      </RigidBody>

      {/* ── NBA Corner Store — solid box (x=-16, z=-35, 8×5.6×7) ── */}
      <RigidBody type="fixed">
        <mesh position={[-16, 2.8, -35]} visible={false}>
          <boxGeometry args={[8, 5.6, 7]} />
          <meshBasicMaterial />
        </mesh>
      </RigidBody>

      {/* ── Corner Bars ── */}
      {/* Chippewa Tavern (x=-64, z=-25, 8.5×5×7.5) */}
      <RigidBody type="fixed">
        <mesh position={[-64, 2.5, -25]} visible={false}>
          <boxGeometry args={[8.5, 5, 7.5]} />
          <meshBasicMaterial />
        </mesh>
      </RigidBody>
      {/* South Side Bar (x=64, z=25, 8.5×5×7.5) */}
      <RigidBody type="fixed">
        <mesh position={[64, 2.5, 25]} visible={false}>
          <boxGeometry args={[8.5, 5, 7.5]} />
          <meshBasicMaterial />
        </mesh>
      </RigidBody>
      {/* Closed shop (x=64, z=-22, 7.5×4.4×6.5) */}
      <RigidBody type="fixed">
        <mesh position={[64, 2.2, -22]} visible={false}>
          <boxGeometry args={[7.5, 4.4, 6.5]} />
          <meshBasicMaterial />
        </mesh>
      </RigidBody>

    </>
  );
}
