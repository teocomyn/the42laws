'use strict';
(() => {
  const $=id=>document.getElementById(id);
  const matter='#ffac7d',anti='#bba3fc',gold='#f5dfac';
  const number=(n,d=0)=>n.toLocaleString('fr-FR',{minimumFractionDigits:d,maximumFractionDigits:d});
  const pairs={
    electron:{name:'Électron',antiname:'Positon',symbol:'e⁻',antisymbol:'e⁺',charge:'−1 e',anticharge:'+1 e',type:'Lepton élémentaire',antitype:'Antilepton élémentaire',structure:'Aucune structure interne détectée',antistructure:'Aucune structure interne détectée',note:'Le positon, aussi appelé positron, a la même masse et le même spin que l’électron. Sa charge électrique est opposée.'},
    proton:{name:'Proton',antiname:'Antiproton',symbol:'p',antisymbol:'p̄',charge:'+1 e',anticharge:'−1 e',type:'Baryon composite',antitype:'Antibaryon composite',structure:'Quarks de valence : u u d',antistructure:'Antiquarks de valence : ū ū d̄',note:'Le proton et l’antiproton sont composites. Ces triplets décrivent leurs quarks de valence ; leur structure comprend aussi des gluons et une mer de quarks et d’antiquarks.'},
    neutron:{name:'Neutron',antiname:'Antineutron',symbol:'n',antisymbol:'n̄',charge:'0 e',anticharge:'0 e',type:'Baryon composite',antitype:'Antibaryon composite',structure:'Quarks de valence : u d d',antistructure:'Antiquarks de valence : ū d̄ d̄',note:'Tous deux sont électriquement neutres, mais distincts : leur nombre baryonique est opposé (+1 et −1). Inverser une charge nulle ne suffit donc pas à décrire l’antimatière.'}
  };
  document.querySelectorAll('[data-pair]').forEach(btn=>btn.addEventListener('click',()=>{
    const p=pairs[btn.dataset.pair];
    document.querySelectorAll('[data-pair]').forEach(b=>{const selected=b===btn;b.classList.toggle('selected',selected);b.setAttribute('aria-pressed',String(selected));});
    Object.entries({'particle-name':p.name,'antiparticle-name':p.antiname,'particle-symbol':p.symbol,'antiparticle-symbol':p.antisymbol,'particle-charge':p.charge,'antiparticle-charge':p.anticharge,'particle-type':p.type,'antiparticle-type':p.antitype,'particle-structure':p.structure,'antiparticle-structure':p.antistructure,'pair-note':p.note}).forEach(([id,text])=>$(id).textContent=text);
  }));
  document.querySelectorAll('details').forEach(el=>el.addEventListener('toggle',()=>el.querySelector('summary>span').textContent=el.open?'−':'+'));

  const kinetic=$('kinetic'),portrait=$('portrait-canvas'),collision=$('collision-canvas');
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  let portraitPaused=reduced.matches,portraitVisible=true,collisionVisible=true;
  let elapsed=0,time=0,last=0,raf=null;
  // ready -> running <-> paused -> completed; reset and input changes return to ready.
  let state='ready';
  let portraitSurface,collisionSurface;
  function surface(canvas){
    const {width,height}=canvas.getBoundingClientRect(),dpr=Math.min(devicePixelRatio||1,2);
    canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);
    const ctx=canvas.getContext('2d');ctx.setTransform(dpr,0,0,dpr,0,0);
    return {ctx,w:width,h:height};
  }
  function setMetric(id,value,unit){
    const small=document.createElement('small');small.textContent=unit;
    $(id).replaceChildren(document.createTextNode(value+' '),small);
  }
  function updateEnergy(){
    const k=Number(kinetic.value),v=AntimatterPhysics.annihilation(k);
    $('kinetic-value').textContent=number(k,2)+' MeV';
    setMetric('total-energy',number(v.totalMeV,3),'MeV');
    setMetric('photon-energy',number(v.photonKeV,0),'keV');
    setMetric('wavelength',number(v.wavelengthPm,3),'pm');
    document.querySelectorAll('[data-energy]').forEach(b=>{const active=Number(b.dataset.energy)===k;b.classList.toggle('selected',active);b.setAttribute('aria-pressed',String(active));});
    state='ready';elapsed=0;updateState();drawCollision();schedule();
  }
  const stage=()=>state==='completed'?2:elapsed<1.8?0:elapsed<2.45?1:2;
  let previousStage=-1;
  function updateState(){
    $('state-label').textContent={ready:'PRÊT',running:'EN COURS',paused:'EN PAUSE',completed:'TERMINÉ'}[state];
    $('launch').disabled=state==='running'||state==='paused';
    $('launch').replaceChildren(document.createTextNode((state==='completed'?'Rejouer l’annihilation':'Lancer l’annihilation')+' '));
    const arrow=document.createElement('span');arrow.textContent=state==='completed'?'↺':'↗';$('launch').append(arrow);
    const p=$('collision-pause');p.disabled=state==='ready'||state==='completed';p.textContent=state==='paused'?'▶ Reprendre':'Ⅱ Pause';p.setAttribute('aria-pressed',String(state==='paused'));
    const s=stage();previousStage=s;
    for(let i=0;i<3;i++)$('stage-'+i).classList.toggle('active',s===i);
    $('collision-status').textContent=state==='ready'?'Prêt : lancez la rencontre pour suivre le transfert d’énergie.':state==='paused'?'Animation en pause. Reprenez-la ou modifiez l’énergie pour recommencer.':state==='completed'?'Deux photons opposés emportent toute l’énergie initiale du système. L’énergie et la quantité de mouvement sont conservées.':s===0?'L’électron et le positon se rencontrent. Le déplacement est schématique.':s===1?'Annihilation : le canal à deux photons est représenté.':'Les deux photons s’éloignent en sens opposés.';
  }
  kinetic.addEventListener('input',updateEnergy);
  document.querySelectorAll('[data-energy]').forEach(b=>b.addEventListener('click',()=>{kinetic.value=b.dataset.energy;updateEnergy();}));
  $('launch').addEventListener('click',()=>{if(state==='running'||state==='paused')return;elapsed=reduced.matches?4.4:0;state=reduced.matches?'completed':'running';updateState();drawCollision();schedule();});
  $('collision-pause').addEventListener('click',()=>{if(state!=='running'&&state!=='paused')return;state=state==='running'?'paused':'running';updateState();schedule();});
  $('reset').addEventListener('click',()=>{kinetic.value=0;updateEnergy();});

  let removed=false;
  function updateBalance(){
    const excess=Number($('excess').value),inv=AntimatterPhysics.inventory(24,excess,removed),initial=AntimatterPhysics.inventory(24,excess);
    $('excess-value').textContent=excess===0?'Égalité':`+${Math.abs(excess)} ${excess>0?'matière':'antimatière'}`;
    $('matter-count').textContent=inv.matter;$('antimatter-count').textContent=inv.antimatter;
    $('net-excess').textContent=(excess>0?'+':'')+excess;$('net-excess').style.color=excess<0?anti:matter;
    $('pair-summary').textContent=removed?'24 paires retirées':'24 paires disponibles';
    const result=excess===0?'Aucun excès initial : il ne reste aucune des particules comptées.':`Il reste ${Math.abs(excess)} particule${Math.abs(excess)>1?'s':''} ${excess>0?'de matière':'d’antimatière'} : exactement l’excès initial.`;
    $('balance-status').textContent=removed?result+' Les produits d’annihilation ne sont pas dessinés.':`${initial.matter} particules de matière et ${initial.antimatter} d’antimatière. ${excess===0?'Autant de chaque.':Math.abs(excess)+' particule'+(Math.abs(excess)>1?'s':'')+' en excès.'}`;
    $('remove-pairs').replaceChildren(document.createTextNode((removed?'Reconstituer les paires':'Retirer les 24 paires')+' '));const arrow=document.createElement('span');arrow.textContent=removed?'↺':'↗';$('remove-pairs').append(arrow);
    const nodes=[];
    for(let i=0;i<24;i++)for(const isAnti of [false,true]){const dot=document.createElement('i');dot.className=(isAnti?'anti ':'')+(removed?'removed':'');dot.textContent='';nodes.push(dot);}
    for(let i=0;i<Math.abs(excess);i++){const dot=document.createElement('i');dot.className=(excess<0?'anti ':'')+(removed?'survivor':'');dot.textContent='';nodes.push(dot);}
    $('particle-grid').replaceChildren(...nodes);
  }
  $('excess').addEventListener('input',()=>{removed=false;updateBalance();});
  $('remove-pairs').addEventListener('click',()=>{removed=!removed;updateBalance();});

  let seed=102;function random(){seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;}
  const stars=Array.from({length:150},()=>({x:random(),y:random(),r:.25+random()*.7,a:.1+random()*.4}));
  const grains=Array.from({length:650},()=>({angle:random()*Math.PI*2,r:Math.sqrt(random()),size:.3+random()*.7}));
  function glow(ctx,x,y,r,color){const g=ctx.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,color+'55');g.addColorStop(.28,color+'20');g.addColorStop(1,color+'00');ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();}
  function drawPortrait(){
    if(!portraitSurface)return;const {ctx,w,h}=portraitSurface;if(!w||!h)return;
    ctx.clearRect(0,0,w,h);ctx.fillStyle='#110e14';ctx.fillRect(0,0,w,h);
    ctx.strokeStyle='#a18cad0b';ctx.lineWidth=.6;
    for(let x=20;x<w;x+=42){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,h);ctx.stroke();}
    for(let y=20;y<h;y+=42){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(w,y);ctx.stroke();}
    stars.forEach(s=>{ctx.fillStyle=`rgba(208,189,218,${s.a})`;ctx.beginPath();ctx.arc(s.x*w,s.y*h,s.r,0,Math.PI*2);ctx.fill();});
    const mobile=w<550,cy=h*.44,r=Math.min(w*(mobile?.20:.145),h*.30);
    ctx.strokeStyle='#6c557335';ctx.setLineDash([3,8]);ctx.beginPath();ctx.moveTo(w*.5,60);ctx.lineTo(w*.5,h-85);ctx.stroke();ctx.setLineDash([]);
    for(let side=0;side<2;side++){
      const x=w*(mobile?(side?.75:.25):(side?.7:.3)),color=side?anti:matter,direction=side?-1:1;
      glow(ctx,x,cy,r*1.7,color);ctx.save();ctx.translate(x,cy);
      for(let i=0;i<24;i++){
        const radius=r*(.74+i*.015),rotation=direction*(.6+time*.03+i*.025);
        ctx.beginPath();ctx.ellipse(0,0,radius,radius*(.50+.17*Math.sin(i*.18+time*.08)**2),rotation,0,2*Math.PI);
        ctx.strokeStyle=color+(i%5===0?'65':'28');ctx.lineWidth=i%5===0?.9:.6;ctx.stroke();
      }
      grains.forEach(g=>{const a=g.angle+direction*time*.04,rad=r*g.r;const gx=Math.cos(a)*rad,gy=Math.sin(a)*rad*.67;ctx.fillStyle=color+(g.r<.45?'a0':'48');ctx.beginPath();ctx.arc(gx,gy,g.size*(1.15-g.r*.5),0,Math.PI*2);ctx.fill();});
      ctx.fillStyle=color;ctx.shadowBlur=20;ctx.shadowColor=color;ctx.beginPath();ctx.arc(0,0,4.3,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;
      ctx.font=`${mobile?25:32}px Georgia`;ctx.fillStyle='#f6eef6';ctx.textAlign='center';ctx.fillText(side?'+':'−',0,-r-13);ctx.restore();
    }
  }
  function drawParticle(ctx,x,y,color,label){
    glow(ctx,x,y,32,color);ctx.beginPath();ctx.arc(x,y,13,0,2*Math.PI);ctx.fillStyle=color;ctx.fill();ctx.font='15px Georgia';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle='#251823';ctx.fillText(label,x,y);ctx.textBaseline='alphabetic';
  }
  function wave(ctx,cx,cy,dist,angle,color){
    ctx.save();ctx.translate(cx,cy);ctx.rotate(angle);ctx.strokeStyle=color;ctx.lineWidth=1.7;ctx.beginPath();
    for(let x=8;x<=dist;x+=2){const y=Math.sin(x*.20)*5;x===8?ctx.moveTo(x,y):ctx.lineTo(x,y);}ctx.stroke();
    ctx.fillStyle=color;ctx.beginPath();ctx.moveTo(dist+5,0);ctx.lineTo(dist-3,-4);ctx.lineTo(dist-3,4);ctx.closePath();ctx.fill();ctx.restore();
  }
  function drawCollision(){
    if(!collisionSurface)return;const {ctx,w,h}=collisionSurface;if(!w||!h)return;
    ctx.clearRect(0,0,w,h);const cx=w/2,cy=h*.50,spread=w*.32;
    ctx.strokeStyle='#6b536824';ctx.lineWidth=.6;ctx.setLineDash([3,7]);ctx.beginPath();ctx.moveTo(10,cy);ctx.lineTo(w-10,cy);ctx.stroke();ctx.setLineDash([]);
    const t=state==='completed'?4.4:elapsed;
    ctx.font='9px monospace';ctx.textAlign='center';ctx.fillStyle='#a69aaa';
    if(t<1.8){
      const p=Math.min(t/1.8,1),offset=spread*(1-p);
      drawParticle(ctx,cx-offset,cy,matter,'−');drawParticle(ctx,cx+offset,cy,anti,'+');
      if(p<.65){ctx.fillStyle=matter;ctx.fillText('e⁻',cx-offset,cy-35);ctx.fillStyle=anti;ctx.fillText('e⁺',cx+offset,cy-35);}
      ctx.fillStyle='#a99aaf';ctx.fillText('électron  +  positon',cx,h-21);
    }else{
      const p=Math.min(1,(t-1.8)/1.5),length=20+p*Math.min(w*.35,h*.42);
      if(t<2.7)glow(ctx,cx,cy,25+(t-1.8)*50,gold);
      wave(ctx,cx,cy,length,-Math.PI*.19,gold);wave(ctx,cx,cy,length,Math.PI*.81,gold);
      const dx=Math.cos(Math.PI*.19)*length,dy=Math.sin(Math.PI*.19)*length;
      ctx.fillStyle=gold;ctx.font='15px Georgia';ctx.fillText('γ',cx+dx+12,cy-dy-10);ctx.fillText('γ',cx-dx-12,cy+dy+21);
      ctx.fillStyle='#a99aaf';ctx.font='9px monospace';ctx.fillText('deux photons · directions opposées',cx,h-21);
      if(state==='completed'){ctx.font='10px monospace';ctx.fillStyle=gold;ctx.fillText(number(AntimatterPhysics.annihilation(Number(kinetic.value)).photonKeV)+' keV / photon',cx,27);}
    }
  }
  function animating(){return !document.hidden&&((!portraitPaused&&portraitVisible)||(state==='running'&&collisionVisible));}
  function tick(now){
    raf=null;if(!animating())return;
    const dt=last?Math.min((now-last)/1000,.06):0;last=now;
    if(!portraitPaused&&portraitVisible){time+=dt;drawPortrait();}
    if(state==='running'&&collisionVisible){elapsed+=dt;if(elapsed>=4.4){elapsed=4.4;state='completed';updateState();}else if(stage()!==previousStage)updateState();drawCollision();}
    if(animating())raf=requestAnimationFrame(tick);
  }
  function schedule(){if(raf!==null){cancelAnimationFrame(raf);raf=null;}last=0;if(animating())raf=requestAnimationFrame(tick);}
  function updatePortraitPause(){const btn=$('portrait-pause');btn.textContent=portraitPaused?'▶':'Ⅱ';btn.setAttribute('aria-pressed',String(portraitPaused));btn.setAttribute('aria-label',portraitPaused?'Reprendre le portrait animé':'Mettre le portrait en pause');schedule();}
  $('portrait-pause').addEventListener('click',()=>{portraitPaused=!portraitPaused;updatePortraitPause();});
  reduced.addEventListener('change',e=>{portraitPaused=e.matches;if(e.matches&&(state==='running'||state==='paused')){state='completed';elapsed=4.4;updateState();drawCollision();}updatePortraitPause();});
  document.addEventListener('visibilitychange',schedule);
  const observer=new IntersectionObserver(entries=>{for(const entry of entries){if(entry.target===portrait)portraitVisible=entry.isIntersecting;else collisionVisible=entry.isIntersecting;}schedule();});observer.observe(portrait);observer.observe(collision);
  const resize=()=>{portraitSurface=surface(portrait);collisionSurface=surface(collision);drawPortrait();drawCollision();};
  new ResizeObserver(resize).observe(document.querySelector('main'));window.addEventListener('resize',resize);
  resize();updateEnergy();updateBalance();updatePortraitPause();
})();
