import { createLogger } from '@streamia/shared/utils';
import { eventBus, EVENTS } from '@streamia/shared/events';
import type { FavoritePayload } from '../types/movie.types';

const logger = createLogger('FavoritesService');
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
//Prueba
const USE_MOCK_DATA = true;
//const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_DATA === 'true' || false;

class FavoritesService {
  private mockFavorites = new Set<string>();
  private readonly MOCK_STORAGE_KEY = 'streamia_mock_favorites';

  constructor() {
    this.loadMockFavoritesFromStorage();
  }

  /**
   * Cargar favoritos
   */
  private loadMockFavoritesFromStorage(): void {
    if (typeof window === 'undefined') return;

    try {
      const stored = localStorage.getItem(this.MOCK_STORAGE_KEY);
      if (stored) {
        const favoritesArray = JSON.parse(stored) as string[];
        this.mockFavorites = new Set(favoritesArray);
        logger.info('Mock favorites loaded from storage', { 
          count: favoritesArray.length 
        });
      }
    } catch (error) {
      logger.error('Error loading mock favorites from storage', error);
    }
  }

  /**
   * Guardar favoritos en localStorage
   */
  private saveMockFavoritesToStorage(): void {
    if (typeof window === 'undefined') return;

    try {
      const favoritesArray = Array.from(this.mockFavorites);
      localStorage.setItem(this.MOCK_STORAGE_KEY, JSON.stringify(favoritesArray));
      logger.debug('Mock favorites saved to storage', { 
        count: favoritesArray.length 
      });
    } catch (error) {
      logger.error('Error saving mock favorites to storage', error);
    }
  }

  /**
   * Add a movie to favorites
   */
  async addFavorite(payload: FavoritePayload): Promise<void> {
    try {
      logger.info('Adding favorite', { movieId: payload.movieId });

      // Modo Mock
      if (USE_MOCK_DATA) {
        await new Promise(resolve => setTimeout(resolve, 300)); 
        
        this.mockFavorites.add(payload.movieId);
        this.saveMockFavoritesToStorage();
        
        logger.info('Favorite added successfully (mock)', { 
          movieId: payload.movieId,
          totalFavorites: this.mockFavorites.size
        });

        eventBus.publish(EVENTS.FAVORITE_ADDED, { 
          movieId: payload.movieId 
        });
        return;
      }

      // Modo Backend 
      const response = await fetch(`${API_BASE_URL}/favorites`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || errorData.error || 'Error al añadir favorito';
        logger.error('Failed to add favorite', { 
          status: response.status, 
          error: errorMessage 
        });
        throw new Error(errorMessage);
      }

      const result = await response.json();
      logger.info('Favorite added successfully', { movieId: payload.movieId, result });

      eventBus.publish(EVENTS.FAVORITE_ADDED, { 
        movieId: payload.movieId 
      });
    } catch (error) {
      logger.error('Error adding favorite', error);
      throw error;
    }
  }

  /**
   * Remove a movie from favorites
   */
  async removeFavorite(movieId: string): Promise<void> {
    try {
      logger.info('Removing favorite', { movieId });

      // Modo Mock
      if (USE_MOCK_DATA) {
        await new Promise(resolve => setTimeout(resolve, 300)); 
        
        this.mockFavorites.delete(movieId);
        this.saveMockFavoritesToStorage();
        
        logger.info('Favorite removed successfully (mock)', { 
          movieId,
          totalFavorites: this.mockFavorites.size
        });

        eventBus.publish(EVENTS.FAVORITE_REMOVED, { 
          movieId 
        });
        return;
      }

      // Modo Backend 
      const response = await fetch(`${API_BASE_URL}/favorites/${movieId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || errorData.error || 'Error al eliminar favorito';
        logger.error('Failed to remove favorite', { 
          status: response.status, 
          error: errorMessage 
        });
        throw new Error(errorMessage);
      }

      logger.info('Favorite removed successfully', { movieId });

      eventBus.publish(EVENTS.FAVORITE_REMOVED, { 
        movieId 
      });
    } catch (error) {
      logger.error('Error removing favorite', error);
      throw error;
    }
  }
  /**
   * Get all user favorites
   * Returns array of movie IDs
   */
  async getFavorites(): Promise<string[]> {
    try {
      logger.info('Fetching user favorites');

      // Modo Mock
      if (USE_MOCK_DATA) {
        await new Promise(resolve => setTimeout(resolve, 200)); 
        
        const favoritesArray = Array.from(this.mockFavorites);
        logger.info('Favorites fetched successfully (mock)', { 
          count: favoritesArray.length 
        });
        return favoritesArray;
      }

      // Modo Backend 
      const response = await fetch(`${API_BASE_URL}/favorites`, {
        credentials: 'include',
      });

      // Si no está autenticado, devolver array vacío
      if (response.status === 401) {
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
      
      // Manejar diferentes formatos de respuesta del backend
      let favoriteIds: string[] = [];
      
      if (Array.isArray(data)) {
        favoriteIds = data.map(item => 
          typeof item === 'string' ? item : item.movieId || item.id
        );
      } else if (data.favorites && Array.isArray(data.favorites)) {
        favoriteIds = data.favorites.map((item: any) => 
          typeof item === 'string' ? item : item.movieId || item.id
        );
      } else if (data.data && Array.isArray(data.data)) {
        favoriteIds = data.data.map((item: any) => 
          typeof item === 'string' ? item : item.movieId || item.id
        );
      }

      logger.info('Favorites fetched successfully', { count: favoriteIds.length });
      return favoriteIds.filter(id => id != null);
    } catch (error) {
      logger.error('Error fetching favorites', error);
      return [];
    }
  }

  /**
   * Check if a movie is in favorites
   */
  async isFavorite(movieId: string): Promise<boolean> {
    try {
      if (USE_MOCK_DATA) {
        return this.mockFavorites.has(movieId);
      }

      const favorites = await this.getFavorites();
      return favorites.includes(movieId);
    } catch (error) {
      logger.error('Error checking favorite status', error);
      return false;
    }
  }

  /**
   * Toggle favorite status
   */
  async toggleFavorite(movieId: string, payload?: Omit<FavoritePayload, 'movieId'>): Promise<boolean> {
    try {
      const isFav = await this.isFavorite(movieId);
      
      if (isFav) {
        await this.removeFavorite(movieId);
        return false;
      } else {
        await this.addFavorite({ movieId, ...payload });
        return true;
      }
    } catch (error) {
      logger.error('Error toggling favorite', error);
      throw error;
    }
  }

  /**
   * Clear all mock favorites (útil para testing)
   */
  clearMockFavorites(): void {
    this.mockFavorites.clear();
    localStorage.removeItem(this.MOCK_STORAGE_KEY);
    logger.info('Mock favorites cleared');
  }

  getMockFavoritesCount(): number {
    return this.mockFavorites.size;
  }

  /**
   * Listen to favorite removed events from other MFEs
   */
  onFavoriteRemoved(callback: (data: { movieId: string }) => void): () => void {
    logger.debug('Subscribing to favorite:removed events');
    return eventBus.subscribe(EVENTS.FAVORITE_REMOVED, callback);
  }

  /**
   * Listen to favorite added events from other MFEs
   */
  onFavoriteAdded(callback: (data: { movieId: string }) => void): () => void {
    logger.debug('Subscribing to favorite:added events');
    return eventBus.subscribe(EVENTS.FAVORITE_ADDED, callback);
  }
}

export const favoritesService = new FavoritesService();
export default favoritesService;