(function(root){
'use strict';
function check(p){if(!p||![p.wavelength,p.distance,p.separation,p.width].every(v=>Number.isFinite(v)&&v>0)||![1,2].includes(p.slits)||p.width>=p.separation)throw new RangeError('Invalid diffraction parameters');}
function sinc(x){return Math.abs(x)<1e-8?1:Math.sin(x)/x;}
function intensity(x,p){check(p);if(!Number.isFinite(x))throw new RangeError('Invalid screen position');const beta=Math.PI*p.width*x/(p.wavelength*p.distance);const interference=p.slits===1?1:1+(p.whichPath?0:Math.cos(2*Math.PI*p.separation*x/(p.wavelength*p.distance)));return sinc(beta)**2*interference;}
function distribution(p,extent=.03,bins=1001){check(p);if(!Number.isFinite(extent)||extent<=0||!Number.isInteger(bins)||bins<3||bins>100001)throw new RangeError('Invalid screen');const xs=Array.from({length:bins},(_,i)=>-extent+2*extent*i/(bins-1));const raw=xs.map(x=>intensity(x,p)),sum=raw.reduce((a,b)=>a+b,0);const probabilities=raw.map(v=>v/sum);let acc=0;const cdf=probabilities.map(v=>acc+=v);cdf[cdf.length-1]=1;return {xs,probabilities,cdf,extent};}
function sample(d,rng=Math.random){const u=rng();if(!Number.isFinite(u)||u<0||u>=1)throw new RangeError('Random value outside [0,1)');let lo=0,hi=d.cdf.length-1;while(lo<hi){const mid=(lo+hi)>>1;if(d.cdf[mid]>u)hi=mid;else lo=mid+1;}return d.xs[lo];}
function energyEV(wavelength){if(!Number.isFinite(wavelength)||wavelength<=0)throw new RangeError('Invalid wavelength');return 6.62607015e-34*299792458/(wavelength*1.602176634e-19);}
const api={sinc,intensity,distribution,sample,energyEV};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.PhotonPhysics=api;
})(globalThis);
