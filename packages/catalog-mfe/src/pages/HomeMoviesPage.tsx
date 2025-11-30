import React, { useState, useEffect } from 'react';
import { Play, Heart, Info, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { movieService } from '../services/movieService';
import { favoritesService } from '../services/favoritesService';
import { eventBus, EVENTS } from '@streamia/shared/events';
import { createLogger } from '@streamia/shared/utils';
import { MovieCard } from '../components/MovieCard';
import type { Movie } from '../types/movie.types';
import '../styles/HomeMoviesPage.scss';

const logger = createLogger('HomeMoviesPage');
export const HomeMoviesPage: React.FC = () => {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [featuredMovies, setFeaturedMovies] = useState<Movie[]>([]);
  const [trendingMovies, setTrendingMovies] = useState<Movie[]>([]);
  const [popularMovies, setPopularMovies] = useState<Movie[]>([]);
  const [newReleases, setNewReleases] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [favoritesIds, setFavoritesIds] = useState<Set<string>>(new Set());
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Fallback featured movies
  const fallbackFeaturedMovies = [
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
      year: 2023
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
      year: 2024
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
      year: 2024
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
      year: 2024
    }
  ];

  useEffect(() => {
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

    logger.info('Event listeners configured via EventBus');

    return () => {
      unsubscribeAuth();
      unsubscribeFavRemoved();
    };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % featuredMovies.length);
    }, 8000);

    return () => clearInterval(interval);
  }, [featuredMovies.length]);

  const handleUserAuthenticated = (data: { userId: string; user: any }) => {
    const { userId, user } = data;
    logger.info('User authenticated event received', { userId });
    setIsAuthenticated(true);
    loadFavorites();
  };

  const handleFavoriteRemoved = (data: { movieId: string }) => {
    const { movieId } = data;
    logger.info('Favorite removed event received', { movieId });
    
    setFavoritesIds(prev => {
      const next = new Set(prev);
      next.delete(movieId);
      return next;
    });
  };

  const loadMovies = async () => {
    try {
      setLoading(true);
      logger.info('Loading home movies');

      const [featured, trending, popular, releases] = await Promise.all([
        movieService.getMoviesByCategory('featured').catch(() => fallbackFeaturedMovies),
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
    try {
      const favIds = await favoritesService.getFavorites();
      setFavoritesIds(new Set(favIds));
      logger.info('Favorites loaded', { count: favIds.length });
    } catch (error) {
      logger.error('Error loading favorites', error);
      setFavoritesIds(new Set());
    }
  };

  const handleToggleFavorite = async (movieId: string) => {
    const isFavorite = favoritesIds.has(movieId);

    try {
      setFavoritesIds(prev => {
        const next = new Set(prev);
        if (isFavorite) {
          next.delete(movieId);
        } else {
          next.add(movieId);
        }
        return next;
      });

      if (isFavorite) {
        await favoritesService.removeFavorite(movieId);
        logger.info('Favorite removed', { movieId });
      } else {
        await favoritesService.addFavorite({ movieId });
        logger.info('Favorite added', { movieId });
      }
    } catch (error) {
      setFavoritesIds(prev => {
        const next = new Set(prev);
        if (isFavorite) {
          next.add(movieId); 
        } else {
          next.delete(movieId); 
        }
        return next;
      });

      logger.error('Error toggling favorite', error);
      
      const errorMessage = error instanceof Error ? error.message : '';
      
      if (errorMessage.includes('autenticado') || errorMessage.includes('401')) {
        alert('Por favor, inicia sesión para gestionar favoritos.');
      } else {
        alert('Error al actualizar favoritos. Intenta nuevamente.');
      }
    }
  };

  const handleMovieClick = (movieId: string) => {
    logger.info('Movie selected', { movieId });
    
    eventBus.publish(EVENTS.MOVIE_SELECTED, { movieId });
    
    navigate(`/movie/${movieId}`);
  };

  const handlePlayMovie = (movie: any) => {
    logger.info('Play movie clicked', { movieId: movie.id });
    
    eventBus.publish(EVENTS.MOVIE_PLAY, {
      movieId: movie.id,
      movie,
    });
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % featuredMovies.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + featuredMovies.length) % featuredMovies.length);
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
                  <span className="homepage__carousel-year"> ({(movie as any).year || new Date(movie.releaseDate).getFullYear()})</span>
                </h1>
                <p className="homepage__carousel-description">{movie.description}</p>
                <div className="homepage__carousel-buttons">
                  <button 
                    className="btn btn--primary btn--large"
                    onClick={() => handlePlayMovie(movie)}
                  >
                    <Play size={24} fill="currentColor" />
                    Reproducir
                  </button>
                  <button 
                    className="btn btn--secondary btn--large"
                    onClick={() => handleMovieClick(movie.id)}
                  >
                    <Info size={24} />
                    Más Info
                  </button>
                  <button
                    className="homepage__favorite-btn"
                    onClick={() => handleToggleFavorite(movie.id)}
                    title={favoritesIds.has(movie.id) ? 'Quitar de favoritos' : 'Añadir a favoritos'}
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

        <button className="homepage__carousel-btn homepage__carousel-btn--prev" onClick={prevSlide}>
          <ChevronLeft size={32} />
        </button>
        <button className="homepage__carousel-btn homepage__carousel-btn--next" onClick={nextSlide}>
          <ChevronRight size={32} />
        </button>

        <div className="homepage__carousel-indicators">
          {featuredMovies.map((_, idx) => (
            <button
              key={idx}
              className={`homepage__carousel-indicator ${idx === currentSlide ? 'active' : ''}`}
              onClick={() => setCurrentSlide(idx)}
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
              onClick={() => handleMovieClick(movie.id)}
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
              onClick={() => handleMovieClick(movie.id)}
            />
          ))}
        </div>
      </section>
    </div>
  );
};