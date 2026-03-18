import { useRef, useMemo, useEffect } from 'react';
import { useFrame, useThree, createPortal } from '@react-three/fiber';
import * as THREE from 'three';
import { cameraStore } from '@/stores/playerStore';

// ── Materials (shared across weapon components) ────────────────────────────
const MAT_STEEL    = { color: '#0d0d0e', metalness: 0.92, roughness: 0.18 } as const;
const MAT_DARK     = { color: '#111213', metalness: 0.80, roughness: 0.30 } as const;
const MAT_POLY     = { color: '#1a1c1e', metalness: 0.20, roughness: 0.72 } as const;
const MAT_WOOD     = { color: '#4a2e10', metalness: 0.05, roughness: 0.88 } as const;
const MAT_WOOD2    = { color: '#3a2208', metalness: 0.05, roughness: 0.90 } as const;
const MAT_GOLD     = { color: '#c8960a', metalness: 0.95, roughness: 0.15 } as const;

function SM(m: typeof MAT_STEEL | typeof MAT_DARK | typeof MAT_POLY | typeof MAT_WOOD | typeof MAT_WOOD2 | typeof MAT_GOLD) {
  return <meshStandardMaterial {...m} />;
}

// ─────────────────────────────────────────────────────────────────────────────
// GLOCK-17 style pistol — recognizable semi-auto handgun
// ─────────────────────────────────────────────────────────────────────────────
function PistolModel({ gold = false }: { gold?: boolean }) {
  const slideMat = gold ? MAT_GOLD : MAT_STEEL;
  const frameMat = gold ? MAT_GOLD : MAT_POLY;
  return (
    <group>
      {/* ── Frame (lower receiver — polymer) ── */}
      <mesh position={[0, -0.004, 0.005]}>
        <boxGeometry args={[0.074, 0.102, 0.230]} />
        {SM(frameMat)}
      </mesh>
      {/* Dust cover / rail under frame */}
      <mesh position={[0, -0.054, 0.075]}>
        <boxGeometry args={[0.074, 0.020, 0.095]} />
        {SM(MAT_DARK)}
      </mesh>
      {/* Trigger guard — front bar */}
      <mesh position={[0, -0.060, 0.038]}>
        <boxGeometry args={[0.074, 0.014, 0.050]} />
        {SM(frameMat)}
      </mesh>
      {/* Trigger */}
      <mesh position={[0, -0.065, 0.028]} rotation={[0.35, 0, 0]}>
        <boxGeometry args={[0.008, 0.028, 0.007]} />
        {SM(MAT_DARK)}
      </mesh>

      {/* ── Slide (upper — steel) ── */}
      <mesh position={[0, 0.058, 0.012]}>
        <boxGeometry args={[0.068, 0.054, 0.212]} />
        {SM(slideMat)}
      </mesh>
      {/* Slide serrations (rear) */}
      {[-0.065, -0.055, -0.045, -0.035, -0.025].map((z, i) => (
        <mesh key={i} position={[0, 0.058, z]}>
          <boxGeometry args={[0.070, 0.056, 0.006]} />
          <meshStandardMaterial color={gold ? '#a07208' : '#080809'} metalness={0.9} roughness={0.2} />
        </mesh>
      ))}
      {/* Ejection port */}
      <mesh position={[0.036, 0.062, -0.002]}>
        <boxGeometry args={[0.002, 0.028, 0.055]} />
        <meshBasicMaterial color="#000000" />
      </mesh>

      {/* ── Barrel (extends past slide) ── */}
      <mesh position={[0, 0.042, 0.130]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.013, 0.014, 0.048, 10]} />
        {SM(MAT_STEEL)}
      </mesh>

      {/* ── Grip ── */}
      <mesh position={[0, -0.118, -0.064]} rotation={[-0.14, 0, 0]}>
        <boxGeometry args={[0.066, 0.108, 0.068]} />
        {SM(frameMat)}
      </mesh>
      {/* Grip checkering ridges */}
      {[0, 1, 2, 3, 4].map(i => (
        <mesh key={i} position={[0.035, -0.095 - i * 0.015, -0.065]}>
          <boxGeometry args={[0.002, 0.006, 0.062]} />
          <meshStandardMaterial color={gold ? '#986005' : '#0f1010'} roughness={0.95} />
        </mesh>
      ))}

      {/* ── Magazine base ── */}
      <mesh position={[0, -0.178, -0.060]}>
        <boxGeometry args={[0.062, 0.014, 0.063]} />
        {SM(MAT_DARK)}
      </mesh>

      {/* ── Sights ── */}
      {/* Rear sight — U-notch */}
      <mesh position={[0, 0.090, -0.080]}>
        <boxGeometry args={[0.030, 0.013, 0.006]} />
        {SM(MAT_DARK)}
      </mesh>
      {/* Front sight — fiber optic post */}
      <mesh position={[0, 0.090, 0.100]}>
        <boxGeometry args={[0.006, 0.014, 0.006]} />
        {SM(MAT_DARK)}
      </mesh>
      <mesh position={[0, 0.096, 0.100]}>
        <sphereGeometry args={[0.004, 6, 6]} />
        <meshStandardMaterial color="#ff2200" emissive="#ff2200" emissiveIntensity={1.2} />
      </mesh>
    </group>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// AK-47 — curved banana mag, wood furniture, 7.62 full-auto beast
// ─────────────────────────────────────────────────────────────────────────────
function RifleModel() {
  return (
    <group>
      {/* ── Receiver ── */}
      <mesh position={[0, 0.006, 0.020]}>
        <boxGeometry args={[0.072, 0.092, 0.380]} />
        {SM(MAT_DARK)}
      </mesh>
      {/* Receiver cover plate */}
      <mesh position={[0, 0.055, 0.025]}>
        <boxGeometry args={[0.068, 0.010, 0.340]} />
        {SM(MAT_STEEL)}
      </mesh>

      {/* ── Long barrel ── */}
      <mesh position={[0, 0.006, 0.350]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.011, 0.013, 0.380, 10]} />
        {SM(MAT_STEEL)}
      </mesh>
      {/* Front sight post */}
      <mesh position={[0, 0.068, 0.340]}>
        <boxGeometry args={[0.016, 0.042, 0.022]} />
        {SM(MAT_DARK)}
      </mesh>
      <mesh position={[0, 0.072, 0.352]}>
        <boxGeometry args={[0.005, 0.018, 0.005]} />
        {SM(MAT_STEEL)}
      </mesh>
      {/* Muzzle brake */}
      <mesh position={[0, 0.006, 0.550]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.016, 0.012, 0.048, 10]} />
        {SM(MAT_STEEL)}
      </mesh>

      {/* ── Gas tube above barrel ── */}
      <mesh position={[0, 0.052, 0.220]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.007, 0.008, 0.260, 8]} />
        {SM(MAT_DARK)}
      </mesh>

      {/* ── Wood handguard / foregrip ── */}
      <mesh position={[0, -0.005, 0.220]}>
        <boxGeometry args={[0.062, 0.055, 0.200]} />
        {SM(MAT_WOOD)}
      </mesh>
      {/* Handguard ribs */}
      {[-0.04, 0, 0.04].map((z, i) => (
        <mesh key={i} position={[0, -0.005, 0.220 + z]}>
          <boxGeometry args={[0.064, 0.057, 0.006]} />
          <meshStandardMaterial color="#3a2008" roughness={0.92} />
        </mesh>
      ))}

      {/* ── Curved banana magazine ── */}
      <mesh position={[0, -0.128, 0.060]} rotation={[-0.30, 0, 0]}>
        <boxGeometry args={[0.042, 0.138, 0.058]} />
        {SM(MAT_DARK)}
      </mesh>
      {/* Mag curve lower section */}
      <mesh position={[0, -0.205, 0.030]} rotation={[-0.10, 0, 0]}>
        <boxGeometry args={[0.040, 0.040, 0.055]} />
        {SM(MAT_DARK)}
      </mesh>

      {/* ── Pistol grip ── */}
      <mesh position={[0, -0.118, -0.080]} rotation={[-0.22, 0, 0]}>
        <boxGeometry args={[0.044, 0.100, 0.050]} />
        {SM(MAT_POLY)}
      </mesh>
      {/* Grip ridges */}
      {[0, 1, 2].map(i => (
        <mesh key={i} position={[0.024, -0.108 - i * 0.020, -0.080]}>
          <boxGeometry args={[0.002, 0.010, 0.046]} />
          <meshStandardMaterial color="#0c0c0c" roughness={0.9} />
        </mesh>
      ))}

      {/* ── Wood stock ── */}
      <mesh position={[0, -0.010, -0.240]}>
        <boxGeometry args={[0.055, 0.075, 0.230]} />
        {SM(MAT_WOOD2)}
      </mesh>
      {/* Stock comb */}
      <mesh position={[0, 0.042, -0.298]} rotation={[0.10, 0, 0]}>
        <boxGeometry args={[0.050, 0.038, 0.120]} />
        {SM(MAT_WOOD2)}
      </mesh>
      {/* Butt plate */}
      <mesh position={[0, -0.010, -0.358]}>
        <boxGeometry args={[0.058, 0.078, 0.012]} />
        {SM(MAT_DARK)}
      </mesh>

      {/* ── Charging handle ── */}
      <mesh position={[0.044, 0.020, 0.035]}>
        <boxGeometry args={[0.022, 0.013, 0.020]} />
        {SM(MAT_STEEL)}
      </mesh>

      {/* ── Selector lever ── */}
      <mesh position={[0.038, -0.015, -0.050]} rotation={[0, 0, 0.3]}>
        <boxGeometry args={[0.003, 0.028, 0.008]} />
        {SM(MAT_STEEL)}
      </mesh>
    </group>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Mossberg 500 pump-action shotgun
