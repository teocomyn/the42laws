const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const C=require('../atlas/core.js'),M=require('../atlas/metadata.js'),V=require('../atlas/public-views.js'),Consent=require('../atlas/consent.js');
const context={window:{}};vm.runInNewContext(fs.readFileSync('atlas/data.js','utf8'),context);const D=JSON.parse(JSON.stringify(context.window.ATLAS_DATA));
test('canonical public routes roundtrip including historical links and encoded filters',()=>{
 for(const [route,path]of Object.entries(C.publicPaths)){assert.equal(C.canonicalHref('/#/'+route),path);assert.deepEqual(C.locationRoute(path,'','').parts,[route]);assert.equal(C.isAtlasPath(path),true);assert.equal(C.isAtlasPath(path+'index.html'),true);}
 for(const domain of D.domains){const target=C.canonicalHref('/#/atlas?d='+domain.id+'&q=%C3%A9nergie');assert.equal(target,'/domaines/'+domain.id+'/?q=%C3%A9nergie');const r=C.locationRoute('/domaines/'+domain.id+'/','?q=%C3%A9nergie','');assert.deepEqual(r.parts,['domaine',domain.id]);assert.equal(r.params.get('q'),'énergie');}
 for(const p of D.paths){const target=C.canonicalHref('#/parcours/'+p.id);assert.equal(target,'/parcours/'+p.id+'/');assert.deepEqual(C.locationRoute(target,'','').parts,['parcours',p.id]);}
 assert.equal(C.isAtlasPath('/domaines/invente/'),false);assert.deepEqual(C.locationRoute('/inconnu/','','').parts,['introuvable']);assert.equal(C.canonicalHref('../index.html#/sources'),'/sources/');assert.equal(C.canonicalHref('https://other.test/#/atlas'),'https://other.test/#/atlas');
});
test('public HTML contains the real homepage content, all definitions and pathways without JavaScript',()=>{
 const v=V.create(D),home=v.home();assert.ok(home.includes('horizon-title'));assert.ok(!home.includes('href="#/'));for(const q of D.questions.filter(q=>q.researched))assert.ok(home.includes(`/dossiers/${q.id}/`));
 const glossary=v.page(['glossaire']);for(const t of D.glossary){assert.ok(glossary.includes(C.escape(t.term)));assert.ok(glossary.includes(C.escape(t.definition)));}
 for(const p of D.paths){const html=v.page(['parcours',p.id]);for(const step of p.steps)assert.ok(html.includes(step.type==='question'?`/dossiers/${step.id}/`:D.labs.find(l=>l.id===step.id).url));}
 assert.ok(v.page(['sources']).includes(D.sources.html));assert.ok(v.page(['methode']).includes(D.method.html));
 for(const d of D.domains){const html=v.domain(d.id);for(const q of D.questions.filter(q=>q.domain===d.id))assert.ok(html.includes(`/dossiers/${q.id}/`));}
});
test('structured metadata matches canonical URLs and visible breadcrumb destinations, without invented authors',()=>{
 for(const parts of [['accueil'],['atlas'],['glossaire'],['parcours'],...D.domains.map(d=>['domaine',d.id]),...D.paths.map(p=>['parcours',p.id]),...D.questions.map(q=>['question',String(q.id)])]){
  const m=M.pageMetadata(D,parts),graph=M.structuredData(m,'https://the42laws.fr/')['@graph'],page=graph.find(x=>x['@id'].endsWith('#webpage'));
  assert.equal(page.url,'https://the42laws.fr'+m.path);assert.equal(page.name,m.title);assert.equal(page.description,m.description);assert.ok(!JSON.stringify(graph).includes('Person'));assert.ok(!page.author);
  const crumb=graph.find(x=>x['@type']==='BreadcrumbList');if(crumb){assert.equal(crumb.itemListElement.at(-1).item,page.url);assert.deepEqual(crumb.itemListElement.map(x=>x.position),crumb.itemListElement.map((_,i)=>i+1));}
  assert.equal(m.robots,parts[0]==='question'&&!D.questions.find(q=>q.id===Number(parts[1])).researched?'noindex,follow':'index,follow');
 }
 const bad=M.pageMetadata(D,['domaine','unknown']);assert.equal(bad.robots,'noindex,follow');
 assert.ok(!M.structuredMarkup({...M.pageMetadata(D,['accueil']),title:'</script><script>bad</script>'},'https://the42laws.fr/').includes('</script><script>'));
});
test('search filters do not contaminate canonical paths or analytics page locations',()=>{
 for(const path of Object.values(C.publicPaths)){
  const route=C.locationRoute(path,'?q=mes%20notes',''),m=M.pageMetadata(D,route.parts,route.params);assert.equal(m.robots,'noindex,follow');assert.ok(!m.path.includes('?'));
  assert.equal(Consent.safePage({origin:'https://the42laws.fr',pathname:path,hash:'',search:'?q=mes%20notes'}),'https://the42laws.fr'+path);
 }
 assert.equal(Consent.safePage({origin:'https://the42laws.fr',pathname:'/',hash:'#/carnet',search:''}),null);
});
const Reader=require('../atlas/dossier.js');
test('editorial responses keep uncertainty, cited references and metadata together',()=>{
 for(const id of [10,29,33,41]){
  const q=D.questions.find(x=>x.id===id),a=q.answer,html=Reader.fullDocument(q,D);
  assert.ok(q.researched);assert.ok(html.includes(C.escape(a.response)));assert.ok(html.includes(C.escape(a.limit)));
  assert.equal(M.pageMetadata(D,['question',String(id)]).description,a.description);
  for(const s of a.sources){assert.ok(q.html.includes(s.url.replaceAll('&','&amp;')));assert.ok(html.includes(s.url.replaceAll('&','&amp;')));}
 }
 assert.equal(Reader.answer({...D.questions[28],researched:false}),'');
 const q={researched:true,answer:{response:'<script>bad</script>',limit:'&',sources:[{label:'<b>',url:'https://example.test/?a=1&b=2'}]}};
 assert.ok(!Reader.answer(q).includes('<script>'));assert.ok(Reader.answer(q).includes('&amp;'));
 assert.equal(M.pageMetadata(D,['question','28']).robots,'noindex,follow');assert.equal(M.pageMetadata(D,['question','29']).robots,'index,follow');
});
test('contextual reading links show editorial reasons, publication states and unique destinations',()=>{
 for(const q of D.questions){
  const html=Reader.related(q,D),destinations=[...html.matchAll(/href="\/dossiers\/(\d+)\/"/g)].map(m=>Number(m[1]));
  assert.equal(destinations.length,new Set(destinations).size);assert.ok(destinations.length<=4);
  for(const id of destinations){const edge=D.connections.find(e=>(e.from===q.id&&e.to===id)||(e.to===q.id&&e.from===id));assert.ok(edge);assert.ok(html.includes(C.escape(edge.label)));assert.notEqual(id,q.id);}
 }
 const html=Reader.related(D.questions[28],D);assert.ok(html.includes('/dossiers/25/'));assert.ok(html.includes('À EXPLORER'));assert.ok(html.includes('SYNTHÈSE DISPONIBLE'));
});
test('short uppercase glossary abbreviations do not hijack scientific mixed-case names',()=>{
 const names=[{text:'IA',id:'intelligence-artificielle'},{text:'Énergie noire',id:'energie-noire'},{text:'ARN',id:'arn'}];
 assert.equal(C.glossaryMatch(names,'Ia'),undefined);assert.equal(C.glossaryMatch(names,'IA').id,'intelligence-artificielle');
 assert.equal(C.glossaryMatch(names,'energie noire').id,'energie-noire');assert.equal(C.glossaryMatch(names,'ARN').id,'arn');
});
