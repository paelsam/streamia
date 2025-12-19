export interface Subtitle {
  lang: string;
  label: string;
  url: string;
}

export interface Movie {
  id: string;
  title: string;
  description: string;
  posterUrl: string;
  backdropUrl?: string;
  releaseDate: string;
  rating: number;
  duration: number; 
  category: string;
  genres: string[];
  isFavorite?: boolean;
  videoUrl?: string;
  subtitles?: Subtitle[];
}

export interface MovieFilters {
  category?: string;
  genre?: string;
  rating?: number;
  search?: string;
}

export interface MovieResponse {
  movies: Movie[];
  total: number;
  page: number;
  pageSize: number;
}

export interface FavoritePayload {
  movieId: string;
  userId?: string;
}