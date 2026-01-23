//
//  ProgressTrackingService.swift
//  BibleReadingCompanion
//
//  Created on 2026-01-23
//  UNIFIED PROGRESS TRACKING: Single source of truth for all reading plans
//

import Foundation

/// Service for managing unified progress tracking across all reading plans
/// CRITICAL: This is the single source of truth for all chapter progress
class ProgressTrackingService {

    static let shared = ProgressTrackingService()

    private init() {}

    // MARK: - Chapter Index (O(1) Lookup)

    /// Build index from chaptersRead array for fast O(1) lookups
    /// Key format: "book:chapter" (e.g., "1:5" for Genesis 5)
    func buildChaptersIndex(_ chaptersRead: [ChapterRead]) -> [String: ChapterRead] {
        var index: [String: ChapterRead] = [:]
        for chapter in chaptersRead {
            index[chapter.id] = chapter
        }
        return index
    }

    // MARK: - Reading Completion Checks

    /// Check if a single chapter is complete
    func isChapterComplete(book: Int, chapter: Int, in index: [String: ChapterRead]) -> Bool {
        guard let read = index["\(book):\(chapter)"] else { return false }
        return read.status == .complete
    }

    /// Check if a reading (range of chapters) is complete
    func isReadingComplete(book: Int, startChapter: Int, endChapter: Int, in index: [String: ChapterRead]) -> Bool {
        for chapter in startChapter...endChapter {
            if !isChapterComplete(book: book, chapter: chapter, in: index) {
                return false
            }
        }
        return true
    }

    /// Check if a reading object is complete
    func isReadingComplete(_ reading: Reading, in index: [String: ChapterRead]) -> Bool {
        return isReadingComplete(
            book: reading.book,
            startChapter: reading.startChapter,
            endChapter: reading.endChapter,
            in: index
        )
    }

    // MARK: - Progress Marking

    /// Mark a single chapter as complete
    func markChapterComplete(
        book: Int,
        chapter: Int,
        chaptersRead: [ChapterRead],
        source: String? = nil
    ) -> [ChapterRead] {
        var updated = chaptersRead

        // Remove existing entry if present
        updated.removeAll { $0.book == book && $0.chapter == chapter }

        // Add new complete entry
        let newChapter = ChapterRead(
            book: book,
            chapter: chapter,
            status: .complete,
            source: source
        )
        updated.append(newChapter)

        return updated
    }

    /// Mark a range of chapters as complete
    func markReadingComplete(
        book: Int,
        startChapter: Int,
        endChapter: Int,
        chaptersRead: [ChapterRead],
        source: String? = nil
    ) -> [ChapterRead] {
        var updated = chaptersRead

        for chapter in startChapter...endChapter {
            // Remove existing
            updated.removeAll { $0.book == book && $0.chapter == chapter }

            // Add new complete
            let newChapter = ChapterRead(
                book: book,
                chapter: chapter,
                status: .complete,
                source: source
            )
            updated.append(newChapter)
        }

        return updated
    }

    /// Mark a reading object as complete
    func markReadingComplete(
        _ reading: Reading,
        chaptersRead: [ChapterRead],
        source: String? = nil
    ) -> [ChapterRead] {
        return markReadingComplete(
            book: reading.book,
            startChapter: reading.startChapter,
            endChapter: reading.endChapter,
            chaptersRead: chaptersRead,
            source: source
        )
    }

    // MARK: - Partial Progress

    /// Mark a chapter as partially read
    func markChapterPartial(
        book: Int,
        chapter: Int,
        throughVerse: Int,
        chaptersRead: [ChapterRead],
        source: String? = nil
    ) -> [ChapterRead] {
        var updated = chaptersRead

        // Remove existing
        updated.removeAll { $0.book == book && $0.chapter == chapter }

        // Add partial entry
        let newChapter = ChapterRead(
            book: book,
            chapter: chapter,
            status: .partial,
            verses: throughVerse,
            source: source
        )
        updated.append(newChapter)

        return updated
    }

    // MARK: - Progress Removal

    /// Unmark a single chapter
    func unmarkChapter(
        book: Int,
        chapter: Int,
        chaptersRead: [ChapterRead]
    ) -> [ChapterRead] {
        return chaptersRead.filter { !($0.book == book && $0.chapter == chapter) }
    }

    /// Unmark a range of chapters
    func unmarkReading(
        book: Int,
        startChapter: Int,
        endChapter: Int,
        chaptersRead: [ChapterRead]
    ) -> [ChapterRead] {
        return chaptersRead.filter { chapter in
            !(chapter.book == book && chapter.chapter >= startChapter && chapter.chapter <= endChapter)
        }
    }

    // MARK: - Progress Statistics

    /// Calculate overall Bible progress (out of 1,189 chapters)
    func calculateOverallProgress(chaptersRead: [ChapterRead]) -> Double {
        let totalChapters = 1189
        let completeChapters = chaptersRead.filter { $0.status == .complete }.count
        return Double(completeChapters) / Double(totalChapters)
    }

    /// Calculate progress for specific book
    func calculateBookProgress(book: Int, totalChapters: Int, in index: [String: ChapterRead]) -> Double {
        var completeCount = 0
        for chapter in 1...totalChapters {
            if isChapterComplete(book: book, chapter: chapter, in: index) {
                completeCount += 1
            }
        }
        return Double(completeCount) / Double(totalChapters)
    }

    /// Calculate progress for a list of readings (e.g., One Year Plan section)
    func calculateReadingsProgress(readings: [Reading], in index: [String: ChapterRead]) -> Double {
        guard !readings.isEmpty else { return 0.0 }

        let completeCount = readings.filter { isReadingComplete($0, in: index) }.count
        return Double(completeCount) / Double(readings.count)
    }

    // MARK: - Verse-Level Progress Calculation

    /// Calculate verse-based progress for a reading range
    /// This is critical for accurate weekly reading progress
    func calculateVerseProgress(
        book: Int,
        startChapter: Int,
        endChapter: Int,
        verseCountsPerChapter: [Int: Int], // chapter -> verse count
        chaptersRead: [ChapterRead],
        in index: [String: ChapterRead]
    ) -> (versesRead: Int, totalVerses: Int, percentage: Double) {

        var versesRead = 0
        var totalVerses = 0

        for chapter in startChapter...endChapter {
            let chapterVerseCount = verseCountsPerChapter[chapter] ?? 0
            totalVerses += chapterVerseCount

            if let readChapter = index["\(book):\(chapter)"] {
                if readChapter.status == .complete {
                    versesRead += chapterVerseCount
                } else if readChapter.status == .partial, let verses = readChapter.verses {
                    versesRead += min(verses, chapterVerseCount)
                }
            }
        }

        let percentage = totalVerses > 0 ? Double(versesRead) / Double(totalVerses) : 0.0

        return (versesRead, totalVerses, percentage)
    }
}
