const sharp = require('sharp');
const fs = require('fs');

const conversions = [
  { input: 'assets/icon.svg', output: 'assets/icon.png', width: 1024, height: 1024 },
  { input: 'assets/adaptive-icon.svg', output: 'assets/adaptive-icon.png', width: 1024, height: 1024 },
  { input: 'assets/splash.svg', output: 'assets/splash.png', width: 1242, height: 2436 },
  { input: 'assets/notification-icon.svg', output: 'assets/notification-icon.png', width: 96, height: 96 },
];

async function convertAssets() {
  for (const { input, output, width, height } of conversions) {
    try {
      await sharp(input)
        .resize(width, height)
        .png()
        .toFile(output);
      console.log(`✅ Converted ${input} → ${output}`);
    } catch (error) {
      console.error(`❌ Error converting ${input}:`, error.message);
    }
  }
  console.log('\n🎉 All assets converted!');
}

convertAssets();
