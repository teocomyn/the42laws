const test=require('node:test'),assert=require('node:assert/strict'),P=require('../relativite/physics.js');
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-10,`${a} != ${b}`);
test('reunited clocks agree at rest and reproduce independent 3-4-5 triangle examples',()=>{
 const rest=P.trip(0,10);assert.equal(rest.earth,rest.traveler);assert.equal(rest.gap,0);assert.equal(rest.distance,0);
 const slow=P.trip(.6,10),fast=P.trip(.8,10);
 near(slow.traveler,8);near(fast.traveler,6);near(slow.turnDistance,3);near(fast.turnDistance,4);near(fast.totalGap,4);
});
test('two timelike segments preserve their Minkowski intervals and return to the origin',()=>{
 for(const beta of [-.99,-.8,.1,.6,.99])for(const T of [1,10,40]){
  const half=P.trip(beta,T,.5),end=P.trip(beta,T);
  near(half.earth**2-half.distance**2,half.traveler**2);
  near((end.earth-half.earth)**2-(end.distance-half.distance)**2,(end.traveler-half.traveler)**2);
  near(end.distance,0);near(half.traveler*2,end.traveler);
  near(P.trip(-beta,T).traveler,end.traveler);
  assert.ok(end.traveler>0&&end.traveler<=T);
 }
});
test('proper time and position remain continuous through the ideal turn',()=>{
 const before=P.trip(.8,10,.5-1e-8),after=P.trip(.8,10,.5+1e-8);
 assert.ok(Math.abs(after.traveler-before.traveler)<1e-6);near(before.distance,after.distance);
 let last=Infinity;for(const b of [0,.1,.6,.8,.99]){const t=P.trip(b,10).traveler;assert.ok(t<last);last=t;}
});
test('unphysical model inputs are rejected and shared settings stay within UI bounds',()=>{
 for(const beta of [NaN,Infinity,1,-1,2])assert.throws(()=>P.trip(beta,10),RangeError);
 for(const T of [0,-2,NaN,Infinity])assert.throws(()=>P.trip(.8,T),RangeError);
 for(const f of [-.1,1.1,NaN])assert.throws(()=>P.trip(.8,10,f),RangeError);
 assert.deepEqual(P.settings('?v=0.6&duree=20'),{beta:.6,years:20});
 assert.deepEqual(P.settings('?v=1&duree=Infinity'),{beta:.8,years:10});
 assert.deepEqual(P.settings('?v=&duree=-1'),{beta:.8,years:10});
 assert.deepEqual(P.settings('?v=.834&duree=12.2'),{beta:.83,years:12});
});
