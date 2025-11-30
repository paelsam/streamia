import React from 'react';
import { MovieCard } from './MovieCard';
import type { Movie } from '../types/movie.types';

interface MovieGridProps {
  movies: Movie[];
  loading?: boolean;
  onFavoriteToggle?: (movieId: string) => void;
  onMovieClick?: (movie: Movie) => void;
}

export const MovieGrid: React.FC<MovieGridProps> = ({
  movies,
  loading = false,
  onFavoriteToggle,
  onMovieClick,
}) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {[...Array(10)].map((_, i) => (
          <div
            key={i}
            className="h-80 bg-gray-200 animate-pulse rounded-lg"
          />
        ))}
      </div>
    );
  }

  if (movies.length === 0) {
    return (
      <div className="text-center py-12">
        <svg
          className="mx-auto h-16 w-16 text-gray-400 mb-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z"
          />
        </svg>
        <h3 className="text-lg font-medium text-gray-900 mb-1">
          No se encontraron películas
        </h3>
        <p className="text-gray-500">
          Intenta ajustar los filtros o la búsqueda
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
      {movies.map((movie) => (
        <MovieCard
          key={movie.id}
          movie={movie}
          isFavorite={movie.isFavorite}
          onFavoriteToggle={onFavoriteToggle}
          onClick={onMovieClick}
        />
      ))}
    </div>
  );
};