// The manual as a book. It lies shut when the page loads and opens itself; a link to another page of
// the manual turns a leaf instead of loading a new sheet. The next page is fetched, put on the desk, and
// a leaf made of the two pages' snapshots swings over the spine on top of it.
// Reduced motion, or no script: the links are plain links and the book is simply open.

import { mountWiring } from './wiring';

declare global { interface Window { khBook?: boolean } }

const root = document.documentElement;
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const onePage = matchMedia('(max-width: 1099px)');
const scene = document.querySelector<HTMLElement>('.scene');
const block = document.querySelector<HTMLElement>('.block');
let spread = block?.querySelector<HTMLElement>('.spread') ?? null;

/* the fore-edge strip the thumb tabs sit on, past the right page */
const EDGE = 8;
const COVER_EASE = 'cubic-bezier(.52, 0, .2, 1)';
const LEAF_EASE = 'cubic-bezier(.45, .05, .2, 1)';
const rad = (d: number) => (d * Math.PI) / 180;
const wait = (ms: number) => new Promise<void>(r => setTimeout(r, ms));

/* light and shadow follow the leaf's angle, so they are sampled along it rather than eased on their own */
type Light = (deg: number) => number;
const faceUp: Light = a => 0.42 * Math.sin(rad(Math.min(a, 90)));
const faceDown: Light = a => 0.42 * Math.sin(rad(Math.max(a, 90)));
const castFrom: Light = a => (a < 90 ? Math.sin(rad(2 * a)) : 0);
const castOnto: Light = a => (a > 90 ? Math.sin(rad(2 * (180 - a))) : 0);
function along(a0: number, a1: number, f: Light, steps = 18): Keyframe[] {
  return Array.from({ length: steps + 1 }, (_, i) => {
    const p = i / steps;
    return { offset: p, opacity: Math.max(0, f(Math.abs(a0 + (a1 - a0) * p))) };
  });
}

let running: Animation[] = [];
const finishRunning = () => running.forEach(a => { try { a.finish(); } catch { /* already done */ } });

const el = (cls: string, parent?: HTMLElement) => {
  const e = document.createElement('div');
  e.className = cls;
  parent?.append(e);
  return e;
};

/** a still copy of a spread, with its thumb index, laid out at the book's width */
function snapshot(of: HTMLElement, thumbs: Element | null, width: number, x: number) {
  const c = of.cloneNode(true) as HTMLElement;
  if (thumbs) c.append(thumbs.cloneNode(true));
  c.removeAttribute('data-hot');
  c.removeAttribute('data-harness');
  c.removeAttribute('data-diagram');
  c.querySelectorAll('[id]').forEach(n => n.removeAttribute('id'));
  c.querySelectorAll('.hot').forEach(n => n.classList.remove('hot'));
  c.classList.add('snap');
  c.style.width = `${width}px`;
  c.style.left = `${x}px`;
  return c;
}

/** a face of a leaf (or the page under it): a window onto one half of a snapshot, paper behind it */
function face(cls: string, snap: HTMLElement, paper: [number, number]) {
  const f = el(cls);
  const p = el('paper', f);
  p.style.left = `${paper[0]}px`;
  p.style.width = `${paper[1]}px`;
  f.append(snap);
  el('shade', f);
  return f;
}

/* perspective from the middle of the screen, wherever the book is scrolled to */
function aim(rig: HTMLElement, x: number) {
  const top = rig.getBoundingClientRect().top;
  rig.style.perspectiveOrigin = `${x}px ${Math.round(innerHeight / 2 - top)}px`;
}

