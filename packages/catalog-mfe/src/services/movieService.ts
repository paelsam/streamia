
import type { Movie, MovieFilters, MovieResponse } from '../types/movie.types';
import { mockMovies, searchMovies, filterByCategory, filterByGenre, filterByRating } from '../data/mockMovies';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_DATA === 'true' || false;

class MovieService {
  //Aplicar filtros
  private applyFilters(movies: Movie[], filters?: MovieFilters): Movie[] {
    let filtered = [...movies];

    // Aplicar búsqueda
    if (filters?.search) {
      filtered = searchMovies(filters.search, filtered);
    }

    // Aplicar filtro de categoría
    if (filters?.category) {
      filtered = filterByCategory(filters.category, filtered);
    }

    // Aplicar filtro de género
    if (filters?.genre) {
      filtered = filterByGenre(filters.genre, filtered);
    }

    // Aplicar filtro de calificación
    if (filters?.rating) {
      filtered = filterByRating(filters.rating, filtered);
    }

    return filtered;
  }

  /**
   * Obtener películas con filtros (intenta backend, fallback a mock)
   */
  async getMovies(filters?: MovieFilters): Promise<MovieResponse> {
    if (USE_MOCK_DATA) {
      const filtered = this.applyFilters(mockMovies, filters);
      return {
        movies: filtered,
        total: filtered.length,
        page: 1,
        pageSize: filtered.length,
      };
    }

    // Intentar obtener del backend
    try {
      const params = new URLSearchParams();
      
      if (filters?.category) params.append('category', filters.category);
      if (filters?.genre) params.append('genre', filters.genre);
      if (filters?.rating) params.append('rating', filters.rating.toString());
      if (filters?.search) params.append('search', filters.search);

      const response = await fetch(`${API_BASE_URL}/movies?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error('Error al obtener películas del backend');
      }

      return response.json();
    } catch (error) {
      console.warn('Backend no disponible, usando datos mock:', error);
      
      // Fallback a datos mock
      const filtered = this.applyFilters(mockMovies, filters);
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
    if (USE_MOCK_DATA) {
      const movie = mockMovies.find(m => m.id === id);
      if (!movie) {
        throw new Error(`Película con id ${id} no encontrada`);
      }
      return movie;
    }

    // Intentar obtener del backend
    try {
      const response = await fetch(`${API_BASE_URL}/movies/${id}`);
      
      if (!response.ok) {
        throw new Error('Error al obtener película del backend');
      }

      return response.json();
    } catch (error) {
      console.warn('Backend no disponible, usando datos mock:', error);
      
      // Fallback a datos mock
      const movie = mockMovies.find(m => m.id === id);
      if (!movie) {
        throw new Error(`Película con id ${id} no encontrada`);
      }
      return movie;
    }
  }

  /**
   * Obtener películas por categoría
   */
  async getMoviesByCategory(category: string): Promise<Movie[]> {
    const response = await this.getMovies({ category });
    return response.movies;
  }

  /**
   * Buscar películas
   */
  async searchMovies(query: string): Promise<Movie[]> {
    const response = await this.getMovies({ search: query });
    return response.movies;
  }
}

export const movieService = new MovieService();
export default movieService;