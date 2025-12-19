/**
 * @file favorites.types.ts
 * @description TypeScript types for Favorites MFE
 * Aligned with backend favoritesController.ts
 */

/**
 * Favorite item from backend (GET /api/favorites response)
 */
export interface FavoriteItem {
  movieId: string;
  note?: string;
  title: string;
  poster: string;
  videoUrl: string;
  // Additional Cloudinary data
  duration?: number;
  hasAudio?: boolean;
  category?: string;
}

/**
 * Payload to add a favorite (POST /api/favorites)
 */
export interface AddFavoritePayload {
  movieId: string;
  title: string;
  poster: string;
  note?: string;
}

/**
 * Payload to update a favorite note (PUT /api/favorites/:id)
 */
export interface UpdateFavoriteNotePayload {
  note: string;
}

/**
 * Response from backend when adding a favorite
 */
export interface AddFavoriteResponse {
  _id: string;
  userId: string;
  movieId: string;
  title: string;
  poster: string;
  note: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Response from backend when updating a favorite
 */
export interface UpdateFavoriteResponse {
  message: string;
  favorite: AddFavoriteResponse;
}

/**
 * Response from backend when removing a favorite
 */
export interface RemoveFavoriteResponse {
  message: string;
  removedMovie: {
    movieId: string;
    title: string;
  };
}

/**
 * Frontend movie representation for UI
 */
export interface Movie {
  id: string;
  title: string;
  imageUrl: string;
  videoUrl?: string;
  duration?: number;
  hasAudio?: boolean;
  category?: string;
  note?: string;
}
