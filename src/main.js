import { levelOf } from './core/levels.js';
import { createState, step, memoryOf, region, screenRadius, seedField, toWorld, toScreen, layoutOf } from './core/sim.js';
import { createRenderer } from './render/renderer.js';
import { createAudio } from './audio/engine.js';
import { load, save } from './storage.js';
import { PHRASES } from './core/phrases.js';

const params = new URLSearchParams(location.search);
const DEBUG = params.get('debug');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches || params.get('rm') === '1';
const canvas = document.getElementById('field');
const renderer = createRenderer(canvas, { reducedMotion });
const audio = createAudio();
const mem = load();
// Sin sonido: tecla M (se recuerda en el aparato). Vibración suave y opcional: ?vibra=1 (se recuerda) / ?vibra=0.
if (params.get('vibra') === '1') mem.settings.vibra = true; if (params.get('vibra') === '0') mem.settings.vibra = false;
if (mem.settings.muted) audio.setMuted(true);
const canVibrate = typeof navigator.vibrate === 'function';
const vibrate = (pattern) => { if (mem.settings.vibra && canVibrate && !reducedMotion) try { navigator.vibrate(pattern); } catch { /* sin vibración */ } };
const view = () => ({ w: window.innerWidth, h: window.innerHeight });
let { w, h } = view();
const s = createState({ w, h, seed: (Date.now() % 100000) + 1, lastHue: mem.lastHue, lastTint: mem.lastTint });
seedField(s);
const ui = { entered: false, t0: 0, ripple: null, guideA: 0, hintA: 0 };
let input = null; let pointerId = null; let paused = false;

function fit() {
  ({ w, h } = view());
  s.view = { w, h, short: Math.min(w, h) };
  renderer.resize(w, h, window.devicePixelRatio || 1);
}
fit(); addEventListener('resize', fit);

// Un solo dedo. El primer toque abre el audio (requisito de iOS) y se vuelve una onda en el campo.
canvas.addEventListener('pointerdown', (e) => {
  if (pointerId !== null) return;
  e.preventDefault();
  if (!ui.entered) { enter(e.clientX, e.clientY); return; }
  pointerId = e.pointerId; canvas.setPointerCapture?.(e.pointerId);
  input = { down: true, x: e.clientX, y: e.clientY };
});
canvas.addEventListener('pointermove', (e) => { if (e.pointerId === pointerId) input = { down: true, x: e.clientX, y: e.clientY }; });
const up = (e) => { if (e.pointerId === pointerId) { pointerId = null; input = null; } };
canvas.addEventListener('pointerup', up); canvas.addEventListener('pointercancel', up);
canvas.addEventListener('contextmenu', (e) => e.preventDefault());

function enter(x, y) {
  ui.entered = true; ui.ripple = { x, y, t: clock }; audio.start();
  // onboard: el primer toque ya tiene efecto visible — la esfera se inclina hacia donde tocaste
  const sp = toScreen(s, s.sphere.x, s.sphere.y); const dx = x - sp.x, dy = y - sp.y, d = Math.hypot(dx, dy) || 1;
  s.sphere.vx += (dx / d) * Math.min(60, d * 0.4); s.sphere.vy += (dy / d) * Math.min(60, d * 0.4);
}

// Teclado (audit a11y): Intro/Espacio entra; mantener Espacio = posar la atención; flechas la mueven.
const kb = { x: 0, y: 0, held: false, dirs: new Set() };
canvas.addEventListener('keydown', (e) => {
  const k = e.key;
  if (k === 'm' || k === 'M') { audio.setMuted(!audio.muted); mem.settings.muted = audio.muted; remember(); voz.textContent = audio.muted ? 'sin sonido' : 'con sonido'; return; }
  const sp = toScreen(s, s.sphere.x, s.sphere.y);
  if (!ui.entered && (k === 'Enter' || k === ' ')) { e.preventDefault(); kb.x = sp.x; kb.y = sp.y; enter(kb.x, kb.y); return; }
  if (k === ' ') { e.preventDefault(); if (!kb.held) { kb.held = true; if (pointerId === null) { kb.x = s.def >= 0.08 ? sp.x : kb.x || w / 2; kb.y = s.def >= 0.08 ? sp.y : kb.y || h / 2; } } }
  if (k.startsWith('Arrow')) { e.preventDefault(); kb.dirs.add(k); }
  if (k === 'Escape') { kb.held = false; input = null; }
});
canvas.addEventListener('keyup', (e) => { if (e.key === ' ') { kb.held = false; if (pointerId === null) input = null; } kb.dirs.delete(e.key); });
canvas.addEventListener('blur', () => { kb.held = false; kb.dirs.clear(); if (pointerId === null) input = null; });
function keyboardInput(dt) {
  if (!kb.held || pointerId !== null) return;
  const v = 220 * dt;
  if (kb.dirs.has('ArrowLeft')) kb.x -= v; if (kb.dirs.has('ArrowRight')) kb.x += v;
  if (kb.dirs.has('ArrowUp')) kb.y -= v; if (kb.dirs.has('ArrowDown')) kb.y += v;
  kb.x = Math.max(2, Math.min(w - 2, kb.x)); kb.y = Math.max(2, Math.min(h - 2, kb.y));
  input = { down: true, x: kb.x, y: kb.y };
}

