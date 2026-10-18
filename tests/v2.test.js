// Escala, cámara, lienzo infinito, pensamientos en esferas y mezcla de sonido (pedidos de Brooks, 2026-10-17).
import { describe, it, expect } from 'vitest';
import { PARAMS } from '../src/core/params.js';
import { PHRASES, KINDS, byKind } from '../src/core/phrases.js';
import { SHAPES, layoutPhrase, wrapLines, roundness, outline } from '../src/core/bubble.js';
import { createState, step, seedField, zoomFor, screenRadius, toScreen, toWorld, viewRadius, region, ATT } from '../src/core/sim.js';
import { mixFor, proximity, SCALES, pitchFor } from '../src/audio/mix.js';

const W = 390, H = 844;
const run = (s, secs, input, dt = 1 / 30) => { const ev = []; for (let t = 0; t < secs - 1e-9; t += dt) ev.push(...step(s, dt, input)); return ev; };
const quiet = (s) => { s.thoughts = []; s.spawnT = 1e9; return s; };

describe('nivel intermedio y transiciones lentas', () => {
  it('se entra en el nivel del medio (mezcla) con zoom 1', () => {
    const s = createState({ w: W, h: H });
    expect(region(s.def)).toBe('mezcla'); expect(s.cam.zoom).toBeCloseTo(PARAMS.zoomMid);
  });
  it('soltar: de la entrada a la calma tarda ≥ 8 s; de la calma al centro ≥ 20 s', () => {
    const s = quiet(createState()); let t = 0;
    while (s.def >= PARAMS.calmMax) { step(s, 0.1, null); t += 0.1; }
    expect(t).toBeGreaterThanOrEqual(8); const t1 = t;
    while (s.def >= PARAMS.centerMax) { step(s, 0.1, null); t += 0.1; }
    expect(t - t1).toBeGreaterThanOrEqual(20);
  });
  it('el zoom acompaña despacio: tras 1 s recorre menos de la mitad del cambio, tras 12 s casi todo', () => {
    const s = quiet(createState()); const z0 = s.cam.zoom; s.def = 0; const zt = zoomFor(0);
    const hold = (secs) => { for (let i = 0; i < secs * 20; i++) { s.def = 0; step(s, 0.05, null); } };
    hold(1); expect(Math.abs(s.cam.zoom - z0)).toBeLessThan(Math.abs(zt - z0) / 2);
    hold(11); expect(s.cam.zoom).toBeCloseTo(zt, 1);
  });
});

describe('zoom ligado al ego', () => {
  it('más definición = cámara más cerca (monótono)', () => {
    let prev = 0; for (let d = 0; d <= 1.0001; d += 0.05) { const z = zoomFor(d); expect(z).toBeGreaterThan(prev); prev = z; }
    expect(zoomFor(0)).toBeCloseTo(PARAMS.zoomMin); expect(zoomFor(1)).toBeCloseTo(PARAMS.zoomMax);
  });
  it('a zoom intermedio en 390×844 la esfera mide ≥ 90 px (el dedo ~45 px no la tapa)', () => {
    const s = createState({ w: W, h: H }); expect(2 * screenRadius(s)).toBeGreaterThanOrEqual(90); expect(2 * screenRadius(s)).toBeLessThanOrEqual(140);
  });
  it('con menos ego se ve más universo: la vista abarca más mundo', () => {
    const a = createState(); const b = createState(); b.cam.zoom = zoomFor(0.05);
    expect(viewRadius(b)).toBeGreaterThan(viewRadius(a) * 2);
  });
});

describe('lienzo infinito', () => {
  it('pantalla ↔ mundo son inversas', () => {
    const s = createState(); s.cam = { ...s.cam, x: 1234, y: -560, zoom: 0.7 };
    const w = toWorld(s, 40, 700); const p = toScreen(s, w.x, w.y); expect(p.x).toBeCloseTo(40); expect(p.y).toBeCloseTo(700);
  });
  it('sostener el dedo arriba lleva la esfera lejos y la cámara la sigue: siempre a la vista', () => {
    const s = quiet(createState({ w: W, h: H })); const finger = { down: true, x: W / 2, y: 260 };
    for (let i = 0; i < 20 * 30; i++) {
      step(s, 1 / 30, finger);
      const p = toScreen(s, s.sphere.x, s.sphere.y); expect(p.y).toBeGreaterThan(0); expect(p.y).toBeLessThan(H);
    }
    expect(s.sphere.y).toBeLessThan(-1500); expect(s.attention).toBe(ATT.EGO);
  });
  it('la esfera va un poco arriba del dedo (no queda debajo de la yema)', () => {
    const s = quiet(createState({ w: W, h: H })); s.def = 0.45; const finger = { down: true, x: W / 2, y: H / 2 + 40 };
    for (let i = 0; i < 90; i++) { s.cam.x = 0; s.cam.y = 0; step(s, 1 / 30, finger); }
    const p = toScreen(s, s.sphere.x, s.sphere.y); expect(H / 2 + 40 - p.y).toBeGreaterThan(screenRadius(s) * 0.4);
  });
  it('los pensamientos nacen alrededor de la cámara, donde sea que esté', () => {
    const s = createState({ seed: 4 }); s.cam.x = 50000; s.cam.y = -30000; s.sphere.x = 50000; s.sphere.y = -30000; s.thoughts = [];
    run(s, 15, null); expect(s.thoughts.length).toBeGreaterThan(2);
    for (const th of s.thoughts) expect(Math.hypot(th.x - s.cam.x, th.y - s.cam.y)).toBeLessThan(viewRadius(s) * 1.4 + 100);
  });
  it('seedField reparte las frases por la vista, fuera de la esfera', () => {
    const s = createState({ seed: 7 }); seedField(s);
    for (const th of s.thoughts) {
      const p = toScreen(s, th.x, th.y); expect(p.x).toBeGreaterThan(-1); expect(p.x).toBeLessThan(W + 1);
      expect(Math.hypot(th.x - s.sphere.x, th.y - s.sphere.y)).toBeGreaterThan(60);
    }
  });
  it('en el centro (sin esfera) arrastrar mueve el lienzo y no condensa semilla', () => {
    const s = quiet(createState({ w: W, h: H })); s.def = 0; const x0 = s.cam.x;
    for (let i = 0; i < 60; i++) step(s, 1 / 30, { down: true, x: 300 - i * 3, y: 400 });
    expect(s.cam.x).toBeGreaterThan(x0 + 100); expect(s.seed.active).toBe(false); expect(s.def).toBe(0);
  });
});

