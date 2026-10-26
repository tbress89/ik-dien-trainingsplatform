import IkDienEngine
import SwiftUI
import UserNotifications
import WatchKit

@main
struct IkDienWatchApp: App {
    @WKApplicationDelegateAdaptor private var delegate: AppDelegate
    @State private var model = AppModel()

    var body: some Scene {
        WindowGroup {
            NavigationStack {
                TodayView(model: model)
            }
        }
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
