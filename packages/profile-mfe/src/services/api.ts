import axios from "axios";
import { TokenManager } from "@streamia/shared/utils";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

// Inject token automatically
api.interceptors.request.use((config) => {
  const token = TokenManager.getToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default api;
