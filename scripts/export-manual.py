from pathlib import Path
import json,html
root=Path(__file__).resolve().parent.parent
esc=html.escape
parts=['''<!doctype html><html lang="es"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Sintavra · Manual offline</title><style>body{font:17px/1.8 system-ui;background:#111519;color:#e8ecee;max-width:920px;margin:auto;padding:30px}h1,h2,h3{line-height:1.3}h1{color:#c6ef91}a{color:#c6ef91}input,button{font:inherit;padding:12px;background:#1b2322;color:#e8ecee;border:1px solid #46524b;border-radius:5px}input{width:90%;position:sticky;top:10px}article{padding:25px;margin:25px 0;border:1px solid #303942;border-radius:8px}pre{padding:20px;background:#0c1116;overflow:auto;white-space:pre-wrap;font:15px/1.8 monospace}.warning{border-left:3px solid #c39a6f;padding-left:16px}summary{cursor:pointer;color:#c6ef91}.tag{font:14px monospace;color:#9faeb8}.en{color:#a6b4c0}nav{display:flex;gap:15px;flex-wrap:wrap;margin:20px 0}@media print{body{background:white;color:black}input{display:none}article{break-inside:avoid}pre{background:#eee;color:black}}</style><h1>Sintavra.</h1><p>Aprende. Programa. Comprende.</p><p>Manual inicial descargado · 42 lecciones · sin conexión · español e inglés.<br>Los ejemplos son código para estudiar; este archivo no ejecuta programas ni guarda progreso.</p><label>Buscar / Search<br><input id="search" type="search" placeholder="Python, for, variables…"></label><nav>''']
modules=[json.loads(p.read_text()) for p in sorted((root/'content/languages').glob('*.json'))]
for l in modules:parts.append(f'<a href="#{l["id"]}">{esc(l["name"])}</a>')
parts.append('</nav>')
for language in modules:
 parts.append(f'<h2 id="{language["id"]}">{esc(language["name"])}</h2>')
 for l in language['lessons']:
  parts.append(f'<article><span class="tag">{esc(language["name"])} / {esc(l["level"])}</span><h3>{esc(l["title"])}</h3><p>{esc(l["body"])}</p><pre>{esc(l["code"])}</pre><p class="warning">{esc(l["pitfall"])}</p><h4>Inténtalo tú</h4><p>{esc(l["exercise"])}</p>')
  for i,h in enumerate(l['hints']):parts.append(f'<details><summary>Pista {i+1}</summary><p>{esc(h)}</p></details>')
  parts.append(f'<details class="en"><summary>English · {esc(l["titleEn"])}</summary><p>{esc(l["bodyEn"])}</p><h4>Practice</h4><p>{esc(l["exerciseEn"])}</p></details></article>')
parts.append('''<script>document.getElementById('search').addEventListener('input',e=>{const q=e.target.value.toLowerCase();document.querySelectorAll('article').forEach(a=>{a.hidden=!a.textContent.toLowerCase().includes(q)});});</script></html>''')
(root/'public/sintavra-manual.html').write_text(''.join(parts))
print('Manual exported:',len(modules),'languages')
