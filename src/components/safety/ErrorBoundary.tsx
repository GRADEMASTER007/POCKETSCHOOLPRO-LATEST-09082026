import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCw, WifiOff, Home } from "lucide-react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  isOffline: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    isOffline: typeof window !== "undefined" ? !window.navigator.onLine : false
  };

  private handleOnlineStatusChange = () => {
    this.setState({ isOffline: !window.navigator.onLine });
  };

  public componentDidMount() {
    window.addEventListener("online", this.handleOnlineStatusChange);
    window.addEventListener("offline", this.handleOnlineStatusChange);
  }

  public componentWillUnmount() {
    window.removeEventListener("online", this.handleOnlineStatusChange);
    window.removeEventListener("offline", this.handleOnlineStatusChange);
  }

  public static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      isOffline: typeof window !== "undefined" ? !window.navigator.onLine : false
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an unhandled exception:", error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  private handleGoHome = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = "/";
  };

  public render() {
    if (this.state.hasError || this.state.isOffline) {
      const isConnectionIssue = this.state.isOffline || (this.state.error?.message?.toLowerCase().includes("fetch") || this.state.error?.message?.toLowerCase().includes("network"));

      return (
        <div id="error-boundary-container" className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-center select-none">
          <div className="max-w-md w-full bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-6">
            
            {/* Animated Icon Wrapper */}
            <div className="flex justify-center">
              <div className="w-16 h-16 rounded-3xl bg-rose-50 flex items-center justify-center text-rose-500 animate-pulse">
                {isConnectionIssue ? (
                  <WifiOff className="w-8 h-8 text-amber-500" />
                ) : (
                  <AlertTriangle className="w-8 h-8 text-rose-500" />
                )}
              </div>
            </div>

            {/* Error Message Text */}
            <div className="space-y-2">
              <h1 className="text-xl font-bold text-gray-900 tracking-tight">
                {isConnectionIssue 
                  ? "Connection Interrupted" 
                  : "Something went wrong"}
              </h1>
              <p className="text-sm text-gray-500 leading-relaxed">
                {isConnectionIssue 
                  ? "We're having trouble reaching our servers. Please check your internet connection or local wifi network and try again." 
                  : "Aristotle encountered an unexpected error while preparing your study hub. We've logged this issue and are working to resolve it."}
              </p>
            </div>

            {/* Error details inside collapsed box if not connection issue */}
            {!isConnectionIssue && this.state.error && (
              <details className="text-left text-[10px] text-gray-400 bg-gray-50 p-3 rounded-xl border border-gray-100/50 cursor-pointer">
                <summary className="font-semibold text-gray-500 focus:outline-none">Technical error diagnostics</summary>
                <div className="mt-2 font-mono whitespace-pre-wrap break-all max-h-32 overflow-y-auto">
                  {this.state.error.stack || this.state.error.message}
                </div>
              </details>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                id="btn-retry"
                onClick={this.handleReset}
                className="flex-1 px-5 py-3.5 bg-brand-primary text-white rounded-2xl font-bold text-xs uppercase tracking-wider hover:bg-brand-primary/95 shadow-md shadow-brand-primary/10 transition-all flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Retry Connection</span>
              </button>
              <button
                id="btn-gohome"
                onClick={this.handleGoHome}
                className="flex-1 px-5 py-3.5 bg-gray-50 border border-gray-100 text-gray-600 rounded-2xl font-bold text-xs uppercase tracking-wider hover:bg-gray-100 transition-all flex items-center justify-center gap-2"
              >
                <Home className="w-4 h-4" />
                <span>Dashboard</span>
              </button>
            </div>

          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
