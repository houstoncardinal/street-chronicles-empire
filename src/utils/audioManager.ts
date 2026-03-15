// Procedural audio using Web Audio API — no external files needed
let ctx: AudioContext | null = null;

function getCtx(): AudioContext {
  if (!ctx) ctx = new AudioContext();
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

function createNoise(ac: AudioContext, duration: number): AudioBufferSourceNode {
  const frames = Math.floor(ac.sampleRate * duration);
  const buf = ac.createBuffer(1, frames, ac.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < frames; i++) data[i] = Math.random() * 2 - 1;
  const src = ac.createBufferSource();
  src.buffer = buf;
  return src;
}

type WeaponSoundType = 'pistol' | 'smg' | 'rifle' | 'shotgun' | 'sniper' | 'melee' | 'launcher';

export function playGunshot(type: WeaponSoundType = 'pistol') {
  try {
    const ac = getCtx();
    const now = ac.currentTime;

    // ── MELEE: short whoosh ─────────────────────────────────────────────────
    if (type === 'melee') {
      const osc = ac.createOscillator();
      const gain = ac.createGain();
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(200, now + 0.12);
      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
      osc.connect(gain);
      gain.connect(ac.destination);
      osc.start(now);
      osc.stop(now + 0.12);
      return;
    }

    // ── LAUNCHER: deep boom ─────────────────────────────────────────────────
    if (type === 'launcher') {
      const noise = createNoise(ac, 0.5);
      const filter = ac.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(200, now);
      const gain = ac.createGain();
      gain.gain.setValueAtTime(0.9, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ac.destination);
      noise.start(now);
      noise.stop(now + 0.5);

      const sub = ac.createOscillator();
      const subGain = ac.createGain();
      sub.frequency.setValueAtTime(60, now);
      sub.frequency.exponentialRampToValueAtTime(20, now + 0.4);
      subGain.gain.setValueAtTime(0.7, now);
      subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
      sub.connect(subGain);
      subGain.connect(ac.destination);
      sub.start(now);
      sub.stop(now + 0.4);
      return;
    }

    // ── SNIPER: long crack + echo ───────────────────────────────────────────
    if (type === 'sniper') {
      const crack = createNoise(ac, 0.06);
      const crackFilter = ac.createBiquadFilter();
      crackFilter.type = 'bandpass';
      crackFilter.frequency.value = 3000;
      crackFilter.Q.value = 0.4;
      const crackGain = ac.createGain();
      crackGain.gain.setValueAtTime(1.2, now);
      crackGain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
      crack.connect(crackFilter);
      crackFilter.connect(crackGain);
      crackGain.connect(ac.destination);
      crack.start(now);
      crack.stop(now + 0.06);

      const body = createNoise(ac, 0.35);
      const bodyFilter = ac.createBiquadFilter();
      bodyFilter.type = 'lowpass';
      bodyFilter.frequency.setValueAtTime(800, now);
      const bodyGain = ac.createGain();
      bodyGain.gain.setValueAtTime(0.5, now);
      bodyGain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      body.connect(bodyFilter);
      bodyFilter.connect(bodyGain);
      bodyGain.connect(ac.destination);
      body.start(now);
      body.stop(now + 0.35);
      return;
    }

    // ── SHOTGUN: wide spread boom ───────────────────────────────────────────
    if (type === 'shotgun') {
      const noise = createNoise(ac, 0.22);
      const filter = ac.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(2500, now);
      filter.frequency.exponentialRampToValueAtTime(400, now + 0.22);
      const gain = ac.createGain();
      gain.gain.setValueAtTime(1.0, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ac.destination);
      noise.start(now);
      noise.stop(now + 0.22);

      const sub = ac.createOscillator();
      const subGain = ac.createGain();
      sub.frequency.setValueAtTime(80, now);
      sub.frequency.exponentialRampToValueAtTime(25, now + 0.18);
      subGain.gain.setValueAtTime(0.55, now);
      subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
      sub.connect(subGain);
      subGain.connect(ac.destination);
      sub.start(now);
      sub.stop(now + 0.18);
      return;
    }

    // ── RIFLE/AK: sharp crack with mid presence ─────────────────────────────
    if (type === 'rifle') {
      const crack = createNoise(ac, 0.04);
      const crackFilter = ac.createBiquadFilter();
      crackFilter.type = 'bandpass';
      crackFilter.frequency.value = 4000;
      crackFilter.Q.value = 0.3;
      const crackGain = ac.createGain();
      crackGain.gain.setValueAtTime(1.1, now);
      crackGain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
      crack.connect(crackFilter);
      crackFilter.connect(crackGain);
      crackGain.connect(ac.destination);
      crack.start(now);
      crack.stop(now + 0.04);

      const body = createNoise(ac, 0.18);
      const bodyFilter = ac.createBiquadFilter();
      bodyFilter.type = 'lowpass';
      bodyFilter.frequency.setValueAtTime(1200, now);
      bodyFilter.frequency.exponentialRampToValueAtTime(200, now + 0.18);
      const bodyGain = ac.createGain();
      bodyGain.gain.setValueAtTime(0.65, now);
      bodyGain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
      body.connect(bodyFilter);
      bodyFilter.connect(bodyGain);
      bodyGain.connect(ac.destination);
      body.start(now);
      body.stop(now + 0.18);
      return;
    }

    // ── SMG: fast light pop ─────────────────────────────────────────────────
    if (type === 'smg') {
      const noise = createNoise(ac, 0.08);
      const filter = ac.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 2500;
      filter.Q.value = 0.5;
      const gain = ac.createGain();
      gain.gain.setValueAtTime(0.7, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ac.destination);
      noise.start(now);
      noise.stop(now + 0.08);
      return;
    }

    // ── PISTOL (default): sharp pop + mid body ──────────────────────────────
    const click = createNoise(ac, 0.025);
    const clickFilter = ac.createBiquadFilter();
    clickFilter.type = 'highpass';
    clickFilter.frequency.value = 2000;
    const clickGain = ac.createGain();
    clickGain.gain.setValueAtTime(0.9, now);
    clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.025);
    click.connect(clickFilter);
    clickFilter.connect(clickGain);
    clickGain.connect(ac.destination);
    click.start(now);
    click.stop(now + 0.025);

    const body = createNoise(ac, 0.12);
    const bodyFilter = ac.createBiquadFilter();
    bodyFilter.type = 'lowpass';
    bodyFilter.frequency.setValueAtTime(1800, now);
    bodyFilter.frequency.exponentialRampToValueAtTime(300, now + 0.12);
    const bodyGain = ac.createGain();
    bodyGain.gain.setValueAtTime(0.55, now);
    bodyGain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
    body.connect(bodyFilter);
    bodyFilter.connect(bodyGain);
    bodyGain.connect(ac.destination);
    body.start(now);
    body.stop(now + 0.12);
  } catch (_e) {
    // Audio blocked or not available — fail silently
  }
}

