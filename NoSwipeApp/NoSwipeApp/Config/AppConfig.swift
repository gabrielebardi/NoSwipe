import Foundation

struct AppConfig {
    static let serverURLs = [
        "http://127.0.0.1:8000",
        "http://192.168.1.214:8000",
        "http://localhost:8000"
    ]
    
    static var currentServerURL: String {
        get {
            UserDefaults.standard.string(forKey: "currentServerURL") ?? serverURLs[0]
        }
        set {
            UserDefaults.standard.set(newValue, forKey: "currentServerURL")
        }
    }
    
    static func resetServerURL() {
        UserDefaults.standard.removeObject(forKey: "currentServerURL")
    }
} 