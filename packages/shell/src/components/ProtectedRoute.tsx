import React, { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useSharedStore } from '../store/SharedStore';
import { createLogger } from '@streamia/shared/utils';

const logger = createLogger('ProtectedRoute');

interface ProtectedRouteProps {
  children: ReactNode;
}

/**
 * Protected Route Component
 * Redirects to login if user is not authenticated
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated } = useSharedStore();

  if (!isAuthenticated) {
    logger.info('User not authenticated, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};
