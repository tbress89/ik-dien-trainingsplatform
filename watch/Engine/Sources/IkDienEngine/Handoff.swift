import Foundation

/// Why fetching a training by code didn't work, in words the coach can act on.
public enum HandoffError: Error, Equatable, Sendable {
    /// The app was built without the Supabase address.
    case notConfigured
    /// No connection, or the server didn't answer.
    case offline
    /// The code doesn't exist (anymore): mistyped, expired after 15 minutes, or already used.
    case unknownCode
    /// Too many wrong codes were tried in the last minute (by anyone).
    case tooManyAttempts
    /// The training is in a newer format than this watch app knows.
    case needsUpdate
    /// Anything else the server or the payload got wrong.
    case failed

    public var message: String {
        switch self {
        case .notConfigured: "Deze versie van de app kan geen trainingen ophalen."
        case .offline: "Geen verbinding. Probeer opnieuw."
        case .unknownCode: "Onbekende of verlopen code. Vraag een nieuwe op de site."
        case .tooManyAttempts: "Te veel pogingen. Wacht een minuut."
        case .needsUpdate: "Werk de app bij om deze training te openen."
        case .failed: "Ophalen mislukt. Probeer opnieuw."
        }
    }
}

/// The "Naar horloge" handoff with the site (see supabase/migrations/0003_watch_handoff.sql).
public enum Handoff {
    public static let codeLength = 4

    /// Whether `code` can be a code at all: exactly four digits.
    public static func isValid(code: String) -> Bool {
        code.count == codeLength && code.allSatisfy { $0.isASCII && $0.isNumber }
    }

    /// The request body for `claim_watch_code`.
    public static func claimBody(code: String) -> Data {
        // Only digits get here, so no escaping is needed.
        Data(#"{"p_code":"\#(code)"}"#.utf8)
    }

    /// Reads the answer of `claim_watch_code`: the training, or why there isn't one.
    public static func interpret(status: Int, body: Data) -> Result<TrainingPlan, HandoffError> {
        guard (200..<300).contains(status) else {
            // PostgREST reports `raise exception` as a JSON error with the message.
            let message = (try? JSONDecoder().decode(ServerError.self, from: body))?.message ?? ""
            return .failure(message.contains("too many attempts") ? .tooManyAttempts : .failed)
        }
        if body.isEmpty || String(decoding: body, as: UTF8.self).trimmingCharacters(in: .whitespacesAndNewlines) == "null" {
            return .failure(.unknownCode)
        }
        do {
            return .success(try TrainingPlan.decode(from: body))
        } catch TrainingPlan.DecodingError.unsupportedVersion {
            return .failure(.needsUpdate)
        } catch {
            return .failure(.failed)
        }
    }

    private struct ServerError: Decodable {
        var message: String
    }
}
