import Foundation
import IkDienEngine
import Observation

/// A training being given: the plan plus its `RunState`, with the actions the run screen needs.
/// Phase 1 adds saving the state, haptics and the workout session that keeps the app awake.
@MainActor @Observable
final class RunSession: Identifiable {
    let id = UUID()
    let plan: TrainingPlan
    private(set) var state: RunState

    init(plan: TrainingPlan, startedAt: Date) {
        self.plan = plan
        state = RunState(plan: plan, startedAt: startedAt)
    }

    func timeline(at now: Date) -> Timeline {
        Timeline(plan: plan, state: state, now: now)
    }

    func togglePause() {
        if state.isPaused { state.resume(at: .now) } else { state.pause(at: .now) }
    }

    func addMinute() { state.adjustCurrent(by: 60) }

    func next() { state.advance(at: .now) }
}
