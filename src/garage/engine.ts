// The garage engine: builds the room and every zone, inks them, draws on demand (shadow shapes, a normals
// pass for creases, the cel paint with its hulls, the crease ink), and runs the camera, picking, the caption
// box and the history. Zones plug in through src/garage/zone.ts; nothing here knows what a hobby is.
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import type { ZoneId } from '../data/garage';
import type { RunCtx, Zone } from './zone';
import { ZONES } from './zones';
import { U, INK, RED, BG } from './toon';
import { fontsReady } from './paint';
import { buildRoom } from './room';
import { V2, V3, UPV, clamp, lerp } from './kit';

THREE.ColorManagement.enabled = false;

export async function boot(stage: HTMLElement) {
  const $ = <T extends Element>(s: string) => stage.querySelector<T>(s)!;
  const canvas = $<HTMLCanvasElement>('[data-gl]');
  const hoverLabel = $<HTMLElement>('[data-hover-label]');
  const hotbar = $<HTMLElement>('[data-hotbar]');
  const dbox = $<HTMLElement>('[data-dbox]');
  const dTitle = $<HTMLElement>('[data-title]');
  const html = document.documentElement;
  const mqRM = matchMedia('(prefers-reduced-motion: reduce)'), mqDark = matchMedia('(prefers-color-scheme: dark)');
  let RM = mqRM.matches;
  // the draw loop's clock; declared first because building and mounting the zones already asks for a frame
  let raf = 0, last = performance.now(), visible = true;

  let renderer: THREE.WebGLRenderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: 'high-performance' });
    if (!renderer.getContext()) throw new Error('no WebGL');
  } catch {
    stage.classList.add('no-gl');
    $<HTMLElement>('[data-fallback]').hidden = false;
    return;
  }
  renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
  renderer.autoClear = false;
  await fontsReady();

  /* ---------- build: in stages, giving the main thread back between them so the page stays responsive ---------- */
  const yieldToMain = () => new Promise<void>(r => { const sch = (globalThis as { scheduler?: { yield?: () => Promise<void> } }).scheduler; if (sch?.yield) sch.yield().then(r); else setTimeout(r, 0); });
  const scene = new THREE.Scene();
  const root = new THREE.Group(); scene.add(root);
  const env = new THREE.Group(); env.userData.ink = 1.6; root.add(env);
  const room = buildRoom(env, root);
  const Z = new Map<ZoneId, { zone: Zone; group: THREE.Group; panel: HTMLElement }>();
  const ITEMS = new Map<string, THREE.Group>(); // "zone:item"
  for (const zone of ZONES) {
    await yieldToMain();
    const g = new THREE.Group(); g.userData.zone = zone.id; g.userData.ink = zone.ink ?? 1.5; root.add(g);
    zone.build(g, { env, root, item: (id, ig) => { ig.userData.item = id; ITEMS.set(zone.id + ':' + id, ig); } });
    Z.set(zone.id, { zone, group: g, panel: dbox.querySelector<HTMLElement>(`[data-panel="${zone.id}"]`)! });
  }
  for (const G of [env, ...[...Z.values()].map(z => z.group), ...ITEMS.values()]) { mergeIn(G); await yieldToMain(); }
  const HULLS = inkHulls(root);

  /* ---------- lamps' hard shadow shapes, the crease pass ---------- */
  const SHSZ = 2048;
  const distMat = new THREE.ShaderMaterial({
    uniforms: { uLP: { value: V3() } }, side: THREE.DoubleSide,
    vertexShader: `varying vec3 vW; void main(){ vec4 w = modelMatrix * vec4(position,1.); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }`,
    fragmentShader: `uniform vec3 uLP; varying vec3 vW; void main(){ gl_FragColor = vec4(length(vW - uLP) * 0.1, 0., 0., 1.); }`
  });
  const SHADOWS = U.uLampP.value.map((lp, i) => {
    const cam = new THREE.PerspectiveCamera(132, 1, 0.05, 8); cam.position.copy(lp); cam.up.set(0, 0, -1); cam.lookAt(lp.x, 0, lp.z); cam.updateMatrixWorld(); cam.updateProjectionMatrix();
    const rt = new THREE.WebGLRenderTarget(SHSZ, SHSZ, { type: THREE.HalfFloatType, minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter, depthBuffer: true, generateMipmaps: false });
    const Mx = new THREE.Matrix4().multiplyMatrices(cam.projectionMatrix, cam.matrixWorldInverse);
    (i ? U.uShM1 : U.uShM0).value.copy(Mx); (i ? U.tSh1 : U.tSh0).value = rt.texture;
    return { cam, rt, lp };
  });
  let shadowsDirty = true;
  function renderShadows() {
    for (const s of SHADOWS) { distMat.uniforms.uLP.value.copy(s.lp); renderer.setRenderTarget(s.rt); renderer.setClearColor(0xffffff, 1); renderer.clear(); scene.overrideMaterial = distMat; renderer.render(scene, s.cam); }
    scene.overrideMaterial = null; renderer.setRenderTarget(null); shadowsDirty = false;
  }
  const ndRT = new THREE.WebGLRenderTarget(4, 4, { type: THREE.HalfFloatType, minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter, depthBuffer: true, generateMipmaps: false });
  const ndMat = new THREE.ShaderMaterial({
    side: THREE.DoubleSide,
    vertexShader: `varying vec3 vN; varying float vZ; void main(){ vec4 mv = modelViewMatrix * vec4(position,1.); vZ = -mv.z; vN = normalize(normalMatrix * normal); gl_Position = projectionMatrix * mv; }`,
    fragmentShader: `varying vec3 vN; varying float vZ; void main(){ vec3 n = normalize(vN); if (!gl_FrontFacing) n = -n; gl_FragColor = vec4(n * 0.5 + 0.5, vZ); }`
  });
  const inkMat = new THREE.ShaderMaterial({
    transparent: true, depthTest: false, depthWrite: false,
    uniforms: { tND: { value: ndRT.texture }, uInv: { value: V2(1, 1) }, uPx: { value: 1 }, uInk: { value: new THREE.Color(INK) } },
    vertexShader: `void main(){ gl_Position = vec4(position.xy, 0.0, 1.0); }`,
    fragmentShader: `uniform sampler2D tND; uniform vec2 uInv; uniform float uPx; uniform vec3 uInk;
      vec4 S(vec2 uv){ vec4 c = texture2D(tND, uv); if (c.a <= 0.0) c = vec4(0.5, 0.5, 1.0, 60.0); return c; }
      void main(){
        vec2 uv = gl_FragCoord.xy * uInv, o = uInv * uPx;
        vec4 c = texture2D(tND, uv); bool bg = c.a <= 0.0; c = S(uv);
        vec4 l = S(uv - vec2(o.x, 0.)), r = S(uv + vec2(o.x, 0.)), d = S(uv - vec2(0., o.y)), u = S(uv + vec2(0., o.y));
        float z = c.a;
        float lap = abs(l.a + r.a - 2.0 * z) + abs(u.a + d.a - 2.0 * z);
        float de = smoothstep(0.018, 0.05, lap / z);
        vec3 n = c.rgb * 2.0 - 1.0;
        float nd = max(max(1.0 - dot(n, l.rgb * 2.0 - 1.0), 1.0 - dot(n, r.rgb * 2.0 - 1.0)), max(1.0 - dot(n, u.rgb * 2.0 - 1.0), 1.0 - dot(n, d.rgb * 2.0 - 1.0)));
        float ne = smoothstep(0.22, 0.45, nd) * (bg ? 0.0 : 1.0);
        float e = max(de, ne) * smoothstep(9.0, 4.0, z);
        gl_FragColor = vec4(uInk, e * 0.82);
      }`
  });
  const postScene = new THREE.Scene(), postCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  { const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(new Float32Array([-1, -1, 0, 3, -1, 0, -1, 3, 0]), 3)); const q = new THREE.Mesh(g, inkMat); q.frustumCulled = false; postScene.add(q); }

  /* ---------- camera ---------- */
  const camera = new THREE.PerspectiveCamera(50, 16 / 9, 0.05, 30);
  let cssW = 1, cssH = 1, mobile = false, fovBase = 50;
  function resize() {
    if (!stage.clientWidth) return; // hidden behind the pit limiter
    cssW = stage.clientWidth; cssH = stage.clientHeight; mobile = cssW < 720;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    renderer.setPixelRatio(dpr); renderer.setSize(cssW, cssH, false);
    const W = canvas.width, H = canvas.height;
    ndRT.setSize(W, H); HU.uRes.value.set(W, H); HU.uDpr.value = dpr;
    inkMat.uniforms.uInv.value.set(1 / W, 1 / H); inkMat.uniforms.uPx.value = Math.max(1, Math.round(dpr * 0.9));
    camera.aspect = cssW / cssH;
    // keep the room's height in frame on narrow screens, without going fisheye on wide ones
    const halfH = Math.atan(Math.tan(THREE.MathUtils.degToRad(25)) * 1.6);
    fovBase = clamp(THREE.MathUtils.radToDeg(2 * Math.atan(Math.tan(halfH) / camera.aspect)), 46, 66);
    // a resize (a phone turning, a window dragged) reframes the current shot instead of keeping a stale one
    if (!fly) { const s = viewFor(state.open); cam.pos.copy(s.pos); cam.target.copy(s.target); cam.shift.copy(s.shift); cam.fov = s.fov; }
    invalidate();
  }
  new ResizeObserver(resize).observe(stage);

  const HOME = { pos: [0.15, 1.66, 3.55], target: [-0.05, 0.9, -1.2] };
  const cam = { pos: V3(...HOME.pos), target: V3(...HOME.target), shift: V2(0, 0), fov: 50 };
  type Shot = { pos: THREE.Vector3; target: THREE.Vector3; shift: THREE.Vector2; fov: number };
  let fly: null | { t: number; dur: number; from: Shot; to: Shot } = null;
  const par = { gx: 0, gy: 0, x: 0, y: 0, pan: 0, scroll: 0 };
  function viewFor(id: ZoneId | null): Shot {
    const v = id ? Z.get(id)!.zone.view : HOME; const pos = V3(...v.pos), target = V3(...v.target);
    if (id && camera.aspect < 0.9) pos.sub(target).multiplyScalar(clamp(0.78 / camera.aspect, 1, 1.5)).add(target);
    let fov = fovBase;
    if (!id && camera.aspect < 1.3) {
      const k = clamp((1.3 - camera.aspect) / 0.6, 0, 1); pos.z += 0.35 * k; pos.y += 0.1 * k;
      // portrait phones: step back past the door line and widen the lens, so the home shot still holds the whole room
      const p = clamp((0.9 - camera.aspect) / 0.36, 0, 1); pos.z += 0.8 * p; pos.y += 0.1 * p; fov = Math.min(78, fovBase + 12 * p);
    }
    // the caption box covers the right (or the bottom on phones): shift the frame so the object sits clear of it
    const shift = id ? (mobile ? V2(0, 0.26) : V2((Math.min(470, cssW * 0.4) + 24) / cssW / 2, 0)) : V2(0, 0);
    return { pos, target, shift, fov };
  }
  function flyTo(id: ZoneId | null, cut = false) {
    const to = viewFor(id);
    if (cut || RM) { cam.pos.copy(to.pos); cam.target.copy(to.target); cam.shift.copy(to.shift); cam.fov = to.fov; fly = null; invalidate(); return; }
    fly = { t: 0, dur: 1.0, from: { pos: cam.pos.clone(), target: cam.target.clone(), shift: cam.shift.clone(), fov: cam.fov }, to };
    invalidate();
  }
  const _right = V3(), _up = V3(), _fwd = V3();
  function applyCamera() {
    const p = cam.pos.clone(), t = cam.target.clone();
    _fwd.copy(t).sub(p).normalize(); _right.crossVectors(_fwd, UPV).normalize(); _up.crossVectors(_right, _fwd);
    const k = state.open ? 0.25 : 1;
    p.addScaledVector(_right, par.x * 0.2 * k).addScaledVector(_up, par.y * 0.1 * k);
    if (!state.open) { p.x += par.pan * 0.6; t.x += par.pan * 1.5; t.y += par.scroll * 0.35; }
    camera.position.copy(p); camera.lookAt(t);
    if (camera.fov !== cam.fov) { camera.fov = cam.fov; camera.updateProjectionMatrix(); }
    if (cam.shift.x || cam.shift.y) camera.setViewOffset(cssW, cssH, cam.shift.x * cssW, cam.shift.y * cssH, cssW, cssH); else camera.clearViewOffset();
    camera.updateMatrixWorld();
    room.parallax(par.x, par.y, state.open ? 0.4 : 1);
  }

  /* ---------- state, the run context zones get ---------- */
  const state = { open: null as ZoneId | null, item: new Map<ZoneId, string>(), focusHover: null as string | null, lamps: true, night: false };
  const run: RunCtx = {
    invalidate: () => invalidate(),
    get rm() { return RM; },
    get open() { return state.open; },
    outline: (k) => setOutline(k),
    select: (item) => { if (state.open) selectItem(state.open, item); },
    get lamps() { return state.lamps; },
    set lamps(v: boolean) { state.lamps = v; invalidate(); }
  };
  for (const { zone, panel } of Z.values()) { zone.mount?.(panel, run); if (zone.items) state.item.set(zone.id, zone.items[0]); }

  /* ---------- picking, hover, the red outline ---------- */
  const raycaster = new THREE.Raycaster();
  const pickables = [...Z.values()].map(z => z.group);
  function hitAt(cx: number, cy: number) {
    raycaster.setFromCamera(V2(cx / cssW * 2 - 1, -(cy / cssH) * 2 + 1), camera);
    for (const h of raycaster.intersectObjects(pickables, true)) {
      let o: THREE.Object3D | null = h.object, zone: ZoneId | null = null, it: string | null = null;
      while (o) { if (o.userData.item && !it) it = o.userData.item; if (o.userData.zone) { zone = o.userData.zone; break; } o = o.parent; }
      if (zone) return { zone, item: it };
    }
    return null;
  }
  const screenOf = (v: THREE.Vector3) => { const p = v.clone().project(camera); return { x: (p.x + 1) / 2 * cssW, y: (1 - p.y) / 2 * cssH }; };
  function anchorOf(key: string) {
    const g = key.includes(':') ? ITEMS.get(key)! : Z.get(key as ZoneId)!.group; const b = new THREE.Box3();
    g.traverse(o => { const m = o as THREE.Mesh; if (m.isMesh && m.visible && !m.userData.isHull && m.layers.mask & 1) { m.geometry.computeBoundingBox(); b.union(m.geometry.boundingBox!.clone().applyMatrix4(m.matrixWorld)); } });
    return V3((b.min.x + b.max.x) / 2, b.max.y + 0.04, (b.min.z + b.max.z) / 2);
  }
  let outlined: string | null = null, labelAnchor: THREE.Vector3 | null = null;
  function refreshHulls() {
    const sel = state.open && Z.get(state.open)!.zone.items ? state.item.get(state.open) : null;
    for (const h of HULLS) {
      let mode = 0;
      if (outlined) { const [z, it] = outlined.split(':'); if (it ? h.userData.zone === z && h.userData.item === it : h.userData.zone === z) mode = 2; }
      if (!mode && sel && h.userData.zone === state.open && h.userData.item === sel) mode = 1;
      const u = (h.material as THREE.ShaderMaterial).uniforms; u.uCol.value.setHex(mode ? RED : INK); u.uW.value = h.userData.base + (mode === 2 ? 1.7 : mode === 1 ? 1.2 : 0);
    }
    invalidate();
  }
  function setOutline(key: string | null) { if (outlined === key) return; outlined = key; refreshHulls(); }
  const nameOf = (id: ZoneId) => Z.get(id)!.panel.dataset.name ?? id;
  const itemName = (key: string) => stage.querySelector<HTMLElement>(`[data-item="${key.split(':')[1]}"]`)?.textContent?.trim() ?? key;
  function showLabel(key: string | null, xy?: { x: number; y: number }) {
    if (!key) { hoverLabel.classList.remove('on'); labelAnchor = null; return; }
    const [verb, name] = key.includes(':') ? ['Pick up', itemName(key)] : [state.open ? 'Go to' : 'Look at', nameOf(key as ZoneId)];
    const sp = hoverLabel.querySelector('span')!; sp.replaceChildren(); const sm = document.createElement('small'); sm.textContent = verb; sp.append(sm, ' ' + name);
    hoverLabel.classList.add('on');
    if (xy) { labelAnchor = null; placeLabel(xy.x + 18, xy.y + 14); } else { labelAnchor = anchorOf(key); placeLabelAnchor(); }
  }
  function placeLabel(x: number, y: number) { const w = hoverLabel.offsetWidth, h = hoverLabel.offsetHeight; x = clamp(x, 8, cssW - w - 8); y = clamp(y, 8, cssH - h - 8); hoverLabel.style.transform = `translate3d(${Math.round(x)}px,${Math.round(y)}px,0)`; }
  function placeLabelAnchor() { if (!labelAnchor) return; const s = screenOf(labelAnchor); placeLabel(s.x - hoverLabel.offsetWidth / 2, s.y - hoverLabel.offsetHeight - 10); }
  function hoverKey(h: ReturnType<typeof hitAt>) {
    if (!h) return null;
    if (state.open === h.zone) return Z.get(h.zone)!.zone.items && h.item ? h.zone + ':' + h.item : null;
    return h.zone;
  }

  let pendingMove: { x: number; y: number } | null = null, drag: null | { x: number; pan: number; moved: boolean } = null;
  const local = (e: PointerEvent | MouseEvent) => { const r = stage.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; };
  canvas.addEventListener('pointermove', (e) => {
    const p = local(e);
    if (e.pointerType === 'mouse') { pendingMove = p; invalidate(); }
    // touch: a sideways drag pans the room a little (the page still scrolls vertically: touch-action pan-y)
    if (drag && e.pointerType !== 'mouse') { const dx = (p.x - drag.x) / cssW; drag.moved ||= Math.abs(p.x - drag.x) > 8; par.pan = clamp(drag.pan - dx * 2.2, -1, 1); invalidate(); }
  });
  canvas.addEventListener('pointerleave', () => { pendingMove = null; if (!state.focusHover) { setOutline(null); showLabel(null); } canvas.classList.remove('hot'); });
  canvas.addEventListener('pointerdown', (e) => { if (e.pointerType !== 'mouse' && !state.open) drag = { x: local(e).x, pan: par.pan, moved: false }; });
  window.addEventListener('pointerup', () => setTimeout(() => { drag = null; }, 0));
  canvas.addEventListener('click', (e) => {
    if (drag?.moved) return;
    const p = local(e); const h = hitAt(p.x, p.y);
    if (!h) { if (state.open) closeZone(); return; }
    if (state.open === h.zone) { if (h.item && Z.get(h.zone)!.zone.items) selectItem(h.zone, h.item); return; }
    go(h.zone, h.item ?? undefined);
  });
  stage.addEventListener('pointermove', (e) => { if (e.pointerType !== 'mouse' || RM) return; const r = stage.getBoundingClientRect(); par.gx = ((e.clientX - r.left) / r.width) * 2 - 1; par.gy = -(((e.clientY - r.top) / r.height) * 2 - 1); invalidate(); });
  stage.addEventListener('pointerleave', () => { par.gx = 0; par.gy = 0; invalidate(); });
  // native scroll tilts the view down a little as the room leaves the screen; it never moves the page
  window.addEventListener('scroll', () => { if (RM) return; par.scroll = clamp(window.scrollY / Math.max(1, stage.offsetHeight), 0, 1); invalidate(); }, { passive: true });

  /* ---------- light: night race outside, the lamps inside ---------- */
  let nightT = 0, lampT = 1;
  const isNight = () => (html.dataset.theme ? html.dataset.theme === 'night' : mqDark.matches);
  function applyLight() {
    U.uLampI.value[0] = 1.75 * lampT; U.uLampI.value[1] = 2.05 * lampT;
    U.uAmb.value = lerp(0.1, 0.07, Math.max(nightT, 1 - lampT)); U.uWarm.value = lampT;
    U.uWinC.value.setHex(0x9a86e0).lerp(new THREE.Color(0x6a7cd8), nightT);
    room.light(nightT, lampT);
    for (const { zone } of Z.values()) zone.light?.(nightT, lampT);
  }

  /* ---------- the loop: draws only while something changes ---------- */
  function invalidate() { if (!raf && visible) raf = requestAnimationFrame(frame); }
  function frame(now: number) {
    raf = 0; if (!stage.clientWidth) return;
    const dt = Math.min(0.05, (now - last) / 1000); last = now; let busy = false;
    if (fly) {
      fly.t += dt; const p = Math.min(1, fly.t / fly.dur), e = (1 - Math.pow(2, -10 * p)) / (1 - Math.pow(2, -10));
      cam.pos.lerpVectors(fly.from.pos, fly.to.pos, e); cam.target.lerpVectors(fly.from.target, fly.to.target, e); cam.shift.lerpVectors(fly.from.shift, fly.to.shift, e); cam.fov = lerp(fly.from.fov, fly.to.fov, e);
      if (p >= 1) fly = null; else busy = true;
    }
    const kp = 1 - Math.exp(-dt * 5); par.x += (par.gx - par.x) * kp; par.y += (par.gy - par.y) * kp;
    if (Math.abs(par.gx - par.x) > 0.002 || Math.abs(par.gy - par.y) > 0.002) busy = true;
    const nt = state.night ? 1 : 0, lt = state.lamps ? 1 : 0;
    if (nightT !== nt || lampT !== lt) {
      nightT = RM ? nt : clamp(nightT + Math.sign(nt - nightT) * dt * 2.2, 0, 1);
      lampT = RM ? lt : clamp(lampT + Math.sign(lt - lampT) * dt * 2.2, 0, 1);
      if (nightT !== nt || lampT !== lt) busy = true;
      applyLight();
    }
    for (const { zone } of Z.values()) if (zone.tick?.(now, dt, run)) busy = true;
    applyCamera();
    if (pendingMove) {
      const key = hoverKey(hitAt(pendingMove.x, pendingMove.y));
      canvas.classList.toggle('hot', !!key);
      if (key) { state.focusHover = null; setOutline(key); showLabel(key, pendingMove); }
      else if (!state.focusHover) { setOutline(null); showLabel(null); }
      pendingMove = null;
    }
    if (labelAnchor) placeLabelAnchor();
    if (shadowsDirty) renderShadows();
    // pass 1: normals and depth for the crease ink
    camera.layers.set(0); camera.layers.enable(3);
    renderer.setRenderTarget(ndRT); renderer.setClearColor(0x000000, 0); renderer.clear();
    scene.overrideMaterial = ndMat; renderer.render(scene, camera); scene.overrideMaterial = null;
    // pass 2: the cel paint, the inverted-hull ink and the painted glows
    camera.layers.enableAll();
    renderer.setRenderTarget(null); renderer.setClearColor(BG, 1); renderer.clear(); renderer.render(scene, camera);
    // pass 3: crease lines laid over the paint
    renderer.render(postScene, postCam);
    if (busy) invalidate();
  }
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) invalidate(); }).observe(stage);

  /* ---------- zones: open, close, history ---------- */
  const hb = new Map<ZoneId, HTMLButtonElement>();
  hotbar.querySelectorAll<HTMLButtonElement>('[data-zone]').forEach(b => {
    const id = b.dataset.zone as ZoneId; hb.set(id, b);
    b.addEventListener('click', () => go(id));
    const on = () => { state.focusHover = id; if (state.open !== id) { setOutline(id); showLabel(id); } };
    const off = () => { if (state.focusHover === id) { state.focusHover = null; setOutline(null); showLabel(null); } };
    b.addEventListener('focus', on); b.addEventListener('mouseenter', on); b.addEventListener('blur', off); b.addEventListener('mouseleave', off);
  });
  let lastTrigger: HTMLElement | null = null;
  const hashFor = (id: ZoneId, item?: string) => '#' + id + (item ? '/' + item : '');
  function go(id: ZoneId, item?: string) {
    const h = hashFor(id, item && Z.get(id)!.zone.items ? item : undefined);
    if (location.hash !== h) history.pushState({ garage: id, fromHome: !state.open }, '', h);
    openZone(id, false, item);
  }
  function closeZone() {
    if (!state.open) return;
    if (history.state?.fromHome) history.back();
    else { history.pushState(null, '', location.pathname + location.search); doClose(); }
  }
  function doClose() {
    const was = state.open; if (!was) return;
    state.open = null; stage.classList.remove('zoomed');
    Z.get(was)!.zone.close?.(run);
    dbox.classList.remove('on'); setTimeout(() => { if (!state.open) dbox.hidden = true; }, RM ? 0 : 260);
    hb.forEach(b => b.removeAttribute('aria-current'));
    outlined = null; refreshHulls(); showLabel(null); flyTo(null);
    const t = lastTrigger && document.contains(lastTrigger) ? lastTrigger : hb.get(was); t?.focus({ preventScroll: true });
  }
  function openZone(id: ZoneId, cut: boolean, item?: string) {
    const z = Z.get(id); if (!z) return;
    const prev = state.open;
    if (prev && prev !== id) Z.get(prev)!.zone.close?.(run);
    const ae = document.activeElement as HTMLElement | null;
    lastTrigger = ae && ae !== document.body && !dbox.contains(ae) ? ae : hb.get(id) ?? null;
    state.open = id;
    if (item && z.zone.items?.includes(item)) state.item.set(id, item);
    stage.classList.add('zoomed'); outlined = null; showLabel(null); state.focusHover = null;
    hb.forEach((b, k) => k === id ? b.setAttribute('aria-current', 'true') : b.removeAttribute('aria-current'));
    dTitle.textContent = nameOf(id);
    Z.forEach(({ panel }, k) => { panel.hidden = k !== id; });
    if (z.zone.items) z.zone.select?.(state.item.get(id)!, z.panel, run);
    refreshHulls();
    dbox.hidden = false; requestAnimationFrame(() => dbox.classList.add('on'));
    z.zone.open?.(run);
    flyTo(id, cut);
    const r = stage.getBoundingClientRect(); if (r.top < -40 || r.bottom > innerHeight + 40) stage.scrollIntoView({ behavior: RM ? 'auto' : 'smooth', block: 'start' });
    dTitle.focus({ preventScroll: true });
  }
  function selectItem(id: ZoneId, item: string, fromHash = false) {
    const z = Z.get(id)!; if (!z.zone.items?.includes(item)) return;
    state.item.set(id, item);
    if (!fromHash) history.replaceState(history.state, '', hashFor(id, item));
    if (state.open === id) z.zone.select?.(item, z.panel, run);
    outlined = null; refreshHulls(); showLabel(null);
  }
  function applyHash(cut: boolean) {
    const [id, it] = location.hash.slice(1).split('/') as [ZoneId, string | undefined];
    if (id && Z.has(id)) {
      if (state.open === id) { if (it) selectItem(id, it, true); return; }
      openZone(id, cut, it);
    } else if (state.open) doClose();
  }
  window.addEventListener('popstate', () => applyHash(false));
  $<HTMLButtonElement>('[data-back]').addEventListener('click', closeZone);
  window.addEventListener('keydown', (e) => { if (e.key === 'Escape' && state.open) { e.preventDefault(); closeZone(); } });
  document.querySelectorAll<HTMLButtonElement>('[data-go]').forEach(b => b.addEventListener('click', () => {
    stage.scrollIntoView({ behavior: RM ? 'auto' : 'smooth', block: 'start' }); go(b.dataset.go as ZoneId);
  }));

  /* ---------- the shell: night race, pit limiter, reduced motion ---------- */
  const syncShell = () => {
    state.night = isNight();
    if (html.classList.contains('limiter') && state.open) doClose();
    invalidate();
  };
  new MutationObserver(syncShell).observe(html, { attributes: true, attributeFilter: ['data-theme', 'class'] });
  mqDark.addEventListener('change', syncShell);
  mqRM.addEventListener('change', (e) => { RM = e.matches; if (RM) { par.gx = par.gy = par.x = par.y = par.scroll = 0; } invalidate(); });

  // boot: start in the right light without a ramp, and open a linked zone straight away
  state.night = isNight(); nightT = state.night ? 1 : 0; applyLight();
  resize(); applyHash(true);
  // compile every program before the first frame (in parallel where the driver allows), then paint it straight
  // away, so the canvas already holds the garage when it fades in over the painted still
  camera.layers.enableAll();
  try { await renderer.compileAsync(scene, camera); } catch { /* compiles on first draw instead */ }
  frame(performance.now());
  stage.classList.add('live');
}

