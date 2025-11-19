/**
 * Unified API Configuration for NyumbaSync
 * This configuration is shared across web, mobile, and desktop applications
 */

// Environment-based API URL configuration
const getApiUrl = () => {
  // Check if running in development, staging, or production
  const env = process.env.NODE_ENV || 'development';
  
  switch (env) {
    case 'production':
      return process.env.API_URL || 'https://api.nyumbasync.com/api';
    case 'staging':
      return process.env.API_URL || 'https://staging-api.nyumbasync.com/api';
    case 'development':
    default:
      return process.env.API_URL || 'http://localhost:3001/api';
  }
};

// WebSocket configuration
const getSocketUrl = () => {
  const apiUrl = getApiUrl();
  // Remove /api suffix and replace http with ws
  return apiUrl.replace('/api', '').replace('http', 'ws');
};

export const API_CONFIG = {
  // Base API URL
  BASE_URL: getApiUrl(),
  
  // WebSocket URL for real-time communication
  SOCKET_URL: getSocketUrl(),
  
  // Request timeout (30 seconds)
  TIMEOUT: 30000,
  
  // Retry configuration
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000,
  
  // Token refresh threshold (5 minutes before expiry)
  TOKEN_REFRESH_THRESHOLD: 5 * 60 * 1000,
  
  // API Endpoints
  ENDPOINTS: {
    // Authentication
    AUTH: {
      LOGIN: '/auth/login',
      SIGNUP: '/auth/signup',
      LOGOUT: '/auth/logout',
      REFRESH: '/auth/refresh',
      ME: '/auth/me',
      FORGOT_PASSWORD: '/auth/forgot-password',
      RESET_PASSWORD: '/auth/reset-password',
      VERIFY_EMAIL: '/auth/verify-email',
      CHANGE_PASSWORD: '/auth/change-password',
    },
    
    // Properties
    PROPERTIES: {
      BASE: '/properties',
      BY_ID: (id) => `/properties/${id}`,
      BY_LANDLORD: (landlordId) => `/properties/landlord/${landlordId}`,
      UNITS: (propertyId) => `/properties/${propertyId}/units`,
      UNIT_BY_ID: (propertyId, unitId) => `/properties/${propertyId}/units/${unitId}`,
      STATS: (propertyId) => `/properties/${propertyId}/stats`,
      IMAGES: (propertyId) => `/properties/${propertyId}/images`,
    },
    
    // Tenants
    TENANTS: {
      BASE: '/tenants',
      BY_ID: (id) => `/tenants/${id}`,
      BY_LANDLORD: (landlordId) => `/tenants/landlord/${landlordId}`,
      BY_PROPERTY: (propertyId) => `/tenants/property/${propertyId}`,
      PAYMENTS: (tenantId) => `/tenants/${tenantId}/payments`,
      REMIND: (tenantId) => `/tenants/${tenantId}/remind`,
      TERMINATE: (tenantId) => `/tenants/${tenantId}/terminate`,
      RENEW: (tenantId) => `/tenants/${tenantId}/renew`,
      STATS: (tenantId) => `/tenants/${tenantId}/stats`,
      PROFILE: '/tenant/profile',
    },
    
    // Payments
    PAYMENTS: {
      BASE: '/payments',
      BY_ID: (id) => `/payments/${id}`,
      MPESA_STK: '/payments/mpesa/stk-push',
      MPESA_PAYBILL: '/payments/mpesa/paybill',
      MPESA_VERIFY: (transactionId) => `/payments/mpesa/verify/${transactionId}`,
      CARD: '/payments/card',
      BANK_TRANSFER: '/payments/bank-transfer',
      INSTRUCTIONS: (paymentId) => `/payments/${paymentId}/instructions`,
      CONFIRM: (paymentId) => `/payments/${paymentId}/confirm`,
      HISTORY: (tenantId) => `/payments/history/${tenantId}`,
    },
    
    // Maintenance
    MAINTENANCE: {
      BASE: '/maintenance',
      BY_ID: (id) => `/maintenance/${id}`,
      TENANT: '/tenant/maintenance',
      TENANT_BY_ID: (id) => `/tenant/maintenance/${id}`,
      PHOTOS: (id) => `/maintenance/${id}/photos`,
      RATE: (id) => `/tenant/maintenance/${id}/rate`,
    },
    
    // Leases
    LEASES: {
      BASE: '/leases',
      BY_ID: (id) => `/leases/${id}`,
      BY_LANDLORD: (landlordId) => `/leases/landlord/${landlordId}`,
      BY_TENANT: (tenantId) => `/leases/tenant/${tenantId}`,
      BY_PROPERTY: (propertyId) => `/leases/property/${propertyId}`,
      SIGN: (leaseId) => `/leases/${leaseId}/sign`,
      RENEW: (leaseId) => `/leases/${leaseId}/renew`,
      TERMINATE: (leaseId) => `/leases/${leaseId}/terminate`,
      DOCUMENTS: (leaseId) => `/leases/${leaseId}/documents`,
      DOCUMENT_BY_ID: (leaseId, documentId) => `/leases/${leaseId}/documents/${documentId}`,
      DOWNLOAD: (leaseId, documentId) => `/leases/${leaseId}/documents/${documentId}/download`,
      TEMPLATES: '/leases/templates',
      GENERATE: (templateId) => `/leases/templates/${templateId}/generate`,
    },
    
    // Documents
    DOCUMENTS: {
      BASE: '/documents',
      BY_ID: (id) => `/documents/${id}`,
      BY_TENANT: (tenantId) => `/documents/tenant/${tenantId}`,
      BY_LANDLORD: (landlordId) => `/documents/landlord/${landlordId}`,
      BY_PROPERTY: (propertyId) => `/documents/property/${propertyId}`,
      BY_LEASE: (leaseId) => `/documents/lease/${leaseId}`,
      UPLOAD: '/documents/upload',
      DOWNLOAD: (documentId) => `/documents/${documentId}/download`,
      SHARE: (documentId) => `/documents/${documentId}/share`,
      CATEGORIES: '/documents/categories',
      TENANT_DOCS: '/tenant/documents',
      TENANT_DOC_BY_ID: (id) => `/tenant/documents/${id}`,
    },
    
    // Notifications
    NOTIFICATIONS: {
      BASE: '/notifications',
      BY_ID: (id) => `/notifications/${id}`,
      BY_USER: (userId) => `/notifications/user/${userId}`,
      UNREAD_COUNT: (userId) => `/notifications/user/${userId}/unread-count`,
      MARK_READ: (notificationId) => `/notifications/${notificationId}/read`,
      MARK_ALL_READ: (userId) => `/notifications/user/${userId}/read-all`,
      DELETE: (notificationId) => `/notifications/${notificationId}`,
      DELETE_ALL: (userId) => `/notifications/user/${userId}/all`,
      PREFERENCES: (userId) => `/notifications/user/${userId}/preferences`,
      PUSH_TOKEN: '/notifications/push-token',
      SEND: '/notifications/send',
    },
    
    // Messages
    MESSAGES: {
      CONVERSATIONS: (userId) => `/messages/conversations/${userId}`,
      CONVERSATION_BY_ID: (conversationId) => `/messages/conversations/details/${conversationId}`,
      BY_CONVERSATION: (conversationId) => `/messages/${conversationId}`,
      SEND: '/messages/send',
      MARK_READ: (conversationId) => `/messages/${conversationId}/read`,
      UNREAD_COUNT: (userId) => `/messages/unread-count/${userId}`,
      CREATE_CONVERSATION: '/messages/conversations',
      ATTACHMENTS: '/messages/attachments',
      DELETE: (messageId) => `/messages/${messageId}`,
      SEARCH: (conversationId) => `/messages/${conversationId}/search`,
      TENANT_MESSAGES: '/tenant/messages',
      TENANT_MESSAGE_BY_ID: (id) => `/tenant/messages/${id}`,
      TENANT_MARK_READ: (id) => `/tenant/messages/${id}/read`,
    },
    
    // Analytics
    ANALYTICS: {
      DASHBOARD: (landlordId) => `/analytics/dashboard/${landlordId}`,
      FINANCIAL: (landlordId) => `/analytics/financial/${landlordId}`,
      INCOME: (landlordId) => `/analytics/income/${landlordId}`,
      EXPENSES: (landlordId) => `/analytics/expenses/${landlordId}`,
      PROPERTY_PERFORMANCE: (propertyId) => `/analytics/property/${propertyId}`,
      OCCUPANCY: (landlordId) => `/analytics/occupancy/${landlordId}`,
      TENANTS: (landlordId) => `/analytics/tenants/${landlordId}`,
      PAYMENTS: (landlordId) => `/analytics/payments/${landlordId}`,
      MAINTENANCE: (landlordId) => `/analytics/maintenance/${landlordId}`,
      EXPORT: (reportType, landlordId) => `/analytics/export/${reportType}/${landlordId}`,
    },
    
    // Vendors
    VENDORS: {
      BASE: '/vendors',
      BY_ID: (id) => `/vendors/${id}`,
      TENANT_VENDORS: '/tenant/vendors',
      TENANT_VENDOR_BY_ID: (id) => `/tenant/vendors/${id}`,
      CONTACT: (vendorId) => `/tenant/vendors/${vendorId}/contact`,
      REQUEST: (vendorId) => `/tenant/vendors/${vendorId}/request`,
    },
    
    // Move-Out
    MOVE_OUT: {
      REQUEST: '/tenant/move-out/request',
      STATUS: (requestId) => `/tenant/move-out/status/${requestId}`,
      CURRENT: '/tenant/move-out/current',
      CANCEL: (requestId) => `/tenant/move-out/request/${requestId}`,
    },
    
    // Deposit Refund
    DEPOSIT: {
      REFUND: '/tenant/deposit/refund',
      STATUS: (refundId) => `/tenant/deposit/status/${refundId}`,
      CURRENT: '/tenant/deposit/current',
      UPDATE_STATUS: (refundId) => `/tenant/deposit/refund/${refundId}/status`,
    },
    
    // Admin
    ADMIN: {
      USERS: '/admin/users',
      USER_BY_ID: (id) => `/admin/users/${id}`,
      SYSTEM_STATS: '/admin/system/stats',
      AUDIT_LOGS: '/admin/audit-logs',
      SETTINGS: '/admin/settings',
    },
  },
};

// Platform detection
export const PLATFORM = {
  isWeb: false,
  isMobile: true,
  isDesktop: false,
};

// Storage keys (consistent across platforms)
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'nyumbasync_auth_token',
  REFRESH_TOKEN: 'nyumbasync_refresh_token',
  USER_DATA: 'nyumbasync_user_data',
  DEVICE_ID: 'nyumbasync_device_id',
  PUSH_TOKEN: 'nyumbasync_push_token',
  THEME: 'nyumbasync_theme',
  LANGUAGE: 'nyumbasync_language',
};

export default API_CONFIG;
