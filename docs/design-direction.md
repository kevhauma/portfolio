# Design direction: Race Livery

Confirmed 2026-10-12. This is the pre-build direction for the shared design system: the shell that holds the six sections together. Product truth lives in [PRODUCT.md](../PRODUCT.md). `DESIGN.md` does not exist yet; it gets written from the finished build, and from then on it is the authority for tokens and components. Until then, this document is.

## Updates since confirmation (2026-10-12, later the same day)

These override the sections below where they conflict:
- **Landing structure:** Decal Sheet, picked from three structures (Stripe Ladder, Tape Line, Decal Sheet). Mocks are in `.impeccable/mocks/decision/`.
- **Pages, not one scroll:** each section is its own page with a short loading transition on every switch. This replaces the scroll-driven section hand-off. The bubble's ring needs a new meaning, because it no longer has one long page to track.
- **Palette: Castrol-inspired, navy panels** (chosen from `palette-castrol-navy.html`; the green-panel variant and Oxblood, Petrol and Violet were declined). Navy + orange is out because it reads as Max Verstappen. No Castrol logo or wordmark anywhere. This replaces the palette table below:

| Role | Day | Night race |
| --- | --- | --- |
| Ground | Livery white `#F7F8FA` | Deep navy `#071229` |
| Ink / big panels | Navy `#13254F` | White on navy panels `#13254F` |
| Signal (roundel, active states) | Castrol red `#E2001A` | Castrol red `#E2001A` |
| Second stripe | Castrol green `#00843D` | Castrol green `#00843D` |
| Bare metal / primer | Primer grey `#B9BEC6` | Primer grey `#B9BEC6` |

Measured contrast: navy on white 14.1:1; white on red 4.9:1 and red on white 4.7:1, so red may carry text either way; white on green 4.8:1; navy on primer 8.0:1. **Navy on red is 3.0:1**, so text on red panels is white, and navy on red is for display sizes only. Red on deep navy is 3.8:1 and green on deep navy 3.9:1, so at night both are large-text or field colours, never body text.

## Decisions at a glance

| Topic | Decision |
| --- | --- |
| Stack | Astro + React islands; heavy pieces hydrate only when their section is reached |
| Visual world | **Race Livery**: the whole site wears one paint scheme |
| Race number | **23** |
| Ground | White by day; navy at night. Never black |
| Night variant | **Yes**: "night race", following the OS setting with a manual override |
| Navigation | Floating number bubble that opens a full-screen fan of livery stripes (Seychelles-flag geometry) |
| LED strip | **Only** in the personal-projects (WLED) section, and **simulated** |
| Map | **Curated** trips; not the main navigation |
| Experience | **Race timing screen** (metro map dropped) |
| Recruiter mode | Pit limiter: the livery comes off, leaving one plain white column |
| Build path | Code-first (no image generation was available); the ambition lives in the written contract and gets checked at the finish review |

## The world

The site wears one livery, the way a helmet or race bike does. Every section is a panel of the same paint scheme. The livery is a **graphic system** of stripes, numbers and decals, not an illustration: no helmet drawings, no car or bike renders. That line keeps it from turning into a theme park.

**Rake law.** Every diagonal on the site runs at one fixed angle (start at 14°, tune at build). Stripes, the nav fan, section hand-offs and peel corners all share it. This one rule makes six different interface worlds read as one paint job.

**Stripes run across sections.** Livery stripes sweep from one section into the next, so the jump between worlds happens in the paint.

**No boxes.** Content is separated by panels and stripes, never by cards, outlines or divider rules. This fits the brief's "no grid of cards".

**Size is billing.** Your name, the race number and section titles sit at livery scale. Everything else is clearly secondary.

**Decals.** Your tech stack appears as sponsor-style decals, sized by how much you actually use each one. Clients are **never** shown as sponsors, because that would read as endorsement. They live in the timing screen.

## Palette

These are starting values chosen to include navy, and they get tuned at build. Contrast ratios were checked against WCAG.

| Role | Day | Night race |
| --- | --- | --- |
| Ground | Livery white `#F7F8FA` | Deep navy `#07112A` |
| Primary ink / panels | Navy `#0D1B3D` | White `#F7F8FA` on navy panels `#0D1B3D` |
| Signal | Orange `#FF5A1F` | Orange `#FF5A1F` |
| Second stripe | Cobalt `#1F45FF` | Cobalt `#1F45FF` |
| Bare metal / primer | Primer grey `#B9BEC6` | Primer grey `#B9BEC6` |
| Deepest ink | Black `#0E0F12` (numerals, thin stripes only) | not used as a ground |

