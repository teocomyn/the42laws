import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {transform} from 'esbuild';
import {createRequire} from 'node:module';
const code=await transform(await readFile(new URL('../components/ui/black-hole-utils/model.ts',import.meta.url),'utf8'),{loader:'ts',format:'esm'});
const {schwarzschildKm,normalizeSettings,blackHoleScales,descent,ringScreenRadius,SHADOW_RS,SOLAR_MASS}=await import('data:text/javascript;base64,'+Buffer.from(code.code).toString('base64'));
const near=(value,expected,tolerance=.01)=>assert.ok(Math.abs(value/expected-1)<tolerance,`${value} ≠ ${expected}`);
test('Schwarzschild radius agrees with the solar reference and scales linearly',()=>{
 assert.ok(Math.abs(schwarzschildKm(1)-2.953)<.001);
 assert.equal(schwarzschildKm(20),2*schwarzschildKm(10));
 assert.ok(Math.abs(schwarzschildKm(4e6)-11.813e6)<1000);
 for(const bad of [0,-1,NaN,Infinity])assert.throws(()=>schwarzschildKm(bad),RangeError);
});
test('visual controls remain finite and bounded for malformed inputs',()=>{
 const v=normalizeSettings({inclination:Infinity,zoom:-8,exposure:NaN,palette:'invalid',playing:'yes',azimuth:-30,markers:'yes'});
 assert.ok(v.inclination>=3&&v.inclination<=85);assert.equal(v.zoom,.7);assert.ok(Number.isFinite(v.exposure));assert.equal(v.playing,false);assert.equal(v.palette,'amber');
 assert.equal(v.azimuth,330);assert.equal(v.markers,false);assert.equal(normalizeSettings({azimuth:NaN}).azimuth,0);assert.equal(normalizeSettings({azimuth:725}).azimuth,5);
});
test('physical scales match textbook Schwarzschild values and scale with mass',()=>{
 const sun=blackHoleScales(1);
 near(sun.hawkingTemperature,6.17e-8);                       // ħc³/(8πGMk) for one solar mass
 near(sun.meanDensity,1.84e19);                              // M / (4/3 π rₛ³)
 near(sun.evaporationYears,2.17e66,.02);                     // Page (1976) total power
 near(blackHoleScales(10).horizonTide,2.06e8);               // 2GM·(2 m)/rₛ³
 near(blackHoleScales(4.3e6).iscoPeriod/60,32.6);            // Sgr A*: about half an hour at 3 rₛ
 assert.ok(blackHoleScales(6.5e9).meanDensity<1.2);          // M87*: below sea-level air
 near(blackHoleScales(5.9722e24/SOLAR_MASS).rs*1000,8.87);   // Earth: about 9 mm
 const a=blackHoleScales(10),b=blackHoleScales(20);
 near(b.rs/a.rs,2,1e-12);near(b.hawkingTemperature/a.hawkingTemperature,.5,1e-12);near(b.evaporationYears/a.evaporationYears,8,1e-12);near(b.horizonTide/a.horizonTide,.25,1e-12);
 near(a.shadowRadius/a.rs,2.598);
});
test('descent readouts respect the horizon, the photon sphere and the last stable orbit',()=>{
 near(descent(10,1.01).timeFactor,10.05);near(descent(10,4).escape,.5,1e-12);
 assert.equal(descent(10,3).orbit,'stable');assert.equal(descent(10,2).orbit,'unstable');assert.equal(descent(10,1.5).orbit,'photon');assert.equal(descent(10,1.2).orbit,'none');
 near(descent(10,2).tide/descent(10,4).tide,8,1e-12);
 const far=descent(1,1e6),M=1.98847e30*6.67430e-11,r=1e6*2*M/299792458**2;near(far.hover,M/r**2,1e-5); // Newtonian limit far away
 assert.ok(descent(10,1.001).hover>descent(10,1.1).hover);
 for(const bad of [1,.5,NaN,Infinity])assert.throws(()=>descent(10,bad),RangeError);
});
test('marker rings follow the camera geometry used by the shader',()=>{
 near(ringScreenRadius(SHADOW_RS,1),.3134);near(ringScreenRadius(1,1,false),.1196);
 near(ringScreenRadius(SHADOW_RS,1.5)/ringScreenRadius(SHADOW_RS,1),1.5,1e-12);
 assert.ok(ringScreenRadius(SHADOW_RS,1)>2.5*ringScreenRadius(1,1,false));
});
test('notebook import preserves the new laboratory and existing personal content',()=>{
 const C=createRequire(import.meta.url)('../atlas/core.js');
 const s=C.cleanState({version:1,read:[10],notes:{10:'Ma note'},labs:['trou-noir','relativite','fake']});
 assert.deepEqual(s.labs,['trou-noir','relativite']);assert.equal(s.notes[10],'Ma note');assert.deepEqual(s.read,[10]);
 const exported={application:'The42laws',...s};
 assert.deepEqual(C.parseNotebookJSON(JSON.stringify(exported)),s);
 assert.throws(()=>C.parseNotebookJSON(JSON.stringify({...exported,labs:['fake']})));
});
test('readable French numbers for the laboratory outputs',async()=>{
 const f=await transform(await readFile(new URL('../components/ui/black-hole-utils/format.ts',import.meta.url),'utf8'),{loader:'ts',format:'esm'});
 const {sci,length,duration,comparison}=await import('data:text/javascript;base64,'+Buffer.from(f.code).toString('base64'));
 const nb=s=>s.replace(/ | /g,' ');
 assert.equal(nb(sci(778324)),'7,8 × 10⁵');assert.equal(nb(sci(2.17e66,1)),'2 × 10⁶⁶');assert.equal(nb(sci(6.17e-8)),'6,2 × 10⁻⁸');assert.equal(nb(sci(1234)),'1 234');
 assert.equal(nb(length(0.00887)),'8,9 mm');assert.equal(nb(length(29530)),'29,5 km');assert.match(nb(length(1.92e13)),/milliards de km \(128 ua\)/);
 assert.equal(nb(duration(1955)),'33 min');assert.equal(nb(duration(3600*1.2247)),'73 min');
 assert.match(comparison(1.27e10),/18 fois le rayon du Soleil/);assert.match(nb(comparison(29530)),/216 fois plus petit que le rayon de la Terre/);
});
