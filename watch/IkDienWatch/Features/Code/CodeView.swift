import IkDienEngine
import SwiftUI
import WatchKit

/// "Code" (screen 2 in the design): type the 4-digit code from "Naar horloge" on the site to fetch the
/// training. It is fetched as soon as the fourth digit is in, then becomes the training on Vandaag.
struct CodeView: View {
    let model: AppModel
    var client = HandoffClient.live
    @Environment(\.dismiss) private var dismiss
    @State private var digits = ""
    @State private var fetching = false
    @State private var error: HandoffError?

    private let keys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "⌫", "0", ""]

    var body: some View {
        // In a scroll view the content starts below the back button and title instead of under them.
        ScrollView {
            VStack(spacing: 6) {
                HStack(spacing: 5) {
                    ForEach(0..<Handoff.codeLength, id: \.self) { i in
                        let digit = i < digits.count ? String(Array(digits)[i]) : ""
                        Text(digit)
                            .font(Theme.timer(size: 22))
                            .frame(maxWidth: .infinity, minHeight: 30)
                            .background(Theme.card, in: RoundedRectangle(cornerRadius: 8))
                            .overlay {
                                if i == digits.count && !fetching {
                                    RoundedRectangle(cornerRadius: 8).stroke(Theme.color(for: .pv), lineWidth: 1.5)
                                }
                            }
                    }
                }
                .accessibilityElement(children: .ignore)
                .accessibilityLabel(digits.isEmpty ? "Nog geen cijfers" : "Code \(digits.map(String.init).joined(separator: " "))")

                status
                    .font(.caption2)
                    .lineLimit(2)
                    .multilineTextAlignment(.center)
                    .frame(minHeight: 16)

                LazyVGrid(columns: Array(repeating: GridItem(.flexible(), spacing: 4), count: 3), spacing: 4) {
                    ForEach(keys, id: \.self) { key in
                        keyButton(key)
                    }
                }
            }
        }
        .navigationTitle("Code")
        .disabled(fetching)
    }

    @ViewBuilder private var status: some View {
        if fetching {
            HStack(spacing: 4) {
                ProgressView().controlSize(.mini)
                Text("Ophalen…")
            }
        } else if let error {
            Text(error.message).foregroundStyle(Theme.overtime)
        } else {
            Text("Code van ‘Naar horloge’").foregroundStyle(Theme.muted)
        }
    }

    @ViewBuilder private func keyButton(_ key: String) -> some View {
        if key.isEmpty {
            Color.clear.frame(height: 26)
        } else {
            Button {
                press(key)
            } label: {
                Text(key)
                    .font(.system(size: 17, weight: .semibold, design: .rounded))
                    .frame(maxWidth: .infinity, minHeight: 26)
                    .background(key == "⌫" ? Color.white.opacity(0.06) : Color.white.opacity(0.14), in: RoundedRectangle(cornerRadius: 8))
            }
            .buttonStyle(.plain)
            .accessibilityLabel(key == "⌫" ? "Wissen" : key)
        }
    }

    private func press(_ key: String) {
        error = nil
        if key == "⌫" {
            if !digits.isEmpty { digits.removeLast() }
            return
        }
        guard digits.count < Handoff.codeLength else { return }
        digits.append(key)
        if digits.count == Handoff.codeLength { fetch() }
    }

    private func fetch() {
        fetching = true
        let code = digits
        Task {
            let result = await client.claim(code: code)
            fetching = false
            switch result {
            case .success(let plan):
                Haptics.play(.oneMinuteLeft)
                model.received(plan)
                dismiss()
            case .failure(let failure):
                WKInterfaceDevice.current().play(.failure)
                error = failure
                digits = ""
            }
        }
    }
}

#Preview {
    NavigationStack {
        CodeView(model: AppModel())
    }
}
