import Foundation

/**
 * The trainings fetched onto the watch, kept on the watch itself so they open on the pitch without any
 * connection. Newest (or last chosen) first; the first one is the training the app opens with.
 */
public struct TrainingLibrary: Codable, Sendable, Equatable {
    /// Older trainings than this fall off the list.
    public static let limit = 10

    public private(set) var trainings: [TrainingPlan]

    public init(trainings: [TrainingPlan] = []) {
        self.trainings = Array(trainings.prefix(Self.limit))
    }

    /// The training the app opens with, if any was fetched.
    public var current: TrainingPlan? { trainings.first }

    /// Adds a fetched training at the front; fetching the same training again doesn't duplicate it.
    public mutating func add(_ plan: TrainingPlan) {
        trainings.removeAll { $0 == plan }
        trainings.insert(plan, at: 0)
        if trainings.count > Self.limit { trainings.removeLast(trainings.count - Self.limit) }
    }

    /// Makes a training from the list the current one.
    public mutating func select(_ plan: TrainingPlan) {
        guard let i = trainings.firstIndex(of: plan) else { return }
        trainings.insert(trainings.remove(at: i), at: 0)
    }

    public mutating func remove(_ plan: TrainingPlan) {
        trainings.removeAll { $0 == plan }
    }

    public func encoded() throws -> Data {
        try JSONEncoder().encode(self)
    }

    /// Reads a stored library, keeping only trainings this app version can open.
    public static func decode(from data: Data) -> TrainingLibrary {
        guard let stored = try? JSONDecoder().decode(StoredLibrary.self, from: data) else { return TrainingLibrary() }
        return TrainingLibrary(trainings: stored.trainings.compactMap { entry in
            guard let data = try? JSONEncoder().encode(entry) else { return nil }
            return try? TrainingPlan.decode(from: data)
        })
    }

    /// Decodes each training on its own, so one unreadable entry doesn't lose the others.
    private struct StoredLibrary: Decodable {
        var trainings: [AnyJSON]
    }
}

/// Any JSON value, to pass a stored entry through `TrainingPlan.decode` and its checks.
private enum AnyJSON: Codable {
    case object([String: AnyJSON]), array([AnyJSON]), string(String), number(Double), bool(Bool), null

    init(from decoder: Decoder) throws {
        let c = try decoder.singleValueContainer()
        if c.decodeNil() { self = .null }
        else if let b = try? c.decode(Bool.self) { self = .bool(b) }
        else if let n = try? c.decode(Double.self) { self = .number(n) }
        else if let s = try? c.decode(String.self) { self = .string(s) }
        else if let a = try? c.decode([AnyJSON].self) { self = .array(a) }
        else { self = .object(try c.decode([String: AnyJSON].self)) }
    }

    func encode(to encoder: Encoder) throws {
        var c = encoder.singleValueContainer()
        switch self {
        case .object(let o): try c.encode(o)
        case .array(let a): try c.encode(a)
        case .string(let s): try c.encode(s)
        case .number(let n): try c.encode(n)
        case .bool(let b): try c.encode(b)
        case .null: try c.encodeNil()
        }
    }
}
