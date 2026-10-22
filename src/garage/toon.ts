// The cel material: banded ramps, one painted highlight band, anime chrome, WLED tint bands, the violet dusk
// window band, and hard shadow shapes from both lamps. Every lit surface in the garage uses toon().
import * as THREE from 'three';
import { shared } from './paint';

const V3 = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);

/** room: half width, back wall, front, height */
export const ROOM = { RX: 3.2, RZB: -2.4, RZF: 4.0, RH: 2.7 };
export const WIN = { z: -1.35, y: 1.86, w: 0.8, h: 0.54 };
export const INK = 0x170f1f, RED = 0xE2001A, BG = 0x1b1630;

/** the lights every toon material shares. The WLED zone writes uWP/uWC; the night ramp writes the rest. */
export const U = {
  uLampP: { value: [V3(-0.45, 2.28, -0.8), V3(0.7, 2.28, 0.95)] },
  uLampI: { value: [1.75, 2.05] },
  tSh0: { value: null as THREE.Texture | null }, tSh1: { value: null as THREE.Texture | null },
  uShM0: { value: new THREE.Matrix4() }, uShM1: { value: new THREE.Matrix4() },
  uWP: { value: [V3(), V3(), V3(), V3()] }, uWC: { value: [V3(), V3(), V3(), V3()] },
  /** practicals: the CRT and the wall tablet */
  uPrP: { value: [V3(2.62, 1.0, -1.74), V3(1.78, 1.42, -2.3)] }, uPrC: { value: [V3(0.2, 0.62, 0.38), V3(0.3, 0.38, 0.72)] },
  uWinP: { value: V3(ROOM.RX + 0.8, 1.95, -1.35) }, uWinC: { value: new THREE.Color(0x9a86e0) },
  uAmb: { value: 0.1 }, uRimC: { value: new THREE.Color(0xa58ad6) }, uWarm: { value: 1 }
};

const TVS = /* glsl */`
varying vec3 vW; varying vec3 vN; varying vec2 vUv;
#ifdef VCOL
attribute vec3 aCol; varying vec3 vCol;
#endif
#ifdef SLICE
attribute float aSl; varying float vSl;
#endif
void main(){
  vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz;
  vN = normalize(mat3(modelMatrix) * normal);
  vUv = uv;
#ifdef VCOL
  vCol = aCol;
#endif
#ifdef SLICE
  vSl = aSl;
#endif
  gl_Position = projectionMatrix * viewMatrix * w;
}`;

