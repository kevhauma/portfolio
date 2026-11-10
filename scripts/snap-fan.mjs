// Captures each section's first screen for the fan menu: public/fan/<slug>.webp.
// Run against a built site: `npm run build && npm run preview`, then `npm run snaps [baseUrl] [slug...]`.
// Uses the installed Chrome over the DevTools protocol; set CHROME to its path if it lives elsewhere.
import { spawn } from 'node:child_process';
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { sections } from '../src/data/site.ts';

const base = process.argv[2] ?? 'http://localhost:4321';
const chrome = process.env.CHROME ?? {
  win32: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  darwin: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
}[process.platform] ?? 'google-chrome';
const PORT = 9333;
const out = new URL('../public/fan/', import.meta.url);
mkdirSync(out, { recursive: true });

const profile = mkdtempSync(join(tmpdir(), 'snap-fan-'));
const proc = spawn(chrome, ['--headless=new', `--remote-debugging-port=${PORT}`, `--user-data-dir=${profile}`, '--no-first-run', '--hide-scrollbars', 'about:blank'], { stdio: 'ignore' });
const sleep = ms => new Promise(r => setTimeout(r, ms));

let page;
for (let i = 0; i < 50 && !page; i++) {
  await sleep(200);
  page = await fetch(`http://127.0.0.1:${PORT}/json/list`).then(r => r.json()).then(t => t.find(x => x.type === 'page')).catch(() => null);
}
if (!page) { proc.kill(); throw new Error(`Chrome did not start: ${chrome}`); }

const ws = new WebSocket(page.webSocketDebuggerUrl);
await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
let id = 0;
const pending = new Map(), waiters = new Map();
ws.onmessage = ({ data }) => {
  const m = JSON.parse(data);
  if (m.id) { pending.get(m.id)?.(m); pending.delete(m.id); }
  else { waiters.get(m.method)?.(m); waiters.delete(m.method); }
};
const send = (method, params = {}) => new Promise((res, rej) => {
  pending.set(++id, m => m.error ? rej(new Error(`${method}: ${m.error.message}`)) : res(m.result));
  ws.send(JSON.stringify({ id, method, params }));
});
const once = method => new Promise(res => waiters.set(method, res));

try {
  await send('Page.enable');
  await send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 900, deviceScaleFactor: 1.5, mobile: false });
  await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
  const only = process.argv.slice(3);
  for (const s of sections.filter(s => !only.length || only.includes(s.slug))) {
    const loaded = once('Page.loadEventFired');
    await send('Page.navigate', { url: base + s.href });
    await loaded;
    // the snapshot shows the page, not the shell that sits on top of it
    await send('Runtime.evaluate', { expression: `document.head.insertAdjacentHTML('beforeend', '<style>.controls,.bubble,.skip{display:none!important}</style>')` });
    // reduced motion opens the manual at once; its stripe shows the closed cover
    if (s.slug === 'projects') await send('Runtime.evaluate', { expression: `document.documentElement.classList.add('book-shut')` });
    await sleep(2500); // globe tiles and the garage scene settle
    const { data } = await send('Page.captureScreenshot', { format: 'webp', quality: 62 });
    writeFileSync(new URL(`${s.slug}.webp`, out), Buffer.from(data, 'base64'));
    console.log(`fan/${s.slug}.webp`);
  }
} finally {
  ws.close();
  proc.kill();
  await sleep(300);
  rmSync(profile, { recursive: true, force: true });
}
