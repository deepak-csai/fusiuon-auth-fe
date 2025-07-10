import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

export function UserProfile() {
  const { user, isAuthenticated, refreshUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userInfo, setUserInfo] = useState<any>(null);

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-yellow-800 mb-2">
              Authentication Required
            </h2>
            <p className="text-yellow-700">
              Please log in to view your profile.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const handleRefreshUser = async () => {
    try {
      setLoading(true);
      setError(null);
      await refreshUser();
    } catch (err) {
      setError('Failed to refresh user data');
      console.error('User refresh error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTestUserInfo = async () => {
    try {
      setLoading(true);
      setError(null);
      const apiUrl = import.meta.env.VITE_API_URL || 'https://auth-api.dev.controlshiftai.com';
      const response = await fetch(`${apiUrl}/api/v1/me`, {
        credentials: 'include',
      });
      
      if (response.ok) {
        const userData = await response.json();
        setUserInfo(userData);
      } else {
        setError(`Failed to get user info: ${response.status}`);
      }
    } catch (err) {
      setError('Failed to test user info endpoint');
      console.error('User info test error:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp?: number) => {
    if (!timestamp) return 'N/A';
    return new Date(timestamp).toLocaleString();
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
          <h1 className="text-3xl font-bold text-gray-900">User Profile</h1>
          <p className="mt-2 text-lg text-gray-600">
            Manage your account information and preferences
          </p>
        </div>
        
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Header */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center space-x-6">
                <div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-2xl font-medium">
                    {user.firstName?.charAt(0) || user.email?.charAt(0) || '?'}
                  </span>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {user.firstName && user.lastName 
                      ? `${user.firstName} ${user.lastName}`
                      : user.fullName || user.email
                    }
                  </h2>
                  <p className="text-gray-600">{user.email}</p>
                  <div className="flex items-center mt-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      ✓ Verified Account
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Personal Information */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6 border-b pb-2">
                Personal Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">User ID</label>
                  <p className="text-sm text-gray-900 font-mono bg-gray-50 p-3 rounded border">
                    {user.id}
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Email Address</label>
                  <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded border">{user.email}</p>
                </div>
                
                {user.firstName && (
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">First Name</label>
                    <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded border">{user.firstName}</p>
                  </div>
                )}
                
                {user.lastName && (
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Last Name</label>
                    <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded border">{user.lastName}</p>
                  </div>
                )}
                
                {user.username && (
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Username</label>
                    <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded border">{user.username}</p>
                  </div>
                )}
                
                {user.fullName && (
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Full Name</label>
                    <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded border">{user.fullName}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Account Details */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6 border-b pb-2">
                Account Activity
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {user.insertInstant && (
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Account Created</label>
                    <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded border">{formatDate(user.insertInstant)}</p>
                  </div>
                )}
                
                {user.lastUpdateInstant && (
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Last Updated</label>
                    <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded border">{formatDate(user.lastUpdateInstant)}</p>
                  </div>
                )}
                
                {user.lastLoginInstant && (
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Last Login</label>
                    <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded border">{formatDate(user.lastLoginInstant)}</p>
                  </div>
                )}
                
                {user.passwordLastUpdateInstant && (
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Password Updated</label>
                    <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded border">{formatDate(user.passwordLastUpdateInstant)}</p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Account Status</label>
                  <div className="flex items-center">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {user.verified ? '✓ Verified' : '⚠ Not Verified'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* API Test Results */}
            {userInfo && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  API Test Results
                </h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <pre className="text-xs text-gray-800 overflow-auto max-h-64">
                    {JSON.stringify(userInfo, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Actions */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Profile Actions
              </h3>
              <div className="space-y-3">
                <button
                  onClick={handleRefreshUser}
                  disabled={loading}
                  className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  ) : (
                    <span className="mr-2">🔄</span>
                  )}
                  Refresh User Data
                </button>
                
                <button
                  onClick={handleTestUserInfo}
                  disabled={loading}
                  className="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  ) : (
                    <span className="mr-2">📡</span>
                  )}
                  Test /me Endpoint
                </button>
              </div>
            </div>

            {/* Navigation */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Quick Navigation
              </h3>
              <div className="space-y-3">
                <button
                  onClick={() => navigate('/dashboard')}
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-3 rounded-lg font-medium transition-colors text-left"
                >
                  📊 Dashboard
                </button>
                <button
                  onClick={() => navigate('/')}
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-3 rounded-lg font-medium transition-colors text-left"
                >
                  🏠 Home
                </button>
              </div>
            </div>

            {/* Authentication Info */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                ✨ Authentication Info
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center text-green-600">
                  <span className="mr-2">✓</span>
                  <span>Simplified OAuth flow</span>
                </div>
                <div className="flex items-center text-green-600">
                  <span className="mr-2">✓</span>
                  <span>Cookie-based session</span>
                </div>
                <div className="flex items-center text-green-600">
                  <span className="mr-2">✓</span>
                  <span>Automatic token refresh</span>
                </div>
                <div className="flex items-center text-green-600">
                  <span className="mr-2">✓</span>
                  <span>Secure HTTPOnly cookies</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 