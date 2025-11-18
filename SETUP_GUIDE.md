# 📱 NyumbaSync Mobile App - Complete Setup Guide

## 🎯 Overview

This is a complete React Native mobile application for NyumbaSync, built with Expo for cross-platform compatibility (iOS & Android).

## ✅ What's Included

### ✨ Completed Features

1. **Authentication System**
   - Login screen with JWT authentication
   - Signup screen with form validation
   - Splash screen with auto-navigation
   - Secure token storage with AsyncStorage
   - Auto-login on app restart

2. **Tenant Dashboard** (Fully Functional)
   - Home screen with stats and quick actions
   - Payments screen with M-Pesa/Card integration
   - Maintenance request submission and tracking
   - Profile management
   - Bottom tab navigation

3. **Landlord Dashboard** (Basic Structure)
   - Home screen with property overview
   - Properties, Tenants, Finances screens (placeholders)
   - Bottom tab navigation

4. **API Integration**
   - Axios-based API client
   - Service modules for properties, tenants, payments, maintenance
   - Request/response interceptors
   - Error handling

5. **Navigation**
   - Stack navigation for auth flow
   - Tab navigation for dashboards
   - Role-based routing

## 🚀 Quick Start

### Step 1: Install Dependencies

```bash
cd NyumbaSyncMobile
npm install
```

### Step 2: Start Development Server

```bash
npm start
```

This will open Expo Dev Tools in your browser.

### Step 3: Run on Device/Emulator

#### Option A: Physical Device (Easiest)
1. Install "Expo Go" app from App Store (iOS) or Play Store (Android)
2. Scan the QR code from terminal/browser
3. App will load on your device

#### Option B: iOS Simulator (Mac only)
```bash
npm run ios
```

#### Option C: Android Emulator
```bash
npm run android
```

## 📱 Testing the App

### Test Credentials (Mock)

Since the backend isn't connected yet, you can test with any credentials:

```
Email: test@example.com
Password: password123
```

The app will simulate login and navigate to the appropriate dashboard.

### Test Features

1. **Splash Screen**
   - Opens automatically
   - Shows NyumbaSync logo
   - Auto-navigates after 2 seconds

2. **Login**
   - Enter any email/password
   - Click "Sign In"
   - Navigates to Tenant Dashboard (default)

3. **Tenant Dashboard**
   - View rent status
   - Make payment (modal opens)
   - Submit maintenance request
   - View profile

## 🔧 Configuration

### Connect to Your Backend

Edit `src/services/api.js`:

```javascript
// For local development
const API_URL = 'http://localhost:3000/api';

// For production
const API_URL = 'https://your-api.com/api';

// For testing with ngrok
const API_URL = 'https://your-ngrok-url.ngrok.io/api';
```

### Update App Configuration

Edit `app.json`:

```json
{
  "expo": {
    "name": "NyumbaSync",
    "slug": "nyumbasync",
    "version": "1.0.0",
    "icon": "./assets/icon.png",
    "splash": {
      "image": "./assets/splash.png",
      "backgroundColor": "#3B82F6"
    }
  }
}
```

## 📂 Project Structure

```
NyumbaSyncMobile/
├── App.js                          # Main entry point
├── app.json                        # Expo configuration
├── package.json                    # Dependencies
│
├── src/
│   ├── context/
│   │   └── AuthContext.js          # ✅ Authentication state
│   │
│   ├── navigation/
│   │   ├── TenantNavigator.js      # ✅ Tenant tabs
│   │   ├── LandlordNavigator.js    # ✅ Landlord tabs
│   │   ├── ManagerNavigator.js     # 🔄 Placeholder
│   │   └── AdminNavigator.js       # 🔄 Placeholder
│   │
│   ├── screens/
│   │   ├── SplashScreen.js         # ✅ Complete
│   │   ├── LoginScreen.js          # ✅ Complete
│   │   ├── SignupScreen.js         # ✅ Complete
│   │   │
│   │   ├── Tenant/
│   │   │   ├── HomeScreen.js       # ✅ Complete
│   │   │   ├── PaymentsScreen.js   # ✅ Complete
│   │   │   ├── MaintenanceScreen.js # ✅ Complete
│   │   │   └── ProfileScreen.js    # ✅ Complete
│   │   │
│   │   └── Landlord/
│   │       ├── HomeScreen.js       # ✅ Basic
│   │       ├── PropertiesScreen.js # 🔄 Placeholder
│   │       ├── TenantsScreen.js    # 🔄 Placeholder
│   │       ├── FinancesScreen.js   # 🔄 Placeholder
│   │       └── ProfileScreen.js    # 🔄 Placeholder
│   │
│   └── services/
│       └── api.js                  # ✅ API client
│
└── assets/                         # Images, fonts, etc.
```

