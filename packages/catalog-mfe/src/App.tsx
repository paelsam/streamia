import React from 'react';
import { useLocation } from 'react-router-dom';
import { HomeMoviesPage } from './pages/HomeMoviesPage';
import { MoviesListPage } from './pages/MoviesListPage';
import { createLogger } from '@streamia/shared/utils';
import './App.scss';

const logger = createLogger('Catalog-MFE');

function App() {
  const location = useLocation();
  
  logger.info('Catalog MFE rendered', { path: location.pathname });

  // Determinar qué página mostrar basado en la ruta actual
  const isMoviesListPage = location.pathname.startsWith('/movies');

  return (
    <div className="catalog-app">
      {isMoviesListPage ? <MoviesListPage /> : <HomeMoviesPage />}
    </div>
  );
}

export default App;