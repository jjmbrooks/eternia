// Sonido sintetizado en vivo. Tres capas y solo esas: lecho de la región, espiral y respiración.
// Sin música grabada, sin beats binaurales, sin promesas sobre ondas cerebrales: los nombres
// (gamma, beta, alfa, theta, delta) solo orientan el clima de cada estado.
import { PARAMS } from '../core/params.js';
import { PULSE_PERIODS } from '../core/sim.js';
import { clamp, smooth } from '../core/math.js';

const BEDS = {
  centro: { type: 'sine', f: [1318.5, 1760, 1975.5, 2637], g: [0.05, 0.035, 0.03, 0.02], lfo: 0.03, lp: 6000 }, // «delta»: parciales altas, mucho silencio
  calma: { type: 'sine', f: [220, 329.6, 440, 493.9], g: [0.07, 0.05, 0.035, 0.025], lfo: 0.06, lp: 3000 },      // «alfa»: tonos que se alargan
  mezcla: { type: 'triangle', f: [110, 164.8, 220, 277.2, 329.6], g: [0.06, 0.045, 0.04, 0.025, 0.02], lfo: 0.1, lp: 1400 }, // «beta baja»: aire cálido
  disonante: { type: 'sawtooth', f: [110, 116.5, 155.6, 164.8, 233.1, 246.9], g: [0.035, 0.03, 0.025, 0.025, 0.018, 0.018], lfo: 0.4, lp: 2200, am: 37 }, // «gamma/beta alta»: denso, seco, roto
  cristal: { type: 'sine', f: [110, 165, 220, 330, 440, 660], g: [0.06, 0.05, 0.045, 0.035, 0.03, 0.02], lfo: 0, lp: 8000 }, // demasiado consonante, sin aire
};
const PULSE_NOTES = [523.25, 659.25, 783.99]; // 5, 7, 4

