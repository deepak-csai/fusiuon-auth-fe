import { useState, useEffect } from 'react';
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

  // Debug page
  const DebugPage = () => {
    const [testResults, setTestResults] = useState<string[]>([]);
    
    const addResult = (message: string) => {
      setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
    };

    const testOAuthFlow = async () => {
      addResult("🔄 Starting OAuth flow test...");
      
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
                  onClick={testOAuthFlow}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded font-medium"
                >
                  🔄 Test OAuth Flow
                </button>
                
                <button
                  onClick={testAPIEndpoints}
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded font-medium"
                >
                  📡 Test API Endpoints
                </button>
                
                <button
                  onClick={() => {
                    document.cookie.split(";").forEach(cookie => {
                      const eqPos = cookie.indexOf("=");
                      const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
                      document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
                    });
                    addResult("🧹 Cleared all cookies");
                    window.location.reload();
                  }}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded font-medium"
                >
                  🧹 Clear Cookies
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
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Expected OAuth Flow</h3>
              <div className="bg-blue-50 p-4 rounded text-sm">
                <ol className="list-decimal list-inside space-y-2">
                  <li>React app redirects to <code>https://auth-api.dev.controlshiftai.com/api/v1/login</code></li>
                  <li>API redirects to FusionAuth with PKCE challenge</li>
                  <li>User completes login at FusionAuth</li>
                  <li>FusionAuth redirects back to <code>https://auth-api.dev.controlshiftai.com/api/v1/oauth-redirect</code></li>
                  <li>API exchanges code for tokens and sets cookies</li>
                  <li>API redirects back to React app</li>
                  <li>React app sees cookies and shows authenticated state</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Home page content
  const HomePage = () => (
    <div className="max-w-4xl mx-auto p-6">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-6">
          🔐 FusionAuth Integration Test
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Welcome to the FusionAuth authentication testing application!
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              🍪 Cookie-Based Auth
            </h2>
            <p className="text-gray-600 mb-4">
              Secure authentication using HTTPOnly cookies. Perfect for web applications.
            </p>
            <ul className="text-left text-gray-600 space-y-2">
              <li>✅ Automatic session management</li>
              <li>✅ XSS protection</li>
              <li>✅ Browser handles cookies</li>
              <li>✅ No manual token management</li>
            </ul>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              🎫 Token-Based Auth
            </h2>
            <p className="text-gray-600 mb-4">
              JWT tokens for API authentication. Perfect for mobile and SPA applications.
            </p>
            <ul className="text-left text-gray-600 space-y-2">
              <li>✅ Stateless authentication</li>
              <li>✅ Works across domains</li>
              <li>✅ Mobile-friendly</li>
              <li>✅ Microservices compatible</li>
            </ul>
          </div>
        </div>
        
        <div className="bg-blue-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-blue-800 mb-2">
            Ready to test?
          </h3>
          <p className="text-blue-700 mb-4">
            Click the login button above to start the authentication flow.
          </p>
          <div className="text-sm text-blue-600">
            <p>🔄 OAuth2 + PKCE flow</p>
            <p>🔐 FusionAuth integration</p>
            <p>⚡ Automatic token refresh</p>
          </div>
        </div>
        
        <div className="mt-6">
          <button
            onClick={() => window.history.pushState({}, '', '/debug')}
            className="text-blue-500 hover:text-blue-700 text-sm underline"
          >
            🔍 Debug OAuth Flow
          </button>
        </div>
      </div>
    </div>
  );

  // Route handling
  switch (currentPath) {
    case '/dashboard':
      return (
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      );
    case '/profile':
      return (
        <ProtectedRoute>
          <UserProfile />
        </ProtectedRoute>
      );
    case '/debug':
      return <DebugPage />;
    default:
      return <HomePage />;
  }
} 