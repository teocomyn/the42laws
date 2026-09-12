(function(root){
'use strict';
function validate(n,k){if(!Number.isInteger(n)||n<1||n>200||!Number.isInteger(k)||k<0||k>n)throw new RangeError('Invalid urn state');}
function logMultiplicity(n,k){validate(n,k);k=Math.min(k,n-k);let result=0;for(let i=1;i<=k;i++)result+=Math.log(n-k+i)-Math.log(i);return result;}
function equilibrium(n){validate(n,0);return Array.from({length:n+1},(_,k)=>Math.exp(logMultiplicity(n,k)-n*Math.log(2)));}
function step(state,rng=Math.random){if(!Array.isArray(state)||state.length<1||state.length>200||state.some(v=>v!==0&&v!==1))throw new RangeError('Invalid objects');const choice=rng(),move=rng();if(![choice,move].every(v=>Number.isFinite(v)&&v>=0&&v<1))throw new RangeError('Invalid random value');const next=[...state];if(move<.5){const index=Math.floor(choice*next.length);next[index]=1-next[index];}return next;}
const api={logMultiplicity,equilibrium,step};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.TimePhysics=api;
})(globalThis);
