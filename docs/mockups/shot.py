from playwright.sync_api import sync_playwright
import pathlib
names=['apertura','calma','fusion','disonante','cristal','ambigua','guia','aire','centro']
p=pathlib.Path('/workspace/eternia-mockups')
with sync_playwright() as pw:
  b=pw.chromium.launch();pg=b.new_page(viewport={'width':390,'height':844},device_scale_factor=2)
  for i,n in enumerate(names,1):
    pg.goto(f'file://{p}/index.html?f={n}');pg.wait_for_function("document.title=='done'");pg.screenshot(path=str(p/f'frames/{i:02d}-{n}.png'))
  b.close()
from PIL import Image,ImageDraw
ims=[Image.open(p/f'frames/{i:02d}-{n}.png') for i,n in enumerate(names,1)]
w,h=ims[0].size;sc=0.5;tw,th=int(w*sc),int(h*sc);pad=24
sheet=Image.new('RGB',(3*tw+4*pad,3*(th+40)+pad),(8,8,12));d=ImageDraw.Draw(sheet)
for k,(im,n) in enumerate(zip(ims,names)):
  x=pad+(k%3)*(tw+pad);y=pad+(k//3)*(th+40);sheet.paste(im.resize((tw,th)),(x,y+20));d.text((x,y),f'{k+1:02d} {n}',fill=(200,200,220))
sheet.save(p/'hoja.png')