Legend:
- ✅ Complete and functional
- 🔄 Placeholder (needs implementation)

## 🎨 Customization

### Change Colors

Update colors throughout the app:

```javascript
const colors = {
  primary: '#3B82F6',      // Blue
  secondary: '#10B981',    // Green
  danger: '#EF4444',       // Red
  warning: '#F59E0B',      // Orange
  gray: '#6B7280',         // Gray
};
```

### Add Custom Fonts

1. Add font files to `assets/fonts/`
2. Load fonts in `App.js`:

```javascript
import * as Font from 'expo-font';

await Font.loadAsync({
  'CustomFont': require('./assets/fonts/CustomFont.ttf'),
});
```

### Update App Icon & Splash

1. Replace `assets/icon.png` (1024x1024)
2. Replace `assets/splash.png` (1242x2436)
3. Run `expo prebuild` to generate native assets

## 🔌 Backend Integration

### Step 1: Update API URL

```javascript
// src/services/api.js
const API_URL = 'https://your-backend-url.com/api';
```

### Step 2: Test API Connection

```javascript
// Test in any screen
import { apiClient } from '../services/api';

const testAPI = async () => {
  try {
    const response = await apiClient.get('/health');
    console.log('API Connected:', response.data);
  } catch (error) {
    console.error('API Error:', error);
  }
};
```

### Step 3: Handle Real Authentication

The `AuthContext` is already set up to handle real API responses:

```javascript
// Expected API response format
{
  "token": "jwt_token_here",
  "user": {
    "id": "123",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "tenant"
  }
}
```

## 📦 Building for Production

### iOS Build (Requires Mac or EAS)

```bash
# Install EAS CLI
npm install -g eas-cli

# Login
eas login

# Configure
eas build:configure

# Build
eas build --platform ios
```

### Android Build

```bash
# Build APK (for testing)
eas build --platform android --profile preview

# Build AAB (for Play Store)
eas build --platform android --profile production
```

## 🧪 Testing

### Manual Testing Checklist

- [ ] App launches successfully
- [ ] Splash screen displays
- [ ] Login form validates input
- [ ] Signup form validates input
- [ ] Navigation works between screens
- [ ] Tenant dashboard loads
- [ ] Payment modal opens
- [ ] Maintenance form submits
- [ ] Profile screen displays
- [ ] Logout works

### Automated Testing (Future)

```bash
# Install testing libraries
npm install --save-dev @testing-library/react-native jest

# Run tests
npm test
```

## 🐛 Troubleshooting

### Issue: Metro Bundler Won't Start

```bash
# Clear cache
expo start -c
```

### Issue: Module Not Found

```bash
# Reinstall dependencies
rm -rf node_modules
npm install
```

### Issue: iOS Build Fails

```bash
# Clean iOS build
cd ios && pod install && cd ..
```

### Issue: Android Build Fails

```bash
# Clean Android build
cd android && ./gradlew clean && cd ..
```

### Issue: Can't Connect to API

1. Check API URL is correct
2. Ensure backend is running
3. For localhost, use your computer's IP address:
   ```javascript
   const API_URL = 'http://192.168.1.100:3000/api';
   ```
4. For Android emulator, use:
   ```javascript
   const API_URL = 'http://10.0.2.2:3000/api';
   ```

## 📚 Next Steps

### Immediate Tasks

1. **Connect to Backend**
   - Update API URL
   - Test authentication
   - Verify data fetching

2. **Complete Landlord Dashboard**
   - Implement Properties screen
   - Implement Tenants screen
   - Implement Finances screen

3. **Add Manager Dashboard**
   - Create manager screens
   - Implement manager features

4. **Add Admin Dashboard**
   - Create admin screens
   - Implement admin features

### Future Enhancements

1. **Push Notifications**
   ```bash
   expo install expo-notifications
   ```

2. **Biometric Authentication**
   ```bash
   expo install expo-local-authentication
   ```

3. **Camera for Photos**
   ```bash
   expo install expo-camera expo-image-picker
   ```

4. **Offline Support**
   ```bash
   npm install @react-native-async-storage/async-storage
   ```

5. **Analytics**
   ```bash
   expo install expo-firebase-analytics
   ```

## 📞 Support

- **Documentation**: See README.md
- **Issues**: Create GitHub issue
- **Email**: mobile@nyumbasync.com

## 🎉 Success!

Your mobile app is now set up and ready for development!

### Quick Commands Reference

```bash
# Start development
npm start

# Run on iOS
npm run ios

# Run on Android
npm run android

# Clear cache
expo start -c

# Build for production
eas build --platform all
```

---

**Happy Coding! 🚀**
