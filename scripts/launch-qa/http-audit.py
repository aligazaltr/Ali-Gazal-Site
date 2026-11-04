#!/usr/bin/env python3
"""Read-only HTTP audit. Requires curl; does not deploy or change DNS."""
import argparse,concurrent.futures,datetime,hashlib,json,re,subprocess,tempfile
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit
ROOT=Path(__file__).resolve().parents[2]
PAGES={'/':'index.html','/machiavelli':'machiavelli.html','/rehberler':'rehberler.html','/dusunce-arsivi':'dusunce-arsivi.html','/hakkimda':'hakkimda.html','/irade-terbiyesi':'irade-terbiyesi.html'}
SECURITY=['content-security-policy','x-content-type-options','x-frame-options','referrer-policy','permissions-policy']
SAFE=set(SECURITY+['location','content-type','cache-control','x-robots-tag','strict-transport-security','content-security-policy-report-only'])
class Metadata(HTMLParser):
 def __init__(self):super().__init__();self.values={};self.canonical=None;self.h1=0
 def handle_starttag(self,tag,attrs):
  a=dict(attrs)
  if tag=='meta' and ('property' in a or 'name' in a):self.values[a.get('property',a.get('name'))]=a.get('content','')
  if tag=='link' and a.get('rel')=='canonical':self.canonical=a.get('href')
  if tag=='h1':self.h1+=1

def probe(base,path):
 with tempfile.TemporaryDirectory() as tmp:
  header=Path(tmp)/'h';body=Path(tmp)/'b'
  p=subprocess.run(['curl','--max-time','20','--connect-timeout','8','--max-redirs','5','--location','-sS','-D',str(header),'-o',str(body),'-w','%{json}',base+path],capture_output=True,text=True)
  try:m=json.loads(p.stdout)
  except ValueError:m={}
  raw=header.read_text() if header.exists() else '';b=body.read_bytes() if body.exists() else b''
  h={};locations=[]
  for line in raw.splitlines():
   if ':' not in line:continue
   k,v=line.split(':',1);k=k.lower();v=v.strip()
   if k in SAFE:h[k]=v
   if k=='location':locations.append(v)
  row={'path':path,'requestedUrl':base+path,'effectiveUrl':m.get('url_effective'),'status':m.get('http_code'),'curlExit':p.returncode,'error':p.stderr.strip() or None,'headers':h,'locations':locations,'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest(),'sslVerifyResult':m.get('ssl_verify_result'),'nelPresent':bool(re.search(r'^nel:',raw,re.M|re.I)),'setCookiePresent':bool(re.search(r'^set-cookie:',raw,re.M|re.I))}
  if path in PAGES and m.get('http_code')==200:
   meta=Metadata();meta.feed(b.decode(errors='replace'));route=path
   row.update(canonical=meta.canonical,metadata=meta.values,h1=meta.h1)
   row['checks']={'canonical':meta.canonical=='https://aligazal.com'+route,'ogUrl':meta.values.get('og:url')=='https://aligazal.com'+route,'metadata':all(meta.values.get(k) for k in ['description','og:title','og:description','twitter:card','twitter:title','twitter:description']),'heading':meta.h1==1,'securityHeaders':all(h.get(k) for k in SECURITY),'indexingPolicy':('noindex' not in (h.get('x-robots-tag','')+' '+meta.values.get('robots','')).lower()) if urlsplit(base).hostname=='aligazal.com' else 'noindex' in h.get('x-robots-tag',''),'exactBuiltHtml':b==(ROOT/PAGES[path]).read_bytes()}
  elif path.startswith('/_launch-') or path in ['/wrangler.jsonc','/.git/config','/content/archive.json','/docs/launch-readiness-2026-11-04/REPORT.md','/scripts/test-launch-readiness.js','/README.txt','/_headers','/site.js.map','/launch-readiness-missing-20261104']:
   row['checks']={'notPublic':m.get('http_code')==404}
  else:
   target=ROOT/path.lstrip('/')
   row['checks']={'reachable':m.get('http_code')==200}
   if target.is_file():row['checks']['exactAsset']=b==target.read_bytes()
  row['passed']=p.returncode==0 and all(row.get('checks',{}).values())
  return row

def main():
 ap=argparse.ArgumentParser();ap.add_argument('origin');ap.add_argument('output');args=ap.parse_args();base=args.origin.rstrip('/')
 paths=list(PAGES)+['/robots.txt','/sitemap.xml','/machiavelli-prens-7-gun-kapak.jpg','/machiavelli-portrait-640.webp','/machiavelli-portrait-960.webp','/index.html','/machiavelli.html','/machiavelli/','/launch-readiness-missing-20261104','/wrangler.jsonc','/.git/config','/content/archive.json','/docs/launch-readiness-2026-11-04/REPORT.md','/scripts/test-launch-readiness.js','/README.txt','/_headers','/_launch-qa','/_launch-qa.html','/_launch-qa.js','/_launch-prelude.js','/site.js.map']
 with concurrent.futures.ThreadPoolExecutor(max_workers=4) as ex:rows=list(ex.map(lambda p:probe(base,p),paths))
 # Extension/slash redirects resolve to pages, so compare via explicit observations,
 # not a guessed file named with a trailing slash.
 result={'capturedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'origin':base,'note':'Read-only audit through an egress proxy; production must be indexable, previews must carry noindex. HTTP timings and UA metadata are not real social-platform previews or field performance.','total':len(rows),'failed':[r for r in rows if not r['passed']],'requests':rows}
 Path(args.output).write_text(json.dumps(result,indent=2)+'\n')
 print(json.dumps({'total':len(rows),'failed':[{'path':r['path'],'status':r['status'],'error':r['error'],'checks':r.get('checks')} for r in result['failed']]}))
if __name__=='__main__':main()
