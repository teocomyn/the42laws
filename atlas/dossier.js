(function(root){
 'use strict';
 const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const labels={observation:'Observation',resultat:'Résultat sous hypothèses',modele:'Modèle',interpretation:'Interprétation',conjecture:'Conjecture'};
 function overview(q){
  const l=q.learning;if(!l)return '';
  return `<section class="learning-overview" aria-label="Repères de lecture"><div class="learning-meta"><span>${esc(l.level)}</span><span>Essentiel · 2 min</span><span>Dossier · ${l.minutes} min environ</span></div><p class="editorial-credit">Rédaction : ${esc(l.author)} · Révision : ${esc(l.revised)}<br>Relecture scientifique : ${esc(l.review)}</p><div class="learning-grid"><div><h2>Avant de commencer</h2><p>${esc(l.prerequisites)}</p></div><div><h2>À l’issue de la lecture</h2><p>${esc(l.goal)}</p></div></div><details class="knowledge-key"><summary>Quelle est la portée de ces affirmations ?</summary><dl>${Object.entries(labels).map(([k,v])=>`<div class="knowledge-item ${k}"><dt>${v}</dt><dd>${esc(l.claims[k]||'Aucune affirmation de ce type retenue dans cette synthèse.')}</dd></div>`).join('')}</dl></details></section>`;
 }
 function fullDocument(q){
  const namespace=(html,prefix)=>html.replace(/id="part-/g,`id="${prefix}-part-`);
  return `<div class="page"><div class="reader-head"><a class="eyebrow" href="/#/atlas?d=${q.domain}">← ${esc(q.domainName)} / QUESTION ${q.id}</a><h1>${esc(q.title)}</h1><span class="badge">${esc(q.status)}</span></div>${overview(q)}${q.researched?`<div class="notice">Synthèse provisoire assistée par IA. Les niveaux de preuve et de consultation des sources sont indiqués ; aucune validation scientifique indépendante n’est revendiquée.</div><article class="prose">${namespace(q.short?.html||'', 'short')}<h2 id="dossier-integral">Dossier approfondi et sources</h2>${namespace(q.html,'full')}</article>`:'<p>Ce dossier reste à explorer. Aucune synthèse n’est encore publiée.</p>'}<nav class="reader-tools" aria-label="Poursuivre"><a href="/dossiers/">Les 42 questions</a><a href="/#/parcours">Parcours guidés</a></nav><noscript><p>Le texte et les sources restent lisibles sans JavaScript. Activez JavaScript pour les favoris et le carnet personnel.</p></noscript></div>`;
 }
 const api={overview,fullDocument};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.DossierView=api;
})(globalThis);
