import axios from 'axios';

// Update this with your actual API URL
const API_URL = 'http://localhost:3000/api'; // Change for production

export const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized
    }
    return Promise.reject(error);
  }
);

// API Services
export const propertyService = {
  getAll: () => apiClient.get('/properties'),
  getById: (id) => apiClient.get(`/properties/${id}`),
  create: (data) => apiClient.post('/properties', data),
  update: (id, data) => apiClient.put(`/properties/${id}`, data),
  delete: (id) => apiClient.delete(`/properties/${id}`),
  
  // Get properties by landlord
  getByLandlord: (landlordId) => apiClient.get(`/properties/landlord/${landlordId}`),
  
  // Property units management
  getUnits: (propertyId) => apiClient.get(`/properties/${propertyId}/units`),
  addUnit: (propertyId, data) => apiClient.post(`/properties/${propertyId}/units`, data),
  updateUnit: (propertyId, unitId, data) => apiClient.put(`/properties/${propertyId}/units/${unitId}`, data),
  deleteUnit: (propertyId, unitId) => apiClient.delete(`/properties/${propertyId}/units/${unitId}`),
  
  // Property statistics
  getStats: (propertyId) => apiClient.get(`/properties/${propertyId}/stats`),
  
  // Upload property images
  uploadImages: (propertyId, formData) => apiClient.post(`/properties/${propertyId}/images`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
};

export const tenantService = {
  getAll: () => apiClient.get('/tenants'),
  getById: (id) => apiClient.get(`/tenants/${id}`),
  create: (data) => apiClient.post('/tenants', data),
  update: (id, data) => apiClient.put(`/tenants/${id}`, data),
  delete: (id) => apiClient.delete(`/tenants/${id}`),
  
  // Get tenants by landlord
  getByLandlord: (landlordId) => apiClient.get(`/tenants/landlord/${landlordId}`),
  
  // Get tenants by property
  getByProperty: (propertyId) => apiClient.get(`/tenants/property/${propertyId}`),
  
  // Tenant payments
  getPayments: (tenantId) => apiClient.get(`/tenants/${tenantId}/payments`),
  
  // Send reminders
  sendRentReminder: (tenantId, method) => apiClient.post(`/tenants/${tenantId}/remind`, { method }),
  
  // Lease management
  terminateLease: (tenantId, data) => apiClient.post(`/tenants/${tenantId}/terminate`, data),
  renewLease: (tenantId, data) => apiClient.post(`/tenants/${tenantId}/renew`, data),
  
  // Tenant statistics
  getStats: (tenantId) => apiClient.get(`/tenants/${tenantId}/stats`),
};

export const paymentService = {
  getAll: () => apiClient.get('/payments'),
  getById: (id) => apiClient.get(`/payments/${id}`),
  create: (data) => apiClient.post('/payments', data),
  
  // Mobile Money (M-Pesa) - STK Push
  initiateMpesaSTK: (data) => apiClient.post('/payments/mpesa/stk-push', data),
  
  // Mobile Money (M-Pesa) - Paybill with unique account number
  generatePaybillCode: (data) => apiClient.post('/payments/mpesa/paybill', data),
  
  // Verify M-Pesa payment status
  verifyMpesaPayment: (transactionId) => apiClient.get(`/payments/mpesa/verify/${transactionId}`),
  
  // Card Payment (Stripe/Flutterwave)
  initiateCardPayment: (data) => apiClient.post('/payments/card', data),
  
  // Bank Transfer
  initiateBankTransfer: (data) => apiClient.post('/payments/bank-transfer', data),
  
  // Get payment instructions
  getPaymentInstructions: (paymentId) => apiClient.get(`/payments/${paymentId}/instructions`),
  
  // Confirm manual payment (for bank transfer)
  confirmPayment: (paymentId, data) => apiClient.post(`/payments/${paymentId}/confirm`, data),
  
  // Get payment history
  getHistory: (tenantId) => apiClient.get(`/payments/history/${tenantId}`),
};

export const maintenanceService = {
  getAll: () => apiClient.get('/maintenance'),
  getById: (id) => apiClient.get(`/maintenance/${id}`),
  create: (data) => apiClient.post('/maintenance', data),
  update: (id, data) => apiClient.put(`/maintenance/${id}`, data),
  uploadPhoto: (id, formData) => apiClient.post(`/maintenance/${id}/photos`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
};

export const leaseService = {
  // Get all leases
  getAll: () => apiClient.get('/leases'),
  getById: (id) => apiClient.get(`/leases/${id}`),
  
  // Create and manage leases
  create: (data) => apiClient.post('/leases', data),
  update: (id, data) => apiClient.put(`/leases/${id}`, data),
  delete: (id) => apiClient.delete(`/leases/${id}`),
  
  // Get leases by landlord/tenant
  getByLandlord: (landlordId) => apiClient.get(`/leases/landlord/${landlordId}`),
  getByTenant: (tenantId) => apiClient.get(`/leases/tenant/${tenantId}`),
  getByProperty: (propertyId) => apiClient.get(`/leases/property/${propertyId}`),
  
  // Lease actions
  sign: (leaseId, data) => apiClient.post(`/leases/${leaseId}/sign`, data),
  renew: (leaseId, data) => apiClient.post(`/leases/${leaseId}/renew`, data),
  terminate: (leaseId, data) => apiClient.post(`/leases/${leaseId}/terminate`, data),
  
  // Documents
  uploadDocument: (leaseId, formData) => apiClient.post(`/leases/${leaseId}/documents`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  getDocuments: (leaseId) => apiClient.get(`/leases/${leaseId}/documents`),
  downloadDocument: (leaseId, documentId) => apiClient.get(`/leases/${leaseId}/documents/${documentId}/download`),
  
  // Lease templates
  getTemplates: () => apiClient.get('/leases/templates'),
  generateFromTemplate: (templateId, data) => apiClient.post(`/leases/templates/${templateId}/generate`, data),
};

export const documentService = {
  // Get all documents
  getAll: () => apiClient.get('/documents'),
  getById: (id) => apiClient.get(`/documents/${id}`),
  
  // Get documents by entity
  getByTenant: (tenantId) => apiClient.get(`/documents/tenant/${tenantId}`),
  getByLandlord: (landlordId) => apiClient.get(`/documents/landlord/${landlordId}`),
  getByProperty: (propertyId) => apiClient.get(`/documents/property/${propertyId}`),
  getByLease: (leaseId) => apiClient.get(`/documents/lease/${leaseId}`),
  
  // Upload document
  upload: (formData) => apiClient.post('/documents/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  
  // Download document
  download: (documentId) => apiClient.get(`/documents/${documentId}/download`, {
    responseType: 'blob',
  }),
  
  // Update document metadata
  update: (documentId, data) => apiClient.put(`/documents/${documentId}`, data),
  
  // Delete document
  delete: (documentId) => apiClient.delete(`/documents/${documentId}`),
  
  // Share document
  share: (documentId, data) => apiClient.post(`/documents/${documentId}/share`, data),
  
  // Get document categories
  getCategories: () => apiClient.get('/documents/categories'),
};

export const notificationService = {
  // Get notifications
  getAll: () => apiClient.get('/notifications'),
  getById: (id) => apiClient.get(`/notifications/${id}`),
  getByUser: (userId) => apiClient.get(`/notifications/user/${userId}`),
  getUnreadCount: (userId) => apiClient.get(`/notifications/user/${userId}/unread-count`),
  
  // Mark as read
  markAsRead: (notificationId) => apiClient.put(`/notifications/${notificationId}/read`),
  markAllAsRead: (userId) => apiClient.put(`/notifications/user/${userId}/read-all`),
  
  // Delete notifications
  delete: (notificationId) => apiClient.delete(`/notifications/${notificationId}`),
  deleteAll: (userId) => apiClient.delete(`/notifications/user/${userId}/all`),
  
  // Notification preferences
  getPreferences: (userId) => apiClient.get(`/notifications/user/${userId}/preferences`),
  updatePreferences: (userId, data) => apiClient.put(`/notifications/user/${userId}/preferences`, data),
  
  // Push notification tokens
  registerPushToken: (userId, token) => apiClient.post('/notifications/push-token', { userId, token }),
  
  // Send notification (admin/system)
  send: (data) => apiClient.post('/notifications/send', data),
};

export const messageService = {
  // Get conversations
  getConversations: (userId) => apiClient.get(`/messages/conversations/${userId}`),
  getConversationById: (conversationId) => apiClient.get(`/messages/conversations/details/${conversationId}`),
  
  // Get messages
  getMessages: (conversationId, page = 1, limit = 50) => 
    apiClient.get(`/messages/${conversationId}?page=${page}&limit=${limit}`),
  
  // Send message
  sendMessage: (data) => apiClient.post('/messages/send', data),
  
  // Mark as read
  markAsRead: (conversationId, userId) => 
    apiClient.put(`/messages/${conversationId}/read`, { userId }),
  
  // Get unread count
  getUnreadCount: (userId) => apiClient.get(`/messages/unread-count/${userId}`),
  
  // Create conversation
  createConversation: (data) => apiClient.post('/messages/conversations', data),
  
  // Upload attachment
  uploadAttachment: (formData) => apiClient.post('/messages/attachments', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  
  // Delete message
  deleteMessage: (messageId) => apiClient.delete(`/messages/${messageId}`),
  
  // Search messages
  searchMessages: (conversationId, query) => 
    apiClient.get(`/messages/${conversationId}/search?q=${query}`),
};

export const analyticsService = {
  // Dashboard analytics
  getDashboardStats: (landlordId) => apiClient.get(`/analytics/dashboard/${landlordId}`),
  
  // Financial reports
  getFinancialSummary: (landlordId, period) => 
    apiClient.get(`/analytics/financial/${landlordId}?period=${period}`),
  getIncomeReport: (landlordId, startDate, endDate) => 
    apiClient.get(`/analytics/income/${landlordId}?start=${startDate}&end=${endDate}`),
  getExpenseReport: (landlordId, startDate, endDate) => 
    apiClient.get(`/analytics/expenses/${landlordId}?start=${startDate}&end=${endDate}`),
  
  // Property analytics
  getPropertyPerformance: (propertyId, period) => 
    apiClient.get(`/analytics/property/${propertyId}?period=${period}`),
  getOccupancyReport: (landlordId) => 
    apiClient.get(`/analytics/occupancy/${landlordId}`),
  
  // Tenant analytics
  getTenantReport: (landlordId) => 
    apiClient.get(`/analytics/tenants/${landlordId}`),
  getPaymentReport: (landlordId, period) => 
    apiClient.get(`/analytics/payments/${landlordId}?period=${period}`),
  
  // Maintenance analytics
  getMaintenanceReport: (landlordId, period) => 
    apiClient.get(`/analytics/maintenance/${landlordId}?period=${period}`),
  
  // Export reports
  exportReport: (reportType, landlordId, format) => 
    apiClient.get(`/analytics/export/${reportType}/${landlordId}?format=${format}`, {
      responseType: 'blob',
    }),
};

export default apiClient;
