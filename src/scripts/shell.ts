// The shared shell: display switches, the lap-counter bubble and the fan nav.

const root = document.documentElement;
const sec = root.dataset.sec ?? '01';
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const store = {
  get(area: Storage | undefined, k: string) { try { return area?.getItem(k) ?? null; } catch { return null; } },
  set(area: Storage | undefined, k: string, v: string) { try { area?.setItem(k, v); } catch { /* storage blocked: the page still works */ } }
};
const local = (() => { try { return localStorage; } catch { return undefined; } })();
const session = (() => { try { return sessionStorage; } catch { return undefined; } })();
const $ = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;

/* night race: follows the OS until the visitor picks */
const nightBtn = $('night');
const darkMQ = matchMedia('(prefers-color-scheme: dark)');
const isNight = () => (root.dataset.theme ? root.dataset.theme === 'night' : darkMQ.matches);
const syncNight = () => nightBtn.setAttribute('aria-pressed', String(isNight()));
nightBtn.addEventListener('click', () => {
  const next = isNight() ? 'day' : 'night';
  root.dataset.theme = next;
  store.set(local, 'kh-theme', next);
  syncNight();
});
darkMQ.addEventListener('change', syncNight);
syncNight();

/* pit limiter */
const limBtn = $('limiter');
const limiterOn = () => root.classList.contains('limiter');
const syncLimiter = () => limBtn.setAttribute('aria-pressed', String(limiterOn()));
function setLimiter(on: boolean) {
  root.classList.toggle('limiter', on);
  store.set(local, 'kh-limiter', on ? '1' : '0');
  syncLimiter();
  updateBubble();
  window.scrollTo(0, 0);
}
limBtn.addEventListener('click', () => setLimiter(!limiterOn()));
/* links like "View full CV" switch it on rather than toggle it */
document.querySelectorAll('[data-limiter-on]').forEach(b => b.addEventListener('click', () => setLimiter(true)));
syncLimiter();

/* bubble: 23 on the intro, the sheet number elsewhere; the ring counts visited sheets */
const bubble = $<HTMLButtonElement>('bubble');
const bubbleNum = $('bubbleNum');
let visited: string[] = [];
try { visited = JSON.parse(store.get(session, 'kh-visited') ?? '[]'); } catch { visited = []; }
const before = visited.length;
if (!visited.includes(sec)) visited.push(sec);
store.set(session, 'kh-visited', JSON.stringify(visited));
bubble.style.setProperty('--p', String(before / 6));
requestAnimationFrame(() => requestAnimationFrame(() => bubble.style.setProperty('--p', String(visited.length / 6))));

function updateBubble() {
  bubbleNum.textContent = limiterOn() ? 'PIT' : sec === '01' ? '23' : sec;
}
updateBubble();

/* fan: six stripes. Landscape fans them from the bubble's corner (Seychelles-flag geometry);
   portrait stacks them as tall raked bands that slide in from the bubble's side. */
const fan = $<HTMLDialogElement>('fan');
const items = [...fan.querySelectorAll<HTMLLIElement>('.fan-list li')];
const links = items.map(li => li.querySelector('a')!);
const STEP = Math.PI / 2 / links.length;
const TAN = Math.tan((14 * Math.PI) / 180);

function rayHit(theta: number, W: number, H: number): [number, number] {
  const t = Math.tan(theta);
  if (theta < 1e-6) return [W, H];
  if (W * t <= H) return [W, H - W * t];
  return [H / t, 0];
}
const poly = (pts: [number, number][]) => 'polygon(' + pts.map(([x, y]) => `${x.toFixed(1)}px ${y.toFixed(1)}px`).join(',') + ')';
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

/* landscape stripe between two angles from the bottom-left corner, always four points so clip-path can tween */
function wedge(hi: number, lo: number, W: number, H: number) {
  hi = Math.min(hi, Math.PI / 2); lo = Math.max(lo, 0);
  const p0 = rayHit(hi, W, H), p1 = rayHit(lo, W, H);
  const crossesCorner = p0[1] === 0 && p1[0] === W && p1[1] > 0;
  const mid: [number, number] = crossesCorner ? [W, 0] : [(p0[0] + p1[0]) / 2, (p0[1] + p1[1]) / 2];
  return poly([[0, H], p0, mid, p1]);
}
/* how far a hovered or focused stripe spreads over its neighbours */
const SPREAD = 0.3;

/* each stripe is a window onto its page's snapshot (16:10, see scripts/snap-fan.mjs): slightly zoomed,
   slid so the section's signature sits at (px, py) on the stripe, never leaving a gap at the screen edge */
function frameSnap(a: HTMLAnchorElement, px: number, py: number, W: number, H: number) {
  const [fx, fy] = a.dataset.focus!.split(',').map(Number);
  const cw = Math.max(W, H * 1.6), ch = cw / 1.6, bw = cw * 1.3, bh = ch * 1.3;
  a.style.backgroundSize = `${bw.toFixed(1)}px ${bh.toFixed(1)}px`;
  a.style.backgroundPosition = `${clamp(px - fx * bw, W - bw, 0).toFixed(1)}px ${clamp(py - fy * bh, H - bh, 0).toFixed(1)}px`;
  /* the page-aligned frame the chosen stripe settles into as it widens */
  a.dataset.fullSize = `${cw.toFixed(1)}px ${ch.toFixed(1)}px`;
  a.dataset.fullPos = `${((W - cw) / 2).toFixed(1)}px ${((H - ch) / 2).toFixed(1)}px`;
}

