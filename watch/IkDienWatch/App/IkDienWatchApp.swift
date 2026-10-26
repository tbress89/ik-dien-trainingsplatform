import IkDienEngine
import SwiftUI
import UserNotifications
import WatchKit

@main
struct IkDienWatchApp: App {
    @WKApplicationDelegateAdaptor private var delegate: AppDelegate
    /// Until trainings can be fetched from the site (phase 2), the app starts with the bundled one.
    @State private var plan = Self.startPlan()
    /// A training that was still running when the app was relaunched opens straight away.
    @State private var resumed: RunSession? = {
        guard let saved = RunStore().load(), saved.shouldResume(at: .now) else { return nil }
        return RunSession.resume(saved)
    }()

    var body: some Scene {
        WindowGroup {
            NavigationStack {
                TodayView(plan: plan, session: $resumed)
            }
        }
    }

    private static func startPlan() -> TrainingPlan {
        #if DEBUG
        // Launch with -shortTraining to try the warnings and overtime without waiting a quarter of an hour.
        if ProcessInfo.processInfo.arguments.contains("-shortTraining") {
            var plan = TrainingPlan.sample
            plan.items = plan.items.map { var item = $0; item.minutes = 2; return item }
            return plan
        }
        #endif
        return .sample
    }
}

final class AppDelegate: NSObject, WKApplicationDelegate, UNUserNotificationCenterDelegate {
    func applicationDidFinishLaunching() {
        UNUserNotificationCenter.current().delegate = self
    }

    /// watchOS relaunched the app during a training; the session itself is picked up by RunSession.resume.
    func handleActiveWorkoutRecovery() {
        Task { await WorkoutRunner.shared.recover() }
    }

    /// With the app on screen the haptics come from the app itself, so a backup that slipped through stays silent.
    nonisolated func userNotificationCenter(_ center: UNUserNotificationCenter, willPresent notification: UNNotification) async -> UNNotificationPresentationOptions {
        []
    }
}
