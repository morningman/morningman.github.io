# Hybrid Search Game

An interactive demo game teaching Apache Doris Hybrid Search via a hotel-booking scenario. Runs as a single `index.html` — no build step, no bundler. React 18 + Babel (in-browser JSX) + Tailwind CDN.

## Architecture

### Script loading order — MUST NOT change

```
data.js → state.js → ui.jsx → stages.jsx → levels.jsx → finish.jsx → shell.jsx
```

Each file depends on globals exposed by the files before it. Break the order and the page errors silently.

### Cross-file globals

Every file ends with `Object.assign(window, { ... })`. All components and utilities live on `window` — there are no imports. When adding a new component, export it the same way.

### State management

Single React Context + `useReducer` in `state.js`. Stage flow is linear:

```
intro → level1 → level2 → level3 → finish → deepdive
```

`GO_TO_STAGE` can jump to any stage, but `SET_CITY/SET_CHECKIN/SET_BUDGET` always reset `level2Triggered`, `level3Fused`, and `hasWon` — changing a filter restarts the search pipeline.

State is persisted to `sessionStorage` under key `doris-hybrid-search-v2`.

### Search results are pre-computed

There is no real search. `STAGE_RESULTS` in `data.js` contains hardcoded BM25 / ANN / RRF results for all 6 city+budget combinations. Queries in Level 2–3 are visual-only. If you need to change what results appear, edit `STAGE_RESULTS` directly.

## Key files

| File | Responsibility |
|---|---|
| `data.js` | Hotel pool (30 records), pre-computed results, filter combinations |
| `state.js` | Context, reducer, actions, `computeConfidence`, `scrollToStage` |
| `ui.jsx` | Shared components: `Icon`, `HotelRow`, `LevelHeader`, `StageSummary`, confidence bars |
| `stages.jsx` | `Intro` + `Level1` (structured filter + animated data pool) |
| `levels.jsx` | `Level2` (parallel recall) + `Level3` (RRF fusion) |
| `finish.jsx` | `Finish`, `WinModal`, `DeepDive` (5-screen SQL walkthrough) |
| `shell.jsx` | `GameShell` — renders current stage in full, past stages as collapsed summaries |

## Non-obvious behaviors

- **`DataPool` animation** uses a three-phase state (`idle → phase1 → phase2 → done`) driven by `setTimeout` refs. Clearing the timers on unmount is intentional — don't remove the cleanup.
- **`Level2` staggered reveal** is tied to `state.level2Triggered`. Toggling a filter resets this flag, which re-hides the channel results. This is by design.
- **`DeepDive` screen 2 SQL** is the only dynamic SQL — it uses the user's actual `city`, `checkIn`, `budget` selections. All other screens use static strings.
- **`scrollToStage`** offsets by 56 px to clear the mobile sticky header. Change the offset if the header height changes.
- **Confidence thresholds**: 3 filters selected = 50%, level2 triggered = 72%, level3 fused = 100%. These are in `computeConfidence` in `state.js`.

## Adding content

**New city**: update `HOTEL_POOL` (add 10 hotels), `STAGE_RESULTS` (add `{city}-mid` and `{city}-high` keys), `CITIES` array, and the city-abbreviation mapping in `getStageResults`.

**New DeepDive screen**: add an entry to `DD_SCREENS` in `finish.jsx`. If the SQL needs user context, use the `ctx => \`...\`` function form.

## Design tokens (index.html)

| Token | Color | Game meaning |
|---|---|---|
| `primary` (#ecd050) | Yellow | Level 1 / Text channel |
| `accent` (#64c8b4) | Teal | Level 2 / Semantic channel |
| `highlight` (#e86040) | Orange-red | Level 3 / completion / primary CTAs |
| `ink` (#1a1408) | Near-black | All borders and drop shadows |
| `background` (#f5efe0) | Warm cream | Page background |

All cartoon card/button/chip styles are defined as `@layer components` in `index.html`. Edit there, not in individual JSX files.