// ─────────────────────────────────────────────────────────────────────────────
function ShotgunModel() {
  return (
    <group>
      {/* ── Wood stock ── */}
      <mesh position={[0, 0.005, -0.285]} rotation={[0.06, 0, 0]}>
        <boxGeometry args={[0.068, 0.090, 0.290]} />
        {SM(MAT_WOOD)}
      </mesh>
      {/* Stock comb */}
      <mesh position={[0, 0.058, -0.355]} rotation={[0.12, 0, 0]}>
        <boxGeometry args={[0.062, 0.040, 0.130]} />
        {SM(MAT_WOOD)}
      </mesh>
      {/* Recoil pad */}
      <mesh position={[0, 0.005, -0.432]}>
        <boxGeometry args={[0.070, 0.093, 0.016]} />
        <meshStandardMaterial color="#111" roughness={0.98} />
      </mesh>

      {/* ── Receiver ── */}
      <mesh position={[0, 0.012, 0.018]}>
        <boxGeometry args={[0.085, 0.098, 0.270]} />
        {SM(MAT_DARK)}
      </mesh>
      {/* Ejection port */}
      <mesh position={[0.044, 0.020, 0.010]}>
        <boxGeometry args={[0.002, 0.038, 0.075]} />
        <meshBasicMaterial color="#000000" />
      </mesh>

      {/* ── Main barrel (round) ── */}
      <mesh position={[0, 0.030, 0.290]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.019, 0.020, 0.390, 12]} />
        {SM(MAT_STEEL)}
      </mesh>
      {/* Magazine tube (under barrel) */}
      <mesh position={[0, -0.022, 0.230]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.013, 0.014, 0.270, 8]} />
        {SM(MAT_STEEL)}
      </mesh>
      {/* Barrel bead sight */}
      <mesh position={[0, 0.052, 0.480]}>
        <sphereGeometry args={[0.006, 6, 6]} />
        {SM(MAT_GOLD)}
      </mesh>

      {/* ── Pump foregrip (wood) ── */}
      <mesh position={[0, -0.010, 0.150]}>
        <boxGeometry args={[0.072, 0.065, 0.130]} />
        {SM(MAT_WOOD2)}
      </mesh>
      {/* Pump ridges */}
      {[-0.042, -0.014, 0.014, 0.042].map((z, i) => (
        <mesh key={i} position={[0, -0.010, 0.150 + z]}>
          <boxGeometry args={[0.074, 0.067, 0.006]} />
          <meshStandardMaterial color="#2a1505" roughness={0.94} />
        </mesh>
      ))}

      {/* ── Trigger guard ── */}
      <mesh position={[0, -0.056, -0.062]}>
        <boxGeometry args={[0.082, 0.015, 0.085]} />
        {SM(MAT_DARK)}
      </mesh>
      {/* Trigger */}
      <mesh position={[0, -0.064, -0.048]} rotation={[0.25, 0, 0]}>
        <boxGeometry args={[0.008, 0.030, 0.007]} />
        {SM(MAT_STEEL)}
      </mesh>
    </group>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MP5-style SMG — compact, tactical, iconic
