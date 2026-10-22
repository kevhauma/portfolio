// Sheet 06, the garage. One entry per hobby: its name in the caption box, its short name on the zone strip,
// and where it stands in the room (the plain list's sub-line). The scene side of each lives in src/garage/zones.

export type ZoneId = 'wled' | 'printer' | 'shelf' | 'quackbot' | 'home' | 'keyboards' | 'jdm' | 'lego' | 'bike' | 'camera';
export type ShelfItemId = 'aoc' | 'msgr' | 'hash' | 'f1' | 'gps';

export type GarageZone = { id: ZoneId; name: string; short: string; where: string };

/** zone strip order: the bench wall left to right, then the room */
export const zones: GarageZone[] = [
  { id: 'wled', name: 'WLED strip', short: 'WLED strip', where: 'under the top shelf' },
  { id: 'printer', name: '3D printer', short: '3D printer', where: 'left end of the bench' },
  { id: 'shelf', name: 'Side projects', short: 'Side projects', where: 'the shelf above the bench' },
  { id: 'quackbot', name: 'Quackbot', short: 'Quackbot', where: 'on the old CRT' },
  { id: 'home', name: 'Home Assistant', short: 'Home tablet', where: 'the tablet on the wall' },
  { id: 'keyboards', name: 'Keyboards', short: 'Keyboards', where: 'on the desk' },
  { id: 'jdm', name: 'JDM, 1980 to 1990', short: 'JDM', where: 'under the cover, on the wall' },
  { id: 'lego', name: 'Lego', short: 'Lego', where: 'on the corner rack' },
  { id: 'bike', name: 'Honda CB650R', short: 'CB650R', where: 'in the middle of the floor' },
  { id: 'camera', name: 'Camera', short: 'Camera', where: 'on the tripod' }
];

export const shelfItems: { id: ShelfItemId; name: string }[] = [
  { id: 'aoc', name: 'Advent of Code' },
  { id: 'msgr', name: 'MessengertoStats' },
  { id: 'hash', name: 'Hashcode 2018' },
  { id: 'f1', name: 'F1 WLED tracker' },
  { id: 'gps', name: 'GPS tools' }
];

export const zoneName = (id: ZoneId) => zones.find(z => z.id === id)!.name;

/** WLED's own effect names, the ones the simulated strip knows */
export const wledEffects = ['Solid', 'Rainbow', 'Colorloop', 'Chase', 'Breathe', 'Fire 2012', 'Theater'] as const;

/** the placeholder print until Kevin's real G-code arrives */
export const printSpec = { layers: 270, layerHeight: 0.2, start: 160 };
