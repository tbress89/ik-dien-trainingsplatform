import Foundation

/// What the coach sees at one moment of a running training: a pure function of plan, state and time.
public struct Timeline: Sendable, Equatable {
    public enum Phase: Sendable, Equatable {
        case running
        /// Less than a minute left (the orange ring on the watch).
        case lastMinute
        /// The exercise's time is up and overtime is counting.
        case timeUp
        case paused
        case finished
    }

    /// The exercise with its expected clock time, for the schedule screen.
    public struct Entry: Sendable, Equatable {
        public var item: PlanItem
        public var startsAt: Date
        public var duration: TimeInterval
        public var isDone: Bool
        public var isCurrent: Bool
    }

    public let phase: Phase
    public let current: PlanItem?
    /// 1-based position of the current exercise, e.g. 3 in "Kern · 3/5".
    public let position: Int
    public let count: Int
    /// Seconds left in the current exercise; 0 once time is up.
    public let remaining: TimeInterval
    /// Seconds past the current exercise's time; 0 while time is left.
    public let overtime: TimeInterval
    /// Part of the current exercise that has passed, 0...1.
    public let progress: Double
    /// When the current exercise ends if nothing changes; in overtime, the moment its time ran out.
    public let itemEndsAt: Date
    public let elapsed: TimeInterval
    /// When the training would end as planned at the start.
    public let plannedEnd: Date
    /// When the training will end at the current pace, counting overtime and pauses so far.
    public let expectedEnd: Date
    public let entries: [Entry]

    /// Seconds the training is behind (positive) or ahead (negative) of the planned end.
    public var drift: TimeInterval { expectedEnd.timeIntervalSince(plannedEnd) }

    public init(plan: TrainingPlan, state: RunState, now: Date) {
        let reference = state.finishedAt ?? now
        count = plan.items.count
        elapsed = max(0, reference.timeIntervalSince(state.startedAt))
        plannedEnd = state.startedAt.addingTimeInterval(TimeInterval(plan.totalMinutes * 60))

        let index = min(state.index, count)
        let inItem = state.elapsedInItem(at: now)
        let duration = index < count ? state.durations[index] : 0
        let left = duration - inItem

        current = index < count ? plan.items[index] : nil
        position = min(index + 1, count)
        remaining = max(0, left)
        overtime = max(0, -left)
        progress = duration > 0 ? min(1, inItem / duration) : 1
        itemEndsAt = reference.addingTimeInterval(left)

        // Finished exercises at the clock time they really started; the current one when it started;
        // the rest one after another from the moment the current one is expected to end.
        var entries: [Entry] = []
        var start = state.startedAt
        for (i, item) in plan.items.enumerated() {
            if i < index {
                entries.append(Entry(item: item, startsAt: start, duration: state.actuals[i], isDone: true, isCurrent: false))
                start = start.addingTimeInterval(state.actuals[i])
            } else if i == index {
                entries.append(Entry(item: item, startsAt: state.itemStartedAt, duration: state.durations[i], isDone: false, isCurrent: true))
                // In overtime the next exercise can start no earlier than now.
                start = max(itemEndsAt, reference)
            } else {
                entries.append(Entry(item: item, startsAt: start, duration: state.durations[i], isDone: false, isCurrent: false))
                start = start.addingTimeInterval(state.durations[i])
            }
        }
        self.entries = entries
        expectedEnd = state.isFinished ? reference : start

        phase = if state.isFinished {
            .finished
        } else if state.isPaused {
            .paused
        } else if left <= 0 {
            .timeUp
        } else if left <= 60 {
            .lastMinute
        } else {
            .running
        }
    }
}
