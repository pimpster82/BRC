#!/usr/bin/env node

/**
 * Icon Generation Script
 * Converts SVG icon to PNG variants for different sizes
 * Usage: node scripts/generate-icons.js
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.join(__dirname, '..')

// Icon sizes to generate
const SIZES = [16, 32, 192, 512]

// SVG source
const SVG_SOURCE = path.join(projectRoot, 'public/icons/open-bible-icon.svg')
const OUTPUT_DIR = path.join(projectRoot, 'public/icons')

console.log('📦 Bible Reading Companion - Icon Generator')
console.log('━'.repeat(50))
console.log(`Source: ${SVG_SOURCE}`)
console.log(`Output: ${OUTPUT_DIR}`)
console.log(`Sizes: ${SIZES.join('x')} pixels`)
console.log('━'.repeat(50))

// Check if SVG exists
if (!fs.existsSync(SVG_SOURCE)) {
  console.error(`❌ SVG source not found: ${SVG_SOURCE}`)
  process.exit(1)
}

// Try to use sharp if available
try {
  const sharp = await import('sharp')
  const sharpModule = sharp.default

  console.log('\n✅ Using sharp for high-quality PNG conversion\n')

  for (const size of SIZES) {
    const outputPath = path.join(OUTPUT_DIR, `icon-${size}x${size}.png`)

    try {
      await sharpModule(SVG_SOURCE)
        .resize(size, size, {
          fit: 'contain',
          background: { r: 255, g: 255, b: 255, alpha: 0 }
        })
        .png({ quality: 95 })
        .toFile(outputPath)

      console.log(`✓ Generated: icon-${size}x${size}.png`)
    } catch (error) {
      console.error(`✗ Failed to generate icon-${size}x${size}.png:`, error.message)
    }
  }

  console.log('\n✅ Icon generation complete!')
  console.log('\n📝 Next steps:')
  console.log('1. Update public/manifest.json with icon paths')
  console.log('2. Update public/index.html with favicon')
  console.log('3. Test app in browser\n')
} catch (error) {
  if (error.code === 'MODULE_NOT_FOUND' || error.message.includes('Cannot find module')) {
    console.warn('⚠️  sharp not installed. Provide pre-generated PNGs or install with:')
    console.warn('   npm install --save-dev sharp\n')
    console.log('For now, using SVG directly in manifest.json (supported by modern browsers)\n')
    console.log('Generated SVG icon at:', SVG_SOURCE)
  } else {
    throw error
  }
}