// ─────────────────────────────────────────────────────────────────────────────
function SMGModel() {
  return (
    <group>
      {/* ── Receiver ── */}
      <mesh position={[0, 0.012, 0.008]}>
        <boxGeometry args={[0.068, 0.095, 0.295]} />
        {SM(MAT_DARK)}
      </mesh>
      {/* Receiver top rail */}
      <mesh position={[0, 0.063, 0.008]}>
        <boxGeometry args={[0.060, 0.009, 0.250]} />
        {SM(MAT_STEEL)}
      </mesh>

      {/* ── Barrel ── */}
      <mesh position={[0, 0.012, 0.240]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.011, 0.013, 0.180, 10]} />
        {SM(MAT_STEEL)}
      </mesh>
      {/* Flash hider — slotted */}
      <mesh position={[0, 0.012, 0.336]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.014, 0.011, 0.040, 10]} />
        {SM(MAT_STEEL)}
      </mesh>
      {/* Flash hider slots */}
      {[-0.01, 0.01].map((x, i) => (
        <mesh key={i} position={[x, 0.012, 0.337]}>
          <boxGeometry args={[0.006, 0.030, 0.042]} />
          <meshBasicMaterial color="#000" />
        </mesh>
      ))}

      {/* ── Handguard (polymer) ── */}
      <mesh position={[0, 0.006, 0.150]}>
        <boxGeometry args={[0.062, 0.068, 0.110]} />
        {SM(MAT_POLY)}
      </mesh>
      {/* Handguard vent slots */}
      {[-0.025, 0, 0.025].map((z, i) => (
        <mesh key={i} position={[0.033, 0.006, 0.150 + z]}>
          <boxGeometry args={[0.002, 0.025, 0.014]} />
          <meshBasicMaterial color="#000" />
        </mesh>
      ))}

      {/* ── Pistol grip ── */}
      <mesh position={[0, -0.100, -0.042]} rotation={[-0.18, 0, 0]}>
        <boxGeometry args={[0.042, 0.097, 0.042]} />
        {SM(MAT_POLY)}
      </mesh>

      {/* ── Magazine (in front of trigger guard) ── */}
      <mesh position={[0, -0.092, 0.055]} rotation={[-0.04, 0, 0]}>
        <boxGeometry args={[0.030, 0.115, 0.040]} />
        {SM(MAT_DARK)}
      </mesh>
      {/* Mag release button */}
      <mesh position={[0.016, -0.072, 0.038]}>
        <boxGeometry args={[0.006, 0.010, 0.010]} />
        {SM(MAT_STEEL)}
      </mesh>

      {/* ── Folding / retractable stock ── */}
      <mesh position={[0, 0.012, -0.180]}>
        <boxGeometry args={[0.025, 0.022, 0.160]} />
        {SM(MAT_DARK)}
      </mesh>
      {/* Stock cheekpiece */}
      <mesh position={[0, 0.032, -0.255]}>
        <boxGeometry args={[0.022, 0.018, 0.020]} />
        {SM(MAT_DARK)}
      </mesh>

      {/* ── Cocking handle ── */}
      <mesh position={[0.038, 0.040, -0.058]}>
        <boxGeometry args={[0.018, 0.012, 0.018]} />
        {SM(MAT_STEEL)}
      </mesh>

      {/* ── Iron sights ── */}
      <mesh position={[0, 0.072, 0.108]}>
        <boxGeometry args={[0.005, 0.012, 0.005]} />
        {SM(MAT_STEEL)}
      </mesh>
      <mesh position={[0, 0.072, -0.068]}>
        <boxGeometry args={[0.026, 0.012, 0.006]} />
        {SM(MAT_STEEL)}
      </mesh>
    </group>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Barrett M82 / Remington 700 hybrid sniper — long-range precision
