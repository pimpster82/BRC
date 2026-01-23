//
//  UserDefaultsService.swift
//  BibleReadingCompanion
//
//  Created on 2026-01-23
//  Offline-first local storage using UserDefaults
//

import Foundation

/// Service for managing local data persistence with UserDefaults
/// CRITICAL: This is the primary storage (offline-first), Firebase is secondary
class UserDefaultsService {

    static let shared = UserDefaultsService()

    private let defaults = UserDefaults.standard
    private let encoder = JSONEncoder()
    private let decoder = JSONDecoder()

    private init() {
        encoder.outputFormatting = .prettyPrinted
    }

    // MARK: - Storage Keys

    private enum Keys {
        // Progress
        static let dailyTextProgress = "bibleCompanion_dailyText"
        static let weeklyReadingProgress = "bibleCompanion_weeklyReading"
        static let personalReadingProgress = "bibleCompanion_personalReading"

        // Settings
        static let language = "app_language"
        static let meetingDay = "settings_meetingDay"
        static let selectedReadingPlan = "settings_readingPlan"
        static let showYeartext = "settings_showYeartext"
        static let themeMode = "settings_themeMode"

        // Sync
        static let syncQueue = "bibleCompanion_pendingSyncQueue"
        static let lastSyncTimestamp = "bibleCompanion_lastSync"

        // Admin
        static let adminMode = "app_adminMode"
        static let testDate = "app_testDate"

        // Cache
        static func scheduleKey(year: Int) -> String {
            return "bibleCompanion_schedule_\(year)"
        }

        static func yeartextKey(year: Int) -> String {
            return "bibleCompanion_yeartext_\(year)"
        }
    }

    // MARK: - Progress Storage

    /// Save daily text progress
    func saveDailyProgress(_ progress: DailyProgress) throws {
        let data = try encoder.encode(progress)
        defaults.set(data, forKey: Keys.dailyTextProgress)
    }

    /// Load daily text progress
    func loadDailyProgress() -> DailyProgress? {
        guard let data = defaults.data(forKey: Keys.dailyTextProgress) else {
            return nil
        }
        return try? decoder.decode(DailyProgress.self, from: data)
    }

    /// Save weekly reading progress
    func saveWeeklyProgress(_ progress: WeeklyProgress) throws {
        let data = try encoder.encode(progress)
        defaults.set(data, forKey: Keys.weeklyReadingProgress)
    }

    /// Load weekly reading progress
    func loadWeeklyProgress() -> WeeklyProgress? {
        guard let data = defaults.data(forKey: Keys.weeklyReadingProgress) else {
            return nil
        }
        return try? decoder.decode(WeeklyProgress.self, from: data)
    }

    /// Save personal reading progress
    func savePersonalProgress(_ progress: PersonalProgress) throws {
        let data = try encoder.encode(progress)
        defaults.set(data, forKey: Keys.personalReadingProgress)
    }

    /// Load personal reading progress
    func loadPersonalProgress() -> PersonalProgress? {
        guard let data = defaults.data(forKey: Keys.personalReadingProgress) else {
            return nil
        }
        return try? decoder.decode(PersonalProgress.self, from: data)
    }

    // MARK: - Settings Storage

    /// Save language preference
    func saveLanguage(_ language: String) {
        defaults.set(language, forKey: Keys.language)
    }

    /// Load language preference (defaults to device language or English)
    func loadLanguage() -> String {
        if let saved = defaults.string(forKey: Keys.language) {
            return saved
        }

        // Detect device language
        let deviceLanguage = Locale.current.languageCode ?? "en"
        let supportedLanguages = ["de", "en", "es", "it", "fr"]

        if supportedLanguages.contains(deviceLanguage) {
            return deviceLanguage
        }

        return "en" // Default to English
    }

    /// Save meeting day (0-6, Sunday-Saturday)
    func saveMeetingDay(_ day: Int) {
        defaults.set(day, forKey: Keys.meetingDay)
    }

    /// Load meeting day (defaults to Monday = 1)
    func loadMeetingDay() -> Int {
        if defaults.object(forKey: Keys.meetingDay) != nil {
            return defaults.integer(forKey: Keys.meetingDay)
        }
        return 1 // Default to Monday
    }

    /// Save selected reading plan
    func saveReadingPlan(_ plan: String) {
        defaults.set(plan, forKey: Keys.selectedReadingPlan)
    }

    /// Load selected reading plan (defaults to "free")
    func loadReadingPlan() -> String {
        return defaults.string(forKey: Keys.selectedReadingPlan) ?? "free"
    }

    /// Save yeartext visibility preference
    func saveShowYeartext(_ show: Bool) {
        defaults.set(show, forKey: Keys.showYeartext)
    }

    /// Load yeartext visibility (defaults to true)
    func loadShowYeartext() -> Bool {
        if defaults.object(forKey: Keys.showYeartext) != nil {
            return defaults.bool(forKey: Keys.showYeartext)
        }
        return true // Default to showing yeartext
    }

