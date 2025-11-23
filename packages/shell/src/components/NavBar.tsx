import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSharedStore } from '../store/SharedStore';
import { Menu, User, LogOut, Film } from 'lucide-react';
import { getMFEUrl } from '../config/microfrontends';
import './NavBar.scss';

export const NavBar: React.FC = () => {
  const { user, isAuthenticated, logout } = useSharedStore();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const handleLogout = () => {
    logout();
    // Redirect to auth MFE for login
    const loginUrl = getMFEUrl('/login');
    if (loginUrl) {
      window.location.href = loginUrl;
    } else {
      navigate('/login');
    }
  };

  const handleAuthNavigation = (path: string) => {
    setIsMenuOpen(false);
    const mfeUrl = getMFEUrl(path);
    if (mfeUrl) {
      window.location.href = mfeUrl;
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          <Film size={32} />
          <span>STREAMIA</span>
        </Link>

        <button 
          className="navbar-toggle"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <Menu size={24} />
        </button>

        <div className={`navbar-menu ${isMenuOpen ? 'active' : ''}`}>
          <div className="navbar-links">
            <Link to="/" onClick={() => setIsMenuOpen(false)}>Inicio</Link>
            {isAuthenticated ? (
              <>
                <Link to="/movies" onClick={() => setIsMenuOpen(false)}>Películas</Link>
                <Link to="/favorites" onClick={() => setIsMenuOpen(false)}>Favoritos</Link>
              </>
            ) : null}
            <Link to="/about" onClick={() => setIsMenuOpen(false)}>Acerca de</Link>
            <Link to="/contact" onClick={() => setIsMenuOpen(false)}>Contacto</Link>
          </div>

          <div className="navbar-actions">
            {isAuthenticated && user ? (
              <>
                <Link to="/profile" className="navbar-user" onClick={() => setIsMenuOpen(false)}>
                  <User size={20} />
                  <span>{user.firstName}</span>
                </Link>
                <button onClick={handleLogout} className="navbar-logout">
                  <LogOut size={20} />
                  <span>Salir</span>
                </button>
              </>
            ) : (
              <>
                <button 
                  className="navbar-button" 
                  onClick={() => handleAuthNavigation('/login')}
                >
                  Iniciar Sesión
                </button>
                <button 
                  className="navbar-button primary" 
                  onClick={() => handleAuthNavigation('/register')}
                >
                  Registrarse
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
