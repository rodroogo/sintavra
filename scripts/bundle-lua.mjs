import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);const {build}=require(require.resolve('esbuild',{paths:[require.resolve('wrangler')]}));
await build({entryPoints:['scripts/lua-worker.cjs'],bundle:true,platform:'browser',format:'iife',define:{'process.env.FENGARICONF':'undefined','process':'undefined'},outfile:'public/runtime/lua.js',minify:true,legalComments:'eof'});
