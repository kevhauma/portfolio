// Draws the manual's wires from the page's own layout, and lights up a circuit on hover, focus or tap.
// Contents spread: one loom, a branch per connector. Project page: each key row wired across the gutter
// into the parts it feeds. Without this script the page still reads: swatches and pin chips carry the colours.
// book.ts mounts it on the spread on the desk.

const SVG = 'http://www.w3.org/2000/svg';
type Box = { x: number; y: number; w: number; h: number };

const boxOf = (el: Element, origin: DOMRect): Box => {
  const r = el.getBoundingClientRect();
  return { x: r.left - origin.left, y: r.top - origin.top, w: r.width, h: r.height };
};
const LIGHT = new Set(['#F4F4F0', '#E0A800']);

function wire(svg: SVGSVGElement, d: string, colour: string, opts: { key?: string; legacy?: boolean; width?: number } = {}) {
  const g = document.createElementNS(SVG, 'g');
  g.classList.add('w');
  if (opts.key) g.dataset.key = opts.key;
  const width = opts.width ?? 3.5;
  if (opts.legacy) {
    const p = document.createElementNS(SVG, 'path');
    p.setAttribute('d', d);
    p.setAttribute('stroke', '#8D939C');
    p.setAttribute('stroke-width', String(width - 1));
    p.setAttribute('stroke-dasharray', '7 6');
    g.append(p);
  } else {
    if (LIGHT.has(colour.toUpperCase())) {
      const u = document.createElementNS(SVG, 'path');
      u.setAttribute('d', d);
      u.setAttribute('stroke', '#13254F');
      u.setAttribute('stroke-width', String(width + 2.5));
      g.append(u);
    }
    const p = document.createElementNS(SVG, 'path');
    p.setAttribute('d', d);
    p.setAttribute('stroke', colour);
    p.setAttribute('stroke-width', String(width));
    g.append(p);
  }
  svg.append(g);
  return g;
}

function sizeSvg(svg: SVGSVGElement, host: HTMLElement) {
  const w = host.offsetWidth, h = host.offsetHeight;
  svg.setAttribute('width', String(w));
  svg.setAttribute('height', String(h));
  svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
  svg.replaceChildren();
}

/* ---------- contents: the main harness ---------- */
function harness(spread: HTMLElement) {
  const svg = spread.querySelector<SVGSVGElement>('svg.wiring')!;
  const loom = spread.querySelector<HTMLElement>('.loom')!;
  const circuits = [...spread.querySelectorAll<HTMLElement>('[data-circuit]')];

  function draw() {
    sizeSvg(svg, spread);
    const o = spread.getBoundingClientRect();
    const L = boxOf(loom, o);
    const vertical = L.h > L.w;
    const ends = circuits.map(c => {
      const colour = getComputedStyle(c).getPropertyValue('--w').trim();
      const pin = boxOf(c.querySelector('.pin')!, o);
      const box = boxOf(c, o);
      const down = c.dataset.side === 'down' || c.dataset.circuit === 'F';
      return { c, colour, pin, box, down, id: c.dataset.circuit! };
    });
    const GAP = 7;
    if (!vertical) {
      /* up-branches leave the top of the bundle, down-branches the bottom, nearest first, so no branch crosses the bundle */
      const up = ends.filter(e => !e.down).sort((a, b) => a.pin.x - b.pin.x);
      const down = ends.filter(e => e.down).sort((a, b) => b.pin.x - a.pin.x);
      const lanes = [...up, ...down];
      const top = L.y + L.h / 2 - ((lanes.length - 1) * GAP) / 2;
      const src = spread.querySelector('.loom-src');
      const sb = src ? boxOf(src, o) : null;
      const x0 = sb && sb.w ? sb.x + sb.w + 6 : L.x + 8;
      /* the sleeve binds the bundle until the first wire leaves it */
      const firstOut = Math.min(...lanes.map(e => e.pin.x + e.pin.w / 2)) - 14;
      const sleeve = document.createElementNS(SVG, 'rect');
      sleeve.setAttribute('x', String(x0 + 4));
      sleeve.setAttribute('y', String(top - 7));
      sleeve.setAttribute('width', String(Math.max(0, firstOut - x0 - 4)));
      sleeve.setAttribute('height', String((lanes.length - 1) * GAP + 14));
      sleeve.setAttribute('rx', '7');
      sleeve.setAttribute('class', 'sleeve');
      lanes.forEach((e, i) => {
        const y = top + i * GAP;
        const x = e.pin.x + e.pin.w / 2;
        const yEnd = e.down ? e.pin.y : e.pin.y + e.pin.h;
        wire(svg, `M${x0} ${y} H${x} V${yEnd}`, e.colour, { key: e.id, width: 3.5 });
      });
      svg.append(sleeve);
    } else {
      /* phone: the loom runs down the left edge; the wire that leaves first sits on the right */
      const lanes = [...ends].sort((a, b) => b.box.y - a.box.y);
      const left = L.x + L.w / 2 - ((lanes.length - 1) * GAP) / 2;
      const y0 = L.y + 14;
      /* the loom's head: a terminal block the wires leave from */
      const head = document.createElementNS(SVG, 'rect');
      head.setAttribute('x', String(left - 7));
      head.setAttribute('y', String(L.y));
      head.setAttribute('width', String((lanes.length - 1) * GAP + 14));
      head.setAttribute('height', '14');
      head.setAttribute('class', 'loom-head');
      lanes.forEach((e, i) => {
        const x = left + i * GAP;
        const y = e.box.y + 26;
        wire(svg, `M${x} ${y0} V${y} H${e.box.x}`, e.colour, { key: e.id, width: 3.5 });
      });
      svg.append(head);
    }
    hot(current);
  }

  let current: string | null = null;
  function hot(id: string | null) {
    current = id;
    spread.toggleAttribute('data-hot', !!id);
    svg.querySelectorAll<SVGGElement>('g.w').forEach(g => g.classList.toggle('hot', g.dataset.key === id));
    circuits.forEach(c => c.classList.toggle('hot', c.dataset.circuit === id));
    /* the thumb index is swapped when a page turns, so look it up each time */
    document.querySelectorAll<HTMLElement>('[data-thumb]').forEach(t => t.classList.toggle('hot', t.dataset.thumb === id));
  }
  circuits.forEach(c => {
    const id = c.dataset.circuit!;
    c.addEventListener('pointerenter', () => hot(id));
    c.addEventListener('pointerleave', () => hot(null));
    c.addEventListener('focusin', () => hot(id));
    c.addEventListener('focusout', () => hot(null));
  });
  return draw;
}

