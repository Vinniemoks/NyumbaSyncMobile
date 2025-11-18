# NyumbaSync - User Roles & Permissions

## Overview

NyumbaSync supports six distinct user roles, each with specific features and permissions tailored to their needs in the property management ecosystem.

## User Roles

### 1. Tenant 🏠
**Primary Users**: People renting properties

#### Features
- View rent due and payment history
- Make payments (M-Pesa, Card, Bank Transfer)
- View lease details and documents
- Submit maintenance requests
- Chat with landlord/property manager
- Receive notifications
- Manage profile

#### Permissions
- Read: Own lease, payments, maintenance requests
- Create: Maintenance requests, messages
- Update: Own profile
- Delete: None

#### Navigation Tabs
1. Home (Dashboard)
2. Payments
3. Lease
4. Maintenance
5. Messages
6. Profile

---

### 2. Landlord 🏢
**Primary Users**: Property owners

#### Features
- Manage multiple properties and units
- Track tenants and leases
- Receive rent payments
- Assign maintenance to vendors
- View analytics and reports
- Communicate with tenants
- Manage documents

#### Permissions
- Read: Own properties, tenants, payments, maintenance
- Create: Properties, units, leases, maintenance assignments
- Update: Properties, units, tenants, leases
- Delete: Properties, units (with restrictions)

#### Navigation Tabs
1. Home (Dashboard)
2. Properties
3. Tenants
4. Maintenance
5. Analytics
6. Profile

---

### 3. Property Manager 👔
**Primary Users**: Professional property management companies

#### Features
- Manage properties for multiple landlords
- Handle tenant relationships
- Coordinate maintenance
- Generate reports for landlords
- Collect rent on behalf of landlords
- Full property operations

#### Permissions
- Read: Assigned properties, all tenants, payments, maintenance
- Create: Tenants, leases, maintenance assignments
- Update: Properties (assigned), tenants, leases
- Delete: Limited (with landlord approval)

#### Navigation Tabs
1. Home (Dashboard)
2. Properties
3. Tenants
4. Maintenance
5. Reports
6. Profile

#### Key Differences from Landlord
- Manages properties for others
- Cannot delete properties
- Generates reports for landlords
- May have commission-based earnings

---

### 4. Admin 🛡️
**Primary Users**: System administrators

#### Features
- Manage all users (CRUD operations)
- View all properties system-wide
- Access system analytics
- Configure system settings
- View audit logs
- Suspend/activate users
- System monitoring

#### Permissions
- Read: Everything
- Create: Users, system configurations
- Update: All users, properties, settings
- Delete: Users (with restrictions), data cleanup

#### Navigation Tabs
1. Home (Dashboard)
2. Users
3. Properties
4. Reports
5. Profile

#### Special Capabilities
- User role management
- System-wide search
- Bulk operations
- Data export
- Security settings
- Backup management

---

### 5. Vendor/Contractor 🔧
**Primary Users**: Service providers (plumbers, electricians, etc.)

#### Features
- View assigned maintenance jobs
- Accept/decline job requests
- Update job status
- Track earnings
- View ratings and reviews
- Communicate with property managers

#### Permissions
- Read: Assigned jobs, own earnings
- Create: Job updates, invoices
- Update: Job status, own profile
- Delete: None

#### Navigation Tabs
1. Home (Dashboard)
2. Jobs
3. Earnings
4. Profile

#### Job Workflow
1. Receive job notification
2. View job details
3. Accept or decline
4. Update status (in progress)
5. Mark as completed
6. Receive payment

---

### 6. Agent 🤝
**Primary Users**: Real estate agents

#### Features
- Manage property listings
- Track clients and leads
- Schedule property viewings
- Earn commissions on deals
- Market properties
- Connect landlords with tenants

#### Permissions
- Read: Listings, own clients
- Create: Listings, client records, viewings
- Update: Listings, client status
- Delete: Own listings (with restrictions)

#### Navigation Tabs
1. Home (Dashboard)
2. Listings
3. Clients
4. Profile

#### Commission Structure
- Percentage of first month's rent
- Percentage of lease value
- Flat fee per deal
- Configurable by admin

---

## Role Comparison Matrix

