(function(root){
 'use strict';
 const normalize=value=>String(value??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[’']/g,' ');
 const escape=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 function filterQuestions(questions,{query='',domain='all',status='all',savedOnly=false,saved=[]}={}){
  const words=normalize(query).trim().split(/\s+/).filter(Boolean);
  return questions.filter(q=>(domain==='all'||q.domain===domain)&&(status==='all'||(status==='draft'?!q.researched:q.researched))&&(!savedOnly||saved.includes(q.id))&&words.every(w=>normalize(q.id+' '+q.title+' '+q.domainName+' '+(q.keywords||'')).includes(w)));
 }
 function cleanState(value){
  const data=value&&typeof value==='object'?value:{};
  const ids=v=>Array.isArray(v)?[...new Set(v.filter(x=>Number.isInteger(x)&&x>=1&&x<=42))]:[];
  const notes={};if(data.notes&&typeof data.notes==='object')for(const [id,text] of Object.entries(data.notes)){if(/^\d{1,2}$/.test(id)&&Number(id)>=1&&Number(id)<=42&&typeof text==='string')notes[Number(id)]=text.slice(0,50000);}
  return {version:1,read:ids(data.read),saved:ids(data.saved),notes,labs:Array.isArray(data.labs)?[...new Set(data.labs.filter(x=>['neutrino','antimatiere','photon','temps'].includes(x)))]:[],last:Number.isInteger(data.last)&&data.last>=1&&data.last<=42?data.last:null};
 }
 function parseRoute(hash){
  const [path,query='']=String(hash||'').replace(/^#\/?/,'').split('?');
  return {parts:(path||'accueil').split('/').filter(Boolean),params:new URLSearchParams(query)};
 }
 function parseNotebookJSON(text){
  if(typeof text!=='string'||text.length>10000000)throw new Error('Fichier trop volumineux.');
  let d;try{d=JSON.parse(text);}catch{throw new Error('Le fichier ne contient pas de JSON valide.');}
  if(!d||d.application!=='The42laws'||d.version!==1)throw new Error('Export The42laws version 1 attendu.');
  for(const key of ['read','saved'])if(!Array.isArray(d[key])||d[key].length>1000||d[key].some(x=>!Number.isInteger(x)||x<1||x>42))throw new Error('Liste de questions invalide.');
  if(!d.notes||typeof d.notes!=='object'||Array.isArray(d.notes))throw new Error('Notes invalides.');
  for(const [key,v] of Object.entries(d.notes))if(!/^(?:[1-9]|[1-3][0-9]|4[0-2])$/.test(key)||typeof v!=='string'||v.length>50000)throw new Error('Une note est invalide ou trop longue.');
  if(!Array.isArray(d.labs)||d.labs.some(x=>!['neutrino','antimatiere','photon','temps'].includes(x)))throw new Error('Liste des laboratoires invalide.');
  if(d.last!==null&&(!Number.isInteger(d.last)||d.last<1||d.last>42))throw new Error('Dernière lecture invalide.');
  return cleanState(d);
 }
 function mergeNotebook(current,incoming,preferIncoming=false){
  const a=cleanState(current),b=cleanState(incoming);
  return cleanState({read:[...a.read,...b.read],saved:[...a.saved,...b.saved],labs:[...a.labs,...b.labs],notes:preferIncoming?{...a.notes,...b.notes}:{...b.notes,...a.notes},last:a.last||b.last});
 }
 const api={normalize,escape,filterQuestions,cleanState,parseRoute,parseNotebookJSON,mergeNotebook};
 if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.AtlasCore=api;
})(globalThis);
