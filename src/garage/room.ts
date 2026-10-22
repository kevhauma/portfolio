// The room itself: slab, block walls, roof beams, the high window with its painted dusk outside,
// the bench wall with pegboard and tools, the desk, the corner rack and the two enamel lamps.
import * as THREE from 'three';
import { ctex, rngf, rr, INKS } from './paint';
import { toon, mat, M, ROOM, WIN } from './toon';
import { add, box, rbox, cyl, rod, extr, ni, lathe, plane, group, fx, noShadow, V2, V3, lerp } from './kit';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { shared } from './paint';

const { RX, RZB, RZF, RH } = ROOM;

function paintSky(night: boolean) {
  return (x: CanvasRenderingContext2D, w: number, h: number) => {
    const bands = night ? ['#0d0c22', '#121230', '#18183e', '#1f1f4a', '#272656', '#302c5e', '#3a3263', '#433866']
      : ['#262150', '#33296a', '#4a337c', '#6c3f88', '#9a4f8c', '#c8628a', '#ec8478', '#f8ad74', '#fdd59a'];
    const hz = h * 0.8, bh = hz / bands.length;
    bands.forEach((c, i) => { const g = x.createLinearGradient(0, i * bh, 0, (i + 1) * bh); g.addColorStop(0, c); g.addColorStop(0.75, c); g.addColorStop(1, bands[Math.min(i + 1, bands.length - 1)]); x.fillStyle = g; x.fillRect(0, i * bh, w, bh + 1); });
    x.fillStyle = bands[bands.length - 1]; x.fillRect(0, hz, w, h - hz);
    const r = rngf(night ? 5 : 3);
    if (night) {
      x.fillStyle = '#ffffff'; for (let i = 0; i < 140; i++) { const s = r() < 0.12 ? 2.4 : 1.2; x.globalAlpha = 0.4 + r() * 0.6; x.beginPath(); x.arc(r() * w, r() * hz * 0.85, s, 0, Math.PI * 2); x.fill(); } x.globalAlpha = 1;
      x.fillStyle = '#f4eecf'; x.beginPath(); x.ellipse(w * 0.5, h * 0.3, 14, 28, 0, 0, Math.PI * 2); x.fill(); x.fillStyle = bands[2]; x.beginPath(); x.ellipse(w * 0.5 + 6, h * 0.3 - 6, 12, 25, 0, 0, Math.PI * 2); x.fill();
    } else { x.fillStyle = '#fff3d2'; x.beginPath(); x.ellipse(w * 0.5, hz + 6, 46, 92, 0, Math.PI, 0); x.fill(); x.fillStyle = '#fffbe8'; x.beginPath(); x.arc(w * 0.3, h * 0.14, 3, 0, Math.PI * 2); x.fill(); }
    // long cloud strips, lit from below by the set sun
    const cl = night ? ['#22204a', '#3b3666'] : ['#5b3f7e', '#ffb08a'];
    for (let i = 0; i < 13; i++) {
      const cy = hz * (0.18 + r() * 0.62), L = 220 + r() * 420, th = 14 + r() * 22, cx = r() * w - 80;
      x.fillStyle = cl[0]; rr(x, cx, cy, L, th, th / 2); x.fill();
      x.fillStyle = cl[1]; rr(x, cx + th * 0.6, cy + th * 0.6, L - th * 1.4, th * 0.4, th * 0.2); x.fill();
    }
  };
}

