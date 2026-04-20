# JSON War — Game Design Document

## 1. Overview

| Field | Value |
|---|---|
| **Game Name** | JSON War |
| **Type** | Vertical scrolling shooter |
| **Platform** | Single `index.html`, no build step, no bundler |
| **Tech Stack** | React 18 (UMD CDN) + Babel Standalone (in-browser JSX) + Tailwind CDN |
| **Target Audience** | North American users, English only |
| **Total Playtime** | 1–2 minutes end-to-end |

**Core Loop**: Watch attack animation → Understand why it failed → Receive skill upgrade → Attack again and win → Learn the Doris feature behind it → Proceed to next level.

---

## 2. Visual Style

**Cartoon flat with hard ink shadows** — identical to `hybrid-search`.

| Token | Hex | Role |
|---|---|---|
| `background` | `#f5efe0` | Page background (warm cream) |
| `ink` / `foreground` / `border` | `#1a1408` | All borders, text, drop shadows (near-black) |
| `card` | `#ffffff` | Card surfaces |
| `primary` | `#ecd050` | Yellow — primary accent |
| `accent` | `#64c8b4` | Teal — secondary accent |
| `highlight` | `#e86040` | Orange-red — CTAs, completion, urgency |
| `muted` | `#f0e8d4` / `#7a6a54` | Muted surface and text |

**Typography**:
- Display / Buttons / Chips: **Fredoka** (500/600/700)
- Body / Labels: **Nunito** (600/700/800)
- Code / SQL: **JetBrains Mono**

**Signature components** (defined as `@layer components` in `index.html`):
- `.cartoon-card` — white surface, 3px ink border, 1.25rem radius, `6px 6px 0 0 #1a1408` hard offset shadow
- `.cartoon-btn` — pill-shaped (`rounded-full`), 3px ink border, 4px hard shadow, tactile press on `:active`
- `.cartoon-chip` — small pill, 2px border, 2px shadow

**Motion**: All durations in 150–600ms range for UI feedback. Honor `prefers-reduced-motion`.

---

## 3. Game Flow

```
[Opening Crawl] → [Level 1] → [Level 2] → [Level 3] → [Level 4] → [Level 5] → [Victory Celebration] → [Settlement Page] → [DeepDive]
```

### Per-Level Flow

```
1. Player clicks ATTACK
   → Attack animation plays (bullet hits Boss)
   → Boss HP -1 per hit
   → After N hits (defined per level), Boss retaliates
   → Player ship retreats to HANGAR (not destroyed)

2. Player clicks UPGRADE (inside HANGAR)
   → Skill acquired animation plays
   → Ship equipped with new weapon

3. Player clicks ATTACK again
   → Ship launches, attacks with new weapon
   → Boss HP -N per hit (much faster kill)
   → Boss defeated → Boss explosion animation

4. Victory Modal appears
   → Level cleared message
   → Skill acquired confirmation
   → Tech Insight (Challenge + Solution)
   → [NEXT LEVEL] button
```

### Level 5 Special Flow

```
... (same steps 1–4) ...

4. Boss defeated → Victory celebration animation (stars/confetti burst)

5. Settlement Page (not just a modal — full screen)
   → Congratulates player
   → Lists all 5 mastered skills
   → [SEE HOW DORIS DID IT] primary CTA → DeepDive
   → [PLAY AGAIN] secondary CTA
```

---

## 4. Level Design

### Level 1 — JSON Giant

| Field | Value |
|---|---|
| **BOSS** | JSON Giant |
| **Boss HP** | 99 (normal) / 3 (upgraded) |
| **Normal Attack Damage** | -1 HP per hit. After 3 volleys (3 shots each = 9 total hits = -9 HP), Boss retaliates — player retreats. |
| **Normal Attack** | Single slow bullet, weak, damage -1 per hit |
| **Upgrade** | Subcolumn Extraction (高速机炮 = high-speed machine gun) — rapid-fire, 3 volleys to kill |
| **Upgraded Attack** | Rapid-fire burst, 3 volleys of 3 shots = 99 HP total, 3 volleys defeats Boss |
| **Defeat Reason** | Shown on hangar after retreat: *"JSON payload is too large — every parse takes forever."* Sets up the Subcolumn Extraction reveal. |
| **BOSS Attack** | Giant missile from chest, downward trajectory, explosion on player |
| **对应特性** | Subcolumn Extraction |