/* ---------- merge static meshes per material, then ink every solid with an inverted hull ---------- */
function mergeIn(G: THREE.Object3D) {
  G.updateMatrixWorld(true);
  const inv = G.matrixWorld.clone().invert(), buckets = new Map<string, { mat: THREE.Material; noHull: boolean; gs: THREE.BufferGeometry[] }>(), take: THREE.Mesh[] = [];
  (function walk(o: THREE.Object3D) {
    for (const c of o.children) {
      if (c.userData.noMerge || c.userData.item || (c.userData.zone && c !== G)) continue;
      const m = c as THREE.Mesh;
      if (m.isMesh && m.visible && (m.material as THREE.Material).userData.toon && m.layers.mask === 1) take.push(m);
      walk(c);
    }
  })(G);
  for (const m of take) {
    const g = m.geometry.index ? m.geometry.toNonIndexed() : m.geometry.clone();
    g.applyMatrix4(new THREE.Matrix4().multiplyMatrices(inv, m.matrixWorld));
    for (const k of Object.keys(g.attributes)) if (!['position', 'normal', 'uv'].includes(k)) g.deleteAttribute(k);
    if (!g.attributes.uv) g.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(g.attributes.position.count * 2), 2));
    g.morphAttributes = {}; g.clearGroups();
    const mat = m.material as THREE.Material, key = mat.uuid + (m.userData.noHull ? 'n' : 'h');
    if (!buckets.has(key)) buckets.set(key, { mat, noHull: !!m.userData.noHull, gs: [] });
    buckets.get(key)!.gs.push(g); m.parent!.remove(m);
  }
  for (const b of buckets.values()) { const merged = mergeGeometries(b.gs, false); if (merged) { const mesh = new THREE.Mesh(merged, b.mat); mesh.userData.noHull = b.noHull; G.add(mesh); } }
}

