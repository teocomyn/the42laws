(function(){
 'use strict';
 const P=RelativityPhysics,$=id=>document.getElementById(id),initial=P.settings(location.search);
 let beta=initial.beta,years=initial.years,fraction=0,timer=0,last=0;
 const format=(n,d=2)=>n.toLocaleString('fr-FR',{minimumFractionDigits:d,maximumFractionDigits:d});
 const duration=n=>format(n)+(n<=1?' an':' ans');
 $('speed').value=beta;$('duration').value=years;
 function stop(){cancelAnimationFrame(timer);timer=0;$('play').textContent='Animer le voyage';$('play').setAttribute('aria-pressed','false');}
 function draw(announce=false){
  const s=P.trip(beta,years,fraction),x=60+290*s.distance/years,y=345-290*fraction;
  $('speed-value').textContent=format(beta)+' c';$('duration-value').textContent=years+(years===1?' an':' ans');
  $('earth-time').textContent=duration(s.earth);$('traveler-time').textContent=duration(s.traveler);$('final-gap').textContent=duration(s.totalGap);$('gamma').textContent=format(s.gamma,3);$('turn-distance').textContent=format(s.turnDistance)+' a.l.';
  $('earth-fill').style.width=(fraction*100)+'%';$('traveler-fill').style.width=(fraction/s.gamma*100)+'%';$('progress').value=Math.round(fraction*100);$('progress-value').textContent=Math.round(fraction*100)+' %';
  $('ship-path').setAttribute('d',`M 60 345 L ${60+145*beta} 200 L 60 55`);$('slice').setAttribute('d',`M 60 ${y} H 540`);$('earth-dot').setAttribute('cy',y);$('ship-dot').setAttribute('cx',x);$('ship-dot').setAttribute('cy',y);$('time-top').textContent=years+' a';$('space-end').textContent=years+' a.l.';
  $('diagram-desc').textContent=`Référentiel terrestre. Temps terrestre ${duration(s.earth)}, temps voyageur ${duration(s.traveler)}, distance actuelle ${format(s.distance)} années-lumière. Demi-tour à ${format(s.turnDistance)} années-lumière.`;
  document.querySelectorAll('[data-speed]').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.speed)===beta)));
  if(announce)$('status').textContent=fraction===1?`Retrouvailles : ${duration(s.earth)} sur Terre, ${duration(s.traveler)} pour le voyageur. Écart : ${duration(s.gap)}.`:fraction===0?'Au départ. Les deux horloges sont à zéro.':fraction===.5?`Demi-tour idéal à ${format(s.distance)} années-lumière. Le temps propre reste continu.`:`${fraction<.5?'Aller':'Retour'} : ${duration(s.earth)} sur Terre, ${duration(s.traveler)} à bord.`;
 }
 function reset(){stop();fraction=0;draw(true);}
 function settings(){beta=Number($('speed').value);years=Number($('duration').value);reset();}
 function animate(now){fraction=Math.min(1,fraction+(now-last)/12000);last=now;draw();if(fraction===1){stop();draw(true);}else timer=requestAnimationFrame(animate);}
 $('play').addEventListener('click',()=>{if(timer){stop();draw(true);return;}if(fraction===1)fraction=0;last=performance.now();$('play').textContent='Pause';$('play').setAttribute('aria-pressed','true');$('status').textContent='Voyage en cours. Vous pouvez mettre en pause ou parcourir le voyage au curseur.';timer=requestAnimationFrame(animate);});
 $('step').addEventListener('click',()=>{stop();fraction=Math.min(1,Math.round((fraction+.1)*100)/100);draw(true);});$('finish').addEventListener('click',()=>{stop();fraction=1;draw(true);});$('reset').addEventListener('click',reset);
 $('progress').addEventListener('input',()=>{stop();fraction=Number($('progress').value)/100;draw(true);});$('speed').addEventListener('input',settings);$('duration').addEventListener('input',settings);
 document.querySelectorAll('[data-speed]').forEach(b=>b.addEventListener('click',()=>{$('speed').value=b.dataset.speed;settings();}));
 $('share').addEventListener('click',async()=>{const url=new URL(location.href);url.search='';url.searchParams.set('v',String(beta));url.searchParams.set('duree',String(years));url.hash='laboratoire';try{await navigator.clipboard.writeText(url.href);$('share-status').textContent='Lien des réglages copié'+(location.hostname==='127.0.0.1'||location.hostname==='localhost'?' (adresse locale).':'.');}catch{const a=document.createElement('a');a.href=url.href;a.textContent=url.href;$('share-status').replaceChildren('Copiez ce lien : ',a);}});
 document.addEventListener('visibilitychange',()=>{if(document.hidden){stop();draw(true);}});reset();
})();
