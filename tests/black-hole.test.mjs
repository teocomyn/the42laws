import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {transform} from 'esbuild';
import {createRequire} from 'node:module';
const code=await transform(await readFile(new URL('../components/ui/black-hole-utils/model.ts',import.meta.url),'utf8'),{loader:'ts',format:'esm'});
const {schwarzschildKm,normalizeSettings}=await import('data:text/javascript;base64,'+Buffer.from(code.code).toString('base64'));
test('Schwarzschild radius agrees with the solar reference and scales linearly',()=>{
 assert.ok(Math.abs(schwarzschildKm(1)-2.953)<.001);
 assert.equal(schwarzschildKm(20),2*schwarzschildKm(10));
 assert.ok(Math.abs(schwarzschildKm(4e6)-11.813e6)<1000);
 for(const bad of [0,-1,NaN,Infinity])assert.throws(()=>schwarzschildKm(bad),RangeError);
});
test('visual controls remain finite and bounded for malformed inputs',()=>{
 const v=normalizeSettings({inclination:Infinity,zoom:-8,exposure:NaN,palette:'invalid',playing:'yes'});
 assert.ok(v.inclination>=3&&v.inclination<=85);assert.equal(v.zoom,.7);assert.ok(Number.isFinite(v.exposure));assert.equal(v.playing,false);assert.equal(v.palette,'amber');
});
test('notebook import preserves the new laboratory and existing personal content',()=>{
 const C=createRequire(import.meta.url)('../atlas/core.js');
 const s=C.cleanState({version:1,read:[10],notes:{10:'Ma note'},labs:['trou-noir','relativite','fake']});
 assert.deepEqual(s.labs,['trou-noir','relativite']);assert.equal(s.notes[10],'Ma note');assert.deepEqual(s.read,[10]);
 const exported={application:'The42laws',...s};
 assert.deepEqual(C.parseNotebookJSON(JSON.stringify(exported)),s);
 assert.throws(()=>C.parseNotebookJSON(JSON.stringify({...exported,labs:['fake']})));
});