function textures() {
  const floor = ctex(1024, 1024, (x, w, h) => {
    x.fillStyle = '#ffffff'; x.fillRect(0, 0, w, h);
    const r = rngf(41);
    // painted mottling: a few broad, soft-edged washes, background-painter style
    for (let i = 0; i < 26; i++) {
      const cx = r() * w, cy = r() * h, R = 60 + r() * 170, g = x.createRadialGradient(cx, cy, R * 0.55, cx, cy, R);
      const dark = r() < 0.6; g.addColorStop(0, dark ? 'rgba(120,104,120,0.10)' : 'rgba(255,248,236,0.18)'); g.addColorStop(1, 'rgba(0,0,0,0)');
      x.fillStyle = g; x.beginPath(); x.arc(cx, cy, R, 0, Math.PI * 2); x.fill();
    }
    // saw-cut joints of the slab, and a few hairline cracks
    x.strokeStyle = 'rgba(70,52,80,0.38)'; x.lineWidth = 3;
    for (const k of [1 / 3, 2 / 3]) { x.beginPath(); x.moveTo(k * w, 0); x.lineTo(k * w, h); x.stroke(); x.beginPath(); x.moveTo(0, k * h); x.lineTo(w, k * h); x.stroke(); }
    x.strokeStyle = 'rgba(70,52,80,0.22)'; x.lineWidth = 1.5;
    for (let i = 0; i < 5; i++) { let px = r() * w, py = r() * h; x.beginPath(); x.moveTo(px, py); for (let k = 0; k < 6; k++) { px += (r() - 0.5) * 70; py += 10 + r() * 30; x.lineTo(px, py); } x.stroke(); }
  });
  const wall = ctex(512, 256, (x, w, h) => {
    x.fillStyle = '#ffffff'; x.fillRect(0, 0, w, h);
    const r = rngf(9);
    for (let row = 0; row < 4; row++) for (let col = -1; col < 4; col++) {
      const bx = col * 128 + (row % 2) * 64, by = row * 64;
      if (r() < 0.35) { x.fillStyle = `rgba(${r() < 0.5 ? '255,250,240' : '150,130,150'},${0.06 + r() * 0.08})`; x.fillRect(bx + 3, by + 3, 122, 58); }
    }
    x.strokeStyle = 'rgba(110,88,104,0.55)'; x.lineWidth = 3;
    for (let row = 0; row <= 4; row++) { x.beginPath(); x.moveTo(0, row * 64); x.lineTo(w, row * 64); x.stroke(); }
    for (let row = 0; row < 4; row++) for (let col = 0; col <= 4; col++) { const bx = col * 128 + (row % 2) * 64; x.beginPath(); x.moveTo(bx, row * 64); x.lineTo(bx, row * 64 + 64); x.stroke(); }
  }, true);
  const peg = ctex(1024, 330, (x, w, h) => {
    x.fillStyle = '#c99867'; x.fillRect(0, 0, w, h);
    const g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, 'rgba(255,236,200,0.18)'); g.addColorStop(1, 'rgba(60,30,40,0.12)'); x.fillStyle = g; x.fillRect(0, 0, w, h);
    x.fillStyle = '#3b2420';
    for (let j = 11; j < h - 6; j += 18.3) for (let i = 9; i < w - 6; i += 18.3) { x.beginPath(); x.arc(i, j, 2.8, 0, Math.PI * 2); x.fill(); }
    // shadow-board outline where the spanners hang
    x.strokeStyle = 'rgba(40,20,30,0.28)'; x.lineWidth = 3; x.strokeRect(36, 36, 160, 190);
    // a small livery sticker, the garage's one nod to the rest of the kit
    x.save(); x.translate(820, 236); x.rotate(-0.06);
    rr(x, 0, 0, 120, 58, 8); x.fillStyle = '#13254F'; x.fill(); x.lineWidth = 4; x.strokeStyle = INKS; x.stroke();
    x.fillStyle = '#E2001A'; x.fillRect(4, 34, 112, 9); x.fillStyle = '#00843D'; x.fillRect(4, 43, 112, 6); x.fillStyle = '#F7F8FA'; x.fillRect(4, 31, 112, 3);
    x.restore();
  });
  const town = ctex(2048, 512, (x, w, h) => {
    // rooftops, a utility pole and its wires: the near multiplane layer
    x.clearRect(0, 0, w, h);
    const r = rngf(12);
    x.fillStyle = '#1b1533';
    let px = 0; x.beginPath(); x.moveTo(0, h);
    while (px < w) { const bw = 50 + r() * 90, bh = 120 + r() * 110; x.lineTo(px, h - bh); if (r() < 0.5) x.lineTo(px + bw / 2, h - bh - 34); x.lineTo(px + bw, h - bh); px += bw; }
    x.lineTo(w, h); x.closePath(); x.fill();
    x.fillStyle = '#ffcf7a'; for (let i = 0; i < 22; i++) { x.globalAlpha = 0.65 + r() * 0.35; x.fillRect(r() * w, h - 40 - r() * 90, 10, 13); } x.globalAlpha = 1;
    x.fillStyle = '#120e24'; x.fillRect(1100, 30, 12, h); x.fillRect(1060, 80, 92, 10); x.fillRect(1074, 126, 64, 8);
    x.strokeStyle = '#120e24'; x.lineWidth = 3;
    for (const [y0, y1] of [[84, 140], [86, 170], [130, 196]]) { x.beginPath(); x.moveTo(0, y1); x.quadraticCurveTo(550, y0 + 80, 1106, y0); x.quadraticCurveTo(1600, y0 + 70, w, y1 - 20); x.stroke(); }
  });
  const stain = ctex(256, 256, (x) => {
    const r = rngf(77); x.fillStyle = '#fff';
    x.beginPath(); for (let i = 0; i <= 28; i++) { const a = i / 28 * Math.PI * 2, R = 92 + (r() - 0.5) * 44 + Math.sin(a * 3) * 12; x.lineTo(128 + Math.cos(a) * R, 128 + Math.sin(a) * R * 0.62); } x.closePath(); x.fill();
    for (let k = 0; k < 4; k++) { x.beginPath(); x.ellipse(40 + r() * 176, 50 + r() * 156, 8 + r() * 12, 6 + r() * 8, 0, 0, Math.PI * 2); x.fill(); }
  });
  return { floor, wall, peg, town, stain, skyDay: ctex(2048, 512, paintSky(false)), skyNight: ctex(2048, 512, paintSky(true)) };
}

