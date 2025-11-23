import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { loginSchema, type LoginFormData } from '../../schemas/authSchemas';
import { authService } from '../../services/authService';
import { EventBus, EVENTS, TokenManager, createLogger } from '@streamia/shared';
import './LoginForm.scss';

const logger = createLogger('LoginForm');

export const LoginForm: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof LoginFormData, string>>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string>('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Clear field error on change
    if (errors[name as keyof LoginFormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
    
    // Clear API error
    if (apiError) {
      setApiError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError('');

    // Validate form
    const validation = loginSchema.safeParse(formData);
    if (!validation.success) {
      const fieldErrors: Partial<Record<keyof LoginFormData, string>> = {};
      validation.error.errors.forEach((error) => {
        if (error.path[0]) {
          fieldErrors[error.path[0] as keyof LoginFormData] = error.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setIsLoading(true);

    try {
      const response = await authService.login(formData);
      
      if (response.success && response.data) {
        const { user, token } = response.data;
        
        // Store token
        TokenManager.setToken(token);
        
        // Emit login event
        EventBus.publish(EVENTS.USER_LOGIN, user);
        
        logger.info('Login successful', { userId: user._id });
        
        // Navigate to home
        navigate('/movies');
      }
    } catch (error) {
      logger.error('Login failed', error);
      setApiError(error instanceof Error ? error.message : 'Error al iniciar sesión');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-form-container">
      <form className="login-form" onSubmit={handleSubmit}>
        <div className="logo">
          <h1>STREAMIA</h1>
        </div>
        <h2>Iniciar Sesión</h2>
        
        {apiError && (
          <div className="error-message api-error">
            {apiError}
          </div>
        )}

        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className={errors.email ? 'error' : ''}
            disabled={isLoading}
          />
          {errors.email && (
            <span className="error-message">{errors.email}</span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="password">Contraseña</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className={errors.password ? 'error' : ''}
            disabled={isLoading}
          />
          {errors.password && (
            <span className="error-message">{errors.password}</span>
          )}
        </div>

        <button type="submit" disabled={isLoading} className="submit-button">
          {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
        </button>

        <div className="form-links">
          <Link to="/recover-password">¿Olvidaste tu contraseña?</Link>
          <Link to="/register">¿No tienes cuenta? Regístrate</Link>
        </div>
      </form>
    </div>
  );
};