describe('pensamientos: banco y esferas contenedoras', () => {
  it('≥ 60 frases en español, en minúsculas, sin exclamaciones; todos los tipos con ≥ 7', () => {
    expect(PHRASES.length).toBeGreaterThanOrEqual(60);
    for (const p of PHRASES) { expect(p.text).toBe(p.text.toLowerCase()); expect(p.text).not.toMatch(/[!¡]/); expect(KINDS[p.kind]).toBe(p.family); }
    for (const k of Object.keys(KINDS)) expect(byKind(k).length).toBeGreaterThanOrEqual(7);
  });
  it('cada tipo tiene su forma; lo armónico y lo quieto es más redondo que lo disonante y lo ambiguo', () => {
    for (const k of Object.keys(KINDS)) expect(SHAPES[k]).toBeTruthy();
    for (const t of [0, 3.3, 7.1]) {
      expect(roundness('calma', t)).toBeGreaterThan(0.95);
      for (const round of ['calma', 'orgullo', 'cotidiano']) for (const rough of ['preocupacion', 'juicio', 'duda'])
        expect(roundness(round, t)).toBeGreaterThan(roundness(rough, t));
    }
  });
  it('el deseo se estira hacia la esfera-ego', () => {
    expect(outline('deseo', 0, 0, 0, 0)).toBeGreaterThan(outline('deseo', Math.PI, 0, 0, 0) + 0.15);
  });
  it('las frases van en varias líneas y caben: radio entre 30 y 62 px de mundo, ≤ 4 líneas, sin palabras partidas', () => {
    for (const p of PHRASES) {
      const l = layoutPhrase(p.text); expect(l.lines.length).toBeLessThanOrEqual(4);
      expect(l.lines.join(' ')).toBe(p.text); expect(l.r).toBeGreaterThan(30); expect(l.r).toBeLessThan(62);
      if (p.text.length > 12) expect(l.lines.length).toBeGreaterThan(1);
    }
    expect(wrapLines('ya debería haber terminado', 10)).toEqual(['ya debería', 'haber', 'terminado']);
  });
});

describe('mezcla de sonido (pura)', () => {
  const at = (def, extra = {}) => { const s = createState(); s.def = def; s.cam.zoom = zoomFor(def); Object.assign(s, extra); return s; };
  it('más ego = más cerca y más seco; menos ego = más aire, eco y estéreo ancho', () => {
    const hi = mixFor(at(0.95)), lo = mixFor(at(0.1));
    expect(hi.prox).toBeGreaterThan(lo.prox);
    expect(lo.space.wet).toBeGreaterThan(hi.space.wet); expect(lo.space.echo).toBeGreaterThan(hi.space.echo);
    expect(lo.space.width).toBeGreaterThan(hi.space.width);
    expect(proximity(PARAMS.zoomMin)).toBe(0); expect(proximity(PARAMS.zoomMax)).toBe(1);
  });
  it('el lecho sigue a la región; en el centro solo queda su capa y los pulsos 5/7/4 juntos', () => {
    const c = mixFor(at(0)); expect(c.bed.centro).toBeGreaterThan(0.3); expect(c.bed.mezcla).toBe(0); expect(c.pulses.all).toBeCloseTo(1);
    const m = mixFor(at(0.5)); expect(m.bed.mezcla).toBeGreaterThan(0.3); expect(m.bed.centro).toBeCloseTo(0); expect(m.pulses.all).toBe(0);
  });
  it('las voces de los pensamientos son tan audibles como legibles: en el centro callan', () => {
    expect(mixFor(at(0)).voices).toBe(0); expect(mixFor(at(0.6)).voices).toBeGreaterThan(0.9);
  });
  it('la respiración pasa al frente con la atención en el borde', () => {
    const a = at(0.4); a.attention = 'air'; a.breath.value = 1; const e = at(0.4); e.attention = 'ego'; e.breath.value = 1;
    expect(mixFor(a).breath.gain).toBeGreaterThan(mixFor(e).breath.gain * 3);
  });
  it('la voz del cierre habla sin música detrás; sin sonido = master en 0', () => {
    const s = at(0.9); expect(mixFor(s, { guideText: true }).bed.mezcla).toBeLessThan(mixFor(s).bed.mezcla * 0.6);
    expect(mixFor(s, { muted: true }).master).toBe(0);
  });
  it('cada familia habla con su escala; alturas en rango cómodo', () => {
    for (const f of Object.keys(SCALES)) for (let id = 0; id < 20; id++) { const hz = pitchFor(f, id); expect(hz).toBeGreaterThan(100); expect(hz).toBeLessThan(1000); }
  });
});
