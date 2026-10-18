// Mezcla del sonido como función PURA del estado (sin WebAudio): qué tan fuerte va cada capa y cómo suena el
// espacio. La usa src/audio/engine.js y la prueban tests/audio.test.js. Diseño completo en docs/SONIDO.md.
import { PARAMS } from '../core/params.js';
import { legibility, region } from '../core/sim.js';
import { clamp, lerp, smooth } from '../core/math.js';

/** Cercanía de la cámara: 0 = lo más lejos (centro, ego mínimo) … 1 = lo más cerca (extremo). */
export function proximity(zoom, p = PARAMS) {
  return clamp((Math.log(zoom) - Math.log(p.zoomMin)) / (Math.log(p.zoomMax) - Math.log(p.zoomMin)));
}

// Constantes de tiempo (s) con que el motor persigue cada objetivo. Nada cambia de golpe.
export const TAU = Object.freeze({ bed: 2.5, space: 3.5, breath: 0.35, voices: 0.6, wind: 0.25, master: 1.5 });

export function mixFor(s, { muted = false, guideText = false } = {}, p = PARAMS) {
  const d = s.def; const tint = clamp(s.tint); const prox = proximity(s.cam.zoom, p);
  // 1 · LECHO: un clima por región, en fundido cruzado (las regiones son estados de la definición)
  const centro = 1 - smooth(0.02, 0.12, d);
  const calma = smooth(0.04, 0.12, d) * (1 - smooth(0.3, 0.45, d));
  const mezclaW = smooth(0.3, 0.42, d) * (1 - smooth(0.68, 0.85, d));
  const ext = smooth(0.6, 0.85, d);
  const disK = s.texture < 0 ? clamp(-s.texture * 1.5) * tint : 0, criK = s.texture > 0 ? clamp(s.texture * 1.5) * tint : 0;
  const bedLevel = lerp(0.5, 1, prox) * (guideText ? 0.45 : 1); // la voz del cierre habla «sin música detrás»
  const bed = {
    centro: centro * bedLevel, calma: calma * bedLevel,
    mezcla: (mezclaW + ext * (1 - disK - criK) * 0.8) * bedLevel,
    disonante: ext * disK * bedLevel, cristal: ext * criK * bedLevel,
  };
  // ESPACIO ligado al zoom: lejos = mucho aire (reverberación larga, eco, estéreo ancho); cerca = seco, estrecho, encima
  const space = {
    wet: lerp(0.72, 0.14, prox), echo: lerp(0.32, 0.02, prox), echoFb: lerp(0.42, 0.05, prox),
    width: lerp(0.9, 0.2, prox), lowpass: lerp(9000, 4200, prox),
  };
  // 2 · ESPIRAL: cerca del centro suenan juntos los pulsos 5/7/4; con la esfera definida, solo el de su familia
  const pulses = {
    all: (1 - smooth(0.12, 0.38, d)) * (guideText ? 0.3 : 1),
    fam: s.amb > 0.45 ? 'moteada' : disK > criK ? 'disonante' : 'cristal',
    famGain: smooth(0.35, 0.85, d) * Math.max(disK, criK, s.amb) * (guideText ? 0.3 : 1),
  };
  // voces de los pensamientos: tan audibles como legibles (en el centro no hay palabras, ni voces)
  const voices = legibility(d) * (guideText ? 0.2 : 1);
  // 3 · RESPIRACIÓN: al frente con la atención en el borde; baja con la atención en la esfera
  const att = s.attention;
  const lvl = att === 'air' ? 0.55 : att === 'ego' ? 0.1 : 0.22;
  const helping = s.guide.state === 'helping' ? 0.15 : 0;
  const breath = {
    gain: (lvl + helping) * (0.15 + 0.85 * s.breath.value) * (0.35 + 0.65 * s.vit),
    freq: 380 + 900 * s.breath.value,
    pan: att === 'air' ? clamp((s.pointer.x / s.view.w - 0.5) * 1.4, -0.7, 0.7) : 0,
  };
  // GESTO: viento al viajar con la esfera, brillo al sostener en el centro
  const v = Math.hypot(s.sphere.vx, s.sphere.vy) * s.cam.zoom; // px de pantalla / s
  const wind = att === 'ego' ? clamp(v / 420) * 0.5 : 0;
  const seedK = s.seed.active ? clamp((s.seed.def - p.seedStart) / (p.seedPrend - p.seedStart)) : clamp(s.seed.holdT / p.seedHold) * 0.3;
  return {
    master: muted ? 0 : 0.8, region: region(d), prox, bed, space, pulses, voices, breath,
    wind, windPan: clamp(s.sphere.vx * s.cam.zoom / 400, -0.6, 0.6), shimmer: att === 'pattern' ? seedK : 0,
  };
}

// Escalas por familia (Hz). Los pensamientos «hablan» con alturas de su familia; nunca un ataque agudo.
export const SCALES = Object.freeze({
  disonante: [146.83, 155.56, 174.61, 207.65, 220.0],            // re con segunda menor y tritono: incómodo, no agresivo
  armonica: [220.0, 246.94, 277.18, 329.63, 369.99, 440.0],      // la mayor pentatónica: consonante, «demasiado bonita»
  ambigua: [196.0, 220.0, 233.08, 261.63, 293.66, 311.13],       // sol con terceras mayor y menor: no elige
  neutra: [880.0, 987.77],                                         // tic pequeño, casi sin altura
});
export const pitchFor = (family, id) => { const sc = SCALES[family] || SCALES.neutra; return sc[Math.abs(id * 7 + 3) % sc.length]; };
