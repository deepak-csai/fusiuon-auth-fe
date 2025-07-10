import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://auth-api.dev.controlshiftai.com';

// Check if we're in development with cross-domain setup
const isDevelopmentCrossDomain = import.meta.env.DEV && 
  (import.meta.env.VITE_API_URL?.includes('auth-api.dev.controlshiftai.com') || 
   (!import.meta.env.VITE_API_URL && window.location.hostname === 'localhost'));

// Utility function to get cookie value
function getCookie(name: string): string | null {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
}

// Utility function to get access token from cookie OR localStorage
function getAccessTokenFromCookie(): string | null {
  if (isDevelopmentCrossDomain) {
    // In development, try localStorage first, then cookies
    return localStorage.getItem('fa_access_token') || getCookie('fa_access_token');
  }
  return getCookie('fa_access_token');
}

// Utility function to get refresh token from cookie OR localStorage
function getRefreshTokenFromCookie(): string | null {
  if (isDevelopmentCrossDomain) {
    // In development, try localStorage first, then cookies
    return localStorage.getItem('fa_refresh_token') || getCookie('fa_refresh_token');
  }
  return getCookie('fa_refresh_token');
}

// Utility function to set tokens in localStorage for development
function setTokensInLocalStorage(accessToken: string, refreshToken: string) {
  if (isDevelopmentCrossDomain) {
    localStorage.setItem('fa_access_token', accessToken);
    localStorage.setItem('fa_refresh_token', refreshToken);
    console.log('🔑 Tokens stored in localStorage for development');
  }
}

// Utility function to clear tokens from localStorage
function clearTokensFromLocalStorage() {
  if (isDevelopmentCrossDomain) {
    localStorage.removeItem('fa_access_token');
    localStorage.removeItem('fa_refresh_token');
    console.log('🧹 Tokens cleared from localStorage');
  }
}

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Important: Send cookies with requests
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to automatically add Authorization header when token is available
api.interceptors.request.use((config) => {
  // For token-based endpoints, add Authorization header
  const tokenBasedEndpoints = ['/api/v1/user', '/api/v1/validate', '/api/v1/tokens', '/api/v1/refresh'];
  const isTokenBasedEndpoint = tokenBasedEndpoints.some(endpoint => config.url?.includes(endpoint));
  
  if (isTokenBasedEndpoint) {
    const token = getAccessTokenFromCookie();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  
  return config;
});

// Types
export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  username?: string;
  roles?: string[];
  registrations?: any[];
  verified?: boolean;
  active?: boolean;
  insertInstant?: number;
  lastLoginInstant?: number;
  lastUpdateInstant?: number;
  passwordChangeRequired?: boolean;
  passwordLastUpdateInstant?: number;
  tenantId?: string;
  usernameStatus?: string;
  twoFactorEnabled?: boolean;
  connectorId?: string;
  encryptionScheme?: string;
  factor?: number;
  salt?: string;
  memberships?: any[];
  imageUrl?: string;
  data?: Record<string, any>;
  preferredLanguages?: string[];
  timezone?: string;
  locale?: string;
  birthDate?: string;
  cleanSpeakId?: string;
  mobilePhone?: string;
  parentalConsentType?: string;
  parentEmail?: string;
  uniqueUsername?: string;
}

export interface AuthResponse {
  message: string;
  login_url?: string;
  state?: string;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  scope?: string;
}

export interface ApiError {
  detail: string;
  status_code: number;
  error_code?: string;
  timestamp?: string;
  path?: string;
}

// Auth Service Class
export class AuthService {
  private baseURL: string;

  constructor() {
    this.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
  }

  /**
   * ✨ SIMPLIFIED LOGIN - Just redirect to backend
   * No token management needed!
   */
  login(redirectUri?: string): void {
    const redirect = redirectUri || window.location.origin;
    window.location.href = `${this.baseURL}/api/v1/login?redirect_uri=${encodeURIComponent(redirect)}`;
  }

  /**
   * ✨ CHECK AUTH STATUS - Using cookies automatically
   * No headers needed!
   */
  async checkAuth(): Promise<User | null> {
    try {
      const response = await fetch(`${this.baseURL}/api/v1/me`, {
        credentials: 'include', // Important: sends cookies
      });

      if (response.ok) {
        const user = await response.json();
        return user;
      }
      return null;
    } catch (error) {
      console.log('Not authenticated');
      return null;
    }
  }

  /**
   * ✨ SIMPLIFIED LOGOUT - Just redirect to backend
   */
  logout(redirectUri?: string): void {
    const redirect = redirectUri || window.location.origin;
    window.location.href = `${this.baseURL}/api/v1/logout?redirect_uri=${encodeURIComponent(redirect)}`;
  }

  /**
   * 🧪 TEST: Get user info (same as checkAuth, but different endpoint)
   * This uses the same cookie-based authentication
   */
  async getUserInfo(): Promise<User | null> {
    try {
      const response = await fetch(`${this.baseURL}/api/v1/me`, {
        credentials: 'include',
      });

      if (response.ok) {
        return await response.json();
      }
      return null;
    } catch (error) {
      console.error('Failed to get user info:', error);
      return null;
    }
  }

  /**
   * 🔧 OPTIONAL: Get OAuth URL for manual handling
   * (Most apps won't need this - use login() instead)
   */
  async getOAuthUrl(redirectUri?: string): Promise<string> {
    const redirect = redirectUri || window.location.origin;
    const response = await fetch(
      `${this.baseURL}/api/v1/oauth-url?redirect_uri=${encodeURIComponent(redirect)}`
    );
    const data = await response.json();
    return data.oauth_url;
  }

  // Remove all the old localStorage token methods - not needed anymore!
  // No more: storeTokens, getStoredTokens, clearTokens, etc.
}

// Export singleton instance
export const authService = new AuthService();

// Export utility functions
export { getAccessTokenFromCookie, getRefreshTokenFromCookie, getCookie }; 