# NyumbaSync Assets

This folder contains all image assets for the NyumbaSync mobile application.

## Current Files

### SVG Files (Source)
- ✅ `icon.svg` - App icon source (1024x1024)
- ✅ `adaptive-icon.svg` - Android adaptive icon source (1024x1024)
- ✅ `splash.svg` - Splash screen source (1242x2436)
- ✅ `notification-icon.svg` - Notification icon source (96x96)

### PNG Files (Required for App)
- ⚠️ `icon.png` - App icon (needs conversion from SVG)
- ⚠️ `adaptive-icon.png` - Android adaptive icon (needs conversion)
- ⚠️ `splash.png` - Splash screen (needs conversion)
- ⚠️ `notification-icon.png` - Notification icon (needs conversion)

## Next Steps

**You need to convert SVG files to PNG!**

See `CONVERT_ASSETS.md` for detailed instructions.

### Quick Conversion (Online)

1. Go to https://cloudconvert.com/svg-to-png
2. Upload each SVG file
3. Download PNG files
4. Place in this folder

### Verify Conversion

After conversion, you should have:
```
assets/
├── icon.png (1024x1024)
├── adaptive-icon.png (1024x1024)
├── splash.png (1242x2436)
├── notification-icon.png (96x96)
├── icon.svg (source)
├── adaptive-icon.svg (source)
├── splash.svg (source)
├── notification-icon.svg (source)
├── CONVERT_ASSETS.md
└── README.md
```

## Asset Specifications

### App Icon (`icon.png`)
- **Size**: 1024x1024 pixels
- **Format**: PNG
- **Background**: Indigo (#6366F1)
- **Content**: White house icon with "NyumbaSync" text
- **Used for**: iOS/Android app icon, web favicon

### Adaptive Icon (`adaptive-icon.png`)
- **Size**: 1024x1024 pixels
- **Format**: PNG with transparency
- **Safe Zone**: 684x684 pixels (66% of canvas)
- **Content**: House icon (no text)
- **Used for**: Android adaptive icon (various shapes)

### Splash Screen (`splash.png`)
- **Size**: 1242x2436 pixels
- **Format**: PNG
- **Background**: Dark slate (#020617)
- **Content**: Centered house icon, app name, tagline, loading indicator
- **Used for**: App launch screen

### Notification Icon (`notification-icon.png`)
- **Size**: 96x96 pixels
- **Format**: PNG with transparency
- **Color**: White silhouette
- **Content**: Simple house icon
- **Used for**: Push notification icon (Android)

## Design Guidelines

### Colors
- **Primary**: Indigo #6366F1
- **Background**: Slate-950 #020617
- **Surface**: Slate-900 #0F172A
- **Text**: Slate-50 #F8FAFC
- **Secondary**: Slate-400 #94A3B8

### Icon Style
- Flat design
- Solid colors
- Clear silhouette
- Professional appearance
- Recognizable at all sizes

## Customization

To customize the designs:

1. Edit SVG files in any text editor or design tool
2. Modify colors, shapes, or text
3. Re-convert to PNG
4. Test in app

## Testing

After adding PNG files:

```bash
# Clear cache and restart
npm start -- --clear

# Test on device
# Kill and restart app to see splash screen
```

## File Sizes

Expected file sizes after conversion:
- `icon.png`: ~50-200 KB
- `adaptive-icon.png`: ~50-200 KB
- `splash.png`: ~100-500 KB
- `notification-icon.png`: ~5-20 KB

If files are larger, consider compression:
- https://tinypng.com/
- `pngquant assets/*.png`

## Production Assets

For app store submission, you'll also need:
- Screenshots (5-8 per platform)
- Feature graphic (1024x500 for Android)
- Promotional images
- App preview video (optional)

See `DEPLOYMENT.md` for details.

---

**Status**: SVG files created ✅  
**Action Required**: Convert SVG to PNG ⚠️  
**Estimated Time**: 10-30 minutes
