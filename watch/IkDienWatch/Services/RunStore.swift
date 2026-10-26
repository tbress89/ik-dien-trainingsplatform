import Foundation
import IkDienEngine
import OSLog

/// Keeps the running training on disk, so it is still there after the app is relaunched.
struct RunStore {
    private let url: URL
    private let log = Logger(subsystem: "be.ikdien.trainingen.watch", category: "RunStore")

    init(directory: URL = URL.applicationSupportDirectory) {
        url = directory.appending(path: "running-training.json")
    }

    func load() -> SavedRun? {
        guard let data = try? Data(contentsOf: url) else { return nil }
        return SavedRun.decode(from: data)
    }

    func save(_ run: SavedRun) {
        do {
            try FileManager.default.createDirectory(at: url.deletingLastPathComponent(), withIntermediateDirectories: true)
            // Atomic, so a crash mid-write leaves the previous version instead of half a file.
            try run.encoded().write(to: url, options: .atomic)
        } catch {
            // The training keeps running; only resuming after a relaunch won't work.
            log.error("Saving the running training failed: \(error.localizedDescription)")
        }
    }

    func clear() {
        try? FileManager.default.removeItem(at: url)
    }
}