/* ---------- a project page: key rows into parts ---------- */
function diagram(spread: HTMLElement) {
  const svg = spread.querySelector<SVGSVGElement>('svg.wiring')!;
  const keys = [...spread.querySelectorAll<HTMLButtonElement>('.key-row')];
  const parts = [...spread.querySelectorAll<HTMLElement>('.part')];
  let locked: string | null = null;

  function draw() {
    sizeSvg(svg, spread);
    const o = spread.getBoundingClientRect();
    const right = Math.max(...keys.map(k => boxOf(k.querySelector('.key-term')!, o)).map(b => b.x + b.w));
    const GAP = 9;
    keys.forEach((k, i) => {
      const id = k.dataset.key!;
      const colour = getComputedStyle(k).getPropertyValue('--w').trim();
      const legacy = k.classList.contains('legacy');
      const t = boxOf(k.querySelector('.key-term')!, o);
      const ty = t.y + t.h / 2;
      parts.forEach(p => {
        const pin = p.querySelector(`[data-pin="${id}"]`);
        if (!pin) return;
        const pb = boxOf(pin, o);
        const py = pb.y + pb.h / 2;
        const across = pb.x > right + 20;
        if (across) {
          /* spread: down the gutter in this wire's own channel, then into the part from the left */
          const cx = right + 16 + i * GAP;
          wire(svg, `M${t.x + t.w} ${ty} H${cx} V${py} H${pb.x}`, colour, { key: id, legacy });
        } else {
          /* one page: out to the right margin, down, and into the part from the right */
          const cx = spread.offsetWidth - 12 - i * GAP;
          wire(svg, `M${t.x + t.w} ${ty} H${cx} V${py} H${pb.x + pb.w}`, colour, { key: id, legacy });
        }
      });
    });
    paint();
  }

  let hover: string[] | null = null;
  function paint() {
    const on = hover ?? (locked ? [locked] : null);
    spread.toggleAttribute('data-hot', !!on);
    const set = new Set(on ?? []);
    svg.querySelectorAll<SVGGElement>('g.w').forEach(g => g.classList.toggle('hot', set.has(g.dataset.key!)));
    keys.forEach(k => k.classList.toggle('hot', set.has(k.dataset.key!)));
    parts.forEach(p => p.classList.toggle('hot', (p.dataset.feeds ?? '').split(' ').some(f => set.has(f))));
  }
  keys.forEach(k => {
    const id = k.dataset.key!;
    k.addEventListener('pointerenter', () => { hover = [id]; paint(); });
    k.addEventListener('pointerleave', () => { hover = null; paint(); });
    k.addEventListener('focus', () => { hover = [id]; paint(); });
    k.addEventListener('blur', () => { hover = null; paint(); });
    k.addEventListener('click', () => {
      locked = locked === id ? null : id;
      keys.forEach(b => b.setAttribute('aria-pressed', String(b.dataset.key === locked)));
      paint();
    });
  });
  parts.forEach(p => {
    const feeds = (p.dataset.feeds ?? '').split(' ');
    p.addEventListener('pointerenter', () => { hover = feeds; paint(); });
    p.addEventListener('pointerleave', () => { hover = null; paint(); });
    p.addEventListener('focusin', () => { hover = feeds; paint(); });
    p.addEventListener('focusout', () => { hover = null; paint(); });
  });
  spread.addEventListener('keydown', e => {
    if (e.key === 'Escape' && locked) { locked = null; keys.forEach(b => b.setAttribute('aria-pressed', 'false')); paint(); }
  });
  return draw;
}

export type Wiring = { draw: () => void; destroy: () => void };

/** wires one spread and keeps it wired through resizes; book.ts mounts it again on every turned page */
export function mountWiring(spread: HTMLElement): Wiring {
  const draw = spread.hasAttribute('data-harness') ? harness(spread) : diagram(spread);
  let raf = 0;
  const redraw = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(draw); };
  draw();
  const ro = new ResizeObserver(redraw);
  ro.observe(spread);
  document.fonts?.ready.then(redraw);
  return { draw, destroy: () => { cancelAnimationFrame(raf); ro.disconnect(); } };
}
