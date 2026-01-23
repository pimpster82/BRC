//
//  Reading.swift
//  BibleReadingCompanion
//
//  Created on 2026-01-23
//  Represents a Bible reading (one or more chapters)
//

import Foundation

/// Represents a Bible reading assignment (single or multiple chapters)
/// Language-independent: Uses book numbers (1-66) instead of localized names
struct Reading: Codable, Identifiable, Equatable {
    let id: Int
    let book: Int           // Book number (1-66: Genesis-Revelation)
    let startChapter: Int
    let endChapter: Int
    let section: String?    // Optional: Used by 1 Year Plan (e.g., "moses", "prophets")

    /// Human-readable book name (requires localization)
    /// Format example: "Genesis 1-3" or "Matthew 5"
    func formattedName(with bibleBooks: [BibleBook], language: String) -> String {
        guard let bookData = bibleBooks.first(where: { $0.number == book }) else {
            return "Book \(book):\(startChapter)-\(endChapter)"
        }

        if startChapter == endChapter {
            return "\(bookData.name) \(startChapter)"
        } else {
            return "\(bookData.name) \(startChapter)-\(endChapter)"
        }
    }

    /// Check if this reading contains a specific chapter
    func contains(chapter: Int) -> Bool {
        return chapter >= startChapter && chapter <= endChapter
    }

    /// Total chapters in this reading
    var chapterCount: Int {
        return endChapter - startChapter + 1
    }
}

// MARK: - Comparable for sorting
extension Reading: Comparable {
    static func < (lhs: Reading, rhs: Reading) -> Bool {
        if lhs.book != rhs.book {
            return lhs.book < rhs.book
        }
        return lhs.startChapter < rhs.startChapter
    }
}
