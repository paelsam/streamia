import { createLogger } from '@streamia/shared/utils';
import type { Movie, MovieFilters, MovieResponse } from '../types/movie.types';
import { mockMovies, searchMovies, filterByCategory, filterByGenre, filterByRating } from '../data/mockMovies';

const logger = createLogger('CatalogMFE:MovieService');
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_DATA === 'true' || false;

class MovieService {
  /**
   * Aplicar filtros a una lista de películas
   */
  private applyFilters(movies: Movie[], filters?: MovieFilters): Movie[] {
    let filtered = [...movies];

    logger.debug('Applying filters', { 
      initialCount: movies.length, 
      filters 
    });

    // Aplicar búsqueda
    if (filters?.search) {
      filtered = searchMovies(filters.search, filtered);
      logger.debug('Search filter applied', { 
        query: filters.search, 
        results: filtered.length 
      });
    }

    // Aplicar filtro de categoría
    if (filters?.category) {
      filtered = filterByCategory(filters.category, filtered);
      logger.debug('Category filter applied', { 
        category: filters.category, 
        results: filtered.length 
      });
    }

    // Aplicar filtro de género
    if (filters?.genre) {
      filtered = filterByGenre(filters.genre, filtered);
      logger.debug('Genre filter applied', { 
        genre: filters.genre, 
        results: filtered.length 
      });
    }

    // Aplicar filtro de calificación
    if (filters?.rating) {
      filtered = filterByRating(filters.rating, filtered);
      logger.debug('Rating filter applied', { 
        rating: filters.rating, 
        results: filtered.length 
      });
    }

    logger.info('Filters applied successfully', { 
      finalCount: filtered.length 
    });

    return filtered;
  }

  /**
   * Obtener películas con filtros
   */
  async getMovies(filters?: MovieFilters): Promise<MovieResponse> {
    logger.info('Fetching movies', { filters, mode: USE_MOCK_DATA ? 'mock' : 'backend' });

    // Modo Mock
    if (USE_MOCK_DATA) {
      const filtered = this.applyFilters(mockMovies, filters);
      logger.info('Movies fetched successfully (mock)', { 
        count: filtered.length 
      });
      
      return {
        movies: filtered,
        total: filtered.length,
        page: 1,
        pageSize: filtered.length,
      };
    }

    // Modo Backend con fallback a mock
    try {
      const params = new URLSearchParams();
      
      if (filters?.category) params.append('category', filters.category);
      if (filters?.genre) params.append('genre', filters.genre);
      if (filters?.rating) params.append('rating', filters.rating.toString());
      if (filters?.search) params.append('search', filters.search);

      const url = `${API_BASE_URL}/movies?${params.toString()}`;
      logger.debug('Fetching from backend', { url });

      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      logger.info('Movies fetched successfully from backend', { 
        count: data.movies?.length || 0 
      });

      return data;
    } catch (error) {
      logger.warn('Backend unavailable, falling back to mock data', { error });
      
      // Fallback a datos mock
      const filtered = this.applyFilters(mockMovies, filters);
      
      logger.info('Movies fetched from mock fallback', { 
        count: filtered.length 
      });

      return {
        movies: filtered,
        total: filtered.length,
        page: 1,
        pageSize: filtered.length,
      };
    }
  }

  /**
   * Obtener película por ID
   */
  async getMovieById(id: string): Promise<Movie> {
    logger.info('Fetching movie by ID', { id, mode: USE_MOCK_DATA ? 'mock' : 'backend' });

    // Modo Mock
    if (USE_MOCK_DATA) {
      const movie = mockMovies.find(m => m.id === id);
      
      if (!movie) {
        logger.error('Movie not found in mock data', { id });
        throw new Error(`Película con id ${id} no encontrada`);
      }

      logger.info('Movie found in mock data', { id, title: movie.title });
      return movie;
    }

    // Modo Backend con fallback a mock
    try {
      const url = `${API_BASE_URL}/movies/${id}`;
      logger.debug('Fetching movie from backend', { url });

      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const movie = await response.json();
      
      logger.info('Movie fetched successfully from backend', { 
        id, 
        title: movie.title 
      });

      return movie;
    } catch (error) {
      logger.warn('Backend unavailable, falling back to mock data', { error, id });
      
      // Fallback a datos mock
      const movie = mockMovies.find(m => m.id === id);
      
      if (!movie) {
        logger.error('Movie not found in mock fallback', { id });
        throw new Error(`Película con id ${id} no encontrada`);
      }

      logger.info('Movie found in mock fallback', { id, title: movie.title });
      return movie;
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

  async searchMovies(query: string): Promise<Movie[]> {
    logger.info('Searching movies', { query });
    
    const response = await this.getMovies({ search: query });
    
    logger.info('Search completed', { 
      query, 
      results: response.movies.length 
    });
    
    return response.movies;
  }

  getAvailableGenres(): string[] {
    const genres = new Set<string>();
    mockMovies.forEach(movie => {
      movie.genres.forEach(genre => genres.add(genre));
    });
    
    const genresList = Array.from(genres).sort();
    
    logger.debug('Available genres retrieved', { 
      count: genresList.length,
      genres: genresList 
    });
    
    return genresList;
  }

  getAvailableCategories(): string[] {
    const categories = new Set<string>();
    mockMovies.forEach(movie => {
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
  }
}

export const movieService = new MovieService();
export default movieService;