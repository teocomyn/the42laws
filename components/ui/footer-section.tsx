import {ArrowUpRight, ArrowUp, Orbit} from 'lucide-react';

type FooterProps = {continuation?: {title:string;href:string}; note?:string};
const sections = [
 {label:'Explorer',links:[['Les 42 questions','/#/atlas'],['Les laboratoires','/#/laboratoires'],['Les parcours guidés','/#/parcours'],['La carte des liens','/#/liens']]},
 {label:'Comprendre',links:[['Les particules','/#/particules'],['Le glossaire','/#/glossaire'],['Notre méthode','/#/methode'],['Les sources','/#/sources']]},
 {label:'Poursuivre',links:[['Mon carnet','/#/carnet'],['Le projet','/#/apropos'],['Comprendre la matière','/#/parcours/matiere'],['Explorer le temps','/#/parcours/temps']]},
];
/** Adapted from the supplied Footer section, rendered to HTML at build time. */
export function Footer({continuation,note}:FooterProps) {
 return <footer className="t42-footer" aria-label="Pied de page The42laws">
  {continuation&&<div className="t42-footer-next"><span>POUR CONTINUER L’EXPLORATION</span><a href={continuation.href}>{continuation.title}<ArrowUpRight size={17} aria-hidden="true"/></a></div>}
  {note&&<p className="t42-footer-note">{note}</p>}
  <div className="t42-footer-top">
   <div className="t42-footer-invitation"><span className="t42-footer-kicker"><Orbit size={18} aria-hidden="true"/> LA CURIOSITÉ N’A PAS DE DERNIÈRE PAGE</span><h2>Le monde reste<br/><em>à explorer.</em></h2><a className="t42-footer-cta" href="/#/parcours">Trouver mon point de départ <ArrowUpRight size={18} aria-hidden="true"/></a></div>
   <nav className="t42-footer-navigation" aria-label="Explorer The42laws">{sections.map(section=><div key={section.label} className="t42-footer-column"><h3>{section.label}</h3><ul>{section.links.map(([title,href])=><li key={href}><a href={href}>{title}</a></li>)}</ul></div>)}</nav>
  </div>
  <div className="t42-footer-brandline"><a href="/#/accueil" aria-label="The42laws, retour à l’accueil"><img src="/atlas/favicon-42-48.png" alt="" width="40" height="40" loading="lazy"/><span>Un atlas du réel.<br/><small>Observer. Questionner. Comprendre.</small></span></a><p>Des questions ouvertes.<br/>Des connaissances qui se construisent.</p></div>
  <a className="t42-footer-wordmark" href="/#/accueil" aria-label="The42laws, accueil">The42laws<span aria-hidden="true">↗</span></a>
  <div className="t42-footer-bottom"><span>© {new Date().getFullYear()} The42laws</span><span className="t42-footer-signature"><i aria-hidden="true"/> L’EXPLORATION CONTINUE</span><a href="#page-top">Retour en haut <ArrowUp size={13} aria-hidden="true"/></a></div>
 </footer>;
}
export default Footer;
