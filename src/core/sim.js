// Núcleo puro de Eternia: estado + reglas. Sin DOM, sin audio, sin Math.random.
// Unidades: posiciones en px CSS del campo, tiempos en segundos, definición/vitalidad 0…1.
import { PARAMS, PHI, breathCycle } from './params.js';
import { PHRASES, byFamily } from './phrases.js';
import { clamp, lerp, smooth, hueDiff, lerpHue, makeRng } from './math.js';

export const REGION = { CENTRO: 'centro', CALMA: 'calma', MEZCLA: 'mezcla', EXTREMO: 'extremo' };
export const ATT = { NONE: 'none', EGO: 'ego', AIR: 'air', PATTERN: 'pattern' };

export function region(def, p = PARAMS) {
  if (def < p.centerMax) return REGION.CENTRO;
  if (def < p.calmMax) return REGION.CALMA;
  if (def < p.mixMax) return REGION.MEZCLA;
  return REGION.EXTREMO;
}
export const sphereRadius = (s, p = PARAMS) =>
  s.view.short * lerp(p.radiusMin, p.radiusMax, clamp((s.def - p.centerMax) / (1 - p.centerMax)));
export const inertia = (def, p = PARAMS) => lerp(p.inertiaMin, p.inertiaMax, clamp((def - p.centerMax) / (1 - p.centerMax)));
export const bandWidth = (view, p = PARAMS) => view.short * p.edgeBand;
export const inBand = (view, x, y, p = PARAMS) => {
  const b = bandWidth(view, p);
  return x < b || y < b || x > view.w - b || y > view.h - b;
};
// Cuántas frases quiere el campo según la definición (~3-4 calma, ~8 mezcla, 15+ extremo)
export const targetThoughts = (def) => Math.round(3 + 14 * Math.pow(clamp(def), 1.4));
// Grado de lenguaje: 1 frases completas … 0 sin texto
export const legibility = (def) => smooth(0.05, 0.5, def);
// Tres pulsos (5, 7, 4) con periodos relacionados por φ: nunca cierran un ciclo común.
export const PULSE_PERIODS = [13, 13 * PHI, 13 / PHI];
export const pulsePhases = (t) => PARAMS.pulses.map((n, i) => ((t / PULSE_PERIODS[i]) % 1 + 1) % 1);

export function skinOf(s) {
  if (s.amb > 0.45) return 'moteada';
  if (s.tint < 0.25) return 'palida';
  return s.texture < 0 ? 'disonante' : 'cristal';
}
export const familyOfSphere = (s) => {
  if (s.tint < 0.25) return null;
  if (s.amb > 0.45) return 'ambigua';
  if (s.texture < -0.2) return 'disonante';
  if (s.texture > 0.2) return 'armonica';
  return null;
};

export function affinity(th, s, t = 0) {
  if (th.family === 'neutra') return 0.3;
  const hs = (h) => (1 + Math.cos((hueDiff(h, s.hue) * Math.PI) / 180)) / 2;
  let h = hs(th.hue);
  if (th.amb > 0) h = Math.max(h, hs(th.hue2 ?? th.hue)) * (0.6 + 0.4 * Math.sin(t * 1.7 + th.id)); // el imán oscila
  const tex = 1 - Math.abs(th.texture - s.texture) / 2;
  return clamp(lerp(0.35, h * tex, clamp(s.tint)));
}

export function createState({ w = 390, h = 844, seed = 1, lastHue = 210, lastTint = 0 } = {}, p = PARAMS) {
  const view = { w, h, short: Math.min(w, h) };
  return {
    t: 0, view, rng: makeRng(seed), nextId: 1,
    def: p.defInitial, vit: p.vitInitial,
    hue: lastHue, tint: Math.min(lastTint, p.reopenTintMax), texture: 0, amb: 0, ambHues: [20, 200],
    sphere: { x: w / 2, y: h * 0.52, vx: 0, vy: 0 },
    pointer: { down: false, x: 0, y: 0 },
    attention: ATT.NONE, attentionTime: 0,
    thoughts: [], spawnT: 0.5, spawnK: 0,
    fusion: null, // { id }
    stain: { hue: lastHue, amount: 0 },
    guide: { state: 'off', skin: 'disonante', textT: 0, sinceOffer: 0, acceptT: 0 },
    seed: { holdT: 0, active: false, def: 0, x: 0, y: 0 },
    breath: { t: 0, inhale: p.inhale, exhale: p.exhale, hold: 0, value: 0 },
    events: [],
  };
}

