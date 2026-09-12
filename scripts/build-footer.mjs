import {build} from 'esbuild';
import {mkdir,readFile,writeFile} from 'node:fs/promises';
import {resolve,dirname} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
export async function buildFooter(){
 await mkdir(resolve(root,'build'),{recursive:true});
 const output=resolve(root,'build/footer-render.mjs');
 await build({absWorkingDir:root,entryPoints:['components/footer-static.tsx'],outfile:output,bundle:true,platform:'node',format:'esm',packages:'external',jsx:'automatic'});
 const {footerMarkup}=await import(pathToFileURL(output).href+'?v='+Date.now());
 for(const page of ['', 'neutrino','antimatiere','photon','temps','navier-stokes','relativite','trou-noir']){
  const file=resolve(root,page,'index.html');const original=await readFile(file,'utf8');
  let html=original.replace(/<footer\b[^>]*>[\s\S]*?<\/footer>/,footerMarkup(page)).replace(/<body(?![^>]*\bid=)([^>]*)>/,'<body id="page-top"$1>');
  if(!html.includes('src="/atlas/footer.js"'))html=html.replace('</head>','<script src="/atlas/footer.js" defer></script></head>');
  if(html!==original)await writeFile(file,html);
 }
}
