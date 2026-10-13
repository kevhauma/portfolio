// The timing screen (section 02). Every fact comes from docs/content-intake.yaml.
// The bachelor is qualifying, the years are laps, every client project is a sector.

export const team = 'Zinderlabs';
/** month Kevin started consulting; laps count from here */
export const since = '2021-07';

export type Sector = {
  n: number;
  client: string;
  project: string;
  start: string;
  /** null while it is still running */
  end: string | null;
  role: string;
  stack: string[];
  shipped: string | null;
  /** the project's page in the workshop manual */
  slug: string;
  nda?: boolean;
};

export const qualifying = {
  degree: 'Bachelor, applied computer science',
  /** school and dates are not in the intake yet */
  school: null as string | null,
  internship: {
    client: 'Zinderlabs',
    project: 'Platform Planner',
    start: '2021-03',
    end: '2021-06',
    stack: ['Vue 2', 'Spring Boot'],
    shipped: "An internal planner for consultants' projects and workplaces (WFH, office, client), built from scratch in a team of 3"
  }
};

export const sectors: Sector[] = [
  { n: 1, client: 'VG Computers', project: 'Webstore', start: '2021-07', end: '2021-08', role: 'Full-stack developer', stack: ['Meteor', 'React'], shipped: 'Webstore and admin back office, with Meteor components moved to React, user reviews and breadcrumbs', slug: 'vg-computers' },
  { n: 2, client: 'Jumperke', project: 'Route planning and order tool', start: '2021-07', end: '2021-09', role: 'Frontend developer', stack: ['TypeScript', 'React', 'GraphQL'], shipped: 'Admin tools to plan delivery and pickup routes, plus bug fixes in the client-facing order tool', slug: 'jumperke' },
  { n: 3, client: 'Zinderlabs', project: 'Platform Blog', start: '2021-08', end: '2021-08', role: 'Full-stack developer', stack: ['Blitz.js', 'TypeScript', 'Prisma', 'MUI', 'React Final Form'], shipped: 'Internal blog for knowledge sharing and meeting notes, with a Markdown editor', slug: 'platform-blog' },
  { n: 4, client: 'Aurubis', project: 'Scrap yard management', start: '2021-09', end: '2023-03', role: 'Full-stack developer', stack: ['React', 'MUI', 'Telerik', 'React Final Form', '.NET Framework', '.NET 6', 'MSSQL'], shipped: 'Yard management for a multi-plant copper scrapyard (delivery planning, weighing, payload inspection, invoicing), migrated from .NET Framework to .NET 6', slug: 'aurubis-scrap-yard' },
  { n: 5, client: 'Aurubis', project: 'Driver check-in kiosk', start: '2023-03', end: '2023-07', role: 'Full-stack developer', stack: ['React', 'MUI', 'XState', 'React Hook Form', '.NET 6', 'MSSQL'], shipped: 'Multilingual self-service check-in for delivery drivers, with ID scanner, printer, safety videos and a site map guide', slug: 'aurubis-kiosk' },
  { n: 6, client: 'ArCom', project: 'DBA tool', start: '2023-07', end: '2024-07', role: 'Full-stack developer', stack: ['React', 'TypeScript', 'MUI', 'TanStack Query', 'React Hook Form', '.NET', 'MSSQL', 'Docusaurus'], shipped: 'Web-based DBA tool replacing a legacy C++ application, reverse-engineered without its source code', slug: 'arcom-dba-tool' },
  { n: 7, client: 'publiq', project: 'UiTPAS counter app', start: '2024-08', end: '2024-11', role: 'Frontend developer', stack: ['AngularJS', 'Next.js', 'MUI', 'TanStack Query'], shipped: 'Counter app for UiTPAS cards and profiles, migrated page by page from AngularJS to React with a seamless fallback', slug: 'publiq' },
  { n: 8, client: 'Clearmedia', project: 'Microsoft services reselling platform', start: '2025-05', end: '2026-06', role: 'Full-stack developer', stack: ['React', 'Redux', 'Formik', 'Chakra UI', 'styled-components', 'Backbone.js', '.NET', 'microservices'], shipped: 'B2B client portal and back office for reselling Microsoft services, including reseller packages and invoicing', slug: 'clearmedia' },
  { n: 9, client: 'Zinderlabs', project: 'Platform Planner Vue 3 upgrade', start: '2026-06', end: '2026-06', role: 'Frontend developer', stack: ['Vue 2', 'Vue 3', 'GraphQL'], shipped: 'The internship planner upgraded page by page to Vue 3 with a redesign, falling back to the Vue 2 pages through iframes', slug: 'platform-planner' },
  { n: 10, client: 'Construction tech client', project: 'Building installation planner', start: '2026-07', end: null, role: 'Frontend tech lead, full-stack', stack: ['React', 'shadcn/ui', 'TanStack Query', 'TanStack Form', 'Konva', 'Three.js', 'Supabase'], shipped: null, slug: 'construction-planner', nda: true }
];

/** yellow flags: the gaps between engagements */
export const gaps = [{ start: '2024-12', end: '2025-04' }];

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const ym = (s: string) => s.split('-').map(Number) as [number, number];

/** today's month as "YYYY-MM", at build time */
export const now = (() => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`; })();

/** months between two "YYYY-MM" values, both inclusive */
export const span = (start: string, end: string | null) => {
  const [y1, m1] = ym(start), [y2, m2] = ym(end ?? now);
  return (y2 - y1) * 12 + (m2 - m1) + 1;
};
/** months from `since` to a month (0 for the first) */
export const offset = (m: string) => span(since, m) - 1;
/** "Jul 2021" */
export const month = (m: string) => { const [y, mo] = ym(m); return `${MONTHS[mo - 1]} ${y}`; };
/** "Jul 21" */
export const short = (m: string) => { const [y, mo] = ym(m); return `${MONTHS[mo - 1]} ${String(y).slice(2)}`; };

/** a lap is a year on the job, counted from `since` */
export const lapOf = (m: string) => Math.floor(offset(m) / 12) + 1;
export const laps = lapOf(now);
/** "5 yr 4 mo" on the job */
export const onTheJob = (() => { const t = span(since, now); return `${Math.floor(t / 12)} yr ${t % 12} mo`; })();
export const projectHref = (s: Sector) => `/projects/${s.slug}/`;