const emit = (s, type, data = {}) => s.events.push({ type, t: s.t, ...data });

function makeThought(s, phrase, x, y, vx, vy, depth, faint = false) {
  return {
    id: s.nextId++, text: phrase.text, family: phrase.family, hue: phrase.hue, hue2: phrase.hue2,
    texture: phrase.texture, symmetry: phrase.symmetry, activation: phrase.activation, amb: phrase.amb,
    x, y, vx, vy, depth, density: 0, contact: 0, fused: false, age: 0, life: 26 + s.rng() * 16,
    faint, seedRand: s.rng() * 1000 | 0,
  };
}

export function chooseFamily(s, r1, r2, p = PARAMS) {
  if (r1 < p.neutralShare) return { family: 'neutra', faint: false };
  const fam = familyOfSphere(s);
  if (s.def >= p.calmMax && fam) {
    const [a, b] = p.spawnMix; const r = r2;
    if (r < a) return { family: fam, faint: false };
    if (r < a + b) return { family: 'ambigua', faint: false };
    const other = fam === 'disonante' ? 'armonica' : fam === 'armonica' ? 'disonante' : (r2 > 0.95 ? 'armonica' : 'disonante');
    return { family: other, faint: true };
  }
  const fams = ['disonante', 'armonica', 'ambigua'];
  return { family: fams[Math.floor(r2 * 3) % 3], faint: false };
}

export function spawn(s, p = PARAMS) {
  const { family, faint } = chooseFamily(s, s.rng(), s.rng(), p);
  const onField = new Set(s.thoughts.map((t) => t.text));
  let pool = byFamily(family).filter((ph) => !onField.has(ph.text));
  if (!pool.length) pool = byFamily(family);
  const phrase = pool[Math.floor(s.rng() * pool.length) % pool.length];
  // Diluida: se sientan sobre el ángulo áureo. Definida: desde cualquier dirección.
  const ang = s.def < p.calmMax ? ((s.spawnK++ * p.goldenAngle) * Math.PI) / 180 : s.rng() * Math.PI * 2;
  const { w, h } = s.view; const b = bandWidth(s.view, p) * 0.6;
  const x = w / 2 + Math.cos(ang) * (w / 2 - b), y = h / 2 + Math.sin(ang) * (h / 2 - b);
  const dir = ang + Math.PI + (s.rng() - 0.5) * 1.0;
  const sp = 10 + s.rng() * 12;
  const th = makeThought(s, phrase, x, y, Math.cos(dir) * sp, Math.sin(dir) * sp, 0.55 + s.rng() * 0.45, faint);
  s.thoughts.push(th);
  return th;
}

function touching(s, th, r) {
  const hw = th.text.length * 3.4 * (0.7 + 0.3 * th.depth) + r * 0.6;
  return Math.abs(th.x - s.sphere.x) < hw && Math.abs(th.y - s.sphere.y) < r + 9;
}

function burst(s, th, p) {
  const cost = p.burst * th.activation;
  s.vit = clamp(s.vit - cost);
  emit(s, 'burst', { family: th.family, cost, id: th.id });
}

function inherit(s, th, dt, p) {
  const k = 1 - Math.exp(-p.inheritRate * dt);
  if (th.family === 'neutra') { th.hue = s.hue; s.tint = clamp(s.tint + 0.02 * dt); return; } // el matiz del momento la arrastra
  if (th.amb > 0) {
    s.amb = lerp(s.amb, 1, 1 - Math.exp(-p.ambInheritRate * dt));
    s.ambHues = [th.hue, th.hue2 ?? th.hue];
    s.hue = lerpHue(s.hue, th.hue, k * p.ambHueShare);
    s.texture = lerp(s.texture, th.texture, k * 0.5);
  } else {
    s.hue = lerpHue(s.hue, th.hue, k);
    s.texture = lerp(s.texture, th.texture, k);
    s.amb = lerp(s.amb, 0, k * 0.25); // una espiral pura limpia poco a poco el moteado
  }
  s.tint = lerp(s.tint, 1, k);
}

