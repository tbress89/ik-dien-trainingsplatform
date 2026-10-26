import IkDienEngine
import SwiftUI

/**
 * Giving the training: the timer page (screens 4 and 6 in the design) with the coaching points one page
 * down (screen 5), the time-up screen (7) when the exercise runs over, and "Klaar" at the end.
 * With the wrist down (Always On) the same pages show dimmed (screen 11).
 */
struct RunView: View {
    let session: RunSession
    @Environment(\.dismiss) private var dismiss
    @Environment(\.isLuminanceReduced) private var dimmed
    @State private var confirmStop = false

    var body: some View {
        TimelineView(.periodic(from: .now, by: 1)) { context in
            let t = session.timeline(at: context.date)
            Group {
                if t.current == nil {
                    FinishedView(timeline: t, close: dismiss.callAsFunction)
                } else if t.phase == .timeUp && !dimmed {
                    TimeUpView(session: session, timeline: t)
                } else {
                    TabView {
                        TimerPage(session: session, timeline: t)
                        CoachingPage(session: session, timeline: t)
                    }
                    .tabViewStyle(.verticalPage)
                }
            }
            .toolbar {
                if t.current != nil {
                    ToolbarItem(placement: .cancellationAction) {
                        Button("Stoppen", systemImage: "xmark") { confirmStop = true }
                    }
                }
            }
        }
        .background(Color.black.ignoresSafeArea())
        .confirmationDialog("Training stoppen?", isPresented: $confirmStop, titleVisibility: .visible) {
            Button("Stoppen", role: .destructive) {
                session.stop()
                dismiss()
            }
            Button("Verder", role: .cancel) {}
        }
    }
}

// MARK: - Timer page

/// "Oefening loopt" and "Nog 1 minuut": the countdown ring with the schedule underneath.
private struct TimerPage: View {
    let session: RunSession
    let timeline: Timeline
    @Environment(\.isLuminanceReduced) private var dimmed

    var body: some View {
        let t = timeline
        let item = t.current!
        let blockColor = Theme.color(for: item.block)
        let ringColor = t.phase == .lastMinute ? Theme.warning : blockColor

        VStack(spacing: 2) {
            VStack(alignment: .leading, spacing: 0) {
                if t.phase == .lastMinute {
                    Text("Nog 1 minuut")
                        .font(.caption2.weight(.bold))
                        .foregroundStyle(Theme.warning)
                    Text(session.nextItem.map { "Hierna: \($0.title)" } ?? "Laatste oefening")
                        .font(.caption.weight(.semibold))
                        .foregroundStyle(.secondary)
                        .lineLimit(1)
                } else {
                    Text("\(item.block.name) · \(t.position)/\(t.count)")
                        .font(.caption2.weight(.bold))
                        .foregroundStyle(blockColor)
                    Text(item.title)
                        .font(.caption.weight(.semibold))
                        .lineLimit(1)
                }
            }
            .frame(maxWidth: .infinity, alignment: .leading)
            .padding(.leading, 4)

            ZStack {
                Circle().stroke(ringColor.opacity(dimmed ? 0.12 : 0.2), lineWidth: dimmed ? 3 : 6)
                Circle()
                    .trim(from: 0, to: 1 - t.progress)
                    .stroke(ringColor.opacity(dimmed ? 0.6 : 1), style: StrokeStyle(lineWidth: dimmed ? 3 : 6, lineCap: .round))
                    .rotationEffect(.degrees(-90))
                // The countdown is sized from the ring, so "14:58" fits on a 40 mm watch as well as a 49 mm one.
                // (A timer text doesn't shrink to fit by itself; it cuts off the seconds instead.)
                GeometryReader { geo in
                    let inner = min(geo.size.width, geo.size.height) - 20
                    VStack(spacing: 0) {
                        Countdown(timeline: t)
                            .font(Theme.timer(size: Theme.timerSize(fitting: inner, characters: 5), weight: dimmed ? .medium : .bold))
                            .lineLimit(1)
                            .foregroundStyle(t.phase == .lastMinute ? Theme.warning : .primary)
                            .opacity(dimmed ? 0.75 : 1)
                        Text(t.phase == .paused ? "pauze" : "tot \(ClockFormat.time(t.itemEndsAt))")
                            .font(.system(size: 11))
                            .foregroundStyle(.secondary)
                    }
                    .frame(width: geo.size.width, height: geo.size.height)
                }
            }
            .aspectRatio(1, contentMode: .fit)
            .frame(maxWidth: .infinity, maxHeight: .infinity)
        }
        .toolbar {
            ToolbarItemGroup(placement: .bottomBar) {
                if t.phase == .lastMinute {
                    Button("+1′") { session.addMinutes(1) }
                        .accessibilityLabel("Eén minuut erbij")
                } else {
                    Button(t.phase == .paused ? "Verder" : "Pauze", systemImage: t.phase == .paused ? "play.fill" : "pause.fill", action: session.togglePause)
                }

                ScheduleSummary(timeline: t, totalMinutes: session.plan.totalMinutes)

                Button(session.nextItem == nil ? "Training afronden" : "Volgende oefening", systemImage: "chevron.right", action: session.next)
                    .tint(blockColor)
            }
        }
    }
}

/// The countdown. While running it is a system timer text, which keeps counting the seconds correctly
/// with the wrist down, when the app itself only redraws about once a minute.
private struct Countdown: View {
    let timeline: Timeline

    var body: some View {
        if timeline.phase == .paused {
            Text(ClockFormat.countdown(timeline.remaining))
        } else {
            Text(timerInterval: Date.now...timeline.itemEndsAt, countsDown: true, showsHours: false)
                .multilineTextAlignment(.center)
        }
    }
}