const TFS = /* glsl */`
uniform vec3 uLit; uniform vec3 uMid; uniform vec3 uShade; uniform vec3 uHiC;
uniform float uBands; uniform float uHi; uniform float uEmis; uniform float uRim; uniform float uGrad;
uniform vec3 uLampP[2]; uniform float uLampI[2];
uniform sampler2D tSh0; uniform sampler2D tSh1; uniform mat4 uShM0; uniform mat4 uShM1;
uniform vec3 uWP[4]; uniform vec3 uWC[4]; uniform vec3 uPrP[2]; uniform vec3 uPrC[2];
uniform vec3 uWinP; uniform vec3 uWinC; uniform float uAmb; uniform vec3 uRimC; uniform float uWarm;
uniform sampler2D tMap; uniform vec2 uRepeat; uniform float uTop;
varying vec3 vW; varying vec3 vN; varying vec2 vUv;
#ifdef VCOL
varying vec3 vCol;
#endif
#ifdef SLICE
varying float vSl;
#endif
float shadowOf(sampler2D t, mat4 M, vec3 lp, vec3 p, vec3 n){
  vec4 c = M * vec4(p + n * 0.012, 1.0);
  if (c.w <= 0.0) return 1.0;
  vec3 q = c.xyz / c.w;
  if (abs(q.x) > 0.999 || abs(q.y) > 0.999 || q.z > 1.0) return 1.0;
  vec2 uv = q.xy * 0.5 + 0.5;
  float d = (length(p - lp) - 0.02) * 0.1;
  vec2 o = vec2(0.55 / 2048.0);
  float s = step(d, texture2D(t, uv + vec2(-o.x, -o.y)).r) + step(d, texture2D(t, uv + vec2(o.x, -o.y)).r)
          + step(d, texture2D(t, uv + vec2(-o.x, o.y)).r) + step(d, texture2D(t, uv + vec2(o.x, o.y)).r);
  return s * 0.25;
}
float band(float v, float t){ float a = fwidth(v) * 0.75 + 0.002; return smoothstep(t - a, t + a, v); }
void main(){
  vec3 N = normalize(vN); if (!gl_FrontFacing) N = -N;
  vec3 V = normalize(cameraPosition - vW);
  float L = uAmb, spec = 0.0;
  for (int i = 0; i < 2; i++) {
    vec3 l = uLampP[i] - vW; float d = length(l); l /= d;
    float ndl = dot(N, l);
    if (ndl <= 0.0) continue;
    float cone = mix(0.12, 1.0, smoothstep(0.16, 0.42, l.y)) * smoothstep(-0.12, 0.05, l.y);
    float a = uLampI[i] * cone / (1.0 + d * d * 0.5);
    float sh = i == 0 ? shadowOf(tSh0, uShM0, uLampP[0], vW, N) : shadowOf(tSh1, uShM1, uLampP[1], vW, N);
    L += ndl * a * sh;
    vec3 h = normalize(l + V);
    spec = max(spec, pow(max(dot(N, h), 0.0), 46.0) * sh * min(a * 1.6, 1.0));
  }
  vec3 tex = vec3(1.0);
#ifdef MAP
  tex = texture2D(tMap, vUv * uRepeat).rgb;
#endif
  float b1, b2; vec3 col;
  vec3 warm = mix(vec3(1.0), vec3(1.1, 1.0, 0.8), uWarm);
  if (uBands > 2.5) { b1 = band(L, 0.25); b2 = band(L, 0.56); col = mix(mix(uShade, uMid * mix(vec3(1.0), warm, 0.5), b1), uLit * warm, b2); }
  else { b1 = band(L, 0.38); b2 = b1; col = mix(uShade, uLit * warm, b1); }
  vec3 albedo = uLit * tex;
  col *= tex;
  col *= mix(1.0, mix(0.8, 1.0, smoothstep(0.0, 0.85, vW.y)) * mix(1.0, 0.86, smoothstep(2.2, 2.7, vW.y)), uGrad);
  float hb = band(spec, 0.5) * uHi;
  col = mix(col, uHiC * tex, hb);
  float fr = 1.0 - max(dot(N, V), 0.0);
  float rim = band(fr, 0.7) * (1.0 - b1) * uRim;
  col = mix(col, uRimC * (0.5 + 0.5 * tex), rim * 0.5);
  { vec3 w = uWinP - vW; float d = length(w); w /= d; float v = max(dot(N, w), 0.0) / (1.0 + d * d * 0.22); col += uWinC * albedo * 0.2 * band(v, 0.17); }
  for (int k = 0; k < 2; k++) { vec3 p = uPrP[k] - vW; float d = length(p); p /= d; float v = max(dot(N, p), 0.0) / (1.0 + d * d * 30.0); col += uPrC[k] * (albedo * 0.7 + 0.03) * band(v, 0.3); }
  vec3 wl = vec3(0.0); vec3 EM = vec3(0.0, -0.5, 0.866);
  for (int k = 0; k < 4; k++) { vec3 p = uWP[k] - vW; float d = length(p); p /= d; float nd = max(dot(N, p), 0.0); float em = smoothstep(0.02, 0.4, p.y) * (0.6 + 0.4 * smoothstep(-0.4, 0.6, dot(-p, EM))); wl += uWC[k] * nd * em / (1.0 + d * d * 5.0); }
  float wi = max(wl.r, max(wl.g, wl.b)); vec3 wc = wl / max(wi, 1e-4);
  float wb = band(wi, 0.08) * 0.5 + band(wi, 0.3) * 0.5;
#ifdef CHROME
  vec3 R = reflect(-V, N); float y = R.y;
  vec3 c = mix(uShade, uMid, band(y, -0.16)); c = mix(c, uLit, band(y, 0.3));
  float ya = fwidth(y) * 0.8 + 0.002;
  float st = 1.0 - smoothstep(0.03 - ya, 0.03 + ya, abs(y - 0.1));
  float st2 = 1.0 - smoothstep(0.016 - ya, 0.016 + ya, abs(y - 0.62));
  c = mix(c, vec3(1.0, 0.98, 0.95), max(st, st2 * 0.85));
  c = mix(c, vec3(1.0), band(spec, 0.4));
  col = c * mix(0.72, 1.0, b1) + wc * wb * 0.4 + uWinC * 0.12 * rim;
#else
  col += (albedo * 0.85 + 0.05) * wc * wb;
#endif
#ifdef SLICE
  col = mix(col, vec3(1.0, 0.8, 0.22), (1.0 - step(0.5, abs(vSl - uTop))) * 0.85);
#endif
#ifdef VCOL
  col = mix(col, vCol, uEmis);
#else
  col = mix(col, uLit * tex, uEmis);
#endif
  gl_FragColor = vec4(col, 1.0);
}`;

