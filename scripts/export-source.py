from pathlib import Path
import zipfile,json
root=Path(__file__).resolve().parent.parent
output=root/'public/sintavra-source.zip'
exclude={'.git','node_modules','dist','.next','.wrangler','.sites-runtime','.agents','.codex','outputs','work','coverage','examples','__pycache__'}
with zipfile.ZipFile(output,'w',zipfile.ZIP_DEFLATED) as z:
 for path in sorted(root.rglob('*')):
  relative=path.relative_to(root)
  if not path.is_file() or any(part in exclude for part in relative.parts):continue
  if path==output or path.suffix in {'.tsbuildinfo','.log','.pem'}:continue
  if path.suffix=='.zip' and relative.as_posix()!='public/runtime/python/python_stdlib.zip':continue
  if path.name.startswith('.env') and path.name!='.env.example':continue
  if relative.as_posix()=='.openai/hosting.json':z.writestr('sintavra/'+relative.as_posix(),json.dumps({'d1':'DB','r2':None},indent=2));continue
  z.write(path,'sintavra/'+relative.as_posix())
print(str(output),output.stat().st_size,'bytes')
