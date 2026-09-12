import {build as bundle} from 'esbuild';
import {buildFooter} from './build-footer.mjs';
import {execFileSync} from 'node:child_process';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
export async function buildBlackHole(){
 await buildFooter();
 await bundle({absWorkingDir:root,entryPoints:['trou-noir/app.tsx'],outfile:'trou-noir/scene.js',bundle:true,minify:true,format:'esm',target:['es2022'],jsx:'automatic',define:{'process.env.NODE_ENV':'"production"'},legalComments:'eof'});
 await bundle({absWorkingDir:root,entryPoints:['components/gateway-entry.tsx'],outfile:'atlas/gateway-flow.js',bundle:true,minify:true,format:'esm',target:['es2022'],jsx:'automatic',define:{'process.env.NODE_ENV':'"production"'},legalComments:'eof'});
 await bundle({absWorkingDir:root,entryPoints:['components/hero-entry.tsx'],outfile:'atlas/hero-scene.js',bundle:true,minify:true,format:'esm',target:['es2022'],jsx:'automatic',define:{'process.env.NODE_ENV':'"production"'},legalComments:'eof'});
 execFileSync(process.execPath,[resolve(root,'node_modules/@tailwindcss/cli/dist/index.mjs'),'-i','styles/globals.css','-o','trou-noir/utilities.css','--minify'],{cwd:root,stdio:'pipe'});
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){await buildBlackHole();console.log('React islands built.');}
