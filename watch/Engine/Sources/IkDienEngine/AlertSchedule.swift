import Foundation

/// A moment the watch taps the coach on the wrist.
public struct Alert: Sendable, Equatable, Hashable {
    public enum Kind: Sendable, Equatable, Hashable {
        /// One minute left in the exercise: one tap.
        case oneMinuteLeft
        /// The exercise's time is up: three strong taps.
        case timeUp
        /// Still in overtime, repeated every 30 seconds for a while, so a missed "time up" is noticed.
        case stillOvertime
    }

    public var kind: Kind
    public var fireAt: Date
    /// The exercise the alert belongs to.
    public var itemID: String

    public init(kind: Kind, fireAt: Date, itemID: String) {
        self.kind = kind
        self.fireAt = fireAt
        self.itemID = itemID
    }
}

/**
 * Which alerts the current exercise has, derived from the run state like everything else: after a pause,
 * a +1′ or a restart of the app the alerts simply move along. The next exercise only starts when the
 * coach taps Volgende, so only the current exercise has alerts.
 */
public enum AlertSchedule {
    /// Seconds between "still overtime" reminders, and how many there are at most.
    public static let overtimeInterval: TimeInterval = 30
    public static let overtimeReminders = 6

    /// All alerts of the current exercise; none while paused or once the training is finished.
    public static func alerts(plan: TrainingPlan, state: RunState) -> [Alert] {
        guard !state.isPaused, !state.isFinished, state.index < plan.items.count else { return [] }
        let item = plan.items[state.index]
        let duration = state.durations[state.index]
        let end = state.itemStartedAt.addingTimeInterval(state.itemPausedTotal + duration)

        var alerts: [Alert] = []
        // A one-minute warning only makes sense when the exercise is clearly longer than a minute.
        if duration >= 120 {
            alerts.append(Alert(kind: .oneMinuteLeft, fireAt: end.addingTimeInterval(-60), itemID: item.id))
        }
        alerts.append(Alert(kind: .timeUp, fireAt: end, itemID: item.id))
        for n in 1...overtimeReminders {
            alerts.append(Alert(kind: .stillOvertime, fireAt: end.addingTimeInterval(Double(n) * overtimeInterval), itemID: item.id))
        }
        return alerts
    }

    /// Alerts that fall due after `from` up to and including `to`: what to play on this tick of the clock.
    public static func due(plan: TrainingPlan, state: RunState, after from: Date, upTo to: Date) -> [Alert] {
        alerts(plan: plan, state: state).filter { $0.fireAt > from && $0.fireAt <= to }
    }

    /// Alerts still to come, for scheduling backup notifications.
    public static func upcoming(plan: TrainingPlan, state: RunState, now: Date) -> [Alert] {
        alerts(plan: plan, state: state).filter { $0.fireAt > now }
    }
}
