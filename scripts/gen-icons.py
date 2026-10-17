# Íconos de la PWA, hechos con código (sin generador de imágenes): campo oscuro, esfera pálida, borde que respira.
from PIL import Image, ImageDraw, ImageFilter
import math, os
out = os.path.join(os.path.dirname(__file__), '..', 'public', 'icons')
os.makedirs(out, exist_ok=True)
def icon(S, pad=0.0):
    im = Image.new('RGB', (S, S), (3, 3, 7))
    glow = Image.new('RGB', (S, S), (0, 0, 0)); d = ImageDraw.Draw(glow)
    m = int(S * (0.12 + pad)); d.rounded_rectangle([m, m, S - m, S - m], radius=int(S * 0.12), outline=(120, 170, 210), width=max(2, S // 90))
    glow = glow.filter(ImageFilter.GaussianBlur(S / 60)); im = Image.blend(im, glow, 0.9)
    # filotaxis tenue
    d = ImageDraw.Draw(im); cx = cy = S / 2
    cols = [(226, 70, 60), (236, 190, 92), (170, 150, 230), (140, 210, 200)]
    for i in range(1, 160):
        a = i * math.radians(137.5); r = S * 0.021 * math.sqrt(i)
        if r > S * (0.3 - pad): break
        x, y = cx + math.cos(a) * r, cy + math.sin(a) * r; c = cols[i % 4]; rr = S * 0.006
        d.ellipse([x - rr, y - rr, x + rr, y + rr], fill=tuple(int(v * 0.7) for v in c))
    sp = Image.new('RGBA', (S, S), (0, 0, 0, 0)); ds = ImageDraw.Draw(sp); R = S * 0.11
    for k in range(30, 0, -1):
        rr = R * k / 30; t = 1 - k / 30
        ds.ellipse([cx - rr, cy - rr, cx + rr, cy + rr], fill=(int(170 + 80 * t), int(185 + 65 * t), 245, int(60 + 150 * t)))
    sp = sp.filter(ImageFilter.GaussianBlur(S / 200)); im.paste(sp, (0, 0), sp)
    return im
icon(192).save(os.path.join(out, 'icon-192.png'))
icon(512).save(os.path.join(out, 'icon-512.png'))
icon(512, pad=0.06).save(os.path.join(out, 'icon-maskable-512.png'))
