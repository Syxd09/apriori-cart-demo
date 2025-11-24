import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { handleError, AppError } from '@/lib/errorHandler';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: AppError | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { 
      hasError: true, 
      error: handleError(error, 'ErrorBoundary') 
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
    // We could log this to an error reporting service here
  }

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
          <Card className="w-full max-w-md shadow-lg border-red-100">
            <CardHeader className="text-center pb-2">
              <div className="mx-auto bg-red-100 p-3 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
              <CardTitle className="text-xl text-red-700">Something went wrong</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-2">
              <p className="text-gray-600">
                We encountered an unexpected error. Our team has been notified.
              </p>
              {this.state.error && (
                <div className="bg-gray-100 p-3 rounded text-sm font-mono text-left overflow-auto max-h-32 mt-4 text-gray-700 border border-gray-200">
                  {this.state.error.message}
                </div>
              )}
            </CardContent>
            <CardFooter className="justify-center pt-2">
              <Button onClick={this.handleReload} className="gap-2">
                <RefreshCw className="h-4 w-4" />
                Reload Application
              </Button>
            </CardFooter>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}