function updateAttention(s, input, p) {
  const prev = s.attention;
  const down = !!input?.down;
  if (down) { s.pointer.x = input.x; s.pointer.y = input.y; }
  s.pointer.down = down;
  let att = ATT.NONE;
  if (down) {
    if (inBand(s.view, input.x, input.y, p)) att = ATT.AIR; // el aire nunca se vuelve ego
    else if (s.def < p.centerMax) att = ATT.PATTERN;
    else att = ATT.EGO;
  }
  if (att !== prev) { s.attention = att; s.attentionTime = 0; emit(s, 'attention', { from: prev, to: att }); }
}

function stepBreath(s, dt, p) {
  const b = s.breath; b.t += dt;
  const total = b.inhale + b.hold + b.exhale;
  if (b.t >= total) {
    b.t -= total;
    // Nuevo ciclo: sin espiral (o con atención en el aire) vuelve al cauce 4,5 / 6,0.
    const spiral = s.attention === ATT.AIR ? 0 : smooth(p.calmMax, 0.9, s.def) * clamp(s.tint * 1.4);
    const rough = s.texture < 0;
    const jitter = rough ? (s.rng() - 0.5) * 0.8 * spiral : 0;
    b.inhale = lerp(p.inhale, rough ? 1.9 : 3.6, spiral) + jitter;
    b.hold = rough ? 0 : 0.9 * spiral; // el cristal se sostiene en lo alto
    b.exhale = lerp(p.exhale, rough ? 2.3 : 3.6, spiral) - jitter * 0.5;
    emit(s, 'breath-cycle');
  }
  const t = b.t;
  b.value = t < b.inhale ? 0.5 - 0.5 * Math.cos((Math.PI * t) / b.inhale)
    : t < b.inhale + b.hold ? 1
    : 0.5 + 0.5 * Math.cos((Math.PI * (t - b.inhale - b.hold)) / b.exhale);
}

function stepGuide(s, dt, p) {
  const g = s.guide;
  if (g.state === 'off') {
    if (s.vit <= 1e-6 && s.def > p.guideDef) {
      g.state = 'offered';
      g.skin = s.texture < 0 || (s.texture === 0 && hueDiff(s.hue, 0) < 25) ? 'disonante' : 'cristal';
      g.textT = p.guideTextHold; g.sinceOffer = 0; g.acceptT = 0;
      emit(s, 'guide-offer', { skin: g.skin });
    }
    return;
  }
  if (g.state === 'offered') {
    g.sinceOffer += dt; g.textT = Math.max(0, g.textT - dt);
    if (g.sinceOffer >= p.guideReoffer) { g.sinceOffer = 0; g.textT = p.guideTextHold; emit(s, 'guide-offer', { skin: g.skin, again: true }); }
    if (s.attention === ATT.AIR) {
      g.acceptT += dt;
      if (g.acceptT >= p.guideAcceptCycles * breathCycle(p)) { g.state = 'helping'; g.textT = 0; emit(s, 'guide-accept'); }
    } else if (g.acceptT > 0) {
      if (s.attention === ATT.EGO) emit(s, 'guide-cancel'); // agarrar una frase cancela; sin castigo extra
      g.acceptT = 0;
    }
    if (s.def < p.guideRelease) { g.state = 'off'; g.textT = 0; emit(s, 'guide-leave'); }
    return;
  }
  if (g.state === 'helping' && s.def < p.guideRelease) { g.state = 'off'; g.acceptT = 0; emit(s, 'guide-leave'); }
}

export const magnetMul = (s, p = PARAMS) => (s.guide.state === 'helping' ? p.guideMagnet : 1);

