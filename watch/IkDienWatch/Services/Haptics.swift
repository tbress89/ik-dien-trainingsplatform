import IkDienEngine
import WatchKit

/// The taps on the wrist, one pattern per kind of alert, strong enough to feel while running around.
@MainActor
enum Haptics {
    static func play(_ kind: Alert.Kind) {
        switch kind {
        case .oneMinuteLeft:
            repeatHaptic(.notification, times: 1)
        case .timeUp:
            repeatHaptic(.stop, times: 3)
        case .stillOvertime:
            repeatHaptic(.retry, times: 2)
        }
    }

    static func tap() {
        WKInterfaceDevice.current().play(.click)
    }

    private static func repeatHaptic(_ type: WKHapticType, times: Int) {
        Task { @MainActor in
            for n in 0..<times {
                if n > 0 { try? await Task.sleep(for: .milliseconds(450)) }
                WKInterfaceDevice.current().play(type)
            }
        }
    }
}
