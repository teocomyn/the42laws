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

 // Expérience interactive d’un dossier (content/explorers/<id>.json) : un système choisi,
 // un verdict par cadre théorique, chaque affirmation renvoyant à une source du dossier.
 const LEVELS=['non','improbable','incertain','possible','oui'];
 const citeList=(q,list)=>list?.length?` <span class="cites">${list.map(id=>`<a class="cite" href="${C.questionPath(q.id)}#src-${esc(id)}">${esc(id)}</a>`).join('')}</span>`:'';
 const levelsOf=(x,s)=>x.frames.map(f=>s.verdicts[f.id].level);
 function explorerBoard(q,pick){
  const x=q.explorer;if(!x)return '';
  const s=x.systems.find(s=>s.id===pick)||x.systems[0],agree=new Set(levelsOf(x,s)).size===1;
  return `<div class="explorer-behaviour"><span class="eyebrow">${esc(x.behaviourLabel)}</span><p>${esc(s.behaviour.text)}${citeList(q,s.behaviour.cites)}</p></div><div class="explorer-verdicts">${x.frames.map(f=>{const v=s.verdicts[f.id];return `<article class="verdict" data-level="${v.level}"><header><h3>${esc(f.label)}</h3><small>${esc(f.detail)}</small></header><div class="verdict-scale" role="img" aria-label="Sur une échelle de non à oui : ${esc(v.label)}"><span style="--at:${LEVELS.indexOf(v.level)/(LEVELS.length-1)}"></span></div><strong class="verdict-label">${esc(v.label)}</strong><p>${esc(v.text)}${citeList(q,v.cites)}</p></article>`;}).join('')}</div><p class="explorer-summary" data-agree="${agree}">${esc(agree?x.agree:x.disagree)}</p>`;
 }
 function explorer(q,pick){
  const x=q.explorer;if(!x)return '';
  const s=x.systems.find(s=>s.id===pick)||x.systems[0];
  return `<section class="explorer" id="experience" aria-labelledby="explorer-title" data-explorer="${q.id}"><div class="explorer-head"><span class="eyebrow">${esc(x.kicker)}</span><h2 id="explorer-title">${esc(x.title)}</h2><p>${esc(x.intro)}</p></div><div class="explorer-systems" role="group" aria-label="${esc(x.choose)}">${x.systems.map((o,i)=>`<button type="button" class="explorer-system" data-explorer-system="${o.id}" aria-pressed="${o===s}"><span class="explorer-index">${String(i+1).padStart(2,'0')}</span><strong>${esc(o.label)}</strong><small>${esc(o.detail)}</small><span class="explorer-dots" aria-hidden="true">${levelsOf(x,o).map(l=>`<i data-level="${l}"></i>`).join('')}</span></button>`).join('')}</div><div class="explorer-board" aria-live="polite">${explorerBoard(q,s.id)}</div><div class="explorer-foot"><p>${esc(x.foot)}${citeList(q,x.footCites)}</p><p class="explorer-prompt"><span>${esc(x.prompt)}</span><a href="#personal-note">${esc(x.promptAction)} <span aria-hidden="true">↓</span></a></p></div></section>`;
 }
 // Version statique (pages publiques sans JavaScript, moteurs) : toute la grille, en tableau.
 function explorerTable(q){
  const x=q.explorer;if(!x)return '';
  return `<section class="explorer explorer-static" id="experience" aria-labelledby="explorer-title"><div class="explorer-head"><span class="eyebrow">${esc(x.kicker)}</span><h2 id="explorer-title">${esc(x.title)}</h2><p>${esc(x.intro)}</p></div><div class="table-wrap"><table><thead><tr><th scope="col">Système</th><th scope="col">${esc(x.behaviourLabel)}</th>${x.frames.map(f=>`<th scope="col">${esc(f.label)}</th>`).join('')}</tr></thead><tbody>${x.systems.map(s=>`<tr><th scope="row">${esc(s.label)}</th><td>${esc(s.behaviour.text)}${citeList(q,s.behaviour.cites)}</td>${x.frames.map(f=>{const v=s.verdicts[f.id];return `<td><strong>${esc(v.label)}</strong>. ${esc(v.text)}${citeList(q,v.cites)}</td>`;}).join('')}</tr>`).join('')}</tbody></table></div><p class="explorer-foot">${esc(x.foot)}${citeList(q,x.footCites)}</p></section>`;
 }
 function fullDocument(q,data){
  const namespace=(html,prefix)=>html.replace(/id="part-/g,`id="${prefix}-part-`);
  return `<div class="page"><div class="reader-head"><a class="eyebrow" href="/domaines/${q.domain}/">← ${esc(q.domainName)} / QUESTION ${q.id}</a><h1>${esc(q.title)}</h1><span class="badge">${esc(q.status)}</span></div>${answer(q)}${overview(q)}${q.researched?`<div class="notice">Synthèse provisoire assistée par IA. Les niveaux de preuve et de consultation des sources sont indiqués ; aucune validation scientifique indépendante n’est revendiquée.</div><article class="prose">${namespace(q.short?.html||'', 'short')}<h2 id="dossier-integral">Dossier approfondi et sources</h2>${namespace(q.html,'full')}</article>${explorerTable(q)}`:'<p>Ce dossier reste à explorer. Aucune synthèse n’est encore publiée.</p>'}${related(q,data)}<nav class="reader-tools" aria-label="Poursuivre"><a href="/dossiers/">Les 42 questions</a><a href="/parcours/">Parcours guidés</a></nav><noscript><p>Le texte et les sources restent lisibles sans JavaScript. Activez JavaScript pour les favoris et le carnet personnel.</p></noscript></div>`;
 }
 const api={answer,related,overview,explorer,explorerBoard,fullDocument};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.DossierView=api;
})(globalThis);
