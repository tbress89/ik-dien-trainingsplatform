# Ik Dien Watch

The Apple Watch app for giving a training on the pitch. What it will do and in which order: [PLAN.md](PLAN.md).

- `IkDienWatch.xcodeproj` with two apps:
  - `IkDienWatch/`: the SwiftUI watch app (watchOS 11+). It runs on its own, without the iPhone app.
  - `IkDienPhone/`: a one-screen iPhone app that carries the watch app. Installing it puts Ik Dien on the
    paired watch, which is how a build gets onto a real watch.
  Files added under either folder show up in the project automatically.
- `Engine/`: a Swift package with the timekeeping (training plan, run state, timeline), without UI.
  It also builds for macOS, so its tests run without a simulator.
- `Engine/Sources/IkDienEngine/Resources/SampleTraining.json`: the training the app starts with until
  one is fetched from the site.

## Working on it

In the simulator: open `IkDienWatch.xcodeproj`, pick the **IkDienWatch** scheme and an Apple Watch
simulator, and run. Engine tests from the command line:

```bash
swift test --package-path watch/Engine
```

On your own watch: copy `Config/Local.xcconfig.example` to `Config/Local.xcconfig` (ignored by git) and
set `DEVELOPMENT_TEAM` to your team ID (Xcode › Settings › Accounts). Then pick the **IkDien** scheme
and your iPhone (with the watch paired) and run: the iPhone installs the watch app onto the watch, where
Ik Dien appears in the app list. Debug builds get a new build number every time (`1.YYMMDD.HHMMSS`,
the same for both apps), so each Run replaces the watch app; Release builds keep
`CURRENT_PROJECT_VERSION`. Running the IkDienWatch scheme straight on a real watch only works
when Xcode can reach the watch over Wi-Fi. The watch app uses HealthKit (a workout session keeps it
running with the wrist down), which Xcode adds to the app's ID on your team the first time.

To fetch trainings with Code ("Naar horloge" on the site), also fill in `SUPABASE_URL` and
`SUPABASE_ANON_KEY` in `Config/Local.xcconfig`: the same public values as the site's
`VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`. The database needs
`supabase/migrations/0003_watch_handoff.sql`. Debug builds also accept `-supabaseURL …` and
`-supabaseAnonKey …` as launch arguments.

To try the warnings and overtime without waiting, add the launch argument `-shortTraining` to the
IkDienWatch scheme (Debug builds only): every exercise then lasts 2 minutes.

The GitHub workflow `.github/workflows/watch.yml` runs the Engine tests and builds both apps on every
change under `watch/`.