### Level 2 — Inflation Beast

| Field | Value |
|---|---|
| **BOSS** | Inflation Beast |
| **Boss HP** | 99 (initial) — increases by +33 each time Boss is hit (up to 198 at 3 hits without lock) |
| **Normal Attack Damage** | -33 HP per hit, but Boss grows larger (HP increases by 33). After 3 hits Boss becomes too large to defeat. Player retreats. |
| **Upgrade** | Schema Lock (模板锁) — freezes Boss size |
| **Upgraded Attack** | Boss frozen at 99 HP, 3 hits = 99 HP total = 3 volleys defeats Boss |
| **BOSS Attack** | Shockwave ring expands from center, pushes player away |
| **对应特性** | Schema Template |

### Level 3 — Invisible Phantom

| Field | Value |
|---|---|
| **BOSS** | Invisible Phantom |
| **Boss HP** | 99 |
| **Normal Attack Hit Rate** | 30% (7 shots per volley, ~2 hits per volley). After 3 volleys (~6 total hits = -6 HP), Boss retaliates — player retreats. |
| **Upgrade** | Index Vision (索引之眼) — reveals true form, 100% hit rate |
| **Upgraded Attack** | 100% hit rate, 3 volleys × 33 = 99 HP = 3 volleys defeats Boss |
| **BOSS Attack** | Shadow slash from above, player cannot dodge |
| **对应特性** | Index Support (BloomFilter + Inverted Index) |

### Level 4 — Shapeshifter

| Field | Value |
|---|---|
| **BOSS** | Shapeshifter |
| **Boss HP** | 99 |
| **Normal Attack** | 67% chance of being blocked per hit (Boss changes form on contact). After 3 blocked attacks, Boss retaliates. |
| **Upgrade** | Type Anchor (类型锚) — locks current form, no blocking |
| **Upgraded Attack** | All hits register, 3 volleys × 33 = 99 HP = 3 volleys defeats Boss |
| **BOSS Attack** | Current form charges at player (dash attack) |
| **对应特性** | Type Promotion (automatic JSONB upgrade) |

### Level 5 — Element Legion

| Field | Value |
|---|---|
| **BOSS** | Element Legion (9 small mechs in 3×3 grid) |
| **Individual Unit HP** | 11 HP each (9 × 11 = 99 total) |
| **Normal Attack** | Targets one unit at a time. After 3 kills, remaining units swarm-attack. Player retreats. |
| **Upgrade** | Gather Into One (化零为整) — DOC Mode AOE |
| **Upgraded Attack** | AOE wave hits all 9 units simultaneously, 9 × 11 = 99 HP, instant kill |
| **BOSS Attack** | All 9 units fire laser beams simultaneously, focused on player |
| **对应特性** | DOC Mode (full-document storage, SELECT * without re-assembly) |

---

## 5. Boss Character Designs

All bosses are **mech-style机甲** with **cartoon flat hard-ink shadow** aesthetic.

### BOSS 1: JSON Giant

**Shape**: Massive humanoid mech built from stacked rectangular blocks (each block = a JSON field). Chaotic but imposing. Chest has a prominent `{ }` symbol.

**Colors**: Dark gray `#4a4a4a` (body), `#64c8b4` (data-stream glow), `#e86040` (glowing eyes)

**Details**:
- Blocks vary in size, some appear to be "swelling"
- Arms are thick, covered in field-name patterns
- Hard edge 6px dark shadow throughout
- Idle animation: subtle block vibration (data instability)

---

### BOSS 2: Inflation Beast

**Shape**: Spherical balloon-like mech. Body consists of concentric rings. After each hit, one more ring expands outward.

**Colors**: `#f5efe0` (inflated outer skin), `#ecd050` (expansion rings), `#e86040` (danger core)

