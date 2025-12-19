import { z } from 'zod';

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'El email es requerido')
    .email('Email inválido'),
  password: z
    .string()
    .min(1, 'La contraseña es requerida')
    .min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

export const registerSchema = z.object({
  firstName: z
    .string()
    .min(1, 'El nombre de usuario es requerido')
    .min(3, 'El nombre de usuario debe tener al menos 3 caracteres')
    .max(50, 'El nombre de usuario no puede exceder 50 caracteres'),
  lastName: z
    .string()
    .min(1, 'El nombre de usuario es requerido')
    .min(3, 'El nombre de usuario debe tener al menos 3 caracteres')
    .max(50, 'El nombre de usuario no puede exceder 50 caracteres'),
  age: z
  .number()
  .int()
  .min(1, 'La edad mínima es 1')
  .max(99, 'La edad máxima es 99'),
  
  email: z
    .string()
    .min(1, 'El email es requerido')
    .email('Email inválido'),
  password: z
    .string()
    .min(1, 'La contraseña es requerida')
    .min(6, 'La contraseña debe tener al menos 6 caracteres')
    .regex(/[A-Z]/, 'La contraseña debe contener al menos una mayúscula')
    .regex(/[a-z]/, 'La contraseña debe contener al menos una minúscula')
    .regex(/[0-9]/, 'La contraseña debe contener al menos un número'),
  confirmPassword: z
    .string()
    .min(1, 'La confirmación de contraseña es requerida'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword'],
});

export const registerFormSchema = z.object({
  firstName: z
    .string()
    .min(1, 'El nombre de usuario es requerido')
    .min(3, 'El nombre de usuario debe tener al menos 3 caracteres')
    .max(50, 'El nombre de usuario no puede exceder 50 caracteres'),
  lastName: z
    .string()
    .min(1, 'El nombre de usuario es requerido')
    .min(3, 'El nombre de usuario debe tener al menos 3 caracteres')
    .max(50, 'El nombre de usuario no puede exceder 50 caracteres'),
  age: z
  .string()
  .min(1, 'La edad mínima es 1')
  .max(99, 'La edad máxima es 99'),
  
  email: z
    .string()
    .min(1, 'El email es requerido')
    .email('Email inválido'),
  password: z
    .string()
    .min(1, 'La contraseña es requerida')
    .min(6, 'La contraseña debe tener al menos 6 caracteres')
    .regex(/[A-Z]/, 'La contraseña debe contener al menos una mayúscula')
    .regex(/[a-z]/, 'La contraseña debe contener al menos una minúscula')
    .regex(/[0-9]/, 'La contraseña debe contener al menos un número'),
  confirmPassword: z
    .string()
    .min(1, 'La confirmación de contraseña es requerida'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword'],
});

export const recoverPasswordSchema = z.object({
  email: z
    .string()
    .min(1, 'El email es requerido')
    .email('Email inválido'),
});

export const resetPasswordSchema = z.object({
  password: z
    .string()
    .min(1, 'La contraseña es requerida')
    .min(6, 'La contraseña debe tener al menos 6 caracteres')
    .regex(/[A-Z]/, 'La contraseña debe contener al menos una mayúscula')
    .regex(/[a-z]/, 'La contraseña debe contener al menos una minúscula')
    .regex(/[0-9]/, 'La contraseña debe contener al menos un número'),
  confirmPassword: z
    .string()
    .min(1, 'La confirmación de contraseña es requerida'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword'],
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type RegisterInputData=z.infer<typeof registerFormSchema>;
export type RecoverPasswordFormData = z.infer<typeof recoverPasswordSchema>;
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
