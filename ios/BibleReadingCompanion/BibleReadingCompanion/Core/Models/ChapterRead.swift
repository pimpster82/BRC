//
//  ChapterRead.swift
//  BibleReadingCompanion
//
//  Created on 2026-01-23
//  Represents a single chapter that has been read
//

import Foundation

/// Represents a single Bible chapter that has been read
/// This is the core data structure for unified progress tracking
struct ChapterRead: Codable, Identifiable, Equatable, Hashable {
    let book: Int           // Book number (1-66)
    let chapter: Int
    let status: ReadingStatus
    let timestamp: Int64    // Unix timestamp (milliseconds)
    let verses: Int?        // Optional: for partial chapters
    let source: String?     // Optional: "free", "oneyear", "bible_overview", "thematic"

    var id: String {
        "\(book):\(chapter)"
    }

    /// Initialize with current timestamp
    init(book: Int, chapter: Int, status: ReadingStatus, verses: Int? = nil, source: String? = nil) {
        self.book = book
        self.chapter = chapter
        self.status = status
        self.timestamp = Int64(Date().timeIntervalSince1970 * 1000)
        self.verses = verses
        self.source = source
    }

    /// Initialize with specific timestamp (for decoding)
    init(book: Int, chapter: Int, status: ReadingStatus, timestamp: Int64, verses: Int? = nil, source: String? = nil) {
        self.book = book
        self.chapter = chapter
        self.status = status
        self.timestamp = timestamp
        self.verses = verses
        self.source = source
    }

    // MARK: - Hashable
    func hash(into hasher: inout Hasher) {
        hasher.combine(book)
        hasher.combine(chapter)
    }

    static func == (lhs: ChapterRead, rhs: ChapterRead) -> Bool {
        return lhs.book == rhs.book && lhs.chapter == rhs.chapter
    }
}

/// Reading status for a chapter
enum ReadingStatus: String, Codable {
    case complete = "complete"
    case partial = "partial"
}
