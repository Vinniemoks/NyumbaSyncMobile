# NyumbaSync - Missing Assets & References

## ❌ Missing Image Assets

Based on the `app.json` configuration, the following image assets are **MISSING**:

### 1. **Splash Screen Image** ❌
- **File**: `assets/splash.png`
- **Required Size**: 1242x2436 pixels (iPhone X resolution)
- **Format**: PNG with transparency
- **Background**: Should match app theme (#020617 - slate-950)
- **Content**: App logo/icon centered

**Current Status**: Referenced in app.json but file doesn't exist

### 2. **Adaptive Icon (Android)** ⚠️
- **File**: `assets/adaptive-icon.png`
- **Required Size**: 1024x1024 pixels
- **Format**: PNG with transparency
- **Safe Zone**: Icon should fit within 66% of canvas (684x684px)
- **Purpose**: Android adaptive icon (different shapes on different devices)

**Current Status**: Not referenced in app.json, but recommended

### 3. **Notification Icon (Android)** ❌
- **File**: `assets/notification-icon.png`
- **Required Size**: 96x96 pixels
- **Format**: PNG with transparency
- **Color**: White icon on transparent background
- **Purpose**: Push notification icon

**Current Status**: Not referenced, but needed for notifications

### 4. **App Icon** ✅
- **File**: `assets/icon.png`
- **Status**: EXISTS ✅
- **Note**: Should be 1024x1024 pixels for best quality

---

## 📋 Required Assets Checklist

### Critical (App Won't Build Without These)
- [x] `assets/icon.png` - App icon (EXISTS)
- [ ] `assets/splash.png` - Splash screen
- [ ] `assets/adaptive-icon.png` - Android adaptive icon
- [ ] `assets/notification-icon.png` - Push notification icon

### Recommended (For Better UX)
- [ ] `assets/favicon.png` - Web favicon (16x16, 32x32, 48x48)
- [ ] `assets/logo.png` - App logo for marketing
- [ ] `assets/placeholder-property.png` - Property image placeholder
- [ ] `assets/placeholder-avatar.png` - User avatar placeholder
- [ ] `assets/empty-state.png` - Empty state illustrations

### Optional (Nice to Have)
- [ ] `assets/onboarding/` - Onboarding screen images
- [ ] `assets/illustrations/` - Custom illustrations
- [ ] `assets/fonts/` - Custom fonts (if needed)

---

## 🎨 Asset Specifications

### App Icon (`icon.png`)
```
Size: 1024x1024 pixels
Format: PNG (no transparency for iOS)
Content: NyumbaSync logo
Colors: Match brand colors (Indigo #6366F1)
```

### Splash Screen (`splash.png`)
```
Size: 1242x2436 pixels (iPhone X)
Format: PNG with transparency
Background: Dark (#020617)
Content: Centered logo with app name
Safe Area: Keep content within 1125x2001 pixels
```

### Adaptive Icon (`adaptive-icon.png`)
```
Size: 1024x1024 pixels
Format: PNG with transparency
Safe Zone: 684x684 pixels (66% of canvas)
Background: Transparent
Content: Logo that works on any shape
```

### Notification Icon (`notification-icon.png`)
```
Size: 96x96 pixels
Format: PNG with transparency
Color: White (#FFFFFF)
Background: Transparent
Style: Simple, recognizable silhouette
```

---

## 🔧 How to Create Missing Assets

### Option 1: Use Figma/Design Tool
1. Create designs in Figma/Sketch/Adobe XD
2. Export at required sizes
3. Place in `assets/` folder

### Option 2: Use Online Tools
- **App Icon Generator**: https://www.appicon.co/
- **Splash Screen Generator**: https://www.splashscreengenerator.com/
- **Adaptive Icon Generator**: https://romannurik.github.io/AndroidAssetStudio/

### Option 3: Use Expo's Asset Generator
```bash
# Install expo-optimize
npm install -g sharp-cli

# Optimize existing icon
npx expo-optimize

# This will generate all required sizes
```

---

## 📝 Update app.json After Creating Assets

Once you create the assets, update `app.json`:

```json
{
  "expo": {
    "icon": "./assets/icon.png",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
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

---

## 🖼️ Image References in Code

### Currently Used
The app currently uses:
- **Emoji Icons**: 🏠 🏢 👔 🛡️ 🔧 🤝 (in UI)
- **Ionicons**: From `@expo/vector-icons` (included with Expo)
- **No custom images**: All UI is icon-based

### Potential Future Needs
When backend is integrated, you'll need:
- Property images (from users)
- User profile pictures (from users)
- Document thumbnails (generated)
- Receipt images (generated)

---

## 🎯 Quick Fix: Create Placeholder Assets

### Temporary Solution
Until you have proper designs, create simple placeholder assets:

#### 1. Create Splash Screen
```bash
# Create a 1242x2436 image with:
# - Dark background (#020617)
# - White text "NyumbaSync" centered
# - House emoji 🏠 above text
```

#### 2. Create Adaptive Icon
```bash
# Create a 1024x1024 image with:
# - Transparent background
# - House emoji 🏠 or simple logo
# - Centered within 684x684 safe zone
```

#### 3. Create Notification Icon
```bash
# Create a 96x96 image with:
# - Transparent background
# - White house silhouette
# - Simple, recognizable shape
```

---

## 🚀 Asset Generation Script

Create a script to generate all assets from one source image:

```bash
# install-assets.sh

#!/bin/bash

# Requires ImageMagick
# Install: brew install imagemagick

SOURCE="source-icon.png"  # Your 1024x1024 source image

# Generate app icon
convert $SOURCE -resize 1024x1024 assets/icon.png

# Generate splash screen
convert -size 1242x2436 xc:"#020617" \
  $SOURCE -resize 400x400 -gravity center -composite \
  assets/splash.png

# Generate adaptive icon
convert $SOURCE -resize 1024x1024 assets/adaptive-icon.png

# Generate notification icon (white silhouette)
convert $SOURCE -resize 96x96 -colorspace Gray -threshold 50% \
  -fill white -colorize 100 assets/notification-icon.png

echo "✅ All assets generated!"
```

---

## 📱 Testing Assets

### Test Splash Screen
```bash
expo start
# Kill and restart app to see splash screen
```

### Test App Icon
```bash
# Build and install on device
expo build:android
# or
expo build:ios
```

### Test Notification Icon
```bash
# Send test notification
# Icon will appear in notification tray
```

---

## 🎨 Design Guidelines

### Brand Colors
- **Primary**: Indigo #6366F1
- **Background**: Slate-950 #020617
- **Surface**: Slate-900 #0F172A
- **Success**: Green #10B981
- **Warning**: Amber #F59E0B
- **Error**: Red #EF4444

### Logo Recommendations
- Simple, recognizable house icon
- Works in both light and dark themes
- Scalable (looks good at all sizes)
- Memorable and unique

### Icon Style
- Flat design (no gradients)
- Solid colors
- Clear silhouette
- Professional appearance

---

## 📦 Asset Delivery Checklist

Before submitting to app stores:

- [ ] App icon (1024x1024)
- [ ] Splash screen (1242x2436)
- [ ] Adaptive icon (1024x1024)
- [ ] Notification icon (96x96)
- [ ] Screenshots (various sizes)
- [ ] Feature graphic (1024x500 for Android)
- [ ] Promotional images
- [ ] App preview video (optional)

---

## 🔗 Useful Resources

- [Expo Asset Documentation](https://docs.expo.dev/guides/assets/)
- [iOS Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/app-icons)
- [Android Icon Design Guidelines](https://developer.android.com/guide/practices/ui_guidelines/icon_design_adaptive)
- [App Icon Generator](https://www.appicon.co/)
- [Figma Icon Templates](https://www.figma.com/community/search?model_type=files&q=app%20icon)

---

## ✅ Summary

**What's Missing**:
1. ❌ Splash screen image (`assets/splash.png`)
2. ❌ Adaptive icon (`assets/adaptive-icon.png`)
3. ❌ Notification icon (`assets/notification-icon.png`)

**What Exists**:
1. ✅ App icon (`assets/icon.png`)

**Action Required**:
1. Create the 3 missing image assets
2. Update `app.json` with proper references
3. Test on both iOS and Android
4. Prepare app store assets for launch

**Priority**: MEDIUM (App will run without these, but they're needed for production)
