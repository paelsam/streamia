import React from 'react';
import type { Movie } from '../types/movie.types';
import '../styles/MovieCard.scss';

interface MovieCardProps {
  movie: Movie;
  isFavorite?: boolean;
  onFavoriteToggle?: (movieId: string) => void;
  onClick?: (movie: Movie) => void;
}

export const MovieCard: React.FC<MovieCardProps> = ({
  movie,
  isFavorite = false,
  onFavoriteToggle,
  onClick,
}) => {
  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onFavoriteToggle?.(movie.id);
  };

  const handleCardClick = () => {
    onClick?.(movie);
    
    // Emitir evento de película seleccionada
    window.dispatchEvent(
      new CustomEvent('movie:selected', {
        detail: { movieId: movie.id, movie },
      })
    );
  };

  return (
    <div className="movie-card" onClick={handleCardClick}>
      {/* Imagen */}
      <img
        src={movie.posterUrl}
        alt={movie.title}
        loading="lazy"
        onError={(e) => {
          (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300x450?text=No+Image';
        }}
      />
      
      {/* Overlay en hover */}
      <div className="movie-card__overlay" />

      {/* Contenido al hacer hover */}
      <div className="movie-card__content">
        <h3 className="movie-card__title">{movie.title}</h3>
        <p className="movie-card__description">{movie.description}</p>
        
        <div className="movie-card__meta">
          <div className="movie-card__rating">
            <span className="movie-card__rating-star">★</span>
            <span className="movie-card__rating-value">{movie.rating.toFixed(1)}</span>
          </div>
          <span className="movie-card__duration">{movie.duration} min</span>
        </div>

        {/* Géneros */}
        {movie.genres && movie.genres.length > 0 && (
          <div className="movie-card__genres">
            {movie.genres.slice(0, 2).map((genre) => (
              <span key={genre} className="movie-card__genre">
                {genre}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Botón de favorito */}
      {onFavoriteToggle && (
        <button
          onClick={handleFavoriteClick}
          className={`movie-card__favorite ${
            isFavorite ? 'movie-card__favorite--active' : 'movie-card__favorite--inactive'
          }`}
          aria-label={isFavorite ? 'Quitar de favoritos' : 'Añadir a favoritos'}
        >
          <svg viewBox="0 0 24 24">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </button>
      )}
    </div>
  );
};