# Ik Dien Watch

The Apple Watch app for giving a training on the pitch. What it will do and in which order: [PLAN.md](PLAN.md).

- `IkDienWatch.xcodeproj`: the watch-only SwiftUI app (watchOS 11+). Files added under `IkDienWatch/`
  show up in the project automatically.
- `Engine/`: a Swift package with the timekeeping (training plan, run state, timeline), without UI.
  It also builds for macOS, so its tests run without a simulator.
- `Engine/Sources/IkDienEngine/Resources/SampleTraining.json`: the training the app starts with until
  trainings can be sent from the site.

## Working on it

Open `IkDienWatch.xcodeproj` in Xcode, pick an Apple Watch simulator and run. Engine tests from the
command line:

```bash
swift test --package-path watch/Engine
```

To fetch trainings with Code ("Naar horloge" on the site), copy `Config/Supabase.local.xcconfig.example`
to `Config/Supabase.local.xcconfig` (ignored by git) and fill in the same public values as the site's
`VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`. The database needs
`supabase/migrations/0003_watch_handoff.sql`. Debug builds also accept `-supabaseURL …` and
`-supabaseAnonKey …` as launch arguments.

To try the warnings and overtime without waiting, add the launch argument `-shortTraining` to the scheme
(Debug builds only): every exercise then lasts 2 minutes.

A real watch needs a development team set under Signing & Capabilities; the simulator doesn't. The app
uses HealthKit (a workout session keeps it running with the wrist down), so that team needs the HealthKit
capability too.
The GitHub workflow `.github/workflows/watch.yml` runs the Engine tests and builds the app on every
change under `watch/`.
