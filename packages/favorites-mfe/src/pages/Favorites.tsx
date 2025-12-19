import { useNavigate } from "react-router-dom";
import MovieCard  from "../components/MovieCard";
import { useFavorites } from "../hooks/useFavorites";
import "./Favorites.scss";

const Favorites = () => {
    const navigate = useNavigate();
    
    // ✨ Reemplaza todo el código de estado y lógica
    const { favorites: movies, loading, error, removeFavorite } = useFavorites();

    const handleRemoveFavorite = async (movieId: number | string) => {
        await removeFavorite(String(movieId));
    };

    const handleFavoriteToggle = (movieId: number | string) => {
        handleRemoveFavorite(movieId);
    };

    const handleMovieClick = (movieId: number | string) => {
        navigate(`/movie/${movieId}`);
    };

  return (
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
  );
}

export default Favorites;
