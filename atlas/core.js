(function(root){
 'use strict';
 const normalize=value=>String(value??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[’']/g,' ');
 const escape=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 function filterQuestions(questions,{query='',domain='all',status='all',savedOnly=false,saved=[]}={}){
  const words=normalize(query).trim().split(/\s+/).filter(Boolean);
  return questions.filter(q=>(domain==='all'||q.domain===domain)&&(status==='all'||(status==='draft'?!q.researched:q.researched))&&(!savedOnly||saved.includes(q.id))&&words.every(w=>normalize(q.id+' '+q.title+' '+q.domainName+' '+(q.keywords||'')).includes(w)));
 }
 const guideIds={neutrino:'oscillations',antimatiere:'energie',photon:'chemins',temps:'entropie','navier-stokes':'dissipation',relativite:'horloges','trou-noir':'horizon'};
 function cleanExperience(value,key,strict=false){
  const fail=()=>{if(strict)throw Error('Expérience invalide.');return null;};
  if(!value||typeof value!=='object'||Array.isArray(value)||!Object.hasOwn(guideIds,value.laboratory)||guideIds[value.laboratory]!==value.guide||key!==`${value.laboratory}:${value.guide}`)return fail();
  const text=(v,max)=>{if(strict&&(typeof v!=='string'||v.length>max))throw Error('Texte d’expérience invalide.');return typeof v==='string'?v.slice(0,max):'';};
  const map=v=>{if(!v||typeof v!=='object'||Array.isArray(v)){if(strict)throw Error('Réglages ou relevés invalides.');return {};}
   const result={};if(strict&&Object.keys(v).length>60)throw Error('Trop de réglages ou relevés.');
   for(const [k,x]of Object.entries(v).slice(0,60)){if(!k||k.length>100||['__proto__','constructor','prototype'].includes(k)||!(['string','number','boolean'].includes(typeof x))||typeof x==='number'&&!Number.isFinite(x)||typeof x==='string'&&x.length>300){if(strict)throw Error('Valeur de relevé invalide.');continue;}result[k]=x;}return result;};
  const stamp=v=>{if(v===undefined||v==='')return '';if(typeof v==='string'&&v.length<=40&&Number.isFinite(Date.parse(v)))return v;if(strict)throw Error('Date d’expérience invalide.');return '';};
  const captures={};if(value.captures&&typeof value.captures==='object'&&!Array.isArray(value.captures)){for(const [slot,c]of Object.entries(value.captures)){if(!['A','B'].includes(slot)||!c||typeof c!=='object'){if(strict)throw Error('Relevé A/B invalide.');continue;}captures[slot]={time:stamp(c.time),settings:map(c.settings),results:map(c.results)};}}else if(strict)throw Error('Relevés invalides.');
  if(strict&&(!Number.isInteger(value.modelVersion)||value.modelVersion<1||value.modelVersion>100))throw Error('Version de modèle invalide.');
  return {laboratory:value.laboratory,guide:value.guide,modelVersion:Number.isInteger(value.modelVersion)?value.modelVersion:1,title:text(value.title??value.guide,200),question:Number.isInteger(value.question)&&value.question>=1&&value.question<=42?value.question:null,prediction:text(value.prediction,3000),explanation:text(value.explanation,3000),settings:map(value.settings||{}),captures,limit:text(value.limit||'',2000),createdAt:stamp(value.createdAt),updatedAt:stamp(value.updatedAt)};
 }
 function cleanExperiences(value,strict=false){
  if(value===undefined)return {};if(!value||typeof value!=='object'||Array.isArray(value)){if(strict)throw Error('Liste des expériences invalide.');return {};}
  if(strict&&Object.keys(value).length>7)throw Error('Trop d’expériences.');const result={};for(const [key,item]of Object.entries(value).slice(0,7)){const e=cleanExperience(item,key,strict);if(e)result[key]=e;}return result;
 }
 function cleanState(value){
  const data=value&&typeof value==='object'?value:{};
  const ids=v=>Array.isArray(v)?[...new Set(v.filter(x=>Number.isInteger(x)&&x>=1&&x<=42))]:[];
  const notes={};if(data.notes&&typeof data.notes==='object')for(const [id,text] of Object.entries(data.notes)){if(/^\d{1,2}$/.test(id)&&Number(id)>=1&&Number(id)<=42&&typeof text==='string')notes[Number(id)]=text.slice(0,50000);}
  return {version:2,read:ids(data.read),saved:ids(data.saved),notes,experiences:cleanExperiences(data.experiences),labs:Array.isArray(data.labs)?[...new Set(data.labs.filter(x=>Object.hasOwn(guideIds,x)))]:[],last:Number.isInteger(data.last)&&data.last>=1&&data.last<=42?data.last:null};
 }
 function parseRoute(hash){
  const [path,query='']=String(hash||'').replace(/^#\/?/,'').split('?');
  return {parts:(path||'accueil').split('/').filter(Boolean),params:new URLSearchParams(query)};
 }
 function canonicalHref(href){
  const match=String(href).match(/^(?:\/?index\.html)?#\/question\/(\d+)(?:\?(.*))?$/);
  if(match)return '/dossiers/'+Number(match[1])+'/'+(match[2]?'?'+match[2]:'');
  if(href.startsWith('#/'))return '/'+href;
  return href;
 }
 function locationRoute(pathname,search,hash){
  if(hash.startsWith('#/'))return parseRoute(hash);
  const match=pathname.match(/^\/dossiers\/(\d+)\/(?:index\.html)?$/);
  if(match)return {parts:['question',match[1]],params:new URLSearchParams(search)};
  if(pathname==='/dossiers/'||pathname==='/dossiers/index.html')return {parts:['atlas'],params:new URLSearchParams(search)};
  if(/^\/(confidentialite|mentions-legales)\/(?:index\.html)?$/.test(pathname))return {parts:[pathname.split('/')[1]],params:new URLSearchParams(search)};
  return parseRoute(hash);
 }
 function parseNotebookJSON(text){
  if(typeof text!=='string'||text.length>10000000)throw new Error('Fichier trop volumineux.');
  let d;try{d=JSON.parse(text);}catch{throw new Error('Le fichier ne contient pas de JSON valide.');}
  if(!d||d.application!=='The42laws')throw new Error('Export The42laws attendu.');
  // Old stand-alone guide exports can also be added to the shared notebook.
  if(d.version===undefined&&d.laboratory&&d.guide){const key=`${d.laboratory}:${d.guide}`,experience=cleanExperience({...d,title:d.guide,modelVersion:1,settings:d.captures?.B?.settings||d.captures?.A?.settings||{}},key,true);return cleanState({experiences:{[key]:experience},labs:[d.laboratory]});}
  if(![1,2].includes(d.version))throw new Error('Export The42laws version 1 ou 2 attendu.');
  for(const key of ['read','saved'])if(!Array.isArray(d[key])||d[key].length>1000||d[key].some(x=>!Number.isInteger(x)||x<1||x>42))throw new Error('Liste de questions invalide.');
  if(!d.notes||typeof d.notes!=='object'||Array.isArray(d.notes))throw new Error('Notes invalides.');
  for(const [key,v] of Object.entries(d.notes))if(!/^(?:[1-9]|[1-3][0-9]|4[0-2])$/.test(key)||typeof v!=='string'||v.length>50000)throw new Error('Une note est invalide ou trop longue.');
  if(!Array.isArray(d.labs)||d.labs.some(x=>!['neutrino','antimatiere','photon','temps','navier-stokes','relativite','trou-noir'].includes(x)))throw new Error('Liste des laboratoires invalide.');
  if(d.last!==null&&(!Number.isInteger(d.last)||d.last<1||d.last>42))throw new Error('Dernière lecture invalide.');
  if(d.version===2&&d.experiences===undefined)throw new Error('Expériences manquantes dans le carnet version 2.');
  cleanExperiences(d.experiences,true);
  return cleanState(d);
 }
 function mergeNotebook(current,incoming,preferIncoming=false){
  const a=cleanState(current),b=cleanState(incoming);
  return cleanState({read:[...a.read,...b.read],saved:[...a.saved,...b.saved],labs:[...a.labs,...b.labs],notes:preferIncoming?{...a.notes,...b.notes}:{...b.notes,...a.notes},experiences:preferIncoming?{...a.experiences,...b.experiences}:{...b.experiences,...a.experiences},last:a.last||b.last});
 }
 const api={guideIds,cleanExperience,canonicalHref,locationRoute,normalize,escape,filterQuestions,cleanState,parseRoute,parseNotebookJSON,mergeNotebook};
 if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.AtlasCore=api;
})(globalThis);
