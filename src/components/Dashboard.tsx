import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { authService } from '../services/api';

export function Dashboard() {
  const { user } = useAuth();
  const [apiTest, setApiTest] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [tokenTest, setTokenTest] = useState<string>('');

  const testApiEndpoint = async () => {
    try {
      setLoading(true);
      const userData = await authService.getCurrentUser();
      setApiTest(`✅ API Test Successful! Retrieved user: ${userData.email}`);
    } catch (error) {
      setApiTest(`❌ API Test Failed: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const testWithToken = async () => {
    try {
      setLoading(true);
      const token = prompt('Enter your access token for testing:');
      if (!token) {
        setTokenTest('❌ No token provided');
        return;
      }
      
      const userData = await authService.getUserWithToken(token);
      setTokenTest(`✅ Token Test Successful! Retrieved user: ${userData.email}`);
    } catch (error) {
      setTokenTest(`❌ Token Test Failed: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          Protected Dashboard
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Welcome Section */}
          <div className="bg-blue-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-800 mb-3">
              Welcome back!
            </h3>
            <p className="text-blue-700 mb-4">
              Hello {user?.firstName || user?.email}! This is a protected page that only authenticated users can see.
            </p>
            <div className="text-sm text-blue-600">
              <p>🔐 This content is protected by authentication</p>
              <p>🍪 Using cookie-based authentication</p>
              <p>🔄 Automatic token refresh</p>
            </div>
          </div>

          {/* API Test Section */}
          <div className="bg-green-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-green-800 mb-3">
              API Test
            </h3>
            <p className="text-green-700 mb-4">
              Test the `/me` endpoint to verify your authentication is working.
            </p>
            <div className="space-y-3">
              <button
                onClick={testApiEndpoint}
                disabled={loading}
                className="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white px-4 py-2 rounded font-medium transition-colors"
              >
                {loading ? 'Testing...' : 'Test Cookie Auth'}
              </button>
              
              <button
                onClick={testWithToken}
                disabled={loading}
                className="w-full bg-purple-500 hover:bg-purple-600 disabled:bg-gray-300 text-white px-4 py-2 rounded font-medium transition-colors"
              >
                {loading ? 'Testing...' : 'Test Token Auth'}
              </button>
            </div>
            
            {apiTest && (
              <div className="text-sm bg-white p-3 rounded border mt-3">
                <strong>Cookie Test:</strong><br/>
                {apiTest}
              </div>
            )}
            
            {tokenTest && (
              <div className="text-sm bg-white p-3 rounded border mt-3">
                <strong>Token Test:</strong><br/>
                {tokenTest}
              </div>
            )}
          </div>
        </div>

        {/* Cross-Domain Info */}
        <div className="mt-8 pt-6 border-t">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-yellow-800 mb-2">
              🍪 Cross-Domain Cookie Note
            </h3>
            <p className="text-yellow-700 text-sm mb-2">
              If you're getting 401 errors, it's likely due to cross-domain cookies.
            </p>
            <div className="text-sm text-yellow-600">
              <p><strong>To test properly:</strong></p>
              <ol className="list-decimal list-inside mt-1 space-y-1">
                <li>Login via the main login button in navigation</li>
                <li>Or use the "Test Token Auth" button above</li>
                <li>Or deploy your React app to the same domain as the API</li>
              </ol>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="mt-8 pt-6 border-t">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">
            Available Features
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-800 mb-2">Cookie Authentication</h4>
              <p className="text-sm text-gray-600">
                Uses HTTPOnly cookies for secure authentication without manual token management.
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-800 mb-2">Token Access</h4>
              <p className="text-sm text-gray-600">
                Get JWT tokens for localStorage storage or API authentication.
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-800 mb-2">Automatic Refresh</h4>
              <p className="text-sm text-gray-600">
                Tokens are automatically refreshed behind the scenes.
              </p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 pt-6 border-t">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">
            Quick Actions
          </h3>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => window.location.href = '/profile'}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded font-medium transition-colors"
            >
              View Profile
            </button>
            <button
              onClick={() => window.location.reload()}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded font-medium transition-colors"
            >
              Refresh Page
            </button>
            <button
              onClick={() => window.open('https://auth.dev.controlshiftai.com/', '_blank')}
              className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded font-medium transition-colors"
            >
              Open FusionAuth
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 