function stepSphere(s, dt, p) {
  const sp = s.sphere; const r = sphereRadius(s, p);
  if (s.attention === ATT.EGO) {
    const w = 3 / inertia(s.def, p); // la esfera grande obedece tarde
    const ax = (s.pointer.x - sp.x) * w * w - 2 * w * sp.vx;
    const ay = (s.pointer.y - sp.y) * w * w - 2 * w * sp.vy;
    sp.vx += ax * dt; sp.vy += ay * dt;
  } else {
    const f = Math.exp(-p.coastFriction * dt); sp.vx *= f; sp.vy *= f; // soltar: sigue con la inercia que traía
  }
  sp.x += sp.vx * dt; sp.y += sp.vy * dt;
  const b = bandWidth(s.view, p) * 0.5 + r;
  if (sp.x < b) { sp.x = b; sp.vx = Math.abs(sp.vx) * 0.3; }
  if (sp.x > s.view.w - b) { sp.x = s.view.w - b; sp.vx = -Math.abs(sp.vx) * 0.3; }
  if (sp.y < b) { sp.y = b; sp.vy = Math.abs(sp.vy) * 0.3; }
  if (sp.y > s.view.h - b) { sp.y = s.view.h - b; sp.vy = -Math.abs(sp.vy) * 0.3; }
}

