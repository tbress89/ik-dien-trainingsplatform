import Foundation
import IkDienEngine
import UserNotifications

/**
 * Local notifications for every upcoming alert, as a backup for when the app is not running (killed by
 * the system, or the workout session couldn't start). Each one is scheduled a few seconds after the alert
 * itself; when the app plays the haptic in time it removes the matching notification, so the coach never
 * feels the same alert twice.
 */
@MainActor
enum BackupNotifications {
    static let delay: TimeInterval = 5
    private static let prefix = "alert-"

    static func requestPermission() async {
        _ = try? await UNUserNotificationCenter.current().requestAuthorization(options: [.alert, .sound])
    }

    static func reschedule(_ alerts: [Alert], plan: TrainingPlan, now: Date) {
        let center = UNUserNotificationCenter.current()
        center.removeAllPendingNotificationRequests()
        let titles = Dictionary(plan.items.map { ($0.id, $0.title) }, uniquingKeysWith: { first, _ in first })
        for alert in alerts {
            let content = UNMutableNotificationContent()
            content.title = switch alert.kind {
            case .oneMinuteLeft: "Nog 1 minuut"
            case .timeUp, .stillOvertime: "Tijd om"
            }
            content.body = titles[alert.itemID] ?? ""
            content.sound = .default
            let interval = max(1, alert.fireAt.timeIntervalSince(now) + delay)
            let trigger = UNTimeIntervalNotificationTrigger(timeInterval: interval, repeats: false)
            center.add(UNNotificationRequest(identifier: identifier(for: alert), content: content, trigger: trigger))
        }
    }

    /// The app played this alert itself: drop its backup.
    static func handled(_ alert: Alert) {
        UNUserNotificationCenter.current().removePendingNotificationRequests(withIdentifiers: [identifier(for: alert)])
    }

    static func cancelAll() {
        UNUserNotificationCenter.current().removeAllPendingNotificationRequests()
    }

    private static func identifier(for alert: Alert) -> String {
        "\(prefix)\(alert.itemID)-\(alert.kind)-\(Int(alert.fireAt.timeIntervalSince1970))"
    }
}
