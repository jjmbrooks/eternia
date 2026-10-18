import { describe, it, expect } from 'vitest';
import { PARAMS, breathCycle } from '../src/core/params.js';
import { PHRASES } from '../src/core/phrases.js';
import {
  createState, step, region, sphereRadius, inertia, inBand, bandWidth, targetThoughts, legibility,
  affinity, chooseFamily, memoryOf, pulsePhases, PULSE_PERIODS, ATT, layoutOf,
} from '../src/core/sim.js';
const PACE = PARAMS.pace;

const W = 390, H = 844;
const center = { down: true, x: W / 2, y: H / 2 };
const edge = { down: true, x: 10, y: H / 2 };
const run = (s, secs, input, dt = 1 / 60) => { const ev = []; for (let t = 0; t < secs - 1e-9; t += dt) ev.push(...step(s, dt, input)); return ev; };
const quiet = (s) => { s.thoughts = []; s.spawnT = 1e9; return s; };
const put = (s, phraseText, x, y) => {
  const ph = PHRASES.find((p) => p.text === phraseText);
  const th = { id: s.nextId++, ...ph, ...layoutOf(ph.text), x, y, vx: 0, vy: 0, depth: 1, density: 0, contact: 0, fused: false, age: 0, life: 999, faint: false, seedRand: 1 };
  s.thoughts.push(th); return th;
};
// mantiene una frase quieta bajo la esfera (sin deriva) para medir el umbral
const pin = (th, s) => { th.x = s.sphere.x; th.y = s.sphere.y; th.vx = 0; th.vy = 0; };

describe('parámetros de la primera afinación', () => {
  it('coinciden con la tabla del documento', () => {
    expect(PARAMS.defInitialPdf).toBe(0.22); expect(PARAMS.vitInitial).toBe(0.75);
    expect(PARAMS.inhale).toBe(4.5); expect(PARAMS.exhale).toBe(6.0);
    expect(PARAMS.fusionThreshold).toBe(0.8); expect(PARAMS.burst).toBe(0.18);
    expect(PARAMS.restRecovery).toBe(0.015); expect(PARAMS.airRecovery).toBe(0.035);
    expect(PARAMS.airDefDecay).toBe(0.08); expect(PARAMS.releaseDefDecay).toBe(0.04);
    expect(PARAMS.fusionDefGain).toBe(0.06); expect(PARAMS.fusionDensityGain).toBe(0.12);
    expect(PARAMS.densityDecay).toBe(0.05); expect(PARAMS.edgeBand).toBe(0.18);
    expect(PARAMS.goldenAngle).toBe(137.5); expect(PARAMS.pulses).toEqual([5, 7, 4]);
  });
  it('banco: ≥ 60 frases (las 22 del PDF incluidas), activación entre 0,6 y 1,4', () => {
    expect(PHRASES.length).toBeGreaterThanOrEqual(60);
    expect(PHRASES.filter((p) => p.pdf)).toHaveLength(22);
    expect(new Set(PHRASES.map((p) => p.text)).size).toBe(PHRASES.length);
    const c = (f) => PHRASES.filter((p) => p.family === f).length;
    expect(c('neutra')).toBeLessThan(c('disonante')); expect(c('ambigua')).toBeGreaterThanOrEqual(12);
    for (const p of PHRASES) { expect(p.activation).toBeGreaterThanOrEqual(0.6); expect(p.activation).toBeLessThanOrEqual(1.4); }
    expect(PHRASES.filter((p) => p.family === 'disonante').every((p) => p.texture < 0)).toBe(true);
    expect(PHRASES.filter((p) => p.family === 'armonica').every((p) => p.texture > 0 && p.symmetry >= 0.85)).toBe(true);
    expect(PHRASES.filter((p) => p.family === 'ambigua').every((p) => p.amb === 1 && p.hue2 !== null)).toBe(true);
  });
});

