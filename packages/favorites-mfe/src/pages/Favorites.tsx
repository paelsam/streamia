import { Layout } from "../../../shell/src/components/Layout";
import React from "react";
import { useNavigate } from "react-router-dom";
import MovieCard  from "../components/MovieCard";
import { favoritesAPI } from "../services/favoritesService";
import { TokenManager, eventBus, EVENTS, createLogger } from "@streamia/shared";
import "./Favorites.scss";

const logger = createLogger('Favorites-Page');

const Favorites = () => {
    const [movies, setMovies] = React.useState<Array<{ id: string; title: string; imageUrl: string }>>([]);
    const [error, setError] = React.useState<string | null>(null);
    const [loading, setLoading] = React.useState(false);
    const navigate = useNavigate();

    React.useEffect(() => {
        loadFavorites();

        // Subscribe to favorite events from other microfrontends
        const unsubscribeAdded = eventBus.subscribe(EVENTS.FAVORITE_ADDED, (data) => {
            logger.info('Favorite added event received from another MFE', data);
            // Reload favorites to show the new one
            loadFavorites();
        });

        // Cleanup subscriptions on unmount
        return () => {
            unsubscribeAdded();
        };
    }, []);

    const loadFavorites = async () => {
        const token = TokenManager.getToken();
        
        if (!token) {
            logger.warn('No token found, redirecting to login');
            setError('Debes iniciar sesión para ver tus favoritos');
            navigate('/login');
            return;
        }

        try {
            setLoading(true);
            setError(null);
            logger.info('Loading favorites');
            
            const response = await favoritesAPI.getFavorites(token);
            
            if (response.success && response.data) {
                setMovies(response.data.map((fav: any) => ({
                    id: fav.movieId || fav.id,
                    title: fav.title,
                    imageUrl: fav.poster || fav.imageUrl
                })));
            } else {
                setError(response.error || 'Error al cargar favoritos');
                logger.error('Failed to load favorites', { error: response.error });
            }
        } catch (err) {
            const errorMsg = 'Error al cargar las películas favoritas';
            setError(errorMsg);
            logger.error('Exception loading favorites', err);
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveFavorite = async (movieId: number | string) => {
        const token = TokenManager.getToken();
        
        if (!token) {
            logger.warn('No token found');
            return;
        }

        try {
            logger.info('Removing favorite', { movieId });
            
            const response = await favoritesAPI.removeFavorite(token, String(movieId));
            
            if (response.success) {
                // Update local state optimistically
                setMovies(prev => prev.filter(m => m.id !== String(movieId)));
                logger.info('Favorite removed successfully', { movieId });
            } else {
                setError(response.error || 'Error al eliminar favorito');
                logger.error('Failed to remove favorite', { movieId, error: response.error });
            }
        } catch (err) {
            setError('Error al eliminar la película de favoritos');
            logger.error('Exception removing favorite', err);
        }
    };

    const handleFavoriteToggle = (movieId: number | string) => {
        handleRemoveFavorite(movieId);
    };

    const handleMovieClick = (movieId: number | string) => {
        navigate(`/movie/${movieId}`);
    };

  return (
    <Layout>
      <div className="favorites page">
      <div className="favorites__header">
        <h1 className="favorites__title">Mis Favoritos</h1>
        <p className="favorites__count">{movies.length} película{movies.length !== 1 ? 's' : ''}</p>
      </div>

      <div className="favorites__content">
        {loading && (
          <div className="favorites__loading">
            <p>Cargando favoritos...</p>
          </div>
        )}

        {error && <div className="favorites__error" role="alert">{error}</div>}
        
        {!loading && !error && movies.length > 0 && (
          <div className="favorites__row" aria-label="Películas favoritas">
            {movies.map((m) => (
              <div className="favorites__card" key={m.id}>
                <MovieCard 
                  id={m.id} 
                  title={m.title} 
                  imageUrl={m.imageUrl} 
                  isFavorite 
                  onClick={() => handleMovieClick(m.id)}
                  onFavorite={handleFavoriteToggle}
                />
              </div>
            ))}
          </div>
        )}

        {!loading && !error && movies.length === 0 && (
          <div className="favorites__empty">
            <div className="favorites__empty-icon">❤️</div>
            <h3>No tienes películas favoritas</h3>
            <p>Agrega películas a favoritos para verlas aquí</p>
          </div>
        )}
      </div>
    </div>
    </Layout>
  );
}

export default Favorites;
