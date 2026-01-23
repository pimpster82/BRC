//
//  User.swift
//  BibleReadingCompanion
//
//  Created on 2026-01-23
//  Represents an authenticated user
//

import Foundation

/// Represents an authenticated user
struct User: Codable, Identifiable {
    let id: String          // Firebase UID
    let email: String
    let createdAt: Int64    // Unix timestamp (milliseconds)

    /// User settings
    var settings: UserSettings

    init(id: String, email: String, createdAt: Int64 = Int64(Date().timeIntervalSince1970 * 1000)) {
        self.id = id
        self.email = email
        self.createdAt = createdAt
        self.settings = UserSettings()
    }
}

/// User-specific settings
struct UserSettings: Codable {
    var language: String            // "de", "en", "es", "it", "fr"
    var meetingDay: Int             // 0=Sunday, 1=Monday, ..., 6=Saturday
    var isDarkMode: Bool
    var notificationsEnabled: Bool
    var reminderTime: String?       // "HH:mm" format (e.g., "09:00")

    init() {
        self.language = "en"        // Default language
        self.meetingDay = 1         // Default: Monday
        self.isDarkMode = false
        self.notificationsEnabled = false
        self.reminderTime = nil
    }
}
