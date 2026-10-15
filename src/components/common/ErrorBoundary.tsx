import { Component, type ErrorInfo, type ReactNode } from 'react';
import { RefreshCw, Home } from 'lucide-react';
import { StatusScreen } from './StatusScreen';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

/**
 * Atrapa errores de render para que la app nunca quede en blanco:
 * Many explica lo que pasó y ofrece reintentar o volver al inicio.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    if (import.meta.env.DEV) console.error(error, info.componentStack);
  }

  private retry = () => this.setState({ hasError: false });

  private goHome = () => {
    window.location.assign(import.meta.env.BASE_URL);
  };

  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <StatusScreen
        code="Uy"
        title="Algo se nos rompió"
        message="Many ya está revisando qué pasó. Tus datos siguen guardados; puedes reintentar o volver al inicio."
        actions={
          <>
            <button type="button" className="btn btn-primary" onClick={this.retry}>
              <RefreshCw size={18} aria-hidden="true" /> Reintentar
            </button>
            <button type="button" className="btn btn-secondary" onClick={this.goHome}>
              <Home size={18} aria-hidden="true" /> Ir al inicio
            </button>
          </>
        }
      />
    );
  }
}
