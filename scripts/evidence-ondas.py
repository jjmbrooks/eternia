# Capturas del clima por nivel de ruido mental (docs/ONDAS-SENSORIAL.md) y del fondo de viaje. 390×844, DPR 2.
# Uso: npm run build && npx vite preview --port 4174 &  ;  python3 scripts/evidence-ondas.py [URL]
# ?debug=2 deja fijar la definición; la cámara llega sola a su zoom (se espera 12 s por nivel).
import sys, time, json
from pathlib import Path
from playwright.sync_api import sync_playwright
BASE = sys.argv[1] if len(sys.argv) > 1 else 'http://localhost:4174/eternia/'
OUT = Path(__file__).resolve().parent.parent / 'docs' / 'evidence' / 'ondas'; OUT.mkdir(parents=True, exist_ok=True)
W, H = 390, 844
errors = []; log = {}
LEVELS = [ # nombre, def, piel
    ('01-silencio', 0.02, ''), ('02-quietud', 0.14, ''), ('03-murmullo', 0.28, ''),
    ('04-parloteo', 0.5, ''), ('05-tormenta-disonante', 0.9, 's.tint = 1; s.texture = -0.85; s.hue = 4;'), ('06-tormenta-cristal', 0.9, 's.tint = 1; s.texture = 0.85; s.hue = 42;'),
]
with sync_playwright() as pw:
    b = pw.chromium.launch()
    def fresh(q='debug=2', rm=False):
        ctx = b.new_context(viewport={'width': W, 'height': H}, device_scale_factor=2, reduced_motion='reduce' if rm else 'no-preference')
        pg = ctx.new_page(); pg.on('pageerror', lambda e: errors.append(str(e))); pg.on('console', lambda m: m.type == 'error' and errors.append(m.text))
        pg.goto(f'{BASE}?{q}'); pg.wait_for_function('window.__eternia && window.__eterniaReady'); pg.mouse.click(W / 2, H * 0.62); time.sleep(0.3); return pg
    def info(pg): return pg.evaluate("() => { const s = window.__eternia.s, c = s._climate || {}; return { def: +s.def.toFixed(3), zoom: +s.cam.zoom.toFixed(3), nivel: c.level, polvo: +(c.dust||0).toFixed(2), estrellas: +(c.stars||0).toFixed(2), velocidad: +(c.speed||0).toFixed(2), destellos: +(c.flash||0).toFixed(2), orbes: +(c.orbs||0).toFixed(2), frases: s.thoughts.length }; }")
    def shot(pg, name): pg.screenshot(path=str(OUT / f'{name}.png')); log[name] = info(pg); print(name, log[name])
    for name, d, skin in LEVELS:
        pg = fresh()
        pg.evaluate("(js) => { const e = window.__eternia; e.afterStep = new Function('s', js); }", f"s.def = {d}; s.vit = 0.7; s.amb = 0; {skin}")
        time.sleep(12); shot(pg, name); pg.context.close()
    # viaje: la cámara avanza a ~380 px/s; el polvo cercano se estira, las estrellas lejanas casi no se mueven
    def travel(name, d, rm=False):
        pg = fresh(rm=rm)
        pg.evaluate("(d) => { const e = window.__eternia; e.afterStep = (s) => { s.def = d; s.vit = 0.7; s.cam.x += 380 / 60; s.cam.y -= 120 / 60; s.sphere.x = s.cam.x; s.sphere.y = s.cam.y; s.sphere.vx = 380; s.sphere.vy = -120; }; }", d)
        time.sleep(12); shot(pg, name); pg.context.close()
    travel('07-viaje-parloteo', 0.5); travel('08-viaje-quietud', 0.14); travel('09-viaje-movimiento-reducido', 0.5, rm=True)
    b.close()
log['errors'] = errors
(OUT / 'medidas.json').write_text(json.dumps(log, ensure_ascii=False, indent=1))
print('errores', errors)
