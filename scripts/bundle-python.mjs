import {mkdir,copyFile} from 'node:fs/promises';
const files=['pyodide.js','pyodide.asm.js','pyodide.asm.wasm','pyodide-lock.json','python_stdlib.zip'];
await mkdir('public/runtime/python',{recursive:true});
for(const file of files)await copyFile('node_modules/pyodide/'+file,'public/runtime/python/'+file);
console.log('Python y biblioteca estándar incluidos en la aplicación.');
