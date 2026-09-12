export const vertex = `attribute vec2 position; varying vec2 uv; void main(){ uv=position; gl_Position=vec4(position,0.,1.); }`;
// Original illustrative ray-bending shader. Finite steps and artistic emission;
// not a validated relativistic radiative-transfer or accretion simulation.
export const fragment = `
precision highp float;
varying vec2 uv;
uniform vec2 resolution;
uniform float clock, inclination, zoom, exposure, disk, palette;
float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
vec3 sky(vec3 ray){
 vec2 p=vec2(atan(ray.z,ray.x),asin(clamp(ray.y,-1.,1.)))*120.;
 vec2 cell=floor(p); float h=hash(cell); float spot=length(fract(p)-.5);
 float star=smoothstep(.055,0.,spot)*step(.985,h);
 return vec3(.006,.008,.016)+star*mix(vec3(.35,.52,1.),vec3(1.,.87,.66),h)*.7;
}
vec3 emission(vec3 p){
 float r=length(p.xz); float a=atan(p.z,p.x);
 float swirl=a-clock*.28/pow(r*.24,1.5);
 float bands=.74+.13*sin(r*29.+2.1*sin(swirl*7.))+.08*sin(r*67.-swirl*13.);
 float clouds=.77+.23*sin(swirl*4.+r*2.8)*sin(swirl*9.-r*1.3);
 float edge=smoothstep(3.,3.35,r)*(1.-smoothstep(7.,10.,r));
 float heat=pow(3./max(r,3.),1.5);
 vec3 warm=mix(vec3(.48,.12,.025),vec3(1.55,1.13,.68),heat);
 vec3 cool=mix(vec3(.13,.18,.52),vec3(.94,1.2,1.6),heat);
 float asymmetry=1.+.42*cos(a); // illustrative brightness contrast, not a Doppler measurement
 return mix(warm,cool,palette)*bands*clouds*edge*heat*asymmetry*2.4;
}
void main(){
 float aspect=resolution.x/resolution.y;
 vec2 p=uv; p.x*=aspect; p/=min(aspect,1.);
 float angle=radians(inclination);
 vec3 ro=vec3(0.,sin(angle)*18.,cos(angle)*18.);
 vec3 forward=normalize(-ro),right=vec3(1.,0.,0.),up=normalize(cross(right,forward));
 vec3 rd=normalize(forward*2.15*zoom+right*p.x+up*p.y);
 vec3 pos=ro,vel=rd; float h2=dot(cross(pos,vel),cross(pos,vel));
 vec3 color=vec3(0.); float trans=1.; bool swallowed=false;
 for(int i=0;i<180;i++){
  float r=length(pos); if(r<1.015){swallowed=true;break;} if(r>35.)break;
  float dt=clamp(r*.045,.025,.55);
  vec3 acceleration=-1.5*h2*pos/pow(r,5.);
  vec3 next=pos+vel*dt+acceleration*dt*dt*.5;
  if(pos.y*next.y<0. && disk>.5){
   vec3 hit=mix(pos,next,pos.y/(pos.y-next.y)); float radius=length(hit.xz);
   if(radius>3. && radius<10.){color+=trans*emission(hit);trans*=.32;}
  }
  float nr=max(length(next),1.); vel+=(acceleration-1.5*h2*next/pow(nr,5.))*dt*.5;
  pos=next;
 }
 if(!swallowed)color+=trans*sky(normalize(vel));
 // A very faint halo is a graphic treatment, not light emitted by the horizon.
 float b=length(cross(ro,rd));
 color+=mix(vec3(.32,.09,.025),vec3(.06,.13,.3),palette)*exp(-abs(b-2.65)*4.)*.10*disk;
 color=1.-exp(-color*exposure);
 color=pow(max(color,0.),vec3(.82));
 float vignette=1.-.18*min(dot(uv,uv),1.);
 gl_FragColor=vec4(color*vignette,1.);
}`;
