import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  RegisterInputData,
  registerSchema,
  registerFormSchema,
  type RegisterFormData,
} from "../../schemas/authSchemas";
import { authService } from "../../services/authService";
import { eventBus, EVENTS, TokenManager, createLogger } from "@streamia/shared";
import "./RegisterForm.scss";

const logger = createLogger("RegisterForm");

export const RegisterForm: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    age: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<
    Partial<Record<keyof RegisterInputData, string>>
  >({});
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string>("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name as keyof RegisterFormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }

    if (apiError) {
      setApiError("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError("");

    const validation = registerFormSchema.safeParse(formData);
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

    const payload = {
      ...formData,
      age: Number(formData.age),
    };

    console.log('this is the payload:',payload)

    setIsLoading(true);

    try {
      const response = await authService.register(payload);
      console.log('register success response:', response)
      if (response.success && response.data) {
        const { user, token } = response.data;

        TokenManager.setToken(token);
        localStorage.setItem('user', JSON.stringify(user));
        eventBus.publish(EVENTS.USER_LOGIN, { user, token });

        logger.info("Registration successful", { userId: user.id });
        navigate("/movies");
      }
    } catch (error) {
      logger.error("Registration failed", error);
      setApiError(
        error instanceof Error ? error.message : "Error al registrar usuario"
      );
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

        {apiError && <div className="error-message api-error">{apiError}</div>}

        <div className="form-group">
          <label htmlFor="firstName">Nombre</label>
          <input
            type="text"
            id="firstName"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            className={errors.firstName ? "error" : ""}
            disabled={isLoading}
          />
          {errors.firstName && (
            <span className="error-message">{errors.firstName}</span>
          )}
        </div>
        <div className="form-group">
          <label htmlFor="lastName">Apellido</label>
          <input
            type="text"
            id="lastName"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            className={errors.lastName ? "error" : ""}
            disabled={isLoading}
          />
          {errors.lastName && (
            <span className="error-message">{errors.lastName}</span>
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
            className={errors.email ? "error" : ""}
            disabled={isLoading}
          />
          {errors.email && (
            <span className="error-message">{errors.email}</span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="age">Edad</label>
          <input
            type="text"
            id="age"
            name="age"
            value={formData.age}
            onChange={handleChange}
            className={errors.age ? "error" : ""}
            disabled={isLoading}
          />
          {errors.age && <span className="error-message">{errors.age}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="password">Contraseña</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className={errors.password ? "error" : ""}
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
            className={errors.confirmPassword ? "error" : ""}
            disabled={isLoading}
          />
          {errors.confirmPassword && (
            <span className="error-message">{errors.confirmPassword}</span>
          )}
        </div>

        <button type="submit" disabled={isLoading} className="submit-button">
          {isLoading ? "Registrando..." : "Registrarse"}
        </button>

        <div className="form-links">
          <Link to="/login">¿Ya tienes cuenta? Inicia sesión</Link>
        </div>
      </form>
    </div>
  );
};
