// Sonido de Eternia, sintetizado en vivo con WebAudio. No hay archivos de audio ni música grabada.
// Estructura (docs/SONIDO.md): las tres capas del concepto — 1 lecho, 2 espiral, 3 respiración — más los
// acentos del gesto. La espiral incluye las «voces» de los pensamientos (una por tipo) y el centro áureo (5/7/4).
// La mezcla sale de mixFor() (src/audio/mix.js, pura y con pruebas). Sin beats binaurales ni promesas clínicas.
import { PARAMS } from '../core/params.js';
import { PULSE_PERIODS, toScreen } from '../core/sim.js';
import { mixFor, TAU, pitchFor } from './mix.js';
import { flashesAt } from '../core/levels.js';

const BEDS = {
  centro: { type: 'sine', f: [1318.5, 1760, 1975.5, 2637], g: [0.05, 0.035, 0.03, 0.02], lfo: 0.03 },                       // Silencio: parciales altas, mucho silencio
  calma: { type: 'sine', f: [220, 329.6, 440, 493.9], g: [0.07, 0.05, 0.035, 0.025], lfo: 0.06, lp: 3000 },                  // Murmullo: tonos que se alargan
  mezcla: { type: 'triangle', f: [110, 164.8, 220, 277.2, 329.6], g: [0.06, 0.045, 0.04, 0.025, 0.02], lfo: 0.1, lp: 1400 }, // Parloteo: aire cálido
  disonante: { type: 'sawtooth', f: [110, 116.5, 155.6, 164.8, 233.1, 246.9], g: [0.035, 0.03, 0.025, 0.025, 0.018, 0.018], lfo: 0.4, lp: 2200, am: 37 }, // denso, seco, roto
  cristal: { type: 'sine', f: [110, 165, 220, 330, 440, 660], g: [0.06, 0.05, 0.045, 0.035, 0.03, 0.02], lfo: 0, lp: 8000 }, // demasiado consonante, sin aire
};
const PULSE_NOTES = [523.25, 659.25, 783.99]; // 5, 7, 4
const MAX_VOICES = 3; const VOICE_GAP = 1.3; // s entre voces de pensamientos: el silencio también se compone

