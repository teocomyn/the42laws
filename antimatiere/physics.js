/* Pedagogical electron–positron annihilation in the center-of-momentum frame.
 * Selects the two-photon channel; equal incoming kinetic energies K (MeV).
 * No event rate, angular distribution, positronium kinetics, or detector model.
 * CODATA 2022 electron rest energy; exact SI h, c and elementary charge.
 */
(function(root){
  'use strict';
  const ELECTRON_REST_MEV=0.51099895069;
  const PLANCK=6.62607015e-34, LIGHT_SPEED=299792458, ELEMENTARY_CHARGE=1.602176634e-19;
  const MEV_TO_JOULES=ELEMENTARY_CHARGE*1e6;
  function annihilation(kineticMeV){
    if(!Number.isFinite(kineticMeV)||kineticMeV<0||kineticMeV>2)throw new RangeError('K must be between 0 and 2 MeV');
    const photonMeV=ELECTRON_REST_MEV+kineticMeV;
    return Object.freeze({kineticMeV,restMeV:2*ELECTRON_REST_MEV,totalMeV:2*photonMeV,photonMeV,
      photonKeV:photonMeV*1000,wavelengthPm:PLANCK*LIGHT_SPEED/(photonMeV*MEV_TO_JOULES)*1e12,
      totalJoules:2*photonMeV*MEV_TO_JOULES});
  }
  // A counting analogy: removing pairs conserves the initial net excess.
  function inventory(basePairs,excess,removePairs=false){
    if(!Number.isSafeInteger(basePairs)||basePairs<0||basePairs>10000||!Number.isSafeInteger(excess)||Math.abs(excess)>10000)throw new RangeError('Invalid counts');
    const matter=basePairs+Math.max(0,excess), antimatter=basePairs+Math.max(0,-excess);
    return Object.freeze({matter:removePairs?Math.max(0,excess):matter,
      antimatter:removePairs?Math.max(0,-excess):antimatter,
      annihilatedPairs:removePairs?basePairs:0,availablePairs:removePairs?0:basePairs,net:excess});
  }
  const api=Object.freeze({ELECTRON_REST_MEV,MEV_TO_JOULES,annihilation,inventory});
  if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.AntimatterPhysics=api;
})(globalThis);
