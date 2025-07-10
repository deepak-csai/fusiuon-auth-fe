import { useAuth } from '../contexts/AuthContext';
import type { ReactNode } from 'react';

interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, login } = useAuth();

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              Loading...
            </h2>
            <p className="text-gray-600">
              Checking authentication status
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Show login required state
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-blue-600 text-xl">🔐</span>
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              Authentication Required
            </h2>
            <p className="text-gray-600 mb-6">
              You need to log in to access this page.
            </p>
            
            <div className="space-y-3">
              <button
                onClick={() => login()}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md font-medium transition-colors"
              >
                Login to Continue
              </button>
            </div>
            
            <div className="mt-6 pt-4 border-t">
              <p className="text-xs text-gray-500 mb-2">
                ✨ Using simplified authentication flow
              </p>
              <div className="text-xs text-gray-400 space-y-1">
                <div>• One-click login with /login</div>
                <div>• Automatic cookie-based authentication</div>
                <div>• No token management required</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // User is authenticated, render protected content
  return <>{children}</>;
} 