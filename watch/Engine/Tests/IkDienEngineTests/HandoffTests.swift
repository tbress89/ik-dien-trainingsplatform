import Foundation
import Testing
@testable import IkDienEngine

@Suite struct HandoffTests {
    @Test func validCodes() {
        #expect(Handoff.isValid(code: "0427"))
        #expect(!Handoff.isValid(code: "427"))
        #expect(!Handoff.isValid(code: "04271"))
        #expect(!Handoff.isValid(code: "04a7"))
        #expect(!Handoff.isValid(code: "٠٤٢٧"), "only ASCII digits")
    }

    @Test func claimBody() throws {
        let body = try JSONSerialization.jsonObject(with: Handoff.claimBody(code: "0427")) as? [String: String]
        #expect(body == ["p_code": "0427"])
    }

    @Test func aTrainingComesBack() throws {
        let body = try JSONEncoder().encode(TrainingPlan.sample)
        #expect(try Handoff.interpret(status: 200, body: body).get() == TrainingPlan.sample)
    }

    @Test func nullMeansUnknownOrExpired() {
        #expect(Handoff.interpret(status: 200, body: Data("null".utf8)) == .failure(.unknownCode))
        #expect(Handoff.interpret(status: 200, body: Data()) == .failure(.unknownCode))
    }

    @Test func rateLimitIsRecognised() {
        let body = Data(#"{"code":"P0001","details":null,"hint":null,"message":"too many attempts"}"#.utf8)
        #expect(Handoff.interpret(status: 400, body: body) == .failure(.tooManyAttempts))
    }

    @Test func otherServerErrorsFail() {
        #expect(Handoff.interpret(status: 500, body: Data("oops".utf8)) == .failure(.failed))
        #expect(Handoff.interpret(status: 404, body: Data(#"{"message":"function not found"}"#.utf8)) == .failure(.failed))
    }

    @Test func aNewerFormatAsksForAnUpdate() {
        let body = Data(#"{"version":2,"date":"2026-10-27","team":"U11","theme":"x","items":[]}"#.utf8)
        #expect(Handoff.interpret(status: 200, body: body) == .failure(.needsUpdate))
    }
}

@Suite struct TrainingLibraryTests {
    private func plan(_ team: String) -> TrainingPlan {
        TrainingPlan(date: "2026-10-27", team: team, theme: "x", items: [PlanItem(id: "a", exercise: "rondo", block: .wu, title: "Rondo", minutes: 10)])
    }

    @Test func newestFirstWithoutDuplicates() {
        var library = TrainingLibrary()
        library.add(plan("U9"))
        library.add(plan("U11"))
        library.add(plan("U9"))
        #expect(library.trainings.map(\.team) == ["U9", "U11"])
        #expect(library.current?.team == "U9")
    }

    @Test func keepsAtMostTheLimit() {
        var library = TrainingLibrary()
        for i in 0..<(TrainingLibrary.limit + 3) { library.add(plan("T\(i)")) }
        #expect(library.trainings.count == TrainingLibrary.limit)
        #expect(library.trainings.first?.team == "T12")
        #expect(library.trainings.last?.team == "T3")
    }

    @Test func selectAndRemove() {
        var library = TrainingLibrary(trainings: [plan("A"), plan("B"), plan("C")])
        library.select(plan("C"))
        #expect(library.trainings.map(\.team) == ["C", "A", "B"])
        library.remove(plan("A"))
        #expect(library.trainings.map(\.team) == ["C", "B"])
    }

    @Test func roundTripsAndSkipsUnreadableEntries() throws {
        let library = TrainingLibrary(trainings: [plan("A"), plan("B")])
        #expect(TrainingLibrary.decode(from: try library.encoded()) == library)

        let mixed = Data("""
        {"trainings":[{"version":9,"date":"x","team":"new","theme":"x","items":[]},
        \(String(decoding: try JSONEncoder().encode(plan("A")), as: UTF8.self))]}
        """.utf8)
        #expect(TrainingLibrary.decode(from: mixed).trainings.map(\.team) == ["A"])
        #expect(TrainingLibrary.decode(from: Data("garbage".utf8)).trainings.isEmpty)
    }
}
