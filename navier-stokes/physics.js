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
  function applyMask(state,mask){
    if(!mask)return;const {u,v,size}=state;
    for(let k=0;k<size;k++)if(mask[k]){u[k]=0;v[k]=0;}
  }
  // Confinement de vorticité (Fedkiw, Stam, Jensen 2001) : force ε·dx·(N × ω) qui recentre
  // les tourbillons dissipés numériquement. Effet visuel, non physique ; ε = 0 pour toute mesure.
  function vorticityConfinement(state,epsilon,dt){
    if(!(epsilon>0))return;
    const {n,dx,u,v,_c:w}=state;vorticity(state,w);const c=1/(2*dx),g=epsilon*dx*dt;
    for(let j=0;j<n;j++){const jp=((j+1)%n)*n,jm=((j-1+n)%n)*n,r=j*n;
      for(let i=0;i<n;i++){const ip=(i+1)%n,im=(i-1+n)%n,k=r+i;
        const gx=(Math.abs(w[r+ip])-Math.abs(w[r+im]))*c,gy=(Math.abs(w[jp+i])-Math.abs(w[jm+i]))*c;
        const len=Math.sqrt(gx*gx+gy*gy)+1e-6;
        u[k]+=g*(gy/len)*w[k];v[k]-=g*(gx/len)*w[k];}}
  }
  function step(state,dt,options){
    assertFinite(dt,'dt',1e-6,1);
    let force=null,confinement=0,pump=null,mask=null;
    if(typeof options==='function'||(options&&options.fx&&options.fx.length))force=options;
    else if(options){force=options.force||null;confinement=options.confinement||0;pump=options.pump||null;mask=options.mask||null;}
    applyForce(state,dt,force);
    if(pump){const {u,v,size}=state,ax=dt*(pump.fx||0),ay=dt*(pump.fy||0);for(let k=0;k<size;k++){u[k]+=ax;v[k]+=ay;}}
    vorticityConfinement(state,confinement,dt);
    advect(state,dt);
    applyMask(state,mask);
    spectralStep(state,dt);
    applyMask(state,mask);
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

  // Vitesse à divergence nulle à partir d'une vorticité ω : Δψ = −ω, u = ∂ψ/∂y, v = −∂ψ/∂x (spectral).
  function velocityFromVorticity(state,omega){
    const {n,size,u,v,_re,_im,_re2,_im2,_row,_rowi}=state;
    for(let k=0;k<size;k++){_re[k]=omega[k];_im[k]=0;}
    fft2d(_re,_im,n,false,_row,_rowi);
    const half=n>>1;
    for(let ky=0;ky<n;ky++){const kyy=ky<=half?ky:ky-n;
      for(let kx=0;kx<n;kx++){const kxx=kx<=half?kx:kx-n,idx=ky*n+kx,k2=kxx*kxx+kyy*kyy;
        if(k2===0||kx===half||ky===half){_re[idx]=_im[idx]=_re2[idx]=_im2[idx]=0;continue;}
        const pr=_re[idx]/k2,pi=_im[idx]/k2;
        _re[idx]=-kyy*pi;_im[idx]=kyy*pr;_re2[idx]=kxx*pi;_im2[idx]=-kxx*pr;}}
    fft2d(_re,_im,n,true,_row,_rowi);fft2d(_re2,_im2,n,true,_row,_rowi);
    for(let k=0;k<size;k++){u[k]=_re[k];v[k]=_re2[k];}
    state.time=0;state.steps=0;return state;
  }
  function lcg(seed){let s=(seed>>>0)||1;return()=>{s=(s*1664525+1013904223)>>>0;return s/4294967296;};}
  // Couche de cisaillement fine avec perturbation localisée : instabilité de Kelvin-Helmholtz.
  function kelvinHelmholtz(state,amplitude=1,options={}){
    assertFinite(amplitude,'amplitude',0,100);
    const delta=options.thickness===undefined?0.12:options.thickness,eps=options.perturbation===undefined?0.08:options.perturbation;
    const {n,dx,u,v,dye}=state,y1=Math.PI/2,y2=3*Math.PI/2;
    for(let j=0;j<n;j++)for(let i=0;i<n;i++){
      const x=i*dx,y=j*dx,k=j*n+i,band=Math.tanh((y-y1)/delta)-Math.tanh((y-y2)/delta)-1;
      const q1=(y-y1)/(4*delta),q2=(y-y2)/(4*delta),e1=Math.exp(-q1*q1),e2=Math.exp(-q2*q2);
      u[k]=amplitude*band;
      v[k]=amplitude*eps*((Math.sin(2*x)+0.6*Math.sin(3*x+1.1)+0.4*Math.sin(5*x+2.3))*e1+(Math.sin(2*x+2.0)+0.6*Math.sin(3*x+0.4)+0.4*Math.sin(5*x+1.7))*e2);
      dye[k]=0.5+0.5*band;
    }
    state.time=0;state.steps=0;return state;
  }
  function gaussianVorticity(state,blobs){
    const {n,dx}=state,w=new Float32Array(n*n);
    for(let j=0;j<n;j++)for(let i=0;i<n;i++){const x=i*dx,y=j*dx;let s=0;
      for(const b of blobs){let ddx=x-b.x,ddy=y-b.y;ddx-=Math.round(ddx/TWO_PI)*TWO_PI;ddy-=Math.round(ddy/TWO_PI)*TWO_PI;s+=b.a*Math.exp(-(ddx*ddx+ddy*ddy)/(2*b.s*b.s));}
      w[j*n+i]=s;}
    return w;
  }
  // Dipôle : deux tourbillons contrarotatifs, qui se propagent ensemble.
  function dipole(state,amplitude=1){
    assertFinite(amplitude,'amplitude',0,100);
    const s=0.32,d=0.45,w=gaussianVorticity(state,[{x:Math.PI*0.55,y:Math.PI-d,a:-amplitude*6,s},{x:Math.PI*0.55,y:Math.PI+d,a:amplitude*6,s}]);
    velocityFromVorticity(state,w);
    const {n,dye}=state;for(let k=0;k<n*n;k++)dye[k]=Math.min(1,Math.abs(w[k])/(amplitude*6||1));
    return state;
  }
  // Turbulence : superposition de tourbillons aléatoires (graine reproductible).
  function turbulence(state,amplitude=1,seed=7){
    assertFinite(amplitude,'amplitude',0,100);
    const r=lcg(seed),blobs=[];
    for(let b=0;b<28;b++)blobs.push({x:r()*TWO_PI,y:r()*TWO_PI,a:(r()<0.5?-1:1)*amplitude*(3+5*r()),s:0.18+0.32*r()});
    const w=gaussianVorticity(state,blobs);velocityFromVorticity(state,w);
    const {n,dye}=state;let m=0;for(let k=0;k<n*n;k++)m=Math.max(m,Math.abs(w[k]));for(let k=0;k<n*n;k++)dye[k]=Math.abs(w[k])/(m||1);
    return state;
  }
  // Obstacle circulaire : masque de cellules où la vitesse est annulée (paroi immobile).
  function diskMask(state,cx,cy,radius){
    const {n,dx}=state,mask=new Uint8Array(n*n);
    for(let j=0;j<n;j++)for(let i=0;i<n;i++){let ddx=i*dx-cx,ddy=j*dx-cy;ddx-=Math.round(ddx/TWO_PI)*TWO_PI;ddy-=Math.round(ddy/TWO_PI)*TWO_PI;if(ddx*ddx+ddy*ddy<=radius*radius)mask[j*n+i]=1;}
    return mask;
  }
  function uniformFlow(state,speed=1){
    assertFinite(speed,'speed',-100,100);
    const {n,u,v,dye,dx}=state;for(let j=0;j<n;j++)for(let i=0;i<n;i++){const k=j*n+i;u[k]=speed;v[k]=0;dye[k]=0.5+0.5*Math.sin(j*dx*6);}
    state.time=0;state.steps=0;return state;
  }

  // ---------- encre haute résolution (trois canaux) ----------
  function createDye(m){
    if(!Number.isInteger(m)||m<16||m>2048)throw new RangeError('m must be an integer between 16 and 2048');
    const size=m*m;
    return {m,size,dx:TWO_PI/m,r:new Float32Array(size),g:new Float32Array(size),b:new Float32Array(size),_r:new Float32Array(size),_g:new Float32Array(size),_b:new Float32Array(size)};
  }
  // Advection semi-lagrangienne de l'encre par la vitesse (grille plus fine que la vitesse).
  function advectDye(dye,state,dt,decay=0){
    const {m,dx:dxd,r,g,b,_r,_g,_b}=dye,{n,u,v}=state,ratio=n/m,s=dt/dxd,keep=1-decay;
    for(let J=0;J<m;J++)for(let I=0;I<m;I++){
      const k=J*m+I,xv=(I+0.5)*ratio,yv=(J+0.5)*ratio;
      const u0=sample(u,n,xv,yv),v0=sample(v,n,xv,yv);
      const Xm=I-0.5*s*u0,Ym=J-0.5*s*v0;
      const um=sample(u,n,(Xm+0.5)*ratio,(Ym+0.5)*ratio),vm=sample(v,n,(Xm+0.5)*ratio,(Ym+0.5)*ratio);
      const X0=I-s*um,Y0=J-s*vm;
      _r[k]=keep*sample(r,m,X0,Y0);_g[k]=keep*sample(g,m,X0,Y0);_b[k]=keep*sample(b,m,X0,Y0);
    }
    r.set(_r);g.set(_g);b.set(_b);
  }
  function dyeMass(dye){let s=0;for(let k=0;k<dye.size;k++)s+=dye.r[k]+dye.g[k]+dye.b[k];return s*dye.dx*dye.dx;}
  // Goutte d'encre colorée (position et rayon en unités physiques).
  function splatDye(dye,x,y,radius,rgb,strength=1){
    const {m,dx,r,g,b}=dye,cx=x/dx-0.5,cy=y/dx-0.5,rc=radius/dx,span=Math.ceil(3*rc),ci=Math.round(cx),cj=Math.round(cy),two=2*rc*rc;
    for(let dj=-span;dj<=span;dj++)for(let di=-span;di<=span;di++){
      const w=strength*Math.exp(-(di*di+dj*dj)/two);if(w<1e-3)continue;
      const k=(((cj+dj)%m+m)%m)*m+(((ci+di)%m+m)%m);
      r[k]=Math.min(1.5,r[k]+w*rgb[0]);g[k]=Math.min(1.5,g[k]+w*rgb[1]);b[k]=Math.min(1.5,b[k]+w*rgb[2]);
    }
  }
  function paintDye(dye,fn){const {m,dx,r,g,b}=dye;for(let J=0;J<m;J++)for(let I=0;I<m;I++){const c=fn((I+0.5)*dx,(J+0.5)*dx),k=J*m+I;r[k]=c[0];g[k]=c[1];b[k]=c[2];}}

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

  const api=Object.freeze({TWO_PI,createFluid,setViscosity,reset,step,advect,spectralStep,applyForce,applyMask,vorticityConfinement,
    kineticEnergy,maxSpeed,divergence,vorticity,diagnostics,taylorGreen,taylorGreenEnergy,shearLayers,addImpulse,
    velocityFromVorticity,kelvinHelmholtz,dipole,turbulence,diskMask,uniformFlow,
    createDye,advectDye,dyeMass,splatDye,paintDye,selfSimilarFamily,fft1d,fft2d,sample});
  if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.NavierStokesPhysics=api;
})(globalThis);
