import { createLogger } from '@streamia/shared/utils';
import { API_URL } from '@streamia/shared/config';
import type { Movie, MovieFilters, MovieResponse } from '../types/movie.types';

const logger = createLogger('CatalogMFE:MovieService');

class MovieService {
  /**
   * Normalizar respuesta del backend a nuestro formato Movie[]
   */
  private normalizeMoviesResponse(data: any): Movie[] {
    // El backend puede devolver { movies: [...] } o directamente [...]
    let rawMovies: any[] = [];
    
    if (Array.isArray(data)) {
      rawMovies = data;
    } else if (data.movies && Array.isArray(data.movies)) {
      rawMovies = data.movies;
    } else if (data.data && Array.isArray(data.data)) {
      rawMovies = data.data;
    }

    return rawMovies.map(movie => this.normalizeMovie(movie));
  }

  /**
   * Normalizar un objeto película del backend al formato Movie
   * Backend Cloudinary format:
   * - _id, title, description, category, coverImage, videoUrl, duration, subtitles, createdAt
   */
  private normalizeMovie(movie: any): Movie {
    // Extraer año de createdAt para releaseDate
    const createdAt = movie.createdAt ? new Date(movie.createdAt) : null;
    const releaseDate = createdAt ? createdAt.toISOString().split('T')[0] : '';

    // La categoría del backend se usa también como género principal
    const category = movie.category || 'General';
    const genres = Array.isArray(movie.genres) && movie.genres.length > 0 
      ? movie.genres 
      : [category];

    return {
      id: movie._id || movie.id,
      title: movie.title || 'Sin título',
      description: movie.description || '',
      posterUrl: movie.coverImage || movie.posterUrl || movie.poster || movie.imageUrl || '',
      backdropUrl: movie.coverImage || movie.backdropUrl || movie.backdrop || '',
      releaseDate: movie.releaseDate || releaseDate,
      rating: typeof movie.rating === 'number' ? movie.rating : parseFloat(movie.rating) || 8.0, // Default rating
      duration: typeof movie.duration === 'number' ? movie.duration : parseInt(movie.duration) || 0,
      category: category,
      genres: genres,
      isFavorite: movie.isFavorite || false,
      videoUrl: movie.videoUrl || movie.url || undefined,
      subtitles: this.normalizeSubtitles(movie.subtitles),
    };
  }

  /**
   * Normalizar subtítulos del backend
   */
  private normalizeSubtitles(subtitles: any[]): { lang: string; label: string; url: string }[] | undefined {
    if (!Array.isArray(subtitles) || subtitles.length === 0) {
      return undefined;
    }

    return subtitles.map(sub => ({
      lang: sub.language || sub.lang || 'unknown',
      label: sub.label || sub.language || 'Unknown',
      url: sub.url || '',
    })).filter(sub => sub.url);
  }

  /**
   * Obtener películas con filtros
   * GET /api/movies o GET /api/movies/explore
   */
  async getMovies(filters?: MovieFilters): Promise<MovieResponse> {
    logger.info('Fetching movies from backend', { filters });

    try {
      const params = new URLSearchParams();
      
      if (filters?.category) params.append('category', filters.category);
      if (filters?.genre) params.append('genre', filters.genre);
      if (filters?.rating) params.append('rating', filters.rating.toString());
      if (filters?.search) params.append('search', filters.search);

      // Usar /explore si hay filtros, sino /movies
      const hasFilters = filters && Object.values(filters).some(v => v !== undefined);
      const endpoint = hasFilters ? '/movies/explore' : '/movies';
      const queryString = params.toString();
      const url = `${API_URL}${endpoint}${queryString ? `?${queryString}` : ''}`;
      
      logger.debug('Fetching from backend', { url });

      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Normalizar respuesta del backend
      const movies = this.normalizeMoviesResponse(data);
      
      logger.info('Movies fetched successfully from backend', { 
        count: movies.length 
      });

      return {
        movies,
        total: movies.length,
        page: 1,
        pageSize: movies.length,
      };
    } catch (error) {
      logger.error('Error fetching movies from backend', { error });
      throw error;
    }
  }

  /**
   * Obtener película por ID
   * GET /api/movies/:id
   */
  async getMovieById(id: string): Promise<Movie> {
    logger.info('Fetching movie by ID from backend', { id });

    try {
      const url = `${API_URL}/movies/${id}`;
      logger.debug('Fetching movie from backend', { url });

      const response = await fetch(url);
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(`Película con id ${id} no encontrada`);
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      const movie = this.normalizeMovie(data.movie || data);
      
      logger.info('Movie fetched successfully from backend', { 
        id, 
        title: movie.title 
      });

      return movie;
    } catch (error) {
      logger.error('Error fetching movie by ID', { error, id });
      throw error;
    }
  }

  /**
   * Obtener películas por categoría
   */
  async getMoviesByCategory(category: string): Promise<Movie[]> {
    logger.info('Fetching movies by category', { category });
    
    const response = await this.getMovies({ category });
    
    logger.info('Movies by category fetched', { 
      category, 
      count: response.movies.length 
    });
    
    return response.movies;
  }

  /**
   * Buscar películas
   */
  async searchMovies(query: string): Promise<Movie[]> {
    logger.info('Searching movies', { query });
    
    const response = await this.getMovies({ search: query });
    
    logger.info('Search completed', { 
      query, 
      results: response.movies.length 
    });
    
    return response.movies;
  }

  /**
   * Obtener géneros disponibles desde el backend
   */
  async getAvailableGenres(): Promise<string[]> {
    try {
      const response = await this.getMovies();
      const genres = new Set<string>();
      
      response.movies.forEach(movie => {
        movie.genres.forEach(genre => genres.add(genre));
      });
      
      const genresList = Array.from(genres).sort();
      
      logger.debug('Available genres retrieved', { 
        count: genresList.length,
        genres: genresList 
      });
      
      return genresList;
    } catch (error) {
      logger.error('Error getting available genres', { error });
      return [];
    }
  }

  /**
   * Obtener categorías disponibles desde el backend
   */
  async getAvailableCategories(): Promise<string[]> {
    try {
      const response = await this.getMovies();
      const categories = new Set<string>();
      
      response.movies.forEach(movie => {
        if (movie.category) {
          categories.add(movie.category);
        }
      });
      
      const categoriesList = Array.from(categories).sort();
      
      logger.debug('Available categories retrieved', { 
        count: categoriesList.length,
        categories: categoriesList 
      });
      
      return categoriesList;
    } catch (error) {
      logger.error('Error getting available categories', { error });
      return [];
    }
  }
}

export const movieService = new MovieService();
export default movieService;