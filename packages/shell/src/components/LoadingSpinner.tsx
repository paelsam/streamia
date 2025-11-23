import React from 'react';
import './LoadingSpinner.scss';

export const LoadingSpinner: React.FC = () => {
  return (
    <div className="loading-spinner">
      <div className="spinner"></div>
      <p>Cargando...</p>
    </div>
  );
};
