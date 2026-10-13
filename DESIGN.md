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

Lettering is all Sakana, a single-weight racing face slanted onto the rake, the way race numbers and sponsor names are cut. Body copy is Hanken Grotesk, set plainly; JetBrains Mono is reserved for what a plotter or a compiler would print (sheet print, labels, spec terms). Density is poster-scale on the intro sheet and editorial on stub and kit panels. One geometric law governs everything: the rake. Stripes, LEDs, the page wipe, the masking tape and the kit ladder all lean at 14 degrees (tan 0.2493).

Motion is earned and visitor-owned: one arrival per visit (raw HTML, masking tape snaps at the rake, paint fills), then only visitor-triggered motion. Page switches pass through a raked paint wipe under 600ms. Reduced motion makes all of it instant. A recruiter mode (the pit limiter) replaces the livery with one plain, complete page.

**Key Characteristics:**
- White backing sheet, raked liner wordmark, dashed cut lines and registration marks.
- Flat vinyl colour fields with square die-cut corners; the only round shapes are the roundel and the number bubble.
- Sakana, slanted to the rake, for every piece of lettering; Hanken Grotesk for reading; mono only for print.
- Everything leans at 14 degrees.
- Night race theme: the same livery under floodlights on deep navy.

## Colors

A Castrol-inspired livery adapted around navy: big panels in navy, red as the signal, green as the second stripe, on a cool white sheet with primer grey under the paint. (This supersedes the orange/cobalt palette table in `docs/design-direction.md`; the values here are what ships.)

### Primary
- **Livery Navy**: the big panels. The name decal, the kit panel that closes every sheet, the number bubble, text ink on the day sheet, and the outline on white decals.

### Secondary
- **Castrol Red**: the signal. The race-number roundel, the leading stripe in every stripe decal and the page wipe, the active switch LED, the lap-counter ring on the bubble, text selection.
- **Castrol Green**: the second stripe. Note decals, the trailing stripe in wipes and kit stripes, and the focus ring on the day sheet.

### Tertiary
- **Masking Tape**: arrival only. The tape strips that snap across the raw page at the rake before the paint goes on. Never used as a surface after arrival.

