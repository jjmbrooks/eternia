// Render del campo en canvas 2D. Lee el estado del núcleo; nunca lo modifica.
import { PARAMS } from '../core/params.js';
import { screenRadius, bandWidth, legibility, affinity, skinOf, pulsePhases, toScreen } from '../core/sim.js';
import { outline } from '../core/bubble.js';
import { clamp, lerp, smooth } from '../core/math.js';

const TAU = Math.PI * 2;
// Tipografía (typeset, Impeccable): Spectral, serif hecha para pantalla, autoalojada (OFL). Roles en DESIGN.md.
const SERIF = '"Spectral", Georgia, "Times New Roman", serif';
export const TYPE = Object.freeze({
  title: { weight: 200, size: (w) => Math.min(52, Math.max(38, w * 0.115)), tracking: 0.32 },
  hint: { style: 'italic', weight: 300, size: 15, tracking: 0.08 },
  thought: { weight: 300, weightDense: 500, base: 15, lead: 18 }, // px a zoom 1; escalan con la cámara (ver DESIGN.md)
  guide: { style: 'italic', weight: 300, size: 15, lead: 21 },
});
const hsl = (h, s, l, a = 1) => `hsla(${h.toFixed(1)},${s.toFixed(1)}%,${l.toFixed(1)}%,${a.toFixed(3)})`;
const FAM_HUE = { disonante: 2, armonica: 42, ambigua: 285, neutra: 205 };
// hash determinista para detalles por frase/letra
const hash = (n) => { let x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };

