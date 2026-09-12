import {useEffect,useState} from 'react';
import {createRoot} from 'react-dom/client';
import {Pause,Play} from 'lucide-react';
import GatewayFlow from './ui/gateway-flow';
function Gateway(){
 const [paused,setPaused]=useState(false),[reduced,setReduced]=useState(()=>matchMedia('(prefers-reduced-motion: reduce)').matches);
 useEffect(()=>{const media=matchMedia('(prefers-reduced-motion: reduce)');const update=()=>setReduced(media.matches);media.addEventListener('change',update);return()=>media.removeEventListener('change',update);},[]);
 return <><GatewayFlow mode="dark" speed={paused||reduced?0:.5} density={.85} gap={2.5} opacity={.8}/>{!reduced&&<button type="button" className="gateway-motion" onClick={()=>setPaused(v=>!v)} aria-pressed={!paused} aria-label={paused?'Animer les lignes':'Mettre les lignes en pause'}>{paused?<Play size={13}/>:<Pause size={13}/>}<span>{paused?'Animer':'Pause'}</span></button>}</>;
}
export function mountGatewayFlow(element:HTMLElement){const root=createRoot(element);root.render(<Gateway/>);return()=>root.unmount();}