export function createAudio() {
  let ctx = null, master, wet, groups = {}, breath, timer = null, started = false;
  const nextPulse = [0, 0, 0];
  let spiralMix = { all: 0, fam: null, famGain: 0 };

  function impulse(sec = 3.2) {
    const n = Math.floor(ctx.sampleRate * sec), b = ctx.createBuffer(2, n, ctx.sampleRate);
    for (let c = 0; c < 2; c++) { const d = b.getChannelData(c); for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, 2.6); }
    return b;
  }
  function noiseBuffer(sec = 4) {
    const n = Math.floor(ctx.sampleRate * sec), b = ctx.createBuffer(1, n, ctx.sampleRate), d = b.getChannelData(0);
    let last = 0; for (let i = 0; i < n; i++) { last = (last + 0.02 * (Math.random() * 2 - 1)) / 1.02; d[i] = last * 3.5; } // ruido café
    return b;
  }

  function build() {
    master = ctx.createGain(); master.gain.value = 0;
    const comp = ctx.createDynamicsCompressor(); comp.threshold.value = -18; comp.ratio.value = 3;
    const rev = ctx.createConvolver(); rev.buffer = impulse(); wet = ctx.createGain(); wet.gain.value = 0.45;
    master.connect(comp); comp.connect(ctx.destination); master.connect(rev); rev.connect(wet); wet.connect(comp);
    for (const [name, b] of Object.entries(BEDS)) {
      const out = ctx.createGain(); out.gain.value = 0;
      const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = b.lp; lp.connect(out);
      let dest = lp;
      if (b.am) { // modulación áspera (granulado), sin golpes de volumen
        const am = ctx.createGain(); am.gain.value = 0.6; const lfo = ctx.createOscillator(); lfo.frequency.value = b.am;
        const depth = ctx.createGain(); depth.gain.value = 0.4; lfo.connect(depth); depth.connect(am.gain); lfo.start(); am.connect(lp); dest = am;
      }
      b.f.forEach((f, i) => {
        const o = ctx.createOscillator(); o.type = b.type; o.frequency.value = f; o.detune.value = (Math.random() - 0.5) * (name === 'disonante' ? 30 : 4);
        const gg = ctx.createGain(); gg.gain.value = b.g[i];
        if (b.lfo) { const l = ctx.createOscillator(); l.frequency.value = b.lfo * (0.6 + Math.random() * 0.8); const d = ctx.createGain(); d.gain.value = b.g[i] * 0.8; l.connect(d); d.connect(gg.gain); l.start(); }
        o.connect(gg); gg.connect(dest); o.start();
      });
      out.connect(master); groups[name] = out;
    }
    const src = ctx.createBufferSource(); src.buffer = noiseBuffer(); src.loop = true;
    const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.Q.value = 0.7; bp.frequency.value = 600;
    const bg = ctx.createGain(); bg.gain.value = 0; src.connect(bp); bp.connect(bg); bg.connect(master); src.start();
    breath = { bp, bg };
  }

  function ping(k, when, kind) {
    const o = ctx.createOscillator(), g = ctx.createGain(); const base = PULSE_NOTES[k];
    let level = 0;
    if (kind === 'all') level = spiralMix.all * 0.09;
    else level = spiralMix.famGain * 0.07;
    if (level < 0.002) return;
    if (kind === 'disonante') { // fragmento: ruido filtrado y una segunda voz desafinada
      o.type = 'triangle'; o.frequency.value = base * 0.5 * (1 + (Math.random() - 0.5) * 0.06);
      const o2 = ctx.createOscillator(); o2.type = 'triangle'; o2.frequency.value = base * 0.5 * 1.059; o2.connect(g); o2.start(when); o2.stop(when + 1.2);
    } else if (kind === 'cristal') { o.type = 'sine'; o.frequency.value = base; const o2 = ctx.createOscillator(); o2.frequency.value = base * 1.5; o2.connect(g); o2.start(when); o2.stop(when + 4); }
    else { o.type = 'sine'; o.frequency.value = base * (k === 2 ? 0.75 : 1); }
    g.gain.setValueAtTime(0, when); g.gain.linearRampToValueAtTime(level, when + 0.04);
    g.gain.exponentialRampToValueAtTime(0.0001, when + (kind === 'disonante' ? 1.1 : 3.8));
    o.connect(g); g.connect(master); o.start(when); o.stop(when + 4);
  }

  function schedule() {
    if (!ctx) return; const now = ctx.currentTime;
    for (let k = 0; k < 3; k++) {
      const interval = PULSE_PERIODS[k] / PARAMS.pulses[k];
      while (nextPulse[k] < now + 0.25) {
        if (nextPulse[k] >= now - 0.05) {
          if (spiralMix.all > 0.01) ping(k, nextPulse[k], 'all');
          const famPulse = { disonante: 0, cristal: 1, moteada: 2 }[spiralMix.fam];
          if (famPulse === k && spiralMix.famGain > 0.01) ping(k, nextPulse[k], spiralMix.fam);
        }
        nextPulse[k] += interval;
      }
    }
  }

  async function start() {
    if (started) { if (ctx?.state === 'suspended') await ctx.resume(); return; }
    const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
    ctx = new AC(); build(); started = true;
    const t = ctx.currentTime; for (let k = 0; k < 3; k++) nextPulse[k] = t + 0.5 + k * 0.37;
    master.gain.setTargetAtTime(0.8, t, 1.5); // entra despacio, sin salto
    timer = setInterval(schedule, 100);
    if (ctx.state === 'suspended') await ctx.resume();
  }

  function update(s, events) {
    if (!ctx) return;
    const t = ctx.currentTime; const d = s.def; const tint = clamp(s.tint);
    const wCentro = 1 - smooth(0.02, 0.12, d);
    const wCalma = smooth(0.04, 0.12, d) * (1 - smooth(0.3, 0.45, d));
    const wMezcla = smooth(0.3, 0.42, d) * (1 - smooth(0.68, 0.85, d));
    const ext = smooth(0.6, 0.85, d);
    const disK = s.texture < 0 ? clamp(-s.texture * 1.5) * tint : 0, criK = s.texture > 0 ? clamp(s.texture * 1.5) * tint : 0;
    const set = (n, v) => groups[n].gain.setTargetAtTime(v, t, 1.2);
    set('centro', wCentro); set('calma', wCalma); set('mezcla', wMezcla + ext * (1 - disK - criK) * 0.8);
    set('disonante', ext * disK); set('cristal', ext * criK);
    // espiral: cerca del centro se oyen los tres pulsos a la vez; con la esfera definida, solo el de su familia
    spiralMix = {
      all: 1 - smooth(0.12, 0.38, d),
      fam: s.amb > 0.45 ? 'moteada' : disK > criK ? 'disonante' : 'cristal',
      famGain: smooth(0.35, 0.85, d) * Math.max(disK, criK, s.amb),
    };
    // respiración: al frente con la atención en el borde, baja en la esfera
    const lvl = s.attention === 'air' ? 0.55 : s.attention === 'ego' ? 0.1 : 0.22;
    const helping = s.guide.state === 'helping' ? 0.15 : 0;
    breath.bg.gain.setTargetAtTime((lvl + helping) * (0.15 + 0.85 * s.breath.value) * (0.35 + 0.65 * s.vit), t, 0.25);
    breath.bp.frequency.setTargetAtTime(380 + 900 * s.breath.value, t, 0.3);
    wet.gain.setTargetAtTime(0.25 + 0.5 * (1 - d), t, 2);
    for (const e of events) {
      if (e.type === 'burst') { // estallido: un oleaje grave, nunca un susto
        const o = ctx.createOscillator(), g = ctx.createGain(); o.type = 'sine'; o.frequency.setValueAtTime(90, t); o.frequency.exponentialRampToValueAtTime(55, t + 1.2);
        g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.12 * e.cost / 0.18, t + 0.25); g.gain.exponentialRampToValueAtTime(0.0001, t + 1.6);
        o.connect(g); g.connect(master); o.start(t); o.stop(t + 1.7);
      }
      if (e.type === 'guide-offer' || e.type === 'guide-accept') { // la luz del guía: un tono limpio, lejano
        const o = ctx.createOscillator(), g = ctx.createGain(); o.frequency.value = e.type === 'guide-accept' ? 392 : 293.66;
        g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.06, t + 1.5); g.gain.exponentialRampToValueAtTime(0.0001, t + 6);
        o.connect(g); g.connect(master); o.start(t); o.stop(t + 6.2);
      }
    }
  }

  function suspend() { if (ctx && ctx.state === 'running') ctx.suspend(); }
  function resume() { if (ctx && ctx.state === 'suspended') ctx.resume(); }
  return { start, update, suspend, resume, get started() { return started; } };
}
