'use strict';
const $ = id => document.getElementById(id);
const colors=['#c4f58b','#8fcbe8','#c6abf3'];
const names=['électronique','muonique','tauique'];
const format = new Intl.NumberFormat('fr-FR',{maximumFractionDigits:1,minimumFractionDigits:1});
let flavor=1;
const energy=$('energy'), distance=$('distance');
const chart=$('chart'), scene=$('universe');
function canvasSize(canvas) {
  const {width,height}=canvas.getBoundingClientRect();
  const ratio=Math.min(window.devicePixelRatio||1,2);
  canvas.width=Math.round(width*ratio);canvas.height=Math.round(height*ratio);
  const ctx=canvas.getContext('2d');ctx.setTransform(ratio,0,0,ratio,0,0);
  return {ctx,width,height};
}
let chartSurface, sceneSurface;
function drawChart(){
  if(!chartSurface)return;
  const {ctx,width:w,height:h}=chartSurface;
  if(w<1||h<1)return;
  const left=29, top=12, right=10, bottom=24, cw=w-left-right, ch=h-top-bottom;
  ctx.clearRect(0,0,w,h);ctx.font='9px monospace';ctx.textBaseline='middle';
  [0,.5,1].forEach(p=>{
    const y=top+ch*(1-p);ctx.strokeStyle='#29342c';ctx.lineWidth=1;
    ctx.beginPath();ctx.moveTo(left,y);ctx.lineTo(w-right,y);ctx.stroke();
    ctx.fillStyle='#97a493';ctx.textAlign='right';ctx.fillText(String(p*100),left-8,y);
  });
  [0,1000,2000,3000].forEach(d=>{
    const x=left+cw*d/3000;
    ctx.textAlign=d===0?'left':d===3000?'right':'center';ctx.fillStyle='#97a493';
    ctx.fillText(d.toLocaleString('fr-FR'),x,h-6);
  });
  const e=Number(energy.value), l=Number(distance.value), samples=Math.max(600,Math.ceil(cw));
  const points=Array.from({length:samples+1},(_,i)=>NeutrinoPhysics.probabilities(flavor,3000*i/samples,e));
  for(let beta=0;beta<3;beta++){
    ctx.strokeStyle=colors[beta];ctx.lineWidth=1.8;ctx.setLineDash(beta===0?[]:beta===1?[6,3]:[2,3]);ctx.beginPath();
    points.forEach((ps,i)=>{const x=left+cw*i/samples,y=top+ch*(1-ps[beta]);i?ctx.lineTo(x,y):ctx.moveTo(x,y);});ctx.stroke();
  }
  ctx.setLineDash([3,5]);ctx.strokeStyle='#dce8d5';ctx.lineWidth=1;
  const x=left+cw*l/3000;ctx.beginPath();ctx.moveTo(x,top);ctx.lineTo(x,top+ch);ctx.stroke();ctx.setLineDash([]);
  NeutrinoPhysics.probabilities(flavor,l,e).forEach((p,i)=>{
    ctx.beginPath();ctx.arc(x,top+ch*(1-p),3.5,0,Math.PI*2);ctx.fillStyle=colors[i];ctx.fill();ctx.strokeStyle='#101612';ctx.stroke();
  });
}
function update(){
  const e=Number(energy.value),l=Number(distance.value);
  $('energy-value').textContent=format.format(e)+' GeV';
  $('distance-value').textContent=l.toLocaleString('fr-FR')+' km';
  $('cursor-label').textContent=l.toLocaleString('fr-FR')+' km';
  const probs=NeutrinoPhysics.probabilities(flavor,l,e);
  probs.forEach((p,i)=>{$('prob-'+i).textContent=format.format(p*100)+' %';$('bar-'+i).style.width=p*100+'%';});
  const best=probs.indexOf(Math.max(...probs));
  $('insight').textContent=l===0?'À la production, la saveur initiale a une probabilité de 100 %. Les autres probabilités sont nulles.':`À ${l.toLocaleString('fr-FR')} km, la saveur ${names[best]} est la plus probable (${format.format(probs[best]*100)} %). Ce résultat concerne un ensemble de mesures, pas le destin certain d’un neutrino.`;
  drawChart();
}
document.querySelectorAll('[data-flavor]').forEach(btn=>btn.addEventListener('click',()=>{
  flavor=Number(btn.dataset.flavor);
  document.querySelectorAll('[data-flavor]').forEach(b=>{const active=Number(b.dataset.flavor)===flavor;b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active));});
  update();
}));
energy.addEventListener('input',update);distance.addEventListener('input',update);
$('reset').addEventListener('click',()=>{energy.value=1;distance.value=500;document.querySelector('[data-flavor="1"]').click();});
const stories={
  sun:{kicker:'UNE ÉTOILE, TOUT PRÈS DE NOUS',title:'Nés au cœur du Soleil.',text:'Lors de la fusion nucléaire, des neutrinos électroniques sont produits. Ils s’échappent facilement du Soleil et une partie atteint la Terre. Les saveurs observées à l’arrivée peuvent être différentes.',steps:['Fusion solaire','Espace','Vous'],url:'https://neutrinos.fnal.gov/sources/solar-neutrinos/'},
  supernova:{kicker:'LES DERNIERS INSTANTS D’UNE ÉTOILE',title:'Un effondrement. Une pluie de neutrinos.',text:'Lorsqu’une étoile massive s’effondre, elle émet un immense flux de neutrinos et d’antineutrinos. Ces messagers emportent une grande partie de l’énergie libérée et nous renseignent sur le cœur de l’explosion.',steps:['Effondrement','Neutrinos','Détecteur'],url:'https://neutrinos.fnal.gov/sources/supernova-neutrinos/'},
  atmosphere:{kicker:'AU-DESSUS DE NOS TÊTES',title:'Une rencontre dans l’atmosphère.',text:'Des rayons cosmiques heurtent les noyaux de l’atmosphère. La cascade de particules qui suit, notamment la désintégration de pions et de muons, produit des neutrinos et des antineutrinos.',steps:['Rayon cosmique','Cascade','Neutrinos'],url:'https://neutrinos.fnal.gov/sources/atmospheric-neutrinos/'},
  reactor:{kicker:'DES SOURCES ICI, SUR TERRE',title:'Les messagers de la radioactivité.',text:'Dans un réacteur, les produits de fission riches en neutrons subissent des désintégrations bêta. Ils émettent principalement des antineutrinos électroniques, étudiés pour comprendre les oscillations.',steps:['Fission','Désintégrations β','Antineutrinos'],url:'https://neutrinos.fnal.gov/sources/reactor-neutrinos/'}
};
document.querySelectorAll('[data-source]').forEach(btn=>btn.addEventListener('click',()=>{
  const data=stories[btn.dataset.source];
  document.querySelectorAll('[data-source]').forEach(b=>{const active=b===btn;b.classList.toggle('selected',active);b.setAttribute('aria-pressed',String(active));});
  $('source-kicker').textContent=data.kicker;$('source-title').textContent=data.title;$('source-text').textContent=data.text;
  $('journey').replaceChildren();data.steps.forEach((step,i)=>{if(i){const arrow=document.createElement('i');arrow.textContent='→';$('journey').append(arrow);}const el=document.createElement('span');el.textContent=step;$('journey').append(el);});
  $('source-link').href=data.url;
}));
document.querySelectorAll('details').forEach(el=>el.addEventListener('toggle',()=>{el.querySelector('summary>span').textContent=el.open?'−':'+';}));
// This canvas is an artistic evocation. It intentionally does not depict an orbit,
// a measured particle size, a physical flux, or a simulated detection event.
let seed=42;function random(){seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;}
const stars=Array.from({length:170},()=>({x:random(),y:random(),r:.3+random()*.8,a:.15+random()*.5}));
const trails=Array.from({length:58},()=>({x:random(),y:random(),speed:.015+random()*.028,length:18+random()*80,a:.04+random()*.14}));
const specks=Array.from({length:1400},()=>({angle:random()*Math.PI*2,r:Math.pow(random(),.7),offset:random(),size:.25+random()*.85}));
let time=0,last=0,frameId=null,visible=true;
const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
let paused=reduced.matches;
function drawScene(){
  if(!sceneSurface)return;
  const {ctx,width:w,height:h}=sceneSurface;
  if(w<1||h<1)return;
  ctx.clearRect(0,0,w,h);ctx.fillStyle='#0a110f';ctx.fillRect(0,0,w,h);
  const cx=w*.44,cy=h*.49,r=Math.min(w*.22,h*.35);
  const glow=ctx.createRadialGradient(cx,cy,0,cx,cy,r*2.15);glow.addColorStop(0,'#72944525');glow.addColorStop(.4,'#41693b1a');glow.addColorStop(1,'#0a110f00');ctx.fillStyle=glow;ctx.fillRect(0,0,w,h);
  ctx.strokeStyle='#6a8b5010';ctx.lineWidth=.5;
  for(let x=24;x<w;x+=40){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,h);ctx.stroke();}
  for(let y=24;y<h;y+=40){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(w,y);ctx.stroke();}
  stars.forEach(s=>{ctx.fillStyle=`rgba(194,212,172,${s.a})`;ctx.beginPath();ctx.arc(s.x*w,s.y*h,s.r,0,Math.PI*2);ctx.fill();});
  trails.forEach(s=>{const x=((s.x+time*s.speed)%1.4-.2)*w,y=s.y*h;const g=ctx.createLinearGradient(x-s.length,y+20,x,y);g.addColorStop(0,'#c4f58b00');g.addColorStop(1,`rgba(196,245,139,${s.a})`);ctx.strokeStyle=g;ctx.lineWidth=.7;ctx.beginPath();ctx.moveTo(x-s.length,y+20);ctx.lineTo(x,y);ctx.stroke();});
  // Delicate, tilted interference-like ellipses create an abstract field portrait.
  ctx.save();ctx.translate(cx,cy);ctx.rotate(-.28);
  for(let i=0;i<32;i++){
    const rr=r*(.75+i*.0105);ctx.beginPath();ctx.ellipse(0,0,rr,rr*(.43+.28*Math.sin(i*.075+time*.12)**2),Math.sin(i*.17+time*.08)*.45,0,Math.PI*2);
    ctx.strokeStyle=`rgba(185,229,124,${.055+(i%5===0?.11:0)})`;ctx.lineWidth=.65;ctx.stroke();
  }
  ctx.restore();
  specks.forEach(p=>{const angle=p.angle+time*.025*(.5+p.r),rad=r*p.r;const x=cx+Math.cos(angle)*rad,y=cy+Math.sin(angle)*rad*.68;
    const density=Math.pow(1-p.r,1.7);ctx.fillStyle=`rgba(203,239,158,${.11+density*.7})`;ctx.beginPath();ctx.arc(x,y,p.size*(.6+density),0,Math.PI*2);ctx.fill();});
  const core=ctx.createRadialGradient(cx,cy,0,cx,cy,r*.48);core.addColorStop(0,'#e0ffb980');core.addColorStop(.15,'#bcf47b35');core.addColorStop(1,'#a8e66700');ctx.fillStyle=core;ctx.beginPath();ctx.arc(cx,cy,r*.48,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#f1ffdb';ctx.shadowBlur=15;ctx.shadowColor='#c4f58b';ctx.beginPath();ctx.arc(cx,cy,2.4,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;
  ctx.strokeStyle='#b6cc8745';ctx.lineWidth=.7;ctx.beginPath();ctx.moveTo(cx+r*.25,cy);ctx.lineTo(w*.615,cy);ctx.stroke();
  ctx.font='9px monospace';ctx.fillStyle='#8fa17b';ctx.fillText('ν',cx-r*1.1,cy+r*.75);
}
function shouldAnimate(){return !paused && visible && !document.hidden;}
function tick(now){frameId=null;if(!shouldAnimate())return;const dt=last?Math.min((now-last)/1000,.05):0;last=now;time+=dt;drawScene();frameId=requestAnimationFrame(tick);}
function syncAnimation(){if(frameId!==null){cancelAnimationFrame(frameId);frameId=null;}last=0;if(shouldAnimate())frameId=requestAnimationFrame(tick);}
function updatePause(){const btn=$('pause');btn.setAttribute('aria-pressed',String(paused));btn.replaceChildren(document.createTextNode(paused?'▶ ':'Ⅱ '));const label=document.createElement('span');label.textContent=paused?'Reprendre l’animation':'Mettre en pause';btn.append(label);btn.setAttribute('aria-label',label.textContent);syncAnimation();}
$('pause').addEventListener('click',()=>{paused=!paused;updatePause();});
reduced.addEventListener('change',event=>{paused=event.matches;updatePause();});
document.addEventListener('visibilitychange',syncAnimation);
new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;syncAnimation();},{threshold:0}).observe(scene);
new ResizeObserver(()=>{chartSurface=canvasSize(chart);sceneSurface=canvasSize(scene);drawChart();drawScene();}).observe(document.querySelector('main'));
window.addEventListener('resize',()=>{chartSurface=canvasSize(chart);sceneSurface=canvasSize(scene);drawChart();drawScene();});
chartSurface=canvasSize(chart);sceneSurface=canvasSize(scene);update();drawScene();updatePause();
