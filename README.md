# NyumbaSync - Property Management App

A comprehensive React Native property management application for landlords and tenants in Kenya, featuring M-Pesa integration, real-time messaging, and analytics.

## Features

### For Tenants
- **Dashboard**: View rent due, maintenance requests, and lease information
- **Payments**: Pay rent via M-Pesa STK Push, Paybill, Card, or Bank Transfer
- **Lease Management**: View lease details, download documents, request renewals
- **Maintenance Requests**: Submit and track maintenance requests with priority levels
- **Messaging**: Real-time chat with landlords
- **Notifications**: Push notifications for payments, maintenance updates, and messages
- **Documents**: Upload and manage lease documents, receipts, and other files

### For Property Managers
- **Dashboard**: Overview of managed properties and collections
- **Property Management**: Manage properties on behalf of landlords
- **Tenant Management**: Track tenants across managed properties
- **Maintenance**: Assign contractors and track maintenance
- **Reports**: Generate reports for landlords

### For Admins
- **Dashboard**: System-wide statistics and overview
- **User Management**: Manage all system users
- **Property Oversight**: View all properties
- **System Reports**: Analytics and insights
- **Settings**: System configuration

### For Vendors/Contractors
- **Dashboard**: Job overview and earnings
- **Jobs**: Accept and complete maintenance jobs
- **Earnings**: Track payments
- **Reviews**: View ratings

### For Agents
- **Dashboard**: Listings and client overview
- **Listings**: Manage property listings
- **Clients**: Track leads and clients
- **Commissions**: Track earnings

### For Landlords
- **Dashboard**: Overview of properties, tenants, income, and maintenance
- **Property Management**: Add, edit, and manage properties with multiple units
- **Tenant Management**: Track tenant information, leases, and payment history
- **Unit Management**: Manage individual units within properties
- **Lease Management**: Create, track, and renew leases
- **Maintenance Management**: Assign contractors, track costs, and update status
- **Analytics & Reports**: Financial reports, occupancy rates, and performance metrics
- **Messaging**: Communicate with tenants in real-time
- **Notifications**: Stay updated on payments, maintenance, and tenant activities
- **Documents**: Manage property documents, leases, and tenant files

## Tech Stack

- **Framework**: React Native with Expo
- **Navigation**: React Navigation (Bottom Tabs + Stack)
- **State Management**: React Context API
- **Authentication**: JWT with 2FA/OTP support
- **Payment Integration**: M-Pesa Daraja API
- **Notifications**: Expo Notifications
- **Icons**: Expo Vector Icons (Ionicons)

## Design System

