//
//  AppTheme.swift
//  BibleReadingCompanion
//
//  Created on 2026-01-23
//  DESIGN FLEXIBILITY: Central theme protocol for easy UI redesigns
//

import SwiftUI

/// Main theme protocol - implement this to create new visual themes
/// CRITICAL: All UI styling must reference this theme, never hardcode colors
protocol AppTheme {
    // MARK: - Colors
    var primaryColor: Color { get }
    var secondaryColor: Color { get }
    var accentColor: Color { get }

    var backgroundColor: Color { get }
    var surfaceColor: Color { get }
    var cardColor: Color { get }

    var textPrimary: Color { get }
    var textSecondary: Color { get }
    var textTertiary: Color { get }

    var successColor: Color { get }
    var warningColor: Color { get }
    var errorColor: Color { get }
    var infoColor: Color { get }

    var dividerColor: Color { get }
    var shadowColor: Color { get }

    // MARK: - Typography
    var titleFont: Font { get }
    var headlineFont: Font { get }
    var bodyFont: Font { get }
    var captionFont: Font { get }
    var buttonFont: Font { get }

    // MARK: - Spacing
    var spacing: SpacingScale { get }

    // MARK: - Corner Radius
    var cornerRadius: CornerRadiusScale { get }

    // MARK: - Shadows
    var shadowRadius: CGFloat { get }
    var shadowOpacity: Double { get }

    // MARK: - Animations
    var defaultAnimation: Animation { get }
    var springAnimation: Animation { get }

    // MARK: - Background Images (Optional for future use)
    var backgroundImage: String? { get }
    var backgroundImageOpacity: Double { get }
}

// MARK: - Spacing Scale
struct SpacingScale {
    let xxs: CGFloat = 4
    let xs: CGFloat = 8
    let sm: CGFloat = 12
    let md: CGFloat = 16
    let lg: CGFloat = 24
    let xl: CGFloat = 32
    let xxl: CGFloat = 48
}

// MARK: - Corner Radius Scale
struct CornerRadiusScale {
    let sm: CGFloat = 8
    let md: CGFloat = 12
    let lg: CGFloat = 16
    let xl: CGFloat = 20
    let full: CGFloat = 999
}

// MARK: - Default Theme (Web App Style)
/// This theme matches the current web app design
/// Can be completely replaced for redesigns
struct DefaultTheme: AppTheme {
    // Colors
    var primaryColor: Color { Color("Primary") }
    var secondaryColor: Color { Color("Secondary") }
    var accentColor: Color { Color.blue }

    var backgroundColor: Color { Color(.systemBackground) }
    var surfaceColor: Color { Color(.systemGroupedBackground) }
    var cardColor: Color { Color(.secondarySystemGroupedBackground) }

    var textPrimary: Color { Color.primary }
    var textSecondary: Color { Color.secondary }
    var textTertiary: Color { Color.secondary.opacity(0.6) }

    var successColor: Color { Color.green }
    var warningColor: Color { Color.orange }
    var errorColor: Color { Color.red }
    var infoColor: Color { Color.blue }

    var dividerColor: Color { Color(.separator) }
    var shadowColor: Color { Color.black.opacity(0.1) }

    // Typography
    var titleFont: Font { .system(.largeTitle, design: .rounded, weight: .bold) }
    var headlineFont: Font { .system(.title3, design: .rounded, weight: .semibold) }
    var bodyFont: Font { .system(.body, design: .default) }
    var captionFont: Font { .system(.caption, design: .default) }
    var buttonFont: Font { .system(.body, design: .rounded, weight: .semibold) }

    // Spacing
    var spacing: SpacingScale { SpacingScale() }

    // Corner Radius
    var cornerRadius: CornerRadiusScale { CornerRadiusScale() }

    // Shadows
    var shadowRadius: CGFloat { 4 }
    var shadowOpacity: Double { 0.1 }

    // Animations
    var defaultAnimation: Animation { .easeInOut(duration: 0.3) }
    var springAnimation: Animation { .spring(response: 0.5, dampingFraction: 0.7) }

    // Background (optional)
    var backgroundImage: String? { nil }
    var backgroundImageOpacity: Double { 0.1 }
}

// MARK: - Theme Environment Key
struct ThemeEnvironmentKey: EnvironmentKey {
    static let defaultValue: AppTheme = DefaultTheme()
}

extension EnvironmentValues {
    var theme: AppTheme {
        get { self[ThemeEnvironmentKey.self] }
        set { self[ThemeEnvironmentKey.self] = newValue }
    }
}

// MARK: - Theme Manager
/// Observable object to manage current theme and dark mode
class ThemeManager: ObservableObject {
    @Published var currentTheme: AppTheme = DefaultTheme()
    @Published var isDarkMode: Bool = false

    static let shared = ThemeManager()

    private init() {
        // Load user preference
        loadThemePreference()
    }

    func loadThemePreference() {
        // Load from UserDefaults
        // TODO: Implement theme persistence
    }

    func switchTheme(to theme: AppTheme) {
        withAnimation {
            currentTheme = theme
        }
    }
}

// MARK: - Usage Example
/*
 // In your views:

 struct MyView: View {
     @Environment(\.theme) var theme

     var body: some View {
         VStack {
             Text("Title")
                 .font(theme.titleFont)
                 .foregroundColor(theme.textPrimary)

             RoundedRectangle(cornerRadius: theme.cornerRadius.md)
                 .fill(theme.cardColor)
                 .shadow(color: theme.shadowColor, radius: theme.shadowRadius)
         }
         .padding(theme.spacing.md)
     }
 }

 // In your app entry point:

 @main
 struct BibleReadingCompanionApp: App {
     @StateObject var themeManager = ThemeManager.shared

     var body: some Scene {
         WindowGroup {
             ContentView()
                 .environment(\.theme, themeManager.currentTheme)
         }
     }
 }
 */
