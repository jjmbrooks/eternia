# Capturas de estados VIVOS de la app (390×844, DPR 2). Uso: npm run build && npx vite preview --port 4173 & ; npm run evidence
# Los estados se alcanzan con gestos reales (mouse = un dedo) y, para no esperar minutos, fijando valores con ?debug=2.
import sys, time
from pathlib import Path
from playwright.sync_api import sync_playwright
BASE = sys.argv[1] if len(sys.argv) > 1 else 'http://localhost:4173/eternia/'
OUT = Path(__file__).resolve().parent.parent / 'docs' / 'evidence' / 'v1'; OUT.mkdir(parents=True, exist_ok=True)
W, H = 390, 844

def pin(page, **kv):  # mantiene valores del núcleo mientras se arma la escena
    js = ';'.join(f's.{k}={v}' for k, v in kv.items())
    page.evaluate(f"() => {{ const s = window.__eternia.s; clearInterval(window.__pin); window.__pin = setInterval(() => {{ {js} }}, 16); {js} }}")
def unpin(page): page.evaluate("() => clearInterval(window.__pin)")

with sync_playwright() as pw:
    b = pw.chromium.launch()
    def fresh(q='debug=2'):
        pg = b.new_page(viewport={'width': W, 'height': H}, device_scale_factor=2)
        pg.goto(f'{BASE}?{q}'); pg.wait_for_function('window.__eternia && window.__eterniaReady'); return pg
    shots = []
    def shot(pg, name): p = OUT / name; pg.screenshot(path=str(p)); shots.append(p.name); print(p.name)

    pg = fresh(); time.sleep(2.6); shot(pg, '01-apertura.png')
    pg.mouse.click(W / 2, H * 0.6); time.sleep(3.5); shot(pg, '02-calma.png')

    # 03 fusión con gesto real: el dedo agarra la esfera y la lleva sobre la frase; se queda > 0,8 s
    pg = fresh(); pg.mouse.click(200, 300); time.sleep(0.3)
    pin(pg, **{'def': 0.42, 'vit': 0.75})
    pg.evaluate("() => { const e = window.__eternia; e.s.thoughts = []; e.s.sphere.x = 195; e.s.sphere.y = 560; e.put('ya debería haber terminado', 195, 420, {vx: 0.001, vy: 0}); e.put('no vas a poder', 300, 250); e.put('otra vez igual', 110, 330); e.put('no es suficiente', 290, 640); e.put('que no se acabe', 120, 700); }")
    unpin(pg)
    pg.mouse.move(195, 560); pg.mouse.down(); pg.mouse.move(195, 425, steps=12)
    pg.evaluate("() => { const s = window.__eternia.s; window.__hold = setInterval(() => { const t = s.thoughts.find(t => t.text.startsWith('ya deb')); if (t && !t.fused) { t.x = s.sphere.x; t.y = s.sphere.y; t.vx = 0.001; t.vy = 0; } }, 16); }")
    time.sleep(3.2); shot(pg, '03-fusion.png')
    fused = pg.evaluate("() => ({fusion: window.__eternia.s.fusion, tint: window.__eternia.s.tint, def: window.__eternia.s.def, vit: window.__eternia.s.vit})"); print('fusion', fused)
    pg.mouse.up(); pg.evaluate("() => clearInterval(window.__hold)"); time.sleep(2.5); shot(pg, '04-soltar.png')

    def extreme(texture, hue, name, vit=0.3, wait=14):
        pg = fresh(); pg.mouse.click(200, 300)
        pin(pg, **{'def': 0.93, 'tint': 1, 'texture': texture, 'hue': hue, 'vit': vit, 'amb': 0})
        time.sleep(0.2); pg.evaluate("() => { window.__eternia.s.thoughts = []; window.__eternia.seedField(); }")
        time.sleep(wait); return pg
    pg = extreme(-0.85, 2, 'dis', vit=0.9, wait=6); shot(pg, '05-extremo-disonante.png')
    pg = extreme(0.85, 42, 'cri', vit=0.9, wait=6); shot(pg, '06-extremo-cristal.png')

    # 07 ambigua: tocar «ojalá se quede» y quedarse
    pg = fresh(); pg.mouse.click(200, 300); pin(pg, **{'def': 0.5})
    pg.evaluate("() => { const e = window.__eternia; e.s.thoughts = []; e.s.sphere.x = 195; e.s.sphere.y = 500; e.put('ojalá se quede', 195, 400); e.put('ya no importa', 110, 250); e.put('no vas a poder', 290, 640); e.put('esto sí soy', 280, 230); }")
    unpin(pg)
    pg.mouse.move(195, 500); pg.mouse.down(); pg.mouse.move(195, 405, steps=10)
    pg.evaluate("() => { const s = window.__eternia.s; setInterval(() => { const t = s.thoughts.find(t => t.text === 'ojalá se quede'); if (t && !t.fused) { t.x = s.sphere.x; t.y = s.sphere.y; } }, 16); }")
    time.sleep(5); shot(pg, '07-ambigua-moteada.png'); pg.mouse.up()

    # 08 la voz: extremo disonante con vitalidad en cero
    pg = extreme(-0.85, 2, 'guia', vit=0, wait=6); shot(pg, '08-voz-disonante.png')
    pg2 = extreme(0.85, 42, 'guia2', vit=0, wait=6); shot(pg2, '09-voz-cristal.png')
    # 10 aceptar: el dedo se queda en el borde (aquí se acelera el reloj para no esperar 31,5 s)
    unpin(pg); pg.mouse.move(14, 520); pg.mouse.down(); time.sleep(0.5)
    pg.evaluate("() => { const e = window.__eternia; e.s.guide.acceptT = 31.4; }"); time.sleep(2.0); shot(pg, '10-voz-aceptada-aire.png')
    print('guide', pg.evaluate("() => window.__eternia.s.guide.state")); pg.mouse.up()

    # 11 aire: dedo en el borde, la esfera adelgaza
    pg = fresh(); pg.mouse.click(200, 300); pin(pg, **{'def': 0.3, 'vit': 0.85}); time.sleep(2); unpin(pg)
    pg.mouse.move(16, 400); pg.mouse.down(); time.sleep(1.5); shot(pg, '11-aire.png'); pg.mouse.up()

    # 12 centro: la palabra se fue, aparece el patrón
    pg = fresh(); pg.mouse.click(200, 300); pin(pg, **{'def': 0}); time.sleep(5); shot(pg, '12-centro.png')
    # 13 semilla: sostener en el centro
    unpin(pg); pg.mouse.move(250, 330); pg.mouse.down(); time.sleep(2.6); shot(pg, '13-semilla.png')
    time.sleep(1.4); print('seed', pg.evaluate("() => ({def: window.__eternia.s.def, att: window.__eternia.s.attention})")); shot(pg, '14-semilla-prende.png'); pg.mouse.up()

    # 15 panel de depuración
    pg = fresh('debug=1'); pg.mouse.click(200, 300); time.sleep(2); shot(pg, '15-debug.png')
    # 16 movimiento reducido
    pg = fresh('debug=2&rm=1'); pg.mouse.click(200, 300); pin(pg, **{'def': 0.55, 'tint': 0.8, 'texture': -0.5, 'hue': 0}); time.sleep(5); shot(pg, '16-movimiento-reducido.png')
    # 17-18 responsive: teléfono chico y escritorio horizontal
    for (vw, vh, name) in [(360, 640, '17-responsive-360x640.png'), (1280, 800, '18-responsive-1280x800.png')]:
        p2 = b.new_page(viewport={'width': vw, 'height': vh}, device_scale_factor=2 if vw < 500 else 1)
        p2.goto(f'{BASE}?debug=2'); p2.wait_for_function('window.__eterniaReady'); time.sleep(2.4)
        p2.screenshot(path=str(OUT / name)); shots.append(name); print(name)
    # 19 teclado: Intro entra, Espacio + flechas mueven la esfera
    pg = fresh(); pg.focus('#field'); pg.keyboard.press('Enter'); time.sleep(0.5)
    x0 = pg.evaluate('() => window.__eternia.s.sphere.x')
    pg.keyboard.down(' '); pg.keyboard.down('ArrowRight'); time.sleep(0.6); pg.keyboard.up('ArrowRight')
    x1 = pg.evaluate('() => window.__eternia.s.sphere.x'); att = pg.evaluate('() => window.__eternia.s.attention')
    shot(pg, '19-teclado.png'); pg.keyboard.up(' '); print('teclado', round(x0), '->', round(x1), att)
    # offline: tras instalar el service worker, recargar sin red
    ctx = b.new_context(viewport={'width': W, 'height': H}, device_scale_factor=2); p3 = ctx.new_page()
    p3.goto(BASE); p3.evaluate("() => navigator.serviceWorker.ready.then(() => true)"); time.sleep(1.5)
    p3.reload(); time.sleep(1); ctx.set_offline(True); p3.reload(); p3.wait_for_function('window.__eterniaReady', timeout=15000); time.sleep(2)
    fonts = p3.evaluate("() => document.fonts.check('300 16px Spectral')")
    p3.screenshot(path=str(OUT / '20-sin-red.png')); shots.append('20-sin-red.png'); print('offline ok, spectral', fonts)
    b.close()
