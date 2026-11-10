// Facts shown across the site. Anything marked `placeholder` is waiting on Kevin's real material.

export type Section = {
  n: string;
  slug: string;
  href: string;
  title: string;
  sub: string;
  /** livery colour role for this sheet's stripe */
  tone: 'navy' | 'red' | 'green' | 'white' | 'primer' | 'black';
  /** where the section's signature sits in its fan snapshot (public/fan/<slug>.webp), as fractions */
  focus: [number, number];
};

export const sections: Section[] = [
  { n: '01', slug: 'intro', href: '/', title: 'Intro', sub: 'Frontend first', tone: 'navy', focus: [.33, .47] },
  { n: '02', slug: 'experience', href: '/experience/', title: 'Experience', sub: 'The timing screen', tone: 'red', focus: [.52, .6] },
  { n: '03', slug: 'projects', href: '/projects/', title: 'Projects', sub: 'The workshop manual', tone: 'green', focus: [.7, .3] },
  { n: '04', slug: 'map', href: '/map/', title: 'The map', sub: 'Travel, photos, motorsport', tone: 'white', focus: [.55, .34] },
  { n: '05', slug: 'music', href: '/music/', title: 'Music', sub: 'The touge tape', tone: 'primer', focus: [.47, .42] },
  { n: '06', slug: 'workbench', href: '/workbench/', title: 'Workbench', sub: 'WLED, prints and side projects', tone: 'black', focus: [.52, .52] }
];

export const raceNumber = 23;
export const github = { label: 'github.com/kevhauma', href: 'https://github.com/kevhauma' };

/** Stack decals: Kevin's favourite technologies, largest first, sized by how much he likes each one. */
export const stack = [
  { name: 'TypeScript', use: 1.0 },
  { name: 'Node.js', use: 0.9 },
  { name: 'React', use: 0.8 },
  { name: 'Angular', use: 0.7 },
  { name: 'Tailwind', use: 0.6 },
  { name: 'TanStack', use: 0.5 },
  { name: 'ECharts', use: 0.4 },
  { name: 'Three.js', use: 0.3 }
];
