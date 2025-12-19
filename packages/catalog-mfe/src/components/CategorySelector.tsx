import React, { useRef, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Sparkles, TrendingUp, Clock, Film, Zap, Laugh, Heart, Ghost, Rocket } from 'lucide-react';
import '../styles/CategorySelector.scss';

interface CategorySelectorProps {
  selectedCategory?: string;
  onCategoryChange: (category: string | undefined) => void;
}

// ✅ CORRECCIÓN: Usar las categorías reales de mockMovies
const CATEGORIES = [
  { 
    id: undefined, 
    label: 'Todas', 
    icon: Film,
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    description: 'Todo el catálogo'
  },
  { 
    id: 'trending', 
    label: 'Tendencias', 
    icon: TrendingUp,
    gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    description: 'Lo más popular'
  },
  { 
    id: 'new-releases',  // ✅ CORREGIDO: 'new' → 'new-releases'
    label: 'Nuevos Lanzamientos', 
    icon: Sparkles,
    gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    description: 'Recién agregadas'
  },
  { 
    id: 'action',  // ✅ NUEVO: Agregar categorías reales
    label: 'Acción', 
    icon: Zap,
    gradient: 'linear-gradient(135deg, #ff6b6b 0%, #ffa726 100%)',
    description: 'Películas de acción'
  },
  { 
    id: 'comedy', 
    label: 'Comedia', 
    icon: Laugh,
    gradient: 'linear-gradient(135deg, #a8e6cf 0%, #3edbf0 100%)',
    description: 'Risas garantizadas'
  },
  { 
    id: 'drama', 
    label: 'Drama', 
    icon: Heart,
    gradient: 'linear-gradient(135deg, #fdbb2d 0%, #22c1c3 100%)',
    description: 'Historias emocionantes'
  },
  { 
    id: 'horror', 
    label: 'Terror', 
    icon: Ghost,
    gradient: 'linear-gradient(135deg, #434343 0%, #000000 100%)',
    description: 'Para los valientes'
  },
  { 
    id: 'sci-fi', 
    label: 'Ciencia Ficción', 
    icon: Rocket,
    gradient: 'linear-gradient(135deg, #5ee7df 0%, #b490ca 100%)',
    description: 'Futuro y fantasía'
  },
  { 
    id: 'classics', 
    label: 'Clásicos', 
    icon: Clock,
    gradient: 'linear-gradient(135deg, #d4fc79 0%, #96e6a1 100%)',
    description: 'Películas icónicas'
  },
];

export const CategorySelector: React.FC<CategorySelectorProps> = ({
  selectedCategory,
  onCategoryChange,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);

  const checkScroll = () => {
    const container = scrollContainerRef.current;
    if (!container) return;

    setShowLeftArrow(container.scrollLeft > 10);
    setShowRightArrow(
      container.scrollLeft < container.scrollWidth - container.clientWidth - 10
    );
  };

  useEffect(() => {
    checkScroll();
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', checkScroll);
      window.addEventListener('resize', checkScroll);
      return () => {
        container.removeEventListener('scroll', checkScroll);
        window.removeEventListener('resize', checkScroll);
      };
    }
  }, []);

  const scroll = (direction: 'left' | 'right') => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const scrollAmount = 300;
    const targetScroll =
      direction === 'left'
        ? container.scrollLeft - scrollAmount
        : container.scrollLeft + scrollAmount;

    container.scrollTo({
      left: targetScroll,
      behavior: 'smooth',
    });
  };

  return (
    <div className="category-selector">
      <div className="category-selector__header">
        <h3 className="category-selector__title">Explorar por categoría</h3>
      </div>

      <div className="category-selector__wrapper">
        {showLeftArrow && (
          <button
            className="category-selector__arrow category-selector__arrow--left"
            onClick={() => scroll('left')}
            aria-label="Desplazar a la izquierda"
          >
            <ChevronLeft size={24} />
          </button>
        )}

        <div 
          className="category-selector__container" 
          ref={scrollContainerRef}
        >
          {CATEGORIES.map((category) => {
            const Icon = category.icon;
            const isActive = selectedCategory === category.id;

            return (
              <button
                key={category.id || 'all'}
                className={`category-card ${
                  isActive ? 'category-card--active' : ''
                }`}
                onClick={() => onCategoryChange(category.id)}
                aria-pressed={isActive}
                style={{
                  '--category-gradient': category.gradient,
                } as React.CSSProperties}
              >
                <div className="category-card__gradient" />
                <div className="category-card__content">
                  <div className="category-card__icon-wrapper">
                    <Icon className="category-card__icon" size={24} />
                  </div>
                  <div className="category-card__text">
                    <h4 className="category-card__label">{category.label}</h4>
                    <p className="category-card__description">
                      {category.description}
                    </p>
                  </div>
                </div>
                {isActive && (
                  <div className="category-card__active-indicator" />
                )}
              </button>
            );
          })}
        </div>

        {showRightArrow && (
          <button
            className="category-selector__arrow category-selector__arrow--right"
            onClick={() => scroll('right')}
            aria-label="Desplazar a la derecha"
          >
            <ChevronRight size={24} />
          </button>
        )}
      </div>
    </div>
  );
};