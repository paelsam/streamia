import { TokenManager, eventBus, EVENTS, createLogger } from '@streamia/shared';
import { API_URL } from '@streamia/shared/config';
import type { 
  FavoriteItem, 
  AddFavoritePayload, 
  AddFavoriteResponse,
  UpdateFavoriteResponse,
  RemoveFavoriteResponse 
} from '../types/favorites.types';

const logger = createLogger('Favorites-MFE');

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  status?: number;
}

interface RequestConfig {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: Record<string, string>;
  body?: string;
}

async function makeRequest<T>(
  endpoint: string, 
  config: RequestConfig
): Promise<ApiResponse<T>> {
  try {
    const url = `${API_URL}${endpoint}`;
    
    // Include Authorization header automatically when token is present
    const token = TokenManager.getToken();
    const headers = {
      'Content-Type': 'application/json',
      ...config.headers,
    } as Record<string, string>;

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      ...config,
      headers,
    });

    if (response.status === 204) {
      return {
        success: true,
        data: {} as T
      };
    }

    const data = await response.json();

    if (!response.ok) {
      // Map some common HTTP status codes to friendly messages
      let errorMsg = data?.message || `HTTP Error: ${response.status}`;
      if (response.status === 409) {
        // Conflict - usually used when resource (like email) already exists
        errorMsg = 'El correo ya está registrado';
      } else if (response.status === 401) {
        // Unauthorized - token invalid or credentials wrong
        // Remove token locally to force re-authentication
        TokenManager.removeToken();
        errorMsg = 'Correo o contraseña inválidos';
      } else if (response.status === 400) {
        // Bad Request - validation or malformed data
        errorMsg = data?.message || 'Solicitud inválida';
      }

      return {
        success: false,
        status: response.status,
        error: errorMsg,
      };
    }

    return {
      success: true,
      data,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error occurred',
    };
  }
}

/**
 * Favorites API functions for backend integration.
 */
export const favoritesAPI = {
  /**
   * Get all favorites for the authenticated user.
   * Backend returns favorites with complete movie data from Cloudinary database.
   *
   * @param token - Authentication token
   * @returns ApiResponse<FavoriteItem[]>
   */
  async getFavorites(token: string): Promise<ApiResponse<FavoriteItem[]>> {
    logger.info('Fetching user favorites');
    
    const response = await makeRequest<FavoriteItem[]>('/favorites', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (response.success) {
      logger.info('Favorites fetched successfully', { 
        count: response.data?.length,
        favorites: response.data // Log completo para debug
      });
    } else {
      logger.error('Failed to fetch favorites', { error: response.error });
    }

    return response;
  },

  /**
   * Add a movie to favorites.
   * Backend validates required fields and prevents duplicates (409 if already exists).
   *
   * @param token - Authentication token
   * @param payload - Movie data: { movieId, title, poster, note? }
   * @returns ApiResponse<AddFavoriteResponse>
   */
  async addFavorite(
    token: string,
    payload: AddFavoritePayload
  ): Promise<ApiResponse<AddFavoriteResponse>> {
    logger.info('Adding movie to favorites', { movieId: payload.movieId });
    
    const response = await makeRequest<AddFavoriteResponse>('/favorites', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    if (response.success) {
      logger.info('Movie added to favorites successfully', { movieId: payload.movieId });
      
      // Emit event to notify other microfrontends
      eventBus.publish(EVENTS.FAVORITE_ADDED, { 
        movieId: payload.movieId,
        title: payload.title,
        timestamp: new Date().toISOString()
      });
    } else {
      logger.error('Failed to add movie to favorites', { 
        movieId: payload.movieId, 
        error: response.error 
      });
    }

    return response;
  },

  /**
   * Update a note in a favorite movie.
   * Backend verifies ownership before updating.
   *
   * @param token - Authentication token
   * @param id - Favorite document ID (_id from MongoDB)
   * @param note - New note content
   * @returns ApiResponse<UpdateFavoriteResponse>
   */
  async updateFavoriteNote(
    token: string,
    id: string,
    note: string
  ): Promise<ApiResponse<UpdateFavoriteResponse>> {
    logger.info('Updating favorite note', { id });
    
    const response = await makeRequest<UpdateFavoriteResponse>(`/favorites/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ note }),
    });

    if (response.success) {
      logger.info('Favorite note updated successfully', { id });
    } else {
      logger.error('Failed to update favorite note', { id, error: response.error });
    }

    return response;
  },

  /**
   * Remove a movie from favorites.
   * Backend verifies ownership and returns 404 if not found.
   *
   * @param token - Authentication token
   * @param movieId - Movie ID to remove
   * @returns ApiResponse<RemoveFavoriteResponse>
   */
  async removeFavorite(
    token: string,
    movieId: string
  ): Promise<ApiResponse<RemoveFavoriteResponse>> {
    logger.info('Removing movie from favorites', { movieId });
    
    const response = await makeRequest<RemoveFavoriteResponse>(`/favorites/${movieId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (response.success) {
      logger.info('Movie removed from favorites successfully', { movieId });
      
      // Emit event to notify other microfrontends
      eventBus.publish(EVENTS.FAVORITE_REMOVED, { 
        movieId,
        timestamp: new Date().toISOString()
      });
    } else {
      logger.error('Failed to remove movie from favorites', { 
        movieId, 
        error: response.error 
      });
    }

    return response;
  },
};

