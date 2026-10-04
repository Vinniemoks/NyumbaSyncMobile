// Role names as the backend stores them, with the labels people see.
export const ROLE_LABELS = {
  super_admin: 'Super admin',
  admin: 'Admin',
  support_admin: 'Support admin',
  finance_admin: 'Finance admin',
  operations_admin: 'Operations admin',
  sales_customer_service_admin: 'Sales & service admin',
  viewer: 'Viewer (read-only)',
  manager: 'Property manager',
  landlord: 'Landlord',
  agent: 'Agent',
  vendor: 'Vendor',
  tenant: 'Tenant',
};

export const ADMIN_LEVEL_ROLES = [
  'super_admin', 'admin', 'support_admin', 'finance_admin',
  'operations_admin', 'sales_customer_service_admin', 'viewer',
];

// Highest privilege first, so "reduce privileges" is moving down this list.
export const ROLE_ORDER = [
  'super_admin', 'admin', 'finance_admin', 'operations_admin', 'support_admin',
  'sales_customer_service_admin', 'viewer', 'manager', 'landlord', 'agent', 'vendor', 'tenant',
];

export const roleLabel = (r) => ROLE_LABELS[r] || String(r || '').replace(/_/g, ' ');

export const isAdminLevel = (u) =>
  (Array.isArray(u?.roles) && u.roles.length ? u.roles : [u?.role]).some((r) => ADMIN_LEVEL_ROLES.includes(r));

export const fullName = (u) =>
  [u?.firstName, u?.lastName].filter(Boolean).join(' ') || u?.name || u?.email || '';
