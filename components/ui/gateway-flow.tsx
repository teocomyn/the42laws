"use client";
import {useEffect,useRef,useState,type CSSProperties} from 'react';
export type GatewayFlowProps={mode?:'dark'|'light'|'auto';speed?:number;size?:number;gap?:number;length?:number;density?:number;strokeWidth?:number;opacity?:number;hue?:number;saturation?:number;brightness?:number;className?:string;style?:CSSProperties};
const safe=(v:number|undefined,fallback:number,min:number,max:number)=>typeof v==='number'&&Number.isFinite(v)?Math.max(min,Math.min(max,v)):fallback;
/** Adaptation of the supplied Gateway Flow: Bézier paths and travelling particles.
 * The hidden login page, iframe, remote scripts and global clock patches are omitted.
 */
export default function GatewayFlow(props:GatewayFlowProps){
 const canvasRef=useRef<HTMLCanvasElement>(null);
 const phaseRef=useRef(0);
 const [automatic,setAutomatic]=useState<'dark'|'light'>('dark');
 useEffect(()=>{if(props.mode!=='auto')return;const media=matchMedia('(prefers-color-scheme: dark)');const root=document.documentElement;
  const update=()=>{const mode=root.dataset.scheme??root.dataset.theme;setAutomatic(mode==='light'||mode==='dark'?mode:media.matches?'dark':'light');};
  const observer=new MutationObserver(update);observer.observe(root,{attributes:true,attributeFilter:['data-scheme','data-theme']});media.addEventListener('change',update);update();
  return()=>{observer.disconnect();media.removeEventListener('change',update);};
 },[props.mode]);
 const mode=props.mode==='auto'?automatic:props.mode??'dark';
 const speed=safe(props.speed,1,0,3),size=safe(props.size,1,.2,4),gap=safe(props.gap,2,0,20),length=safe(props.length,1,.35,2.5),density=safe(props.density,1,.25,2),stroke=safe(props.strokeWidth,1,.25,4);
 useEffect(()=>{
  const canvas=canvasRef.current;if(!canvas)return;const ctx=canvas.getContext('2d');if(!ctx)return;
  let width=0,height=0,raf=0,last=0,time=phaseRef.current,visible=false,disposed=false;
  const media=matchMedia('(prefers-reduced-motion: reduce)');
  const count=Math.round(80*density);
  const pulses:{x:number;y:number;born:number}[]=[];
  const paths=Array.from({length:count},(_,i)=>({left:i%2===0,offset:(i*.61803398875)%1,rate:.085+(i%7)*.009,y:i/(count-1)*1.4-.2}));
  function point(t:number,x0:number,y0:number,x1:number,y1:number,x2:number,y2:number,x3:number,y3:number){const u=1-t;return {x:u*u*u*x0+3*u*u*t*x1+3*u*t*t*x2+t*t*t*x3,y:u*u*u*y0+3*u*u*t*y1+3*u*t*t*y2+t*t*t*y3};}
  function draw(){if(!ctx||disposed||width===0||height===0)return;ctx.clearRect(0,0,width,height);const cx=width/2,cy=height/2;const rgb=mode==='light'?'48,73,116':'174,204,248';
   for(const path of paths){const x0=path.left?0:width,y0=path.y*height,x1=path.left?cx*.5:width-cx*.5,x2=cx+(path.left?-1:1)*cx*.2*length;
    ctx.beginPath();ctx.moveTo(x0,y0);ctx.bezierCurveTo(x1,y0,x2,cy,cx,cy);ctx.lineWidth=1.05*stroke*size;ctx.strokeStyle=`rgba(${rgb},.28)`;ctx.setLineDash([1*size,Math.max(.1,gap*2)]);ctx.stroke();ctx.setLineDash([]);
    const t=(path.offset+time*path.rate)%1;const p=point(t,x0,y0,x1,y0,x2,cy,cx,cy);
    for(const pulse of pulses){const age=time-pulse.born,radius=age*280,dx=p.x-pulse.x,dy=p.y-pulse.y,d=Math.hypot(dx,dy);if(d>.001&&age<1.5){const force=Math.max(0,1-Math.abs(d-radius)/95)*(1-age/1.5)*40;p.x+=dx/d*force;p.y+=dy/d*force;}}
    ctx.fillStyle=`rgba(${rgb},${.55+.4*t})`;const dot=2.2*size;ctx.fillRect(p.x-dot/2,p.y-dot/2,dot,dot);
   }
   while(pulses.length&&time-pulses[0].born>1.5)pulses.shift();
  }
  function running(){return speed>0&&!media.matches&&visible&&!document.hidden&&!disposed;}
  function tick(now:number){raf=0;if(!running())return;if(!last)last=now;if(now-last>=1000/30){time+=Math.min((now-last)/1000,.08)*speed;last=now;phaseRef.current=time;draw();}raf=requestAnimationFrame(tick);}
  function sync(){cancelAnimationFrame(raf);raf=0;last=0;draw();if(running())raf=requestAnimationFrame(tick);}
  function resize(){const rect=canvas!.getBoundingClientRect();width=rect.width;height=rect.height;const dpr=Math.min(devicePixelRatio||1,1.5);canvas!.width=Math.round(width*dpr);canvas!.height=Math.round(height*dpr);ctx!.setTransform(dpr,0,0,dpr,0,0);draw();}
  const observer=new ResizeObserver(resize);observer.observe(canvas);
  const intersection=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;sync();});intersection.observe(canvas);
  const pulse=(event:PointerEvent)=>{if(!running())return;const rect=canvas.getBoundingClientRect();if(pulses.length>=4)pulses.shift();pulses.push({x:event.clientX-rect.left,y:event.clientY-rect.top,born:time});};
  canvas.addEventListener('pointerdown',pulse);document.addEventListener('visibilitychange',sync);media.addEventListener('change',sync);resize();
  return()=>{disposed=true;cancelAnimationFrame(raf);observer.disconnect();intersection.disconnect();canvas.removeEventListener('pointerdown',pulse);document.removeEventListener('visibilitychange',sync);media.removeEventListener('change',sync);};
 },[mode,speed,size,gap,length,density,stroke]);
 return <canvas ref={canvasRef} aria-hidden="true" className={props.className} style={{display:'block',width:'100%',height:'100%',opacity:safe(props.opacity,1,0,1),filter:`hue-rotate(${safe(props.hue,0,-180,180)}deg) saturate(${safe(props.saturation,1,0,2)}) brightness(${safe(props.brightness,1,.35,1.65)})`,...props.style}}/>;
}
