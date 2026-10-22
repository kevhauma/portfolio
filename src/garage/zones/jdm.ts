// JDM, 1980 to 1990: an AE86-shaped hatch under a dust cover (the garage daydreaming, not a car Kevin
// owns), the AE86 poster in panda paint, and a second poster still waiting for the other favourites.
import * as THREE from 'three';
import { defineZone } from '../zone';
import { add, cyl, lathe, plane, group, V2, lerp, smooth } from '../kit';
import { toon, mat, ROOM } from '../toon';
import { ctex, rr, FT, FB, FM, INKS } from '../paint';

function textures() {
  const poster86 = ctex(512, 704, (x, w, h) => {
    // dusk sky in painted bands
    const bands = ['#2a2450', '#3e2f6a', '#64407e', '#954d86', '#c95f7f', '#ec8173', '#f8a76a', '#fcd08a'];
    const hz = 430;
    bands.forEach((c, i) => { const y0 = i * hz / bands.length; const g = x.createLinearGradient(0, y0, 0, y0 + hz / bands.length + 10); g.addColorStop(0, c); g.addColorStop(1, bands[Math.min(i + 1, bands.length - 1)]); x.fillStyle = g; x.fillRect(0, y0, w, hz / bands.length + 1); });
    x.fillStyle = '#fff0b8'; x.beginPath(); x.arc(330, 380, 70, Math.PI, 0); x.fill();
    const cloud = (cx: number, cy: number, L: number, th: number) => { x.fillStyle = '#5a3d78'; rr(x, cx, cy, L, th, th / 2); x.fill(); x.fillStyle = '#ffb38a'; rr(x, cx + 10, cy + th * 0.62, L - 24, th * 0.38, th * 0.19); x.fill(); };
    cloud(40, 150, 260, 22); cloud(250, 220, 220, 16); cloud(-20, 290, 200, 14);
    // mountain pass silhouettes
    x.fillStyle = '#4c3470'; x.beginPath(); x.moveTo(0, 430); x.lineTo(0, 330); x.lineTo(90, 300); x.lineTo(170, 345); x.lineTo(260, 290); x.lineTo(360, 350); x.lineTo(440, 310); x.lineTo(512, 340); x.lineTo(512, 430); x.fill();
    x.fillStyle = '#2e2150'; x.beginPath(); x.moveTo(0, 430); x.lineTo(0, 380); x.lineTo(120, 360); x.lineTo(230, 395); x.lineTo(340, 370); x.lineTo(512, 400); x.lineTo(512, 430); x.fill();
    // road and guardrail
    x.fillStyle = '#1c1730'; x.fillRect(0, 430, w, 274);
    x.fillStyle = '#2b2445'; x.fillRect(0, 430, w, 20);
    x.strokeStyle = '#c9c3dc'; x.lineWidth = 3; x.beginPath(); x.moveTo(0, 438); x.lineTo(w, 438); x.stroke();
    for (let i = 10; i < w; i += 46) { x.fillStyle = '#c9c3dc'; x.fillRect(i, 436, 4, 18); }
    x.strokeStyle = '#f0e6c8'; x.lineWidth = 5; x.setLineDash([30, 26]); x.beginPath(); x.moveTo(0, 540); x.lineTo(w, 540); x.stroke(); x.setLineDash([]);
    // AE86 Trueno hatch, side profile, panda paint
    const P = [[40, 518], [36, 488], [50, 472], [72, 466], [154, 404], [300, 398], [318, 400], [376, 452], [462, 462], [474, 486], [470, 518]];
    const outline = () => { x.beginPath(); P.forEach(([a, b], i) => i ? x.lineTo(a, b) : x.moveTo(a, b)); x.closePath(); };
    x.lineJoin = 'round';
    outline(); x.fillStyle = '#f6f2ea'; x.fill();
    x.save(); x.clip(); x.fillStyle = '#16131c'; x.fillRect(0, 488, w, 60); x.fillStyle = '#d7d0e6'; x.fillRect(0, 480, w, 3); x.restore();
    outline(); x.lineWidth = 6; x.strokeStyle = INKS; x.stroke();
    x.beginPath(); x.moveTo(98, 458); x.lineTo(160, 412); x.lineTo(296, 408); x.lineTo(346, 456); x.closePath(); x.fillStyle = '#272a4a'; x.fill(); x.lineWidth = 4; x.stroke();
    x.fillStyle = '#f6f2ea'; x.fillRect(232, 408, 9, 50); x.strokeRect(232, 408, 9, 50);
    x.strokeStyle = 'rgba(255,255,255,0.55)'; x.lineWidth = 5; x.beginPath(); x.moveTo(190, 452); x.lineTo(222, 416); x.stroke(); x.beginPath(); x.moveTo(270, 452); x.lineTo(296, 420); x.stroke();
    // closed pop-up headlight edge, tail lamp
    x.strokeStyle = INKS; x.lineWidth = 3; x.beginPath(); x.moveTo(420, 458); x.lineTo(458, 462); x.stroke();
    x.fillStyle = '#e2001a'; x.fillRect(40, 474, 14, 12); x.strokeRect(40, 474, 14, 12);
    for (const cx of [116, 396]) {
      x.fillStyle = '#16131c'; x.beginPath(); x.arc(cx, 518, 46, 0, Math.PI * 2); x.fill(); x.lineWidth = 5; x.strokeStyle = INKS; x.stroke();
      x.fillStyle = '#b9b4c8'; x.beginPath(); x.arc(cx, 518, 26, 0, Math.PI * 2); x.fill(); x.lineWidth = 3; x.stroke();
      x.strokeStyle = '#6d6884'; x.lineWidth = 3; for (let k = 0; k < 8; k++) { const a = k * Math.PI / 4; x.beginPath(); x.moveTo(cx + Math.cos(a) * 7, 518 + Math.sin(a) * 7); x.lineTo(cx + Math.cos(a) * 24, 518 + Math.sin(a) * 24); x.stroke(); }
      x.fillStyle = '#fff'; x.beginPath(); x.arc(cx - 9, 509, 5, 0, Math.PI * 2); x.fill();
    }
    // title card lettering
    x.save(); x.translate(40, 650); x.transform(1, 0, -0.18, 1, 0, 0);
    x.font = FT(400, 92); x.lineJoin = 'round'; x.lineWidth = 14; x.strokeStyle = INKS; x.strokeText('AE86', 0, 0); x.fillStyle = '#fcd08a'; x.fillText('AE86', 0, 0);
    x.restore();
    x.fillStyle = '#E2001A'; x.fillRect(44, 668, 250, 7);
    x.font = FM(400, 18); x.fillStyle = '#d9d2ea'; x.fillText('1983 - 1987  HACHI-ROKU', 46, 694);
    x.lineWidth = 10; x.strokeStyle = '#f2ebdc'; x.strokeRect(5, 5, w - 10, h - 10);
  });
  const posterTBC = ctex(420, 572, (x, w, h) => {
    x.fillStyle = '#2b2440'; x.fillRect(0, 0, w, h);
    x.setLineDash([22, 16]); x.lineWidth = 6; x.strokeStyle = '#ffc27a'; rr(x, 26, 26, w - 52, h - 52, 18); x.stroke(); x.setLineDash([]);
    // a hatch silhouette drawn as a question
    x.strokeStyle = '#ffc27a'; x.lineWidth = 6; x.lineJoin = 'round';
    x.beginPath(); x.moveTo(80, 300); x.lineTo(84, 270); x.lineTo(140, 236); x.lineTo(270, 232); x.lineTo(320, 268); x.lineTo(346, 276); x.lineTo(346, 300); x.closePath(); x.stroke();
    for (const cx of [128, 300]) { x.beginPath(); x.arc(cx, 302, 26, 0, Math.PI * 2); x.stroke(); }
    x.font = FT(400, 44); x.fillStyle = '#ffc27a'; x.textAlign = 'center'; x.fillText('TO FOLLOW', w / 2, 420);
    x.font = FB(500, 22); x.fillText('other favourites', w / 2, 458);
  });
  return { poster86, posterTBC };
}