export function createAudio() {
  let ctx = null, master, lowpass, wet, echo, echoFb, echoWet, groups = {}, panners = [], breath, wind, shimmer, timer = null, started = false, clima;
  let lastFlash = -1e9;
  let muted = false; let mix = null; let lastVoice = -10; let activeVoices = 0;
  const voiced = new Set(); let fusedVoice = null; let lastAttention = 'none';
  const nextPulse = [0, 0, 0];

  const rnd = () => Math.random();
  function impulse(sec = 4.5) {
    const n = Math.floor(ctx.sampleRate * sec), b = ctx.createBuffer(2, n, ctx.sampleRate);
    for (let c = 0; c < 2; c++) { const d = b.getChannelData(c); for (let i = 0; i < n; i++) d[i] = (rnd() * 2 - 1) * Math.pow(1 - i / n, 2.8); }
    return b;
  }
  function noiseBuffer(sec = 4, brown = true) {
    const n = Math.floor(ctx.sampleRate * sec), b = ctx.createBuffer(1, n, ctx.sampleRate), d = b.getChannelData(0);
    let last = 0; for (let i = 0; i < n; i++) { if (brown) { last = (last + 0.02 * (rnd() * 2 - 1)) / 1.02; d[i] = last * 3.5; } else d[i] = rnd() * 2 - 1; }
    return b;
  }
  const at = (param, v, tau) => param.setTargetAtTime(v, ctx.currentTime, tau);

  function build() {
    // salida: master → paso bajo (espacio) → limitador suave → altavoz; envíos a reverberación y eco
    const limiter = ctx.createDynamicsCompressor(); limiter.threshold.value = -14; limiter.knee.value = 12; limiter.ratio.value = 8; limiter.attack.value = 0.01; limiter.release.value = 0.4;
    master = ctx.createGain(); master.gain.value = 0;
    lowpass = ctx.createBiquadFilter(); lowpass.type = 'lowpass'; lowpass.frequency.value = 8000; lowpass.Q.value = 0.5;
    master.connect(lowpass); lowpass.connect(limiter); limiter.connect(ctx.destination);
    const rev = ctx.createConvolver(); rev.buffer = impulse(); wet = ctx.createGain(); wet.gain.value = 0.4;
    lowpass.connect(rev); rev.connect(wet); wet.connect(limiter);
    echo = ctx.createDelay(2); echo.delayTime.value = 0.618; echoFb = ctx.createGain(); echoFb.gain.value = 0.2; echoWet = ctx.createGain(); echoWet.gain.value = 0.1;
    const echoLp = ctx.createBiquadFilter(); echoLp.type = 'lowpass'; echoLp.frequency.value = 2400;
    lowpass.connect(echo); echo.connect(echoLp); echoLp.connect(echoFb); echoFb.connect(echo); echoLp.connect(echoWet); echoWet.connect(limiter);

    for (const [name, b] of Object.entries(BEDS)) {
      const out = ctx.createGain(); out.gain.value = 0;
      let dest = out;
      if (b.lp) { const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = b.lp; lp.connect(out); dest = lp; }
      if (b.am) { // modulación áspera (granulado), sin golpes de volumen
        const am = ctx.createGain(); am.gain.value = 0.6; const lfo = ctx.createOscillator(); lfo.frequency.value = b.am;
        const depth = ctx.createGain(); depth.gain.value = 0.4; lfo.connect(depth); depth.connect(am.gain); lfo.start(); am.connect(dest); dest = am;
      }
      b.f.forEach((f, i) => {
        const o = ctx.createOscillator(); o.type = b.type; o.frequency.value = f; o.detune.value = (rnd() - 0.5) * (name === 'disonante' ? 30 : 4);
        const gg = ctx.createGain(); gg.gain.value = b.g[i];
        if (b.lfo) { const l = ctx.createOscillator(); l.frequency.value = b.lfo * (0.6 + rnd() * 0.8); const d = ctx.createGain(); d.gain.value = b.g[i] * 0.8; l.connect(d); d.connect(gg.gain); l.start(); }
        const pan = ctx.createStereoPanner(); const base = b.f.length > 1 ? (i / (b.f.length - 1)) * 2 - 1 : 0; pan.pan.value = base * 0.5;
        panners.push({ pan, base }); o.connect(gg); gg.connect(pan); pan.connect(dest); o.start();
      });
      out.connect(master); groups[name] = out;
    }
    // respiración: ruido café filtrado que sube y baja con el marco
    const src = ctx.createBufferSource(); src.buffer = noiseBuffer(); src.loop = true;
    const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.Q.value = 0.7; bp.frequency.value = 600;
    const bg = ctx.createGain(); bg.gain.value = 0; const bpan = ctx.createStereoPanner();
    src.connect(bp); bp.connect(bg); bg.connect(bpan); bpan.connect(master); src.start();
    breath = { bp, bg, pan: bpan };
    // viento del viaje: ruido blanco por un pasabanda que sube con la velocidad
    const ws = ctx.createBufferSource(); ws.buffer = noiseBuffer(3, false); ws.loop = true;
    const wbp = ctx.createBiquadFilter(); wbp.type = 'bandpass'; wbp.Q.value = 1.4; wbp.frequency.value = 500;
    const wg = ctx.createGain(); wg.gain.value = 0; const wpan = ctx.createStereoPanner();
    ws.connect(wbp); wbp.connect(wg); wg.connect(wpan); wpan.connect(master); ws.start();
    wind = { bp: wbp, g: wg, pan: wpan };
    // brillo de la semilla: dos senos agudos que suben mientras se sostiene en el centro
    const sg = ctx.createGain(); sg.gain.value = 0; const s1 = ctx.createOscillator(), s2 = ctx.createOscillator();
    s1.frequency.value = 660; s2.frequency.value = 660 * 1.618; s1.connect(sg); s2.connect(sg); sg.connect(master); s1.start(); s2.start();
    shimmer = { g: sg, s1, s2 };
    // aire del nivel (lecho): ruido café por un paso bajo; en Silencio casi nada y oscuro, en Tormenta más granulado y claro
    const cs = ctx.createBufferSource(); cs.buffer = noiseBuffer(5); cs.loop = true;
    const clp = ctx.createBiquadFilter(); clp.type = 'lowpass'; clp.frequency.value = 700; clp.Q.value = 0.3;
    const cg = ctx.createGain(); cg.gain.value = 0; cs.connect(clp); clp.connect(cg); cg.connect(master); cs.start();
    clima = { lp: clp, g: cg };
  }
  // destello: un brillo agudo y muy bajo (pentatónica de mi), con la cola en la reverberación; nunca un clic
  const GLINT = [1318.5, 1479.98, 1661.2, 1975.5, 2217.5];
  function glint(level, x, id) {
    if (level < 0.001) return; const t = ctx.currentTime + 0.01; const f = GLINT[Math.abs(id) % GLINT.length];
    const g = ctx.createGain(); const pan = ctx.createStereoPanner(); pan.pan.value = (x - 0.5) * 1.4; g.connect(pan); pan.connect(master);
    env(g, t, 0.06, level, 1.6); osc('sine', f, t, 1.6, g); osc('sine', f * 2.01, t, 0.6, g);
  }

  // ── voces de los pensamientos, una por tipo (docs/SONIDO.md › Voces) ──
  function env(g, t, a, peak, dur) { g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(peak, t + a); g.gain.exponentialRampToValueAtTime(0.0001, t + dur); }
  function osc(type, f, t, dur, dest) { const o = ctx.createOscillator(); o.type = type; o.frequency.setValueAtTime(f, t); o.connect(dest); o.start(t); o.stop(t + dur + 0.05); return o; }
  function voice(kind, family, id, level, panX = 0) {
    if (!ctx || level < 0.002) return;
    const t = ctx.currentTime + 0.02; const f = pitchFor(family, id);
    const g = ctx.createGain(); const pan = ctx.createStereoPanner(); pan.pan.value = Math.max(-0.8, Math.min(0.8, panX)); g.connect(pan); pan.connect(master);
    let dur = 2;
    switch (kind) {
      case 'preocupacion': { // tiembla: dos triángulos a un semitono, trémolo rápido y corto
        dur = 1.3; env(g, t, 0.08, level * 0.8, dur);
        const tr = ctx.createGain(); tr.gain.value = 0.6; const l = ctx.createOscillator(); l.frequency.value = 7; const ld = ctx.createGain(); ld.gain.value = 0.4; l.connect(ld); ld.connect(tr.gain); l.start(t); l.stop(t + dur);
        tr.connect(g); osc('triangle', f, t, dur, tr); osc('triangle', f * 1.059, t, dur, tr); break;
      }
      case 'juicio': { // seco y áspero: ruido estrecho + triángulo que cae
        dur = 0.9; env(g, t, 0.02, level, dur);
        const n = ctx.createBufferSource(); n.buffer = noiseBuffer(1, false); const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = f * 4; bp.Q.value = 6;
        const ng = ctx.createGain(); ng.gain.value = 0.5; n.connect(bp); bp.connect(ng); ng.connect(g); n.start(t); n.stop(t + dur);
        const o = osc('triangle', f, t, dur, g); o.frequency.exponentialRampToValueAtTime(f * 0.84, t + dur); break;
      }
      case 'deseo': { // se estira: un seno que sube y se hincha
        dur = 2.2; env(g, t, 0.7, level * 0.9, dur);
        const o = osc('sine', f, t, dur, g); o.frequency.exponentialRampToValueAtTime(f * 1.122, t + dur * 0.8); osc('sine', f * 2, t, dur, g).detune.value = 6; break;
      }
      case 'orgullo': { // campana FM armónica + quinta justa: brillante, perfecta
        dur = 3; env(g, t, 0.01, level * 0.8, dur);
        const car = osc('sine', f * 2, t, dur, g); const mod = ctx.createOscillator(); mod.frequency.value = f * 4; const md = ctx.createGain();
        md.gain.setValueAtTime(f * 3, t); md.gain.exponentialRampToValueAtTime(1, t + dur); mod.connect(md); md.connect(car.frequency); mod.start(t); mod.stop(t + dur);
        osc('sine', f * 3, t, dur, g); break;
      }
      case 'calma': { // un seno con su octava, entra despacio, cola larga
        dur = 3.6; env(g, t, 0.9, level * 0.7, dur); osc('sine', f, t, dur, g); osc('sine', f * 2, t, dur, g); break;
      }
      case 'recuerdo': { // caja de música lejana: triángulo apagado con vaivén de afinación
        dur = 2.6; env(g, t, 0.03, level * 0.8, dur);
        const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 1400; lp.connect(g);
        const o = osc('triangle', f * 2, t, dur, lp); const w = ctx.createOscillator(); w.frequency.value = 0.6; const wd = ctx.createGain(); wd.gain.value = 14; w.connect(wd); wd.connect(o.detune); w.start(t); w.stop(t + dur); break;
      }
      case 'duda': { // dos notas que se alternan (tercera mayor / menor) y no resuelven
        dur = 1.8; env(g, t, 0.05, level * 0.8, dur);
        const o = osc('sine', f * 1.26, t, dur, g); o.frequency.setValueAtTime(f * 1.26, t); o.frequency.setValueAtTime(f * 1.19, t + 0.4); o.frequency.setValueAtTime(f * 1.26, t + 0.8); o.frequency.setValueAtTime(f * 1.19, t + 1.2);
        osc('sine', f, t, dur, g); break;
      }
      default: { // cotidiano: un tic de madera, casi sin altura
        dur = 0.25; env(g, t, 0.003, level * 0.6, dur);
        const n = ctx.createBufferSource(); n.buffer = noiseBuffer(0.3, false); const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 2200; bp.Q.value = 3;
        n.connect(bp); bp.connect(g); n.start(t); n.stop(t + dur); osc('sine', f, t, 0.08, g);
      }
    }
    activeVoices++; setTimeout(() => { activeVoices--; }, dur * 1000);
  }

  // voz sostenida mientras la atención está fundida con una frase
  function startFused(kind, family, id) {
    stopFused();
    const t = ctx.currentTime; const f = pitchFor(family, id) / 2; const g = ctx.createGain(); g.gain.value = 0; g.connect(master);
    const nodes = [];
    const add = (type, freq, det = 0) => { const o = ctx.createOscillator(); o.type = type; o.frequency.value = freq; o.detune.value = det; o.connect(g); o.start(t); nodes.push(o); return o; };
    if (family === 'disonante') {
      const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 900; lp.connect(g);
      for (const [fr, d] of [[f, -14], [f * 1.059, 9]]) { const o = ctx.createOscillator(); o.type = 'sawtooth'; o.frequency.value = fr; o.detune.value = d; o.connect(lp); o.start(t); nodes.push(o); }
      if (kind === 'preocupacion') { const l = ctx.createOscillator(); l.frequency.value = 6; const ld = ctx.createGain(); ld.gain.value = 0.03; l.connect(ld); ld.connect(g.gain); l.start(t); nodes.push(l); }
    } else if (family === 'armonica') { add('sine', f); add('sine', f * 1.5); add('sine', f * 2, 3); }
    else if (family === 'ambigua') {
      add('triangle', f); const o = add('sine', f * 1.26); const l = ctx.createOscillator(); l.type = 'square'; l.frequency.value = 0.35; const ld = ctx.createGain(); ld.gain.value = 50; l.connect(ld); ld.connect(o.detune); l.start(t); nodes.push(l);
    } else add('sine', f * 2);
    g.gain.setTargetAtTime(0.05, t, 1.2);
    fusedVoice = { g, nodes };
  }
  function stopFused() {
    if (!fusedVoice) return; const { g, nodes } = fusedVoice; const t = ctx.currentTime;
    g.gain.cancelScheduledValues(t); g.gain.setTargetAtTime(0, t, 0.8); for (const n of nodes) n.stop(t + 4); fusedVoice = null;
  }

  function oneShot(kind, level) {
    const t = ctx.currentTime; const o = ctx.createOscillator(), g = ctx.createGain(); o.connect(g); g.connect(master);
    if (kind === 'burst') { o.frequency.setValueAtTime(90, t); o.frequency.exponentialRampToValueAtTime(55, t + 1.2); env(g, t, 0.25, level, 1.6); o.start(t); o.stop(t + 1.7); }
    else if (kind === 'guide') { o.frequency.value = level > 0.05 ? 392 : 293.66; env(g, t, 1.5, 0.06, 6); o.start(t); o.stop(t + 6.2); }
    else if (kind === 'touch') { o.frequency.value = 196; env(g, t, 0.04, level, 0.7); o.start(t); o.stop(t + 0.8); }
    else if (kind === 'prend') { o.frequency.value = 659.25; const o2 = ctx.createOscillator(); o2.frequency.value = 659.25 * 1.5; o2.connect(g); env(g, t, 0.02, level, 3.5); o.start(t); o2.start(t); o.stop(t + 3.6); o2.stop(t + 3.6); }
    else if (kind === 'dissolve') { o.frequency.setValueAtTime(880, t); o.frequency.exponentialRampToValueAtTime(440, t + 1.4); env(g, t, 0.05, level, 1.5); o.start(t); o.stop(t + 1.6); }
    else if (kind === 'enter') { o.frequency.value = 110; const o2 = ctx.createOscillator(); o2.frequency.value = 164.8; o2.connect(g); env(g, t, 1.2, level, 5); o.start(t); o2.start(t); o.stop(t + 5.1); o2.stop(t + 5.1); }
  }

  function ping(k, when, kind) {
    const o = ctx.createOscillator(), g = ctx.createGain(); const base = PULSE_NOTES[k];
    const level = kind === 'all' ? mix.pulses.all * 0.09 : mix.pulses.famGain * 0.07;
    if (level < 0.002) return;
    if (kind === 'disonante') {
      o.type = 'triangle'; o.frequency.value = base * 0.5 * (1 + (rnd() - 0.5) * 0.06);
      const o2 = ctx.createOscillator(); o2.type = 'triangle'; o2.frequency.value = base * 0.5 * 1.059; o2.connect(g); o2.start(when); o2.stop(when + 1.2);
    } else if (kind === 'cristal') { o.type = 'sine'; o.frequency.value = base; const o2 = ctx.createOscillator(); o2.frequency.value = base * 1.5; o2.connect(g); o2.start(when); o2.stop(when + 4); }
    else { o.type = 'sine'; o.frequency.value = base * (k === 2 ? 0.75 : 1); }
    g.gain.setValueAtTime(0, when); g.gain.linearRampToValueAtTime(level, when + 0.04);
    g.gain.exponentialRampToValueAtTime(0.0001, when + (kind === 'disonante' ? 1.1 : 3.8));
    o.connect(g); g.connect(master); o.start(when); o.stop(when + 4);
  }
  function schedule() {
    if (!ctx || !mix) return; const now = ctx.currentTime;
    for (let k = 0; k < 3; k++) {
      const interval = PULSE_PERIODS[k] / PARAMS.pulses[k];
      while (nextPulse[k] < now + 0.25) {
        if (nextPulse[k] >= now - 0.05) {
          if (mix.pulses.all > 0.01) ping(k, nextPulse[k], 'all');
          const famPulse = { disonante: 0, cristal: 1, moteada: 2 }[mix.pulses.fam];
          if (famPulse === k && mix.pulses.famGain > 0.01) ping(k, nextPulse[k], mix.pulses.fam);
        }
        nextPulse[k] += interval;
      }
    }
  }

  async function start() {
    if (started) { if (ctx?.state === 'suspended') await ctx.resume(); return; }
    const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
    try { if (navigator.audioSession) navigator.audioSession.type = 'ambient'; } catch { /* iOS < 17 */ } // respeta el interruptor de silencio
    ctx = new AC(); build(); started = true;
    const t = ctx.currentTime; for (let k = 0; k < 3; k++) nextPulse[k] = t + 0.5 + k * 0.37;
    master.gain.setTargetAtTime(muted ? 0 : 0.8, t, TAU.master); // entra despacio, sin salto
    oneShot('enter', 0.05);
    timer = setInterval(schedule, 100);
    if (ctx.state === 'suspended') await ctx.resume();
  }

  function update(s, events, { guideText = false, reducedMotion = false } = {}) {
    if (!ctx) return;
    mix = mixFor(s, { muted, guideText, reducedMotion });
    const m = mix;
    at(master.gain, m.master, TAU.master);
    for (const n of Object.keys(BEDS)) at(groups[n].gain, m.bed[n], TAU.bed);
    at(wet.gain, m.space.wet, TAU.space); at(echoWet.gain, m.space.echo, TAU.space); at(echoFb.gain, m.space.echoFb, TAU.space);
    at(lowpass.frequency, m.space.lowpass, TAU.space);
    for (const { pan, base } of panners) at(pan.pan, base * m.space.width, TAU.space);
    at(breath.bg.gain, m.breath.gain, TAU.breath); at(breath.bp.frequency, m.breath.freq, 0.3); at(breath.pan.pan, m.breath.pan, 0.6);
    at(wind.g.gain, m.wind * 0.12, TAU.wind); at(wind.bp.frequency, 380 + m.wind * 1600, TAU.wind); at(wind.pan.pan, m.windPan, 0.4);
    at(shimmer.g.gain, m.shimmer * 0.025, 0.3); at(shimmer.s1.frequency, 660 + 330 * m.shimmer, 0.3); at(shimmer.s2.frequency, (660 + 330 * m.shimmer) * 1.618, 0.3);
    at(clima.g.gain, m.clima.noise, TAU.bed); at(clima.lp.frequency, m.clima.noiseLp, TAU.bed);
    if (s.t < lastFlash - 1) lastFlash = -1e9; // partida nueva
    for (const f of flashesAt(s.t, m.clima.flashRate)) if (f.t0 > lastFlash) { lastFlash = f.t0; glint(0.012 * m.clima.glint * (0.6 + 0.4 * f.size), f.x, f.id); }
    if (fusedVoice) at(fusedVoice.g.gain, 0.05 * Math.max(0.3, m.voices), TAU.voices);

    // los pensamientos que entran a la vista dicen su tipo, de uno en uno y con silencio entre voces
    const now = ctx.currentTime;
    if (m.voices > 0.05 && activeVoices < MAX_VOICES && now - lastVoice > VOICE_GAP) {
      for (const th of s.thoughts) {
        if (voiced.has(th.id) || th.fused || th.age < 0.6) continue;
        const p = toScreen(s, th.x, th.y);
        if (p.x < 0 || p.x > s.view.w || p.y < 0 || p.y > s.view.h) continue;
        voiced.add(th.id); lastVoice = now;
        voice(th.kind, th.family, th.id, 0.05 * m.voices * (th.faint ? 0.35 : 1) * (0.6 + 0.4 * th.depth), (p.x / s.view.w - 0.5) * 1.6);
        break;
      }
    }
    if (voiced.size > 400) voiced.clear();

    if (s.attention === 'ego' && lastAttention !== 'ego') oneShot('touch', 0.035);
    lastAttention = s.attention;
    for (const e of events) {
      const th = e.id != null ? s.thoughts.find((x) => x.id === e.id) : null;
      const panX = th ? (toScreen(s, th.x, th.y).x / s.view.w - 0.5) * 1.6 : 0;
      if (e.type === 'contact' && th) voice(th.kind, th.family, th.id, 0.07 * Math.max(0.3, m.voices), panX);
      if (e.type === 'fuse') startFused(e.kind, e.family, e.id);
      if (e.type === 'unfuse') stopFused();
      if (e.type === 'absorb') voice(e.kind, e.family, e.id, 0.08, panX);
      if (e.type === 'burst') oneShot('burst', 0.12 * e.cost / 0.18); // un oleaje grave, nunca un susto
      if (e.type === 'guide-offer') oneShot('guide', 0.04);
      if (e.type === 'guide-accept') oneShot('guide', 0.06);
      if (e.type === 'seed-prend') oneShot('prend', 0.05);
      if (e.type === 'seed-dissolve') oneShot('dissolve', 0.02);
    }
  }

  function setMuted(v) { muted = !!v; if (ctx) at(master.gain, muted ? 0 : 0.8, 0.4); }
  function suspend() { if (ctx && ctx.state === 'running') ctx.suspend(); }
  function resume() { if (ctx && ctx.state === 'suspended') ctx.resume(); }
  return { start, update, suspend, resume, setMuted, get muted() { return muted; }, get started() { return started; } };
}
