import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
import {createRequire} from 'node:module';
import {renderMarkdown,resolveLink} from '../scripts/build-atlas.mjs';
const require=createRequire(import.meta.url),C=require('../atlas/core.js');
const context={window:{}};vm.runInNewContext(await readFile(new URL('../atlas/data.js',import.meta.url),'utf8'),context);const D=JSON.parse(JSON.stringify(context.window.ATLAS_DATA));
test('atlas preserves all 42 questions, seven domains and current research states',()=>{assert.deepEqual(D.questions.map(q=>q.id),Array.from({length:42},(_,i)=>i+1));assert.equal(D.domains.length,7);assert.deepEqual(D.questions.filter(q=>q.researched).map(q=>q.id),[1,10,15,19,23,25,26,30,32,36,41]);assert.equal(D.questions[40].sourceCount,57);for(const q of D.questions){assert.ok(q.title);assert.ok(D.domains.some(d=>d.id===q.domain&&q.id>=d.range[0]&&q.id<=d.range[1]));}});
test('search is accent insensitive and combines domain and research filters',()=>{assert.deepEqual(C.filterQuestions(D.questions,{query:'godel'}).map(q=>q.id),[41]);assert.deepEqual(C.filterQuestions(D.questions,{domain:'sens',status:'ready'}).map(q=>q.id),[41]);assert.deepEqual(C.filterQuestions(D.questions,{domain:'physique',status:'ready'}).map(q=>q.id),[15,19,23]);assert.ok(C.filterQuestions(D.questions,{query:'mecanique quantique'}).length>0);assert.deepEqual(C.filterQuestions(D.questions,{savedOnly:true,saved:[5,41]}).map(q=>q.id),[5,41]);});
test('invalid or oversized persisted state is safely constrained',()=>{const s=C.cleanState({read:[41,41,-1,43,'2'],saved:[1,null],notes:{41:'x'.repeat(60000),0:'bad',43:'bad',2:{a:1}},labs:['neutrino','bad','neutrino'],last:99});assert.deepEqual(s.read,[41]);assert.deepEqual(s.saved,[1]);assert.equal(s.notes[41].length,50000);assert.equal(Object.keys(s.notes).length,1);assert.equal(s.last,null);assert.deepEqual(s.labs,['neutrino']);assert.equal(C.cleanState(null).read.length,0);});
test('Markdown links navigate the atlas and reject executable protocols',()=>{assert.equal(resolveLink('19.md','questions/41.md'),'/dossiers/19/');assert.equal(resolveLink('../METHODE.md','questions/41.md'),'/#/methode');assert.equal(resolveLink('../sources/README.md','questions/41.md'),'/#/sources');for(const url of ['javascript:alert(1)','data:text/html,test','//evil.test','../../outside'])assert.equal(resolveLink(url,'questions/41.md'),'#');const doc=renderMarkdown('<script>alert(1)</script>\n\n[x](javascript:alert)\n\n## Hello\n\n| A | B |\n|---|---|\n| 1 | 2 |');assert.ok(!doc.html.includes('<script>'));assert.ok(!doc.html.includes('href="javascript:'));assert.ok(doc.html.includes('<th scope="col">'));assert.equal(doc.headings[0].id,'part-1');});
test('routes preserve encoded queries and defaults',()=>{assert.deepEqual(C.parseRoute('').parts,['accueil']);const r=C.parseRoute('#/question/41?lecture=sources');assert.deepEqual(r.parts,['question','41']);assert.equal(r.params.get('lecture'),'sources');assert.equal(C.parseRoute('#/atlas?q=%C3%A9nergie').params.get('q'),'énergie');});
test('all guided steps point to existing content',()=>{for(const path of D.paths)for(const s of path.steps)assert.ok(s.type==='question'?D.questions.some(q=>q.id===s.id):D.labs.some(l=>l.id===s.id));});
test('canonical dossier addresses preserve modes and legacy bookmarks',()=>{
 assert.equal(C.canonicalHref('#/question/19?lecture=sources'),'/dossiers/19/?lecture=sources');
 assert.equal(C.canonicalHref('#/atlas?q=temps'),'/#/atlas?q=temps');
 assert.equal(C.canonicalHref('https://example.org/#/question/19'),'https://example.org/#/question/19');
 assert.deepEqual(C.locationRoute('/dossiers/26/','?lecture=complet','').parts,['question','26']);
 assert.equal(C.locationRoute('/dossiers/26/','?lecture=complet','').params.get('lecture'),'complet');
 assert.deepEqual(C.locationRoute('/dossiers/19/','','#part-2').parts,['question','19']);
 assert.deepEqual(C.locationRoute('/index.html','','#/question/25').parts,['question','25']);
});
test('every required path step has a real synthesis and every synthesis has reading landmarks',()=>{
 for(const p of D.paths)for(const step of p.steps){if(step.type==='question')assert.ok(D.questions.find(q=>q.id===step.id)?.researched,`${p.id}: ${step.id} is empty`);}
 for(const q of D.questions.filter(q=>q.researched)){
  assert.ok(q.short?.html&&q.sourceCount>0,`Question ${q.id}: summary/sources missing`);
  assert.ok(q.learning?.goal&&q.learning?.review&&q.learning?.prerequisites,`Question ${q.id}: landmarks missing`);
 }
 for(const id of [1,19,25,26,30,32,36]){
  const q=D.questions.find(q=>q.id===id);
  for(const heading of ['Prérequis','Dossier approfondi','Expérience ou exemple','Objections et limites','Questions encore ouvertes','Sources vérifiées'])assert.ok(q.headings.some(h=>h.title===heading),`${id}: missing ${heading}`);
 }
});
test('New laboratory explorations round-trip with existing notebook data',()=>{
 const notebook=C.cleanState({labs:['neutrino','navier-stokes','relativite'],read:[41],notes:{41:'Note conservée'},last:41});
 const restored=C.parseNotebookJSON(JSON.stringify({application:'The42laws',...notebook}));
 assert.deepEqual(restored,notebook);
});
