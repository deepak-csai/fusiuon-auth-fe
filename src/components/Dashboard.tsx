import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { TokenTest } from './TokenTest';

interface DebugInfo {
  allCookies: string;
  cookieCount: number;
  cookies: Array<{ name: string; value: string }>;
  domain: string;
  port: string;
  protocol: string;
  apiUrl: string | undefined;
  hasFaCookies: boolean;
}

export function Dashboard() {
  const { user, refreshUser } = useAuth();
  const [apiTest, setApiTest] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [debugInfo, setDebugInfo] = useState<DebugInfo | null>(null);

  const testMeEndpoint = async () => {
    try {
      setLoading(true);
      const apiUrl = import.meta.env.VITE_API_URL || 'https://auth-api.dev.controlshiftai.com';
      
      console.log('🔍 Testing /me endpoint...');
      console.log('📍 API URL:', apiUrl);
      console.log('🍪 All cookies:', document.cookie);
      
      const response = await fetch(`${apiUrl}/api/v1/me`, {
        method: 'GET',
        credentials: 'include', // This should send cookies cross-domain
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      console.log('📡 Response status:', response.status);
      console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));
      
      if (response.ok) {
        const userData = await response.json();
        console.log('✅ SUCCESS! User data:', userData);
        setApiTest(`✅ SUCCESS! /me endpoint returned: ${JSON.stringify(userData, null, 2)}`);
        
        // Update the auth context
        await refreshUser();
      } else {
        const errorText = await response.text();
        console.log('❌ ERROR Response body:', errorText);
        setApiTest(`❌ FAILED! /me endpoint returned: ${response.status} ${response.statusText}\nBody: ${errorText}`);
      }
    } catch (error) {
      console.error('❌ NETWORK ERROR:', error);
      setApiTest(`❌ NETWORK ERROR! /me endpoint failed: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const testTokensEndpoint = async () => {
    try {
      setLoading(true);
      const apiUrl = import.meta.env.VITE_API_URL || 'https://auth-api.dev.controlshiftai.com';
      
      console.log('🔍 Testing /tokens endpoint...');
      
      const response = await fetch(`${apiUrl}/api/v1/tokens`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const tokens = await response.json();
        console.log('✅ SUCCESS! Tokens:', tokens);
        setApiTest(`✅ SUCCESS! /tokens endpoint returned: ${JSON.stringify(tokens, null, 2)}`);
      } else {
        const errorText = await response.text();
        console.log('❌ ERROR Response body:', errorText);
        setApiTest(`❌ FAILED! /tokens endpoint returned: ${response.status} ${response.statusText}\nBody: ${errorText}`);
      }
    } catch (error) {
      console.error('❌ NETWORK ERROR:', error);
      setApiTest(`❌ NETWORK ERROR! /tokens endpoint failed: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const debugCookies = () => {
    const allCookies = document.cookie;
    const cookieArray = allCookies.split('; ').map(cookie => {
      const [name, value] = cookie.split('=');
      return { name, value: value?.substring(0, 50) + '...' };
    });
    
    setDebugInfo({
      allCookies: allCookies,
      cookieCount: cookieArray.length,
      cookies: cookieArray,
      domain: window.location.hostname,
      port: window.location.port,
      protocol: window.location.protocol,
      apiUrl: import.meta.env.VITE_API_URL,
      hasFaCookies: allCookies.includes('fa_access_token')
    });
  };

  const testDirectApiCall = async () => {
    try {
      setLoading(true);
      
      // Try direct API call to see what happens
      const response = await fetch('https://auth-api.dev.controlshiftai.com/api/v1/me', {
        method: 'GET',
        credentials: 'include',
        mode: 'cors',
      });
      
      if (response.ok) {
        const data = await response.json();
        setApiTest(`✅ DIRECT API SUCCESS: ${JSON.stringify(data, null, 2)}`);
        // This should trigger AuthContext to update
        await refreshUser();
      } else {
        const errorText = await response.text();
        setApiTest(`❌ DIRECT API FAILED: ${response.status} ${response.statusText}\n${errorText}`);
      }
    } catch (error) {
      setApiTest(`❌ DIRECT API ERROR: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const navigate = (path: string) => {
    window.history.pushState({}, '', path);
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Dashboard - Multi-Tenant Auth Testing 🔑
          </h1>
          <p className="mt-2 text-lg text-gray-600">
            Hello {user?.firstName || user?.email?.split('@')[0] || 'User'}! Test the new multi-tenant authentication system.
          </p>
          <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>✨ New Multi-Tenant Features:</strong> Company detection from email, automatic tenant routing, 
              and cross-domain cookie support.
            </p>
          </div>
        </div>

        {/* ✨ NEW: Token Test Component */}
        <TokenTest />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Current User Info */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                👤 Current User Info (from AuthContext)
              </h3>
              {user ? (
                <div className="bg-green-50 border rounded-lg p-4">
                  <p className="text-green-800 font-medium mb-2">✅ User is authenticated in React!</p>
                  <pre className="text-sm text-gray-800 overflow-auto">
                    {JSON.stringify(user, null, 2)}
                  </pre>
                </div>
              ) : (
                <div className="bg-red-50 border rounded-lg p-4">
                  <p className="text-red-800 font-medium">❌ No user in AuthContext</p>
                  <p className="text-red-600 text-sm">This means the /me call in AuthContext failed or cookies aren't accessible</p>
                </div>
              )}
            </div>

            {/* Debug Testing */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                🧪 Multi-Tenant API Testing
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <button
                  onClick={debugCookies}
                  className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-3 rounded-lg font-medium transition-colors"
                >
                  🍪 Debug Cookies
                </button>
                
                <button
                  onClick={testMeEndpoint}
                  disabled={loading}
                  className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  ) : (
                    <span className="mr-2">📡</span>
                  )}
                  Test /me
                </button>
                
                <button
                  onClick={testTokensEndpoint}
                  disabled={loading}
                  className="bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  ) : (
                    <span className="mr-2">🔑</span>
                  )}
                  Test /tokens
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <button
                  onClick={testDirectApiCall}
                  disabled={loading}
                  className="bg-purple-500 hover:bg-purple-600 disabled:bg-gray-300 text-white px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  ) : (
                    <span className="mr-2">🔗</span>
                  )}
                  Direct API Test
                </button>
              </div>
              
              {apiTest && (
                <div className="bg-gray-50 border rounded-lg p-4 mb-4">
                  <p className="text-sm font-medium text-gray-700 mb-1">API Test Result:</p>
                  <pre className="text-xs text-gray-600 font-mono whitespace-pre-wrap">{apiTest}</pre>
                </div>
              )}

              {debugInfo && (
                <div className="bg-blue-50 border rounded-lg p-4">
                  <p className="text-sm font-medium text-blue-700 mb-2">🔍 Debug Information:</p>
                  <pre className="text-xs text-blue-600 font-mono whitespace-pre-wrap">{JSON.stringify(debugInfo, null, 2)}</pre>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Multi-Tenant Features */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                🏢 Multi-Tenant Features
              </h3>
              <div className="space-y-3 text-sm">
                <div className="bg-blue-50 p-3 rounded">
                  <p className="font-medium text-blue-800">✅ Company Detection:</p>
                  <p className="text-blue-700">Automatic tenant detection from email domain</p>
                </div>
                <div className="bg-green-50 p-3 rounded">
                  <p className="font-medium text-green-800">🔄 Smart Routing:</p>
                  <p className="text-green-700">Routes to company-specific FusionAuth instance</p>
                </div>
                <div className="bg-purple-50 p-3 rounded">
                  <p className="font-medium text-purple-800">🌐 Cross-Domain:</p>
                  <p className="text-purple-700">Works across different domains with CORS support</p>
                </div>
                <div className="bg-yellow-50 p-3 rounded">
                  <p className="font-medium text-yellow-800">🍪 Cookie-Based:</p>
                  <p className="text-yellow-700">Secure HTTPOnly cookies for authentication</p>
                </div>
              </div>
            </div>

            {/* API Endpoints */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                📡 API Endpoints
              </h3>
              <div className="space-y-3 text-sm">
                <div className="bg-gray-50 p-3 rounded">
                  <p className="font-medium text-gray-800">POST /api/v1/login:</p>
                  <p className="text-gray-700">Initiate multi-tenant login with email</p>
                </div>
                <div className="bg-gray-50 p-3 rounded">
                  <p className="font-medium text-gray-800">GET /api/v1/me:</p>
                  <p className="text-gray-700">Get current user info (cookie-based)</p>
                </div>
                <div className="bg-gray-50 p-3 rounded">
                  <p className="font-medium text-gray-800">GET /api/v1/tokens:</p>
                  <p className="text-gray-700">Exchange cookies for localStorage tokens</p>
                </div>
                <div className="bg-gray-50 p-3 rounded">
                  <p className="font-medium text-gray-800">POST /api/v1/refresh:</p>
                  <p className="text-gray-700">Refresh access token</p>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Quick Actions
              </h3>
              <div className="space-y-3">
                <button
                  onClick={() => navigate('/')}
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-3 rounded-lg font-medium transition-colors text-left"
                >
                  🏠 Back to Home
                </button>
                <button
                  onClick={() => window.open('https://auth-api.dev.controlshiftai.com/api/v1/me', '_blank')}
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-3 rounded-lg font-medium transition-colors text-left"
                >
                  🔗 Open /me in New Tab
                </button>
                <button
                  onClick={() => window.open('https://auth-api.dev.controlshiftai.com/docs', '_blank')}
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-3 rounded-lg font-medium transition-colors text-left"
                >
                  📚 View API Docs
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 