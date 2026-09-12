import { StrictMode, useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Play, Pause, RotateCcw, Maximize2, Minimize2, Orbit, Eye, Sparkles } from 'lucide-react';
import BlackHole from '@/components/ui/black-hole';
import { defaults, schwarzschildKm, type Settings } from '@/components/ui/black-hole-utils/model';
const format = (n:number) => new Intl.NumberFormat('fr-FR',{maximumFractionDigits: n < 1000 ? 2 : 0}).format(n);
function App(){
 const [settings,setSettings]=useState<Settings>({...defaults});
 const [mass,setMass]=useState(10);
 const [full,setFull]=useState(false);
 const [notice,setNotice]=useState('');
 const stage=useRef<HTMLDivElement>(null);
 const change=(patch:Partial<Settings>)=>setSettings(s=>({...s,...patch}));
 useEffect(()=>{
  const media=matchMedia('(prefers-reduced-motion: reduce)');
  const preference=()=>{if(media.matches)change({playing:false});};
  const fullscreen=()=>setFull(document.fullscreenElement===stage.current);
  media.addEventListener('change',preference);document.addEventListener('fullscreenchange',fullscreen);
  return()=>{media.removeEventListener('change',preference);document.removeEventListener('fullscreenchange',fullscreen);};
 },[]);
 async function fullscreen(){try{if(document.fullscreenElement)await document.exitFullscreen();else if(stage.current?.requestFullscreen)await stage.current.requestFullscreen();else setNotice('Le plein écran n’est pas proposé par ce navigateur.');}catch{setNotice('Le plein écran est indisponible. Vous pouvez continuer ici.');}}
 return <>
 <div className="bh-stage bh-island" ref={stage}>
  <BlackHole settings={settings}/>
  <div className="bh-stage-top"><span><i aria-hidden="true"/> OBSERVATOIRE / 07</span><span>INTERPRÉTATION VISUELLE</span></div>
  <div className="bh-stage-bottom"><div><span className="bh-scene-name">À la lisière de l’invisible.</span><small>{settings.disk?'Disque lumineux activé':'Disque masqué'} · {settings.inclination}° au-dessus du plan</small></div><div className="bh-stage-actions"><button type="button" onClick={()=>change({playing:!settings.playing})} aria-pressed={settings.playing} aria-label={settings.playing?'Mettre l’animation en pause':'Animer le disque'}>{settings.playing?<Pause size={17}/>:<Play size={17}/>}<span>{settings.playing?'Pause':'Animer'}</span></button><button type="button" onClick={fullscreen} aria-label={full?'Quitter le plein écran':'Afficher en plein écran'}>{full?<Minimize2 size={17}/>:<Maximize2 size={17}/>}</button></div></div>
 </div>
 <p className="bh-caption">Illustration calculée dans votre navigateur. Couleurs et luminosité artistiques ; aucune image d’observation utilisée. L’animation est en pause au départ.</p>
 <div className="bh-controls">
  <div className="bh-controls-heading"><div><span className="eyebrow">CHANGER DE POINT DE VUE</span><h2>La même énigme.<br/><em>Un autre regard.</em></h2></div><button type="button" className="bh-reset" onClick={()=>{setSettings({...defaults});setMass(10);setNotice('Réglages réinitialisés.');}}><RotateCcw size={14}/> Réinitialiser</button></div>
  <div className="bh-sliders">
   <label htmlFor="bh-angle">Hauteur du regard <output>{settings.inclination}°</output><input id="bh-angle" type="range" min="3" max="85" step="1" value={settings.inclination} onChange={e=>change({inclination:Number(e.target.value)})}/><small>Du bord du disque vers une vue de dessus.</small></label>
   <label htmlFor="bh-zoom">Grossissement <output>× {settings.zoom.toFixed(1)}</output><input id="bh-zoom" type="range" min="0.7" max="1.7" step="0.1" value={settings.zoom} onChange={e=>change({zoom:Number(e.target.value)})}/><small>Un cadrage, pas un changement de masse.</small></label>
   <label htmlFor="bh-exposure">Luminosité visuelle <output>{settings.exposure.toFixed(2)}</output><input id="bh-exposure" type="range" min="0.4" max="2" step="0.05" value={settings.exposure} onChange={e=>change({exposure:Number(e.target.value)})}/><small>Une exposition d’image, sans unité physique.</small></label>
  </div>
  <div className="bh-options"><div role="group" aria-label="Points de vue"><button type="button" onClick={()=>change({inclination:12,zoom:1})} aria-pressed={settings.inclination===12&&settings.zoom===1}><Eye size={15}/> Au bord</button><button type="button" onClick={()=>change({inclination:75,zoom:1})} aria-pressed={settings.inclination===75&&settings.zoom===1}><Orbit size={15}/> De dessus</button></div><div role="group" aria-label="Aspect du disque"><button type="button" aria-pressed={settings.disk} onClick={()=>change({disk:!settings.disk})}>{settings.disk?'Masquer le disque':'Afficher le disque'}</button><button type="button" aria-pressed={settings.palette==='ice'} onClick={()=>change({palette:settings.palette==='ice'?'amber':'ice'})}><Sparkles size={15}/>{settings.palette==='ice'?'Palette cobalt':'Palette ambre'}</button></div></div>
 </div>
 <section className="bh-scale" aria-labelledby="scale-title"><div><span className="eyebrow">UN REPÈRE PHYSIQUE</span><h2 id="scale-title">Une masse.<br/><em>Un horizon.</em></h2><p>Pour un trou noir sans rotation ni charge, le rayon de l’horizon est proportionnel à la masse. Doublez la masse : que devient ce rayon ?</p><label htmlFor="bh-mass">Masse <strong>{format(mass)} masses solaires</strong></label><input id="bh-mass" type="range" min="0" max="9" step="0.1" value={Math.log10(mass)} onChange={e=>setMass(10**Number(e.target.value))}/><div className="bh-mass-presets"><button type="button" onClick={()=>setMass(10)}>10 soleils</button><button type="button" onClick={()=>setMass(20)}>20 soleils</button><button type="button" onClick={()=>setMass(4e6)}>4 millions</button></div></div><div className="bh-radius"><span>RAYON DE SCHWARZSCHILD</span><output aria-live="polite" aria-atomic="true">{format(schwarzschildKm(mass))}<small>kilomètres</small></output><p>rₛ = 2GM / c²</p><small>La vue au-dessus garde la même échelle en unités de rₛ. Ce réglage modifie le calcul, pas la taille de l’image.</small></div></section>
 <p className="bh-status" role="status">{notice}</p>
 </>;
}
const root=document.getElementById('black-hole-root');if(root)createRoot(root).render(<StrictMode><App/></StrictMode>);
