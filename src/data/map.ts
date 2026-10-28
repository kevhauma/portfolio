// Sheet 04, the map: the countries and trips on the globe, what the camera does for each, the routes drawn on it
// and the photos stuck to it. Placeholder material until Kevin's trip archive (trips.gpkg) and photo picks arrive:
// the countries are a guess, most trip names are filler, and every route shape, photo and date is sample.

export type Mode = 'moto' | 'car' | 'bike' | 'walk' | 'race';
/** where the camera goes: the point it looks at, its distance from the globe's centre (radius 1) and its pitch */
export type View = { lat: number; lon: number; d: number; p: number };
export type Trip = {
  id: string;
  name: string;
  /** shorter name for tight spots, like the map's cover */
  short?: string;
  type: string;
  mode: Mode;
  view: View;
  /** waypoints [lat, lon, town?]; the drawn road runs through them, and its ends stay trimmed off */
  route?: [number, number, string?][];
};
export type Country = { id: 'be' | 'de' | 'gb' | 'jp' | 'nl' | 'fr' | 'lu'; name: string; short?: string; iso: string; view: View; trips: Trip[] };
/** a print stuck on the globe; its pin sits on lat/lon, the print hangs off one corner (ax, ay in -1..1) */
export type Photo = { trip: string; lat: number; lon: number; caption: string; exif?: string; scene: 'eau' | 'hairpin' | 'cliffs' | 'forest' | 'fuji'; rot: number; ax: number; ay: number; size?: number };

export const placeholder = true;

const v = (lat: number, lon: number, d = 1.05, p = 24): View => ({ lat, lon, d, p });

