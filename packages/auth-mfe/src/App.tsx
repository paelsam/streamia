import React from 'react';
import { Routes, Route, Navigate, useLocation, Link } from 'react-router-dom';
import { LoginForm } from './components/LoginForm/LoginForm';
import { RegisterForm } from './components/RegisterForm/RegisterForm';
import { createLogger } from '@streamia/shared/utils';
import './App.scss';

const logger = createLogger('Auth-MFE');

function App() {
  const location = useLocation();
  
  logger.info('Auth MFE rendered', { path: location.pathname });

  return (
    <div className="auth-app">
      <Routes>
        <Route path="/login" element={<LoginForm />} />
        <Route path="/register" element={<RegisterForm />} />
        <Route path="/recover-password" element={
          <div className="auth-placeholder">
            <div className="auth-logo">
              <h1>STREAMIA</h1>
            </div>
            <h2>Recuperación de contraseña</h2>
            <p>Esta funcionalidad estará disponible próximamente.</p>
            <Link to="/login" className="back-link">Volver al inicio de sesión</Link>
          </div>
        } />
        <Route path="/reset-password/:token" element={
          <div className="auth-placeholder">
            <div className="auth-logo">
              <h1>STREAMIA</h1>
            </div>
            <h2>Restablecer contraseña</h2>
            <p>Esta funcionalidad estará disponible próximamente.</p>
            <Link to="/login" className="back-link">Volver al inicio de sesión</Link>
          </div>
        } />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </div>
  );
}

export default App;
