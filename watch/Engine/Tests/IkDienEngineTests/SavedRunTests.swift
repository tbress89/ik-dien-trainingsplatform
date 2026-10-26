import Foundation
import Testing
@testable import IkDienEngine

private let start = Date(timeIntervalSince1970: 1_800_000_000)

@Suite struct SavedRunTests {
    @Test func roundTrips() throws {
        var state = RunState(plan: .sample, startedAt: start)
        state.advance(at: start.addingTimeInterval(900))
        state.pause(at: start.addingTimeInterval(1000))
        let run = SavedRun(plan: .sample, state: state)
        #expect(SavedRun.decode(from: try run.encoded()) == run)
    }

    @Test func resumesARecentUnfinishedTraining() {
        let run = SavedRun(plan: .sample, state: RunState(plan: .sample, startedAt: start))
        #expect(run.shouldResume(at: start.addingTimeInterval(30 * 60)))
        #expect(!run.shouldResume(at: start.addingTimeInterval(SavedRun.maxAge)), "too old: from an earlier day")
    }

    @Test func doesNotResumeAFinishedTraining() {
        var state = RunState(plan: .sample, startedAt: start)
        for i in 1...TrainingPlan.sample.items.count {
            state.advance(at: start.addingTimeInterval(Double(i) * 60))
        }
        #expect(!SavedRun(plan: .sample, state: state).shouldResume(at: start.addingTimeInterval(600)))
    }

    @Test func ignoresGarbage() {
        #expect(SavedRun.decode(from: Data("{\"plan\":1}".utf8)) == nil)
        #expect(SavedRun.decode(from: Data()) == nil)
    }

    @Test func ignoresAStateThatDoesNotMatchThePlan() throws {
        let short = TrainingPlan(date: "2026-10-27", team: "U11", theme: "x", items: [TrainingPlan.sample.items[0]])
        let run = SavedRun(plan: .sample, state: RunState(plan: short, startedAt: start))
        #expect(SavedRun.decode(from: try run.encoded()) == nil)
    }
}
