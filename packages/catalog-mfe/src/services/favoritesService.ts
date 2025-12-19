import { createLogger } from '@streamia/shared/utils';
import { TokenManager } from '@streamia/shared/utils';
import { eventBus, EVENTS } from '@streamia/shared/events';
import { API_URL } from '@streamia/shared/config';
import type { FavoritePayload } from '../types/movie.types';

const logger = createLogger('FavoritesService');

class FavoritesService {
  /**
   * Obtener headers con autenticación
   */
  private getAuthHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    const token = TokenManager.getToken();
    if (token && TokenManager.isValidToken(token)) {
      headers['Authorization'] = `Bearer ${token}`;
      logger.debug('Added auth token to request headers');
    } else if (token) {
      logger.warn('Token found but invalid or expired');
      TokenManager.removeToken();
    }

    return headers;
  }

  /**
   * Verificar si el usuario está autenticado
   */
  private isAuthenticated(): boolean {
    return TokenManager.isCurrentTokenValid();
  }

  /**
   * Obtener el userId del localStorage o del token
   */
  private getUserId(): string | null {
    // Primero intentar obtener del localStorage (store global)
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const user = JSON.parse(storedUser);
        const userId = user.id || user._id || user.userId;
        if (userId) {
          logger.debug('Got userId from localStorage', { userId });
          return userId;
        }
      }
    } catch (error) {
      logger.warn('Error getting userId from localStorage', { error });
    }

    // Fallback: intentar obtener del token JWT
    const token = TokenManager.getToken();
    if (!token) return null;
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const userId = payload.userId || payload.id || payload.sub || null;
      logger.debug('Got userId from token', { userId });
      return userId;
    } catch (error) {
      logger.error('Error decoding token', { error });
      return null;
    }
  }

  /**
   * Añadir película a favoritos
   * POST /api/favorites
   */
  async addFavorite(payload: FavoritePayload): Promise<void> {
    try {
      logger.info('Adding favorite', { movieId: payload.movieId });

      // Verificar autenticación antes de hacer request
      if (!this.isAuthenticated()) {
        logger.warn('Attempted to add favorite without authentication');
        throw new Error('Debes iniciar sesión para añadir favoritos');
      }

      const response = await fetch(`${API_URL}/favorites`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ movieId: payload.movieId }),
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || errorData.error || 'Error al añadir favorito';
        
        logger.error('Failed to add favorite', { 
          status: response.status, 
          error: errorMessage,
          movieId: payload.movieId
        });

        // Si es error de autenticación, limpiar token
        if (response.status === 401) {
          TokenManager.removeToken();
          logger.warn('Token invalidated due to 401 response');
        }

        throw new Error(errorMessage);
      }

      const result = await response.json();
      logger.info('Favorite added successfully', { 
        movieId: payload.movieId, 
        response: result 
      });

      eventBus.publish(EVENTS.FAVORITE_ADDED, { 
        movieId: payload.movieId 
      });
    } catch (error) {
      logger.error('Error adding favorite', { 
        error, 
        movieId: payload.movieId 
      });
      throw error;
    }
  }

  /**
   * Eliminar película de favoritos
   * DELETE /api/favorites/:movieId
   */
  async removeFavorite(movieId: string): Promise<void> {
    try {
      logger.info('Removing favorite', { movieId });

      // Verificar autenticación
      if (!this.isAuthenticated()) {
        logger.warn('Attempted to remove favorite without authentication');
        throw new Error('Debes iniciar sesión para gestionar favoritos');
      }

      const response = await fetch(`${API_URL}/favorites/${movieId}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders(),
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || errorData.error || 'Error al eliminar favorito';
        
        logger.error('Failed to remove favorite', { 
          status: response.status, 
          error: errorMessage,
          movieId
        });

        if (response.status === 401) {
          TokenManager.removeToken();
          logger.warn('Token invalidated due to 401 response');
        }

        throw new Error(errorMessage);
      }

      logger.info('Favorite removed successfully', { movieId });

      eventBus.publish(EVENTS.FAVORITE_REMOVED, { 
        movieId 
      });
    } catch (error) {
      logger.error('Error removing favorite', { error, movieId });
      throw error;
    }
  }

  /**
   * Obtener todos los favoritos del usuario
   * GET /api/favorites (userId viene del token)
   */
  async getFavorites(): Promise<string[]> {
    try {
      logger.info('Fetching user favorites');

      // Si no hay token válido, devolver array vacío
      if (!this.isAuthenticated()) {
        logger.debug('User not authenticated, returning empty favorites');
        return [];
      }

      const response = await fetch(`${API_URL}/favorites`, {
        headers: this.getAuthHeaders(),
        credentials: 'include',
      });

      // Log para debugging
      console.log('🎬 GET Favorites Request:', {
        url: `${API_URL}/favorites`,
        status: response.status,
        ok: response.ok
      });

      // Si no está autenticado, devolver array vacío
      if (response.status === 401) {
        TokenManager.removeToken();
        logger.warn('User not authenticated, returning empty favorites');
        return [];
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || errorData.error || 'Error al obtener favoritos';
        
        logger.error('Failed to fetch favorites', { 
          status: response.status, 
          error: errorMessage 
        });
        throw new Error(errorMessage);
      }

      const data = await response.json();
      
      // Log para debugging - ver estructura de respuesta
      console.log('🎬 GET Favorites Response:', {
        rawData: data,
        dataType: typeof data,
        isArray: Array.isArray(data),
        keys: data ? Object.keys(data) : []
      });
      
      logger.debug('Favorites API response', { data });
      
      // Manejar diferentes formatos de respuesta
      let favoriteIds: string[] = [];
      
      // Extraer el array de favoritos de la respuesta
      let favoritesArray: any[] = [];
      
      if (Array.isArray(data)) {
        favoritesArray = data;
      } else if (data.favorites && Array.isArray(data.favorites)) {
        favoritesArray = data.favorites;
      } else if (data.data && Array.isArray(data.data)) {
        favoritesArray = data.data;
      } else if (data.movies && Array.isArray(data.movies)) {
        favoritesArray = data.movies;
      }

      // Extraer IDs de cada item
      favoriteIds = favoritesArray.map(item => {
        if (typeof item === 'string') {
          return item;
        }
        // Si es un objeto de favorito con movieId como objeto (populated)
        if (item.movieId && typeof item.movieId === 'object') {
          return item.movieId._id || item.movieId.id;
        }
        // Si movieId es un string
        if (item.movieId && typeof item.movieId === 'string') {
          return item.movieId;
        }
        // Si es un objeto de película directamente
        return item._id || item.id;
      });

      logger.info('Favorites fetched successfully', { 
        count: favoriteIds.length,
        ids: favoriteIds
      });
      
      return favoriteIds.filter(id => id != null);
    } catch (error) {
      logger.error('Error fetching favorites', error);
      return [];
    }
  }

  /**
   * Verificar si una película está en favoritos
   */
  async isFavorite(movieId: string): Promise<boolean> {
    try {
      const favorites = await this.getFavorites();
      return favorites.includes(movieId);
    } catch (error) {
      logger.error('Error checking favorite status', { error, movieId });
      return false;
    }
  }

  /**
   * Toggle favorite status
   */
  async toggleFavorite(movieId: string, payload?: Omit<FavoritePayload, 'movieId'>): Promise<boolean> {
    try {
      const isFav = await this.isFavorite(movieId);
      
      logger.debug('Toggling favorite', { movieId, currentState: isFav });
      
      if (isFav) {
        await this.removeFavorite(movieId);
        return false;
      } else {
        await this.addFavorite({ movieId, ...payload });
        return true;
      }
    } catch (error) {
      logger.error('Error toggling favorite', { error, movieId });
      throw error;
    }
  }

  /**
   * Escuchar eventos de favoritos eliminados desde otros MFEs
   */
  onFavoriteRemoved(callback: (data: { movieId: string }) => void): () => void {
    logger.debug('Subscribing to favorite:removed events');
    return eventBus.subscribe(EVENTS.FAVORITE_REMOVED, callback);
  }

  /**
   * Escuchar eventos de favoritos añadidos desde otros MFEs
   */
  onFavoriteAdded(callback: (data: { movieId: string }) => void): () => void {
    logger.debug('Subscribing to favorite:added events');
    return eventBus.subscribe(EVENTS.FAVORITE_ADDED, callback);
  }
}

export const favoritesService = new FavoritesService();
export default favoritesService;
