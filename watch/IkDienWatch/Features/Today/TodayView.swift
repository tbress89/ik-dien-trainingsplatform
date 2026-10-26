import IkDienEngine
import SwiftUI

/// "Vandaag": the training that's ready to give, with Start, its schedule (tap the card), another
/// training from the watch (Andere) and fetching one from the site (Code).
struct TodayView: View {
    @Bindable var model: AppModel

    var body: some View {
        let plan = model.currentPlan
        ScrollView {
            VStack(spacing: 10) {
                NavigationLink {
                    ScheduleView(plan: plan)
                } label: {
                    TrainingCard(plan: plan)
                }
                .buttonStyle(.plain)
                .accessibilityHint("Toont het schema")

                Button(action: model.start) {
                    Label("Start training", systemImage: "play.fill")
                        .font(.body.weight(.bold))
                        .frame(maxWidth: .infinity)
                }
                .tint(Theme.accent)
                .buttonStyle(.borderedProminent)

                HStack(spacing: 8) {
                    NavigationLink {
                        TrainingsView(model: model)
                    } label: {
                        Label("Andere", systemImage: "list.bullet")
                            .labelStyle(.titleAndIcon)
                            .font(.footnote.weight(.semibold))
                            .frame(maxWidth: .infinity)
                    }
                    NavigationLink {
                        CodeView(model: model)
                    } label: {
                        Label("Code", systemImage: "number")
                            .font(.footnote.weight(.semibold))
                            .frame(maxWidth: .infinity)
                    }
                }
            }
        }
        .navigationTitle("Ik Dien")
        .fullScreenCover(item: $model.session) { session in
            RunView(session: session)
        }
    }
}

/// Date, team and theme, length and the block bar of a training.
struct TrainingCard: View {
    let plan: TrainingPlan

    var body: some View {
        VStack(alignment: .leading, spacing: 4) {
            Text(plan.formattedDate.uppercased())
                .font(.caption2.weight(.semibold))
                .foregroundStyle(Theme.muted)
            Text(plan.title)
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
        TodayView(model: AppModel())
    }
}
