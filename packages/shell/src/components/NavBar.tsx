import React, { useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSharedStore } from '../store/SharedStore';
import { Menu, User, LogOut, Film, ChevronDown } from 'lucide-react';
import { TokenManager } from '@streamia/shared/utils';
import { API_URL } from '@streamia/shared/config';
import './NavBar.scss';

export const NavBar: React.FC = () => {
  const { user, isAuthenticated, logout } = useSharedStore();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = React.useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsUserDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      const token = TokenManager.getToken();
      if (token) {
        await fetch(`${API_URL}/users/logout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
      }
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      logout();
      setIsUserDropdownOpen(false);
      navigate('/login');
    }
  };

  const handleAuthNavigation = (path: string) => {
    setIsMenuOpen(false);
    navigate(path);
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
            {isAuthenticated ? (
              <>
                <Link to="/movies" onClick={() => setIsMenuOpen(false)}>Películas</Link>
                <Link to="/favorites" onClick={() => setIsMenuOpen(false)}>Favoritos</Link>
              </>
            ) : (
              <Link to="/" onClick={() => setIsMenuOpen(false)}>Inicio</Link>
            )}
            <Link to="/about" onClick={() => setIsMenuOpen(false)}>Acerca de</Link>
            <Link to="/contact" onClick={() => setIsMenuOpen(false)}>Contacto</Link>
          </div>

          <div className="navbar-actions">
            {isAuthenticated && user ? (
              <div className="navbar-user-dropdown" ref={dropdownRef}>
                <button 
                  className="navbar-user-button"
                  onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                >
                  <User size={20} />
                  <span>{user.firstName}</span>
                  <ChevronDown size={16} className={`dropdown-arrow ${isUserDropdownOpen ? 'open' : ''}`} />
                </button>
                
                {isUserDropdownOpen && (
                  <div className="dropdown-menu">
                    <Link 
                      to="#" 
                      className="dropdown-item"
                      onClick={() => {
                        setIsUserDropdownOpen(false);
                        setIsMenuOpen(false);
                      }}
                    >
                      <User size={18} />
                      <span>Ver perfil</span>
                    </Link>
                    <button onClick={handleLogout} className="dropdown-item logout">
                      <LogOut size={18} />
                      <span>Cerrar sesión</span>
                    </button>
                  </div>
                )}
              </div>
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