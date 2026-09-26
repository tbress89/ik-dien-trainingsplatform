---
name: edit-exercise
description: Edit or delete existing football exercises (oefeningen) in the Kon. Ik Dien FC trainingsplatform — change any field in codebase/src/data/exercises.ts (duration, players, ages, phase, text, variations, materials, related exercises), adjust or redraw its pitch diagram in Pitch.tsx, rename it, or remove it entirely, keeping every reference consistent. Use this whenever the user wants to change, fix, update, tweak, rename, correct, shorten, or delete an exercise that already exists on the platform, even if they only name it loosely ("the rondo", "that 5v5 game") or just describe the change ("make the passing square 15 minutes"), and even if they don't say "/edit-exercise". For adding a brand-new exercise, use /add-exercise instead.
---

# Edit an exercise

The user names an existing exercise (often loosely) and describes a change in a sentence. Make that change, carry it through to every field and diagram it affects so the exercise stays internally consistent, verify the build, and report exactly what changed.

## Where things live

All paths are relative to `codebase/`:

- `src/data/exercises.ts` — the `Exercise` type, allowed values, and the `EXERCISES` array.
- `src/components/Pitch.tsx` — one diagram per `Variant`.
- `src/data/sessions.ts` — the example trainings; each plan item refers to an exercise id.
- `src/data/training.tsx` — the initially bookmarked exercises (`favs`) refer to exercise ids.

The field rules, Dutch writing style, and diagram drawing rules are the same as for adding an exercise; they live in `.claude/skills/add-exercise/SKILL.md` (sections "Write the entry", "Writing the Dutch text" and "Pick or draw the diagram"). Read the relevant section before touching those parts, so edits follow the same conventions as new entries.

## Step 1 — Find the exercise

Match what the user said against titles, ids, types and descriptions in `EXERCISES`. "De rondo", "the 5v5", "passvierkant" are all fine. If more than one exercise fits and the change would differ between them, ask which one; if the user clearly means several ("make all warming-ups 10 minutes"), edit all of them.

If nothing matches, say so and list the closest titles. They may have meant `/add-exercise`.

## Step 2 — Make the change, and follow it through

Change only what was asked, plus what that change makes inconsistent. Leave untouched text alone: rewriting sentences nobody asked about makes the edit hard to review and can undo earlier corrections the user made.

Typical knock-on effects to check:

| If this changes… | …also check |
|---|---|
| Players or formation | `pmin`, `players`, `playersDetail`, the setup step, coaching points that name positions, and the diagram (right number of `P`/`O`, positions matching the formation) |
| Duration (`min`) | The `Ritme.` step: series × minutes + rest should roughly add up |
| Age range | `ages` must cover the whole new `ageLabel` range |
| Phase | Tags follow automatically. `'Algemeen'` has no filter checkbox on the dashboard. Mention that if you switch to it |
| Setup, rules, or how it's played | `steps`, `summary`, `easier`/`harder`, and the diagram and its `diagramSteps` hints if they describe the old version |
| Diagram arrows or stages | `diagramSteps` labels/hints and each arrow's `at` value, so every stage button still reveals something new |
| Title | Nothing else. The title is display-only; keep the `id` |

### Editing a diagram

Before changing a drawing, check how many exercises use that `variant`. If others share it, editing it silently changes their pages too, so add a new variant for this exercise instead (following the add-exercise drawing rules) and leave the shared one alone. If this exercise is the only user, edit it in place.

### Renaming the id

Only change an `id` when the user explicitly asks, since it's the page URL. When you do, update every reference: other exercises' `related` lists, the training plans in `sessions.ts`, and `favs` in `training.tsx`. Grep for the old id in quotes to be sure nothing is missed.

## Deleting an exercise

Deleting touches other pages, so confirm before doing it. First list what will happen, then wait for a clear yes:

- the exercise entry is removed;
- its diagram variant is removed too, if no other exercise uses it (union member in `exercises.ts` and entry in `Pitch.tsx`);
- the exercises that list it under "Past goed bij" (name them), plus the replacement you'd put in each of those slots, so their pages still show four related exercises;
- any training in `sessions.ts` that uses it: its plan item is dropped (the overview and builder would crash on an unknown id). Name the affected trainings, since their minutes change;
- a bookmark in `favs` (`training.tsx`) is removed.

After confirming, make all of these changes, then grep for the deleted id in quotes across `src/` to confirm no reference is left.

## Step 3 — Verify

Build from `codebase/` (Node 18+ via `.nvmrc`; the default shell Node may be older):

```bash
cd codebase && source ~/.nvm/nvm.sh >/dev/null && nvm use >/dev/null && npm run build
```

Fix any type errors, then `rm -rf dist tsconfig.tsbuildinfo`.

Then sync the designs from the repo root, so `design/` shows the same exercises and diagrams as the app:

```bash
python3 scripts/sync-design.py
```

It regenerates the diagram design (`Pitch.dc.html`) and the exercise lists in `Main.dc.html` and `Builder.dc.html`, and resizes the Main board. Don't edit those parts of the design files by hand; they are overwritten on every sync. If the script stops with an error (for example an exercise whose `variant` has no diagram in `Pitch.tsx`), fix the cause in `codebase/` and run it again.

The script doesn't touch the hand-made example content in `Detail.dc.html` (one example exercise and its related cards) and `Trainingen.dc.html` (example trainings that name exercises and diagrams). After renaming a title or diagram, or deleting an exercise, search `design/` for the old title and variant and update any hits by hand.

If a dev server is already running, open `/oefeningen/<id>` (or the builder, after a delete) and click through the diagram steps if the diagram changed. Don't start a server just for this.

## Step 4 — Report back

Show the change as a before → after list so it's easy to check, then the knock-on edits you made on your own:

```
Updated **<title>** (`/oefeningen/<id>`):

- Duur: 12 → 15 min
- Spelers: 6 → 8 (pmin 6 → 8)

Also adjusted: <e.g. the Ritme step (now 3 × 4 min), the diagram (two extra players)>.
Designs synced.
<Anything you assumed or noticed but didn't change, e.g. "The coaching points still mention the old field size. Want me to update them?">
```

For a delete, confirm what was removed and which related slots got which replacement.
