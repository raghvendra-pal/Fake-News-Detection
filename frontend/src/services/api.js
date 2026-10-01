import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const api = {
  // News Analysis
  analyzeNewsText: async (text, title = '') => {
    const response = await apiClient.post('/news/analyze-text', { text, title });
    return response.data;
  },

  analyzeNewsUrl: async (url) => {
    const response = await apiClient.post('/news/analyze-url', { url });
    return response.data;
  },

  getLatestNews: async (category = 'All', query = '', limit = 18, refresh = false) => {
    const response = await apiClient.get('/news/latest', {
      params: { category, query, limit, refresh },
    });
    return response.data;
  },

  // Review Analysis
  analyzeReview: async (reviewText, productName = '', category = 'General') => {
    const response = await apiClient.post('/reviews/analyze', {
      review_text: reviewText,
      product_name: productName,
      category,
    });
    return response.data;
  },

  // Standalone Claim Verification
  verifyClaim: async (claim) => {
    const response = await apiClient.post('/verification/verify-claim', { claim });
    return response.data;
  },

  // History & Dashboard
  getHistory: async (params = {}) => {
    const response = await apiClient.get('/history', { params });
    return response.data;
  },

  getHistoryDetail: async (id) => {
    const response = await apiClient.get(`/history/${id}`);
    return response.data;
  },

  deleteHistoryItem: async (id) => {
    const response = await apiClient.delete(`/history/${id}`);
    return response.data;
  },

  getDashboardStats: async () => {
    const response = await apiClient.get('/history/dashboard/stats');
    return response.data;
  },

  // Model Evaluation & Developer Specs
  getModelEvaluation: async () => {
    const response = await apiClient.get('/model/evaluation');
    return response.data;
  },

  checkHealth: async () => {
    const response = await apiClient.get('/health');
    return response.data;
  },
};

export default api;
