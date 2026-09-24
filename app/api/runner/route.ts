// This endpoint only serves an isolated browser runtime. It never receives or executes student code.
export async function GET(req: Request) {
  const python = new URL(req.url).searchParams.get("language") === "python";
  const lua = new URL(req.url).searchParams.get("language") === "lua";
  const nonce = crypto.randomUUID().replaceAll("-", "");
  const worker = python
    ? `
 let python;let runtimeAssets;const nativeImportScripts=importScripts.bind(self);
 const assetName=url=>String(url).split('/').pop();
 const installAssets=assets=>{runtimeAssets=assets;self.fetch=async url=>{const name=assetName(url);if(!runtimeAssets[name])throw Error('Network disabled');return new Response(runtimeAssets[name],{headers:{'Content-Type':name.endsWith('.wasm')?'application/wasm':'application/octet-stream'}});};};
 const loadScript=name=>{if(!runtimeAssets[name])throw Error('Unknown runtime asset');const blob=URL.createObjectURL(new Blob([runtimeAssets[name]],{type:'text/javascript'}));try{nativeImportScripts(blob);}finally{URL.revokeObjectURL(blob);}};
 self.importScripts=(...urls)=>urls.forEach(url=>loadScript(assetName(url)));
 onmessage=async e=>{if(e.data.type==='bootstrap'){try{installAssets(e.data.assets);loadScript('pyodide.js');python=await loadPyodide({indexURL:'https://runtime.invalid/'});postMessage({type:'ready'});}catch(err){postMessage({type:'error',text:String(err)});}return;}let length=0;const emit=text=>{length+=text.length;if(length>64000)throw Error('Output limit: 64 KB');postMessage({type:'output',text});};try{const inputs=e.data.stdin.split('\\n');let cursor=0;python.setStdin({stdin:()=>cursor<inputs.length?inputs[cursor++]:null});python.setStdout({batched:emit});python.setStderr({batched:emit});await python.runPythonAsync(e.data.code);postMessage({type:'done'});}catch(err){postMessage({type:'error',text:String(err).slice(0,6000)});}};`
    : `postMessage({type:'ready'});onmessage=async e=>{let size=0;const emit=(...args)=>{const text=args.map(a=>typeof a==='string'?a:JSON.stringify(a)).join(' ');size+=text.length;if(size>64000)throw Error('Output limit: 64 KB');postMessage({type:'output',text});};console.log=emit;console.info=emit;console.warn=emit;console.error=emit;try{const fn=new Function('readLine','"use strict";\\n'+e.data.code);const lines=e.data.stdin.split('\\n');let i=0;await fn(()=>lines[i++]??null);postMessage({type:'done'});}catch(err){postMessage({type:'error',text:String(err).slice(0,6000)});}};`;
  const csp = `default-src 'none'; script-src 'nonce-${nonce}' 'unsafe-eval' blob:; worker-src blob:; connect-src 'none'; style-src 'none'; img-src 'none'; base-uri 'none'; form-action 'none'; sandbox allow-scripts;`;
  const html = `<!doctype html><html><head><meta charset="utf-8"></head><body><script nonce="${nonce}">let worker;let session;addEventListener('message',e=>{if(e.source!==parent||!e.data||e.data.type!=='start'||worker)return;session=e.data.session;worker=new Worker(URL.createObjectURL(new Blob([${lua ? 'e.data.assets["lua.js"]' : JSON.stringify(worker)}],{type:'text/javascript'})));worker.onmessage=m=>{parent.postMessage({...m.data,session},'*');if(m.data.type==='ready')worker.postMessage({code:e.data.code,stdin:e.data.stdin});};if(e.data.assets && ${!lua})worker.postMessage({type:'bootstrap',assets:e.data.assets});worker.onerror=err=>parent.postMessage({type:'error',text:'No se pudo cargar el motor: '+err.message,session},'*');});parent.postMessage({type:'frame-ready'},'*');</script></body></html>`;
  return new Response(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Content-Security-Policy": csp,
      "Cache-Control": "no-cache",
      "X-Content-Type-Options": "nosniff",
      "Referrer-Policy": "no-referrer",
    },
  });
}
