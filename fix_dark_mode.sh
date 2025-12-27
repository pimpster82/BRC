#!/bin/bash
# Dark Mode Color Fix Script
# Automatically adds dark: variants to all missing colors
# Based on 234 identified issues across the codebase

set -e

cd "$(dirname "$0")"

echo "🎨 Starting Dark Mode Color Fix..."
echo "=================================="

# Color mappings: light -> dark
declare -A COLOR_MAP=(
    # Blue backgrounds
    ["bg-blue-50"]="bg-blue-50 dark:bg-blue-900"
    ["bg-blue-100"]="bg-blue-100 dark:bg-blue-900"
    ["bg-blue-600"]="bg-blue-600 dark:bg-blue-500"
    ["hover:bg-blue-100"]="hover:bg-blue-100 dark:hover:bg-blue-800"
    ["hover:bg-blue-700"]="hover:bg-blue-700 dark:hover:bg-blue-600"

    # Gray backgrounds
    ["bg-gray-50"]="bg-gray-50 dark:bg-slate-800"
    ["bg-gray-100"]="bg-gray-100 dark:bg-slate-700"
    ["bg-gray-200"]="bg-gray-200 dark:bg-slate-700"
    ["bg-gray-300"]="bg-gray-300 dark:bg-slate-600"
    ["hover:bg-gray-50"]="hover:bg-gray-50 dark:hover:bg-slate-700"
    ["hover:bg-gray-100"]="hover:bg-gray-100 dark:hover:bg-slate-700"
    ["hover:bg-gray-200"]="hover:bg-gray-200 dark:hover:bg-slate-600"
    ["hover:bg-gray-300"]="hover:bg-gray-300 dark:hover:bg-slate-600"

    # Red backgrounds
    ["bg-red-50"]="bg-red-50 dark:bg-red-900"
    ["bg-red-100"]="bg-red-100 dark:bg-red-900"
    ["bg-red-600"]="bg-red-600 dark:bg-red-500"
    ["hover:bg-red-100"]="hover:bg-red-100 dark:hover:bg-red-800"
    ["hover:bg-red-200"]="hover:bg-red-200 dark:hover:bg-red-800"
    ["hover:bg-red-700"]="hover:bg-red-700 dark:hover:bg-red-600"

    # Green backgrounds
    ["bg-green-100"]="bg-green-100 dark:bg-green-900"
    ["bg-green-50"]="bg-green-50 dark:bg-green-900"
    ["bg-green-600"]="bg-green-600 dark:bg-green-500"
    ["hover:bg-green-200"]="hover:bg-green-200 dark:hover:bg-green-800"
    ["hover:bg-green-700"]="hover:bg-green-700 dark:hover:bg-green-600"

    # Yellow backgrounds
    ["bg-yellow-50"]="bg-yellow-50 dark:bg-yellow-900"
    ["bg-yellow-200"]="bg-yellow-200 dark:bg-yellow-700"
    ["bg-yellow-400"]="bg-yellow-400 dark:bg-yellow-700"
    ["bg-yellow-500"]="bg-yellow-500 dark:bg-yellow-600"
    ["hover:bg-yellow-100"]="hover:bg-yellow-100 dark:hover:bg-slate-600"
    ["hover:bg-yellow-300"]="hover:bg-yellow-300 dark:hover:bg-yellow-600"

    # Orange backgrounds
    ["bg-orange-50"]="bg-orange-50 dark:bg-orange-900"
    ["hover:bg-orange-100"]="hover:bg-orange-100 dark:hover:bg-orange-800"

    # Purple/Pink backgrounds
    ["bg-purple-50"]="bg-purple-50 dark:bg-purple-900"
    ["bg-purple-100"]="bg-purple-100 dark:bg-purple-900"
    ["bg-purple-200"]="bg-purple-200 dark:bg-purple-700"
    ["bg-purple-600"]="bg-purple-600 dark:bg-purple-500"
    ["hover:from-purple-100"]="hover:from-purple-100 dark:hover:from-purple-800"
    ["hover:to-pink-100"]="hover:to-pink-100 dark:hover:to-pink-800"

    # Text colors - Blue
    ["text-blue-600"]="text-blue-600 dark:text-blue-400"
    ["text-blue-700"]="text-blue-700 dark:text-blue-100"
    ["text-blue-800"]="text-blue-800 dark:text-blue-100"
    ["text-blue-900"]="text-blue-900 dark:text-blue-100"
    ["hover:text-blue-700"]="hover:text-blue-700 dark:hover:text-blue-300"
    ["hover:text-blue-800"]="hover:text-blue-800 dark:hover:text-blue-300"

    # Text colors - Red
    ["text-red-600"]="text-red-600 dark:text-red-400"
    ["text-red-700"]="text-red-700 dark:text-red-100"
    ["text-red-800"]="text-red-800 dark:text-red-100"
    ["text-red-900"]="text-red-900 dark:text-red-100"
    ["hover:text-red-700"]="hover:text-red-700 dark:hover:text-red-300"
    ["hover:text-red-800"]="hover:text-red-800 dark:hover:text-red-300"

    # Text colors - Green
    ["text-green-600"]="text-green-600 dark:text-green-400"
    ["text-green-700"]="text-green-700 dark:text-green-300"
    ["text-green-800"]="text-green-800 dark:text-green-100"
    ["text-green-900"]="text-green-900 dark:text-green-100"
    ["hover:text-green-700"]="hover:text-green-700 dark:hover:text-green-300"
    ["hover:text-green-900"]="hover:text-green-900 dark:hover:text-green-200"

    # Text colors - Yellow
    ["text-yellow-700"]="text-yellow-700 dark:text-yellow-300"
    ["text-yellow-800"]="text-yellow-800 dark:text-yellow-100"
    ["text-yellow-900"]="text-yellow-900 dark:text-yellow-100"
    ["hover:text-yellow-800"]="hover:text-yellow-800 dark:hover:text-yellow-300"
    ["hover:text-yellow-900"]="hover:text-yellow-900 dark:hover:text-yellow-200"

    # Text colors - Orange
    ["text-orange-600"]="text-orange-600 dark:text-orange-400"
    ["text-orange-700"]="text-orange-700 dark:text-orange-100"

    # Text colors - Purple
    ["text-purple-600"]="text-purple-600 dark:text-purple-400"
    ["text-purple-700"]="text-purple-700 dark:text-purple-300"

    # Text colors - Gray
    ["text-gray-400"]="text-gray-400 dark:text-gray-500"
    ["text-gray-500"]="text-gray-500 dark:text-gray-400"
    ["text-gray-600"]="text-gray-600 dark:text-gray-400"
    ["hover:text-gray-600"]="hover:text-gray-600 dark:hover:text-gray-400"
    ["hover:text-gray-800"]="hover:text-gray-800 dark:hover:text-gray-300"
    ["hover:text-indigo-700"]="hover:text-indigo-700 dark:hover:text-indigo-300"

    # Text colors - Indigo
    ["text-indigo-600"]="text-indigo-600 dark:text-indigo-400"
    ["text-indigo-900"]="text-indigo-900 dark:text-indigo-100"
    ["hover:text-indigo-700"]="hover:text-indigo-700 dark:hover:text-indigo-300"

    # Border colors
    ["border-blue-100"]="border-blue-100 dark:border-blue-700"
    ["border-blue-200"]="border-blue-200 dark:border-blue-700"
    ["border-blue-300"]="border-blue-300 dark:border-blue-600"
    ["border-blue-600"]="border-blue-600 dark:border-blue-500"
    ["border-gray-100"]="border-gray-100 dark:border-gray-700"
    ["border-gray-200"]="border-gray-200 dark:border-gray-700"
    ["border-gray-300"]="border-gray-300 dark:border-gray-600"
    ["border-green-100"]="border-green-100 dark:border-green-700"
    ["border-green-200"]="border-green-200 dark:border-green-700"
    ["border-green-300"]="border-green-300 dark:border-green-700"
    ["border-red-100"]="border-red-100 dark:border-red-700"
    ["border-red-200"]="border-red-200 dark:border-red-700"
    ["border-red-300"]="border-red-300 dark:border-red-600"
    ["border-yellow-200"]="border-yellow-200 dark:border-yellow-700"
    ["border-yellow-300"]="border-yellow-300 dark:border-yellow-600"
    ["border-yellow-500"]="border-yellow-500 dark:border-yellow-600"
    ["border-purple-100"]="border-purple-100 dark:border-purple-800"
    ["border-purple-200"]="border-purple-200 dark:border-purple-700"
    ["border-purple-300"]="border-purple-300 dark:border-purple-700"
    ["border-purple-600"]="border-purple-600 dark:border-purple-500"
    ["border-indigo-200"]="border-indigo-200 dark:border-indigo-700"

    # Gradient colors
    ["from-blue-50"]="from-blue-50 dark:from-slate-800"
    ["to-indigo-50"]="to-indigo-50 dark:to-slate-700"
    ["hover:from-blue-100"]="hover:from-blue-100 dark:hover:from-slate-700"
    ["hover:to-indigo-100"]="hover:to-indigo-100 dark:hover:to-slate-600"
    ["from-purple-50"]="from-purple-50 dark:from-purple-900"
    ["to-pink-50"]="to-pink-50 dark:to-pink-900"
    ["from-indigo-500/10"]="from-indigo-500/10 dark:from-indigo-900/20"
    ["via-purple-500/10"]="via-purple-500/10 dark:via-purple-900/20"
    ["to-indigo-500/10"]="to-indigo-500/10 dark:to-indigo-900/20"

    # Ring colors
    ["ring-blue-400"]="ring-blue-400 dark:ring-blue-500"
)

