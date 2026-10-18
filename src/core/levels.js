// Clima sensorial por nivel de ruido mental (Tormenta, Parloteo, Murmullo, Quietud, Silencio). Puro: sin DOM ni audio.
// La inspiración científica y su correspondencia están en docs/ONDAS-SENSORIAL.md; no se promete ningún efecto.
// Cada nivel define paleta, partículas, velocidad, destellos y la textura sonora del lecho.
import { clamp, smooth, lerp, lerpHue } from './math.js';

// Rango de definición de cada nivel (el centro y la calma del concepto se parten en Silencio / Quietud / Murmullo).
export const LEVELS = Object.freeze([
  { id: 'silencio', name: 'Silencio', region: 'centro', from: 0, to: 0.08,
    hue: 228, hue2: 250, sat: 30, light: 3.5, dust: 0.2, stars: 0.9, speed: 0.15, jitter: 0, flash: 0.03, lights: 0.15, orbs: 0.1,
    sound: { noiseLp: 260, noise: 0.02, glint: 0.4 } },
  { id: 'quietud', name: 'Quietud', region: 'calma (cerca del centro)', from: 0.08, to: 0.2,
    hue: 252, hue2: 178, sat: 45, light: 6, dust: 0.35, stars: 0.6, speed: 0.3, jitter: 0, flash: 0.08, lights: 0.7, orbs: 1,
    sound: { noiseLp: 420, noise: 0.035, glint: 0.6 } },
  { id: 'murmullo', name: 'Murmullo', region: 'calma', from: 0.2, to: 0.35,
    hue: 214, hue2: 262, sat: 38, light: 7, dust: 0.55, stars: 0.45, speed: 0.5, jitter: 0, flash: 0.12, lights: 0.5, orbs: 0.35,
    sound: { noiseLp: 700, noise: 0.03, glint: 0.5 } },
  { id: 'parloteo', name: 'Parloteo', region: 'mezcla', from: 0.35, to: 0.72,
    hue: 205, hue2: 30, sat: 26, light: 8, dust: 0.75, stars: 0.3, speed: 0.85, jitter: 0.1, flash: 0.2, lights: 0.25, orbs: 0,
    sound: { noiseLp: 1100, noise: 0.025, glint: 0.35 } },
  { id: 'tormenta', name: 'Tormenta', region: 'extremo', from: 0.72, to: 1,
    hue: 8, hue2: 42, sat: 55, light: 9, dust: 1, stars: 0.15, speed: 1.35, jitter: 0.6, flash: 0.7, lights: 0.1, orbs: 0,
    sound: { noiseLp: 2400, noise: 0.03, glint: 0.25 } },
]);

/** Peso de cada nivel para una definición (fundidos de ±0,04 en cada frontera). Suman 1. */
export function levelWeights(def) {
  const d = clamp(def); const edges = LEVELS.slice(1).map((l) => l.from);
  const up = edges.map((e) => smooth(e - 0.04, e + 0.04, d)); // 0 → 1 al cruzar cada frontera
  return LEVELS.map((_, i) => (i === 0 ? 1 : up[i - 1]) * (i < LEVELS.length - 1 ? 1 - up[i] : 1));
}
export const levelOf = (def) => { const w = levelWeights(def); let k = 0; for (let i = 1; i < w.length; i++) if (w[i] > w[k]) k = i; return LEVELS[k]; };

/**
 * Clima mezclado para una definición. `tint`/`hue`/`texture` de la esfera tiñen el extremo:
 * la Tormenta disonante es roja, el cristal es oro.
 */
export function climate(s) {
  const w = levelWeights(s.def); const out = { dust: 0, stars: 0, speed: 0, jitter: 0, flash: 0, lights: 0, orbs: 0, sat: 0, light: 0, noiseLp: 0, noise: 0, glint: 0 };
  let hue = LEVELS[0].hue, hue2 = LEVELS[0].hue2, acc = 0;
  LEVELS.forEach((l, i) => {
    if (w[i] <= 0) return;
    for (const k of ['dust', 'stars', 'speed', 'jitter', 'flash', 'lights', 'orbs', 'sat', 'light']) out[k] += l[k] * w[i];
    out.noiseLp += l.sound.noiseLp * w[i]; out.noise += l.sound.noise * w[i]; out.glint += l.sound.glint * w[i];
    let lh = l.hue; if (l.id === 'tormenta') lh = clamp(s.tint) > 0.25 ? s.hue : (s.texture > 0 ? 42 : 8);
    acc += w[i]; hue = lerpHue(hue, lh, w[i] / acc); hue2 = lerpHue(hue2, l.hue2, w[i] / acc);
  });
  return { ...out, hue, hue2, weights: w, level: levelOf(s.def).id };
}

/**
 * Destellos ocasionales, deterministas en el tiempo (la imagen y el sonido ven los mismos).
 * `rate` = destellos por segundo; nunca más de 2 por segundo (WCAG 2.3.1 pide < 3 destellos/s) y cada uno es
 * pequeño (un punto con brillo de 0,6 s), nunca un parpadeo de pantalla.
 */
export const FLASH_MAX = 2; export const FLASH_LIFE = 0.6;
export function flashesAt(t, rate) {
  // rejilla fija de 0,5 s: cada casilla enciende un destello con probabilidad rate·0,5 → la frecuencia media es `rate`,
  // nunca más de 2 por segundo, y un cambio de nivel no mueve los destellos ya encendidos.
  const r = Math.min(FLASH_MAX, Math.max(0, rate)); if (r < 0.005) return [];
  const slot = 1 / FLASH_MAX; const out = []; const k0 = Math.floor((t - FLASH_LIFE) / slot) - 1, k1 = Math.floor(t / slot);
  for (let k = k0; k <= k1; k++) {
    const h = frac(Math.sin(k * 12.9898 + 78.233) * 43758.5453);
    if (frac(h * 91.7) >= r * slot) continue;
    const t0 = (k + h * 0.3) * slot; const age = t - t0;
    if (age < 0 || age > FLASH_LIFE) continue;
    out.push({ id: k, t0, age, x: frac(h * 7.13), y: frac(h * 3.77 + 0.31), size: 0.5 + frac(h * 5.3) });
  }
  return out;
}
/** Destellos por segundo para el clima; con movimiento reducido, un tercio. */
export const flashRate = (cl, reducedMotion = false) => Math.min(FLASH_MAX, cl.flash * (reducedMotion ? 0.3 : 1));
const frac = (x) => x - Math.floor(x);
export { lerp };
