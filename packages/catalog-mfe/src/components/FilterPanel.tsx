import React from 'react';
import { Star, X, RotateCcw } from 'lucide-react';
import '../styles/FilterPanel.scss';

interface FilterPanelProps {
  selectedGenre?: string;
  selectedRating?: number;
  onGenreChange: (genre: string | undefined) => void;
  onRatingChange: (rating: number | undefined) => void;
  onClearFilters: () => void;
}

const GENRES = [
  { id: 'Acción', label: 'Acción', icon: '💥' },
  { id: 'Thriller', label: 'Thriller', icon: '🔪' },
  { id: 'Crimen', label: 'Crimen', icon: '🔫' },
  { id: 'Misterio', label: 'Misterio', icon: '🕵️' },
  { id: 'Terror', label: 'Terror', icon: '👻' },
  { id: 'Musical', label: 'Musical', icon: '🎵' },
  { id: 'Fantasía', label: 'Fantasía', icon: '✨' },
  { id: 'Romance', label: 'Romance', icon: '💕' },
  { id: 'Animación', label: 'Animación', icon: '🎨' },
  { id: 'Aventura', label: 'Aventura', icon: '🗺️' },
  { id: 'Ciencia Ficción', label: 'Ciencia Ficción', icon: '🚀' },
  { id: 'Comedia', label: 'Comedia', icon: '😄' },
  { id: 'Drama', label: 'Drama', icon: '🎭' },
  { id: 'Historia', label: 'Historia', icon: '📜' },
  { id: 'Bélica', label: 'Bélica', icon: '⚔️' },
  { id: 'Familia', label: 'Familia', icon: '👨‍👩‍👧‍👦' },
];

const RATINGS = [
  { value: 9, label: '9+ Excelentes' },
  { value: 8, label: '8+ Muy buenas' },
  { value: 7, label: '7+ Buenas' },
  { value: 6, label: '6+ Aceptables' },
  { value: 5, label: '5+ Todas' },
];

export const FilterPanel: React.FC<FilterPanelProps> = ({
  selectedGenre,
  selectedRating,
  onGenreChange,
  onRatingChange,
  onClearFilters,
}) => {
  const hasActiveFilters = selectedGenre || selectedRating;

  const handleGenreClick = (genreId: string) => {
    if (selectedGenre === genreId) {
      onGenreChange(undefined);
    } else {
      onGenreChange(genreId);
    }
  };

  const handleRatingClick = (rating: number) => {
    if (selectedRating === rating) {
      onRatingChange(undefined);
    } else {
      onRatingChange(rating);
    }
  };

  return (
    <div className="filter-panel">
      {/* Header with Clear Button */}
      {hasActiveFilters && (
        <div className="filter-panel__header">
          <button
            className="filter-panel__clear-btn"
            onClick={onClearFilters}
            aria-label="Limpiar filtros"
          >
            <RotateCcw size={16} />
            <span>Limpiar filtros</span>
          </button>
        </div>
      )}

      {/* Active Filters Pills */}
      {hasActiveFilters && (
        <div className="filter-panel__active-filters">
          {selectedGenre && (
            <div className="filter-pill">
              <span className="filter-pill__icon">
                {GENRES.find(g => g.id === selectedGenre)?.icon}
              </span>
              <span className="filter-pill__label">
                {selectedGenre}
              </span>
              <button
                className="filter-pill__remove"
                onClick={() => onGenreChange(undefined)}
                aria-label={`Eliminar filtro ${selectedGenre}`}
              >
                <X size={14} />
              </button>
            </div>
          )}
          {selectedRating && (
            <div className="filter-pill">
              <Star size={14} className="filter-pill__star" fill="currentColor" />
              <span className="filter-pill__label">
                {selectedRating}+
              </span>
              <button
                className="filter-pill__remove"
                onClick={() => onRatingChange(undefined)}
                aria-label="Eliminar filtro de calificación"
              >
                <X size={14} />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Genres Section */}
      <div className="filter-section">
        <h4 className="filter-section__title">
          <span className="filter-section__icon">🎬</span>
          Géneros
        </h4>
        <div className="filter-section__content">
          {GENRES.map((genre) => (
            <button
              key={genre.id}
              className={`genre-chip ${
                selectedGenre === genre.id ? 'genre-chip--active' : ''
              }`}
              onClick={() => handleGenreClick(genre.id)}
              aria-pressed={selectedGenre === genre.id}
            >
              <span className="genre-chip__icon">{genre.icon}</span>
              <span className="genre-chip__label">{genre.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Rating Section */}
      <div className="filter-section">
        <h4 className="filter-section__title">
          <Star size={18} className="filter-section__icon-star" fill="currentColor" />
          Calificación
        </h4>
        <div className="filter-section__content">
          {RATINGS.map((rating) => (
            <button
              key={rating.value}
              className={`rating-option ${
                selectedRating === rating.value ? 'rating-option--active' : ''
              }`}
              onClick={() => handleRatingClick(rating.value)}
              aria-pressed={selectedRating === rating.value}
            >
              <div className="rating-option__stars">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    size={14}
                    className={`rating-option__star ${
                      i < Math.floor(rating.value / 2) ? 'rating-option__star--filled' : ''
                    }`}
                    fill={i < Math.floor(rating.value / 2) ? 'currentColor' : 'none'}
                  />
                ))}
              </div>
              <span className="rating-option__label">{rating.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};