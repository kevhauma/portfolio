---
name: Kevin, Race Livery
description: A personal portfolio printed as a race-livery decal kit.
colors:
  livery-white: "#F7F8FA"
  livery-navy: "#13254F"
  night-deep: "#071229"
  castrol-red: "#E2001A"
  castrol-green: "#00843D"
  primer-grey: "#B9BEC6"
  carbon-black: "#0E0F12"
  masking-tape: "#E4D6B2"
  ink-secondary: "#3B4A6B"
  ink-secondary-night: "#B8C3DA"
typography:
  display:
    fontFamily: "'Sakana', 'Hanken Grotesk Variable', sans-serif"
    fontSize: "calc(min(1vw, 1.62svh) * 16)"
    fontWeight: 400
    fontStyle: italic
    lineHeight: 0.8
    letterSpacing: "-0.035em"
  headline:
    fontFamily: "'Sakana', 'Hanken Grotesk Variable', sans-serif"
    fontSize: "clamp(2.75rem, 5.5vw, 5.5rem)"
    fontWeight: 400
    fontStyle: italic
    lineHeight: 0.86
    letterSpacing: "-0.03em"
  title:
    fontFamily: "'Sakana', 'Hanken Grotesk Variable', sans-serif"
    fontSize: "clamp(1.125rem, 2vw, 1.75rem)"
    fontWeight: 400
    fontStyle: italic
    lineHeight: 1.05
    letterSpacing: "0.02em"
  body:
    fontFamily: "'Hanken Grotesk Variable', system-ui, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 400
    lineHeight: 1.55
    letterSpacing: "normal"
  label:
    fontFamily: "'Sakana', 'Hanken Grotesk Variable', sans-serif"
    fontSize: "0.75rem"
    fontWeight: 400
    fontStyle: italic
    lineHeight: 1
    letterSpacing: "0.07em"
  mono:
    fontFamily: "'JetBrains Mono Variable', ui-monospace, monospace"
    fontSize: "0.6875rem"
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: "0.04em"
rounded:
  none: "0"
  chip: "2px"
  round: "50%"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "40px"
  xxl: "64px"
components:
  decal-navy:
    backgroundColor: "{colors.livery-navy}"
    textColor: "{colors.livery-white}"
    rounded: "{rounded.none}"
  decal-red:
    backgroundColor: "{colors.castrol-red}"
    textColor: "{colors.livery-white}"
    rounded: "{rounded.none}"
  decal-green:
    backgroundColor: "{colors.castrol-green}"
    textColor: "{colors.livery-white}"
    rounded: "{rounded.none}"
  decal-white:
    backgroundColor: "{colors.livery-white}"
    textColor: "{colors.livery-navy}"
    rounded: "{rounded.none}"
  decal-roundel:
    backgroundColor: "{colors.castrol-red}"
    textColor: "{colors.livery-white}"
    rounded: "{rounded.round}"
  primer-under:
    backgroundColor: "{colors.primer-grey}"
    textColor: "{colors.livery-navy}"
    typography: "{typography.mono}"
    padding: "8px"
  display-switch:
    textColor: "{colors.livery-navy}"
    backgroundColor: "{colors.livery-white}"
    typography: "{typography.label}"
    padding: "0 18px"
    height: "44px"
  number-bubble:
    backgroundColor: "{colors.livery-navy}"
    textColor: "{colors.livery-white}"
    rounded: "{rounded.round}"
    size: "72px"
  kit-link:
    backgroundColor: "{colors.castrol-red}"
    textColor: "{colors.livery-white}"
    typography: "{typography.title}"
    height: "clamp(72px, 7.4vw, 96px)"
  pit-button:
    backgroundColor: "{colors.livery-navy}"
    textColor: "{colors.livery-white}"
    rounded: "{rounded.chip}"
    padding: "0 20px"
    height: "44px"
  pit-button-disabled:
    backgroundColor: "{colors.primer-grey}"
    textColor: "{colors.livery-navy}"
---

# Design System: Kevin, Race Livery

## Overview

