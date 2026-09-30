(function(root){
 'use strict';
 const home={title:'The42laws — Un atlas du réel',description:'42 questions pour explorer la réalité. Un atlas de recherche, des expériences interactives et un carnet pour penser par soi-même.',path:'/',robots:'index,follow'};
 function pageMetadata(data,parts=['accueil'],params=new URLSearchParams()){
  const route=parts[0];let m={...home};
  const pages={atlas:['Les 42 questions','Une carte des 42 questions, réparties en sept domaines, avec leurs synthèses et leur état de recherche.'],laboratoires:['Laboratoires','Sept expériences interactives pour explorer les modèles et leurs limites.'],particules:['Tableau des particules','Les familles du Modèle standard, leurs propriétés et leurs expériences.'],liens:['Carte des liens','Relier les 42 questions et suivre leurs connexions éditoriales.'],parcours:['Parcours guidés','Cinq itinéraires pour apprendre en reliant dossiers et expériences.'],glossaire:['Glossaire','Des définitions pour mieux comprendre les dossiers de The42laws.'],methode:['Notre méthode','Distinguer observation, résultat mathématique, modèle, hypothèse et argument philosophique.'],sources:['Registre des sources','Les références de The42laws, leurs dates et leurs niveaux de consultation.'],apropos:['Le projet','The42laws : un atlas de recherche et un carnet pour explorer le réel.'],carnet:['Mon carnet','Vos lectures, favoris, notes et expériences conservés dans ce navigateur.'],confidentialite:['Confidentialité et cookies','Comprendre le stockage du carnet, la mesure d’audience et vos choix de confidentialité.'], 'mentions-legales':['Mentions légales','Informations sur l’édition, l’hébergement et les contenus de The42laws.']};
  if(route==='question'){
   const q=data.questions.find(q=>q.id===Number(parts[1]));
   if(!q)return {...m,title:'Page introuvable — The42laws',description:'Cette question n’existe pas.',robots:'noindex,follow'};
   return {...m,title:`${q.title} — The42laws`,description:`Question ${q.id} — ${q.status}. ${q.learning?.goal||'Un dossier à explorer dans The42laws.'}`,path:`/dossiers/${q.id}/`,robots:q.researched?'index,follow':'noindex,follow'};
  }
  if(pages[route]){const [title,description]=pages[route];m={...m,title:`${title} — The42laws`,description};}
  if(route==='atlas')m.path='/dossiers/';
  if(route==='parcours'&&parts[1]){const p=data.paths.find(p=>p.id===parts[1]);if(p)m={...m,title:`${p.title} — The42laws`,description:p.description};else m.robots='noindex,follow';}
  if(route==='confidentialite'||route==='mentions-legales')m.path=`/${route}/`;
  if(route==='mentions-legales'&&!data.legal?.complete)m.robots='noindex,follow';
  if(route==='carnet'||params.get('q'))m.robots='noindex,follow';
  if(!pages[route]&&route!=='accueil')m={...m,title:'Page introuvable — The42laws',description:'Cette page n’existe pas.',robots:'noindex,follow'};
  return m;
 }
 function headMarkup(meta,base='',escape=s=>s){
  const tag=(key,value,property=false)=>`<meta ${property?'property':'name'}="${key}" content="${escape(value)}">`;
  let html=tag('description',meta.description)+tag('robots',meta.robots)+tag('og:title',meta.title,true)+tag('og:description',meta.description,true)+tag('og:type','website',true)+tag('og:locale','fr_FR',true)+tag('twitter:card','summary_large_image')+tag('twitter:title',meta.title)+tag('twitter:description',meta.description);
  if(base){const url=new URL(meta.path,base).href,image=new URL('atlas/brand-share-black-hole.png',base).href,alt='The42laws — un atlas du réel autour d’un trou noir';html+=`<link rel="canonical" href="${escape(url)}">`+tag('og:url',url,true)+tag('og:image',image,true)+tag('og:image:secure_url',image,true)+tag('og:image:type','image/png',true)+tag('og:image:width','1200',true)+tag('og:image:height','630',true)+tag('og:image:alt',alt,true)+tag('twitter:image',image)+tag('twitter:image:alt',alt);}
  return html;
 }
 function applyMetadata(document,meta){
  document.title=meta.title;
  function set(selector,attributes){let el=document.querySelector(selector);if(!el){el=document.createElement('meta');document.head.append(el);}for(const [key,value]of Object.entries(attributes))el.setAttribute(key,value);}
  for(const [name,content]of Object.entries({description:meta.description,robots:meta.robots,'twitter:title':meta.title,'twitter:description':meta.description}))set(`meta[name="${name}"]`,{name,content});
  for(const [property,content]of Object.entries({'og:title':meta.title,'og:description':meta.description}))set(`meta[property="${property}"]`,{property,content});
  const canonical=document.querySelector('link[rel="canonical"]');if(canonical){canonical.href=new URL(meta.path,canonical.href).href;set('meta[property="og:url"]',{property:'og:url',content:canonical.href});}
 }
 const api={pageMetadata,headMarkup,applyMetadata};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.AtlasMetadata=api;
})(globalThis);
