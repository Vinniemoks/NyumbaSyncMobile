# Convert SVG Assets to PNG

I've created SVG versions of all required assets. Now you need to convert them to PNG format.

## Created SVG Files

✅ `assets/icon.svg` - App icon (1024x1024)  
✅ `assets/adaptive-icon.svg` - Android adaptive icon (1024x1024)  
✅ `assets/splash.svg` - Splash screen (1242x2436)  
✅ `assets/notification-icon.svg` - Notification icon (96x96)

## Conversion Options

### Option 1: Online Converter (Easiest - No Installation)

1. **Go to**: https://cloudconvert.com/svg-to-png
2. **Upload** each SVG file
3. **Set dimensions**:
   - `icon.svg` → 1024x1024px
   - `adaptive-icon.svg` → 1024x1024px
   - `splash.svg` → 1242x2436px
   - `notification-icon.svg` → 96x96px
4. **Download** PNG files
5. **Replace** SVG files with PNG files in `assets/` folder

### Option 2: Using Figma (Best Quality)

1. **Open** https://figma.com
2. **Create new file**
3. **Import** SVG files (drag and drop)
4. **Export** as PNG:
   - Right-click → Export
   - Format: PNG
   - Scale: 1x (original size)
5. **Download** and place in `assets/` folder

### Option 3: Using Inkscape (Free Desktop App)

**Install Inkscape**:
- Mac: `brew install inkscape`
- Windows: Download from https://inkscape.org/
- Linux: `sudo apt install inkscape`

**Convert**:
```bash
cd assets

# Convert icon
inkscape icon.svg --export-type=png --export-filename=icon.png -w 1024 -h 1024

# Convert adaptive icon
inkscape adaptive-icon.svg --export-type=png --export-filename=adaptive-icon.png -w 1024 -h 1024

# Convert splash
inkscape splash.svg --export-type=png --export-filename=splash.png -w 1242 -h 2436

# Convert notification icon
inkscape notification-icon.svg --export-type=png --export-filename=notification-icon.png -w 96 -h 96
```

### Option 4: Using ImageMagick (Command Line)

**Install ImageMagick**:
- Mac: `brew install imagemagick`
- Windows: Download from https://imagemagick.org/
- Linux: `sudo apt install imagemagick`

**Convert**:
```bash
cd assets

# Convert icon
convert -background none icon.svg -resize 1024x1024 icon.png

# Convert adaptive icon
convert -background none adaptive-icon.svg -resize 1024x1024 adaptive-icon.png

# Convert splash
convert -background none splash.svg -resize 1242x2436 splash.png

# Convert notification icon
convert -background none notification-icon.svg -resize 96x96 notification-icon.png
```

### Option 5: Using Node.js Script (Automated)

**Install sharp**:
```bash
npm install --save-dev sharp
```

**Create conversion script** (`convert-assets.js`):
```javascript
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
```

**Run**:
```bash
node convert-assets.js
```

## After Conversion

1. **Verify files exist**:
   ```bash
   ls -lh assets/*.png
   ```

2. **Check file sizes**:
   - `icon.png` should be ~50-200KB
   - `adaptive-icon.png` should be ~50-200KB
   - `splash.png` should be ~100-500KB
   - `notification-icon.png` should be ~5-20KB

3. **Update app.json** (if needed):
   ```json
   {
     "expo": {
       "icon": "./assets/icon.png",
       "splash": {
         "image": "./assets/splash.png",
         "backgroundColor": "#020617"
       },
       "android": {
         "adaptiveIcon": {
           "foregroundImage": "./assets/adaptive-icon.png",
           "backgroundColor": "#020617"
         }
       },
       "notification": {
         "icon": "./assets/notification-icon.png",
         "color": "#6366F1"
       }
     }
   }
   ```

4. **Test the app**:
   ```bash
   npm start
   ```

5. **Optional: Delete SVG files** (after confirming PNGs work):
   ```bash
   rm assets/*.svg
   ```

## Troubleshooting

### SVG not converting properly
- Try a different conversion method
- Check if SVG file is valid (open in browser)
- Ensure dimensions are correct

### PNG files too large
- Use PNG compression tools
- Try: https://tinypng.com/
- Or: `pngquant assets/*.png`

### Colors look wrong
- SVG might not render correctly
- Try opening SVG in Figma and exporting
- Adjust colors in SVG file if needed

## Design Customization

If you want to customize the designs:

1. **Edit SVG files** in any text editor
2. **Change colors**:
   - Primary: `#6366F1` (indigo)
   - Background: `#020617` (dark slate)
   - Text: `#F8FAFC` (light)
3. **Modify shapes** using SVG path syntax
4. **Re-convert** to PNG

## Professional Design (Optional)

For production-quality assets, consider:

1. **Hire a designer** on Fiverr/Upwork ($50-200)
2. **Use design templates** from:
   - https://www.figma.com/community
   - https://www.canva.com/
3. **AI design tools**:
   - https://www.midjourney.com/
   - https://www.dall-e.com/

## Quick Test

After conversion, test immediately:

```bash
# Clear cache and restart
npm start -- --clear

# Kill app and restart to see splash screen
# Check notification icon by sending test notification
```

---

**Estimated Time**: 10-30 minutes depending on method chosen

**Recommended**: Option 1 (Online Converter) for quickest results
