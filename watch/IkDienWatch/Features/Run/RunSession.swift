import Foundation
import IkDienEngine
import Observation

/**
 * A training being given: the plan plus its `RunState`, and everything that has to happen when that state
 * changes: save it (so a relaunch can resume it), play the haptics that fall due, keep the backup
 * notifications in line and keep the workout session running.
 */
@MainActor @Observable
final class RunSession: Identifiable {
    let id = UUID()
    let plan: TrainingPlan
    private(set) var state: RunState

    @ObservationIgnored private let store: RunStore
    @ObservationIgnored private let workout: WorkoutRunner
    /// Alerts up to this moment have been played; the next check plays what fell due since.
    @ObservationIgnored private var alertsCheckedUpTo: Date
    @ObservationIgnored private var ticker: Task<Void, Never>?

    /// Starts a new training now.
    static func start(plan: TrainingPlan, store: RunStore = RunStore(), workout: WorkoutRunner = .shared) -> RunSession {
        let now = Date.now
        let session = RunSession(plan: plan, state: RunState(plan: plan, startedAt: now), store: store, workout: workout, checkedUpTo: now)
        Task {
            await BackupNotifications.requestPermission()
            await workout.start(at: now)
            session.stateChanged()
        }
        return session
    }

    /// Continues a training that was running when the app was relaunched. Alerts that fell due while the
    /// app wasn't running are not replayed: the backup notifications covered those.
    static func resume(_ saved: SavedRun, store: RunStore = RunStore(), workout: WorkoutRunner = .shared) -> RunSession {
        let session = RunSession(plan: saved.plan, state: saved.state, store: store, workout: workout, checkedUpTo: .now)
        Task {
            await workout.recover()
            if !workout.isRunning { await workout.start(at: .now) }
            session.stateChanged()
        }
        return session
    }

    private init(plan: TrainingPlan, state: RunState, store: RunStore, workout: WorkoutRunner, checkedUpTo: Date) {
        self.plan = plan
        self.state = state
        self.store = store
        self.workout = workout
        alertsCheckedUpTo = checkedUpTo
        stateChanged()
        startTicker()
    }

    func timeline(at now: Date) -> Timeline {
        Timeline(plan: plan, state: state, now: now)
    }

    /// The exercise after the current one, for "Hierna: …" and the Volgende button.
    var nextItem: PlanItem? {
        let next = state.index + 1
        return next < plan.items.count ? plan.items[next] : nil
    }

    func togglePause() {
        if state.isPaused { state.resume(at: .now) } else { state.pause(at: .now) }
        Haptics.tap()
        stateChanged()
    }

    func addMinutes(_ minutes: Int) {
        state.adjustCurrent(by: TimeInterval(minutes * 60))
        Haptics.tap()
        stateChanged()
    }

    func next() {
        state.advance(at: .now)
        Haptics.tap()
        stateChanged()
    }

    /// Ends the training early (the Stop button): nothing is kept.
    func stop() {
        ticker?.cancel()
        store.clear()
        BackupNotifications.cancelAll()
        Task { await workout.end() }
    }

    private func stateChanged() {
        let now = Date.now
        if state.isFinished {
            ticker?.cancel()
            store.clear()
            BackupNotifications.cancelAll()
            Task { await workout.end() }
            return
        }
        store.save(SavedRun(plan: plan, state: state))
        // A change can't make an alert from the past due again (e.g. +1′ during overtime brings "time up" back).
        alertsCheckedUpTo = now
        BackupNotifications.reschedule(AlertSchedule.upcoming(plan: plan, state: state, now: now), plan: plan, now: now)
    }

    private func startTicker() {
        ticker = Task { [weak self] in
            while !Task.isCancelled {
                try? await Task.sleep(for: .milliseconds(500))
                self?.playDueAlerts()
            }
        }
    }

    private func playDueAlerts() {
        let now = Date.now
        let due = AlertSchedule.due(plan: plan, state: state, after: alertsCheckedUpTo, upTo: now)
        alertsCheckedUpTo = now
        // After a long gap only the latest alert is worth a tap; the others are just dropped from the backup.
        due.forEach(BackupNotifications.handled)
        if let latest = due.last { Haptics.play(latest.kind) }
    }
}
