import Foundation
import IkDienEngine
import Observation

/// What the app shows: the trainings on the watch, which one is current, and the training being given.
@MainActor @Observable
final class AppModel {
    private(set) var library: TrainingLibrary
    /// The training being given, shown full screen; restored when the app was relaunched mid-training.
    var session: RunSession?

    @ObservationIgnored private let store: LibraryStore

    init(store: LibraryStore = LibraryStore()) {
        self.store = store
        library = store.load()
        if let saved = RunStore().load(), saved.shouldResume(at: .now) {
            session = RunSession.resume(saved)
        }
    }

    /// The training on the Vandaag screen: the last one fetched or chosen, else the bundled example.
    var currentPlan: TrainingPlan {
        let plan = library.current ?? .sample
        #if DEBUG
        // Launch with -shortTraining to try the warnings and overtime without waiting a quarter of an hour.
        if ProcessInfo.processInfo.arguments.contains("-shortTraining") {
            var short = plan
            short.items = plan.items.map { var item = $0; item.minutes = 2; return item }
            return short
        }
        #endif
        return plan
    }

    func received(_ plan: TrainingPlan) {
        library.add(plan)
        store.save(library)
    }

    /// Makes a training from the list (or the example) the one on Vandaag.
    func choose(_ plan: TrainingPlan) {
        if library.trainings.contains(plan) { library.select(plan) } else { library.add(plan) }
        store.save(library)
    }

    func remove(_ plan: TrainingPlan) {
        library.remove(plan)
        store.save(library)
    }

    func start() {
        session = RunSession.start(plan: currentPlan)
    }
}
