import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://auth-api.dev.controlshiftai.com';

// ✨ NEW: Token management for frontend teams
export const TokenManager = {
  // Get tokens from localStorage (what frontend teams want!)
  getTokens() {
    return {
      accessToken: localStorage.getItem('fa_access_token'),
      refreshToken: localStorage.getItem('fa_refresh_token'),
      idToken: localStorage.getItem('fa_id_token')
    };
  },

  // Store tokens in localStorage
  setTokens(tokens: { access_token: string; refresh_token: string; id_token: string }) {
    localStorage.setItem('fa_access_token', tokens.access_token);
    localStorage.setItem('fa_refresh_token', tokens.refresh_token);
    localStorage.setItem('fa_id_token', tokens.id_token);
    console.log('🔑 Tokens stored in localStorage for frontend team!');
  },

  // Clear tokens
  clearTokens() {
    localStorage.removeItem('fa_access_token');
    localStorage.removeItem('fa_refresh_token');
    localStorage.removeItem('fa_id_token');
    console.log('🧹 Tokens cleared from localStorage');
  },

  // ✨ NEW: Check if token is expired
  isTokenExpired(token: string): boolean {
    try {
      const payload = token.split('.')[1];
      if (payload) {
        const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
        const now = Math.floor(Date.now() / 1000);
        return decoded.exp < now;
      }
    } catch (error) {
      console.error('Failed to decode token for expiry check:', error);
      return true; // Assume expired if can't decode
    }
    return true;
  },

  // ✨ NEW: Clean up expired tokens automatically
  cleanupExpiredTokens() {
    const tokens = this.getTokens();
    let hasExpired = false;

    // Check access token
    if (tokens.accessToken && this.isTokenExpired(tokens.accessToken)) {
      localStorage.removeItem('fa_access_token');
      console.log('🧹 Expired access token removed');
      hasExpired = true;
    }

    // Check ID token
    if (tokens.idToken && this.isTokenExpired(tokens.idToken)) {
      localStorage.removeItem('fa_id_token');
      console.log('🧹 Expired ID token removed');
      hasExpired = true;
    }

    // If any token expired, might as well clear refresh token too
    if (hasExpired && tokens.refreshToken) {
      localStorage.removeItem('fa_refresh_token');
      console.log('🧹 Refresh token removed due to expired session');
    }

    return hasExpired;
  },

  // Check if user has valid (non-expired) tokens
  hasValidTokens(): boolean {
    this.cleanupExpiredTokens(); // Clean first
    const tokens = this.getTokens();
    
    if (!tokens.accessToken) return false;
    
    // Double-check it's not expired
    return !this.isTokenExpired(tokens.accessToken);
  },

  // Get user info from ID token (JWT decode)
  getUserInfoFromToken(): Record<string, unknown> | null {
    this.cleanupExpiredTokens(); // Clean first
    const { idToken } = this.getTokens();
    if (idToken) {
      try {
        // Decode JWT payload
        const payload = idToken.split('.')[1];
        if (payload) {
          const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
          return JSON.parse(decoded);
        }
      } catch (error) {
        console.error('Failed to decode ID token:', error);
      }
    }
    return null;
  },

  // Get access token for API calls (what frontend teams need!)
  getAccessToken(): string | null {
    this.cleanupExpiredTokens(); // Clean first
    return this.getTokens().accessToken;
  },

  // ✨ MAIN FUNCTION: Exchange cookies for localStorage tokens
  async exchangeCookiesForTokens(): Promise<boolean> {
    try {
      console.log('🔄 Exchanging cookies for localStorage tokens...');
      
      const response = await fetch(`${API_URL}/api/v1/tokens`, {
        credentials: 'include', // Send cookies to backend
      });

      if (response.ok) {
        const tokens = await response.json();
        this.setTokens(tokens);
        console.log('✅ Tokens successfully stored in localStorage!');
        return true;
      } else {
        console.log('❌ Failed to get tokens - user not authenticated');
        return false;
      }
    } catch (error) {
      console.error('❌ Token exchange failed:', error);
      return false;
    }
  },

  // ✨ NEW: Set up automatic cleanup interval
  startCleanupInterval() {
    // Check for expired tokens every 5 minutes
    setInterval(() => {
      this.cleanupExpiredTokens();
    }, 5 * 60 * 1000); // 5 minutes
    
    console.log('🕒 Token cleanup interval started (every 5 minutes)');
  }
};

