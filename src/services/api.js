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
};

export const tenantService = {
  getAll: () => apiClient.get('/tenants'),
  getById: (id) => apiClient.get(`/tenants/${id}`),
  create: (data) => apiClient.post('/tenants', data),
  update: (id, data) => apiClient.put(`/tenants/${id}`, data),
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

export default apiClient;
