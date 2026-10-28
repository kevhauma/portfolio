// The paper road map and the sticky notes. The map is a sheet of panels nested fold in fold, so it folds like a
// real one: columns onto the cover, then rows up behind it. A note picks a country: a folded map opens on it, an
// open one turns over to it, the same note again folds it. Picking a trip folds the map away and flies the globe.
import { countries, type Country, type Mode, type Trip } from '../data/map';

type Globe = { go(id: string): void; filter(off: Set<string>): void; room(px: number): void };
const SWATCH: Record<Mode, string> = {
  moto: '#E2001A', car: '#13254F', bike: '#00843D',
  walk: 'repeating-linear-gradient(90deg,#F7F8FA 0 5px,#0A1330 5px 7px)', race: 'repeating-linear-gradient(90deg,#E2001A 0 5px,#F7F8FA 5px 10px)'
};
const TICK = '<span class="box" aria-hidden="true"><svg width="20" height="20" viewBox="0 0 20 20"><path d="M3 10l5 5L18 2" fill="none" stroke="#0A1330" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg></span>';
const esc = (s: string) => s.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);
const modes = (c: Country) => [...new Set(c.trips.map(t => t.mode))].map(m => `<i style="background:${SWATCH[m]}"></i>`).join('');
const count = (n: number) => `${n} ${n > 1 ? 'trips' : 'trip'}`;

