
/**
 * Environment configuration for the STREAMIA client.
 *
 * Centralizes base API URLs, endpoint helpers and application constants.
 */

export const API_BASE_URL =
  (import.meta as any).env.VITE_API_URL || "http://localhost:3000";


export const config = {
  API_BASE_URL,

  ENDPOINTS: {
    AUTH: {
      REGISTER: `${API_BASE_URL}/api/users/register`,
      LOGIN: `${API_BASE_URL}/api/users/login`,
      LOGOUT: `${API_BASE_URL}/api/users/logout`,
      PROFILE: `${API_BASE_URL}/api/users/me`,
      UPDATE_PROFILE: `${API_BASE_URL}/api/users/me`,
      DELETE_ACCOUNT: `${API_BASE_URL}/api/users/me`,
      FORGOT_PASSWORD: `${API_BASE_URL}/api/users/forgot-password`,
      RESET_PASSWORD: `${API_BASE_URL}/api/users/reset-password`,
    },
    MOVIES: {
      LIST: `${API_BASE_URL}/api/movies`,
      DETAIL: (id: string) => `${API_BASE_URL}/api/movies/${id}`,
      POPULAR: `${API_BASE_URL}/api/movies/external/popular`,
      EXPLORE: `${API_BASE_URL}/api/movies/explore`,
    },
  },

  TOKEN_KEY: "authToken",
  APP_NAME: "STREAMIA",
  APP_VERSION: "1.0.0",
  DEBUG: true,
} as const;