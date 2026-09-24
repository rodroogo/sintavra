import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const messages=[];
const context={TextEncoder,TextDecoder,Uint8Array,Int32Array,ArrayBuffer,DataView,console,performance};context.self=context;context.postMessage=m=>messages.push(m);
vm.createContext(context);
try{vm.runInContext(fs.readFileSync('public/runtime/lua.js','utf8'),context);context.onmessage({data:{code:'local n = 0; for i = 1, 5 do n = n + i end; print(n)',stdin:''}});assert.equal(messages.find(m=>m.type==='output')?.text,'15',JSON.stringify(messages));assert.equal(messages.at(-1).type,'done');console.log('PASS: bundled Lua executes loop and output.');}catch(error){console.error(error.message);process.exitCode=1;}
