import IkDienEngine
import SwiftUI

@main
struct IkDienWatchApp: App {
    /// Until trainings can be fetched from the site (phase 2), the app starts with the bundled one.
    @State private var plan = TrainingPlan.sample

    var body: some Scene {
        WindowGroup {
            NavigationStack {
                TodayView(plan: plan)
            }
        }
    }
}
