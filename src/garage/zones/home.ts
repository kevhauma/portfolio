// Home Assistant: the wall tablet by the bench. Its one real switch is a demo that turns this garage's
// ceiling lamps off and on; every other entity is a placeholder until Kevin's own setup is filled in.
import * as THREE from 'three';
import { defineZone } from '../zone';
import { rbox, tube, plane, group, proxy } from '../kit';
import { toon, mat, ROOM } from '../toon';
import { ctex, redraw, rr, FB, FM } from '../paint';

const ents: Record<string, boolean> = { garage: true, l1: false, s2: true, l3: false };
let screen: THREE.CanvasTexture;

export default defineZone({
  id: 'home',
  ink: 1.4,
  view: { pos: [1.66, 1.42, -1.38], target: [1.8, 1.4, -2.39] },
  build(gHome) {
    screen = ctex(512, 320, (x, w) => {
      x.fillStyle = '#1e2440'; x.fillRect(0, 0, w, 320); x.fillStyle = '#2b3460'; x.fillRect(0, 0, w, 52);
      x.font = FB(700, 26); x.fillStyle = '#eef1ff'; x.fillText('Home', 20, 35);
      ([['Garage', 'garage'], ['Room', 'l1'], ['Room', 's2'], ['Room', 'l3']] as const).forEach(([n, k], i) => {
        const on = ents[k], tx = 18 + (i % 2) * 246, ty = 70 + Math.floor(i / 2) * 122;
        rr(x, tx, ty, 230, 108, 14); x.fillStyle = on ? '#6a4a1e' : '#2c3458'; x.fill();
        if (i > 0) { x.setLineDash([12, 9]); x.lineWidth = 3; x.strokeStyle = '#ffc27a'; rr(x, tx + 3, ty + 3, 224, 102, 12); x.stroke(); x.setLineDash([]); }
        x.fillStyle = on ? '#ffc46a' : '#6d7aa6'; x.beginPath(); x.arc(tx + 34, ty + 38, 16, 0, Math.PI * 2); x.fill();
        x.font = FB(700, 24); x.fillStyle = on ? '#fff0d6' : '#aab4d6'; x.fillText(n, tx + 18, ty + 88);
        x.font = FM(400, 15); x.fillStyle = on ? '#ffd9a0' : '#7c88a8'; x.fillText(i ? 'to follow' : (on ? 'on' : 'off'), tx + 140, ty + 88);
      });
    });
    const t = group(gHome, 1.78, 1.42, ROOM.RZB + 0.01);
    rbox(t, 0.27, 0.175, 0.014, 0.01, mat(0x17171c, 0.6), 0, 0, 0.007);
    plane(t, 0.245, 0.153, toon(0xffffff, { map: screen, emis: 1 }), 0, 0, 0.0146).userData.noMerge = true;
    tube(gHome, [[1.86, 1.34, ROOM.RZB + 0.012], [1.9, 1.2, ROOM.RZB + 0.012], [1.94, 1.07, ROOM.RZB + 0.02]], 0.004, mat(0xebe5d8), 12, 6);
    proxy(t, 0.3, 0.2, 0.06, 0, 0, 0.02);
  },
  mount(panel, ctx) {
    panel.querySelectorAll<HTMLButtonElement>('[role=switch][data-k]').forEach(b => {
      const k = b.dataset.k!;
      b.setAttribute('aria-checked', String(ents[k]));
      b.addEventListener('click', () => {
        ents[k] = !ents[k]; b.setAttribute('aria-checked', String(ents[k])); redraw(screen);
        if (k === 'garage') ctx.lamps = ents[k];
        ctx.invalidate();
      });
    });
  }
});
