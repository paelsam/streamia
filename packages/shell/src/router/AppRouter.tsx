import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { createLogger } from '@streamia/shared/utils';

const logger = createLogger('Router');

// Lazy load microfrontends
const loadMicrofrontend = (importFn: () => Promise<any>, name: string) => {
  return lazy(async () => {
    try {
      logger.info(`Loading microfrontend: ${name}`);
      const module = await importFn();
      logger.info(`Microfrontend loaded successfully: ${name}`);
      return module;
    } catch (error) {
      logger.error(`Failed to load microfrontend: ${name}`, error);
      throw error;
    }
  });
};

// Load Auth MFE
const AuthMFE = loadMicrofrontend(
  () => import('authMFE/App'),
  'Auth MFE'
);

// Placeholder for home page (can be a static page or another MFE)
const HomePage: React.FC = () => (
  <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
    <h1>Bienvenido a STREAMIA</h1>
    <p>Tu plataforma de streaming de películas</p>
  </div>
);

export const AppRouter: React.FC = () => {
  return (
    <BrowserRouter>
      <Layout>
        <ErrorBoundary>
          <Suspense fallback={<LoadingSpinner />}>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<HomePage />} />
              
              {/* Auth Routes - Auth MFE */}
              <Route path="/login/*" element={<AuthMFE />} />
              <Route path="/register/*" element={<AuthMFE />} />
              <Route path="/recover-password/*" element={<AuthMFE />} />
              <Route path="/reset-password/*" element={<AuthMFE />} />

              {/* Protected Routes - Placeholder for other MFEs */}
              <Route
                path="/movies"
                element={
                  <ProtectedRoute>
                    <div>Movies MFE (To be implemented)</div>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/movie/:id"
                element={
                  <ProtectedRoute>
                    <div>Player MFE (To be implemented)</div>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <div>Profile MFE (To be implemented)</div>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/favorites"
                element={
                  <ProtectedRoute>
                    <div>Favorites MFE (To be implemented)</div>
                  </ProtectedRoute>
                }
              />

              {/* Static Pages */}
              <Route path="/about" element={<div>About Page (To be implemented)</div>} />
              <Route path="/contact" element={<div>Contact Page (To be implemented)</div>} />
              <Route path="/manual" element={<div>Manual Page (To be implemented)</div>} />
              <Route path="/sitemap" element={<div>Sitemap Page (To be implemented)</div>} />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </ErrorBoundary>
      </Layout>
    </BrowserRouter>
  );
};
