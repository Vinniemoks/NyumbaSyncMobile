// Which dashboard each backend role opens. One map for sign-in, MFA, the
// new-network screen and app start, so they cannot drift apart.
const ROUTES = {
  super_admin: 'AdminDashboard',
  admin: 'AdminDashboard',
  support_admin: 'AdminDashboard',
  finance_admin: 'AdminDashboard',
  operations_admin: 'AdminDashboard',
  sales_customer_service_admin: 'AdminDashboard',
  viewer: 'AdminDashboard',
  manager: 'PropertyManagerDashboard',
  property_manager: 'PropertyManagerDashboard',
  landlord: 'LandlordDashboard',
  tenant: 'TenantDashboard',
  vendor: 'VendorDashboard',
  agent: 'AgentDashboard',
};

export const dashboardFor = (user) => ROUTES[user?.role] || null;
