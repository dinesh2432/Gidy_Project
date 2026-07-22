import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor — unwrap data, handle errors uniformly
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.message ||
      'An unexpected error occurred';
    const status = error.response?.status || 500;
    const err = new Error(message);
    err.status = status;
    err.data = error.response?.data;
    return Promise.reject(err);
  }
);

/**
 * Fetch paginated, filtered logs from the backend.
 * @param {object} params - Query params (page, limit, search, filters, sort)
 */
export const getLogs = (params) => {
  // Remove empty/null/undefined params before sending
  const cleanParams = Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== null && v !== undefined && v !== '')
  );
  return apiClient.get('/logs', { params: cleanParams });
};

/**
 * Fetch dashboard statistics.
 */
export const getLogStats = () => apiClient.get('/logs/stats');

/**
 * Fetch a single log by ID.
 * @param {string} id - MongoDB ObjectId
 */
export const getLogById = (id) => apiClient.get(`/logs/${id}`);

/**
 * Bulk upload logs from a JSON array.
 * @param {Array} records - Array of log objects
 */
export const uploadLogs = (records) =>
  apiClient.post('/logs/upload', records, {
    timeout: 120000, // 2 minute timeout for 10k record uploads
  });
