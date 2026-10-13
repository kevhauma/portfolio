// The workshop manual (section 02). Every fact comes from docs/content-intake.yaml or the project's own repo.
// A project's wiring diagram is built from `keys` (the stack, one wire each) and `parts` (what was built);
// a part lists the keys that feed it, and the page draws those wires.

/** wire colour codes, after automotive wiring diagrams */
export const wires = {
  R: { name: 'red', hex: '#E2001A' },
  G: { name: 'green', hex: '#00843D' },
  U: { name: 'blue', hex: '#2557A7' },
  B: { name: 'black', hex: '#16181D' },
  Y: { name: 'yellow', hex: '#E0A800' },
  N: { name: 'brown', hex: '#7A4B2A' },
  S: { name: 'slate', hex: '#7E8794' },
  W: { name: 'white', hex: '#F4F4F0' }
} as const;
export type WireCode = keyof typeof wires;

export type Key = { id: string; code: WireCode; label: string; legacy?: boolean };
export type Part = { id: string; title: string; text: string; feeds: string[]; legacy?: boolean; href?: string; hrefLabel?: string };
export type Project = {
  slug: string;
  /** "1"–"6" for chapters, "F1"–"F7" for the supplement */
  n: string;
  kind: 'chapter' | 'supplement';
  title: string;
  /** client, or "Own build" */
  client: string;
  own?: boolean;
  start: string;
  end: string | null;
  role?: string;
  team?: string;
  status?: string;
  /** one line for the contents page */
  line: string;
  summary: string[];
  figure: string;
  keys: Key[];
  parts: Part[];
  notes?: string[];
  nda?: boolean;
  placeholder?: string;
  source?: { label: string; href: string };
  /** chapter thumb-index colour on the contents harness */
  wire?: WireCode;
};

const months = (start: string, end: string | null) => {
  if (!end) return null;
  const [y1, m1] = start.split('-').map(Number);
  const [y2, m2] = end.split('-').map(Number);
  return (y2 - y1) * 12 + (m2 - m1) + 1;
};
const yearSpan = (p: Project) => {
  const a = p.start.slice(0, 4), b = p.end?.slice(0, 4);
  if (!p.end) return `${a} – now`;
  return a === b ? a : `${a}–${b}`;
};
/** "14 mo", or "in progress" */
export const duration = (p: Project) => {
  const m = months(p.start, p.end);
  return m === null ? 'in progress' : `${m} mo`;
};
export const period = yearSpan;

const gh = (repo: string, path = '') => `https://github.com/kevhauma/${repo}${path ? `/blob/main/${path}` : ''}`;

