// Every hobby in the garage. To add one: a ZoneId in src/data/garage.ts, a module here, and its words in
// src/components/garage/zones/. The order here is build order only; the zone strip follows src/data/garage.ts.
import wled from './wled';
import shelf from './shelf';
import printer from './printer';
import quackbot from './quackbot';
import keyboards from './keyboards';
import home from './home';
import jdm from './jdm';
import lego from './lego';
import bike from './bike';
import camera from './camera';

export const ZONES = [wled, shelf, printer, quackbot, keyboards, home, jdm, lego, bike, camera];
