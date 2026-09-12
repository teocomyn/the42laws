/** Values are visual controls, except the separately exposed Schwarzschild radius. */
export interface Settings { inclination: number; zoom: number; exposure: number; playing: boolean; disk: boolean; palette: 'amber' | 'ice'; }
export const defaults: Settings = { inclination: 12, zoom: 1, exposure: 1.25, playing: false, disk: true, palette: 'amber' };
const clamp = (v: unknown, lo: number, hi: number, fallback: number) => typeof v === 'number' && Number.isFinite(v) ? Math.max(lo, Math.min(hi, v)) : fallback;
export function normalizeSettings(v: Partial<Settings>): Settings {
 return { inclination: clamp(v.inclination, 3, 85, defaults.inclination), zoom: clamp(v.zoom, .7, 1.7, defaults.zoom), exposure: clamp(v.exposure, .4, 2, defaults.exposure), playing: v.playing === true, disk: v.disk !== false, palette: v.palette === 'ice' ? 'ice' : 'amber' };
}
/** Nonrotating, uncharged black hole. G SI, nominal approximate solar mass in kg. */
export function schwarzschildKm(solarMass: number): number {
 if (!Number.isFinite(solarMass) || solarMass <= 0) throw new RangeError('La masse doit être positive et finie.');
 return 2 * 6.67430e-11 * 1.98847e30 / (299792458 ** 2) / 1000 * solarMass;
}
