import {readFile,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../',import.meta.url));
export function questionRedirects(seo){return Object.entries(seo.questions).flatMap(([id,item])=>[`/dossiers/${id}/index.html`,`/dossiers/${id}/`,`/dossiers/${id}`].map(source=>({source,destination:`/dossiers/${item.slug}/`,permanent:true})));}
export function permanentRedirects(seo){
 const paths=[...Object.values(seo.questions).map(item=>`/dossiers/${item.slug}/`),...Object.keys(seo.routes).filter(path=>!path.includes('#')&&path!=='/')];
 // Anciennes adresses déclarées dans le registre (par exemple un Markdown remplacé par une page HTML).
 const aliases=Object.entries(seo.routes).flatMap(([destination,item])=>(item.aliases||[]).map(source=>({source,destination,permanent:true})));
 return [...questionRedirects(seo),{source:'/index.html',destination:'/',permanent:true},...paths.flatMap(destination=>[destination.slice(0,-1),destination+'index.html'].map(source=>({source,destination,permanent:true}))),...aliases];
}
export function validateSEO(seo){
 const ids=Object.keys(seo.questions);if(ids.length!==42||ids.some((id,i)=>Number(id)!==i+1))throw Error('SEO must describe the 42 numbered questions.');
 const slugs=ids.map(id=>seo.questions[id].slug);if(new Set(slugs).size!==42||slugs.some(s=>!/^[a-z]+(?:-[a-z0-9]+)*$/.test(s)))throw Error('Unique stable lowercase slugs required.');
 const titles=new Set(),descriptions=new Set();
 for(const item of [...Object.values(seo.questions),...Object.values(seo.routes)]){
  if(typeof item.title!=='string'||item.title.length<12||item.title.length>74||typeof item.description!=='string'||item.description.length<70||item.description.length>180)throw Error('Editorial SEO fields missing or outside the chosen writing budget: '+item.title);
  if(titles.has(item.title)||descriptions.has(item.description))throw Error('Duplicate SEO fields: '+item.title);titles.add(item.title);descriptions.add(item.description);
 }
 const canonical=new Set([...slugs.map(slug=>`/dossiers/${slug}/`),...Object.keys(seo.routes)]),aliases=new Set();
 for(const item of Object.values(seo.routes))for(const alias of item.aliases||[]){
  if(typeof alias!=='string'||!alias.startsWith('/')||alias.includes('#')||canonical.has(alias)||aliases.has(alias))throw Error('Invalid or duplicate redirect alias: '+alias);aliases.add(alias);
 }
}
export async function checkSEO(){
 const seo=JSON.parse(await readFile(resolve(root,'content/seo.json'),'utf8'));validateSEO(seo);
 const atlas=JSON.parse(await readFile(resolve(root,'content/atlas.json'),'utf8'));
 const required=['/','/dossiers/','/laboratoires/','/parcours/','/glossaire/','/methode/','/sources/','/particules/','/liens/','/apropos/','/confidentialite/','/mentions-legales/','/#/carnet',...atlas.domains.map(d=>`/domaines/${d.id}/`),...atlas.paths.map(p=>`/parcours/${p.id}/`),...atlas.labs.map(l=>'/'+l.url.replace('index.html',''))];
 for(const path of required)if(!seo.routes[path])throw Error('SEO metadata missing for '+path);
 const config=JSON.parse(await readFile(resolve(root,'vercel.json'),'utf8'));if(config.trailingSlash!==undefined)throw Error('Use explicit canonical redirects to avoid Vercel trailing-slash chains.');if(JSON.stringify(config.redirects)!==JSON.stringify(permanentRedirects(seo)))throw Error('Redirects differ from the SEO registry. Run npm run sync:seo and commit vercel.json.');return seo;
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const seo=JSON.parse(await readFile(resolve(root,'content/seo.json'),'utf8'));validateSEO(seo);const path=resolve(root,'vercel.json'),config=JSON.parse(await readFile(path,'utf8'));delete config.trailingSlash;config.redirects=permanentRedirects(seo);await writeFile(path,JSON.stringify(config,null,2)+'\n');
 const atlas=JSON.parse(await readFile(resolve(root,'content/atlas.json'),'utf8')),esc=s=>s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 for(const file of ['index.html',...atlas.labs.map(l=>l.url)]){const item=seo.routes[file==='index.html'?'/':'/'+file.replace('index.html','')];if(!item)throw Error('SEO missing for '+file);const path=resolve(root,file),html=await readFile(path,'utf8');await writeFile(path,html.replace(/<title>.*?<\/title>/s,`<title>${esc(item.title)} — The42laws</title>`).replace(/<meta name="description" content="[^"]*"\s*\/?\s*>/,`<meta name="description" content="${esc(item.description)}">`));}
 console.log(`SEO registry checked; ${config.redirects.length} permanent redirects and ${1+atlas.labs.length} source heads synchronized.`);
}
