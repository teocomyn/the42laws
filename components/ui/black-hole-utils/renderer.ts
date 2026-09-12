import { vertex, fragment } from './shaders';
import { defaults, normalizeSettings, type Settings } from './model';
export type Renderer = { ready: Promise<void>; setOptions: (options: Partial<Settings>) => void; dispose: () => void };
export function createRenderer({canvas,onError}:{canvas:HTMLCanvasElement;onError?:(message:string)=>void}):Renderer {
 let gl: WebGLRenderingContext | null=null, program:WebGLProgram|null=null, buffer:WebGLBuffer|null=null;
 let settings={...defaults}, frame=0, disposed=false, lost=false, visible=true, phase=0, last=0;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const shaders:WebGLShader[]=[];
 const uniforms:Record<string,WebGLUniformLocation|null>={};
 const report=()=>onError?.('Le rendu 3D est indisponible sur ce navigateur. L’illustration fixe et les explications restent accessibles.');
 function initialize(){
  gl=canvas.getContext('webgl',{alpha:false,antialias:false,depth:false,powerPreference:'low-power'});
  if(!gl)throw new Error('WebGL indisponible');
  const compile=(type:number,source:string)=>{const s=gl!.createShader(type);if(!s)throw Error('Shader'); shaders.push(s);gl!.shaderSource(s,source);gl!.compileShader(s);if(!gl!.getShaderParameter(s,gl!.COMPILE_STATUS))throw Error(gl!.getShaderInfoLog(s)||'Shader compilation');return s;};
  program=gl.createProgram();if(!program)throw Error('Program');
  gl.attachShader(program,compile(gl.VERTEX_SHADER,vertex));gl.attachShader(program,compile(gl.FRAGMENT_SHADER,fragment));gl.linkProgram(program);
  if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error('Shader link');
  gl.useProgram(program);buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);
  gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);
  const loc=gl.getAttribLocation(program,'position');gl.enableVertexAttribArray(loc);gl.vertexAttribPointer(loc,2,gl.FLOAT,false,0,0);
  for(const key of ['resolution','clock','inclination','zoom','exposure','disk','palette'])uniforms[key]=gl.getUniformLocation(program,key);
 }
 function draw(){
  if(!gl||!program||disposed||lost)return;
  const rect=canvas.getBoundingClientRect();if(rect.width<1||rect.height<1)return;
  const scale=Math.min(devicePixelRatio||1,1.5,900/rect.width,600/rect.height);
  const w=Math.max(1,Math.round(rect.width*scale)),h=Math.max(1,Math.round(rect.height*scale));
  if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;}
  gl.viewport(0,0,w,h);gl.useProgram(program);
  gl.uniform2f(uniforms.resolution,w,h);gl.uniform1f(uniforms.clock,phase);
  gl.uniform1f(uniforms.inclination,settings.inclination);gl.uniform1f(uniforms.zoom,settings.zoom);
  gl.uniform1f(uniforms.exposure,settings.exposure);gl.uniform1f(uniforms.disk,settings.disk?1:0);gl.uniform1f(uniforms.palette,settings.palette==='ice'?1:0);
  gl.drawArrays(gl.TRIANGLES,0,6);
 }
 function tick(now:number){frame=0;if(disposed||lost)return;
  if(settings.playing&&visible&&!document.hidden){if(last===0)last=now;if(now-last>=1000/24){phase+=Math.min((now-last)/1000,.1);last=now;draw();}frame=requestAnimationFrame(tick);}
 }
 function sync(){cancelAnimationFrame(frame);frame=0;last=0;draw();if(settings.playing&&visible&&!document.hidden&&!lost&&!disposed)frame=requestAnimationFrame(tick);}
 function free(){if(gl){shaders.splice(0).forEach(s=>gl!.deleteShader(s));if(buffer)gl.deleteBuffer(buffer);if(program)gl.deleteProgram(program);}program=null;buffer=null;}
 const resize=new ResizeObserver(()=>draw());resize.observe(canvas);
 const intersection=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;sync();});intersection.observe(canvas);
 const visibility=()=>sync();document.addEventListener('visibilitychange',visibility);
 const preference=()=>{if(reduced.matches){settings.playing=false;sync();}};reduced.addEventListener('change',preference);
 const contextLost=(e:Event)=>{e.preventDefault();lost=true;cancelAnimationFrame(frame);report();};
 const contextRestored=()=>{if(disposed)return;try{free();initialize();lost=false;onError?.('');sync();}catch{report();}};
 canvas.addEventListener('webglcontextlost',contextLost);canvas.addEventListener('webglcontextrestored',contextRestored);
 const ready=Promise.resolve().then(()=>{if(disposed)return;try{initialize();sync();}catch(error){lost=true;free();report();throw error;}});
 return {ready,setOptions(options){settings=normalizeSettings({...settings,...options});sync();},dispose(){if(disposed)return;disposed=true;cancelAnimationFrame(frame);resize.disconnect();intersection.disconnect();document.removeEventListener('visibilitychange',visibility);reduced.removeEventListener('change',preference);canvas.removeEventListener('webglcontextlost',contextLost);canvas.removeEventListener('webglcontextrestored',contextRestored);free();}};
}
