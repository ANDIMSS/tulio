import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, ShieldAlert } from 'lucide-react';
import { normalizeAppError, logTechnicalError } from '../lib/errorHandler';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
  fallbackMessage?: string;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({ errorInfo });
    logTechnicalError('ErrorBoundary', error, {
      componentStack: errorInfo.componentStack ? errorInfo.componentStack.slice(0, 500) : '',
    });
  }

  public handleRetry = (): void => {
    if (this.props.onReset) {
      this.props.onReset();
    }
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  public handleReload = (): void => {
    window.location.reload();
  };

  public handleGoHome = (): void => {
    window.location.hash = '';
    window.location.pathname = '/';
  };

  public render(): ReactNode {
    if (this.state.hasError) {
      const normalized = normalizeAppError(this.state.error);

      return (
        <div className="min-h-[400px] w-full flex items-center justify-center p-6 bg-ink text-white">
          <div className="max-w-md w-full bg-ink-light border border-ink-border rounded-sm p-6 sm:p-8 text-center shadow-2xl relative overflow-hidden">
            {/* Top accent bar */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-amber-500/80" />

            <div className="w-14 h-14 mx-auto mb-5 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <h3 className="font-serif text-xl sm:text-2xl font-bold text-white mb-2">
              {this.props.fallbackTitle || 'Algo não saiu como esperado'}
            </h3>

            <p className="text-gray-400 text-xs sm:text-sm leading-relaxed mb-6">
              {this.props.fallbackMessage || normalized.userMessage || 'Ocorreu uma falha temporária de exibição neste componente. Seus dados e sua sessão continuam preservados.'}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5">
              <button
                type="button"
                onClick={this.handleRetry}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gold hover:bg-gold-light text-ink font-bold px-4 py-2.5 rounded-sm text-xs uppercase tracking-wider transition-all shadow-md cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Tentar Novamente</span>
              </button>

              <button
                type="button"
                onClick={this.handleReload}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-ink-border px-4 py-2.5 rounded-sm text-xs font-semibold transition-colors cursor-pointer"
              >
                <span>Recarregar Página</span>
              </button>

              <button
                type="button"
                onClick={this.handleGoHome}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-transparent hover:bg-white/5 text-gray-400 hover:text-gray-200 px-3 py-2.5 rounded-sm text-xs font-medium transition-colors cursor-pointer"
                title="Voltar ao início"
              >
                <Home className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="mt-6 pt-4 border-t border-ink-border/50 flex items-center justify-center gap-1.5 text-[11px] text-gray-500">
              <ShieldAlert className="w-3.5 h-3.5 text-gray-500" />
              <span>Sua sessão e permissões permanecem ativas</span>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
