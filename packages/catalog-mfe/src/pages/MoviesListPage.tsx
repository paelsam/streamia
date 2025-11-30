import React, { useState, useEffect } from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { eventBus, EVENTS } from '@streamia/shared/events';
import { createLogger } from '@streamia/shared/utils';
import { MovieGrid } from '../components/MovieGrid';
import { FilterPanel } from '../components/FilterPanel';
import { CategorySelector } from '../components/CategorySelector';
import { useMovies } from '../hooks/useMovies';
import { useFilters } from '../hooks/useFilters';
import '../styles/MoviesListPage.scss';

const logger = createLogger('MoviesListPage');

export const MoviesListPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);

  const initialCategory = searchParams.get('category') || undefined;
  const initialSearch = searchParams.get('search') || undefined;
  const initialGenre = searchParams.get('genre') || undefined;
  const initialRating = searchParams.get('rating') ? Number(searchParams.get('rating')) : undefined;

  const {
    filters,
    setCategory,
    setGenre,
    setRating,
    setSearch,
    clearFilters,
  } = useFilters({
    category: initialCategory,
    search: initialSearch,
    genre: initialGenre,
    rating: initialRating,
  });

  const {
    movies,
    loading,
    error,
    toggleFavorite,
  } = useMovies(filters);

  useEffect(() => {
    logger.info('Movies list page loaded', { filters });
    
    if (initialSearch) {
      setSearchQuery(initialSearch);
    }
    
    const unsubscribeAuth = eventBus.subscribe(
      EVENTS.USER_LOGIN, 
      handleUserAuthenticated
    );
    
    const unsubscribeFavRemoved = eventBus.subscribe(
      EVENTS.FAVORITE_REMOVED, 
      handleFavoriteRemoved
    );

    logger.debug('Event listeners configured via EventBus');

    return () => {
      logger.debug('Cleaning up event listeners');
      unsubscribeAuth();
      unsubscribeFavRemoved();
    };
  }, []);

  useEffect(() => {
    const params = new URLSearchParams();
    
    if (filters.category) params.set('category', filters.category);
    if (filters.search) params.set('search', filters.search);
    if (filters.genre) params.set('genre', filters.genre);
    if (filters.rating) params.set('rating', filters.rating.toString());

    const newSearch = params.toString();
    const currentSearch = searchParams.toString();
    
    if (newSearch !== currentSearch) {
      navigate(`/movies?${newSearch}`, { replace: true });
      logger.info('Filters updated and URL synced', { filters });
    }
  }, [filters, navigate, searchParams]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchQuery || undefined);
      if (searchQuery) {
        logger.debug('Search query updated with debounce', { query: searchQuery });
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery, setSearch]);

  const handleUserAuthenticated = (data: { userId: string; user: any }) => {
    logger.info('User authenticated event received', { userId: data.userId });
    window.location.reload();
  };

  const handleFavoriteRemoved = (data: { movieId: string }) => {
    logger.info('Favorite removed event received from external source', { movieId: data.movieId });
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
  };

  const handleMovieClick = (movie: any) => {
    logger.info('Movie clicked', { movieId: movie.id, title: movie.title });
    
    eventBus.publish(EVENTS.MOVIE_SELECTED, {
      movieId: movie.id,
      movie
    });
    
    navigate(`/movie/${movie.id}`);
  };

  const handleClearSearch = () => {
    logger.debug('Clearing search query');
    setSearchQuery('');
    setSearch(undefined);
  };

  const handleToggleFilters = () => {
    setShowFilters(!showFilters);
    logger.debug('Filters panel toggled', { visible: !showFilters });
  };

  return (
    <div className="movies-list">
      <div className="movies-list__header">
        <div className="movies-list__search-container">
          <Search size={20} className="movies-list__search-icon" />
          <input
            type="text"
            placeholder="Buscar películas..."
            value={searchQuery}
            onChange={handleSearch}
            className="movies-list__search-input"
          />
          {searchQuery && (
            <button 
              className="movies-list__clear-search"
              onClick={handleClearSearch}
            >
              ×
            </button>
          )}
        </div>
        
        <button
          className="movies-list__filter-toggle"
          onClick={handleToggleFilters}
        >
          <SlidersHorizontal size={20} />
          <span>Filtros</span>
        </button>
      </div>

      {filters.search && (
        <div className="movies-list__search-info">
          <h2>
            Resultados de búsqueda: "{filters.search}"
            <span className="movies-list__results-count">
              ({movies.length} película{movies.length !== 1 ? 's' : ''})
            </span>
          </h2>
          <button 
            className="movies-list__clear-search-btn"
            onClick={handleClearSearch}
          >
            Limpiar búsqueda
          </button>
        </div>
      )}

      {!filters.search && (
        <div className="movies-list__categories">
          <CategorySelector
            selectedCategory={filters.category}
            onCategoryChange={setCategory}
          />
        </div>
      )}

      <div className="movies-list__content">
        <aside className={`movies-list__sidebar ${showFilters ? 'show' : ''}`}>
          <div className="movies-list__sidebar-header">
            <h3>Filtros</h3>
            <button
              className="movies-list__sidebar-close"
              onClick={() => setShowFilters(false)}
            >
              ×
            </button>
          </div>
          <FilterPanel
            selectedGenre={filters.genre}
            selectedRating={filters.rating}
            onGenreChange={setGenre}
            onRatingChange={setRating}
            onClearFilters={clearFilters}
          />
        </aside>

        <main className="movies-list__main">
          <div className="movies-list__results-header">
            <p>
              {loading ? (
                'Cargando...'
              ) : (
                <>
                  {movies.length} película{movies.length !== 1 ? 's' : ''} encontrada{movies.length !== 1 ? 's' : ''}
                  {filters.category && ` en ${filters.category}`}
                  {filters.genre && ` - Género: ${filters.genre}`}
                  {filters.rating && ` - Rating: ${filters.rating}+`}
                </>
              )}
            </p>
          </div>

          {error && (
            <div className="movies-list__error">
              <p>Error: {error}</p>
              <button onClick={() => window.location.reload()} className="btn btn--primary">
                Reintentar
              </button>
            </div>
          )}

          {!loading && movies.length === 0 && (
            <div className="movies-list__no-results">
              <Search size={64} />
              <h3>No se encontraron películas</h3>
              <p>
                {filters.search 
                  ? `No hay resultados para "${filters.search}"`
                  : 'Prueba ajustando los filtros o busca algo diferente'
                }
              </p>
              <button
                className="btn btn--primary"
                onClick={clearFilters}
              >
                Limpiar todos los filtros
              </button>
            </div>
          )}

          {!loading && movies.length > 0 && (
            <MovieGrid
              movies={movies}
              loading={loading}
              onFavoriteToggle={toggleFavorite}
              onMovieClick={handleMovieClick}
            />
          )}
        </main>
      </div>

      {showFilters && (
        <div
          className="movies-list__overlay"
          onClick={() => setShowFilters(false)}
        />
      )}
    </div>
  );
};