import IkDienEngine
import SwiftUI

/// "Vandaag": the training that's ready to give, with Start and its schedule.
struct TodayView: View {
    let plan: TrainingPlan
    @State private var session: RunSession?

    var body: some View {
        ScrollView {
            VStack(spacing: 10) {
                VStack(alignment: .leading, spacing: 4) {
                    Text(plan.formattedDate.uppercased())
                        .font(.caption2.weight(.semibold))
                        .foregroundStyle(Theme.muted)
                    Text("\(plan.team) · \(plan.theme)")
                        .font(.headline)
                        .lineLimit(2)
                    Text("\(plan.totalMinutes) min · \(plan.items.count) oefeningen")
                        .font(.footnote)
                        .foregroundStyle(.secondary)
                    BlockBar(plan: plan)
                        .padding(.top, 4)
                }
                .frame(maxWidth: .infinity, alignment: .leading)
                .padding(12)
                .background(Theme.card, in: RoundedRectangle(cornerRadius: 18))

                Button {
                    session = RunSession(plan: plan, startedAt: .now)
                } label: {
                    Label("Start training", systemImage: "play.fill")
                        .font(.body.weight(.bold))
                        .frame(maxWidth: .infinity)
                }
                .tint(Theme.accent)
                .buttonStyle(.borderedProminent)

                NavigationLink {
                    ScheduleView(plan: plan)
                } label: {
                    Label("Schema", systemImage: "list.bullet")
                        .frame(maxWidth: .infinity)
                }
            }
        }
        .navigationTitle("Ik Dien")
        .fullScreenCover(item: $session) { session in
            RunView(session: session)
        }
    }
}

/// The three blocks side by side, sized by their minutes, like the block bar on the site.
struct BlockBar: View {
    let plan: TrainingPlan

    var body: some View {
        GeometryReader { geo in
            let blocks = BlockID.allCases.filter { plan.minutes(in: $0) > 0 }
            let gaps = CGFloat(max(0, blocks.count - 1)) * 2
            HStack(spacing: 2) {
                ForEach(blocks, id: \.self) { block in
                    Capsule()
                        .fill(Theme.color(for: block))
                        .frame(width: (geo.size.width - gaps) * CGFloat(plan.minutes(in: block)) / CGFloat(plan.totalMinutes))
                }
            }
        }
        .frame(height: 5)
        .accessibilityHidden(true)
    }
}

#Preview {
    NavigationStack {
        TodayView(plan: .sample)
    }
}
