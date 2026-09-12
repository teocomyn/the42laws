import {renderToStaticMarkup} from 'react-dom/server';
import {Footer} from './ui/footer-section';
const next:Record<string,{title:string;href:string}>={
 neutrino:{title:'Découvrir l’antimatière',href:'/antimatiere/'},
 antimatiere:{title:'Explorer le neutrino',href:'/neutrino/'},
 photon:{title:'Explorer le temps',href:'/temps/'},
 temps:{title:'Explorer le photon',href:'/photon/'},
 relativite:{title:'Temps & entropie',href:'/temps/'},
 'trou-noir':{title:'Garder une trace dans mon carnet',href:'/#/carnet'},
};
export function footerMarkup(page:string){return renderToStaticMarkup(<Footer continuation={next[page]} note={page==='navier-stokes'?'The42laws · Laboratoire pédagogique. La simulation est bidimensionnelle et ne peut pas présenter de singularité ; le schéma d’explosion reproduit des échelles de longueur publiées, pas la preuve. Aucune ressource distante ; tout est calculé dans votre navigateur.':undefined}/>);}
