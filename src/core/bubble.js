// Esferas contenedoras de los pensamientos (pedido de Brooks, 2026-10-17). Puro: sin DOM.
// Cada frase vive dentro de una esfera. Su forma depende del TIPO: más redonda o más asimétrica.
// Mapeo y criterio en docs/FRASES.md › «Forma de la esfera por tipo».
import { clamp } from './math.js';

// round: 1 = círculo perfecto. lobes/amp: deformación lenta. jag: aspereza (dientes). facets: cristal.
// wobble: velocidad de la deformación (1/s). pull: se estira hacia la esfera-ego (deseo). split: dos lóbulos (duda).
export const SHAPES = Object.freeze({
  preocupacion: { round: 0.55, lobes: 3, amp: 0.13, jag: 0.03, facets: 0, wobble: 1.9, pull: 0, split: 0 },  // tiembla: inestable
  juicio: { round: 0.3, lobes: 5, amp: 0.08, jag: 0.2, facets: 0, wobble: 0.5, pull: 0, split: 0 },          // áspera, rota
  deseo: { round: 0.8, lobes: 1, amp: 0.05, jag: 0, facets: 0, wobble: 0.6, pull: 0.22, split: 0 },          // gota que se estira hacia lo que quiere
  orgullo: { round: 0.95, lobes: 0, amp: 0, jag: 0, facets: 10, wobble: 0.05, pull: 0, split: 0 },           // cristal facetado, demasiado simétrico
  calma: { round: 1, lobes: 0, amp: 0.012, jag: 0, facets: 0, wobble: 0.2, pull: 0, split: 0 },              // círculo liso que respira
  recuerdo: { round: 0.85, lobes: 2, amp: 0.06, jag: 0, facets: 0, wobble: 0.25, pull: 0, split: 0 },        // óvalo blando, borde difuso
  duda: { round: 0.6, lobes: 2, amp: 0.05, jag: 0, facets: 0, wobble: 0.7, pull: 0, split: 0.16 },           // dos lóbulos que no eligen
  cotidiano: { round: 0.9, lobes: 2, amp: 0.035, jag: 0, facets: 0, wobble: 0.15, pull: 0, split: 0 },       // pompa sencilla, apenas achatada
});
export const shapeOf = (kind) => SHAPES[kind] || SHAPES.cotidiano;

// Métricas de la letra (Spectral 300 a 15 px): ancho medio por carácter y alto de línea, en px de mundo.
export const FONT = Object.freeze({ size: 15, charW: 7.3, lineH: 18, pad: 9 });

/** Parte una frase en líneas de como mucho `max` caracteres (sin cortar palabras). */
export function wrapLines(text, max) {
  const words = text.split(' '); const lines = []; let cur = '';
  for (const w of words) {
    if (!cur) cur = w; else if ((cur + ' ' + w).length <= max) cur += ' ' + w; else { lines.push(cur); cur = w; }
  }
  if (cur) lines.push(cur);
  return lines;
}
const blockRadius = (lines) => {
  const a = Math.max(...lines.map((l) => l.length)) * FONT.charW / 2, b = (lines.length * FONT.lineH) / 2;
  return Math.hypot(a, b) + FONT.pad;
};
/** Elige el corte de líneas que deja el bloque más redondo (el radio más chico), de 1 a 4 líneas. */
export function layoutPhrase(text) {
  let best = null;
  for (let max = 9; max <= 24; max++) {
    const lines = wrapLines(text, max); if (lines.length > 4) continue;
    const r = blockRadius(lines);
    // menos líneas si casi no cuesta radio; nunca una palabra de 1–2 letras sola en su línea
    const score = r + 3 * (lines.length - 1) + (lines.some((l) => l.length <= 2) ? 12 : 0);
    if (!best || score < best.score - 0.5) best = { lines, r, score };
  }
  return { lines: best.lines, r: best.r };
}

/**
 * Multiplicador del radio de la esfera contenedora en el ángulo `a` (radianes) en el tiempo `t`.
 * `seed` desfasa cada frase; `toward` es el ángulo hacia la esfera-ego (para el deseo).
 */
export function outline(kind, a, t, seed = 0, toward = 0) {
  const sh = shapeOf(kind); const ph = seed * 0.37;
  let m = 1;
  if (sh.lobes) m += sh.amp * Math.sin(sh.lobes * a + t * sh.wobble + ph) + sh.amp * 0.5 * Math.sin((sh.lobes + 2) * a - t * sh.wobble * 0.7 + ph * 2);
  else if (sh.amp) m += sh.amp * Math.sin(3 * a + t * sh.wobble + ph);
  if (sh.jag) { const k = Math.floor((a / (Math.PI * 2)) * 23 + 23) % 23; m += sh.jag * (frac(Math.sin((k + seed) * 91.7) * 4375.5) - 0.5); }
  if (sh.facets) { const seg = (Math.PI * 2) / sh.facets; const local = ((a - t * sh.wobble + seg / 2) % seg + seg) % seg - seg / 2; m *= Math.cos(seg / 2) / Math.cos(local); }
  if (sh.pull) m += sh.pull * Math.pow(Math.max(0, Math.cos(a - toward)), 3);
  if (sh.split) m += sh.split * Math.cos(2 * a + Math.sin(t * sh.wobble + ph) * 0.8) - sh.split * 0.3;
  return clamp(m, 0.6, 1.5);
}
const frac = (x) => x - Math.floor(x);

/** Redondez de una forma: 1 − (máx − mín) / media del contorno, muestreado. 1 = círculo. */
export function roundness(kind, t = 0) {
  let mn = Infinity, mx = -Infinity, sum = 0; const N = 96;
  for (let i = 0; i < N; i++) { const v = outline(kind, (i / N) * Math.PI * 2, t, 3, 0); mn = Math.min(mn, v); mx = Math.max(mx, v); sum += v; }
  return 1 - (mx - mn) / (sum / N);
}