describe('regiones = estados de la definición', () => {
  it('umbrales 0,08 / 0,35 / 0,72', () => {
    expect(region(0)).toBe('centro'); expect(region(0.079)).toBe('centro');
    expect(region(0.08)).toBe('calma'); expect(region(0.349)).toBe('calma');
    expect(region(0.35)).toBe('mezcla'); expect(region(0.719)).toBe('mezcla');
    expect(region(0.72)).toBe('extremo'); expect(region(1)).toBe('extremo');
  });
  it('ruido: ~3-4 en calma, ~8 en mezcla, 15+ en extremo', () => {
    expect(targetThoughts(0.2)).toBeGreaterThanOrEqual(3); expect(targetThoughts(0.2)).toBeLessThanOrEqual(5);
    expect(targetThoughts(0.5)).toBeGreaterThanOrEqual(7); expect(targetThoughts(0.5)).toBeLessThanOrEqual(9);
    expect(targetThoughts(0.9)).toBeGreaterThanOrEqual(15);
  });
  it('la esfera crece con la definición (mundo 54 → 72 px), inercia 0,15 s a 0,70 s', () => {
    const s = createState(); s.def = 0.08; expect(sphereRadius(s)).toBeCloseTo(PARAMS.sphereRMin);
    s.def = 1; expect(sphereRadius(s)).toBeCloseTo(PARAMS.sphereRMax);
    expect(inertia(0.08)).toBeCloseTo(0.15); expect(inertia(1)).toBeCloseTo(0.7);
  });
  it('banda del borde = 18 % del lado corto', () => {
    const v = { w: W, h: H, short: W }; expect(bandWidth(v)).toBeCloseTo(70.2);
    expect(inBand(v, 69, 400)).toBe(true); expect(inBand(v, 72, 400)).toBe(false); expect(inBand(v, 200, H - 20)).toBe(true);
  });
  it('el lenguaje se retira con la definición', () => {
    expect(legibility(0.05)).toBe(0); expect(legibility(0.9)).toBe(1);
    expect(legibility(0.2)).toBeGreaterThan(0); expect(legibility(0.2)).toBeLessThan(1); expect(legibility(0.36)).toBe(1); // mezcla: frases enteras
  });
});

describe('tasas', () => {
  it('dedo suelto: definición −0,04/s, vitalidad +0,015/s', () => {
    const s = quiet(createState()); run(s, 2, null);
    expect(s.def).toBeCloseTo(0.45 - 0.04 * PACE * 2, 3); expect(s.vit).toBeCloseTo(0.75 + 0.03, 3);
  });
  it('dedo en el borde: definición −0,08/s, vitalidad +0,035/s, nunca crea ego', () => {
    const s = quiet(createState()); run(s, 1, edge);
    expect(s.attention).toBe(ATT.AIR);
    expect(s.def).toBeCloseTo(0.45 - 0.08 * PACE, 3); expect(s.vit).toBeCloseTo(0.785, 3);
    run(s, 30, edge); expect(s.def).toBe(0); expect(s.vit).toBe(1);
  });
  it('sostener el ego sin fundir no lo engorda', () => {
    const s = quiet(createState()); run(s, 2, center); expect(s.def).toBeCloseTo(0.45, 6);
  });
});

