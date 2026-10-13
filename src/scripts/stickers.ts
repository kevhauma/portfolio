// The stickers catch the light. The cursor is a lamp held over the decal sheet: the whole sheet tilts toward it as
// one piece (the side under the lamp presses in), and each sticker's clearcoat or foil follows the light. The car
// is printed on the sheet, so it tilts with it but stays matte. On touch, the sun hangs above the top right of the
// screen, so the shine slides over the foil as the page scrolls, and a press on the sheet is the lamp until the
// finger lifts. Reduced motion keeps everything still under the resting light in the CSS.

const plate = document.querySelector<HTMLElement>('.plate');
const still = matchMedia('(prefers-reduced-motion: reduce)');
const touch = matchMedia('(hover: none)');

type Box = { x: number; y: number; w: number; h: number };
type Light = { lx: number; ly: number; lit: number };
type Sticker = Box & { el: HTMLElement; cur: Light; tgt: Light };

// where the light rests with no lamp over the sheet: top left, low
const REST: Light = { lx: 22, ly: 8, lit: 0.3 };
// how far the lamp reaches, in px from a sticker's edge
const REACH = 160;
// how far the sheet tilts at most, in degrees, and how far from its edge the lamp still tilts it
const TILT = 4;
const HOLD = 320;

const clamp = (v: number, a: number) => Math.max(-a, Math.min(a, v));

// layout boxes in page coordinates, ignoring the sheet's own tilt
const box = (el: HTMLElement): Box => {
  let x = 0, y = 0;
  for (let n: HTMLElement | null = el; n; n = n.offsetParent as HTMLElement | null) { x += n.offsetLeft; y += n.offsetTop; }
  return { x, y, w: el.offsetWidth, h: el.offsetHeight };
};

if (plate && !still.matches) {
  const stickers: Sticker[] = [...plate.querySelectorAll<HTMLElement>('[data-finish]')].map(el => ({
    el, x: 0, y: 0, w: 0, h: 0, cur: { ...REST }, tgt: { ...REST }
  }));
  const sheet = { ...box(plate), cur: { rx: 0, ry: 0 }, tgt: { rx: 0, ry: 0 } };

  // the lamp, in viewport coordinates; null when it is off the page
  let lamp: { x: number; y: number } | null = null;
  let frame = 0;
  let last = 0;

  const measure = () => {
    Object.assign(sheet, box(plate));
    for (const s of stickers) Object.assign(s, box(s.el));
    wake();
  };

  const aim = () => {
    // the sheet
    if (lamp && sheet.w) {
      const px = lamp.x + scrollX - (sheet.x + sheet.w / 2);
      const py = lamp.y + scrollY - (sheet.y + sheet.h / 2);
      const gap = Math.hypot(Math.max(0, Math.abs(px) - sheet.w / 2), Math.max(0, Math.abs(py) - sheet.h / 2));
      const near = Math.exp(-((gap / HOLD) ** 2));
      sheet.tgt.rx = -clamp(py / (sheet.h / 2), 1) * TILT * near;
      sheet.tgt.ry = clamp(px / (sheet.w / 2), 1) * TILT * near;
    } else {
      sheet.tgt.rx = sheet.tgt.ry = 0;
    }

    // the light on each sticker
    for (const s of stickers) {
      if (!s.w) { Object.assign(s.tgt, REST); continue; }
      if (!lamp && touch.matches) {
        const px = innerWidth * 0.85 + scrollX - (s.x + s.w / 2);
        const py = -innerHeight * 0.2 + scrollY - (s.y + s.h / 2);
        s.tgt.lx = 50 + 110 * Math.tanh(px / (innerWidth * 0.6));
        s.tgt.ly = 50 + 110 * Math.tanh(py / (innerHeight * 0.5));
        s.tgt.lit = 0.45;
        continue;
      }
      if (!lamp) { Object.assign(s.tgt, REST); continue; }
      const px = lamp.x + scrollX - (s.x + s.w / 2);
      const py = lamp.y + scrollY - (s.y + s.h / 2);
      const gap = Math.hypot(Math.max(0, Math.abs(px) - s.w / 2), Math.max(0, Math.abs(py) - s.h / 2));
      s.tgt.lx = 50 + clamp(px / (s.w / 2), 2.2) * 50;
      s.tgt.ly = 50 + clamp(py / (s.h / 2), 2.2) * 50;
      s.tgt.lit = REST.lit + (1 - REST.lit) * Math.exp(-((gap / REACH) ** 2));
    }
  };

  // ease cur toward tgt; true while anything is still moving
  const ease = <T extends Record<string, number>>(cur: T, tgt: T, k: number) => {
    let moving = false;
    for (const key in cur) {
      const d = tgt[key] - cur[key];
      if (Math.abs(d) > (key === 'lit' ? 0.002 : 0.01)) { (cur as Record<string, number>)[key] += d * k; moving = true; }
      else (cur as Record<string, number>)[key] = tgt[key];
    }
    return moving;
  };

  const tick = (t: number) => {
    const dt = Math.min(64, t - (last || t - 16));
    last = t;
    aim();
    const k = 1 - Math.pow(1 - 0.12, dt / 16.7);
    let moving = ease(sheet.cur, sheet.tgt, k);
    plate.style.setProperty('--rx', sheet.cur.rx.toFixed(3));
    plate.style.setProperty('--ry', sheet.cur.ry.toFixed(3));
    for (const s of stickers) {
      moving = ease(s.cur, s.tgt, k) || moving;
      const st = s.el.style;
      st.setProperty('--lx', s.cur.lx.toFixed(1));
      st.setProperty('--ly', s.cur.ly.toFixed(1));
      st.setProperty('--lit', s.cur.lit.toFixed(3));
    }
    frame = moving ? requestAnimationFrame(tick) : 0;
    if (!moving) last = 0;
  };

  const wake = () => { if (!frame) frame = requestAnimationFrame(tick); };

  addEventListener('pointermove', e => {
    if (e.pointerType !== 'mouse' && e.pointerType !== 'pen') return;
    lamp = { x: e.clientX, y: e.clientY };
    wake();
  }, { passive: true });
  document.documentElement.addEventListener('pointerleave', () => { lamp = null; wake(); });
  addEventListener('blur', () => { lamp = null; wake(); });
  addEventListener('scroll', () => { if (lamp || touch.matches) wake(); }, { passive: true });

  // touch: a press on the sheet holds the lamp there; scrolling or lifting the finger puts it down
  plate.addEventListener('pointerdown', e => {
    if (e.pointerType === 'mouse') return;
    lamp = { x: e.clientX, y: e.clientY };
    wake();
  }, { passive: true });
  const drop = (e: PointerEvent) => { if (e.pointerType !== 'mouse' && e.pointerType !== 'pen') { lamp = null; wake(); } };
  addEventListener('pointerup', drop, { passive: true });
  addEventListener('pointercancel', drop, { passive: true });

  new ResizeObserver(measure).observe(plate);
  document.fonts?.ready.then(measure);
}

export {};
