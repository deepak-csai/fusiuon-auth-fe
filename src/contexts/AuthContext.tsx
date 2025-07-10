import React, { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { authService } from '../services/api';
import type { User } from '../services/api';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (redirectUri?: string) => void;
  logout: (redirectUri?: string) => Promise<void>;
  completeLogout: (redirectUri?: string) => Promise<void>;
  clearError: () => void;
  refetchUser: () => Promise<void>;
  accessToken: string | null;
  refreshToken: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check authentication status and load user
  const loadUser = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Check if we have tokens in cookies or localStorage
      const isAuth = authService.isAuthenticated();
      
      if (isAuth) {
        // Try to get user info using cookie-based auth
        const userData = await authService.getCurrentUser();
        setUser(userData);
      } else {
        // In development, try to exchange tokens after potential login redirect
        const isDev = import.meta.env.DEV;
        if (isDev && window.location.search.includes('login=success')) {
          // Remove the query parameter
          window.history.replaceState({}, '', window.location.pathname);
          
          // Try to exchange tokens
          const tokenExchanged = await authService.handlePostLoginTokenExchange();
          if (tokenExchanged) {
            // Try again to load user with new tokens
            const userData = await authService.getCurrentUser();
            setUser(userData);
            return;
          }
        }
        
        setUser(null);
      }
    } catch (err) {
      console.error('Failed to load user:', err);
      setError('Failed to load user information');
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Initialize auth state on mount
  useEffect(() => {
    loadUser();
  }, []);

  // Login function - redirects to API /login endpoint
  const login = (redirectUri?: string) => {
    try {
      setError(null);
      
      // The redirect URI should be where we want to go AFTER login
      const finalRedirectUri = redirectUri || window.location.origin;
      
      // Build API login URL - this will handle the full OAuth flow
      const API_URL = import.meta.env.VITE_API_URL || 'https://auth-api.dev.controlshiftai.com';
      const params = new URLSearchParams();
      params.append('redirect_uri', finalRedirectUri);
      
      const loginUrl = `${API_URL}/api/v1/login?${params.toString()}`;
      
      console.log('🔗 Redirecting to API login:', loginUrl);
      console.log('🏠 Will redirect back to:', finalRedirectUri);
      
      // Redirect to API login endpoint
      window.location.href = loginUrl;
    } catch (err) {
      console.error('Login failed:', err);
      setError('Login failed. Please try again.');
    }
  };

  // Logout function - cookie-based logout
  const logout = async (redirectUri?: string) => {
    try {
      setError(null);
      await authService.logout(redirectUri);
      setUser(null);
    } catch (err) {
      console.error('Logout failed:', err);
      setError('Logout failed. Please try again.');
    }
  };

  // Complete logout function - clears all sessions
  const completeLogout = async (redirectUri?: string) => {
    try {
      setError(null);
      await authService.completeLogout(redirectUri);
      setUser(null);
    } catch (err) {
      console.error('Complete logout failed:', err);
      setError('Logout failed. Please try again.');
    }
  };

  // Clear error function
  const clearError = () => {
    setError(null);
  };

  // Refetch user function
  const refetchUser = async () => {
    await loadUser();
  };

  // Get tokens from cookies
  const accessToken = authService.getAccessToken();
  const refreshToken = authService.getRefreshToken();
  const isAuthenticated = authService.isAuthenticated();

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    logout,
    completeLogout,
    clearError,
    refetchUser,
    accessToken,
    refreshToken,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 