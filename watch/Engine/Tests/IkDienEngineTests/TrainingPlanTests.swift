import Foundation
import Testing
@testable import IkDienEngine

@Suite struct TrainingPlanTests {
    @Test func sampleTrainingLoads() {
        let plan = TrainingPlan.sample
        #expect(plan.items.count == 5)
        #expect(plan.totalMinutes == 75)
        #expect(plan.minutes(in: .wu) == 15)
        #expect(plan.minutes(in: .kern) == 40)
        #expect(plan.minutes(in: .pv) == 20)
        #expect(plan.items.allSatisfy { !$0.coaching.isEmpty })
        #expect(Set(plan.items.map(\.id)).count == plan.items.count, "item ids must be unique")
    }

    @Test func roundTripsThroughJSON() throws {
        let data = try JSONEncoder().encode(TrainingPlan.sample)
        #expect(try TrainingPlan.decode(from: data) == TrainingPlan.sample)
    }

    @Test func refusesAnUnknownVersion() {
        let json = #"{"version":2,"date":"2026-10-27","team":"U11","theme":"x","items":[]}"#
        #expect(throws: TrainingPlan.DecodingError.unsupportedVersion(2)) {
            try TrainingPlan.decode(from: Data(json.utf8))
        }
    }

    @Test func refusesAnEmptyTraining() {
        let json = #"{"version":1,"date":"2026-10-27","team":"U11","theme":"x","items":[]}"#
        #expect(throws: TrainingPlan.DecodingError.noExercises) {
            try TrainingPlan.decode(from: Data(json.utf8))
        }
    }

    @Test func refusesZeroMinutes() {
        let json = #"{"version":1,"date":"2026-10-27","team":"U11","theme":"x","items":[{"id":"a","exercise":"rondo","block":"wu","title":"Rondo","minutes":0,"coaching":[]}]}"#
        #expect(throws: TrainingPlan.DecodingError.invalidMinutes(itemID: "a")) {
            try TrainingPlan.decode(from: Data(json.utf8))
        }
    }

    @Test func optionalFieldsMayBeMissing() throws {
        let json = #"{"version":1,"date":"2026-10-27","team":"U11","theme":"x","items":[{"id":"a","exercise":"rondo","block":"wu","title":"Rondo","minutes":10,"coaching":[]}]}"#
        let plan = try TrainingPlan.decode(from: Data(json.utf8))
        #expect(plan.items[0].players == nil)
        #expect(plan.items[0].field == nil)
    }
}
