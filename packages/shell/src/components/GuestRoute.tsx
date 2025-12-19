import React, { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useSharedStore } from '../store/SharedStore';
import { createLogger } from '@streamia/shared/utils';

const logger = createLogger('GuestRoute');

interface GuestRouteProps {
  children: ReactNode;
}

/**
 * Guest Route Component
 * Redirects to movies catalog if user is already authenticated
 * Only allows access to guests (non-authenticated users)
 */
export const GuestRoute: React.FC<GuestRouteProps> = ({ children }) => {
  const { isAuthenticated } = useSharedStore();

  if (isAuthenticated) {
    logger.info('User already authenticated, redirecting to movies');
    return <Navigate to="/movies" replace />;
  }

  return <>{children}</>;
};
