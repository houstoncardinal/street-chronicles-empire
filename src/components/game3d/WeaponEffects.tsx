import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { combatStore } from '@/stores/combatStore';

// ── Muzzle Flash ─────────────────────────────────────────────────────────────
function MuzzleFlash() {
  const lightRef = useRef<THREE.PointLight>(null);
  const meshRef  = useRef<THREE.Mesh>(null);
  const lastShot = useRef(-99999);

  useFrame(() => {
    const now = performance.now();
    const shot = combatStore.lastShotTime;
    const age  = now - shot;

    if (shot !== lastShot.current && age < 80) {
      // New shot detected
      lastShot.current = shot;
      if (lightRef.current) {
        lightRef.current.position.set(
          combatStore.muzzlePos.x,
          combatStore.muzzlePos.y,
          combatStore.muzzlePos.z
        );
        lightRef.current.intensity = 120;
      }
      if (meshRef.current) {
        meshRef.current.position.set(
          combatStore.muzzlePos.x,
          combatStore.muzzlePos.y,
          combatStore.muzzlePos.z
        );
        meshRef.current.visible = true;
        const s = 0.25 + Math.random() * 0.15;
        meshRef.current.scale.set(s, s, s);
      }
    }

    // Decay
    if (lightRef.current) {
      lightRef.current.intensity = Math.max(0, lightRef.current.intensity - 8);
    }
    if (meshRef.current && age > 60) {
      meshRef.current.visible = false;
    }
  });

  return (
    <>
      <pointLight ref={lightRef} intensity={0} color="#ffdd88" distance={8} />
      <mesh ref={meshRef} visible={false}>
        <sphereGeometry args={[0.18, 6, 6]} />
        <meshStandardMaterial
          color="#ffee66"
          emissive="#ffdd44"
          emissiveIntensity={4}
          transparent
          opacity={0.9}
        />
      </mesh>
    </>
  );
}

// ── Bullet Tracer ─────────────────────────────────────────────────────────────
function BulletTracer() {
  const lastShot = useRef(-99999);
  const age = useRef(0);

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute([0,0,0, 0,0,-1], 3));
    return geo;
  }, []);

  const material = useMemo(() => new THREE.LineBasicMaterial({
    color: '#ffff88',
    transparent: true,
    opacity: 0,
  }), []);

  const lineObj = useMemo(() => {
    const ln = new THREE.Line(geometry, material);
    ln.visible = false;
    return ln;
  }, [geometry, material]);

  useFrame((_, delta) => {
    const shot = combatStore.lastShotTime;

    if (shot !== lastShot.current) {
      lastShot.current = shot;
      age.current = 0;

      const mx = combatStore.muzzlePos.x;
      const my = combatStore.muzzlePos.y;
      const mz = combatStore.muzzlePos.z;
      const ix = combatStore.hasImpact ? combatStore.impactPos.x : mx;
      const iy = combatStore.hasImpact ? combatStore.impactPos.y : my;
      const iz = combatStore.hasImpact ? combatStore.impactPos.z : mz - 40;

      const arr = geometry.attributes.position.array as Float32Array;
      arr[0] = mx; arr[1] = my; arr[2] = mz;
      arr[3] = ix; arr[4] = iy; arr[5] = iz;
      geometry.attributes.position.needsUpdate = true;
      lineObj.visible = true;
      material.opacity = 0.85;
    }

    if (lineObj.visible) {
      age.current += delta;
      material.opacity = Math.max(0, 0.85 - age.current * 5);
      if (material.opacity <= 0) lineObj.visible = false;
    }
  });

  return <primitive object={lineObj} />;
}

// ── Impact Sparks ─────────────────────────────────────────────────────────────
interface Spark {
  x: number; y: number; z: number;
  vx: number; vy: number; vz: number;
  life: number; maxLife: number;
}

const MAX_SPARKS = 24;

