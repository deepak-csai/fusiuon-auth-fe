import { useState, useEffect } from 'react';
import { Navigation } from './Navigation';
import { Home } from './Home';
import { ProtectedRoute } from './ProtectedRoute';
import { Dashboard } from './Dashboard';
import { UserProfile } from './UserProfile';

export function Router() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Debug page (only in development)
  const DebugPage = () => {
    const [testResults, setTestResults] = useState<string[]>([]);
    
    const addResult = (message: string) => {
      setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
    };

    const testSimpleLogin = async () => {
      addResult("🔄 Starting simplified OAuth flow test...");
      
      const apiUrl = import.meta.env.VITE_API_URL || 'https://auth-api.dev.controlshiftai.com';
      const redirectUri = window.location.origin;
      const loginUrl = `${apiUrl}/api/v1/login?redirect_uri=${encodeURIComponent(redirectUri)}`;
      
      addResult(`📍 API URL: ${apiUrl}`);
      addResult(`🏠 Redirect URI: ${redirectUri}`);
      addResult(`🔗 Login URL: ${loginUrl}`);
      addResult("🚀 Redirecting to login...");
      
      // Wait a moment then redirect
      setTimeout(() => {
        window.location.href = loginUrl;
      }, 1000);
    };

    const testAPIEndpoints = async () => {
      addResult("🔄 Testing API endpoints...");
      const apiUrl = import.meta.env.VITE_API_URL || 'https://auth-api.dev.controlshiftai.com';
      
      try {
        // Test if API is reachable
        const response = await fetch(`${apiUrl}/docs`);
        addResult(`✅ API reachable: ${response.status}`);
      } catch (error) {
        addResult(`❌ API unreachable: ${error}`);
      }
      
      try {
        // Test /me endpoint (should fail if not authenticated)
        const meResponse = await fetch(`${apiUrl}/api/v1/me`, {
          credentials: 'include'
        });
        addResult(`📋 /me endpoint: ${meResponse.status}`);
        
        if (meResponse.ok) {
          const userData = await meResponse.json();
          addResult(`✅ User authenticated: ${userData.email}`);
        } else {
          addResult(`❌ Not authenticated: ${meResponse.status}`);
        }
      } catch (error) {
        addResult(`❌ /me endpoint error: ${error}`);
      }
    };

    return (
      <div>
        <Navigation />
        <div className="max-w-4xl mx-auto p-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">
              🔍 OAuth Flow Debug
            </h1>
            
            <div className="space-y-6">
              {/* Current State */}
              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Current State</h3>
                <div className="bg-gray-100 p-4 rounded text-sm space-y-2">
                  <div><strong>URL:</strong> {window.location.href}</div>
                  <div><strong>API URL:</strong> {import.meta.env.VITE_API_URL || 'https://auth-api.dev.controlshiftai.com'}</div>
                  <div><strong>Environment:</strong> {import.meta.env.MODE}</div>
                </div>
              </div>

              {/* Cookies */}
              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Cookies</h3>
                <div className="bg-gray-100 p-4 rounded text-sm max-h-32 overflow-y-auto">
                  {document.cookie ? (
                    <div>
                      {document.cookie.split('; ').map((cookie, index) => (
                        <div key={index} className="mb-1">
                          <span className="font-medium">{cookie.split('=')[0]}:</span> {cookie.split('=')[1]}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-gray-500">No cookies found</div>
                  )}
                </div>
              </div>

              {/* Test Actions */}
              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Test Actions</h3>
                <div className="flex flex-wrap gap-3 mb-4">
                  <button
                    onClick={testSimpleLogin}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded font-medium"
                  >
                    🔄 Test Simple Login
                  </button>
                  
                  <button
                    onClick={testAPIEndpoints}
                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded font-medium"
                  >
                    📡 Test /me Endpoint
                  </button>
                  
                  <button
                    onClick={() => {
                      // Test the exact login URL being generated
                      const apiUrl = import.meta.env.VITE_API_URL || 'https://auth-api.dev.controlshiftai.com';
                      const redirectUri = window.location.origin;
                      const loginUrl = `${apiUrl}/api/v1/login?redirect_uri=${encodeURIComponent(redirectUri)}`;
                      addResult(`🔗 Login URL: ${loginUrl}`);
                      addResult(`🌐 Opening login URL in new tab to check Google login...`);
                      window.open(loginUrl, '_blank');
                    }}
                    className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded font-medium"
                  >
                    🌐 Test Login URL (New Tab)
                  </button>
                  
                  <button
                    onClick={() => {
                      // Check DevTools cookies specifically
                      addResult("🔍 Checking cookies in DevTools...");
                      addResult("📍 Open DevTools → Application → Cookies");
                      addResult("📍 Look for domain: auth-api.dev.controlshiftai.com");
                      addResult("📍 Expected cookies: fa_access_token, fa_refresh_token, fa_id_token");
                      addResult("⚠️  Note: HTTPOnly cookies won't show in document.cookie (security feature)");
                    }}
                    className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded font-medium"
                  >
                    🔍 Cookie Debug Guide
                  </button>
                  
                  <button
                    onClick={() => {
                      const apiUrl = import.meta.env.VITE_API_URL || 'https://auth-api.dev.controlshiftai.com';
                      window.location.href = `${apiUrl}/api/v1/logout?redirect_uri=${encodeURIComponent(window.location.origin)}`;
                    }}
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded font-medium"
                  >
                    🚪 Logout
                  </button>
                  
                  <button
                    onClick={() => window.location.reload()}
                    className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded font-medium"
                  >
                    🔄 Refresh
                  </button>
                </div>
              </div>

              {/* Test Results */}
              {testResults.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">Test Results</h3>
                  <div className="bg-black text-green-400 p-4 rounded text-sm max-h-64 overflow-y-auto font-mono">
                    {testResults.map((result, index) => (
                      <div key={index}>{result}</div>
                    ))}
                  </div>
                </div>
              )}

              {/* Expected Flow */}
              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">✨ Simplified OAuth Flow</h3>
                <div className="bg-green-50 p-4 rounded text-sm">
                  <ol className="list-decimal list-inside space-y-2">
                    <li>React app redirects to <code>https://auth-api.dev.controlshiftai.com/api/v1/login</code></li>
                    <li>API redirects to FusionAuth with PKCE challenge + proper scopes</li>
                    <li>User completes login at FusionAuth</li>
                    <li>FusionAuth redirects back to <code>https://auth-api.dev.controlshiftai.com/api/v1/oauth-redirect</code></li>
                    <li>API exchanges code for tokens (access, refresh, ID) and sets HTTPOnly cookies</li>
                    <li>API redirects back to React app</li>
                    <li>React app calls <code>/api/v1/me</code> with cookies and shows authenticated state</li>
                  </ol>
                  <div className="mt-3 pt-3 border-t">
                    <p className="font-medium text-green-800">✅ What's New:</p>
                    <ul className="list-disc list-inside mt-1 text-green-700">
                      <li>Single login endpoint: <code>/login</code></li>
                      <li>No localStorage token management needed</li>
                      <li>Multi-provider ready (Google, LinkedIn, etc.)</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Route handling with Navigation included
  const renderPage = () => {
    switch (currentPath) {
      case '/dashboard':
        return (
          <div>
            <Navigation />
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          </div>
        );
      case '/profile':
        return (
          <div>
            <Navigation />
            <ProtectedRoute>
              <UserProfile />
            </ProtectedRoute>
          </div>
        );
      case '/debug':
        return import.meta.env.DEV ? <DebugPage /> : (
          <div>
            <Navigation />
            <Home />
          </div>
        );
      default:
        return (
          <div>
            <Navigation />
            <Home />
          </div>
        );
    }
  };

  return <div className="min-h-screen bg-gray-50">{renderPage()}</div>;
} 