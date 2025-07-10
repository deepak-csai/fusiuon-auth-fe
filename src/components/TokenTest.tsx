import React, { useState, useEffect } from 'react';
import { FrontendAuth, TokenManager } from '../services/api';

export function TokenTest() {
  const [tokens, setTokens] = useState<{
    accessToken: string | null;
    refreshToken: string | null;
    idToken: string | null;
    isLoggedIn: boolean;
    areTokensExpired: boolean;
  } | null>(null);
  const [userFromToken, setUserFromToken] = useState<Record<string, unknown> | null>(null);

  const refreshTokenData = () => {
    // ✨ This is what your frontend team wants!
    const currentTokens = {
      accessToken: FrontendAuth.getAccessToken(),
      refreshToken: FrontendAuth.getTokens().refreshToken,
      idToken: FrontendAuth.getTokens().idToken,
      isLoggedIn: FrontendAuth.isLoggedIn(),
      areTokensExpired: FrontendAuth.areTokensExpired()
    };
    
    const tokenUserInfo = FrontendAuth.getUserInfo();
    
    setTokens(currentTokens);
    setUserFromToken(tokenUserInfo);
    
    // Also show in console for debugging
    console.log('🔑 Current tokens:', currentTokens);
    console.log('👤 User from token:', tokenUserInfo);
  };

  const testApiCall = async () => {
    const accessToken = FrontendAuth.getAccessToken();
    if (!accessToken) {
      console.log('❌ No access token available');
      return;
    }

    try {
      const response = await fetch('https://auth-api.dev.controlshiftai.com/api/v1/user', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ API call successful:', data);
      } else {
        console.log('❌ API call failed:', response.status);
      }
    } catch (error) {
      console.error('❌ API call error:', error);
    }
  };

  const forceCleanup = () => {
    const cleaned = TokenManager.cleanupExpiredTokens();
    console.log('🧹 Manual cleanup performed, expired tokens removed:', cleaned);
    refreshTokenData();
  };

  useEffect(() => {
    refreshTokenData();
  }, []);

  return (
    <div className="border rounded-lg p-6 bg-gray-50">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">
        🔑 Token Access Test (For Frontend Teams)
      </h2>
      
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={refreshTokenData}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded font-medium"
          >
            🔄 Refresh Token Data
          </button>
          
          <button
            onClick={testApiCall}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded font-medium"
          >
            🧪 Test API Call
          </button>

          <button
            onClick={forceCleanup}
            className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded font-medium"
          >
            🧹 Force Cleanup
          </button>
        </div>

        {tokens && (
          <div className="bg-white rounded-lg p-4 border">
            <h3 className="font-semibold text-gray-700 mb-2">Current Token Status:</h3>
            <div className="space-y-2 text-sm">
              <div>
                <span className="font-medium">Is Logged In:</span> 
                <span className={tokens.isLoggedIn ? 'text-green-600' : 'text-red-600'}>
                  {tokens.isLoggedIn ? '✅ Yes' : '❌ No'}
                </span>
              </div>
              <div>
                <span className="font-medium">Are Tokens Expired:</span> 
                <span className={tokens.areTokensExpired ? 'text-red-600' : 'text-green-600'}>
                  {tokens.areTokensExpired ? '❌ Yes (Expired)' : '✅ No (Valid)'}
                </span>
              </div>
              <div>
                <span className="font-medium">Access Token:</span> 
                <span className="text-gray-600">
                  {tokens.accessToken ? '✅ Available' : '❌ Not found'}
                </span>
              </div>
              <div>
                <span className="font-medium">Refresh Token:</span> 
                <span className="text-gray-600">
                  {tokens.refreshToken ? '✅ Available' : '❌ Not found'}
                </span>
              </div>
              <div>
                <span className="font-medium">ID Token:</span> 
                <span className="text-gray-600">
                  {tokens.idToken ? '✅ Available' : '❌ Not found'}
                </span>
              </div>
            </div>
          </div>
        )}

        {userFromToken && (
          <div className="bg-white rounded-lg p-4 border">
            <h3 className="font-semibold text-gray-700 mb-2">User Info from Token:</h3>
            <pre className="text-sm text-gray-600 whitespace-pre-wrap">
              {JSON.stringify(userFromToken, null, 2)}
            </pre>
          </div>
        )}

        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <h3 className="font-semibold text-blue-800 mb-2">📝 For Frontend Teams:</h3>
          <div className="text-sm text-blue-700 space-y-1">
            <p><code>FrontendAuth.isLoggedIn()</code> - Check if user is logged in (with expiry check)</p>
            <p><code>FrontendAuth.getAccessToken()</code> - Get access token for API calls</p>
            <p><code>FrontendAuth.getUserInfo()</code> - Get user info from token</p>
            <p><code>FrontendAuth.areTokensExpired()</code> - Check if tokens are expired</p>
            <p><code>FrontendAuth.cleanupExpired()</code> - Manual cleanup of expired tokens</p>
          </div>
        </div>
      </div>
    </div>
  );
} 