export const countries: Country[] = [
  { id: 'be', name: 'Belgium', iso: '056', view: v(50.3, 5.0, 1.1), trips: [
    { id: 'ardennes', name: 'Ardennes', type: 'Motorcycle', mode: 'moto', view: v(50.12, 5.25, 1.042, 26), route: [[50.31, 5.42], [50.352, 5.456, 'Durbuy'], [50.27, 5.45], [50.183, 5.575, 'La Roche'], [50.132, 5.79, 'Houffalize'], [50.0, 5.715, 'Bastogne'], [49.9, 5.4], [49.794, 5.067, 'Bouillon'], [49.84, 4.99], [49.95, 4.93], [50.26, 4.91, 'Dinant'], [50.23, 5.01], [50.227, 5.344, 'Marche'], [50.27, 5.39]] },
    { id: 'vennbahn', name: 'Vennbahn', type: 'Bicycle', mode: 'bike', view: v(50.46, 6.1, 1.026), route: [[50.67, 6.12], [50.65, 6.2], [50.52, 6.22], [50.48, 6.11], [50.41, 6.11], [50.3, 6.12]] },
    { id: 'spa', name: 'Spa-Francorchamps', short: 'Spa', type: 'Circuit', mode: 'race', view: v(50.4358, 5.9625, 1.0036, 10) }
  ] },
  { id: 'de', name: 'Germany', iso: '276', view: v(50.0, 8.3, 1.2), trips: [
    { id: 'eifel', name: 'Eifel', type: 'Motorcycle', mode: 'moto', view: v(50.38, 6.55, 1.04, 26), route: [[50.555, 6.24, 'Monschau'], [50.53, 6.47], [50.44, 6.65], [50.384, 6.933, 'Adenau'], [50.34, 6.95, 'Nürburg'], [50.198, 6.83, 'Daun'], [50.22, 6.66], [50.207, 6.424, 'Prüm'], [50.28, 6.18]] },
    { id: 'westerwald', name: 'Westerwald', type: 'Car', mode: 'car', view: v(50.52, 7.62, 1.032), route: [[50.36, 7.6, 'Koblenz'], [50.437, 7.826, 'Montabaur'], [50.558, 7.97, 'Westerburg'], [50.66, 7.82, 'Hachenburg'], [50.69, 7.65], [50.43, 7.46, 'Neuwied']] },
    { id: 'nordschleife', name: 'Nordschleife', type: 'Circuit', mode: 'race', view: v(50.096, 6.96, 1.012) },
    { id: 'mosel', name: 'Mosel', type: 'Motorcycle', mode: 'moto', view: v(49.7, 7.1) },
    { id: 'schwarzwald', name: 'Black Forest', type: 'Motorcycle', mode: 'moto', view: v(47.95, 8.2) }
  ] },
  { id: 'gb', name: 'United Kingdom', short: 'UK', iso: '826', view: v(53.4, -2.6, 1.26), trips: [
    { id: 'england', name: 'South England', type: 'Car', mode: 'car', view: v(50.85, -0.85, 1.05, 26), route: [[51.11, 1.2], [50.95, 0.73, 'Rye'], [50.86, 0.57], [50.77, 0.28, 'Eastbourne'], [50.82, -0.14, 'Brighton'], [50.85, -0.55], [50.84, -0.78], [51.06, -1.31, 'Winchester'], [51.07, -1.79, 'Salisbury'], [51.17, -1.82]] },
    { id: 'sisters', name: 'Seven Sisters', type: 'Walk', mode: 'walk', view: v(50.749, 0.205, 1.0042, 14), route: [[50.775, 0.17], [50.755, 0.2], [50.742, 0.24], [50.736, 0.26]] },
    { id: 'lakes', name: 'Lake District', type: 'Walk', mode: 'walk', view: v(54.21, -3.09) },
    { id: 'highlands', name: 'Highlands', type: 'Car', mode: 'car', view: v(56.75, -4.9) }
  ] },
  { id: 'jp', name: 'Japan', iso: '392', view: v(36.6, 138.6, 1.34), trips: [
    { id: 'japan', name: 'Tokyo to Kyoto', type: 'Car', mode: 'car', view: v(35.25, 137.6, 1.07, 26), route: [[35.64, 139.67, 'Tokyo'], [35.44, 139.64], [35.23, 139.1, 'Hakone'], [35.31, 138.93], [35.49, 138.8, 'Fuji'], [35.2, 138.5], [34.98, 138.38], [34.71, 137.73], [35.18, 136.9, 'Nagoya'], [35.0, 136.3], [35.01, 135.8, 'Kyoto']] },
    { id: 'kyoto', name: 'Kyoto', type: 'Walk', mode: 'walk', view: v(34.982, 135.775, 1.0042, 14), route: [[34.967, 135.773], [34.985, 135.778], [34.996, 135.78], [35.004, 135.775]] },
    { id: 'hokkaido', name: 'Hokkaido', type: 'Car', mode: 'car', view: v(42.95, 142.8) }
  ] },
  { id: 'nl', name: 'Netherlands', iso: '528', view: v(51.9, 5.2, 1.08), trips: [
    { id: 'zandvoort', name: 'Zandvoort', type: 'Circuit', mode: 'race', view: v(52.138, 4.54, 1.012) },
    { id: 'veluwe', name: 'Veluwe', type: 'Bicycle', mode: 'bike', view: v(51.9, 5.85) }
  ] },
  { id: 'fr', name: 'France', iso: '250', view: v(47.4, 2.6, 1.3), trips: [
    { id: 'vosges', name: 'Vosges', type: 'Motorcycle', mode: 'moto', view: v(47.85, 7.0) },
    { id: 'normandy', name: 'Normandy', type: 'Car', mode: 'car', view: v(48.95, -0.4) }
  ] },
  { id: 'lu', name: 'Luxembourg', iso: '442', view: v(49.6, 6.1, 1.03), trips: [
    { id: 'mullerthal', name: 'Mullerthal', type: 'Walk', mode: 'walk', view: v(49.54, 6.33) }
  ] }
];