function stepThoughts(s, dt, p, speed) {
  const r = sphereRadius(s, p); const hasSphere = s.def >= p.centerMax; const mm = magnetMul(s, p);
  const egoHeld = s.attention === ATT.EGO && hasSphere;
  for (const th of s.thoughts) {
    th.age += dt;
    if (th.fused) {
      // pegada a la esfera, cuerpo más pesado
      th.x = lerp(th.x, s.sphere.x, 1 - Math.exp(-6 * dt));
      th.y = lerp(th.y, s.sphere.y + r * 1.1, 1 - Math.exp(-6 * dt));
      th.density = clamp(th.density + p.fusionDensityGain * dt);
      continue;
    }
    th.density = clamp(th.density - p.densityDecay * dt);
    if (hasSphere) {
      const aff = affinity(th, s, s.t);
      const dx = s.sphere.x - th.x, dy = s.sphere.y - th.y; const d = Math.hypot(dx, dy) + 1e-3;
      const pull = aff * aff * s.def * mm;
      if (pull > 0.18 && d < s.view.short * 0.9) {
        // capturada: entra en la espiral. Gira alrededor de la esfera y se acerca despacio (más rápido si es densa).
        if (th.orbit == null) th.orbit = Math.max(d, r * 1.4 + 18 + (th.seedRand % 140));
        const floor = s.autoCd > 0 || s.def <= p.autoFuseDef ? r * 1.3 + 16 : r * 0.8; // espera su turno en el anillo
        th.orbit = Math.max(floor, th.orbit - (1.5 + 4 * pull) * (1 + th.density) * dt * speed);
        const ux = -dx / d, uy = -dy / d; // de la esfera hacia la frase
        const tx = -uy * (th.seedRand % 2 ? 1 : -1), ty = ux * (th.seedRand % 2 ? 1 : -1);
        const vr = (th.orbit - d) * 1.6, vt = (18 + 30 * pull) * Math.min(1, 140 / d);
        th.vx += ((ux * vr + tx * vt) - th.vx) * Math.min(1, 3 * dt);
        th.vy += ((uy * vr + ty * vt) - th.vy) * Math.min(1, 3 * dt);
      } else {
        th.orbit = null;
        const force = pull * 160 * (1 + th.density) / (1 + d / 260);
        th.vx += (dx / d) * force * dt * speed; th.vy += (dy / d) * force * dt * speed;
      }
    }
    const damp = Math.exp(-0.25 * dt); th.vx *= damp; th.vy *= damp;
    const v = Math.hypot(th.vx, th.vy); const vmax = 70;
    if (v > vmax) { th.vx *= vmax / v; th.vy *= vmax / v; }
    if (v < 6) { th.vx *= 6 / (v + 1e-3); th.vy *= 6 / (v + 1e-3); } // nunca se queda quieto: cruza
    th.x += th.vx * dt * speed; th.y += th.vy * dt * speed;
    if (th.orbit != null) { const hw = th.text.length * 3.4 + 4; th.x = clamp(th.x, hw, s.view.w - hw); } // la espiral no se sale de la pantalla

    // contacto: solo cuenta si la atención se queda en el ego (o si el ego ya es tan grande que «rozar ya funde»)
    const touch = hasSphere && touching(s, th, r);
    const auto = s.def > p.autoFuseDef && affinity(th, s, s.t) >= p.autoFuseAffinity;
    if (touch && (egoHeld || auto)) th.contact += dt; else th.contact = 0;
  }

  // separación (polish): las frases se apartan entre sí para no encimarse; el extremo se ve apiñado, no ilegible
  const free = s.thoughts.filter((t) => !t.fused);
  for (let i = 0; i < free.length; i++) for (let j = i + 1; j < free.length; j++) {
    const a = free[i], b = free[j];
    const hw = (a.text.length + b.text.length) * 3.3, dx = b.x - a.x, dy = b.y - a.y;
    if (Math.abs(dx) < hw && Math.abs(dy) < 18) {
      const push = (18 - Math.abs(dy)) * 2.2 * dt * speed * (dy >= 0 ? 1 : -1);
      a.y -= push; b.y += push;
    }
  }

  // fusión
  if (egoHeld && !s.fusion) {
    const cand = s.thoughts.filter((t) => t.contact >= p.fusionThreshold * (1 - 0.5 * t.density)).sort((a, b) => b.contact - a.contact)[0];
    if (cand) { s.fusion = { id: cand.id, family: cand.family }; cand.fused = true; burst(s, cand, p); emit(s, 'fuse', { id: cand.id, family: cand.family, text: cand.text }); }
  }
  if (s.fusion && s.attention !== ATT.EGO) endFusion(s);
  s.autoCd = Math.max(0, (s.autoCd || 0) - dt);
  const absorbed = [];
  if (hasSphere) for (const th of s.thoughts) {
    if (th.fused) continue;
    const sibling = s.fusion && th.family === s.fusion.family && th.contact > 0;
    const autoAbs = !s.fusion && th.contact >= p.fusionThreshold && s.def > p.autoFuseDef && s.autoCd <= 0;
    if (sibling || autoAbs) {
      burst(s, th, p); s.def = clamp(s.def + p.siblingDefBump); inherit(s, th, 0.6, p);
      absorbed.push(th.id); emit(s, 'absorb', { id: th.id, family: th.family, auto: autoAbs });
      if (autoAbs) s.autoCd = p.autoFuseCooldown;
    }
  }
  const { w, h } = s.view;
  s.thoughts = s.thoughts.filter((t) => !absorbed.includes(t.id) && (t.fused ||
    (t.age < t.life + 3 && t.x > -120 && t.x < w + 120 && t.y > -60 && t.y < h + 60)));
}

export function endFusion(s) {
  if (!s.fusion) return;
  const th = s.thoughts.find((t) => t.id === s.fusion.id);
  if (th) { th.fused = false; th.age = Math.min(th.age, th.life - 6); }
  emit(s, 'unfuse', { id: s.fusion.id });
  s.fusion = null;
}

function stepSeed(s, dt, p) {
  const sd = s.seed;
  if (s.attention === ATT.PATTERN) {
    sd.holdT += dt; sd.x = s.pointer.x; sd.y = s.pointer.y;
    if (sd.holdT >= p.seedHold) {
      if (!sd.active) { sd.active = true; sd.def = p.seedStart; emit(s, 'seed-start'); }
      sd.def += p.seedGain * dt;
      if (sd.def >= p.seedPrend) {
        // la semilla prende: condensa una forma teñida de lo que se agarró
        const ang = Math.atan2(sd.y - s.view.h * 0.48, sd.x - s.view.w / 2);
        s.def = p.seedPrend; s.hue = ((ang * 180) / Math.PI + 360) % 360; s.tint = 0.55; s.texture = 0; s.amb = 0;
        Object.assign(s.sphere, { x: sd.x, y: sd.y, vx: 0, vy: 0 });
        Object.assign(sd, { holdT: 0, active: false, def: 0 });
        s.attention = ATT.EGO; s.attentionTime = 0;
        emit(s, 'seed-prend', { hue: s.hue });
      }
    }
  } else if (sd.holdT > 0 || sd.active) {
    if (sd.active) emit(s, 'seed-dissolve'); // soltó antes de 0,15: la semilla se deshace, el centro sigue
    Object.assign(sd, { holdT: 0, active: false, def: 0 });
  }
}