/** the dust cover: a draped hull over a hatch's side profile, with wheel bulges and hem folds */
function coverGeometry() {
  // side silhouette of the hatch (local x: rear 0 -> nose 4.16), top line only
  const TOP = [[0.0, 0.62], [0.05, 0.8], [0.16, 0.95], [0.6, 1.1], [1.05, 1.25], [1.6, 1.32], [2.15, 1.3], [2.5, 1.14], [2.86, 0.98], [3.1, 0.93], [3.6, 0.86], [3.96, 0.79], [4.12, 0.72], [4.16, 0.6]];
  const tops = new THREE.SplineCurve(TOP.map(q => V2(q[0], q[1]))).getPoints(200);
  const topAt = (x: number) => { for (let i = 1; i < tops.length; i++) if (tops[i].x >= x) { const a = tops[i - 1], b = tops[i]; return lerp(a.y, b.y, (x - a.x) / Math.max(1e-6, b.x - a.x)); } return tops[tops.length - 1].y; };
  const L = 4.16, HEM = 0.36, NU = 140, NV = 56, pos: number[] = [], idx: number[] = [];
  for (let i = 0; i <= NU; i++) {
    const x = i / NU * L, u = (x - L / 2) / (L / 2);
    const plan = Math.pow(Math.max(0, 1 - Math.pow(Math.abs(u), 7)), 0.5);
    const top = topAt(x), H = top - HEM;
    for (let j = 0; j <= NV; j++) {
      const th = Math.PI * (1 - j / NV), c = Math.cos(th), s = Math.sin(th), e = 0.42;
      let z = Math.sign(c) * Math.pow(Math.abs(c), e) * 0.76 * plan;
      let y = HEM + H * Math.pow(s, e * 0.9);
      const low = 1 - smooth(0.0, 0.55, (y - HEM) / Math.max(0.01, H));
      z *= 1 - 0.17 * smooth(0.82, 1.3, y);
      for (const xw of [0.78, 3.18]) z += Math.sign(c) * 0.05 * Math.exp(-((x - xw) ** 2) / 0.09) * low;
      z += Math.sign(c) * (0.018 * Math.sin(x * 7.3 + j * 0.02) + 0.01 * Math.sin(x * 13.1)) * low * plan;
      y += -0.035 * low * (0.5 + 0.5 * Math.sin(x * 5.1 + 1.3)) * (Math.abs(c) > 0.98 ? 1 : 0.4);
      pos.push(x, y, z);
    }
  }
  for (let i = 0; i < NU; i++) for (let j = 0; j < NV; j++) { const a = i * (NV + 1) + j, b = a + NV + 1; idx.push(a, a + 1, b, a + 1, b + 1, b); }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx);
  g.setAttribute('uv', new THREE.Float32BufferAttribute(new Float32Array((NU + 1) * (NV + 1) * 2), 2)); g.computeVertexNormals();
  return g;
}

