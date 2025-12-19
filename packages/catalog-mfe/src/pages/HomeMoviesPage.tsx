import React, { useState, useEffect } from 'react';
import { Play, Heart, Info, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { movieService } from '../services/movieService';
import { favoritesService } from '../services/favoritesService';
import { eventBus, EVENTS } from '@streamia/shared/events';
import { createLogger, TokenManager } from '@streamia/shared/utils';
import { MovieCard } from '../components/MovieCard';
import { MovieDetailModal } from '../components/MovieDetailModal';
import type { Movie } from '../types/movie.types';
import '../styles/HomeMoviesPage.scss';

const logger = createLogger('CatalogMFE:HomeMoviesPage');

export const HomeMoviesPage: React.FC = () => {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [featuredMovies, setFeaturedMovies] = useState<Movie[]>([]);
  const [trendingMovies, setTrendingMovies] = useState<Movie[]>([]);
  const [popularMovies, setPopularMovies] = useState<Movie[]>([]);
  const [newReleases, setNewReleases] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [favoritesIds, setFavoritesIds] = useState<Set<string>>(new Set());
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fallback featured movies
  const fallbackFeaturedMovies: Movie[] = [
    {
      id: "68fe440f0f375de5da710444",
      title: "John Wick 4",
      description: "John Wick descubre un camino para derrotar a la Alta Mesa. Pero para ganar su libertad, debe enfrentarse a un nuevo enemigo con poderosas alianzas.",
      posterUrl: "https://image.tmdb.org/t/p/w500/vZloFAK7NmvMGKE7VkF5UHaz0I.jpg",
      backdropUrl: "https://image.tmdb.org/t/p/original/vZloFAK7NmvMGKE7VkF5UHaz0I.jpg",
      releaseDate: "2023-03-24",
      rating: 8.5,
      duration: 169,
      category: "featured",
      genres: ["Acción", "Thriller"],
    },
    {
      id: "68fe776a1f47ab544c72e3dd",
      title: "Weapons",
      description: "Todos los niños de la clase, excepto uno, desaparecen misteriosamente en la misma noche y exactamente a la misma hora.",
      posterUrl: "/images/weapons.jpg",
      backdropUrl: "https://i.ibb.co/tM2fRWGQ/imagen-2025-10-25-173329618.png",
      releaseDate: "2024-01-15",
      rating: 7.8,
      duration: 105,
      category: "featured",
      genres: ["Misterio", "Thriller"],
    },
    {
      id: "68fe51230f375de5da710446",
      title: "Wicked",
      description: "La historia nunca antes contada de las Brujas de Oz, siguiendo a Elphaba y Glinda en su extraordinario viaje de amistad y destino.",
      posterUrl: "https://i.ibb.co/BVsCYh27/imagen-2025-10-25-174605393.png",
      backdropUrl: "https://i.ibb.co/rR2T9khs/wp14661325-wicked-film-wallpapers.jpg",
      releaseDate: "2024-11-27",
      rating: 8.2,
      duration: 160,
      category: "featured",
      genres: ["Musical", "Fantasía"],
    },
    {
      id: "68fe73ef1f47ab544c72e3d8",
      title: "Demon Slayer",
      description: "Tanjiro y sus amigos se preparan para el entrenamiento de los Pilares mientras continúan su batalla contra los demonios.",
      posterUrl: "/images/demonslayer.jpg",
      backdropUrl: "https://i.ibb.co/RTY4pwnq/imagen-2025-10-25-161041429.png",
      releaseDate: "2024-02-02",
      rating: 8.9,
      duration: 117,
      category: "featured",
      genres: ["Anime", "Acción"],
    }
  ];

  useEffect(() => {
    logger.info('HomeMoviesPage mounted', { 
      hasValidToken: TokenManager.isCurrentTokenValid() 
    });

    loadMovies();
    loadFavorites();

    const unsubscribeAuth = eventBus.subscribe(
      EVENTS.USER_LOGIN, 
      handleUserAuthenticated
    );
    
    const unsubscribeFavRemoved = eventBus.subscribe(
      EVENTS.FAVORITE_REMOVED, 
      handleFavoriteRemoved
    );

    const unsubscribeFavAdded = eventBus.subscribe(
      EVENTS.FAVORITE_ADDED,
      handleFavoriteAdded
    );

    logger.debug('Event listeners configured via EventBus');

    return () => {
      logger.debug('Cleaning up event listeners');
      unsubscribeAuth();
      unsubscribeFavRemoved();
      unsubscribeFavAdded();
    };
  }, []);

  useEffect(() => {
    if (featuredMovies.length === 0) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % featuredMovies.length);
    }, 8000);

    logger.debug('Carousel auto-play started', { 
      interval: 8000, 
      moviesCount: featuredMovies.length 
    });

    return () => {
      clearInterval(interval);
      logger.debug('Carousel auto-play stopped');
    };
  }, [featuredMovies.length]);

  const handleUserAuthenticated = (data: { userId: string; user: any }) => {
    const { userId } = data;
    logger.info('User authenticated event received', { 
      userId,
      tokenValid: TokenManager.isCurrentTokenValid()
    });
    loadFavorites();
  };

  const handleFavoriteRemoved = (data: { movieId: string }) => {
    const { movieId } = data;
    logger.debug('Favorite removed event received', { movieId });
    
    setFavoritesIds(prev => {
      const next = new Set(prev);
      next.delete(movieId);
      return next;
    });
  };

  const handleFavoriteAdded = (data: { movieId: string }) => {
    const { movieId } = data;
    logger.debug('Favorite added event received', { movieId });
    
    setFavoritesIds(prev => new Set(prev).add(movieId));
  };

  const loadMovies = async () => {
    try {
      setLoading(true);
      logger.info('Loading home movies');

      const [featured, trending, popular, releases] = await Promise.all([
        movieService.getMoviesByCategory('featured').catch((err) => {
          logger.warn('Failed to load featured movies, using fallback', err);
          return fallbackFeaturedMovies;
        }),
        movieService.getMoviesByCategory('trending'),
        movieService.getMovies({ rating: 7 }).then(res => res.movies.slice(0, 8)),
        movieService.getMoviesByCategory('new-releases').then(movies => movies.slice(4, 12)),
      ]);

      setFeaturedMovies(featured.length > 0 ? featured : fallbackFeaturedMovies);
      setTrendingMovies(trending);
      setPopularMovies(popular);
      setNewReleases(releases);
      
      logger.info('Movies loaded successfully', {
        featured: featured.length,
        trending: trending.length,
        popular: popular.length,
        releases: releases.length,
      });
    } catch (error) {
      logger.error('Error loading movies', error);
      setFeaturedMovies(fallbackFeaturedMovies);
    } finally {
      setLoading(false);
    }
  };

  const loadFavorites = async () => {
    const isAuthenticated = TokenManager.isCurrentTokenValid();
    
    logger.info('Loading favorites', { 
      authenticated: isAuthenticated 
    });

    // Solo cargar favoritos si el usuario está autenticado
    if (!isAuthenticated) {
      logger.debug('User not authenticated, clearing favorites');
      setFavoritesIds(new Set());
      return;
    }

    try {
      const favIds = await favoritesService.getFavorites();
      
      logger.info('Favorites loaded successfully', { 
        count: favIds.length,
        ids: favIds 
      });
      
      setFavoritesIds(new Set(favIds));
    } catch (error) {
      logger.error('Error loading favorites', error);
      setFavoritesIds(new Set());
    }
  };

  const handleToggleFavorite = async (movieId: string) => {
    const wasFavorite = favoritesIds.has(movieId);

    //  VERIFICACIÓN DE AUTENTICACIÓN COMENTADA PARA PRUEBAS 
    // if (!TokenManager.isCurrentTokenValid()) {
    //   logger.warn('Attempted to toggle favorite without valid token', { movieId });
    //   alert('Por favor, inicia sesión para gestionar favoritos.');
    //   return;
    // }

    try {
      logger.debug('Toggling favorite', { movieId, wasFavorite });

      // Optimistic update - siempre se ejecuta para pruebas
      setFavoritesIds(prev => {
        const next = new Set(prev);
        wasFavorite ? next.delete(movieId) : next.add(movieId);
        return next;
      });

      // Intentar toggle - el servicio maneja la autenticación
      await favoritesService.toggleFavorite(movieId);
      
      logger.info('Favorite toggled successfully', { 
        movieId, 
        newState: !wasFavorite 
      });
    } catch (error) {
      setFavoritesIds(prev => {
        const next = new Set(prev);
        wasFavorite ? next.add(movieId) : next.delete(movieId);
        return next;
      });

      logger.error('Error toggling favorite', { error, movieId });
      
      const errorMessage = error instanceof Error ? error.message : '';
      
      if (errorMessage.includes('iniciar sesión') || errorMessage.includes('autenticado')) {
        alert('Por favor, inicia sesión para gestionar favoritos.');
      } else if (errorMessage) {
        alert(`Error al actualizar favoritos: ${errorMessage}`);
      }
    }
  };

  const handleMovieClick = (movie: Movie) => {
    logger.info('Movie selected, opening modal', { movieId: movie.id });
    
    eventBus.publish(EVENTS.MOVIE_SELECTED, { movieId: movie.id });
    
    setSelectedMovie(movie);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedMovie(null);
  };

  const handlePlayMovie = (movie: Movie) => {
    logger.info('Play movie clicked', { 
      movieId: movie.id, 
      title: movie.title 
    });
    
    eventBus.publish(EVENTS.MOVIE_PLAY, {
      movieId: movie.id,
      movie,
    });
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % featuredMovies.length);
    logger.debug('Carousel next slide', { currentSlide: currentSlide + 1 });
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + featuredMovies.length) % featuredMovies.length);
    logger.debug('Carousel previous slide', { currentSlide: currentSlide - 1 });
  };

  if (loading) {
    return (
      <div className="homepage__loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="homepage">
      {/* Hero Carousel */}
      <section className="homepage__hero">
        <div className="homepage__carousel">
          {featuredMovies.map((movie, index) => (
            <div
              key={movie.id}
              className={`homepage__carousel-slide ${index === currentSlide ? 'active' : ''}`}
              style={{
                backgroundImage: `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.7)), url(${movie.backdropUrl || movie.posterUrl})`
              }}
            >
              <div className="homepage__carousel-content">
                <h1 className="homepage__carousel-title">
                  {movie.title}
                  <span className="homepage__carousel-year">
                    {' '}({(movie as any).year || new Date(movie.releaseDate).getFullYear()})
                  </span>
                </h1>
                <p className="homepage__carousel-description">{movie.description}</p>
                <div className="homepage__carousel-buttons">
                  <button 
                    className="btn btn--primary btn--large"
                    onClick={() => handlePlayMovie(movie)}
                    aria-label={`Reproducir ${movie.title}`}
                  >
                    <Play size={24} fill="currentColor" />
                    Reproducir
                  </button>
                  <button 
                    className="btn btn--secondary btn--large"
                    onClick={() => handleMovieClick(movie)}
                    aria-label={`Más información sobre ${movie.title}`}
                  >
                    <Info size={24} />
                    Más Info
                  </button>
                  <button
                    className="homepage__favorite-btn"
                    onClick={() => handleToggleFavorite(movie.id)}
                    title={favoritesIds.has(movie.id) ? 'Quitar de favoritos' : 'Añadir a favoritos'}
                    aria-label={favoritesIds.has(movie.id) ? 'Quitar de favoritos' : 'Añadir a favoritos'}
                  >
                    <Heart
                      size={24}
                      fill={favoritesIds.has(movie.id) ? 'currentColor' : 'none'}
                    />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <button 
          className="homepage__carousel-btn homepage__carousel-btn--prev" 
          onClick={prevSlide}
          aria-label="Película anterior"
        >
          <ChevronLeft size={32} />
        </button>
        <button 
          className="homepage__carousel-btn homepage__carousel-btn--next" 
          onClick={nextSlide}
          aria-label="Siguiente película"
        >
          <ChevronRight size={32} />
        </button>

        <div className="homepage__carousel-indicators">
          {featuredMovies.map((_, idx) => (
            <button
              key={idx}
              className={`homepage__carousel-indicator ${idx === currentSlide ? 'active' : ''}`}
              onClick={() => setCurrentSlide(idx)}
              aria-label={`Ir a película ${idx + 1}`}
            />
          ))}
        </div>
      </section>

      <section className="homepage__section">
        <h2 className="homepage__section-title">Películas Populares</h2>
        <div className="homepage__movies-grid">
          {popularMovies.map((movie) => (
            <MovieCard
              key={movie.id}
              movie={movie}
              isFavorite={favoritesIds.has(movie.id)}
              onFavoriteToggle={handleToggleFavorite}
              onClick={() => handleMovieClick(movie)}
            />
          ))}
        </div>
      </section>

      <section className="homepage__section">
        <h2 className="homepage__section-title">Tendencias</h2>
        <div className="homepage__movies-grid">
          {trendingMovies.map((movie) => (
            <MovieCard
              key={movie.id}
              movie={movie}
              isFavorite={favoritesIds.has(movie.id)}
              onFavoriteToggle={handleToggleFavorite}
              onClick={() => handleMovieClick(movie)}
            />
          ))}
        </div>
      </section>

      {/* Modal de detalle de película */}
      <MovieDetailModal
        movie={selectedMovie}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        isFavorite={selectedMovie ? favoritesIds.has(selectedMovie.id) : false}
        onFavoriteToggle={handleToggleFavorite}
      />
    </div>
  );
};