// Create axios instance with automatic token headers
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests automatically
api.interceptors.request.use((config) => {
  const token = TokenManager.getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Types
export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  picture?: string;
  roles?: string[];
  email_verified?: boolean;
}

// ✨ UPDATED: Multi-tenant Auth Service for frontend teams
export class AuthService {
  private baseURL: string;

  constructor() {
    this.baseURL = API_URL;
  }

  /**
   * ✨ MULTI-TENANT LOGIN: First step - detect tenant from email
   */
  async initiateLogin(email: string, redirectUri?: string): Promise<{ success: boolean; auth_url?: string; company?: string; message?: string }> {
    try {
      const redirect = redirectUri || window.location.origin;
      
      // ✅ CORRECT: Use POST method with query parameters
      const response = await fetch(`${this.baseURL}/api/v1/login?email=${encodeURIComponent(email)}&frontend_redirect_uri=${encodeURIComponent(redirect)}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          console.log(`✅ Redirecting to ${data.company} login...`);
          return data;
        } else {
          throw new Error(data.message || 'Login failed');
        }
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || `Login failed: ${response.status}`);
      }
    } catch (error) {
      console.error('❌ Login initiation failed:', error);
      throw error;
    }
  }

  /**
   * ✨ LOGIN: Redirect to FusionAuth (after tenant detection)
   */
  login(authUrl: string): void {
    console.log('🚀 Redirecting to FusionAuth login...');
    window.location.href = authUrl;
  }

  /**
   * ✨ LOGOUT: Clear tokens and redirect
   */
  logout(redirectUri?: string): void {
    TokenManager.clearTokens();
    const redirect = redirectUri || window.location.origin;
    window.location.href = `${this.baseURL}/api/v1/logout?redirect_uri=${encodeURIComponent(redirect)}`;
  }

  /**
   * ✨ CHECK AUTH: Try cookies first, then localStorage
   */
  async checkAuth(): Promise<User | null> {
    // First try localStorage tokens
    if (TokenManager.hasValidTokens()) {
      const userInfo = TokenManager.getUserInfoFromToken();
      if (userInfo) {
        return {
          id: userInfo.sub as string,
          email: userInfo.email as string,
          name: userInfo.name as string,
          firstName: userInfo.given_name as string,
          lastName: userInfo.family_name as string,
          picture: userInfo.picture as string,
          email_verified: userInfo.email_verified as boolean,
          roles: userInfo.roles as string[] || []
        };
      }
    }

    // Try to exchange cookies for tokens
    const exchangeSuccess = await TokenManager.exchangeCookiesForTokens();
    if (exchangeSuccess) {
      // Recursively call checkAuth now that we have tokens
      return this.checkAuth();
    }

    // Try direct API call as fallback
    try {
      const response = await fetch(`${this.baseURL}/api/v1/me`, {
        credentials: 'include',
      });

      if (response.ok) {
        const user = await response.json();
        return user;
      }
    } catch (error) {
      console.log('Auth check failed:', error);
    }

    return null;
  }

  /**
   * ✨ INITIALIZE: Call this after login redirect
   */
  async initializeTokens(): Promise<boolean> {
    return await TokenManager.exchangeCookiesForTokens();
  }

  /**
   * ✨ API CALL: Make authenticated requests
   */
  async apiCall(url: string, options: RequestInit = {}): Promise<Response> {
    const token = TokenManager.getAccessToken();
    if (!token) {
      throw new Error('No access token available');
    }

    return fetch(url, {
      ...options,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...options.headers
      }
    });
  }

  /**
   * ✨ REFRESH TOKEN: Get new access token using refresh token
   */
  async refreshToken(): Promise<boolean> {
    try {
      const tokens = TokenManager.getTokens();
      if (!tokens.refreshToken) {
        return false;
      }

      const response = await fetch(`${this.baseURL}/api/v1/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: tokens.refreshToken })
      });

      if (response.ok) {
        const newTokens = await response.json();
        TokenManager.setTokens(newTokens);
        return true;
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
    }
    return false;
  }
}

// Export singleton instance
export const authService = new AuthService();

// ✨ SIMPLE HELPER for frontend teams
export const FrontendAuth = {
  // Check if logged in (with expiry check)
  isLoggedIn: () => TokenManager.hasValidTokens(),
  
  // Get access token (with expiry check)
  getAccessToken: () => TokenManager.getAccessToken(),
  
  // Get all tokens (with cleanup)
  getTokens: () => {
    TokenManager.cleanupExpiredTokens();
    return TokenManager.getTokens();
  },
  
  // Get user info (with expiry check)
  getUserInfo: () => TokenManager.getUserInfoFromToken(),
  
  // Multi-tenant login initiation
  initiateLogin: (email: string) => authService.initiateLogin(email),
  
  // Login (after tenant detection)
  login: (authUrl: string) => authService.login(authUrl),
  
  // Logout with cleanup
  logout: () => {
    TokenManager.clearTokens();
    authService.logout();
  },
  
  // Initialize tokens after login
  initialize: () => authService.initializeTokens(),

  // ✨ NEW: Check if tokens are expired
  areTokensExpired: () => {
    const tokens = TokenManager.getTokens();
    if (!tokens.accessToken) return true;
    return TokenManager.isTokenExpired(tokens.accessToken);
  },

  // ✨ NEW: Manual cleanup
  cleanupExpired: () => TokenManager.cleanupExpiredTokens(),

  // ✨ NEW: Start automatic cleanup (call once on app startup)
  startAutoCleanup: () => TokenManager.startCleanupInterval()
};

 