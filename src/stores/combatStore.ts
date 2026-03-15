// combatStore.ts — zero-React-overhead combat feedback state
// Written by Player.tsx on shoot/hit; read by GameHUD rAF loops

export const combatStore = {
  hitTime:    -99999,  // performance.now() of last confirmed enemy hit
  killTime:   -99999,  // performance.now() of last confirmed kill
  damageTime: -99999,  // performance.now() of last damage taken by player
  spread:     0,       // crosshair spread 0-1, decays per rAF frame
  killFeed: [] as Array<{ id: number; time: number; text: string }>,

  // Weapon effects data
  lastShotTime: -99999,  // performance.now() of last shot fired
  muzzlePos: { x: 0, y: 0, z: 0 },        // world position of gun muzzle on last shot
  impactPos: { x: 0, y: 0, z: 0 },         // world position of last bullet impact
  hasImpact: false,                          // true if last shot hit something
};

let _feedId = 0;

export function registerHit() {
  combatStore.hitTime = performance.now();
}

export function registerShot(muzzleX: number, muzzleY: number, muzzleZ: number, impactX: number, impactY: number, impactZ: number, hasImpact: boolean) {
  combatStore.lastShotTime = performance.now();
  combatStore.muzzlePos.x = muzzleX; combatStore.muzzlePos.y = muzzleY; combatStore.muzzlePos.z = muzzleZ;
  combatStore.impactPos.x = impactX; combatStore.impactPos.y = impactY; combatStore.impactPos.z = impactZ;
  combatStore.hasImpact = hasImpact;
}

export function registerKill(label = 'ENEMY DOWN') {
  combatStore.killTime = performance.now();
  combatStore.killFeed.push({ id: ++_feedId, time: performance.now(), text: label });
  if (combatStore.killFeed.length > 5) combatStore.killFeed.shift();
}

export function registerDamage() {
  combatStore.damageTime = performance.now();
}

export function addSpread(amount: number) {
  combatStore.spread = Math.min(1, combatStore.spread + amount);
}
