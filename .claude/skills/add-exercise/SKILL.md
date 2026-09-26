---
name: add-exercise
description: Add a new football exercise (oefening) to the Kon. Ik Dien FC trainingsplatform — writes the full Dutch exercise entry in codebase/src/data/exercises.ts and, when no existing tactical diagram fits, draws a new pitch diagram in Pitch.tsx. Use this whenever the user wants to add, create, or put a new exercise/oefening/drill/rondo/partijvorm/warming-up into the platform or exercise database, even from a one-line idea like "3v1 rondo for U9" or a pasted description, and even if they don't say "/add-exercise". To change or delete an exercise that already exists, use /edit-exercise instead.
---

# Add an exercise

The user gives a rough idea (sometimes just a name and an age group). Turn it into a complete, realistic exercise entry that reads like the existing ones, add a diagram if needed, verify the build, and show the user a short summary so they can correct anything you invented.

## Where things live

All paths are relative to `codebase/`:

- `src/data/exercises.ts` — the `Exercise` type, the allowed values (`TYPES`, `PHASES`, `AGES`, `Variant`) and the `EXERCISES` array. This is the source of truth; read it first, both for the current field list and as a style reference for the Dutch text.
- `src/components/Pitch.tsx` — the tactical diagrams, one entry per `Variant` in the `content` record.

Nothing else needs to change: the dashboard, builder library, and detail page (`/oefeningen/<id>`) all read from `EXERCISES`.

## Step 1 — Pin down the facts

From the user's message, work out: type, game phase, age groups, number of players, duration, difficulty. Fill in anything missing with sensible youth-football defaults rather than asking — the user chose "rough idea, fill the rest", and they'll correct the summary at the end.

Only stop and ask when the request conflicts with what the app supports, because silently bending it would produce something they didn't ask for:

- a **type** outside `TYPES`. Goalkeeper exercises don't get their own type (Keeper was removed as a type): use the fitting type, usually `Technisch`, and give them the `Keeper` theme,
- a new **phase** that isn't in the `Phase` union,
- an exercise that clearly duplicates an existing one (same format and purpose) — ask whether they want a variant or a new entry.

## Step 2 — Write the entry

Append a new object to `EXERCISES` (before the closing `];`). Fields that are easy to get subtly wrong:

| Field | Guidance |
|---|---|
| `id` | Short, lowercase, unique — check the ids already in `EXERCISES` (e.g. `rondo`, `trans`, `game`). It becomes the URL. |
| `ages` / `ageLabel` | `ages` are the filter buckets from `AGES` and must cover the whole `ageLabel` range. `ageLabel` is the precise range with spaced en dash: `'U11 – U15'`, or `'Alle'`. E.g. `U11 – U15` → `['U10–13', 'U14–15']`. |
| `themes` | One or two training themes from `THEMES` that the exercise genuinely works on (e.g. a rondo → `'Passing & aanname'`, `'Positiespel'`). The builder's theme picker counts exercises per theme, so pick what a trainer choosing that theme would expect to find. Don't invent new themes; ask if nothing fits. |
| `pmin` | Minimum players needed as a number — the dashboard's player slider filters on it. |
| `players` / `playersDetail` | Display strings: `'8'`, `'8–12'`, `'10 + K'`; detail like `'(4 × 2)'` or `'(5 × 2 + 3)'`. Use `×` and `–`, not `x` and `-`. |
| `min` | Duration in minutes; the `Ritme.` step's series + rest should roughly add up to it. |
| `diff` | 1 Basis, 2 Gemiddeld, 3 Gevorderd. |
| `intensity` | 1–5 physical load, independent of difficulty (a simple sprint drill can be basis + hoog). |
| `phase` | `'Algemeen'` exists for non-phase-specific work (coordination, fysiek) but has no dashboard filter checkbox — prefer a real phase when one fits. |
| `materials` | Reuse the canonical names so the builder's material summary dedupes correctly: `Kegels`, `Ballen`, `Hesjes`, `Doeltjes`, `Groot doel`, `Grote doelen`, `Loopladder`. `qty` is a string (`'4'`, `'2 × 4'`). |
| `diagramSteps` | Optional `[label, hint]` stages for the detail-page diagram; the hint is one short sentence on what that stage shows. Two or more stages get a button each: stage `i` reveals the arrows whose `at` is ≤ i, and the last stage always shows the full diagram. With the default `at` values (passes 1, runs 2), three stages read setup → passes → runs, e.g. Organisatie → Balwinst → Afwerken. Use as many stages as the exercise naturally has; a single stage just shows its hint as a caption, and leaving the field out shows the plain diagram. |
| `related` | Four existing ids that pair well in a session, each with a `fit` label. Reuse the existing labels: `Als warming-up`, `Kern`, `Als afsluiter`, `Zelfde thema`, `Als vervolg`, `Tegenhanger`. Don't point at the new exercise itself. |

