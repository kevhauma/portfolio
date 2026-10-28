// Kevin's 2021 Honda CB650R, the hero of the room, upright on its rear paddock stand a little toward the camera.
// The bike is a loaded model (public/garage/cb650r.glb, exported from docs/Honda CB650R web.blend, the reduced copy
// of docs/Honda CB650R.blend: micro-triangles welded, unseen faces culled, then decimated); each of its
// materials is repainted with the garage's cel ramp by name.
// Local axes: +x forward, +y up, +z the rider's right (the camera side).
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { defineZone } from '../zone';
import { group, proxy } from '../kit';
import { toon, M } from '../toon';
import { ctex } from '../paint';
import { decal } from '../room';

// start the fetch as soon as the garage loads its zones, so it runs while the rest of the room builds
const draco = new DRACOLoader().setDecoderPath('/draco/');
const model = new GLTFLoader().setDRACOLoader(draco).loadAsync('/garage/cb650r.glb').finally(() => draco.dispose());

export default defineZone({
  id: 'bike',
  ink: 2.1,
  view: { pos: [1.42, 1.04, 2.9], target: [0.32, 0.6, 0.5] },
  async build(gBike, ctx) {
    const contact = ctex(128, 128, (x) => { const g = x.createRadialGradient(64, 64, 20, 64, 64, 64); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.55, 'rgba(255,255,255,0.85)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(0, 0, 128, 128); });
    // soft contact shadows under both tyres
    decal(ctx.root, contact, 0.34, 0.22, 1.05, 0.33, 0.3, 0x1a1428, 0.55); decal(ctx.root, contact, 0.38, 0.24, -0.33, 0.75, 0.3, 0x1a1428, 0.55);

    const B = group(gBike, 0.35, 0, 0.55, -0.3);
    const blackP = toon(0x2c2b35, { hi: 0.75, rim: 1 });
    const paint: Record<string, THREE.Material> = {
      CB_Paint_HondaRed: toon(0xc41e2a, { hi: 0.9, rim: 1 }),
      CB_Paint_CryptonSilver: toon(0x9aa1ad, { hi: 0.9, rim: 1 }),
      CB_Paint_SatinBlack: blackP,
      CB_Engine_BlackCast: toon(0x35343e, { hi: 0.55, rim: 1 }),
      CB_Aluminium_Machined: toon(0xb4b8c4, { hi: 0.85, rim: 1 }),
      CB_Steel_BrushedExhaust: toon(0xaaa294, { hi: 0.9, rim: 1 }),
      CB_Steel_BrakeDisc: toon(0xc2c4cc, { hi: 0.9 }),
      CB_Chrome: M.chrome,
      CB_Anodised_Dark: toon(0x2e2d36, { hi: 0.9, rim: 1 }),
      CB_Rubber: toon(0x24222a, { bands: 2, hi: 0.3, rim: 1 }),
      CB_Plastic_TexturedBlack: toon(0x1d1c22, { hi: 0.4 }),
      CB_Seat_Vinyl: toon(0x27252d, { bands: 2, hi: 0.35, rim: 1 }),
      CB_Chain_Steel: toon(0x3a3640, { hi: 0.8 }),
      CB_Lens_Clear: toon(0xdfe9ff, { emis: 0.55 }),
      CB_Lens_Red: toon(0xe0303a, { emis: 0.7 }),
      CB_Stand_Powder: toon(0x25242c, { hi: 0.55, rim: 1 })
    };
    const bike = (await model).scene;
    bike.traverse(o => { const m = o as THREE.Mesh; if (m.isMesh) m.material = paint[(m.material as THREE.Material).name] ?? blackP; });
    B.add(bike);
    proxy(B, 2.15, 1.15, 0.9, 0, 0.58, 0);
  }
});
