import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { HomeMoviesPage } from './pages/HomeMoviesPage';
import { MoviesListPage } from './pages/MoviesListPage';
import { createLogger } from '@streamia/shared/utils';
import './App.scss';

const logger = createLogger('Catalog-MFE');

function App() {
  const location = useLocation();
  
  logger.info('Catalog MFE rendered', { path: location.pathname });

  return (
    <div className="catalog-app">
      <Routes>
        <Route path="/home-movies" element={<HomeMoviesPage />} />
        <Route path="/movies" element={<MoviesListPage />} />
        <Route path="*" element={<Navigate to="/home-movies" replace />} />
      </Routes>
    </div>
  );
}

export default App;