// Banco de frases. Las 22 del PDF (docs/CONCEPTO.md) + 49 nuevas pedidas por Brooks el 2026-10-17.
// Cada frase tiene un TIPO (cómo se piensa) que decide su familia (cómo actúa en el campo) y la forma
// de su esfera contenedora (src/core/bubble.js). Atributos y criterio en docs/FRASES.md.
// hue: grados (0 rojo, 42 oro, 280 violeta). texture: −1 áspero … +1 liso. symmetry 0…1.
// activation 0,6…1,4 (multiplica el estallido). amb: 0…1 (dos cargas). hue2: segunda carga de las ambiguas.
export const FAMILIES = ['disonante', 'armonica', 'ambigua', 'neutra'];
// tipo → familia. Los tipos son los que nombró Brooks (preocupación, deseo, juicio, recuerdo, calma…).
export const KINDS = Object.freeze({
  preocupacion: 'disonante', juicio: 'disonante',
  deseo: 'armonica', orgullo: 'armonica', calma: 'armonica',
  recuerdo: 'ambigua', duda: 'ambigua',
  cotidiano: 'neutra',
});
const P = (text, kind, hue, texture, symmetry, activation, hue2 = null, pdf = false) => Object.freeze({
  text, kind, family: KINDS[kind], hue, texture, symmetry, activation,
  amb: KINDS[kind] === 'ambigua' ? 1 : 0, hue2, pdf,
});

