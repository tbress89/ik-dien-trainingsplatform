import IkDienEngine
import SwiftUI

/// "Oefening loopt": the current exercise with its countdown ring, schedule and controls.
/// A first version on top of the Engine; phase 1 brings it to the full design (warnings, coaching, haptics).
struct RunView: View {
    let session: RunSession
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        TimelineView(.periodic(from: .now, by: 1)) { context in
            let t = session.timeline(at: context.date)
            if let item = t.current {
                running(t, item: item)
            } else {
                finished(t)
            }
        }
        .background(Color.black.ignoresSafeArea())
    }

    private func running(_ t: Timeline, item: PlanItem) -> some View {
        let color = ringColor(t, block: item.block)
        return VStack(spacing: 2) {
            VStack(alignment: .leading, spacing: 0) {
                Text("\(item.block.name) · \(t.position)/\(t.count)")
                    .font(.caption2.weight(.bold))
                    .foregroundStyle(Theme.color(for: item.block))
                Text(item.title)
                    .font(.caption.weight(.semibold))
                    .lineLimit(1)
            }
            .frame(maxWidth: .infinity, alignment: .leading)
            .padding(.leading, 4)

            ZStack {
                Circle().stroke(color.opacity(0.2), lineWidth: 6)
                Circle()
                    .trim(from: 0, to: 1 - t.progress)
                    .stroke(color, style: StrokeStyle(lineWidth: 6, lineCap: .round))
                    .rotationEffect(.degrees(-90))
                VStack(spacing: 0) {
                    Text(t.phase == .timeUp ? ClockFormat.overtime(t.overtime) : ClockFormat.countdown(t.remaining))
                        .font(Theme.timer(size: 30))
                        .minimumScaleFactor(0.6)
                        .lineLimit(1)
                        .foregroundStyle(t.phase == .timeUp ? Theme.overtime : .primary)
                        .accessibilityAddTraits(.updatesFrequently)
                    Text(t.phase == .paused ? "pauze" : "tot \(ClockFormat.time(t.itemEndsAt))")
                        .font(.system(size: 11))
                        .foregroundStyle(.secondary)
                }
                .padding(.horizontal, 12)
            }
            .aspectRatio(1, contentMode: .fit)
            .frame(maxWidth: .infinity, maxHeight: .infinity)
        }
        .toolbar {
            ToolbarItem(placement: .cancellationAction) {
                Button("Stop", systemImage: "xmark") { dismiss() }
            }
            ToolbarItemGroup(placement: .bottomBar) {
                Button(t.phase == .paused ? "Verder" : "Pauze", systemImage: t.phase == .paused ? "play.fill" : "pause.fill", action: session.togglePause)

                VStack(spacing: 0) {
                    Text("\(Int(t.elapsed / 60))′ van \(session.plan.totalMinutes)′")
                        .font(.caption2.weight(.semibold).monospacedDigit())
                    // Only mention the drift once it matters; on schedule the end time is enough.
                    Text(abs(t.drift) < 30 ? "einde \(ClockFormat.time(t.expectedEnd))" : "\(ClockFormat.drift(t.drift)) · \(ClockFormat.time(t.expectedEnd))")
                        .font(.caption2.weight(.bold))
                        .lineLimit(1)
                        .minimumScaleFactor(0.8)
                        .foregroundStyle(t.drift >= 90 ? Theme.warning : .secondary)
                }

                Button(t.position == t.count ? "Training afronden" : "Volgende oefening", systemImage: "chevron.right", action: session.next)
                    .tint(Theme.color(for: item.block))
            }
        }
    }

    private func finished(_ t: Timeline) -> some View {
        VStack(spacing: 8) {
            Text("Klaar")
                .font(.headline)
                .foregroundStyle(Theme.color(for: .pv))
            Text("\(Int((t.elapsed / 60).rounded()))′")
                .font(Theme.timer(size: 44))
            Text(ClockFormat.drift(t.expectedEnd.timeIntervalSince(t.plannedEnd)))
                .font(.footnote)
                .foregroundStyle(.secondary)
            Button("Sluiten") { dismiss() }
                .tint(Theme.accent)
                .buttonStyle(.borderedProminent)
        }
    }

    private func ringColor(_ t: Timeline, block: BlockID) -> Color {
        switch t.phase {
        case .lastMinute: Theme.warning
        case .timeUp: Theme.overtime
        default: Theme.color(for: block)
        }
    }
}

#Preview {
    RunView(session: RunSession(plan: .sample, startedAt: .now.addingTimeInterval(-7 * 60)))
}
