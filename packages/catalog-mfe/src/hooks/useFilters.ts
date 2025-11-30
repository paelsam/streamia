import { useState, useCallback } from 'react';
import { createLogger } from '@streamia/shared/utils';
import type { MovieFilters } from '../types/movie.types';

const logger = createLogger('useFilters');

export const useFilters = (initialFilters?: MovieFilters) => {
  const [filters, setFilters] = useState<MovieFilters>(initialFilters || {});

  const updateFilter = useCallback((key: keyof MovieFilters, value: any) => {
    setFilters(prev => {
      const updated = {
        ...prev,
        [key]: value,
      };
      logger.debug('Filter updated', { key, value, allFilters: updated });
      return updated;
    });
  }, []);

  const setCategory = useCallback((category: string | undefined) => {
    logger.info('Category filter changed', { category });
    updateFilter('category', category);
  }, [updateFilter]);

  const setGenre = useCallback((genre: string | undefined) => {
    logger.info('Genre filter changed', { genre });
    updateFilter('genre', genre);
  }, [updateFilter]);

  const setRating = useCallback((rating: number | undefined) => {
    logger.info('Rating filter changed', { rating });
    updateFilter('rating', rating);
  }, [updateFilter]);

  const setSearch = useCallback((search: string | undefined) => {
    logger.info('Search filter changed', { search });
    updateFilter('search', search);
  }, [updateFilter]);

  const clearFilters = useCallback(() => {
    logger.info('Clearing all filters');
    setFilters({});
  }, []);

  const hasActiveFilters = Object.values(filters).some(value => value !== undefined);

  return {
    filters,
    setCategory,
    setGenre,
    setRating,
    setSearch,
    clearFilters,
    hasActiveFilters,
  };
};