if (scene && block && spread) {
  window.khBook = true;
  let wiring = mountWiring(spread);
  let chain: Promise<unknown> = Promise.resolve();

  /* ---------- opening ---------- */
  async function open() {
    if (!root.classList.contains('book-shut')) return;
    const rig = scene!.querySelector<HTMLElement>('.cover-rig')!;
    const cover = rig.querySelector<HTMLElement>('.cover')!;
    const inner = rig.querySelector<HTMLElement>('.cv-in')!;
    void document.body.offsetHeight;
    await Promise.race([document.fonts.ready, wait(1200)]);
    wiring.draw();
    const two = !onePage.matches;
    const W = block!.offsetWidth;
    if (two) {
      /* the cover's inside carries the left page, so it lands as the page it uncovers */
      inner.style.width = `${W / 2}px`;
      inner.style.height = `${block!.offsetHeight}px`;
      inner.replaceChildren(snapshot(spread!, null, W, 0));
    }
    aim(rig, two ? rig.offsetWidth / 2 : 0);
    const to = two ? -180 : -105;
    const t: KeyframeAnimationOptions = { duration: two ? 900 : 640, delay: 180, easing: COVER_EASE, fill: 'both' };
    running = [
      cover.animate([{ transform: 'rotateY(0deg)' }, { transform: `rotateY(${to}deg)` }], t),
      rig.querySelector('.cv-front .shade')!.animate(along(0, to, faceUp), t),
      rig.querySelector('.cast')!.animate(along(0, to, castFrom), t)
    ];
    if (two) running.push(rig.querySelector('.cv-back .shade')!.animate(along(0, to, faceDown), t));
    await running[0].finished.catch(() => {});
    root.classList.remove('book-shut');
    inner.replaceChildren();
    running.forEach(a => a.cancel());
    running = [];
  }

  /* ---------- turning a leaf ---------- */
  const cache = new Map<string, Promise<Document>>();
  function load(path: string) {
    let p = cache.get(path);
    if (!p) {
      p = fetch(path)
        .then(r => { if (!r.ok) throw new Error(`${r.status}`); return r.text(); })
        .then(t => new DOMParser().parseFromString(t, 'text/html'));
      p.catch(() => cache.delete(path));
      cache.set(path, p);
    }
    return p;
  }

  async function turnTo(path: string, push: boolean) {
    const doc = await load(path);
    const next = doc.querySelector<HTMLElement>('.spread');
    const nextThumbs = doc.querySelector('.thumbs');
    if (!next || !nextThumbs) throw new Error('not a page of the manual');
    const from = Number(spread!.dataset.page), to = Number(next.dataset.page);
    if (from === to) return;
    const forward = to > from;

    if (push) history.pushState({ manual: true }, '', path);
    scrollTo(0, 0);
    document.title = doc.title;
    const desc = doc.querySelector('meta[name="description"]')?.getAttribute('content');
    if (desc) document.querySelector('meta[name="description"]')?.setAttribute('content', desc);

    const W = block!.offsetWidth, half = W / 2;
    const oldH = spread!.offsetHeight;
    const oldThumbs = block!.querySelector('.thumbs');
    const oldA = snapshot(spread!, oldThumbs, W, 0), oldB = snapshot(spread!, oldThumbs, W, 0);

    /* the new page goes on the desk first, wired, under where the leaf will be */
    wiring.destroy();
    const incoming = document.importNode(next, true);
    spread!.replaceWith(incoming);
    spread = incoming;
    const thumbs = document.importNode(nextThumbs, true);
    oldThumbs?.replaceWith(thumbs);
    wiring = mountWiring(spread);
    const newH = spread.offsetHeight, H = Math.max(oldH, newH);
    block!.style.minHeight = `${H}px`;
    block!.classList.add('turning');
    const fresh = snapshot(spread, thumbs, W, 0);

    const rig = el('flip');
    rig.setAttribute('aria-hidden', 'true');
    rig.inert = true;
    const two = !onePage.matches;
    const leaf = el('leaf');
    let under: HTMLElement | null = null;
    const cast = el('flip-cast');
    let a0: number, a1: number;

    if (two) {
      const w = half + EDGE;
      leaf.style.width = `${w}px`;
      /* the shadow a lifting leaf throws is darkest at the spine */
      cast.classList.add(forward ? 'dark-l' : 'dark-r');
      if (forward) {
        /* the right page lifts off the new right page and lands on the old left one */
        oldA.style.left = '0px';
        under = face('flip-under', oldA, [0, half]);
        under.style.cssText = `left:0;width:${half}px`;
        under.querySelector('.shade')!.classList.add('dark-r');
        oldB.style.left = `${-half}px`;
        fresh.style.left = `${EDGE}px`;
        leaf.style.left = `${half}px`;
        leaf.style.transformOrigin = 'left center';
        leaf.append(face('leaf-face leaf-front', oldB, [0, half]), face('leaf-face leaf-back', fresh, [EDGE, half]));
        cast.style.cssText = `left:${half}px;width:${half}px`;
        a0 = 0; a1 = -180;
      } else {
        oldA.style.left = `${-half}px`;
        under = face('flip-under', oldA, [0, half]);
        under.style.cssText = `left:${half}px;width:${w}px`;
        under.querySelector('.shade')!.classList.add('dark-l');
        oldB.style.left = `${EDGE}px`;
        fresh.style.left = `${-half}px`;
        leaf.style.left = `${-EDGE}px`;
        leaf.style.transformOrigin = 'right center';
        leaf.append(face('leaf-face leaf-front', oldB, [EDGE, half]), face('leaf-face leaf-back', fresh, [0, half]));
        cast.style.cssText = `left:0;width:${half}px`;
        a0 = 0; a1 = 180;
      }
    } else {
      /* one page: the leaf turns about the left edge and leaves the screen edge-on */
      leaf.style.cssText = `left:0;width:${W}px;transform-origin:left center`;
      cast.classList.add('dark-l');
      cast.style.cssText = `left:0;width:${W}px`;
      if (forward) {
        leaf.append(face('leaf-face leaf-front', oldA, [0, W]));
        a0 = 0; a1 = -105;
      } else {
        under = face('flip-under', oldA, [0, W]);
        under.style.cssText = `left:0;width:${W}px`;
        leaf.append(face('leaf-face leaf-front', fresh, [0, W]));
        a0 = -105; a1 = 0;
      }
    }
    if (under) rig.append(under);
    rig.append(cast, leaf);
    block!.append(rig);
    aim(rig, two ? half : 0);

    const t: KeyframeAnimationOptions = { duration: two ? 700 : 540, easing: LEAF_EASE, fill: 'both' };
    const front = leaf.querySelector<HTMLElement>('.leaf-front .shade')!;
    const back = leaf.querySelector<HTMLElement>('.leaf-back .shade');
    running = [
      leaf.animate([{ transform: `rotateY(${a0}deg)` }, { transform: `rotateY(${a1}deg)` }], t),
      front.animate(along(a0, a1, faceUp), t),
      cast.animate(along(a0, a1, two || forward ? castFrom : castOnto), t)
    ];
    if (back) running.push(back.animate(along(a0, a1, faceDown), t));
    if (two && under) running.push(under.querySelector<HTMLElement>('.shade')!.animate(along(a0, a1, castOnto), t));
    await running[0].finished.catch(() => {});

    rig.remove();
    running = [];
    block!.classList.remove('turning');
    block!.style.minHeight = '';
    if (newH < H) {
      block!.animate([{ height: `${H}px` }, { height: `${newH}px` }], { duration: 260, easing: 'cubic-bezier(.2, .8, .2, 1)' });
    }
    const h1 = spread.querySelector<HTMLElement>('h1');
    if (h1) { h1.tabIndex = -1; h1.focus({ preventScroll: true }); }
  }

  function request(path: string, push: boolean) {
    finishRunning();
    chain = chain.then(() => turnTo(path, push)).catch(() => { location.href = path; });
  }

  /* only links to another page of the manual turn a leaf */
  const manualPath = (a: HTMLAnchorElement | null) => {
    if (!a || a.target || a.hasAttribute('download') || !a.closest('.desk') || a.closest('.flip')) return null;
    const url = new URL(a.href, location.href);
    if (url.origin !== location.origin || !url.pathname.startsWith('/projects/')) return null;
    return url.pathname;
  };
  const linkOf = (e: Event) => (e.target as Element | null)?.closest?.<HTMLAnchorElement>('a[href]') ?? null;

  document.addEventListener('click', e => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const path = manualPath(linkOf(e));
    if (!path || reduced.matches) return;
    e.preventDefault();
    if (path === location.pathname) return;
    request(path, true);
  });
  /* fetch the page while the pointer is still on its way to it */
  const warm = (e: Event) => { const p = manualPath(linkOf(e)); if (p && p !== location.pathname) load(p).catch(() => {}); };
  document.addEventListener('pointerover', warm, { passive: true });
  document.addEventListener('focusin', warm);

  history.scrollRestoration = 'manual';
  history.replaceState({ manual: true }, '');
  addEventListener('popstate', () => {
    if (!location.pathname.startsWith('/projects/')) { location.reload(); return; }
    if (reduced.matches) { location.reload(); return; }
    request(location.pathname, false);
  });

  chain = open();
}
