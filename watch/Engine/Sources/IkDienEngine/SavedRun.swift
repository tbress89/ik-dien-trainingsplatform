import Foundation

/// A running training as it is written to disk on every change, so it survives the app being relaunched.
public struct SavedRun: Codable, Sendable, Equatable {
    /// A training that started this long ago is from an earlier day: never resume it.
    public static let maxAge: TimeInterval = 4 * 60 * 60

    public var plan: TrainingPlan
    public var state: RunState

    public init(plan: TrainingPlan, state: RunState) {
        self.plan = plan
        self.state = state
    }

    /// Whether to open this training again when the app starts.
    public func shouldResume(at now: Date) -> Bool {
        !state.isFinished && state.index < plan.items.count && now.timeIntervalSince(state.startedAt) < Self.maxAge
    }

    public func encoded() throws -> Data {
        try JSONEncoder().encode(self)
    }

    /// Reads a saved run; nil for anything that isn't one (an old format, a half-written file).
    public static func decode(from data: Data) -> SavedRun? {
        guard let run = try? JSONDecoder().decode(SavedRun.self, from: data),
              run.plan.version == TrainingPlan.supportedVersion,
              run.state.durations.count == run.plan.items.count
        else { return nil }
        return run
    }
}
