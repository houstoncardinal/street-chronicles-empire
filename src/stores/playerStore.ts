export const playerState = {
  x: 0,
  y: 0,
  z: 0,
  yaw: 0,
  teleportRequest: null as { x: number; y: number; z: number } | null,
};

// Mutable state read by HUD/overlay components each frame
export const movementState = {
  isSprinting: false,
  speed: 0,        // horizontal speed magnitude (m/s)
  bobPhase: 0,     // accumulated head-bob phase (radians)
};

// Camera perspective mode — toggled with V key
export const cameraStore = {
  mode: 'fp' as 'fp' | 'tp',
};
