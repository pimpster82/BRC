//
//  DailyProgress.swift
//  BibleReadingCompanion
//
//  Created on 2026-01-23
//  Tracks daily text reading progress
//

import Foundation

/// Tracks completion of daily Bible text reading
struct DailyProgress: Codable {
    var completedDates: [String]    // Array of "YYYY-MM-DD" strings
    var currentStreak: Int
    var longestStreak: Int
    var lastUpdated: Int64?         // Unix timestamp (milliseconds)

    init() {
        self.completedDates = []
        self.currentStreak = 0
        self.longestStreak = 0
        self.lastUpdated = nil
    }

    /// Check if a specific date is marked complete
    func isComplete(date: Date) -> Bool {
        let dateString = date.toYYYYMMDD()
        return completedDates.contains(dateString)
    }

    /// Mark a date as complete
    mutating func markComplete(date: Date) {
        let dateString = date.toYYYYMMDD()
        if !completedDates.contains(dateString) {
            completedDates.append(dateString)
            completedDates.sort()
            recalculateStreak()
            lastUpdated = Int64(Date().timeIntervalSince1970 * 1000)
        }
    }

    /// Unmark a date
    mutating func unmarkComplete(date: Date) {
        let dateString = date.toYYYYMMDD()
        completedDates.removeAll { $0 == dateString }
        recalculateStreak()
        lastUpdated = Int64(Date().timeIntervalSince1970 * 1000)
    }

    /// Recalculate current streak based on completed dates
    private mutating func recalculateStreak() {
        guard !completedDates.isEmpty else {
            currentStreak = 0
            return
        }

        let sortedDates = completedDates.sorted().reversed()
        let today = Date().toYYYYMMDD()

        var streak = 0
        var checkDate = Date()

        // Check if today is completed
        if sortedDates.first == today {
            streak = 1
            checkDate = Calendar.current.date(byAdding: .day, value: -1, to: checkDate) ?? checkDate
        } else {
            // Check if yesterday was completed
            let yesterday = Calendar.current.date(byAdding: .day, value: -1, to: Date())?.toYYYYMMDD() ?? ""
            if sortedDates.first != yesterday {
                currentStreak = 0
                return
            }
            streak = 1
            checkDate = Calendar.current.date(byAdding: .day, value: -2, to: Date()) ?? checkDate
        }

        // Count consecutive days backwards
        for i in 1..<sortedDates.count {
            let expectedDate = checkDate.toYYYYMMDD()
            if sortedDates[i] == expectedDate {
                streak += 1
                checkDate = Calendar.current.date(byAdding: .day, value: -1, to: checkDate) ?? checkDate
            } else {
                break
            }
        }

        currentStreak = streak
        if streak > longestStreak {
            longestStreak = streak
        }
    }
}

// MARK: - Date Extension
private extension Date {
    func toYYYYMMDD() -> String {
        let formatter = DateFormatter()
        formatter.dateFormat = "yyyy-MM-dd"
        return formatter.string(from: self)
    }
}
