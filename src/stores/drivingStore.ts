/** External mutable store for car driving state — avoids React re-renders in hot loops */
export const drivingState = {
  active: false,
  carId: '' as string,
  x: 0,
  y: 0,
  z: 0,
  yaw: 0,
  speed: 0,
};

/** Parked position registry so cars can snap back when exited */
export const parkedPositions: Record<string, { x: number; y: number; z: number; yaw: number }> = {};
