// Geometry helpers. Every helper adds the mesh to `p` and returns it, so a zone reads as a list of parts.
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

export type Vec = [number, number, number];
type P = THREE.Object3D;
type Mat = THREE.Material;

export const V3 = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
export const V2 = (x = 0, y = 0) => new THREE.Vector2(x, y);
export const UPV = V3(0, 1, 0);
export const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const smooth = (a: number, b: number, x: number) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };

export function add(parent: P, geo: THREE.BufferGeometry, m: Mat, x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0) {
  const o = new THREE.Mesh(geo, m); o.position.set(x, y, z); o.rotation.set(rx, ry, rz); parent.add(o); return o;
}
export const box = (p: P, w: number, h: number, d: number, m: Mat, x?: number, y?: number, z?: number, rx?: number, ry?: number, rz?: number) =>
  add(p, new THREE.BoxGeometry(w, h, d), m, x, y, z, rx, ry, rz);
export const rbox = (p: P, w: number, h: number, d: number, r: number, m: Mat, x?: number, y?: number, z?: number, rx?: number, ry?: number, rz?: number) =>
  add(p, new RoundedBoxGeometry(w, h, d, 2, Math.min(r, w / 2 - 1e-4, h / 2 - 1e-4, d / 2 - 1e-4)), m, x, y, z, rx, ry, rz);
export const cyl = (p: P, rt: number, rb: number, h: number, seg: number, m: Mat, x?: number, y?: number, z?: number, rx?: number, ry?: number, rz?: number) =>
  add(p, new THREE.CylinderGeometry(rt, rb, h, seg, 1), m, x, y, z, rx, ry, rz);

/** a cylinder from a to b */
export function rod(p: P, a: Vec, b: Vec, r: number, m: Mat, seg = 10, rTop?: number) {
  const A = V3(...a), B = V3(...b), d = B.clone().sub(A), L = d.length();
  const o = new THREE.Mesh(new THREE.CylinderGeometry(rTop ?? r, r, L, seg, 1), m);
  o.position.copy(A).addScaledVector(d, 0.5); o.quaternion.setFromUnitVectors(UPV, d.normalize()); p.add(o); return o;
}
export function tube(p: P, pts: Vec[], r: number, m: Mat, segs = 40, radial = 10, closed = false) {
  return add(p, new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts.map(q => V3(...q)), closed), segs, r, radial, closed), m);
}
export function shapeOf(pts: [number, number][]) { return new THREE.Shape(pts.map(q => V2(q[0], q[1]))); }
/** an extruded outline centred on z; smoothTop runs a spline through the points */
export function extr(pts: [number, number][], depth: number, bevel = 0, seg = 2, smoothTop = false) {
  let s: THREE.Shape;
  if (smoothTop) { s = new THREE.Shape(); s.moveTo(pts[0][0], pts[0][1]); s.splineThru(pts.slice(1).map(q => V2(q[0], q[1]))); s.closePath(); }
  else s = shapeOf(pts);
  const g = new THREE.ExtrudeGeometry(s, { depth, bevelEnabled: bevel > 0, bevelThickness: bevel, bevelSize: bevel * 0.8, bevelSegments: seg, curveSegments: 10, steps: 1 });
  g.translate(0, 0, -depth / 2); return g;
}
export const ni = (g: THREE.BufferGeometry) => g.index ? g.toNonIndexed() : g;
export function lathe(pts: [number, number][], seg = 32) { return new THREE.LatheGeometry(pts.map(q => V2(q[0], q[1])), seg); }
/** a box with a smaller, optionally offset top: keycaps, CRT backs, camera prisms */
export function frustumG(wb: number, db: number, wt: number, dt: number, h: number, ox = 0, oz = 0) {
  const b = [[-wb / 2, 0, -db / 2], [wb / 2, 0, -db / 2], [wb / 2, 0, db / 2], [-wb / 2, 0, db / 2]];
  const t = [[ox - wt / 2, h, oz - dt / 2], [ox + wt / 2, h, oz - dt / 2], [ox + wt / 2, h, oz + dt / 2], [ox - wt / 2, h, oz + dt / 2]];
  const Pn: number[] = []; const q = (a: number[], b2: number[], c: number[], d: number[]) => Pn.push(...a, ...b2, ...c, ...a, ...c, ...d);
  q(t[0], t[3], t[2], t[1]); q(b[0], b[1], b[2], b[3]); q(b[3], b[2], t[2], t[3]); q(b[1], b[0], t[0], t[1]); q(b[2], b[1], t[1], t[2]); q(b[0], b[3], t[3], t[0]);
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(Pn, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(new Float32Array(Pn.length / 3 * 2), 2)); g.computeVertexNormals(); return g;
}
/** a flat card (posters, screens, labels): never inked */
export function plane(p: P, w: number, h: number, m: Mat, x: number, y: number, z: number, ry = 0) {
  const o = add(p, new THREE.PlaneGeometry(w, h), m, x, y, z, 0, ry, 0); o.userData.noHull = true; return o;
}
export function group(parent: P, x = 0, y = 0, z = 0, ry = 0) { const g = new THREE.Group(); g.position.set(x, y, z); g.rotation.y = ry; parent.add(g); return g; }
/** an invisible pick box, so the whole object answers the pointer and not only its painted pixels */
export function proxy(parent: P, w: number, h: number, d: number, x: number, y: number, z: number, ry = 0) {
  const o = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), new THREE.MeshBasicMaterial());
  o.position.set(x, y, z); o.rotation.y = ry; o.visible = false; o.userData.noMerge = true; o.userData.proxy = true; parent.add(o); return o;
}
/** painted effects (glows, sky, decals): drawn in the paint pass only, no ink, no shadow */
export function fx<T extends THREE.Object3D>(o: T) { o.layers.set(2); o.userData.noMerge = true; o.userData.noHull = true; return o; }
/** painted and inked, but casts no shadow (lamp shades, cables at the lamp) */
export function noShadow<T extends THREE.Object3D>(o: T) { o.layers.set(3); o.userData.noMerge = true; return o; }