function ImpactSparks() {
  const sparks = useRef<Spark[]>([]);
  const lastShot = useRef(-99999);

  // One instanced mesh for all sparks
  const geo = useMemo(() => new THREE.SphereGeometry(0.04, 4, 4), []);
  const mat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#ffcc44',
    emissive: '#ff8800',
    emissiveIntensity: 3,
    transparent: true,
  }), []);

  const instancedRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame((_, delta) => {
    const now = performance.now();
    const shot = combatStore.lastShotTime;

    if (shot !== lastShot.current && combatStore.hasImpact) {
      lastShot.current = shot;
      const ix = combatStore.impactPos.x;
      const iy = combatStore.impactPos.y;
      const iz = combatStore.impactPos.z;
      // Spawn sparks
      for (let i = 0; i < MAX_SPARKS; i++) {
        const angle = Math.random() * Math.PI * 2;
        const elev  = (Math.random() - 0.3) * Math.PI;
        const spd   = 3 + Math.random() * 5;
        sparks.current[i] = {
          x: ix, y: iy, z: iz,
          vx: Math.cos(angle) * Math.cos(elev) * spd,
          vy: Math.abs(Math.sin(elev)) * spd + 2,
          vz: Math.sin(angle) * Math.cos(elev) * spd,
          life: 0, maxLife: 0.2 + Math.random() * 0.25,
        };
      }
    }

    if (!instancedRef.current) return;

    let activeCount = 0;
    for (let i = 0; i < sparks.current.length; i++) {
      const s = sparks.current[i];
      if (!s || s.life >= s.maxLife) {
        // Hide this instance
        dummy.scale.set(0, 0, 0);
        dummy.updateMatrix();
        instancedRef.current.setMatrixAt(i, dummy.matrix);
        continue;
      }

      s.life += delta;
      s.vy -= 9.8 * delta;
      s.x += s.vx * delta;
      s.y += s.vy * delta;
      s.z += s.vz * delta;

      const t = 1 - s.life / s.maxLife;
      dummy.position.set(s.x, s.y, s.z);
      const scale = t * 0.9 + 0.1;
      dummy.scale.set(scale, scale, scale);
      dummy.updateMatrix();
      instancedRef.current.setMatrixAt(i, dummy.matrix);
      activeCount++;
    }

    instancedRef.current.instanceMatrix.needsUpdate = true;
    mat.opacity = 0.9;
  });

  return (
    <instancedMesh ref={instancedRef} args={[geo, mat, MAX_SPARKS]} />
  );
}

// ── Wall Decal (bullet hole) ──────────────────────────────────────────────────
function BulletHoles() {
  const holes = useRef<Array<{ x: number; y: number; z: number; rx: number; ry: number }>>([]);
  const lastShot = useRef(-99999);
  const MAX_HOLES = 20;

  // We render as simple flat circle meshes
  const geo = useMemo(() => new THREE.CircleGeometry(0.06, 6), []);
  const mat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#000', roughness: 1 }), []);
  const instancedRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame(() => {
    const shot = combatStore.lastShotTime;
    if (shot !== lastShot.current && combatStore.hasImpact) {
      lastShot.current = shot;
      if (holes.current.length >= MAX_HOLES) holes.current.shift();
      holes.current.push({
        x: combatStore.impactPos.x + (Math.random() - 0.5) * 0.05,
        y: combatStore.impactPos.y + (Math.random() - 0.5) * 0.05,
        z: combatStore.impactPos.z + (Math.random() - 0.5) * 0.05,
        rx: (Math.random() - 0.5) * 0.3,
        ry: Math.random() * Math.PI * 2,
      });
    }

    if (!instancedRef.current) return;
    for (let i = 0; i < MAX_HOLES; i++) {
      const h = holes.current[i];
      if (!h) {
        dummy.scale.set(0, 0, 0);
        dummy.updateMatrix();
        instancedRef.current.setMatrixAt(i, dummy.matrix);
        continue;
      }
      dummy.position.set(h.x, h.y, h.z);
      dummy.rotation.set(h.rx, h.ry, 0);
      dummy.scale.set(1, 1, 1);
      dummy.updateMatrix();
      instancedRef.current.setMatrixAt(i, dummy.matrix);
    }
    instancedRef.current.instanceMatrix.needsUpdate = true;
  });

  return <instancedMesh ref={instancedRef} args={[geo, mat, MAX_HOLES]} />;
}

// ── Main export ───────────────────────────────────────────────────────────────
export function WeaponEffects() {
  return (
    <>
      <MuzzleFlash />
      <BulletTracer />
      <ImpactSparks />
      <BulletHoles />
    </>
  );
}
