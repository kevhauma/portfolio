// Facts shown across the site. Anything marked `placeholder` is waiting on Kevin's real material.

export type Section = {
  n: string;
  slug: string;
  href: string;
  title: string;
  sub: string;
  /** livery colour role for this sheet's stripe */
  tone: 'navy' | 'red' | 'green' | 'white' | 'primer' | 'black';
};

export const sections: Section[] = [
  { n: '01', slug: 'intro', href: '/', title: 'Intro', sub: 'Frontend first', tone: 'navy' },
  { n: '02', slug: 'experience', href: '/experience/', title: 'Experience', sub: 'The timing screen', tone: 'red' },
  { n: '03', slug: 'projects', href: '/projects/', title: 'Projects', sub: 'The workshop manual', tone: 'green' },
  { n: '04', slug: 'map', href: '/map/', title: 'The map', sub: 'Travel, photos, motorsport', tone: 'white' },
  { n: '05', slug: 'music', href: '/music/', title: 'Music', sub: 'The touge tape', tone: 'primer' },
  { n: '06', slug: 'workbench', href: '/workbench/', title: 'Workbench', sub: 'WLED, prints and side projects', tone: 'black' }
];

export const raceNumber = 23;
export const github = { label: 'github.com/kevhauma', href: 'https://github.com/kevhauma' };

/** Stack decals, sized by how much each one is used. Weights are placeholders. */
export const stack = [
  { name: 'TypeScript', use: 0.9 },
  { name: 'Vue', use: 0.7 },
  { name: 'React', use: 0.6 },
  { name: 'Astro', use: 0.5 },
  { name: 'CSS', use: 0.5 },
  { name: 'Node.js', use: 0.3 },
  { name: 'C#', use: 0.2 }
];
