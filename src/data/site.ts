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
  { n: '02', slug: 'projects', href: '/projects/', title: 'Projects', sub: 'Six builds, six interactions', tone: 'red' },
  { n: '03', slug: 'experience', href: '/experience/', title: 'Experience', sub: 'The timing screen', tone: 'green' },
  { n: '04', slug: 'map', href: '/map/', title: 'The map', sub: 'Travel, photos, motorsport', tone: 'white' },
  { n: '05', slug: 'printing', href: '/3d-printing/', title: '3D printing', sub: 'The slicer preview', tone: 'primer' },
  { n: '06', slug: 'workbench', href: '/workbench/', title: 'Workbench', sub: 'WLED and side projects', tone: 'black' }
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

export const projects = [
  { name: 'money-mosaic-v2', lang: 'TypeScript', href: 'https://github.com/kevhauma/money-mosaic-v2', d: 'View your transactions and expenses, from CSV to graphs.' },
  { name: 'AdventOfCode', lang: 'JavaScript', href: 'https://github.com/kevhauma/AdventOfCode', d: 'Advent of Code solutions, with separate 2020 and 2021 repos.' },
  { name: 'MessengertoStats', lang: 'JavaScript', href: 'https://github.com/kevhauma/MessengertoStats', d: 'Analyses a downloaded Facebook Messenger chat.' },
  { name: 'Quackbot', lang: 'JavaScript', href: 'https://github.com/kevhauma/Quackbot', d: 'Discord bot for general things.' },
  { name: 'Google Hashcode 2018', lang: 'C#', href: 'https://github.com/kevhauma/Google_Hashcode_2018', d: 'Finished #113 worldwide.' },
  { name: 'strava-vue', lang: 'Vue', href: 'https://github.com/kevhauma/strava-vue', d: 'Visualises Strava activities; the predecessor of the map on this site.' }
];
