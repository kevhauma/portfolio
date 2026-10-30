// The cluster's needles and lamps, and the cup of water. When a track plays, the needles settle at the tape's revs
// with one exponential ease-out; on eject they fall back to idle. The water rings once when a track starts.
import type { Tape } from '../data/music';

type Reading = Record<string, number>;

const OUT = 'cubic-bezier(.16,1,.3,1)';
export const IDLE: Reading = { speedo: 0, tach: 880, temp: .42, fuel: .72, oil: .3, volt: .55 };
/* a small per-track offset so a new track re-settles the needles (synthetic, never a stat) */
const WOB = [0, 160, -120, 90, 200, -70, 130, -160];

export const drive = (t: Tape, n: number): Reading => {
  const rpm = t.rpm + WOB[n];
  return { tach: rpm, speedo: t.kmh + WOB[n] / 40, temp: .5, fuel: .72, oil: .32 + rpm / 9000 * .5, volt: .62 };
};

export function gauges(frame: HTMLElement, reduced: MediaQueryList) {
  const N = new Map<string, { el: SVGGElement; min: number; max: number; a0: number; a1: number }>();
  frame.querySelectorAll<SVGGElement>('[data-needle]').forEach(el => {
    const d = el.dataset;
    N.set(d.needle!, { el, min: +d.min!, max: +d.max!, a0: +d.a0!, a1: +d.a1! });
  });
  const shift = frame.querySelector<SVGElement>('[data-shift]');
  const brake = frame.querySelector<SVGElement>('[data-brake]');
  const rips = [...frame.querySelectorAll<SVGElement>('[data-rip]')];
  const angle = (k: string, v: number) => { const n = N.get(k)!; return n.a0 + (Math.min(n.max, Math.max(n.min, v)) - n.min) / (n.max - n.min) * (n.a1 - n.a0); };
  const ang: Reading = {};
  for (const k of N.keys()) ang[k] = angle(k, IDLE[k] ?? 0);
  const set = () => { for (const [k, n] of N) n.el.setAttribute('transform', `rotate(${Math.round(ang[k] * 100) / 100})`); };
  let raf = 0, snap = 0;

  const sweep = (to: Reading, instant = false) => {
    cancelAnimationFrame(raf); clearTimeout(snap);
    const goal: Reading = {};
    for (const k of N.keys()) goal[k] = angle(k, to[k] ?? IDLE[k] ?? 0);
    shift?.setAttribute('fill', to.tach >= 7000 ? '#FF5A2A' : '#3A1410');
    brake?.setAttribute('fill', to.speedo > 0 ? '#8A3A3E' : '#FF3A2E');
    if (instant || reduced.matches) { Object.assign(ang, goal); set(); return; }
    const from = { ...ang }, t0 = performance.now(), D = 1500;
    const step = () => {
      const p = Math.max(0, Math.min(1, (performance.now() - t0) / D)), e = p >= 1 ? 1 : 1 - Math.pow(2, -10 * p);
      for (const k in goal) ang[k] = from[k] + (goal[k] - from[k]) * e;
      set();
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    // land exactly on the goal even when frames are throttled
    snap = window.setTimeout(() => { cancelAnimationFrame(raf); Object.assign(ang, goal); set(); }, D + 60);
  };

  const ripple = () => {
    if (reduced.matches) return;
    rips.forEach((r, i) => r.animate(
      [{ transform: 'scale(.18)', opacity: .95 }, { transform: 'scale(1.3)', opacity: 0 }],
      { duration: 1100, delay: i * 240, easing: OUT, fill: 'both' }
    ));
  };

  return { sweep, ripple };
}
