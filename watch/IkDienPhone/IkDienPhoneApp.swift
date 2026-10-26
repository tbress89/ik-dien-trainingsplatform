import SwiftUI

/**
 * The iPhone app only carries the watch app: installing it puts Ik Dien on the paired Apple Watch, which
 * is also how Xcode gets the watch app onto a real watch. The watch app runs on its own
 * (WKRunsIndependentlyOfCompanionApp); everything happens on the watch and on the site.
 */
@main
struct IkDienPhoneApp: App {
    var body: some Scene {
        WindowGroup {
            CarrierView()
        }
    }
}

struct CarrierView: View {
    var body: some View {
        VStack(spacing: 20) {
            Image(systemName: "applewatch")
                .font(.system(size: 64, weight: .light))
                .foregroundStyle(.tint)
                .accessibilityHidden(true)
            Text("Ik Dien staat op je Apple Watch")
                .font(.title2.weight(.bold))
                .multilineTextAlignment(.center)
            VStack(alignment: .leading, spacing: 12) {
                Step(number: 1, text: "Open Ik Dien op je horloge.")
                Step(number: 2, text: "Kies op trainingen.ikdien.be een training en tik bij Training geven op ‘Naar horloge’.")
                Step(number: 3, text: "Tik op het horloge op Code en typ de vier cijfers.")
            }
            Text("Deze app hoef je verder niet te openen; de training loopt op je horloge, ook zonder iPhone in de buurt.")
                .font(.footnote)
                .foregroundStyle(.secondary)
                .multilineTextAlignment(.center)
        }
        .padding(24)
        .frame(maxWidth: 480)
    }
}

private struct Step: View {
    let number: Int
    let text: String

    var body: some View {
        HStack(alignment: .firstTextBaseline, spacing: 12) {
            Text("\(number)")
                .font(.subheadline.weight(.bold))
                .foregroundStyle(.white)
                .frame(width: 26, height: 26)
                .background(.tint, in: Circle())
            Text(text)
                .font(.body)
                .fixedSize(horizontal: false, vertical: true)
        }
    }
}

#Preview {
    CarrierView()
}
