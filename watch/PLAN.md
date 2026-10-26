# Ik Dien Watch — plan

An Apple Watch app for the coach on the pitch: the training from the platform on your wrist, with a
countdown per exercise, haptic signals, and live re-planning so the training still ends on time. It is the
wrist version of "Training geven" (`codebase/src/components/PitchMode.tsx`), built for glances and taps
with sweaty fingers instead of reading.

Designs: the canvas "Ik Dien Watch – trainingstimer" (13 screens); a copy of the source is in
`design/watch/`.

## Goals

1. **One glance tells you where you are**: current exercise, time left, and whether the training is
   ahead of or behind schedule — readable at arm's length, in sunlight, wrist half-raised.
2. **The watch tells you, not the other way round**: haptics at "1 minute left", "time up", half-time
   and rotations, so the coach can watch the players instead of the clock.
3. **Finish on time without doing maths**: when an exercise runs over, the watch proposes how to
   shorten what's left so the training still ends at its planned time.
4. **Works with the screen down and without the phone**: a training keeps running correctly when the
   wrist drops, the app is suspended or the iPhone is in the dressing room.

Non-goals for v1: building or editing trainings on the watch (that stays on the site), diagrams and
animations (too small to be useful), player lists or attendance.

## Key decisions

| Topic | Decision | Why |
| --- | --- | --- |
| Tech | Native SwiftUI watchOS app, watchOS 11+, Swift 6, no third-party dependencies | The platform is a web app; watchOS has no browser runtime, so this is a separate native target. |
| App shape | Watch app that **runs on its own**, carried by a one-screen iPhone app | Everything happens on the watch (`WKRunsIndependentlyOfCompanionApp`). The iPhone app only installs it: Xcode can't reach a watch-only app on a real watch when the watch isn't on the Mac's network, while an iPhone app installs its watch app through the iPhone. |
| Getting a training onto the watch | **4-digit code** shown on the site ("Naar horloge" in Training geven), typed on the watch | No account or Apple sign-in needed on the watch; works for shared links and saved trainings alike. Accounts can come later. |
| What travels | A **self-contained JSON**: titles, block, minutes, coaching points, organisation line | The watch never needs the 200+ exercise catalogue, and exercise changes on the site can't break it. |
| Staying alive | `HKWorkoutSession` (activity type soccer) while a training runs | The only reliable way to keep a watch app in the foreground with the wrist down for 60–90 min. It also logs the training as a workout for the coach (opt-in HealthKit permission). |
| Timekeeping | All times derived from fixed timestamps (start, pauses, adjustments), never from a ticking counter | Same approach as `PitchMode` (`endsAt`): suspension or a frozen UI can't make the clock drift. |
| Backup alerts | Local notifications scheduled for every upcoming "time up" | If the app is killed anyway, the coach still gets the haptic. |
| Language | Dutch UI, same block colours as the site (lightened for a black screen) | Matches the platform. |

## Feature set

### Before the training
- **Vandaag** (screen 1): the next training (date, team, theme, duration, block bar) with *Start training*.
  *Andere*: list of trainings fetched before. *Code*: fetch a new one.
- **Code** (screen 2): 4 digits on a keypad; the code is valid for 15 minutes.
- **Schema** (screen 3): every exercise with its planned clock time, e.g. 18:30 / 18:45 / 19:00.
- Trainings are cached on the watch, so the field needs no Wi-Fi or phone.

### During the training
- **Oefening loopt** (screen 4): block + position (Kern · 3/5), title, countdown ring, "tot 19:17",
  total progress (39′ van 75′) and the **schedule chip** (+2′ · einde 19:47).
- **Coaching** (screen 5): scroll down (Digital Crown) for the coaching points and organisation.
- **Nog 1 minuut** (screen 6): ring turns orange, one tap on the wrist, shows what's next.
- **Tijd om** (screen 7): overtime counts up in red, three strong taps (repeated every 30 s),
  big *Volgende* button, *+1′* / *+3′*. No auto-advance by default; a setting allows it.
- **Duur aanpassen** (screen 8): turn the Digital Crown on the timer to change this exercise's length
  in 1′ steps; the watch offers to take the difference from the partijvorm so the end time holds.
- Quick controls: **double tap** (Series 9+/Ultra 2) and the **Action button** (Ultra) = next exercise;
  tapping the timer pauses (with a "pauze" state that also pauses the whole schedule).

### Smart time management
- **Herplannen** (screen 9): once the training is ≥ 3′ behind, the watch proposes shortening the
  remaining exercises (proportionally, minimum 5′ each; which block gives way first is an open
  question) — *Inkorten* or *Uitlopen*.
- **Partijvorm** (screen 10): split into halves with a half-time haptic, a rotation reminder
  ("Wissel over 0:48") at a set interval, and a simple score counter.
