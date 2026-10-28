// The contract every hobby in the garage implements. A zone owns its objects in the room, its insert shot,
// and the behaviour of its caption box; its words live in src/components/garage/zones/<Zone>.astro.
import type * as THREE from 'three';
import type { ZoneId } from '../data/garage';
import type { Vec } from './kit';

export type View = { pos: Vec; target: Vec };

/** what a zone may touch while the garage is being built */
export interface BuildCtx {
  /** the room's own group (walls, bench, desk, rack); a zone may adopt a piece of it, like the Lego the rack */
  env: THREE.Group;
  /** the scene root, for painted effects that belong to no zone */
  root: THREE.Group;
  /** register a pickable sub-object (a shelf item), so `#zone/item` and hover can address it */
  item(id: string, group: THREE.Group): void;
}

/** what a zone may do once the garage runs */
export interface RunCtx {
  invalidate(): void;
  /** prefers-reduced-motion, live */
  readonly rm: boolean;
  /** the zone that is open, if any */
  readonly open: ZoneId | null;
  /** outline a zone or `zone:item` in red, or clear it */
  outline(key: string | null): void;
  /** select a sub-object of the open zone and put it in the hash */
  select(item: string): void;
  /** the garage's own ceiling lamps (Home Assistant's demo toggle drives them) */
  lamps: boolean;
}

export interface Zone {
  id: ZoneId;
  /** ink weight of its outlines in px; heavier for big silhouettes */
  ink?: number;
  /** the insert shot when it opens */
  view: View;
  /** sub-objects that can be picked once the zone is open (the shelf's side projects) */
  items?: string[];
  /** add the zone's objects to `g`; give it an invisible proxy() so the whole object answers the pointer.
   *  May be async (a loaded model); the garage waits for it before inking. */
  build(g: THREE.Group, ctx: BuildCtx): void | Promise<void>;
  /** wire the caption box once (it is server-rendered and stays in the DOM) */
  mount?(panel: HTMLElement, ctx: RunCtx): void;
  open?(ctx: RunCtx): void;
  close?(ctx: RunCtx): void;
  /** a sub-object was selected; the panel shows its part */
  select?(item: string, panel: HTMLElement, ctx: RunCtx): void;
  /** per frame while the garage draws; return true to keep drawing (an effect is running) */
  tick?(now: number, dt: number, ctx: RunCtx): boolean;
  /** night race ramps 0..1; lamps ramp 0..1 (1 = on) */
  light?(night: number, lamps: number): void;
}

export const defineZone = (z: Zone) => z;