// ─────────────────────────────────────────────────────────────────────────────
function SniperModel() {
  return (
    <group>
      {/* ── Chassis / stock body ── */}
      <mesh position={[0, -0.020, -0.240]}>
        <boxGeometry args={[0.068, 0.095, 0.295]} />
        {SM(MAT_DARK)}
      </mesh>
      {/* Adjustable cheekpiece */}
      <mesh position={[0, 0.052, -0.310]} rotation={[0.08, 0, 0]}>
        <boxGeometry args={[0.062, 0.030, 0.110]} />
        {SM(MAT_POLY)}
      </mesh>
      {/* Butt plate */}
      <mesh position={[0, -0.020, -0.390]}>
        <boxGeometry args={[0.070, 0.098, 0.014]} />
        {SM(MAT_DARK)}
      </mesh>

      {/* ── Receiver ── */}
      <mesh position={[0, 0.018, 0.040]}>
        <boxGeometry args={[0.062, 0.075, 0.280]} />
        {SM(MAT_STEEL)}
      </mesh>

      {/* ── Barrel (free-floating, long) ── */}
      <mesh position={[0, 0.018, 0.360]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.010, 0.013, 0.470, 12]} />
        {SM(MAT_STEEL)}
      </mesh>
      {/* Muzzle brake */}
      <mesh position={[0, 0.018, 0.600]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.016, 0.010, 0.045, 10]} />
        {SM(MAT_STEEL)}
      </mesh>
      {/* Muzzle brake ports */}
      {[-0.008, 0.008].map((y, i) => (
        <mesh key={i} position={[0, 0.018 + y, 0.601]}>
          <boxGeometry args={[0.033, 0.006, 0.047]} />
          <meshBasicMaterial color="#000" />
        </mesh>
      ))}

      {/* ── Scope (large variable power) ── */}
      <mesh position={[0, 0.100, 0.042]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.024, 0.024, 0.300, 16]} />
        <meshStandardMaterial color="#080808" metalness={0.92} roughness={0.10} />
      </mesh>
      {/* Objective bell (front, wider) */}
      <mesh position={[0, 0.100, 0.196]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.030, 0.024, 0.040, 16]} />
        <meshStandardMaterial color="#080808" metalness={0.92} roughness={0.10} />
      </mesh>
      {/* Ocular bell (rear, wider) */}
      <mesh position={[0, 0.100, -0.142]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.028, 0.024, 0.036, 16]} />
        <meshStandardMaterial color="#080808" metalness={0.92} roughness={0.10} />
      </mesh>
      {/* Elevation turret */}
      <mesh position={[0, 0.130, 0.030]}>
        <cylinderGeometry args={[0.008, 0.008, 0.022, 8]} />
        {SM(MAT_STEEL)}
      </mesh>
      {/* Windage turret */}
      <mesh position={[0.034, 0.100, 0.030]}>
        <cylinderGeometry args={[0.007, 0.007, 0.020, 8]} />
        {SM(MAT_STEEL)}
      </mesh>
      {/* Scope rings */}
      {[-0.08, 0.12].map((z, i) => (
        <mesh key={i} position={[0, 0.078, z]}>
          <boxGeometry args={[0.075, 0.016, 0.028]} />
          {SM(MAT_STEEL)}
        </mesh>
      ))}

      {/* ── Bolt handle ── */}
      <mesh position={[0.040, 0.030, 0.012]} rotation={[0, 0, -0.45]}>
        <cylinderGeometry args={[0.004, 0.006, 0.062, 6]} />
        {SM(MAT_STEEL)}
      </mesh>
      <mesh position={[0.068, 0.008, 0.012]}>
        <sphereGeometry args={[0.012, 8, 8]} />
        {SM(MAT_STEEL)}
      </mesh>

      {/* ── Pistol grip ── */}
      <mesh position={[0, -0.096, -0.075]} rotation={[-0.18, 0, 0]}>
        <boxGeometry args={[0.040, 0.088, 0.042]} />
        {SM(MAT_POLY)}
      </mesh>

      {/* ── Bipod ── */}
      {[-0.024, 0.024].map((x, i) => (
        <group key={i}>
          <mesh position={[x, -0.058, 0.260]} rotation={[0.20, 0, 0]}>
            <cylinderGeometry args={[0.004, 0.004, 0.085, 6]} />
            {SM(MAT_DARK)}
          </mesh>
          <mesh position={[x, -0.130, 0.278]}>
            <boxGeometry args={[0.006, 0.012, 0.020]} />
            {SM(MAT_STEEL)}
          </mesh>
        </group>
      ))}
    </group>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAC-10 / Draco — stubby street SMG / pistol hybrid
