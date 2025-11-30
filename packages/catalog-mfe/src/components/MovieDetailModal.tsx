import React, { useEffect, useCallback } from 'react';
import { X, Play, Heart, MessageCircle, Clock, Star, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { Movie } from '../types/movie.types';
import '../styles/MovieDetailModal.scss';

interface MovieDetailModalProps {
  movie: Movie | null;
  isOpen: boolean;
  onClose: () => void;
  isFavorite: boolean;
  onFavoriteToggle: (movieId: string) => void;
}

export const MovieDetailModal: React.FC<MovieDetailModalProps> = ({
  movie,
  isOpen,
  onClose,
  isFavorite,
  onFavoriteToggle,
}) => {
  const navigate = useNavigate();

  // Cerrar con ESC
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, handleKeyDown]);

  // Cerrar al hacer click en el backdrop
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handlePlayClick = () => {
    if (movie) {
      console.log('Play movie:', movie.id);
      // TODO: Implementar reproducción
    }
  };

  const handleCommentsClick = () => {
    if (movie) {
      // Navegar al microfrontend de comentarios
      navigate(`/comments/${movie.id}`);
      onClose();
    }
  };

  const handleFavoriteClick = () => {
    if (movie) {
      onFavoriteToggle(movie.id);
    }
  };

  // Formatear duración
  const formatDuration = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}min`;
    }
    return `${mins} min`;
  };

  // Obtener año de la fecha
  const getYear = (dateString: string): string => {
    try {
      return new Date(dateString).getFullYear().toString();
    } catch {
      return '';
    }
  };

  if (!isOpen || !movie) return null;

  return (
    <div className="movie-modal-overlay" onClick={handleBackdropClick}>
      <div className="movie-modal">
        {/* Header con imagen de fondo */}
        <div 
          className="movie-modal__header"
          style={{
            backgroundImage: `url(${movie.backdropUrl || movie.posterUrl})`
          }}
        >
          <div className="movie-modal__header-overlay" />
          
          {/* Botón cerrar */}
          <button 
            className="movie-modal__close"
            onClick={onClose}
            aria-label="Cerrar"
          >
            <X size={24} />
          </button>

          {/* Contenido del header */}
          <div className="movie-modal__header-content">
            <h1 className="movie-modal__title">{movie.title}</h1>
            
            {/* Metadata */}
            <div className="movie-modal__meta">
              <span className="movie-modal__rating">
                <Star size={16} fill="#f5c518" stroke="#f5c518" />
                {movie.rating.toFixed(1)}
              </span>
              <span className="movie-modal__year">
                <Calendar size={16} />
                {getYear(movie.releaseDate)}
              </span>
              <span className="movie-modal__duration">
                <Clock size={16} />
                {formatDuration(movie.duration)}
              </span>
            </div>

            {/* Botones de acción */}
            <div className="movie-modal__actions">
              <button 
                className="movie-modal__btn movie-modal__btn--play"
                onClick={handlePlayClick}
              >
                <Play size={20} fill="currentColor" />
                Reproducir
              </button>
              
              <button 
                className={`movie-modal__btn movie-modal__btn--favorite ${isFavorite ? 'active' : ''}`}
                onClick={handleFavoriteClick}
                title={isFavorite ? 'Quitar de favoritos' : 'Añadir a favoritos'}
              >
                <Heart size={20} fill={isFavorite ? 'currentColor' : 'none'} />
              </button>

              <button 
                className="movie-modal__btn movie-modal__btn--comments"
                onClick={handleCommentsClick}
              >
                <MessageCircle size={20} />
                Comentarios
              </button>
            </div>
          </div>
        </div>

        {/* Cuerpo del modal */}
        <div className="movie-modal__body">
          {/* Descripción */}
          <div className="movie-modal__section">
            <h3 className="movie-modal__section-title">Sinopsis</h3>
            <p className="movie-modal__description">{movie.description}</p>
          </div>

          {/* Géneros */}
          {movie.genres && movie.genres.length > 0 && (
            <div className="movie-modal__section">
              <h3 className="movie-modal__section-title">Géneros</h3>
              <div className="movie-modal__genres">
                {movie.genres.map((genre) => (
                  <span key={genre} className="movie-modal__genre-tag">
                    {genre}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Información adicional */}
          <div className="movie-modal__section">
            <h3 className="movie-modal__section-title">Información</h3>
            <div className="movie-modal__info-grid">
              <div className="movie-modal__info-item">
                <span className="movie-modal__info-label">Categoría</span>
                <span className="movie-modal__info-value">{movie.category || 'General'}</span>
              </div>
              <div className="movie-modal__info-item">
                <span className="movie-modal__info-label">Fecha de estreno</span>
                <span className="movie-modal__info-value">
                  {new Date(movie.releaseDate).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
              </div>
              <div className="movie-modal__info-item">
                <span className="movie-modal__info-label">Duración</span>
                <span className="movie-modal__info-value">{formatDuration(movie.duration)}</span>
              </div>
              <div className="movie-modal__info-item">
                <span className="movie-modal__info-label">Calificación</span>
                <span className="movie-modal__info-value">{movie.rating.toFixed(1)} / 10</span>
              </div>
            </div>
          </div>

          {/* Subtítulos disponibles */}
          {movie.subtitles && movie.subtitles.length > 0 && (
            <div className="movie-modal__section">
              <h3 className="movie-modal__section-title">Subtítulos disponibles</h3>
              <div className="movie-modal__subtitles">
                {movie.subtitles.map((sub) => (
                  <span key={sub.lang} className="movie-modal__subtitle-tag">
                    {sub.label}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MovieDetailModal;