| Feature | Tenant | Landlord | Property Manager | Admin | Vendor | Agent |
|---------|--------|----------|------------------|-------|--------|-------|
| Manage Properties | ❌ | ✅ | ✅ | ✅ | ❌ | ✅ (Listings) |
| Manage Tenants | ❌ | ✅ | ✅ | ✅ | ❌ | ✅ (Leads) |
| Make Payments | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Receive Payments | ❌ | ✅ | ✅ | ❌ | ✅ | ✅ |
| Submit Maintenance | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Assign Maintenance | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Complete Maintenance | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ |
| View Analytics | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Manage Users | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ |
| System Settings | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ |

## Role Assignment

### During Signup
Users select their role during registration:
- Tenant
- Landlord
- Property Manager
- Agent
- Vendor

**Note**: Admin role can only be assigned by existing admins.

### Role Verification
Some roles may require verification:
- **Property Manager**: Business license
- **Vendor**: Trade certification
- **Agent**: Real estate license
- **Landlord**: Property ownership proof (optional)

### Role Switching
Users cannot switch roles after registration. They must create a new account for a different role.

## Color Coding

Each role has a distinct color theme:

- **Tenant**: Green (#10B981)
- **Landlord**: Indigo (#6366F1)
- **Property Manager**: Purple (#8B5CF6)
- **Admin**: Red (#EF4444)
- **Vendor**: Amber (#F59E0B)
- **Agent**: Blue (#3B82F6)

## Security Considerations

### Authentication
- All roles require email/phone verification
- 2FA optional for all roles
- 2FA mandatory for Admin

### Data Access
- Row-level security based on role
- Tenants see only their data
- Landlords see only their properties
- Property Managers see assigned properties
- Admins see everything

### API Permissions
- JWT tokens include role information
- Backend validates permissions per endpoint
- Rate limiting varies by role

## Future Enhancements

### Planned Role Features

#### Tenant
- Roommate management
- Rent splitting
- Tenant insurance integration

#### Landlord
- Multi-property portfolio management
- Automated rent increases
- Tenant screening tools

#### Property Manager
- White-label branding
- Custom reporting
- Bulk operations

#### Admin
- Advanced analytics
- A/B testing tools
- Feature flags

#### Vendor
- Service marketplace
- Vendor ratings
- Automated bidding

#### Agent
- MLS integration
- Virtual tours
- Lead scoring

## Role-Based Pricing

### Free Tier
- Tenant: Always free
- Vendor: Free (commission-based)

### Paid Tiers
- **Landlord**: KSh 500/month per property
- **Property Manager**: KSh 2,000/month (unlimited properties)
- **Agent**: KSh 1,000/month + commission
- **Admin**: Enterprise pricing

## Support & Training

### Role-Specific Documentation
- Each role has dedicated user guide
- Video tutorials per role
- In-app tooltips and walkthroughs

### Onboarding
- Role-specific onboarding flow
- Interactive tutorials
- Sample data for testing

## API Endpoints by Role

### Tenant Endpoints
- `GET /api/tenant/dashboard`
- `GET /api/tenant/payments`
- `POST /api/tenant/maintenance`
- `GET /api/tenant/lease`

### Landlord Endpoints
- `GET /api/landlord/properties`
- `POST /api/landlord/properties`
- `GET /api/landlord/tenants`
- `GET /api/landlord/analytics`

### Property Manager Endpoints
- `GET /api/manager/properties`
- `GET /api/manager/tenants`
- `POST /api/manager/reports`

### Admin Endpoints
- `GET /api/admin/users`
- `POST /api/admin/users`
- `PUT /api/admin/users/:id`
- `DELETE /api/admin/users/:id`
- `GET /api/admin/system/logs`

### Vendor Endpoints
- `GET /api/vendor/jobs`
- `PUT /api/vendor/jobs/:id/accept`
- `PUT /api/vendor/jobs/:id/complete`
- `GET /api/vendor/earnings`

### Agent Endpoints
- `GET /api/agent/listings`
- `POST /api/agent/listings`
- `GET /api/agent/clients`
- `GET /api/agent/commissions`

---

**Last Updated**: November 18, 2025  
**Version**: 1.0.0  
**Status**: All roles implemented and ready for testing
