// The shelf of side projects above the bench: one object per project, each one pickable on its own
// once the shelf is open (#shelf/<item>).
import * as THREE from 'three';
import { defineZone } from '../zone';
import { add, box, rbox, cyl, rod, tube, extr, plane, group, proxy } from '../kit';
import { toon, mat, emis, M, ROOM } from '../toon';
import { ctex, rr, FT, FB, FM } from '../paint';
import { strip } from './wled';

const SHELF_Y = 1.97, SHELF_Z = -2.27;

function textures() {
  return {
    cert: ctex(512, 384, (x, w, h) => {
      x.fillStyle = '#f3ead2'; x.fillRect(0, 0, w, h);
      x.strokeStyle = '#b9a77a'; x.lineWidth = 8; x.strokeRect(16, 16, w - 32, h - 32); x.lineWidth = 2; x.strokeRect(30, 30, w - 60, h - 60);
      x.textAlign = 'center'; x.fillStyle = '#2b3a64';
      x.font = FT(400, 38); x.fillText('HASH CODE 2018', w / 2, 100);
      x.font = FB(500, 22); x.fillText('team JustGoogleIt', w / 2, 142);
      x.font = FT(400, 88); x.fillStyle = '#E2001A'; x.fillText('#113', w / 2, 248);
      x.font = FB(600, 22); x.fillStyle = '#2b3a64'; x.fillText('of 4,852 teams worldwide', w / 2, 290);
      x.fillStyle = '#c2b38d'; x.fillRect(90, 330, 120, 3); x.fillRect(302, 330, 120, 3);
    }),
    aoc: ctex(256, 64, (x, w, h) => {
      x.fillStyle = '#10102a'; x.fillRect(0, 0, w, h);
      x.font = FM(600, 34); x.fillStyle = '#ffff66'; x.fillText('104', 30, 45);
      x.beginPath(); for (let i = 0; i < 10; i++) { const r = i % 2 ? 18 * 0.45 : 18, a = -Math.PI / 2 + i * Math.PI / 5; x.lineTo(170 + Math.cos(a) * r, 32 + Math.sin(a) * r); } x.closePath(); x.fill();
    }),
    phone: ctex(128, 256, (x, w) => {
      x.fillStyle = '#10142a'; x.fillRect(0, 0, w, 256); x.fillStyle = '#23294a'; x.fillRect(0, 0, w, 26);
      ([[10, 38, 72, '#3a4470'], [44, 70, 74, '#2b5cc8'], [10, 102, 58, '#3a4470'], [36, 134, 82, '#2b5cc8'], [10, 166, 78, '#3a4470'], [56, 198, 62, '#2b5cc8']] as const)
        .forEach(([a, b, l, c]) => { rr(x, a, b, l, 24, 10); x.fillStyle = c; x.fill(); });
    }),
    gps: ctex(128, 96, (x, w, h) => { x.fillStyle = '#a8c98a'; x.fillRect(0, 0, w, h); x.strokeStyle = '#4e7a3e'; x.lineWidth = 5; x.lineJoin = 'round'; x.beginPath(); x.moveTo(10, 80); x.bezierCurveTo(40, 70, 40, 30, 70, 40); x.bezierCurveTo(95, 48, 100, 18, 118, 14); x.stroke(); x.fillStyle = '#E2001A'; x.beginPath(); x.arc(118, 14, 7, 0, Math.PI * 2); x.fill(); }),
    map: ctex(256, 192, (x, w, h) => {
      x.fillStyle = '#e8dcb8'; x.fillRect(0, 0, w, h); x.fillStyle = '#a9c48a'; rr(x, 20, 26, 80, 60, 20); x.fill(); rr(x, 150, 104, 80, 66, 24); x.fill();
      x.fillStyle = '#86b3dc'; x.fillRect(0, 136, 120, 14);
      x.strokeStyle = '#c0533e'; x.lineWidth = 5; x.lineJoin = 'round'; x.beginPath(); for (let i = 0; i <= 30; i++) { const px = 10 + i * 7.8, py = 90 + Math.sin(i * 0.4) * 34; i ? x.lineTo(px, py) : x.moveTo(px, py); } x.stroke();
      x.strokeStyle = 'rgba(120,100,70,0.6)'; x.lineWidth = 2; x.beginPath(); x.moveTo(128, 0); x.lineTo(128, h); x.moveTo(0, 96); x.lineTo(w, 96); x.stroke();
    }),
    flag: ctex(128, 96, (x) => { for (let j = 0; j < 6; j++) for (let i = 0; i < 8; i++) { x.fillStyle = (i + j) % 2 ? '#15131a' : '#f6f4f0'; x.fillRect(i * 16, j * 16, 16, 16); } })
  };
}

