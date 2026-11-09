// Sheet 05, the touge tape: four mixtapes in the AE86's console and six gig stubs in the visor and the vent.
// Every artist, track and gig here is a placeholder until Kevin's own list is in (see `placeholder`).

export type TapeId = 'metal' | 'euro' | 'jpop' | 'classic';

export type Track = {
  title: string;
  artist: string;
  /** what the windshield will show for this track once its painting is made */
  view: string;
  /** where the deck's tape counter starts for this track (synthetic, never a play count) */
  counter: number;
};

export type Tape = {
  id: TapeId;
  /** the name pencilled on the J-card */
  name: string;
  /** the line under it */
  line: string;
  /** the J-card footer, when it says more than the line */
  foot?: string;
  /** what the cassette label itself says */
  label: string;
  /** what the deck window shows */
  deckName: string;
  no: string;
  length: 'C-60' | 'C-90';
  /** tape formulation, shown on the deck display */
  formula: 'MTL' | 'CrO2' | 'Norm';
  /** shell colours: top lip, body, shade band, label paper, label stripe */
  shell: { lip: string; body: string; shade: string; paper: string; stripe: string };
  /** the J-card accent and its highlighter */
  accent: string;
  highlight: string;
  /** the tape's edge as it sits in the deck slot */
  inDeck: { bg: string; fg: string };
  /** where the closed case lies on the console, in the 1440 by 900 cabin */
  at: { x: number; y: number; r: number };
  /** EQ preset bars, five bands out of eight */
  eq: number[];
  /** where the needles settle while this tape plays */
  rpm: number;
  kmh: number;
  /** the placeholder windshield view: hard sky bands top to bottom, far hills, ground, road (edge, lit half, line) */
  view: { sky: string[]; far: string; ground: string[]; road: [string, string, string] };
  tracks: Track[];
};

export type Gig = {
  /** the coloured header band */
  header: string;
  name: string;
  place: string;
  date: string;
  color: string;
  at: 'visor' | 'vent';
  /** left edge in the cabin and the tilt it is wedged at */
  x: number;
  r: number;
  /** a pencilled note on the stub */
  note?: string;
};

/** The names on this sheet are stand-ins. */
export const placeholder = { on: true, line: "Names are placeholders until Kevin's list is in." };

export const lede =
  'Listening and live shows, not playing.';

const t = (title: string, artist: string, view: string, counter: number): Track => ({ title, artist, view, counter });

