export const vertex = `attribute vec2 position; varying vec2 uv; void main(){ uv=position; gl_Position=vec4(position,0.,1.); }`;
// Illustrative ray tracer, units of rₛ. Light rays follow x″ = −(3/2) h² x / r⁵, whose orbits obey the
// Schwarzschild null-geodesic equation u″ + u = (3/2) rₛ u², integrated with finite steps.
// The thin disk runs from the last stable orbit (3 rₛ) to 10 rₛ with a Novikov–Thorne-like temperature profile.
// Its brightness and colour use the redshift g of a circular orbit (Doppler and gravitational, simplified)
// and a blackbody colour at an arbitrary temperature scale. Turbulence, stars and halo are artistic.
// Not a validated radiative-transfer or accretion simulation.
export const fragment = `
precision highp float;
varying vec2 uv;
uniform vec2 resolution;
uniform float clock, inclination, azimuth, zoom, exposure, disk, palette;
float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);
 return mix(mix(hash(i),hash(i+vec2(1.,0.)),f.x),mix(hash(i+vec2(0.,1.)),hash(i+vec2(1.,1.)),f.x),f.y);}
float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<4;i++){v+=a*noise(p);p=p*2.03+vec2(1.7,9.2);a*=.5;}return v;}
vec3 blackbody(float kelvin){
 float t=clamp(kelvin,1000.,40000.)/100.;
 float r=t<=66.?1.:clamp(1.292936*pow(t-60.,-.1332047),0.,1.);
 float g=t<=66.?clamp(.3900816*log(t)-.6318414,0.,1.):clamp(1.129891*pow(t-60.,-.0755148),0.,1.);
 float b=t>=66.?1.:(t<=19.?0.:clamp(.5432068*log(t-10.)-1.1962541,0.,1.));
 return vec3(r,g,b);
}
vec3 sky(vec3 ray){
 vec2 p=vec2(atan(ray.z,ray.x),asin(clamp(ray.y,-1.,1.)));
 vec2 q=p*110.; vec2 cell=floor(q); float h=hash(cell);
 float star=smoothstep(.09,0.,length(fract(q)-.5))*step(.976,h)*(.5+1.3*hash(cell+3.1));
 vec2 q2=p*240.; vec2 cell2=floor(q2); float h2=hash(cell2+7.);
 float faint=smoothstep(.1,0.,length(fract(q2)-.5))*step(.95,h2)*.45;
 // A tilted band of diffuse light, so that lensing of the background stays visible without the disk.
 float lane=exp(-pow((p.y-.35*sin(p.x+.6))*2.6,2.));
 float dust=fbm(p*4.+vec2(3.,1.))*fbm(p*9.-2.);
 vec3 glow=mix(vec3(.05,.045,.07),vec3(.11,.085,.07),dust)*lane*(.35+dust);
 return vec3(.004,.006,.012)+glow+(star+faint*(1.-.6*lane))*mix(vec3(.45,.6,1.),vec3(1.,.86,.66),h);
}
vec3 emission(vec3 p,vec3 photon){
 float r=length(p.xz);
 // Temperature of a thin disk with a zero-torque inner edge at 3 rₛ, normalised to its peak near 4.08 rₛ.
 float profile=pow(r,-.75)*pow(max(1.-sqrt(3./r),0.),.25)/.214;
 // Circular orbit: speed β = √(rₛ / 2(r − rₛ)) for a static observer; g = √(1 − rₛ/r) / (γ (1 − β cos α)).
 float beta=sqrt(1./(2.*(r-1.))); float gamma=1./sqrt(1.-beta*beta);
 vec3 flow=vec3(-p.z,0.,p.x)/r;
 float g=sqrt(1.-1./r)/(gamma*(1.-beta*dot(flow,photon)));
 // Keplerian shear for the texture only (artistic turbulence, a few per cent of the light).
 float turn=clock*.9/pow(r,1.5); float c=cos(turn),s=sin(turn);
 vec2 q=mat2(c,-s,s,c)*p.xz;
 float clouds=.7+.6*fbm(q*2.2+fbm(q*.9)*1.6)*(.75+.5*fbm(q*7.))+.05*sin(r*9.);
 float edge=smoothstep(3.,3.25,r)*(1.-smoothstep(7.,10.,r));
 float observed=g*profile;
 vec3 tint=blackbody(observed*mix(3600.,10500.,palette));
 return tint*pow(observed,4.)*clouds*edge*1.7;
}
void main(){
 float aspect=resolution.x/resolution.y;
 vec2 p=uv; p.x*=aspect; p/=min(aspect,1.);
 float angle=radians(inclination), turn=radians(azimuth);
 vec3 ro=vec3(sin(turn)*cos(angle),sin(angle),cos(turn)*cos(angle))*18.;
 vec3 forward=normalize(-ro),right=vec3(cos(turn),0.,-sin(turn)),up=normalize(cross(right,forward));
 vec3 rd=normalize(forward*2.15*zoom+right*p.x+up*p.y);
 vec3 pos=ro,vel=rd; float h2=dot(cross(pos,vel),cross(pos,vel));
 vec3 color=vec3(0.); float trans=1.; bool swallowed=false;
 for(int i=0;i<220;i++){
  float r=length(pos); if(r<1.01){swallowed=true;break;} if(r>36.)break;
  float dt=clamp((r-1.)*.085+.012,.012,.5);
  vec3 acceleration=-1.5*h2*pos/pow(r,5.);
  vec3 next=pos+vel*dt+acceleration*dt*dt*.5;
  if(pos.y*next.y<0. && disk>.5){
   vec3 hit=mix(pos,next,pos.y/(pos.y-next.y)); float radius=length(hit.xz);
   if(radius>3. && radius<10.){color+=trans*emission(hit,-normalize(next-pos));trans*=.3;}
  }
  float nr=max(length(next),1.); vel+=(acceleration-1.5*h2*next/pow(nr,5.))*dt*.5;
  pos=next;
 }
 if(!swallowed)color+=trans*sky(normalize(vel));
 // A very faint halo near the shadow edge (b ≈ 2,6 rₛ) is a graphic treatment, not light from the horizon.
 float b=length(cross(ro,rd));
 color+=mix(vec3(.3,.1,.03),vec3(.06,.13,.3),palette)*exp(-abs(b-2.598)*5.)*.06*disk;
 // Tone mapping on luminance keeps the hue of the gas; the brightest regions bleach towards white.
 float lum=dot(color,vec3(.2126,.7152,.0722))*exposure;
 vec3 mapped=color*exposure*(1.-exp(-lum))/max(lum,1e-4);
 mapped=mix(vec3(dot(mapped,vec3(.2126,.7152,.0722))),mapped,1.3);
 color=mix(clamp(mapped,0.,1.),vec3(1.,.97,.92),smoothstep(1.4,4.,lum)*.6);
 color=pow(color,vec3(.92));
 float vignette=1.-.2*min(dot(uv,uv),1.);
 gl_FragColor=vec4(color*vignette+(hash(gl_FragCoord.xy)-.5)/255.,1.);
}`;