// ─────────────────────────────────────────────────────────────────────────────
function MacModel() {
  return (
    <group>
      {/* Body block */}
      <mesh position={[0, 0.005, 0.010]}>
        <boxGeometry args={[0.065, 0.110, 0.260]} />
        {SM(MAT_DARK)}
      </mesh>
      {/* Barrel */}
      <mesh position={[0, 0.005, 0.195]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.012, 0.015, 0.145, 8]} />
        {SM(MAT_STEEL)}
      </mesh>
      {/* Suppressor thread */}
      <mesh position={[0, 0.005, 0.275]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.018, 0.015, 0.030, 10]} />
        {SM(MAT_STEEL)}
      </mesh>
      {/* Stick magazine (below grip) */}
      <mesh position={[0, -0.125, 0.002]}>
        <boxGeometry args={[0.030, 0.140, 0.040]} />
        {SM(MAT_DARK)}
      </mesh>
      {/* Grip wrap */}
      <mesh position={[0, -0.030, -0.040]} rotation={[-0.08, 0, 0]}>
        <boxGeometry args={[0.062, 0.088, 0.040]} />
        {SM(MAT_POLY)}
      </mesh>
      {/* Charging handle on top */}
      <mesh position={[0, 0.060, -0.040]}>
        <boxGeometry args={[0.042, 0.012, 0.022]} />
        {SM(MAT_STEEL)}
      </mesh>
    </group>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Melee weapons
