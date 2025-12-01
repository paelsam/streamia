import { Component, ErrorInfo, ReactNode } from 'react';
import { createLogger } from '@streamia/shared/utils';

const logger = createLogger('ErrorBoundary');

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error Boundary Component
 * Catches errors in microfrontend loading and rendering
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    logger.error('Error caught by boundary', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
    });
  }

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div style={styles.container}>
          <div style={styles.content}>
            <h2 style={styles.title}>Algo salió mal</h2>
            <p style={styles.message}>
              No pudimos cargar este módulo. Por favor, intenta recargar la página.
            </p>
            <button
              style={styles.button}
              onClick={() => window.location.reload()}
            >
              Recargar página
            </button>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details style={styles.details}>
                <summary>Detalles del error</summary>
                <pre style={styles.pre}>{this.state.error.stack}</pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const styles = {
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '400px',
    padding: '2rem',
  },
  content: {
    textAlign: 'center' as const,
    maxWidth: '600px',
  },
  title: {
    fontSize: '2rem',
    marginBottom: '1rem',
    color: '#e74c3c',
  },
  message: {
    fontSize: '1.1rem',
    marginBottom: '2rem',
    color: '#666',
  },
  button: {
    padding: '0.75rem 1.5rem',
    fontSize: '1rem',
    backgroundColor: '#3498db',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  details: {
    marginTop: '2rem',
    textAlign: 'left' as const,
    padding: '1rem',
    backgroundColor: '#f5f5f5',
    borderRadius: '4px',
  },
  pre: {
    fontSize: '0.875rem',
    overflow: 'auto',
    maxHeight: '300px',
  },
};
