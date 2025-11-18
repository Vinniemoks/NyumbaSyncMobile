# 📱 NyumbaSync Mobile App

Native mobile application for NyumbaSync property management platform, built with React Native and Expo.

## ✨ Features

- 📱 **Cross-Platform**: Works on both iOS and Android
- 🔐 **Secure Authentication**: JWT-based auth with AsyncStorage
- 💰 **Payment Processing**: M-Pesa and card payments
- 🔧 **Maintenance Requests**: Submit and track maintenance
- 📊 **Real-time Updates**: Live data synchronization
- 🎨 **Modern UI**: Clean, intuitive interface
- 🌐 **Offline Support**: Works with limited connectivity

## 🚀 Quick Start

### Prerequisites

- Node.js 16+ installed
- Expo CLI installed globally
- iOS Simulator (Mac) or Android Emulator
- Expo Go app on your phone (for testing)

### Installation

```bash
# Navigate to mobile app directory
cd NyumbaSyncMobile

# Install dependencies
npm install

# Start development server
npm start
```

### Running on Devices

#### iOS (Mac only)
```bash
npm run ios
```

#### Android
```bash
npm run android
```

#### Expo Go (Any device)
1. Install Expo Go from App Store or Play Store
2. Scan the QR code from terminal
3. App will load on your device

## 📁 Project Structure

```
NyumbaSyncMobile/
├── App.js                      # Main app entry
├── app.json                    # Expo configuration
├── package.json                # Dependencies
│
├── src/
│   ├── context/                # React Context
│   │   └── AuthContext.js      # Authentication state
│   │
│   ├── navigation/             # Navigation setup
│   │   ├── TenantNavigator.js  # Tenant tab navigation
│   │   ├── LandlordNavigator.js # Landlord tab navigation
│   │   ├── ManagerNavigator.js  # Manager tab navigation
│   │   └── AdminNavigator.js    # Admin tab navigation
│   │
│   ├── screens/                # Screen components
│   │   ├── SplashScreen.js     # Initial loading
│   │   ├── LoginScreen.js      # User login
│   │   ├── SignupScreen.js     # Registration
│   │   │
│   │   ├── Tenant/             # Tenant screens
│   │   │   ├── HomeScreen.js
│   │   │   ├── PaymentsScreen.js
│   │   │   ├── MaintenanceScreen.js
│   │   │   └── ProfileScreen.js
│   │   │
│   │   ├── Landlord/           # Landlord screens
│   │   │   ├── HomeScreen.js
│   │   │   ├── PropertiesScreen.js
│   │   │   ├── TenantsScreen.js
│   │   │   ├── FinancesScreen.js
│   │   │   └── ProfileScreen.js
│   │   │
│   │   └── Manager/            # Manager screens
│   │       └── ...
│   │
│   ├── services/               # API services
│   │   └── api.js              # API client & services
│   │
│   ├── components/             # Reusable components
│   │   ├── StatCard.js
│   │   ├── PropertyCard.js
│   │   └── ...
│   │
│   └── utils/                  # Utility functions
│       ├── constants.js
│       └── helpers.js
│
└── assets/                     # Images, fonts, etc.
```

## 🎯 User Roles & Features

### 👤 Tenant
- View dashboard with rent status
- Make rent payments (M-Pesa, Card)
- Submit maintenance requests
- View payment history
- Access lease documents
- Message landlord

### 🏠 Landlord
- View all properties
- Manage tenants
- Track income and expenses
- Review maintenance requests
- Financial reports
- Property analytics

### 🏢 Property Manager
- Manage multiple properties
- Rent collection tracking
- Maintenance queue
- Tenant management
- Performance metrics

### 🔐 Admin
- User management
- System settings
- Audit logs
- Analytics dashboard

## 🔧 Configuration

### API Configuration

Edit `src/services/api.js`:

```javascript
const API_URL = 'https://your-api-url.com/api';
```

### App Configuration

Edit `app.json`:

```json
{
  "expo": {
    "name": "NyumbaSync",
    "slug": "nyumbasync",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#3B82F6"
    },
    "ios": {
      "bundleIdentifier": "com.nyumbasync.app",
      "buildNumber": "1.0.0"
    },
    "android": {
      "package": "com.nyumbasync.app",
      "versionCode": 1
    }
  }
}
```

## 📦 Dependencies

### Core
- `expo`: ~52.0.0
- `react`: 18.2.0
- `react-native`: 0.76.0

### Navigation
- `@react-navigation/native`: ^6.1.9
- `@react-navigation/stack`: ^6.3.20
- `@react-navigation/bottom-tabs`: ^6.5.11

### UI & Icons
- `@expo/vector-icons`: ^14.0.0
- `react-native-vector-icons`: ^10.3.0

### Storage & API
- `@react-native-async-storage/async-storage`: ^2.1.0
- `axios`: ^1.10.0

## 🏗️ Building for Production

### iOS Build

```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Configure build
eas build:configure

# Build for iOS
eas build --platform ios
```

### Android Build

```bash
# Build APK
eas build --platform android --profile preview

# Build AAB (for Play Store)
eas build --platform android --profile production
```

## 🧪 Testing

### Run Tests
```bash
npm test
```

### E2E Testing
```bash
# Install Detox
npm install -g detox-cli

# Run E2E tests
detox test
```

## 📱 Screenshots

### Tenant Dashboard
- Home screen with rent status
- Payment processing
- Maintenance requests
- Profile management

### Landlord Dashboard
- Property overview
- Tenant management
- Financial reports
- Analytics

## 🔐 Security Features

- ✅ Secure token storage (AsyncStorage)
- ✅ JWT authentication
- ✅ API request encryption
- ✅ Biometric authentication (coming soon)
- ✅ PIN code protection (coming soon)

## 🌐 Offline Support

The app includes offline capabilities:
- Cached data for offline viewing
- Queue requests when offline
- Sync when connection restored

## 🎨 Customization

### Colors

Edit theme colors in your components:

```javascript
const colors = {
  primary: '#3B82F6',
  secondary: '#10B981',
  danger: '#EF4444',
  warning: '#F59E0B',
  // ... more colors
};
```

### Fonts

Add custom fonts in `assets/fonts/` and load them:

```javascript
import * as Font from 'expo-font';

await Font.loadAsync({
  'CustomFont': require('./assets/fonts/CustomFont.ttf'),
});
```

## 🐛 Troubleshooting

### Metro Bundler Issues
```bash
# Clear cache
expo start -c
```

### iOS Build Issues
```bash
# Clean iOS build
cd ios && pod install && cd ..
```

### Android Build Issues
```bash
# Clean Android build
cd android && ./gradlew clean && cd ..
```

## 📚 Resources

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Docs](https://reactnative.dev/)
- [React Navigation](https://reactnavigation.org/)

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Open Pull Request

## 📄 License

Proprietary - All rights reserved

## 📞 Support

- **Email**: support@nyumbasync.com
- **Mobile Support**: mobile@nyumbasync.com

---

**Built with ❤️ using React Native & Expo**
