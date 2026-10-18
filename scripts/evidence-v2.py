# Capturas de la v2 (escala, cámara, pensamientos en esferas). 390×844, DPR 2.
# Uso: npm run build && npx vite preview --port 4173 &  ;  python3 scripts/evidence-v2.py [URL]
# Para no esperar los tiempos lentos de transición, ?debug=2 deja fijar la definición y el zoom de la cámara.
import sys, time, json
from pathlib import Path
from playwright.sync_api import sync_playwright
BASE = sys.argv[1] if len(sys.argv) > 1 else 'http://localhost:4173/eternia/'
OUT = Path(__file__).resolve().parent.parent / 'docs' / 'evidence' / 'v2'; OUT.mkdir(parents=True, exist_ok=True)
W, H = 390, 844
errors = []

def pin(pg, js):
    pg.evaluate(f"() => {{ const e = window.__eternia, s = e.s; clearInterval(window.__pin); window.__pin = setInterval(() => {{ {js} }}, 16); {js} }}")
def unpin(pg): pg.evaluate("() => clearInterval(window.__pin)")
def info(pg): return pg.evaluate("() => { const s = window.__eternia.s; return { def: +s.def.toFixed(3), zoom: +s.cam.zoom.toFixed(3), diam: Math.round(2 * window.__eternia.diam()), frases: s.thoughts.length, cam: [Math.round(s.cam.x), Math.round(s.cam.y)] }; }")

with sync_playwright() as pw:
    b = pw.chromium.launch()
    def fresh(q='debug=2'):
        pg = b.new_page(viewport={'width': W, 'height': H}, device_scale_factor=2)
        pg.on('pageerror', lambda e: errors.append(str(e))); pg.on('console', lambda m: m.type == 'error' and errors.append(m.text))
        pg.goto(f'{BASE}?{q}'); pg.wait_for_function('window.__eternia && window.__eterniaReady'); return pg
    log = {}
    def shot(pg, name): pg.screenshot(path=str(OUT / name)); log[name] = info(pg); print(name, log[name])

    # 1 · estado inicial real: nivel intermedio (definición 0,45, zoom 1), sin fijar nada
    pg = fresh(); time.sleep(2.2); shot(pg, '01-apertura.png')
    pg.mouse.click(W / 2, H * 0.62); time.sleep(4); shot(pg, '02-inicio-intermedio.png')
    # 3 · viaje por el lienzo infinito: el dedo arriba a la izquierda, sostenido 6 s (esfera visible arriba del dedo)
    pg.mouse.move(120, 300); pg.mouse.down(); time.sleep(6); shot(pg, '03-viaje-lienzo.png'); pg.mouse.up()
    # 4 · ego alto: definición 0,9, cristal → la cámara se acerca
    pg = fresh(); pg.mouse.click(200, 400)
    pin(pg, "s.def = 0.9; s.tint = 1; s.texture = 0.85; s.hue = 42; s.vit = 0.8; s.amb = 0;")
    pg.evaluate("() => { const s = window.__eternia.s; s.cam.zoom = 1.25; s.thoughts = []; window.__eternia.seedField(); }")
    time.sleep(9); shot(pg, '04-ego-alto.png')
    # 5 · ego alto disonante
    pg = fresh(); pg.mouse.click(200, 400)
    pin(pg, "s.def = 0.9; s.tint = 1; s.texture = -0.85; s.hue = 4; s.vit = 0.8; s.amb = 0;")
    pg.evaluate("() => { const s = window.__eternia.s; s.cam.zoom = 1.25; s.thoughts = []; window.__eternia.seedField(); }")
    time.sleep(9); shot(pg, '05-ego-alto-disonante.png')
    # 6 · ego bajo: definición 0,15 → la cámara se aleja, se ve más universo
    pg = fresh(); pg.mouse.click(200, 400)
    pin(pg, "s.def = 0.15;"); pg.evaluate("() => { window.__eternia.s.cam.zoom = 0.6; }"); time.sleep(10); shot(pg, '06-ego-bajo.png')
    # 7 · centro: sin esfera, el patrón áureo, cámara lejos
    pin(pg, "s.def = 0;"); time.sleep(10); shot(pg, '07-centro.png')
    # 8 · pensamientos: un muestrario de los 8 tipos a zoom 1, sin esfera encima
    pg = fresh(); pg.mouse.click(200, 400); time.sleep(0.3)
    pg.evaluate("""() => { const e = window.__eternia, s = e.s; s.cam.zoom = 1; s.thoughts = []; s.spawnT = 1e9;
      const L = [['ya debería haber terminado',100,150],['y si sale mal',285,140],['quiero más de esto',100,300],['nadie lo hace como yo',285,300],
                 ['todo está en su lugar',100,450],['así olía la casa',285,460],['quiero y no quiero',100,610],['la ropa sigue en la lavadora',285,610]];
      for (const [t,x,y] of L) e.put(t, x, y, { vx: 0.001, vy: 0, life: 999 });
      window.__c = [s.cam.x, s.cam.y];
      e.afterStep = (s) => { s.def = 0.5; s.tint = 0; s.spawnT = 1e9; s.cam.x = window.__c[0]; s.cam.y = window.__c[1]; s.cam.zoom = 1; s.sphere.x = s.cam.x; s.sphere.y = s.cam.y + 370; s.sphere.vx = 0; s.sphere.vy = 0; for (const t of s.thoughts) { t.vx *= 0.9; t.vy *= 0.9; } };
      for (const t of s.thoughts) { t.age = 3; } }""")
    time.sleep(3); shot(pg, '08-pensamientos-tipos.png')
    # 9 · fusión: la esfera hereda la frase (gesto real)
    pg = fresh(); pg.mouse.click(200, 400); time.sleep(0.3)
    pin(pg, "s.def = 0.5; s.vit = 0.75;")
    pg.evaluate("() => { const e = window.__eternia, s = e.s; s.cam.zoom = 1; s.thoughts = []; s.spawnT = 1e9; const c = e.toWorld(195, 600); s.sphere.x = c.x; s.sphere.y = c.y; s.cam.x = c.x; s.cam.y = c.y - 180; e.put('no sirvo para esto', 195, 330, { vx: 0.001, life: 999 }); e.put('qué tonto fui', 95, 180, {life: 999}); e.put('lo hice perfecto', 300, 170, {life:999}); }")
    unpin(pg)
    pg.mouse.move(195, 640); pg.mouse.down(); pg.mouse.move(195, 420, steps=15)
    pg.evaluate("() => { const s = window.__eternia.s; window.__hold = setInterval(() => { const t = s.thoughts.find(t => t.text === 'no sirvo para esto'); if (t && !t.fused) { t.x = s.sphere.x; t.y = s.sphere.y - 30; t.vx = 0.001; t.vy = 0; } }, 16); }")
    time.sleep(4); shot(pg, '09-fusion.png')
    log['fusion'] = pg.evaluate("() => ({ fusion: window.__eternia.s.fusion, tint: window.__eternia.s.tint })"); pg.mouse.up()
    b.close()
log['errors'] = errors
(OUT / 'medidas.json').write_text(json.dumps(log, ensure_ascii=False, indent=1))
print('errores', errors)
