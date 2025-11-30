import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Play, Heart, Star, ArrowLeft, MessageSquare } from 'lucide-react';
import Button from '../components/Button';
import VideoPlayer from '../components/VideoPlayer';
import { mockMovies } from '../data/mockMovies';
import { favoritesAPI, ratingsAPI, apiUtils } from '@streamia/shared/services/api';
import '../styles/movie-detail.scss';

const MovieDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [rating, setRating] = useState<number>(0);
  const [showVideoPlayer, setShowVideoPlayer] = useState<boolean>(false);
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [isLoadingVideo, setIsLoadingVideo] = useState<boolean>(false);
  const [videoError, setVideoError] = useState<string | null>(null);
  const [favoritesIds, setFavoritesIds] = useState<Array<string | number>>([]);
  const [userRating, setUserRating] = useState<number>(0);
  const [ratingId, setRatingId] = useState<string | null>(null);
  const [selectedMovie, setSelectedMovie] = useState<any | null>(null);

  const movie = mockMovies.find(m => String(m.id) === id);

  // Ensure page starts at the top when entering this screen
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, []);

  useEffect(() => {
    if (!movie) {
      navigate('/');
    }
  }, [movie, navigate]);

  const handleRate = async (value: number) => {
    if (!movie) return;
    
    setRating(value);
    setUserRating(value);
    
    const token = apiUtils.getToken();
    if (!token) {
      alert('Inicia sesión para calificar esta película');
      return;
    }

    try {
      const payload = { movieId: String(movie.id), rating: value };
      const resp = await ratingsAPI.addRating(token, payload);
      
      if (resp.success) {
        console.log('Rating saved successfully');
        if (resp.data && resp.data.rating && resp.data.rating._id) {
          setRatingId(resp.data.rating._id);
        }
      } else {
        console.error('Failed to save rating:', resp.error);
        alert(resp.error || 'No se pudo guardar la calificación');
      }
    } catch (error) {
      console.error('Error saving rating:', error);
      alert('Error al guardar la calificación');
    }
  };

  const handleDeleteRating = async () => {
    if (!ratingId) {
      alert('No hay calificación para eliminar');
      return;
    }
    
    if (!movie) return;
    
    const token = apiUtils.getToken();
    if (!token) {
      alert('Inicia sesión para eliminar la calificación');
      return;
    }

    try {
      const resp = await ratingsAPI.deleteRating(token, ratingId);
      
      if (resp.success) {
        setRating(0);
        setUserRating(0);
        setRatingId(null);
        console.log('Rating deleted successfully');
      } else {
        console.error('Failed to delete rating:', resp.error);
        alert(resp.error || 'No se pudo eliminar la calificación');
      }
    } catch (error) {
      console.error('Error deleting rating:', error);
      alert('Error al eliminar la calificación');
    }
  };

  const handlePlayMovie = async () => {
    if (!movie) return;
    
    setIsLoadingVideo(true);
    setVideoError(null);

    try {
      // Backend may identify movies by different ids (numeric internal id, cloudinary public id, etc.)
      // Prefer explicit cloudinary/public id fields when available on the movie object.
      const apiUrl = (import.meta as any).env.VITE_API_URL || 'http://localhost:3000';
      const identifier = (movie as any).cloudinaryId || (movie as any).public_id || movie.id;
      const url = `${apiUrl}/api/movies/${identifier}`;

      const response = await fetch(url);
      if (!response.ok) throw new Error(`Response status: ${response.status}`);

      const result = await response.json();
      // Helpful debug log to inspect backend response shape when troubleshooting ids
      // eslint-disable-next-line no-console
      console.debug('getMovieById result', result);
      setSelectedMovie(result);

      
      const extractVideoUrl = (res: any): string | null => {
        if (res.secure_url && typeof res.secure_url === 'string') return res.secure_url;
        if (res.secureUrl && typeof res.secureUrl === 'string') return res.secureUrl;
        
        if (Array.isArray(res.resources) && res.resources.length > 0) {
          const r = res.resources[0];
          if (r.secure_url) return r.secure_url;
          if (r.url) return r.url;
        }

        if (Array.isArray(res.eager) && res.eager.length > 0) {
          const e = res.eager[0];
          if (e.secure_url) return e.secure_url;
          if (e.url) return e.url;
        }

        if (res.videoUrl && typeof res.videoUrl === 'string') return res.videoUrl;
        if (res.url && typeof res.url === 'string') return res.url;

        if (res.video_files && Array.isArray(res.video_files) && res.video_files.length > 0) {
          return res.video_files[0].link || res.video_files[0].file || null;
        }

        if (Array.isArray(res.videos) && res.videos.length > 0) {
          const first = res.videos[0];
          if (first.video_files && first.video_files.length > 0) return first.video_files[0].link || null;
          if (first.url) return first.url;
        }

        if (res.data) return extractVideoUrl(res.data);
        if (res.movie) return extractVideoUrl(res.movie);
        if (res.video) return extractVideoUrl(res.video);

        return null;
      };

      const foundUrl = extractVideoUrl(result);
      let foundSubtitles: any[] = [];
      if (result.subtitles && Array.isArray(result.subtitles)) {
        foundSubtitles = result.subtitles.map((s: any) => ({
          language: s.language || 'es',
          url: s.url || s.secure_url,
          label: s.label || 'Español'
        }));
      } else if (result.resources) {
        foundSubtitles = result.resources
          .filter((r: any) => r.format === 'vtt' || r.format === 'srt')
          .map((r: any) => ({
            language: r.public_id.includes('en') ? 'en' : 'es',
            url: r.secure_url,
            label: r.public_id.includes('en') ? 'English' : 'Español'
          }));
      }
      // If backend didn't provide subtitles, try to use the mockMovies entry's subtitles
      if ((!foundSubtitles || foundSubtitles.length === 0) && movie && movie.subtitles) {
        foundSubtitles = movie.subtitles.map((s: any) => ({
          language: s.language,
          url: s.url,
          label: s.label || (s.language === 'en' ? 'English' : 'Español')
        }));
      }

      setSelectedMovie({ ...result, subtitles: foundSubtitles });

      if (foundUrl) {
        setVideoUrl(foundUrl);
        setShowVideoPlayer(true);
      } else {
        setVideoError('No se encontró una URL de video válida para esta película.');
      }
    } catch (error) {
      console.error('Error loading video:', error);
      setVideoError('Error al cargar el video. Verifica tu conexión a internet.');
    } finally {
      setIsLoadingVideo(false);
    }
  };

  const handleCloseVideoPlayer = () => {
    setShowVideoPlayer(false);
    setVideoUrl('');
    setVideoError(null);
  };

  useEffect(() => {
    const modalOpen = showVideoPlayer || !!videoError;
    if (modalOpen) {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
      const previousOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = previousOverflow;
      };
    }
  }, [showVideoPlayer, videoError]);

  useEffect(() => {
    const loadUserFavorites = async () => {
      try {
        const token = apiUtils.getToken();
        if (!token) return;
        const resp = await favoritesAPI.getFavorites(token);
        if (resp.success && resp.data) {
          setFavoritesIds(resp.data.map((f: any) => f.movieId));
        }
      } catch (err) {
        console.error('Load favorites error', err);
      }
    };
    loadUserFavorites();
  }, []);


  useEffect(() => {
    const loadUserRating = async () => {
      if (!movie) return;
      
      const token = apiUtils.getToken();
      if (!token) return;

      try {
        const resp = await ratingsAPI.getUserRatings(token);
        if (resp.success && resp.data) {
          const movieRating = resp.data.find((r: any) => r.movieId === String(movie.id));
          if (movieRating) {
            setUserRating(movieRating.rating);
            setRating(movieRating.rating);
            setRatingId(movieRating._id);
          } else {
            setUserRating(0);
            setRating(0);
            setRatingId(null);
          }
        }
      } catch (err) {
        console.error('Load user rating error', err);
      }
    };
    loadUserRating();
  }, [movie]);

  const handleToggleFavorite = async () => {
    if (!movie) return;
    
    const token = apiUtils.getToken();
    if (!token) {
      alert('Inicia sesión para usar favoritos');
      return;
    }

    const movieId = String(movie.id);
    if (favoritesIds.includes(movieId)) {
      const resp = await favoritesAPI.removeFavorite(token, movieId);
      if (resp.success) {
        setFavoritesIds((prev) => prev.filter((id) => String(id) !== movieId));
      } else {
        alert(resp.error || 'No se pudo quitar de favoritos');
      }
    } else {
      const payload = { movieId, title: movie.title, poster: movie.imageUrl };
      const resp = await favoritesAPI.addFavorite(token, payload);
      if (resp.success) {
        setFavoritesIds((prev) => [...prev, movieId]);
      } else {
        alert(resp.error || 'No se pudo agregar a favoritos');
      }
    }
  };

  const isFavorite = favoritesIds.includes(String(movie?.id));

  if (!movie) {
    return (
      <div className="movie-detail">
        <div className="movie-detail__header">
          <Button 
            variant="outline" 
            size="small"
            onClick={() => navigate(-1)}
            className="movie-detail__back-btn"
          >
            <ArrowLeft size={16} />
            <span>Volver</span>
          </Button>
        </div>
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <h2>Película no encontrada</h2>
          <p>La película que buscas no existe.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="movie-detail">
      {showVideoPlayer && videoUrl && (
        <div className="movie-detail__video-modal-overlay">
          <VideoPlayer
            videoUrl={videoUrl}
            title={movie.title}
            onClose={handleCloseVideoPlayer}
            subtitles={selectedMovie?.subtitles || []}
            cloudinaryPublicId={selectedMovie?.public_id || selectedMovie?.publicId || movie.id}
            cloudinaryCloudName={(selectedMovie && selectedMovie.cloudName) || 'dwmt0zy4j'}
          />
        </div>
      )}

      <div className="movie-detail__header">
        <Button 
          variant="outline" 
          size="small"
          onClick={() => navigate(-1)}
          className="movie-detail__back-btn"
        >
          <ArrowLeft size={16} />
          <span>Volver</span>
        </Button>
      </div>

      <div className="movie-detail__hero">
        <div
          className="movie-detail__poster"
          aria-label={`Póster de ${movie.title}`}
          style={{ backgroundImage: `url(${movie.imageUrl})` }}
        />

        <div className="movie-detail__details">
          <h1 className="movie-detail__title">{movie.title}</h1>
          <p className="movie-detail__description">
            {movie.description}
          </p>

          <div className="movie-detail__actions">
            <Button 
              variant="primary" 
              size="medium" 
              className="movie-detail__action-btn"
              onClick={handlePlayMovie}
              disabled={isLoadingVideo}
            >
              <Play size={18} />
              <span>{isLoadingVideo ? 'Cargando...' : 'Ver ahora'}</span>
            </Button>

            <Button
              variant="secondary"
              size="medium"
              className={`movie-detail__action-btn ${isFavorite ? 'is-favorite' : ''}`}
              onClick={handleToggleFavorite}
            >
              {isFavorite ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M12 21s-7-4.35-9-6.5C-0.5 11.5 2.5 6 6.5 6c2 0 3.5 1.25 5.5 3.25C13 7.25 14.5 6 16.5 6 20.5 6 23.5 11.5 21 14.5 19 16.65 12 21 12 21z" fill="#ffffff"/>
                </svg>
              ) : (
                <Heart size={18} color="#9ca3af" />
              )}
              <span>{isFavorite ? 'Quitar de favoritos' : 'Marcar como favorita'}</span>
            </Button>
          </div>

          <div className="movie-detail__rating">
            <span className="movie-detail__rating-label">Califica esta película</span>
            <div className="movie-detail__stars">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  className={`movie-detail__star ${rating >= value ? 'is-active' : ''}`}
                  onClick={() => handleRate(value)}
                >
                  <Star size={22} />
                </button>
              ))}
            </div>
            <button 
              type="button" 
              className="movie-detail__clear-rating"
              onClick={handleDeleteRating}
              disabled={!ratingId || rating === 0}
            >
              Eliminar calificación
            </button>
          </div>

          <Button
            variant="secondary"
            size="medium"
            className="movie-detail__action-btn"
            onClick={() => navigate(`/movies/${id}/comments`)}
          >
            <MessageSquare size={18} />
            <span>Comentarios y Reseñas</span>
          </Button>
        </div>
      </div>

      {videoError && (
        <div className="movie-detail__error-modal">
          <div className="movie-detail__error-content">
            <h3>Error al cargar el video</h3>
            <p>{videoError}</p>
            <Button 
              variant="primary" 
              size="medium" 
              onClick={() => setVideoError(null)}
            >
              Cerrar
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MovieDetailPage;