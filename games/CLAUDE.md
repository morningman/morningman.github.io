# Doris Games — Shared Principles

This directory hosts a series of **interactive mini-games**, each designed to teach a specific Apache Doris feature (hybrid search, materialized views, lakehouse, real-time ingestion, etc.) through hands-on play. `hybrid-search/` is the reference implementation — new games should follow the conventions captured here.

## 1. Core goals

Every game in this directory must satisfy **all** of the following:

1. **Feature focus** — one game teaches exactly one Doris feature or scenario. The user should leave with a concrete mental model of *when* and *why* to use it, not just *what* it is.
2. **Playtime 1–2 minutes** — from landing to win screen. If the core loop cannot be completed by a first-time visitor within 2 minutes on mobile, the game is too long. Use pre-computed results, short copy, and linear stage flow to stay within budget.
3. **Guide to next step** — the end state must funnel the user toward a concrete TODO (try it in a sandbox, read the docs page, join Slack, star the repo). A game that entertains but does not convert is a failure.
4. **Mobile-first static site** — no build step, no bundler, no backend. Everything must run by opening `index.html` in a browser and must look and feel native on a phone before it is tuned for desktop.

## 2. Tech stack (required)

| Concern | Choice | Notes |
|---|---|---|
| Hosting | Static files under `games/<game-name>/` | Served directly by GitHub Pages. No server. |
| Framework | React 18 via UMD CDN | Loaded from `unpkg.com`. No npm, no webpack. |
| JSX | Babel Standalone in-browser | `<script type="text/babel">`. Accept the parse cost — these are small pages. |
| Styling | Tailwind CDN + custom tokens | Design tokens declared inline via `tailwind.config`. |
| State | React Context + `useReducer` | Persist to `sessionStorage` under a game-specific key (`doris-<game>-v<N>`). |
| Modules | `window` globals, not ES imports | Each script ends with `Object.assign(window, { ... })`. Load order matters and must be documented in the game's local `CLAUDE.md`. |
| Data | Hardcoded / pre-computed in a `data.js` | Games simulate Doris behavior; they do **not** call a live backend. |

SRI hashes should be kept on all CDN `<script>` tags — see `hybrid-search/index.html` for the pattern.

## 3. Mobile-first rules

- Design every layout at **375 px width first**, then scale up with Tailwind breakpoints.
- Tap targets ≥ 44 × 44 px. Use `cartoon-btn` (see below) as the default — it already meets this.
- Sticky headers: if you add one, set `scroll-margin-top` on anchored sections (hybrid-search uses 56 px).
- No horizontal scroll. `html, body { overflow-x: hidden }` is already baseline.
- Respect `prefers-reduced-motion` — disable all keyframe animations under the media query.
- Test with the browser devtools mobile emulator **and** a real phone before shipping.

## 4. UI style — "cartoon flat with hard ink shadows"

All games share a single visual language. Copy the design tokens and component classes from `hybrid-search/index.html` verbatim unless you have a reason to diverge, and document the divergence.

### Palette

| Token | Hex | Role |
|---|---|---|
| `background` | `#f5efe0` | Page background (warm cream) |
| `ink` / `foreground` / `border` | `#1a1408` | All borders, text, and drop shadows (near-black) |
| `card` | `#ffffff` | Card surfaces |
| `primary` | `#ecd050` | Yellow — primary accent / stage 1 |
| `accent` | `#64c8b4` | Teal — secondary accent / stage 2 |
| `highlight` | `#e86040` | Orange-red — CTAs, completion, urgency |
| `muted` | `#f0e8d4` / `#7a6a54` | Muted surface and text |

Games may re-skin the stage colors (`primary`/`accent`) to match their feature's narrative, but **must keep** `background`, `ink`, `highlight`, and the shadow treatment so the series feels cohesive.

### Typography

- Display: **Fredoka** (500/600/700) — headings, buttons, chips.
- Body: **Nunito** (600/700/800) — paragraphs, labels.
- Mono: **JetBrains Mono** — SQL blocks and code.

Load via Google Fonts `preconnect` + single stylesheet link.

### Signature components

Define these as `@layer components` in `index.html` — don't re-implement per JSX file.

