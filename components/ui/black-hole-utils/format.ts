/** French formatting for the black hole laboratory: readable orders of magnitude, never fake precision. */
const SUP: Record<string, string> = { '-': '⁻', '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹' };
export const number = (x: number, digits = 3) => new Intl.NumberFormat('fr-FR', { maximumSignificantDigits: digits }).format(x);
/** 2,2 × 10⁶⁶ for large or tiny values, plain digits otherwise. */
export function sci(x: number, digits = 2): string {
 if (!Number.isFinite(x)) return '—';
 if (x === 0) return '0';
 const e = Math.floor(Math.log10(Math.abs(x)));
 if (e >= -2 && e < 4) return number(x, Math.max(digits, e + 1));
 const m = x / 10 ** e, rounded = Number(m.toPrecision(digits));
 const [mant, exp] = rounded >= 10 ? [rounded / 10, e + 1] : [rounded, e];
 return `${number(mant, digits)} × 10${String(exp).split('').map(c => SUP[c]).join('')}`;
}
const AU = 1.495978707e11, KM = 1000;
/** A length in metres, in the most readable unit (astronomical units added when large). */
export function length(m: number): string {
 if (m < 0.01) return `${number(m * 1000, 2)} mm`;
 if (m < 1) return `${number(m * 100, 2)} cm`;
 if (m < 1000) return `${number(m, 3)} m`;
 const km = m / KM;
 if (km < 1e6) return `${number(km, km < 100 ? 3 : 4)} km`;
 const au = m >= 0.05 * AU ? ` (${number(m / AU, 3)} ua)` : '';
 if (km < 1e9) return `${number(km / 1e6, 3)} millions de km${au}`;
 return `${number(km / 1e9, 3)} milliards de km${au}`;
}
/** A duration in seconds, in the most readable unit. */
export function duration(s: number): string {
 if (s < 1e-3) return `${number(s * 1e6, 2)} µs`;
 if (s < 1) return `${number(s * 1000, 2)} ms`;
 if (s < 120) return `${number(s, 2)} s`;
 if (s < 7200) return `${number(s / 60, 2)} min`;
 if (s < 2 * 86400) return `${number(s / 3600, 2)} h`;
 const days = s / 86400;
 if (days < 730) return `${number(days, 3)} jours`;
 const years = days / 365.25;
 return years < 1e6 ? `${number(years, 3)} ans` : `${sci(years)} ans`;
}
/** Sourced reference radii (NASA fact sheets), used to give an order of magnitude to rₛ. */
export const RULERS = [
 { m: 6.371e6, name: 'le rayon de la Terre' },
 { m: 3.844e8, name: 'la distance Terre–Lune' },
 { m: 6.957e8, name: 'le rayon du Soleil' },
 { m: AU, name: 'la distance Terre–Soleil' },
 { m: 30.18 * AU, name: 'la distance moyenne de Neptune au Soleil' },
];
/** Largest reference that the horizon exceeds (or the smallest one), with the ratio rₛ / reference. */
export function ruler(rs: number) {
 const best = RULERS.filter(r => r.m <= rs).pop() ?? RULERS[0];
 return { ...best, ratio: rs / best.m };
}
export function comparison(rs: number): string {
 const { name, ratio } = ruler(rs);
 if (ratio >= 0.8 && ratio <= 1.25) return `Environ ${name}.`;
 return ratio > 1 ? `${number(ratio, 2)} fois ${name}.` : `${sci(1 / ratio, 2)} fois plus petit que ${name}.`;
}
