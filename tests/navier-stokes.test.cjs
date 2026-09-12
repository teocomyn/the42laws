const {test}=require('node:test');
const assert=require('node:assert/strict');
const P=require('../navier-stokes/physics.js');
const close=(a,b,tol,msg)=>assert.ok(Math.abs(a-b)<=tol,`${msg||''} ${a} vs ${b} (tol ${tol})`);
const finite=arr=>{for(let k=0;k<arr.length;k++)if(!Number.isFinite(arr[k]))return false;return true;};

test('FFT 2D : aller-retour exact et linéarité',()=>{
  const n=64,re=new Float64Array(n*n),im=new Float64Array(n*n),r=new Float64Array(n),ri=new Float64Array(n);
  for(let k=0;k<n*n;k++)re[k]=Math.sin(k*0.37)+Math.cos(k*k*0.001);
  const copy=re.slice();P.fft2d(re,im,n,false,r,ri);P.fft2d(re,im,n,true,r,ri);
  let e=0;for(let k=0;k<n*n;k++)e=Math.max(e,Math.abs(re[k]-copy[k]),Math.abs(im[k]));
  assert.ok(e<1e-12,`erreur aller-retour ${e}`);
});
test('la projection retire exactement un gradient et laisse Taylor-Green intact',()=>{
  const n=64,s=P.createFluid(n,{nu:0});P.taylorGreen(s,1);
  const u0=s.u.slice(),v0=s.v.slice();
  for(let j=0;j<n;j++)for(let i=0;i<n;i++){const x=i*s.dx,y=j*s.dx,k=j*n+i;s.u[k]+=2*Math.cos(2*x)*Math.cos(3*y);s.v[k]+=-3*Math.sin(2*x)*Math.sin(3*y);}
  P.spectralStep(s,0.1);
  let e=0;for(let k=0;k<n*n;k++)e=Math.max(e,Math.abs(s.u[k]-u0[k]),Math.abs(s.v[k]-v0[k]));
  assert.ok(e<1e-5,`résidu ${e}`);
  assert.ok(P.divergence(s).max<1e-4);
});
test('la diffusion spectrale décroît chaque mode de Taylor-Green en e^{-2 nu dt}',()=>{
  const n=64,nu=0.1,dt=0.05,s=P.createFluid(n,{nu});P.taylorGreen(s,1);
  const before=s.u[5*n+7];P.spectralStep(s,dt);
  close(s.u[5*n+7]/before,Math.exp(-2*nu*dt),1e-6,'facteur');
});
test('Taylor-Green : énergie initiale exacte, décroissance suivie à la dissipation numérique près',()=>{
  for(const [n,nu,tol] of [[64,0.05,0.12],[128,0.05,0.06]]){
    const s=P.createFluid(n,{nu});P.taylorGreen(s,1);
    close(P.kineticEnergy(s),Math.PI*Math.PI,1e-3,'E0');
    for(let k=0;k<100;k++)P.step(s,0.01);
    const E=P.kineticEnergy(s),Eth=P.taylorGreenEnergy(1,nu,s.time);
    assert.ok(E<=Eth*(1+1e-6),'pas de gain d’énergie');
    assert.ok(E>=Eth*(1-tol),`n=${n} : ${E} vs théorie ${Eth}`);
  }
});
test('plus de viscosité, plus de dissipation',()=>{
  const run=nu=>{const s=P.createFluid(64,{nu});P.taylorGreen(s,1);for(let k=0;k<50;k++)P.step(s,0.02);return P.kineticEnergy(s);};
  assert.ok(run(0.2)<run(0.05)&&run(0.05)<run(0.01));
});
test('sans force, l’énergie ne croît jamais et tout reste fini (jets opposés, faible viscosité)',()=>{
  const s=P.createFluid(64,{nu:0.002});P.shearLayers(s,1);
  let prev=P.kineticEnergy(s);
  for(let k=0;k<150;k++){const d=P.step(s,0.02);assert.ok(d.energy<=prev*(1+1e-6),`pas ${k}`);prev=d.energy;}
  assert.ok(finite(s.u)&&finite(s.v)&&finite(s.dye));
});
test('une impulsion ajoute de l’énergie puis la viscosité la dissipe',()=>{
  const s=P.createFluid(64,{nu:0.05});
  assert.equal(P.kineticEnergy(s),0);
  P.addImpulse(s,32,32,1,0.5,4,1);const E1=P.kineticEnergy(s);assert.ok(E1>0);
  for(let k=0;k<50;k++)P.step(s,0.02);
  assert.ok(P.kineticEnergy(s)<E1);assert.ok(P.divergence(s).max<1e-2);
});
test('famille auto-similaire : énergie constante, vitesse divergente, colonne de plus en plus élancée',()=>{
  let prevV=0,prevA=Infinity;
  for(const tau of [1,0.1,1e-2,1e-3,1e-4,1e-6]){
    const f=P.selfSimilarFamily(tau,{h:0.005});
    close(f.energyProxy,1,1e-9,'énergie');close(f.l2Norm,1,1e-9,'L2');
    assert.ok(f.supNorm>prevV);prevV=f.supNorm;
    assert.ok(f.aspect<prevA);prevA=f.aspect;
    close(f.radius,Math.sqrt(tau),1e-12);close(f.height,Math.pow(tau,0.495),1e-12);
  }
  close(P.selfSimilarFamily(1e-4).supNorm,Math.pow(1e-4,-0.7475),1e-9);
});
test('entrées invalides rejetées',()=>{
  for(const n of [0,15,100,1024,'64'])assert.throws(()=>P.createFluid(n),RangeError);
  for(const nu of [-1,11,NaN,'0.1'])assert.throws(()=>P.createFluid(64,{nu}),RangeError);
  const s=P.createFluid(16);
  for(const dt of [0,-0.1,2,NaN])assert.throws(()=>P.step(s,dt),RangeError);
  for(const tau of [0,-1,1.5,NaN])assert.throws(()=>P.selfSimilarFamily(tau),RangeError);
  for(const h of [0,0.01,0.5,-1])assert.throws(()=>P.selfSimilarFamily(0.5,{h}),RangeError);
});
