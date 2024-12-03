import Foundation

struct UserProfile: Codable {
    let username: String
    let email: String
    let gender: String?
    let age: Int?
    let location: String?
}
