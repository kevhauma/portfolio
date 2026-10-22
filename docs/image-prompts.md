# Image generation prompts

Prompts for raster assets that can sit behind or inside the Race Livery build. Every prompt is
**style block + asset prompt**: paste the style block first, then one asset prompt. Generate one asset
per image; a sheet of several objects comes back with inconsistent lighting and is hard to cut out.

The site draws its decals, swoop, lettering and diagrams in code. Use these images for **surfaces
and physical props** only. Never ask a model for lettering, logos or the race number. They come back
garbled and the type must stay Sakana.

## Style block (paste first, every time)

```
Photoreal studio product photography, straight top-down orthographic view, no perspective
distortion, no vanishing point. One soft key light from the upper left, low and warm-neutral, with
a gentle fill. Short, tight contact shadows falling down and to the right. Crisp micro-detail,
true-to-material texture, physically plausible reflections. Restrained colour; the only saturated
colours allowed are deep navy #13254F, signal red #E2001A and racing green #00843D, used exactly
where the prompt asks for them. Absolutely no text, letters, numbers, logos, brand marks,
watermarks or signatures anywhere in the image. No people, no hands. Clean, uncluttered, nothing
cropped by the frame unless the prompt asks for it.
```

Optional suffixes:

- **Cut-out props:** `Isolated on a pure flat #FFFFFF background (or transparent PNG if supported), whole object in frame with 10% margin, shadow kept as a separate soft shadow under the object.`
- **Tiling surfaces:** `Seamless tileable texture, edges wrap perfectly left-right and top-bottom, even lighting across the whole frame with no vignette, no hotspot and no single focal object, 2048x2048.`
- **Overlay maps:** `Greyscale only, mid-grey #808080 average, for use as a CSS overlay/multiply blend layer.`

---

## 1. Intro sheet (the decal kit)

**1.1 Backing liner paper (tiling).**
```
Silicone-coated decal backing liner paper, cool bright white #F7F8FA, very faint fibrous tooth
and an almost invisible satin sheen, tiny specks of paper fibre, matte. Flat-lit.
```
+ tiling suffix.

**1.2 Print grain mask (tiling overlay).**
```
Fine matte ink print grain, like screen-printed ink on uncoated paper: dense irregular stipple,
slightly broken coverage, no pattern repetition.
```
+ tiling + overlay suffixes. Use it to mask the AE86 placement guide.

**1.3 Gloss vinyl clearcoat (overlay).**
```
Macro of glossy automotive vinyl wrap film over a flat surface: subtle orange-peel clearcoat
texture, faint micro-scratches, a soft broad highlight. No colour, neutral.
```
+ tiling + overlay suffixes.

**1.4 Holographic foil (tiling).**
```
Macro of holographic sticker foil: fine rainbow diffraction grating, scattered tiny glitter
points, oil-slick colour shifts from pink-gold through cyan to violet, bright but not blown out.
```
+ tiling suffix.

**1.5 Brushed chrome foil (tiling).**
```
Macro of brushed silver chrome foil sticker material, fine straight horizontal brush lines,
tones from #8D939C to #F4F6F8, soft anisotropic highlight band.
```
+ tiling suffix.

**1.6 Masking tape strip (cut-out).**
```
One strip of crepe-paper masking tape, cream #E4D6B2, about 8x as long as wide, both ends torn
ragged by hand, subtle crinkle texture and slightly translucent edges, lying flat.
```
+ cut-out suffix. Generate three or four variants with different tear shapes.

**1.7 Plotter cut-line weed scrap (cut-out, optional).**
```
A small curl of weeded vinyl scrap peeled off a decal sheet, navy #13254F glossy face, white
backing visible on the curl, lying on its side.
```
+ cut-out suffix. Good as a desk prop or loading flourish.

## 2. Projects (the workshop manual on a desk)

**2.1 Walnut desk top (tiling).**
```
Top-down American walnut desk surface, oiled satin finish, long straight grain running
horizontally, warm brown with darker streaks, a few faint everyday wear marks, no knots.
```
+ tiling suffix. Generate at 4096 wide if the model allows it, so the grain doesn't repeat.

**2.2 Navy book cloth (tiling).**
```
Macro of navy #13254F bookbinding buckram cloth, visible fine woven linen texture, slightly
dusty matte surface, very subtle colour variation between threads.
```
+ tiling suffix. For the hardcover face.

**2.3 Closed hardcover, blank (cut-out).**
```
A closed A4 landscape hardcover workshop manual bound in navy #13254F linen book cloth, square
corners lightly bumped from use, a slightly rounded spine at the left, cover completely blank and
undecorated, two thin ribbon bookmarks (one red #E2001A, one green #00843D) trailing out of the
bottom edge.
```
+ cut-out suffix. The cover lettering and stripes stay in code; this is only the object.

**2.4 Manual page paper (tiling).**
```
Uncoated off-white technical manual paper, very faint cream tint, fine fibre tooth, matte,
flat-lit with no curl.
```
+ tiling suffix.

**2.5 Page gutter shadow (overlay).**
```
The centre gutter of an open hardbound book seen straight down: soft gradient shadow where the
two pages curve into the binding, pages otherwise blank and flat, no text.
```
+ overlay suffix, 2048x1024.

**2.6 Ribbon bookmarks (cut-out).**
```
One satin ribbon bookmark lying flat with a gentle S-curve, [signal red #E2001A | racing green
#00843D], the free end cut in a V notch, fine satin weave sheen.
```
+ cut-out suffix. Run once per colour.

