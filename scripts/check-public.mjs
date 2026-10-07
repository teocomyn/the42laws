import {readFile,readdir,stat} from 'node:fs/promises';
import {resolve,relative,extname} from 'node:path';
import {createRequire} from 'node:module';
import vm from 'node:vm';
import {createHash} from 'node:crypto';
const C=createRequire(import.meta.url)('../atlas/core.js');
const {pageMetadata}=createRequire(import.meta.url)('../atlas/metadata.js');
import {out} from './build-public.mjs';
async function list(dir){const all=[];for(const item of await readdir(dir,{withFileTypes:true})){const file=resolve(dir,item.name);if(item.isDirectory())all.push(...await list(file));else all.push(file);}return all;}
const context={window:{}};vm.runInNewContext(await readFile(resolve(out,'atlas/data.js'),'utf8'),context);const data=context.window.ATLAS_DATA;
const files=await list(out),errors=[];let links=0;
for(const path of files){const name=relative(out,path);if(/(?:^|\/)(?:\.git|node_modules|artifacts|AI_CONTEXT\.md|AI_HANDOFF\.md|\.env)/.test(name))errors.push('Non-public file: '+name);if(extname(path)!=='.html')continue;const html=await readFile(path,'utf8'),page=new URL(name,'https://preview.invalid/');const baseTag=html.match(/<base href="([^"]+)"/),base=baseTag?new URL(baseTag[1],page):page;
 if((html.match(/src="\/atlas\/consent.js"/g)||[]).length!==1)errors.push(name+': expected one consent entry');
 if(/<script[^>]+src="https:\/\/www.googletagmanager.com/.test(html))errors.push(name+': Google loaded before consent');
 for(const [,value,version] of html.matchAll(/\b(?:src|href)="([^"?#]+)\?v=([0-9a-f]{12})"/g)){try{const file=resolve(out,'.'+decodeURIComponent(new URL(value,base).pathname));if(createHash('sha256').update(await readFile(file)).digest('hex').slice(0,12)!==version)errors.push(`${name}: stale asset version ${value}`);}catch{errors.push(`${name}: versioned asset missing ${value}`);}}
 for(const [,value] of html.matchAll(/<(?:script\b[^>]*\bsrc|link\b[^>]*\brel="stylesheet"[^>]*\bhref)="([^"]+)"/g)){if(/^[a-z][a-z0-9+.-]*:|^\/\//i.test(value)||value.includes('?v=')||new URL(value,base).pathname==='/atlas/consent.js')continue;errors.push(`${name}: unversioned script or stylesheet ${value}`);}
 for(const m of html.matchAll(/\b(?:href|src)="([^"]+)"/g)){const value=m[1].replaceAll('&amp;','&');if(!value||/^(https?:|mailto:|data:)/.test(value))continue;const url=new URL(value,base);if(url.origin!=='https://preview.invalid')continue;const file=resolve(out,'.'+decodeURIComponent(url.pathname));try{let target=file;const info=await stat(target);if(info.isDirectory())target=resolve(target,'index.html');await stat(target);links++;if(url.hash&&!url.hash.startsWith('#/')&&extname(target)==='.html'){const dest=await readFile(target,'utf8'),id=decodeURIComponent(url.hash.slice(1));if(!dest.includes(`id="${id}"`))errors.push(`${name}: missing anchor ${value}`);}}catch{errors.push(`${name}: missing file ${value}`);}}
}
// Catch structural regressions in the HTML served before JavaScript runs.
for(let id=1;id<=42;id++){
 const html=await readFile(resolve(out,'.'+C.questionPath(id),'index.html'),'utf8');
 if((html.match(/<h1[ >]/g)||[]).length!==1)errors.push(`Dossier ${id}: expected one page heading`);
 const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
 if(new Set(ids).size!==ids.length)errors.push(`Dossier ${id}: duplicate HTML id`);
 if(!html.includes('atlas/app.js')||!html.includes('atlas/dossier.js'))errors.push(`Dossier ${id}: missing reader assets`);
 const meta=pageMetadata(data,['question',String(id)]);
 const descriptions=[...html.matchAll(/<meta name="description" content="([^"]*)"/g)];
 if(descriptions.length!==1||descriptions[0][1].replaceAll('&amp;','&').replaceAll('&quot;','"').replaceAll('&#39;',"'").replaceAll('&lt;','<').replaceAll('&gt;','>')!==meta.description)errors.push(`Dossier ${id}: description differs from router`);
 if((html.match(/name="robots"/g)||[]).length!==1||!html.includes(`name="robots" content="${meta.robots}"`))errors.push(`Dossier ${id}: robots differs from router`);
 const ready=!html.includes('name="robots" content="noindex,follow"');
 if(ready&&(!html.includes('Repères de lecture')||!html.includes('Dossier approfondi et sources')))errors.push(`Dossier ${id}: missing complete static reading`);
 const alias=await readFile(resolve(out,`dossiers/${id}/index.html`),'utf8');
 if(!alias.includes('data-seo-redirect')||!alias.includes('content="noindex,follow"')||alias.includes('data-measurement-id'))errors.push(`Dossier ${id}: invalid static redirect fallback`);
}
// Every real public page has editorial metadata, mirrored in social tags and JSON-LD.
const decode=s=>s.replaceAll('&amp;','&').replaceAll('&quot;','"').replaceAll('&#39;',"'").replaceAll('&lt;','<').replaceAll('&gt;','>');
const expectedPages=[...data.questions.map(q=>({path:C.questionPath(q.id),...data.seo.questions[q.id]})),...Object.entries(data.seo.routes).filter(([path])=>!path.includes('#')).map(([path,item])=>({path,...item}))];
for(const item of expectedPages){
 const html=await readFile(resolve(out,'.'+item.path,'index.html'),'utf8'),title=item.title+' — The42laws';
 if(decode(html.match(/<title>(.*?)<\/title>/s)?.[1]||'')!==title)errors.push(item.path+': title differs from editorial registry');
 for(const key of ['description','og:description','twitter:description']){const values=[...html.matchAll(new RegExp(`<meta (?:name|property)="${key}" content="([^"]*)"`,'g'))];if(values.length!==1||decode(values[0][1])!==item.description)errors.push(item.path+': '+key+' differs from editorial registry');}
 for(const key of ['og:title','twitter:title'])if(decode(html.match(new RegExp(`<meta (?:name|property)="${key}" content="([^"]*)"`))?.[1]||'')!==title)errors.push(item.path+': '+key+' mismatch');
 if(/href="(?:\/)?dossiers\/\d+\//.test(html))errors.push(item.path+': internal link still uses an old numeric address');
}
const manifest=JSON.parse(await readFile(resolve(out,'publication.json'),'utf8'));
if(manifest.questions!==42)errors.push('Question count must remain 42');
if(files.filter(p=>/\/dossiers\/[a-z][a-z0-9-]*\/index\.html$/.test(p)).length!==42)errors.push('42 canonical static question pages required');
if(manifest.baseURL){
 const sitemap=await readFile(resolve(out,'sitemap.xml'),'utf8');
 const urls=[...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m=>m[1]);
 if(new Set(urls).size!==urls.length)errors.push('Sitemap contains duplicate URLs');
 for(const url of urls){const path=new URL(url).pathname,html=await readFile(resolve(out,'.'+path,'index.html'),'utf8');
  if((html.match(/<h1[ >]/g)||[]).length!==1)errors.push(path+': expected one static H1');
  if(!html.includes('content="index,follow"'))errors.push(path+': sitemap page is not indexable');
  if(!html.includes(`rel="canonical" href="${url}"`))errors.push(path+': canonical differs from sitemap');
  const schemas=[...html.matchAll(/<script type="application\/ld\+json" id="atlas-structured-data">(.*?)<\/script>/gs)];
  if(schemas.length!==1){errors.push(path+': expected one structured-data graph');continue;}
  try{const graph=JSON.parse(schemas[0][1])['@graph'];const page=graph.find(p=>p['@id'].endsWith('#webpage'));if(page.url!==url)errors.push(path+': schema URL mismatch');const crumb=graph.find(p=>p['@type']==='BreadcrumbList');if(crumb&&!html.includes('aria-label="Fil d’Ariane"'))errors.push(path+': missing visible breadcrumbs');}catch{errors.push(path+': invalid structured JSON');}
  const main=html.match(/<main[^>]*>([\s\S]*?)<\/main>/)?.[1]||'';
  if(main.replace(/<[^>]*>/g,'').trim().length<100)errors.push(path+': missing static content');
 }
 const glossary=await readFile(resolve(out,'glossaire/index.html'),'utf8');
 for(const term of data.glossary)if(!glossary.includes(`id="${term.id}"`))errors.push('Glossary term missing from HTML: '+term.id);
 for(const q of data.questions)if(sitemap.includes(C.questionPath(q.id))!==q.researched)errors.push('Sitemap research status mismatch: '+q.id);
}
const socialImage=await readFile(resolve(out,'atlas/brand-share-black-hole.png'));
if(socialImage.toString('hex',0,8)!=='89504e470d0a1a0a'||socialImage.readUInt32BE(16)!==1200||socialImage.readUInt32BE(20)!==630)errors.push('Black-hole social image must be a 1200 × 630 PNG');
if(manifest.baseURL){
 const home=await readFile(resolve(out,'index.html'),'utf8'),imageURL=new URL('atlas/brand-share-black-hole.png',manifest.baseURL).href;
 for(const marker of [`property="og:image" content="${imageURL}"`,'property="og:image:width" content="1200"','property="og:image:height" content="630"','property="og:image:alt"','name="twitter:image:alt"'])if(!home.includes(marker))errors.push('Homepage is missing social metadata: '+marker);
}
if(errors.length){console.error(errors.join('\n'));process.exitCode=1;}else console.log(`Public package checked: ${files.length} files, ${links} local links/assets, 42 static question pages, no working files.`);
