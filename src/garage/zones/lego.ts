// Lego on the corner rack: real bricks with studs at 8 mm pitch. A stepped tower, a small house and a
// brick car stand in until the real sets are named. The zone adopts the room's rack as its own.
import * as THREE from 'three';
import { defineZone } from '../zone';
import { rbox, cyl, group, proxy } from '../kit';
import { mat } from '../toon';

const L8 = 0.008, LH = 0.0096;
function brick(p: THREE.Object3D, nx: number, nz: number, c: number, x: number, y: number, z: number, h = LH) {
  rbox(p, nx * L8 - 0.0002, h, nz * L8 - 0.0002, 0.0006, mat(c, 0.6), x, y + h / 2, z);
  for (let i = 0; i < nx; i++) for (let j = 0; j < nz; j++) cyl(p, 0.0024, 0.0024, 0.0018, 12, mat(c, 0.6), x + (i - (nx - 1) / 2) * L8, y + h + 0.0009, z + (j - (nz - 1) / 2) * L8);
}

export default defineZone({
  id: 'lego',
  ink: 0.9,
  view: { pos: [-2.5, 1.62, -1.38], target: [-2.75, 1.41, -2.15] },
  build(gLego, ctx) {
    const rack = ctx.env.getObjectByName('rack');
    if (rack) gLego.add(rack);
    // build 1: a stepped tower
    const t = group(gLego, -2.98, 1.361, -2.12);
    [0xc4281c, 0xf5cd2f, 0x0d69ab, 0xf2f3f2, 0xc4281c, 0x287f46, 0xf5cd2f, 0x0d69ab].forEach((c, i) => brick(t, 4, 2, c, (i % 2) * L8, i * LH, 0));
    // build 2: a small house on a green plate
    const hs = group(gLego, -2.74, 1.361, -2.1);
    brick(hs, 10, 8, 0x287f46, 0, 0, 0, 0.0032);
    for (let r = 0; r < 4; r++) {
      const y = 0.0032 + r * LH;
      brick(hs, 8, 1, 0xf2f3f2, 0, y, -3.5 * L8); brick(hs, 1, 6, 0xf2f3f2, -3.5 * L8, y, 0); brick(hs, 1, 6, 0xf2f3f2, 3.5 * L8, y, 0);
      if (r < 3) { brick(hs, 3, 1, 0xf2f3f2, -2.5 * L8, y, 3.5 * L8); brick(hs, 3, 1, 0xf2f3f2, 2.5 * L8, y, 3.5 * L8); } else brick(hs, 8, 1, 0xf2f3f2, 0, y, 3.5 * L8);
    }
    for (let r = 0; r < 4; r++) brick(hs, 8 - r * 2 + 2, 8, 0xc4281c, 0, 0.0032 + (4 + r) * LH, 0, LH);
    // build 3: a brick car
    const cr = group(gLego, -2.5, 1.361, -2.04, 0.5);
    brick(cr, 4, 10, 0x0d69ab, 0, 0.004, 0, 0.0032);
    brick(cr, 4, 3, 0x0d69ab, 0, 0.0072, 2.5 * L8); brick(cr, 4, 4, 0xf2f3f2, 0, 0.0072, -2 * L8); brick(cr, 4, 2, 0x1b2a34, 0, 0.0072 + LH, -2.5 * L8);
    for (const zz of [-3, 3]) for (const xx of [-1, 1]) cyl(cr, 0.0075, 0.0075, 0.007, 16, mat(0x17151a), xx * 2.4 * L8, 0.0075, zz * L8, 0, 0, Math.PI / 2);
    proxy(gLego, 0.84, 1.98, 0.46, -2.75, 0.99, -2.18);
  }
});
