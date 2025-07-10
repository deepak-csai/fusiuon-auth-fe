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
  // Cookie-based authentication (cookies sent automatically)
  
  /**
   * Start login process - redirects to FusionAuth
   * Uses cookie-based auth
   */
  async startLogin(redirectUri?: string): Promise<AuthResponse> {
    const params = new URLSearchParams();
    if (redirectUri) {
      params.append('redirect_uri', redirectUri);
    }
    
    const url = `/api/v1/login${params.toString() ? `?${params.toString()}` : ''}`;
    const response = await api.get<AuthResponse>(url);
    return response.data;
  }

  /**
   * Get current user information
   * Uses cookie-based auth (cookies sent automatically)
   */
  async getCurrentUser(): Promise<User> {
    const response = await api.get<User>('/api/v1/me');
    return response.data;
  }

  /**
   * Logout user
   * Uses cookie-based auth
   */
  async logout(redirectUri?: string): Promise<{ message: string }> {
    const params = new URLSearchParams();
    if (redirectUri) {
      params.append('redirect_uri', redirectUri);
    }
    
    const url = `/api/v1/logout${params.toString() ? `?${params.toString()}` : ''}`;
    const response = await api.post(url);
    return response.data;
  }

  /**
   * Complete logout (clears all sessions)
   * Uses cookie-based auth
   */
  async completeLogout(redirectUri?: string): Promise<{ message: string }> {
    const params = new URLSearchParams();
    if (redirectUri) {
      params.append('redirect_uri', redirectUri);
    }
    
    const url = `/api/v1/auth/logout${params.toString() ? `?${params.toString()}` : ''}`;
    const response = await api.post(url);
    return response.data;
  }

  // Token-based authentication (Authorization header required)
  
  /**
   * Get user information using token
   * Uses token-based auth (Authorization header added automatically)
   */
  async getUserWithToken(token?: string): Promise<User> {
    const config = token ? {
      headers: { Authorization: `Bearer ${token}` }
    } : {};
    
    const response = await api.get<User>('/api/v1/user', config);
    return response.data;
  }

  /**
   * Get access and refresh tokens
   * Uses token-based auth (Authorization header added automatically)
   */
  async getTokens(): Promise<TokenResponse> {
    const response = await api.get<TokenResponse>('/api/v1/tokens');
    return response.data;
  }

  /**
   * Validate token
   * Uses token-based auth (Authorization header added automatically)
   */
  async validateToken(token?: string): Promise<{ valid: boolean; user?: User }> {
    const config = token ? {
      headers: { Authorization: `Bearer ${token}` }
    } : {};
    
    const response = await api.get('/api/v1/validate', config);
    return response.data;
  }

  /**
   * Refresh access token
   * Uses token-based auth (Authorization header added automatically)
   */
  async refreshToken(): Promise<TokenResponse> {
    const response = await api.post<TokenResponse>('/api/v1/refresh');
    return response.data;
  }

  // Utility methods
  
  /**
   * Check if user is authenticated (has valid cookies)
   */
  isAuthenticated(): boolean {
    const accessToken = getAccessTokenFromCookie();
    const refreshToken = getRefreshTokenFromCookie();
    return !!(accessToken && refreshToken);
  }

  /**
   * Get access token from cookie
   */
  getAccessToken(): string | null {
    return getAccessTokenFromCookie();
  }

  /**
   * Get refresh token from cookie
   */
  getRefreshToken(): string | null {
    return getRefreshTokenFromCookie();
  }

  /**
   * Clear local authentication state (for debugging)
   */
  clearLocalAuth(): void {
    // Clear localStorage tokens
    clearTokensFromLocalStorage();
    
    // Note: This only clears client-side state, not server-side cookies
    // For complete logout, use logout() or completeLogout()
    document.cookie = 'fa_access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    document.cookie = 'fa_refresh_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
  }

  /**
   * Handle post-login token exchange for development
   * Call this after being redirected back from login
   */
  async handlePostLoginTokenExchange(): Promise<boolean> {
    if (!isDevelopmentCrossDomain) {
      return false; // Not needed in production
    }

    try {
      console.log('🔄 Attempting to get tokens from API...');
      
      // Try to get tokens from the API (using cookies)
      const response = await api.get('/api/v1/tokens');
      const tokens = response.data;
      
      if (tokens.access_token && tokens.refresh_token) {
        setTokensInLocalStorage(tokens.access_token, tokens.refresh_token);
        console.log('✅ Tokens successfully retrieved and stored');
        return true;
      }
      
      console.log('❌ No tokens received from API');
      return false;
    } catch (error) {
      console.log('❌ Failed to get tokens from API:', error);
      return false;
    }
  }
}

// Export singleton instance
export const authService = new AuthService();

// Export utility functions
export { getAccessTokenFromCookie, getRefreshTokenFromCookie, getCookie }; 