    /// Save theme mode
    func saveThemeMode(_ mode: String) {
        defaults.set(mode, forKey: Keys.themeMode)
    }

    /// Load theme mode (defaults to "system")
    func loadThemeMode() -> String {
        return defaults.string(forKey: Keys.themeMode) ?? "system"
    }

    // MARK: - Admin Storage

    /// Save admin mode status
    func saveAdminMode(_ enabled: Bool) {
        defaults.set(enabled, forKey: Keys.adminMode)
    }

    /// Load admin mode status
    func loadAdminMode() -> Bool {
        return defaults.bool(forKey: Keys.adminMode)
    }

    /// Save test date (for admin testing)
    func saveTestDate(_ date: Date?) {
        if let date = date {
            defaults.set(date.timeIntervalSince1970, forKey: Keys.testDate)
        } else {
            defaults.removeObject(forKey: Keys.testDate)
        }
    }

    /// Load test date
    func loadTestDate() -> Date? {
        let timestamp = defaults.double(forKey: Keys.testDate)
        guard timestamp > 0 else { return nil }
        return Date(timeIntervalSince1970: timestamp)
    }

    // MARK: - Cache Storage

    /// Save weekly reading schedule for a year
    func saveSchedule(_ schedule: WeeklyReadingSchedule, year: Int) throws {
        let data = try encoder.encode(schedule)
        defaults.set(data, forKey: Keys.scheduleKey(year: year))
    }

    /// Load weekly reading schedule for a year
    func loadSchedule(year: Int) -> WeeklyReadingSchedule? {
        guard let data = defaults.data(forKey: Keys.scheduleKey(year: year)) else {
            return nil
        }
        return try? decoder.decode(WeeklyReadingSchedule.self, from: data)
    }

    /// Save yeartext for a year
    func saveYeartext(_ yeartext: Yeartext, year: Int) throws {
        let data = try encoder.encode(yeartext)
        defaults.set(data, forKey: Keys.yeartextKey(year: year))
    }

    /// Load yeartext for a year
    func loadYeartext(year: Int) -> Yeartext? {
        guard let data = defaults.data(forKey: Keys.yeartextKey(year: year)) else {
            return nil
        }
        return try? decoder.decode(Yeartext.self, from: data)
    }

    // MARK: - Sync Queue Storage

    /// Save sync queue
    func saveSyncQueue(_ queue: [SyncQueueItem]) throws {
        let data = try encoder.encode(queue)
        defaults.set(data, forKey: Keys.syncQueue)
    }

    /// Load sync queue
    func loadSyncQueue() -> [SyncQueueItem] {
        guard let data = defaults.data(forKey: Keys.syncQueue) else {
            return []
        }
        return (try? decoder.decode([SyncQueueItem].self, from: data)) ?? []
    }

    /// Save last sync timestamp
    func saveLastSyncTimestamp(_ timestamp: Date) {
        defaults.set(timestamp.timeIntervalSince1970, forKey: Keys.lastSyncTimestamp)
    }

    /// Load last sync timestamp
    func loadLastSyncTimestamp() -> Date? {
        let timestamp = defaults.double(forKey: Keys.lastSyncTimestamp)
        guard timestamp > 0 else { return nil }
        return Date(timeIntervalSince1970: timestamp)
    }

    // MARK: - Reset Functions

    /// Reset all settings (preserve progress)
    func resetSettings() {
        defaults.removeObject(forKey: Keys.language)
        defaults.removeObject(forKey: Keys.meetingDay)
        defaults.removeObject(forKey: Keys.selectedReadingPlan)
        defaults.removeObject(forKey: Keys.showYeartext)
        defaults.removeObject(forKey: Keys.themeMode)
        defaults.removeObject(forKey: Keys.adminMode)
        defaults.removeObject(forKey: Keys.testDate)
    }

    /// Reset all progress (DESTRUCTIVE)
    func resetAllProgress() {
        defaults.removeObject(forKey: Keys.dailyTextProgress)
        defaults.removeObject(forKey: Keys.weeklyReadingProgress)
        defaults.removeObject(forKey: Keys.personalReadingProgress)
    }

    /// Clear all data (NUCLEAR OPTION)
    func clearAll() {
        let domain = Bundle.main.bundleIdentifier!
        defaults.removePersistentDomain(forName: domain)
    }
}

// MARK: - Supporting Types

struct WeeklyReadingSchedule: Codable {
    let year: Int
    let weeks: [WeekReading]
}

struct WeekReading: Codable {
    let weekNumber: Int
    let reading: Reading
}

struct Yeartext: Codable {
    let year: Int
    let translations: [String: YeartextTranslation] // language code -> translation
}

struct YeartextTranslation: Codable {
    let scripture: String
    let text: String
}

struct SyncQueueItem: Codable, Identifiable {
    let id: String
    let section: String // "daily", "weekly", "personal"
    let action: String  // "mark_complete", "unmark", etc.
    let timestamp: Int64
    let data: [String: String]
    var synced: Bool
    var retries: Int
}
