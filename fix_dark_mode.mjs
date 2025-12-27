#!/usr/bin/env node
/**
 * Dark Mode Color Fix Script (ES Module Version)
 * Adds missing dark: variants to color classes
 * Ensures no duplicates or overwrites
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Color mappings: light color -> dark variant (if not already present)
const COLOR_MAPPINGS = {
  // Background colors - Blue
  'bg-blue-50': 'dark:bg-blue-900',
  'bg-blue-100': 'dark:bg-blue-900',
  'bg-blue-600': 'dark:bg-blue-500',
  'hover:bg-blue-100': 'dark:hover:bg-blue-800',
  'hover:bg-blue-700': 'dark:hover:bg-blue-600',

  // Background colors - Gray
  'bg-gray-50': 'dark:bg-slate-800',
  'bg-gray-100': 'dark:bg-slate-700',
  'bg-gray-200': 'dark:bg-slate-700',
  'bg-gray-300': 'dark:bg-slate-600',
  'hover:bg-gray-50': 'dark:hover:bg-slate-700',
  'hover:bg-gray-100': 'dark:hover:bg-slate-700',
  'hover:bg-gray-200': 'dark:hover:bg-slate-600',
  'hover:bg-gray-300': 'dark:hover:bg-slate-600',

  // Background colors - Red
  'bg-red-50': 'dark:bg-red-900',
  'bg-red-100': 'dark:bg-red-900',
  'bg-red-600': 'dark:bg-red-500',
  'hover:bg-red-100': 'dark:hover:bg-red-800',
  'hover:bg-red-200': 'dark:hover:bg-red-800',
  'hover:bg-red-700': 'dark:hover:bg-red-600',

  // Background colors - Green
  'bg-green-100': 'dark:bg-green-900',
  'bg-green-50': 'dark:bg-green-900',
  'bg-green-600': 'dark:bg-green-500',
  'hover:bg-green-200': 'dark:hover:bg-green-800',
  'hover:bg-green-700': 'dark:hover:bg-green-600',

  // Background colors - Yellow
  'bg-yellow-50': 'dark:bg-yellow-900',
  'bg-yellow-200': 'dark:bg-yellow-700',
  'bg-yellow-400': 'dark:bg-yellow-700',
  'bg-yellow-500': 'dark:bg-yellow-600',
  'hover:bg-yellow-100': 'dark:hover:bg-slate-600',
  'hover:bg-yellow-300': 'dark:hover:bg-yellow-600',

  // Background colors - Orange
  'bg-orange-50': 'dark:bg-orange-900',
  'hover:bg-orange-100': 'dark:hover:bg-orange-800',

  // Background colors - Purple
  'bg-purple-50': 'dark:bg-purple-900',
  'bg-purple-100': 'dark:bg-purple-900',
  'bg-purple-200': 'dark:bg-purple-700',
  'bg-purple-600': 'dark:bg-purple-500',
  'hover:from-purple-100': 'dark:hover:from-purple-800',
  'hover:to-pink-100': 'dark:hover:to-pink-800',

  // Text colors - Blue
  'text-blue-600': 'dark:text-blue-400',
  'text-blue-700': 'dark:text-blue-100',
  'text-blue-800': 'dark:text-blue-100',
  'text-blue-900': 'dark:text-blue-100',
  'hover:text-blue-700': 'dark:hover:text-blue-300',
  'hover:text-blue-800': 'dark:hover:text-blue-300',

  // Text colors - Red
  'text-red-600': 'dark:text-red-400',
  'text-red-700': 'dark:text-red-100',
  'text-red-800': 'dark:text-red-100',
  'text-red-900': 'dark:text-red-100',
  'hover:text-red-700': 'dark:hover:text-red-300',
  'hover:text-red-800': 'dark:hover:text-red-300',

  // Text colors - Green
  'text-green-600': 'dark:text-green-400',
  'text-green-700': 'dark:text-green-300',
  'text-green-800': 'dark:text-green-100',
  'text-green-900': 'dark:text-green-100',
  'hover:text-green-700': 'dark:hover:text-green-300',
  'hover:text-green-900': 'dark:hover:text-green-200',

  // Text colors - Yellow
  'text-yellow-700': 'dark:text-yellow-300',
  'text-yellow-800': 'dark:text-yellow-100',
  'text-yellow-900': 'dark:text-yellow-100',
  'hover:text-yellow-800': 'dark:hover:text-yellow-300',
  'hover:text-yellow-900': 'dark:hover:text-yellow-200',

  // Text colors - Orange
  'text-orange-600': 'dark:text-orange-400',
  'text-orange-700': 'dark:text-orange-100',

  // Text colors - Purple
  'text-purple-600': 'dark:text-purple-400',
  'text-purple-700': 'dark:text-purple-300',

  // Text colors - Gray
  'text-gray-400': 'dark:text-gray-500',
  'text-gray-500': 'dark:text-gray-400',
  'text-gray-600': 'dark:text-gray-400',
  'hover:text-gray-600': 'dark:hover:text-gray-400',
  'hover:text-gray-800': 'dark:hover:text-gray-300',
  'hover:text-indigo-700': 'dark:hover:text-indigo-300',

  // Text colors - Indigo
  'text-indigo-600': 'dark:text-indigo-400',
  'text-indigo-900': 'dark:text-indigo-100',
  'hover:text-indigo-700': 'dark:hover:text-indigo-300',

  // Border colors
  'border-blue-100': 'dark:border-blue-700',
  'border-blue-200': 'dark:border-blue-700',
  'border-blue-300': 'dark:border-blue-600',
  'border-blue-600': 'dark:border-blue-500',
  'border-gray-100': 'dark:border-gray-700',
  'border-gray-200': 'dark:border-gray-700',
  'border-gray-300': 'dark:border-gray-600',
  'border-green-100': 'dark:border-green-700',
  'border-green-200': 'dark:border-green-700',
  'border-green-300': 'dark:border-green-700',
  'border-red-100': 'dark:border-red-700',
  'border-red-200': 'dark:border-red-700',
  'border-red-300': 'dark:border-red-600',
  'border-yellow-200': 'dark:border-yellow-700',
  'border-yellow-300': 'dark:border-yellow-600',
  'border-yellow-500': 'dark:border-yellow-600',
  'border-purple-100': 'dark:border-purple-800',
  'border-purple-200': 'dark:border-purple-700',
  'border-purple-300': 'dark:border-purple-700',
  'border-purple-600': 'dark:border-purple-500',
  'border-indigo-200': 'dark:border-indigo-700',

  // Gradient colors
  'from-blue-50': 'dark:from-slate-800',
  'to-indigo-50': 'dark:to-slate-700',
  'hover:from-blue-100': 'dark:hover:from-slate-700',
  'hover:to-indigo-100': 'dark:hover:to-slate-600',
  'from-purple-50': 'dark:from-purple-900',
  'to-pink-50': 'dark:to-pink-900',
  'from-indigo-500/10': 'dark:from-indigo-900/20',
  'via-purple-500/10': 'dark:via-purple-900/20',
  'to-indigo-500/10': 'dark:to-indigo-900/20',

  // Ring colors
  'ring-blue-400': 'dark:ring-blue-500',
};

function processFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    const lines = content.split('\n');
    const processedLines = [];
    let fixCount = 0;

    for (const line of lines) {
      let processedLine = line;

      // For each color mapping, check if this line has the light color
      for (const [lightColor, darkVariant] of Object.entries(COLOR_MAPPINGS)) {
        // Skip if line already has the dark variant
        if (processedLine.includes(darkVariant)) {
          continue;
        }

        // Check for the light color in className attributes
        if (processedLine.includes(`className="`) && processedLine.includes(lightColor)) {
          // Pattern: find the color class and ensure it's not duplicated
          const classNameRegex = /className="([^"]*)"/g;

          processedLine = processedLine.replace(classNameRegex, (match) => {
            let classValue = match.slice(11, -1); // Extract class names from className="..."

            if (classValue.includes(lightColor) && !classValue.includes(darkVariant)) {
              // Add dark variant after the light color
              classValue = classValue.replace(lightColor, `${lightColor} ${darkVariant}`);
              fixCount++;
              return `className="${classValue}"`;
            }
            return match;
          });
        }
      }

      processedLines.push(processedLine);
    }

    const newContent = processedLines.join('\n');
    if (newContent !== originalContent) {
      fs.writeFileSync(filePath, newContent, 'utf8');
      return fixCount;
    }
    return 0;
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
    return 0;
  }
}

// Main execution
console.log('🎨 Dark Mode Color Fix (Node.js)');
console.log('================================\n');

const files = [
  'src/pages/SettingsPage.jsx',
  'src/pages/PersonalReadingPage.jsx',
  'src/pages/WeeklyReadingPage.jsx',
  'src/pages/HomePage.jsx',
  'src/pages/LoginPage.jsx',
  'src/pages/RegisterPage.jsx',
  'src/components/ReadingInputParser.jsx',
];

let totalFixes = 0;

for (const file of files) {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    const fixes = processFile(filePath);
    console.log(`✓ ${file}: ${fixes} fixes applied`);
    totalFixes += fixes;
  } else {
    console.log(`⚠ ${file}: not found`);
  }
}

console.log('\n================================');
console.log(`✅ Complete! Total fixes: ${totalFixes}`);
console.log('\nNext steps:');
console.log('1. Review: git diff');
console.log('2. Commit: git add -A && git commit');
console.log('3. Push: git push origin master');
