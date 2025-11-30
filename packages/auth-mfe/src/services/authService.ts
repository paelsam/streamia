import { LoginFormData, RegisterFormData, RecoverPasswordFormData, ResetPasswordFormData } from '../schemas/authSchemas';
import type { ApiResponse, User } from '@streamia/shared/types';
import { createLogger } from '@streamia/shared/utils';

import { API_URL } from '@streamia/shared/config';

const logger = createLogger('AuthService');

// Log de configuración al iniciar
logger.info('AuthService initialized', { API_URL });

export const authService = {
  async login(data: LoginFormData): Promise<ApiResponse<{ user: User; token: string }>> {
    try {
      const response = await fetch(`${API_URL}/users/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      // Check content type before parsing
      const contentType = response.headers.get('content-type');
      
      if (contentType && contentType.includes('application/json')) {
        const result = await response.json();
        
        if (!response.ok) {
          throw new Error(result.error || result.message || 'Error al iniciar sesión');
        }
        
        return  {
          success: true,
          data: {
            user: result.user,
            token: result.token
          },
          message: result.message
        };
      } else {
        // Server returned plain text (probably an error)
        const text = await response.text();
        throw new Error(text || 'Error del servidor');
      }
      
    } catch (error) {
      // If it's already an Error, re-throw it
      if (error instanceof Error) {
        throw error;
      }
      // Otherwise, wrap it
      throw new Error('Error de conexión con el servidor');
    }
  },

  async register(data: RegisterFormData): Promise<ApiResponse<{ user: User; token: string }>> {
    // 1. Double check this path. Does your backend require '/api'?
    // Change '/users/register' to match your backend exactly.
    const response = await fetch(`${API_URL}/users/register`, { 
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        firstName: data.firstName,
        lastName: data.lastName,
        age: data.age,
        email: data.email,
        password: data.password,
        confirmPassword: data.confirmPassword
        // Note: I removed confirmPassword as most backends don't want it in the DB payload
      }),
    });

    const result = await response.json();

    console.log('result in registerform:',result)

    if (!response.ok) {
  console.log("Full Server Response:", result); // <--- Add this to see the array in Console

  // 1. If 'message' is an array (common in NestJS/Express validation), join it into a string
  if (Array.isArray(result.message)) {
    throw new Error(result.message.join(', '));
  }

  const errors=result.details.fieldErrors as Record<string, string[]>;

  const message = Object.values(errors)
  .filter(errorList => errorList.length > 0)
  .map(errorList => errorList[0])
  .join(', '); 

  console.log('errors register news:',message)
  
  // 2. Otherwise try specific fields
  const errorMessage = message || result.error || 'Error al registrar usuario';
  
  throw new Error(errorMessage);
}

    return {
          success: true,
          data: {
            user: result.user,
            token: result.token
          },
          message: result.message
        };
},

  async recoverPassword(data: RecoverPasswordFormData): Promise<ApiResponse<void>> {
    const response = await fetch(`${API_URL}/users/recover-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Error al recuperar contraseña');
    }

    return result;
  },

  async resetPassword(token: string, data: ResetPasswordFormData): Promise<ApiResponse<void>> {
    const response = await fetch(`${API_URL}/users/reset-password/${token}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        password: data.password,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Error al restablecer contraseña');
    }

    return result;
  },

  async logout(authToken: string): Promise<ApiResponse<void>> {
    try {
      const response = await fetch(`${API_URL}/users/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
      });

      const contentType = response.headers.get('content-type');
      
      if (contentType && contentType.includes('application/json')) {
        const result = await response.json();
        
        if (!response.ok) {
          throw new Error(result.message || 'Error al cerrar sesión');
        }
        
        return {
          success: true,
          message: result.message || 'Sesión cerrada correctamente'
        };
      }
      
      return { success: true, message: 'Sesión cerrada correctamente' };
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Error de conexión con el servidor');
    }
  },
};