Contrast rules, from the measured ratios:
- Navy on white **15.9:1** and white on navy **15.9:1**: use for all body text.
- Navy on orange **5.4:1** and black on orange **6.2:1**: text on orange panels is navy or black.
- **Orange on white is 2.9:1, which fails.** Orange never carries text or icons on white; it's a field and stripe colour only.
- Orange on navy **5.4:1**, and **6.0:1** on deep navy: orange text is allowed at night.
- White on cobalt **5.9:1**: text on cobalt panels is white.
- Cobalt on deep navy **3.0:1**: at night cobalt is a field, never text.
- Navy on primer **9.1:1**: the view-source state stays readable.

Each section keeps its own accents inside its panel (code-editor green in the intro, timing-screen amber in Experience, sunset tones on the map), and each must pass contrast against its own panel.

## Type

These are proposals, confirmed at build.
- **Display:** [Anybody](https://fonts.google.com/specimen/Anybody), a variable face with width (50–150), weight and italic axes. Extended black italic for the race number and names; condensed for decal labels and section numbers. One family gives the livery its whole lettering range.
- **Body:** [Hanken Grotesk](https://fonts.google.com/specimen/Hanken+Grotesk), a clean, quiet sans for reading.
- **Per-section accent faces:** each section's own pass picks one (a mono for the intro inspector, a timing-screen face for Experience, and so on).
- Serve the fonts from the project with `@font-face`, not a hosted stylesheet.

## Spacing

Spacing uses an 8px base unit. Stripe widths, panel gutters and section padding are all multiples of it. Leave more space above a heading than below it, and keep one vertical rhythm throughout.

## Shared components

### Number bubble and fan nav
- A floating round bubble shaped like a helmet roundel. It shows **23**; inside a section it shows that section's number.
- **Progress ring:** the bubble's ring fills like a rev counter as you scroll the page. It's driven by a CSS scroll-driven animation, so it reacts to scroll and never controls it.
- **Opening it:** tap or click covers the screen with a full-screen layer, and six livery stripes fan out from the bubble's corner at the rake angle, like the Seychelles flag. Each stripe is one section, showing its number and name. The current section's stripe is lifted, and visited stripes carry a small lap mark.
- **Choosing:** the chosen stripe widens to fill the screen (View Transitions API) and you land in that section. It's a jump the visitor asked for, never scroll hijacking.
- **Accessibility:** the bubble is a `button`, and the fan is a modal dialog containing a list of six links. Arrow keys move between stripes, Esc closes, focus stays inside while open and returns to the bubble on close.
- **Mobile:** the bubble sits in a bottom corner, and the fan uses tall bands in portrait. Bottom-left or bottom-right is still open: it's a trade between clean fan geometry and thumb reach.

### Arrival (inspired by VAP's loader)
The intro's raw, unstyled HTML gets its livery applied: masking-tape lines snap across the page, the paint fills in, and the layout locks into place. This happens once per visit. Without JavaScript, the raw readable HTML stays, which is the intro's own starting state.

### Peel and view source (Lando-style playfulness)
- Hovering or tapping a decal or panel corner peels it slightly at the rake angle, showing the primer and the component underneath.
- The **view source** toggle is the full peel: the whole site goes to primer grey with box models and component names showing. Inspecting becomes part of the livery world instead of a bolt-on.

### Recruiter mode (pit limiter)
- A visible toggle labelled as a pit limiter. When it's on, the bubble's ring locks into a limiter pattern and the livery comes off, leaving one fast, plain white column.
- **Contents:** role, years and stack; the full client timeline with dates, role, stack and what shipped; projects with one-line descriptions and GitHub links; contact details and a CV download.
- The choice is remembered across visits. Storage access is wrapped in try/catch, and the page renders correctly without it.

### Night race
- Follows `prefers-color-scheme`, with a manual override next to the pit limiter.
- The ground goes deep navy and panels go navy, with white and orange stripes, as if the livery were under floodlights.
- The map's dark theme pairs with it.

### Section hand-off
Stripes cross the section boundary at the rake angle, and the next section's panel colour comes in behind them. Scroll-driven, reacting only.

## Sections in this system

The shared system frames each section; each section's inner interface gets its own pass later.

| # | Section | Interface language | Notes |
| --- | --- | --- | --- |
| 01 | Intro | Raw HTML, then livery, plus the inspector | Arrival sequence; view-source toggle |
| 02 | Projects | One small interaction per project | No card grid; GitHub contribution graph may sit behind |
| 03 | Experience | Race timing screen | Decided over metro map. F1 TV: timing type, data density, broadcast graphics. Bachelor = qualifying, years = laps, clients = sectors |
| 04 | Map | MapLibre + deck.gl | Curated trips; not the nav. Themes: light, dark (pairs with night race), fog of war, timing-screen mode for circuits. Racetrack as a map feature (James Chughh reference). Photos open in a viewfinder with an EXIF HUD |
| 05 | Music | Tour poster / setlist | Concerts and festivals as tour dates, current listening as the setlist (changed 2026-10-13; 3D printing moved to 06) |
| 06 | Personal projects | Simulated WLED strip plus a workbench, with the 3D-print slicer preview on the bench | **The only place the LED strip appears.** Visitors pick a colour and the simulated strip responds. Its colours belong to this section, not the livery |

## Motion and reduced motion

| Moment | Trigger | Reduced motion |
| --- | --- | --- |
| Arrival (tape and paint) | Page load, once per visit | Styles apply instantly, no sequence |
| Section hand-off stripes | Scroll position (CSS scroll-driven) | Stripes static at their resting position |
| Progress ring | Scroll position | Ring jumps per section instead of filling smoothly |
| Fan open and close | Bubble click or tap | Fan appears and disappears without moving |
| Fan to section | Stripe choice (View Transitions) | Instant jump |
| Peel | Hover, tap or focus | Peel shown as a static corner fold |
| View source | Toggle | Instant switch |

Nothing important autoplays. Heavy islands (map, 3D, timing screen, Discord simulation) load only when their section is reached; their panel shows at once, and the island fills in when ready.

## Constraints

- No scroll hijacking: native scroll speed and position, no smooth-scroll libraries, no pinned sections.
- Every hover, including the peel, has a tap and keyboard equivalent.
- Every section passes contrast in both day and night.
- The privacy trim on routes means nothing depends on a route's exact start or end.

## Anti-goals

- Lando's lime, his helmet shapes, or anything that copies his site's identity.
- Chequered-flag wallpaper, fake sponsors, or car and helmet renders.
- Black as the default ground, or the dark-with-neon dev portfolio look.
- Cards, outlines and divider rules.
- The LED strip anywhere outside the personal-projects section.
- Scroll locking, or autoplay of anything that matters.

## Inspiration (from the brief)

| Site | What we take | Status |
| --- | --- | --- |
| landonorris.com | Playful, cursor-reactive interaction; the On Track / Off Track split. Not its scroll hijacking | Partly verified from write-ups; shaped the peel interaction |
| F1 TV | Timing-screen type, data density, broadcast graphics | Applies to Experience and the map's motorsport layer |
| James Chughh | Map and racetrack idea | **Unverified:** the portfolio itself couldn't be found |
| thonik | Motion language and nav menu interaction | **Unverified:** couldn't be viewed; the nav follows your own description |
| VAP | Loading screen | **Unverified:** couldn't be viewed; the arrival follows your own description |

## Still open

- Deploy target.
- Final typefaces and exact colour values, tuned at build within the contrast rules above.
- Bubble position on mobile: bottom-left or bottom-right.
- Real content still missing: client list with dates, photos with EXIF, 3D-print model, CV, contact details. Use clearly labelled placeholders until it arrives.
- A look at thonik, VAP and James Chughh, if you can share a description or screenshots.

## How this was decided

- **Round 1 (seed 48a2932c):**
  - The roll assigned *Signal Hoist* (signal flags).
  - The alternatives were *Gel Swatchbook* (my pick), *Event Display* (competitive), and declined challengers: Struck Cathode, Pixorama, Indoor Sun, Multiplane Dawn, Painted Poster.
  - You first chose Gel Swatchbook, then asked for a new set of options.
- **Round 2 (re-roll 1):**
  - The roll assigned *Survey Sheet* (topographic map sheet).
  - The alternatives were *Race Livery* (my pick, 1st of seven grounded candidates), *Six-Pack* and *Collective Plate* (both competitive), and declined challengers: Cracktro Scroller, Luminous Understory, Tape J-card, Akari Workshop.
  - **You chose Race Livery.**
- **After choosing:**
  - You moved the LED strip into the personal-projects section only.
  - You resolved the open questions: curated map, timing screen, nav separate from the map, simulated WLED.
  - You set race number 23 and asked for a night variant with navy in the palette.

## Next step

Building the shared system starts the new-work flow: write the direction contract, build the shell (bubble and fan, arrival, peel and view source, recruiter mode, night race, section hand-off), run the finish review, then generate `DESIGN.md` from the result.
