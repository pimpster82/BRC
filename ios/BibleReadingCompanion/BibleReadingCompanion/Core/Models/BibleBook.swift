//
//  BibleBook.swift
//  BibleReadingCompanion
//
//  Created on 2026-01-23
//  Represents a Bible book with metadata
//

import Foundation

/// Represents a Bible book with all metadata
struct BibleBook: Codable, Identifiable, Equatable {
    let number: Int         // Book number (1-66)
    let name: String        // Localized name
    let abbreviation: String // Short abbreviation
    let chapters: Int       // Total chapters in book
    let testament: Testament
    let verses: [Int]?      // Optional: verse counts per chapter

    var id: Int { number }

    /// Total verses in the book
    var totalVerses: Int {
        verses?.reduce(0, +) ?? 0
    }

    /// Get verse count for a specific chapter
    func verseCount(for chapter: Int) -> Int {
        guard let verses = verses,
              chapter > 0,
              chapter <= verses.count else {
            return 0
        }
        return verses[chapter - 1]
    }
}

/// Bible testament
enum Testament: String, Codable {
    case old = "old"
    case new = "new"
}

// MARK: - Static Bible Book Numbers
extension BibleBook {
    /// Common book number constants for easy reference
    struct BookNumbers {
        static let genesis = 1
        static let exodus = 2
        static let leviticus = 3
        static let numbers = 4
        static let deuteronomy = 5
        // ... (add more as needed)
        static let matthew = 40
        static let mark = 41
        static let luke = 42
        static let john = 43
        // ... (add more as needed)
        static let revelation = 66
    }
}