Leave other exercises' `related` lists alone unless the user asks — changing them silently alters pages they didn't touch.

### Writing the Dutch text

Match the existing entries' voice: Flemish youth-football coaching language, addressed to the trainer, concrete and short. Use terms like *kegels, hesjes, doeltjes, balcontacten, reeksen, actieve rust, omschakelen, druk zetten, kaatser, joker*. Prefer `je`-form and imperative sentences.

- `summary`: two sentences — what the players do, then what it trains.
- `steps`: four steps, each with a bold-style title ending in a period, typically `Opstelling.`, one or two steps for how it's played/scored, and `Ritme.` (series × minutes, rest, when to switch).
- `easier` / `harder`: one or two concrete adjustments each (field size, numbers, touch limits, time limits, jokers).
- `objectives`: four short noun phrases.
- `coaching`: four one-line coaching points a trainer can shout or explain on the pitch.

## Step 3 — Pick or draw the diagram

Reuse an existing `Variant` when its drawing genuinely depicts the new exercise's setup (e.g. another square rondo → `rondo`). Otherwise add a new one:

1. Add the name to the `Variant` union in `exercises.ts`.
2. Add a matching entry to `content` in `Pitch.tsx`. The record is typed `Record<Variant, …>`, so the build fails until both exist — that's intended.

Drawing rules (viewBox is 320 × 200; the pitch outline runs 10–310 × 10–190):

- Build it only from the primitives defined at the top of `Pitch`: `P` (own team, purple), `O` (opponent, orange), `N` (neutral/kaatser), `Ball`, `Cone`, `Goal`, `Box` (white field lines, or pass `ZONE` for a lavender zone), `Line` (white, or dashed zone line with `true`), `Pass` (dashed dark arrow) and `Run` (solid purple arrow, SVG path string). Keeping to these keeps every diagram visually consistent.
- Include at least one `Pass` and, where the exercise has movement, one `Run`.
- `Pass(x1, y1, x2, y2, at)` and `Run(d, at)` take an optional last argument: the diagram stage from which the arrow appears (defaults: passes 1, runs 2). Set it when the exercise has more than three stages, or when the arrows should appear in a different order than passes-then-runs, so each stage button reveals something new. When reusing an existing diagram, check its arrows fit the stages you wrote.
- Order the array back to front: field lines and zones, then passes and runs, then players, then the ball last so it sits on top.
- Keep the key action inside roughly x 30–290, y 45–155. The SVG is cropped to fill different boxes (the builder's plan cards are very wide and short, the library thumbnails narrow), so content near the edges gets cut off.
- Each primitive derives its React key from its coordinates, so don't place two of the same primitive at identical coordinates.

## Step 4 — Verify

Build from `codebase/`. The project needs Node 18+ (`.nvmrc` pins 22); the default shell Node may be older:

```bash
cd codebase && source ~/.nvm/nvm.sh >/dev/null && nvm use >/dev/null && npm run build
```

Fix any type errors, then delete the build output (`rm -rf dist tsconfig.tsbuildinfo`) so the working tree stays clean.

Then sync the designs from the repo root, so `design/` shows the same exercises and diagrams as the app:

```bash
python3 scripts/sync-design.py
```

It regenerates the diagram design (`Pitch.dc.html`) and the exercise lists in `Main.dc.html` and `Builder.dc.html`, and resizes the Main board. Don't edit those parts of the design files by hand; they are overwritten on every sync. If the script stops with an error (for example an exercise whose `variant` has no diagram in `Pitch.tsx`), fix the cause in `codebase/` and run it again.

If a dev server is already running (check with the browser preview tools), open `/oefeningen/<id>` and click through the diagram steps to make sure the drawing looks right. Don't start a server just for this unless the user wants to see it.

## Step 5 — Report back

Keep it short and make the invented parts easy to check:

```
Added **<title>** (`/oefeningen/<id>`).

| Type | Fase | Leeftijd | Spelers | Duur | Niveau | Intensiteit |
|---|---|---|---|---|---|---|
| … | … | … | … | … min | … | …/5 |

Diagram: reused `<variant>` / new `<variant>` diagram (one line on what it shows).
Related: <4 titles>.
Designs synced (<N> exercises, <N> diagrams).

I filled in <list what you assumed rather than got from the user, e.g. duration, player count, variations>. Tell me what to change.
```
