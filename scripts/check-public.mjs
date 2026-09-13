import {readFile,readdir,stat} from 'node:fs/promises';
import {resolve,relative,extname} from 'node:path';
import {out} from './build-public.mjs';
async function list(dir){const all=[];for(const item of await readdir(dir,{withFileTypes:true})){const file=resolve(dir,item.name);if(item.isDirectory())all.push(...await list(file));else all.push(file);}return all;}
const files=await list(out),errors=[];let links=0;
for(const path of files){const name=relative(out,path);if(/(?:^|\/)(?:\.git|node_modules|artifacts|AI_CONTEXT\.md|AI_HANDOFF\.md|\.env)/.test(name))errors.push('Non-public file: '+name);if(extname(path)!=='.html')continue;const html=await readFile(path,'utf8'),page=new URL(name,'https://preview.invalid/');const baseTag=html.match(/<base href="([^"]+)"/),base=baseTag?new URL(baseTag[1],page):page;
 for(const m of html.matchAll(/\b(?:href|src)="([^"]+)"/g)){const value=m[1].replaceAll('&amp;','&');if(!value||/^(https?:|mailto:|data:)/.test(value))continue;const url=new URL(value,base);if(url.origin!=='https://preview.invalid')continue;const file=resolve(out,'.'+decodeURIComponent(url.pathname));try{let target=file;const info=await stat(target);if(info.isDirectory())target=resolve(target,'index.html');await stat(target);links++;if(url.hash&&!url.hash.startsWith('#/')&&extname(target)==='.html'){const dest=await readFile(target,'utf8'),id=decodeURIComponent(url.hash.slice(1));if(!dest.includes(`id="${id}"`))errors.push(`${name}: missing anchor ${value}`);}}catch{errors.push(`${name}: missing file ${value}`);}}
}
// Catch structural regressions in the HTML served before JavaScript runs.
for(let id=1;id<=42;id++){
 const html=await readFile(resolve(out,`dossiers/${id}/index.html`),'utf8');
 if((html.match(/<h1[ >]/g)||[]).length!==1)errors.push(`Dossier ${id}: expected one page heading`);
 const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
 if(new Set(ids).size!==ids.length)errors.push(`Dossier ${id}: duplicate HTML id`);
 if(!html.includes('atlas/app.js')||!html.includes('atlas/dossier.js'))errors.push(`Dossier ${id}: missing reader assets`);
 const ready=!html.includes('name="robots" content="noindex,follow"');
 if(ready&&(!html.includes('Repères de lecture')||!html.includes('Dossier approfondi et sources')))errors.push(`Dossier ${id}: missing complete static reading`);
}
const manifest=JSON.parse(await readFile(resolve(out,'publication.json'),'utf8'));
if(manifest.questions!==42)errors.push('Question count must remain 42');
if(files.filter(p=>/\/dossiers\/\d+\/index\.html$/.test(p)).length!==42)errors.push('42 static question pages required');
const socialImage=await readFile(resolve(out,'atlas/brand-share-black-hole.png'));
if(socialImage.toString('hex',0,8)!=='89504e470d0a1a0a'||socialImage.readUInt32BE(16)!==1200||socialImage.readUInt32BE(20)!==630)errors.push('Black-hole social image must be a 1200 × 630 PNG');
if(manifest.baseURL){
 const home=await readFile(resolve(out,'index.html'),'utf8'),imageURL=new URL('atlas/brand-share-black-hole.png',manifest.baseURL).href;
 for(const marker of [`property="og:image" content="${imageURL}"`,'property="og:image:width" content="1200"','property="og:image:height" content="630"','property="og:image:alt"','name="twitter:image:alt"'])if(!home.includes(marker))errors.push('Homepage is missing social metadata: '+marker);
}
if(errors.length){console.error(errors.join('\n'));process.exitCode=1;}else console.log(`Public package checked: ${files.length} files, ${links} local links/assets, 42 static question pages, no working files.`);
