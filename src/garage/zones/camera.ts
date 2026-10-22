// The camera on its tripod, front left, aimed at the bike: the door to photography, which lives on the map.
import * as THREE from 'three';
import { defineZone } from '../zone';
import { add, rbox, cyl, rod, lathe, group, proxy, frustumG, lerp, type Vec } from '../kit';
import { toon, mat, M } from '../toon';

export default defineZone({
  id: 'camera',
  ink: 1.4,
  view: { pos: [-0.5, 1.38, 1.62], target: [-0.93, 1.2, 1.04] },
  build(gCam) {
    const t = group(gCam, -0.95, 0, 1.05);
    const H: Vec = [0, 1.1, 0];
    const at = (F: Vec, k: number): Vec => [lerp(H[0], F[0], k), lerp(H[1], F[1], k), lerp(H[2], F[2], k)];
    for (let k = 0; k < 3; k++) {
      const a = k * Math.PI * 2 / 3 + 0.4, F: Vec = [Math.cos(a) * 0.42, 0.0, Math.sin(a) * 0.42];
      rod(t, H, at(F, 0.58), 0.014, toon(0x1f1e24, { hi: 0.6 }), 12); rod(t, at(F, 0.52), F, 0.009, toon(0x3c3d45, { hi: 0.7 }), 10);
      rod(t, [F[0], 0.0, F[2]], [F[0], 0.03, F[2]], 0.014, mat(0x111015), 10);
      rbox(t, 0.034, 0.03, 0.034, 0.006, mat(0x2a2a31, 0.4), ...at(F, 0.55));
    }
    rod(t, [0, 0.72, 0], [0, 1.16, 0], 0.013, M.chromeDark, 12);
    rbox(t, 0.07, 0.05, 0.07, 0.01, mat(0x1f1e24, 0.5), 0, 1.165, 0); rod(t, [0.0, 1.17, 0.03], [-0.05, 1.12, 0.17], 0.006, mat(0x1f1e24), 8);
    const cb = group(t, 0, 1.235, 0, 0.33); const cp = new THREE.Group(); cp.rotation.z = -0.28; cb.add(cp);
    const body = toon(0x1d1c22, { hi: 0.8, rim: 1 });
    rbox(cp, 0.075, 0.092, 0.138, 0.012, body, 0, 0, 0);
    add(cp, frustumG(0.06, 0.07, 0.03, 0.04, 0.035), body, 0.0, 0.046, 0);
    rbox(cp, 0.085, 0.104, 0.036, 0.014, toon(0x141318, { bands: 2, hi: 0.4 }), 0.006, -0.004, 0.064);
    const lb = lathe([[0.034, 0], [0.036, 0.01], [0.036, 0.06], [0.038, 0.062], [0.038, 0.09], [0.036, 0.095], [0.04, 0.1], [0.042, 0.115]], 36); lb.rotateZ(-Math.PI / 2);
    add(cp, lb, toon(0x17161b, { hi: 0.7, rim: 1 }), 0.038, 0, -0.01);
    for (let i = 0; i < 6; i++) add(cp, new THREE.TorusGeometry(0.038, 0.0025, 6, 36), mat(0x2c2c34, 0.5), 0.1 + i * 0.006, 0, -0.01, 0, Math.PI / 2, 0);
    add(cp, new THREE.CircleGeometry(0.033, 36), M.lens, 0.155, 0, -0.01, 0, Math.PI / 2, 0).userData.noHull = true;
    rbox(cp, 0.02, 0.012, 0.03, 0.004, mat(0x2c2c34, 0.5), -0.01, 0.05, 0.045); cyl(cp, 0.008, 0.008, 0.006, 14, mat(0xE2001A, 0.6), 0.02, 0.05, 0.05);
    proxy(t, 0.9, 1.35, 0.9, 0, 0.66, 0);
  }
});