/// "39′ van 75′" and the expected end, with the drift once it matters.
private struct ScheduleSummary: View {
    let timeline: Timeline
    let totalMinutes: Int

    var body: some View {
        VStack(spacing: 0) {
            Text("\(Int(timeline.elapsed / 60))′ van \(totalMinutes)′")
                .font(.caption2.weight(.semibold).monospacedDigit())
            // On schedule the end time is enough; the drift appears once it's half a minute or more.
            Text(abs(timeline.drift) < 30
                 ? "einde \(ClockFormat.time(timeline.expectedEnd))"
                 : "\(ClockFormat.drift(timeline.drift)) · \(ClockFormat.time(timeline.expectedEnd))")
                .font(.caption2.weight(.bold))
                .lineLimit(1)
                .minimumScaleFactor(0.8)
                .foregroundStyle(timeline.drift >= 90 ? Theme.warning : .secondary)
        }
    }
}

// MARK: - Coaching page

/// One page down from the timer: the coaching points to read out, and the organisation.
private struct CoachingPage: View {
    let session: RunSession
    let timeline: Timeline

    var body: some View {
        let item = timeline.current!
        let color = Theme.color(for: item.block)
        ScrollView {
            VStack(alignment: .leading, spacing: 6) {
                HStack {
                    Countdown(timeline: timeline)
                        .font(Theme.timer(size: 22))
                        .foregroundStyle(color)
                    Spacer()
                }
                Text("COACHING")
                    .font(.caption2.weight(.bold))
                    .foregroundStyle(.secondary)
                ForEach(Array(item.coaching.enumerated()), id: \.offset) { n, point in
                    HStack(alignment: .top, spacing: 8) {
                        Text("\(n + 1)")
                            .font(.caption2.weight(.bold))
                            .foregroundStyle(color)
                            .frame(width: 18, height: 18)
                            .background(color.opacity(0.2), in: Circle())
                        Text(point)
                            .font(.footnote)
                            .fixedSize(horizontal: false, vertical: true)
                    }
                    .padding(8)
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .background(Color.white.opacity(0.08), in: RoundedRectangle(cornerRadius: 12))
                }
                let facts = [item.field, item.players.map { "\($0) spelers" }].compactMap { $0 }
                if !facts.isEmpty {
                    Text(facts.joined(separator: " · "))
                        .font(.caption2)
                        .foregroundStyle(.secondary)
                }
            }
        }
    }
}

// MARK: - Time up

/// "Tijd om": overtime counting up in red, and the way on to the next exercise.
private struct TimeUpView: View {
    let session: RunSession
    let timeline: Timeline

    var body: some View {
        VStack(spacing: 6) {
            VStack(spacing: 0) {
                Text("Tijd om")
                    .font(.footnote.weight(.bold))
                    .foregroundStyle(Theme.overtime)
                // Counts up from the moment time ran out, sized to the screen width like the countdown.
                GeometryReader { geo in
                    HStack(spacing: 0) {
                        Text("+")
                        Text(timerInterval: timeline.itemEndsAt...Date.distantFuture, countsDown: false, showsHours: false)
                    }
                    // "+14:58", or one more digit once overtime passes 100 minutes.
                    .font(Theme.timer(size: Theme.timerSize(fitting: geo.size.width - 8, characters: timeline.overtime >= 6000 ? 7 : 6, max: 44)))
                    .lineLimit(1)
                    .foregroundStyle(Theme.overtime)
                    .frame(width: geo.size.width, height: geo.size.height)
                }
                .frame(height: 48)
                .accessibilityElement(children: .combine)
                .accessibilityLabel("Overtijd")
                Text("einde schuift naar \(ClockFormat.time(timeline.expectedEnd))")
                    .font(.caption2)
                    .lineLimit(1)
                    .minimumScaleFactor(0.75)
                    .foregroundStyle(Theme.overtimeMuted)
            }
            .frame(maxHeight: .infinity)

            Button(action: session.next) {
                HStack(spacing: 4) {
                    Text(session.nextItem.map { "Volgende: \($0.title)" } ?? "Training afronden")
                        .lineLimit(1)
                    Image(systemName: "chevron.right")
                }
                .font(.footnote.weight(.bold))
                .frame(maxWidth: .infinity)
            }
            .tint(Theme.color(for: session.nextItem?.block ?? .pv))
            .foregroundStyle(.black)
            .buttonStyle(.borderedProminent)

            HStack(spacing: 6) {
                Button("+1′") { session.addMinutes(1) }
                Button("+3′") { session.addMinutes(3) }
            }
            .font(.footnote.weight(.bold))
        }
        .background(Theme.overtimeBackground.ignoresSafeArea())
    }
}

// MARK: - Finished

/// "Klaar": how long it took. The full summary per exercise comes in phase 4.
private struct FinishedView: View {
    let timeline: Timeline
    let close: () -> Void

    var body: some View {
        VStack(spacing: 6) {
            Text("Klaar")
                .font(.headline)
                .foregroundStyle(Theme.color(for: .pv))
            Text("\(Int((timeline.elapsed / 60).rounded()))′")
                .font(Theme.timer(size: 44))
            Text(abs(timeline.drift) < 30 ? "op tijd klaar" : "\(ClockFormat.drift(timeline.drift)) op het schema")
                .font(.footnote)
                .foregroundStyle(.secondary)
            Button("Sluiten", action: close)
                .tint(Theme.accent)
                .buttonStyle(.borderedProminent)
        }
    }
}

#Preview {
    RunView(session: .start(plan: .sample))
}