**Details**:
- Surface covered in column labels (col_001, col_002...) like scales
- Cracks appear when over-inflated
- Mix of hard edges (core) and soft curves (inflated rings)
- Idle animation: slow pulse / breathing effect

---

### BOSS 3: Invisible Phantom

**Shape**: Tall humanoid mech, semi-transparent and flickering. Edges shimmer and抖动. Appears holographic.

**Colors**: `#64c8b4` at full opacity (visible) / 30% opacity (cloaked), `#ecd050` (edge shimmer), `#e86040` (eyes when visible)

**Details**:
- Made of overlapping translucent geometric shapes
- Briefly solidifies when hit, then resumes flickering
- Surrounding "scan lines" effect
- Occasionally fully invisible except glowing eyes
- Hard shadow still visible at 30% opacity for depth

---

### BOSS 4: Shapeshifter

**Shape**: Polymorphic mech cycling through 3 fixed forms:

1. **Sword Form** — Tall and lean, dual blades raised, offensive pose
2. **Shield Form** — Short and stocky, heavy armor plating, defensive crouch
3. **Ball Form** — Rolled into a spiked sphere, rolling attack posture

**Colors** (consistent across forms): `#7a6a54` (base metal), `#ecd050` (energy lines), `#e86040` (warning accents)

**Details**:
- Transition animation: form dissolves into particles → new form materializes
- Each form has a distinct silhouette for readability
- Energy lines pulse differently per form
- Idle animation: cycling through forms every 2 seconds

---

### BOSS 5: Element Legion

**Shape**: **Not one boss — a swarm of 9 small independent mechs** in a 3×3 grid. Each small mech is a "sub-column." A golden control node at center links them all.

**Colors**: `#64c8b4` (team color), each small mech has a distinct element hue (blue/green/purple/orange...), `#ecd050` (central control node)

**Details**:
- 9 small mechs with individual HP bars (rendered as tiny pips above each)
- Central node pulses gold when all alive
- When 6+ are destroyed, remaining mechs frenzy (shake animation)
- Small mechs have simple shapes (hexagonal bodies, single eye)
- Hard shadows on each unit

---

### Player Ship — DATA SCOUT

**Unified Silhouette**: Arrowhead/triangle main body pointing upward, symmetrical wings, glowing engine at tail. Consistent shape throughout all 5 levels — only weapon loadout changes.

**Color Progression** (by weapon upgrade):

| Level | Primary Color | Engine Glow | Weapon Effect |
|---|---|---|---|
| 1 initial | Gray `#7a6a54` | Dim white | Single slow bullet |
| 1 upgraded | Gray | Bright white | Yellow rapid-fire bullets |
| 2 upgraded | Gray | Teal `#64c8b4` | Cyan homing missiles + lock-on ring |
| 3 upgraded | Dark gray | Cyan X-scan | Cyan透视射线, reveals invisible Boss |
| 4 upgraded | Dark gray | Orange `#ecd050` | Orange armor-piercing shots |
| 5 upgraded | Dark gray | Gold `#ecd050` | Gold AOE shockwave |

---

### Boss Attack Animations

| Boss | Attack Name | Visual Description |
|---|---|---|
| JSON Giant | Giant Missile | Large missile launches from Boss's chest, travels downward toward player, explodes on impact |
| Inflation Beast | Shockwave | Energy ring expands outward from center, pushes player ship away with screen shake |
| Invisible Phantom | Shadow Slash | Transparent blade slices down from above, player cannot dodge |
| Shapeshifter | Charge | Current form charges/dashes toward player position |
| Element Legion | Cluster Barrage | All 9 units fire simultaneous laser beams that converge on player |

---

## 6. Opening Screen

**Style**: Simple fade-in intro over a starfield — no Star Wars perspective crawl. Warm cream/gold palette (`text-primary`) on `bg-space` background, with a subtle horizontal scanline overlay for a retro terminal feel.

**Layout** (centered column, mobile-first):