export default defineZone({
  id: 'jdm',
  ink: 2.0,
  view: { pos: [0.05, 1.75, 1.55], target: [-2.45, 0.98, -0.85] },
  build(gJdm) {
    const T = textures(), RX = ROOM.RX;
    const car = group(gJdm, -2.25, 0, -1.9, -Math.PI / 2);
    const coverM = toon(0x97a1b8, { hi: 0.55, rim: 1 });
    add(car, coverGeometry(), toon(0x97a1b8, { hi: 0.35, rim: 1, side: THREE.DoubleSide }));
    for (const s of [-1, 1]) { const mb = add(car, new THREE.SphereGeometry(0.07, 16, 12), coverM, 2.78, 1.0, s * 0.74); mb.scale.set(1.3, 0.8, 0.7); }
    for (const u of [0.78, 3.18]) for (const s of [-1, 1]) {
      const w = add(car, lathe(Array.from({ length: 19 }, (_, i) => { const t = -Math.PI / 2 + Math.PI * i / 18; return [0.24 + 0.05 * Math.cos(t), 0.09 * Math.sin(t)] as [number, number]; }), 40), mat(0x1c1a22, 0.25), u, 0.29, s * 0.62);
      w.rotation.x = Math.PI / 2;
    }
    plane(gJdm, 0.62, 0.85, toon(0xffffff, { map: T.poster86 }), -RX + 0.012, 1.78, -1.45, Math.PI / 2);
    plane(gJdm, 0.5, 0.68, toon(0xffffff, { map: T.posterTBC }), -RX + 0.012, 1.74, -0.7, Math.PI / 2);
    // red drawing pins in each poster's corners
    for (const [pz, ph, pw] of [[-1.45, 0.85, 0.62], [-0.7, 0.68, 0.5]]) for (const sy of [-1, 1]) for (const sz of [-1, 1])
      cyl(gJdm, 0.008, 0.008, 0.006, 10, mat(0xE2001A, 0.6), -RX + 0.016, 1.76 + sy * (ph / 2 - 0.03), pz + sz * (pw / 2 - 0.03), 0, 0, Math.PI / 2);
  }
});
