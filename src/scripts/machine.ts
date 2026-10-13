// Fig. 3.1, the kiosk's check-in machine (KioskMachine.astro). Draws the machine's transitions from the
// figure's own layout: the spine from idle to the printout, the three choices with their detours coming back
// onto it, the way back to idle round the left margin, and a dashed lead from each state to the device it
// drives. wiring.ts mounts it with the page it sits on. Without this script the states and devices still read.

const SVG = 'http://www.w3.org/2000/svg';
type Box = { l: number; t: number; r: number; b: number; cx: number; cy: number };
type Dir = 'd' | 'r';

/* the three choices: the detour each one takes when the kiosk does not know yet */
const CHOICES = [
  { c: 'c1', side: 'driver', yes: 'on file', no: 'new', next: 'book' },
  { c: 'c2', side: 'deliv', yes: 'booked', no: 'unbooked', next: 'c3' },
  { c: 'c3', side: 'video', yes: 'seen', no: 'not seen', next: 'print' }
] as const;
/* the states that drive a device */
const DEVICES = ['lang', 'scan', 'book', 'print'];

const head = (x: number, y: number, dir: Dir, s = 4.2) =>
  dir === 'd' ? `M${x} ${y}l${-s} ${-s * 1.7}h${2 * s}Z` : `M${x} ${y}l${-s * 1.7} ${-s}v${2 * s}Z`;

type Edge = {
  d: string;
  arrow?: [number, number, Dir];
  dot?: [number, number];
  pin?: [number, number];
  link?: boolean;
  label?: { x: number; y: number; t: string; a?: 'start' | 'middle'; rot?: boolean };
};

export function mountMachine(fig: HTMLElement) {
  const grid = fig.querySelector<HTMLElement>('.km-grid')!;
  const svg = fig.querySelector<SVGSVGElement>('.km-edges')!;
  const node = (s: string) => fig.querySelector<HTMLElement>(`[data-s="${s}"]`)!;

  function draw() {
    const g = grid.getBoundingClientRect();
    const box = (el: Element): Box => {
      const b = el.getBoundingClientRect();
      const l = b.left - g.left, t = b.top - g.top;
      return { l, t, r: l + b.width, b: t + b.height, cx: l + b.width / 2, cy: t + b.height / 2 };
    };
    const B = (s: string) => box(node(s));
    const x = B('idle').cx;
    const down = (y0: number, y1: number, arrow = true): Edge => ({ d: `M${x} ${y0}V${y1}`, arrow: arrow ? [x, y1, 'd'] : undefined });
    const e: Edge[] = [];

    e.push(down(box(fig.querySelector('.km-start')!).b, B('idle').t));
    e.push(down(B('idle').b, B('lang').t));
    e.push(down(B('lang').b, B('scan').t));
    e.push(down(B('scan').b, B('c1').t));
    e.push(down(B('book').b, B('c2').t));

    CHOICES.forEach(ch => {
      const c = B(ch.c), side = B(ch.side), next = B(ch.next);
      /* the detour comes back in the gap under it, onto the spine above the next state */
      const jy = side.b + (next.t - side.b) / 2;
      e.push({ ...down(c.b, jy, false), label: { x: x + 8, y: (c.b + jy) / 2 + 3.5, t: `[${ch.yes}]`, a: 'start' } });
      e.push({ d: `M${c.r} ${c.cy}H${side.l}`, arrow: [side.l, c.cy, 'r'], label: { x: (c.r + side.l) / 2, y: c.cy - 7, t: `[${ch.no}]` } });
      e.push({ d: `M${side.l + 26} ${side.b}V${jy}H${x}`, dot: [x, jy] });
      e.push(down(jy, next.t));
    });

    /* after the printout, round the left margin and back to idle for the next driver */
    const p = B('print'), idle = B('idle'), lx = 5;
    e.push({ d: `M${p.l} ${p.cy}H${lx}V${idle.cy}H${idle.l}`, arrow: [idle.l, idle.cy, 'r'], label: { x: lx + 9, y: (idle.cy + p.cy) / 2, t: 'next driver', rot: true } });

    DEVICES.forEach(s => {
      const st = B(s);
      const port = box(fig.querySelector(`.km-dev[data-dev="${s}"] .km-port`)!);
      const mx = st.r + (port.l - st.r) / 2;
      const d = Math.abs(port.cy - st.cy) < 1 ? `M${st.r} ${st.cy}H${port.l}` : `M${st.r} ${st.cy}H${mx}V${port.cy}H${port.l}`;
      e.push({ d, link: true, pin: [st.r, st.cy] });
    });

    render(e, g.width, g.height);
  }

  function render(edges: Edge[], w: number, h: number) {
    svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
    svg.setAttribute('width', String(w));
    svg.setAttribute('height', String(h));
    svg.replaceChildren();
    const make = (tag: string, attrs: Record<string, string | number>, parent: Element) => {
      const n = document.createElementNS(SVG, tag);
      Object.entries(attrs).forEach(([k, v]) => n.setAttribute(k, String(v)));
      parent.append(n);
      return n;
    };
    edges.forEach(ed => {
      const g = make('g', { class: ed.link ? 'km-e km-link' : 'km-e' }, svg);
      make('path', { d: ed.d, class: 'km-w' }, g);
      if (ed.arrow) make('path', { d: head(...ed.arrow), class: 'km-h' }, g);
      if (ed.dot) make('circle', { cx: ed.dot[0], cy: ed.dot[1], r: 3, class: 'km-h' }, g);
      if (ed.pin) make('rect', { x: ed.pin[0], y: ed.pin[1] - 3, width: 5, height: 6, class: 'km-h' }, g);
      if (ed.label) {
        const { x, y, t, a, rot } = ed.label;
        const text = make('text', { x, y, class: 'km-g', 'text-anchor': rot ? 'middle' : a ?? 'middle' }, g);
        if (rot) text.setAttribute('transform', `rotate(-90 ${x} ${y})`);
        text.textContent = t;
      }
    });
  }

  let raf = 0;
  const redraw = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(draw); };
  const ro = new ResizeObserver(redraw);
  ro.observe(grid);
  document.fonts?.ready.then(redraw);
  draw();

  return {
    destroy: () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    }
  };
}
