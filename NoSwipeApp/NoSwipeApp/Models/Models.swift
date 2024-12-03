// Models.swift

import Foundation

struct UserPreferences: Codable {
    let preferred_gender: String?
    let preferred_age_min: Int?
    let preferred_age_max: Int?
    // Add other preference fields as needed
}