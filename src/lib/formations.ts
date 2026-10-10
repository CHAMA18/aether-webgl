import type { Formation } from "./experience-store";

const TAU = Math.PI * 2;

/**
 * Deterministic PRNG so re-generated formations stay stable across renders.
 */
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Fills `out` (length = count * 3) with positions for the given formation.
 */
export function generateFormation(
  formation: Formation,
  count: number,
  out: Float32Array,
  seed = 1337
) {
  const rand = mulberry32(seed);

  switch (formation) {
    case "galaxy": {
      // 4-arm spiral galaxy with vertical falloff
      const arms = 4;
      for (let i = 0; i < count; i++) {
        const i3 = i * 3;
        const r = Math.pow(rand(), 0.62) * 10.5 + 0.35;
        const branch = ((i % arms) / arms) * TAU;
        const spin = r * 0.42;
        const spread = Math.pow(rand(), 3) * (rand() < 0.5 ? 1 : -1);
        const scatterX = spread * r * 0.55;
        const scatterY = spread * (1.6 - r * 0.1);
        const scatterZ = spread * r * 0.55;
        const angle = branch + spin;
        out[i3] = Math.cos(angle) * r + scatterX * rand();
        out[i3 + 1] = scatterY * (rand() - 0.5) * 2.2;
        out[i3 + 2] = Math.sin(angle) * r + scatterZ * rand();
      }
      break;
    }
    case "sphere": {
      // layered fibonacci shell — a breathing corona
      const golden = Math.PI * (3 - Math.sqrt(5));
      for (let i = 0; i < count; i++) {
        const i3 = i * 3;
        const shell = 4.4 + Math.pow(rand(), 2.2) * 3.4;
        const y = 1 - (i / (count - 1)) * 2;
        const rad = Math.sqrt(1 - y * y);
        const theta = golden * i;
        const jitter = 0.35;
        out[i3] = Math.cos(theta) * rad * shell + (rand() - 0.5) * jitter;
        out[i3 + 1] = y * shell + (rand() - 0.5) * jitter;
        out[i3 + 2] = Math.sin(theta) * rad * shell + (rand() - 0.5) * jitter;
      }
      break;
    }
    case "vortex": {
      // toroidal vortex — particles flow along a bent tube
      for (let i = 0; i < count; i++) {
        const i3 = i * 3;
        const t = rand();
        const R = 5.2 + Math.sin(t * TAU * 3) * 1.15;
        const tubeR = 0.5 + Math.pow(rand(), 1.6) * 1.7;
        const a = t * TAU * 9 + rand() * 0.35;
        const b = rand() * TAU;
        out[i3] = (R + Math.cos(b) * tubeR) * Math.cos(a);
        out[i3 + 1] = Math.sin(b) * tubeR * 1.25 + Math.sin(a * 2.0) * 0.85;
        out[i3 + 2] = (R + Math.cos(b) * tubeR) * Math.sin(a);
      }
      break;
    }
    case "rings": {
      // saturn-like tilted ring system
      for (let i = 0; i < count; i++) {
        const i3 = i * 3;
        const band = Math.floor(rand() * 5);
        const bandR = 3.1 + band * 1.55 + (rand() - 0.5) * 0.55;
        const a = rand() * TAU;
        const y = (rand() - 0.5) * 0.22 * (1 + band * 0.12);
        out[i3] = Math.cos(a) * bandR;
        out[i3 + 1] = y;
        out[i3 + 2] = Math.sin(a) * bandR;
        // tilt the whole ring system by rotating around x
        const tilt = 0.42;
        const cy = Math.cos(tilt) * out[i3 + 1] - Math.sin(tilt) * out[i3 + 2];
        const cz = Math.sin(tilt) * out[i3 + 1] + Math.cos(tilt) * out[i3 + 2];
        out[i3 + 1] = cy;
        out[i3 + 2] = cz;
      }
      break;
    }
  }
}