// La voz también llega a lectores de pantalla (región viva), con el mismo texto del borde.
const VOZ = { disonante: 'Esto te rebasó. No tienes que seguirlo.', cristal: 'Esto también te está usando. Lo bello no es la salida.' };
const voz = document.getElementById('voz');
function announce(events) {
  for (const e of events) {
    if (e.type === 'guide-offer') voz.textContent = VOZ[e.skin];
    if (e.type === 'burst') vibrate(10);                         // estallido: un toque mínimo
    if (e.type === 'breath-cycle' && s.attention === 'air') vibrate(14); // el aire: un pulso suave al empezar cada inhalación
  }
}

const remember = () => save(memoryOf(s), mem.settings);
addEventListener('pagehide', remember);
document.addEventListener('visibilitychange', () => {
  if (document.hidden) { remember(); audio.suspend(); paused = true; } else { audio.resume(); paused = false; last = performance.now(); }
});
setInterval(remember, 10000);

let last = performance.now(); let clock = 0;
const lerpMs = (a = 0, b) => a + (b - a) * 0.05;
const speed = reducedMotion ? 0.5 : 1;
function frame(now) {
  const dt = Math.min(0.1, (now - last) / 1000); last = now;
  if (!paused) {
    clock += dt * speed;
    // antes del primer toque el campo se mueve, pero la definición y la vitalidad esperan
    keyboardInput(dt);
    const keep = ui.entered ? null : [s.def, s.vit];
    const ev = step(s, dt, ui.entered ? input : null, { speed });
    if (keep) [s.def, s.vit] = keep;
    if (window.__eternia?.afterStep) window.__eternia.afterStep(s); // solo depuración (capturas)
    audio.update(s, ev, { guideText: s.guide.state === 'offered' && s.guide.textT > 0, reducedMotion }); announce(ev);
    const t0 = performance.now(); renderer.draw(s, ui, clock); ui.drawMs = lerpMs(ui.drawMs, performance.now() - t0);
    if (hud) hudUpdate();
  }
  requestAnimationFrame(frame);
}

// ?debug=1 → panel con definición / vitalidad / atención. ?debug=2 → solo ganchos (para capturas).
let hud = null;
function hudUpdate() {
  hud.textContent = `def ${s.def.toFixed(3)}  ${region(s.def)} · ${levelOf(s.def).name}\nvit ${s.vit.toFixed(3)}\natt ${s.attention} ${s.attentionTime.toFixed(1)}s\n` +
    `hue ${s.hue.toFixed(0)} tint ${s.tint.toFixed(2)} tex ${s.texture.toFixed(2)} amb ${s.amb.toFixed(2)}\n` +
    `frases ${s.thoughts.length}  fusión ${s.fusion ? s.fusion.kind : '—'}\nvoz ${s.guide.state} ${s.guide.acceptT.toFixed(1)}s  ⌀ ${(2 * screenRadius(s)).toFixed(0)}px\n` +
    `zoom ${s.cam.zoom.toFixed(2)}  cam ${s.cam.x.toFixed(0)},${s.cam.y.toFixed(0)}  ${audio.muted ? 'mudo' : ''}\n` +
    `aire ${s.breath.value.toFixed(2)} (${s.breath.inhale.toFixed(1)}/${s.breath.exhale.toFixed(1)})  rm ${reducedMotion}\ndibujo ${(ui.drawMs || 0).toFixed(1)} ms`;
}
if (DEBUG) {
  window.__eternia = { s, ui, setInput: (v) => { input = v; }, enter: () => { ui.entered = true; }, step: (dt, inp) => step(s, dt, inp), seedField: () => seedField(s),
    // put(): x, y en px de PANTALLA (se convierten a mundo con la cámara actual)
    put: (text, x, y, extra = {}) => { const ph = PHRASES.find((p) => p.text === text); const wp = toWorld(s, x, y); const th = { id: s.nextId++, ...ph, ...layoutOf(ph.text), x: wp.x, y: wp.y, vx: 0, vy: 0, depth: 1, density: 0, contact: 0, fused: false, age: 3, life: 60, faint: false, seedRand: s.nextId * 37, ...extra }; s.thoughts.push(th); return th.id; },
    toWorld: (x, y) => toWorld(s, x, y), diam: () => screenRadius(s), toScreen: (x, y) => toScreen(s, x, y) };
  if (DEBUG === '1') { hud = document.createElement('pre'); hud.id = 'hud'; document.body.appendChild(hud); }
}
// Espera a Spectral (precacheada) antes de dibujar texto: sin saltos de tipografía. Máximo 1,5 s.
const fontsReady = Promise.race([
  Promise.all(['200 40px Spectral', '300 16px Spectral', 'italic 300 16px Spectral', '500 16px Spectral'].map((f) => document.fonts.load(f))),
  new Promise((r) => setTimeout(r, 1500)),
]).catch(() => {});
fontsReady.then(() => requestAnimationFrame((t) => { last = t; ui.t0 = 0; window.__eterniaReady = true; requestAnimationFrame(frame); }));

if ('serviceWorker' in navigator && import.meta.env.PROD) navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`).catch(() => {});
