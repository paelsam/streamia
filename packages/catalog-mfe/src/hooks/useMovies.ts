import { useState, useEffect, useCallback } from 'react';
import { createLogger } from '@streamia/shared/utils';
import { movieService } from '../services/movieService';
import { favoritesService } from '../services/favoritesService';
import { eventBus, EVENTS } from '@streamia/shared/events';
import type { Movie, MovieFilters } from '../types/movie.types';

const logger = createLogger('CatalogMFE:useMovies');

export const useMovies = (filters?: MovieFilters) => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [favoritesLoaded, setFavoritesLoaded] = useState(false);

  // Cargar favoritos al montar
  useEffect(() => {
    const loadFavorites = async () => {
      try {
        logger.info('Loading favorites on mount');
        const favIds = await favoritesService.getFavorites();
        setFavorites(new Set(favIds));
        setFavoritesLoaded(true);
        logger.info('Favorites loaded', { count: favIds.length, ids: favIds });
      } catch (err) {
        logger.error('Error loading favorites', err);
        setFavoritesLoaded(true); // Marcar como cargado aunque falle
      }
    };
    
    loadFavorites();
  }, []); // Solo al montar

  // Cargar películas cuando cambien los filtros O cuando se carguen los favoritos
  useEffect(() => {
    if (!favoritesLoaded) {
      return; // Esperar a que los favoritos se carguen primero
    }

    const loadMovies = async () => {
      try {
        setLoading(true);
        setError(null);
        
        logger.info('Loading movies', { filters, favoritesCount: favorites.size });

        const response = await movieService.getMovies(filters);
        
        const moviesWithFavorites = response.movies.map(movie => ({
          ...movie,
          isFavorite: favorites.has(movie.id),
        }));
        
        setMovies(moviesWithFavorites);
        
        logger.info('Movies loaded successfully', { 
          count: moviesWithFavorites.length,
          favoritesCount: favorites.size
        });
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
        logger.error('Error loading movies', { error: err, filters });
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    loadMovies();
  }, [filters, favoritesLoaded, favorites]);

  const toggleFavorite = async (movieId: string) => {
    const wasFavorite = favorites.has(movieId);
    
    logger.debug('Toggling favorite', { movieId, wasFavorite });

    try {
      setFavorites(prev => {
        const next = new Set(prev);
        wasFavorite ? next.delete(movieId) : next.add(movieId);
        return next;
      });

      setMovies(prev =>
        prev.map(movie =>
          movie.id === movieId
            ? { ...movie, isFavorite: !wasFavorite }
            : movie
        )
      );

      // Usar el método del servicio 
      await favoritesService.toggleFavorite(movieId);

      logger.info('Favorite toggled successfully', { 
        movieId, 
        newState: !wasFavorite 
      });
    } catch (err) {
      // Revertir cambios en caso de error
      logger.error('Error toggling favorite, reverting changes', { 
        error: err, 
        movieId 
      });

      setFavorites(prev => {
        const next = new Set(prev);
        wasFavorite ? next.add(movieId) : next.delete(movieId);
        return next;
      });

      setMovies(prev =>
        prev.map(movie =>
          movie.id === movieId
            ? { ...movie, isFavorite: wasFavorite }
            : movie
        )
      );

      throw err;
    }
  };

  // Función para refetch manual
  const refetch = async () => {
    try {
      setLoading(true);
      setError(null);
      
      logger.info('Refetching movies', { filters });

      // Recargar favoritos también
      const favIds = await favoritesService.getFavorites();
      const newFavorites = new Set(favIds);
      setFavorites(newFavorites);

      const response = await movieService.getMovies(filters);
      
      const moviesWithFavorites = response.movies.map(movie => ({
        ...movie,
        isFavorite: newFavorites.has(movie.id),
      }));
      
      setMovies(moviesWithFavorites);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    logger.debug('Setting up favorite event listeners');

    const unsubscribeRemoved = eventBus.subscribe(
      EVENTS.FAVORITE_REMOVED,
      (data: { movieId: string }) => {
        logger.debug('Favorite removed event received', { movieId: data.movieId });
        
        setFavorites(prev => {
          const next = new Set(prev);
          next.delete(data.movieId);
          return next;
        });
        
        setMovies(prev =>
          prev.map(movie =>
            movie.id === data.movieId ? { ...movie, isFavorite: false } : movie
          )
        );
      }
    );

    const unsubscribeAdded = eventBus.subscribe(
      EVENTS.FAVORITE_ADDED,
      (data: { movieId: string }) => {
        logger.debug('Favorite added event received', { movieId: data.movieId });
        
        setFavorites(prev => new Set(prev).add(data.movieId));
        
        setMovies(prev =>
          prev.map(movie =>
            movie.id === data.movieId ? { ...movie, isFavorite: true } : movie
          )
        );
      }
    );

    return () => {
      logger.debug('Cleaning up favorite event listeners');
      unsubscribeRemoved();
      unsubscribeAdded();
    };
  }, []);

  return {
    movies,
    loading,
    error,
    favorites,
    toggleFavorite,
    refetch,
  };
};