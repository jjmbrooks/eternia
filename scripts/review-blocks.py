# Hojas de revisión en bloques de 3 capturas (Brooks las revisa en el teléfono: nada de tiras largas).
# Uso: python3 scripts/review-blocks.py <carpeta> nombre-bloque a.png,b.png,c.png "Título a|Título b|Título c" [...]
import sys
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
d = Path(sys.argv[1]); args = sys.argv[2:]
try: font = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', 30)
except Exception: font = ImageFont.load_default()
for i in range(0, len(args), 3):
    name, files, titles = args[i], args[i + 1].split(','), args[i + 2].split('|')
    ims = [Image.open(d / f).convert('RGB') for f in files]; w, h = ims[0].size; gap, top = 24, 60
    sheet = Image.new('RGB', (len(ims) * w + (len(ims) + 1) * gap, h + top + gap), (18, 18, 24)); dr = ImageDraw.Draw(sheet)
    for k, (im, t) in enumerate(zip(ims, titles)):
        x = gap + k * (w + gap); sheet.paste(im, (x, top)); dr.text((x + 6, 14), f'{k + 1}. {t}', fill=(235, 232, 255), font=font)
    sheet.save(d / f'{name}.jpg', quality=88); print(d / f'{name}.jpg')
