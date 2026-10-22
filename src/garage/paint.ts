// Painted textures: vector canvas at full resolution, the way a background painter would lay them in.
import * as THREE from 'three';

export type Draw = (x: CanvasRenderingContext2D, w: number, h: number) => void;
export const INKS = '#170f1f';
export const FT = (w: number, s: number) => `${w} ${s}px "Dela Gothic One", "Hanken Grotesk Variable", sans-serif`;
export const FB = (w: number, s: number) => `${w} ${s}px "Hanken Grotesk Variable", system-ui, sans-serif`;
export const FM = (w: number, s: number) => `${w} ${s}px "JetBrains Mono Variable", ui-monospace, monospace`;

export function rr(x: CanvasRenderingContext2D, X: number, Y: number, W: number, H: number, R: number) { x.beginPath(); x.roundRect(X, Y, W, H, R); }

/** a seeded generator, so every painted texture comes out the same on every visit */
export function rngf(seed: number) {
  return () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
}

export function ctex(w: number, h: number, draw: Draw, repeat = false) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const x = c.getContext('2d')!; draw(x, w, h);
  const t = new THREE.CanvasTexture(c); t.anisotropy = 4;
  if (repeat) t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.userData.ctx = x; t.userData.draw = draw; return t;
}

/** repaint a live texture (a screen whose state changed) */
export function redraw(t: THREE.Texture) {
  const x = t.userData.ctx as CanvasRenderingContext2D;
  x.clearRect(0, 0, x.canvas.width, x.canvas.height); (t.userData.draw as Draw)(x, x.canvas.width, x.canvas.height); t.needsUpdate = true;
}

/** the canvas lettering needs its faces before the first paint; they are self-hosted, so this is quick, and it gives up rather than block the garage */
export async function fontsReady() {
  try {
    await Promise.race([
      Promise.all(['400 64px "Dela Gothic One"', '400 20px "JetBrains Mono Variable"', '600 20px "Hanken Grotesk Variable"', '700 20px "Hanken Grotesk Variable"'].map(f => document.fonts.load(f))),
      new Promise(r => setTimeout(r, 1200))
    ]);
  } catch { /* fonts are a nicety */ }
}

/** shared by more than one zone */
export const shared = {
  get glow() { return (cache.glow ??= ctex(128, 128, (x) => { const g = x.createRadialGradient(64, 64, 0, 64, 64, 64); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.18, 'rgba(255,255,255,0.65)'); g.addColorStop(0.5, 'rgba(255,255,255,0.18)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(0, 0, 128, 128); })); },
  get lens() {
    return (cache.lens ??= ctex(256, 256, (x, w, h) => {
      const g = x.createRadialGradient(128, 128, 10, 128, 128, 128); g.addColorStop(0, '#2c3a6e'); g.addColorStop(0.7, '#141a36'); g.addColorStop(1, '#0a0c18'); x.fillStyle = g; x.fillRect(0, 0, w, h);
      x.strokeStyle = 'rgba(160,150,255,0.55)'; x.lineWidth = 6; x.beginPath(); x.arc(128, 128, 86, Math.PI * 1.1, Math.PI * 1.45); x.stroke();
      x.strokeStyle = 'rgba(255,170,120,0.5)'; x.lineWidth = 4; x.beginPath(); x.arc(128, 128, 56, Math.PI * 0.15, Math.PI * 0.4); x.stroke();
      x.fillStyle = '#ffffff'; x.beginPath(); x.ellipse(92, 84, 16, 9, -0.6, 0, Math.PI * 2); x.fill();
    }));
  }
};
const cache: Record<string, THREE.CanvasTexture> = {};
