import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
import {createRequire} from 'node:module';
import {renderMarkdown,resolveLink,checkExplorer} from '../scripts/build-atlas.mjs';
const require=createRequire(import.meta.url),C=require('../atlas/core.js');
const D=require('./atlas-data.cjs').loadAtlasData();
test('atlas preserves all 42 questions, seven domains and current research states',()=>{assert.deepEqual(D.questions.map(q=>q.id),Array.from({length:42},(_,i)=>i+1));assert.equal(D.domains.length,7);assert.deepEqual(D.questions.filter(q=>q.researched).map(q=>q.id),Array.from({length:42},(_,i)=>i+1));assert.equal(D.questions[40].sourceCount,63);for(const q of D.questions){assert.ok(q.title);assert.ok(D.domains.some(d=>d.id===q.domain&&q.id>=d.range[0]&&q.id<=d.range[1]));}});
test('search is accent insensitive and combines domain and research filters',()=>{assert.deepEqual(C.filterQuestions(D.questions,{query:'godel'}).map(q=>q.id),[41]);assert.deepEqual(C.filterQuestions(D.questions,{query:'Lean'}).map(q=>q.id),[23,36,39,41]);assert.deepEqual(C.filterQuestions(D.questions,{domain:'sens',status:'ready'}).map(q=>q.id),[40,41,42]);assert.deepEqual(C.filterQuestions(D.questions,{domain:'physique',status:'ready'}).map(q=>q.id),[15,16,17,18,19,20,21,22,23]);assert.deepEqual(C.filterQuestions(D.questions.map(q=>q.id===16?{...q,researched:false}:q),{domain:'physique',status:'draft'}).map(q=>q.id),[16]);assert.ok(C.filterQuestions(D.questions,{query:'mecanique quantique'}).length>0);assert.deepEqual(C.filterQuestions(D.questions,{savedOnly:true,saved:[5,41]}).map(q=>q.id),[5,41]);});
test('invalid or oversized persisted state is safely constrained',()=>{const s=C.cleanState({read:[41,41,-1,43,'2'],saved:[1,null],notes:{41:'x'.repeat(60000),0:'bad',43:'bad',2:{a:1}},labs:['neutrino','bad','neutrino'],last:99});assert.deepEqual(s.read,[41]);assert.deepEqual(s.saved,[1]);assert.equal(s.notes[41].length,50000);assert.equal(Object.keys(s.notes).length,1);assert.equal(s.last,null);assert.deepEqual(s.labs,['neutrino']);assert.equal(C.cleanState(null).read.length,0);});
test('Markdown links navigate the atlas and reject executable protocols',()=>{assert.equal(resolveLink('19.md','questions/41.md'),C.questionPath(19));assert.equal(resolveLink('../METHODE.md','questions/41.md'),'/methode/');assert.equal(resolveLink('../sources/README.md','questions/41.md'),'/sources/');for(const url of ['javascript:alert(1)','data:text/html,test','//evil.test','../../outside'])assert.equal(resolveLink(url,'questions/41.md'),'#');const doc=renderMarkdown('<script>alert(1)</script>\n\n[x](javascript:alert)\n\n## Hello\n\n| A | B |\n|---|---|\n| 1 | 2 |');assert.ok(!doc.html.includes('<script>'));assert.ok(!doc.html.includes('href="javascript:'));assert.ok(doc.html.includes('<th scope="col">'));assert.equal(doc.headings[0].id,'part-1');});
test('routes preserve encoded queries and defaults',()=>{assert.deepEqual(C.parseRoute('').parts,['accueil']);const r=C.parseRoute('#/question/41?lecture=sources');assert.deepEqual(r.parts,['question','41']);assert.equal(r.params.get('lecture'),'sources');assert.equal(C.parseRoute('#/atlas?q=%C3%A9nergie').params.get('q'),'énergie');});
test('all guided steps point to existing content',()=>{for(const path of D.paths)for(const s of path.steps)assert.ok(s.type==='question'?D.questions.some(q=>q.id===s.id):D.labs.some(l=>l.id===s.id));});
test('canonical dossier addresses preserve modes and legacy bookmarks',()=>{
 assert.equal(C.canonicalHref('#/question/19?lecture=sources'),C.questionPath(19)+'?lecture=sources');
 assert.equal(C.canonicalHref('#/atlas?q=temps'),'/dossiers/?q=temps');
 assert.equal(C.canonicalHref('https://example.org/#/question/19'),'https://example.org/#/question/19');
 assert.deepEqual(C.locationRoute('/dossiers/26/','?lecture=complet','').parts,['question','26']);
 assert.equal(C.locationRoute('/dossiers/26/','?lecture=complet','').params.get('lecture'),'complet');
 assert.deepEqual(C.locationRoute(C.questionPath(19),'','#part-2').parts,['question','19']);
 assert.deepEqual(C.locationRoute('/index.html','','#/question/25').parts,['question','25']);
});
test('every required path step has a real synthesis and every synthesis has reading landmarks',()=>{
 for(const p of D.paths)for(const step of p.steps){if(step.type==='question')assert.ok(D.questions.find(q=>q.id===step.id)?.researched,`${p.id}: ${step.id} is empty`);}
 for(const q of D.questions.filter(q=>q.researched)){
  assert.ok(q.short?.html&&q.sourceCount>0,`Question ${q.id}: summary/sources missing`);
  assert.ok(q.learning?.goal&&q.learning?.review&&q.learning?.prerequisites,`Question ${q.id}: landmarks missing`);
 }
 for(const id of [1,19,25,26,30,32,33,34,35,36]){
  const q=D.questions.find(q=>q.id===id);
  for(const heading of ['Prérequis','Dossier approfondi','Expérience ou exemple','Objections et limites','Questions encore ouvertes','Sources vérifiées'])assert.ok(q.headings.some(h=>h.title===heading),`${id}: missing ${heading}`);
 }
});
test('New laboratory explorations round-trip with existing notebook data',()=>{
 const notebook=C.cleanState({labs:['neutrino','navier-stokes','relativite'],read:[41],notes:{41:'Note conservée'},last:41});
 const restored=C.parseNotebookJSON(JSON.stringify({application:'The42laws',...notebook}));
 assert.deepEqual(restored,notebook);
});
test('dossier text ships separately: light data.js, one fingerprinted content file per synthesis',async()=>{
 const {createHash}=await import('node:crypto');
 const raw=await readFile(new URL('../atlas/data.js',import.meta.url),'utf8'),context={window:{}};vm.runInNewContext(raw,context);
 const light=context.window.ATLAS_DATA;
 assert.ok(raw.length<260*1024,`data.js weighs ${Math.round(raw.length/1024)} KB`);
 for(const q of light.questions){
  for(const key of ['html','headings','short','sources'])assert.ok(!(key in q),`question ${q.id} still embeds ${key}`);
  if(!q.researched){assert.equal(q.contentVersion,undefined);continue;}
  const code=await readFile(new URL(`../atlas/dossiers/${q.id}.js`,import.meta.url),'utf8');
  assert.equal(createHash('sha256').update(code).digest('hex').slice(0,12),q.contentVersion);
  const box={window:{}};vm.runInNewContext(code,box);assert.ok(box.window.ATLAS_DOSSIERS[q.id].html.length>200);
 }
});

