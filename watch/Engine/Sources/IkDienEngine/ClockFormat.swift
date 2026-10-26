import Foundation

/// How times are written on the watch, matching "Training geven" on the site.
public enum ClockFormat {
    /// 462 s → "7:42". Rounds up, so the clock only shows 0:00 when time is really up.
    public static func countdown(_ seconds: TimeInterval) -> String {
        let s = Int(max(0, seconds).rounded(.up))
        return "\(s / 60):\(String(format: "%02d", s % 60))"
    }

    /// 38 s → "+0:38". Rounds down, so overtime starts at +0:00.
    public static func overtime(_ seconds: TimeInterval) -> String {
        let s = Int(max(0, seconds).rounded(.down))
        return "+\(s / 60):\(String(format: "%02d", s % 60))"
    }

    /// Drift as whole minutes: "+2′", "−1′" or "op schema" within half a minute.
    public static func drift(_ seconds: TimeInterval) -> String {
        let minutes = Int((seconds / 60).rounded())
        if minutes == 0 { return "op schema" }
        return minutes > 0 ? "+\(minutes)′" : "−\(-minutes)′"
    }

    /// Clock time in the Belgian 24-hour style: "19:47".
    public static func time(_ date: Date, calendar: Calendar = .current) -> String {
        let c = calendar.dateComponents([.hour, .minute], from: date)
        return "\(c.hour ?? 0):\(String(format: "%02d", c.minute ?? 0))"
    }
}
