import {createRenderer as createBaseRenderer} from '../black-hole-utils/renderer';
/** Homepage budget: 640 × 360 maximum, DPR 1, 18 fps. The lab keeps its own budget. */
export function createRenderer({canvas,onError}:{canvas:HTMLCanvasElement;onError?:(message:string)=>void}) {
 const renderer=createBaseRenderer({canvas,onError,quality:'hero'});
 renderer.setOptions({palette:'ice',inclination:12,zoom:1.28,exposure:1.35,playing:false});
 return renderer;
}
