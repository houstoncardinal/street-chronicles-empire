export function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

export function getTerrainHeight(x: number, z: number): number {
  return (
    Math.sin(x * 0.05) * Math.cos(z * 0.07) * 8 +
    Math.sin(x * 0.02 + 1.3) * Math.cos(z * 0.03 + 2.1) * 12 +
    Math.cos(x * 0.1 + z * 0.08) * 3
  );
}
