"use client";
import {useEffect,useRef,useState} from 'react';
import {createRenderer} from './optimized-black-hole-utils/renderer';
import type {Renderer} from './black-hole-utils/renderer';

/** Supplied ready/fade-in host, with cleanup, motion preference and a fixed fallback. */
export function Example({playing=false,onReadyChange}:{playing?:boolean;onReadyChange?:(ready:boolean)=>void}) {
 const canvasRef=useRef<HTMLCanvasElement>(null),rendererRef=useRef<Renderer|null>(null);
 const [isReady,setIsReady]=useState(false);
 const callbackRef=useRef(onReadyChange);
 useEffect(()=>{callbackRef.current=onReadyChange;},[onReadyChange]);
 useEffect(()=>{
  let cancelled=false;
  const canvas=canvasRef.current;if(!canvas)return;
  const renderer=createRenderer({canvas,onError:message=>{if(!cancelled){setIsReady(!message);callbackRef.current?.(!message);}}});
  rendererRef.current=renderer;
  void renderer.ready.then(()=>{if(!cancelled){setIsReady(true);callbackRef.current?.(true);}}).catch(()=>{if(!cancelled){setIsReady(false);callbackRef.current?.(false);}});
  return()=>{cancelled=true;rendererRef.current=null;renderer.dispose();};
 },[]);
 useEffect(()=>{
  const media=matchMedia('(prefers-reduced-motion: reduce)');
  const update=()=>rendererRef.current?.setOptions({playing:playing&&!media.matches});
  update();media.addEventListener('change',update);return()=>media.removeEventListener('change',update);
 },[playing]);
 return <div className="optimized-hole" aria-hidden="true"><img className="optimized-hole-poster" src="/atlas/brand-lab-trou-noir.svg" alt="" width="600" height="430"/><canvas ref={canvasRef} className="optimized-hole-canvas" style={{opacity:isReady?1:0}}/></div>;
}
export default Example;
