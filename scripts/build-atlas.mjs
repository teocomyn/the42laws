import {readFile,writeFile,mkdir,rm} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {resolve,dirname,relative,sep} from 'node:path';
import {fileURLToPath} from 'node:url';
import {Marked} from 'marked';
import {createRequire} from 'node:module';
import {checkSEO} from './sync-seo.mjs';
const C=createRequire(import.meta.url)('../atlas/core.js');
export const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
// Champs lourds des dossiers, écrits dans atlas/dossiers/<id>.js plutôt que dans data.js.
export const DOSSIER_FIELDS=['html','headings','short','sources','explorer','essential'];
export const EXPLORER_LEVELS=['non','improbable','incertain','possible','oui'];
export function resolveLink(href,source){
 if(/^(https?:|mailto:)/i.test(href))return href;
 if(href.startsWith('#'))return href;
 if(/^[\w+.-]+:/.test(href)||href.startsWith('//')||/[\u0000-\u0020]/.test(href))return '#';
 const target=resolve(dirname(resolve(root,source)),href.split('#')[0]);
 const local=relative(root,target).split(sep).join('/');
 if(local.startsWith('../'))return '#';
 if(/^questions\/\d{2}\.md$/.test(local))return C.questionPath(Number(local.match(/\d{2}/)[0]));
 if(local==='QUESTIONS.md')return '/dossiers/';
 if(local==='METHODE.md')return '/methode/';
 if(local==='sources/README.md')return '/sources/';
 if(/^notes\/[a-z0-9-]+\.md$/.test(local))return '/notes/'+local.slice(6,-3)+'/'+(href.includes('#')?'#'+href.split('#')[1]:'');
 return '/'+local+(href.includes('#')?'#'+href.split('#')[1]:'');
}
export function renderMarkdown(md,source='questions/41.md'){
 const headings=[];let n=0;
 const marked=new Marked({gfm:true,renderer:{
  html({text}){return esc(text);},
  image({text}){return esc(text);},
  heading({tokens,depth}){const title=this.parser.parseInline(tokens);const id='part-'+(++n);headings.push({id,title:title.replace(/<[^>]+>/g,''),depth});return `<h${Math.max(2,depth)} id="${id}" tabindex="-1">${title}</h${Math.max(2,depth)}>`;},
  link({href,title,tokens}){const url=resolveLink(href,source),external=/^https?:/i.test(url);return `<a href="${esc(url)}"${external?' target="_blank" rel="noopener noreferrer"':''}${title?` title="${esc(title)}"`:''}>${this.parser.parseInline(tokens)}</a>`;},
  table(token){const head=token.header.map(c=>`<th scope="col">${this.parser.parseInline(c.tokens)}</th>`).join('');const rows=token.rows.map(row=>{const first=String(row[0]?.text||'').trim(),id=/^S\d{3}$/.test(first)?` id="src-${first}"`:'';return `<tr${id}>${row.map(c=>`<td>${this.parser.parseInline(c.tokens)}</td>`).join('')}</tr>`;}).join('');return `<div class="table-scroll" tabindex="0" role="region" aria-label="Tableau de recherche"><table><thead><tr>${head}</tr></thead><tbody>${rows}</tbody></table></div>`;}
 }});
 const page=source.match(/^questions\/(\d{2})\.md$|^content\/(\d+)-essentiel\.md$/);
 return {html:linkCitations(marked.parse(md),page?C.questionPath(Number(page[1]||page[2])):''),headings};
}
// Les renvois entre crochets, « [S300] » ou « [S492, rapporté d’après S489] », deviennent des liens vers la ligne
// du tableau des sources (id="src-S300"). Le texte affiché reste identique ; le lecteur en tire un aperçu.
// L’adresse inclut la page du dossier : les pages publiques déclarent <base href="/">.
export function linkCitations(html,page=''){
 const cite=s=>s.replace(/\bS(\d{3})\b/g,`<a class="cite" href="${page}#src-S$1">S$1</a>`);
 // Un groupe qui ne contient que des identifiants perd ses crochets : les pastilles suffisent à le signaler.
 return html.split(/(<[^>]+>)/).map((part,i)=>i%2?part:part.replace(/\[([^\[\]]*?\bS\d{3}\b[^\[\]]*?)\]/g,(_,inner)=>/^\s*S\d{3}(\s*[,;]?\s*S\d{3})*\s*$/.test(inner)?`<span class="cites">${cite(inner)}</span>`:'['+cite(inner)+']')).join('');
}
// Expérience interactive facultative (content/explorers/<id>.json) : chaque verdict doit citer
// une source du dossier, et chaque système doit avoir un verdict pour chaque cadre.
export function checkExplorer(x,id,sourceIds){
 const fail=m=>{throw Error(`Invalid explorer ${id}: ${m}`);},text=v=>typeof v==='string'&&v.trim().length>0;
 const cites=(list,where)=>{if(!Array.isArray(list))fail(where+' cites');for(const c of list)if(!sourceIds.includes(c))fail(`${where} cites ${c}, absent from the dossier sources`);};
 for(const key of ['kicker','title','intro','choose','behaviourLabel','agree','disagree','foot','prompt','promptAction'])if(!text(x[key]))fail(key);
 cites(x.footCites,'foot');
 if(!x.frames?.length||!x.systems?.length)fail('frames and systems');
 const ids=new Set();for(const f of x.frames){if(!/^[a-z]+$/.test(f.id)||ids.has(f.id)||!text(f.label)||!text(f.detail))fail('frame '+f.id);ids.add(f.id);}
 const systems=new Set();
 for(const s of x.systems){
  if(!/^[a-z]+$/.test(s.id)||systems.has(s.id)||!text(s.label)||!text(s.detail)||!text(s.behaviour?.text))fail('system '+s.id);systems.add(s.id);
  cites(s.behaviour.cites,s.id+' behaviour');
  for(const f of x.frames){const v=s.verdicts?.[f.id];if(!v||!EXPLORER_LEVELS.includes(v.level)||!text(v.label)||!text(v.text))fail(`${s.id}/${f.id}`);cites(v.cites,`${s.id}/${f.id}`);}
  if(Object.keys(s.verdicts).length!==x.frames.length)fail(s.id+' has extra verdicts');
 }
 return x;
}
// « L’essentiel en 30 secondes » (content/essentiels.json) : une idée, trois points, une question pour se tester.
// Chaque renvoi doit appartenir au dossier ; les limites de longueur gardent la carte lisible en 30 secondes.
export function checkEssential(e,id,sourceIds){
 const fail=m=>{throw Error(`Invalid essential ${id}: ${m}`);};
 const text=(v,max,where)=>{if(typeof v!=='string'||!v.trim())fail(where+' is empty');if(v.length>max)fail(`${where} exceeds ${max} characters`);if(/—|!|\*\*|'/.test(v))fail(where+' breaks the typography rules');};
 const cites=(list,where)=>{if(!Array.isArray(list))fail(where+' cites');for(const c of list)if(!sourceIds.includes(c))fail(`${where} cites ${c}, absent from the dossier sources`);};
 text(e?.idea,160,'idea');
 if(!Array.isArray(e.points)||e.points.length!==3)fail('needs exactly 3 points');
 e.points.forEach((p,i)=>{text(p.text,170,'point '+(i+1));cites(p.cites,'point '+(i+1));});
 text(e.check?.question,110,'check question');text(e.check.answer,220,'check answer');cites(e.check.cites,'check');
 return e;
}
export async function build(){
 await checkSEO();
 const metadata=JSON.parse(await readFile(resolve(root,'content/atlas.json'),'utf8'));
 const extras={};for(const name of ['particles','glossary','connections','learning','answers','seo','essentiels'])extras[name]=JSON.parse(await readFile(resolve(root,`content/${name}.json`),'utf8'));
 const questions=[];
 for(let id=1;id<=42;id++){
  const file=`questions/${String(id).padStart(2,'0')}.md`,md=await readFile(resolve(root,file),'utf8');
  const title=md.match(/^# \d+\. (.+)$/m)?.[1],status=md.match(/^Statut de recherche : (.+)$/m)?.[1];
  if(!title||!status)throw Error(`Missing question metadata: ${file}`);
  const domain=metadata.domains.find(d=>id>=d.range[0]&&id<=d.range[1]);
  const researched=status!=='À explorer';
  if(researched&&extras.seo.questions[id].description.startsWith('Question à explorer'))throw Error(`Update the published dossier SEO description in content/seo.json: ${id}`);
  const body=md.slice(md.indexOf('\n## ')+1);
  const match=body.match(/## Sources vérifiées\n([\s\S]*?)(?=\n## |$)/);
  const sources=match?match[1].trim():'';
  const sourceIds=[...new Set([...sources.matchAll(/\| (S\d{3}) \|/g)].map(m=>m[1]))];
  const document=renderMarkdown(body,file);
  let explorer=null;try{explorer=checkExplorer(JSON.parse(await readFile(resolve(root,`content/explorers/${id}.json`),'utf8')),id,sourceIds);}catch(error){if(error.code!=='ENOENT')throw error;}
  if(explorer&&!researched)throw Error(`Explorer without a published dossier: ${id}`);
  const essential=researched?checkEssential(extras.essentiels[id],id,sourceIds):null;
  let short=null;try{const shortFile=`content/${id}-essentiel.md`;short=renderMarkdown(await readFile(resolve(root,shortFile),'utf8'),shortFile);}catch(error){if(error.code!=='ENOENT')throw error;}
  questions.push({id,title,status,researched,domain:domain.id,domainName:domain.name,color:domain.color,file,answer:extras.answers[id]||null,learning:extras.learning[id]||null,updated:md.match(/^Dernière mise à jour : (.+)$/m)?.[1]||'',html:document.html,headings:document.headings,short,explorer,essential,idea:essential?.idea||null,sources:renderMarkdown(sources,file),sourceCount:sourceIds.length,keywords:[id===41?'Gödel Godel Turing connaissance logique calcul information limites intelligence':'',...metadata.labs.filter(l=>l.questions.includes(id)).map(l=>l.title),...extras.glossary.filter(t=>t.questions.includes(id)).flatMap(t=>[t.term,...t.aliases]),...extras.particles.filter(p=>p.questions.includes(id)).map(p=>p.name)].join(' ')});
 }
 for(const [id,a] of Object.entries(extras.answers)){
  const q=questions.find(q=>q.id===Number(id));
  if(!q?.researched||!a.response?.trim()||!a.limit?.trim()||!a.description?.trim()||a.description.length>170||!a.sources?.length)throw Error(`Invalid editorial answer: ${id}`);
  for(const s of a.sources)if(!s.label?.trim()||!/^https:\/\//.test(s.url)||!q.html.includes(esc(s.url)))throw Error(`Answer reference absent from dossier ${id}: ${s.url}`);
 }
 const legal=JSON.parse(await readFile(resolve(root,'content/legal.json'),'utf8'));
 legal.complete=['publisher','publicationDirector','address','email'].every(key=>typeof legal[key]==='string'&&legal[key].trim().length>0);
 const registry=await readFile(resolve(root,'sources/README.md'),'utf8');
 const data={...metadata,...extras,legal,questions,method:renderMarkdown(await readFile(resolve(root,'METHODE.md'),'utf8'),'METHODE.md'),sources:renderMarkdown(registry,'sources/README.md'),schemaVersion:2};
 // Le texte intégral des dossiers (environ deux tiers du poids) est servi à part :
 // data.js garde métadonnées et recherche, chaque page de dossier charge seulement le sien.
 const dossierDir=resolve(root,'atlas/dossiers'),client={...data,questions:[]};
 await rm(dossierDir,{recursive:true,force:true});await mkdir(dossierDir,{recursive:true});
 // Le registre des sources (plusieurs centaines de lignes) n'est lu que sur sa page : même traitement.
 // learning et answers sont déjà portés par chaque question ; inutile de les servir deux fois.
 const registryCode='// Generated by npm run build. Edit sources/README.md instead.\n(window.ATLAS_DOSSIERS=window.ATLAS_DOSSIERS||{}).registre = '+JSON.stringify(data.sources).replace(/</g,'\\u003c')+';\n';
 await writeFile(resolve(dossierDir,'registre.js'),registryCode);
 delete client.sources;delete client.learning;delete client.answers;delete client.essentiels;
 client.registryVersion=createHash('sha256').update(registryCode).digest('hex').slice(0,12);
 for(const q of questions){
  const light=Object.fromEntries(Object.entries(q).filter(([key])=>!DOSSIER_FIELDS.includes(key)));
  if(q.researched){
   const code='// Generated by npm run build. Edit questions/*.md or content/ instead.\n(window.ATLAS_DOSSIERS=window.ATLAS_DOSSIERS||{})['+q.id+'] = '+JSON.stringify(Object.fromEntries(DOSSIER_FIELDS.filter(key=>key!=='explorer'||q.explorer).map(key=>[key,q[key]]))).replace(/</g,'\\u003c')+';\n';
   await writeFile(resolve(dossierDir,q.id+'.js'),code);
   light.contentVersion=createHash('sha256').update(code).digest('hex').slice(0,12);
  }
  client.questions.push(light);
 }
 await writeFile(resolve(root,'atlas/data.js'),'// Generated by npm run build. Edit questions/*.md or content/ instead.\nwindow.ATLAS_DATA = '+JSON.stringify(client).replace(/</g,'\\u003c')+';\n');
 return data;
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){const d=await build();console.log(`Atlas built: ${d.questions.length} questions, ${d.questions.filter(q=>q.researched).length} research dossier, ${d.labs.length} laboratories.`);}