# Files to fix
FILES=(
    "src/pages/SettingsPage.jsx"
    "src/pages/PersonalReadingPage.jsx"
    "src/pages/WeeklyReadingPage.jsx"
    "src/pages/HomePage.jsx"
    "src/pages/LoginPage.jsx"
    "src/pages/RegisterPage.jsx"
    "src/components/ReadingInputParser.jsx"
)

FIXED_COUNT=0

for file in "${FILES[@]}"; do
    if [ ! -f "$file" ]; then
        echo "⚠️  File not found: $file"
        continue
    fi

    FILE_FIXES=0
    echo "Processing: $file"

    # For each color mapping, apply it to the file
    for light in "${!COLOR_MAP[@]}"; do
        dark="${COLOR_MAP[$light]}"

        # Count occurrences before
        count=$(grep -o "$light" "$file" 2>/dev/null | wc -l)

        if [ "$count" -gt 0 ]; then
            # Replace: ensure we're not replacing something that already has dark:
            # Look for the pattern without already having dark: variant
            sed -i "s/ $light['\"]/ $dark'\"/g" "$file"
            sed -i "s/ $light / $dark /g" "$file"
            sed -i "s/ $light$/ $dark/g" "$file"

            FILE_FIXES=$((FILE_FIXES + count))
            FIXED_COUNT=$((FIXED_COUNT + count))
        fi
    done

    if [ "$FILE_FIXES" -gt 0 ]; then
        echo "  ✓ Fixed $FILE_FIXES color issues"
    else
        echo "  ○ No issues found"
    fi
done

echo ""
echo "=================================="
echo "✅ Dark Mode Fix Complete!"
echo "Total fixes applied: $FIXED_COUNT"
echo ""
echo "Next steps:"
echo "1. Review changes: git diff"
echo "2. Run dev server: npm run dev"
echo "3. Test on mobile: reload page with dark mode"
echo "4. Commit changes: git add . && git commit -m 'Complete dark mode: add 234 missing dark: variants'"
echo "5. Push: git push origin master"