describe('fusión', () => {
  const setup = () => { const s = quiet(createState()); s.sphere.x = W / 2; s.sphere.y = H / 2; return s; };
  it('un roce (< 0,8 s) no funde', () => {
    const s = setup(); const th = put(s, 'no vas a poder', W / 2, H / 2);
    for (let i = 0; i < 45; i++) { pin(th, s); step(s, 1 / 60, center); } // 0,75 s
    expect(s.fusion).toBeNull(); expect(s.vit).toBeGreaterThan(0.75);
  });
  it('quedarse 0,8 s funde: estallido 0,18 × activación, la esfera hereda el color', () => {
    const s = setup(); const th = put(s, 'no vas a poder', W / 2, H / 2);
    let ev = []; for (let i = 0; i < 50; i++) { pin(th, s); ev.push(...step(s, 1 / 60, center)); }
    expect(s.fusion?.id).toBe(th.id);
    const b = ev.find((e) => e.type === 'burst'); expect(b.cost).toBeCloseTo(0.18 * 1.2);
    const def0 = s.def; run(s, 3, center);
    expect(s.def).toBeCloseTo(def0 + 0.18 * PACE, 2); // +0,06/s × ritmo
    expect(th.density).toBeGreaterThan(0.3);   // +0,12/s
    expect(s.tint).toBeGreaterThan(0.8); expect(s.texture).toBeLessThan(-0.5);
    expect(Math.min(s.hue, 360 - s.hue)).toBeLessThan(20);
  });
  it('soltar termina la fusión; la densidad baja sola (−0,05/s) y la vitalidad vuelve a subir', () => {
    const s = setup(); const th = put(s, 'esto sí soy', W / 2, H / 2);
    for (let i = 0; i < 60; i++) { pin(th, s); step(s, 1 / 60, center); }
    run(s, 2, center); const d = th.density; const v = s.vit;
    run(s, 2, null); expect(s.fusion).toBeNull(); expect(th.density).toBeCloseTo(d - 0.1, 2);
    expect(s.vit).toBeCloseTo(v + 0.03, 2);
  });
  it('un hermano que se suma descuenta otro estallido', () => {
    const s = setup(); const th = put(s, 'no vas a poder', W / 2, H / 2);
    for (let i = 0; i < 50; i++) { pin(th, s); step(s, 1 / 60, center); }
    const v = s.vit; put(s, 'otra vez igual', s.sphere.x, s.sphere.y);
    const ev = run(s, 0.1, center);
    expect(ev.some((e) => e.type === 'absorb' && e.family === 'disonante')).toBe(true);
    expect(s.vit).toBeLessThan(v - 0.18 * 0.9 + 0.01);
  });
  it('frase ambigua: esfera moteada, no reclutada del todo', () => {
    const s = setup(); const th = put(s, 'ojalá se quede', W / 2, H / 2);
    for (let i = 0; i < 60; i++) { pin(th, s); step(s, 1 / 60, center); }
    run(s, 4, center);
    expect(s.amb).toBeGreaterThan(0.6); expect(Math.abs(s.texture)).toBeLessThan(0.2);
  });
  it('la vitalidad no se recupera durante la fusión', () => {
    const s = setup(); const th = put(s, 'qué bien se siente esto', W / 2, H / 2);
    for (let i = 0; i < 60; i++) { pin(th, s); step(s, 1 / 60, center); }
    const v = s.vit; run(s, 3, center); expect(s.vit).toBeLessThanOrEqual(v);
  });
});

describe('imán', () => {
  it('afinidad de matiz y textura × definición; una esfera pálida apenas elige', () => {
    const s = createState(); const dis = { ...PHRASES.find((p) => p.text === 'no vas a poder'), id: 1 }, arm = { ...PHRASES.find((p) => p.text === 'qué bien se siente esto'), id: 2 };
    s.tint = 0; expect(affinity(dis, s)).toBeCloseTo(affinity(arm, s));
    s.tint = 1; s.hue = 4; s.texture = -0.8;
    expect(affinity(dis, s)).toBeGreaterThan(0.9); expect(affinity(arm, s)).toBeLessThan(0.3);
  });
  it('mezcla de lo que nace con la esfera definida ≈ 7/2/1 (+ neutros en minoría)', () => {
    const s = createState({ seed: 3 }); s.def = 0.8; s.tint = 1; s.texture = -0.8; s.hue = 0;
    const n = { disonante: 0, ambigua: 0, armonica: 0, neutra: 0 };
    for (let i = 0; i < 4000; i++) n[chooseFamily(s, s.rng(), s.rng()).family]++;
    const pure = 4000 - n.neutra;
    expect(n.disonante / pure).toBeCloseTo(0.7, 1); expect(n.ambigua / pure).toBeCloseTo(0.2, 1);
    expect(n.armonica / pure).toBeCloseTo(0.1, 1); expect(n.neutra / 4000).toBeLessThan(0.12);
  });
  it('la esfera grande obedece peor', () => {
    const lag = (def) => { const s = quiet(createState()); s.def = def; s.cam.zoom = 1;
      for (let i = 0; i < 12; i++) { s.cam.zoom = 1; step(s, 1 / 60, { down: true, x: W / 2 + 110, y: H / 2 }); } return s.sphere.x; };
    expect(lag(0.2)).toBeGreaterThan(lag(0.95) + 20);
  });
  it('soltar conserva la inercia', () => {
    const s = quiet(createState()); s.sphere.vx = 120; const x = s.sphere.x; step(s, 0.1, null);
    expect(s.sphere.x).toBeGreaterThan(x + 8);
  });
});