/** a painted floor decal: oil stains, soft contact shadows */
export function decal(root: THREE.Object3D, tex: THREE.Texture, w: number, d: number, x: number, z: number, ry: number, col: number, a: number) {
  const o = fx(add(root, new THREE.PlaneGeometry(w, d), new THREE.MeshBasicMaterial({ map: tex, color: col, transparent: true, opacity: a, depthWrite: false }), x, 0.003, z, -Math.PI / 2, 0, 0));
  o.rotation.z = ry; return o;
}

export function buildRoom(env: THREE.Group, root: THREE.Group) {
  const T = textures();
  const floorM = toon(0xb6a898, { map: T.floor }), wallM = toon(0xdac9ad, { map: T.wall, repeat: [5, 2.1], grad: 1 });
  const bulbM = toon(0xffe2a8, { emis: 1 });
  const halos: THREE.Sprite[] = [];

  plane(env, 6.4, 6.4, floorM, 0, 0, 0.8).rotation.x = -Math.PI / 2;
  plane(env, 6.4, RH, wallM, 0, RH / 2, RZB);
  plane(env, 6.4, RH, wallM, -RX, RH / 2, 0.8, Math.PI / 2);
  { // right wall with the small high window cut out
    const s = new THREE.Shape([V2(RZB, 0), V2(RZF, 0), V2(RZF, RH), V2(RZB, RH)]);
    s.holes.push(new THREE.Path([V2(WIN.z - WIN.w / 2, WIN.y - WIN.h / 2), V2(WIN.z - WIN.w / 2, WIN.y + WIN.h / 2), V2(WIN.z + WIN.w / 2, WIN.y + WIN.h / 2), V2(WIN.z + WIN.w / 2, WIN.y - WIN.h / 2)]));
    const g = new THREE.ShapeGeometry(s); const uv = g.attributes.uv, p = g.attributes.position;
    for (let i = 0; i < uv.count; i++) uv.setXY(i, (p.getX(i) - RZB) / 6.4, p.getY(i) / RH);
    add(env, g, wallM, RX, 0, 0, 0, -Math.PI / 2, 0).userData.noHull = true;
  }
  const beam = toon(0x8a6446);
  plane(env, 6.4, 6.4, toon(0x4f3b33, { bands: 2 }), 0, RH, 0.8).rotation.x = Math.PI / 2;
  for (let x = -2.8; x <= 2.81; x += 0.8) box(env, 0.08, 0.16, 6.4, beam, x, RH - 0.08, 0.8);
  for (const z of [-1.2, 1.4, 3.6]) box(env, 6.4, 0.12, 0.1, beam, 0, RH - 0.22, z);
  // conduit and junction boxes
  rod(env, [-RX, 2.42, RZB + 0.04], [RX, 2.42, RZB + 0.04], 0.012, M.galv, 8);
  rbox(env, 0.09, 0.09, 0.05, 0.008, M.galv, -0.45, 2.42, RZB + 0.03); rbox(env, 0.09, 0.09, 0.05, 0.008, M.galv, 1.45, 2.42, RZB + 0.03);
  rod(env, [1.95, 2.42, RZB + 0.04], [1.95, 1.06, RZB + 0.04], 0.01, M.galv, 8);
  rbox(env, 0.08, 0.11, 0.04, 0.008, mat(0xebe5d8), 1.95, 1.0, RZB + 0.02);
  // window: jambs through the wall, sill, cross mullion
  const fr = mat(0x5d4d58, 0.2), wx = RX + 0.02;
  box(env, 0.14, 0.05, WIN.w + 0.1, fr, wx, WIN.y + WIN.h / 2 + 0.025, WIN.z); box(env, 0.2, 0.04, WIN.w + 0.16, fr, wx - 0.03, WIN.y - WIN.h / 2 - 0.02, WIN.z);
  for (const s of [-1, 1]) box(env, 0.14, WIN.h + 0.1, 0.05, fr, wx, WIN.y, WIN.z + s * (WIN.w / 2 + 0.025));
  box(env, 0.03, WIN.h, 0.025, fr, wx + 0.03, WIN.y, WIN.z); box(env, 0.03, 0.025, WIN.w, fr, wx + 0.03, WIN.y + 0.04, WIN.z);
  // lamps: green enamel shades, visible bulbs (their light is in the cel shader)
  for (const [lx, lz] of [[-0.45, -0.8], [0.7, 0.95]]) {
    noShadow(rod(env, [lx, RH - 0.16, lz], [lx, 2.42, lz], 0.005, mat(0x1d1a22), 6));
    noShadow(add(env, lathe([[0.172, 0.0], [0.16, 0.012], [0.1, 0.05], [0.05, 0.1], [0.03, 0.125], [0.012, 0.13]], 36), toon(0x3f7a5e, { hi: 0.7, side: THREE.DoubleSide }), lx, 2.29, lz));
    noShadow(cyl(env, 0.022, 0.026, 0.03, 16, mat(0x2a2730), lx, 2.4, lz));
    noShadow(add(env, new THREE.SphereGeometry(0.042, 20, 14), bulbM, lx, 2.3, lz)).userData.noHull = true;
    const halo = fx(new THREE.Sprite(new THREE.SpriteMaterial({ map: shared.glow, color: 0xffc98a, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0.7 })));
    halo.position.set(lx, 2.27, lz); halo.scale.set(0.42, 0.42, 1); env.add(halo); halos.push(halo);
  }

  buildBench(env, T.peg);

  /* outside the window: the painted multiplane, and painted glass */
  const skyMat = new THREE.ShaderMaterial({
    uniforms: { tA: { value: T.skyDay }, tB: { value: T.skyNight }, uN: { value: 0 } }, depthWrite: true,
    vertexShader: `varying vec2 vU; void main(){ vU = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.); }`,
    fragmentShader: `uniform sampler2D tA; uniform sampler2D tB; uniform float uN; varying vec2 vU; void main(){ gl_FragColor = vec4(mix(texture2D(tA, vU).rgb, texture2D(tB, vU).rgb, uN), 1.); }`
  });
  const SKY0 = V3(RX + 1.7, 1.9, WIN.z - 1.6), TOWN0 = V3(RX + 0.75, 1.8, WIN.z - 1.2);
  const sky = fx(add(root, new THREE.PlaneGeometry(13, 3.3), skyMat, SKY0.x, SKY0.y, SKY0.z, 0, -Math.PI / 2, 0));
  const townMat = new THREE.MeshBasicMaterial({ map: T.town, transparent: true, alphaTest: 0.02, depthWrite: false });
  const town = fx(add(root, new THREE.PlaneGeometry(6.4, 1.6), townMat, TOWN0.x, TOWN0.y, TOWN0.z, 0, -Math.PI / 2, 0));
  for (const [dz, dy, w] of [[-0.18, 0.06, 0.05], [-0.1, 0.02, 0.025], [0.2, -0.02, 0.04]]) {
    const g = fx(add(root, new THREE.PlaneGeometry(w, WIN.h * 0.9), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.16, depthWrite: false }), RX + 0.03, WIN.y + dy, WIN.z + dz, 0, -Math.PI / 2, 0));
    g.rotation.z = 0.5;
  }
  decal(root, T.stain, 0.9, 0.5, 0.25, 0.62, 0.3, 0x2b2238, 0.45); decal(root, T.stain, 0.4, 0.3, -1.3, -1.2, 1.1, 0x2b2238, 0.3); decal(root, T.stain, 0.3, 0.22, 1.9, 1.8, 0.4, 0x2b2238, 0.25);

  return {
    /** the painted sky slides further than the room, the rooftops a little less (multiplane) */
    parallax(px: number, py: number, m: number) {
      sky.position.set(SKY0.x, SKY0.y + py * 0.16 * m, SKY0.z - px * 0.55 * m);
      town.position.set(TOWN0.x, TOWN0.y + py * 0.06 * m, TOWN0.z - px * 0.22 * m);
    },
    /** night: the sky outside. lamps: 1 on, 0 off. */
    light(night: number, lamps: number) {
      skyMat.uniforms.uN.value = night; townMat.color.setScalar(1 - 0.35 * night);
      bulbM.uniforms.uLit.value.setRGB(lerp(0.32, 1, lamps), lerp(0.28, 0.89, lamps), lerp(0.3, 0.66, lamps));
      for (const h of halos) { h.material.opacity = 0.7 * lamps; h.visible = lamps > 0.01; }
    }
  };
}

