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
    const [email, setEmail] = useState('');
    const [testLoading, setTestLoading] = useState(false);
    
    const addResult = (message: string) => {
      setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
    };

    const testMultiTenantLogin = async () => {
      if (!email.trim()) {
        addResult("❌ Please enter an email address first");
        return;
      }

      addResult("🔄 Testing multi-tenant login flow...");
      setTestLoading(true);
      
      const apiUrl = import.meta.env.VITE_API_URL || 'https://auth-api.dev.controlshiftai.com';
      const redirectUri = window.location.origin;
      
      addResult(`📍 API URL: ${apiUrl}`);
      addResult(`🏠 Redirect URI: ${redirectUri}`);
      addResult(`📧 Email: ${email}`);
      
      try {
        const response = await fetch(`${apiUrl}/api/v1/login?email=${encodeURIComponent(email)}&frontend_redirect_uri=${encodeURIComponent(redirectUri)}`);
        
        if (response.ok) {
          const data = await response.json();
          addResult(`✅ Company detected: ${data.company}`);
          addResult(`🔗 Auth URL: ${data.auth_url}`);
          addResult(`📝 Message: ${data.message}`);
          addResult("🚀 Redirecting to FusionAuth in 3 seconds...");
          
          setTimeout(() => {
            window.location.href = data.auth_url;
          }, 3000);
        } else {
          const errorData = await response.json();
          addResult(`❌ Login failed: ${response.status} - ${errorData.message || 'Unknown error'}`);
        }
      } catch (error) {
        addResult(`❌ Network error: ${error}`);
      } finally {
        setTestLoading(false);
      }
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

      try {
        // Test /tokens endpoint
        const tokensResponse = await fetch(`${apiUrl}/api/v1/tokens`, {
          credentials: 'include'
        });
        addResult(`🔑 /tokens endpoint: ${tokensResponse.status}`);
      } catch (error) {
        addResult(`❌ /tokens endpoint error: ${error}`);
      }
    };

    const testTokenExchange = async () => {
      addResult("🔄 Testing token exchange...");
      const apiUrl = import.meta.env.VITE_API_URL || 'https://auth-api.dev.controlshiftai.com';
      
      try {
        const response = await fetch(`${apiUrl}/api/v1/tokens`, {
          credentials: 'include'
        });
        
        if (response.ok) {
          const tokens = await response.json();
          addResult(`✅ Token exchange successful!`);
          addResult(`🔑 Access token: ${tokens.access_token ? 'Present' : 'Missing'}`);
          addResult(`🔄 Refresh token: ${tokens.refresh_token ? 'Present' : 'Missing'}`);
          addResult(`🆔 ID token: ${tokens.id_token ? 'Present' : 'Missing'}`);
        } else {
          const errorText = await response.text();
          addResult(`❌ Token exchange failed: ${response.status} - ${errorText}`);
        }
      } catch (error) {
        addResult(`❌ Token exchange error: ${error}`);
      }
    };

    return (
      <div>
        <Navigation />
        <div className="max-w-4xl mx-auto p-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">
              🔍 Multi-Tenant OAuth Flow Debug
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

              {/* Multi-Tenant Login Test */}
              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Multi-Tenant Login Test</h3>
                <div className="bg-blue-50 p-4 rounded">
                  <div className="flex space-x-3 mb-3">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="user@company.com"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={testMultiTenantLogin}
                      disabled={testLoading || !email.trim()}
                      className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white px-4 py-2 rounded-md text-sm font-medium"
                    >
                      {testLoading ? 'Testing...' : 'Test Login'}
                    </button>
                  </div>
                  <p className="text-xs text-blue-700">
                    Enter an email to test the multi-tenant login flow. The system will detect the company and redirect to the appropriate FusionAuth instance.
                  </p>
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
                    onClick={testAPIEndpoints}
                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded font-medium"
                  >
                    📡 Test API Endpoints
                  </button>
                  
                  <button
                    onClick={testTokenExchange}
                    className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded font-medium"
                  >
                    🔑 Test Token Exchange
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
                <h3 className="text-lg font-semibold text-gray-700 mb-2">✨ Multi-Tenant OAuth Flow</h3>
                <div className="bg-green-50 p-4 rounded text-sm">
                  <ol className="list-decimal list-inside space-y-2">
                    <li>User enters email in React app</li>
                    <li>React app calls <code>POST /api/v1/login?email=user@company.com</code></li>
                    <li>Backend detects company from email domain</li>
                    <li>Backend returns <code>auth_url</code> for company's FusionAuth instance</li>
                    <li>React app redirects to <code>auth_url</code></li>
                    <li>User completes OAuth login at FusionAuth</li>
                    <li>FusionAuth redirects back to backend <code>/api/v1/oauth-redirect</code></li>
                    <li>Backend exchanges code for tokens and sets HTTPOnly cookies</li>
                    <li>Backend redirects back to React app</li>
                    <li>React app calls <code>/api/v1/me</code> with cookies and shows authenticated state</li>
                  </ol>
                  <div className="mt-3 pt-3 border-t">
                    <p className="font-medium text-green-800">✅ What's New:</p>
                    <ul className="list-disc list-inside mt-1 text-green-700">
                      <li>Multi-tenant support with automatic company detection</li>
                      <li>Email-first login flow</li>
                      <li>Company-specific FusionAuth instances</li>
                      <li>Cross-domain cookie support</li>
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