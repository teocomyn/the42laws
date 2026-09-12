import {useEffect,useState} from 'react';
import {createRoot} from 'react-dom/client';
import {Pause,Play} from 'lucide-react';
import BlackHole from './ui/optimized-black-hole';
function HeroScene(){
 const [available,setAvailable]=useState(false);
 const [paused,setPaused]=useState(false),[reduced,setReduced]=useState(()=>matchMedia('(prefers-reduced-motion: reduce)').matches);
 useEffect(()=>{const media=matchMedia('(prefers-reduced-motion: reduce)');const update=()=>setReduced(media.matches);media.addEventListener('change',update);return()=>media.removeEventListener('change',update);},[]);
 return <><BlackHole playing={!paused&&!reduced} onReadyChange={setAvailable}/>{available&&!reduced&&<button className="horizon-motion" type="button" aria-pressed={!paused} aria-label={paused?'Animer le trou noir':'Mettre le trou noir en pause'} onClick={()=>setPaused(value=>!value)}>{paused?<Play size={13}/>:<Pause size={13}/>}<span>{paused?'Animer':'Pause'}</span></button>}</>;
}
export function mountHero(element:HTMLElement){const root=createRoot(element);root.render(<HeroScene/>);return()=>root.unmount();}