export const tapes: Tape[] = [
  {
    id: 'metal', name: 'Folk & power metal', line: 'for the long climbs', label: 'Folk & power metal', deckName: 'Folk & power metal',
    no: '01', length: 'C-90', formula: 'MTL',
    shell: { lip: '#9A9EAD', body: '#6C7080', shade: '#4E5160', paper: '#ECE8DC', stripe: '#1F7A4A' },
    accent: '#1F7A4A', highlight: 'rgb(31 122 74 / .28)', inDeck: { bg: '#6C7080', fg: '#F4EFE2' },
    at: { x: 258, y: 800, r: -3 }, eq: [7, 5, 3, 5, 7], rpm: 6300, kmh: 112,
    view: { sky: ['#232B44', '#323C58', '#46506C', '#5E6882', '#7A8398', '#A2A9B8'], far: '#5A6276', ground: ['#3A4152', '#2C3242', '#232838'], road: ['#20242F', '#2E3442', '#C9CCD4'] },
    tracks: [
      t('Primo Victoria', 'Sabaton', 'first light over a grey sea, from the cliff road', 0),
      t("The Bard's Song", 'Blind Guardian', 'night forest, a small campfire by the road', 74),
      t('Diggy Diggy Hole', 'Wind Rose', 'lit mine mouths in the mountain flank', 141),
      t('Inis Mona', 'Eluveitie', 'green rolling hills and a ring of standing stones', 198),
      t('Vodka', 'Korpiklaani', 'a snowed-in birch wood, snow falling', 0),
      t('Ghost Love Score', 'Nightwish', 'moonlit sea cliffs, a storm out at sea', 63),
      t('Drink', 'Alestorm', 'a stormy coast, a tall ship under sail', 152),
      t('Angus McFife', 'Gloryhammer', 'a castle on a far peak under the aurora', 190)
    ]
  },
  {
    id: 'euro', name: 'Eurobeat', line: 'for the downhill', label: 'Eurobeat', deckName: 'Eurobeat',
    no: '02', length: 'C-60', formula: 'CrO2',
    shell: { lip: '#F0485A', body: '#C8102E', shade: '#8A0A1F', paper: '#F5F0E3', stripe: '#13254F' },
    accent: '#C3001A', highlight: 'rgb(226 0 26 / .22)', inDeck: { bg: '#C8102E', fg: '#F7F8FA' },
    at: { x: 416, y: 804, r: 1.5 }, eq: [8, 6, 4, 6, 8], rpm: 7250, kmh: 138,
    view: { sky: ['#071229', '#0B1834', '#112142', '#1A2A50', '#3A2E4E', '#9A4E26', '#E58A2C'], far: '#0E1630', ground: ['#121A33', '#0D1428', '#0A0F20'], road: ['#1E2232', '#2A2E42', '#FFB547'] },
    tracks: [
      t('Deja Vu', 'Dave Rodgers', "the hairpin from above, a rival's tail-lights ahead", 0),
      t('Gas Gas Gas', 'Manuel', 'the tunnel mouth and its sodium lamps', 66),
      t('Running in the 90s', 'Max Coveri', 'the fast downhill at blue hour', 128),
      t('Night of Fire', 'Niko', 'a red night under a huge moon', 187),
      t('Remember Me', 'Ace', 'rain on the pass, sodium lamps on the wet road', 0),
      t('Space Boy', 'Dave Rodgers', 'a deep starfield and one shooting star', 59),
      t('Back on the Rocks', 'Mega NRG Man', 'the cliff road above the sea at night', 118),
      t('The Top', 'Ken Blast', 'the summit at sunrise', 176)
    ]
  },
  {
    id: 'jpop', name: 'J-pop', line: 'for the drive home', label: 'J-pop', deckName: 'J-pop',
    no: '03', length: 'C-60', formula: 'CrO2',
    shell: { lip: '#FFFFFF', body: '#E4E7EE', shade: '#B3B8C4', paper: '#F4F1EA', stripe: '#2E4FC4' },
    accent: '#2E4FC4', highlight: 'rgb(58 91 217 / .22)', inDeck: { bg: '#E4E7EE', fg: '#13254F' },
    at: { x: 574, y: 799, r: -1 }, eq: [5, 4, 5, 6, 7], rpm: 4400, kmh: 84,
    view: { sky: ['#283A86', '#3E4FA2', '#6460B4', '#9A6CB4', '#D07AAE', '#F29AAE', '#FFC6BC'], far: '#5A4A92', ground: ['#3A2E6A', '#2E2558', '#241D48'], road: ['#272050', '#342C64', '#FFE2EE'] },
    tracks: [
      t('Idol', 'YOASOBI', 'a neon-pink night, the city glittering below', 0),
      t('Yoru ni Kakeru', 'YOASOBI', 'a deep-blue night, the city, one bright star', 52),
      t('Usseewa', 'Ado', 'a red sky, lightning over the city', 101),
      t('Gurenge', 'LiSA', 'a crimson sunset, embers drifting', 147),
      t('Lemon', 'Kenshi Yonezu', 'soft rain, blue-grey', 0),
      t('Zankyosanka', 'Aimer', 'a street hung with paper lanterns', 61),
      t('Ao to Natsu', 'Mrs. Green Apple', 'a blue summer sky, a towering cloud, the sea', 112),
      t('Shinunoga E-Wa', 'Fujii Kaze', 'late night, warm streetlights', 158)
    ]
  },
  {
    id: 'classic', name: 'The classics', line: '70s–90s, any of it', foot: '70s–90s rock & pop', label: 'The classics · 70s–90s', deckName: 'The classics 70-90',
    no: '04', length: 'C-90', formula: 'Norm',
    shell: { lip: '#454752', body: '#23242B', shade: '#121318', paper: '#EFE3C8', stripe: '#A3561A' },
    accent: '#A3561A', highlight: 'rgb(196 110 40 / .26)', inDeck: { bg: '#23242B', fg: '#EFE3C8' },
    at: { x: 730, y: 803, r: 2.5 }, eq: [6, 5, 4, 4, 5], rpm: 2300, kmh: 58,
    view: { sky: ['#4A2A44', '#7A3440', '#B24E34', '#D8702E', '#EE9636', '#F8B848', '#FFD872'], far: '#8E4A3A', ground: ['#7A4626', '#62381E', '#4C2C18'], road: ['#4A2E2A', '#5E3C36', '#FFD98A'] },
    tracks: [
      t("Don't Stop Me Now", 'Queen', 'city lights at night, flat out', 0),
      t('Africa', 'Toto', 'savanna sunset, an acacia, the big mountain', 58),
      t('Take On Me', 'a-ha', 'the pencil sketch', 132),
      t('The Final Countdown', 'Europe', 'a night sky with a ringed planet', 181),
      t("Livin' on a Prayer", 'Bon Jovi', 'a city skyline at dusk', 0),
      t('Dancing Queen', 'ABBA', 'a seaside sunset in pinks', 71),
      t('Sultans of Swing', 'Dire Straits', 'a rainy city night', 125),
      t('Dreams', 'Fleetwood Mac', 'desert dusk with mesas', 196)
    ]
  }
];

export const gigs: Gig[] = [
  { header: 'Admit one', name: 'Graspop Metal Meeting', place: 'Dessel', date: '20·· · TBC', color: '#13254F', at: 'visor', x: 1066, r: -3, note: 'six stubs, dates TBC' },
  { header: 'Admit one', name: 'Sabaton live', place: 'Arena show', date: 'Date TBC', color: '#E2001A', at: 'visor', x: 1178, r: 2 },
  { header: 'Admit one', name: 'Powerwolf live', place: 'Club show', date: '20·· · TBC', color: '#2A2B33', at: 'visor', x: 1290, r: -2.5 },
  { header: 'Day ticket', name: 'Rock Werchter', place: 'Werchter', date: '20·· · TBC', color: '#00843D', at: 'vent', x: 44, r: -6 },
  { header: 'Admit one', name: 'J-pop arena show', place: 'Venue TBC', date: 'Date TBC', color: '#3A5BD9', at: 'vent', x: 152, r: 3 },
  { header: 'Weekend pass', name: 'Alcatraz Metal Festival', place: 'Kortrijk', date: '20·· · TBC', color: '#E2001A', at: 'vent', x: 256, r: 7 }
];