const SHADE_V = new THREE.Color(0x3b3357), HI_W = new THREE.Color(0xfff6e8);
/** shadow band: the lit colour darkened and pulled toward the dusk violet, never a grey multiply */
function ramp(hex: number) {
  const lit = new THREE.Color(hex);
  const lum = 0.3 * lit.r + 0.59 * lit.g + 0.11 * lit.b;
  const sh = lit.clone().multiplyScalar(0.5).lerp(SHADE_V.clone().multiplyScalar(0.55 + 0.7 * lum), 0.42);
  const mid = lit.clone().lerp(sh, 0.45);
  return { lit, mid, sh };
}

export type ToonOpts = {
  map?: THREE.Texture; repeat?: [number, number]; chrome?: boolean; vcol?: boolean; slice?: boolean;
  lit?: number; mid?: number; sh?: number; bands?: number; hi?: number; emis?: number; rim?: number; grad?: number; side?: THREE.Side;
};

export function toon(hex: number, o: ToonOpts = {}) {
  const r = ramp(hex); const defines: Record<string, string> = {};
  if (o.map) defines.MAP = ''; if (o.chrome) defines.CHROME = ''; if (o.vcol) defines.VCOL = ''; if (o.slice) defines.SLICE = '';
  const lit = o.lit != null ? new THREE.Color(o.lit) : r.lit, mid = o.mid != null ? new THREE.Color(o.mid) : r.mid, sh = o.sh != null ? new THREE.Color(o.sh) : r.sh;
  const m = new THREE.ShaderMaterial({
    defines, vertexShader: TVS, fragmentShader: TFS, side: o.side ?? THREE.FrontSide,
    uniforms: {
      ...U, uLit: { value: lit }, uMid: { value: mid }, uShade: { value: sh }, uHiC: { value: lit.clone().lerp(HI_W, 0.6) },
      uBands: { value: o.bands ?? 3 }, uHi: { value: o.hi ?? 0 }, uEmis: { value: o.emis ?? 0 }, uRim: { value: o.rim ?? 0 }, uGrad: { value: o.grad ?? 0 },
      tMap: { value: o.map ?? null }, uRepeat: { value: new THREE.Vector2(...(o.repeat ?? [1, 1])) }, uTop: { value: -1 }
    }
  });
  m.userData.toon = true; return m;
}

const mcache = new Map<string, THREE.ShaderMaterial>();
/** a cached plain cel material by colour, highlight band and rim */
export const mat = (c: number, hi = 0, rim = 0) => { const k = c + '_' + hi + '_' + rim; if (!mcache.has(k)) mcache.set(k, toon(c, { hi, rim })); return mcache.get(k)!; };
/** a cached self-lit material (LEDs, screens) */
export const emis = (c: number) => { const k = 'e' + c; if (!mcache.has(k)) mcache.set(k, toon(c, { emis: 1 })); return mcache.get(k)!; };

/** materials more than one zone paints with */
export const M = {
  chrome: toon(0xffffff, { chrome: true, lit: 0xebe6f6, mid: 0x8e8aac, sh: 0x2a2638 }),
  chromeDark: toon(0xffffff, { chrome: true, lit: 0xb4b0cc, mid: 0x5a5674, sh: 0x1c1a26 }),
  steel: mat(0x6c7384, 0.6), steelDark: mat(0x3d3f4c, 0.5), galv: mat(0xa6adba, 0.7),
  wood: toon(0xb27a4b, { hi: 0.25 }), ply: toon(0xd2ab78),
  get lens() { return (lensM ??= toon(0xffffff, { map: shared.lens, emis: 0.75 })); }
};
let lensM: THREE.ShaderMaterial | undefined;
