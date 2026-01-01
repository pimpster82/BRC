const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const iconsDir = path.join(__dirname, '../public/icons');
const silverSourcePath = path.join(iconsDir, 'icon-light-silver.png');

const sizes = [192, 512, 1024];
const variants = [
  { name: 'light', background: null }, // Transparent
  { name: 'dark', background: '#111827' }, // slate-900
  { name: 'tinted', background: null, grayscale: true }
];

async function generateIcons() {
  try {
    // Check if source exists
    if (!fs.existsSync(silverSourcePath)) {
      console.error(`❌ Source file not found: ${silverSourcePath}`);
      process.exit(1);
    }

    console.log('🎨 Generating iOS-compliant silver icon variants...\n');

    for (const variant of variants) {
      for (const size of sizes) {
        const outputPath = path.join(iconsDir, `icon-silver-${variant.name}-${size}.png`);

        let pipeline = sharp(silverSourcePath);

        // Apply grayscale for tinted variant
        if (variant.grayscale) {
          pipeline = pipeline.grayscale();
        }

        // Apply background for dark variant
        if (variant.background) {
          pipeline = pipeline
            .resize(size, size, { fit: 'contain', background: variant.background })
            .png({ quality: 90 });
        } else {
          pipeline = pipeline
            .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
            .png({ quality: 90 });
        }

        await pipeline.toFile(outputPath);
        console.log(`✅ ${variant.name}-${size}: ${path.basename(outputPath)}`);
      }
    }

    console.log('\n✅ All silver icon variants generated successfully!');
    console.log('\nGenerated files:');
    console.log('  Light variants: icon-silver-light-{192,512,1024}.png');
    console.log('  Dark variants:  icon-silver-dark-{192,512,1024}.png');
    console.log('  Tinted variants: icon-silver-tinted-{192,512,1024}.png');

  } catch (error) {
    console.error('❌ Error generating icons:', error);
    process.exit(1);
  }
}

generateIcons();
