// Clima sensorial por nivel (docs/ONDAS-SENSORIAL.md).
import { describe, it, expect } from 'vitest';
import { LEVELS, levelWeights, levelOf, climate, flashesAt, flashRate, FLASH_MAX, FLASH_LIFE } from '../src/core/levels.js';
import { createState } from '../src/core/sim.js';
import { mixFor } from '../src/audio/mix.js';

const at = (def, extra = {}) => Object.assign(createState({ w: 390, h: 844 }), { def, ...extra });

describe('niveles de ondas (clima)', () => {
  it('los pesos suman 1 y cada nivel domina su tramo', () => {
    for (let d = 0; d <= 1.0001; d += 0.01) expect(levelWeights(d).reduce((a, b) => a + b, 0)).toBeCloseTo(1, 6);
    expect([0.02, 0.14, 0.28, 0.5, 0.9].map((d) => levelOf(d).id)).toEqual(['delta', 'theta', 'alfa', 'beta', 'gamma']);
  });
  it('la entrada (0,45) es beta baja, el nivel del medio', () => { expect(levelOf(0.45).id).toBe('beta'); expect(levelOf(0.45).region).toBe('mezcla'); });
  it('menos ego = más quieto, menos polvo y menos destellos; el centro tiene más estrellas lejanas', () => {
    const order = ['delta', 'theta', 'alfa', 'beta', 'gamma'].map((id) => LEVELS.find((l) => l.id === id));
    for (let i = 1; i < order.length; i++) {
      expect(order[i].speed).toBeGreaterThan(order[i - 1].speed); expect(order[i].dust).toBeGreaterThan(order[i - 1].dust);
      expect(order[i].flash).toBeGreaterThan(order[i - 1].flash); expect(order[i].stars).toBeLessThan(order[i - 1].stars);
    }
  });
  it('theta es el nivel de los orbes de luz', () => { const th = climate(at(0.14)); expect(th.orbs).toBeGreaterThan(0.9); expect(climate(at(0.5)).orbs).toBe(0); });
  it('gamma se tiñe con la piel de la esfera: disonante rojo, cristal oro', () => {
    expect(climate(at(0.95, { texture: -1, tint: 0 })).hue).toBeCloseTo(8, 0);
    expect(climate(at(0.95, { texture: 1, tint: 0 })).hue).toBeCloseTo(42, 0);
  });
  it('el clima cambia suave con la definición (sin saltos)', () => {
    let prev = climate(at(0)); for (let d = 0.005; d <= 1; d += 0.005) { const c = climate(at(d)); expect(Math.abs(c.speed - prev.speed)).toBeLessThan(0.08); prev = c; }
  });
});

describe('destellos (WCAG 2.3.1)', () => {
  it('nunca más de 2 por segundo, aunque se pida más', () => {
    for (const rate of [0.1, 0.7, 2, 10]) {
      const starts = new Set(); for (let t = 0; t < 600; t += 0.05) for (const f of flashesAt(t, rate)) if (f.t0 >= 0) starts.add(f.t0);
      const perSec = starts.size / 600; expect(perSec).toBeLessThanOrEqual(FLASH_MAX + 1e-9);
      if (rate <= FLASH_MAX) expect(perSec).toBeGreaterThan(rate * 0.75), expect(perSec).toBeLessThan(rate * 1.25);
      // en ninguna ventana de 1 s hay 3 o más
      const ts = [...starts].sort((a, b) => a - b); for (let i = 2; i < ts.length; i++) expect(ts[i] - ts[i - 2]).toBeGreaterThan(0.5 - 1e-9);
    }
  });
  it('son deterministas y viven 0,6 s', () => {
    expect(flashesAt(123.4, 0.7)).toEqual(flashesAt(123.4, 0.7));
    for (let t = 0; t < 50; t += 0.1) for (const f of flashesAt(t, 1)) { expect(f.age).toBeGreaterThanOrEqual(0); expect(f.age).toBeLessThanOrEqual(FLASH_LIFE); }
  });
  it('un destello encendido no se mueve si cambia el nivel', () => {
    const a = flashesAt(77, 0.7), b = flashesAt(77, 0.71); const ids = new Set(b.map((f) => f.id));
    for (const f of a) if (ids.has(f.id)) expect(b.find((x) => x.id === f.id)).toEqual(f);
  });
  it('con movimiento reducido hay un tercio', () => { const c = climate(at(0.9)); expect(flashRate(c, true)).toBeCloseTo(flashRate(c) * 0.3, 6); });
});

describe('clima en el sonido', () => {
  it('el aire del lecho es más oscuro hacia el centro y se calla bajo la voz del cierre', () => {
    const lp = [0.02, 0.14, 0.28, 0.5, 0.9].map((d) => mixFor(at(d)).clima.noiseLp);
    for (let i = 1; i < lp.length; i++) expect(lp[i]).toBeGreaterThan(lp[i - 1]);
    const s = at(0.5); expect(mixFor(s, { guideText: true }).clima.noise).toBeLessThan(mixFor(s).clima.noise);
  });
  it('mismo ritmo de destellos en imagen y sonido', () => { const s = at(0.8); expect(mixFor(s, { reducedMotion: true }).clima.flashRate).toBeCloseTo(flashRate(climate(s), true), 9); });
});
