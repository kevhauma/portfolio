// Quackbot on the old beige CRT at the desk: the screen mirrors the chat in the caption box, and the duck
// opens its beak on !quack.
import * as THREE from 'three';
import { defineZone } from '../zone';
import { add, rbox, cyl, box, group, proxy, frustumG } from '../kit';
import { toon, mat, emis } from '../toon';
import { ctex, redraw, FT, FM } from '../paint';

const crt = { log: [['bot', 'online. type !help']] as [string, string][], beak: false, cursor: true };
let screen: THREE.CanvasTexture;
let blink = 0;

/** illustrative replies, written for this page */
const REPLIES: Record<string, string | (() => string)> = {
  '!help': 'commands: !quack !roll !uptime !about',
  '!quack': 'QUACK.',
  '!roll': () => 'you rolled a ' + (1 + Math.floor(Math.random() * 6)) + '.',
  '!uptime': 'retired. ran from 2017 to 2020.',
  '!about': 'a discord bot kevin built for one community of about 2,000 members.'
};

export default defineZone({
  id: 'quackbot',
  ink: 1.5,
  view: { pos: [2.36, 1.18, -1.28], target: [2.84, 1.0, -1.93] },
  build(gQuack) {
    screen = ctex(512, 384, (x, w, h) => {
      x.fillStyle = '#071a0e'; x.fillRect(0, 0, w, h);
      const g = x.createRadialGradient(w / 2, h / 2, 40, w / 2, h / 2, 300); g.addColorStop(0, 'rgba(90,255,150,0.10)'); g.addColorStop(1, 'rgba(0,0,0,0.3)'); x.fillStyle = g; x.fillRect(0, 0, w, h);
      x.fillStyle = '#0f3a20'; x.fillRect(0, 0, w, 50); x.font = FT(400, 28); x.fillStyle = '#8ff0ae'; x.fillText('QUACKBOT', 22, 36);
      // the duck, cel style
      x.save(); x.translate(92, 200); x.lineWidth = 5; x.strokeStyle = '#06120a'; x.lineJoin = 'round';
      x.fillStyle = '#ffd84a'; x.beginPath(); x.ellipse(0, 40, 62, 42, 0, 0, Math.PI * 2); x.fill(); x.stroke();
      x.beginPath(); x.arc(14, -22, 34, 0, Math.PI * 2); x.fill(); x.stroke();
      x.fillStyle = '#ff8a1a'; x.beginPath();
      if (crt.beak) { x.moveTo(40, -30); x.lineTo(84, -40); x.lineTo(46, -18); x.lineTo(84, -2); x.lineTo(40, -10); } else { x.moveTo(40, -26); x.lineTo(84, -18); x.lineTo(40, -8); }
      x.closePath(); x.fill(); x.stroke();
      x.fillStyle = '#06120a'; x.beginPath(); x.arc(24, -30, 6, 0, Math.PI * 2); x.fill(); x.fillStyle = '#fff'; x.beginPath(); x.arc(26, -32, 2, 0, Math.PI * 2); x.fill();
      x.fillStyle = '#fff1a8'; x.beginPath(); x.ellipse(-10, 44, 30, 16, -0.3, 0, Math.PI * 2); x.fill();
      x.restore();
      x.font = FM(400, 17); let y = 96;
      crt.log.slice(-9).forEach(([who, t]) => { x.fillStyle = who === 'bot' ? '#7fe3ff' : '#ffe07a'; x.fillText(who === 'bot' ? 'qb>' : 'you>', 196, y); x.fillStyle = '#b6f5c7'; x.fillText(t.length > 22 ? t.slice(0, 21) + '-' : t, 246, y); y += 28; });
      x.fillStyle = '#8ff0ae'; if (crt.cursor) x.fillRect(196, y - 16, 12, 20);
      x.fillStyle = 'rgba(0,0,0,0.22)'; for (let j = 0; j < h; j += 4) x.fillRect(0, j, w, 2);
    });
    const c = group(gQuack, 2.86, 0.74, -1.95, -0.62);
    const beige = mat(0xd3c8ab, 0.35), beigeD = mat(0xb0a68b, 0.2);
    cyl(c, 0.11, 0.13, 0.03, 28, beigeD, 0, 0.015, -0.08); rbox(c, 0.12, 0.045, 0.12, 0.01, beigeD, 0, 0.045, -0.08);
    rbox(c, 0.42, 0.36, 0.07, 0.025, beige, 0, 0.25, 0);
    const rear = frustumG(0.4, 0.33, 0.24, 0.2, 0.28); rear.rotateX(-Math.PI / 2); add(c, rear, beigeD, 0, 0.255, -0.034);
    // the glass bulges, the way a tube does
    const sg = new THREE.PlaneGeometry(0.31, 0.235, 12, 12); const p = sg.attributes.position;
    for (let i = 0; i < p.count; i++) { const x = p.getX(i) / 0.155, y = p.getY(i) / 0.1175; p.setZ(i, 0.012 * (1 - x * x * 0.8) * (1 - y * y * 0.8)); }
    sg.computeVertexNormals();
    const scr = add(c, sg, toon(0xffffff, { map: screen, emis: 1 }), 0, 0.265, 0.036); scr.userData.noMerge = true; scr.userData.noHull = true;
    rbox(c, 0.335, 0.26, 0.012, 0.012, mat(0x2b2a30, 0.3), 0, 0.265, 0.03);
    box(c, 0.012, 0.008, 0.004, emis(0x3dff7a), 0.17, 0.09, 0.036);
    for (let i = 0; i < 3; i++) rbox(c, 0.022, 0.01, 0.008, 0.002, beigeD, 0.06 + i * 0.03, 0.09, 0.036);
    proxy(c, 0.46, 0.44, 0.5, 0, 0.24, -0.1);
  },
  mount(panel, ctx) {
    const log = panel.querySelector<HTMLElement>('[data-log]')!;
    const form = panel.querySelector<HTMLFormElement>('[data-form]')!;
    const input = form.querySelector('input')!;
    const send = (raw: string) => {
      const c = raw.trim().toLowerCase(); if (!c) return;
      const r = REPLIES[c]; const txt = typeof r === 'function' ? r() : (r ?? 'unknown command. try !help');
      const line = (cls: string, who: string, t: string) => { const p = document.createElement('p'); const s = document.createElement('span'); s.className = cls; s.textContent = who + '> '; p.append(s, t); log.append(p); };
      line('who', 'you', c); line('bot', 'quackbot', txt); log.scrollTop = log.scrollHeight;
      crt.log.push(['you', c], ['bot', txt]); crt.beak = c === '!quack'; redraw(screen); ctx.invalidate();
      if (crt.beak) setTimeout(() => { crt.beak = false; redraw(screen); ctx.invalidate(); }, 700);
    };
    panel.querySelectorAll<HTMLButtonElement>('[data-cmd]').forEach(b => b.addEventListener('click', () => send(b.dataset.cmd!)));
    form.addEventListener('submit', (e) => { e.preventDefault(); send(input.value); input.value = ''; });
  },
  open(ctx) {
    // the cursor blinks only while you are looking at it
    if (ctx.rm) return;
    blink = window.setInterval(() => { crt.cursor = !crt.cursor; redraw(screen); ctx.invalidate(); }, 600);
  },
  close() { clearInterval(blink); crt.cursor = true; redraw(screen); }
});
