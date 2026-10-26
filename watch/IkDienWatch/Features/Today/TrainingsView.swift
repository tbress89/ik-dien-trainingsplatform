import IkDienEngine
import SwiftUI

/// "Andere": the trainings on the watch (fetched earlier, kept offline) and the example; the chosen one
/// becomes the training on Vandaag. Swipe to remove one.
struct TrainingsView: View {
    let model: AppModel
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        List {
            Section {
                ForEach(model.library.trainings, id: \.self) { plan in
                    row(plan)
                        .swipeActions {
                            Button("Verwijderen", systemImage: "trash", role: .destructive) { model.remove(plan) }
                        }
                }
            } footer: {
                if model.library.trainings.isEmpty {
                    Text("Haal een training op met Code. Ze blijft op je horloge, ook zonder verbinding.")
                }
            }
            if !model.library.trainings.contains(.sample) {
                Section("Voorbeeld") {
                    row(.sample)
                }
            }
        }
        .navigationTitle("Trainingen")
    }

    private func row(_ plan: TrainingPlan) -> some View {
        Button {
            model.choose(plan)
            dismiss()
        } label: {
            VStack(alignment: .leading, spacing: 2) {
                Text(plan.formattedDate)
                    .font(.caption2)
                    .foregroundStyle(Theme.muted)
                Text(plan.title)
                    .font(.footnote.weight(.semibold))
                    .lineLimit(2)
                Text("\(plan.totalMinutes) min · \(plan.items.count) oefeningen")
                    .font(.caption2)
                    .foregroundStyle(.secondary)
            }
        }
    }
}

#Preview {
    NavigationStack {
        TrainingsView(model: AppModel())
    }
}
