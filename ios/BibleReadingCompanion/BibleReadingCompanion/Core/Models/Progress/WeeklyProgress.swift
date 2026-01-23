//
//  WeeklyProgress.swift
//  BibleReadingCompanion
//
//  Created on 2026-01-23
//  Tracks weekly Bible reading progress
//

import Foundation

/// Tracks completion of weekly Bible reading assignments
struct WeeklyProgress: Codable {
    var completedWeeks: [CompletedWeek]
    var currentMeetingDay: Int          // 0=Sunday, 1=Monday, ..., 6=Saturday
    var lastUpdated: Int64?             // Unix timestamp (milliseconds)

    init() {
        self.completedWeeks = []
        self.currentMeetingDay = 1      // Default: Monday
        self.lastUpdated = nil
    }

    /// Check if a specific week is fully completed
    func isWeekComplete(weekStart: String) -> Bool {
        return completedWeeks.contains { $0.weekStart == weekStart && $0.isComplete }
    }

    /// Get completed chapters for a specific week
    func getCompletedChapters(weekStart: String) -> Set<Int> {
        guard let week = completedWeeks.first(where: { $0.weekStart == weekStart }) else {
            return []
        }
        return Set(week.chapters)
    }

    /// Mark a chapter as complete for a specific week
    mutating func markChapterComplete(weekStart: String, chapterIndex: Int, totalChapters: Int) {
        if let index = completedWeeks.firstIndex(where: { $0.weekStart == weekStart }) {
            var week = completedWeeks[index]
            if !week.chapters.contains(chapterIndex) {
                week.chapters.append(chapterIndex)
                week.isComplete = week.chapters.count == totalChapters
                completedWeeks[index] = week
            }
        } else {
            let newWeek = CompletedWeek(
                weekStart: weekStart,
                chapters: [chapterIndex],
                isComplete: totalChapters == 1
            )
            completedWeeks.append(newWeek)
        }
        lastUpdated = Int64(Date().timeIntervalSince1970 * 1000)
    }

    /// Unmark a chapter for a specific week
    mutating func unmarkChapter(weekStart: String, chapterIndex: Int) {
        if let index = completedWeeks.firstIndex(where: { $0.weekStart == weekStart }) {
            var week = completedWeeks[index]
            week.chapters.removeAll { $0 == chapterIndex }
            week.isComplete = false

            if week.chapters.isEmpty {
                completedWeeks.remove(at: index)
            } else {
                completedWeeks[index] = week
            }
            lastUpdated = Int64(Date().timeIntervalSince1970 * 1000)
        }
    }
}

/// Represents a completed week of Bible reading
struct CompletedWeek: Codable, Equatable {
    let weekStart: String       // "YYYY-MM-DD" format
    var chapters: [Int]         // Array of chapter indices (0-based)
    var isComplete: Bool
}
