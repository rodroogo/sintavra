#!/usr/bin/env python3
"""Personal loopback-only Docker adapter. Never expose this server publicly."""
import argparse,json,secrets,subprocess,tempfile,threading,uuid
from pathlib import Path
from http.server import BaseHTTPRequestHandler,ThreadingHTTPServer
LANGUAGES={
 'c':('gcc:14','main.c',['sh','-c','gcc /code/main.c -o /tmp/main && /tmp/main']),
 'cpp':('gcc:14','main.cpp',['sh','-c','g++ /code/main.cpp -o /tmp/main && /tmp/main']),
 'csharp':('mono:6.12','main.cs',['sh','-c','mcs /code/main.cs -out:/tmp/main.exe && mono /tmp/main.exe']),
 'java':('eclipse-temurin:21-jdk','Main.java',['sh','-c','javac -d /tmp /code/Main.java && java -XX:MaxRAMPercentage=50 -cp /tmp Main']),
 'lua':('sintavra-lua:5.4','main.lua',['lua','/code/main.lua'])}
LOCK=threading.Lock()
def run(language,code,stdin):
 image,name,command=LANGUAGES[language];container='sintavra-'+uuid.uuid4().hex
 with tempfile.TemporaryDirectory(prefix='sintavra-') as folder:
  Path(folder,name).write_text(code,encoding='utf-8');Path(folder).chmod(0o755);Path(folder,name).chmod(0o644)
  args=['docker','run','--rm','--pull=never','--name',container,'--network=none','--memory=512m','--cpus=1','--pids-limit=64','--cap-drop=ALL','--security-opt=no-new-privileges','--read-only','--user=65534:65534','--tmpfs=/tmp:rw,exec,nosuid,size=96m','--mount',f'type=bind,src={folder},dst=/code,readonly','-i',image,*command]
  # Redirect to bounded tmpfs inside container; outer process never buffers unlimited output.
  if command[0]=='sh':args=args[:-len(command)]+['sh','-c','ulimit -f 128; ('+command[2]+') > /tmp/out 2>&1; result=$?; head -c 64000 /tmp/out; exit $result']
  else:args=args[:-len(command)]+['sh','-c','ulimit -f 128; lua /code/main.lua > /tmp/out 2>&1; result=$?; head -c 64000 /tmp/out; exit $result']
  try:
   result=subprocess.run(args,input=stdin,text=True,stdout=subprocess.PIPE,stderr=subprocess.STDOUT,timeout=20)
   return {'output':result.stdout[:64000],'ok':result.returncode==0}
  except subprocess.TimeoutExpired:return {'output':'Tiempo agotado (20 segundos).','ok':False}
  finally:subprocess.run(['docker','rm','-f',container],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL,timeout=10)
class Handler(BaseHTTPRequestHandler):
 def log_message(self,*args):pass
 def headers_ok(self):return self.headers.get('Origin') in self.server.origins and self.headers.get('Host')==f'127.0.0.1:{self.server.server_port}'
 def reply(self,status,value=None):
  self.send_response(status)
  if self.headers_ok():
   self.send_header('Access-Control-Allow-Origin',self.headers['Origin']);self.send_header('Vary','Origin');self.send_header('Access-Control-Allow-Headers','Content-Type, X-Sintavra-Token');self.send_header('Access-Control-Allow-Methods','POST, OPTIONS');self.send_header('Access-Control-Allow-Private-Network','true')
  self.send_header('Content-Type','application/json');self.end_headers()
  if value is not None:self.wfile.write(json.dumps(value).encode())
 def do_OPTIONS(self):self.reply(204 if self.headers_ok() else 403)
 def do_POST(self):
  if self.path!='/run' or not self.headers_ok() or not secrets.compare_digest(self.headers.get('X-Sintavra-Token',''),self.server.token):return self.reply(403,{'error':'Acceso no autorizado.'})
  try:
   length=int(self.headers.get('Content-Length','0'))
   if not 0<length<=100000:raise ValueError('Solicitud demasiado grande.')
   data=json.loads(self.rfile.read(length));language=data['language'];code=data['code'];stdin=data.get('stdin','')
   if language not in LANGUAGES or not isinstance(code,str) or len(code)>30000 or not isinstance(stdin,str) or len(stdin)>10000:raise ValueError('Entrada no válida.')
   if not LOCK.acquire(blocking=False):return self.reply(429,{'error':'Hay una ejecución en curso.'})
   try:result=run(language,code,stdin)
   finally:LOCK.release()
   self.reply(200,result)
  except Exception as e:self.reply(400,{'error':str(e)})
if __name__=='__main__':
 parser=argparse.ArgumentParser();parser.add_argument('--origin',action='append',required=True);parser.add_argument('--port',type=int,default=8765);args=parser.parse_args()
 server=ThreadingHTTPServer(('127.0.0.1',args.port),Handler);server.origins=set(args.origin);server.token=secrets.token_urlsafe(32)
 print(f'Sintavra local: http://127.0.0.1:{args.port}',flush=True);print('Token de esta sesión: '+server.token,flush=True);server.serve_forever()
