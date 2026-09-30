(function(root){
 'use strict';
 const C=typeof module==='object'&&module.exports?require('./core.js'):root.AtlasCore;
 const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const labels={observation:'Observation',resultat:'Résultat sous hypothèses',modele:'Modèle',interpretation:'Interprétation',conjecture:'Conjecture'};
 function answer(q){
  const a=q.researched&&q.answer;if(!a)return '';
  return `<section class="dossier-answer" aria-label="Réponse et limites"><span class="eyebrow">LE POINT DE DÉPART</span><h2>Une réponse, avec ses limites.</h2><p class="answer-lead">${esc(a.response)}</p><div class="answer-limit"><h3>Ce qui reste ouvert</h3><p>${esc(a.limit)}</p></div><div class="answer-references"><span>Références pour commencer</span>${a.sources.map(s=>`<a href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">${esc(s.label)} ↗</a>`).join('')}</div></section>`;
 }
 function related(q,data={}){
  const seen=new Set(),items=(data.connections||[]).filter(e=>e.from===q.id||e.to===q.id).map(e=>({q:(data.questions||[]).find(x=>x.id===(e.from===q.id?e.to:e.from)),label:e.label})).filter(x=>x.q&&!seen.has(x.q.id)&&seen.add(x.q.id)).sort((a,b)=>Number(b.q.researched)-Number(a.q.researched)).slice(0,4);
  if(!items.length)return '';
  return `<nav class="related-dossiers" aria-label="Dossiers pour poursuivre"><div class="section-head"><h2>Pour poursuivre la question.</h2></div><div class="related-grid">${items.map(x=>`<a class="related-dossier" href="${C.questionPath(x.q.id)}"><span class="eyebrow">QUESTION ${String(x.q.id).padStart(2,'0')} · ${x.q.researched?'SYNTHÈSE DISPONIBLE':'À EXPLORER'}</span><h3>${esc(x.q.title)}</h3><p>${esc(x.label)}</p><span class="related-action">${x.q.researched?'Lire le dossier':'Voir la question'} <span aria-hidden="true">↗</span></span></a>`).join('')}</div></nav>`;
 }
 function overview(q){
  const l=q.learning;if(!l)return '';
  return `<section class="learning-overview" aria-label="Repères de lecture"><div class="learning-meta"><span>${esc(l.level)}</span><span>Essentiel · 2 min</span><span>Dossier · ${l.minutes} min environ</span></div><p class="editorial-credit">Rédaction : ${esc(l.author)} · Révision : ${esc(l.revised)}<br>Relecture scientifique : ${esc(l.review)}</p><div class="learning-grid"><div><h2>Avant de commencer</h2><p>${esc(l.prerequisites)}</p></div><div><h2>À l’issue de la lecture</h2><p>${esc(l.goal)}</p></div></div><details class="knowledge-key"><summary>Quelle est la portée de ces affirmations ?</summary><dl>${Object.entries(labels).map(([k,v])=>`<div class="knowledge-item ${k}"><dt>${v}</dt><dd>${esc(l.claims[k]||'Aucune affirmation de ce type retenue dans cette synthèse.')}</dd></div>`).join('')}</dl></details></section>`;
 }
 function fullDocument(q,data){
  const namespace=(html,prefix)=>html.replace(/id="part-/g,`id="${prefix}-part-`);
  return `<div class="page"><div class="reader-head"><a class="eyebrow" href="/domaines/${q.domain}/">← ${esc(q.domainName)} / QUESTION ${q.id}</a><h1>${esc(q.title)}</h1><span class="badge">${esc(q.status)}</span></div>${answer(q)}${overview(q)}${q.researched?`<div class="notice">Synthèse provisoire assistée par IA. Les niveaux de preuve et de consultation des sources sont indiqués ; aucune validation scientifique indépendante n’est revendiquée.</div><article class="prose">${namespace(q.short?.html||'', 'short')}<h2 id="dossier-integral">Dossier approfondi et sources</h2>${namespace(q.html,'full')}</article>`:'<p>Ce dossier reste à explorer. Aucune synthèse n’est encore publiée.</p>'}${related(q,data)}<nav class="reader-tools" aria-label="Poursuivre"><a href="/dossiers/">Les 42 questions</a><a href="/parcours/">Parcours guidés</a></nav><noscript><p>Le texte et les sources restent lisibles sans JavaScript. Activez JavaScript pour les favoris et le carnet personnel.</p></noscript></div>`;
 }
 const api={answer,related,overview,fullDocument};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.DossierView=api;
})(globalThis);
