/* Three-flavor vacuum oscillations; real PMNS matrix (delta_CP = 0).
 * Rounded illustrative inputs, not a current global fit.
 * L: km, E: GeV, mass-squared differences: eV^2.
 * Flavor indices: electron = 0, muon = 1, tau = 2.
 */
(function (root) {
  'use strict';
  const parameters = Object.freeze({theta12:33.4, theta13:8.6, theta23:49, dm21:7.5e-5, dm31:2.5e-3});
  function mixingMatrix(p = parameters) {
    const r = Math.PI / 180;
    const s12=Math.sin(p.theta12*r), c12=Math.cos(p.theta12*r);
    const s13=Math.sin(p.theta13*r), c13=Math.cos(p.theta13*r);
    const s23=Math.sin(p.theta23*r), c23=Math.cos(p.theta23*r);
    return [[c12*c13, s12*c13, s13],
      [-s12*c23-c12*s23*s13, c12*c23-s12*s23*s13, s23*c13],
      [s12*s23-c12*c23*s13, -c12*s23-s12*c23*s13, c23*c13]];
  }
  function probabilities(flavor, distance, energy, p=parameters) {
    if (!Number.isInteger(flavor) || flavor<0 || flavor>2 || !Number.isFinite(distance) || distance<0 || !Number.isFinite(energy) || energy<=0) throw new RangeError('Invalid flavor, distance, or energy');
    const u=mixingMatrix(p);
    const phases=[0,p.dm21,p.dm31].map(dm=>2*1.267*dm*distance/energy);
    return [0,1,2].map(beta=>{
      let real=0, imaginary=0;
      for(let i=0;i<3;i++) {
        const coefficient=u[beta][i]*u[flavor][i];
        real+=coefficient*Math.cos(phases[i]);
        imaginary-=coefficient*Math.sin(phases[i]);
      }
      return Math.min(1, Math.max(0,real*real+imaginary*imaginary));
    });
  }
  const api=Object.freeze({parameters,mixingMatrix,probabilities});
  if(typeof module!=='undefined' && module.exports) module.exports=api;
  else root.NeutrinoPhysics=api;
})(globalThis);