describe('la voz (guía)', () => {
  const extreme = (texture = -0.8) => { const s = quiet(createState()); s.def = 0.9; s.vit = 0; s.tint = 1; s.texture = texture; s.hue = texture < 0 ? 0 : 42; return s; };
  it('no aparece si la definición no pasa de 0,72', () => {
    const s = quiet(createState()); s.def = 0.7; s.vit = 0; run(s, 0.1, center); expect(s.guide.state).toBe('off');
  });
  it('no aparece si queda vitalidad', () => {
    const s = extreme(); s.vit = 0.05; run(s, 0.05, center); expect(s.guide.state).toBe('off');
  });
  it('aparece con vitalidad 0 y definición > 0,72, con la piel correcta', () => {
    const a = extreme(-0.8); run(a, 0.05, center); expect(a.guide.state).toBe('offered'); expect(a.guide.skin).toBe('disonante');
    const b = extreme(0.8); run(b, 0.05, center); expect(b.guide.skin).toBe('cristal');
  });
  it('aceptar = tres ciclos en el borde (31,5 s); el imán baja a un tercio hasta definición < 0,45', () => {
    const s = extreme(); run(s, 0.05, center);
    expect(3 * breathCycle()).toBeCloseTo(31.5);
    run(s, 31.0, edge); expect(s.guide.state).toBe('offered');
    expect(s.def).toBeGreaterThan(0.5); // en el bucle el aire casi no adelgaza
    run(s, 0.6, edge); expect(s.guide.state).toBe('helping');
    const ev = run(s, 25, edge); // ritmo lento (pace): ≈ 18 s de aire de 0,88 a 0,45 expect(ev.some((e) => e.type === 'guide-leave')).toBe(true);
    expect(s.guide.state).toBe('off'); expect(s.def).toBeLessThan(0.45);
  });
  it('agarrar la esfera mientras la voz espera cancela la aceptación, sin castigo', () => {
    const s = extreme(); run(s, 0.05, center); run(s, 20, edge);
    const v = s.vit; const ev = run(s, 0.1, center);
    expect(ev.some((e) => e.type === 'guide-cancel')).toBe(true);
    expect(s.guide.acceptT).toBe(0); expect(s.guide.state).toBe('offered'); expect(s.vit).toBeGreaterThanOrEqual(v);
  });
  it('ignorarla no castiga y se vuelve a ofrecer a los ~60 s', () => {
    const s = extreme(); run(s, 0.05, center);
    expect(s.guide.textT).toBeGreaterThan(0);
    run(s, 20, null); expect(s.guide.textT).toBe(0); // se calla y espera
    const ev = run(s, 41, null);
    expect(ev.some((e) => e.type === 'guide-offer' && e.again)).toBe(true);
  });
});

describe('centro y semilla', () => {
  const atCenter = () => { const s = quiet(createState()); s.def = 0; return s; };
  it('rozar en el centro no crea ego', () => {
    const s = atCenter(); run(s, 1.0, center); run(s, 0.5, null); expect(s.def).toBe(0);
    expect(s.attention).toBe(ATT.NONE);
  });
  it('sostener 1,6 s empieza a condensar; soltar antes de 0,15 deshace la semilla', () => {
    const s = atCenter(); let ev = run(s, 1.7, center);
    expect(ev.some((e) => e.type === 'seed-start')).toBe(true); expect(s.seed.active).toBe(true);
    ev = run(s, 0.1, null); expect(ev.some((e) => e.type === 'seed-dissolve')).toBe(true); expect(s.def).toBe(0);
  });
  it('sostener hasta 0,15 condensa una esfera teñida y la atención pasa al ego', () => {
    const s = atCenter(); const ev = run(s, 1.6 + (0.15 - 0.04) / 0.06 + 0.2, { down: true, x: 300, y: 300 });
    expect(ev.some((e) => e.type === 'seed-prend')).toBe(true);
    expect(s.def).toBeGreaterThanOrEqual(0.15); expect(s.attention).toBe(ATT.EGO); expect(s.tint).toBeGreaterThan(0.3);
  });
  it('los pulsos 5/7/4 tienen periodos en razón φ (no cierran)', () => {
    expect(PULSE_PERIODS[1] / PULSE_PERIODS[0]).toBeCloseTo(1.618, 3);
    const ph = pulsePhases(1000); expect(ph).toHaveLength(3);
  });
});

