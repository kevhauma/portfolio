# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Astro with React islands. Static HTML by default; heavy interactive pieces (MapLibre + deck.gl map, React Three Fiber scenes, the Discord simulation, the race timing screen) hydrate as islands only when their section is reached. Scroll-reactive effects use CSS scroll-driven animations or in-view triggers; section transitions may use the View Transitions API. Kevin builds it himself.

Deploy target: still open.

## Users

- **Recruiters and hiring managers** who need the essentials fast: who Kevin is, what he does, and how much experience he has. Many will skim, and many will be on a phone.
- **Fellow developers** who will poke at every interaction, view source, and judge the craft. For them the site itself is the proof.

The site is a passive showcase that builds reputation. Kevin is not actively job hunting, so it should not push for availability, open-to-work signals or hard conversion.

## Product Purpose

A personal portfolio for Kevin, a frontend developer with a bachelor in applied computer science and 5 years of consultancy experience. It shows frontend craft through the site itself, not through a wall of text. It also brings his life outside work (photography, motorsport, travel, 3D printing, WLED lighting, side projects) into one place, with a map of everywhere he has been as the centrepiece.

Success: a recruiter gets the essentials within seconds (or via recruiter mode), and a developer leaves convinced by what they could touch, inspect and break.

## Positioning

"One person, many interfaces." Each section borrows the interface language of its subject: a code inspector for the intro, a race timing screen for experience, a camera viewfinder for photos, a slicer preview for 3D printing, a map for travel, and a WLED strip for the personal-projects section. His real trip archive, real projects and real hobbies make it something a template portfolio could not honestly copy.

## Operating Context

- Six sections: intro (frontend first), projects, experience, the map (travel, photography, motorsport), 3D printing, and WLED plus side projects.
- **Recruiter mode:** a visible toggle that collapses the site into one fast, plain page with the essentials. It should read as a deliberate, self-aware feature (a pit-lane speed limiter), not an apology.
- **LED strip:** belongs to the WLED / personal-projects section only. It is not a site-wide element (decided 2026-10-12, replacing the brief's original "unifying thread").
- One shared navigation, one type system with per-section accent faces, and one spacing grid across all sections.
- Visitors arrive from links, a CV or GitHub, on desktop and mobile alike.

## Capabilities and Constraints

**Non-negotiable**
- No scroll hijacking: native scroll speed and position, no smooth-scroll libraries, no pinned sections that trap the user. Animations may react to scroll but never control it.
- Interaction is chosen, not forced: rich moments come from hover, drag, click and toggles. Nothing important autoplays out of the visitor's hands, including the map time scrubber.
- Each section has its own visual language within one coherent site.
- Heavy pieces (3D, map, video) load only when their section is reached.
- Every section has a mobile version. Hover interactions need a tap equivalent; map filters and scrubber must work by touch.

**Map**
- MapLibre + deck.gl. Track data comes from Kevin's existing trip archive, simplified and served as static files.
- Route modes: motorcycle, car, bike, walk, plus a motorsport layer (circuits, track days, races).
- Planned features: mode filter chips, hover/click trip details, photos pinned where they were taken, time scrubber, fog-of-war toggle, stats (km per mode, countries, longest trip, most visited region), a timing-screen style when zoomed into a circuit, and a viewfinder treatment with an EXIF HUD for photos.
- Map themes: default light, dark, fog of war, timing-screen mode.
- **Privacy:** the first and last stretch of every route is trimmed so home and work never show. Nothing may depend on routes starting or ending at an exact point.

**Projects** (each gets its own interaction, never a card grid)
- money-mosaic-v2, AdventOfCode, MessengertoStats, Quackbot, Google Hashcode 2018 (#113 worldwide), strava-vue (predecessor of the map). A live GitHub contribution graph may sit in the background.

**Decided (2026-10-12)**
- The map shows a **curated** set of trips, not the complete archive.
- Experience is a **race timing screen** (the metro-map fallback is dropped).
- The map is **not** the main navigation; navigation is its own shared component.
- WLED is a **simulated** LED strip; no live control of the real strip and no webcam.

**Open product decisions**
- Deploy target.

## Brand Commitments

- Personal brand of Kevin; code at [github.com/kevhauma](https://github.com/kevhauma).
- Kevin's race number is **23**.
- Motifs that are part of the concept: motorsport timing-screen language, the pit-lane speed-limiter framing for recruiter mode, and a WLED-style LED strip inside the personal-projects section.
- Example per-section accents from the brief: code-editor green (intro), timing-screen amber (experience), warm sunset tones (map). These are starting suggestions, not a locked palette.

## Evidence on Hand

- Design brief: `Portfolio website — design brief.md`, including its Inspiration table (landonorris.com, F1 TV, James Chughh, thonik, VAP).
- Confirmed design direction (pre-build): `docs/design-direction.md`.
- Public GitHub repos for the listed projects at github.com/kevhauma.
- Google Hashcode 2018 result: #113 worldwide.
- Consultancy clients and projects **may all be named publicly** on the experience timeline, with stack, role and what shipped per client.
- Trip archive exists (format not yet seen in this repo).
- Not yet in the repo, and not to be invented: the client list with dates, photos and their EXIF data, a 3D-print model or toolpath, CV content, contact details, and any testimonials. Use clearly marked placeholders until the real material arrives.

## Product Principles

1. **Show, don't tell.** Every claim about frontend skill should be something the visitor can touch or inspect, not read.
2. **The visitor stays in control.** Native scroll, opt-in interaction, no autoplay of anything that matters. Delight never costs agency.
3. **Every world reads on its own.** A section can borrow any interface language, but its content must be clear to someone who never touches a single interaction.
4. **Essentials are one toggle away.** Recruiter mode is a first-class product, not a fallback. The plain path is always as complete as the rich one for the facts that matter.
5. **Real over generic.** Real trips, real projects, real hardware. Never fake data that pretends to be his.

## Accessibility & Inclusion

- Full support for `prefers-reduced-motion`: every section must define its reduced-motion behaviour.
- Complete keyboard navigation, including the map, scrubbers, the Discord simulation and the view-source inspector.
- Readable contrast inside every section's style, including timing-screen, terminal and fog-of-war looks.
- Tap equivalents for every hover interaction.