export default defineZone({
  id: 'shelf',
  ink: 1.3,
  view: { pos: [-0.1, 2.02, -0.62], target: [-0.08, 2.03, -2.3] },
  items: ['aoc', 'msgr', 'hash', 'f1', 'gps'],
  build(gShelf, ctx) {
    const T = textures();
    rbox(gShelf, 2.3, 0.03, 0.28, 0.006, M.ply, -0.05, 1.955, -2.26);
    for (const x of [-1.05, 0.0, 1.0]) { box(gShelf, 0.025, 0.2, 0.025, M.steelDark, x, 1.84, ROOM.RZB + 0.02); rod(gShelf, [x, 1.75, ROOM.RZB + 0.02], [x, 1.935, -2.16], 0.007, M.steelDark, 6); }
    const item = (id: string, x: number) => { const g = group(gShelf, x, SHELF_Y, SHELF_Z); g.userData.ink = 1.2; ctx.item(id, g); return g; };

    { // F1 tracker: ESP box, cable down to the strip, chequered flag and a little car
      const g = item('f1', -1.02);
      rbox(g, 0.1, 0.04, 0.065, 0.006, mat(0x1d1c22, 0.4), 0, 0.02, 0.02); box(g, 0.012, 0.006, 0.004, emis(0x34ff7a), 0.03, 0.03, 0.054);
      tube(g, [[-0.05, 0.015, 0.03], [-0.09, 0.0, 0.08], [-0.12, -0.04, 0.13], [-0.13, -0.05, 0.14]], 0.004, mat(0x15131a), 16, 6);
      rod(g, [0.045, 0.04, -0.01], [0.045, 0.25, -0.01], 0.003, M.chrome, 6);
      plane(g, 0.11, 0.075, toon(0xffffff, { map: T.flag, side: THREE.DoubleSide }), 0.1, 0.205, -0.01);
      const c = group(g, -0.015, 0.04, 0.02);
      add(c, extr([[-0.035, 0], [0.04, 0], [0.04, 0.008], [0.0, 0.011], [-0.012, 0.02], [-0.03, 0.02], [-0.035, 0.008]], 0.018, 0.002, 1), mat(0xdcdbe2, 0.8));
      for (const x of [-0.024, 0.026]) for (const z of [-0.012, 0.012]) cyl(c, 0.007, 0.007, 0.007, 12, mat(0x15131a), x, 0.004, z, Math.PI / 2);
      proxy(g, 0.24, 0.3, 0.2, 0.0, 0.12, 0.02);
    }
    { // Advent of Code: a stepped tree with its star, on a plaque with the star count
      const g = item('aoc', -0.52);
      rbox(g, 0.2, 0.03, 0.12, 0.005, mat(0x10102a), 0, 0.015, 0);
      plane(g, 0.12, 0.03, toon(0xffffff, { map: T.aoc, emis: 0.7 }), 0, 0.015, 0.0605);
      cyl(g, 0.012, 0.012, 0.03, 10, mat(0x6b4426), 0, 0.045, 0);
      const tiers = [0.075, 0.064, 0.052, 0.04, 0.028];
      tiers.forEach((r, i) => cyl(g, r * 0.35, r, 0.05, 9, mat(i % 2 ? 0x2b8a3e : 0x237a36, 0.3), 0, 0.085 + i * 0.038, 0));
      [0xffff66, 0xE2001A, 0x7fd3ff, 0xffff66, 0xff8a1a, 0x7fd3ff].forEach((c, i) => { const a = i * 2.1, t = tiers[Math.min(4, i % 5)], y = 0.07 + (i % 5) * 0.038; add(g, new THREE.SphereGeometry(0.007, 10, 8), emis(c), Math.cos(a) * t * 0.85, y, Math.sin(a) * t * 0.85 + 0.01); });
      const st: [number, number][] = []; for (let i = 0; i < 10; i++) { const r = i % 2 ? 0.013 : 0.03, a = Math.PI / 2 + i * Math.PI / 5; st.push([Math.cos(a) * r, Math.sin(a) * r]); }
      add(g, extr(st, 0.006, 0.002, 1), toon(0xffee55, { emis: 0.85 }), 0, 0.3, 0);
      proxy(g, 0.22, 0.36, 0.14, 0, 0.17, 0);
    }
    { // MessengertoStats: phone on a stand with a synthetic chat, and a little bar chart
      const g = item('msgr', -0.02);
      add(g, extr([[-0.04, 0], [0.04, 0], [0.04, 0.012], [-0.02, 0.05], [-0.04, 0.05]], 0.08, 0.002, 1), mat(0x2d2e36, 0.4), 0, 0, 0, 0, Math.PI / 2, 0);
      const ph = group(g, 0, 0.012, 0.012); ph.rotation.x = -0.32;
      rbox(ph, 0.078, 0.155, 0.009, 0.006, mat(0x16151b, 0.7), 0, 0.078, 0);
      plane(ph, 0.068, 0.136, toon(0xffffff, { map: T.phone, emis: 0.9 }), 0, 0.08, 0.0048);
      [0.06, 0.1, 0.045, 0.08].forEach((h, i) => rbox(g, 0.018, h, 0.018, 0.003, mat(i % 2 ? 0x2b5cc8 : 0x7fa3ff, 0.5), 0.07 + i * 0.022, h / 2, 0.03));
      proxy(g, 0.22, 0.2, 0.14, 0.03, 0.09, 0.01);
    }
    { // Hashcode 2018: the result, framed
      const g = item('hash', 0.46);
      const fr = group(g, 0, 0, 0); fr.rotation.x = -0.12;
      rbox(fr, 0.25, 0.19, 0.016, 0.004, mat(0x2a2422, 0.3), 0, 0.095, 0);
      plane(fr, 0.215, 0.16, toon(0xffffff, { map: T.cert }), 0, 0.095, 0.0085);
      rod(g, [0, 0.12, -0.02], [0, 0.0, -0.08], 0.004, mat(0x2a2422), 6);
      proxy(g, 0.28, 0.22, 0.12, 0, 0.1, 0);
    }
    { // GPS tools: a handheld GPS and a folded map
      const g = item('gps', 0.9);
      const m = plane(g, 0.17, 0.12, toon(0xffffff, { map: T.map }), -0.03, 0.065, -0.068); m.rotation.x = -0.25;
      box(g, 0.17, 0.12, 0.004, mat(0xd8cdb0), -0.03, 0.062, -0.073, -0.25);
      const u = group(g, 0.03, 0, 0.02); u.rotation.set(-0.2, -0.25, 0);
      rbox(u, 0.062, 0.125, 0.032, 0.01, mat(0xd8a72c, 0.6), 0, 0.0625, 0);
      rbox(u, 0.05, 0.1, 0.004, 0.002, mat(0x1d1d22), 0, 0.066, 0.0165);
      plane(u, 0.04, 0.034, toon(0xffffff, { map: T.gps, emis: 0.6 }), 0, 0.09, 0.0187);
      for (let i = 0; i < 3; i++) rbox(u, 0.011, 0.008, 0.004, 0.0015, mat(0x55575f), -0.014 + i * 0.014, 0.05, 0.0186);
      cyl(u, 0.007, 0.008, 0.04, 12, mat(0x1d1d22), 0.02, 0.145, 0);
      proxy(g, 0.22, 0.2, 0.16, 0, 0.09, -0.02);
    }
  },
  mount(panel, ctx) {
    panel.querySelectorAll<HTMLButtonElement>('[data-item]').forEach(b => {
      const k = b.dataset.item!;
      b.addEventListener('click', () => ctx.select(k));
      const on = () => { if (b.getAttribute('aria-pressed') !== 'true') ctx.outline('shelf:' + k); };
      b.addEventListener('mouseenter', on); b.addEventListener('focus', on);
      b.addEventListener('mouseleave', () => ctx.outline(null)); b.addEventListener('blur', () => ctx.outline(null));
    });
    const run = panel.querySelector<HTMLButtonElement>('[data-f1-run]');
    if (run) {
      const sync = () => { run.setAttribute('aria-pressed', String(strip.f1)); run.textContent = strip.f1 ? 'Stop the lap' : 'Run a lap on the strip'; };
      run.addEventListener('click', () => (strip.f1 ? strip.stopLap() : strip.runLap()));
      strip.onChange(sync); sync();
    }
  },
  select(item, panel) {
    panel.querySelectorAll<HTMLButtonElement>('[data-item]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.item === item)));
    panel.querySelectorAll<HTMLElement>('[data-item-body]').forEach(el => { el.hidden = el.dataset.itemBody !== item; });
  }
});
