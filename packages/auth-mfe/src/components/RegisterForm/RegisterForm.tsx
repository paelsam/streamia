import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registerSchema, type RegisterFormData } from '../../schemas/authSchemas';
import { authService } from '../../services/authService';
import { EventBus, EVENTS, TokenManager, createLogger } from '@streamia/shared';
import './RegisterForm.scss';

const logger = createLogger('RegisterForm');

export const RegisterForm: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<RegisterFormData>({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof RegisterFormData, string>>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string>('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    if (errors[name as keyof RegisterFormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
    
    if (apiError) {
      setApiError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError('');

    const validation = registerSchema.safeParse(formData);
    if (!validation.success) {
      const fieldErrors: Partial<Record<keyof RegisterFormData, string>> = {};
      validation.error.errors.forEach((error) => {
        if (error.path[0]) {
          fieldErrors[error.path[0] as keyof RegisterFormData] = error.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setIsLoading(true);

    try {
      const response = await authService.register(formData);
      
      if (response.success && response.data) {
        const { user, token } = response.data;
        
        TokenManager.setToken(token);
        EventBus.publish(EVENTS.USER_LOGIN, user);
        
        logger.info('Registration successful', { userId: user._id });
        navigate('/movies');
      }
    } catch (error) {
      logger.error('Registration failed', error);
      setApiError(error instanceof Error ? error.message : 'Error al registrar usuario');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="register-form-container">
      <form className="register-form" onSubmit={handleSubmit}>
        <div className="logo">
          <h1>STREAMIA</h1>
        </div>
        <h2>Crear Cuenta</h2>
        <p className="subtitle">Únete a la mejor plataforma de streaming</p>
        
        {apiError && (
          <div className="error-message api-error">
            {apiError}
          </div>
        )}

        <div className="form-group">
          <label htmlFor="username">Nombre de usuario</label>
          <input
            type="text"
            id="username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            className={errors.username ? 'error' : ''}
            disabled={isLoading}
          />
          {errors.username && (
            <span className="error-message">{errors.username}</span>
          )}
        </div>

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

        <div className="form-group">
          <label htmlFor="confirmPassword">Confirmar contraseña</label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            className={errors.confirmPassword ? 'error' : ''}
            disabled={isLoading}
          />
          {errors.confirmPassword && (
            <span className="error-message">{errors.confirmPassword}</span>
          )}
        </div>

        <button type="submit" disabled={isLoading} className="submit-button">
          {isLoading ? 'Registrando...' : 'Registrarse'}
        </button>

        <div className="form-links">
          <Link to="/login">¿Ya tienes cuenta? Inicia sesión</Link>
        </div>
      </form>
    </div>
  );
};
