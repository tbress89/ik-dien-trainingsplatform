import IkDienEngine
import SwiftUI

/// Colours from the site (codebase/src/styles.css), lightened where needed to read well on a black screen.
enum Theme {
    static let accent = Color(red: 0x6F / 255, green: 0x42 / 255, blue: 0xE0 / 255)
    static let card = Color(red: 0x1C / 255, green: 0x15 / 255, blue: 0x30 / 255)
    static let muted = Color(red: 0xB8 / 255, green: 0xAE / 255, blue: 0xD2 / 255)
    static let overtime = Color(red: 0xFF / 255, green: 0x7A / 255, blue: 0x66 / 255)
    static let overtimeMuted = Color(red: 0xE6 / 255, green: 0xB8 / 255, blue: 0xB0 / 255)
    static let overtimeBackground = Color(red: 0x2A / 255, green: 0x0C / 255, blue: 0x0A / 255)
    static let warning = Color(red: 0xF2 / 255, green: 0xA5 / 255, blue: 0x41 / 255)

    static func color(for block: BlockID) -> Color {
        switch block {
        case .wu: Color(red: 0xF2 / 255, green: 0xA5 / 255, blue: 0x41 / 255)
        case .kern: Color(red: 0x2F / 255, green: 0xC4 / 255, blue: 0xA3 / 255)
        case .pv: Color(red: 0xA7 / 255, green: 0x8B / 255, blue: 0xEF / 255)
        }
    }

    /// Big countdown numerals; tabular so the digits don't jump while counting.
    static func timer(size: CGFloat, weight: Font.Weight = .bold) -> Font {
        .system(size: size, weight: weight, design: .rounded).monospacedDigit()
    }
}

extension TrainingPlan {
    /// "U11 · Positiespel", or just the theme for a training without a team name.
    var title: String {
        team.isEmpty ? theme : "\(team) · \(theme)"
    }

    /// "dinsdag 27 oktober"
    var formattedDate: String {
        let parser = DateFormatter()
        parser.calendar = Calendar(identifier: .gregorian)
        parser.dateFormat = "yyyy-MM-dd"
        guard let day = parser.date(from: date) else { return date }
        return day.formatted(.dateTime.weekday(.wide).day().month(.wide).locale(Locale(identifier: "nl_BE")))
    }
}
