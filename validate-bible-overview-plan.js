/**
 * Validate Bible Overview Plan
 * Run with: node validate-bible-overview-plan.js
 */

import { readFileSync } from 'fs'
import { parseReadingPlan, validatePlan, formatPlanPreview } from './src/utils/readingPlanParser.js'

try {
  console.log('📖 Reading plan file...\n')
  const planText = readFileSync('./bible-overview-plan.txt', 'utf-8')

  console.log('🔍 Parsing plan...\n')
  const plan = parseReadingPlan(planText)

  console.log('✅ Plan parsed successfully!\n')
  console.log('📊 Plan Details:')
  console.log(`   ID: ${plan.id}`)
  console.log(`   Type: ${plan.type}`)
  console.log(`   Sections: ${plan.sections.length}`)
  console.log('')

  // Count readings
  let totalReadings = 0
  for (const section of plan.sections) {
    if (section.verses) {
      totalReadings += section.verses.length
    }
    for (const topic of section.topics || []) {
      if (topic.verses) {
        totalReadings += topic.verses.length
      }
    }
  }
  console.log(`   Total Readings: ${totalReadings}`)
  console.log('')

  console.log('🧪 Validating plan...\n')
  const validation = validatePlan(plan)

  if (validation.valid) {
    console.log('✅ VALIDATION PASSED!\n')
  } else {
    console.log('❌ VALIDATION FAILED:\n')
    validation.errors.forEach(err => console.log(`   - ${err}`))
    console.log('')
  }

  console.log('📋 Preview:\n')
  console.log(formatPlanPreview(plan))

  console.log('\n📤 Ready to upload to Firebase!')
  console.log('   Path: /readingPlans/available/bible_overview')

  process.exit(validation.valid ? 0 : 1)
} catch (error) {
  console.error('❌ Error:', error.message)
  console.error(error.stack)
  process.exit(1)
}
