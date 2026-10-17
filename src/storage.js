// Persistencia SOLO en el dispositivo (localStorage). Se guarda el último matiz y los ajustes. Nada sale del teléfono.
const KEY = 'eternia.v1';
export function load() {
  try { const v = JSON.parse(localStorage.getItem(KEY) || '{}'); return { lastHue: Number.isFinite(v.lastHue) ? v.lastHue : 210, lastTint: Number.isFinite(v.lastTint) ? v.lastTint : 0, settings: v.settings || {} }; }
  catch { return { lastHue: 210, lastTint: 0, settings: {} }; }
}
export function save(memory, settings = {}) {
  try { localStorage.setItem(KEY, JSON.stringify({ ...memory, settings })); } catch { /* modo privado: no pasa nada */ }
}