export const PHRASES = Object.freeze([
  // ── preocupación (disonante): inestable, se adelanta al futuro ──
  P('otra vez igual', 'preocupacion', 356, -0.6, 0.25, 0.9, null, true),
  P('qué van a pensar', 'preocupacion', 0, -0.7, 0.2, 1.1, null, true),
  P('y si sale mal', 'preocupacion', 12, -0.6, 0.25, 1.2),
  P('no me va a alcanzar', 'preocupacion', 14, -0.55, 0.3, 1.1),
  P('qué tal si se enoja', 'preocupacion', 10, -0.6, 0.25, 1.0),
  P('no voy a llegar', 'preocupacion', 16, -0.65, 0.2, 1.3),
  P('algo se me está pasando', 'preocupacion', 18, -0.5, 0.3, 0.9),
  P('ya es muy tarde', 'preocupacion', 8, -0.6, 0.25, 1.0),
  P('y si me equivoqué', 'preocupacion', 12, -0.55, 0.3, 1.1),
  P('mañana va a ser peor', 'preocupacion', 6, -0.7, 0.2, 1.2),
  // ── juicio (disonante): áspero, roto, absoluto ──
  P('no vas a poder', 'juicio', 4, -0.8, 0.15, 1.2, null, true),
  P('mejor ni lo intentes', 'juicio', 350, -0.5, 0.3, 0.7, null, true),
  P('ya debería haber terminado', 'juicio', 8, -0.85, 0.1, 1.3, null, true),
  P('no es suficiente', 'juicio', 352, -0.75, 0.15, 1.0, null, true),
  P('siempre lo arruino', 'juicio', 354, -0.85, 0.1, 1.3),
  P('qué tonto fui', 'juicio', 358, -0.8, 0.15, 1.1),
  P('no sirvo para esto', 'juicio', 350, -0.9, 0.1, 1.2),
  P('ellos sí pueden', 'juicio', 346, -0.7, 0.2, 0.9),
  P('debí decir otra cosa', 'juicio', 2, -0.65, 0.2, 0.9),
  P('así nunca vas a cambiar', 'juicio', 348, -0.85, 0.1, 1.2),
  // ── deseo (armónica): quiere más, se estira hacia lo que quiere ──
  P('que no se acabe', 'deseo', 38, 0.8, 0.95, 1.3, null, true),
  P('merezco quedarme aquí', 'deseo', 42, 0.9, 1.0, 1.1, null, true),
  P('quiero más de esto', 'deseo', 36, 0.75, 0.9, 1.2),
  P('solo un poco más', 'deseo', 38, 0.7, 0.88, 1.0),
  P('si tuviera eso estaría bien', 'deseo', 34, 0.65, 0.86, 1.1),
  P('cuando llegue todo va a cambiar', 'deseo', 40, 0.7, 0.9, 1.2),
  P('que me vean así', 'deseo', 36, 0.8, 0.92, 1.3),
  P('quiero que dure', 'deseo', 38, 0.85, 0.95, 1.1),
  // ── orgullo (armónica): cristal facetado, demasiado simétrico ──
  P('esto sí soy', 'orgullo', 40, 0.85, 1.0, 1.2, null, true),
  P('esto es lo que soy', 'orgullo', 40, 0.95, 1.0, 1.4, null, true),
  P('lo hice perfecto', 'orgullo', 44, 0.9, 1.0, 1.3),
  P('yo sí lo entiendo', 'orgullo', 42, 0.85, 0.98, 1.1),
  P('nadie lo hace como yo', 'orgullo', 44, 0.95, 1.0, 1.4),
  P('por fin me salió', 'orgullo', 46, 0.8, 0.95, 1.2),
  P('ya lo logré', 'orgullo', 42, 0.85, 0.98, 1.3),
  // ── calma (armónica): la calma con dueño, lisa y quieta; también es un cristal ──
  P('qué bien se siente esto', 'calma', 44, 0.7, 0.9, 1.0, null, true),
  P('por fin estoy bien', 'calma', 46, 0.6, 0.85, 0.9, null, true),
  P('ya estoy en paz', 'calma', 50, 0.75, 0.92, 0.8),
  P('todo está en su lugar', 'calma', 48, 0.8, 0.95, 0.7),
  P('así quiero quedarme', 'calma', 46, 0.8, 0.95, 0.9),
  P('ya lo solté todo', 'calma', 52, 0.7, 0.9, 0.8),
  P('nada me falta', 'calma', 50, 0.85, 0.96, 0.7),
  P('esto es meditar bien', 'calma', 48, 0.9, 0.98, 1.0),
  // ── recuerdo (ambigua): dulce y perdido a la vez ──
  P('estaba mejor antes', 'recuerdo', 30, -0.2, 0.45, 0.9, 260, true),
  P('por fin terminó', 'recuerdo', 20, 0.1, 0.5, 0.8, 200, true),
  P('así olía la casa', 'recuerdo', 32, 0.1, 0.55, 0.7, 220),
  P('cuando éramos niños', 'recuerdo', 36, 0.15, 0.5, 0.8, 250),
  P('esa tarde en la playa', 'recuerdo', 28, 0.2, 0.55, 0.7, 195),
  P('lo que dijo al irse', 'recuerdo', 24, -0.25, 0.4, 1.0, 270),
  P('antes era más fácil', 'recuerdo', 30, -0.15, 0.45, 0.8, 230),
  P('ya no está', 'recuerdo', 26, -0.1, 0.45, 1.0, 215),
  P('esa canción otra vez', 'recuerdo', 34, 0.05, 0.5, 0.8, 300),
  // ── duda (ambigua): dos cargas que no se resuelven ──
  P('ojalá se quede', 'duda', 40, -0.1, 0.5, 1.0, 330, true),
  P('ya no importa', 'duda', 210, 0.0, 0.55, 0.6, 0, true),
  P('qué raro se siente', 'duda', 280, 0.0, 0.4, 0.8, 160, true),
  P('no sé si quiero', 'duda', 300, -0.15, 0.45, 0.9, 45, true),
  P('tal vez sí, tal vez no', 'duda', 290, 0.0, 0.4, 0.8, 40),
  P('y si era lo correcto', 'duda', 270, -0.1, 0.45, 0.9, 20),
  P('me alivia y me duele', 'duda', 200, 0.0, 0.5, 1.0, 350),
  P('quiero y no quiero', 'duda', 310, -0.05, 0.4, 0.9, 45),
  P('no sé qué siento', 'duda', 285, 0.0, 0.45, 0.8, 180),
  // ── cotidiano (neutra): casi neutras, para que el campo no sea solo una pelea ──
  P('el foco sigue prendido', 'cotidiano', 205, 0, 0.6, 0.6, null, true),
  P('mañana hay que salir', 'cotidiano', 200, 0, 0.6, 0.6, null, true),
  P('se me olvidó algo', 'cotidiano', 215, 0, 0.55, 0.7, null, true),
  P('qué hora será', 'cotidiano', 195, 0, 0.6, 0.6, null, true),
  P('hay que comprar pan', 'cotidiano', 205, 0, 0.6, 0.6),
  P('falta contestar ese mensaje', 'cotidiano', 210, 0, 0.55, 0.7),
  P('la ropa sigue en la lavadora', 'cotidiano', 200, 0, 0.6, 0.6),
  P('cerré la puerta', 'cotidiano', 212, 0, 0.55, 0.7),
  P('tengo sed', 'cotidiano', 198, 0, 0.6, 0.6),
  P('se va a acabar la batería', 'cotidiano', 208, 0, 0.55, 0.7),
]);

export const byFamily = (f) => PHRASES.filter((p) => p.family === f);
export const byKind = (k) => PHRASES.filter((p) => p.kind === k);
