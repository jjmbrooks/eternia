export const clamp = (v, a = 0, b = 1) => (v < a ? a : v > b ? b : v);
export const lerp = (a, b, t) => a + (b - a) * t;
export const smooth = (a, b, x) => { const t = clamp((x - a) / (b - a)); return t * t * (3 - 2 * t); };
export const hueDiff = (a, b) => { let d = (((a - b) % 360) + 540) % 360 - 180; return Math.abs(d); };
// Interpolación de ángulos por el camino corto
export const lerpHue = (a, b, t) => { let d = (((b - a) % 360) + 540) % 360 - 180; return (a + d * t + 360) % 360; };
// RNG determinista (mulberry32): el núcleo nunca usa Math.random
export function makeRng(seed = 1) {
  let s = seed >>> 0;
  const r = () => { s = (s + 0x6d2b79f5) >>> 0; let t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  r.state = () => s; return r;
}
