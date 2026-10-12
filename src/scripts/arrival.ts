// The arrival, once per visit: the intro shows as raw HTML, masking tape snaps across at the rake,
// the paint goes on behind a raked wipe, and the tape comes off. Any input skips straight to the end.

const root = document.documentElement;
const tape = document.querySelector<HTMLElement>('.tape');

declare global { interface Window { khArrival?: boolean } }

if (!root.classList.contains('raw')) {
  tape?.remove();
} else {
  window.khArrival = true;
  try { sessionStorage.setItem('kh-arrived', '1'); } catch { /* storage blocked: it may replay, that's all */ }

  let done = false;
  let transition: ViewTransition | null = null;
  const wait = (ms: number) => new Promise(r => setTimeout(r, ms));

  const finish = () => {
    if (done) return;
    done = true;
    transition?.skipTransition();
    root.classList.remove('raw', 'arriving', 'vt-in');
    tape?.remove();
    removeEventListener('pointerdown', finish);
    removeEventListener('keydown', finish);
    removeEventListener('wheel', finish);
    removeEventListener('touchstart', finish);
  };
  addEventListener('pointerdown', finish, { passive: true });
  addEventListener('keydown', finish);
  addEventListener('wheel', finish, { passive: true });
  addEventListener('touchstart', finish, { passive: true });

  const fontsReady = Promise.race([
    Promise.all([
      document.fonts.load('900 italic 100px "Anybody Variable"', 'KEVIN'),
      document.fonts.load('500 16px "Hanken Grotesk Variable"')
    ]),
    wait(900)
  ]);

  (async () => {
    await wait(750);
    if (done) return;
    tape?.classList.add('snap');
    await Promise.all([wait(480), fontsReady]);
    if (done) return;
    const paint = () => { root.classList.remove('raw'); root.classList.add('vt-in'); };
    if (document.startViewTransition) {
      transition = document.startViewTransition(paint);
      await transition.finished.catch(() => {});
    } else {
      paint();
    }
    root.classList.remove('vt-in');
    if (done) return;
    tape?.classList.replace('snap', 'off');
    await wait(640);
    finish();
  })();
}

export {};
