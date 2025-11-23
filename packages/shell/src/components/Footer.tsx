import React from 'react';
import './Footer.scss';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-section">
          <h3>STREAMIA</h3>
          <p>Tu plataforma de streaming de películas</p>
        </div>

        <div className="footer-section">
          <h4>Enlaces</h4>
          <ul>
            <li><a href="/about">Acerca de</a></li>
            <li><a href="/contact">Contacto</a></li>
            <li><a href="/manual">Manual</a></li>
            <li><a href="/sitemap">Mapa del sitio</a></li>
          </ul>
        </div>

        <div className="footer-section">
          <h4>Legal</h4>
          <ul>
            <li><a href="/privacy">Privacidad</a></li>
            <li><a href="/terms">Términos de uso</a></li>
          </ul>
        </div>

        <div className="footer-section">
          <p className="footer-copy">
            &copy; {currentYear} STREAMIA. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};