/**
 * Avanza la simulación.
 * @param input {down:boolean,x:number,y:number} posición del único dedo (o null).
 * @param opts.speed velocidad del campo (0,5 con movimiento reducido). Las reglas no cambian.
 */
export function step(s, dt, input, opts = {}, p = PARAMS) {
  s.events = [];
  const speed = opts.speed ?? 1;
  let left = Math.min(dt, 0.25);
  while (left > 1e-9) {
    const h = Math.min(left, 1 / 60); left -= h;
    s.t += h;
    updateAttention(s, input, p);
    s.attentionTime += h;
    stepSeed(s, h, p);
    stepSphere(s, h, p);
    stepThoughts(s, h, p, speed);
    stepGuide(s, h, p);

    // definición y vitalidad
    const fused = !!s.fusion;
    const locked = s.guide.state === 'offered';
    if (fused) {
      s.def = clamp(s.def + p.fusionDefGain * h);
      const th = s.thoughts.find((t) => t.id === s.fusion.id);
      if (th) { inherit(s, th, h, p); s.vit = clamp(s.vit - p.fusionDrip * th.activation * h); }
    } else if (s.attention === ATT.AIR) {
      s.def = clamp(s.def - p.airDefDecay * (locked ? p.lockedAirFactor : 1) * h);
      s.vit = clamp(s.vit + p.airRecovery * h);
    } else if (s.attention !== ATT.EGO) {
      s.def = clamp(s.def - p.releaseDefDecay * (locked ? p.lockedAirFactor : 1) * h);
      s.vit = clamp(s.vit + p.restRecovery * h);
    } else {
      s.vit = clamp(s.vit + p.restRecovery * h); // sostener sin fundir: la atención quieta no engorda
    }
    if (s.def < p.centerMax) { s.tint = lerp(s.tint, 0, 1 - Math.exp(-0.3 * h)); s.amb = lerp(s.amb, 0, 1 - Math.exp(-0.3 * h)); s.texture = lerp(s.texture, 0, 1 - Math.exp(-0.3 * h)); }

    // imagen del fondo: aparece por quedarse
    if (fused) { const th = s.thoughts.find((t) => t.id === s.fusion.id); if (th) { s.stain.hue = th.hue; s.stain.amount = clamp(s.stain.amount + 0.22 * h); } }
    else s.stain.amount = clamp(s.stain.amount - 0.15 * h);

    // nacimiento de pensamientos (más rápido si la imagen del fondo se completa)
    s.spawnT -= h * speed * (1 + s.stain.amount);
    if (s.spawnT <= 0) {
      if (s.thoughts.filter((t) => !t.fused).length < targetThoughts(s.def)) spawn(s, p);
      s.spawnT = lerp(2.6, 0.35, s.def) * (0.7 + s.rng() * 0.6);
    }
    stepBreath(s, h, p);
  }
  return s.events;
}

/** Puebla el campo al abrir con las frases que corresponden a la definición, ya en camino. */
export function seedField(s, p = PARAMS) {
  const n = targetThoughts(s.def);
  for (let i = 0; i < n; i++) {
    const th = spawn(s, p);
    const k = 0.25 + s.rng() * 0.5; th.x = lerp(th.x, s.view.w / 2, k); th.y = lerp(th.y, s.view.h / 2, k); th.age = 2 + s.rng() * 8;
  }
}

/** Lo que se recuerda entre visitas: solo el color. */
export const memoryOf = (s) => ({ lastHue: Math.round(s.hue), lastTint: Math.round(clamp(s.tint) * 100) / 100 });