export function playDryFire() {
  try {
    const ac = getCtx();
    const now = ac.currentTime;
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.frequency.setValueAtTime(400, now);
    osc.frequency.exponentialRampToValueAtTime(200, now + 0.04);
    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
    osc.connect(gain);
    gain.connect(ac.destination);
    osc.start(now);
    osc.stop(now + 0.04);
  } catch (_e) { /* */ }
}

export function playHitMarker() {
  try {
    const ac = getCtx();
    const now = ac.currentTime;
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1200, now);
    osc.frequency.exponentialRampToValueAtTime(800, now + 0.06);
    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
    osc.connect(gain);
    gain.connect(ac.destination);
    osc.start(now);
    osc.stop(now + 0.06);
  } catch (_e) { /* */ }
}

export function playKillSound() {
  try {
    const ac = getCtx();
    const now = ac.currentTime;
    [0, 0.08, 0.16].forEach((offset, i) => {
      const osc = ac.createOscillator();
      const gain = ac.createGain();
      osc.type = 'sine';
      osc.frequency.value = 880 + i * 220;
      gain.gain.setValueAtTime(0.09, now + offset);
      gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.07);
      osc.connect(gain);
      gain.connect(ac.destination);
      osc.start(now + offset);
      osc.stop(now + offset + 0.07);
    });
  } catch (_e) { /* */ }
}

export function playFootstep() {
  try {
    const ac = getCtx();
    const now = ac.currentTime;
    const noise = createNoise(ac, 0.04);
    const filter = ac.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 300;
    const gain = ac.createGain();
    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ac.destination);
    noise.start(now);
    noise.stop(now + 0.04);
  } catch (_e) { /* */ }
}

// ── Spatial Audio (3D Positional Sound) ──────────────────────────────────────

/** Update AudioContext listener to match player position + yaw each frame */
export function updateAudioListener(x: number, y: number, z: number, yaw: number) {
  try {
    const ac = getCtx();
    const l = ac.listener;
    if (l.positionX) {
      l.positionX.value = x;
      l.positionY.value = y;
      l.positionZ.value = z;
      l.forwardX.value = Math.sin(yaw);
      l.forwardY.value = 0;
      l.forwardZ.value = Math.cos(yaw);
      l.upX.value = 0;
      l.upY.value = 1;
      l.upZ.value = 0;
    } else {
      // Fallback for older Safari
      l.setPosition(x, y, z);
      l.setOrientation(Math.sin(yaw), 0, Math.cos(yaw), 0, 1, 0);
    }
  } catch (_e) { /* */ }
}