**2.7 Pens (cut-out, one per image).**
```
[A navy #13254F lacquered ballpoint pen with a brushed steel clip and tip | a black felt-tip
technical drawing pen with the cap posted | a matte grey mechanical pencil with a knurled steel
grip | a red #E2001A fine-liner], lying flat, perfectly vertical in frame, no branding.
```
+ cut-out suffix.

**2.8 Desk props (cut-out, one per image).** Pick what the scene needs:
```
- a 30 cm brushed stainless steel ruler with engraved tick marks only, no numerals
- a digital vernier caliper, steel, display blank
- a white plastic eraser with a worn corner
- three silver paper clips, loosely scattered
- a blade automotive fuse in red, and one in green
- a short bundle of thin automotive wires, red, green, navy and white, ends stripped
- a coffee mug ring stain on paper, faint brown, broken ring
- a small yellow sticky note, blank, one corner slightly lifted
```
+ cut-out suffix (the coffee stain uses the overlay suffix instead).

## 3. Experience (the pit wall)

**3.1 Monitor bolt (cut-out).**
The carbon housing stays in code: its height follows the chart, so a photo of a whole monitor
can't fit it. Skin it with 3.7 and swap only the four drawn bolts for this one.
```
A single M8 hex-socket button-head bolt in dark brushed steel, seen straight down onto its domed
head, hex socket centred, fine machining rings, a little wear on the rim.
```
+ cut-out suffix, 512x512.

**3.2 CRT glass and scanlines (overlay).**
```
Close-up of a powered-on blank CRT screen: fine horizontal scanlines, faint phosphor dot mask,
soft vignette toward the curved corners, a dim diagonal glass reflection from the upper left.
```
+ overlay suffix, 16:10, without the tiling suffix.

**3.3 Slotted steel rack (cut-out, front view).**
```
A wall-mounted rack of folded galvanised sheet steel, straight-on front elevation, five vertical
slots for paper sheets, rounded fold edges, rivets at the corners, light brushed finish with
fingerprints and small scratches, empty.
```
+ cut-out suffix.

**3.4 Pit wall panel (tiling).**
```
Painted steel pit-wall panel, matte navy #13254F paint with fine orange-peel texture, a few
chips showing grey primer #B9BEC6 underneath, faint tyre rubber smudges.
```
+ tiling suffix.

**3.5 Pit lane asphalt (tiling).**
```
Top-down fine racetrack asphalt, small even aggregate of 2-4 mm stones packed tight in dark
binder, low contrast with no bright white specks, uniform in every direction. Clean and dry: no
tyre marks, no grooves, ripples, cracks or patches, no painted lines.
```
+ tiling + overlay suffixes. For the pit-lane close of the page. Blend it over `--asphalt` so day
and night keep their own tone; the rubber streaks stay the CSS `--rubber` layer.

**3.6 Pit lane paint line (cut-out).**
```
A straight section of worn white road-marking paint on asphalt, top-down, edges slightly broken,
paint cracked and partly rubbed off by tyres.
```
2048x512, no cut-out suffix. Variants in red and green work for kerbs.

**3.7 Carbon fibre (tiling).**
```
Macro of 2x2 twill carbon fibre weave under clear gloss resin, carbon black #0E0F12 with tows
catching up to #1B1E23, about 48 weave repeats across the frame, every tow the same width, a faint
even sheen on each tow but no broad highlight across the whole sheet.
```
+ tiling suffix. The skin for the monitor housing: it replaces the conic-gradient weave in
`.pw-frame`, keeping the 165deg gradient on top as the highlight. Scale it so one repeat is about
10px, the size of the drawn weave.

## 4. Workbench, music and night race extras

**4.1 Self-healing cutting mat (tiling).**
```
Green self-healing cutting mat, top-down, faint printed grid lines only (no numbers), light
knife scores and wear, matte.
```
+ tiling suffix.

**4.2 Pegboard (tiling).**
```
Painted white pegboard wall, evenly spaced round holes, matte, slight shadow in each hole.
```
+ tiling suffix.

**4.3 3D-printed part (cut-out).**
```
A small functional 3D-printed bracket in matte navy #13254F PLA, visible fine layer lines, a
little stringing, sitting on its flat face.
```
+ cut-out suffix.

**4.4 Floodlight glare (overlay, night race).**
```
Stadium floodlight bloom on black: a soft white glow at the upper left with a faint
anamorphic horizontal streak and dust in the air, everything else pure black.
```
Use with `mix-blend-mode: screen` on the Night Deep ground. No overlay suffix (black, not mid-grey).

**4.5 Vinyl record (cut-out, music page).**
```
A black vinyl LP seen straight from above, fine groove texture with a soft radial sheen from
the upper left, plain unprinted red #E2001A centre label.
```
+ cut-out suffix.

---

## Getting usable output

- **Ask for 2x the display size.** Export to WebP/AVIF at the real size afterwards; tiling textures at 1024 or 512 are usually enough once compressed.
- **Check tiling** by placing four copies 2x2. If a seam shows, ask the model to "make this seamless" (image editing) or fix it with an offset-and-heal pass.
- **Keep the light in the upper left** across every asset. The intro's resting lamp is top left and low, so a prop lit from the right will look pasted in.
- **Re-tint in CSS rather than regenerating.** Generate overlays in greyscale and colour them with blend modes, so the six vinyl tones stay exact.
- **Remove backgrounds** of cut-outs with a proper matting tool, keeping the soft shadow as its own layer if you want to control it in CSS.
