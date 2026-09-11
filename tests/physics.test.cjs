const {test}=require('node:test');
const assert=require('node:assert/strict');
const {probabilities,parameters}=require('../neutrino/physics.js');
test('zero baseline preserves the produced flavor',()=>{
  for(let a=0;a<3;a++) probabilities(a,0,1).forEach((p,b)=>assert.ok(Math.abs(p-(a===b?1:0))<1e-12));
});
test('probabilities stay normalized over all UI inputs and all flavors',()=>{
  for(let a=0;a<3;a++)for(let e=.2;e<=5;e+=.1)for(let l=0;l<=3000;l+=10){
    const ps=probabilities(a,l,e);assert.ok(ps.every(p=>p>=0&&p<=1));assert.ok(Math.abs(ps.reduce((s,p)=>s+p,0)-1)<1e-12);
  }
});
test('independent two-flavor limit reproduces the analytic survival formula',()=>{
  const p={...parameters,theta12:0,theta13:0,theta23:45,dm21:0};
  for(const energy of [.2,1,5])for(const distance of [0,100,500,1000,3000]){
    const result=probabilities(1,distance,energy,p);
    const survival=1-Math.sin(1.267*p.dm31*distance/energy)**2;
    assert.ok(Math.abs(result[1]-survival)<1e-12);
    assert.ok(Math.abs(result[2]-(1-survival))<1e-12);
    assert.equal(result[0],0);
  }
});
test('vacuum oscillations depend on L/E',()=>{
  const a=probabilities(0,500,1),b=probabilities(0,1000,2);a.forEach((p,i)=>assert.ok(Math.abs(p-b[i])<1e-12));
});
test('invalid physical inputs are rejected',()=>{
  for(const args of [[-1,500,1],[3,500,1],[0,-1,1],[0,500,0],[0,500,NaN]])assert.throws(()=>probabilities(...args),RangeError);
});
