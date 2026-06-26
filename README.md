# NyumbaSync Mobile

React Native + Expo app for iOS and Android. Built for landlords, tenants, property managers, agents, vendors, and admins.

## Quick start

```bash
npm install
npx expo start    # scan QR with Expo Go, or press 'a' / 'i' for emulator
```

## Scripts

| Command | Purpose |
|---------|---------|
| `npm start` | Start Expo dev server |
| `npm run android` | Run on Android emulator |
| `npm run ios` | Run on iOS simulator (Mac only) |
| `npm run web` | Run in browser |

## Project structure

```
src/
├── screens/
│   ├── Tenant/          # Home, Payments, Maintenance, Lease, Profile, Documents, Messages, Notifications
│   ├── Landlord/        # Home, Properties, Tenants, Finances, Analytics, Maintenance, Leases, Profile
│   ├── PropertyManager/ # Home, Profile
│   ├── Agent/           # Home, Clients, Profile
│   ├── Admin/           # Home, Users, Profile
│   ├── Vendor/          # Home, Jobs, Earnings, Profile
│   ├── Shared/          # Documents, Messages, Chat, Notifications, ReceiptHistory
│   ├── LoginScreen.js
│   └── SignupScreen.js
├── navigation/          # Role-based navigators (TenantNavigator, LandlordNavigator, etc.)
├── context/             # AuthContext, NotificationContext
├── services/            # API client, WebSocket, notifications, receipts
├── components/          # Charts, Payment, PDF, NotificationBadge
└── config/              # API URLs, colors, theme
```

## API configuration

Create a `.env` file in the mobile app root (copy from `.env.example`):

```bash
cp .env.example .env
```

Edit `.env` to set your backend URL:

```bash
# For Android emulator
EXPO_PUBLIC_API_URL=http://10.0.2.2:3001/api
EXPO_PUBLIC_SOCKET_URL=ws://10.0.2.2:3001

# For iOS simulator
EXPO_PUBLIC_API_URL=http://localhost:3001/api
EXPO_PUBLIC_SOCKET_URL=ws://localhost:3001

# For production (update before building)
EXPO_PUBLIC_API_URL=https://api.nyumbasync.com/api
EXPO_PUBLIC_SOCKET_URL=wss://api.nyumbasync.com
```

> **Note:** Expo SDK 49+ requires `EXPO_PUBLIC_` prefix for environment variables to be available in JavaScript at runtime.

If you don't create a `.env` file, the app falls back to `http://10.0.2.2:3001/api` (Android emulator).

## Auth & cross-platform sync

- JWT tokens stored in `AsyncStorage` with keys `nyumbasync_auth_token` and `nyumbasync_refresh_token`
- Same keys as web/desktop so sessions are shared across platforms
- Axios request interceptor automatically attaches the Bearer token to every request
- 401 response triggers silent token refresh, then retries the original request

## Tech stack

React Native 0.81 · Expo SDK 54 · React Navigation · Axios · Socket.io-client · React Native Chart Kit · Expo Notifications · AsyncStorage

## Build & deploy

```bash
# Internal testing (APK / TestFlight)
eas build --platform android --profile preview
eas build --platform ios --profile preview

# Production (App Store / Play Store)
eas build --platform android --profile production
eas build --platform ios --profile production

# Submit to stores
eas submit --platform android
eas submit --platform ios
```

## More docs

- [docs/ARCHITECTURE.md](../docs/ARCHITECTURE.md) — system design & cross-platform sync
- [docs/API.md](../docs/API.md) — backend API endpoints
- [docs/DEPLOYMENT.md](../docs/DEPLOYMENT.md) — mobile store submission guide
- [docs/SECURITY.md](../docs/SECURITY.md) — auth, MFA, data protection