// ─────────────────────────────────────────────────────────────────────────────
function MeleeModel({ type = 'bat' }: { type?: 'bat' | 'machete' | 'katana' | 'neuroblade' }) {
  if (type === 'machete') {
    return (
      <group>
        <mesh position={[0, -0.140, 0]}>
          <cylinderGeometry args={[0.014, 0.020, 0.150, 8]} />
          {SM(MAT_WOOD)}
        </mesh>
        <mesh position={[0, -0.058, 0]}>
          <boxGeometry args={[0.040, 0.014, 0.038]} />
          {SM(MAT_STEEL)}
        </mesh>
        <mesh position={[0.010, 0.060, 0.155]} rotation={[-0.28, 0, 0.05]}>
          <boxGeometry args={[0.048, 0.008, 0.420]} />
          {SM(MAT_STEEL)}
        </mesh>
      </group>
    );
  }
  if (type === 'katana') {
    return (
      <group>
        <mesh position={[0, -0.185, 0]}>
          <cylinderGeometry args={[0.011, 0.015, 0.210, 8]} />
          <meshStandardMaterial color="#1a1a1a" roughness={0.6} />
        </mesh>
        <mesh position={[0, -0.072, 0]}>
          <boxGeometry args={[0.080, 0.013, 0.018]} />
          {SM(MAT_GOLD)}
        </mesh>
        <mesh position={[0, 0.055, 0.255]} rotation={[-0.12, 0, 0]}>
          <boxGeometry args={[0.024, 0.007, 0.530]} />
          <meshStandardMaterial color="#d8e8e0" metalness={0.96} roughness={0.08} />
        </mesh>
      </group>
    );
  }
  if (type === 'neuroblade') {
    return (
      <group>
        <mesh position={[0, -0.112, 0]}>
          <boxGeometry args={[0.030, 0.148, 0.022]} />
          {SM(MAT_POLY)}
        </mesh>
        <mesh position={[0, 0.082, 0.210]} rotation={[-0.18, 0, 0]}>
          <boxGeometry args={[0.048, 0.009, 0.420]} />
          <meshStandardMaterial color="#00f0d0" emissive="#00f0d0" emissiveIntensity={2.5}
            transparent opacity={0.85} />
        </mesh>
        <mesh position={[0, 0.082, 0.210]}>
          <boxGeometry args={[0.044, 0.005, 0.416]} />
          <meshStandardMaterial color="#ffffff" emissive="#00f0d0" emissiveIntensity={1.0}
            transparent opacity={0.4} />
        </mesh>
      </group>
    );
  }
  // Baseball bat
  return (
    <group>
      <mesh position={[0, -0.148, 0]}>
        <cylinderGeometry args={[0.014, 0.022, 0.125, 8]} />
        {SM(MAT_WOOD)}
      </mesh>
      <mesh position={[0, 0.018, 0.112]} rotation={[-0.18, 0, 0]}>
        <cylinderGeometry args={[0.016, 0.048, 0.430, 10]} />
        <meshStandardMaterial color="#d4a84a" roughness={0.72} />
      </mesh>
    </group>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// RPG / Launcher
// ─────────────────────────────────────────────────────────────────────────────
function LauncherModel() {
  return (
    <group>
      {/* Main tube */}
      <mesh position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.042, 0.050, 0.520, 14]} />
        {SM(MAT_DARK)}
      </mesh>
      {/* Front muzzle cone */}
      <mesh position={[0, 0, 0.280]} rotation={[Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.052, 0.060, 12]} />
        {SM(MAT_DARK)}
      </mesh>
      {/* Rear venturi */}
      <mesh position={[0, 0, -0.296]} rotation={[Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.055, 0.055, 12]} />
        {SM(MAT_DARK)}
      </mesh>
      {/* Pistol grip */}
      <mesh position={[0, -0.062, -0.145]} rotation={[0.28, 0, 0]}>
        <boxGeometry args={[0.042, 0.085, 0.045]} />
        {SM(MAT_POLY)}
      </mesh>
      {/* Trigger guard */}
      <mesh position={[0, -0.055, -0.088]}>
        <boxGeometry args={[0.088, 0.014, 0.068]} />
        {SM(MAT_DARK)}
      </mesh>
      {/* Stock / shoulder rest */}
      <mesh position={[0, 0.022, -0.360]}>
        <boxGeometry args={[0.082, 0.100, 0.018]} />
        {SM(MAT_DARK)}
      </mesh>
      {/* Sight vane */}
      <mesh position={[0, 0.058, 0.050]}>
        <boxGeometry args={[0.005, 0.038, 0.110]} />
        {SM(MAT_STEEL)}
      </mesh>
      {/* Warhead glow */}
      <mesh position={[0, 0, 0.270]}>
        <sphereGeometry args={[0.018, 8, 8]} />
        <meshStandardMaterial color="#ff6600" emissive="#ff6600" emissiveIntensity={1.5} />
      </mesh>
    </group>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Map weapon IDs → models
// ─────────────────────────────────────────────────────────────────────────────
function getWeaponData(weaponId: string | null): { type: string; model: React.ReactNode } {
  if (!weaponId) return { type: 'none', model: null };

  const map: Record<string, { type: string; model: React.ReactNode }> = {
    'w-9mm':      { type: 'pistol',   model: <PistolModel /> },
    'w-deagle':   { type: 'pistol',   model: <PistolModel /> },
    'w-gold-45':  { type: 'pistol',   model: <PistolModel gold /> },
    'w-mac10':    { type: 'smg',      model: <MacModel /> },
    'w-smg':      { type: 'smg',      model: <SMGModel /> },
    'w-ak':       { type: 'rifle',    model: <RifleModel /> },
    'w-auto-sg':  { type: 'shotgun',  model: <ShotgunModel /> },
    'w-pump':     { type: 'shotgun',  model: <ShotgunModel /> },
    'w-sniper':   { type: 'sniper',   model: <SniperModel /> },
    'w-bat':      { type: 'melee',    model: <MeleeModel type="bat" /> },
    'w-machete':  { type: 'melee',    model: <MeleeModel type="machete" /> },
    'w-katana':   { type: 'melee',    model: <MeleeModel type="katana" /> },
    'w-neuroblade':{ type: 'melee',   model: <MeleeModel type="neuroblade" /> },
    'w-plasma':   { type: 'rifle',    model: <RifleModel /> },
    'w-railgun':  { type: 'sniper',   model: <SniperModel /> },
    'w-flamer':   { type: 'launcher', model: <LauncherModel /> },
    'w-launcher': { type: 'launcher', model: <LauncherModel /> },
  };
  return map[weaponId] || { type: 'none', model: null };
}

// ─────────────────────────────────────────────────────────────────────────────
// Per-weapon offset tuning (camera-local: +x=right, +y=up, -z=forward)
// ─────────────────────────────────────────────────────────────────────────────
const WEAPON_OFFSETS: Record<string, [number, number, number]> = {
  pistol:   [0.18, -0.22, -0.42],
  smg:      [0.18, -0.20, -0.44],
  rifle:    [0.15, -0.19, -0.46],
  shotgun:  [0.16, -0.20, -0.44],
  sniper:   [0.14, -0.20, -0.48],
  melee:    [0.18, -0.24, -0.40],
  launcher: [0.14, -0.20, -0.50],
};

// ─────────────────────────────────────────────────────────────────────────────
// First-person arms — hoodie sleeves + visible forearms/hands
// Two arms for two-handed weapons, right arm only for pistols/melee
// ─────────────────────────────────────────────────────────────────────────────
const HOODIE_COLOR  = '#111111';
const SLEEVE_CUFF   = '#1e1e1e';
const TWO_HANDED = new Set(['rifle', 'shotgun', 'smg', 'sniper', 'launcher']);

function ArmMesh({ side, skinColor }: { side: 'right' | 'left'; skinColor: string }) {
  const sx = side === 'right' ? 1 : -1;
  // Arm runs from screen-edge toward the weapon grip area
  // Group is oriented so Y-axis points along the forearm direction
  const pos: [number, number, number] = [sx * 0.30, -0.52, -0.18];
  const rot: [number, number, number] = [-0.68, sx * 0.28, sx * 0.16];
  return (
    <group position={pos} rotation={rot}>
      {/* Hoodie sleeve — visible top portion */}
      <mesh position={[0, 0.12, 0]}>
        <cylinderGeometry args={[0.050, 0.055, 0.24, 9]} />
        <meshStandardMaterial color={HOODIE_COLOR} roughness={0.82} />
      </mesh>
      {/* Sleeve end cuff ring */}
      <mesh position={[0, -0.005, 0]}>
        <cylinderGeometry args={[0.052, 0.052, 0.022, 9]} />
        <meshStandardMaterial color={SLEEVE_CUFF} roughness={0.75} />
      </mesh>
      {/* Forearm skin */}
      <mesh position={[0, -0.128, 0]}>
        <cylinderGeometry args={[0.036, 0.044, 0.20, 9]} />
        <meshStandardMaterial color={skinColor} roughness={0.70} />
      </mesh>
      {/* Wrist narrowing */}
      <mesh position={[0, -0.244, 0]}>
        <cylinderGeometry args={[0.030, 0.036, 0.058, 8]} />
        <meshStandardMaterial color={skinColor} roughness={0.68} />
      </mesh>
      {/* Hand / fist block */}
      <mesh position={[0, -0.296, 0]}>
        <boxGeometry args={[0.065, 0.072, 0.082]} />
        <meshStandardMaterial color={skinColor} roughness={0.65} />
      </mesh>
      {/* Thumb hint */}
      <mesh position={[sx * 0.038, -0.282, 0.022]} rotation={[0, 0, sx * 0.65]}>
        <cylinderGeometry args={[0.011, 0.014, 0.046, 6]} />
        <meshStandardMaterial color={skinColor} roughness={0.65} />
      </mesh>
      {/* Knuckle ridge */}
      <mesh position={[0, -0.322, 0.034]}>
        <boxGeometry args={[0.062, 0.014, 0.022]} />
        <meshStandardMaterial color={skinColor} roughness={0.60} />
      </mesh>
    </group>
  );
}

interface FirstPersonWeaponProps {
  weaponId: string | null;
  skinColor?: string;
}

export function FirstPersonWeapon({ weaponId, skinColor = '#8B5E3C' }: FirstPersonWeaponProps) {
  const weaponGroupRef = useRef<THREE.Group>(null);
  const armsGroupRef   = useRef<THREE.Group>(null);
  const { camera } = useThree();
  const weaponData = useMemo(() => getWeaponData(weaponId), [weaponId]);
  const recoilRef = useRef(0);
  const swayX = useRef(0);
  const swayY = useRef(0);

  // depthTest=false + renderOrder=100 on all FP meshes
  const applyFPRender = (grp: THREE.Group | null) => {
    if (!grp) return;
    grp.renderOrder = 100;
    grp.traverse(child => {
      if (child instanceof THREE.Mesh) {
        child.renderOrder = 100;
        const mats = Array.isArray(child.material) ? child.material : [child.material];
        mats.forEach((m: THREE.Material) => { m.depthTest = false; });
      }
    });
  };

  useEffect(() => { applyFPRender(weaponGroupRef.current); }, [weaponId]);
  useEffect(() => { applyFPRender(armsGroupRef.current); },  [skinColor]);

  useFrame((state, delta) => {
    const visible = cameraStore.mode === 'fp';

    // Arms — always visible in FP regardless of weapon
    const arms = armsGroupRef.current;
    if (arms) {
      arms.visible = visible;
      if (visible) {
        const t = state.clock.elapsedTime;
        recoilRef.current = Math.max(0, recoilRef.current - delta * 14);
        swayX.current = Math.sin(t * 1.5) * 0.0035 + Math.sin(t * 0.65) * 0.0015;
        swayY.current = Math.cos(t * 1.1) * 0.0025;
        const rc = recoilRef.current * 0.045;
        // Arms sway in sync with weapon, slightly less extreme
        arms.position.set(swayX.current * 0.7, swayY.current * 0.7 - rc, 0);
        arms.rotation.set(-rc * 0.5, swayX.current * 1.2, 0);
      }
    }

    // Weapon
    const grp = weaponGroupRef.current;
    if (!grp) return;
    grp.visible = visible && weaponData.type !== 'none';
    if (!grp.visible) return;

    const t = state.clock.elapsedTime;
    swayX.current = Math.sin(t * 1.5) * 0.0035 + Math.sin(t * 0.65) * 0.0015;
    swayY.current = Math.cos(t * 1.1) * 0.0025;
    const rc = recoilRef.current * 0.055;
    const off = WEAPON_OFFSETS[weaponData.type] ?? WEAPON_OFFSETS.pistol;
    grp.position.set(off[0] + swayX.current, off[1] + swayY.current - rc, off[2]);
    grp.rotation.set(-0.05 + recoilRef.current * 0.32, swayX.current * 2.5, 0);
  });

  const twoHanded = TWO_HANDED.has(weaponData.type);

  return createPortal(
    <>
      {/* ── Arms (always visible in FP) ── */}
      <group ref={armsGroupRef}>
        <ArmMesh side="right" skinColor={skinColor} />
        {twoHanded && <ArmMesh side="left" skinColor={skinColor} />}
      </group>
      {/* ── Weapon model ── */}
      {weaponData.type !== 'none' && weaponData.model && (
        <group ref={weaponGroupRef}>{weaponData.model}</group>
      )}
    </>,
    camera,
  );
}
