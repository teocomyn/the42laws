const {test}=require('node:test');
const assert=require('node:assert/strict');
const {annihilation,inventory}=require('../antimatiere/physics.js');
const close=(a,b,tol=1e-10)=>assert.ok(Math.abs(a-b)<tol,`${a} != ${b}`);
test('rest annihilation agrees with the 511 keV line and CODATA Compton wavelength',()=>{
  const r=annihilation(0);close(r.photonKeV,510.99895069,1e-7);close(r.totalMeV,1.02199790138);
  close(r.wavelengthPm,2.42631023538,1e-9);
});
test('two rest masses plus both kinetic energies are counted, once each',()=>{
  for(let i=0;i<=40;i++){
    const k=i*.05,r=annihilation(k);
    close(r.totalMeV,annihilation(0).totalMeV+2*k);
    close(r.photonMeV*2,r.totalMeV);
    close(r.totalJoules,r.totalMeV*1.602176634e-13,1e-24);
  }
});
test('more energy means shorter photon wavelengths',()=>{
  let previous=Infinity;
  for(let i=0;i<=40;i++){const r=annihilation(i*.05);assert.ok(r.wavelengthPm<previous);previous=r.wavelengthPm;}
});
test('pair removal conserves signed excess for every slider setting',()=>{
  for(let excess=-5;excess<=5;excess++){
    const before=inventory(24,excess),after=inventory(24,excess,true);
    assert.equal(before.matter-before.antimatter,excess);
    assert.equal(after.matter-after.antimatter,excess);
    assert.equal(before.matter+before.antimatter-after.matter-after.antimatter,48);
    assert.equal(after.matter+after.antimatter,Math.abs(excess));
    assert.equal(after.annihilatedPairs,24);
  }
});
test('symmetric starting populations leave no counted particles',()=>{
  assert.equal(inventory(24,0,true).matter,0);assert.equal(inventory(24,0,true).antimatter,0);
});
test('invalid inputs are rejected',()=>{
  for(const k of [-1,2.1,NaN,Infinity,'1'])assert.throws(()=>annihilation(k),RangeError);
  for(const args of [[-1,0],[24,1.5],[Infinity,0],[24,NaN]])assert.throws(()=>inventory(...args),RangeError);
});
