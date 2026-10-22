// WLED strip under the top shelf: emissive LEDs, a painted bloom, and light that tints the cel ramps below.
// A simulation of the real strip's effects; the F1 tracker on the shelf can borrow it for a lap.
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { defineZone, type RunCtx } from '../zone';
import { add, rbox, proxy, fx, V3 } from '../kit';
import { toon, mat, M, U } from '../toon';

const N = 44, X0 = -1.15, PITCH = 0.05, Y = 1.928, Z = -2.13;
import { wledEffects as FX } from '../../data/garage';
type Fx = typeof FX[number];

const s = { fx: 'Solid' as Fx, col: [1, 160 / 255, 0], bri: 128, t0: performance.now(), heat: new Uint8Array(N), f1: null as null | { t0: number }, lastFire: 0, rm: false };
const buf = new Float32Array(N * 3);
let ledMesh: THREE.Mesh, glowMesh: THREE.Mesh;
let ctxRef: RunCtx | null = null;
const listeners = new Set<() => void>();

const hsv = (h: number, sa: number, v: number) => { h = ((h % 1) + 1) % 1; const i = Math.floor(h * 6), f = h * 6 - i, p = v * (1 - sa), q = v * (1 - f * sa), t = v * (1 - (1 - f) * sa); return [[v, t, p], [q, v, p], [p, v, t], [p, q, v], [t, p, v], [v, p, q]][i % 6]; };
function heat(h: number) { const t = Math.floor(h * 191 / 255), r = (t & 63) << 2; if (t & 128) return [1, 1, r / 255]; if (t & 64) return [1, r / 255, 0]; return [r / 255, 0, 0]; }
const animated = () => !s.rm && (!!s.f1 || s.fx !== 'Solid');

function compute(now: number) {
  const t = s.rm ? 0 : (now - s.t0) / 1000, c = s.col;
  for (let i = 0; i < N; i++) {
    let o = c;
    if (s.f1) {
      // three made-up cars lapping the strip: a white leader, a teal and an orange chaser
      const lt = s.rm ? 2.2 : (now - s.f1.t0) / 1000; o = [0.02, 0.02, 0.025];
      const cars: [number, number, number[]][] = [[7.0, 0, [1, 1, 1]], [6.7, 3.5, [0.2, 0.85, 0.78]], [6.45, 6.5, [1, 0.55, 0.1]]];
      for (const [sp, off, cc] of cars) { const pos = (lt * sp + off) % N; const d = (pos - i + N) % N; if (d < 0.8) o = cc; else if (d < 3.2) o = o[0] + o[1] + o[2] < 0.2 ? cc.map(v => v * (0.45 - d * 0.12)) : o; }
      if (i === 0 || i === N - 1) o = [0.6, 0.6, 0.6];
    } else if (s.fx === 'Rainbow') o = hsv(i / N + t * 0.12, 1, 1);
    else if (s.fx === 'Colorloop') o = hsv(t * 0.07, 1, 1);
    else if (s.fx === 'Chase') { const p = (t * 18) % N, d = (i - p + N) % N; o = d < 6 ? c : c.map(v => v * 0.06); }
    else if (s.fx === 'Breathe') { const b = 0.12 + 0.88 * (0.5 - 0.5 * Math.cos(t * Math.PI * 2 / 3.2)); o = c.map(v => v * b); }
    else if (s.fx === 'Theater') { const st = Math.floor(t * 8); o = ((i + st) % 3 === 0) ? c : [0, 0, 0]; }
    else if (s.fx === 'Fire 2012') o = s.rm ? heat(Math.max(0, 230 - i * 9)) : heat(s.heat[i]);
    buf[i * 3] = o[0]; buf[i * 3 + 1] = o[1]; buf[i * 3 + 2] = o[2];
  }
}
/** WLED's Fire 2012: cool, drift up, spark at the bottom */
function fireStep() {
  const h = s.heat, rnd = (a: number, b: number) => a + Math.floor(Math.random() * (b - a));
  for (let i = 0; i < N; i++) h[i] = Math.max(0, h[i] - rnd(0, Math.floor(55 * 10 / N) + 2));
  for (let k = N - 1; k >= 2; k--) h[k] = Math.floor((h[k - 1] + h[k - 2] * 2) / 3);
  if (Math.random() * 255 < 120) { const y = rnd(0, 7); h[y] = Math.min(255, h[y] + rnd(160, 255)); }
}
function apply() {
  const bri = s.bri / 255, ca = ledMesh.geometry.attributes.aCol as THREE.BufferAttribute, ga = glowMesh.geometry.attributes.aCol as THREE.BufferAttribute, vpl = ca.count / N;
  for (let i = 0; i < N; i++) {
    const r = buf[i * 3], g = buf[i * 3 + 1], b = buf[i * 3 + 2], k = 0.6 + 0.6 * bri;
    const lit = (v: number, floor: number) => Math.max(floor, Math.min(1, v * k + 0.18 * (v > 0.05 ? 1 : 0)));
    for (let v = 0; v < vpl; v++) ca.setXYZ(i * vpl + v, lit(r, 0.08), lit(g, 0.08), lit(b, 0.09));
  }
  const cols = N + 1;
  for (let c = 0; c < cols; c++) {
    const a = Math.max(0, c - 1), b = Math.min(N - 1, c);
    const r = (buf[a * 3] + buf[b * 3]) / 2 * bri, g = (buf[a * 3 + 1] + buf[b * 3 + 1]) / 2 * bri, bl = (buf[a * 3 + 2] + buf[b * 3 + 2]) / 2 * bri;
    ga.setXYZ(c, r, g, bl); ga.setXYZ(c + cols, r, g, bl);
  }
  ca.needsUpdate = true; ga.needsUpdate = true;
  // four light points along the strip feed the cel shader's WLED tint bands
  const seg = N / 4;
  for (let k = 0; k < 4; k++) { let r = 0, g = 0, b = 0; for (let i = k * seg; i < (k + 1) * seg; i++) { r += buf[i * 3]; g += buf[i * 3 + 1]; b += buf[i * 3 + 2]; } const f = bri * 1.4 / seg; U.uWC.value[k].set(r * f, g * f, b * f); }
}
function refresh() { compute(performance.now()); apply(); ctxRef?.invalidate(); listeners.forEach(l => l()); }

