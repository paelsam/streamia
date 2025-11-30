import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { GuestRoute } from '../components/GuestRoute';
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

// Load Static MFE
const StaticMFE = loadMicrofrontend(
  () => import('staticMFE/App'),
  'Static MFE'
);

const FavoritesMFE = loadMicrofrontend(
  () => import('favoritesMFE/App'),
  'Favorites MFE'
);

export const AppRouter: React.FC = () => {
  return (
    <BrowserRouter>
      <Layout>
        <ErrorBoundary>
          <Suspense fallback={<LoadingSpinner />}>
            <Routes>
              {/* Auth Routes - Auth MFE (only for guests) */}
              <Route path="/login" element={<GuestRoute><AuthMFE /></GuestRoute>} />
              <Route path="/register" element={<GuestRoute><AuthMFE /></GuestRoute>} />
              <Route path="/recover-password" element={<GuestRoute><AuthMFE /></GuestRoute>} />
              <Route path="/reset-password/*" element={<GuestRoute><AuthMFE /></GuestRoute>} />

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
              <Route path="/favorites/*" element={<FavoritesMFE />} />
          

              {/* Static Pages - Static MFE */}
              <Route path="/*" element={<StaticMFE />} />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </ErrorBoundary>
      </Layout>
    </BrowserRouter>
  );
};
