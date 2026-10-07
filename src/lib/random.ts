/** Small, dependency-free deterministic randomness for stable daily choices. */

/** 32-bit FNV-1a hash of a string. */
export function hash(input: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/** Mulberry32 PRNG seeded from a string. Returns floats in [0, 1). */
export function seeded(seed: string): () => number {
  let a = hash(seed);
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Picks from weighted items with a seeded generator. */
export function weightedPick<T>(items: Array<{ item: T; weight: number }>, rand: () => number): T | undefined {
  const total = items.reduce((sum, i) => sum + Math.max(0, i.weight), 0);
  if (total <= 0) return items[0]?.item;
  let r = rand() * total;
  for (const { item, weight } of items) {
    r -= Math.max(0, weight);
    if (r <= 0) return item;
  }
  return items[items.length - 1]?.item;
}
