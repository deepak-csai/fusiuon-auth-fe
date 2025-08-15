import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService, TokenManager } from '../services/api';
import type { User } from '../services/api';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  // ✨ NEW: Multi-tenant login flow
  initiateLogin: (email: string, redirectUri?: string) => Promise<void>;
  login: (authUrl: string) => void;
  logout: (redirectUri?: string) => void;
  refreshUser: () => Promise<void>;
  // ✨ NEW: Token access for frontend teams
  getAccessToken: () => string | null;
  getTokens: () => { accessToken: string | null; refreshToken: string | null; idToken: string | null };
  getUserInfoFromToken: () => Record<string, unknown> | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // ✨ Check auth status using both cookies and localStorage
  const checkAuth = async () => {
    setIsLoading(true);
    try {
      // Try to get tokens first (this will exchange cookies if needed)
      const userData = await authService.checkAuth();
      setUser(userData);
      
      if (userData) {
        console.log('✅ User authenticated via tokens:', userData);
        console.log('🔑 Access token available:', !!TokenManager.getAccessToken());
      }
    } catch (error) {
      console.log('Auth check failed:', error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  // ✨ NEW: Multi-tenant login initiation
  const initiateLogin = async (email: string, redirectUri?: string) => {
    try {
      console.log(`🔄 Initiating login for email: ${email}`);
      const loginData = await authService.initiateLogin(email, redirectUri);
      
      if (loginData.success && loginData.auth_url) {
        console.log(`✅ Tenant detected: ${loginData.company}`);
        console.log(`🚀 Redirecting to FusionAuth...`);
        // Redirect to FusionAuth login
        window.location.href = loginData.auth_url;
      } else {
        throw new Error(loginData.message || 'Login initiation failed');
      }
    } catch (error) {
      console.error('❌ Login initiation failed:', error);
      throw error;
    }
  };

  // ✨ Login with automatic token initialization (after tenant detection)
  const login = (authUrl: string) => {
    authService.login(authUrl);
  };

  // ✨ Logout with token cleanup
  const logout = (redirectUri?: string) => {
    authService.logout(redirectUri);
    setUser(null);
  };

  // Refresh user data
  const refreshUser = async () => {
    await checkAuth();
  };

  // ✨ Token access methods for frontend teams
  const getAccessToken = () => TokenManager.getAccessToken();
  const getTokens = () => TokenManager.getTokens();
  const getUserInfoFromToken = () => TokenManager.getUserInfoFromToken();

  // Check auth on mount and after URL changes (for login redirects)
  useEffect(() => {
    checkAuth();
    
    // Listen for URL changes (after login redirect)
    const handleUrlChange = () => {
      // Small delay to allow cookie setting
      setTimeout(checkAuth, 500);
    };
    
    window.addEventListener('popstate', handleUrlChange);
    return () => window.removeEventListener('popstate', handleUrlChange);
  }, []);

  // ✨ Initialize tokens after page loads (for login redirect handling)
  useEffect(() => {
    const initializeAfterLogin = async () => {
      // Check if we just returned from login
      const urlParams = new URLSearchParams(window.location.search);
      const hasLoginParam = urlParams.has('code') || urlParams.has('state');
      
      if (hasLoginParam || (!user && !TokenManager.hasValidTokens())) {
        console.log('🔄 Initializing tokens after login redirect...');
        const success = await authService.initializeTokens();
        if (success) {
          console.log('✅ Tokens initialized successfully!');
          await checkAuth();
        }
      }
    };

    // Only run this after initial auth check
    if (!isLoading) {
      initializeAfterLogin();
    }
  }, [isLoading, user]);

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    // ✨ NEW: Multi-tenant login methods
    initiateLogin,
    login,
    logout,
    refreshUser,
    // ✨ NEW: Token methods for frontend teams
    getAccessToken,
    getTokens,
    getUserInfoFromToken,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Note: FrontendAuth and TokenManager are available from '../services/api' 