import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in Zenve application:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#001C13] flex flex-col items-center justify-center text-center p-6 text-[#F5F0DF]">
          <div className="max-w-md p-8 border border-[#E4BD5A]/30 bg-[#001710] shadow-2xl space-y-4">
            <p className="text-[10px] tracking-[0.25em] text-[#E4BD5A] uppercase font-semibold">
              ATELIER CONCIERGE
            </p>
            <h1 className="font-serif text-3xl text-[#F5F0DF]">Experience Refresh Required</h1>
            <p className="text-xs text-[#B8B9A8] leading-relaxed">
              We encountered an unexpected presentation state. Please refresh the page to restore your bespoke session.
            </p>
            <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => window.location.reload()}
                className="bg-[#E4BD5A] text-[#001C13] hover:bg-[#F1D27A] px-6 py-2.5 text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer"
              >
                REFRESH PAGE
              </button>
              <a
                href="/"
                className="border border-[#E4BD5A]/40 text-[#F5F0DF] hover:border-[#E4BD5A] px-6 py-2.5 text-xs uppercase tracking-wider transition-colors inline-block"
              >
                RETURN HOME
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