```
                    ⚠  DATA ANOMALY DETECTED  ⚠        ← highlight, 11px uppercase

                              JSON War                   ← h1, 4xl / sm:5xl

                  A massive surge of malformed JSON
                    has overrun the data center.         ← text-lg / sm:xl, italic

                           Column Explosion
                            Sparse Columns
                        Schema Controllability
                       Schema & Type Evolution
                              Indexing                   ← vertical list, 11px uppercase

                            Your mission:
                        engage and restore order.        ← text-lg / sm:xl, semibold


                         [ 🚀  Start Mission ]           ← cartoon-btn-highlight, uppercase
```

**Fade timing** (see `stages.jsx` constants):

| Constant | Value | Role |
|---|---|---|
| `INTRO_FADE_IN_DELAY_MS` | 200 | Intro copy begins fading in |
| `START_FADE_IN_DELAY_MS` | 1400 | Start Mission button fades in |
| `FADE_DURATION_MS` | 500 | Shared opacity transition duration |
| `EXIT_STAGGER_MS` | 500 | Gap between intro fade-out and button fade-out on click |

**Exit sequence** (on Start Mission click):

1. `t=0` — intro copy opacity → 0 (500ms fade)
2. `t=500ms` — button opacity → 0 (500ms fade)
3. `t=1000ms` — navigate to `level-intro` (BossIntro)

The button is disabled until its fade-in completes and is guarded by a `starting` flag to prevent double-taps during the exit animation. No skip button — the fade-in itself is under 2 seconds.

**Background**: Shared `Starfield` component (60 random stars, `pop` keyframe twinkle) + horizontal scanline overlay at 30% opacity. The same `Starfield` is reused on the Boss Intro and in-battle scenes so space is the game's consistent setting.

---

## 7. UI Layout

### Background