/** the shelf's F1 tracker runs its lap through here */
export const strip = {
  get f1() { return !!s.f1; },
  runLap() { s.f1 = { t0: performance.now() }; refresh(); },
  stopLap() { s.f1 = null; refresh(); },
  onChange(fn: () => void) { listeners.add(fn); }
};

const hex = () => '#' + s.col.map(v => Math.round(v * 255).toString(16).padStart(2, '0')).join('');

export default defineZone({
  id: 'wled',
  ink: 1.2,
  view: { pos: [-0.25, 1.68, 0.05], target: [-0.1, 1.56, -2.3] },
  build(g) {
    rbox(g, 2.24, 0.016, 0.026, 0.004, M.galv, X0 + 1.1, 1.932, Z);
    const gs: THREE.BufferGeometry[] = [];
    for (let k = 0; k < N; k++) { const b = new THREE.BoxGeometry(0.03, 0.008, 0.014); b.translate(X0 + (k + 0.5) * PITCH, Y - 0.009, Z); gs.push(b.toNonIndexed()); }
    const lg = mergeGeometries(gs); lg.setAttribute('aCol', new THREE.BufferAttribute(new Float32Array(lg.attributes.position.count * 3), 3));
    ledMesh = add(g, lg, toon(0xffffff, { vcol: true, emis: 1 })); ledMesh.userData.noMerge = true; ledMesh.userData.noHull = true;
    rbox(g, 0.07, 0.03, 0.05, 0.006, mat(0x1c1c22), 1.12, 1.92, -2.2);
    const gl = new THREE.PlaneGeometry(2.36, 0.34, N, 1);
    gl.setAttribute('aCol', new THREE.BufferAttribute(new Float32Array(gl.attributes.position.count * 3), 3));
    const glowMat = new THREE.ShaderMaterial({
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
      vertexShader: `attribute vec3 aCol; varying vec3 vC; varying vec2 vU; void main(){ gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.); vC = aCol; vU = uv; }`,
      fragmentShader: `varying vec3 vC; varying vec2 vU;
        void main(){ float y = (vU.y - 0.62) / 0.62; float a = exp(-y*y*7.0) * 0.75 + exp(-y*y*60.0) * 0.5; float x = min(vU.x, 1.0 - vU.x); a *= smoothstep(0.0, 0.04, x); gl_FragColor = vec4(vC * a, 1.); }`
    });
    glowMesh = fx(add(g, gl, glowMat, X0 + 1.1, Y - 0.05, Z + 0.03));
    proxy(g, 2.3, 0.12, 0.12, X0 + 1.1, 1.9, Z + 0.02);
    U.uWP.value.forEach((v, k) => v.copy(V3(X0 + (k + 0.5) * (N * PITCH / 4), Y - 0.02, Z + 0.03)));
    compute(performance.now()); apply();
  },
  mount(panel, ctx) {
    ctxRef = ctx; s.rm = ctx.rm;
    const swatches = [...panel.querySelectorAll<HTMLButtonElement>('[data-c]')];
    const fxBtns = [...panel.querySelectorAll<HTMLButtonElement>('[data-fx]')];
    const picker = panel.querySelector<HTMLInputElement>('[data-any-colour]')!;
    const bri = panel.querySelector<HTMLInputElement>('[data-bri]')!;
    const read = panel.querySelector<HTMLElement>('[data-read]')!;
    const sync = () => {
      const c = hex();
      swatches.forEach(b => b.setAttribute('aria-pressed', String(b.dataset.c === c)));
      fxBtns.forEach(b => b.setAttribute('aria-pressed', String(!s.f1 && b.dataset.fx === s.fx)));
      picker.value = c; bri.value = String(s.bri);
      read.textContent = s.f1 ? `FX F1 lap (synthetic)  ·  bri ${s.bri}` : `FX ${s.fx}  ·  col ${c.toUpperCase()}  ·  bri ${s.bri}`;
    };
    const setCol = (c: string) => { s.col = [1, 3, 5].map(i => parseInt(c.substr(i, 2), 16) / 255); refresh(); };
    swatches.forEach(b => b.addEventListener('click', () => setCol(b.dataset.c!)));
    picker.addEventListener('input', () => setCol(picker.value));
    fxBtns.forEach(b => b.addEventListener('click', () => { s.f1 = null; s.fx = b.dataset.fx as Fx; s.t0 = performance.now(); if (s.fx === 'Fire 2012') s.heat.fill(0); refresh(); }));
    bri.addEventListener('input', () => { s.bri = +bri.value; refresh(); });
    listeners.add(sync); sync();
  },
  tick(now, _dt, ctx) {
    if (s.rm !== ctx.rm) { s.rm = ctx.rm; compute(now); apply(); }
    if (!animated()) return false;
    if (s.fx === 'Fire 2012' && !s.f1 && now - s.lastFire > 33) { fireStep(); s.lastFire = now; }
    if (s.f1 && now - s.f1.t0 > 9000) { s.f1 = null; listeners.forEach(l => l()); }
    compute(now); apply();
    return true;
  }
});
