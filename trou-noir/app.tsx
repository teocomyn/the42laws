import { StrictMode, useEffect, useLayoutEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from 'react';
import { createRoot } from 'react-dom/client';
import { Play, Pause, RotateCcw, Maximize2, Minimize2, Orbit, Eye, Sparkles, Crosshair, Move, Clock, Target, Thermometer, Hourglass, Waves, Gauge, Scale, Rocket } from 'lucide-react';
import BlackHole from '@/components/ui/black-hole';
import { defaults, normalizeSettings, schwarzschildKm, blackHoleScales, descent, ringScreenRadius, SHADOW_RS, SOLAR_MASS, type Settings } from '@/components/ui/black-hole-utils/model';
import { number, sci, length, duration, comparison, ruler } from '@/components/ui/black-hole-utils/format';

const EARTH = 5.9722e24 / SOLAR_MASS;          // NASA Earth fact sheet
const AGE_OF_UNIVERSE = 13.8e9;               // years, NASA « Universe overview »
const CMB = 2.725;                            // K, Fixsen (2009)
const G0 = 9.80665;
const PRESETS = [
 { mass: EARTH, label: 'Terre', note: '5,97 × 10²⁴ kg', about: 'Hypothèse d’école : toute la masse de la Terre comprimée en trou noir.' },
 { mass: 1, label: 'Soleil', note: '1 masse solaire', about: 'Simple repère de calcul : une masse solaire.' },
 { mass: 10, label: 'Étoile effondrée', note: '10 masses solaires', about: 'Ordre de grandeur d’un trou noir de masse stellaire, point de départ de l’expérience guidée.' },
 { mass: 62, label: 'GW150914', note: '62 masses solaires', about: 'Trou noir né de la fusion observée par LIGO et Virgo le 14 septembre 2015 (masse finale 62 ± 4).' },
 { mass: 4.3e6, label: 'Sagittarius A*', note: '4,3 millions', about: 'Au centre de la Voie lactée ; masse tirée des orbites d’étoiles proches (GRAVITY, 2022).' },
 { mass: 6.5e9, label: 'M87*', note: '6,5 milliards', about: 'Première ombre photographiée, par l’Event Horizon Telescope (2019) ; masse 6,5 ± 0,7 milliards.' },
];
const LANDMARKS = [{ x: 3, label: 'Dernière orbite stable', short: '3 rₛ' }, { x: 1.5, label: 'Sphère des photons', short: '1,5 rₛ' }, { x: 1.01, label: 'Au ras de l’horizon', short: '1,01 rₛ' }];
const ORBITS = {
 stable: 'Au-delà de 3 rₛ, une orbite circulaire stable est possible. C’est là que commence le disque de l’image.',
 unstable: 'Entre 1,5 et 3 rₛ, une orbite circulaire existe encore, mais la moindre perturbation la fait plonger ou s’échapper.',
 photon: 'À 1,5 rₛ, même la lumière peut tourner en rond, sur une orbite instable : c’est la sphère des photons.',
 none: 'Sous 1,5 rₛ, aucune orbite circulaire n’existe, pas même pour la lumière. Seule une poussée continue retient la sonde.',
};
const formatKm = (km: number) => new Intl.NumberFormat('fr-FR', km < 1 ? { maximumSignificantDigits: 3 } : { maximumFractionDigits: km < 1000 ? 2 : 0 }).format(km);
function massLabel(m: number) {
 if (m < 0.01) return `${sci(m, 2)} masse solaire`;
 if (m < 1e6) return `${number(m, m < 100 ? 3 : 4)} masse${m >= 2 ? 's' : ''} solaire${m >= 2 ? 's' : ''}`;
 return m < 1e9 ? `${number(m / 1e6, 3)} millions de masses solaires` : `${number(m / 1e9, 3)} milliards de masses solaires`;
}
const gees = (a: number) => `${sci(a / G0, 2)} g`;
function density(rho: number) {
 if (rho < 1.2) return 'Moins que l’air au niveau de la mer (environ 1,2 kg/m³).';
 if (rho < 1000) return `${number(1000 / rho, 2)} fois moins que l’eau.`;
 return `${sci(rho / 1000, 2)} fois la densité de l’eau.`;
}
const near = (a: number, b: number) => Math.abs(Math.log(a / b)) < 1e-6;

function App() {
 const [settings, setSettings] = useState<Settings>(() => ({ ...defaults, playing: !matchMedia('(prefers-reduced-motion: reduce)').matches }));
 const [mass, setMass] = useState(10);
 const [x, setX] = useState(3);
 const [full, setFull] = useState(false);
 const [hint, setHint] = useState(true);
 const [box, setBox] = useState({ w: 0, h: 0 });
 const [notice, setNotice] = useState('');
 const stage = useRef<HTMLDivElement>(null);
 const drag = useRef<{ id: number; x: number; y: number; azimuth: number; inclination: number; mouse: boolean } | null>(null);
 const change = (patch: Partial<Settings>) => setSettings(s => normalizeSettings({ ...s, ...patch }));
 useEffect(() => {
  const media = matchMedia('(prefers-reduced-motion: reduce)');
  const preference = () => { if (media.matches) change({ playing: false }); };
  const fullscreen = () => setFull(document.fullscreenElement === stage.current);
  media.addEventListener('change', preference); document.addEventListener('fullscreenchange', fullscreen);
  const observer = new ResizeObserver(([entry]) => setBox({ w: entry.contentRect.width, h: entry.contentRect.height }));
  if (stage.current) observer.observe(stage.current);
  return () => { media.removeEventListener('change', preference); document.removeEventListener('fullscreenchange', fullscreen); observer.disconnect(); };
 }, []);
 useLayoutEffect(() => {
  const restore = (event: Event) => { const detail = (event as CustomEvent).detail; if (!detail || typeof detail !== 'object') return; setSettings(normalizeSettings({ ...detail, playing: false })); if (typeof detail.mass === 'number' && Number.isFinite(detail.mass)) setMass(Math.max(1e-6, Math.min(1e10, detail.mass))); };
  window.addEventListener('the42laws:restore-black-hole', restore);
  return () => window.removeEventListener('the42laws:restore-black-hole', restore);
 }, []);
 useLayoutEffect(() => { window.dispatchEvent(new CustomEvent('the42laws:black-hole-settings', { detail: { ...settings, mass } })); }, [settings, mass]);
 async function fullscreen() { try { if (document.fullscreenElement) await document.exitFullscreen(); else if (stage.current?.requestFullscreen) await stage.current.requestFullscreen(); else setNotice('Le plein écran n’est pas proposé par ce navigateur.'); } catch { setNotice('Le plein écran est indisponible. Vous pouvez continuer ici.'); } }
 function down(e: PointerEvent<HTMLDivElement>) {
  if ((e.target as HTMLElement).closest('button')) return;
  if (e.pointerType === 'mouse' && e.button !== 0) return;
  drag.current = { id: e.pointerId, x: e.clientX, y: e.clientY, azimuth: settings.azimuth, inclination: settings.inclination, mouse: e.pointerType === 'mouse' };
  e.currentTarget.setPointerCapture(e.pointerId); setHint(false);
 }
 function move(e: PointerEvent<HTMLDivElement>) {
  const d = drag.current; if (!d || d.id !== e.pointerId) return;
  // Touch keeps vertical swipes for page scrolling (touch-action: pan-y); the mouse also tilts the view.
  change({ azimuth: d.azimuth - (e.clientX - d.x) * .35, ...(d.mouse ? { inclination: d.inclination + (e.clientY - d.y) * .25 } : {}) });
 }
 const up = () => { drag.current = null; };
 function keys(e: KeyboardEvent<HTMLDivElement>) {
  if (e.target !== e.currentTarget) return;
  const step: Record<string, Partial<Settings>> = { ArrowLeft: { azimuth: settings.azimuth + 10 }, ArrowRight: { azimuth: settings.azimuth - 10 }, ArrowUp: { inclination: settings.inclination + 5 }, ArrowDown: { inclination: settings.inclination - 5 }, '+': { zoom: settings.zoom + .1 }, '=': { zoom: settings.zoom + .1 }, '-': { zoom: settings.zoom - .1 } };
  if (step[e.key]) { e.preventDefault(); change(step[e.key]); setHint(false); }
 }
 const s = blackHoleScales(mass), d = descent(mass, x), rs = s.rs, ref = ruler(rs);
 const preset = PRESETS.find(p => near(p.mass, mass));
 const unit = Math.min(box.w, box.h) / 2, cx = box.w / 2, cy = box.h / 2;
 const shadow = ringScreenRadius(SHADOW_RS, settings.zoom) * unit, straight = ringScreenRadius(1, settings.zoom, false) * unit;
 const big = Math.max(rs, ref.m), rA = Math.max(2, 64 * rs / big), rB = Math.max(2, 64 * ref.m / big);
 const scaled = (r: number) => 34 * Math.sqrt(r), angle = -Math.PI / 5;
 return <>
 <output id="bh-model-state" hidden data-state={JSON.stringify({ ...settings, mass })}/>
 <div className="bh-stage bh-island" ref={stage} tabIndex={0} role="group" aria-label="Vue du trou noir : glissez ou utilisez les flèches pour tourner autour, plus et moins pour zoomer." aria-describedby="bh-stage-help" onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up} onKeyDown={keys}>
  <BlackHole settings={settings}/>
  {settings.markers && unit > 0 && <svg className="bh-markers" viewBox={`0 0 ${box.w} ${box.h}`} aria-hidden="true">
   <circle cx={cx} cy={cy} r={shadow} className="bh-ring-shadow"/>
   <circle cx={cx} cy={cy} r={straight} className="bh-ring-straight"/>
  </svg>}
  {settings.markers && <ul className="bh-legend" aria-hidden="true"><li><i className="bh-legend-shadow"/>Bord de l’ombre · 2,6 rₛ</li><li><i className="bh-legend-straight"/>Horizon si la lumière allait droit · 1 rₛ</li></ul>}
  <div className="bh-stage-top"><span><i aria-hidden="true"/> OBSERVATOIRE / 07</span><span>{settings.disk ? 'CÔTÉ DROIT : LE GAZ VIENT VERS VOUS' : 'LE CIEL DERRIÈRE EST DÉVIÉ'}</span></div>
  {hint && !settings.markers && <p className="bh-hint" aria-hidden="true"><Move size={15}/> Glissez pour tourner autour</p>}
  <div className="bh-stage-bottom"><div><span className="bh-scene-name">À la lisière de l’invisible.</span><small>{settings.disk ? 'Disque visible' : 'Disque masqué'} · {Math.round(settings.inclination)}° au-dessus du plan · {settings.markers ? 'repères affichés' : 'repères masqués'}</small></div><div className="bh-stage-actions">
   <button type="button" onClick={() => change({ markers: !settings.markers })} aria-pressed={settings.markers}><Crosshair size={17}/><span>Repères</span></button>
   <button type="button" onClick={() => change({ playing: !settings.playing })} aria-pressed={settings.playing} aria-label={settings.playing ? 'Mettre l’animation en pause' : 'Animer le disque'}>{settings.playing ? <Pause size={17}/> : <Play size={17}/>}<span>{settings.playing ? 'Pause' : 'Animer'}</span></button>
   <button type="button" onClick={fullscreen} aria-label={full ? 'Quitter le plein écran' : 'Afficher en plein écran'}>{full ? <Minimize2 size={17}/> : <Maximize2 size={17}/>}</button>
  </div></div>
 </div>
 <p className="bh-caption" id="bh-stage-help">Image calculée dans votre navigateur : chaque rayon lumineux suit l’équation de la relativité générale autour d’un trou noir sans rotation, intégrée pas à pas. Le disque, ses couleurs et sa texture sont simplifiés ; aucune image d’observation n’est utilisée. Clavier : flèches pour tourner, + et − pour zoomer.</p>
 <div className="bh-controls">
  <div className="bh-controls-heading"><div><span className="eyebrow">CHANGER DE POINT DE VUE</span><h2>La même énigme.<br/><em>Un autre regard.</em></h2></div><button type="button" className="bh-reset" onClick={() => { setSettings({ ...defaults, playing: settings.playing }); setMass(10); setX(3); setNotice('Réglages réinitialisés.'); }}><RotateCcw size={14}/> Réinitialiser</button></div>
  <div className="bh-sliders">
   <label htmlFor="bh-angle">Hauteur du regard <output>{Math.round(settings.inclination)}°</output><input id="bh-angle" type="range" min="3" max="85" step="1" value={Math.round(settings.inclination)} onChange={e => change({ inclination: Number(e.target.value) })}/><small>Du bord du disque vers une vue de dessus.</small></label>
   <label htmlFor="bh-azimuth">Tour d’horizon <output>{Math.round(settings.azimuth)}°</output><input id="bh-azimuth" type="range" min="0" max="359" step="1" value={Math.round(settings.azimuth)} onChange={e => change({ azimuth: Number(e.target.value) })}/><small>Les étoiles du fond glissent autour de l’ombre.</small></label>
   <label htmlFor="bh-zoom">Grossissement <output>× {settings.zoom.toFixed(1)}</output><input id="bh-zoom" type="range" min="0.7" max="1.7" step="0.1" value={settings.zoom} onChange={e => change({ zoom: Number(e.target.value) })}/><small>Un cadrage, pas un changement de masse.</small></label>
   <label htmlFor="bh-exposure">Luminosité visuelle <output>{settings.exposure.toFixed(2)}</output><input id="bh-exposure" type="range" min="0.4" max="2" step="0.05" value={settings.exposure} onChange={e => change({ exposure: Number(e.target.value) })}/><small>Une exposition d’image, sans unité physique.</small></label>
  </div>
  <div className="bh-options"><div role="group" aria-label="Points de vue"><button type="button" onClick={() => change({ inclination: 12, zoom: 1 })} aria-pressed={Math.round(settings.inclination) === 12 && settings.zoom === 1}><Eye size={15}/> Au bord</button><button type="button" onClick={() => change({ inclination: 75, zoom: 1 })} aria-pressed={Math.round(settings.inclination) === 75 && settings.zoom === 1}><Orbit size={15}/> De dessus</button><button type="button" onClick={() => change({ disk: false, markers: true, zoom: 1.2 })} aria-pressed={!settings.disk && settings.markers}><Target size={15}/> L’ombre seule</button></div><div role="group" aria-label="Aspect du disque"><button type="button" aria-pressed={settings.disk} onClick={() => change({ disk: !settings.disk })}>{settings.disk ? 'Masquer le disque' : 'Afficher le disque'}</button><button type="button" aria-pressed={settings.palette === 'ice'} onClick={() => change({ palette: settings.palette === 'ice' ? 'amber' : 'ice' })}><Sparkles size={15}/>{settings.palette === 'ice' ? 'Disque plus froid' : 'Disque plus chaud'}</button></div></div>
 </div>
 <section className="bh-scale" aria-labelledby="scale-title">
  <div className="bh-scale-head"><div><span className="eyebrow">UN REPÈRE PHYSIQUE</span><h2 id="scale-title">Une masse.<br/><em>Toutes les échelles.</em></h2></div><p>Pour un trou noir sans rotation ni charge, tout découle de la masse : la taille de l’horizon, celle de l’ombre, les marées, la température. Choisissez un objet réel, ou faites glisser la masse sur seize ordres de grandeur.</p></div>
  <div className="bh-scale-grid">
   <div className="bh-mass-panel">
    <label htmlFor="bh-mass">Masse <strong id="bh-mass-value">{massLabel(mass)}</strong></label>
    <input id="bh-mass" type="range" min="-6" max="10" step="0.01" value={Math.log10(mass)} onChange={e => setMass(10 ** Number(e.target.value))}/>
    <div className="bh-mass-presets" role="group" aria-label="Objets de référence">{PRESETS.map(p => <button key={p.label} type="button" aria-pressed={near(p.mass, mass)} onClick={() => setMass(p.mass)}><span>{p.label}</span><small>{p.note}</small></button>)}<button type="button" className="bh-double" onClick={() => setMass(m => Math.min(1e10, m * 2))}><span>× 2</span><small>doubler la masse</small></button></div>
    <p className="bh-preset-note" aria-live="polite">{preset ? preset.about : 'Masse libre : les grandeurs ci-dessous restent des calculs pour un trou noir idéal.'}</p>
   </div>
   <div className="bh-radius"><span>RAYON DE L’HORIZON · rₛ = 2GM / c²</span><output id="bh-radius" aria-live="polite" aria-atomic="true">{formatKm(schwarzschildKm(mass))}<small>kilomètres</small></output>
    <p className="bh-human">{length(rs)} · {comparison(rs)}</p>
    <svg className="bh-compare" viewBox="0 0 320 150" role="img" aria-label={`Horizon de ${length(rs)} comparé à ${ref.name}.`}>
     <circle cx="88" cy="70" r={rA} className="bh-compare-hole"/><circle cx="232" cy="70" r={rB} className="bh-compare-ref"/>
     <text x="88" y="146" textAnchor="middle">horizon</text><text x="232" y="146" textAnchor="middle">{ref.name.replace(/^(la|le) /, '')}</text>
    </svg>
   </div>
  </div>
  <ul className="bh-metrics">
   <li><Target size={18}/><span>Ombre vue de loin</span><strong>{length(2 * s.shadowRadius)}</strong><small>de diamètre, 2,6 fois celui de l’horizon : la lumière qui passe plus près est capturée.</small></li>
   <li><Clock size={18}/><span>Un tour sur la dernière orbite stable</span><strong>{duration(s.iscoPeriod)}</strong><small>à 3 rₛ, vu de loin. Le gaz du disque n’orbite pas plus près.</small></li>
   <li><Scale size={18}/><span>Densité moyenne (naïve)</span><strong>{sci(s.meanDensity, 2)} kg/m³</strong><small>{density(s.meanDensity)} Masse divisée par un volume de sphère : l’intérieur n’a pas de densité ainsi définie.</small></li>
   <li><Waves size={18}/><span>Marée à l’horizon</span><strong>{gees(s.horizonTide)}</strong><small>d’écart entre la tête et les pieds d’un corps de 2 m. Plus le trou noir est lourd, plus elle est faible.</small></li>
   <li><Thermometer size={18}/><span>Température de Hawking</span><strong>{sci(s.hawkingTemperature, 2)} K</strong><small>{s.hawkingTemperature < CMB ? 'Plus froid que le fond diffus (2,7 K) : aujourd’hui, il absorbe plus qu’il ne rayonne.' : 'Plus chaud que le fond diffus cosmologique.'}</small></li>
   <li><Hourglass size={18}/><span>Durée d’évaporation</span><strong>≈ {sci(s.evaporationYears, 1)} ans</strong><small>soit {sci(s.evaporationYears / AGE_OF_UNIVERSE, 1)} fois l’âge de l’Univers. Ordre de grandeur, à un facteur 10 près selon les particules émises.</small></li>
  </ul>
 </section>
 <section className="bh-descent" aria-labelledby="descent-title">
  <div className="bh-descent-copy">
   <span className="eyebrow">S’APPROCHER</span><h2 id="descent-title">Descendre vers<br/><em>l’horizon.</em></h2>
   <p>Une sonde reste immobile, retenue par ses moteurs, à une distance r du centre du trou noir choisi plus haut. Rapprochez-la : le temps, la vitesse de fuite et les marées changent.</p>
   <label htmlFor="bh-distance">Distance au centre <strong>{number(x, 3)} rₛ · {length(x * rs)}</strong></label>
   <input id="bh-distance" type="range" min={Math.log10(1.01)} max={Math.log10(20)} step="0.001" value={Math.log10(x)} onChange={e => setX(10 ** Number(e.target.value))}/>
   <div className="bh-landmarks" role="group" aria-label="Repères">{LANDMARKS.map(l => <button key={l.x} type="button" aria-pressed={x === l.x} onClick={() => setX(l.x)}><span>{l.label}</span><small>{l.short}</small></button>)}</div>
   <p className="bh-verdict" aria-live="polite">{ORBITS[d.orbit]}</p>
  </div>
  <svg className="bh-diagram" viewBox="0 0 400 400" role="img" aria-label={`Sonde à ${number(x, 3)} rayons de Schwarzschild ; horizon, sphère des photons et dernière orbite stable représentés.`}>
   <defs><radialGradient id="bh-glow"><stop offset="55%" stopColor="#000"/><stop offset="100%" stopColor="#e6bd8c" stopOpacity=".35"/></radialGradient></defs>
   <circle cx="200" cy="200" r={scaled(20)} className="bh-d-far"/>
   <circle cx="200" cy="200" r={scaled(3)} className="bh-d-isco"/>
   <circle cx="200" cy="200" r={scaled(1.5)} className="bh-d-photon"/>
   <circle cx="200" cy="200" r={scaled(1)} fill="url(#bh-glow)" className="bh-d-horizon"/>
   <text x="200" y={200 - scaled(3) - 8} textAnchor="middle">dernière orbite stable · 3 rₛ</text>
   <text x="200" y={200 + scaled(3) + 20} textAnchor="middle">sphère des photons · 1,5 rₛ (tiretés bleus)</text>
   <line x1={200 + scaled(1) * Math.cos(angle)} y1={200 + scaled(1) * Math.sin(angle)} x2={200 + scaled(x) * Math.cos(angle)} y2={200 + scaled(x) * Math.sin(angle)} className="bh-d-path"/>
   <circle cx={200 + scaled(x) * Math.cos(angle)} cy={200 + scaled(x) * Math.sin(angle)} r="7" className="bh-d-probe"/>
  </svg>
  <dl className="bh-readouts">
   <div><dt><Clock size={16}/> Une heure pour la sonde</dt><dd>{duration(3600 * d.timeFactor)}</dd><small>s’écoulent pendant ce temps loin du trou noir.</small></div>
   <div><dt><Gauge size={16}/> Vitesse de libération</dt><dd>{number(d.escape * 100, 3)} % de c</dd><small>mesurée sur place ; 100 % à l’horizon.</small></div>
   <div><dt><Waves size={16}/> Marée sur 2 m</dt><dd>{gees(d.tide)}</dd><small>d’étirement entre les deux extrémités de la sonde.</small></div>
   <div><dt><Rocket size={16}/> Poussée pour rester immobile</dt><dd>{gees(d.hover)}</dd><small>infinie à l’horizon : on ne peut que tomber.</small></div>
  </dl>
 </section>
 <p className="bh-status" role="status">{notice}</p>
 </>;
}
const root = document.getElementById('black-hole-root'); if (root) createRoot(root).render(<StrictMode><App/></StrictMode>);