- **`.cartoon-card`** — white surface, 3 px ink border, `1.25rem` radius, **hard offset shadow** `6px 6px 0 0 #1a1408`. No blur. This hard-shadow look is the defining visual.
- **`.cartoon-btn`** — pill-shaped (`rounded-full`), 3 px ink border, 4 px hard shadow, tactile press (`translate` + shadow shrink on `:active`). Variants: `-ghost`, `-accent`, `-highlight`.
- **`.cartoon-chip`** — small pill, 2 px border, 2 px shadow. Used for filters, tags, badges.

Hover = shadow grows by ~1 px and the element nudges up-left. Active = shadow collapses and the element nudges down-right. Disabled = 50% opacity, reduced shadow.

### Motion

Animation reinforces the game's narrative — it is not decoration. Borrow from hybrid-search as needed:

- `drift`, `bob` — idle floating elements
- `pop` — elements entering playfully
- `fadeSlideIn`, `crystallise` — result reveals
- `ctaAttention`, `ctaPulseRing` — draw attention to the primary next action
- `filterFade`, `blockStay` — state transitions inside game mechanics

Keep durations in the 150–600 ms range for UI feedback; longer only for cinematic stage transitions.

## 5. Required outbound links

Every game **must** surface all four links before the user leaves, typically on the win / finish screen and again in a persistent footer:

| Link | URL |
|---|---|
| Doris Website | `https://doris.apache.org` |
| Doris GitHub | `https://github.com/apache/doris` |
| Doris Slack | `https://apache-doris.slack.com` (or current invite link) |
| VeloDB Free Trial | `https://www.velodb.io` |

Guidelines:

- Use the shared `cartoon-btn` / `cartoon-chip` styles, with `highlight` color for the most important CTA (usually the feature-relevant doc page or Free Trial).
- Always `target="_blank" rel="noopener noreferrer"`.
- Pair each link with an icon and a one-line "why click" label ("Try it now", "Star us", "Ask questions", "Spin up free").
- Verify the invite/trial URLs before each game ships — Slack invites in particular expire.

## 6. Structure of a new game

```
games/<game-name>/
├── CLAUDE.md         # Game-specific architecture notes (script load order, non-obvious behaviors)
├── index.html        # Single entry; CDN links + design tokens + script tags
└── game/
    ├── data.js       # Hardcoded data / pre-computed results
    ├── state.js      # Context, reducer, actions, derived selectors
    ├── ui.jsx        # Shared primitives (icons, rows, headers, summaries)
    ├── stages.jsx    # Early stages / intro
    ├── levels.jsx    # Core gameplay stages
    ├── finish.jsx    # Win modal, deep-dive / SQL walkthrough, outbound links
    └── shell.jsx     # Orchestrator — renders current stage full, past stages collapsed
```

Each game's local `CLAUDE.md` should document:

1. The exact **script load order** (it matters — scripts share globals via `window`).
2. Any **non-obvious state behaviors** (e.g. "changing a filter resets levelN-triggered flags").
3. The **session-storage key** used for persistence.
4. Where **pre-computed data** lives and how to extend it (new cities, new queries, etc.).
5. Any custom design tokens that deviate from the shared palette above.

## 7. Content & copy

- Games are pedagogical. Every stage should end with the user understanding one concrete thing they did not understand before.
- Narrate with a scenario (hotel search, fraud detection, dashboard build) — never with raw SQL as the primary hook. Save SQL for a "deep dive" reveal after the win.
- Keep text short. Mobile screens are small and the playtime budget is 1–2 minutes. If a paragraph is longer than a tweet, cut it.
- English is the default language; the user may request translations but the source of truth is English copy.

## 8. Checklist before shipping a new game

- [ ] Completes end-to-end in under 2 minutes on a phone.
- [ ] Renders cleanly at 375 px with no horizontal scroll.
- [ ] Works with `prefers-reduced-motion: reduce`.
- [ ] All four outbound links present, opening in new tabs, verified live.
- [ ] A clear single next-step CTA is visible on the finish screen.
- [ ] Game-local `CLAUDE.md` documents load order and non-obvious behaviors.
- [ ] Opened via `file://` in a fresh browser — no console errors, no missing fonts, no CDN integrity failures.
