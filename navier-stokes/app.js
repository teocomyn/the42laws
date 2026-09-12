/* Laboratoire Navier-Stokes — rendu et interface. Le calcul est dans physics.js.
 * Trois vues : encre (trois canaux advectés), vorticité, vitesse.
 * Le rendu ajoute des traceurs et une lueur ; ce sont des effets visuels,
 * les mesures affichées viennent uniquement du champ de vitesse.
 */
(function(){
  'use strict';
  const P=window.NavierStokesPhysics;
  const $=id=>document.getElementById(id);
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const fmt=(x,d=3)=>Number.isFinite(x)?x.toLocaleString('fr-FR',{maximumFractionDigits:d,minimumFractionDigits:d}):'—';
  const sci=x=>Number.isFinite(x)?x.toExponential(2).replace('e','·10^').replace('+',''):'—';
  const TAU=P.TWO_PI;

  const INK={
    orange:[1.00,0.55,0.22], violet:[0.62,0.48,1.00], green:[0.63,0.92,0.42],
    gold:[1.00,0.84,0.45], cyan:[0.35,0.86,0.95], rose:[1.00,0.42,0.62]
  };
  const mix=(a,b,t)=>[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t];

  /* ---------------------------------------------------------------- vue fluide */
  function FluidView(canvas,opts){
    const o=Object.assign({n:128,m:256,nu:0.004,particles:1800,glow:0.55,exposure:1.7,tile:1,autonomous:false,decay:0.0018},opts);
    const ctx=canvas.getContext('2d',{alpha:false});
    const tex=document.createElement('canvas'),tctx=tex.getContext('2d');
    const glow=document.createElement('canvas'),gctx=glow.getContext('2d');
    let state,dye,image,vortBuf,px,py,ppx,ppy,mask=null,pump=null,preset='',confinement=0,view='ink',speedRef=1;

    function build(n,m){
      state=P.createFluid(n,{nu:o.nu});dye=P.createDye(m);
      tex.width=tex.height=m;image=tctx.createImageData(m,m);
      glow.width=glow.height=Math.max(32,m>>2);
      vortBuf=new Float32Array(n*n);
      const c=o.particles;px=new Float32Array(c);py=new Float32Array(c);ppx=new Float32Array(c);ppy=new Float32Array(c);
      seedParticles();
    }
    function seedParticles(){
      for(let i=0;i<px.length;i++){px[i]=Math.random()*state.n;py[i]=Math.random()*state.n;ppx[i]=px[i];ppy[i]=py[i];}
    }
    function clearDye(){dye.r.fill(0);dye.g.fill(0);dye.b.fill(0);}

    const PRESETS={
      'kelvin-helmholtz':{
        nu:6e-4,confinement:3,speed:2.2,
        setup(){
          P.kelvinHelmholtz(state,1,{thickness:0.1,perturbation:0.09});
          P.paintDye(dye,(x,y)=>{
            const y1=Math.PI/2,y2=3*Math.PI/2;
            const band=Math.tanh((y-y1)/0.1)-Math.tanh((y-y2)/0.1)-1;
            const q1=(y-y1)/0.30,q2=(y-y2)/0.30;
            const edge=Math.exp(-q1*q1)+Math.exp(-q2*q2);
            const base=mix([0.05,0.03,0.10],INK.violet,(0.5+0.5*band)*0.42);
            const hot=mix(INK.gold,INK.orange,0.5+0.5*Math.sin(x*3));
            return [base[0]+hot[0]*edge*1.25,base[1]+hot[1]*edge*1.25,base[2]+hot[2]*edge*1.25];
          });
        }},
      'dipole':{
        nu:4e-4,confinement:4,speed:2.4,
        setup(){
          P.dipole(state,1.15);clearDye();
          P.splatDye(dye,Math.PI*0.55,Math.PI-0.45,0.34,INK.orange,1.25);
          P.splatDye(dye,Math.PI*0.55,Math.PI+0.45,0.34,INK.cyan,1.25);
          P.splatDye(dye,Math.PI*0.55,Math.PI,0.20,INK.gold,0.7);
        }},
      'cylindre':{
        nu:1.6e-3,confinement:2,speed:2.6,
        setup(){
          P.uniformFlow(state,1.1);clearDye();
          mask=P.diskMask(state,TAU*0.26,Math.PI,0.42);
          pump={fx:0.55,fy:0};
        }},
      'turbulence':{
        nu:2.5e-4,confinement:5,speed:2.6,
        setup(){
          P.turbulence(state,1.1,11);
          P.paintDye(dye,(x,y)=>{
            const a=Math.sin(x*3+Math.cos(y*2)),b=Math.cos(y*3.5-Math.sin(x*2));
            const f=Math.pow(Math.max(0,1-Math.abs(a*b)),3);
            const c=mix(mix(INK.violet,INK.rose,0.5+0.5*a),INK.gold,0.5+0.5*b);
            const g=0.10;
            return [c[0]*(g+f*1.5),c[1]*(g+f*1.5),c[2]*(g+f*1.5)];
          });
        }},
      'taylor-green':{
        nu:0.02,confinement:0,speed:1.4,
        setup(){
          P.taylorGreen(state,1);
          P.paintDye(dye,(x,y)=>{
            const w=Math.sin(x)*Math.sin(y),c=mix(INK.violet,INK.orange,0.5+0.5*w);
            const k=0.18+0.95*Math.abs(w);
            return [c[0]*k,c[1]*k,c[2]*k];
          });
        }},
      'repos':{
        nu:0.002,confinement:2,speed:2,
        setup(){P.reset(state);clearDye();}}
    };

    function load(name){
      const p=PRESETS[name]||PRESETS['repos'];
      preset=name;mask=null;pump=null;
      P.reset(state);clearDye();
      P.setViscosity(state,p.nu);
      p.setup();
      confinement=p.confinement;speedRef=p.speed;
      seedParticles();
      return p;
    }

    /* ------------------------------------------------------------ rendu */
    function writeInk(){
      const d=image.data,{r,g,b,size}=dye,e=o.exposure;
      for(let k=0;k<size;k++){
        const i=k<<2;
        d[i]  =255*(1-Math.exp(-r[k]*e));
        d[i+1]=255*(1-Math.exp(-g[k]*e));
        d[i+2]=255*(1-Math.exp(-b[k]*e));
        d[i+3]=255;
      }
    }
    function writeField(){
      const d=image.data,{m}=dye,{n,u,v}=state,ratio=n/m;
      if(view==='vorticity'){
        const w=P.vorticity(state,vortBuf),scale=1.8/(w.max||1);
        for(let J=0;J<m;J++)for(let I=0;I<m;I++){
          const c=Math.max(-1,Math.min(1,P.sample(vortBuf,n,(I+0.5)*ratio,(J+0.5)*ratio)*scale)),a=Math.abs(c),i=(J*m+I)<<2;
          const t=a*a*(3-2*a);
          if(c>=0){d[i]=18+t*237;d[i+1]=16+t*150;d[i+2]=20+t*90;}
          else    {d[i]=18+t*140;d[i+1]=16+t*128;d[i+2]=20+t*235;}
          d[i+3]=255;
        }
      }else{
        let mx=0;for(let k=0;k<n*n;k++){const s=u[k]*u[k]+v[k]*v[k];if(s>mx)mx=s;}
        const inv=1/(Math.sqrt(mx)||1);
        for(let J=0;J<m;J++)for(let I=0;I<m;I++){
          const x=(I+0.5)*ratio,y=(J+0.5)*ratio,uu=P.sample(u,n,x,y),vv=P.sample(v,n,x,y);
          const t=Math.min(1,Math.sqrt(uu*uu+vv*vv)*inv),i=(J*m+I)<<2;
          d[i]=18+t*t*237;d[i+1]=16+t*190;d[i+2]=20+Math.sqrt(t)*225;d[i+3]=255;
        }
      }
    }
    function drawParticles(W,H){
      if(o.particles===0)return;
      const {n,u,v}=state,sc=W/n;
      ctx.globalCompositeOperation='lighter';
      ctx.lineWidth=Math.max(0.6,W/900);ctx.lineCap='round';
      ctx.beginPath();
      for(let i=0;i<px.length;i++){
        const a=Math.hypot(px[i]-ppx[i],py[i]-ppy[i]);
        if(a<0.06)continue;
        ctx.moveTo(ppx[i]*sc,ppy[i]*sc);ctx.lineTo(px[i]*sc,py[i]*sc);
      }
      ctx.strokeStyle='rgba(255,242,222,0.22)';ctx.stroke();
      ctx.globalCompositeOperation='source-over';
    }
    function render(){
      const W=canvas.width,H=canvas.height;
      if(view==='ink')writeInk();else writeField();
      tctx.putImageData(image,0,0);
      ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';
      const tw=W/o.tile;
      for(let t=0;t<o.tile;t++)ctx.drawImage(tex,t*tw,0,tw,H);
      if(o.glow>0){
        gctx.clearRect(0,0,glow.width,glow.height);
        gctx.imageSmoothingEnabled=true;gctx.drawImage(tex,0,0,glow.width,glow.height);
        ctx.save();ctx.globalCompositeOperation='lighter';ctx.globalAlpha=o.glow;
        ctx.filter='blur('+Math.round(W/90)+'px)';
        for(let t=0;t<o.tile;t++)ctx.drawImage(glow,t*tw,0,tw,H);
        ctx.restore();
      }
      if(o.tile===1)drawParticles(W,H);
      if(mask){
        const sc=W/state.n,r=0.42/state.dx*sc,cx=TAU*0.26/state.dx*sc,cy=Math.PI/state.dx*sc;
        ctx.save();ctx.beginPath();ctx.arc(cx,cy,r,0,TAU);
        ctx.fillStyle='#0d0b10';ctx.fill();
        ctx.strokeStyle='rgba(255,172,125,0.55)';ctx.lineWidth=Math.max(1,W/500);ctx.stroke();ctx.restore();
      }
    }

    function advanceParticles(dt){
      const {n,u,v}=state;
      for(let i=0;i<px.length;i++){
        ppx[i]=px[i];ppy[i]=py[i];
        const x=px[i],y=py[i],s=dt/state.dx;
        const um=P.sample(u,n,x+0.5*s*P.sample(u,n,x,y),y+0.5*s*P.sample(v,n,x,y));
        const vm=P.sample(v,n,x+0.5*s*P.sample(u,n,x,y),y+0.5*s*P.sample(v,n,x,y));
        let nx=x+s*um,ny=y+s*vm;
        nx-=Math.floor(nx/n)*n;ny-=Math.floor(ny/n)*n;
        if(Math.abs(nx-ppx[i])>n*0.5||Math.abs(ny-ppy[i])>n*0.5){ppx[i]=nx;ppy[i]=ny;}
        px[i]=nx;py[i]=ny;
      }
    }
    let bandClock=0;
    function injectUpstream(dt){
      bandClock+=dt;
      const y0=Math.PI-0.5,y1=Math.PI+0.5;
      for(let q=0;q<5;q++){
        const y=y0+(y1-y0)*q/4,c=mix(INK.cyan,INK.rose,q/4);
        P.splatDye(dye,0.35,y,0.11,c,0.5*dt*60);
      }
      if(bandClock>0.55){bandClock=0;P.splatDye(dye,0.35,Math.PI,0.16,INK.gold,0.7);}
    }
    let autoClock=0;
    function autoInject(dt){
      autoClock-=dt;
      if(autoClock>0)return;
      autoClock=0.7+Math.random()*1.1;
      const x=Math.random()*TAU,y=Math.random()*TAU,ang=Math.random()*TAU,f=1.6+Math.random()*2.2;
      const keys=Object.keys(INK),c=INK[keys[(Math.random()*keys.length)|0]];
      P.addImpulse(state,x/state.dx,y/state.dx,Math.cos(ang)*f,Math.sin(ang)*f,state.n/26,0);
      P.splatDye(dye,x,y,0.20+Math.random()*0.14,c,0.55);
    }
    function stepOnce(dt){
      if(o.autonomous)autoInject(dt);
      if(preset==='cylindre')injectUpstream(dt);
      const diag=P.step(state,dt,{confinement,mask,pump});
      P.advectDye(dye,state,dt,preset==='cylindre'?0.006:o.decay);
      advanceParticles(dt);
      return diag;
    }

    build(o.n,o.m);
    return {
      get state(){return state;}, get dye(){return dye;}, get preset(){return preset;},
      get confinement(){return confinement;}, set confinement(x){confinement=x;},
      get view(){return view;}, set view(x){view=x;},
      get speedRef(){return speedRef;},
      get mask(){return mask;},
      load,render,stepOnce,rebuild:(n,m)=>{build(n,m);},
      splat(x,y,fx,fy,color,radius){
        P.addImpulse(state,x/state.dx,y/state.dx,fx,fy,Math.max(3,state.n/34),0);
        P.splatDye(dye,x,y,radius||0.16,color,0.85);
      }
    };
  }

  /* --------------------------------------------------------------- bandeau */
  const heroCanvas=$('hero-canvas');
  if(heroCanvas){
    const hero=FluidView(heroCanvas,{n:64,m:160,nu:0.0012,particles:0,glow:0.6,exposure:1.35,tile:3,autonomous:true,decay:0.012});
    hero.load('turbulence');hero.view='ink';
    P.paintDye(hero.dye,(x,y)=>{
      const a=Math.exp(-Math.pow(Math.sin(x*1.5)*Math.sin(y*1.5),2)*4)*0.55,
            c=mix(INK.violet,INK.orange,0.5+0.5*Math.sin(x+y));
      return [c[0]*a,c[1]*a,c[2]*a];
    });
    let heroVisible=true,heroRaf=0;
    const heroFrame=()=>{heroRaf=0;if(!heroVisible||document.hidden||reduced.matches)return;
      for(let k=0;k<2;k++)hero.stepOnce(0.022);hero.render();heroRaf=requestAnimationFrame(heroFrame);};
    const heroSchedule=()=>{if(!heroRaf&&heroVisible&&!document.hidden&&!reduced.matches)heroRaf=requestAnimationFrame(heroFrame);};
    if('IntersectionObserver'in window)new IntersectionObserver(es=>{heroVisible=es[0].isIntersecting;heroSchedule();},{threshold:0.02}).observe(heroCanvas);
    document.addEventListener('visibilitychange',heroSchedule);
    hero.render();heroSchedule();
  }

  /* ------------------------------------------------------------ laboratoire */
  const canvas=$('fluid-canvas');
  const QUALITY={fluide:[64,192],equilibre:[128,256],detaille:[128,384],extreme:[256,384]};
  const lab=FluidView(canvas,{n:128,m:256,nu:0.004,particles:2000,glow:0.5,exposure:1.75});
  let running=false,visible=true,raf=0,lastMs=0,userForced=false,dt=0.02,pointerForce=4;

  function applyPresetUI(name){
    const p=lab.load(name);userForced=false;
    const slider=$('viscosity');slider.value=String(sliderFromNu(p.nu));
    $('viscosity-value').textContent='ν = '+sci(p.nu);
    $('confinement').value=String(lab.confinement);
    $('confinement-value').textContent=lab.confinement===0?'0 (désactivé)':'× '+lab.confinement;
    updateConfinementWarning();
    for(const b of document.querySelectorAll('[data-preset]')){const on=b.dataset.preset===name;b.classList.toggle('selected',on);b.setAttribute('aria-pressed',String(on));}
    lab.render();updateStats(P.diagnostics(lab.state));
  }
  const nuFromSlider=s=>Math.pow(10,-4+3.5*s/100);
  const sliderFromNu=nu=>Math.round((Math.log10(nu)+4)/3.5*100);
  function updateConfinementWarning(){
    const on=lab.confinement>0;
    $('confinement-warning').hidden=!on;
    $('measure-badge').textContent=on?'MESURES ALTÉRÉES':'MESURES BRUTES';
    $('measure-badge').className='badge '+(on?'warn':'ok');
  }
  let theoretical=null;
  function updateStats(d){
    const s=lab.state;
    $('stat-time').textContent=fmt(d.time,2);
    $('stat-energy').textContent=fmt(d.energy,3);
    theoretical=(lab.preset==='taylor-green'&&!userForced&&lab.confinement===0)?P.taylorGreenEnergy(1,s.nu,d.time):null;
    $('stat-theory').textContent=theoretical===null?'—':fmt(theoretical,3);
    $('stat-gap').textContent=theoretical===null?'—':(d.energy/theoretical-1>=0?'+':'')+fmt((d.energy/theoretical-1)*100,1)+' %';
    $('stat-speed').textContent=fmt(d.maxSpeed,3);
    $('stat-reynolds').textContent=d.maxSpeed>0?sci(d.reynolds):'—';
    $('stat-div').textContent=sci(d.maxDivergence);
    $('stat-nu').textContent=sci(s.nu);
    $('stat-ms').textContent=lastMs?fmt(lastMs,1)+' ms':'—';
    $('stat-grid').textContent=s.n+'² / '+lab.dye.m+'²';
  }
  function frame(){
    raf=0;
    if(running&&visible&&!document.hidden){
      const t0=performance.now();const d=lab.stepOnce(dt);lastMs=performance.now()-t0;
      lab.render();updateStats(d);
      raf=requestAnimationFrame(frame);
    }
  }
  function schedule(){if(!raf&&running&&visible&&!document.hidden)raf=requestAnimationFrame(frame);}
  function setRunning(on){
    running=on;const b=$('run-toggle');
    b.textContent=on?'Ⅱ Pause':'▶ Lancer';b.setAttribute('aria-pressed',String(on));
    $('state-label').textContent=on?'EN COURS':'EN PAUSE';schedule();
  }

  /* interaction pointeur : force extérieure + encre */
  let last=null,inkIndex=0;
  const inkCycle=[INK.orange,INK.cyan,INK.green,INK.rose,INK.gold,INK.violet];
  const toWorld=e=>{const r=canvas.getBoundingClientRect();return {x:(e.clientX-r.left)/r.width*TAU,y:(e.clientY-r.top)/r.height*TAU};};
  canvas.addEventListener('pointerdown',e=>{last=toWorld(e);inkIndex=(inkIndex+1)%inkCycle.length;canvas.setPointerCapture(e.pointerId);
    lab.splat(last.x,last.y,0,0,inkCycle[inkIndex],0.13);if(!running){lab.render();}});
  canvas.addEventListener('pointermove',e=>{
    if(!last||!(e.buttons&1))return;
    const c=toWorld(e);let dx=c.x-last.x,dy=c.y-last.y;
    dx-=Math.round(dx/TAU)*TAU;dy-=Math.round(dy/TAU)*TAU;
    last=c;userForced=true;
    lab.splat(c.x,c.y,dx*pointerForce*8,dy*pointerForce*8,inkCycle[inkIndex],0.12);
    if(!running){lab.render();updateStats(P.diagnostics(lab.state));}
  });
  const release=()=>{last=null;};
  canvas.addEventListener('pointerup',release);canvas.addEventListener('pointercancel',release);

  /* contrôles */
  $('viscosity').addEventListener('input',e=>{const nu=nuFromSlider(Number(e.target.value));P.setViscosity(lab.state,nu);userForced=true;$('viscosity-value').textContent='ν = '+sci(nu);$('stat-nu').textContent=sci(nu);});
  $('confinement').addEventListener('input',e=>{lab.confinement=Number(e.target.value);$('confinement-value').textContent=lab.confinement===0?'0 (désactivé)':'× '+lab.confinement;updateConfinementWarning();});
  $('force-strength').addEventListener('input',e=>{pointerForce=Number(e.target.value);$('force-value').textContent='× '+pointerForce;});
  $('quality').addEventListener('change',e=>{const [n,m]=QUALITY[e.target.value];lab.rebuild(n,m);applyPresetUI(lab.preset||'kelvin-helmholtz');});
  for(const b of document.querySelectorAll('[data-preset]'))b.addEventListener('click',()=>applyPresetUI(b.dataset.preset));
  for(const b of document.querySelectorAll('[data-view]'))b.addEventListener('click',()=>{
    lab.view=b.dataset.view;
    for(const o of document.querySelectorAll('[data-view]')){const on=o===b;o.classList.toggle('selected',on);o.setAttribute('aria-pressed',String(on));}
    lab.render();});
  $('run-toggle').addEventListener('click',()=>setRunning(!running));
  $('reset').addEventListener('click',()=>applyPresetUI(lab.preset));
  $('step-button').addEventListener('click',()=>{let d;for(let k=0;k<10;k++)d=lab.stepOnce(dt);lab.render();updateStats(d);});
  document.addEventListener('visibilitychange',schedule);
  reduced.addEventListener('change',e=>{if(e.matches)setRunning(false);});
  if('IntersectionObserver'in window)new IntersectionObserver(es=>{visible=es[0].isIntersecting;schedule();},{threshold:0.03}).observe(canvas);

  applyPresetUI('kelvin-helmholtz');
  setRunning(running);

  /* --------------------------------------------------------- schéma d'explosion */
  const bc=$('blowup-canvas'),bctx=bc.getContext('2d');
  const tauFromSlider=s=>Math.pow(10,-4*s/1000);
  let hParam=Number($('h-slider').value)/10000,animId=0;
  function drawBlowup(){
    const s=Number($('tau-slider').value),tau=tauFromSlider(s),f=P.selfSimilarFamily(tau,{h:hParam});
    const W=bc.width,H=bc.height;
    const bg=bctx.createLinearGradient(0,0,0,H);bg.addColorStop(0,'#191320');bg.addColorStop(1,'#100e12');
    bctx.fillStyle=bg;bctx.fillRect(0,0,W,H);
    const cx=W*0.26,cy=H*0.5,base=H*0.36;
    bctx.strokeStyle='#3a3142';bctx.lineWidth=1;
    bctx.setLineDash([4,5]);bctx.beginPath();bctx.ellipse(cx,cy,base*0.5,base,0,0,TAU);bctx.stroke();bctx.setLineDash([]);
    bctx.beginPath();bctx.moveTo(cx,cy-base*1.25);bctx.lineTo(cx,cy+base*1.25);bctx.stroke();
    const halfW=Math.max(0.8,base*0.5*f.radius),halfH=Math.max(2,base*f.height);
    const heat=Math.min(1,Math.log10(f.velocity)/3);
    bctx.save();bctx.globalCompositeOperation='lighter';
    for(const [k,alpha] of [[3.2,0.14],[1.9,0.22],[1,1]]){
      const g=bctx.createRadialGradient(cx,cy,0,cx,cy,Math.max(halfW,halfH)*k);
      g.addColorStop(0,'rgba(255,'+Math.round(232-heat*170)+','+Math.round(150-heat*120)+','+alpha+')');
      g.addColorStop(1,'rgba(187,163,252,0)');
      bctx.fillStyle=g;bctx.beginPath();bctx.ellipse(cx,cy,halfW*k,halfH*k,0,0,TAU);bctx.fill();
    }
    bctx.restore();
    bctx.fillStyle='#8d8395';bctx.font='11px Arial';bctx.textAlign='center';
    bctx.fillText('rayon ≍ τ^½   ·   hauteur ≍ τ^(½−h)',cx,H-16);
    const x0=W*0.5,x1=W-26,y0=H-42,y1=26;
    bctx.strokeStyle='#3a3142';bctx.beginPath();bctx.moveTo(x0,y1);bctx.lineTo(x0,y0);bctx.lineTo(x1,y0);bctx.stroke();
    const lo=-0.5,hi=3.5,ty=v=>y0-(Math.min(hi,Math.max(lo,Math.log10(v)))-lo)/(hi-lo)*(y0-y1);
    for(let d=0;d<=3;d++){const y=ty(Math.pow(10,d));
      bctx.fillStyle='#6a6074';bctx.textAlign='right';bctx.fillText('10'+['⁰','¹','²','³'][d],x0-7,y+4);
      bctx.strokeStyle='#221d29';bctx.beginPath();bctx.moveTo(x0,y);bctx.lineTo(x1,y);bctx.stroke();}
    const plot=(key,color,width)=>{bctx.strokeStyle=color;bctx.lineWidth=width;bctx.beginPath();
      for(let k=0;k<=200;k++){const ss=k*5,ff=P.selfSimilarFamily(tauFromSlider(ss),{h:hParam});
        const x=x0+(x1-x0)*ss/1000,y=ty(ff[key]);k?bctx.lineTo(x,y):bctx.moveTo(x,y);}bctx.stroke();};
    bctx.save();bctx.globalCompositeOperation='lighter';plot('supNorm','rgba(255,172,125,0.35)',6);bctx.restore();
    plot('supNorm','#ffac7d',2);plot('l2Norm','#c4f58b',2);
    const xm=x0+(x1-x0)*s/1000;
    bctx.strokeStyle='#f3eff1';bctx.lineWidth=1;bctx.setLineDash([3,4]);
    bctx.beginPath();bctx.moveTo(xm,y1);bctx.lineTo(xm,y0);bctx.stroke();bctx.setLineDash([]);
    bctx.beginPath();bctx.arc(xm,ty(f.supNorm),3.5,0,TAU);bctx.fillStyle='#ffac7d';bctx.fill();
    bctx.beginPath();bctx.arc(xm,ty(f.l2Norm),3.5,0,TAU);bctx.fillStyle='#c4f58b';bctx.fill();
    bctx.textAlign='left';bctx.fillStyle='#ffac7d';bctx.fillText('‖u‖∞  vitesse maximale',x0+10,y1+12);
    bctx.fillStyle='#c4f58b';bctx.fillText('‖u‖₂  racine de l’énergie',x0+10,y1+27);
    bctx.fillStyle='#8d8395';bctx.textAlign='center';bctx.fillText('t → 1   (τ = 1 − t, échelle logarithmique)',(x0+x1)/2,H-16);
    $('bl-t').textContent=tau<1e-3?'1 − '+sci(tau):fmt(1-tau,4);
    $('bl-radius').textContent=sci(f.radius);$('bl-height').textContent=sci(f.height);
    $('bl-aspect').textContent=sci(f.aspect);$('bl-velocity').textContent=sci(f.velocity);
    $('bl-energy').textContent=fmt(f.energyProxy,6);$('bl-h').textContent=hParam.toFixed(4);
  }
  $('tau-slider').addEventListener('input',drawBlowup);
  $('h-slider').addEventListener('input',e=>{hParam=Number(e.target.value)/10000;drawBlowup();});
  $('blowup-animate').addEventListener('click',()=>{
    const sl=$('tau-slider');if(animId){cancelAnimationFrame(animId);animId=0;}
    if(reduced.matches){sl.value=1000;drawBlowup();return;}
    const start=performance.now(),dur=7000;sl.value=0;
    const tick=now=>{const p=Math.min(1,(now-start)/dur);sl.value=Math.round(p*1000);drawBlowup();animId=p<1?requestAnimationFrame(tick):0;};
    animId=requestAnimationFrame(tick);
  });
  drawBlowup();
})();
