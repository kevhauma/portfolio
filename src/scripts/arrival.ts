// The arrival, once per visit on the intro: key on, the AE86's tach sweeps to the stop and drops back to idle,
// then the sheet wipes in through the raked stripe wipe. Any input skips straight to the end.

const root = document.documentElement;
const tach = document.querySelector<HTMLElement>('.ignition');

declare global { interface Window { khArrival?: boolean } }

if (!root.classList.contains('arriving')) {
  tach?.remove();
} else {
  window.khArrival = true;
  try { sessionStorage.setItem('kh-arrived', '1'); } catch { /* storage blocked: it may replay, that's all */ }

  let done = false;
  let transition: ViewTransition | null = null;
  const wait = (ms: number) => new Promise(r => setTimeout(r, ms));
  const skips = ['pointerdown', 'keydown', 'wheel', 'touchstart'] as const;

  const finish = () => {
    if (done) return;
    done = true;
    transition?.skipTransition();
    root.classList.remove('arriving', 'igniting', 'vt-in');
    tach?.remove();
    skips.forEach(t => removeEventListener(t, finish));
  };
  skips.forEach(t => addEventListener(t, finish, { passive: true }));

  // the numerals are Hanken; the sheet behind is set in Sakana
  const fontsReady = Promise.race([
    Promise.all([
      document.fonts.load('italic 100px Sakana', 'KEVIN'),
      document.fonts.load('500 16px "Hanken Grotesk Variable"')
    ]),
    wait(900)
  ]);

  (async () => {
    await fontsReady;
    await wait(180);
    if (done) return;
    root.classList.add('igniting');
    await wait(1180);
    if (done) return;
    const paint = () => { root.classList.remove('arriving', 'igniting'); root.classList.add('vt-in'); };
    if (document.startViewTransition) {
      transition = document.startViewTransition(paint);
      await transition.finished.catch(() => {});
    }
    finish();
  })();
}

export {};
