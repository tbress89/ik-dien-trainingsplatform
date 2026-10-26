import IkDienEngine
import SwiftUI

/// "Schema": every exercise with the clock time it starts, counted from now as if the training starts now.
struct ScheduleView: View {
    let plan: TrainingPlan

    var body: some View {
        // Refresh every minute so the times stay right while the coach waits on the pitch.
        TimelineView(.everyMinute) { context in
            let timeline = Timeline(plan: plan, state: RunState(plan: plan, startedAt: context.date), now: context.date)
            List(timeline.entries, id: \.item.id) { entry in
                HStack(spacing: 8) {
                    Capsule()
                        .fill(Theme.color(for: entry.item.block))
                        .frame(width: 4)
                    VStack(alignment: .leading, spacing: 2) {
                        Text("\(ClockFormat.time(entry.startsAt)) · \(Int(entry.duration / 60))′")
                            .font(.caption.weight(.semibold))
                            .foregroundStyle(Theme.color(for: entry.item.block))
                        Text(entry.item.title)
                            .font(.footnote.weight(.semibold))
                            .lineLimit(2)
                    }
                }
            }
        }
        .navigationTitle("Schema")
    }
}

#Preview {
    NavigationStack {
        ScheduleView(plan: .sample)
    }
}
