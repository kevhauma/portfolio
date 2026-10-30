// The head unit's display and keys. Four track buttons show one side at a time and are relabelled when the side
// flips, so focus stays put. The counter is synthetic: each track starts at a fixed value, nothing here is a play count.
import type { Tape } from '../data/music';

const pad = (v: number) => String(v).padStart(3, '0');

export function deck(root: HTMLElement, reduced: MediaQueryList, onPick: (n: number) => void) {
  const q = <T extends HTMLElement>(s: string) => root.querySelector<T>(s)!;
  const ttl = q('[data-ttl]'), trk = q('[data-trk]'), ctr = q('[data-ctr]');
  const dolby = q('[data-dolby]'), formula = q('[data-formula]'), side = q('[data-side]'), sideL = side.querySelector('span')!;
  const bands = [...q('[data-bands]').children] as HTMLElement[];
  const slot = q('[data-slot]'), intape = q('[data-intape]');
  const rew = q<HTMLButtonElement>('[data-rew]'), ff = q<HTMLButtonElement>('[data-ff]'), ab = q<HTMLButtonElement>('[data-ab]'), ej = q<HTMLButtonElement>('[data-eject]');
  const restRows = trk.innerHTML;
  let tbs: HTMLButtonElement[] = [], roll = 0, tick = 0;

  const eq = (lv: number[]) => bands.forEach((col, b) => [...col.children].forEach((seg, s) => {
    seg.classList.toggle('on', s < lv[b]); seg.classList.toggle('pk', s === lv[b] - 1);
  }));

  const stop = () => { clearInterval(roll); clearInterval(tick); };
  const run = (start: number, end: number, instant: boolean) => {
    stop();
    if (instant || reduced.matches) { ctr.textContent = pad(start); return; }
    let n = 0, v = start;
    roll = window.setInterval(() => {
      ctr.textContent = pad(Math.floor(Math.random() * 1000));
      if (++n > 9) {
        clearInterval(roll); ctr.textContent = pad(v);
        tick = window.setInterval(() => { if (v < end) ctr.textContent = pad(++v); else clearInterval(tick); }, 1000);
      }
    }, 36);
  };

  const rest = () => {
    stop();
    ttl.textContent = 'No tape';
    trk.innerHTML = restRows; tbs = [];
    [dolby, formula, side].forEach(e => e.classList.remove('on'));
    formula.textContent = 'Type'; sideL.textContent = 'A';
    ctr.textContent = '---'; eq([0, 0, 0, 0, 0]);
    [rew, ff, ab].forEach(b => { b.disabled = true; });
    ab.setAttribute('aria-label', 'A / B: flip to side B');
    ej.disabled = true; ej.setAttribute('aria-label', 'Eject the tape and close its case');
    slot.classList.remove('full'); intape.textContent = '';
  };

  const loading = () => { ttl.textContent = 'Loading'; trk.innerHTML = '<li class="ck-dim">&nbsp;</li>'; };

  const insert = (t: Tape) => {
    intape.style.setProperty('--t', t.inDeck.bg); intape.style.setProperty('--tc', t.inDeck.fg);
    slot.classList.add('full');
    trk.innerHTML = '';
    tbs = [0, 1, 2, 3].map(() => {
      const li = document.createElement('li'), b = document.createElement('button');
      b.className = 'ck-tb'; b.type = 'button';
      b.innerHTML = '<i class="ck-tri" aria-hidden="true"></i><b></b><span></span>';
      b.addEventListener('click', () => onPick(+b.dataset.n!));
      li.appendChild(b); trk.appendChild(li);
      return b;
    });
    [dolby, side, formula].forEach(e => e.classList.add('on'));
    formula.textContent = t.formula;
    eq(t.eq);
    [rew, ff, ab].forEach(b => { b.disabled = false; });
    ej.disabled = false; ej.setAttribute('aria-label', `Eject the ${t.name} tape and close its case`);
  };

  const play = (t: Tape, n: number, instant: boolean) => {
    const B = n >= 4, s = B ? 'B' : 'A';
    tbs.forEach((b, i) => {
      const k = (B ? 4 : 0) + i, tr = t.tracks[k];
      b.dataset.n = String(k);
      b.children[1].textContent = s + (i + 1);
      b.children[2].textContent = `${tr.title} · ${tr.artist}`;
      b.setAttribute('aria-label', `Play ${tr.title}, ${tr.artist}`);
      if (k === n) b.setAttribute('aria-current', 'true'); else b.removeAttribute('aria-current');
    });
    sideL.textContent = s;
    ab.setAttribute('aria-label', `A / B: flip to side ${B ? 'A' : 'B'}`);
    intape.textContent = `${t.deckName} · side ${s}`;
    const tr = t.tracks[n];
    ttl.textContent = tr.title;
    const vh = document.createElement('span'); vh.className = 'ck-vh'; vh.textContent = `, ${tr.artist}`; ttl.appendChild(vh);
    const next = n % 4 === 3 ? tr.counter + 64 : t.tracks[n + 1].counter - 1;
    run(tr.counter, next, instant);
  };

  return { rest, loading, insert, play, keys: { rew, ff, ab, ej }, slot };
}
