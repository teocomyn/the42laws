import {readFile,writeFile,readdir,mkdir,copyFile,rm,stat} from 'node:fs/promises';
import {resolve,dirname,extname,relative} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {createRequire} from 'node:module';
const {pageMetadata,headMarkup,breadcrumbs}=createRequire(import.meta.url)('../atlas/metadata.js');
const {page:legalPage}=createRequire(import.meta.url)('../atlas/legal.js');
const {canonicalHref,questionPath}=createRequire(import.meta.url)('../atlas/core.js');
const {create:publicViews}=createRequire(import.meta.url)('../atlas/public-views.js');
const {fullDocument}=createRequire(import.meta.url)('../atlas/dossier.js');
import {buildBlackHole} from './build-black-hole.mjs';
import {build,root,renderMarkdown} from './build-atlas.mjs';
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const out=resolve(root,'build/public');
// Fichiers conservés dans le dépôt (maîtres, sources SVG) mais référencés par aucune page.
// brand-share.png et share-card.png restent publiés : d'anciens partages pointent encore vers eux.
const UNPUBLISHED=new Set(['atlas/logo-42.png','atlas/favicon-42-512.png','atlas/brand-share.svg','atlas/share-card.svg','atlas/brand-share-black-hole.svg']);
// Notes datées publiées en HTML ; leur ancienne adresse Markdown est redirigée (content/seo.json).
const NOTES=[{file:'notes/navier-stokes-2026.md',path:'/notes/navier-stokes-2026/',lab:{path:'/navier-stokes/',name:'Navier–Stokes'}}];
// Ressources versionnées par empreinte (?v=) : vercel.json les met en cache un an.
// consent.js est exclu : il se retrouve lui-même par son attribut src exact.
const VERSIONABLE=/\.(?:js|css|png|svg|ico|webp|jpe?g|woff2?)$/i,UNVERSIONED=new Set(['/atlas/consent.js']);
async function versionAssets(directory){
 const digests=new Map(),digest=async file=>{if(!digests.has(file))digests.set(file,createHash('sha256').update(await readFile(file)).digest('hex').slice(0,12));return digests.get(file);};
 for(const entry of await readdir(directory,{withFileTypes:true})){
  const path=resolve(directory,entry.name);
  if(entry.isDirectory()){await versionAssets(path);continue;}
  if(!entry.name.endsWith('.html'))continue;
  let html=await readFile(path,'utf8');
  const page=new URL(relative(out,path),'https://preview.invalid/'),baseTag=html.match(/<base href="([^"]+)"/),base=baseTag?new URL(baseTag[1],page):page,versions=new Map();
  for(const tag of html.match(/<(?:script|link|img)\b[^>]*>/g)||[])for(const [,value] of tag.matchAll(/\b(?:src|href)="([^"?#]+)"/g)){
   if(/^[a-z][a-z0-9+.-]*:|^\/\//i.test(value)||!VERSIONABLE.test(value))continue;
   const url=new URL(value,base);if(url.origin!=='https://preview.invalid'||UNVERSIONED.has(url.pathname))continue;
   const file=resolve(out,'.'+decodeURIComponent(url.pathname));
   try{if((await stat(file)).isFile())versions.set(value,await digest(file));}catch{}
  }
  if(!versions.size)continue;
  html=html.replace(/<(?:script|link|img)\b[^>]*>/g,tag=>tag.replace(/\b(src|href)="([^"?#]+)"/g,(all,attr,value)=>versions.has(value)?`${attr}="${value}?v=${versions.get(value)}"`:all));
  await writeFile(path,html);
 }
}
async function configureConsent(directory,enabled) {
 for(const entry of await readdir(directory,{withFileTypes:true})){
  const path=resolve(directory,entry.name);
  if(entry.isDirectory())await configureConsent(path,enabled);
  else if(entry.name.endsWith('.html')){let html=await readFile(path,'utf8');
   if(!html.includes('src="/atlas/consent.js"'))html=html.replace('</head>','<script src="/atlas/consent.js" defer></script></head>');
   if(enabled&&!html.includes('data-seo-redirect'))html=html.replace('src="/atlas/consent.js"','src="/atlas/consent.js" data-measurement-id="G-L659XPNBR6"');
   html=html.replace(/href="([^"]+)"/g,(_,href)=>`href="${esc(canonicalHref(href.replaceAll('&amp;','&')))}"`);
   await writeFile(path,html);
  }
 }
}
function stripMetadata(html){return html.replace(/<script type="application\/ld\+json" id="atlas-structured-data">.*?<\/script>/gs,'').replace(/<meta\s+(?:name="(?:description|robots|twitter:[^"]+)"|property="og:[^"]+")[^>]*>/g,'').replace(/<link rel="canonical"[^>]*>/g,'');}
export async function buildPublic(siteURL=process.env.SITE_URL||''){
 let base='';if(siteURL){const url=new URL(siteURL);if(url.protocol!=='https:'||url.username||url.password||url.search||url.hash)throw Error('SITE_URL must be an HTTPS base address without credentials, query or fragment.');base=url.href.replace(/\/$/,'')+'/';}
 await buildBlackHole();
 const data=await build();
 await mkdir(resolve(root,'build'),{recursive:true});
 try{await stat(out);await readFile(resolve(out,'.the42laws-build'));await rm(out,{recursive:true});}catch(error){if(error.code!=='ENOENT')throw error;try{await stat(out);throw Error('Existing public directory has no build marker; refusing to replace it.');}catch(check){if(check.code!=='ENOENT')throw check;}}
 await mkdir(out,{recursive:true});await writeFile(resolve(out,'.the42laws-build'),'Generated by scripts/build-public.mjs\n');
 async function copy(path){const from=resolve(root,path),to=resolve(out,path);await mkdir(dirname(to),{recursive:true});await copyFile(from,to);}
 for(const f of ['index.html','favicon.ico','METHODE.md','QUESTIONS.md'])await copy(f);
 // Explicit public folders only. Runtime assets and research Markdown are public content.
 for(const folder of ['atlas','atlas/dossiers','atlas/chunks','neutrino','antimatiere','photon','temps','navier-stokes','relativite','trou-noir','questions','sources','notes']){
  let files=[];try{files=await readdir(resolve(root,folder),{withFileTypes:true});}catch(e){if(e.code==='ENOENT')continue;throw e;}
  for(const f of files){const path=folder+'/'+f.name;if(f.isFile()&&/\.(html|css|js|svg|png|md)$/.test(f.name)&&!UNPUBLISHED.has(path)&&!(folder==='notes'&&f.name.endsWith('.md')))await copy(path);}
 }
 const head=(title,description,path,robots='index,follow')=>{const editorial=data.seo.routes[path];return headMarkup({title:editorial?editorial.title+' — The42laws':title,description:editorial?.description||description,path,robots},base,esc);};
 for(const path of ['index.html',...data.labs.map(l=>l.url)]){const target=resolve(out,path);let html=await readFile(target,'utf8');let title=html.match(/<title>(.*?)<\/title>/s)?.[1]||'The42laws';const description=html.match(/<meta name="description" content="([^"]*)"/)?.[1]||'Un atlas du réel.';const publicPath=path==='index.html'?'/':'/'+path.replace(/index\.html$/,'');if(data.seo.routes[publicPath])title=data.seo.routes[publicPath].title+' — The42laws';html=stripMetadata(html).replace(/<title>.*?<\/title>/s,`<title>${esc(title)}</title>`).replace('</head>',head(title,description,publicPath)+'</head>');if(path!=='index.html'){const crumbs=`<nav class="seo-breadcrumbs" aria-label="Fil d’Ariane"><a href="/">Accueil</a><a href="/laboratoires/">Laboratoires</a><span>${title.replace(/ — The42laws$/,'')}</span></nav>`;html=html.replace(/<main([^>]*)>/,`<main$1>${crumbs}`);}await writeFile(target,html);}
 const shell=await readFile(resolve(root,'index.html'),'utf8');
 const documents=data.questions.map(q=>({path:questionPath(q.id).slice(1),meta:pageMetadata(data,['question',String(q.id)]),body:fullDocument(q,data),researched:q.researched,dossier:q.researched?q.id:null}));
 const views=publicViews(data);
 const publicPages=[['accueil'],['atlas'],['laboratoires'],['parcours'],['glossaire'],['methode'],['sources'],['particules'],['liens'],['apropos'],...data.paths.map(p=>['parcours',p.id]),...data.domains.map(d=>['domaine',d.id])];
 for(const parts of publicPages){const meta=pageMetadata(data,parts);documents.push({path:meta.path.slice(1),meta,body:views.page(parts),researched:true});}
 for(const kind of ['confidentialite','mentions-legales'])documents.push({path:kind+'/',meta:pageMetadata(data,[kind]),body:legalPage(kind,data.legal,esc),researched:kind==='confidentialite'||data.legal?.complete});
 for(const doc of documents){
  const target=resolve(out,doc.path,'index.html');await mkdir(dirname(target),{recursive:true});
  const meta=doc.meta||pageMetadata(data,['atlas']);
  const crumbs=meta.path==='/'?'':`<nav class="seo-breadcrumbs" aria-label="Fil d’Ariane">${breadcrumbs(meta).map((item,i,all)=>i===all.length-1?`<span>${esc(item.name)}</span>`:`<a href="${item.path}">${esc(item.name)}</a>`).join('')}</nav>`;
  const body=doc.body.includes('aria-label="Fil d’Ariane"')?doc.body:crumbs+doc.body;
  const page=doc.dossier?shell.replace('<script src="atlas/data.js" defer></script>',`$&<script src="/atlas/dossiers/${doc.dossier}.js" defer></script>`):shell;
  const html=stripMetadata(page).replace(/<title>.*?<\/title>/s,`<title>${esc(meta.title)}</title>`)
   .replace('</head>',headMarkup(meta,base,esc)+'</head>')
   .replace('<main id="main" tabindex="-1"></main>',`<main id="main" tabindex="-1">${body}</main>`)
   .replace('<body id="page-top">','<body id="page-top"><noscript><style>.sidebar,.topbar{display:none}.shell{margin-left:0}</style></noscript>');
  await writeFile(target,html);
 }
 const footer=shell.match(/<footer class="t42-footer"[\s\S]*?<\/footer>/)?.[0]||'';
 for(const note of NOTES){
  const editorial=data.seo.routes[note.path];if(!editorial)throw Error('SEO metadata missing for '+note.path);
  const md=await readFile(resolve(root,note.file),'utf8'),heading=md.match(/^# (.+)$/m)?.[1]||editorial.title;
  const revised=[...md.matchAll(/^- (\d{4}-\d{2}-\d{2})/gm)].map(m=>m[1]).sort().at(-1);
  const meta={title:editorial.title+' — The42laws',description:editorial.description,path:note.path,robots:'index,follow',label:editorial.title,updated:revised};
  const {html:content}=renderMarkdown(md.replace(/^# .+\n+/,''),note.file);
  const crumbs=`<nav class="seo-breadcrumbs" aria-label="Fil d’Ariane">${breadcrumbs(meta).map((item,i,all)=>i===all.length-1?`<span>${esc(item.name)}</span>`:`<a href="${item.path}">${esc(item.name)}</a>`).join('')}</nav>`;
  const icons='<link rel="icon" href="/favicon.ico" sizes="16x16 32x32 48x48"><link rel="icon" type="image/png" sizes="48x48" href="/atlas/favicon-42-48.png"><link rel="icon" type="image/png" sizes="32x32" href="/atlas/favicon-42-32.png"><link rel="apple-touch-icon" sizes="180x180" href="/atlas/favicon-42-180.png">';
  const nav=`<nav class="atlas-bridge" aria-label="Navigation de l’atlas"><a class="bridge-home" href="/"><img src="/atlas/favicon-42-48.png" width="30" height="30" alt=""> <span>THE42LAWS / L’ATLAS DU RÉEL</span></a><span><a href="/laboratoires/">Laboratoires</a><a href="${note.lab.path}">${esc(note.lab.name)}</a><a href="${note.path}" aria-current="page">Note datée</a></span></nav>`;
  const target=resolve(out,'.'+note.path,'index.html');await mkdir(dirname(target),{recursive:true});
  await writeFile(target,`<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="theme-color" content="#101115"><title>${esc(meta.title)}</title>${headMarkup(meta,base,esc)}${icons}<link rel="stylesheet" href="/atlas/style.css"><link rel="stylesheet" href="/atlas/lab-nav.css"><link rel="stylesheet" href="/atlas/brand.css"><script src="/atlas/footer.js" defer></script></head><body id="page-top" class="note-page">${nav}<main id="main" tabindex="-1">${crumbs}<div class="page"><div class="reader-head"><span class="eyebrow">NOTE DE RECHERCHE DATÉE${revised?' · RÉVISÉE LE '+revised:''}</span><h1>${esc(heading)}</h1></div><article class="prose">${content}</article></div></main>${footer}</body></html>`);
 }
 await writeFile(resolve(out,'404.html'),'<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Page introuvable — The42laws</title><meta name="robots" content="noindex,follow"><meta name="theme-color" content="#101115"><link rel="stylesheet" href="/atlas/style.css"><link rel="stylesheet" href="/atlas/brand.css"><link rel="icon" href="/favicon.ico" sizes="16x16 32x32 48x48"><link rel="icon" type="image/png" sizes="48x48" href="/atlas/favicon-42-48.png"><link rel="icon" type="image/png" sizes="32x32" href="/atlas/favicon-42-32.png"><link rel="apple-touch-icon" sizes="180x180" href="/atlas/favicon-42-180.png"></head><body class="brand-error"><main><img src="/atlas/favicon-42-180.png" width="64" height="64" alt=""><span class="eyebrow">THE42LAWS / 404</span><h1>Reprenons le fil.</h1><p>Cette page n’existe pas.</p><a class="button primary" href="'+esc(base||'/')+'">Retour à l’atlas</a></main></body></html>');
 const routes=[...new Set([...data.labs.map(l=>l.url.replace('index.html','')),...documents.filter(d=>d.researched).map(d=>d.path),...NOTES.map(n=>n.path.slice(1))])];
 await writeFile(resolve(out,'robots.txt'),'User-agent: *\nAllow: /\n'+(base?'Sitemap: '+new URL('sitemap.xml',base).href+'\n':''));
 if(base)await writeFile(resolve(out,'sitemap.xml'),'<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'+routes.map(r=>'<url><loc>'+esc(new URL(r,base).href)+'</loc></url>').join('')+'</urlset>');
 await writeFile(resolve(out,'_headers'),'/*\n  X-Content-Type-Options: nosniff\n  Referrer-Policy: strict-origin-when-cross-origin\n  X-Frame-Options: SAMEORIGIN\n');
 const redirects=[];
 for(const q of data.questions){
  const path=questionPath(q.id),target=resolve(out,`dossiers/${q.id}/index.html`);await mkdir(dirname(target),{recursive:true});
  // Vercel uses HTTP 308 rules. This small alias also works on plain static previews.
  await writeFile(target,`<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Nouvelle adresse du dossier ${q.id} — The42laws</title><meta name="description" content="Ce dossier possède une nouvelle adresse permanente."><meta name="robots" content="noindex,follow">${base?`<link rel="canonical" href="${esc(new URL(path,base).href)}">`:''}<link rel="stylesheet" href="/atlas/brand.css"><link rel="stylesheet" href="/atlas/style.css"><script src="/atlas/redirect.js" defer></script></head><body class="brand-error"><main><h1>Ce dossier a une nouvelle adresse.</h1><p>${esc(q.title)}</p><a class="button primary" data-seo-redirect href="${path}">Ouvrir le dossier</a></main></body></html>`);
  for(const source of [`/dossiers/${q.id}`,`/dossiers/${q.id}/`,`/dossiers/${q.id}/index.html`])redirects.push(`${source} ${path} 301!`);
 }
 await writeFile(resolve(out,'_redirects'),redirects.join('\n')+'\n');
 await writeFile(resolve(out,'publication.json'),JSON.stringify({application:'The42laws',version:2,baseURL:base||null,questions:42,researchDossiers:data.questions.filter(q=>q.researched).length,laboratories:data.labs.length,note:'Build statique. Aucun carnet personnel, fichier de travail IA ou secret inclus.'},null,2));
 // Only the hosted build receives analytics; local source previews stay offline.
 await configureConsent(out,!!base);
 await versionAssets(out);
 return {out,routes,base};
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){const result=await buildPublic();console.log(`Public build: ${result.out}\n${result.routes.length} static routes. ${result.base?'Canonical URLs and sitemap configured.':'No domain configured; canonical URLs and sitemap omitted.'}`);}