/* bench, pegboard and its tools, tool chest, desk, and the rack in the back-left corner */
function buildBench(env: THREE.Group, pegTex: THREE.Texture) {
  const bench = new THREE.Group(); env.add(bench);
  rbox(bench, 2.8, 0.05, 0.64, 0.01, M.wood, -0.3, 0.895, -2.08);
  for (const x of [-1.66, 1.06]) for (const z of [-2.36, -1.8]) box(bench, 0.05, 0.87, 0.05, M.steelDark, x, 0.435, z);
  rbox(bench, 2.7, 0.03, 0.5, 0.006, M.ply, -0.3, 0.18, -2.1);
  box(bench, 2.76, 0.06, 0.03, M.steelDark, -0.3, 0.84, -1.775);
  // a few things living on the bottom shelf
  rbox(bench, 0.36, 0.2, 0.28, 0.02, mat(0x8a3a2a, 0.4), -1.2, 0.295, -2.12); rbox(bench, 0.3, 0.16, 0.26, 0.02, mat(0x3c5a8a, 0.4), 0.05, 0.275, -2.1);
  cyl(bench, 0.07, 0.07, 0.2, 20, mat(0xc9a43a, 0.5), -0.55, 0.295, -2.1); cyl(bench, 0.05, 0.05, 0.12, 16, mat(0x2d6a4a, 0.5), -0.4, 0.255, -2.06);
  // vice at the front edge
  const vm = mat(0x2d4a6e, 0.6);
  rbox(bench, 0.13, 0.08, 0.15, 0.01, vm, -0.2, 0.96, -1.84); rbox(bench, 0.17, 0.06, 0.035, 0.008, vm, -0.2, 0.965, -1.75); rbox(bench, 0.17, 0.06, 0.035, 0.008, vm, -0.2, 0.965, -1.93);
  rod(bench, [-0.2, 0.95, -1.74], [-0.2, 0.95, -1.66], 0.008, M.chrome, 10); rod(bench, [-0.3, 0.95, -1.66], [-0.1, 0.95, -1.66], 0.005, M.chrome, 8);
  // pegboard
  rbox(bench, 2.84, 0.9, 0.02, 0.004, mat(0x6b4a30), -0.3, 1.43, RZB + 0.012);
  plane(bench, 2.8, 0.86, toon(0xffffff, { map: pegTex }), -0.3, 1.43, RZB + 0.024);
  // the tools, as real geometry hanging on the board
  const TZ = RZB + 0.034, steelT = M.chromeDark;
  function wrenchG(len: number, R: number) {
    const w = R * 0.62, hy = len / 2, pts: [number, number][] = [];
    pts.push([-w / 2, -hy + R * 0.6], [w / 2, -hy + R * 0.6], [w / 2, hy - R * 0.75]);
    for (let a = -55; a <= 55; a += 10) { const t = a * Math.PI / 180; pts.push([Math.cos(t) * R, hy + Math.sin(t) * R]); }
    pts.push([R * 0.42, hy + R * 0.5], [R * 0.42, hy + R * 0.05], [-R * 0.42, hy + R * 0.05], [-R * 0.42, hy + R * 0.5]);
    for (let a = 125; a <= 235; a += 10) { const t = a * Math.PI / 180; pts.push([Math.cos(t) * R, hy + Math.sin(t) * R]); }
    pts.push([-w / 2, hy - R * 0.75]);
    const g1 = extr(pts, 0.004, 0);
    const ring = new THREE.Shape(); ring.absarc(0, 0, R * 0.95, 0, Math.PI * 2, false); const hh = new THREE.Path(); hh.absarc(0, 0, R * 0.55, 0, Math.PI * 2, true); ring.holes.push(hh);
    const g2 = new THREE.ExtrudeGeometry(ring, { depth: 0.005, bevelEnabled: false, curveSegments: 18 }); g2.translate(0, -hy + R * 0.2, -0.0025);
    return mergeGeometries([ni(g1), ni(g2)]);
  }
  for (let k = 0; k < 7; k++) { const L = 0.13 + k * 0.02, R = 0.012 + k * 0.0015; add(bench, wrenchG(L, R), steelT, -1.58 + k * 0.042, 1.6 - L / 2 + 0.02, TZ); }
  // hammer
  rod(bench, [-1.18, 1.25, TZ + 0.01], [-1.18, 1.56, TZ + 0.01], 0.011, mat(0xb67b42, 0.3), 12);
  rbox(bench, 0.12, 0.035, 0.03, 0.006, M.steelDark, -1.18, 1.58, TZ + 0.012);
  // screwdrivers
  ([[0xd8a92a, -1.02], [0x2f8a4a, -0.97], [0x2a5ca8, -0.92], [0xd8a92a, -0.87], [0xc42a2a, -0.82]] as const).forEach(([c, sx], i) => {
    cyl(bench, 0.011, 0.013, 0.085, 12, mat(c, 0.6), sx, 1.6, TZ + 0.014); rod(bench, [sx, 1.56, TZ + 0.014], [sx, 1.44 - i * 0.012, TZ + 0.014], 0.003, M.chrome, 6);
  });
  // pliers
  for (const s of [-1, 1]) add(bench, extr([[0, 0], [s * 0.006, -0.02], [s * 0.016, -0.12], [s * 0.008, -0.125], [-s * 0.002, -0.02]], 0.008, 0.002, 1), mat(0xc42a2a, 0.5), -0.66, 1.55, TZ + 0.01);
  add(bench, extr([[-0.008, 0], [0.008, 0], [0.004, 0.05], [-0.004, 0.05]], 0.009, 0.001, 1), M.steelDark, -0.66, 1.55, TZ + 0.012);
  // hacksaw
  rod(bench, [-0.5, 1.66, TZ + 0.01], [-0.18, 1.66, TZ + 0.01], 0.006, M.galv, 8); rod(bench, [-0.5, 1.66, TZ + 0.01], [-0.5, 1.56, TZ + 0.01], 0.006, M.galv, 8); rod(bench, [-0.18, 1.66, TZ + 0.01], [-0.18, 1.56, TZ + 0.01], 0.006, M.galv, 8);
  box(bench, 0.32, 0.012, 0.002, M.chrome, -0.34, 1.57, TZ + 0.01); rbox(bench, 0.05, 0.08, 0.025, 0.01, mat(0x2b2930), -0.535, 1.6, TZ + 0.012);
  // tape measure, cable loop, hooks
  rbox(bench, 0.065, 0.065, 0.03, 0.012, mat(0xe2b437, 0.6), 0.05, 1.62, TZ + 0.012); cyl(bench, 0.012, 0.012, 0.033, 12, mat(0x2b2930), 0.05, 1.62, TZ + 0.012, Math.PI / 2);
  add(bench, new THREE.TorusGeometry(0.055, 0.006, 8, 32), mat(0x1f1d25), 0.25, 1.5, TZ + 0.01);
  for (const hx of [-1.18, 0.25]) rod(bench, [hx, 1.6, RZB + 0.03], [hx, 1.6, TZ + 0.02], 0.003, M.galv, 6);
  // socket strip
  rbox(bench, 0.5, 0.05, 0.04, 0.01, mat(0xebe5d8), 0.55, 1.02, RZB + 0.05);
  for (let i = 0; i < 4; i++) cyl(bench, 0.012, 0.012, 0.005, 14, mat(0x9a948a), 0.38 + i * 0.11, 1.02, RZB + 0.072, Math.PI / 2);
  // the bike's helmet on the bench
  { const hm = add(bench, new THREE.SphereGeometry(0.13, 32, 22, 0, Math.PI * 2, 0, Math.PI * 0.62), mat(0x2b2a33, 0.9, 1), 0.62, 0.93, -2.02); hm.scale.set(1, 1.05, 1.12);
    const vis = add(bench, new THREE.SphereGeometry(0.132, 28, 12, -0.9, 1.8, Math.PI * 0.32, Math.PI * 0.22), M.chromeDark, 0.62, 0.93, -2.02); vis.scale.set(1, 1.05, 1.12); vis.rotation.y = Math.PI / 2; }
  // rolling tool chest with the livery stripe
  const tc = group(bench, 0.62, 0, -2.1);
  rbox(tc, 0.56, 0.62, 0.46, 0.015, mat(0x13254F, 0.7), 0, 0.37, 0);
  for (let i = 0; i < 4; i++) { box(tc, 0.52, 0.006, 0.006, mat(0x0a1530), 0, 0.19 + i * 0.13, 0.231); rod(tc, [-0.14, 0.25 + i * 0.13, 0.245], [0.14, 0.25 + i * 0.13, 0.245], 0.007, M.chrome, 8); }
  rbox(tc, 0.565, 0.028, 0.465, 0.006, mat(0xE2001A, 0.6), 0, 0.645, 0); box(tc, 0.563, 0.012, 0.463, mat(0x00843D, 0.4), 0, 0.625, 0);
  for (const x of [-0.22, 0.22]) for (const z of [-0.18, 0.18]) cyl(tc, 0.03, 0.03, 0.022, 16, mat(0x17151c), x, 0.032, z, Math.PI / 2);
  // desk on the right wall
  rbox(bench, 0.76, 0.035, 1.72, 0.006, M.wood, 2.82, 0.722, -1.5);
  for (const z of [-2.3, -0.7]) for (const x of [2.5, 3.14]) box(bench, 0.04, 0.705, 0.04, M.steelDark, x, 0.352, z);
  rbox(bench, 0.6, 0.5, 0.42, 0.01, mat(0x58525a, 0.3), 2.86, 0.43, -0.95);
  box(bench, 0.006, 0.006, 0.3, M.chrome, 2.555, 0.55, -0.95);
  // storage rack in the back-left corner; the Lego zone adopts it
  const rk = group(env, -2.75, 0, -2.18); rk.name = 'rack';
  for (const x of [-0.39, 0.39]) for (const z of [-0.19, 0.19]) box(rk, 0.035, 1.96, 0.035, M.galv, x, 0.98, z);
  for (const y of [0.35, 0.85, 1.35, 1.85]) box(rk, 0.8, 0.022, 0.42, mat(0xbaa078), 0, y, 0);
  rbox(rk, 0.34, 0.26, 0.3, 0.01, mat(0xb08452), -0.18, 0.49, 0); rbox(rk, 0.3, 0.2, 0.3, 0.01, mat(0x9c7444), 0.2, 0.46, 0.02); rbox(rk, 0.6, 0.24, 0.32, 0.02, mat(0x3c5a7a, 0.4), 0, 0.98, 0);
  rbox(rk, 0.3, 0.22, 0.3, 0.01, mat(0xb08452), -0.15, 1.97, -0.02); rbox(rk, 0.22, 0.14, 0.26, 0.01, mat(0x8f6c40), 0.2, 1.93, 0.0);
}
