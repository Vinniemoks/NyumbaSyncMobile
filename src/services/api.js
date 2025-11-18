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
  create: (data) => apiClient.post('/payments', data),
  initiateMpesa: (data) => apiClient.post('/payments/mpesa', data),
  initiateStripe: (data) => apiClient.post('/payments/stripe', data),
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
