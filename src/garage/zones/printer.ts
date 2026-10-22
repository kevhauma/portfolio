// The 3D printer at the left end of the bench: a bed-slinger with a sliced bracket that builds up layer by
// layer under the visitor's scrubber, the current layer banded yellow and traced like a slicer toolpath.
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { defineZone, type RunCtx } from '../zone';
import { add, rbox, cyl, rod, tube, plane, group, proxy, fx, shapeOf } from '../kit';
import { toon, mat, M } from '../toon';
import { ctex } from '../paint';

/** placeholder print settings until Kevin's real G-code arrives */
import { printSpec } from '../../data/garage';
const LAYERS = printSpec.layers, LAYER_H = printSpec.layerHeight;
const PER = 3, NSL = LAYERS / PER, MM = 0.001, BED_Y = 0.085, PZ = 0.03;
let carriage: THREE.Group, printMesh: THREE.Mesh<THREE.BufferGeometry, THREE.ShaderMaterial>, pathLine: THREE.LineSegments;
const sliceStart: number[] = [];
let layer = printSpec.start;

/** the bracket's cross-section at height z (mm): base plate with two screw holes, then the upright and its gussets */
function sliceShapes(zmm: number) {
  const rect = (x0: number, y0: number, w: number, h: number) => shapeOf([[x0, y0], [x0 + w, y0], [x0 + w, y0 + h], [x0, y0 + h]]);
  const S: THREE.Shape[] = [];
  if (zmm < 5) {
    const s = new THREE.Shape(); s.moveTo(-45, -28); s.lineTo(45, -28); s.lineTo(45, 24); s.absarc(41, 24, 4, 0, Math.PI / 2, false); s.lineTo(-41, 28); s.absarc(-41, 24, 4, Math.PI / 2, Math.PI, false); s.lineTo(-45, -28);
    for (const hx of [-27, 27]) { const h = new THREE.Path(); h.absarc(hx, -8, 4.5, 0, Math.PI * 2, true); s.holes.push(h); }
    S.push(s);
  } else {
    if (zmm >= 22 && zmm < 40) { S.push(rect(-45, 21, 36, 7)); S.push(rect(9, 21, 36, 7)); } else S.push(rect(-45, 21, 90, 7));
    const dep = 44 * (1 - (zmm - 5) / 47);
    if (dep > 0.8) { S.push(rect(-40, 21 - dep, 4, dep)); S.push(rect(36, 21 - dep, 4, dep)); }
  }
  return S;
}

function setLayer(Lr: number, ctx?: RunCtx) {
  layer = Lr;
  const s = Math.ceil(Lr / PER); printMesh.geometry.setDrawRange(0, sliceStart[s]);
  printMesh.material.uniforms.uTop.value = Lr > 0 && Lr < LAYERS ? s - 1 : -1;
  carriage.position.y = BED_Y + s * PER * LAYER_H * MM + 0.052;
  const segs: number[] = [];
  if (Lr > 0 && Lr < LAYERS) {
    const zt = s * PER * LAYER_H;
    for (const sh of sliceShapes(zt - PER * LAYER_H / 2)) {
      for (const pts of [sh.getPoints(24), ...sh.holes.map(hh => hh.getPoints(24))]) for (let i = 0; i < pts.length; i++) {
        const a = pts[i], b = pts[(i + 1) % pts.length];
        segs.push(a.x * MM, BED_Y + zt * MM + 0.0004, PZ - a.y * MM, b.x * MM, BED_Y + zt * MM + 0.0004, PZ - b.y * MM);
      }
    }
  }
  pathLine.geometry.dispose(); pathLine.geometry = new THREE.BufferGeometry(); pathLine.geometry.setAttribute('position', new THREE.Float32BufferAttribute(segs, 3));
  ctx?.invalidate();
}

