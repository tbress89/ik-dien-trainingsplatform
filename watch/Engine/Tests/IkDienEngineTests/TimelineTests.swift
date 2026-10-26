import Foundation
import Testing
@testable import IkDienEngine

/// A short training (10′ + 5′ + 5′) and a fixed start, so every expected value is easy to check by hand.
private let plan = TrainingPlan(date: "2026-10-27", team: "U11", theme: "Test", items: [
    PlanItem(id: "a", exercise: "rondo", block: .wu, title: "Rondo", minutes: 10),
    PlanItem(id: "b", exercise: "pass", block: .kern, title: "Pass", minutes: 5),
    PlanItem(id: "c", exercise: "game5", block: .pv, title: "Partijvorm", minutes: 5),
])
private let start = Date(timeIntervalSince1970: 1_800_000_000)
private func at(_ minutes: Double) -> Date { start.addingTimeInterval(minutes * 60) }

@Suite struct TimelineTests {
    @Test func countsDownTheFirstExercise() {
        let state = RunState(plan: plan, startedAt: start)
        let t = Timeline(plan: plan, state: state, now: at(2.5))
        #expect(t.phase == .running)
        #expect(t.current?.id == "a")
        #expect(t.position == 1 && t.count == 3)
        #expect(t.remaining == 7.5 * 60)
        #expect(t.overtime == 0)
        #expect(t.progress == 0.25)
        #expect(t.itemEndsAt == at(10))
        #expect(t.expectedEnd == at(20))
        #expect(t.drift == 0)
    }

    @Test func lastMinuteThenTimeUpWithOvertime() {
        let state = RunState(plan: plan, startedAt: start)
        #expect(Timeline(plan: plan, state: state, now: at(9.5)).phase == .lastMinute)

        let t = Timeline(plan: plan, state: state, now: at(11))
        #expect(t.phase == .timeUp)
        #expect(t.remaining == 0)
        #expect(t.overtime == 60)
        #expect(t.progress == 1)
        // The rest of the schedule moves along with the overtime.
        #expect(t.expectedEnd == at(21))
        #expect(t.drift == 60)
    }

    @Test func pauseFreezesTheExerciseButNotTheSchedule() {
        var state = RunState(plan: plan, startedAt: start)
        state.pause(at: at(4))
        let paused = Timeline(plan: plan, state: state, now: at(7))
        #expect(paused.phase == .paused)
        #expect(paused.remaining == 6 * 60)
        #expect(paused.drift == 3 * 60)

        state.resume(at: at(7))
        let resumed = Timeline(plan: plan, state: state, now: at(8))
        #expect(resumed.phase == .running)
        #expect(resumed.remaining == 5 * 60)
        #expect(resumed.itemEndsAt == at(13))
    }

    @Test func advanceRecordsTheActualDuration() {
        var state = RunState(plan: plan, startedAt: start)
        state.advance(at: at(12))
        let t = Timeline(plan: plan, state: state, now: at(13))
        #expect(t.current?.id == "b")
        #expect(state.actuals == [TimeInterval(12 * 60)])
        #expect(t.remaining == 4 * 60)
        #expect(t.drift == 2 * 60)
        #expect(t.entries.map(\.startsAt) == [at(0), at(12), at(17)])
        #expect(t.entries.map(\.isDone) == [true, false, false])
    }

    @Test func pausedTimeIsNotCountedInTheActualDuration() {
        var state = RunState(plan: plan, startedAt: start)
        state.pause(at: at(3))
        state.advance(at: at(5))
        #expect(state.actuals == [TimeInterval(3 * 60)])
        #expect(!state.isPaused)
    }

    @Test func adjustingTheCurrentExerciseMovesTheEnd() {
        var state = RunState(plan: plan, startedAt: start)
        state.adjustCurrent(by: 3 * 60)
        let t = Timeline(plan: plan, state: state, now: at(1))
        #expect(t.itemEndsAt == at(13))
        #expect(t.drift == 3 * 60)

        state.adjustCurrent(by: -60 * 60)
        #expect(state.durations[0] == 60, "an exercise never goes below one minute")
    }

    @Test func replanningOnlyTouchesUpcomingExercises() {
        var state = RunState(plan: plan, startedAt: start)
        state.adjustCurrent(by: 3 * 60)
        state.setDuration(2 * 60, at: 2)
        state.setDuration(1, at: 0)
        let expected: [TimeInterval] = [13 * 60, 5 * 60, 2 * 60]
        #expect(state.durations == expected)
        #expect(Timeline(plan: plan, state: state, now: at(1)).drift == 0)
    }

    @Test func finishesAfterTheLastExercise() {
        var state = RunState(plan: plan, startedAt: start)
        state.advance(at: at(10))
        state.advance(at: at(16))
        state.advance(at: at(21))
        #expect(state.isFinished)

        let t = Timeline(plan: plan, state: state, now: at(40))
        #expect(t.phase == .finished)
        #expect(t.current == nil)
        #expect(t.elapsed == 21 * 60, "the clock stops when the training is finished")
        #expect(t.expectedEnd == at(21))
        let expected: [TimeInterval] = [10 * 60, 6 * 60, 5 * 60]
        #expect(state.actuals == expected)

        state.advance(at: at(41))
        #expect(state.actuals.count == 3, "advancing a finished training does nothing")
    }

    @Test func survivesASaveAndRestore() throws {
        var state = RunState(plan: plan, startedAt: start)
        state.advance(at: at(11))
        state.pause(at: at(12))
        let restored = try JSONDecoder().decode(RunState.self, from: JSONEncoder().encode(state))
        #expect(restored == state)
    }
}

@Suite struct ClockFormatTests {
    @Test func countdownRoundsUp() {
        #expect(ClockFormat.countdown(462) == "7:42")
        #expect(ClockFormat.countdown(461.2) == "7:42")
        #expect(ClockFormat.countdown(0.3) == "0:01")
        #expect(ClockFormat.countdown(0) == "0:00")
        #expect(ClockFormat.countdown(-5) == "0:00")
    }

    @Test func overtimeRoundsDown() {
        #expect(ClockFormat.overtime(38.9) == "+0:38")
        #expect(ClockFormat.overtime(125) == "+2:05")
    }

    @Test func driftInWholeMinutes() {
        #expect(ClockFormat.drift(125) == "+2′")
        #expect(ClockFormat.drift(-70) == "−1′")
        #expect(ClockFormat.drift(20) == "op schema")
    }

    @Test func clockTime() {
        var calendar = Calendar(identifier: .gregorian)
        calendar.timeZone = TimeZone(identifier: "Europe/Brussels")!
        let date = calendar.date(from: DateComponents(year: 2026, month: 10, day: 27, hour: 19, minute: 7))!
        #expect(ClockFormat.time(date, calendar: calendar) == "19:07")
    }
}
