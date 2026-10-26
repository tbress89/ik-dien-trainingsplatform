import Foundation
import IkDienEngine

/// Fetches a training by its 4-digit code from Supabase (`claim_watch_code`), with the public anon key.
struct HandoffClient {
    let baseURL: URL?
    let anonKey: String

    /// The address and key built into the app (Config/Watch.xcconfig → Info.plist).
    static let live: HandoffClient = {
        var url = Bundle.main.object(forInfoDictionaryKey: "SupabaseURL") as? String ?? ""
        var key = Bundle.main.object(forInfoDictionaryKey: "SupabaseAnonKey") as? String ?? ""
        #if DEBUG
        // Launch with -supabaseURL … -supabaseAnonKey … to try against another project or a local stand-in.
        url = UserDefaults.standard.string(forKey: "supabaseURL") ?? url
        key = UserDefaults.standard.string(forKey: "supabaseAnonKey") ?? key
        #endif
        let base = URL(string: url).flatMap { $0.scheme?.hasPrefix("http") == true ? $0 : nil }
        return HandoffClient(baseURL: base, anonKey: key)
    }()

    func claim(code: String) async -> Result<TrainingPlan, HandoffError> {
        guard let baseURL, !anonKey.isEmpty else { return .failure(.notConfigured) }
        guard Handoff.isValid(code: code) else { return .failure(.unknownCode) }

        var request = URLRequest(url: baseURL.appending(path: "rest/v1/rpc/claim_watch_code"), timeoutInterval: 15)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.setValue(anonKey, forHTTPHeaderField: "apikey")
        request.setValue("Bearer \(anonKey)", forHTTPHeaderField: "Authorization")
        request.httpBody = Handoff.claimBody(code: code)

        do {
            let (data, response) = try await URLSession.shared.data(for: request)
            return Handoff.interpret(status: (response as? HTTPURLResponse)?.statusCode ?? 0, body: data)
        } catch {
            return .failure(.offline)
        }
    }
}
