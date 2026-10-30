// Sheet 05's cabin. Picking a case opens it, unfolds its J-card, flies the tape into the deck and plays side A;
// the windshield cuts to the track's view, the needles settle at the tape's revs and the cup ripples once.
// Eject, or picking the loaded case again, reverses it; picking another case ejects the first.
// Deep links: #euro/2 (or ?t=euro&n=2) opens that tape on that track with no animation. Nothing makes a sound.
import { tapes, type Tape, type TapeId } from '../data/music';
import { windshield } from './view';
import { gauges, drive, IDLE } from './gauges';
import { deck as makeDeck } from './deck';

const OUT = 'cubic-bezier(.16,1,.3,1)';
const byId = new Map(tapes.map(t => [t.id, t]));

export function boot(root: HTMLElement) {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const stage = root.querySelector<HTMLElement>('[data-stage]')!;
  const frame = root.querySelector<HTMLElement>('[data-frame]')!;
  const glass = frame.querySelector<HTMLElement>('.ck-glass')!;
  const view = windshield(glass, frame.querySelector<HTMLElement>('[data-mirror]')!, reduced);
  const dials = gauges(frame, reduced);
  const cases = new Map<TapeId, HTMLButtonElement>();
  frame.querySelectorAll<HTMLButtonElement>('[data-tape]').forEach(b => cases.set(b.dataset.tape as TapeId, b));

  let cur: Tape | null = null, now = -1, busy = false;

  const unit = makeDeck(frame, reduced, n => { if (!busy && cur) play(n); });

  /* ---------- scale ---------- */
  // CSS does it with tan(atan2()); browsers without typed trig get the same number from here
  if (!CSS.supports('width', 'calc(1px * tan(atan2(1px, 1px)))')) {
    const fit = () => {
      const narrow = innerWidth <= 820;
      const s = narrow ? Math.min(1, Math.max(.45, Math.min((root.clientWidth - 24) / 676, (innerHeight - 150) / 900))) : Math.min(root.clientWidth / 1440, innerHeight / 900);
      root.style.setProperty('--s', String(s));
    };
    fit(); addEventListener('resize', fit);
  }
  const scale = () => frame.getBoundingClientRect().width / 1440 || 1;

  // phones start looking at the centre stack: the whole deck and all four cases (frame x 250 to 926). An initial position only: it follows size
  // changes until the visitor moves the stage themselves, then leaves it alone.
  let moved = false;
  const centre = () => stage.scrollWidth > stage.clientWidth + 1 ? 588 * scale() - stage.clientWidth / 2 : 0;
  ['pointerdown', 'wheel', 'touchstart', 'keydown'].forEach(e => stage.addEventListener(e, () => { moved = true; }, { passive: true, once: true }));
  new ResizeObserver(() => { if (!moved && stage.clientWidth) stage.scrollLeft = centre(); }).observe(stage);

  /* ---------- the hash ---------- */
  const mark = (t: Tape | null) => {
    const h = t ? `#${t.id}/${now + 1}` : '';
    if (location.hash !== h) history.replaceState(history.state, '', h || location.pathname + location.search);
  };

  /* ---------- playing ---------- */
  const play = (n: number, instant = false) => {
    if (!cur) return;
    now = n;
    unit.play(cur, n, instant);
    dials.sweep(drive(cur, n), instant);
    if (!instant) dials.ripple();
    view.show(cur, n, instant);
    mark(cur);
  };

  // instant states skip every transition for two frames
  const still = () => { root.classList.add('ck-still'); requestAnimationFrame(() => requestAnimationFrame(() => root.classList.remove('ck-still'))); };
  const caseOf = (b: HTMLElement) => b.closest<HTMLElement>('.ck-case')!;
  const card = (t: Tape, on: boolean) => {
    const c = frame.querySelector<HTMLElement>(`[data-jcard="${t.id}"]`)!;
    c.classList.toggle('on', on); c.setAttribute('aria-hidden', String(!on));
  };

  // the tape lifts out of its case, squares up over the deck and slides edge-first into the slot (and back out)
  const fly = (b: HTMLButtonElement, dir: 'in' | 'out') => {
    const s = scale(), fr = frame.getBoundingClientRect();
    const src = b.querySelector('.ck-base svg')!.getBoundingClientRect(), sr = unit.slot.getBoundingClientRect();
    const cx = (src.left + src.width / 2 - fr.left) / s, cy = (src.top + src.height / 2 - fr.top) / s;
    const sx = (sr.left + sr.width / 2 - fr.left) / s, sy = (sr.top + sr.height / 2 - fr.top) / s;
    const rot = parseFloat(getComputedStyle(caseOf(b)).getPropertyValue('--r')) || 0;
    const s0 = (src.width / s) / 224, k = (sr.width / s) / 224, dx = sx - cx, dy = sy - cy;
    const c = b.querySelector<HTMLElement>('.ck-shell')!.cloneNode(true) as HTMLElement;
    c.classList.add('ck-fly');
    Object.assign(c.style, { display: 'block', left: `${cx - 112}px`, top: `${cy - 70}px` });
    frame.appendChild(c);
    const A = `translate(0px,0px) rotate(${rot}deg) scale(${s0})`;
    const B = `translate(${dx}px,${dy - 70}px) rotate(0deg) scale(${k})`;
    const C = `translate(${dx}px,${dy}px) rotate(0deg) scale(${k},.04)`;
    const kf: Keyframe[] = dir === 'in'
      ? [{ transform: A, offset: 0, easing: OUT }, { transform: B, offset: .7, easing: 'cubic-bezier(.55,0,.85,.25)' }, { transform: C, offset: 1 }]
      : [{ transform: C, offset: 0, easing: OUT }, { transform: B, offset: .26, easing: OUT }, { transform: A, offset: 1 }];
    const D = dir === 'in' ? 840 : 780, a = c.animate(kf, { duration: D, fill: 'forwards' });
    // a throttled or hidden page may never finish the animation: the tape lands anyway
    return Promise.race([a.finished.catch(() => {}), new Promise(r => setTimeout(r, D + 120))]).then(() => { a.cancel(); c.remove(); });
  };

  const load = async (t: Tape, instant = false, n = 0) => {
    const b = cases.get(t.id)!;
    if (instant) still();
    caseOf(b).classList.add('open'); card(t, true);
    b.classList.add('out');
    unit.loading();
    if (!instant && !reduced.matches) await fly(b, 'in');
    cur = t;
    unit.insert(t);
    b.setAttribute('aria-pressed', 'true');
    b.setAttribute('aria-label', `${t.name} tape is in the deck. Press to eject it and close its case`);
    play(n, instant);
  };

  const eject = async (instant = false) => {
    const t = cur!, b = cases.get(t.id)!;
    if (instant) still();
    card(t, false);
    unit.rest(); now = -1;
    view.rest(instant);
    dials.sweep(IDLE, instant);
    mark(null);
    if (!instant && !reduced.matches) await fly(b, 'out');
    b.classList.remove('out'); caseOf(b).classList.remove('open');
    b.setAttribute('aria-pressed', 'false');
    b.setAttribute('aria-label', `Open the ${t.name} case and load its tape into the deck`);
    cur = null;
    return b;
  };

  const guard = async (job: () => Promise<unknown>) => {
    if (busy) return; busy = true;
    try { await job(); } finally { busy = false; }
  };
  const pick = (t: Tape, instant = false, n = 0) => guard(async () => {
    if (cur === t) { await eject(instant); return; }
    if (cur) await eject(instant);
    await load(t, instant, n);
  });

  cases.forEach((b, id) => b.addEventListener('click', () => pick(byId.get(id)!)));
  unit.keys.ej.addEventListener('click', () => { if (cur) guard(async () => { const b = await eject(); b.focus({ preventScroll: true }); }); });
  // Rew and FF step through all eight tracks, crossing sides; A / B plays the other side from its top
  unit.keys.rew.addEventListener('click', () => { if (!busy && cur) play((now + 7) % 8); });
  unit.keys.ff.addEventListener('click', () => { if (!busy && cur) play((now + 1) % 8); });
  unit.keys.ab.addEventListener('click', () => { if (!busy && cur) play(now >= 4 ? 0 : 4); });

  // the plain list: scroll up to the cabin and load that tape
  document.querySelectorAll<HTMLButtonElement>('#music-list [data-go]').forEach(b => b.addEventListener('click', () => {
    const t = byId.get(b.dataset.go as TapeId)!;
    stage.scrollIntoView({ behavior: reduced.matches ? 'auto' : 'smooth', block: 'start' });
    if (stage.scrollWidth > stage.clientWidth + 1) stage.scrollTo({ left: centre(), behavior: reduced.matches ? 'auto' : 'smooth' });
    const go = () => { if (cur !== t) pick(t); };
    if (reduced.matches) go(); else setTimeout(go, 450);
    cases.get(t.id)!.focus({ preventScroll: true });
  }));

  unit.rest();

  /* ---------- deep links ---------- */
  const fromUrl = (): [Tape, number] | null => {
    const q = new URLSearchParams(location.search);
    const [hid, hn] = location.hash.slice(1).split('/');
    const id = (byId.has(hid as TapeId) ? hid : q.get('t')) as TapeId | null;
    const t = id ? byId.get(id) : undefined;
    if (!t) return null;
    const raw = parseInt(byId.has(hid as TapeId) ? hn : q.get('n') ?? '', 10);
    return [t, Math.min(8, Math.max(1, raw || 1)) - 1];
  };
  const open = (instant: boolean) => {
    const hit = fromUrl();
    if (!hit) return;
    const [t, n] = hit;
    if (cur === t) { if (now !== n) play(n, instant); return; }
    pick(t, instant, n);
  };
  open(true);
  addEventListener('hashchange', () => open(reduced.matches));
}
