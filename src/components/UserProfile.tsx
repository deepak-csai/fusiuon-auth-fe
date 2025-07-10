import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { authService } from '../services/api';
import type { TokenResponse } from '../services/api';

export function UserProfile() {
  const { user, isAuthenticated, refreshUser, completeLogout } = useAuth();
  const [tokens, setTokens] = useState<TokenResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isAuthenticated || !user) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h2 className="text-lg font-semibold text-yellow-800 mb-2">
            Authentication Required
          </h2>
          <p className="text-yellow-700">
            Please log in to view your profile.
          </p>
        </div>
      </div>
    );
  }

  const handleGetTokens = async () => {
    try {
      setLoading(true);
      setError(null);
      const tokenData = await authService.getTokens();
      setTokens(tokenData);
    } catch (err) {
      setError('Failed to retrieve tokens');
      console.error('Token retrieval error:', err);
    } finally {
      setLoading(false);
    }
  };

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

  const handleCompleteLogout = async () => {
    try {
      setLoading(true);
      setError(null);
      await completeLogout();
    } catch (err) {
      setError('Failed to complete logout');
      console.error('Complete logout error:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp?: number) => {
    if (!timestamp) return 'N/A';
    return new Date(timestamp).toLocaleString();
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">User Profile</h2>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* User Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">
              Personal Information
            </h3>
            
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-600">ID</label>
                <p className="text-sm text-gray-800 font-mono bg-gray-100 p-2 rounded">
                  {user.id}
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-600">Email</label>
                <p className="text-sm text-gray-800">{user.email}</p>
              </div>
              
              {user.firstName && (
                <div>
                  <label className="block text-sm font-medium text-gray-600">First Name</label>
                  <p className="text-sm text-gray-800">{user.firstName}</p>
                </div>
              )}
              
              {user.lastName && (
                <div>
                  <label className="block text-sm font-medium text-gray-600">Last Name</label>
                  <p className="text-sm text-gray-800">{user.lastName}</p>
                </div>
              )}
              
              {user.username && (
                <div>
                  <label className="block text-sm font-medium text-gray-600">Username</label>
                  <p className="text-sm text-gray-800">{user.username}</p>
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-600">Status</label>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    user.active 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {user.active ? 'Active' : 'Inactive'}
                  </span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    user.verified 
                      ? 'bg-blue-100 text-blue-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {user.verified ? 'Verified' : 'Unverified'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Account Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">
              Account Details
            </h3>
            
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-600">Created</label>
                <p className="text-sm text-gray-800">{formatDate(user.insertInstant)}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-600">Last Login</label>
                <p className="text-sm text-gray-800">{formatDate(user.lastLoginInstant)}</p>
              </div>
              
              {user.roles && user.roles.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-600">Roles</label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {user.roles.map((role, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs"
                      >
                        {role}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 pt-6 border-t">
          <div className="flex flex-wrap gap-4">
            <button
              onClick={handleRefreshUser}
              disabled={loading}
              className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white px-4 py-2 rounded font-medium transition-colors"
            >
              {loading ? 'Loading...' : 'Refresh User Data'}
            </button>
            
            <button
              onClick={handleGetTokens}
              disabled={loading}
              className="bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white px-4 py-2 rounded font-medium transition-colors"
            >
              {loading ? 'Loading...' : 'Get Tokens'}
            </button>
            
            <button
              onClick={handleCompleteLogout}
              disabled={loading}
              className="bg-red-500 hover:bg-red-600 disabled:bg-gray-300 text-white px-4 py-2 rounded font-medium transition-colors"
            >
              {loading ? 'Loading...' : 'Complete Logout'}
            </button>
          </div>
        </div>

        {/* Token Information */}
        {tokens && (
          <div className="mt-8 pt-6 border-t">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">
              Token Information
            </h3>
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Access Token
                </label>
                <p className="text-xs text-gray-800 font-mono bg-white p-2 rounded border break-all">
                  {tokens.accessToken.substring(0, 50)}...
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Refresh Token
                </label>
                <p className="text-xs text-gray-800 font-mono bg-white p-2 rounded border break-all">
                  {tokens.refreshToken.substring(0, 50)}...
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600">Token Type</label>
                  <p className="text-sm text-gray-800">{tokens.tokenType}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600">Expires In</label>
                  <p className="text-sm text-gray-800">{tokens.expiresIn} seconds</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 