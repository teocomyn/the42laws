(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory();else root.RelativityPhysics=factory();})(typeof globalThis!=='undefined'?globalThis:this,function(){
 'use strict';
 function gamma(beta){if(!Number.isFinite(beta)||Math.abs(beta)>=1)throw new RangeError('La vitesse doit vérifier |v/c| < 1.');return 1/Math.sqrt((1-beta)*(1+beta));}
 function trip(beta,years,fraction=1){
  const g=gamma(beta);
  if(!Number.isFinite(years)||years<=0)throw new RangeError('La durée doit être strictement positive.');
  if(!Number.isFinite(fraction)||fraction<0||fraction>1)throw new RangeError('La progression doit être comprise entre 0 et 1.');
  const earth=years*fraction,traveler=earth/g;
  return {gamma:g,earth,traveler,gap:earth-traveler,distance:beta*years*Math.min(fraction,1-fraction),turnDistance:Math.abs(beta)*years/2,totalTraveler:years/g,totalGap:years-years/g};
 }
 function settings(query){const p=new URLSearchParams(query);function value(key,fallback,min,max){const raw=p.get(key);if(raw===null||raw.trim()==='')return fallback;const n=Number(raw);return Number.isFinite(n)&&n>=min&&n<=max?n:fallback;}return {beta:Math.round(value('v',.8,0,.99)*100)/100,years:Math.round(value('duree',10,1,40))};}
 return {gamma,trip,settings};
});
