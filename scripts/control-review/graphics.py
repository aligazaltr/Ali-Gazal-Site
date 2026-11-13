"""Reproducible vector + 1280x720 raster review compositions. No invented portrait."""
from pathlib import Path
from PIL import Image,ImageDraw,ImageFont
import html,json
root=Path(__file__).resolve().parents[2]
out=root/'docs/control-v1-2026-11-12';out.mkdir(exist_ok=True,parents=True)
font='/usr/share/fonts/truetype/dejavu/DejaVuSansCondensed-Bold.ttf'
regular='/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
BG='#0b0b0a';FG='#f6f2ea';ACC='#ff861f';MUT='#aaa69e'
def render(kind,share=False):
 im=Image.new('RGB',(1280,720),BG);d=ImageDraw.Draw(im);svg=['<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="720" viewBox="0 0 1280 720"><rect width="1280" height="720" fill="'+BG+'"/>']
 def line(x,y,x2,y2,c,w=1):
  d.line((x,y,x2,y2),fill=c,width=w);svg.append(f'<path d="M{x} {y}L{x2} {y2}" stroke="{c}" stroke-width="{w}"/>')
 def box(x,y,x2,y2,c):
  d.rectangle((x,y,x2,y2),outline=c,width=2);svg.append(f'<rect x="{x}" y="{y}" width="{x2-x}" height="{y2-y}" fill="none" stroke="{c}" stroke-width="2"/>')
 def text(x,y,t,size,c=FG,bold=True):
  f=ImageFont.truetype(font if bold else regular,size);d.text((x,y),t,font=f,fill=c,anchor='lt');svg.append(f'<text x="{x}" y="{y}" dominant-baseline="text-before-edge" font-family="DejaVu Sans" font-stretch="condensed" font-weight="{700 if bold else 400}" font-size="{size}" fill="{c}">{html.escape(t)}</text>')
 text(56,40,'ALİ GAZAL / KİŞİSEL DENEY',19,MUT)
 if kind=='A':
  text(56,116,'60 GÜN',90,ACC);line(56,244,655,244,'#49453d')
  text(56,283,'KONTROL',94);text(56,398,'BENDE Mİ?',94)
  # Explicitly empty editorial portrait slot; review only, no borrowed person.
  box(756,72,1224,648,'#474138');line(756,72,816,72,ACC,6);line(1224,588,1224,648,ACC,6)
  for i in range(16):line(780+i*28,555+(i%3)*8,780+i*28,605,ACC if i%4==0 else '#625d54')
  text(798,286,'GERÇEK PORTRE',25,MUT);text(798,326,'YERLEŞİM ALANI',22,MUT,False)
  text(56,623,'A / FOTOĞRAF BEKLEYEN KOMPOZİSYON',18,MUT,False)
 else:
  text(62,143,'KONTROL',142);text(62,316,'BENDE Mİ?',142)
  line(66,535,1208,535,'#474138')
  text(62,569,'60 GÜN',69,ACC)
  for i in range(60):
   x=510+i*11;h=18+(i*17%57);line(x,625-h,x,625,ACC if i%5==0 else '#625d54',2)
  if share:text(790,52,'DENEY DEVAM EDİYOR',20,ACC)
  else:text(62,681,'C / TİPOGRAFİK TASLAK',16,MUT,False)
 svg.append('</svg>')
 name='kontrol-bende-mi-share' if share else 'thumbnail-'+kind
 dest=root if share else out
 im.save(dest/(name+'.png'),optimize=True)
 if not share:(dest/(name+'.svg')).write_text(''.join(svg))
 return name
render('A');render('C');render('C',True)
print('Two review thumbnails and one neutral project sharing graphic exported.')
