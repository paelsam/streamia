import { useState, useEffect, useCallback } from 'react';
import { movieService } from '../services/movieService';
import { favoritesService } from '../services/favoritesService';
import { eventBus, EVENTS } from '@streamia/shared/events';
import type { Movie, MovieFilters } from '../types/movie.types';

export const useMovies = (filters?: MovieFilters) => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  const loadMovies = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await movieService.getMovies(filters);
      
      const moviesWithFavorites = response.movies.map(movie => ({
        ...movie,
        isFavorite: favorites.has(movie.id),
      }));
      
      setMovies(moviesWithFavorites);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  }, [filters, favorites]);

  const loadFavorites = async () => {
    try {
      const favIds = await favoritesService.getFavorites();
      setFavorites(new Set(favIds));
    } catch (err) {
      console.error('Error al cargar favoritos:', err);
    }
  };

  const toggleFavorite = async (movieId: string) => {
    const isFavorite = favorites.has(movieId);
    
    try {
      if (isFavorite) {
        await favoritesService.removeFavorite(movieId);
        setFavorites(prev => {
          const next = new Set(prev);
          next.delete(movieId);
          return next;
        });
      } else {
        await favoritesService.addFavorite({ movieId });
        setFavorites(prev => new Set(prev).add(movieId));
      }

      setMovies(prev =>
        prev.map(movie =>
          movie.id === movieId
            ? { ...movie, isFavorite: !isFavorite }
            : movie
        )
      );
    } catch (err) {
      console.error('Error al actualizar favorito:', err);
    }
  };

  useEffect(() => {
    loadFavorites();
  }, []);

  useEffect(() => {
    loadMovies();
  }, [loadMovies]);

  useEffect(() => {
    const unsubscribe = eventBus.subscribe(
      EVENTS.FAVORITE_REMOVED,
      (data: { movieId: string }) => {
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

    return unsubscribe;
  }, []);

  return {
    movies,
    loading,
    error,
    toggleFavorite,
    refetch: loadMovies,
  };
};