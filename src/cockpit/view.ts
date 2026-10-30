// The windshield. At rest it holds the dusk pass painted in the page; when a track plays, that track's view cuts in
// over it, left to right behind a hard edge raked at 14°, with a thin light slash riding the edge.
// The views are placeholders for now: hard sky bands in the tape's palette, a horizon, the road, and a primer chip
// stuck on the inside of the glass naming the view that will go there.
import type { Tape } from '../data/music';

const W = 1440, H = 330;
const OUT = 'cubic-bezier(.16,1,.3,1)';
const RAKE = H * Math.tan(14 * Math.PI / 180);
const f = (n: number) => Math.round(n * 10) / 10;
const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/* small per-track changes so every cut lands on a different road: horizon height, where the road bends to, the hills */
const HZ = [0, 10, -8, 14, 4, -12, 8, -4];
const BEND = [-60, 70, 150, -130, 20, 110, -170, 40];
/* sky band stops as fractions of the horizon, by band count */
const STOPS: Record<number, number[]> = { 5: [.34, .56, .75, .92], 6: [.32, .49, .66, .81, .94], 7: [.33, .5, .65, .77, .87, .97] };

const rnd = (seed: number) => () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };

export function viewMarkup(tape: Tape, n: number): string {
  const { sky, far, ground, road } = tape.view;
  const track = tape.tracks[n];
  const hz = 188 + HZ[n], r = rnd(n * 97 + tape.id.length * 13 + 5);
  let o = `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">`;
  // sky: hard bands, no ramp
  const k = sky.length, s = STOPS[k] ?? STOPS[6];
  o += `<rect width="${W}" height="${H}" fill="${sky[k - 1]}"/>`;
  for (let i = k - 2; i >= 0; i--) o += `<rect width="${W}" height="${f((s[i] ?? 1) * hz)}" fill="${sky[i]}"/>`;
  // far hills along the horizon
  let d = `M-20 ${hz + 4}`;
  for (let x = -20; x <= W + 40; x += 70 + r() * 90) d += `L${f(x)} ${f(hz - 6 - r() * 26)}`;
  o += `<path d="${d}L${W + 40} ${H}H-20Z" fill="${far}"/>`;
  // ground in three bands
  o += `<rect y="${hz + 2}" width="${W}" height="${H}" fill="${ground[0]}"/>`;
  o += `<rect y="${hz + 26}" width="${W}" height="${H}" fill="${ground[1]}"/>`;
  o += `<rect y="${hz + 64}" width="${W}" height="${H}" fill="${ground[2]}"/>`;
  // the road to the vanishing point, lit half on the sun's side, a dashed centre line in perspective
  const vx = 720 + BEND[n], bl = 300, br = 1210, bc = (bl + br) / 2;
  o += `<path d="M${vx - 5} ${hz}H${vx + 5}L${br} ${H}H${bl}Z" fill="${road[0]}"/>`;
  o += `<path d="M${vx - 5} ${hz}H${vx}L${bc} ${H}H${bl}Z" fill="${road[1]}"/>`;
  const at = (z: number, side: number) => [vx + (bc - vx) / z + side * 7 / z, hz + (H - hz) / z];
  for (let z = 1; z < 40; z *= 1.55) {
    const z1 = z * 1.22, [ax, ay] = at(z, -1), [bx, by] = at(z, 1), [cx, cy] = at(z1, 1), [dx, dy] = at(z1, -1);
    o += `<path d="M${f(ax)} ${f(ay)}L${f(bx)} ${f(by)}L${f(cx)} ${f(cy)}L${f(dx)} ${f(dy)}Z" fill="${road[2]}"/>`;
  }
  o += '</svg>';
  // the chip stuck on the inside of the glass
  o += `<p class="ck-chip"><span class="ck-chip-t">View for ${esc(track.title)} · placeholder</span><span class="ck-chip-v">${esc(track.view)}</span></p>`;
  return o;
}

export function mirrorSky(sky: string[]): [string, string, string] {
  const n = sky.length;
  return n === 3 ? [sky[0], sky[1], sky[2]] : [sky[1], sky[Math.floor(n / 2)], sky[n - 2]];
}

export const DUSK_SKY: [string, string, string] = ['#4A1D58', '#9A3466', '#E06A42'];

export function windshield(glass: HTMLElement, mirror: HTMLElement, reduced: MediaQueryList) {
  const a = glass.querySelector<HTMLElement>('[data-pane="a"]')!, b = glass.querySelector<HTMLElement>('[data-pane="b"]')!;
  const cut = glass.querySelector<HTMLElement>('[data-cut]')!;
  const dusk = a.innerHTML;
  let wipe: Animation[] | null = null;
  const edge = (p: number) => `polygon(-100px 0px, ${(p + RAKE).toFixed(1)}px 0px, ${p.toFixed(1)}px ${H}px, -100px ${H}px)`;
  const settle = () => { a.innerHTML = b.innerHTML; b.innerHTML = ''; b.style.clipPath = ''; };

  const paint = (markup: string, sky: [string, string, string], instant = false) => {
    ['--m1', '--m2', '--m3'].forEach((v, i) => mirror.style.setProperty(v, sky[i]));
    if (wipe) { wipe.forEach(w => w.cancel()); wipe = null; settle(); }
    if (instant || reduced.matches) { a.innerHTML = markup; return; }
    b.innerHTML = markup;
    const opt: KeyframeAnimationOptions = { duration: 660, easing: OUT, fill: 'forwards' };
    const w = b.animate([{ clipPath: edge(-100) }, { clipPath: edge(W) }], opt);
    const c = cut.animate([
      { transform: `translateX(${-100 + RAKE / 2 - 9}px) skewX(-14deg)`, opacity: 1 },
      { transform: `translateX(${W + RAKE / 2 - 9}px) skewX(-14deg)`, opacity: 1 }
    ], opt);
    wipe = [w, c];
    const done = () => { if (wipe?.[0] !== w) return; settle(); w.cancel(); c.cancel(); wipe = null; };
    w.finished.then(done, () => {});
    // land on the new view even when frames are throttled
    setTimeout(done, 660 + 120);
  };

  return {
    show: (tape: Tape, n: number, instant = false) => paint(viewMarkup(tape, n), mirrorSky(tape.view.sky), instant),
    rest: (instant = false) => paint(dusk, DUSK_SKY, instant)
  };
}