### Color Palette
- **Background**: Slate-950 (#020617)
- **Cards**: Slate-900 (#0F172A)
- **Primary**: Indigo-500 (#6366F1)
- **Success**: Green-500 (#10B981)
- **Warning**: Amber-500 (#F59E0B)
- **Error**: Red-500 (#EF4444)
- **Text Primary**: Slate-50 (#F8FAFC)
- **Text Secondary**: Slate-400 (#94A3B8)

### Typography
- **Headers**: Bold, 24px
- **Body**: Regular, 16px
- **Labels**: Semi-bold, 14px
- **Captions**: Regular, 12px

## Project Structure

```
src/
├── screens/
│   ├── Tenant/
│   │   ├── HomeScreen.js
│   │   ├── PaymentsScreen.js
│   │   ├── LeaseScreen.js
│   │   ├── MaintenanceScreen.js
│   │   ├── DocumentsScreen.js
│   │   ├── MessagesScreen.js
│   │   ├── NotificationsScreen.js
│   │   └── ProfileScreen.js
│   ├── Landlord/
│   │   ├── HomeScreen.js
│   │   ├── PropertiesScreen.js
│   │   ├── PropertyUnitsScreen.js
│   │   ├── TenantsScreen.js
│   │   ├── LeasesScreen.js
│   │   ├── MaintenanceScreen.js
│   │   ├── AnalyticsScreen.js
│   │   ├── DocumentsScreen.js
│   │   ├── MessagesScreen.js
│   │   ├── NotificationsScreen.js
│   │   └── ProfileScreen.js
│   ├── Shared/
│   │   ├── DocumentsScreen.js
│   │   ├── MessagesScreen.js
│   │   ├── ChatScreen.js
│   │   └── NotificationsScreen.js
│   ├── LoginScreen.js
│   └── SignupScreen.js
├── navigation/
│   ├── TenantNavigator.js
│   └── LandlordNavigator.js
├── context/
│   ├── AuthContext.js
│   └── NotificationContext.js
└── services/
    └── api.js
```

## Installation

1. Clone the repository
```bash
git clone <repository-url>
cd nyumbasync
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
Create a `.env` file in the root directory:
```
API_URL=https://your-api-url.com
MPESA_CONSUMER_KEY=your_consumer_key
MPESA_CONSUMER_SECRET=your_consumer_secret
MPESA_SHORTCODE=your_shortcode
MPESA_PASSKEY=your_passkey
```

4. Start the development server
```bash
npm start
```

## Payment Integration

### M-Pesa STK Push
- Initiates payment directly from user's phone
- Real-time payment confirmation
- Automatic receipt generation

### M-Pesa Paybill
- Fallback option if STK Push fails
- Manual payment with reference number
- Payment verification system

### Card Payments
- Secure card processing
- Support for Visa, Mastercard, and local cards
- PCI-compliant payment handling

### Bank Transfer
- Direct bank transfer option
- Account details provided
- Manual verification by landlord

## Authentication

- Email/Password login
- Two-Factor Authentication (2FA)
- OTP verification via SMS
- Forgot password with email reset
- JWT token-based sessions

## Notifications

- Push notifications for:
  - Payment reminders
  - Payment confirmations
  - Maintenance updates
  - New messages
  - Lease renewals
- In-app notification center
- Notification preferences

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/signup` - User registration
- `POST /api/auth/verify-otp` - Verify OTP
- `POST /api/auth/forgot-password` - Request password reset

### Payments
- `POST /api/payments/mpesa/stk-push` - Initiate M-Pesa payment
- `POST /api/payments/mpesa/callback` - M-Pesa callback
- `GET /api/payments/tenant/:id` - Get tenant payments
- `GET /api/payments/landlord/:id` - Get landlord payments

### Properties
- `GET /api/properties/landlord/:id` - Get landlord properties
- `POST /api/properties` - Create property
- `PUT /api/properties/:id` - Update property
- `DELETE /api/properties/:id` - Delete property

### Tenants
- `GET /api/tenants/landlord/:id` - Get landlord tenants
- `POST /api/tenants` - Add tenant
- `PUT /api/tenants/:id` - Update tenant
- `DELETE /api/tenants/:id` - Remove tenant

### Maintenance
- `GET /api/maintenance/tenant/:id` - Get tenant requests
- `GET /api/maintenance/landlord/:id` - Get landlord requests
- `POST /api/maintenance` - Create request
- `PUT /api/maintenance/:id` - Update request

### Documents
- `GET /api/documents/:userId` - Get user documents
- `POST /api/documents/upload` - Upload document
- `DELETE /api/documents/:id` - Delete document

### Messages
- `GET /api/messages/:userId` - Get user conversations
- `POST /api/messages` - Send message
- `GET /api/messages/conversation/:id` - Get conversation messages

## Development

### Running Tests
```bash
npm test
```

### Building for Production
```bash
# Android
npm run build:android

# iOS
npm run build:ios
```

### Code Style
- ESLint for code linting
- Prettier for code formatting
- Follow React Native best practices

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Support

For support, email support@nyumbasync.com or join our Slack channel.

## Roadmap

- [ ] WhatsApp integration for notifications
- [ ] Automated rent reminders
- [ ] Tenant screening and background checks
- [ ] Property inspection scheduling
- [ ] Utility bill management
- [ ] Multi-language support (Swahili, English)
- [ ] Dark/Light theme toggle
- [ ] Offline mode support
- [ ] Property marketplace
- [ ] Tenant portal for service requests

## Acknowledgments

- M-Pesa Daraja API for payment integration
- Expo team for the amazing framework
- React Navigation for seamless navigation
- All contributors and testers
