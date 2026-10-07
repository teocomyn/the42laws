import {build as bundle} from 'esbuild';
import {buildFooter} from './build-footer.mjs';
import {execFileSync} from 'node:child_process';
import {rm} from 'node:fs/promises';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
export async function buildBlackHole(){
 await buildFooter();
 // Une seule construction avec découpage : React et le moteur WebGL communs aux trois îles
 // vont dans atlas/chunks/ (noms à empreinte), téléchargés une fois et mis en cache.
 await rm(resolve(root,'atlas/chunks'),{recursive:true,force:true});
 await bundle({absWorkingDir:root,entryPoints:{'trou-noir/scene':'trou-noir/app.tsx','atlas/gateway-flow':'components/gateway-entry.tsx','atlas/hero-scene':'components/hero-entry.tsx'},outdir:'.',splitting:true,chunkNames:'atlas/chunks/[name]-[hash]',bundle:true,minify:true,format:'esm',target:['es2022'],jsx:'automatic',define:{'process.env.NODE_ENV':'"production"'},legalComments:'eof'});
 execFileSync(process.execPath,[resolve(root,'node_modules/@tailwindcss/cli/dist/index.mjs'),'-i','styles/globals.css','-o','trou-noir/utilities.css','--minify'],{cwd:root,stdio:'pipe'});
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){await buildBlackHole();console.log('React islands built.');}
