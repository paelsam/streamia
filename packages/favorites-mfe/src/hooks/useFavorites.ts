import { useState, useEffect, useCallback } from 'react';
import { favoritesAPI } from '../services/favoritesService';
import { TokenManager, eventBus, EVENTS, createLogger } from '@streamia/shared';
import type { Movie } from '../types/favorites.types';
import { mockMovies } from '../data/mockMovies';

const logger = createLogger('useFavorites-Hook');

interface UseFavoritesResult {
  favorites: Movie[];
  loading: boolean;
  error: string | null;
  addFavorite: (movieId: string, title: string, poster: string, note?: string) => Promise<boolean>;
  removeFavorite: (movieId: string) => Promise<boolean>;
  isFavorite: (movieId: string) => boolean;
  refreshFavorites: () => Promise<void>;
}

/**
 * Custom hook for managing favorites across the application
 * Handles API calls, state management, and EventBus communication
 */
export const useFavorites = (): UseFavoritesResult => {
  const [favorites, setFavorites] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Load favorites from API
   * Backend returns complete movie data from Cloudinary database
   */
  const loadFavorites = useCallback(async () => {
    const token = TokenManager.getToken();
    
    if (!token) {
      logger.warn('No token found, cannot load favorites');
      setFavorites([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await favoritesAPI.getFavorites(token);
      
      if (response.success && response.data) {
        const mappedFavorites: Movie[] = response.data.map((fav) => {
          const matched = mockMovies.find((m) => String(m.id) === String(fav.movieId));
          // Log para debuggear las URLs de las imágenes
          logger.info('Mapping favorite', { 
            movieId: fav.movieId, 
            title: fav.title,
            poster: matched?.imageUrl ||fav.poster,
            videoUrl: fav.videoUrl,
            hasPoster: !!fav.poster
          });
          
          // Usar poster del backend, o placeholder si no existe
          const imageUrl = matched?.imageUrl ||fav.poster || '/images/placeholder.png';
          
          return {
            id: fav.movieId,
            title: fav.title,
            imageUrl: imageUrl,
            videoUrl: fav.videoUrl,
            duration: fav.duration,
            hasAudio: fav.hasAudio,
            category: fav.category,
            note: fav.note
          };
        });
        
        setFavorites(mappedFavorites);
        logger.info('Favorites loaded', { count: mappedFavorites.length });
      } else {
        setError(response.error || 'Error al cargar favoritos');
        logger.error('Failed to load favorites', { error: response.error });
      }
    } catch (err) {
      const errorMsg = 'Error al cargar favoritos';
      setError(errorMsg);
      logger.error('Exception loading favorites', err);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Add a movie to favorites
   */
  const addFavorite = useCallback(async (
    movieId: string, 
    title: string, 
    poster: string, 
    note?: string
  ): Promise<boolean> => {
    const token = TokenManager.getToken();
    
    if (!token) {
      logger.warn('No token found, cannot add favorite');
      setError('Debes iniciar sesión para añadir favoritos');
      return false;
    }

    try {
      logger.info('Adding favorite', { movieId, title });
      
      const response = await favoritesAPI.addFavorite(token, {
        movieId,
        title,
        poster,
        note
      });
      
      if (response.success) {
        // Update local state optimistically
        const imageUrl = poster || '/images/placeholder.png';
        setFavorites(prev => [...prev, { 
          id: movieId, 
          title, 
          imageUrl: imageUrl,
          note 
        }]);
        logger.info('Favorite added successfully', { movieId });
        return true;
      } else {
        setError(response.error || 'Error al añadir favorito');
        logger.error('Failed to add favorite', { movieId, error: response.error });
        return false;
      }
    } catch (err) {
      setError('Error al añadir la película a favoritos');
      logger.error('Exception adding favorite', err);
      return false;
    }
  }, []);

  /**
   * Remove a movie from favorites
   */
  const removeFavorite = useCallback(async (movieId: string): Promise<boolean> => {
    const token = TokenManager.getToken();
    
    if (!token) {
      logger.warn('No token found, cannot remove favorite');
      return false;
    }

    try {
      logger.info('Removing favorite', { movieId });
      
      const response = await favoritesAPI.removeFavorite(token, movieId);
      
      if (response.success) {
        // Update local state optimistically
        setFavorites(prev => prev.filter(f => f.id !== movieId));
        logger.info('Favorite removed successfully', { movieId });
        return true;
      } else {
        setError(response.error || 'Error al eliminar favorito');
        logger.error('Failed to remove favorite', { movieId, error: response.error });
        return false;
      }
    } catch (err) {
      setError('Error al eliminar la película de favoritos');
      logger.error('Exception removing favorite', err);
      return false;
    }
  }, []);

  /**
   * Check if a movie is in favorites
   */
  const isFavorite = useCallback((movieId: string): boolean => {
    return favorites.some(f => f.id === movieId);
  }, [favorites]);

  /**
   * Manually refresh favorites list
   */
  const refreshFavorites = useCallback(async () => {
    await loadFavorites();
  }, [loadFavorites]);

  // Load favorites on mount
  useEffect(() => {
    loadFavorites();
  }, [loadFavorites]);

  // Subscribe to favorite events from other MFEs
  useEffect(() => {
    const unsubscribeAdded = eventBus.subscribe(EVENTS.FAVORITE_ADDED, (data) => {
      logger.info('Favorite added event received', data);
      // Reload favorites to ensure consistency
      loadFavorites();
    });

    const unsubscribeRemoved = eventBus.subscribe(EVENTS.FAVORITE_REMOVED, (data) => {
      logger.info('Favorite removed event received', data);
      // Remove from local state immediately
      setFavorites(prev => prev.filter(f => f.id !== data.movieId));
    });

    const unsubscribeLogout = eventBus.subscribe(EVENTS.USER_LOGOUT, () => {
      logger.info('User logout event received, clearing favorites');
      setFavorites([]);
      setError(null);
    });

    return () => {
      unsubscribeAdded();
      unsubscribeRemoved();
      unsubscribeLogout();
    };
  }, [loadFavorites]);

  return {
    favorites,
    loading,
    error,
    addFavorite,
    removeFavorite,
    isFavorite,
    refreshFavorites
  };
};
