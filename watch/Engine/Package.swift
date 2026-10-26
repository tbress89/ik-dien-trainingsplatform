// swift-tools-version: 6.0
import PackageDescription

/// The watch app's timekeeping, without any UI: the training plan it receives, the state of a running
/// training and everything derived from it. Builds for macOS too, so `swift test` runs without a simulator.
let package = Package(
    name: "IkDienEngine",
    defaultLocalization: "nl",
    platforms: [.watchOS(.v11), .macOS(.v14)],
    products: [
        .library(name: "IkDienEngine", targets: ["IkDienEngine"]),
    ],
    targets: [
        .target(
            name: "IkDienEngine",
            resources: [.process("Resources")]
        ),
        .testTarget(
            name: "IkDienEngineTests",
            dependencies: ["IkDienEngine"]
        ),
    ]
)
