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

A real watch needs a development team set under Signing & Capabilities; the simulator doesn't.
The GitHub workflow `.github/workflows/watch.yml` runs the Engine tests and builds the app on every
change under `watch/`.
