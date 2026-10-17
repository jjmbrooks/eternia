// Banco de la primera versión (docs/CONCEPTO.md). Atributos asignados en docs/FRASES.md.
// hue: grados (0 rojo, 42 oro, 280 violeta). texture: −1 áspero … +1 liso. symmetry 0…1.
// activation 0,6…1,4 (multiplica el estallido). amb: 0…1 (dos cargas). hue2: segunda carga de las ambiguas.
export const FAMILIES = ['disonante', 'armonica', 'ambigua', 'neutra'];
const P = (text, family, hue, texture, symmetry, activation, amb = 0, hue2 = null) =>
  Object.freeze({ text, family, hue, texture, symmetry, activation, amb, hue2 });

export const PHRASES = Object.freeze([
  P('otra vez igual', 'disonante', 356, -0.6, 0.25, 0.9),
  P('no vas a poder', 'disonante', 4, -0.8, 0.15, 1.2),
  P('mejor ni lo intentes', 'disonante', 350, -0.5, 0.3, 0.7),
  P('ya debería haber terminado', 'disonante', 8, -0.85, 0.1, 1.3),
  P('qué van a pensar', 'disonante', 0, -0.7, 0.2, 1.1),
  P('no es suficiente', 'disonante', 352, -0.75, 0.15, 1.0),

  P('qué bien se siente esto', 'armonica', 44, 0.7, 0.9, 1.0),
  P('esto sí soy', 'armonica', 40, 0.85, 1.0, 1.2),
  P('que no se acabe', 'armonica', 38, 0.8, 0.95, 1.3),
  P('por fin estoy bien', 'armonica', 46, 0.6, 0.85, 0.9),
  P('merezco quedarme aquí', 'armonica', 42, 0.9, 1.0, 1.1),
  P('esto es lo que soy', 'armonica', 40, 0.95, 1.0, 1.4),

  P('por fin terminó', 'ambigua', 20, 0.1, 0.5, 0.8, 1, 200),
  P('ojalá se quede', 'ambigua', 40, -0.1, 0.5, 1.0, 1, 330),
  P('ya no importa', 'ambigua', 210, 0.0, 0.55, 0.6, 1, 0),
  P('estaba mejor antes', 'ambigua', 30, -0.2, 0.45, 0.9, 1, 260),
  P('qué raro se siente', 'ambigua', 280, 0.0, 0.4, 0.8, 1, 160),
  P('no sé si quiero', 'ambigua', 300, -0.15, 0.45, 0.9, 1, 45),

  P('el foco sigue prendido', 'neutra', 205, 0, 0.6, 0.6),
  P('mañana hay que salir', 'neutra', 200, 0, 0.6, 0.6),
  P('se me olvidó algo', 'neutra', 215, 0, 0.55, 0.7),
  P('qué hora será', 'neutra', 195, 0, 0.6, 0.6),
]);

export const byFamily = (f) => PHRASES.filter((p) => p.family === f);
