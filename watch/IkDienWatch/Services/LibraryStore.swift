import Foundation
import IkDienEngine
import OSLog

/// Keeps the fetched trainings on the watch, so they can be given without a connection.
struct LibraryStore {
    private let url: URL
    private let log = Logger(subsystem: "be.ikdien.trainingen.watch", category: "LibraryStore")

    init(directory: URL = URL.applicationSupportDirectory) {
        url = directory.appending(path: "trainings.json")
    }

    func load() -> TrainingLibrary {
        guard let data = try? Data(contentsOf: url) else { return TrainingLibrary() }
        return TrainingLibrary.decode(from: data)
    }

    func save(_ library: TrainingLibrary) {
        do {
            try FileManager.default.createDirectory(at: url.deletingLastPathComponent(), withIntermediateDirectories: true)
            try library.encoded().write(to: url, options: .atomic)
        } catch {
            log.error("Saving the trainings failed: \(error.localizedDescription)")
        }
    }
}
