import React from 'react';
import { BreadcrumbNav } from '../components/BreadcrumbNav';
import '../styles/about.scss';

export const AboutPage: React.FC = () => {
  return (
    <div className="about-page">
      <BreadcrumbNav items={[{ label: 'Acerca de' }]} />
      
      <section className="about-hero">
        <div className="container">
          <h1>Acerca de Streamia</h1>
          <p className="lead">
            La plataforma de streaming que revoluciona la forma de disfrutar contenido
          </p>
        </div>
      </section>

      <section className="about-content">
        <div className="container">
          <div className="about-section">
            <h2>Nuestra Misión</h2>
            <p>
              En Streamia, nuestra misión es proporcionar acceso ilimitado a contenido de
              entretenimiento de calidad, ofreciendo una experiencia de usuario excepcional
              y accesible para todos mediante tecnología de vanguardia.
            </p>
          </div>

          <div className="about-section">
            <h2>Nuestra Historia</h2>
            <p>
              Fundada en 2025, Streamia nació con la visión de crear una plataforma de
              streaming que ponga al usuario en el centro de la experiencia. Desde entonces,
              hemos evolucionado hacia una arquitectura de microfrontends moderna, permitiendo
              un desarrollo ágil y escalable que se adapta a las necesidades de nuestros usuarios.
            </p>
          </div>

          <div className="about-section">
            <h2>Características y Servicios</h2>
            <div className="features-grid">
              <div className="feature-item">
                <h3>🔐 Autenticación Segura</h3>
                <p>Sistema completo de autenticación y autorización con gestión de sesiones, registro de usuarios y recuperación de contraseñas.</p>
              </div>
              <div className="feature-item">
                <h3>🎬 Catálogo Completo</h3>
                <p>Amplia biblioteca de películas con búsqueda avanzada, filtros personalizables y categorización por géneros.</p>
              </div>
              <div className="feature-item">
                <h3>▶️ Reproductor Avanzado</h3>
                <p>Reproductor de video de alta calidad con soporte para subtítulos, múltiples resoluciones y controles intuitivos.</p>
              </div>
              <div className="feature-item">
                <h3>⭐ Sistema de Favoritos</h3>
                <p>Guarda y organiza tus películas favoritas para acceder rápidamente a tu contenido preferido.</p>
              </div>
              <div className="feature-item">
                <h3>⭐ Calificaciones</h3>
                <p>Califica películas y descubre qué piensan otros usuarios sobre el contenido que te interesa.</p>
              </div>
              <div className="feature-item">
                <h3>💬 Comentarios y Reviews</h3>
                <p>Comparte tus opiniones, lee reseñas de otros usuarios y participa en la comunidad de Streamia.</p>
              </div>
              <div className="feature-item">
                <h3>👤 Perfil Personalizado</h3>
                <p>Gestiona tu perfil de usuario, preferencias y configuración de cuenta de forma sencilla.</p>
              </div>
              <div className="feature-item">
                <h3>📱 Multi-Dispositivo</h3>
                <p>Accede desde cualquier dispositivo: computadora, tablet o smartphone con sincronización automática.</p>
              </div>
            </div>
          </div>

          <div className="about-section">
            <h2>Tecnología de Vanguardia</h2>
            <p>
              Streamia está construida sobre una arquitectura de microfrontends utilizando
              Module Federation, lo que nos permite:
            </p>
            <ul className="tech-list">
              <li>
                <strong>Escalabilidad:</strong> Cada servicio se desarrolla y despliega de forma independiente
              </li>
              <li>
                <strong>Rendimiento:</strong> Carga optimizada y bajo demanda de componentes
              </li>
              <li>
                <strong>Innovación Continua:</strong> Actualizaciones rápidas sin afectar toda la plataforma
              </li>
              <li>
                <strong>Experiencia Fluida:</strong> Navegación sin interrupciones entre secciones
              </li>
            </ul>
          </div>

          <div className="about-section">
            <h2>Nuestros Valores</h2>
            <ul className="values-list">
              <li>
                <strong>Calidad:</strong> Contenido de la más alta calidad en imagen y sonido
              </li>
              <li>
                <strong>Accesibilidad:</strong> Disponible en todos los dispositivos
              </li>
              <li>
                <strong>Innovación:</strong> Tecnología moderna para una mejor experiencia
              </li>
              <li>
                <strong>Transparencia:</strong> Sin costos ocultos ni sorpresas
              </li>
              <li>
                <strong>Comunidad:</strong> Fomentamos la interacción y el intercambio de opiniones
              </li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
};
