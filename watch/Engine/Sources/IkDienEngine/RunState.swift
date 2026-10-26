import Foundation

/**
 * A running training, as fixed moments in time rather than a ticking counter: when it started, when the
 * current exercise started, when it was paused. Everything on screen is derived from this and the
 * current time (see `Timeline`), so a suspended app or a frozen screen can never make the clock drift.
 *
 * Small and `Codable`, so it can be saved on every change and restored after the app is relaunched.
 */
public struct RunState: Codable, Sendable, Equatable {
    public private(set) var startedAt: Date
    /// Index of the current exercise; equals the number of exercises once the training is finished.
    public private(set) var index: Int
    /// Current length of each exercise in seconds: the plan's minutes, changed by adjustments.
    public private(set) var durations: [TimeInterval]
    /// How long each finished exercise actually took, in seconds (pauses not counted).
    public private(set) var actuals: [TimeInterval]
    public private(set) var itemStartedAt: Date
    /// Time spent paused in the current exercise before the running pause (if any).
    public private(set) var itemPausedTotal: TimeInterval
    /// Set while paused.
    public private(set) var pausedAt: Date?
    public private(set) var finishedAt: Date?

    public init(plan: TrainingPlan, startedAt: Date) {
        self.startedAt = startedAt
        index = 0
        durations = plan.items.map { TimeInterval($0.minutes * 60) }
        actuals = []
        itemStartedAt = startedAt
        itemPausedTotal = 0
        pausedAt = nil
        finishedAt = nil
    }

    public var isPaused: Bool { pausedAt != nil }
    public var isFinished: Bool { finishedAt != nil }

    /// Time the current exercise has been running at `now`, pauses not counted.
    public func elapsedInItem(at now: Date) -> TimeInterval {
        let reference = pausedAt ?? finishedAt ?? now
        let paused = itemPausedTotal
        return max(0, reference.timeIntervalSince(itemStartedAt) - paused)
    }

    public mutating func pause(at now: Date) {
        guard !isPaused, !isFinished else { return }
        pausedAt = now
    }

    public mutating func resume(at now: Date) {
        guard let pausedAt else { return }
        itemPausedTotal += max(0, now.timeIntervalSince(pausedAt))
        self.pausedAt = nil
    }

    /// Changes the current exercise's length, e.g. +1′ or a turn of the Digital Crown. Never below one minute.
    public mutating func adjustCurrent(by seconds: TimeInterval) {
        guard !isFinished else { return }
        durations[index] = max(60, durations[index] + seconds)
    }

    /// Changes the length of an exercise that hasn't started yet (re-planning). Never below one minute.
    public mutating func setDuration(_ seconds: TimeInterval, at itemIndex: Int) {
        guard itemIndex > index, itemIndex < durations.count else { return }
        durations[itemIndex] = max(60, seconds)
    }

    /// Ends the current exercise and starts the next one; after the last one the training is finished.
    public mutating func advance(at now: Date) {
        guard !isFinished else { return }
        resume(at: now)
        actuals.append(elapsedInItem(at: now))
        index += 1
        itemStartedAt = now
        itemPausedTotal = 0
        if index == durations.count { finishedAt = now }
    }
}
