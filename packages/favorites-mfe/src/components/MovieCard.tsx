/**
 * MovieCard component displays a single movie tile with metadata and actions.
 */
import React from 'react';
import './MovieCard.scss';

/**
 * Props interface for MovieCard component
 */
interface MovieCardProps {
  id: string;
  title: string;
  imageUrl: string;
  className?: string;
  onClick?: () => void;
  onFavorite?: (movieId: string, isFavorite: boolean) => void;
  isFavorite?: boolean;
}

/**
 * Reusable movie card component
 * @param props - MovieCardProps
 * @returns JSX element containing the movie card
 */
const MovieCard: React.FC<MovieCardProps> = ({ 
  id, 
  title, 
  imageUrl, 
  className = '', 
  onClick,
  onFavorite, 
  isFavorite = false
}) => {
  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // evita que se dispare onClick
    onFavorite?.(id, !isFavorite);
  };
  return (
    <div className={`movie-card ${className}`}>
      <div className="movie-card__poster" style={{ backgroundImage: `url(${imageUrl})` }}>
        <div className="movie-card__overlay"></div>
        <button
          type="button"
          className="movie-card__click-target"
          onClick={onClick}
          aria-label={`Abrir ${title}`}
        />
        {isFavorite && (
          <button
            className={`movie-card__favorite-badge ${isFavorite ? 'is-favorite' : ''}`}
            onClick={handleFavoriteClick}
            aria-label={isFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}
            title={isFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}
            type="button"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden>
              <path d="M12 21s-7-4.35-9-6.5C-0.5 11.5 2.5 6 6.5 6c2 0 3.5 1.25 5.5 3.25C13 7.25 14.5 6 16.5 6 20.5 6 23.5 11.5 21 14.5 19 16.65 12 21 12 21z" />
            </svg>
          </button>
        )}
      </div>
      <h3 className="movie-card__title">{title}</h3>
    </div>
  );
};

export default MovieCard;