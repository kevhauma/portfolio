# Content gathering

What has to be collected before the stub sheets can be filled with real content, and the decisions behind it (grilling session, 2026-10-13). Fill the answers into [`content-intake.yaml`](content-intake.yaml); this file explains what each part is for.

Rule from PRODUCT.md that governs everything here: **real over generic.** Nothing fake that pretends to be Kevin's. The only invented data is clearly labelled demo data (the Messenger chat and the money-mosaic numbers).

## Launch bar

The site can launch on the **essentials**: intro, experience, projects, contact and recruiter mode. The map, music and workbench may stay as marked stubs until their data arrives.

## Where the data will live

- Hand-written facts go into Astro **content collections** (experience, projects, trips, gigs, prints…), validated by a schema. `content-intake.yaml` is the single intake form that gets split into those collections.
- Anything derived from an export (routes, listening history) goes into a raw `data/` folder that never ships. Build scripts turn it into trimmed, simplified static files. Privacy trimming lives in those scripts and nowhere else.

## Decisions

### Identity and contact
- Full name in recruiter mode, `<title>` and meta; "Kevin" on the livery.
- Contact: an email alias on Kevin's own domain (the domain doesn't exist yet), plus LinkedIn. **Launch waits for the domain**; no interim host subdomain.
- CV: **no CV download at launch**; recruiter mode stands in for it. Later, leaning towards generating it from the same data as recruiter mode.

### Experience: the timing screen (03)
- **One row per project**, with dates to the month. The employer (the consultancy) is the team, and each client project is a sector. A client with two projects gets two sectors.
- **Time columns show real durations only** (e.g. `14 mo`). No invented lap times.
- **Qualifying** is the bachelor, plus an internship or thesis if there was one.
- **Clients under NDA** are anonymised (currently the construction planning client) and never a work highlight.
- **Gaps** between engagements are **written by hand** and shown as **yellow flags**, each with an optional label.
- **Events** are also yellow flags: talks given and meetups **organised**. Events Kevin only attended are left out.
- **Certifications** are **fastest laps**. Several per year are allowed. **Expired ones stay**, greyed and marked expired, so record the expiry date.
- **Years of experience**: the HTML carries the raw start date, and a client-side script turns it into **whole years** (floored). No redeploy needed when a year ticks over.

### Projects (02)
- The page is a **workshop manual on a desk** (decided 2026-10-13; surface brief `.impeccable/surfaces/src-pages-projects-index-astro.md`). `/projects/` is the contents spread; every project has its own page with a wiring diagram drawn from `src/data/projects.ts`.
- **Chapters 1–6**: money-mosaic-v2, Aurubis scrap yard, Aurubis kiosk, ArCom DBA tool, Discord bot (retired; V1 to V3, V3 is the Quackbot repo), CommonGround.
- **Supplement F1–F7, the fuse box**: the other work-experience projects (Clearmedia, publiq, Jumperke, VG Computers, Platform Blog, Platform Planner upgrade, the NDA construction client). Personal side projects are not in the fuse box; they stay on the Workbench shelf.
- **No demos.** No live apps, no demo instance; each project is explained by its wiring diagram.
- **NDA**: the construction client is listed anonymised, with a warning triangle and a Warning box on its page; never a chapter.
- Work project visuals: no client UI. Outcome figures only when they can be sourced and published. No estimates.
- **No GitHub contribution graph.**
- Still to collect: two or three more facts each for Platform Blog, Jumperke and VG Computers (main parts, what talked to what, what Kevin built); CommonGround screenshots and a one-line description.

### The map (04)
- Source of truth: **`Documents/TripMap/trips.gpkg`**. The other GPX folders are not used.
- **Trips are picked by hand**: only larger trips, e.g. the Ardennes and Eifel rides, South England, Westerwald and Japan. No commutes, local loops or driving lessons.
- Privacy: routes are **generalised to about 250 m**, and the first and last stretch is still trimmed (PRODUCT.md). Hand-picking only larger trips keeps home out of the line density.
- **Photos are placed by hand.** The Canon bodies don't record GPS, so nothing is time-matched. The EXIF HUD reads body, lens, aperture, shutter and ISO from the files.
- **Motorsport layer**: both events spectated and track days driven or ridden, tagged accordingly. A best lap only where there's a real timed lap.