describe('respiración', () => {
  it('sin espiral: 4,5 s de entrada y 6,0 s de salida', () => {
    const s = quiet(createState()); run(s, 10.6, edge);
    expect(s.breath.inhale).toBeCloseTo(4.5); expect(s.breath.exhale).toBeCloseTo(6.0);
  });
  it('el extremo disonante deforma el ritmo (corto) y el cristal lo sostiene', () => {
    const a = quiet(createState()); a.def = 0.95; a.tint = 1; a.texture = -0.9; run(a, 11, center);
    expect(a.breath.inhale).toBeLessThan(3.5);
    const b = quiet(createState()); b.def = 0.95; b.tint = 1; b.texture = 0.9; run(b, 11, center);
    expect(b.breath.hold).toBeGreaterThan(0.5);
  });
});

describe('reapertura', () => {
  it('abre en el nivel intermedio (Brooks): definición 0,45, vitalidad 0,75, textura neutra, ≤ 8 % del último matiz', () => {
    const s = createState({ lastHue: 3, lastTint: 1 });
    expect(s.def).toBe(0.45); expect(s.def).toBeGreaterThan(PARAMS.calmMax); expect(s.def).toBeLessThan(PARAMS.mixMax); expect(s.vit).toBe(0.75); expect(s.texture).toBe(0); expect(s.amb).toBe(0);
    expect(s.tint).toBeLessThanOrEqual(0.08); expect(s.hue).toBe(3);
  });
  it('solo se recuerda el color', () => {
    const s = createState(); s.def = 0.99; s.vit = 0; s.hue = 41.6; s.tint = 0.9;
    expect(memoryOf(s)).toEqual({ lastHue: 42, lastTint: 0.9 });
  });
});

describe('juego sin fin', () => {
  it('10 minutos simulados con gestos al azar: valores siempre en rango, sin estado final', () => {
    const s = createState({ seed: 9 }); let r = 1;
    const rnd = () => { r = (r * 16807) % 2147483647; return r / 2147483647; };
    let input = null;
    for (let i = 0; i < 600 * 20; i++) {
      if (i % 40 === 0) input = rnd() < 0.3 ? null : { down: true, x: rnd() * W, y: rnd() * H };
      step(s, 1 / 20, input);
      expect(s.def).toBeGreaterThanOrEqual(0); expect(s.def).toBeLessThanOrEqual(1);
      expect(s.vit).toBeGreaterThanOrEqual(0); expect(s.vit).toBeLessThanOrEqual(1);
      expect(Number.isFinite(s.sphere.x)).toBe(true);
    }
    expect(s.thoughts.length).toBeLessThan(40);
  });
});

describe('extremo', () => {
  it('con el ego muy definido los estallidos llegan solos (rozar ya funde), con pausa entre uno y otro', () => {
    const s = quiet(createState()); s.def = 0.9; s.tint = 1; s.texture = -0.8; s.hue = 0; s.vit = 0.9;
    s.sphere.x = W / 2; s.sphere.y = H / 2;
    const a = put(s, 'no vas a poder', W / 2, H / 2), b = put(s, 'otra vez igual', W / 2, H / 2);
    const ev = []; for (let i = 0; i < 60; i++) { for (const t of [a, b]) pin(t, s); ev.push(...step(s, 1 / 60, null)); }
    const autos = ev.filter((e) => e.type === 'absorb' && e.auto);
    expect(autos.length).toBe(1); expect(s.vit).toBeLessThan(0.9);
  });
  it('en el bucle (voz ofrecida) soltar casi no adelgaza', () => {
    const s = quiet(createState()); s.def = 0.9; s.vit = 0; s.texture = -0.8; s.tint = 1;
    run(s, 10, null); expect(s.guide.state).toBe('offered'); expect(s.def).toBeGreaterThan(0.84);
  });
});
