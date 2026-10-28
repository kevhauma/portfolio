// The globe: a cel-painted earth lit by a low sun on the left, the trips drawn on it as ink lines, prints stuck
// on where the photos were taken, and a camera that flies between views. It draws only when something changed.
// The paper map and the notes (./atlas.ts) drive it through the api boot() returns.
import * as THREE from 'three';
import { Line2 } from 'three/addons/lines/Line2.js';
import { LineMaterial } from 'three/addons/lines/LineMaterial.js';
import { LineGeometry } from 'three/addons/lines/LineGeometry.js';
import { LineSegments2 } from 'three/addons/lines/LineSegments2.js';
import { LineSegmentsGeometry } from 'three/addons/lines/LineSegmentsGeometry.js';
import { feature, mesh } from 'topojson-client';
import type { Topology, GeometryCollection } from 'topojson-specification';
import atlasUrl from 'world-atlas/countries-50m.json?url';
import { countries, trips, photos, spa, overview, type Mode, type View, type Photo } from '../data/map';

export type GlobeApi = {
  /** fly to a trip or country id, or to the whole globe */
  go(id: string): void;
  /** hide these modes ('photo' hides the prints) */
  filter(off: Set<string>): void;
  /** the stage pixels the paper covers on the left, so the globe can make room */
  room(px: number): void;
};

const D2R = Math.PI / 180, FOV = 30;
const C = { ink: 0x0a1330, red: 0xe2001a, navy: 0x13254f, green: 0x00843d, white: 0xf7f8fa };
const MODE_COL: Record<Mode, number> = { moto: C.red, car: C.navy, bike: C.green, walk: C.white, race: C.red };
const ll2v = (lat: number, lon: number, r = 1) => new THREE.Vector3(r * Math.cos(lat * D2R) * Math.sin(lon * D2R), r * Math.sin(lat * D2R), r * Math.cos(lat * D2R) * Math.cos(lon * D2R));
const yieldToMain = () => new Promise<void>(r => setTimeout(r, 0));

/** a road, not a ruler: catmull-rom through the waypoints with a small deterministic wiggle */
function road(pts: [number, number, string?][], n: number) {
  const out: [number, number][] = [], P = pts.map(p => [p[0], p[1]]);
  for (let i = 0; i < P.length - 1; i++) {
    const p0 = P[Math.max(i - 1, 0)], p1 = P[i], p2 = P[i + 1], p3 = P[Math.min(i + 2, P.length - 1)];
    const len = Math.hypot(p2[0] - p1[0], p2[1] - p1[1]) || 1;
    for (let k = 0; k < n; k++) {
      const t = k / n, t2 = t * t, t3 = t2 * t;
      const f = (a: number, b: number, c: number, d: number) => 0.5 * (2 * b + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t2 + (-a + 3 * b - 3 * c + d) * t3);
      let la = f(p0[0], p1[0], p2[0], p3[0]), lo = f(p0[1], p1[1], p2[1], p3[1]);
      const w = Math.sin(t * Math.PI) * len * (0.06 * Math.sin(t * 9 + i * 2.3) + 0.018 * Math.sin(t * 23 + i));
      la += w * (p2[1] - p1[1]) / len; lo -= w * (p2[0] - p1[0]) / len;
      out.push([la, lo]);
    }
  }
  out.push(P[P.length - 1] as [number, number]); return out;
}

