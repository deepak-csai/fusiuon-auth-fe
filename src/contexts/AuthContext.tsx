import React, { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { AuthService } from '../services/api';
import type { User } from '../services/api';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (redirectUri?: string) => void;
  logout: (redirectUri?: string) => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const authService = new AuthService();

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // ✨ SIMPLIFIED: Check auth status using cookies
  const checkAuth = async () => {
    setIsLoading(true);
    try {
      const userData = await authService.checkAuth();
      setUser(userData);
    } catch (error) {
      console.log('Auth check failed:', error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  // ✨ SIMPLIFIED: Login just redirects - no token management!
  const login = (redirectUri?: string) => {
    authService.login(redirectUri);
  };

  // ✨ SIMPLIFIED: Logout just redirects - backend handles everything!
  const logout = (redirectUri?: string) => {
    authService.logout(redirectUri);
  };

  // Refresh user data
  const refreshUser = async () => {
    await checkAuth();
  };

  // Check auth on mount
  useEffect(() => {
    checkAuth();
  }, []);

  // ✨ MUCH SIMPLER: No complex token logic!
  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 