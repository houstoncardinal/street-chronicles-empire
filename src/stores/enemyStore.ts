import * as THREE from 'three';

export interface EnemyRecord {
  id: string;
  x: number;
  y: number;
  z: number;
  health: number;
  maxHealth: number;
  alive: boolean;
  alertLevel: number; // 0=patrol, 1=suspicious, 2=combat
}

// Live enemy state — mutated directly for zero-React-overhead
export const enemyStore: Map<string, EnemyRecord> = new Map();

// All meshes that belong to an enemy (mesh.userData.enemyId = id)
// Used by Player.tsx raycast to detect hits
export const enemyMeshes: Set<THREE.Object3D> = new Set();

export function spawnEnemy(id: string, x: number, y: number, z: number): EnemyRecord {
  const record: EnemyRecord = { id, x, y, z, health: 100, maxHealth: 100, alive: true, alertLevel: 0 };
  enemyStore.set(id, record);
  return record;
}

/** Returns true if the hit killed the enemy */
export function hitEnemy(id: string, damage: number): boolean {
  const e = enemyStore.get(id);
  if (!e || !e.alive) return false;
  e.health -= damage;
  if (e.health <= 0) {
    e.health = 0;
    e.alive = false;
    return true;
  }
  return false;
}

export function removeEnemy(id: string) {
  enemyStore.delete(id);
}