test('source citations link to their row on the dossier page and every cited source exists',async()=>{
 const {renderMarkdown:render}=await import('../scripts/build-atlas.mjs');
 const doc=render('Voir [S300] et [S492, rapporté d’après S489].\n\n| Id | Réf |\n| --- | --- |\n| S300 | a |\n| S489 | b |','questions/19.md');
 assert.ok(doc.html.includes(`<span class="cites"><a class="cite" href="${C.questionPath(19)}#src-S300">S300</a></span>`));
 assert.ok(doc.html.includes(`[<a class="cite" href="${C.questionPath(19)}#src-S492">S492</a>, rapporté d’après`));
 assert.ok(doc.html.includes('<tr id="src-S300">')&&doc.html.includes('<tr id="src-S489">'));
 assert.ok(render('[S300]','METHODE.md').html.includes('href="#src-S300"'));
 for(const q of D.questions.filter(q=>q.researched)){
  const ids=new Set([...q.html.matchAll(/<tr id="src-(S\d{3})">/g)].map(m=>m[1]));
  for(const [,id] of `${q.html}${q.short?.html||''}`.matchAll(/class="cite" href="[^"]*#src-(S\d{3})"/g))assert.ok(ids.has(id),`Question ${q.id}: ${id} cited without a source row`);
 }
});

test('dossier explorers cite only their own sources and render every verdict',async()=>{
 const V=require('../atlas/dossier.js'),x=JSON.parse(await readFile(new URL('../content/explorers/39.json',import.meta.url),'utf8'));
 const md=await readFile(new URL('../questions/39.md',import.meta.url),'utf8'),ids=[...md.matchAll(/^\| (S\d{3}) \|/gm)].map(m=>m[1]);
 assert.equal(checkExplorer(x,39,ids),x);
 const q={id:39,explorer:x},html=V.explorer(q,'emulation');
 assert.match(html,/data-explorer-system="emulation" aria-pressed="true"/);
 assert.equal((html.match(/aria-pressed="true"/g)||[]).length,1);
 assert.equal((html.match(/class="verdict"/g)||[]).length,x.frames.length);
 assert.match(html,/Les théories divergent/);
 assert.match(V.explorerBoard(q,'brain'),/data-agree="true"/);
 for(const m of html.matchAll(/href="([^"]+)#src-(S\d{3})"/g)){assert.equal(m[1],C.questionPath(39));assert.ok(ids.includes(m[2]),m[2]);}
 const table=V.explorerTable?V.explorerTable(q):V.fullDocument({...q,researched:true,html:'',short:{html:''},title:'',domain:'conscience',domainName:'',status:''},{});
 assert.equal((table.match(/<tr><th scope="row">/g)||[]).length,x.systems.length);
 const broken=structuredClone(x);broken.systems[0].verdicts.iit.cites=['S001'];
 assert.throws(()=>checkExplorer(broken,39,ids),/S001, absent/);
 const missing=structuredClone(x);delete missing.systems[1].verdicts.vivant;
 assert.throws(()=>checkExplorer(missing,39,ids),/agent\/vivant/);
});