export async function boot(stage: HTMLElement, hooks: { photo(trip: string): void }): Promise<GlobeApi> {
  const canvas = stage.querySelector<HTMLCanvasElement>('[data-gl]')!;
  const labelsEl = stage.querySelector<HTMLElement>('[data-labels]')!;
  const mqRM = matchMedia('(prefers-reduced-motion: reduce)');
  let RM = mqRM.matches; mqRM.addEventListener('change', () => { RM = mqRM.matches; });

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  if (!renderer.getContext()) throw new Error('no WebGL');
  const maxTex = renderer.capabilities.maxTextureSize;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(FOV, 1, 0.0004, 10);
  const G = new THREE.Group(); G.rotation.order = 'XYZ'; scene.add(G);
  const SUN = new THREE.Vector3(-0.78, 0.42, 0.46).normalize(); // view space: a low sun on the left
  let W = 1, H = 1, f = 1, dirty = true;
  const invalidate = () => { dirty = true; };

  /* ---------- the paint: ocean bands, painted countries, bare primer ---------- */
  const topo = await fetch(atlasUrl).then(r => r.json()) as Topology<{ countries: GeometryCollection }>;
  const feats = (feature(topo, topo.objects.countries) as unknown as GeoJSON.FeatureCollection).features.filter(x => x.id !== '010');
  const PAINTED = new Set(countries.map(c => c.iso));
  const bounds = feats.map(ft => {
    let a = 180, b = -180, c = 90, d = -90;
    const g = ft.geometry as GeoJSON.Polygon | GeoJSON.MultiPolygon;
    for (const poly of g.type === 'Polygon' ? [g.coordinates] : g.coordinates) for (const [lo, la] of poly[0]) { a = Math.min(a, lo); b = Math.max(b, lo); c = Math.min(c, la); d = Math.max(d, la); }
    return [a, c, b, d];
  });
  function paint(w: number, h: number, [lo0, la0, lo1, la1]: number[], k: number, wrap: boolean) {
    const cv = document.createElement('canvas'); cv.width = w; cv.height = h; const g = cv.getContext('2d')!;
    const px = (lon: number, lat: number) => [(lon - lo0) / (lo1 - lo0) * w, (la1 - lat) / (la1 - la0) * h];
    const paths: { id: string; p: Path2D }[] = [];
    feats.forEach((ft, i) => {
      const [a, c, b, d] = bounds[i];
      if (!wrap && (b < lo0 - 2 || a > lo1 + 2 || d < la0 - 2 || c > la1 + 2)) return;
      const geom = ft.geometry as GeoJSON.Polygon | GeoJSON.MultiPolygon, p = new Path2D();
      for (const poly of geom.type === 'Polygon' ? [geom.coordinates] : geom.coordinates) for (const ring of poly) {
        let prev: number | null = null, off = 0;
        ring.forEach(([lo, la], j) => {
          if (prev !== null) { if (lo - prev > 180) off -= 360; else if (prev - lo > 180) off += 360; }
          prev = lo; const [x, y] = px(lo + off, la); j ? p.lineTo(x, y) : p.moveTo(x, y);
        });
        p.closePath();
      }
      paths.push({ id: String(ft.id), p });
    });
    const offs = wrap ? [-w, 0, w] : [0];
    g.fillStyle = '#24407A'; g.fillRect(0, 0, w, h); g.lineJoin = 'round';
    for (const [lw, c] of [[40 * k, '#2D4E8E'], [18 * k, '#3A63A6']] as const) { g.lineWidth = lw; g.strokeStyle = c; for (const o of offs) { g.save(); g.translate(o, 0); paths.forEach(q => g.stroke(q.p)); g.restore(); } }
    for (const o of offs) {
      g.save(); g.translate(o, 0);
      for (const q of paths) { g.fillStyle = PAINTED.has(q.id) ? '#EDCB8E' : '#A9AEBB'; g.fill(q.p); }
      if (wrap) { g.globalAlpha = 0.45; g.lineWidth = 2.4 * k; g.strokeStyle = '#0A1330'; paths.forEach(q => g.stroke(q.p)); g.globalAlpha = 1; } // up close the crisp border lines do this job
      g.restore();
    }
    const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = renderer.capabilities.getMaxAnisotropy();
    if (wrap) { t.generateMipmaps = false; t.minFilter = THREE.LinearFilter; }
    return t;
  }
  const big = Math.min(4096, maxTex);
  const world = paint(big, big / 2, [-180, -90, 180, 90], big / 8192, true); await yieldToMain();
  /* sharper windows where the trips are: Europe and Japan */
  const EU = [-10, 42, 18, 60], JP = [128, 30, 146, 42];
  const mapEU = paint(big, big / 2, EU, 1.2, false); await yieldToMain();
  const mapJP = paint(big / 2, big / 2, JP, 1.2, false); await yieldToMain();

  const col = (h: number) => new THREE.Color(h);
  const globeMat = new THREE.ShaderMaterial({
    uniforms: {
      tMap: { value: world }, tEU: { value: mapEU }, tJP: { value: mapJP }, uEU: { value: new THREE.Vector4(...EU) }, uJP: { value: new THREE.Vector4(...JP) },
      uSun: { value: SUN }, uInk: { value: col(C.ink) }, uViolet: { value: col(0x3b3357) }, uNight: { value: col(0x161230) }, uHi: { value: col(0x7fa2da) }, uWarm: { value: col(0xffb070) }
    },
    vertexShader: /* glsl */`varying vec3 vP; varying vec3 vN; varying vec3 vV;
      void main(){ vP = position; vN = normalize(normalMatrix * normal); vec4 mv = modelViewMatrix * vec4(position, 1.0); vV = -mv.xyz; gl_Position = projectionMatrix * mv; }`,
    fragmentShader: /* glsl */`uniform sampler2D tMap, tEU, tJP; uniform vec4 uEU, uJP; uniform vec3 uSun, uInk, uViolet, uNight, uHi, uWarm;
      varying vec3 vP; varying vec3 vN; varying vec3 vV;
      float band(float v, float t){ float a = fwidth(v) * 0.8 + 0.0005; return smoothstep(t - a, t + a, v); }
      void main(){
        vec3 n = normalize(vP);
        float lon = atan(n.x, n.z) * 57.29578, lat = asin(clamp(n.y, -1.0, 1.0)) * 57.29578;
        vec4 tx = texture2D(tMap, vec2(lon / 360.0 + 0.5, lat / 180.0 + 0.5));
        vec2 qe = vec2((lon - uEU.x) / (uEU.z - uEU.x), (lat - uEU.y) / (uEU.w - uEU.y));
        vec2 qj = vec2((lon - uJP.x) / (uJP.z - uJP.x), (lat - uJP.y) / (uJP.w - uJP.y));
        if (all(greaterThan(qe, vec2(0.002))) && all(lessThan(qe, vec2(0.998)))) tx = texture2D(tEU, qe);
        else if (all(greaterThan(qj, vec2(0.002))) && all(lessThan(qj, vec2(0.998)))) tx = texture2D(tJP, qj);
        vec3 base = tx.rgb;
        float sea = step(base.r * 3.0, base.b) * step(0.1, base.b); // the ocean is the only paint this blue
        vec3 N = normalize(vN), V = normalize(vV);
        float ndl = dot(N, uSun);
        float b0 = band(ndl, -0.06), b1 = band(ndl, 0.12), b2 = band(ndl, 0.46);
        vec3 c = mix(mix(mix(mix(base * 0.22, uNight, 0.62), mix(base * 0.5, uViolet, 0.42), b0), mix(base * 0.86, uViolet, 0.1), b1), base * mix(vec3(1.0), uWarm * 1.12, 0.12), b2);
        float sp = pow(max(dot(reflect(-uSun, N), V), 0.0), 90.0);
        c = mix(c, uHi, band(sp, 0.7) * sea * 0.9);   // one painted highlight on the water
        float e = dot(N, V);
        c = mix(c, uWarm, band(1.0 - e, 0.94) * b1 * 0.55);
        c = mix(uInk, c, smoothstep(2.0, 3.4, e / max(fwidth(e), 1e-5))); // the ink limb, about three pixels
        gl_FragColor = vec4(c, 1.0);
        #include <colorspace_fragment>
      }`
  });
  G.add(new THREE.Mesh(new THREE.SphereGeometry(1, 320, 160), globeMat));

  /* ---------- crisp coastlines and borders over the paint ---------- */
  const lineMats: LineMaterial[] = [];
  function lineSet(m: GeoJSON.MultiLineString, w: number, opacity: number) {
    const a: number[] = [];
    for (const arc of m.coordinates) for (let i = 0; i < arc.length - 1; i++) { const p = ll2v(arc[i][1], arc[i][0], 1.0003), q = ll2v(arc[i + 1][1], arc[i + 1][0], 1.0003); a.push(p.x, p.y, p.z, q.x, q.y, q.z); }
    const geo = new LineSegmentsGeometry(); geo.setPositions(a);
    const mt = new LineMaterial({ color: C.ink, linewidth: w, transparent: opacity < 1, opacity }); lineMats.push(mt);
    G.add(new LineSegments2(geo, mt));
  }
  lineSet(mesh(topo, topo.objects.countries, (a, b) => a === b) as GeoJSON.MultiLineString, 1.6, 0.95);
  lineSet(mesh(topo, topo.objects.countries, (a, b) => a !== b) as GeoJSON.MultiLineString, 1, 0.45);
  await yieldToMain();

  /* ---------- the trips: an ink line under a mode-coloured one, both in screen pixels ---------- */
  type TripObj = { mode: Mode; ink: LineMaterial; col: LineMaterial; lines: Line2[]; cuts: THREE.Mesh[] };
  const tripObjs: TripObj[] = [];
  const cutGeo = new THREE.SphereGeometry(0.00028, 10, 8), cutMat = new THREE.MeshBasicMaterial({ color: C.ink });
  for (const t of trips) if (t.route) {
    const line = road(t.route, t.mode === 'walk' ? 14 : 40);
    const geo = new LineGeometry(); geo.setPositions(line.flatMap(([la, lo]) => ll2v(la, lo, 1.0009).toArray()));
    const ink = new LineMaterial({ color: C.ink, linewidth: 7.5, transparent: true, depthWrite: false });
    const cm = new LineMaterial({ color: MODE_COL[t.mode], linewidth: 4, transparent: true, depthWrite: false, dashed: t.mode === 'walk', dashSize: 0.00035, gapSize: 0.00022 });
    lineMats.push(ink, cm);
    const a = new Line2(geo, ink), b = new Line2(geo, cm); b.computeLineDistances(); a.renderOrder = 1; b.renderOrder = 2; G.add(a, b);
    // the trimmed ends: the route stops short of where it really began and ended
    const cuts = [line[0], line[line.length - 1]].map(([la, lo]) => { const m = new THREE.Mesh(cutGeo, cutMat); m.position.copy(ll2v(la, lo, 1.0011)); G.add(m); return m; });
    tripObjs.push({ mode: t.mode, ink, col: cm, lines: [a, b], cuts });
  }

  /* ---------- the real Spa line at true scale, kerbed red and white ---------- */
  const spaLines: Line2[] = [];
  {
    const nums = spa.d.slice(1).replace(/[cz]/g, ' $& ').split(/[\s,]+|(?=-)/).filter(Boolean);
    let i = 0, x = +nums[i++], y = +nums[i++]; const pts = [[x, y]];
    while (i < nums.length) {
      if (nums[i] === 'c') i++;
      const q = nums.slice(i, i + 6).map(Number); if (q.length < 6 || q.some(isNaN)) break; i += 6;
      const [x1, y1, x2, y2, x3, y3] = q, X0 = x, Y0 = y;
      for (let k = 1; k <= 8; k++) { const t = k / 8, u = 1 - t; pts.push([u * u * u * X0 + 3 * u * u * t * (X0 + x1) + 3 * u * t * t * (X0 + x2) + t * t * t * (X0 + x3), u * u * u * Y0 + 3 * u * u * t * (Y0 + y1) + 3 * u * t * t * (Y0 + y2) + t * t * t * (Y0 + y3)]); }
      x += x3; y += y3;
    }
    pts.push(pts[0]);
    const m = spa.metresPerUnit / 111320;
    const geo = new LineGeometry(); geo.setPositions(pts.flatMap(([px, py]) => ll2v(spa.lat - (py - spa.centre[1]) * m, spa.lon + (px - spa.centre[0]) * m / Math.cos(spa.lat * D2R), 1.0009).toArray()));
    for (const [c, w, dashed] of [[C.ink, 9, false], [C.white, 5, false], [C.red, 5, true]] as const) {
      const mt = new LineMaterial({ color: c, linewidth: w, transparent: true, depthWrite: false, dashed, dashSize: 0.000012, gapSize: 0.000012 }); lineMats.push(mt);
      const l = new Line2(geo, mt); l.computeLineDistances(); l.renderOrder = 3; G.add(l); spaLines.push(l);
    }
  }

  /* ---------- prints stuck on the globe: cel-painted placeholders in a white border with a strip of tape ---------- */
  await document.fonts.ready;
  const photoMat = (tex: THREE.Texture) => new THREE.ShaderMaterial({
    uniforms: { tMap: { value: tex }, uSun: { value: SUN }, uViolet: { value: col(0x3b3357) } },
    vertexShader: /* glsl */`varying vec2 vUv; varying vec3 vN; void main(){ vUv = uv; vN = normalize(normalMatrix * vec3(0.0, 0.0, 1.0)); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: /* glsl */`uniform sampler2D tMap; uniform vec3 uSun, uViolet; varying vec2 vUv; varying vec3 vN;
      void main(){ vec3 c = texture2D(tMap, vUv).rgb; float l = step(0.05, dot(normalize(vN), uSun)); c = mix(mix(c * 0.55, uViolet, 0.35), c, l); gl_FragColor = vec4(c, 1.0);
      #include <colorspace_fragment>
      }`
  });
  type PhotoObj = { p: Photo; holder: THREE.Group; plane: THREE.Mesh; w: number };
  const photoObjs: PhotoObj[] = [];
  for (const p of photos) {
    const w = 0.0125 * (p.size ?? 1), h = w * 1.2, n = ll2v(p.lat, p.lon).normalize();
    const holder = new THREE.Group(); holder.position.copy(n.clone().multiplyScalar(1.0013)); holder.lookAt(n.clone().multiplyScalar(2)); holder.rotateZ(p.rot * D2R);
    const plane = new THREE.Mesh(new THREE.PlaneGeometry(w, h), photoMat(printTexture(p)));
    plane.position.set(-p.ax * w * 0.5, -p.ay * h * 0.5, 0); // the pinned corner sits on the spot
    const shadow = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: 0x0a0820, transparent: true, opacity: 0.35 }));
    shadow.position.copy(plane.position); shadow.position.z = -0.0003;
    const pin = new THREE.Mesh(new THREE.SphereGeometry(w * 0.07, 14, 10), new THREE.MeshBasicMaterial({ color: C.red }));
    const pinInk = new THREE.Mesh(new THREE.SphereGeometry(w * 0.095, 14, 10), new THREE.MeshBasicMaterial({ color: C.ink, side: THREE.BackSide }));
    pin.position.z = pinInk.position.z = 0.0004;
    holder.add(shadow, plane, pinInk, pin); G.add(holder);
    plane.userData.trip = p.trip; photoObjs.push({ p, holder, plane, w: 0.0125 });
  }

  /* ---------- labels, projected each frame ---------- */
  const LBL = [
    ...countries.filter(c => c.id !== 'lu').map(c => ({ t: c.short ?? c.name, v: ll2v(c.view.lat + 0.6, c.view.lon), lv: 2 })),
    ...trips.filter(t => t.route || t.mode === 'race').map(t => ({ t: t.short ?? t.name, v: ll2v(t.view.lat + 0.1, t.view.lon + 0.15), lv: 0 })),
    { t: 'Japan', v: ll2v(36.4, 138.4), lv: 1 }
  ].map(l => { const e = document.createElement('span'); e.className = 'gl-lbl' + (l.lv ? ' big' : ''); e.textContent = l.t; labelsEl.append(e); return { ...l, e, v: l.v.multiplyScalar(1.001) }; });

  /* ---------- the camera: views, flights, room for the paper ---------- */
  const view: View = { ...overview };
  let overD = 3, room = 0, ox = 0, oxT = 0;
  const views = new Map<string, View>([...countries.map(c => [c.id, c.view] as const), ...trips.map(t => [t.id, t.view] as const)]);
  const target = (id: string): View => id === 'overview' ? { ...overview, d: overD } : views.get(id) ?? { ...overview, d: overD };
  function hitAngle(d: number, p: number) { // where the camera's centre ray meets the globe, as an angle from straight down
    const c = -d * Math.cos(p), disc = c * c - (d * d - 1); if (disc < 0) return Math.acos(1 / d);
    const t = -c - Math.sqrt(disc); return Math.atan2(t * Math.sin(p), d - t * Math.cos(p));
  }
  function apply() {
    const p = view.p * D2R; camera.position.set(0, 0, view.d); camera.rotation.set(p, 0, 0);
    G.rotation.set(view.lat * D2R - hitAngle(view.d, p), -view.lon * D2R, 0);
  }
  let fly: { from: View; to: View; dl: number; t0: number; dur: number; far: number } | null = null;
  const ease = (t: number) => 1 - Math.pow(2, -10 * t);
  function go(id: string) {
    const to = target(id), from = { ...view };
    const dl = ((to.lon - from.lon + 540) % 360) - 180;
    if (RM) { Object.assign(view, to); fly = null; invalidate(); return; }
    const far = Math.abs(dl) > 40 && to.d < 2 && from.d < 2 ? 1.4 : 0; // a long hop lifts off first
    fly = { from, to, dl, t0: performance.now(), dur: far ? 2400 : 1500, far };
  }

  function resize() {
    const r = stage.getBoundingClientRect(); W = Math.max(1, r.width); H = Math.max(1, r.height);
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2)); renderer.setSize(W, H, false);
    camera.aspect = W / H; camera.updateProjectionMatrix();
    f = H / 2 / Math.tan(FOV / 2 * D2R);
    const R = Math.min(H * 0.62, W * 0.8); // the globe's radius on screen at the whole view
    const was = overD; overD = Math.sqrt((f / R) ** 2 + 1);
    if (view.d === 0 || Math.abs(view.d - was) < 1e-6) view.d = overD;
    for (const m of lineMats) m.resolution.set(W, H);
    oxT = centreShift(); invalidate();
  }
  /** how far right the globe sits: a little right of centre, further when the open paper covers the left */
  const centreShift = () => Math.max(W * (W < 760 ? 0.04 : 0.1), room ? room * 0.5 - W * 0.06 : 0);
  new ResizeObserver(resize).observe(stage);

  /* ---------- drag to turn; on touch only sideways, so the page still scrolls ---------- */
  let drag: { x: number; y: number; moved: number; touch: boolean } | null = null;
  canvas.addEventListener('pointerdown', e => {
    drag = { x: e.clientX, y: e.clientY, moved: 0, touch: e.pointerType === 'touch' };
    if (!drag.touch) canvas.setPointerCapture(e.pointerId);
    canvas.classList.add('drag'); fly = null; stage.dispatchEvent(new CustomEvent('globe:touch'));
  });
  canvas.addEventListener('pointermove', e => {
    if (!drag) return;
    const dx = e.clientX - drag.x, dy = drag.touch ? 0 : e.clientY - drag.y;
    drag.x = e.clientX; drag.y = e.clientY; drag.moved += Math.abs(dx) + Math.abs(dy);
    const s = (view.d - 1) * 0.055 * 900 / H;
    view.lon -= dx * s / Math.cos(view.lat * D2R); view.lat = Math.max(-70, Math.min(75, view.lat + dy * s)); invalidate();
  });
  const ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
  const end = (e: PointerEvent) => {
    canvas.classList.remove('drag');
    if (drag && drag.moved < 5) { // a tap on a print flies to its trip
      const r = canvas.getBoundingClientRect(); ndc.set((e.clientX - r.left) / W * 2 - 1, -(e.clientY - r.top) / H * 2 + 1);
      ray.setFromCamera(ndc, camera);
      const hit = ray.intersectObjects(photoObjs.filter(o => o.holder.visible).map(o => o.plane))[0];
      if (hit) hooks.photo(hit.object.userData.trip);
    }
    drag = null;
  };
  canvas.addEventListener('pointerup', end); canvas.addEventListener('pointercancel', () => { drag = null; canvas.classList.remove('drag'); });
  canvas.addEventListener('keydown', e => {
    const k = { ArrowLeft: [0, -1], ArrowRight: [0, 1], ArrowUp: [1, 0], ArrowDown: [-1, 0] }[e.key];
    if (!k) return; e.preventDefault(); fly = null;
    const s = (view.d - 1) * (e.shiftKey ? 30 : 8);
    view.lat = Math.max(-70, Math.min(75, view.lat + k[0] * s)); view.lon += k[1] * s / Math.cos(view.lat * D2R); invalidate();
  });

  /* ---------- the frame: draw only when something moved ---------- */
  let visible = true;
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) invalidate(); }).observe(stage);
  const tmp = new THREE.Vector3(), camW = new THREE.Vector3();
  function frame(now: number) {
    requestAnimationFrame(frame);
    if (!visible) return;
    if (fly) {
      const k = Math.min(1, (now - fly.t0) / fly.dur), e = ease(k), { from, to } = fly;
      view.lat = from.lat + (to.lat - from.lat) * e; view.lon = from.lon + fly.dl * e; view.p = from.p + (to.p - from.p) * e;
      view.d = from.d + (to.d - from.d) * e + fly.far * Math.sin(Math.PI * Math.min(1, k * 1.15)) * (1 - e * 0.3);
      if (k >= 1) fly = null;
      dirty = true;
    }
    if (Math.abs(oxT - ox) > 0.3) { ox = RM ? oxT : ox + (oxT - ox) * 0.08; dirty = true; } else ox = oxT;
    if (!dirty) return;
    dirty = false;
    camera.setViewOffset(W, H, -ox, 0, W, H); apply();
    const far = view.d > 1.6, sc = Math.min(W, H) / 900;
    // prints and lines keep a readable size on screen as the globe comes closer
    const want = (58 + 130 * Math.min(1, Math.max(0, (2.6 - view.d) / 1.56))) * Math.max(0.65, sc);
    for (const o of photoObjs) o.holder.scale.setScalar(want * (view.d - 1) / (o.w * f));
    const lw = far ? 0.55 : 1;
    for (const o of tripObjs) { o.ink.linewidth = 7.5 * lw; o.col.linewidth = 4 * lw; o.cuts.forEach(c => { c.visible = !far && o.lines[0].visible; c.scale.setScalar(4.5 * (view.d - 1) / (0.00028 * f)); }); }
    spaLines.forEach(l => { l.visible = view.d < 1.2 && !off.has('race'); });
    scene.updateMatrixWorld(); camera.updateMatrixWorld(); camera.getWorldPosition(camW);
    for (const L of LBL) {
      tmp.copy(L.v).applyMatrix4(G.matrixWorld);
      const facing = tmp.clone().normalize().dot(camW.clone().sub(tmp).normalize()); tmp.project(camera);
      const x = (tmp.x + 1) / 2 * W, y = (1 - tmp.y) / 2 * H;
      const show = facing > 0.12 && tmp.z < 1 && x > room + 24 && x < W && y > 0 && y < H && (far ? L.lv === 1 : L.lv !== 1) && !(L.lv === 2 && view.d < 1.03);
      L.e.style.opacity = show ? '1' : '0';
      L.e.style.transform = `translate(${x.toFixed(1)}px,${y.toFixed(1)}px) translate(-50%,-50%)`;
    }
    renderer.render(scene, camera);
  }

  let off = new Set<string>();
  function filter(o: Set<string>) {
    off = new Set(o);
    for (const t of tripObjs) { const v = !off.has(t.mode); t.lines.forEach(l => { l.visible = v; }); }
    for (const p of photoObjs) p.holder.visible = !off.has('photo');
    invalidate();
  }

  resize(); view.d = overD; ox = oxT;
  requestAnimationFrame(frame);
  stage.classList.add('live');
  return { go, filter, room(px) { room = px; oxT = centreShift(); invalidate(); } };
}

/** a placeholder print: a flat cel scene in a white border, its caption, and a strip of tape */
function printTexture(p: Photo) {
  const c = document.createElement('canvas'); c.width = 300; c.height = 360; const g = c.getContext('2d')!;
  g.fillStyle = '#0A1330'; g.fillRect(0, 0, 300, 360);
  g.fillStyle = '#F7F8FA'; g.fillRect(7, 7, 286, 346);
  g.fillStyle = '#E4E2DC'; g.fillRect(7, 300, 286, 53);
  scene(g, p.scene, 22, 22, 256, 248);
  g.strokeStyle = '#0A1330'; g.lineWidth = 3; g.strokeRect(22, 22, 256, 248);
  g.fillStyle = '#13254F'; g.font = 'italic 600 27px "Hanken Grotesk Variable", sans-serif'; g.fillText(p.caption, 26, 312);
  g.font = '600 13px "JetBrains Mono Variable", monospace'; g.fillStyle = '#E2001A'; g.fillText((p.exif ?? 'Sample · placed by hand').toUpperCase(), 26, 338);
  g.save(); g.translate(150, 12); g.rotate(-0.12); g.fillStyle = 'rgba(228,214,178,.9)'; g.fillRect(-58, -16, 116, 34); g.restore();
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t;
}
function scene(g: CanvasRenderingContext2D, kind: Photo['scene'], x: number, y: number, w: number, h: number) {
  const band = (cols: [string, number, number][]) => cols.forEach(([c, t, b]) => { g.fillStyle = c; g.fillRect(x, y + h * t, w, h * (b - t)); });
  const poly = (c: string, pts: number[][]) => { g.fillStyle = c; g.beginPath(); pts.forEach(([a, b], i) => i ? g.lineTo(x + a * w, y + b * h) : g.moveTo(x + a * w, y + b * h)); g.closePath(); g.fill(); };
  const stroke = (c: string, wd: number, pts: number[][]) => { g.strokeStyle = c; g.lineWidth = wd; g.lineJoin = 'round'; g.lineCap = 'round'; g.beginPath(); pts.forEach(([a, b], i) => i ? g.lineTo(x + a * w, y + b * h) : g.moveTo(x + a * w, y + b * h)); g.stroke(); };
  if (kind === 'eau') {
    band([['#F6A24E', 0, .2], ['#E9733F', .2, .36], ['#C24A4A', .36, .5]]);
    poly('#2F7A4A', [[0, .42], [.3, .34], [.6, .4], [1, .3], [1, 1], [0, 1]]); poly('#1F5A3A', [[0, .6], [.5, .5], [1, .55], [1, 1], [0, 1]]);
    poly('#6B6F7E', [[.05, 1], [.36, .66], [.62, .5], [.95, .36], [1, .42], [.7, .58], [.48, .76], [.42, 1]]);
    stroke('#E2001A', 7, [[.08, .98], [.37, .68], [.62, .53], [.94, .4]]); stroke('#F7F8FA', 7, [[.37, .68], [.94, .4]]);
    poly('#13254F', [[.5, .64], [.64, .57], [.68, .6], [.55, .68]]); stroke('#E2001A', 3, [[.52, .65], [.66, .58]]);
  } else if (kind === 'hairpin') {
    band([['#F2B35A', 0, .18], ['#D46A3E', .18, .3]]);
    poly('#2A5A3E', [[0, .3], [.4, .2], [1, .28], [1, 1], [0, 1]]); poly('#1D4530', [[0, .55], [1, .45], [1, 1], [0, 1]]);
    const hp = [[.1, 1], [.2, .62], [.7, .5], [.78, .4], [.3, .32], [.4, .24]]; stroke('#5E6170', 16, hp); stroke('#F7F8FA', 2, hp);
  } else if (kind === 'cliffs') {
    band([['#FFC07A', 0, .22], ['#F08A5A', .22, .4], ['#24407A', .4, .7], ['#1A2F5E', .7, 1]]);
    poly('#F2EEE6', [[.25, .52], [.35, .34], [.5, .4], [.62, .3], [.8, .36], [1, .3], [1, .62], [.6, .66], [.3, .66]]);
    poly('#D9D1C2', [[.35, .34], [.4, .66], [.3, .66], [.25, .52]]); poly('#D9D1C2', [[.62, .3], [.66, .64], [.56, .65], [.5, .4]]);
    poly('#4E8A4E', [[.25, .52], [.35, .32], [.5, .38], [.62, .28], [.8, .34], [1, .27], [1, .31], [.8, .37], [.62, .31], [.5, .41], [.35, .35]]);
  } else if (kind === 'forest') {
    band([['#F4B054', 0, .25], ['#E07B3C', .25, .4]]);
    for (let i = 0; i < 9; i++) poly(i % 2 ? '#1D4530' : '#2A5A3E', [[i * .12 - .05, .75], [i * .12 + .05, .25 + (i % 3) * .06], [i * .12 + .15, .75]]);
    poly('#24407A', [[0, .78], [1, .7], [1, 1], [0, 1]]); poly('#3A63A6', [[0, .84], [1, .78], [1, .82], [0, .9]]);
    poly('#A9AEBB', [[.62, .5], [.7, .36], [.78, .5]]); poly('#6B6F7E', [[.6, .5], [.8, .5], [.8, .64], [.6, .64]]);
  } else {
    band([['#3A2453', 0, .16], ['#B44A48', .16, .3], ['#E07B3C', .3, .44], ['#F4B054', .44, .55]]);
    poly('#4C3A6E', [[0, .78], [.3, .62], [.5, .26], [.58, .26], [.8, .6], [1, .7], [1, 1], [0, 1]]);
    poly('#F7F8FA', [[.43, .38], [.5, .26], [.58, .26], [.66, .4], [.6, .36], [.54, .41], [.49, .36]]);
    poly('#24407A', [[0, .8], [1, .74], [1, 1], [0, 1]]); poly('#F4B054', [[.44, .82], [.62, .8], [.6, .83], [.46, .85]]);
  }
}
