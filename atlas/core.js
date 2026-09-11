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
  return {version:1,read:ids(data.read),saved:ids(data.saved),notes,labs:Array.isArray(data.labs)?[...new Set(data.labs.filter(x=>['neutrino','antimatiere'].includes(x)))]:[],last:Number.isInteger(data.last)&&data.last>=1&&data.last<=42?data.last:null};
 }
 function parseRoute(hash){
  const [path,query='']=String(hash||'').replace(/^#\/?/,'').split('?');
  return {parts:(path||'accueil').split('/').filter(Boolean),params:new URLSearchParams(query)};
 }
 const api={normalize,escape,filterQuestions,cleanState,parseRoute};
 if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.AtlasCore=api;
})(globalThis);