- **Always On** (screen 11): dimmed version of screen 4; `Text(timerInterval:)` keeps the seconds
  correct without waking the app.
- **Smart Stack & complications** (screen 12): WidgetKit widget with the running exercise and a
  progress gauge; circular complications for end time and schedule (+2′).

### After the training
- **Klaar** (screen 13): planned vs. actual per exercise, total time and "op tijd klaar".
  *Bewaar bij training* sends the actual minutes back, so the site can show them later.

## Architecture

```
watch/
  IkDienWatch.xcodeproj
  IkDienWatch/                SwiftUI app target
    App/                      entry, navigation, settings
    Features/
      Today/  Code/  Schedule/  Run/  Summary/
    Engine/                   pure Swift, no UI, fully unit-tested
      TrainingPlan.swift      decoded payload (blocks, items, minutes, coaching points)
      RunState.swift          start time, pauses, per-item adjustments, current index
      Timeline.swift          derive: time left, overtime, drift, planned end, clock times
      Replanner.swift         proposals to shorten the remaining items
      AlertSchedule.swift     which haptic fires when (1′ left, time up, half-time, rotations)
    Services/
      HandoffClient.swift     fetch training by code (Supabase REST)
      WorkoutRunner.swift     HKWorkoutSession lifetime
      Haptics.swift           WKInterfaceDevice patterns + local notifications backup
      Store.swift             cached trainings + in-progress RunState (survives relaunch)
  IkDienWidgets/              WidgetKit extension (Smart Stack, complications)
  IkDienWatchTests/           Swift Testing for Engine/
```

**Engine is the heart.** `RunState` is a small value type persisted on every change. Everything the UI
shows is a pure function `Timeline(plan, state, now)`. That makes the hard parts — pauses, overtime,
crown adjustments, re-planning, relaunch mid-training — testable without a simulator.

### Web and backend changes (this repo)

1. `supabase/migrations/0003_watch_handoff.sql`: table `watch_handoff (code text primary key,
   payload jsonb, expires_at timestamptz)`; an RPC `create_watch_code(payload)` (anon + authenticated,
   returns a fresh 4-digit code valid for 15 min, rate-limited) and `claim_watch_code(code)` (returns
   the payload once, then deletes it). No user data stored, same spirit as `0002`.
2. `codebase/src/data/watch.ts`: build the self-contained payload from a `SharedTraining` plus
   `EXERCISE_BY_ID` / exercise details (title, block, minutes, coaching points, organisation line),
   with a version field. Unit tests alongside, like `share.test.ts`.
3. `PitchMode` / Training geven: a *Naar horloge* button that shows the code big, with a countdown.
4. Later (phase 4): an RPC to store actual minutes for a training, and showing them on the site.

## Phases

| Phase | Scope | Done when |
| --- | --- | --- |
| **0. Setup** | Xcode project in `watch/`, Engine module + tests, GitHub Actions job on a macOS runner (build + test), bundled sample training | CI builds and tests the watch app on every PR. |
| **1. Timer MVP** | Screens 1, 3–7 with a bundled training; workout session; haptics; Always On; relaunch restores a running training | A full 75′ training runs on a real watch with the wrist down, with correct haptics. |
| **2. Handoff** | Migration 0003, `watch.ts`, *Naar horloge* on the site, screen 2, offline cache | A training built on the site is on the watch within 10 seconds. |
| **3. Smart time** | Crown adjust (8), re-planning (9), partijvorm halves/rotations/score (10), double tap / Action button, settings | The end time holds after an exercise runs 5′ over, with two taps. |
| **4. Glanceables & after** | Widgets/complications (12), summary (13), actuals back to the site | Coach can see the training from the watch face and review it afterwards. |
| **5. Beta** | TestFlight with 3–5 club coaches, fix what the pitch teaches us | Two weeks of real trainings without a "lost the clock" moment. |

## Risks

- **Apple Developer Program** (€99/year) is needed for a real device build, HealthKit and TestFlight.
- **Battery**: a 90′ workout session with Always On is fine on recent watches, but must be measured on
  an older Series in phase 1.
- **Haptics in a noisy, moving context** can be missed: use the strongest patterns and repeat "time up".
- **Code handoff abuse**: 4 digits is a small space; short expiry, single use and rate limiting are required.
- **Two codebases**: keep the watch's payload versioned so the site can evolve without breaking old
  watch builds.

## Open questions

1. Is there (or will there be) an Apple Developer account for the club, or a personal one?
2. Which watches do the coaches have? (Double tap needs Series 9+/Ultra 2; the Action button is Ultra only.)
3. When re-planning, which exercise gives way first: the partijvorm (kids love it, but it's the most
   elastic) or the kern?
4. Should the workout be saved to Apple Health by default, or only when the coach opts in?
5. The iPhone app is a carrier for now (one screen). Is it worth giving it a job later, e.g. sending a training straight from the site on the phone?
