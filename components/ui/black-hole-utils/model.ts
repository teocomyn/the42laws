/** Values are visual controls, except the separately exposed physical scales below. */
export interface Settings { inclination: number; azimuth: number; zoom: number; exposure: number; playing: boolean; disk: boolean; markers: boolean; palette: 'amber' | 'ice'; }
export const defaults: Settings = { inclination: 12, azimuth: 0, zoom: 1, exposure: 1.25, playing: false, disk: true, markers: false, palette: 'amber' };
const clamp = (v: unknown, lo: number, hi: number, fallback: number) => typeof v === 'number' && Number.isFinite(v) ? Math.max(lo, Math.min(hi, v)) : fallback;
const wrap = (v: unknown) => typeof v === 'number' && Number.isFinite(v) ? ((v % 360) + 360) % 360 : defaults.azimuth;
export function normalizeSettings(v: Partial<Settings>): Settings {
 return { inclination: clamp(v.inclination, 3, 85, defaults.inclination), azimuth: wrap(v.azimuth), zoom: clamp(v.zoom, .7, 1.7, defaults.zoom), exposure: clamp(v.exposure, .4, 2, defaults.exposure), playing: v.playing === true, disk: v.disk !== false, markers: v.markers === true, palette: v.palette === 'ice' ? 'ice' : 'amber' };
}

/** CODATA 2018 values; nominal solar mass close to the NASA Sun fact sheet (1,9884 × 10³⁰ kg). */
export const G = 6.67430e-11, C = 299792458, HBAR = 1.054571817e-34, KB = 1.380649e-23, SOLAR_MASS = 1.98847e30, YEAR = 365.25 * 86400;
const kilograms = (solarMass: number) => { if (!Number.isFinite(solarMass) || solarMass <= 0) throw new RangeError('La masse doit être positive et finie.'); return solarMass * SOLAR_MASS; };
/** Nonrotating, uncharged black hole: rₛ = 2GM/c². */
export function schwarzschildKm(solarMass: number): number {
 kilograms(solarMass);
 return 2 * G * SOLAR_MASS / C ** 2 / 1000 * solarMass;
}

/** Shadow edge (critical impact parameter), photon sphere and innermost stable circular orbit, in units of rₛ. */
export const SHADOW_RS = 1.5 * Math.sqrt(3), PHOTON_SPHERE_RS = 1.5, ISCO_RS = 3;

export interface Scales { rs: number; shadowRadius: number; iscoPeriod: number; meanDensity: number; hawkingTemperature: number; evaporationYears: number; horizonTide: number; }
/** Textbook Schwarzschild results for a given mass. SI units; times in seconds unless named in years. */
export function blackHoleScales(solarMass: number, bodyLength = 2): Scales {
 const M = kilograms(solarMass), rs = 2 * G * M / C ** 2;
 return {
  rs,
  shadowRadius: SHADOW_RS * rs,
  // Orbital period at r = 3rₛ for a distant observer: 2π √(r³/GM).
  iscoPeriod: 2 * Math.PI * Math.sqrt((ISCO_RS * rs) ** 3 / (G * M)),
  // Mass divided by the naive Euclidean volume 4/3 π rₛ³; not a density of matter inside the horizon.
  meanDensity: M / (4 / 3 * Math.PI * rs ** 3),
  // Hawking temperature ħc³ / (8πGMk).
  hawkingTemperature: HBAR * C ** 3 / (8 * Math.PI * G * M * KB),
  // Page (1976): total power 2 × 10⁻⁴ ħc⁶/(G²M²) for M ≫ 10¹⁷ g; dM/dt = −P/c² integrates to G²M³/(6 × 10⁻⁴ ħc⁴).
  evaporationYears: G ** 2 * M ** 3 / (6e-4 * HBAR * C ** 4) / YEAR,
  // Radial tidal stretching across a body of length L at the horizon: 2GML/r³.
  horizonTide: 2 * G * M * bodyLength / rs ** 3,
 };
}

export interface Descent { timeFactor: number; escape: number; tide: number; hover: number; orbit: 'stable' | 'unstable' | 'photon' | 'none'; }
/** A static observer at r = x rₛ (x > 1): clock-rate ratio, local escape speed (fraction of c), tide on a body of length L
 * and proper acceleration needed to hover, GM / (r² √(1 − rₛ/r)). */
export function descent(solarMass: number, x: number, bodyLength = 2): Descent {
 if (!Number.isFinite(x) || x <= 1) throw new RangeError('La distance doit rester au-dessus de l’horizon.');
 const M = kilograms(solarMass), r = x * 2 * G * M / C ** 2;
 return {
  timeFactor: 1 / Math.sqrt(1 - 1 / x),
  escape: Math.sqrt(1 / x),
  tide: 2 * G * M * bodyLength / r ** 3,
  hover: G * M / (r ** 2 * Math.sqrt(1 - 1 / x)),
  orbit: x >= ISCO_RS ? 'stable' : Math.abs(x - PHOTON_SPHERE_RS) < 1e-9 ? 'photon' : x > PHOTON_SPHERE_RS ? 'unstable' : 'none',
 };
}

/**
 * Screen radius of a ring of impact parameter b (units of rₛ) for the lab camera: distance 18 rₛ,
 * focal length 2.15 × zoom, in units of half the shorter canvas side. The shader integrates
 * x″ = −(3/2) h² x / r⁵, whose orbits obey the Schwarzschild null-geodesic equation u″ + u = (3/2) rₛ u²;
 * from that start a ray is captured when 1/sin²θ < (D/b_c)² + 1/D, with D = 18 and b_c = SHADOW_RS.
 * With curved = false, the ring is where a straight ray would graze a sphere of radius b.
 */
export function ringScreenRadius(b: number, zoom: number, curved = true): number {
 const D = 18, sin = 1 / Math.sqrt((D / b) ** 2 + (curved ? 1 / D : 0));
 return 2.15 * zoom * Math.tan(Math.asin(sin));
}
