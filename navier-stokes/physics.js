/* Navier-Stokes 2D incompressible sur le tore [0,2π)² — modèle pédagogique.
 * Schéma : forces → advection semi-lagrangienne (Stam 1999, retour RK2, interpolation bilinéaire)
 *          → diffusion et projection exactes en spectral (FFT radix-2).
 * Unités : longueur du domaine 2π, temps sans dimension, viscosité ν sans dimension.
 * Le cas 2D est celui où la régularité globale est démontrée (Ladyzhenskaya) ;
 * le problème du millénaire porte sur la dimension 3, que ce module ne simule pas.
 * Le « modèle auto-similaire » reproduit seulement les échelles de longueur du
 * théorème d'OpenAI (2026) avec un exposant de vitesse choisi pour une énergie constante.
 */
(function(root){
  'use strict';
  const TWO_PI=2*Math.PI;
  function assertFinite(x,name,min,max){
    if(typeof x!=='number'||!Number.isFinite(x)||x<min||x>max)throw new RangeError(name+' must be a finite number in ['+min+', '+max+']');
  }
  function isPow2(n){return Number.isInteger(n)&&n>=16&&n<=512&&(n&(n-1))===0;}

  // ---------- FFT ----------
  function fft1d(re,im,inverse){
    const n=re.length;
    for(let i=1,j=0;i<n;i++){
      let bit=n>>1;
      for(;j&bit;bit>>=1)j^=bit;
      j^=bit;
      if(i<j){let t=re[i];re[i]=re[j];re[j]=t;t=im[i];im[i]=im[j];im[j]=t;}
    }
    for(let len=2;len<=n;len<<=1){
      const ang=(inverse?TWO_PI:-TWO_PI)/len,wr=Math.cos(ang),wi=Math.sin(ang),half=len>>1;
      for(let i=0;i<n;i+=len){
        let cr=1,ci=0;
        for(let j=0;j<half;j++){
          const a=i+j,b=a+half,tr=re[b]*cr-im[b]*ci,ti=re[b]*ci+im[b]*cr;
          re[b]=re[a]-tr;im[b]=im[a]-ti;re[a]+=tr;im[a]+=ti;
          const ncr=cr*wr-ci*wi;ci=cr*wi+ci*wr;cr=ncr;
        }
      }
    }
    if(inverse){for(let i=0;i<n;i++){re[i]/=n;im[i]/=n;}}
  }
  function fft2d(re,im,n,inverse,rowR,rowI){
    for(let j=0;j<n;j++)fft1d(re.subarray(j*n,(j+1)*n),im.subarray(j*n,(j+1)*n),inverse);
    for(let i=0;i<n;i++){
      for(let j=0;j<n;j++){rowR[j]=re[j*n+i];rowI[j]=im[j*n+i];}
      fft1d(rowR,rowI,inverse);
      for(let j=0;j<n;j++){re[j*n+i]=rowR[j];im[j*n+i]=rowI[j];}
    }
  }

  // ---------- état ----------
  function createFluid(n=128,options={}){
    if(!isPow2(n))throw new RangeError('n must be a power of two between 16 and 512');
    const nu=options.nu===undefined?0.01:options.nu;assertFinite(nu,'nu',0,10);
    const size=n*n;
    return {n,size,dx:TWO_PI/n,nu,time:0,steps:0,
      u:new Float32Array(size),v:new Float32Array(size),dye:new Float32Array(size),
      _a:new Float32Array(size),_b:new Float32Array(size),_c:new Float32Array(size),
      _re:new Float64Array(size),_im:new Float64Array(size),_re2:new Float64Array(size),_im2:new Float64Array(size),
      _row:new Float64Array(n),_rowi:new Float64Array(n)};
  }
  function setViscosity(state,nu){assertFinite(nu,'nu',0,10);state.nu=nu;return state;}
  function reset(state){state.u.fill(0);state.v.fill(0);state.dye.fill(0);state.time=0;state.steps=0;return state;}

  // ---------- interpolation périodique ----------
  function sample(field,n,x,y){
    x-=Math.floor(x/n)*n;y-=Math.floor(y/n)*n;
    if(x>=n)x=0;if(y>=n)y=0; // arrondi flottant : n − ε peut devenir n
    const i0=Math.floor(x),j0=Math.floor(y),fx=x-i0,fy=y-j0,i1=(i0+1)%n,j1=(j0+1)%n;
    const r0=j0*n,r1=j1*n;
    return (field[r0+i0]*(1-fx)+field[r0+i1]*fx)*(1-fy)+(field[r1+i0]*(1-fx)+field[r1+i1]*fx)*fy;
  }

  // ---------- opérateurs ----------
  function advect(state,dt){
    const {n,dx,u,v,dye,_a,_b,_c}=state,s=dt/dx;
    for(let j=0;j<n;j++)for(let i=0;i<n;i++){
      const k=j*n+i;
      const xm=i-0.5*s*u[k],ym=j-0.5*s*v[k];
      const um=sample(u,n,xm,ym),vm=sample(v,n,xm,ym);
      const x0=i-s*um,y0=j-s*vm;
      _a[k]=sample(u,n,x0,y0);_b[k]=sample(v,n,x0,y0);_c[k]=sample(dye,n,x0,y0);
    }
    u.set(_a);v.set(_b);dye.set(_c);
  }
  // Diffusion e^{-ν|k|²dt} et projection de Leray û − k(k·û)/|k|² en une passe spectrale.
  function spectralStep(state,dt,options={}){
    const {n,nu,u,v,_re:ur,_im:ui,_re2:vr,_im2:vi,_row,_rowi}=state,diffuse=options.diffuse!==false,project=options.project!==false;
    for(let k=0;k<n*n;k++){ur[k]=u[k];ui[k]=0;vr[k]=v[k];vi[k]=0;}
    fft2d(ur,ui,n,false,_row,_rowi);fft2d(vr,vi,n,false,_row,_rowi);
    const half=n>>1;
    for(let ky=0;ky<n;ky++){
      const kyy=ky<=half?ky:ky-n;
      for(let kx=0;kx<n;kx++){
        const kxx=kx<=half?kx:kx-n,idx=ky*n+kx,k2=kxx*kxx+kyy*kyy;
        if(k2===0)continue;
        if(kx===half||ky===half){ur[idx]=ui[idx]=vr[idx]=vi[idx]=0;continue;}
        if(project){
          const dr=(kxx*ur[idx]+kyy*vr[idx])/k2,di=(kxx*ui[idx]+kyy*vi[idx])/k2;
          ur[idx]-=kxx*dr;ui[idx]-=kxx*di;vr[idx]-=kyy*dr;vi[idx]-=kyy*di;
        }
        if(diffuse&&nu>0){const damp=Math.exp(-nu*k2*dt);ur[idx]*=damp;ui[idx]*=damp;vr[idx]*=damp;vi[idx]*=damp;}
      }
    }
    fft2d(ur,ui,n,true,_row,_rowi);fft2d(vr,vi,n,true,_row,_rowi);
    for(let k=0;k<n*n;k++){u[k]=ur[k];v[k]=vr[k];}
  }
  function applyForce(state,dt,force){
    if(!force)return;
    const {u,v,size}=state;
    if(typeof force==='function'){force(state,dt);return;}
    if(force.fx&&force.fy){for(let k=0;k<size;k++){u[k]+=dt*force.fx[k];v[k]+=dt*force.fy[k];}}
  }
  function step(state,dt,force){
    assertFinite(dt,'dt',1e-6,1);
    applyForce(state,dt,force);
    advect(state,dt);
    spectralStep(state,dt);
    state.time+=dt;state.steps++;
    return diagnostics(state);
  }

  // ---------- diagnostics ----------
  function kineticEnergy(state){
    const {u,v,size,dx}=state;let s=0;
    for(let k=0;k<size;k++)s+=u[k]*u[k]+v[k]*v[k];
    return 0.5*s*dx*dx;
  }
  function maxSpeed(state){
    const {u,v,size}=state;let m=0;
    for(let k=0;k<size;k++){const s=u[k]*u[k]+v[k]*v[k];if(s>m)m=s;}
    return Math.sqrt(m);
  }
  function divergence(state,out){
    const {n,dx,u,v}=state,o=out||new Float32Array(n*n),c=1/(2*dx);let m=0;
    for(let j=0;j<n;j++){const jp=((j+1)%n)*n,jm=((j-1+n)%n)*n,r=j*n;
      for(let i=0;i<n;i++){const ip=(i+1)%n,im=(i-1+n)%n,d=(u[r+ip]-u[r+im]+v[jp+i]-v[jm+i])*c;o[r+i]=d;const a=Math.abs(d);if(a>m)m=a;}}
    return {field:o,max:m};
  }
  function vorticity(state,out){
    const {n,dx,u,v}=state,o=out||new Float32Array(n*n),c=1/(2*dx);let m=0;
    for(let j=0;j<n;j++){const jp=((j+1)%n)*n,jm=((j-1+n)%n)*n,r=j*n;
      for(let i=0;i<n;i++){const ip=(i+1)%n,im=(i-1+n)%n,w=(v[r+ip]-v[r+im]-u[jp+i]+u[jm+i])*c;o[r+i]=w;const a=Math.abs(w);if(a>m)m=a;}}
    return {field:o,max:m};
  }
  function diagnostics(state){
    return {time:state.time,steps:state.steps,energy:kineticEnergy(state),maxSpeed:maxSpeed(state),
      maxDivergence:divergence(state,state._a).max,reynolds:maxSpeed(state)*TWO_PI/Math.max(state.nu,1e-12)};
  }

  // ---------- conditions initiales ----------
  // Tourbillons de Taylor-Green : solution exacte des équations 2D sur le tore,
  // u = A cos x sin y, v = −A sin x cos y, amplitude décroissant en e^{−2νt}.
  function taylorGreen(state,amplitude=1){
    assertFinite(amplitude,'amplitude',0,100);
    const {n,dx,u,v,dye}=state;
    for(let j=0;j<n;j++)for(let i=0;i<n;i++){
      const x=i*dx,y=j*dx,k=j*n+i;
      u[k]=amplitude*Math.cos(x)*Math.sin(y);v[k]=-amplitude*Math.sin(x)*Math.cos(y);
      dye[k]=0.5+0.5*Math.sin(x)*Math.sin(y);
    }
    state.time=0;state.steps=0;return state;
  }
  function taylorGreenEnergy(amplitude,nu,t){return Math.PI*Math.PI*amplitude*amplitude*Math.exp(-4*nu*t);}
  // Deux jets opposés : instabilité de cisaillement.
  function shearLayers(state,amplitude=1){
    assertFinite(amplitude,'amplitude',0,100);
    const {n,dx,u,v,dye}=state;
    for(let j=0;j<n;j++)for(let i=0;i<n;i++){
      const x=i*dx,y=j*dx,k=j*n+i,band=Math.tanh((y-Math.PI/2)*8)-Math.tanh((y-3*Math.PI/2)*8)-1;
      u[k]=amplitude*band;v[k]=0.05*amplitude*Math.sin(2*x);dye[k]=0.5+0.5*band;
    }
    state.time=0;state.steps=0;return state;
  }
  // Impulsion gaussienne (en unités de grille) : modélise une force extérieure brève.
  function addImpulse(state,x,y,fx,fy,radius=4,dyeAmount=0){
    const {n,u,v,dye}=state,r2=2*radius*radius,span=Math.ceil(3*radius);
    const ci=Math.round(x),cj=Math.round(y);
    for(let dj=-span;dj<=span;dj++)for(let di=-span;di<=span;di++){
      const w=Math.exp(-(di*di+dj*dj)/r2);if(w<1e-3)continue;
      const k=(((cj+dj)%n+n)%n)*n+(((ci+di)%n+n)%n);
      u[k]+=fx*w;v[k]+=fy*w;if(dyeAmount)dye[k]=Math.min(1,dye[k]+dyeAmount*w);
    }
  }

  // ---------- modèle auto-similaire (schéma du théorème 1.1 d'OpenAI, 2026) ----------
  // Échelles de longueur du texte : rayon ≍ τ^{1/2}, hauteur ≍ τ^{1/2−h}, 0 < h < 1/100, τ = 1 − t.
  // L'exposant de vitesse n'est PAS celui du papier : il est choisi pour que U²·volume reste constant,
  // afin d'illustrer « vitesse non bornée, énergie bornée ».
  function selfSimilarFamily(tau,options={}){
    assertFinite(tau,'tau',1e-12,1);
    const h=options.h===undefined?0.005:options.h,U0=options.U0===undefined?1:options.U0;
    assertFinite(h,'h',1e-9,0.01-1e-12);assertFinite(U0,'U0',1e-9,1e9);
    const radius=Math.sqrt(tau),height=Math.pow(tau,0.5-h),volume=radius*radius*height;
    const velocity=U0*Math.pow(tau,-(0.75-h/2));
    return Object.freeze({tau,t:1-tau,h,radius,height,volume,aspect:radius/height,velocity,
      supNorm:velocity,l2Norm:Math.sqrt(velocity*velocity*volume),energyProxy:velocity*velocity*volume});
  }

  const api=Object.freeze({TWO_PI,createFluid,setViscosity,reset,step,advect,spectralStep,applyForce,
    kineticEnergy,maxSpeed,divergence,vorticity,diagnostics,taylorGreen,taylorGreenEnergy,shearLayers,addImpulse,
    selfSimilarFamily,fft1d,fft2d,sample});
  if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.NavierStokesPhysics=api;
})(globalThis);
