//
//  JWOrgLinkBuilder.swift
//  BibleReadingCompanion
//
//  Created on 2026-01-23
//  Builds links to JW.org Bible and JW Library app
//

import Foundation

/// Service for building JW.org and JW Library deep links
class JWOrgLinkBuilder {

    static let shared = JWOrgLinkBuilder()

    private init() {}

    // MARK: - Language Codes

    /// Convert language code to JW.org locale code
    /// de -> X, en -> E, es -> S, it -> I, fr -> F
    private func getLocaleCode(for language: String) -> String {
        switch language.lowercased() {
        case "de": return "X"
        case "en": return "E"
        case "es": return "S"
        case "it": return "I"
        case "fr": return "F"
        default: return "E" // Default to English
        }
    }

    // MARK: - Bible Reference Encoding

    /// Convert book/chapter/verse to JW.org bible parameter format
    /// Format: BBCCCVVV (book 01-66, chapter 001-150, verse 001-176)
    /// Example: Genesis 1:1 = 01001001
    private func encodeBibleReference(book: Int, chapter: Int, verse: Int) -> String {
        let bookStr = String(format: "%02d", book)
        let chapterStr = String(format: "%03d", chapter)
        let verseStr = String(format: "%03d", verse)
        return bookStr + chapterStr + verseStr
    }

    // MARK: - JW.org Finder Links

    /// Build JW.org finder URL for a single chapter
    func buildChapterLink(book: Int, chapter: Int, language: String = "en") -> URL? {
        // For a full chapter, use verse 1 to end verse
        // We'll use a large end verse (999) which JW.org handles gracefully
        return buildVerseRangeLink(
            book: book,
            startChapter: chapter,
            startVerse: 1,
            endChapter: chapter,
            endVerse: 999,
            language: language
        )
    }

    /// Build JW.org finder URL for multiple chapters
    func buildChapterRangeLink(
        book: Int,
        startChapter: Int,
        endChapter: Int,
        language: String = "en"
    ) -> URL? {
        return buildVerseRangeLink(
            book: book,
            startChapter: startChapter,
            startVerse: 1,
            endChapter: endChapter,
            endVerse: 999,
            language: language
        )
    }

    /// Build JW.org finder URL for specific verse range
    func buildVerseRangeLink(
        book: Int,
        startChapter: Int,
        startVerse: Int,
        endChapter: Int,
        endVerse: Int,
        language: String = "en"
    ) -> URL? {
        let locale = getLocaleCode(for: language)

        let startRef = encodeBibleReference(book: book, chapter: startChapter, verse: startVerse)
        let endRef = encodeBibleReference(book: book, chapter: endChapter, verse: endVerse)

        let urlString = "https://www.jw.org/finder?srcid=jwlshare&wtlocale=\(locale)&prefer=lang&bible=\(startRef)-\(endRef)&pub=nwtsty"

        return URL(string: urlString)
    }

    /// Build JW.org link for a Reading object
    func buildReadingLink(_ reading: Reading, language: String = "en") -> URL? {
        return buildChapterRangeLink(
            book: reading.book,
            startChapter: reading.startChapter,
            endChapter: reading.endChapter,
            language: language
        )
    }

    // MARK: - JW Library Deep Links

    /// Build JW Library app deep link
    /// Format: jwpub://b/NWT/book:chapter:verse-book:chapter:verse
    func buildJWLibraryLink(
        book: Int,
        startChapter: Int,
        startVerse: Int = 1,
        endChapter: Int? = nil,
        endVerse: Int? = nil
    ) -> URL? {
        let endChap = endChapter ?? startChapter
        let endV = endVerse ?? 999

        let urlString = "jwpub://b/NWT/\(book):\(startChapter):\(startVerse)-\(book):\(endChap):\(endV)"

        return URL(string: urlString)
    }

    // MARK: - Smart Link Opening

    /// Open Bible reference with fallback logic:
    /// 1. Try JW Library app (if installed)
    /// 2. Fall back to JW.org in Safari
    func openBibleReference(
        book: Int,
        chapter: Int,
        language: String = "en",
        completion: ((Bool) -> Void)? = nil
    ) {
        #if os(iOS)
        import UIKit

        // Try JW Library first
        if let jwLibraryURL = buildJWLibraryLink(book: book, startChapter: chapter) {
            UIApplication.shared.open(jwLibraryURL, options: [:]) { success in
                if success {
                    completion?(true)
                } else {
                    // Fall back to JW.org
                    self.openJWOrgLink(book: book, chapter: chapter, language: language, completion: completion)
                }
            }
        } else {
            // Fall back to JW.org
            openJWOrgLink(book: book, chapter: chapter, language: language, completion: completion)
        }
        #else
        // macOS or other platforms
        openJWOrgLink(book: book, chapter: chapter, language: language, completion: completion)
        #endif
    }

    private func openJWOrgLink(
        book: Int,
        chapter: Int,
        language: String,
        completion: ((Bool) -> Void)?
    ) {
        #if os(iOS)
        import UIKit

        if let url = buildChapterLink(book: book, chapter: chapter, language: language) {
            UIApplication.shared.open(url, options: [:], completionHandler: completion)
        } else {
            completion?(false)
        }
        #endif
    }

    // MARK: - Daily Text Link

    /// Build link to current day's daily text on JW.org
    func buildDailyTextLink(date: Date = Date(), language: String = "en") -> URL? {
        let dateFormatter = DateFormatter()
        dateFormatter.dateFormat = "yyyy/MM/dd"
        let dateString = dateFormatter.string(from: date)

        // JW.org daily text URL format varies by language
        let langPath: String
        switch language.lowercased() {
        case "de": langPath = "de"
        case "en": langPath = "en"
        case "es": langPath = "es"
        case "it": langPath = "it"
        case "fr": langPath = "f"
        default: langPath = "en"
        }

        let urlString = "https://www.jw.org/\(langPath)/library/bible/study-bible/books/"

        // Note: Actual daily text URL structure may need adjustment based on JW.org structure
        // This is a placeholder that should be verified
        return URL(string: urlString)
    }
}

// MARK: - Convenience Extensions

extension Reading {
    /// Get JW.org link for this reading
    func getJWOrgLink(language: String = "en") -> URL? {
        return JWOrgLinkBuilder.shared.buildReadingLink(self, language: language)
    }
}