export const overview: View = { lat: 40, lon: 13, d: 0, p: 0 }; // d is worked out from the stage size

export const photos: Photo[] = [
  { trip: 'spa', lat: 50.4445, lon: 5.9635, caption: 'Spa · 2024', exif: 'EOS 250D · placed by hand', scene: 'eau', rot: -9, ax: 0.9, ay: -0.9 },
  { trip: 'eifel', lat: 50.336, lon: 6.947, caption: 'Eifel', scene: 'hairpin', rot: -8, ax: 0.8, ay: -0.9, size: 0.95 },
  { trip: 'sisters', lat: 50.756, lon: 0.2, caption: 'Seven Sisters', scene: 'cliffs', rot: 7, ax: -0.4, ay: -0.95 },
  { trip: 'ardennes', lat: 49.794, lon: 5.067, caption: 'Bouillon', scene: 'forest', rot: -6, ax: 0.7, ay: 0.7, size: 0.9 },
  { trip: 'japan', lat: 35.49, lon: 138.8, caption: 'Fuji', scene: 'fuji', rot: -7, ax: 0.6, ay: -0.9, size: 1.3 }
];

/** the real Spa-Francorchamps line, from docs/RaceCircuitSpa.svg (1 unit is about 4.6 m), centred on the circuit */
export const spa = {
  lat: 50.437, lon: 5.971, metresPerUnit: 4.6, centre: [250, 160] as const,
  d: 'm4.447 290.28c0.13184 1.3988 0.74128 2.2328 1.7024 3.099 3.1469 2.8362 3.8732 2.3848 55.153-34.244 9.0175-6.4412 22.107-15.77 29.088-20.731 6.9814-4.9613 16.982-12.298 22.221-16.304 11.174-8.5434 12.382-8.6379 13.16-1.0174 0.54917 5.3802 2.4784 8.4052 5.1728 8.1124 2.8403-0.30871 42.138-7.3767 46.568-8.3756 7.9514-1.7928 19.679-6.7943 48.071-20.501 32.219-15.554 31.603-15.443 51.861-9.2555 43.482 13.281 49.67 17.893 74.11 55.221 24.907 38.042 51.388 59.761 81.957 67.22 23.646 5.77 29.868 2.9279 43.646-19.937 14.583-24.2 13.956-28.601-5.4188-38.008-42.141-20.461-41.397-19.922-42.514-30.746-0.47537-4.6053-0.14507-6.2471 1.9454-9.6576 5.1232-8.3583 5.3844-15.657 0.83218-23.295-4.202-7.0498-5.1079-7.4255-46.575-19.273-57.071-16.305-61.474-19.592-63.138-47.139-1.3409-22.191 2.522-26.753 28.962-34.216 38.939-10.991 52.214-15.463 71.271-24.002 27.146-12.163 25.84-12.368 39.668 6.2288 15.126 20.343 27.926 24.049 33.803 9.784 3.2206-7.8173 2.0733-9.7848-23.497-40.265-33.33-39.73-30.5-38.063-52.21-30.777-16.833 5.6483-18.917 5.4528-25.042-2.3521-3.4734-4.4259-7.0086-5.9408-12.528-5.3669-3.732 0.38809-9.7271 2.6943-72.638 27.956-113.06 45.398-110.63 44.288-129.17 59.016-30.773 24.434-45.366 34.512-52.808 36.471-17.988 4.7355-24.603 9.4903-30.154 21.676-3.8076 8.3581-9.6687 15.229-32.851 38.511-32.393 32.533-39.987 43.72-53.2 78.344-5.6978 14.931-7.7238 20.746-7.4337 23.823z'
};

export const trips = countries.flatMap(c => c.trips.map(t => ({ ...t, country: c })));
export const modeName: Record<Mode, string> = { moto: 'Motorcycle', car: 'Car', bike: 'Bicycle', walk: 'Walk', race: 'Circuit' };
