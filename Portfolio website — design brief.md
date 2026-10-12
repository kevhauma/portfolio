# Portfolio website — design brief

Oct 12, 2026 · @Kevin

## Overview

A personal portfolio where every section feels like a different world, held together by one visual thread. It should show frontend craft through the site itself, not through a wall of text.

**Who I am.** Frontend developer first, with a bachelor in applied computer science and 5 years of consultancy experience. Code lives at [github.com/kevhauma](https://github.com/kevhauma). Outside work: photography, motorsport, travel, 3D printing, WLED lighting and side projects.

**Core concept: one person, many interfaces.** Each section borrows the interface language of what it is about: a code inspector, a race timing screen, a camera viewfinder, a slicer preview, a map. Lots of movement and interactive elements, but every section must still read clearly on its own.

**Audience.** Recruiters and hiring managers who need the essentials fast, and fellow developers who will poke at every interaction.

## Principles and constraints

These are non-negotiable and should shape every design decision.

- **No scroll hijacking.** Native scroll speed and position, always. No smooth-scroll libraries, no pinned sections that trap the user. Animations may react to scroll position, but never take control of it.
- **Interaction is chosen, not forced.** The rich moments come from hover, drag, click and toggles the visitor decides to use. Nothing important autoplays out of their hands.
- **Different feel per section, one site.** Each section gets its own visual language, but shared spacing, type scale and navigation keep it coherent.
- **Recruiter mode.** A visible toggle that collapses the site into one fast, plain page with the essentials. It should feel like a deliberate, self-aware feature (think pit-lane speed limiter), not an apology.
- **Accessible motion.** Full support for reduced-motion preferences, keyboard navigation and readable contrast in every section's style.
- **Fast first impression.** Heavy pieces (3D, map, video) load only when their section is reached.

## Unifying thread

A virtual LED strip runs along the edge of the screen through the whole site. It ties the different worlds together and nods to my WLED hobby.

- It doubles as the scroll progress indicator.
- Each section sets its own colour and effect (for example: code-editor green in the intro, timing-screen amber in experience, warm sunset tones on the map).
- Transitions between sections are carried by the strip changing effect, so the jump in visual style feels intentional.
- On mobile it can shrink to a thin bar along the top or side.

Beyond the strip, keep one shared navigation, one type system with per-section accent faces, and a consistent spacing grid.

## Inspiration

Reference sites, each for one specific quality. Borrow that quality only, not the whole site.

| Site | Take from it | Where it applies |
| --- | --- | --- |
| [landonorris.com](https://landonorris.com/) | Playful interactions and motion. **Not** its scroll hijacking, which breaks our first principle. | Site-wide micro-interactions |
| [F1 TV](https://f1tv.formula1.com/) | Race aesthetic: timing-screen type, data density, broadcast graphics | Experience section, motorsport layer on the map |
| [James Chughh on Wall of Portfolios](https://www.wallofportfolios.in/portfolios/james-chughh/) | The map / racetrack idea as a way to move through content | The map, and the open question of whether it doubles as navigation |
| [thonik](https://thonik.nl/) | Overall motion language and the navigation menu interaction | Shared navigation |
| [Menu Animation Concept (Dribbble)](https://dribbble.com/shots/3270114-Menu-Animation-Concept) | The fullscreen menu concept, but angled so the panels fan out like sunrays | Shared navigation (fullscreen menu) |
| [VAP](https://www.wearevap.com/work) | Loading screen | Arrival, leading into the intro's unstyled-HTML moment |

## Sections

The map of everywhere I have been is the centrepiece. The other sections each get their own interface language around it.

### 1. Intro: frontend first

The page starts as raw, unstyled HTML, then the styling visibly loads in and the layout snaps into place, once, on arrival. A "view source" toggle switches the site into an inspector look: hovering any element shows its box model and the component behind it.

### 2. Projects

No grid of cards. Each project gets a small interaction that shows what it does:

| Project | Interaction idea |
| --- | --- |
| money-mosaic-v2 | Tiles assemble into a mosaic when the section enters view |
| AdventOfCode | A real advent calendar grid with doors and earned stars per year |
| MessengertoStats | Chat bubbles drop in and collapse into charts |
| Quackbot | A fake Discord channel where visitors type a command and get a reply |
| Google Hashcode 2018 | A leaderboard that climbs and lands on #113 worldwide |
| strava-vue | Links into the map section as its predecessor |

A live GitHub contribution graph can sit in the background.

### 3. Experience: race timing screen

Career shown as a race weekend. The bachelor is qualifying, each consultancy year is a lap, and each client or project is a sector with its "split": stack, role and what shipped. Styled like an F1 or MotoGP timing screen. Alternative if that gets too gimmicky: a metro map with clients as stations and technologies as lines.

### 4. The map (travel, photography, motorsport)

Years of my trips on one interactive map: motorcycle rides, car drives, bike rides and walks. This is the heart of the site.

- **Mode-coded routes:** motorcycle, car, bike and walk each get their own colour and line style, with filter chips.
- **Trip details:** hovering a route highlights it with date, distance and mode; clicking opens that trip.
- **Photos on the map:** photos are pinned where they were taken, so opening a trip shows its photos. Photography lives here rather than in a separate gallery.
- **Motorsport layer:** circuits, track days and races as their own route type. Zooming into one switches the map styling to the timing-screen look.
- **Time scrubber:** a draggable timeline replays years of travel drawing itself onto the map. User-controlled, never autoplaying.
- **Fog of war toggle:** darkens everything except where I have been.
- **Stats:** total kilometres per mode, countries, longest trip, most visited region.

Photos opened from the map get a viewfinder treatment: focus that follows the cursor or a draggable focus ring, with EXIF data as a camera HUD overlay.

### 5. 3D printing

The section builds itself layer by layer like a slicer preview when it enters view, with a draggable layer scrubber. Optionally a rotatable 3D model of a real print with the nozzle tracing its toolpath.

### 6. WLED and side projects

A real-world button: visitors pick a colour and an actual LED strip in my room changes, with a webcam snapshot as proof. Side projects can sit here as a workbench of smaller items.

## Technical notes

I will build it myself, so designs can be ambitious as long as they respect these limits.

- **Animation:** scroll-reactive effects use CSS scroll-driven animations or in-view triggers, never scroll control. Section transitions can use the View Transitions API.
- **3D:** Three.js / React Three Fiber, used only where 3D adds something (3D printing, maybe the intro).
- **Map:** MapLibre with deck.gl for animated route drawing. Track data comes from my existing trip archive, simplified and served as static files. Design the map styles (light, dark, fog of war, timing-screen mode) as proper map themes.
- **Privacy:** the first and last stretch of every route is trimmed so home and work locations never show. Design should not rely on routes starting at an exact point.
- **Responsive:** every section needs a mobile version. Hover interactions need a tap equivalent; the map needs touch-friendly filters and scrubber.

## Open questions and deliverables

**Still open**

- [ ] Does the map show my complete archive or a curated set of trips?
- [ ] Experience as a race timing screen or as a metro map?
- [ ] Is the map also the main navigation, or a section with a plain nav alongside?
- [ ] Live WLED control: worth the setup, or a simulated strip instead?

**What I need from the designer**

- [ ] A shared design system: type, spacing grid, navigation, LED strip behaviour per section
- [ ] Desktop and mobile designs for each of the six sections
- [ ] Map themes: default light and dark, fog of war, timing-screen mode
- [ ] Motion notes per section: what triggers each animation and how it behaves with reduced motion
- [ ] Recruiter mode layout
