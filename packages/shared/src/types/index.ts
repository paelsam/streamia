/**
 * User interface
 */
export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  age: number;
}

/**
 * Auth state
 */
export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

/**
 * Login credentials
 */
export interface LoginCredentials {
  email: string;
  password: string;
}

/**
 * Register data
 */
export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  age: number;
  password: string;
}

/**
 * API Response
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  status?: number;
  
}

/**
 * Movie interface
 */
export interface Movie {
  id: string | number;
  title: string;
  description?: string;
  category?: string;
  coverImage?: string;
  imageUrl?: string;
  videoUrl?: string;
  duration?: number;
  rating?: number;
}

/**
 * Comment interface
 */
export interface Comment {
  id: string;
  userId: string;
  movieId: string;
  text: string;
  createdAt: string;
  user?: {
    firstName: string;
    lastName: string;
  };
}

/**
 * Rating interface
 */
export interface Rating {
  id: string;
  userId: string;
  movieId: string;
  rating: number;
  createdAt: string;
}

/**
 * Favorite interface
 */
export interface Favorite {
  id: string;
  userId: string;
  movieId: string;
  createdAt: string;
}