All in-game stages (Opening Screen, Boss Intro, and every Level's battle scene) share the `bg-space` starfield background — no cream page background inside the game loop. Battle content layers above Starfield via `relative z-10` wrappers. Text on this background uses `text-primary` (yellow) or `text-primary/70` for secondary copy rather than `text-muted-foreground`, which does not read on dark.

### Main Game Screen (per level)

```
┌──────────────────────────────────────┐
│ Level 1/5          JSON Giant  99HP  │  ← Top HUD bar
├──────────────────────────────────────┤
│                                      │
│            [BOSS MECHS]              │  ← Boss area (upper third)
│         [████████░░] 99/100          │  ← Boss HP bar + numbers
│                                      │
│         ~ battle effects zone ~      │  ← Mid: bullet paths, hit FX
│              ↑ bullets ↑             │
│                                      │
├──────────────────────────────────────┤
│                                      │
│  ┌────────────────────────────────┐ │
│  │          HANGAR                 │ │  ← Shown after player retreats
│  │       [ ⬆ UPGRADE ]            │ │  ← Upgrade button inside hangar
│  └────────────────────────────────┘ │
│                                      │
│             ✈ PLAYER SHIP           │  ← Ship in hangar or deployed
│                                      │
│      [ ⚔ ATTACK ]                   │  ← Primary action button
└──────────────────────────────────────┘
```

### Top HUD Bar

- Left: Level indicator (`Level 1/5`)
- Center: Boss name
- Right: Boss HP with number (`99HP`)
- Style: Semi-transparent dark bar, Fredoka bold text

### Boss HP Display

- HP bar: filled portion (`#e86040`), empty portion (`#4a4a4a`)
- Number overlay: `current / max` (e.g., `67/100`)
- Shake animation on hit

### Hangar

- Appears after player is retreated
- Contains UPGRADE button
- Ship is shown docked inside
- **Defeat reason banner** appears below the hangar once docked — a `cartoon-card` with a highlight-bordered `!` badge, label "Why You Lost" in highlight tracking, and a single-sentence failure explanation (see per-level spec). Fades in via `animate-fade-slide-in`. Teaches the *why* before offering the skill that fixes it.

### Buttons

- `ATTACK`: highlight color (`#e86040`), full width, large (h-14), hard shadow
- `UPGRADE`: accent color (`#64c8b4`), appears inside hangar after retreat

---

## 8. Victory Modal (Levels 1–4)

```
┌─────────────────────────────────────┐
│  ★  LEVEL CLEARED                   │
│                                     │
│  JSON Giant has been defeated!       │
│  Skill acquired: Subcolumn Extraction │
│                                     │
│  📖 TECH INSIGHT                    │
│  ─────────────────                  │
│  Challenge:                         │
│  Traditional JSON storage requires  │
│  parsing the entire string for each  │
│  query — extremely slow.            │
│                                     │
│  Solution:                          │
│  Subcolumn Extraction stores each    │
│  JSON field as an independent       │
│  column. Only the needed columns    │
│  are read —列存性能.                │
│                                     │
│  [ NEXT LEVEL → ]                   │
└─────────────────────────────────────┘
```

---

## 9. Settlement Page (After Level 5)

Full-screen page (not a modal).

```
┌─────────────────────────────────────┐
│                                     │
│        ★  JSON ANOMALY              │
│           NEUTRALIZED  ★            │
│                                     │
│  All 5 bosses have been defeated.   │
│  The data center is now secure.     │
│                                     │
│  Skills Mastered:                   │
│  ✓ Subcolumn Extraction            │
│  ✓ Schema Lock                     │
│  ✓ Index Vision                    │
│  ✓ Type Anchor                     │
│  ✓ DOC Mode                        │
│                                     │
│  [SEE HOW DORIS DID IT]            │  ← Primary CTA, highlight color
│                                     │
│  [ PLAY AGAIN ]                    │  ← Secondary CTA, ghost style
│                                     │
└─────────────────────────────────────┘
```

---

## 10. Tech Insight Content (per level)

### Level 1 — Subcolumn Extraction

| Field | Content |
|---|---|
| **Challenge** | Traditional JSON storage parses the entire string per query — one field request reads everything. |
| **Solution** | Subcolumn Extraction stores each JSON field as an independent column. Queries only read needed columns — columnar performance. |

### Level 2 — Schema Template

| Field | Content |
|---|---|
| **Challenge** | Unrestricted subcolumn extraction leads to column explosion — hundreds of columns, storage and query overhead. |
| **Solution** | Schema Template applies type constraints to specific paths (e.g., `$.price` → DECIMAL). Unconstrained paths remain flexible. |

### Level 3 — Index Support

| Field | Content |
|---|---|
| **Challenge** | Without indexes, queries must scan every row. Even a simple `WHERE` becomes a full-table scan. |
| **Solution** | Doris supports BloomFilter (equality filtering) and Inverted Index (full-text search) directly on VARIANT columns. |

### Level 4 — Type Promotion

| Field | Content |
|---|---|
| **Challenge** | The same JSON path can hold different types across records (e.g., `$.status` is INT in one row, STRING in another). Analyzing this requires expensive runtime type checks. |
| **Solution** | Type Promotion automatically upgrades incompatible types to JSONB, eliminating type uncertainty and runtime casting overhead. |

### Level 5 — DOC Mode

| Field | Content |
|---|---|
| **Challenge** | With Subcolumn Extraction, `SELECT *` must re-assemble the full JSON from individual columns — slow for wide rows. |
| **Solution** | DOC Mode stores the complete JSON document alongside subcolumns. `SELECT *` returns the pre-stored document directly, no re-assembly needed. |

---

## 11. DeepDive Section

**Entry**: Settlement page → "SEE HOW DORIS DID IT" button

**Structure**: 5 screens, one per Doris feature, using a unified dataset (API Access Logs).

### Shared Dataset: API Access Logs

```sql
CREATE TABLE api_logs (
    request_id  VARCHAR(32),
    user_id     VARCHAR(32),
    timestamp   DATETIME,
    url         VARCHAR(256),
    status_code INT,
    duration_ms INT,
    metadata    VARIANT
);
```

### DeepDive Screens

| Screen | Title | SQL Focus |
|---|---|---|
| 1 | Subcolumn Extraction | `SELECT metadata['geo']['city'], COUNT(*) ... GROUP BY` |
| 2 | Schema Template | `CREATE TABLE ... metadata VARIANT< '$.geo.lat': FLOAT, '$.device.type': STRING >` |
| 3 | Index Support | `INDEX idx_status(status_code) USING INVERTED` |
| 4 | Type Promotion | Demonstrate INT → JSONB automatic promotion |
| 5 | DOC Mode | `CREATE TABLE ...` with DOC mode + `SELECT *` returns full JSON directly |

### Screen Structure (per screen)

```
[Screen indicator dots: ●○○○○]
[Title]
[Subtitle]
[SQL code block] — syntax highlighted, JetBrains Mono
[Diagram] — visual explanation of the concept
[Bullet points: 2 key takeaways]
[Prev / Next navigation]
```

### External Links Dock (at bottom of DeepDive)

| Link | URL | Style |
|---|---|---|
| Apache Doris Download | `https://doris.apache.org/download` | Card style, primary |
| VeloDB Free Trial | `https://velodb.cloud/signup` | Highlight (orange-red) CTA |
| GitHub | `https://github.com/apache/doris` | Primary yellow |
| Doris Slack | `https://doris.apache.org/slack` | Accent teal |

---

## 12. File Structure

```
games/json-processing/
├── CLAUDE.md           # Architecture notes (load order, state behavior)
├── DESIGN.md           # This document
├── index.html          # Entry point: CDN links + design tokens + script tags
└── game/
    ├── data.js         # Hardcoded boss data, HP values, attack results, pre-computed outcomes
    ├── state.js        # Context, reducer, actions, scrollToStage
    ├── ui.jsx          # Shared: Icon, BossHPBar, DamagePopup, Hangar, buttons
    ├── stages.jsx      # OpeningCrawl, LevelIntro (before each boss)
    ├── levels.jsx      # Level1–Level5 (full boss fight logic)
    ├── finish.jsx      # VictoryModal (per-level), SettlementPage (post-level-5), DeepDive
    └── shell.jsx       # GameShell — renders current stage, past stages as summaries
```

**Script load order** (must not change):

```
data.js → state.js → ui.jsx → stages.jsx → levels.jsx → finish.jsx → shell.jsx
```

---

## 13. Checklist Before Ship

- [ ] Completes end-to-end in under 2 minutes on a phone
- [ ] Renders at 375px with no horizontal scroll
- [ ] Works with `prefers-reduced-motion: reduce`
- [ ] All 4 outbound links present, verified live, `target="_blank"`
- [ ] Opening Crawl renders correctly with Star Wars perspective effect
- [ ] All 5 BOSSes visually distinct and recognizable
- [ ] Each level's upgrade is visually communicated (ship weapon change)
- [ ] Tech Insight appears on every victory modal
- [ ] DeepDive accessible from settlement page, SQL verified accurate
- [ ] Session storage key: `doris-json-war-v1`
- [ ] No console errors when opened via `file://`

---

## 14. Animation Specifications

All durations in the 150–600ms range for UI feedback unless noted. Honor `prefers-reduced-motion: reduce` by disabling keyframe animations under that media query.

### Core Combat Animations

| Animation | Duration | Easing | Notes |
|---|---|---|---|
| Bullet flight (player → Boss) | 400ms | ease-out | |
| Hit flash on Boss | 150ms | ease-out | Boss sprite flashes white |
| Damage popup appear | 0ms | — | Immediately on hit |
| Damage popup duration | 600ms | — | Visible before fading |
| Damage popup fade-out | 200ms | ease-in | + 20px upward drift |
| Boss shake on hit | 150ms | ease-out | |
| Boss attack flight (toward player) | 500ms | ease-in | |
| Player retreat (battle → hangar) | 800ms | ease-in-out | |
| Ship launch (hangar → battle) | 600ms | ease-out | |

### Skill Acquisition / Upgrade Animations

| Animation | Duration | Easing | Notes |
|---|---|---|---|
| Upgrade button pulse (idle) | 1500ms | — | scale 1↔1.05, loop |
| Upgrade acquisition sequence | 1000ms | ease-out | Weapon swap effect on ship |
| Skill popup in victory modal | 500ms | ease-out | Slide in from right |

### Boss Defeat Animations

| Animation | Duration | Easing | Notes |
|---|---|---|---|
| Boss explosion (all levels) | 800ms | ease-out | Scale up + fade out |
| Level 5 victory celebration | 2000ms | — | Stars/confetti burst particles |

### UI Animations

| Animation | Duration | Easing | Notes |
|---|---|---|---|
| Victory modal appear | 300ms | ease-out | |
| DeepDive screen transition | 300ms | ease-out | |
| Screen indicator dot (active) | 200ms | ease-out | Color change |
| START button pulse (crawl end) | 1500ms | — | scale 1↔1.05, loop |
| START button fade-in | 500ms | ease-out | After crawl completes |
| Damage number pop | 150ms | ease-out | scale 0→1.2→1 on appear |

### Damage Number Specification

| Property | Value |
|---|---|
| Color | `#e86040` (highlight orange-red) |
| Font | Fredoka Bold, 24px |
| Position | Centered above Boss sprite |
| Appear animation | scale 0→1.2→1 (pop), fade in simultaneously |
| Float animation | 20px upward drift while fading |
| Multi-hit display | Single combined number (e.g., "-33") not per-bullet |

---

## 15. Level Transition & Boss Intro Specification

### Per-Level Boss Intro (before each level begins)

After the Opening Crawl (Level 1) or after the previous level's victory modal (Levels 2–5), display a brief Boss intro screen:

```
┌──────────────────────────────────────────┐
│                                          │
│         [BOSS SILHOUETTE]                │
│         (dramatic lighting)              │
│                                          │
│         INFLATION BEAST                  │  ← Typewriter effect
│                                          │
│         "It keeps growing..."            │  ← Flavor text, 2s display
│                                          │
│         [TAP TO CONTINUE]                │  ← Fades in after 1.5s
│                                          │
└──────────────────────────────────────────┘
```

- Boss silhouette uses dramatic top-lighting
- Text appears with typewriter effect (50ms per character)
- Flavor text is italicized, muted color
- "TAP TO CONTINUE" pulses, disappears on tap or auto-advances after 2s

### Flavor Text per Boss

| Level | Boss | Flavor Text |
|---|---|---|
| 1 | JSON Giant | "A mountain of unparsed data..." |
| 2 | Inflation Beast | "It grows with every hit..." |
| 3 | Invisible Phantom | "You can't hit what you can't see..." |
| 4 | Shapeshifter | "Formless. Unpredictable..." |
| 5 | Element Legion | "Nine minds, one swarm..." |

### Level Transition (between levels)

```
Level N victory modal closed
  → Black screen 300ms
  → Boss intro screen (described above)
  → 300ms fade into Level N+1 battle scene
```

---

## 16. Session Storage Schema

Key: `doris-json-war-v1`

```javascript
{
  currentLevel: 1,           // Current level being played (1–5)
  highestLevel: 1,           // Highest level reached (for "continue" option)
  unlockedSkills: [],        // List of acquired skills
                              // Values: 'subcolumn-extraction', 'schema-lock',
                              //          'index-vision', 'type-anchor', 'doc-mode'
  levelStates: {
    1: { defeated: false },
    2: { defeated: false },
    3: { defeated: false },
    4: { defeated: false },
    5: { defeated: false }
  }
}
```

**Load behavior**:
- On fresh start: all fields default, `currentLevel: 1`
- On page reload: resume from `highestLevel` (show "Continue" button on start screen)
- "PLAY AGAIN": wipe sessionStorage, restart from Level 1

---

## 17. DeepDive Screen Diagrams

Each DeepDive screen includes a conceptual diagram illustrating the Doris feature.

### Screen 1 — Subcolumn Extraction Diagram

```
┌──────────────────────────────────────────────────┐
│                                                  │
│   ┌───────────────────┐    ┌──────────────────┐  │
│   │ {                 │    │  SUB-COLUMNS    │  │
│   │   "geo": {        │    ├──────────────────┤  │
│   │     "city": "NYC" │ →  │  geo.city   VARCHAR │  │
│   │     "lat": 40.7   │    │  geo.lat    FLOAT   │  │
│   │   },              │    │  device.type VARCHAR │  │
│   │   "device": {     │    │  ...              │  │
│   │     "type": "mob" │    └──────────────────┘  │
│   │   }               │                          │
│   └───────────────────┘                         │
│      JSON document            Columnar storage    │
│                                                  │
└──────────────────────────────────────────────────┘
```

### Screen 2 — Schema Template Diagram

```
┌──────────────────────────────────────────────────┐
│                                                  │
│   VARIANT metadata<                              │
│     '$.geo.lat'    : FLOAT,   ← constrained     │
│     '$.device.type': STRING,  ← constrained     │
│     '$.tags*'       : TEXT,    ← wildcard (flex) │
│   >                                        │
│                                                  │
│   ✓ Explicit types  ✓ Wildcard for unknown paths │
│                                                  │
└──────────────────────────────────────────────────┘
```

### Screen 3 — Index Support Diagram

```
┌──────────────────────────────────────────────────┐
│                                                  │
│   Without Index:    Full table scan ═══► 1M rows │
│                                                  │
│   With Inverted Index:                          │
│   ┌────────────────────────────────────────┐     │
│   │  term: "error" → [row1, row5, row9]   │     │
│   │  term: "login" → [row3, row7]         │     │
│   │  term: "timeout"→ [row2, row4]        │     │
│   └────────────────────────────────────────┘     │
│                     ↓                            │
│              Direct lookup = fast               │
│                                                  │
└──────────────────────────────────────────────────┘
```

### Screen 4 — Type Promotion Diagram

```
┌──────────────────────────────────────────────────┐
│                                                  │
│   Row 1: metadata['status'] = 200    (INT)       │
│   Row 2: metadata['status'] = "OK"   (STRING)   │
│   Row 3: metadata['status'] = true   (BOOLEAN)  │
│                                                  │
│   ── Type Promotion ──►                         │
│                                                  │
│   Row 1: 200   → JSONB  ✓                        │
│   Row 2: "OK"  → JSONB  ✓ (upgraded)             │
│   Row 3: true  → JSONB  ✓ (upgraded)             │
│                                                  │
│   Result: All same type. No runtime casting.      │
│                                                  │
└──────────────────────────────────────────────────┘
```

### Screen 5 — DOC Mode Diagram

```
┌────────────────────────────┬────────────────────────────┐
│   WITHOUT DOC MODE         │     WITH DOC MODE          │
├────────────────────────────┼────────────────────────────┤
│                            │                            │
│  col_1   col_2   col_3    │  col_1   col_2   doc        │
│  ─────   ─────   ─────     │  ─────   ─────   ──────     │
│  [ AAA ] [ BBB ] [ CCC ]   │  [ AAA ] [ BBB ] [ CCC ]   │
│                            │              ↓              │
│         ↓                  │      [完整JSON document]    │
│  SELECT * = reassemble     │      SELECT * = direct read│
│  (slow: read all cols)     │      (fast: one column)    │
│                            │                            │
└────────────────────────────┴────────────────────────────┘
```

---

## 18. START Button Specification

After the Opening Screen intro fades in, the Start Mission button fades in beneath it:

| Property | Value |
|---|---|
| Text | "Start Mission" (with rocket icon) |
| Color | `highlight` `#e86040` via `cartoon-btn-highlight` |
| Style | `.cartoon-btn` — rounded-full, 3px ink border, 4px hard shadow, uppercase Fredoka with `tracking-[0.2em]` |
| Position | Centered horizontally, `mt-14` below intro block |
| Fade-in | 500ms opacity transition starting at `t=1400ms` (after intro) |
| Attention | `animate-cta-attention` loop while waiting for input |
| Disabled until | Fade-in completes (`startOpacity >= 1`) and not already `starting` |
| Hover | Shadow grows + nudge up-left (standard cartoon-btn hover) |
| Active/Press | Shadow collapses + nudge down-right (standard cartoon-btn active) |
| On click | Intro fades out (500ms) → 500ms stagger → button fades out (500ms) → navigate to `level-intro` (BossIntro) |