### Neutral
- **Livery White**: the backing sheet (day ground), text on dark vinyl, white decals (always with an inset navy outline so they read as cut vinyl on a white sheet), and the night-race ink.
- **Night Deep**: the night-race ground, and the darkened navy tone for navy links inside the navy kit panel.
- **Primer Grey**: what is under the paint. Primer-tone decals, inactive switch LEDs, disabled actions and placeholder chips.
- **Carbon Black**: one decal tone among the vinyl set (section 06's tone, the C# stack decal).
- **Ink Secondary** / **Ink Secondary Night**: secondary text (sheet print, stack label, pit-limiter dates and descriptions) on the day and night grounds respectively.
- **Placement guide**: the side elevation of an AE86 hatchback, traced in Inkscape (`public/ae86.svg`, only its paths ship), filled in ink at 20% opacity on the intro sheet, the way a decal kit prints where its decals go. The front sits in frame on the right and the back runs behind the KEVIN decal (off the left edge on phones). The 23 roundel sits on its door, so the number reads as a race number, never as an age beside the name.
- **Liner and cut tints**: the liner wordmark is ink at 6% (4.5% at night); the dashed cut line is ink at 50% (45% at night). Always derived from the current ink, never a new hue.

### Named Rules
**The Livery Roles Rule.** Navy carries the panels, red is the signal, green is the second stripe. Stripe sets run red, thin navy or white, green, in that order.

**The Six Tones Rule.** Vinyl comes in exactly six tones (navy, red, green, white, primer, black), each with fixed text colour: white on navy, red, green and black; navy on white and primer. A new decal picks one of these; it never invents a tint.

**The Floodlight Rule.** Night race swaps only the ground and ink roles (ground to Night Deep, ink to Livery White). The vinyl keeps its colours; a decal is the same paint under floodlights.

## Typography

**Display Font:** Sakana, self-hosted from `public/fonts/sakana.woff` (Hanken Grotesk fallback, which also supplies the middle dot Sakana lacks). 1001fonts personal-use licence.
**Body Font:** Hanken Grotesk Variable (with system-ui)
**Label/Mono Font:** JetBrains Mono Variable (with ui-monospace)

**Character:** Sakana is one cut, one weight, with its own 8-degree lean. Display rules ask for italic and the browser adds a 14-degree oblique on top (`font-synthesis: style` on the root), so lettering sits on the rake; weight is never synthesised (no `weight` in `font-synthesis`), so 800/900 in the CSS render Sakana's true weight. The `@font-face` overrides Sakana's vertical metrics (ascent 86%, descent 14%) so uppercase lettering centres in any line box without padding hacks, and centred italic lettering is moved back by `--lean` (.15em, the oblique's overhang) so the ink, not the advance box, sits centred. A sheet of decals reads as one sponsor set; variety comes from size and colour. Hanken Grotesk is the quiet reading face beside it.

### Hierarchy
- **Display** (italic, 16 sheet units on desktop / 22.4vw on phones, line-height 0.8, uppercase): the name decal only.
- **Race number** (italic, letter-spacing -0.04 to -0.05em, tabular): the roundel, the stub-sheet number, the bubble.
- **Headline** (italic, clamp(2.75rem, 5.5vw, 5.5rem), line-height 0.86, uppercase): stub-sheet titles (up to 8.5rem) and the kit panel heading.
- **Title** (italic, clamp(1.125rem, 2vw, 1.75rem), line-height 1.05, uppercase): kit ladder and fan entries, with a Hanken 500 sub-line in sentence case.
- **Body** (Hanken 400, 1.0625rem, line-height 1.55): reading copy; ledes 500 at up to 1.25rem/1.45. Measure 46-68ch.
- **Label** (Sakana italic, 0.75rem, letter-spacing 0.07em, uppercase): the display switches.
- **Mono** (JetBrains 600, 0.6875rem, letter-spacing 0.03-0.04em, uppercase for print): sheet print, stack label, kit footer, spec terms.

### Named Rules
**The One Family Rule.** All lettering (names, numbers, titles, switches, stack decals) is Sakana; variety comes from size, colour and case, never from a second display face.

**The Print Rule.** Mono appears only where a machine would print: component names, dimensions, sheet print and plate footers. It is never a decorative label above a heading.

**The Plain Pit Rule.** The pit limiter page uses Hanken only (800 for its h1, 750 for h2), no italic display lettering: recruiter mode reads like a document, not a livery.

## Layout

The intro sheet is a plotted plate measured in a sheet unit, k = min(1vw, 1.62svh). On desktop (821px and up) the plate is 100k by 60k, centred, with every decal absolutely positioned at plotted coordinates in k so the whole composition scales as one sheet. At 820px and below the plate becomes a six-column stacked grid (gaps 16px by 14px): name full width, number and note sharing a row, spec full width, stack decals wrapping in a flex row; the raked stripe decal and one registration mark are dropped.

Every sheet ends with a raked wedge: sheets pad their bottom by tan(14deg) x 100vw, and the navy kit panel overlaps that wedge with a matching diagonal clip, so each page closes on a 14-degree cut. Content containers cap at 1312px with 5vw gutters (16px on phones); the pit limiter caps at 46rem.

Spacing runs on an 8px unit with 4px half-steps for tight pairs: 4, 8, 12, 16, 24, 40 and 64px are the reused steps; large section gaps are fluid clamps (72-128px). Fixed chrome sits 16px from the viewport edges (12px for switches on phones). Breakpoints: 420, 640, 760 (bubble moves bottom-right), 820/821 (plate vs stacked).

## Elevation & Depth

Flat vinyl. Decals lie flat on the sheet and carry no shadow; depth appears only on the floating chrome (switches, bubble, fan close) carries a soft two-layer shadow tinted with the navy lift colour. No hard offset shadows; no shadows on panels or text.

### Shadow Vocabulary
- **Floating chrome** (`box-shadow: 0 1px 2px rgb(7 18 41 / .14), 0 8px 20px -8px var(--lift)`): display switches; the bubble uses the heavier `0 2px 4px rgb(7 18 41 / .22), 0 14px 30px -10px var(--lift)`.
- **Fan focus card** (`filter: drop-shadow(0 10px 18px rgb(7 18 41 / .4))`): the current sheet in the open fan.

### Named Rules
**The Lift Rule.** A shadow means the thing floats above the sheet. Everything lying on the sheet is flat.

## Shapes

Square die-cut corners everywhere (0 radius); vinyl is cut, not rounded. The only curves are true circles: the race-number roundel, one round stack decal, the number bubble and the fan close button. Action buttons in the plain pit page take a barely-there 2px corner. Slanted forms are made by skewing or clipping at the rake: switches are skewed parallelograms, kit ladder links are parallelogram clips offset step by step along the rake, the LED and lap marks are skewed bars. Cut lines are 1.5px dashed strokes inset just outside each decal. Registration marks (a filled square and two open corner brackets, 3px) sit at the sheet corners.

## Components

### Decal (signature)
Die-cut vinyl in its slot, the unit of the whole system.
- **Structure:** a slot with a dashed cut line and the vinyl decal inside it. Decals are static: no hover, focus or click state of their own; links inside them behave as links.
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

### Page Wipe and Arrival
- **Wipe:** every sheet switch reveals the new page through a raked clip with a red/navy/green stripe band crossing at the rake (0.52s, ease out).
- **Arrival:** once per visit on the intro: the unstyled page, masking-tape strips snapping in at the rake, then the livery paints in.

## Do's and Don'ts

### Do:
- **Do** lean every stripe, bar, wipe and slanted edge at the 14-degree rake (tan 0.2493); derive offsets from it rather than eyeballing.
- **Do** build new content as decals: one of the six vinyl tones, square corners, a dashed cut line, and a primer underside naming the component that renders it.
- **Do** set all lettering in Sakana italic and vary size, colour and case; never fake a bold.
- **Do** keep night race to a ground and ink swap; vinyl colours stay the same.
- **Do** give every hover interaction a tap and keyboard equivalent, and make every motion instant under reduced motion.
- **Do** keep the pit limiter a plain Hanken document with the complete facts.

### Don't:
- **Don't** use the orange/cobalt values from the pre-build direction doc, or navy with orange; the livery is navy, Castrol red and Castrol green.
- **Don't** round the corners of vinyl; curves are reserved for true circles (roundel, bubble).
- **Don't** add shadows to anything lying flat on the sheet; shadow means lifted.
- **Don't** introduce a second display face or set display lettering in Hanken or mono.
- **Don't** use mono as a decorative kicker above headings; it is print, not a label system.
- **Don't** animate anything on load beyond the single per-visit arrival.