**Creative North Star: "The Decal Kit off the Plotter"**

Every page is a sheet in a race-livery decal kit. The ground is a white backing liner printed with a faint wordmark raked at 14 degrees; the content sits on it as die-cut vinyl decals in navy, Castrol red, Castrol green, white and carbon black, each inside a dashed plotter cut line. The system is proof by construction: the craft is in how precisely the kit is cut, set and printed.

Lettering is all Sakana, a single-weight racing face slanted onto the rake, the way race numbers and sponsor names are cut. Body copy is Hanken Grotesk, set plainly; JetBrains Mono is reserved for what a plotter or a compiler would print (labels, spec terms, the kit footer). Density is poster-scale on the intro sheet and editorial on stub and kit panels. Two geometric laws: the rake and the swoop. Lettering, LEDs, the page wipe, the masking tape and the kit ladder lean at 14 degrees (tan 0.2493); the livery stripes do not rule straight but swoop, as one constant-width ribbon bent into an S with a big red disc setting behind it (the sunset swoop, after the Castrol Celica GT-Four and the GT86 swoop poster).

The kit is drawn like the workbench garage, as a late-90s anime cel: every object has a heavy ink line that thickens on its shade side, paint is flat and steps from light to shade in hard bands, a lit surface carries one painted highlight, and the low sun setting on the left (the swoop's disc) throws every object's shadow long to the right, along the rake. Each sheet keeps its own world and palette (the decal sheet, the pit wall, the walnut desk, the AE86 cabin at dusk); the cel is how all of them are drawn.

Motion is earned and visitor-owned: one arrival per visit (raw HTML, masking tape snaps at the rake, paint fills), then only visitor-triggered motion. Page switches pass through a raked paint wipe under 600ms. Reduced motion makes all of it instant. A recruiter mode (the pit limiter) replaces the livery with one plain, complete page.

**Key Characteristics:**
- White backing sheet, raked liner wordmark and dashed cut lines, framed by the sunset swoop.
- Vinyl colour fields with square die-cut corners; the only round shapes are the roundel and the number bubble.
- Drawn as a cel on every built sheet and in the shared chrome: heavy weighted ink lines, inked display lettering, hard bands, one painted highlight, long raked shadows.
- On the intro sheet the decals are real stickers that catch the light: most are gloss vinyl, a few are holographic or chrome foil, their sheen painted in hard shapes, and the decal sheet tilts toward the cursor as one piece. The printed liner and the car stay rough matte.
- Sakana, slanted to the rake, for every piece of lettering; Hanken Grotesk for reading; mono only for print.
- Everything leans at 14 degrees, except the stripes, which swoop.
- Night race theme: the same livery under floodlights on deep navy.

## Colors

A Castrol-inspired livery adapted around navy: big panels in navy, red as the signal, green as the second stripe, on a cool white sheet with primer grey under the paint. (This supersedes the orange/cobalt palette table in `docs/design-direction.md`; the values here are what ships.)

### Primary
- **Livery Navy**: the big panels. The name decal, the kit panel that closes every sheet, the number bubble, text ink on the day sheet, and the outline on white decals.

### Secondary
- **Castrol Red**: the signal. The race-number roundel, the leading stripe of the swoop ribbon and the page wipe, the setting disc behind the swoop, the active switch LED, the lap-counter ring on the bubble, text selection.
- **Castrol Green**: the second stripe. The TypeScript and Three.js decals, the trailing stripe of the swoop ribbon and the wipe, and the focus ring on the day sheet.

### Tertiary
- **Masking Tape**: arrival only. The tape strips that snap across the raw page at the rake before the paint goes on. Never used as a surface after arrival.

### Neutral
- **Livery White**: the backing sheet (day ground), text on dark vinyl, white decals (always with an inset navy outline so they read as cut vinyl on a white sheet), and the night-race ink.
- **Night Deep**: the night-race ground, and the darkened navy tone for navy links inside the navy kit panel.
- **Primer Grey**: what is under the paint. Primer-tone decals, inactive switch LEDs, disabled actions and placeholder chips. On the intro sheet the primer sticker is cut from chrome foil (brushed silver, #8D939C to #F4F6F8), the one place the tone turns metal.
- **Carbon Black**: one decal tone among the vinyl set (section 06's tone, the Node.js stack decal).
- **Ink Secondary** / **Ink Secondary Night**: secondary text (pit-limiter dates and descriptions) on the day and night grounds respectively.
- **Placement guide**: the side elevation of an AE86 hatchback, traced in Inkscape (`public/ae86.svg`, only its paths ship), filled in ink at 20% opacity on the intro sheet and masked with a fine print grain, so it reads as rough matte ink on the liner and never catches the light, the way a decal kit prints where its decals go. The front sits in frame on the right and the back runs behind the KEVIN decal (off the left edge on phones). The 23 roundel sits on its door, so the number reads as a race number, never as an age beside the name.
- **Liner and cut tints**: the liner wordmark is ink at 6% (4.5% at night); the dashed cut line is ink at 50% (45% at night). Always derived from the current ink, never a new hue.

### Named Rules
**The Livery Roles Rule.** Navy carries the panels, red is the signal, green is the second stripe. Stripe sets run red, thin navy or white, green, in that order.

**The Sunset Rule.** The swoop ribbon is constant width (red, a thin white stripe, green, with navy gaps between) and runs from the cut down into the navy. The red disc always sits behind the ribbon on the sheet side, cut off by it with a gap of sheet. The swoop is a background: where it reaches the content (the lowest decals on the landing), the decals lie on top of it.

**The Six Tones Rule.** Vinyl comes in exactly six tones (navy, red, green, white, primer, black), each with fixed text colour: white on navy, red, green and black; navy on white and primer. A new decal picks one of these; it never invents a tint.

**The Floodlight Rule.** Night race swaps only the ground and ink roles (ground to Night Deep, ink to Livery White). The vinyl keeps its colours; a decal is the same paint under floodlights.

## Typography

**Display Font:** Sakana, self-hosted from `public/fonts/sakana.woff` (Hanken Grotesk fallback, which also supplies the middle dot Sakana lacks). 1001fonts personal-use licence.
**Body Font:** Hanken Grotesk Variable (with system-ui)
**Label/Mono Font:** JetBrains Mono Variable (with ui-monospace)
**Sheet accent faces:** Dela Gothic One for the workbench garage's own titles (`--g-title`); Kalam 400/700 (`@fontsource/kalam`, Hanken and cursive fallback, `--ck-hand`) for the handwriting on the music cabin's paper.

**Character:** Sakana is one cut, one weight, with its own 8-degree lean. Display rules ask for italic and the browser adds a 14-degree oblique on top (`font-synthesis: style` on the root), so lettering sits on the rake; weight is never synthesised (no `weight` in `font-synthesis`), so 800/900 in the CSS render Sakana's true weight. The `@font-face` overrides Sakana's vertical metrics (ascent 86%, descent 14%) so uppercase lettering centres in any line box without padding hacks, and centred italic lettering is moved back by `--lean` (.15em, the oblique's overhang) so the ink, not the advance box, sits centred. A sheet of decals reads as one sponsor set; variety comes from size and colour. Hanken Grotesk is the quiet reading face beside it.

### Hierarchy
- **Display** (italic, 16 sheet units on desktop / 22.4vw on phones, line-height 0.8, uppercase): the name decal only.
- **Race number** (italic, letter-spacing -0.04 to -0.05em, tabular): the roundel, the stub-sheet number, the bubble.
- **Headline** (italic, clamp(2.75rem, 5.5vw, 5.5rem), line-height 0.86, uppercase): stub-sheet titles (up to 8.5rem) and the kit panel heading.
- **Title** (italic, clamp(1.125rem, 2vw, 1.75rem), line-height 1.05, uppercase): kit ladder and fan entries, with a Hanken 500 sub-line in sentence case.
- **Body** (Hanken 400, 1.0625rem, line-height 1.55): reading copy; ledes 500 at up to 1.25rem/1.45. Measure 46-68ch.
- **Label** (Sakana italic, 0.75rem, letter-spacing 0.07em, uppercase): the display switches.
- **Mono** (JetBrains 600, 0.6875rem, letter-spacing 0.03-0.04em, uppercase for print): kit footer, spec terms.

### Named Rules
**The One Family Rule.** All livery lettering (names, numbers, titles, switches, stack decals, the sheet sticker, the kit panel, the fan, the plain-list headings) is Sakana; variety comes from size, colour and case, never from a second display face. A sheet's own world may carry one accent face, and only on the objects that belong to that world: Dela Gothic One on the garage's titles, Kalam on the cabin's J-cards, cassette labels and pencilled notes. An accent face never sets livery chrome or a sheet's page title.

**The Hand Rule.** Kalam is handwriting, so it appears only where a person would write with a pen: the tape names and track lists on the J-cards, the cassette labels, the side letter, the pencilled notes on stubs, and each tape's one-line note in the plain list. Printed matter on the same paper (artist names, ticket headers, the case length) stays Hanken.

**The Print Rule.** Mono appears only where a machine would print: component names, dimensions and plate footers. It is never a decorative label above a heading.

**The Plain Pit Rule.** The pit limiter page uses Hanken only (800 for its h1, 750 for h2), no italic display lettering: recruiter mode reads like a document, not a livery.

## Layout

The intro sheet is a plotted plate measured in a sheet unit, k = min(1vw, 1.62svh). On desktop (821px and up) the plate is 100k by 60k, centred, with every decal absolutely positioned at plotted coordinates in k so the whole composition scales as one sheet. The intro is one screen tall (or the plate plus most of the drop on a tall window), so the kit panel's sunset swoop closes the first screen as a background: the lowest decals lie on top of the ribbon and the disc, and it does not paint on there. At 820px and below the plate becomes a six-column stacked grid (gaps 16px by 14px): name full width, the car with the number on its door, spec full width, stack decals wrapping in a flex row, with the kit panel's swoop under them as on every other page.

Every sheet ends on the sunset swoop: sheets pad their bottom by the drop (`--drop`, 15vw), and the navy kit panel overlaps that band with an SVG top edge in a 1000 by 150 viewBox (uniform scale, since the drop is a share of the width): an S that runs low on the left and high on the right, the ribbon under it and the disc setting behind it on the left. Stub sheets add only 48-72px below their content, so the swoop sits close under it. Content containers cap at 1312px with 5vw gutters (16px on phones); the pit limiter caps at 46rem.

The music sheet is a fixed scene rather than a plate: the cabin is authored in a 1440 by 900 frame and scaled as one piece by `--s` (the lesser of the container width and 160svh, over 1440px), so the first screen is the whole cabin; the letterbox around it is painted as more cabin (pillars, dash pad, dash), never page ground. At 820px and below a 72px band carries the sheet sticker, the frame scales to fit the deck and all four cases (`--s` clamped .45 to 1) and the visitor looks round with native sideways scroll, with a one-line hint and the lede under the stage. Under the cabin, the plain list (every tape and every gig) follows the site container (1312px, 5vw gutters, 16px on phones) and the site's ground and ink, day and night, and ends on the swoop like every sheet.

Spacing runs on an 8px unit with 4px half-steps for tight pairs: 4, 8, 12, 16, 24, 40 and 64px are the reused steps; large section gaps are fluid clamps (72-128px). Fixed chrome sits 16px from the viewport edges (12px for switches on phones). Breakpoints: 420, 640, 760 (bubble moves bottom-right), 820/821 (plate vs stacked).

## Elevation & Depth: the Cel

Every built sheet (intro, experience, projects, workbench, music) and the shared chrome are drawn as an anime cel, after the garage (`src/styles/garage.css`, `src/garage/toon.ts`). The stub sheets keep flat, unshaded decals until they are painted.

- **Weighted ink line.** Every object has a heavy dark outline that runs thicker on its shade side, down and right: `box-shadow: var(--cel-ink-line)` (a 3px ring plus the same ring nudged 1.5px down and right). Clip-path shapes (kit ladder links, fan panels, the monitor body, the pens) can't carry a box-shadow, so their parent takes `filter: var(--cel-outline)`, the same weighted line in zero-blur drop shadows.
- **Bands, not ramps.** Light steps into shade in two or three flat bands: gradients with doubled stop positions (`a 0 40%, b 40% 72%, c 72%`), never a smooth ramp. Metal, cloth, carbon, concrete, sky and paper all follow this.
- **One painted highlight.** A lit surface gets one hard-edged highlight shape or a pair of raked glint bars, never a soft hotspot.
- **Long raked shadows.** The light is a low sun on the left, so every shadow is thrown to the right along the rake: the object swept along (L, L × tan 14°). Flat, 0 blur, tinted from the ground's shade rather than black. Rectangles sweep a hexagon and round objects a pill, drawn by the shared `:is([data-finish], .cast)::after` rule in `livery.css` (an object sets `--len`, and may set `--cast-c`, `--foot` and `--cast-shape`); it stays translucent so the print underneath still reads. Clipped shapes (kit rungs, pens) sweep themselves with doubling drop shadows (3, 6, 12, 24px) in one opaque shade of their ground. Small chrome takes a single rake offset (`8-12px 2-3px`).
- **Flat textures.** No noise textures on things that are drawn: the walnut, cloth, paper, asphalt and concrete are flat paint with a few drawn lines. Printed matter (the liner wordmark, cut lines, the car, the manual's two-ink figures and wiring) stays print.
- **Inked lettering.** Display lettering on vinyl, panels and covers is inked like the garage titles: `-webkit-text-stroke: .08-.12em var(--cel-ink)` with `paint-order: stroke fill`, plus a heavier ink step on the shade side (`text-shadow: .05em .03em 0`). The name, the 23, the coloured stack decals, the kit heading and numbers, the fan numbers, EXPERIENCE and the manual's cover title.

### Tokens (`src/styles/livery.css`)
- `--cel-ink` `#0A1330`, the ink line on every sheet, day and night.
- `--cel-line` `3px` and `--cel-weight` `1.5px`, combined in `--cel-ink-line` (on the intro plate they scale with the sheet: `max(3px, k × .26)` and `max(1.5px, k × .14)`).
- `--cel-shade` the hard-shadow tint (navy at 22% by day, black at 45% at night); `--cel-hi` the highlight white.
- `--cel-outline` the four-drop-shadow outline for clipped shapes.

### Shadow Vocabulary
- **Chrome** (switches, bubble, fan close): weighted ink line plus a short rake shadow `8-10px 2-2.5px 0 var(--cel-line) var(--cel-shade)`; hover lengthens it, press shortens it.
- **Sticker** (intro decals): weighted ink line, a hard contact shadow whose direction follows the lamp, and the long sun shadow across the liner (2.6k, 16px on phones).
- **Object on a surface**: weighted ink line plus its long sun shadow: the monitor across the fence (28-56px), the rack on the concrete (24-44px), each rack sheet on the steel (12px), the book on the walnut (24-60px), each pen (45px), each kit rung on the navy (21px).

### Named Rules
**The Sun Rule.** One low sun lights every sheet from the left, so every shadow falls to the right along the 14° rake, never down and right at 45°. Its length says how much stands up off the ground: a flush sticker a little, the book on the desk the most. Nothing gets a blurred shadow. The cursor-lamp on the intro only moves the stickers' sheen and contact shadows; the sun's shadows stay put.

**The Lamp Rule.** On the intro sheet the cursor is a lamp over the sheet (`src/scripts/stickers.ts`). The whole decal sheet (the plate: stickers, cut lines and car together) tilts toward it as one piece, up to 4 degrees, with the side under the lamp pressing in; stickers never tilt on their own. Each sticker's sheen follows the lamp. On touch, the light hangs above the top right of the screen and slides with scroll, and a press on the sheet holds the lamp there. Reduced motion keeps the sheet flat under the resting light (top left, low). The liner, the cut lines and the car never shine.

## Shapes

Square die-cut corners everywhere (0 radius); vinyl is cut, not rounded. The only curves are true circles: the race-number roundel, one round stack decal, the number bubble and the fan close button. Action buttons in the plain pit page take a barely-there 2px corner. Slanted forms are made by skewing or clipping at the rake: switches are skewed parallelograms, kit ladder links are parallelogram clips offset step by step along the rake, the LED and lap marks are skewed bars. Cut lines are 1.5px dashed strokes inset just outside each decal. The swoop's curves are built, not drawn: `src/lib/swoop.ts` offsets bands from a Bézier spine, so the ribbon keeps its width round every bend.

## Components

### Decal (signature)
Die-cut vinyl in its slot, the unit of the whole system.
- **Structure:** a slot with a dashed cut line and the vinyl decal inside it. Decals have no hover, focus or click state of their own; links inside them behave as links.
- **Finish** (`finish` prop, intro sheet only), painted as cel: `gloss` vinyl (a hard highlight blob in a paler halo, two raked glint bars that slide with the light, a shade band on the far side, a lit top edge), `holo` foil (flat rainbow bands and glitter under the ink, stepping down in rings from where the light falls: pink-gold on red, oil slick on black, pearl on white) or `chrome` foil (brushed silver in hard bands, primer only). The 23 roundel, the black, the round white and the primer stack decals are foil; the rest are gloss. Ink printed on foil stays flat white or navy.
- **Tones:** one of the six vinyl tones; white decals carry an inset navy outline (2px, scaling with the sheet).

### Buttons
- **Display switch:** Sakana label in a skewed ground-coloured parallelogram with floating-chrome shadow, 44px tall, a skewed 20 by 8px LED (primer off, red with an ink hairline when pressed). Hover lifts 2px; active presses 1px.
- **Number bubble:** 72px navy circle (64px on phones), race number in black italic, with a 6px conic ring that fills red as sheets are visited (striped red/primer in pit-limiter mode). Inverts to white on navy at night. Scales to 1.06 on hover.
- **Pit button:** ink on ground, 2px corner, 44px tall, 700 weight. Disabled is primer grey with navy text.

### Navigation
- **Fan:** the bubble opens a full-screen dialog whose six sheet entries fan out from the bubble's corner as solid tone panels (each section owns a tone), with staggered scale-in at the ease curve. Entry numbers are black italic at width 150%; titles 800 italic uppercase. Hover and focus underline the title (3px); visited sheets show a skewed lap bar. Portrait mode slides entries in from the right corner.
- **Kit ladder:** the navy panel closing every sheet lists the other sheets as raked parallelogram links in their tone, each step shifted along the rake. Hover or focus slides the link 14px and its arrow 6px further.

### Stub Sheet
A sheet masked off but not yet painted: a headline decal, a race-number decal, and a large text decal (the paint shop) listing what will be painted, with skewed bar bullets. Same vinyl and cut line rules as the intro.

### Cabin (sheet 05, signature)
Kevin's AE86 at dusk from the right-hand driver's seat (`src/components/cockpit/`, `src/styles/cockpit.css`, `src/cockpit/`). Its own palette, drawn in the shared cel with the shared ink `#0A1330`, the weighted ink line (`3px` plus `1.5px` down and right) and a raked cast `16px 4px` in near-black at 46% (cases `15px 3.7px`, small chips `6-8px 1.5-2px`).
- **Cabin plastics:** dark plum-greys in hard bands, `#17151E` ground through `#1B1824`, `#24212E`, `#2C2A33`, `#37343F`, `#3A3346`, `#45414F`. Cabin text is `#EDE6F2`. The cabin stays dark in both themes; only the plain list under it takes night race.
- **Windshield:** a background painting with no ink lines, hard sky bands per tape (dusk purples to `#FFD068` gold), horizon, road. The rear-view mirror repeats the current sky in three bands.
- **Deck:** a pull-out cassette head unit. The display is an amber VFD (`#FFB547` lit, `#3B2810` unlit segments, on `#120C05`) in JetBrains Mono; its track rows become buttons once a tape is in (current row full amber with a play triangle). Keys are two-band grey caps with a 4px ink underside that press 3px; Eject is the red cap.
- **Gauges:** white numerals (Hanken 500) on black, mono labels, a Castrol red zone; needles settle with the ease curve.
- **Paper:** cream `#F4EFE2` with a `#E4DCC8` fold band; ink on paper is `#1A1A2A`, pencil `#5E574A`. J-cards carry Kalam, a 4px accent spine in the tape's colour and a highlighter swipe behind the title. Gig stubs carry a coloured header band (Hanken 800, tracked caps, the printed ticket header), the act in Hanken 750, and a red stamped date box rotated -4deg.
- **Mixtape case:** a closed clear case (a pale translucent lid with one raked glint bar) over a shell in the tape's colours; closed, only the J-card front reads. Hover lifts the case 4px. Focus is a dashed amber outline (`3px`, offset 7px); everywhere in the cabin focus is dashed amber.
- **Sheet sticker:** the one vinyl decal in the cabin, the "05 Music" sticker on the dash: white in two bands, navy Sakana with the cel ink stroke, red number, a red-over-green stripe along its foot, tilted -2.5deg.
- **Loading a case** (the sheet's signature motion): the lid swings open (`.62s`, ease), the J-card unfolds over the console, the tape flies into the deck slot (840ms in, 780ms out), the windshield cuts to the track's view behind a 14° raked edge (660ms, ease), the needles settle (1100ms, staggered 240ms) and the water in the cup ripples once. Eject reverses it. Nothing moves until the visitor picks; reduced motion cuts every step; nothing makes a sound.
- **Plain list:** each tape as a Sakana heading over a raked accent bar, its Kalam line, a mono meta line and two sides of tracks; a navy Sakana "Play it in the car" button (ink line plus a short rake shadow that lengthens on hover, red on hover) sends the visitor back up into the cabin with that tape loaded. Gigs are rows with a skewed colour tab.

### Page Wipe and Arrival
- **Wipe:** every sheet switch reveals the new page through a raked clip with a red/navy/green stripe band crossing at the rake (0.52s, ease out).
- **Arrival:** once per visit on the intro: the unstyled page, masking-tape strips snapping in at the rake, then the livery paints in.

## Do's and Don'ts

### Do:
- **Do** lean every bar, wipe and slanted edge at the 14-degree rake (tan 0.2493); derive offsets from it rather than eyeballing. Stripe sets swoop instead, built with `src/lib/swoop.ts`.
- **Do** build new content as decals: one of the six vinyl tones, square corners, a dashed cut line, and a primer underside naming the component that renders it.
- **Do** set all lettering in Sakana italic and vary size, colour and case; never fake a bold.
- **Do** keep night race to a ground and ink swap; vinyl colours stay the same.
- **Do** give every hover interaction a tap and keyboard equivalent, and make every motion instant under reduced motion.
- **Do** keep the pit limiter a plain Hanken document with the complete facts.

### Don't:
- **Don't** use the orange/cobalt values from the pre-build direction doc, or navy with orange; the livery is navy, Castrol red and Castrol green.
- **Don't** round the corners of vinyl; curves are reserved for true circles (roundel, bubble).
- **Don't** use blurred shadows, soft glows or smooth gradient ramps on drawn things; the cel steps in hard bands and casts hard shadows.
- **Don't** put noise textures on drawn surfaces; noise is only for print grain (the car on the liner).
- **Don't** give the liner, the cut lines or the car any sheen; they are printed matte.
- **Don't** introduce a second display face for livery lettering or set display lettering in Hanken or mono; a sheet's accent face (Dela Gothic One, Kalam) stays on its own world's objects.
- **Don't** use mono as a decorative kicker above headings; it is print, not a label system.
- **Don't** animate anything on load beyond the single per-visit arrival.