const HU = { uRes: { value: V2(1, 1) }, uDpr: { value: 1 } };
const HVS = `attribute vec3 aSN; uniform float uW; uniform vec2 uRes; uniform float uDpr;
void main(){
  vec4 clip = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  vec3 vn = normalize(normalMatrix * aSN);
  vec2 dir = (projectionMatrix * vec4(vn, 0.0)).xy * uRes; float l = length(dir); dir = l > 1e-6 ? dir / l : vec2(0.0);
  float w = uW * uDpr * clamp(2.6 / clip.w, 0.55, 1.35);
  clip.xy += dir * w * 2.0 / uRes * clip.w;
  gl_Position = clip;
}`;
/** smoothed normals per welded position, so the hull pushes out evenly across hard edges */
function addSN(g: THREE.BufferGeometry) {
  // positions quantised to 0.25 mm and packed into one exact float64 key (17 bits per axis covers +-8 m)
  const p = g.attributes.position, n = g.attributes.normal, c = p.count, map = new Map<number, number[]>(), keys = new Float64Array(c);
  const q = (v: number) => Math.round(v * 4000) + 65536, B = 131072;
  for (let i = 0; i < c; i++) {
    const k = q(p.getX(i)) + q(p.getY(i)) * B + q(p.getZ(i)) * B * B; keys[i] = k;
    let a = map.get(k); if (!a) { a = [0, 0, 0]; map.set(k, a); } a[0] += n.getX(i); a[1] += n.getY(i); a[2] += n.getZ(i);
  }
  const out = new Float32Array(c * 3);
  for (let i = 0; i < c; i++) { const a = map.get(keys[i])!, l = Math.hypot(a[0], a[1], a[2]) || 1; out[i * 3] = a[0] / l; out[i * 3 + 1] = a[1] / l; out[i * 3 + 2] = a[2] / l; }
  g.setAttribute('aSN', new THREE.BufferAttribute(out, 3));
}
function inkHulls(root: THREE.Group) {
  root.updateMatrixWorld(true);
  const list: THREE.Mesh[] = [], hulls: THREE.Mesh[] = [];
  root.traverse(o => { const m = o as THREE.Mesh; if (!m.isMesh || !m.visible || m.userData.noHull || m.userData.isHull || !(m.material as THREE.Material).userData.toon) return; if (!(m.layers.mask & 9)) return; list.push(m); });
  for (const o of list) {
    if (!o.geometry.attributes.aSN) addSN(o.geometry);
    let p: THREE.Object3D | null = o, ink: number | null = null, zone: string | null = null, it: string | null = null;
    while (p) { if (ink == null && p.userData.ink != null) ink = p.userData.ink; if (!it && p.userData.item) it = p.userData.item; if (p.userData.zone) { zone = p.userData.zone; break; } p = p.parent; }
    const base = ink ?? 1.5;
    const m = new THREE.ShaderMaterial({ uniforms: { uRes: HU.uRes, uDpr: HU.uDpr, uW: { value: base }, uCol: { value: new THREE.Color(INK) } }, vertexShader: HVS, fragmentShader: `uniform vec3 uCol; void main(){ gl_FragColor = vec4(uCol, 1.0); }`, side: THREE.BackSide });
    const h = new THREE.Mesh(o.geometry, m); h.layers.set(1); h.userData.isHull = true; h.userData.base = base; h.userData.zone = zone; h.userData.item = it;
    o.add(h); hulls.push(h);
  }
  return hulls;
}
