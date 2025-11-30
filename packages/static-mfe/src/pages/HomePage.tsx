import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { TokenManager } from '@streamia/shared/utils';
import { Features } from '../components/Features';
import '../styles/home.scss';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // If user is authenticated, redirect to movies catalog
    if (TokenManager.isCurrentTokenValid()) {
      navigate('/movies', { replace: true });
    }
  }, [navigate]);

  // Don't render the page if user is authenticated (will redirect)
  if (TokenManager.isCurrentTokenValid()) {
    return null;
  }

  return (
    <div className="home-page">
      <section className="hero-section">
        <div className="hero-content">
          <h1>Bienvenido a Streamia</h1>
          <p className="hero-subtitle">
            Tu plataforma de streaming favorita con miles de películas y series
          </p>
          <div className="hero-actions">
            <Link to="/register" className="btn btn-primary">
              Comenzar ahora
            </Link>
            <Link to="/about" className="btn btn-secondary">
              Más información
            </Link>
          </div>
        </div>
      </section>

      <Features />

      <section className="cta-section">
        <div className="container">
          <h2>¿Listo para comenzar?</h2>
          <p>Únete a miles de usuarios que ya disfrutan de Streamia</p>
          <Link to="/register" className="btn btn-primary btn-lg">
            Crear cuenta gratis
          </Link>
        </div>
      </section>
    </div>
  );
};