export function createRenderer(canvas, { reducedMotion = false } = {}) {
  const g = canvas.getContext('2d');
  let W = 390, H = 844, D = 1;
  let grain = null, vignette = null;
  const stainCache = new Map();
  const dotCache = new Map();
  // optimize (Impeccable): un sprite por matiz en vez de cientos de gradientes por cuadro
  function dot(hue) {
    const key = Math.round(hue) % 360; if (dotCache.has(key)) return dotCache.get(key);
    const S = 48, c = document.createElement('canvas'); c.width = c.height = S; const x = c.getContext('2d');
    const gr = x.createRadialGradient(S / 2, S / 2, 0, S / 2, S / 2, S / 2);
    gr.addColorStop(0, hsl(key, 75, 72, 1)); gr.addColorStop(0.35, hsl(key, 75, 62, 0.45)); gr.addColorStop(1, hsl(key, 75, 55, 0));
    x.fillStyle = gr; x.fillRect(0, 0, S, S); dotCache.set(key, c); return c;
  }

  function makeGrain() {
    const c = document.createElement('canvas'); c.width = c.height = 256; const x = c.getContext('2d');
    const id = x.createImageData(256, 256);
    for (let i = 0; i < id.data.length; i += 4) { const v = Math.random() * 255; id.data[i] = id.data[i + 1] = id.data[i + 2] = v; id.data[i + 3] = 255; }
    x.putImageData(id, 0, 0); return c;
  }
  function makeVignette() {
    const c = document.createElement('canvas'); c.width = Math.ceil(W * D); c.height = Math.ceil(H * D); const x = c.getContext('2d');
    x.scale(D, D);
    const v = x.createRadialGradient(W / 2, H / 2, H * 0.28, W / 2, H / 2, H * 0.78);
    v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,0.6)'); x.fillStyle = v; x.fillRect(0, 0, W, H);
    return c;
  }
  // mancha abstracta de la familia (imagen del fondo): una vez por matiz, desenfocada fuera del bucle
  function stainSprite(hue, rough) {
    const key = `${Math.round(hue / 10)}-${rough ? 1 : 0}`;
    if (stainCache.has(key)) return stainCache.get(key);
    const S = 320, c = document.createElement('canvas'); c.width = c.height = S; const x = c.getContext('2d');
    x.filter = 'blur(22px)'; let seed = Math.round(hue) + (rough ? 99 : 7);
    const r = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
    for (let i = 0; i < 16; i++) {
      const ox = S / 2 + (r() - 0.5) * S * 0.45, oy = S / 2 + (r() - 0.5) * S * 0.45, rr = S * (0.1 + r() * 0.18);
      x.fillStyle = hsl(hue + (r() - 0.5) * 14, rough ? 75 : 60, 22 + r() * 18, 0.5 + r() * 0.4); x.beginPath();
      if (rough) { for (let k = 0; k < 11; k++) { const t = (k / 11) * TAU, q = rr * (0.45 + r() * 0.7); x.lineTo(ox + Math.cos(t) * q, oy + Math.sin(t) * q); } }
      else x.arc(ox, oy, rr, 0, TAU);
      x.fill();
    }
    stainCache.set(key, c); return c;
  }

  function resize(w, h, dpr) {
    W = w; H = h; D = Math.min(dpr || 1, 2);
    canvas.width = Math.round(W * D); canvas.height = Math.round(H * D);
    canvas.style.width = `${W}px`; canvas.style.height = `${H}px`;
    grain = grain || makeGrain(); vignette = makeVignette();
  }

  // ------- capas -------
  function background(s, t) {
    g.fillStyle = '#030307'; g.fillRect(0, 0, W, H);
    const k = clamp(s.tint) * (0.25 + 0.75 * s.def);
    const r = g.createRadialGradient(W / 2, H * 0.46, 0, W / 2, H * 0.46, H * 0.72);
    r.addColorStop(0, hsl(lerp(225, s.hue, clamp(s.tint)), lerp(30, 70, k), lerp(9, 14, k), 0.55));
    r.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = r; g.fillRect(0, 0, W, H);
    // el lienzo infinito: capas de motas y nieblas ancladas al MUNDO, con paralaje. Al alejarse la cámara
    // (menos ego) cabe más universo en la pantalla; al acercarse (más ego) se ve menos y más grande.
    const z = s.cam.zoom; const tintHue = lerp(220, s.hue, clamp(s.tint) * 0.6);
    // nieblas lejanas: celdas grandes; cada una puede tener una nube de color tenue (abstracta, sin paisaje)
    { const par = 0.35, C = 1100, zz = z * par + (1 - par) * 0.6; const cx = s.cam.x * par, cy = s.cam.y * par;
      const hw = W / 2 / zz, hh = H / 2 / zz; g.save(); g.globalCompositeOperation = 'lighter';
      for (let i = Math.floor((cx - hw) / C) - 1; i <= Math.floor((cx + hw) / C) + 1; i++) for (let j = Math.floor((cy - hh) / C) - 1; j <= Math.floor((cy + hh) / C) + 1; j++) {
        const hsh = hash(i * 73.1 + j * 19.7); if (hsh < 0.45) continue;
        const wx = (i + hash(i * 3.3 + j)) * C, wy = (j + hash(i + j * 5.1)) * C; const rr = C * (0.35 + 0.4 * hash(i * 9 + j * 2)) * zz;
        const sx = W / 2 + (wx - cx) * zz, sy = H / 2 + (wy - cy) * zz;
        if (sx < -rr || sx > W + rr || sy < -rr || sy > H + rr) continue;
        const hues = [2, 42, 285, 205, 175]; const hh2 = hues[Math.floor(hash(i * 1.7 + j * 8.3) * 5)];
        g.globalAlpha = 0.05 + 0.05 * hash(i + j * 11); g.drawImage(dot(hh2), sx - rr, sy - rr, rr * 2, rr * 2);
      }
      g.restore(); }
    // motas: tres profundidades
    for (const [par, C, n, base] of [[0.45, 260, 2, 0.5], [0.7, 200, 2, 0.8], [1, 170, 1, 1.1]]) {
      const zz = z * par + (1 - par) * 0.6; const cx = s.cam.x * par, cy = s.cam.y * par;
      const hw = W / 2 / zz, hh = H / 2 / zz; const i0 = Math.floor((cx - hw) / C), i1 = Math.floor((cx + hw) / C), j0 = Math.floor((cy - hh) / C), j1 = Math.floor((cy + hh) / C);
      if ((i1 - i0 + 1) * (j1 - j0 + 1) > 400) continue; // tope de costo
      for (let i = i0; i <= i1; i++) for (let j = j0; j <= j1; j++) for (let k = 0; k < n; k++) {
        const q = i * 131.7 + j * 71.3 + k * 17.1 + par * 1000;
        const wx = (i + hash(q)) * C + Math.sin(t * 0.05 + q) * 6, wy = (j + hash(q + 1.3)) * C + Math.cos(t * 0.04 + q) * 6;
        const sx = W / 2 + (wx - cx) * zz, sy = H / 2 + (wy - cy) * zz;
        if (sx < -4 || sx > W + 4 || sy < -4 || sy > H + 4) continue;
        g.fillStyle = hsl(tintHue, 40, 80, (0.1 + 0.25 * hash(q + 2.7)) * (0.6 + 0.4 * par));
        g.beginPath(); g.arc(sx, sy, (0.35 + hash(q + 4.1) * 0.9) * base * Math.sqrt(zz), 0, TAU); g.fill();
      }
    }
    if (s.stain.amount > 0.01) {
      const sp = stainSprite(s.stain.hue, s.texture < 0); const a = smooth(0, 1, s.stain.amount) * (s.amb > 0.3 ? 0.35 : 1);
      g.save(); g.globalAlpha = 0.5 * a; const sz = Math.min(W, H) * (0.9 + 0.5 * a);
      g.translate(W * 0.5 + Math.sin(t * 0.05) * 30, H * 0.42); g.rotate(t * 0.01);
      g.drawImage(sp, -sz / 2, -sz / 2, sz, sz); g.restore();
    }
  }

  function edge(s, t, ui) {
    const band = bandWidth(s.view);
    const airOn = s.attention === 'air';
    const helping = s.guide.state === 'helping';
    const extreme = smooth(0.6, 1, s.def);
    // la vitalidad es la luz y la amplitud del aire; el extremo oscurece y estrecha el borde
    const light = clamp((0.15 + 0.85 * s.vit) * (1 - 0.65 * extreme) + (airOn ? 0.35 : 0) + (helping ? 0.4 : 0));
    const wide = clamp((0.35 + 0.65 * s.vit) * (1 - 0.6 * extreme) + (airOn ? 0.25 : 0) + (helping ? 0.35 : 0));
    const b = s.breath.value;
    const w = band * (0.3 + 0.7 * wide) * (0.9 + 0.12 * b);
    // tono del marco: frío en calma, cálido/áspero con lo disonante, dorado con el cristal
    const toneHue = lerp(200, s.hue, clamp(s.tint) * smooth(0.3, 0.9, s.def));
    const col = (a) => hsl(toneHue, lerp(45, 60, extreme), lerp(72, 60, extreme), a);
    const sides = [[0, 0, w, 0, 0, 0, w, H], [W, 0, W - w, 0, W - w, 0, w, H], [0, 0, 0, w, 0, 0, W, w], [0, H, 0, H - w, 0, H - w, W, w]];
    for (const [x0, y0, x1, y1, rx, ry, rw, rh] of sides) {
      const l = g.createLinearGradient(x0, y0, x1, y1);
      l.addColorStop(0, col(0.34 * light)); l.addColorStop(0.55, col(0.08 * light)); l.addColorStop(1, col(0));
      g.fillStyle = l; g.fillRect(rx, ry, rw, rh);
    }
    // línea de respiración: el marco se expande y se contrae
    const inset = w * (0.62 - 0.22 * b);
    const amp = (1.2 + 6 * light * wide) * (0.4 + 0.6 * b);
    const rough = s.texture < 0 ? extreme * clamp(s.tint) : 0;
    g.save(); g.shadowColor = col(0.9); g.shadowBlur = 6 + 10 * light;
    const per = 2 * (W + H);
    for (let L = 0; L < 2; L++) {
      g.strokeStyle = col((0.1 + 0.4 * light) / (L + 1)); g.lineWidth = L ? 0.6 : 1.1; g.beginPath();
      for (let sx = 0; sx <= per; sx += 5) {
        let x, y, nx, ny;
        if (sx < W) { x = sx; y = inset; nx = 0; ny = 1; } else if (sx < W + H) { x = W - inset; y = sx - W; nx = -1; ny = 0; }
        else if (sx < 2 * W + H) { x = W - (sx - W - H); y = H - inset; nx = 0; ny = -1; } else { x = inset; y = H - (sx - 2 * W - H); nx = 1; ny = 0; }
        x = clamp(x, inset, W - inset); y = clamp(y, inset, H - inset);
        const o = Math.sin(sx / 41 + t * 0.6 + L * 1.7) * amp + Math.sin(sx / 97 - t * 0.3) * amp * 0.6 + (rough ? (hash(sx + Math.floor(t * 8)) - 0.5) * 4 * rough : 0);
        sx ? g.lineTo(x + nx * o, y + ny * o) : g.moveTo(x + nx * o, y + ny * o);
      }
      g.closePath(); g.stroke();
    }
    g.restore();
    // el pulso: un punto tenue, evidente solo con el campo quieto
    const quiet = 1 - smooth(0.15, 0.4, s.def);
    if (quiet > 0.02) {
      const beat = Math.pow(Math.max(0, Math.sin(t * TAU * 1.05)), 12);
      const px = W - inset, py = H * 0.5;
      const gr = g.createRadialGradient(px, py, 0, px, py, 7 + 4 * beat);
      gr.addColorStop(0, col(quiet * (0.25 + 0.5 * beat))); gr.addColorStop(1, col(0));
      g.fillStyle = gr; g.beginPath(); g.arc(px, py, 12, 0, TAU); g.fill();
    }
  }

  function thoughtText(line, seed, off, leg) {
    if (leg >= 0.999) return line;
    let out = '';
    for (let i = 0; i < line.length; i++) { const ch = line[i]; out += ch === ' ' || hash(seed + (i + off) * 13.7) < leg ? ch : '\u2009'; }
    return out;
  }

  // Cada pensamiento vive dentro de su esfera contenedora (forma por tipo: src/core/bubble.js).
  function bubblePath(th, x, y, R, t, toward) {
    g.beginPath(); const N = 44;
    for (let k = 0; k <= N; k++) { const a = (k / N) * TAU; const m = outline(th.kind, a, t, th.seedRand % 97, toward); const px = x + Math.cos(a) * R * m, py = y + Math.sin(a) * R * m; k ? g.lineTo(px, py) : g.moveTo(px, py); }
    g.closePath();
  }

  function thoughts(s, t, ui) {
    const leg = legibility(s.def);
    const hasSphere = s.def >= PARAMS.centerMax;
    const z = s.cam.zoom; const sp = toScreen(s, s.sphere.x, s.sphere.y);
    const gl = ui.guideA > 0.01 ? { x: W - bandWidth(s.view) * 0.3, y: H * 0.6 } : null;
    g.textAlign = 'center'; g.textBaseline = 'middle';
    for (const th of s.thoughts) {
      const { x, y } = toScreen(s, th.x, th.y);
      const R = th.r * z * lerp(0.28, 1, leg) * (th.fused ? 1.06 : 1);
      if (x < -R * 1.5 || x > W + R * 1.5 || y < -R * 1.5 || y > H + R * 1.5) continue;
      const life = smooth(0, 2.5, th.age) * (1 - smooth(th.life, th.life + 3, th.age));
      let a = life * (0.45 + 0.55 * th.depth);
      if (hasSphere && !th.fused) {
        const aff = affinity(th, s, t);
        a *= 1 - (1 - aff) * smooth(0.35, 1, s.def) * 0.9; // lo que no se parece se atenúa
      }
      if (th.faint) a *= 0.35;
      if (th.family === 'ambigua' && s.def > 0.45 && s.def < 0.75) a = Math.min(1, a * 1.25); // media alta: pesan más
      if (th.fused) a = 1;
      // la voz es distinta de los pensamientos: alrededor de su luz, las frases se retiran
      if (gl) { const gd = Math.hypot(x - gl.x, y - gl.y); a *= 1 - 0.8 * ui.guideA * (1 - smooth(90, 190, gd)); }
      if (a < 0.01) continue;
      const hue = th.family === 'neutra' ? lerp(205, s.hue, 0.2) : th.hue;
      const amb = th.family === 'ambigua'; const shimmerHue = (t * 30 + th.id * 40) % 360;
      const toward = Math.atan2(sp.y - y, sp.x - x);
      // ── la esfera contenedora: membrana tenue, no un recuadro ──
      bubblePath(th, x, y, R, t, toward);
      const sat = th.family === 'neutra' ? 18 : 70; const dens = th.density;
      const f = g.createRadialGradient(x - R * 0.3, y - R * 0.35, R * 0.1, x, y, R * 1.05);
      const hA = amb ? shimmerHue : hue;
      f.addColorStop(0, hsl(hA, sat, 70, (0.035 + 0.05 * dens) * a));
      f.addColorStop(0.75, hsl(hue, sat, 50, (0.07 + 0.08 * dens) * a));
      f.addColorStop(1, hsl(amb ? th.hue2 ?? hue : hue, sat, 62, (0.2 + 0.15 * dens) * a));
      g.fillStyle = f; g.fill();
      g.save();
      if (th.kind === 'recuerdo') { g.shadowColor = hsl(hue, 60, 70, 0.8 * a); g.shadowBlur = 12 * z; } // borde difuso
      g.strokeStyle = amb ? hsl((shimmerHue + 120) % 360, 70, 78, 0.4 * a) : hsl(hue, sat + 10, 76, (0.3 + 0.3 * dens) * a);
      g.lineWidth = th.kind === 'orgullo' ? 1.3 : th.kind === 'juicio' ? 0.9 : 1; g.stroke(); g.restore();
      if (th.kind === 'orgullo' && R > 12) { // facetas del cristal, apenas
        g.save(); g.strokeStyle = hsl(hue + 8, 100, 88, 0.12 * a); g.lineWidth = 0.6; g.beginPath();
        for (let k = 0; k < 10; k += 2) { const aa = (k / 10) * TAU + t * 0.05; g.moveTo(x, y); g.lineTo(x + Math.cos(aa) * R * 0.95, y + Math.sin(aa) * R * 0.95); }
        g.stroke(); g.restore();
      }
      // sin texto (centro o casi): el pensamiento cruza como color
      const moteA = a * (1 - leg);
      if (moteA > 0.02) {
        const r = R * 1.2; const gr = g.createRadialGradient(x, y, 0, x, y, r);
        const c = amb ? shimmerHue : hue;
        gr.addColorStop(0, hsl(c, 70, 66, 0.5 * moteA)); gr.addColorStop(1, hsl(c, 70, 50, 0));
        g.fillStyle = gr; g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill();
      }
      const ta = a * Math.sqrt(leg);
      if (ta < 0.02) continue;
      // ── la frase, en varias líneas, dentro de su esfera ──
      const size = TYPE.thought.base * z * (1 + 0.12 * dens) * (th.fused ? 1.06 : 1);
      if (size < 6) continue;
      const lh = TYPE.thought.lead * z * (1 + 0.12 * dens);
      const weight = dens > 0.3 ? TYPE.thought.weightDense : TYPE.thought.weight;
      g.font = `${weight} ${size.toFixed(1)}px ${SERIF}`; if ('letterSpacing' in g) g.letterSpacing = '0.01em';
      const L = th.lines.length; let off = 0;
      g.save(); g.shadowBlur = (6 + dens * 12) * Math.min(1, z);
      for (let li = 0; li < L; li++) {
        const ly = y + (li - (L - 1) / 2) * lh;
        const txt = thoughtText(th.lines[li], th.seedRand, off, Math.max(leg, th.fused ? 1 : 0)); off += th.lines[li].length + 1;
        if (th.family === 'disonante') {
          g.shadowColor = hsl(hue, 85, 45, 0.9 * ta); g.fillStyle = hsl(hue, 80, 66 + dens * 8, ta);
          // fragmento: letras partidas, asimetría
          const wTot = g.measureText(txt).width; let cx = x - wTot / 2; g.textAlign = 'left';
          for (let i = 0; i < txt.length; i++) {
            const ch = txt[i]; const cw = g.measureText(ch).width; const hz = hash(th.seedRand + (i + off) * 3.1);
            if (hz > 0.1 * smooth(0.6, 1, s.def) || th.fused) { // la frase se corta solo en la espiral
              const jit = (1 - dens * 0.6) * (th.kind === 'preocupacion' ? 0.7 : 1);
              const tremble = th.kind === 'preocupacion' ? Math.sin(t * 9 + i * 1.7) * 0.7 * z : 0;
              g.save(); g.translate(cx, ly + (hash(th.seedRand + i + off) - 0.5) * 4 * jit * z + tremble);
              g.rotate((hash(th.seedRand + (i + off) * 7) - 0.5) * 0.24 * jit); g.fillText(ch, 0, 0); g.restore();
            }
            cx += cw * (hz > 0.94 ? 1.4 : 1);
          }
          g.textAlign = 'center';
        } else if (th.family === 'armonica') {
          g.shadowColor = hsl(hue, 90, 55, 0.9 * ta); g.fillStyle = hsl(hue, 85, 74 + dens * 8, ta); g.fillText(txt, x, ly);
        } else if (amb) {
          const wTot = g.measureText(txt).width; const l = g.createLinearGradient(x - wTot / 2, 0, x + wTot / 2, 0);
          for (let k = 0; k < 4; k++) l.addColorStop(k / 3, hsl((shimmerHue + k * 85) % 360, 80, 80, ta));
          g.shadowColor = hsl((shimmerHue + 120) % 360, 70, 60, 0.8 * ta); g.fillStyle = l; g.fillText(txt, x, ly);
        } else {
          g.shadowColor = hsl(hue, 30, 70, 0.6 * ta); g.fillStyle = hsl(hue, 18, 80, ta * 0.9); g.fillText(txt, x, ly);
        }
      }
      g.restore();
    }
  }

  function sphere(s, t) {
    const vis = smooth(0.06, 0.1, s.def);
    if (vis < 0.01) return;
    const { x, y } = toScreen(s, s.sphere.x, s.sphere.y); const r = screenRadius(s) * (0.6 + 0.4 * vis);
    const tint = clamp(s.tint); const skin = skinOf(s);
    const rough = s.texture < 0 ? clamp(-s.texture) * tint : 0;
    const smoothK = s.texture > 0 ? clamp(s.texture) * tint : 0;
    const base = (l, a) => hsl(s.hue, lerp(20, 82, tint) * (1 - 0.8 * clamp(s.amb)), l, a);
    g.save(); g.globalAlpha = vis;
    const glowR = r * (2.6 + s.def);
    const gl = g.createRadialGradient(x, y, r * 0.4, x, y, glowR);
    gl.addColorStop(0, base(60, 0.12 + 0.3 * s.def)); gl.addColorStop(1, base(40, 0));
    g.fillStyle = gl; g.beginPath(); g.arc(x, y, glowR, 0, TAU); g.fill();
    // contorno: liso → áspero (dentado) o facetado (simétrico)
    g.beginPath();
    const N = 60;
    if (smoothK > 0.35) {
      const sides = 12; for (let k = 0; k < sides; k++) { const a = (k / sides) * TAU - Math.PI / 2 + t * 0.03; g.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r); }
    } else {
      for (let k = 0; k < N; k++) {
        const a = (k / N) * TAU; const j = rough * 0.28 * (hash(k * 2.3 + Math.floor(t * 2) * 0.01) - 0.5) * 2 * s.def;
        const wob = Math.sin(a * 3 + t * 0.8) * 0.02;
        g.lineTo(x + Math.cos(a) * r * (1 + j + wob), y + Math.sin(a) * r * (1 + j + wob));
      }
    }
    g.closePath();
    const f = g.createRadialGradient(x - r * 0.35, y - r * 0.4, r * 0.05, x, y, r);
    const alpha = lerp(0.35, 1, smooth(0.08, 0.5, s.def) * (0.4 + 0.6 * tint));
    if (skin === 'palida') { f.addColorStop(0, hsl(225, 60, 94, 0.6)); f.addColorStop(0.7, hsl(222, 45, 75, 0.2)); f.addColorStop(1, hsl(222, 45, 70, 0.07)); }
    else if (skin === 'disonante') { f.addColorStop(0, base(68, alpha)); f.addColorStop(0.45, hsl(s.hue, 78, 34, alpha)); f.addColorStop(1, hsl(s.hue, 80, 7, alpha)); }
    else if (skin === 'cristal') { f.addColorStop(0, hsl(s.hue + 8, 100, 92, alpha)); f.addColorStop(0.5, base(62, alpha)); f.addColorStop(1, hsl(s.hue - 6, 72, 28, alpha)); }
    else { f.addColorStop(0, hsl(s.hue, 10, 92, alpha)); f.addColorStop(0.6, hsl(s.hue, 10, 66, alpha * 0.8)); f.addColorStop(1, hsl(s.hue, 10, 28, alpha * 0.7)); } // moteada: nácar, sin bando
    g.shadowColor = base(55, 0.8); g.shadowBlur = 18; g.fillStyle = f; g.fill(); g.shadowBlur = 0;
    g.save(); g.clip();
    if (smoothK > 0.35) {
      g.strokeStyle = hsl(s.hue + 10, 100, 90, 0.45 * smoothK); g.lineWidth = 0.8;
      for (let k = 0; k < 12; k++) {
        const a = (k / 12) * TAU - Math.PI / 2 + t * 0.03, a2 = a + TAU / 12;
        g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r); g.stroke();
        g.beginPath(); g.moveTo(x + Math.cos(a) * r * 0.55, y + Math.sin(a) * r * 0.55); g.lineTo(x + Math.cos(a2) * r * 0.55, y + Math.sin(a2) * r * 0.55); g.stroke();
      }
    }
    if (rough > 0.3) {
      for (let i = 0; i < 26; i++) {
        g.fillStyle = `rgba(0,0,0,${(0.15 + hash(i) * 0.35) * rough})`; g.beginPath();
        const px = x + (hash(i + 1) - 0.5) * 2 * r, py = y + (hash(i + 2) - 0.5) * 2 * r;
        g.moveTo(px, py); g.lineTo(px + (hash(i + 3) - 0.5) * r * 0.6, py + (hash(i + 4) - 0.5) * r * 0.6); g.lineTo(px + (hash(i + 5) - 0.5) * r * 0.5, py + (hash(i + 6) - 0.5) * r * 0.5); g.fill();
      }
      g.strokeStyle = hsl(s.hue + 10, 90, 70, 0.3 * rough); g.lineWidth = 0.6;
      for (let i = 0; i < 6; i++) { g.beginPath(); let px = x + (hash(i + 20) - 0.5) * r, py = y + (hash(i + 21) - 0.5) * r; g.moveTo(px, py); for (let j = 0; j < 4; j++) { px += (hash(i * 7 + j) - 0.5) * r * 0.5; py += (hash(i * 9 + j) - 0.5) * r * 0.5; g.lineTo(px, py); } g.stroke(); }
    }
    if (s.amb > 0.05) {
      // moteada: manchas de las dos cargas, que se mueven despacio
      const hues = [s.ambHues[0], s.ambHues[1], s.hue, (s.ambHues[0] + s.ambHues[1]) / 2];
      for (let i = 0; i < 22; i++) {
        const a = hash(i) * TAU + t * 0.15 * (i % 2 ? 1 : -1), d = r * 0.85 * Math.sqrt(hash(i + 4));
        const px = x + Math.cos(a) * d, py = y + Math.sin(a) * d, rr = r * (0.14 + hash(i + 8) * 0.22);
        const gr = g.createRadialGradient(px, py, 0, px, py, rr);
        gr.addColorStop(0, hsl(hues[i % 4], 75, 66, 0.6 * s.amb)); gr.addColorStop(1, hsl(hues[i % 4], 75, 60, 0));
        g.fillStyle = gr; g.beginPath(); g.arc(px, py, rr, 0, TAU); g.fill();
      }
    }
    g.restore();
    const hx = x - r * 0.4, hy = y - r * 0.45; const hgl = g.createRadialGradient(hx, hy, 0, hx, hy, r * 0.5);
    hgl.addColorStop(0, 'rgba(255,255,255,0.5)'); hgl.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = hgl;
    g.beginPath(); g.arc(hx, hy, r * 0.5, 0, TAU); g.fill();
    g.restore();
  }

  // patrón del centro: filotaxis a 137,5° + tres pulsos (5, 7, 4) con periodos en razón φ
  function center(s, t) {
    const c = 1 - smooth(0.03, 0.2, s.def); // asoma cuando las palabras se retiran; completo en el centro
    if (c < 0.01) return;
    const an = toScreen(s, s.anchor.x, s.anchor.y); const cx = an.x, cy = an.y; const R = Math.min(W, H) * 0.42;
    const ph = pulsePhases(t); const n = PARAMS.pulses;
    const hues = [2, 42, 285, 175, 205];
    // tres órbitas lentas
    for (let k = 0; k < 3; k++) {
      const rot = ph[k] * TAU; const a = R * [0.92, 0.74, 0.58][k], b = R * [0.6, 0.98, 0.8][k];
      g.save(); g.translate(cx, cy); g.rotate(rot * 0.25 + k * 2.1);
      g.strokeStyle = hsl(hues[k], 60, 70, 0.07 * c); g.lineWidth = 1; g.beginPath(); g.ellipse(0, 0, a, b, 0, 0, TAU); g.stroke();
      for (let i = 0; i < n[k]; i++) {
        const tt = (i / n[k]) * TAU + rot; const px = Math.cos(tt) * a, py = Math.sin(tt) * b;
        g.globalAlpha = 0.8 * c; g.drawImage(dot(hues[k]), px - 9, py - 9, 18, 18); g.globalAlpha = 1;
      }
      g.restore();
    }
    // filotaxis
    const count = Math.round(lerp(60, 420, c));
    const spin = t * 0.012; const step = Math.sqrt((R * R) / 420);
    g.save(); g.globalCompositeOperation = 'lighter';
    for (let i = 1; i < count; i++) {
      const ang = i * (PARAMS.goldenAngle * Math.PI / 180) + spin; const rr = step * Math.sqrt(i);
      const x = cx + Math.cos(ang) * rr, y = cy + Math.sin(ang) * rr;
      const grp = i % 3; const wave = Math.pow(0.5 + 0.5 * Math.cos(TAU * (ph[grp] * n[grp] - (rr / R) * 1.5)), 6);
      const h = hues[Math.floor(hash(i) * 5)];
      const sz = (0.7 + 1.5 * (1 - rr / R)) * (1 + 0.8 * wave);
      const a = c * (0.25 + 0.6 * wave) * (1 - (rr / R) * 0.5);
      g.globalAlpha = Math.min(1, a); const d = sz * 6; g.drawImage(dot(h), x - d / 2, y - d / 2, d, d);
    }
    g.restore();
  }

  function seedAndHalo(s, t) {
    const p = s.pointer; if (!p.down) return;
    if (s.attention === 'pattern') {
      const hold = clamp(s.seed.holdT / PARAMS.seedHold); const sd = s.seed.active ? clamp((s.seed.def - PARAMS.seedStart) / (PARAMS.seedPrend - PARAMS.seedStart)) : 0;
      const an = toScreen(s, s.anchor.x, s.anchor.y);
      const r = 4 + 10 * sd + 3 * hold; const ang = Math.atan2(p.y - an.y, p.x - an.x) * 180 / Math.PI;
      const gr = g.createRadialGradient(p.x, p.y, 0, p.x, p.y, r * 3);
      gr.addColorStop(0, hsl(ang, 70, 80, 0.15 + 0.6 * sd)); gr.addColorStop(1, hsl(ang, 70, 60, 0));
      g.fillStyle = gr; g.beginPath(); g.arc(p.x, p.y, r * 3, 0, TAU); g.fill();
    }
    if (s.guide.state !== 'off' && s.attention === 'ego') return;
    // el toque: solo un halo suave
    const r = s.attention === 'air' ? 40 : 34;
    const a = s.attention === 'air' ? 0.6 : 0.45;
    const h = g.createRadialGradient(p.x, p.y, 0, p.x, p.y, r);
    h.addColorStop(0, `rgba(255,255,255,${a * 0.22})`); h.addColorStop(0.55, `rgba(255,255,255,${a * 0.1})`);
    h.addColorStop(0.82, `rgba(255,255,255,${a * 0.28})`); h.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = h; g.beginPath(); g.arc(p.x, p.y, r, 0, TAU); g.fill();
  }

  const GUIDE_TEXT = { disonante: ['Esto te rebasó.', 'No tienes que seguirlo.'], cristal: ['Esto también te está usando.', 'Lo bello no es la salida.'] };
  function guide(s, t, ui) {
    const gs = s.guide; ui.guideA = lerp(ui.guideA || 0, gs.state === 'off' ? 0 : 1, 0.04);
    const A = ui.guideA; if (A < 0.01) return;
    const band = bandWidth(s.view); const gx = W - band * 0.3, gy = H * 0.6;
    const b = s.breath.value; const helping = gs.state === 'helping';
    const acc = clamp(gs.acceptT / (3 * (PARAMS.inhale + PARAMS.exhale)));
    const cool = gs.skin === 'cristal' ? 205 : 195;
    g.save(); g.globalCompositeOperation = 'lighter';
    const lr = 120 + 40 * b + 60 * acc;
    const l = g.createRadialGradient(gx, gy, 0, gx, gy, lr);
    l.addColorStop(0, hsl(cool, 70, 88, (0.4 + 0.2 * b + 0.2 * acc) * A)); l.addColorStop(0.3, hsl(cool, 70, 70, 0.14 * A)); l.addColorStop(1, hsl(cool, 70, 60, 0));
    g.fillStyle = l; g.fillRect(gx - lr, gy - lr, lr * 2, lr * 2);
    const len = 130 + 50 * b + (helping ? 200 : 0);
    const v = g.createLinearGradient(0, gy - len, 0, gy + len);
    v.addColorStop(0, hsl(cool, 80, 92, 0)); v.addColorStop(0.5, hsl(cool, 80, 94, 0.9 * A)); v.addColorStop(1, hsl(cool, 80, 92, 0));
    g.fillStyle = v; g.fillRect(gx - 1.5, gy - len, 3, len * 2);
    g.restore();
    const ta = A * smooth(0, 2.5, gs.textT) * (gs.state === 'offered' ? 1 : 0);
    if (ta > 0.01) {
      const [a1, a2] = GUIDE_TEXT[gs.skin];
      g.save(); g.font = `italic ${TYPE.guide.weight} ${TYPE.guide.size}px ${SERIF}`; g.textAlign = 'right'; g.textBaseline = 'middle';
      g.fillStyle = hsl(cool, 60, 92, 0.9 * ta); g.shadowColor = hsl(cool, 80, 70, 0.9 * ta); g.shadowBlur = 8;
      g.fillText(a1, gx - 16, gy - TYPE.guide.lead / 2); g.fillText(a2, gx - 16, gy + TYPE.guide.lead / 2); g.restore();
    }
  }

  function title(t, ui) {
    // el nombre aparece y se va; «toca para entrar» queda tenue hasta el primer toque
    const tt = t - (ui.t0 || 0);
    if (ui.entered && ui.enteredAt === undefined) ui.enteredAt = tt;
    const outAt = ui.entered ? Math.min(4.5, ui.enteredAt + 0.3) : 4.5;
    const a = smooth(0.2, 1.8, tt) * (1 - smooth(outAt, outAt + 2.2, tt));
    if (a > 0.005) {
      const ts = TYPE.title.size(W);
      g.save(); g.font = `${TYPE.title.weight} ${ts.toFixed(1)}px ${SERIF}`; g.textAlign = 'center'; g.textBaseline = 'middle';
      if ('letterSpacing' in g) g.letterSpacing = `${(ts * TYPE.title.tracking).toFixed(1)}px`;
      g.fillStyle = `rgba(235,232,255,${0.7 * a})`; g.shadowColor = 'rgba(190,200,255,0.8)'; g.shadowBlur = 24;
      g.fillText('Eternia', W / 2 + ts * TYPE.title.tracking / 2, H * 0.36); g.restore();
    }
    ui.hintA = lerp(ui.hintA || 0, ui.entered ? 0 : smooth(1.6, 3.5, tt), 0.05);
    if (ui.hintA > 0.005) {
      g.save(); g.font = `italic ${TYPE.hint.weight} ${TYPE.hint.size}px ${SERIF}`; g.textAlign = 'center'; g.textBaseline = 'middle';
      if ('letterSpacing' in g) g.letterSpacing = `${TYPE.hint.size * TYPE.hint.tracking}px`;
      const br = 0.85 + 0.15 * Math.sin(t * 0.7); // respira, sin bajar del contraste legible
      g.fillStyle = `rgba(214,218,240,${0.62 * ui.hintA * br})`; g.fillText('toca para entrar', W / 2 + TYPE.hint.size * TYPE.hint.tracking / 2, H * 0.36 + TYPE.title.size(W) * 0.95); g.restore();
    }
    if (ui.ripple) {
      const k = (t - ui.ripple.t) / 2.4; if (k > 1) ui.ripple = null; else {
        const r = 10 + k * 160; g.save(); g.strokeStyle = `rgba(210,220,255,${0.35 * (1 - k)})`; g.lineWidth = 1.2; g.shadowColor = 'rgba(200,210,255,.8)'; g.shadowBlur = 10;
        g.beginPath(); g.arc(ui.ripple.x, ui.ripple.y, r, 0, TAU); g.stroke(); g.restore();
      }
    }
  }

  function finish(t) {
    g.save(); g.globalAlpha = reducedMotion ? 0.03 : 0.055; g.globalCompositeOperation = 'overlay';
    const ox = Math.floor(Math.random() * 256), oy = Math.floor(Math.random() * 256);
    g.setTransform(1, 0, 0, 1, 0, 0);
    for (let y = -oy; y < canvas.height; y += 256) for (let x = -ox; x < canvas.width; x += 256) g.drawImage(grain, x, y);
    g.restore();
    g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.drawImage(vignette, 0, 0); g.restore();
  }

  function draw(s, ui, t) {
    g.setTransform(D, 0, 0, D, 0, 0);
    background(s, t); center(s, t); edge(s, t, ui); thoughts(s, t, ui); sphere(s, t); guide(s, t, ui); seedAndHalo(s, t); title(t, ui);
    finish(t);
  }
  return { resize, draw };
}
