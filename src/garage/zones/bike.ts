// Kevin's 2021 Honda CB650R, the hero of the room, on its side stand a little toward the camera.
// Local axes: +x forward, +y up, +z the rider's right (the camera side).
// To do in the bike's own detail pass: the engine block still reads boxy, and the paint is a stand-in grey.
import * as THREE from 'three';
import { defineZone } from '../zone';
import { add, box, rbox, cyl, rod, tube, extr, lathe, plane, group, proxy, V3, UPV, lerp, clamp, smooth } from '../kit';
import { toon, M } from '../toon';
import { ctex, FM } from '../paint';
import { decal } from '../room';

export default defineZone({
  id: 'bike',
  ink: 2.1,
  view: { pos: [1.42, 1.04, 2.9], target: [0.32, 0.6, 0.5] },
  build(gBike, ctx) {
    const dash = ctex(128, 80, (x, w, h) => { x.fillStyle = '#0c0f1c'; x.fillRect(0, 0, w, h); x.strokeStyle = '#3d4a7a'; x.lineWidth = 4; x.beginPath(); x.arc(64, 74, 50, Math.PI * 1.1, Math.PI * 1.9); x.stroke(); x.fillStyle = '#9fb6ff'; x.font = FM(600, 26); x.textAlign = 'center'; x.fillText('0', 64, 64); });
    const grille = ctex(64, 256, (x, w, h) => { x.fillStyle = '#2a2833'; x.fillRect(0, 0, w, h); x.fillStyle = '#121019'; for (let j = 0; j < h; j += 16) x.fillRect(0, j, w, 7); }, true);
    const contact = ctex(128, 128, (x) => { const g = x.createRadialGradient(64, 64, 20, 64, 64, 64); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.55, 'rgba(255,255,255,0.85)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(0, 0, 128, 128); });
    // soft contact shadows under both tyres
    decal(ctx.root, contact, 0.34, 0.22, 1.05, 0.33, 0.3, 0x1a1428, 0.55); decal(ctx.root, contact, 0.38, 0.24, -0.33, 0.75, 0.3, 0x1a1428, 0.55);

    const yaw = group(gBike, 0.35, 0, 0.55, -0.3);
    const B = new THREE.Group(); B.rotation.x = -0.075; yaw.add(B); // leaning onto the side stand
    const paint = toon(0x8f9db2, { hi: 0.9, rim: 1 }), shroudM = toon(0xccd2da, { hi: 0.9, rim: 1 }), blackP = toon(0x2c2b35, { hi: 0.75, rim: 1 });
    const frameM = toon(0x25242c, { hi: 0.55, rim: 1 }), engM = toon(0x35343e, { hi: 0.55, rim: 1 }), alu = toon(0xb4b8c4, { hi: 0.85, rim: 1 });
    const tyreM = toon(0x24222a, { bands: 2, hi: 0.3, rim: 1 }), seatM = toon(0x27252d, { bands: 2, hi: 0.35, rim: 1 }), redM = toon(0xc8202c, { hi: 0.8 }), disc = toon(0xc2c4cc, { hi: 0.9 });
    const RA: [number, number] = [-0.70, 0.315], FA: [number, number] = [0.75, 0.30];

    function wheel(x: number, y: number, R: number, secW: number, rear: boolean) {
      const g = group(B, x, y, 0), rimR = 0.216, hw = secW / 2;
      const prof: [number, number][] = []; for (let i = 0; i <= 28; i++) { const t = -Math.PI / 2 + Math.PI * 2 * i / 28; const cr = Math.cos(t); prof.push([(rimR + R) / 2 + (R - rimR) / 2 * Math.sign(cr) * Math.pow(Math.abs(cr), 0.8), hw * Math.sin(t)]); }
      const tg = lathe(prof, 64); tg.rotateX(Math.PI / 2); add(g, tg, tyreM);
      const rg = lathe([[rimR - 0.016, -hw * 0.82], [rimR + 0.008, -hw * 0.86], [rimR + 0.008, -hw * 0.74], [rimR - 0.006, -hw * 0.6], [rimR - 0.006, hw * 0.6], [rimR + 0.008, hw * 0.74], [rimR + 0.008, hw * 0.86], [rimR - 0.016, hw * 0.82], [rimR - 0.03, hw * 0.8], [rimR - 0.03, -hw * 0.8], [rimR - 0.016, -hw * 0.82]], 64); rg.rotateX(Math.PI / 2); add(g, rg, blackP);
      // ten thin spokes in five pairs
      for (let k = 0; k < 5; k++) for (const s of [-0.12, 0.12]) { const a = k * Math.PI * 2 / 5 + s; const sp = add(g, extr([[0.05, -0.011], [0.205, -0.006], [0.205, 0.006], [0.05, 0.011]], 0.02, 0.003, 1), blackP); sp.rotation.z = a; }
      cyl(g, 0.05, 0.05, secW * 0.7, 24, blackP, 0, 0, 0, Math.PI / 2); cyl(g, 0.018, 0.018, secW * 0.95, 14, alu, 0, 0, 0, Math.PI / 2);
      const rotor = (r: number, z: number, holes: number) => {
        const s = new THREE.Shape(); s.absarc(0, 0, r, 0, Math.PI * 2, false); const h = new THREE.Path(); h.absarc(0, 0, r * 0.7, 0, Math.PI * 2, true); s.holes.push(h);
        for (let i = 0; i < holes; i++) { const a = i / holes * Math.PI * 2, hp = new THREE.Path(); hp.absarc(Math.cos(a) * r * 0.85, Math.sin(a) * r * 0.85, r * 0.035, 0, Math.PI * 2, true); s.holes.push(hp); }
        const gg = new THREE.ExtrudeGeometry(s, { depth: 0.005, bevelEnabled: false, curveSegments: 40 }); gg.translate(0, 0, z - 0.0025); add(g, gg, disc);
        const c = new THREE.Shape(); c.absarc(0, 0, r * 0.72, 0, Math.PI * 2, false); for (let i = 0; i < 5; i++) { const a = (i + 0.5) / 5 * Math.PI * 2, hp = new THREE.Path(); hp.absarc(Math.cos(a) * r * 0.45, Math.sin(a) * r * 0.45, r * 0.14, 0, Math.PI * 2, true); c.holes.push(hp); }
        const cc = new THREE.ExtrudeGeometry(c, { depth: 0.004, bevelEnabled: false, curveSegments: 24 }); cc.translate(0, 0, z - 0.002 + (z > 0 ? -0.004 : 0.004)); add(g, cc, blackP);
      };
      if (!rear) {
        // twin rotors and radial calipers
        for (const z of [-0.07, 0.07]) rotor(0.155, z, 18);
        for (const z of [-0.085, 0.085]) { const a = 2.75; rbox(g, 0.11, 0.045, 0.034, 0.012, toon(0x3a3943, { hi: 0.8 }), Math.cos(a) * 0.135, Math.sin(a) * 0.135, z, 0, 0, a + Math.PI / 2); }
      } else {
        rotor(0.12, 0.072, 12);
        rbox(g, 0.075, 0.04, 0.03, 0.01, toon(0x3a3943, { hi: 0.8 }), Math.cos(4.3) * 0.105, Math.sin(4.3) * 0.105, 0.085, 0, 0, 4.3 + Math.PI / 2);
        const sp = new THREE.Shape(); for (let i = 0; i <= 80; i++) { const a = i / 80 * Math.PI * 2, r = 0.098 + (i % 2 ? 0.0 : 0.007); if (i) sp.lineTo(Math.cos(a) * r, Math.sin(a) * r); else sp.moveTo(Math.cos(a) * r, Math.sin(a) * r); }
        const hh = new THREE.Path(); hh.absarc(0, 0, 0.06, 0, Math.PI * 2, true); sp.holes.push(hh);
        const sg = new THREE.ExtrudeGeometry(sp, { depth: 0.005, bevelEnabled: false, curveSegments: 20 }); sg.translate(0, 0, -0.078); add(g, sg, alu);
      }
      return g;
    }
    wheel(RA[0], RA[1], 0.315, 0.18, true);
    wheel(FA[0], FA[1], 0.30, 0.12, false);

    // upside-down fork, 25 deg rake: thin chrome stanchions low, fat outer tubes high
    const rk = 25 * Math.PI / 180, fd = [-Math.sin(rk), Math.cos(rk)];
    const at = (s: number): [number, number] => [FA[0] + fd[0] * s, FA[1] + fd[1] * s];
    for (const z of [-0.105, 0.105]) {
      const a = at(0.02), b = at(0.36), c = at(0.3), d = at(0.82);
      rod(B, [a[0], a[1], z], [b[0], b[1], z], 0.021, M.chrome, 18);
      rod(B, [c[0], c[1], z], [d[0], d[1], z], 0.03, toon(0x2e2d36, { hi: 0.9, rim: 1 }), 20);
      rbox(B, 0.06, 0.07, 0.04, 0.012, blackP, FA[0] - 0.005, FA[1] + 0.01, z, 0, 0, rk);
      cyl(B, 0.03, 0.03, 0.012, 18, alu, d[0], d[1] + 0.006, z, 0, 0, rk);
    }
    for (const s of [0.6, 0.79]) { const p = at(s); rbox(B, 0.075, 0.03, 0.3, 0.01, alu, p[0], p[1], 0, 0, 0, rk); }
    add(B, new THREE.TorusGeometry(0.335, 0.03, 8, 28, 1.25), blackP, FA[0], FA[1], 0, 0, 0, 0.35).scale.z = 2.2;
    // round headlight: housing, bezel, LED ring and bar
    const HL = [0.64, 0.83];
    const hl = group(B, HL[0], HL[1], 0); hl.rotation.z = -0.08;
    const bowl = lathe([[0.001, -0.07], [0.05, -0.066], [0.08, -0.045], [0.097, -0.012], [0.1, 0.02], [0.1, 0.045]], 40); bowl.rotateZ(-Math.PI / 2); add(hl, bowl, blackP);
    add(hl, new THREE.TorusGeometry(0.096, 0.01, 10, 48), blackP, 0.045, 0, 0, 0, Math.PI / 2, 0);
    add(hl, new THREE.CircleGeometry(0.088, 48), toon(0xdfe9ff, { emis: 0.55 }), 0.048, 0, 0, 0, Math.PI / 2, 0).userData.noHull = true;
    add(hl, new THREE.TorusGeometry(0.072, 0.0055, 8, 48), toon(0xffffff, { emis: 1 }), 0.05, 0, 0, 0, Math.PI / 2, 0);
    add(hl, new THREE.CircleGeometry(0.045, 36), M.lens, 0.051, 0, 0, 0, Math.PI / 2, 0).userData.noHull = true;
    rbox(hl, 0.006, 0.01, 0.1, 0.003, toon(0xffffff, { emis: 1 }), 0.053, 0, 0);
    for (const z of [-0.105, 0.105]) { const p = at(0.56); rod(B, [p[0], p[1], z], [HL[0] - 0.03, HL[1] + 0.02, z * 0.85], 0.008, frameM, 8); }
    for (const z of [-0.14, 0.14]) { rod(B, [0.6, 0.9, z * 0.75], [0.6, 0.9, z], 0.006, frameM, 8); rbox(B, 0.04, 0.022, 0.022, 0.008, toon(0xff9a2a, { emis: 0.35 }), 0.615, 0.9, z * 1.1); }
    // instruments, bars, mirrors
    const tcp = at(0.82); rbox(B, 0.06, 0.055, 0.11, 0.01, toon(0x15141a, { hi: 0.6 }), tcp[0] + 0.02, tcp[1] + 0.05, 0, 0, 0, 0.5);
    { const dp = plane(B, 0.085, 0.05, toon(0xffffff, { map: dash, emis: 0.9 }), tcp[0], tcp[1] + 0.07, 0); dp.rotation.order = 'YXZ'; dp.rotation.set(-1.0, -Math.PI / 2, 0); }
    tube(B, [[0.37, 1.085, -0.37], [0.4, 1.07, -0.18], [0.41, 1.065, 0], [0.4, 1.07, 0.18], [0.37, 1.085, 0.37]], 0.011, M.chromeDark, 30, 10);
    for (const s of [-1, 1]) {
      cyl(B, 0.017, 0.017, 0.12, 14, toon(0x17161b, { bands: 2, hi: 0.3 }), 0.37, 1.087, s * 0.33, Math.PI / 2);
      rbox(B, 0.03, 0.035, 0.05, 0.008, blackP, 0.38, 1.085, s * 0.24);
      box(B, 0.12, 0.008, 0.012, M.chromeDark, 0.43, 1.08, s * 0.27, 0, s * 0.25, 0);
      rod(B, [0.38, 1.09, s * 0.25], [0.35, 1.25, s * 0.31], 0.006, frameM, 8);
      rbox(B, 0.03, 0.06, 0.12, 0.014, blackP, 0.345, 1.275, s * 0.34, 0, 0, 0.1);
    }
    // radiator behind the shroud cheeks
    rbox(B, 0.05, 0.27, 0.37, 0.01, toon(0x1d1c22, { hi: 0.4 }), 0.47, 0.63, 0, 0, 0, 0.24);
    { const gr = plane(B, 0.34, 0.24, toon(0xffffff, { map: grille, repeat: [1, 3] }), 0.498, 0.63, 0); gr.rotation.order = 'ZYX'; gr.rotation.set(0, Math.PI / 2, 0.24); }
    // inline-four: crankcase, inclined block with fins, head, covers
    const crank = [0.08, 0.42];
    rbox(B, 0.46, 0.24, 0.4, 0.04, engM, 0.1, 0.4, 0); rbox(B, 0.36, 0.09, 0.3, 0.03, engM, 0.08, 0.25, 0);
    const ax = [Math.sin(0.52), Math.cos(0.52)], AT = (s: number, n = 0): [number, number] => [crank[0] + ax[0] * s + ax[1] * n, crank[1] + ax[1] * s - ax[0] * n];
    { const p = AT(0.2); rbox(B, 0.2, 0.17, 0.42, 0.02, engM, p[0], p[1], 0, 0, 0, -0.52); }
    for (let i = 0; i < 5; i++) { const p = AT(0.135 + i * 0.03); rbox(B, 0.218, 0.009, 0.44, 0.003, toon(0x484853, { hi: 0.7 }), p[0], p[1], 0, 0, 0, -0.52); }
    { const p = AT(0.32); rbox(B, 0.19, 0.085, 0.42, 0.025, toon(0x3c3c46, { hi: 0.7, rim: 1 }), p[0], p[1], 0, 0, 0, -0.52); }
    { const p = AT(0.375); rbox(B, 0.16, 0.05, 0.38, 0.02, toon(0x17161b, { hi: 0.7 }), p[0], p[1], 0, 0, 0, -0.52); for (let i = 0; i < 4; i++) rbox(B, 0.12, 0.012, 0.022, 0.004, alu, p[0], p[1] + 0.024, -0.135 + i * 0.09, 0, 0, -0.52); }
    { const cc = lathe([[0.001, 0.0], [0.09, 0.0], [0.105, 0.012], [0.105, 0.03], [0.08, 0.045], [0.001, 0.05]], 40); cc.rotateX(Math.PI / 2); add(B, cc, alu, -0.02, 0.4, 0.2); }
    { const ac = lathe([[0.001, 0.0], [0.06, 0.0], [0.07, 0.01], [0.065, 0.035], [0.001, 0.04]], 32); ac.rotateX(-Math.PI / 2); add(B, ac, alu, 0.06, 0.37, -0.2); }
    cyl(B, 0.035, 0.035, 0.05, 20, toon(0x1e1d24, { hi: 0.7 }), 0.27, 0.27, 0.06, 0, 0, -0.3);
    // four headers: the waterfall down the front, under the engine to the stubby muffler
    for (const z of [-0.135, -0.045, 0.045, 0.135]) {
      const port = AT(0.3, 0.1);
      tube(B, [[port[0], port[1], z], [0.42, 0.56, z * 1.04], [0.455, 0.4, z * 1.0 + 0.01], [0.41, 0.22, z * 0.82 + 0.03], [0.27, 0.135, z * 0.5 + 0.05], [0.08, 0.125, z * 0.26 + 0.07], [-0.05, 0.135, 0.085]], 0.0175, M.chrome, 72, 12);
    }
    rbox(B, 0.2, 0.085, 0.2, 0.03, toon(0x2c2b33, { hi: 0.7 }), -0.03, 0.14, 0.06);
    { const mf = lathe([[0.001, 0], [0.05, 0.0], [0.058, 0.04], [0.056, 0.26], [0.046, 0.3], [0.001, 0.3]], 32); const o = add(B, mf, toon(0x2f2e37, { hi: 0.9, rim: 1 })); o.position.set(-0.08, 0.15, 0.12); o.quaternion.setFromUnitVectors(UPV, V3(-0.42 + 0.08, 0.28 - 0.15, 0.19 - 0.12).normalize()); }
    rod(B, [-0.36, 0.25, 0.18], [-0.42, 0.272, 0.192], 0.04, M.chrome, 24, 0.034);
    // frame (steel diamond) and the double-sided swingarm
    for (const z of [-0.13, 0.13]) {
      tube(B, [[0.44, 0.96, z * 0.5], [0.27, 0.91, z], [0.06, 0.83, z], [-0.11, 0.72, z], [-0.17, 0.55, z], [-0.15, 0.43, z]], 0.018, frameM, 40, 10);
      tube(B, [[0.44, 0.93, z * 0.4], [0.37, 0.8, z * 0.9], [0.32, 0.7, z]], 0.016, frameM, 16, 10);
      tube(B, [[-0.12, 0.74, z * 0.9], [-0.4, 0.8, z * 0.8], [-0.68, 0.86, z * 0.6]], 0.012, frameM, 20, 8);
      add(B, extr([[-0.22, 0.36], [-0.1, 0.38], [-0.08, 0.62], [-0.16, 0.66], [-0.24, 0.5]], 0.012, 0.004, 1), alu, 0, 0, z * 1.08);
      const a = [-0.15, 0.44], b = RA, dx = b[0] - a[0], dy = b[1] - a[1], ang = Math.atan2(dy, dx), len = Math.hypot(dx, dy);
      const sa = add(B, extr([[0, -0.045], [len, -0.022], [len + 0.03, 0], [len, 0.022], [0, 0.04], [-0.03, 0]], 0.04, 0.008, 2), toon(0x2a2930, { hi: 0.8, rim: 1 }), a[0], a[1], z * 1.05); sa.rotation.z = ang;
      cyl(B, 0.022, 0.022, 0.03, 14, alu, b[0], b[1], z * 1.12, Math.PI / 2);
    }
    rbox(B, 0.06, 0.05, 0.27, 0.01, toon(0x2a2930, { hi: 0.6 }), -0.3, 0.41, 0);
    // rear shock with its red spring
    rod(B, [-0.33, 0.4, 0], [-0.2, 0.67, 0], 0.012, M.chromeDark, 12);
    {
      const A = V3(-0.31, 0.44, 0), Bv = V3(-0.22, 0.63, 0), axv = Bv.clone().sub(A), Lh = axv.length(); axv.normalize();
      const u = V3(0, 0, 1), v = u.clone().cross(axv).normalize(); const pts: THREE.Vector3[] = [];
      for (let i = 0; i <= 140; i++) { const t = i / 140, th = t * Math.PI * 2 * 8; pts.push(A.clone().addScaledVector(axv, t * Lh).addScaledVector(u, Math.cos(th) * 0.028).addScaledVector(v, Math.sin(th) * 0.028)); }
      add(B, new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 400, 0.0055, 6), redM);
    }
    // chain on the left, sprocket to sprocket
    {
      const fs = [-0.07, 0.37], rf = 0.04, rr2 = 0.1, z = -0.088, pts: THREE.Vector3[] = [];
      for (const a of [90, 45, 0, -45, -90]) pts.push(V3(fs[0] + Math.cos(a * Math.PI / 180) * rf, fs[1] + Math.sin(a * Math.PI / 180) * rf, z));
      for (const a of [270, 225, 180, 135, 90]) pts.push(V3(RA[0] + Math.cos(a * Math.PI / 180) * rr2, RA[1] + Math.sin(a * Math.PI / 180) * rr2, z));
      add(B, new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts, true, 'centripetal'), 160, 0.0065, 6, true), toon(0x3a3640, { hi: 0.8 }));
    }
    // tank (sculpted) with its shrouds
    const tg = extr([[0.42, 0.97], [0.32, 1.05], [0.15, 1.078], [0.0, 1.072], [-0.12, 1.035], [-0.21, 0.955], [-0.17, 0.86], [0.06, 0.84], [0.3, 0.86], [0.42, 0.92]], 0.26, 0.045, 4, true);
    { const p = tg.attributes.position; for (let i = 0; i < p.count; i++) { const x = p.getX(i), y = p.getY(i); p.setZ(i, p.getZ(i) * lerp(1, 0.72, clamp((0.42 - x) / 0.63, 0, 1)) * (1 - 0.28 * smooth(0.86, 1.08, y))); } tg.computeVertexNormals(); }
    add(B, tg, paint);
    for (const s of [-1, 1]) {
      const shg = extr([[0.45, 0.975], [0.3, 1.0], [0.08, 0.83], [0.22, 0.69], [0.46, 0.79]], 0.012, 0.005, 2, true);
      { const p = shg.attributes.position; for (let i = 0; i < p.count; i++) { const y = p.getY(i), x = p.getX(i); p.setZ(i, p.getZ(i) - s * (0.32 * ((y - 0.84) ** 2) + 0.02 * smooth(0.3, 0.08, x))); } shg.computeVertexNormals(); }
      add(B, shg, shroudM, 0, 0, s * 0.178).rotation.y = s * -0.1;
      add(B, extr([[0.41, 0.925], [0.28, 0.945], [0.17, 0.835], [0.27, 0.755], [0.42, 0.82]], 0.006, 0.002, 1), toon(0x17161b, { hi: 0.5 }), 0.004, 0, s * 0.19, 0, s * -0.1, 0);
    }
    // seat (rider and pillion step), side covers, short tail, plate hanger
    add(B, extr([[-0.19, 0.95], [-0.28, 0.89], [-0.5, 0.885], [-0.56, 0.92], [-0.77, 0.94], [-0.8, 0.915], [-0.78, 0.865], [-0.26, 0.835]], 0.21, 0.032, 3), seatM);
    for (const s of [-1, 1]) add(B, extr([[-0.2, 0.84], [-0.56, 0.86], [-0.5, 0.75], [-0.24, 0.72]], 0.01, 0.004, 1), paint, 0, 0, s * 0.13);
    add(B, extr([[-0.62, 0.83], [-0.8, 0.88], [-0.97, 0.965], [-0.99, 0.94], [-0.84, 0.845], [-0.66, 0.79]], 0.11, 0.022, 2), paint);
    rbox(B, 0.02, 0.024, 0.08, 0.006, toon(0xe0303a, { emis: 0.7 }), -0.985, 0.95, 0);
    rod(B, [-0.86, 0.84, 0], [-0.97, 0.64, 0], 0.012, frameM, 8);
    rbox(B, 0.006, 0.11, 0.17, 0.003, toon(0xf2efe8), -0.985, 0.6, 0, 0, 0, 0.12);
    for (const s of [-1, 1]) rbox(B, 0.035, 0.016, 0.016, 0.005, toon(0xff9a2a, { emis: 0.35 }), -0.91, 0.79, s * 0.1);
    add(B, new THREE.TorusGeometry(0.33, 0.022, 8, 24, 0.9), blackP, RA[0], RA[1], 0, 0, 0, 0.85).scale.z = 2.6;
    // pegs, rearsets, side stand
    for (const s of [-1, 1]) {
      add(B, extr([[-0.26, 0.32], [-0.12, 0.33], [-0.1, 0.42], [-0.2, 0.44], [-0.5, 0.48], [-0.52, 0.42]], 0.008, 0.003, 1), alu, 0, 0, s * 0.175);
      cyl(B, 0.012, 0.012, 0.09, 12, M.chromeDark, -0.2, 0.35, s * 0.22, Math.PI / 2); cyl(B, 0.01, 0.01, 0.07, 12, M.chromeDark, -0.47, 0.43, s * 0.2, Math.PI / 2);
    }
    rod(B, [-0.17, 0.34, 0.2], [-0.02, 0.3, 0.21], 0.006, alu, 8);
    rod(B, [-0.08, 0.3, -0.14], [-0.03, 0.0, -0.29], 0.011, frameM, 8);
    proxy(B, 2.1, 1.3, 0.9, 0.0, 0.62, 0);
  }
});