export default defineZone({
  id: 'printer',
  ink: 1.3,
  view: { pos: [-1.17, 1.3, -1.6], target: [-1.37, 1.02, -2.03] },
  build(gPrinter) {
    const PR = group(gPrinter, -1.35, 0.92, -2.06);
    const lcd = ctex(128, 64, (x, w, h) => { x.fillStyle = '#244a8a'; x.fillRect(0, 0, w, h); x.fillStyle = '#cfe2ff'; x.fillRect(10, 12, 60, 6); x.fillRect(10, 28, 40, 6); x.fillRect(10, 44, 70, 6); x.fillStyle = '#ffd23a'; x.fillRect(92, 12, 22, 38); });
    const fMat = mat(0xa3a9b6, 0.6);
    for (const x of [-0.17, 0.17]) rbox(PR, 0.03, 0.03, 0.42, 0.003, fMat, x, 0.015, 0.02);
    rbox(PR, 0.37, 0.03, 0.03, 0.003, fMat, 0, 0.015, -0.18); rbox(PR, 0.37, 0.03, 0.03, 0.003, fMat, 0, 0.015, 0.22);
    rbox(PR, 0.26, 0.012, 0.26, 0.003, mat(0x18171c), 0, 0.07, PZ);
    rbox(PR, 0.25, 0.004, 0.25, 0.0015, mat(0xc0a060, 0.5), 0, BED_Y - 0.004, PZ);
    rbox(PR, 0.06, 0.03, 0.04, 0.004, mat(0x24232a), 0, 0.045, PZ);
    const zf = mat(0xaab0bd, 0.6);
    for (const x of [-0.235, 0.235]) rbox(PR, 0.04, 0.44, 0.04, 0.004, zf, x, 0.22, -0.04);
    rbox(PR, 0.51, 0.04, 0.04, 0.004, zf, 0, 0.44, -0.04); rbox(PR, 0.51, 0.03, 0.04, 0.004, zf, 0, 0.015, -0.04);
    for (const x of [-0.2, 0.2]) rod(PR, [x, 0.04, -0.015], [x, 0.42, -0.015], 0.004, M.chrome, 8);
    for (const x of [-0.2, 0.2]) rbox(PR, 0.045, 0.045, 0.045, 0.004, mat(0x16151a, 0.3), x, 0.06, -0.015);
    const lb = group(PR, -0.15, 0.0, 0.25); rbox(lb, 0.16, 0.06, 0.05, 0.006, mat(0x202026, 0.3), 0, 0.04, 0, -0.35);
    const lp = plane(lb, 0.1, 0.035, toon(0xffffff, { map: lcd, emis: 0.9 }), -0.01, 0.045, 0.0262); lp.rotation.x = -0.35;
    // spool of green filament on top
    const sp = group(PR, 0.0, 0.58, -0.07);
    cyl(sp, 0.11, 0.11, 0.008, 36, mat(0x2a2a31, 0.4), 0, 0, 0.035, Math.PI / 2); cyl(sp, 0.11, 0.11, 0.008, 36, mat(0x2a2a31, 0.4), 0, 0, -0.035, Math.PI / 2);
    cyl(sp, 0.088, 0.088, 0.062, 36, mat(0x00843D, 0.6), 0, 0, 0, Math.PI / 2); cyl(sp, 0.03, 0.03, 0.08, 20, mat(0xa0a6b0), 0, 0, 0, Math.PI / 2);
    rod(PR, [0, 0.46, -0.07], [0, 0.55, -0.07], 0.01, zf, 8);
    carriage = group(PR, 0, 0.2, 0); carriage.userData.noMerge = true;
    for (const dy of [-0.022, 0.022]) rod(carriage, [-0.22, dy, 0.0], [0.22, dy, 0.0], 0.004, M.chrome, 8);
    for (const x of [-0.2, 0.2]) rbox(carriage, 0.05, 0.075, 0.04, 0.005, mat(0x212027, 0.3), x, 0, -0.01);
    const head = group(carriage, 0.08, 0, 0); // out at the edge of the layer it is tracing
    rbox(head, 0.065, 0.07, 0.05, 0.006, mat(0x29282f, 0.3), 0, 0.0, 0.03);
    rbox(head, 0.05, 0.045, 0.045, 0.005, mat(0x111014), 0, 0.055, 0.025);
    rbox(head, 0.032, 0.04, 0.012, 0.004, mat(0x00843D, 0.5), 0.0, -0.005, 0.06);
    cyl(head, 0.006, 0.0015, 0.014, 12, M.chrome, 0, -0.045, 0.03);
    rbox(head, 0.02, 0.02, 0.02, 0.003, mat(0xc9a24a, 0.6), 0, -0.032, 0.03);
    tube(PR, [[0, 0.5, -0.03], [0.04, 0.56, 0.04], [0.08, 0.46, 0.06], [0.08, 0.3, 0.05]], 0.0025, mat(0x00843D), 24, 6).userData.noMerge = true;
    // the bracket, sliced: one extrusion per PER layers, kept in print order so a draw range shows the progress
    const geos: THREE.BufferGeometry[] = []; let count = 0;
    for (let s = 0; s < NSL; s++) {
      sliceStart[s] = count;
      const z0 = s * PER * LAYER_H, th = PER * LAYER_H;
      for (const sh of sliceShapes(z0 + th / 2)) {
        let g: THREE.BufferGeometry = new THREE.ExtrudeGeometry(sh, { depth: th, bevelEnabled: false, curveSegments: 14 });
        g.rotateX(-Math.PI / 2); g.translate(0, z0, 0); g.scale(MM, MM, MM); g.translate(0, BED_Y, PZ);
        if (g.index) g = g.toNonIndexed();
        g.setAttribute('aSl', new THREE.BufferAttribute(new Float32Array(g.attributes.position.count).fill(s), 1));
        geos.push(g); count += g.attributes.position.count;
      }
    }
    sliceStart[NSL] = count;
    printMesh = add(PR, mergeGeometries(geos), toon(0x1fa85a, { slice: true, hi: 0.5 })) as typeof printMesh; printMesh.userData.noMerge = true;
    pathLine = fx(new THREE.LineSegments(new THREE.BufferGeometry(), new THREE.LineBasicMaterial({ color: 0xffe36a })));
    PR.add(pathLine);
    proxy(PR, 0.55, 0.72, 0.5, 0, 0.36, 0.03);
    setLayer(layer);
  },
  mount(panel, ctx) {
    const inp = panel.querySelector<HTMLInputElement>('[data-layer]')!;
    const read = panel.querySelector<HTMLElement>('[data-read]')!;
    const upd = () => {
      setLayer(+inp.value, ctx);
      const z = (layer * LAYER_H).toFixed(1);
      read.textContent = `LAYER ${String(layer).padStart(3, '0')} / ${LAYERS}  ·  Z ${z} mm  ·  ${LAYER_H.toFixed(2)} mm layers`;
      inp.setAttribute('aria-valuetext', `Layer ${layer} of ${LAYERS}, ${z} millimetres`);
    };
    inp.value = String(layer); inp.addEventListener('input', upd); upd();
  }
});
