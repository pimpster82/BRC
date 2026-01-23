//
//  PersonalProgress.swift
//  BibleReadingCompanion
//
//  Created on 2026-01-23
//  Tracks personal reading plan progress (unified tracking system)
//

import Foundation

/// Tracks personal Bible reading progress
/// Uses unified chaptersRead array as single source of truth
struct PersonalProgress: Codable {
    var chaptersRead: [ChapterRead]     // Single source of truth for all plans
    var thematicTopicsRead: [String]    // Topic IDs for thematic plan
    var selectedPlan: PersonalReadingPlan
    var lastUpdated: Int64?             // Unix timestamp (milliseconds)

    init() {
        self.chaptersRead = []
        self.thematicTopicsRead = []
        self.selectedPlan = .free
        self.lastUpdated = nil
    }

    /// Build index for O(1) lookups
    func buildChaptersIndex() -> [String: ChapterRead] {
        var index: [String: ChapterRead] = [:]
        for chapter in chaptersRead {
            index[chapter.id] = chapter
        }
        return index
    }

    /// Check if a specific chapter is read
    func isChapterRead(book: Int, chapter: Int, status: ReadingStatus? = nil) -> Bool {
        let key = "\(book):\(chapter)"
        guard let chapterData = chaptersRead.first(where: { $0.id == key }) else {
            return false
        }
        if let status = status {
            return chapterData.status == status
        }
        return true
    }

    /// Check if a reading (multiple chapters) is complete
    func isReadingComplete(_ reading: Reading) -> Bool {
        for ch in reading.startChapter...reading.endChapter {
            if !isChapterRead(book: reading.book, chapter: ch, status: .complete) {
                return false
            }
        }
        return true
    }

    /// Mark a chapter as read
    mutating func markChapterRead(book: Int, chapter: Int, status: ReadingStatus, source: String? = nil) {
        // Remove existing entry if present
        chaptersRead.removeAll { $0.book == book && $0.chapter == chapter }

        // Add new entry
        let newChapter = ChapterRead(book: book, chapter: chapter, status: status, source: source)
        chaptersRead.append(newChapter)

        lastUpdated = Int64(Date().timeIntervalSince1970 * 1000)
    }

    /// Mark entire reading (multiple chapters) as complete
    mutating func markReadingComplete(_ reading: Reading, source: String? = nil) {
        for ch in reading.startChapter...reading.endChapter {
            markChapterRead(book: reading.book, chapter: ch, status: .complete, source: source)
        }
    }

    /// Unmark a chapter
    mutating func unmarkChapter(book: Int, chapter: Int) {
        chaptersRead.removeAll { $0.book == book && $0.chapter == chapter }
        lastUpdated = Int64(Date().timeIntervalSince1970 * 1000)
    }

    /// Unmark entire reading (multiple chapters)
    mutating func unmarkReading(_ reading: Reading) {
        for ch in reading.startChapter...reading.endChapter {
            unmarkChapter(book: reading.book, chapter: ch)
        }
    }

    /// Calculate overall Bible progress (verse-based)
    func calculateOverallProgress(bibleBooks: [BibleBook]) -> ProgressStats {
        var totalVerses = 0
        var readVerses = 0

        for book in bibleBooks {
            totalVerses += book.totalVerses

            let bookChapters = chaptersRead.filter { $0.book == book.number && $0.status == .complete }
            for chapterRead in bookChapters {
                readVerses += book.verseCount(for: chapterRead.chapter)
            }
        }

        let percentage = totalVerses > 0 ? Int((Double(readVerses) / Double(totalVerses)) * 100) : 0

        return ProgressStats(completed: readVerses, total: totalVerses, percentage: percentage)
    }
}

/// Personal reading plan types
enum PersonalReadingPlan: String, Codable, CaseIterable {
    case free = "free"
    case oneYear = "oneyear"
    case bibleOverview = "bible_overview"
    case thematic = "thematic"

    var displayName: String {
        switch self {
        case .free: return "Free Reading"
        case .oneYear: return "1 Year Bible Plan"
        case .bibleOverview: return "Bible Overview"
        case .thematic: return "Thematic Plan"
        }
    }
}

/// Progress statistics
struct ProgressStats {
    let completed: Int
    let total: Int
    let percentage: Int
}
