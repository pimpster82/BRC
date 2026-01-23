//
//  BibleReadingCompanionApp.swift
//  BibleReadingCompanion
//
//  Created on 2026-01-23
//  Main app entry point
//

import SwiftUI

@main
struct BibleReadingCompanionApp: App {
    @StateObject private var themeManager = ThemeManager.shared

    var body: some Scene {
        WindowGroup {
            MainTabView()
                .environment(\.theme, themeManager.currentTheme)
        }
    }
}

// MARK: - Main Tab View

struct MainTabView: View {
    @Environment(\.theme) var theme

    var body: some View {
        TabView {
            // Tab 1: Home
            HomeView()
                .tabItem {
                    Label("home.title", systemImage: "house.fill")
                }

            // Tab 2: Weekly Reading
            WeeklyReadingView()
                .tabItem {
                    Label("weekly.title", systemImage: "book.fill")
                }

            // Tab 3: Personal Reading
            PersonalReadingView()
                .tabItem {
                    Label("reading.title", systemImage: "books.vertical.fill")
                }

            // Tab 4: Settings
            SettingsView()
                .tabItem {
                    Label("settings.title", systemImage: "gearshape.fill")
                }
        }
        .accentColor(theme.accentColor)
    }
}

// MARK: - Placeholder Views (TODO: Implement full UI)

struct HomeView: View {
    @Environment(\.theme) var theme

    var body: some View {
        NavigationView {
            ScrollView {
                VStack(spacing: theme.spacing.md) {
                    Text("HOME VIEW")
                        .font(theme.titleFont)

                    // TODO: Implement yeartext banner
                    // TODO: Implement daily text card
                    // TODO: Implement weekly reading card
                    // TODO: Implement personal reading card

                    Text("⚠️ UI PLACEHOLDER")
                        .font(theme.captionFont)
                        .foregroundColor(theme.textSecondary)
                        .padding()
                        .background(theme.cardColor)
                        .cornerRadius(theme.cornerRadius.md)
                }
                .padding(theme.spacing.md)
            }
            .background(theme.backgroundColor.ignoresSafeArea())
            .navigationTitle("home.title")
        }
    }
}

struct WeeklyReadingView: View {
    @Environment(\.theme) var theme

    var body: some View {
        NavigationView {
            VStack {
                Text("WEEKLY READING VIEW")
                    .font(theme.titleFont)

                Text("⚠️ UI PLACEHOLDER")
                    .font(theme.captionFont)
                    .foregroundColor(theme.textSecondary)

                // TODO: Implement weekly reading full screen
                // TODO: Implement chapter list
                // TODO: Implement smart input parser
                // TODO: Implement progress bar
            }
            .padding(theme.spacing.md)
            .background(theme.backgroundColor.ignoresSafeArea())
            .navigationTitle("weekly.title")
        }
    }
}

struct PersonalReadingView: View {
    @Environment(\.theme) var theme

    var body: some View {
        NavigationView {
            VStack {
                Text("PERSONAL READING VIEW")
                    .font(theme.titleFont)

                Text("⚠️ UI PLACEHOLDER")
                    .font(theme.captionFont)
                    .foregroundColor(theme.textSecondary)

                // TODO: Implement plan selector
                // TODO: Implement free reading (Bible tree)
                // TODO: Implement Bible in 1 Year
                // TODO: Implement Bible Overview
                // TODO: Implement Thematic Plan
            }
            .padding(theme.spacing.md)
            .background(theme.backgroundColor.ignoresSafeArea())
            .navigationTitle("reading.title")
        }
    }
}

struct SettingsView: View {
    @Environment(\.theme) var theme

    var body: some View {
        NavigationView {
            Form {
                Section("settings.general") {
                    Text("Language")
                    Text("Meeting Day")
                    Text("Reading Plan")
                }

                Section("settings.display") {
                    Text("Theme Mode")
                    Text("Show Yeartext")
                }

                Section("settings.version") {
                    Text("Version 1.0.0")
                }

                // TODO: Implement full settings UI
                // TODO: Implement language picker
                // TODO: Implement meeting day picker
                // TODO: Implement theme picker
                // TODO: Implement reset functions
                // TODO: Implement admin access (PIN 170182)
            }
            .background(theme.backgroundColor.ignoresSafeArea())
            .navigationTitle("settings.title")
        }
    }
}
