import { LoginFormData, RegisterFormData, RecoverPasswordFormData, ResetPasswordFormData } from '../schemas/authSchemas';
import type { ApiResponse, User } from '@streamia/shared/types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const authService = {
  async login(data: LoginFormData): Promise<ApiResponse<{ user: User; token: string }>> {
    const response = await fetch(`${API_URL}/users/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Error al iniciar sesión');
    }

    return result;
  },

  async register(data: RegisterFormData): Promise<ApiResponse<{ user: User; token: string }>> {
    const response = await fetch(`${API_URL}/users/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: data.username,
        email: data.email,
        password: data.password,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Error al registrar usuario');
    }

    return result;
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
};