function layoutFan() {
  const W = innerWidth, H = innerHeight;
  const portrait = W < 760 || W / H < 0.85;
  fan.classList.toggle('portrait', portrait);
  links.forEach((a, i) => {
    const label = a.querySelector<HTMLElement>('.fan-label')!;
    a.dataset.full = poly([[0, H], [0, 0], [W, 0], [W, H]]);
    if (portrait) {
      /* band i from the top; edges slope up to the right at the rake */
      const slope = W * TAN;
      const last = i === links.length - 1;
      const h = (H - slope) / links.length;
      const y0 = i * h, y1 = y0 + h;
      const band = (e: number) => poly([[0, i === 0 ? 0 : y0 - e + slope], [W, i === 0 ? 0 : y0 - e], [W, last ? H : y1 + e + 1], [0, last ? H : y1 + e + slope + 1]]);
      a.style.setProperty('--clip', band(0));
      a.style.setProperty('--wide', band(h * SPREAD));
      a.style.setProperty('--d', `${(links.length - 1 - i) * 40}ms`);
      /* sit the label on the band's centre line, which falls at the same rake */
      const midY = (y0 + y1) / 2 + slope * (1 - 20 / W);
      label.style.transform = `translate(20px, ${midY.toFixed(1)}px) rotate(-14deg) translateY(-50%)`;
      a.style.setProperty('--lx', '-12px');
      a.style.setProperty('--ly', '0px');
      frameSnap(a, W * 0.66, (y0 + y1) / 2 + slope * 0.34, W, H);
      return;
    }
    const hi = Math.PI / 2 - i * STEP, lo = hi - STEP;
    a.style.setProperty('--clip', wedge(hi, lo, W, H));
    a.style.setProperty('--wide', wedge(hi + STEP * SPREAD, lo - STEP * SPREAD, W, H));
    a.style.setProperty('--d', `${i * 45}ms`);
    const bis = (hi + lo) / 2;
    const end = rayHit(bis, W, H);
    const len = Math.hypot(end[0], H - end[1]);
    const d = Math.max(len * (0.34 + 0.26 * bis / (Math.PI / 2)), 190);
    const x = Math.cos(bis) * d, y = H - Math.sin(bis) * d;
    label.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) rotate(${(-bis * 180 / Math.PI).toFixed(2)}deg) translateY(-50%)`;
    a.style.setProperty('--lx', `${(Math.cos(bis) * 14).toFixed(1)}px`);
    a.style.setProperty('--ly', `${(-Math.sin(bis) * 14).toFixed(1)}px`);
    const far = len * 0.74;
    frameSnap(a, Math.cos(bis) * far, H - Math.sin(bis) * far, W, H);
  });
}

function markItems() {
  items.forEach((li, i) => {
    const s = links[i].dataset.sec!;
    li.classList.toggle('visited', visited.includes(s) && s !== sec);
  });
}

function openFan() {
  layoutFan();
  markItems();
  fan.showModal();
  (links.find(a => a.dataset.sec === sec) ?? links[0]).focus();
  requestAnimationFrame(() => requestAnimationFrame(() => fan.classList.add('open')));
}
function closeFan() {
  fan.classList.remove('open');
  if (reduced.matches) { fan.close(); return; }
  setTimeout(() => fan.close(), 360);
}
bubble.addEventListener('click', openFan);
$('fanClose').addEventListener('click', closeFan);
fan.addEventListener('cancel', e => { e.preventDefault(); closeFan(); });
fan.addEventListener('click', e => { if (e.target === fan) closeFan(); });
fan.addEventListener('close', () => bubble.focus());
addEventListener('resize', () => { if (fan.open) layoutFan(); });
fan.addEventListener('keydown', e => {
  const i = links.indexOf(document.activeElement as HTMLAnchorElement);
  if (i < 0) return;
  let n: number | null = null;
  if (e.key === 'ArrowDown' || e.key === 'ArrowRight') n = (i + 1) % links.length;
  if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') n = (i - 1 + links.length) % links.length;
  if (e.key === 'Home') n = 0;
  if (e.key === 'End') n = links.length - 1;
  if (n !== null) { e.preventDefault(); links[n].focus(); }
});

const pitAnchor: Record<string, string> = { '01': 'pit-title', '02': 'pit-experience', '03': 'pit-projects', '06': 'pit-contact' };
links.forEach(a => a.addEventListener('click', e => {
  if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
  const target = a.dataset.sec!;
  if (limiterOn()) {
    /* recruiter mode is one page: jump inside it instead of loading another sheet */
    e.preventDefault();
    fan.classList.remove('open');
    fan.close();
    const el = document.getElementById(pitAnchor[target] ?? 'pit-title');
    if (el) { el.setAttribute('tabindex', '-1'); el.scrollIntoView({ block: 'start' }); el.focus({ preventScroll: true }); }
    return;
  }
  if (target === sec) { e.preventDefault(); closeFan(); return; }
  if (reduced.matches) return;
  /* the chosen stripe widens over the screen, then the wipe lands the next sheet */
  e.preventDefault();
  a.style.clipPath = a.dataset.full!;
  a.style.backgroundSize = a.dataset.fullSize!;
  a.style.backgroundPosition = a.dataset.fullPos!;
  a.classList.add('chosen');
  a.parentElement!.style.zIndex = '4';
  setTimeout(() => { location.href = a.href; }, 300);
}));

/* back/forward cache: a restored page must not keep a half-open fan */
addEventListener('pageshow', e => {
  if (!e.persisted) return;
  fan.classList.remove('open');
  if (fan.open) fan.close();
  links.forEach(a => { a.parentElement!.style.zIndex = ''; a.style.clipPath = ''; a.classList.remove('chosen'); });
});
