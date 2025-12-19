import axios from "axios";
import { TokenManager } from "@streamia/shared/utils";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

console.log('[Profile-MFE] API URL:', API_URL);

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

// Inject token automatically
api.interceptors.request.use((config) => {
  const token = TokenManager.getToken();
  console.log('[Profile-MFE] Request to:', config.url, 'Token:', token ? 'present' : 'missing');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// Log responses and errors
api.interceptors.response.use(
  (response) => {
    console.log('[Profile-MFE] Response:', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error('[Profile-MFE] API Error:', error.response?.status, error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default api;