### Music (05)
- **Tour dates**: a hand-written list of gigs. Ticket PDFs in `D:\downloads` (Set It Off, Dominum, …) help backfill it. Festivals need a name, dates and place; the acts seen are optional and only shown when filled in.
- **Setlist**: a manual **Last.fm export** (on its way). Top 15–20 tracks of the last 3 months in setlist order, plus an all-time encore of 3. It's a snapshot, refreshed whenever a new export is dropped in.

### Workbench (06)
- **WLED**: a simulation running **Kevin's own presets**, from a `presets.json` backup of the real strip.
- **3D prints**: several prints, cycled by an animated printer. Model, G-code and settings get filled in later.
- **Shelf**: Advent of Code, MessengertoStats, Google Hashcode 2018, the F1-lap-data WLED tracker, and the GPS tool chain as one item that links to the map.
- **Advent of Code**: kept to a minimum, as one line with the **real** star total from adventofcode.com. The repo estimate is about 104 stars (2020: 14, 2021: 7, 2022: 40, 2023: 23, 2024: 20).
- **MessengertoStats**: a **synthetic chat**, clearly labelled, with just enough data for the visuals. No real messages.
- **Google Hashcode 2018**: team **JustGoogleIt**, #113 of 4,852 teams (top 3%), 4th of 186 Belgian teams, 49,200,184 points. Confirmed against Google's archived ranking. Teammates agreed to be credited by first name.

### Intro (01)
- **Seven stack decals**, because the layout is built for exactly 7. They are Kevin's **favourite** technologies, not his most used at work: TypeScript, Node.js, React, Angular, Tailwind, TanStack, ECharts, largest first. Weights step down evenly from 1.0 to 0.4.

## Already found on disk

| What | Where | Notes |
|---|---|---|
| Trip archive (canonical) | `C:\Users\failu\Documents\TripMap\trips.gpkg` | GeoPackage, ~76 MB, 2026-09-28 |
| Other trip copies (not used) | `D:\desktop\node\Samsung S health export\gpx`, `gpx-to-kml\gpx`, `gpxToDb\gpx` | Overlapping GPX, 2018–2026 |
| Photos | `E:\camera\…`, `E:\Spa\2024`, `E:\Westerwald`, Lightroom catalog `E:\LR catalog` | Canon EOS 250D / 2000D, no GPS |
| 3D models | `D:\downloads\Bambu Studio files` | 93 models, 38 print timelapses; mostly unsliced `.3mf` |
| Ticket PDFs | `D:\downloads`, `D:\library\documents` | Backfill for the gig list |
| F1 WLED tracker | `D:\desktop\node\wled-playground`, `f1-tracker` | Shelf candidate |

Not found anywhere: a Last.fm or Spotify export, a Messenger export, a WLED presets backup, or an editable CV.

## Still to get

Exports and files that have to be produced:
- [ ] Last.fm export → `data/lastfm/`
- [ ] WLED `presets.json` from the strip (Config → Security & Updates → Backup presets) → `data/wled/`
- [ ] Lightroom picks per trip, long edge 2400px, EXIF kept → `data/photos/<trip-id>/`
- [ ] The real Advent of Code star total from adventofcode.com
- [ ] G-code and photos for each print (later)

Everything else is typed into `content-intake.yaml`.

## Open items

- **Stack label**: the decals are favourites, not most used, so the intro label "Stack, sized by use" needs new wording.
- **Domain**: none yet. The alias email, deploy target and launch wait on it.
- **CV**: after launch.
- **Prints**: later.
- **Projects desk and pens**: the walnut desk and the pens on the Projects page are drawn in code (procedural texture, vector pens) and read as imitation. Either allow a sourced CC0 walnut photo and pen cut-outs, or keep them as they are.
- **CommonGround or CommonGrounds**: the page uses "CommonGround" (the repo and GitHub org name); the intake key and the Projects brief say "CommonGrounds". Pick one and every source gets aligned.
- **Quackbot years**: Quackbot is the rework of maddiebot, so chapter 5, "Discord bot", covers all three repos as V1 to V3: maddiebotV2 (Apr 2018), maddieBotV3 (Nov–Dec 2018) and Quackbot (May 2021 to the last deploy in Feb 2022). The page shows 2017–2022. 2017 still comes only from the intake, since no repo goes back that far. Confirm the start year.
- **DESIGN.md for Projects**: once the two Projects items above are settled, DESIGN.md gets the Projects page's own look (paper, desk, Archivo) alongside the livery.
