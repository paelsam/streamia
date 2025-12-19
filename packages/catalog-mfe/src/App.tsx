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
  // /movies → HomeMoviesPage (página principal)
  // /movies/browse → MoviesListPage (listado con filtros)
  const isBrowsePage = location.pathname.includes('/browse');

  return (
    <div className="catalog-app">
      {isBrowsePage ? <MoviesListPage /> : <HomeMoviesPage />}
    </div>
  );
}

export default App;