/* Swoop geometry: the livery stripes bent along a curve.
   A spine is a chain of cubic Béziers written like an SVG `C` chain: [P0, c1, c2, P1, c1, c2, P2, ...].
   A band is the strip between two offsets from that spine (positive = left of travel, so "up" for a
   spine running right). */

export type Pt = [number, number];

interface Band {
  /** offsets from the spine, in viewBox units */
  from: number;
  to: number;
  /** stretch of the spine this band covers, 0 to 1 */
  t0?: number;
  t1?: number;
}

const SAMPLES = 72;

function segments(spine: Pt[]) {
  const segs: [Pt, Pt, Pt, Pt][] = [];
  for (let i = 0; i + 3 < spine.length; i += 3) segs.push([spine[i], spine[i + 1], spine[i + 2], spine[i + 3]]);
  return segs;
}

/** point and unit normal at global t along the spine */
function at(segs: [Pt, Pt, Pt, Pt][], t: number): [Pt, Pt] {
  const s = Math.min(segs.length - 1, Math.floor(t * segs.length));
  const u = t * segs.length - s;
  const [a, b, c, d] = segs[s];
  const v = 1 - u;
  const p: Pt = [
    v * v * v * a[0] + 3 * v * v * u * b[0] + 3 * v * u * u * c[0] + u * u * u * d[0],
    v * v * v * a[1] + 3 * v * v * u * b[1] + 3 * v * u * u * c[1] + u * u * u * d[1]
  ];
  let dx = 3 * v * v * (b[0] - a[0]) + 6 * v * u * (c[0] - b[0]) + 3 * u * u * (d[0] - c[0]);
  let dy = 3 * v * v * (b[1] - a[1]) + 6 * v * u * (c[1] - b[1]) + 3 * u * u * (d[1] - c[1]);
  const len = Math.hypot(dx, dy) || 1;
  dx /= len; dy /= len;
  return [p, [dy, -dx]];
}

const f = (n: number) => Math.round(n * 10) / 10;

/** the closed outline of one band along the spine */
export function band(spine: Pt[], { from, to, t0 = 0, t1 = 1 }: Band): string {
  const segs = segments(spine);
  const n = Math.max(8, Math.round(SAMPLES * segs.length * (t1 - t0)));
  const a: string[] = [], b: string[] = [];
  for (let i = 0; i <= n; i++) {
    const u = i / n;
    const [p, nrm] = at(segs, t0 + (t1 - t0) * u);
    a.push(`${f(p[0] + nrm[0] * from)} ${f(p[1] + nrm[1] * from)}`);
    b.push(`${f(p[0] + nrm[0] * to)} ${f(p[1] + nrm[1] * to)}`);
  }
  return `M${a.join('L')}L${b.reverse().join('L')}Z`;
}

/** everything on one side of the spine, its edge pushed `offset` along the normal, closed off at `edge` (a y):
    below the spine down to a floor is the navy under the cut; above it up to a ceiling clips the sun behind it */
export function side(spine: Pt[], edge: number, offset = 0): string {
  const segs = segments(spine);
  const n = SAMPLES * segs.length;
  const pts: Pt[] = [];
  for (let i = 0; i <= n; i++) { const [p, nrm] = at(segs, i / n); pts.push([p[0] + nrm[0] * offset, p[1] + nrm[1] * offset]); }
  const a = pts[0], z = pts[pts.length - 1];
  return `M${pts.map(p => `${f(p[0])} ${f(p[1])}`).join('L')}L${f(z[0])} ${edge}L${f(a[0])} ${edge}Z`;
}

/** a ring between two radii (r0 = 0 for a disc) */
export function ring(cx: number, cy: number, r0: number, r1: number): string {
  const circle = (r: number) => `M${f(cx - r)} ${f(cy)}a${r} ${r} 0 1 0 ${f(2 * r)} 0a${r} ${r} 0 1 0 ${f(-2 * r)} 0Z`;
  return r0 > 0 ? circle(r1) + circle(r0) : circle(r1);
}
