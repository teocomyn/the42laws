/* Laboratoire Navier-Stokes — interface. Le calcul est dans physics.js. */
(function(){
  'use strict';
  const P=window.NavierStokesPhysics;
  const $=id=>document.getElementById(id);
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const fmt=(x,d=3)=>Number.isFinite(x)?x.toLocaleString('fr-FR',{maximumFractionDigits:d,minimumFractionDigits:d}):'—';
  const sci=x=>Number.isFinite(x)?x.toExponential(2).replace('e','·10^').replace('+',''):'—';

  // ---------- laboratoire 2D ----------
  const canvas=$('fluid-canvas'),ctx=canvas.getContext('2d');
  const off=document.createElement('canvas'),offCtx=off.getContext('2d');
  let n=128,state,vort,image,preset='taylor-green',view='vorticity',dt=0.02,forceStrength=3,userForced=false;
  let running=!reduced.matches,visible=true,rafId=0,lastStepMs=0;
  const nuFromSlider=s=>Math.pow(10,-4+3.5*s/100);
  let nu=nuFromSlider(Number($('viscosity').value));

  function build(){
    state=P.createFluid(n,{nu});vort=new Float32Array(n*n);
    off.width=off.height=n;image=offCtx.createImageData(n,n);
    loadPreset(preset);
  }
  function loadPreset(name){
    preset=name;userForced=false;P.reset(state);
    if(name==='taylor-green')P.taylorGreen(state,1);
    else if(name==='shear')P.shearLayers(state,1);
    for(const b of document.querySelectorAll('[data-preset]')){const on=b.dataset.preset===name;b.classList.toggle('selected',on);b.setAttribute('aria-pressed',String(on));}
    render();updateStats(P.diagnostics(state));
  }
  function colormap(){
    const d=image.data,{u,v,dye,size}=state;
    if(view==='dye'){for(let k=0;k<size;k++){const c=Math.max(0,Math.min(1,dye[k]));d[4*k]=16+c*180;d[4*k+1]=14+c*231;d[4*k+2]=18+c*121;d[4*k+3]=255;}}
    else if(view==='speed'){let m=0;for(let k=0;k<size;k++){const s=u[k]*u[k]+v[k]*v[k];if(s>m)m=s;}m=Math.sqrt(m)||1;
      for(let k=0;k<size;k++){const c=Math.sqrt(u[k]*u[k]+v[k]*v[k])/m;d[4*k]=16+c*c*239;d[4*k+1]=14+c*206;d[4*k+2]=18+Math.sqrt(c)*230;d[4*k+3]=255;}}
    else{const w=P.vorticity(state,vort),m=w.max||1;
      for(let k=0;k<size;k++){const c=Math.max(-1,Math.min(1,vort[k]/m*1.6));
        if(c>=0){d[4*k]=16+c*239;d[4*k+1]=14+c*158;d[4*k+2]=18+c*107;}else{d[4*k]=16-c*171;d[4*k+1]=14-c*149;d[4*k+2]=18-c*234;}d[4*k+3]=255;}}
  }
  function render(){
    colormap();offCtx.putImageData(image,0,0);
    ctx.imageSmoothingEnabled=true;ctx.drawImage(off,0,0,canvas.width,canvas.height);
  }
  let theoretical=null;
  function updateStats(d){
    $('stat-time').textContent=fmt(d.time,2);
    $('stat-energy').textContent=fmt(d.energy,3);
    theoretical=(preset==='taylor-green'&&!userForced)?P.taylorGreenEnergy(1,state.nu,d.time):null;
    $('stat-theory').textContent=theoretical===null?'—':fmt(theoretical,3);
    $('stat-gap').textContent=theoretical===null?'—':(d.energy/theoretical-1>=0?'+':'')+fmt((d.energy/theoretical-1)*100,1)+' %';
    $('stat-speed').textContent=fmt(d.maxSpeed,3);
    $('stat-reynolds').textContent=d.maxSpeed>0?sci(d.reynolds):'—';
    $('stat-div').textContent=sci(d.maxDivergence);
    $('stat-ms').textContent=lastStepMs?fmt(lastStepMs,1)+' ms':'—';
    $('stat-nu').textContent=sci(state.nu);
  }
  function frame(){
    rafId=0;
    if(running&&visible){
      const t0=performance.now();const d=P.step(state,dt);lastStepMs=performance.now()-t0;
      render();updateStats(d);
    }
    if(running&&visible)rafId=requestAnimationFrame(frame);
  }
  function schedule(){if(!rafId&&running&&visible)rafId=requestAnimationFrame(frame);}
  function setRunning(on){
    running=on;const b=$('run-toggle');b.textContent=on?'Ⅱ Pause':'▶ Lancer';b.setAttribute('aria-pressed',String(on));
    $('state-label').textContent=on?'EN COURS':'EN PAUSE';schedule();
  }
  // Interaction : une force extérieure brève sous le pointeur.
  let last=null;
  function cell(e){const r=canvas.getBoundingClientRect();return {x:(e.clientX-r.left)/r.width*n,y:(e.clientY-r.top)/r.height*n};}
  canvas.addEventListener('pointerdown',e=>{last=cell(e);canvas.setPointerCapture(e.pointerId);});
  canvas.addEventListener('pointermove',e=>{
    if(!last||!(e.buttons&1))return;const c=cell(e),dx=c.x-last.x,dy=c.y-last.y;last=c;
    const s=forceStrength*state.dx*0.5;
    P.addImpulse(state,c.x,c.y,dx*s,dy*s,n/40,0.6);userForced=true;
    if(!running){render();updateStats(P.diagnostics(state));}
  });
  canvas.addEventListener('pointerup',()=>{last=null;});canvas.addEventListener('pointercancel',()=>{last=null;});
  // Contrôles.
  $('viscosity').addEventListener('input',e=>{nu=nuFromSlider(Number(e.target.value));P.setViscosity(state,nu);$('viscosity-value').textContent='ν = '+sci(nu);$('stat-nu').textContent=sci(nu);});
  $('viscosity-value').textContent='ν = '+sci(nu);
  $('force-strength').addEventListener('input',e=>{forceStrength=Number(e.target.value);$('force-value').textContent='× '+forceStrength;});
  $('resolution').addEventListener('change',e=>{n=Number(e.target.value);build();});
  for(const b of document.querySelectorAll('[data-preset]'))b.addEventListener('click',()=>loadPreset(b.dataset.preset));
  for(const b of document.querySelectorAll('[data-view]'))b.addEventListener('click',()=>{view=b.dataset.view;for(const o of document.querySelectorAll('[data-view]')){const on=o===b;o.classList.toggle('selected',on);o.setAttribute('aria-pressed',String(on));}render();});
  $('run-toggle').addEventListener('click',()=>setRunning(!running));
  $('reset').addEventListener('click',()=>loadPreset(preset));
  $('step-button').addEventListener('click',()=>{let d;for(let k=0;k<10;k++)d=P.step(state,dt);render();updateStats(d);});
  document.addEventListener('visibilitychange',()=>{visible=!document.hidden;schedule();});
  reduced.addEventListener('change',e=>{if(e.matches)setRunning(false);});
  const obs='IntersectionObserver'in window?new IntersectionObserver(es=>{for(const x of es){visible=x.isIntersecting&&!document.hidden;}schedule();},{threshold:0.05}):null;
  if(obs)obs.observe(canvas);
  build();setRunning(running);

  // ---------- schéma d'explosion ----------
  const bc=$('blowup-canvas'),bctx=bc.getContext('2d');
  const tauFromSlider=s=>Math.pow(10,-4*s/1000);
  let hParam=Number($('h-slider').value)/10000,animId=0;
  function drawBlowup(){
    const s=Number($('tau-slider').value),tau=tauFromSlider(s),f=P.selfSimilarFamily(tau,{h:hParam});
    const W=bc.width,H=bc.height;bctx.clearRect(0,0,W,H);
    bctx.fillStyle='#17131a';bctx.fillRect(0,0,W,H);
    // colonne (gauche)
    const cx=W*0.27,cy=H*0.52,base=H*0.4;
    const halfW=Math.max(1,base*0.5*f.radius),halfH=Math.max(2,base*f.height);
    const heat=Math.min(1,Math.log10(f.velocity)/3);
    bctx.strokeStyle='#342b39';bctx.lineWidth=1;bctx.beginPath();bctx.moveTo(cx,cy-base*1.15);bctx.lineTo(cx,cy+base*1.15);bctx.stroke();
    bctx.strokeStyle='#4a3f50';bctx.setLineDash([4,5]);bctx.beginPath();bctx.ellipse(cx,cy,base*0.5,base,0,0,2*Math.PI);bctx.stroke();bctx.setLineDash([]); // colonne à τ = 1, pour l’échelle
    const g=bctx.createRadialGradient(cx,cy,0,cx,cy,Math.max(halfW,halfH));
    g.addColorStop(0,`rgba(255,${Math.round(230-heat*160)},${Math.round(120-heat*100)},0.95)`);g.addColorStop(1,'rgba(187,163,252,0.15)');
    bctx.fillStyle=g;bctx.beginPath();bctx.ellipse(cx,cy,halfW,halfH,0,0,2*Math.PI);bctx.fill();
    bctx.fillStyle='#aaa1ae';bctx.font='11px Arial';bctx.textAlign='center';
    bctx.fillText('rayon ≍ τ^½ · hauteur ≍ τ^(½−h)',cx,H-14);
    // courbes (droite)
    const x0=W*0.52,x1=W-24,y0=H-40,y1=24;
    bctx.strokeStyle='#342b39';bctx.beginPath();bctx.moveTo(x0,y1);bctx.lineTo(x0,y0);bctx.lineTo(x1,y0);bctx.stroke();
    const lo=-0.5,hi=3.5,ty=v=>y0-(Math.min(hi,Math.max(lo,Math.log10(v)))-lo)/(hi-lo)*(y0-y1);
    for(let d=0;d<=3;d++){const y=ty(Math.pow(10,d));bctx.fillStyle='#716675';bctx.textAlign='right';bctx.fillText('10^'+d,x0-6,y+4);bctx.strokeStyle='#1f1a23';bctx.beginPath();bctx.moveTo(x0,y);bctx.lineTo(x1,y);bctx.stroke();}
    const plot=(key,color)=>{bctx.strokeStyle=color;bctx.lineWidth=2;bctx.beginPath();for(let k=0;k<=200;k++){const ss=k*5,ff=P.selfSimilarFamily(tauFromSlider(ss),{h:hParam});const x=x0+(x1-x0)*ss/1000,y=ty(ff[key]);k?bctx.lineTo(x,y):bctx.moveTo(x,y);}bctx.stroke();};
    plot('supNorm','#ffac7d');plot('l2Norm','#c4f58b');
    const xm=x0+(x1-x0)*s/1000;bctx.strokeStyle='#f3eff1';bctx.lineWidth=1;bctx.setLineDash([3,4]);bctx.beginPath();bctx.moveTo(xm,y1);bctx.lineTo(xm,y0);bctx.stroke();bctx.setLineDash([]);
    bctx.fillStyle='#ffac7d';bctx.textAlign='left';bctx.fillText('‖u‖∞ (vitesse maximale)',x0+8,y1+12);bctx.fillStyle='#c4f58b';bctx.fillText('‖u‖₂ (racine de l’énergie)',x0+8,y1+26);
    bctx.fillStyle='#aaa1ae';bctx.textAlign='center';bctx.fillText('t → 1  (τ = 1 − t, échelle logarithmique)',(x0+x1)/2,H-14);
    $('bl-t').textContent=tau<1e-3?'1 − '+sci(tau):fmt(1-tau,4);$('bl-radius').textContent=sci(f.radius);$('bl-height').textContent=sci(f.height);
    $('bl-aspect').textContent=sci(f.aspect);$('bl-velocity').textContent=sci(f.velocity);$('bl-energy').textContent=fmt(f.energyProxy,6);$('bl-h').textContent=hParam.toFixed(4);
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