/** Play a short 3D sound at world coordinates (gunshot, explosion, etc.) */
export function play3DGunshot(type: WeaponSoundType, wx: number, wy: number, wz: number) {
  try {
    const ac = getCtx();
    const panner = ac.createPanner();
    panner.panningModel = 'HRTF';
    panner.distanceModel = 'inverse';
    panner.refDistance = 1;
    panner.maxDistance = 60;
    panner.rolloffFactor = 1.2;
    if (panner.positionX) {
      panner.positionX.value = wx;
      panner.positionY.value = wy;
      panner.positionZ.value = wz;
    } else {
      panner.setPosition(wx, wy, wz);
    }
    panner.connect(ac.destination);

    // Re-use existing gun synthesis but route through panner
    const now = ac.currentTime;
    const noise = createNoise(ac, 0.12);
    const filter = ac.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = type === 'rifle' ? 3000 : type === 'shotgun' ? 1500 : 2000;
    filter.Q.value = 0.4;
    const gain = ac.createGain();
    gain.gain.setValueAtTime(0.6, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(panner);
    noise.start(now);
    noise.stop(now + 0.12);
  } catch (_e) { /* */ }
}

// ── Ambient audio loops ───────────────────────────────────────────────────────
let rainNode: AudioBufferSourceNode | null = null;
let rainGain: GainNode | null = null;
let footstepInterval: ReturnType<typeof setInterval> | null = null;
let engineOsc: OscillatorNode | null = null;
let engineGain: GainNode | null = null;

export function startRainAmbient() {
  if (rainNode) return; // already playing
  try {
    const ac = getCtx();
    // Create 4 seconds of looping rain noise
    const frames = ac.sampleRate * 4;
    const buf = ac.createBuffer(2, frames, ac.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
      const d = buf.getChannelData(ch);
      for (let i = 0; i < frames; i++) d[i] = (Math.random() * 2 - 1) * 0.15;
    }
    const src = ac.createBufferSource();
    src.buffer = buf;
    src.loop = true;
    const filter = ac.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 2000;
    const filter2 = ac.createBiquadFilter();
    filter2.type = 'lowpass';
    filter2.frequency.value = 8000;
    rainGain = ac.createGain();
    rainGain.gain.value = 0.08;
    src.connect(filter);
    filter.connect(filter2);
    filter2.connect(rainGain);
    rainGain.connect(ac.destination);
    src.start();
    rainNode = src;
  } catch (_e) { /* */ }
}

export function stopRainAmbient() {
  try { rainNode?.stop(); } catch (_e) { /* */ }
  rainNode = null;
  rainGain = null;
}

export function startFootsteps(sprint: boolean) {
  if (footstepInterval) return;
  const interval = sprint ? 280 : 480;
  footstepInterval = setInterval(() => playFootstep(), interval);
}

export function stopFootsteps() {
  if (footstepInterval) clearInterval(footstepInterval);
  footstepInterval = null;
}

export function startEngineSound(speed: number) {
  try {
    const ac = getCtx();
    if (!engineOsc) {
      engineOsc = ac.createOscillator();
      engineOsc.type = 'sawtooth';
      engineGain = ac.createGain();
      const filter = ac.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 400;
      engineOsc.connect(filter);
      filter.connect(engineGain);
      engineGain.connect(ac.destination);
      engineGain.gain.value = 0;
      engineOsc.start();
    }
    const freq = 40 + Math.abs(speed) * 3;
    engineOsc.frequency.setTargetAtTime(freq, ac.currentTime, 0.1);
    if (engineGain) engineGain.gain.setTargetAtTime(Math.min(0.08, Math.abs(speed) * 0.003), ac.currentTime, 0.1);
  } catch (_e) { /* */ }
}

export function stopEngineSound() {
  try { engineGain?.gain.setTargetAtTime(0, getCtx().currentTime, 0.3); } catch (_e) { /* */ }
  setTimeout(() => {
    try { engineOsc?.stop(); } catch (_e) { /* */ }
    engineOsc = null;
    engineGain = null;
  }, 500);
}

/** Map weapon ID → sound type */
export function weaponSoundType(weaponId: string | null): WeaponSoundType {
  if (!weaponId) return 'pistol';
  if (weaponId.includes('ak') || weaponId.includes('plasma') || weaponId.includes('railgun')) return 'rifle';
  if (weaponId.includes('smg') || weaponId.includes('mac')) return 'smg';
  if (weaponId.includes('sniper')) return 'sniper';
  if (weaponId.includes('pump') || weaponId.includes('auto-sg')) return 'shotgun';
  if (weaponId.includes('launcher') || weaponId.includes('flamer')) return 'launcher';
  if (weaponId.includes('bat') || weaponId.includes('machete') || weaponId.includes('katana') || weaponId.includes('neuroblade')) return 'melee';
  return 'pistol';
}
