import Foundation
import Testing
@testable import IkDienEngine

private let plan = TrainingPlan(date: "2026-10-27", team: "U11", theme: "Test", items: [
    PlanItem(id: "a", exercise: "rondo", block: .wu, title: "Rondo", minutes: 10),
    PlanItem(id: "b", exercise: "pass", block: .kern, title: "Pass", minutes: 1),
])
private let start = Date(timeIntervalSince1970: 1_800_000_000)
private func at(_ minutes: Double) -> Date { start.addingTimeInterval(minutes * 60) }

@Suite struct AlertScheduleTests {
    @Test func oneMinuteWarningTimeUpAndReminders() {
        let state = RunState(plan: plan, startedAt: start)
        let alerts = AlertSchedule.alerts(plan: plan, state: state)
        #expect(alerts.first == Alert(kind: .oneMinuteLeft, fireAt: at(9), itemID: "a"))
        #expect(alerts[1] == Alert(kind: .timeUp, fireAt: at(10), itemID: "a"))
        #expect(alerts.dropFirst(2).map(\.fireAt) == [at(10.5), at(11), at(11.5), at(12), at(12.5), at(13)])
        #expect(alerts.dropFirst(2).allSatisfy { $0.kind == .stillOvertime })
    }

    @Test func noWarningForAOneMinuteExercise() {
        var state = RunState(plan: plan, startedAt: start)
        state.advance(at: at(10))
        let kinds = AlertSchedule.alerts(plan: plan, state: state).map(\.kind)
        #expect(kinds.first == .timeUp)
        #expect(!kinds.contains(.oneMinuteLeft))
    }

    @Test func dueOnlyReturnsAlertsInTheWindow() {
        let state = RunState(plan: plan, startedAt: start)
        #expect(AlertSchedule.due(plan: plan, state: state, after: at(8), upTo: at(8.99)).isEmpty)
        #expect(AlertSchedule.due(plan: plan, state: state, after: at(8.99), upTo: at(9)).map(\.kind) == [.oneMinuteLeft])
        // A long gap (the app was suspended) returns everything that fell due, so nothing is skipped silently.
        #expect(AlertSchedule.due(plan: plan, state: state, after: at(8), upTo: at(10.5)).count == 3)
    }

    @Test func pauseRemovesAlertsAndResumeMovesThem() {
        var state = RunState(plan: plan, startedAt: start)
        state.pause(at: at(2))
        #expect(AlertSchedule.alerts(plan: plan, state: state).isEmpty)

        state.resume(at: at(5))
        #expect(AlertSchedule.alerts(plan: plan, state: state).first?.fireAt == at(12))
    }

    @Test func extraMinuteMovesTheAlerts() {
        var state = RunState(plan: plan, startedAt: start)
        state.adjustCurrent(by: 60)
        let timeUp = AlertSchedule.alerts(plan: plan, state: state).first { $0.kind == .timeUp }
        #expect(timeUp?.fireAt == at(11))
    }

    @Test func upcomingSkipsWhatAlreadyHappened() {
        let state = RunState(plan: plan, startedAt: start)
        let upcoming = AlertSchedule.upcoming(plan: plan, state: state, now: at(10.2))
        #expect(upcoming.count == 6)
        #expect(upcoming.allSatisfy { $0.kind == .stillOvertime })
    }

    @Test func noAlertsOnceFinished() {
        var state = RunState(plan: plan, startedAt: start)
        state.advance(at: at(10))
        state.advance(at: at(11))
        #expect(AlertSchedule.alerts(plan: plan, state: state).isEmpty)
    }
}
