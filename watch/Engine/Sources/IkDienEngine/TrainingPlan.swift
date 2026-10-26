import Foundation

/// The three blocks of a training, as on the site (`BLOCKS` in codebase/src/data/training.tsx).
public enum BlockID: String, Codable, Sendable, CaseIterable {
    case wu, kern, pv

    public var name: String {
        switch self {
        case .wu: "Warming-up"
        case .kern: "Kern"
        case .pv: "Partijvorm"
        }
    }
}

/// One exercise in the training, with everything the watch shows about it.
public struct PlanItem: Codable, Sendable, Equatable, Identifiable {
    /// Unique within the plan (the same exercise can appear twice).
    public var id: String
    /// Exercise id on the site, e.g. "rondo".
    public var exercise: String
    public var block: BlockID
    public var title: String
    public var minutes: Int
    /// Coaching points to read out, from the exercise's detail page.
    public var coaching: [String]
    /// e.g. "13 (5 × 2 + 3)"
    public var players: String?
    /// e.g. "40 × 30 m"
    public var field: String?

    public init(id: String, exercise: String, block: BlockID, title: String, minutes: Int, coaching: [String] = [], players: String? = nil, field: String? = nil) {
        self.id = id
        self.exercise = exercise
        self.block = block
        self.title = title
        self.minutes = minutes
        self.coaching = coaching
        self.players = players
        self.field = field
    }
}

/**
 * A training as the site sends it to the watch: self-contained, so the watch never needs the exercise
 * catalogue. The payload is versioned; a watch build only accepts versions it knows, so the site can
 * change the format without breaking older watches silently.
 */
public struct TrainingPlan: Codable, Sendable, Equatable {
    public static let supportedVersion = 1

    public var version: Int
    /// ISO date, e.g. "2026-10-27".
    public var date: String
    public var team: String
    public var theme: String
    public var items: [PlanItem]

    public init(version: Int = TrainingPlan.supportedVersion, date: String, team: String, theme: String, items: [PlanItem]) {
        self.version = version
        self.date = date
        self.team = team
        self.theme = theme
        self.items = items
    }

    /// Planned length of the whole training, in minutes.
    public var totalMinutes: Int { items.reduce(0) { $0 + $1.minutes } }

    public func minutes(in block: BlockID) -> Int {
        items.filter { $0.block == block }.reduce(0) { $0 + $1.minutes }
    }

    public enum DecodingError: Error, Equatable {
        case unsupportedVersion(Int)
        case noExercises
        case invalidMinutes(itemID: String)
    }

    /// Decodes and checks a payload; a plan that would break the timer is refused rather than half-shown.
    public static func decode(from data: Data) throws -> TrainingPlan {
        let plan = try JSONDecoder().decode(TrainingPlan.self, from: data)
        guard plan.version == supportedVersion else { throw DecodingError.unsupportedVersion(plan.version) }
        guard !plan.items.isEmpty else { throw DecodingError.noExercises }
        if let bad = plan.items.first(where: { !(1...120).contains($0.minutes) }) {
            throw DecodingError.invalidMinutes(itemID: bad.id)
        }
        return plan
    }
}

extension TrainingPlan {
    /// The training bundled with the app, for trying it out before a training is sent from the site.
    public static let sample: TrainingPlan = {
        guard let url = Bundle.module.url(forResource: "SampleTraining", withExtension: "json"),
              let data = try? Data(contentsOf: url),
              let plan = try? TrainingPlan.decode(from: data)
        else { fatalError("SampleTraining.json is missing or invalid") }
        return plan
    }()
}
