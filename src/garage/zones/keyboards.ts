// Keyboards on the desk: a beige 65% with a red Escape, and a dark 60% on a stand with a green Enter.
// Modelled with real row stagger and sculpted keycap rows; which boards they are is still to follow.
import * as THREE from 'three';
import { defineZone } from '../zone';
import { add, box, rbox, extr, group, proxy, frustumG } from '../kit';
import { mat } from '../toon';

const KU = 0.019; // one key unit, 19 mm
type Cols = { caseC: number; plate: number; alpha: number; mod: number };
type Opts = { mod: (r: number, k: number, row: number[]) => boolean; accent: (r: number, k: number, row: number[]) => number };

function keyboard(parent: THREE.Object3D, rows: number[][], cols: Cols, opts: Opts) {
  const g = group(parent); const W = Math.max(...rows.map(r => r.reduce((a, b) => a + b, 0)));
  rbox(g, W * KU + 0.026, 0.026, rows.length * KU + 0.026, 0.006, mat(cols.caseC, 0.5), 0, 0.013, 0);
  box(g, W * KU + 0.004, 0.004, rows.length * KU + 0.004, mat(cols.plate), 0, 0.026, 0);
  const prof = [0.0118, 0.0108, 0.0099, 0.0101, 0.0098]; // a sculpted profile, row by row
  rows.forEach((row, r) => {
    let cx = -W * KU / 2; const z = (r - (rows.length - 1) / 2) * KU;
    row.forEach((w, k) => {
      const h = prof[r] ?? 0.01; const kg = frustumG(w * KU - 0.0016, KU - 0.0016, w * KU - 0.0058, KU - 0.0058, h, 0, -0.001);
      let c = (w !== 1 || opts.mod(r, k, row)) ? cols.mod : cols.alpha; const acc = opts.accent(r, k, row); if (acc) c = acc;
      add(g, kg, mat(c, 0.4), cx + w * KU / 2, 0.025, z); cx += w * KU;
    });
  });
  return g;
}

export default defineZone({
  id: 'keyboards',
  ink: 1.0,
  view: { pos: [2.34, 1.2, -0.72], target: [2.82, 0.8, -1.18] },
  build(gKeys) {
    const r65 = [[...Array(13).fill(1), 2, 1], [1.5, ...Array(12).fill(1), 1.5, 1], [1.75, ...Array(11).fill(1), 2.25, 1], [2.25, ...Array(10).fill(1), 1.75, 1, 1], [1.25, 1.25, 1.25, 6.25, 1, 1, 1, 1, 1, 1]];
    const r60 = [[...Array(13).fill(1), 2], [1.5, ...Array(12).fill(1), 1.5], [1.75, ...Array(11).fill(1), 2.25], [2.25, ...Array(10).fill(1), 2.75], [1.25, 1.25, 1.25, 6.25, 1.25, 1.25, 1.25, 1.25]];
    const A = keyboard(gKeys, r65, { caseC: 0xc6bba0, plate: 0x8f877a, alpha: 0xe6dfcb, mod: 0xa49b8b }, { mod: (r, k, row) => k === row.length - 1 || (r === 3 && k === 12) || (r === 4 && k >= 7), accent: (r, k) => (r === 0 && k === 0) ? 0xE2001A : 0 });
    A.position.set(2.66, 0.74, -1.38); A.rotation.set(0.04, -1.0, 0);
    const st = group(gKeys, 2.98, 0.74, -0.98, -0.85);
    add(st, extr([[-0.05, 0], [0.05, 0], [0.05, 0.012], [-0.05, 0.07]], 0.3, 0.003, 1), mat(0x2d2e34, 0.4), 0, 0, 0, 0, Math.PI / 2, 0);
    const B = keyboard(st, r60, { caseC: 0x2d3038, plate: 0x1c1e24, alpha: 0x434956, mod: 0xd6d1c4 }, { mod: () => false, accent: (r, k, row) => (r === 2 && k === row.length - 1) ? 0x00843D : 0 });
    B.position.set(0, 0.045, 0.0); B.rotation.x = 0.5;
    const ms = add(gKeys, new THREE.SphereGeometry(0.03, 24, 16), mat(0xd6cdb6, 0.5), 2.62, 0.75, -1.05); ms.scale.set(0.7, 0.42, 1.0);
    proxy(gKeys, 0.5, 0.18, 0.8, 2.82, 0.8, -1.18, -0.8);
  }
});
