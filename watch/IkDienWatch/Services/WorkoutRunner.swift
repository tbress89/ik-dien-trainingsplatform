import Foundation
import HealthKit
import OSLog

/**
 * Runs a workout session (soccer, outdoor) for as long as the training runs. That is what keeps a watch
 * app running with the wrist down, so the clock, the haptics and Always On keep working for 60–90 minutes.
 *
 * The workout is not saved to Apple Health for now (an open question in PLAN.md); it is discarded when the
 * training ends. Without HealthKit permission the training still runs, it just relies on the backup
 * notifications when the app is suspended.
 */
@MainActor
final class WorkoutRunner {
    static let shared = WorkoutRunner()

    private let store = HKHealthStore()
    private var session: HKWorkoutSession?
    private var builder: HKLiveWorkoutBuilder?
    private var recovery: Task<Void, Never>?
    private let log = Logger(subsystem: "be.ikdien.trainingen.watch", category: "Workout")

    var isRunning: Bool { session?.state == .running }

    /// Starts the session, or picks up the one that survived a relaunch of the app.
    func start(at date: Date) async {
        guard session == nil, HKHealthStore.isHealthDataAvailable() else { return }
        do {
            try await store.requestAuthorization(toShare: [HKObjectType.workoutType()], read: [])
            let configuration = HKWorkoutConfiguration()
            configuration.activityType = .soccer
            configuration.locationType = .outdoor

            let session = try HKWorkoutSession(healthStore: store, configuration: configuration)
            let builder = session.associatedWorkoutBuilder()
            builder.dataSource = HKLiveWorkoutDataSource(healthStore: store, workoutConfiguration: configuration)
            session.startActivity(with: date)
            try await builder.beginCollection(at: date)
            self.session = session
            self.builder = builder
        } catch {
            log.error("Starting the workout session failed: \(error.localizedDescription)")
        }
    }

    /// After a crash or relaunch mid-training, watchOS hands the running session back. Both the app
    /// delegate and the resumed training ask for it; they share one request, as a second one fails.
    func recover() async {
        if let recovery {
            await recovery.value
            return
        }
        guard session == nil else { return }
        let task = Task {
            do {
                let recovered = try await store.recoverActiveWorkoutSession()
                session = recovered
                builder = recovered?.associatedWorkoutBuilder()
            } catch {
                log.error("Recovering the workout session failed: \(error.localizedDescription)")
            }
        }
        recovery = task
        await task.value
        recovery = nil
    }

    func end() async {
        guard let session else { return }
        let builder = self.builder
        self.session = nil
        self.builder = nil
        session.end()
        do {
            try await builder?.endCollection(at: .now)
            builder?.discardWorkout()
        } catch {
            log.error("Ending the workout failed: \(error.localizedDescription)")
        }
    }
}