export function mountAtlas(stage: HTMLElement, globe: Globe) {
  const atlas = stage.querySelector<HTMLElement>('[data-atlas]')!;
  const notes = stage.querySelector<HTMLElement>('[data-notes]')!;
  const mqRM = matchMedia('(prefers-reduced-motion: reduce)');
  const reduce = () => mqRM.matches;
  const byTrip = new Map(countries.flatMap(c => c.trips.map(t => [t.id, { c, t }] as const)));
  const name = (id: string) => id === 'overview' ? 'Everywhere' : countries.find(c => c.id === id)?.short ?? countries.find(c => c.id === id)?.name ?? byTrip.get(id)?.t.short ?? byTrip.get(id)?.t.name ?? '';
  const menu = { sheet: 'index', now: 'overview', off: new Set<string>() };
  let size = { cols: 2, rows: 1, pw: 216, ph: 148 };

  /* ---------- faces ---------- */
  const unfoldBtn = () => `<button class="unfold" type="button" aria-controls="atlas"><span class="ut">Open</span><svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true"><path d="M1 3l4 4 4-4" fill="none" stroke="#F7F8FA" stroke-width="2.2"/></svg></button>`;
  const nowLine = () => `<p class="now">Now<b>${esc(name(menu.now))}</b></p><span class="stripes" aria-hidden="true"></span>`;
  const coverIndex = () => `<div class="face front cover"><p class="m">Sheet 04</p>
    <h2 class="ink cv-title"><span class="the">The</span><span class="map">Map</span></h2>${nowLine()}${unfoldBtn()}</div>`;
  const coverCountry = (c: Country) => `<div class="face front cover ccover"><p class="m">Sheet 04</p>
    <svg class="flag" aria-hidden="true"><use href="#fl-${c.id}"/></svg>
    <h2 class="ink cn${c.name.length > 12 ? ' xl' : c.name.length > 9 ? ' long' : ''}">${esc(c.name)}</h2>${nowLine()}${unfoldBtn()}</div>`;
  const blurb = () => `<div class="face front blurb"><span class="ref">B1</span>
    <p>Everywhere Kevin has ridden, driven, cycled and walked. Pick a country from the notes.</p>
    <button class="whole" type="button" data-go="overview">Whole globe</button>
    <p class="sample">Sample trips for now</p></div>`;
  const legend = () => `<div class="face front legend" role="group" aria-label="Show or hide each mode"><span class="ref">A2</span><h3 class="ink">Show</h3>
    ${([['moto', 'Motorcycle'], ['car', 'Car'], ['bike', 'Bicycle'], ['walk', 'Walk'], ['photo', 'Photos']] as const).map(([k, t]) =>
      `<button class="key${menu.off.has(k) ? ' off' : ''}" type="button" data-k="${k}" aria-pressed="${!menu.off.has(k)}">${TICK}${t}<span class="smp${k === 'photo' ? ' print' : ''}" style="${k === 'photo' ? '' : `background:${SWATCH[k]}`}"></span></button>`).join('')}</div>`;
  const tripFace = (t: Trip, c: Country, ref: string) => `<div class="face front"><button class="trip${t.id === menu.now ? ' on' : ''}" type="button" data-go="${t.id}"${t.id === menu.now ? ' aria-current="true"' : ''}><span class="ref" aria-hidden="true">${ref}</span>
    <svg class="flag" aria-hidden="true"><use href="#fl-${c.id}"/></svg>
    <span class="ink nm${t.name.length > 11 ? ' long' : ''}">${esc(t.name)}</span>
    <span class="type"><i style="background:${SWATCH[t.mode]}"></i>${esc(t.type)}</span></button></div>`;
  const blankFace = (ref: string) => `<div class="face front blank"><span class="ref" aria-hidden="true">${ref}</span><svg width="70" height="70" viewBox="-35 -35 70 70" aria-hidden="true"><g fill="none" stroke="rgb(19 37 79/.35)" stroke-width="1.5"><circle r="24"/><path d="M0-32V32M-32 0H32"/></g><path d="M0-22L5 0 0 22-5 0z" fill="rgb(19 37 79/.35)"/></svg></div>`;

  /* ---------- layout: nested folds, as many columns as fit, panels as short as the stage needs ---------- */
  function build() {
    const c = countries.find(x => x.id === menu.sheet);
    const cells: (string | Trip | null)[] = c ? [coverCountry(c), ...c.trips] : [coverIndex(), blurb(), legend()];
    const W = stage.clientWidth, H = stage.clientHeight, narrow = W < 760;
    const left = parseFloat(getComputedStyle(atlas).left) || 164, top = parseFloat(getComputedStyle(atlas).top) || 36;
    const maxCols = narrow ? 2 : cells.length <= 15 ? 3 : 4;
    const cols = Math.min(maxCols, cells.length <= 4 ? 2 : 3);
    while (cells.length % cols) cells.push(null);
    const rows = cells.length / cols;
    const pw = Math.min(216, Math.floor((W - left - 12) / cols));
    const ph = Math.max(92, Math.min(148, Math.floor((H - top - 104) / rows), Math.round(pw * 0.69)));
    size = { cols, rows, pw, ph };
    stage.classList.toggle('compact', ph < 140 || pw < 200);
    for (const [k, v] of [['--pw', pw], ['--ph', ph], ['--W', cols * pw], ['--H', rows * ph]] as const) stage.style.setProperty(k, v + 'px');
    const leaf = document.createElement('div'); leaf.className = 'leaf'; atlas.replaceChildren(leaf);
    let parentRow: HTMLElement = leaf;
    for (let r = 0; r < rows; r++) {
      const row = document.createElement('div'); row.className = 'row' + (r ? ' r ' + (r % 2 ? 'o' : 'e') : '');
      parentRow.append(row); parentRow = row;
      let parent: HTMLElement = row;
      for (let k = 0; k < cols; k++) {
        const cell = cells[r * cols + k], ref = 'ABCD'[k] + (r + 1);
        const pnl = document.createElement('div'); pnl.className = 'pnl' + (k ? ' c ' + (k % 2 ? 'o' : 'e') : '') + (k % 2 ? ' mid' : k ? ' last' : '');
        pnl.innerHTML = (typeof cell === 'string' ? cell : cell ? tripFace(cell, c!, ref) : blankFace(ref)) + '<div class="face back"></div>';
        parent.append(pnl); parent = pnl;
      }
    }
    sync();
  }

  /* ---------- fold and unfold ---------- */
  const isShut = () => atlas.classList.contains('shut');
  function sync() {
    const shut = isShut();
    atlas.querySelectorAll('.unfold').forEach(b => { b.setAttribute('aria-expanded', String(!shut)); b.querySelector('.ut')!.textContent = shut ? 'Open' : 'Fold'; b.setAttribute('aria-label', shut ? 'Open the map' : 'Fold the map'); });
    atlas.querySelectorAll<HTMLElement>('.face').forEach(f => { f.inert = shut && !f.classList.contains('cover') || f.classList.contains('back'); });
    const left = parseFloat(getComputedStyle(atlas).left) || 0;
    globe.room(shut ? 0 : left + size.cols * size.pw);
  }
  function setShut(shut: boolean) { atlas.classList.toggle('shut', shut); stage.classList.toggle('shut', shut); sync(); }
  /** an open map turns over to another country: a quarter turn away, the new sheet, a quarter turn back */
  let turning = 0;
  function flipTo(sheet: string) {
    menu.sheet = sheet; const id = ++turning;
    if (reduce() || isShut()) { build(); return; }
    const leaf = atlas.querySelector<HTMLElement>('.leaf')!; stage.classList.add('flipping');
    leaf.style.transition = 'transform .26s cubic-bezier(.55,0,.8,.3)'; leaf.style.transform = 'rotateY(90deg)';
    setTimeout(() => {
      if (id !== turning) return;
      build();
      const l2 = atlas.querySelector<HTMLElement>('.leaf')!; l2.style.transform = 'rotateY(-90deg)'; l2.getBoundingClientRect();
      l2.style.transition = 'transform .42s cubic-bezier(.16,1,.3,1)'; l2.style.transform = 'none';
      setTimeout(() => { if (id === turning) stage.classList.remove('flipping'); }, 440);
    }, 260);
  }
  function openOn(sheet: string) {
    if (isShut() || reduce()) {
      menu.sheet = sheet; turning++; build();
      atlas.getBoundingClientRect(); // the new sheet lays out folded first, so the unfold animates from there
      setShut(false);
    } else flipTo(sheet);
  }

  /* ---------- the notes ---------- */
  const TONES = [['#FBD769', '#E5B03E'], ['#F6B07A', '#DC8A57'], ['#F8E3A6', '#E0C07A']], TILT = [-1.6, 1.1, -0.5, 1.7, -1.2, 0.6, -1.9];
  notes.innerHTML = countries.map((c, i) => `<button class="snote" type="button" data-country="${c.id}" style="--i:${i};--n:${TONES[i % 3][0]};--n2:${TONES[i % 3][1]};--r:${TILT[i % TILT.length]}deg;z-index:${20 - i}">
    <span class="tx"><span class="ink nm${c.name.length > 11 ? ' long' : ''}">${esc(c.name)}</span><span class="ct">${count(c.trips.length)}<span class="modes" aria-hidden="true">${modes(c)}</span></span></span>
    <svg class="flag" aria-hidden="true"><use href="#fl-${c.id}"/></svg></button>`).join('');
  const markNote = (id: string | null) => notes.querySelectorAll<HTMLElement>('.snote').forEach(n => { const on = n.dataset.country === id; n.classList.toggle('on', on); on ? n.setAttribute('aria-current', 'true') : n.removeAttribute('aria-current'); });
  function country(id: string) {
    if (menu.sheet === id && !isShut()) return setShut(true); // the same note again folds the map
    markNote(id); setNow(id); globe.go(id); openOn(id);
  }
  notes.addEventListener('click', e => { const n = (e.target as Element).closest<HTMLElement>('.snote'); if (n) country(n.dataset.country!); });

  /* ---------- picking ---------- */
  function setNow(id: string) {
    menu.now = id;
    atlas.querySelectorAll('.now b').forEach(b => { b.textContent = name(id); });
    atlas.querySelectorAll<HTMLElement>('.trip[data-go]').forEach(b => { const on = b.dataset.go === id; b.classList.toggle('on', on); on ? b.setAttribute('aria-current', 'true') : b.removeAttribute('aria-current'); });
    history.replaceState(null, '', id === 'overview' ? location.pathname : '#' + id);
  }
  /** a trip from anywhere (a panel, a print on the globe, the list below): the map folds onto its country */
  function trip(id: string) {
    const hit = byTrip.get(id); if (!hit) return;
    if (menu.sheet !== hit.c.id) { menu.sheet = hit.c.id; build(); }
    markNote(hit.c.id); setNow(id); globe.go(id);
    setTimeout(() => setShut(true), reduce() ? 0 : 260); // picked: the map folds away and gives the globe the room
  }
  atlas.addEventListener('click', e => {
    const b = (e.target as Element).closest<HTMLButtonElement>('button'); if (!b) return;
    if (b.classList.contains('unfold')) return setShut(!isShut());
    if (b.dataset.k) {
      const off = b.classList.toggle('off'); b.setAttribute('aria-pressed', String(!off));
      off ? menu.off.add(b.dataset.k) : menu.off.delete(b.dataset.k); return globe.filter(menu.off);
    }
    if (b.dataset.go === 'overview') { markNote(null); setNow('overview'); globe.go('overview'); return setShut(true); }
    if (b.dataset.go) trip(b.dataset.go);
  });
  addEventListener('keydown', e => { if (e.key === 'Escape' && !isShut()) { setShut(true); atlas.querySelector<HTMLElement>('.unfold')?.focus(); } });
  stage.addEventListener('globe:touch', () => { if (!isShut()) setShut(true); }); // touching the globe means the map is not in use

  /* ---------- start folded, on the hash if there is one ---------- */
  const start = location.hash.slice(1);
  const startCountry = countries.find(c => c.id === start)?.id ?? byTrip.get(start)?.c.id;
  if (startCountry) { menu.sheet = startCountry; menu.now = start; markNote(startCountry); }
  atlas.classList.add('shut'); stage.classList.add('shut'); build();
  new ResizeObserver(() => build()).observe(stage);
  return { trip, start: startCountry ? start : null };
}