export const projects: Project[] = [
  {
    slug: 'money-mosaic', n: '1', kind: 'chapter', wire: 'R',
    title: 'money-mosaic-v2', client: 'Own build', own: true, start: '2026-07', end: null, status: 'In use, local-first',
    line: 'Local-first finance: bank CSVs in, rules and a trained network, honest stats out, nothing sent',
    summary: [
      'A personal finance app that runs entirely in the browser. Import bank CSV exports, sort transactions with rules or a small neural network trained on your own history, link transfers between your own accounts, and read the result on a dashboard of charts.',
      'Local-first on purpose: no backend, no server, no account. Every transaction, and the trained model itself, lives in IndexedDB in your own browser. Nothing is ever sent anywhere.'
    ],
    figure: 'Data path, CSV to stats',
    keys: [
      { id: 'csv', code: 'S', label: 'Bank CSV exports · KBC and Belfius presets' },
      { id: 'papa', code: 'G', label: 'PapaParse, in a Web Worker' },
      { id: 'cat', code: 'R', label: 'Rules + a TensorFlow.js network, trained in a Web Worker' },
      { id: 'ng', code: 'U', label: 'Angular 21 · Signals · @ngrx/signals' },
      { id: 'idb', code: 'B', label: 'IndexedDB through Dexie 4' },
      { id: 'charts', code: 'Y', label: 'ECharts, through ngx-echarts' }
    ],
    parts: [
      { id: 'import', title: 'Import', text: 'Bank format detected, or mapped once in a wizard and saved as a profile', feeds: ['csv'] },
      { id: 'parse', title: 'Parse', text: 'Off the main thread, so a large export never freezes the page', feeds: ['papa'] },
      { id: 'categorise', title: 'Categorise', text: 'Rules first, the trained model for the rest; a category set by hand is never overwritten', feeds: ['cat'] },
      { id: 'link', title: 'Link transfers', text: 'Moves between your own accounts are paired, so they never count as income or spend', feeds: ['ng'] },
      { id: 'store', title: 'Store', text: 'IndexedDB, in this browser only; the trained model is saved there too', feeds: ['idb'] },
      { id: 'stats', title: 'Stats', text: 'Income, spend, savings rate and net worth across every account', feeds: ['charts', 'ng'] }
    ],
    notes: ['Unit tests in Vitest.', 'Built for one real user and real Belgian bank exports, not a generic persona.'],
    source: { label: 'github.com/kevhauma/money-mosaic-v2', href: gh('money-mosaic-v2') }
  },
  {
    slug: 'aurubis-scrap-yard', n: '2', kind: 'chapter', wire: 'G',
    title: 'Scrap yard management', client: 'Aurubis', start: '2021-09', end: '2023-03', role: 'Full-stack developer', team: '3–5',
    line: 'Planning to invoicing for a multi-plant copper scrapyard',
    summary: [
      'Yard management for a multi-plant copper scrapyard, in the client\'s languages: one program that carries a delivery from planning, through check-in, weighing, drop-off and sampling, to the invoice.',
      'Kevin worked full-stack on the yard flow and introduced new technology at the client. With the team, he moved the back end from .NET Framework to .NET 6.'
    ],
    figure: 'One delivery, one program',
    keys: [
      { id: 'react', code: 'U', label: 'React' },
      { id: 'mui', code: 'G', label: 'MUI · Telerik' },
      { id: 'rff', code: 'Y', label: 'React Final Form' },
      { id: 'netfx', code: 'S', label: '.NET Framework', legacy: true },
      { id: 'net6', code: 'R', label: '.NET 6' },
      { id: 'sql', code: 'B', label: 'MSSQL' }
    ],
    parts: [
      { id: 'ui', title: 'Yard screens', text: 'Planning, weighing, inspection and invoicing, in the client\'s languages', feeds: ['react', 'mui'] },
      { id: 'forms', title: 'Forms', text: 'The data entry along every step of the flow', feeds: ['rff'] },
      { id: 'old', title: 'Old back end', text: '.NET Framework, migrated away', feeds: ['netfx'], legacy: true },
      { id: 'api', title: 'Back end', text: '.NET 6, cut over from the old back end', feeds: ['net6'] },
      { id: 'db', title: 'Database', text: 'MSSQL', feeds: ['sql'] }
    ],
    notes: [
      'The back end moved from .NET Framework to .NET 6 as a team effort: the new back end was built side by side with the old one, then the yard cut over to it.',
      'As a Zinderlabs consultant at Rekencentra, on a project for Aurubis.'
    ]
  },
  {
    slug: 'aurubis-kiosk', n: '3', kind: 'chapter', wire: 'U',
    title: 'Driver check-in kiosk', client: 'Aurubis', start: '2023-03', end: '2023-07', role: 'Full-stack developer', team: '2–3',
    line: 'Self-service check-in for delivery drivers, run by a state machine',
    summary: [
      'A multilingual self-service check-in for delivery drivers, with an ID scanner, a printer, safety videos and a site map guide.',
      'Kevin modelled the guided check-in as an XState state machine that drives the scanner, the printer and the videos, while the requirements kept shifting.'
    ],
    figure: 'The check-in machine and its devices',
    keys: [
      { id: 'xstate', code: 'R', label: 'XState' },
      { id: 'react', code: 'U', label: 'React · MUI' },
      { id: 'rhf', code: 'Y', label: 'React Hook Form' },
      { id: 'net', code: 'B', label: '.NET 6 · MSSQL' }
    ],
    parts: [
      { id: 'machine', title: 'Check-in machine', text: 'Every step of the check-in as an explicit state, so a change in the flow is a change in one place', feeds: ['xstate'] },
      { id: 'devices', title: 'ID scanner · printer · videos', text: 'Driven by the machine\'s states', feeds: ['xstate'] },
      { id: 'kiosk', title: 'Kiosk screens', text: 'Multilingual', feeds: ['react'] },
      { id: 'forms', title: 'Driver forms', text: 'React Hook Form', feeds: ['rhf'] },
      { id: 'map', title: 'Site map guide creator', text: 'Tells a driver where to go on site', feeds: ['react'] },
      { id: 'api', title: 'Back end', text: '.NET 6 and MSSQL', feeds: ['net'] }
    ],
    notes: [
      'Fig. 3.1 is simplified: the drop-off spots A to C stand in for the real yard, where each material and plant has its own.',
      'As a Zinderlabs consultant at Rekencentra, on a project for Aurubis.'
    ]
  },
  {
    slug: 'arcom-dba-tool', n: '4', kind: 'chapter', wire: 'B',
    title: 'DBA tool', client: 'ArCom', start: '2023-07', end: '2024-07', role: 'Full-stack developer', team: '1–3',
    line: 'A legacy C++ application rebuilt for the web, without its source code',
    summary: [
      'A web-based DBA tool replacing a legacy C++ application. There was no source code: the old application was reverse-engineered from the outside.',
      'Largely solo, Kevin built it as a tabbed interface on shared page abstractions, with a lot of state to keep straight.'
    ],
    figure: 'Old application, new tool',
    keys: [
      { id: 'cpp', code: 'S', label: 'C++ desktop application, no source', legacy: true },
      { id: 'react', code: 'U', label: 'React · TypeScript · MUI' },
      { id: 'query', code: 'R', label: 'TanStack Query' },
      { id: 'rhf', code: 'Y', label: 'React Hook Form' },
      { id: 'net', code: 'B', label: '.NET · MSSQL' },
      { id: 'docs', code: 'G', label: 'Docusaurus' }
    ],
    parts: [
      { id: 'old', title: 'Legacy application', text: 'Its behaviour, read from the outside', feeds: ['cpp'], legacy: true },
      { id: 'tabs', title: 'Tabbed workspace', text: 'A tabbed interface holding a lot of state', feeds: ['react'] },
      { id: 'pages', title: 'Shared page abstractions', text: 'One way to build a page, reused across the tool', feeds: ['react', 'rhf'] },
      { id: 'state', title: 'Server state', text: 'Caching and refetching against the back end', feeds: ['query'] },
      { id: 'api', title: 'Back end', text: '.NET and MSSQL', feeds: ['net'] },
      { id: 'docs', title: 'Documentation', text: 'A Docusaurus site for the tool', feeds: ['docs'] }
    ],
    notes: ['As a Zinderlabs consultant at Rekencentra, on a project for ArCom.']
  },
  {
    slug: 'quackbot', n: '5', kind: 'chapter', wire: 'S',
    title: 'Quackbot', client: 'Own build', own: true, start: '2017-01', end: '2020-12', status: 'Retired',
    line: 'A dictionary bot for one Discord community of about 2,000 members',
    summary: [
      'A Discord bot for one community of about 2,000 members. Three dictionary commands, each a different way of getting a definition: an API, and two scraped web pages.',
      'Answers go by direct message, to you or to the member you mention, and the command itself is removed from the channel. Retired now, kept here as it was.'
    ],
    figure: 'Command circuits',
    keys: [
      { id: 'discord', code: 'U', label: 'discord.js · d! prefix router' },
      { id: 'axios', code: 'G', label: 'axios' },
      { id: 'dictapi', code: 'Y', label: 'dictionaryapi.dev, 13 languages' },
      { id: 'parse', code: 'N', label: 'node-html-parser · he' },
      { id: 'docker', code: 'B', label: 'Docker · GitHub Actions, self-hosted runner' }
    ],
    parts: [
      { id: 'router', title: 'Message router', text: 'Matches d! plus a command name and hands the message over', feeds: ['discord'], href: gh('Quackbot', 'index.js'), hrefLabel: 'index.js' },
      { id: 'explain', title: 'd!explain', text: 'Asks dictionaryapi.dev, in one of 13 languages, with its own path for Japanese', feeds: ['axios', 'dictapi'], href: gh('Quackbot', 'modules/dictionary/explain.js'), hrefLabel: 'explain.js' },
      { id: 'urban', title: 'd!urban', text: 'Fetches the Urban Dictionary page, keeps exact matches, sends the top five', feeds: ['axios', 'parse'], href: gh('Quackbot', 'modules/dictionary/urban.js'), hrefLabel: 'urban.js' },
      { id: 'wotd', title: 'd!wotd', text: 'Reads the word of the day off Dictionary.com: word, pronunciation, meaning', feeds: ['axios', 'parse'], href: gh('Quackbot', 'modules/dictionary/wotd.js'), hrefLabel: 'wotd.js' },
      { id: 'dm', title: 'Reply by DM', text: 'To you, or to the member you mention; the command message is deleted', feeds: ['discord'], href: gh('Quackbot', 'modules/common.js'), hrefLabel: 'common.js' },
      { id: 'deploy', title: 'Deploy', text: 'A version tag builds and restarts the container on a self-hosted runner', feeds: ['docker'] }
    ],
    source: { label: 'github.com/kevhauma/Quackbot', href: gh('Quackbot') }
  },
  {
    slug: 'commonground', n: '6', kind: 'chapter', wire: 'W',
    title: 'CommonGround', client: 'Own build', own: true, start: '2025-03', end: '2025-05',
    line: 'Shared grocery lists and scheduled tasks, rebuilt as an Nx monorepo',
    summary: [
      'Shared grocery lists and scheduled tasks with a history of who did what. A first version ran on Angular and Supabase; the second moves to its own back end in an Nx monorepo.'
    ],
    figure: 'Version 2, one monorepo',
    keys: [
      { id: 'supabase', code: 'S', label: 'Supabase (version 1)', legacy: true },
      { id: 'ng', code: 'U', label: 'Angular 19 · @ngrx/signals · Tailwind' },
      { id: 'express', code: 'B', label: 'Express' },
      { id: 'prisma', code: 'G', label: 'Prisma · PostgreSQL' },
      { id: 'auth', code: 'R', label: 'Passport, Google sign-in' },
      { id: 'nx', code: 'Y', label: 'Nx · Storybook' }
    ],
    parts: [
      { id: 'v1', title: 'Version 1', text: 'Angular on Supabase', feeds: ['supabase'], legacy: true },
      { id: 'lists', title: 'Grocery lists', text: 'Lists and items, shared', feeds: ['ng'] },
      { id: 'tasks', title: 'Scheduled tasks', text: 'Recurring tasks with their history', feeds: ['ng'] },
      { id: 'auth', title: 'Sign-in', text: 'Google sign-in, sessions stored through Prisma', feeds: ['auth', 'prisma'] },
      { id: 'api', title: 'API', text: 'Express, in the same workspace', feeds: ['express'] },
      { id: 'ui', title: 'Component library', text: 'Shared components, developed in Storybook', feeds: ['nx'] }
    ],
    placeholder: 'Screenshots to follow'
  },

  // supplement: the other work-experience projects
  {
    slug: 'clearmedia', n: 'F1', kind: 'supplement',
    title: 'Microsoft services reselling platform', client: 'Clearmedia', start: '2025-05', end: '2026-06', role: 'Full-stack developer',
    line: 'Microsoft reselling platform',
    summary: ['A B2B client portal and back office for reselling Microsoft services, including reseller packages and invoicing.'],
    figure: 'Portal and back office',
    keys: [
      { id: 'react', code: 'U', label: 'React · Redux' },
      { id: 'ui', code: 'G', label: 'Chakra UI · styled-components' },
      { id: 'backbone', code: 'S', label: 'Backbone.js' },
      { id: 'formik', code: 'Y', label: 'Formik' },
      { id: 'net', code: 'B', label: '.NET microservices' }
    ],
    parts: [
      { id: 'portal', title: 'Client portal', text: 'The business-to-business side, for clients', feeds: ['react', 'ui'] },
      { id: 'office', title: 'Back office', text: 'Reseller packages and invoicing', feeds: ['react', 'ui', 'backbone', 'formik'] },
      { id: 'services', title: 'Services', text: '.NET microservices', feeds: ['net'] }
    ]
  },
  {
    slug: 'publiq', n: 'F2', kind: 'supplement',
    title: 'UiTPAS counter app', client: 'publiq', start: '2024-08', end: '2024-11', role: 'Frontend developer',
    line: 'UiTPAS counter app',
    summary: ['A counter app for UiTPAS cards and profiles, migrated page by page from AngularJS to React, with a seamless fallback to the old pages.'],
    figure: 'Page-by-page migration',
    keys: [
      { id: 'ngjs', code: 'S', label: 'AngularJS', legacy: true },
      { id: 'next', code: 'U', label: 'Next.js · MUI' },
      { id: 'query', code: 'R', label: 'TanStack Query' }
    ],
    parts: [
      { id: 'old', title: 'AngularJS pages', text: 'Not migrated yet, still served', feeds: ['ngjs'], legacy: true },
      { id: 'new', title: 'React pages', text: 'Cards and profiles, page by page', feeds: ['next'] },
      { id: 'fallback', title: 'Seamless fallback', text: 'A page not yet migrated opens in the old app without a seam', feeds: ['next', 'ngjs'] },
      { id: 'state', title: 'Server state', text: 'TanStack Query', feeds: ['query'] }
    ]
  },
  {
    slug: 'jumperke', n: 'F3', kind: 'supplement',
    title: 'Route planning and order tool', client: 'Jumperke', start: '2021-07', end: '2021-09', role: 'Frontend developer',
    line: 'Route planning and orders',
    summary: ['Admin tools to plan delivery and pickup routes, plus bug fixes in the client-facing order tool.'],
    figure: 'Admin and order tool',
    keys: [
      { id: 'react', code: 'U', label: 'React · TypeScript' },
      { id: 'gql', code: 'R', label: 'GraphQL' }
    ],
    parts: [
      { id: 'routes', title: 'Route planning', text: 'Admin tools for delivery and pickup routes', feeds: ['react', 'gql'] },
      { id: 'orders', title: 'Order tool', text: 'Bug fixes in the client-facing tool', feeds: ['react', 'gql'] }
    ],
    notes: ['Part-time, alongside VG Computers and the Platform Blog.']
  },
  {
    slug: 'vg-computers', n: 'F4', kind: 'supplement',
    title: 'Webstore', client: 'VG Computers', start: '2021-07', end: '2021-08', role: 'Full-stack developer',
    line: 'Webstore and back office',
    summary: ['A webstore and its admin back office: Meteor components moved to React, plus user reviews and breadcrumbs.'],
    figure: 'Meteor to React',
    keys: [
      { id: 'meteor', code: 'S', label: 'Meteor components', legacy: true },
      { id: 'react', code: 'U', label: 'React' },
      { id: 'platform', code: 'B', label: 'Meteor' }
    ],
    parts: [
      { id: 'old', title: 'Meteor components', text: 'Moved over one by one', feeds: ['meteor'], legacy: true },
      { id: 'new', title: 'React components', text: 'Webstore and back office', feeds: ['react'] },
      { id: 'features', title: 'Reviews · breadcrumbs', text: 'New on the store', feeds: ['react'] },
      { id: 'app', title: 'App', text: 'Still Meteor underneath', feeds: ['platform'] }
    ],
    notes: ['Part-time, alongside Jumperke and the Platform Blog.']
  },
  {
    slug: 'platform-blog', n: 'F5', kind: 'supplement',
    title: 'Platform Blog', client: 'Zinderlabs', start: '2021-08', end: '2021-08', role: 'Full-stack developer',
    line: 'Platform Blog',
    summary: ['An internal blog for knowledge sharing and meeting notes, with a Markdown editor.'],
    figure: 'One app, top to bottom',
    keys: [
      { id: 'blitz', code: 'U', label: 'Blitz.js · TypeScript' },
      { id: 'ui', code: 'G', label: 'MUI · React Final Form' },
      { id: 'prisma', code: 'B', label: 'Prisma' }
    ],
    parts: [
      { id: 'posts', title: 'Posts and meeting notes', text: 'Knowledge sharing inside the company', feeds: ['blitz'] },
      { id: 'editor', title: 'Markdown editor', text: 'For writing them', feeds: ['ui'] },
      { id: 'data', title: 'Data', text: 'Prisma', feeds: ['prisma'] }
    ],
    notes: ['Internal project, part-time alongside VG Computers and Jumperke.']
  },
  {
    slug: 'platform-planner', n: 'F6', kind: 'supplement',
    title: 'Platform Planner, Vue 3 upgrade', client: 'Zinderlabs', start: '2026-06', end: '2026-06', role: 'Frontend developer',
    line: 'Planner, Vue 2 to 3',
    summary: ['The planner Kevin built during his internship in 2021, upgraded page by page to Vue 3 with a redesign, falling back to the Vue 2 pages through iframes.'],
    figure: 'Two versions, one planner',
    keys: [
      { id: 'vue2', code: 'S', label: 'Vue 2 (2021 build)', legacy: true },
      { id: 'vue3', code: 'G', label: 'Vue 3' },
      { id: 'gql', code: 'R', label: 'GraphQL' }
    ],
    parts: [
      { id: 'old', title: 'Vue 2 pages', text: 'The internship build', feeds: ['vue2'], legacy: true },
      { id: 'new', title: 'Vue 3 pages', text: 'Upgraded and redesigned, page by page', feeds: ['vue3'] },
      { id: 'iframe', title: 'iframe fallback', text: 'Pages not upgraded yet load the Vue 2 version inside the new app', feeds: ['vue3', 'vue2'] },
      { id: 'api', title: 'API', text: 'GraphQL', feeds: ['gql'] }
    ],
    notes: ['Internal project. The original planner was built from scratch in a team of three, with Vue 2 and Spring Boot.']
  },
  {
    slug: 'construction-planner', n: 'F7', kind: 'supplement', nda: true,
    title: 'Building installation planner', client: 'Construction tech client', start: '2026-07', end: null, role: 'Frontend tech lead, full-stack', status: 'In progress',
    line: 'Installation planner',
    summary: ['A planner for building installations, for a client in construction technology. Kevin leads the frontend and works across the stack.'],
    figure: 'Outline only',
    keys: [
      { id: 'react', code: 'U', label: 'React · shadcn/ui' },
      { id: 'tan', code: 'R', label: 'TanStack Query · TanStack Form' },
      { id: 'konva', code: 'Y', label: 'Konva' },
      { id: 'three', code: 'G', label: 'Three.js' },
      { id: 'supa', code: 'B', label: 'Supabase' }
    ],
    parts: [
      { id: 'plan', title: '2D planning canvas', text: 'Konva', feeds: ['konva', 'react'] },
      { id: '3d', title: '3D view', text: 'Three.js', feeds: ['three'] },
      { id: 'data', title: 'Data and forms', text: 'TanStack Query and Form', feeds: ['tan'] },
      { id: 'back', title: 'Back end', text: 'Supabase', feeds: ['supa'] }
    ]
  }
];

export const chapters = projects.filter(p => p.kind === 'chapter');
export const supplement = projects.filter(p => p.kind === 'supplement');
export const projectHref = (p: Project) => `/projects/${p.slug}/`;
/** the fuse blades' colours, in fuse order: on the contents fuse box and on the supplement's thumb index */
export const blades = ['#E2001A', '#2557A7', '#E0A800', '#00843D', '#F4F4F0', '#7E8794', '#16181D'];
