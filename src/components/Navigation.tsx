import { useAuth } from '../contexts/AuthContext';

export function Navigation() {
  const { user, isAuthenticated, isLoading, error, login, logout, clearError, accessToken } = useAuth();

  const handleLogin = () => {
    // Get current URL for redirect after login
    const currentUrl = window.location.href;
    login(currentUrl);
  };

  const handleLogout = async () => {
    await logout();
  };

  const navigate = (path: string) => {
    window.history.pushState({}, '', path);
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  return (
    <nav className="bg-white shadow-lg border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo/Brand */}
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <h1 className="text-xl font-bold text-gray-800">
                🔐 FusionAuth Test App
              </h1>
            </div>
          </div>

          {/* User Info & Actions */}
          <div className="flex items-center space-x-4">
            {/* Error Display */}
            {error && (
              <div className="bg-red-100 border border-red-300 text-red-700 px-3 py-2 rounded-md text-sm flex items-center space-x-2">
                <span>{error}</span>
                <button
                  onClick={clearError}
                  className="text-red-500 hover:text-red-700 font-bold"
                >
                  ×
                </button>
              </div>
            )}

            {/* Loading State */}
            {isLoading && (
              <div className="flex items-center space-x-2 text-gray-600">
                <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
                <span className="text-sm">Loading...</span>
              </div>
            )}

            {/* User Info */}
            {isAuthenticated && user && (
              <div className="flex items-center space-x-3">
                <div className="text-sm">
                  <div className="font-medium text-gray-800">
                    {user.firstName && user.lastName 
                      ? `${user.firstName} ${user.lastName}`
                      : user.fullName || user.email
                    }
                  </div>
                  {user.email && (
                    <div className="text-gray-500 text-xs">
                      {user.email}
                    </div>
                  )}
                </div>
                
                {/* User Avatar */}
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {user.firstName?.charAt(0) || user.email?.charAt(0) || '?'}
                  </span>
                </div>
              </div>
            )}

            {/* Auth Token Status */}
            {accessToken && (
              <div className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
                🔑 Token Active
              </div>
            )}

            {/* Auth Actions */}
            <div className="flex items-center space-x-2">
              {isAuthenticated ? (
                <div className="flex items-center space-x-2">
                  {/* Profile Link */}
                  <button
                    onClick={() => navigate('/profile')}
                    className="text-gray-600 hover:text-gray-800 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    Profile
                  </button>
                  
                  {/* Dashboard Link */}
                  <button
                    onClick={() => navigate('/dashboard')}
                    className="text-gray-600 hover:text-gray-800 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    Dashboard
                  </button>
                  
                  {/* Logout Button */}
                  <button
                    onClick={handleLogout}
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  {/* Login Button */}
                  <button
                    onClick={handleLogin}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    Login
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Debug Info (only in development) */}
      {import.meta.env.DEV && (
        <div className="bg-gray-100 border-t px-4 py-2">
          <div className="max-w-7xl mx-auto">
            <div className="text-xs text-gray-600">
              <strong>Debug Info:</strong> 
              <span className="ml-2">
                Auth: {isAuthenticated ? '✅ Authenticated' : '❌ Not Authenticated'}
              </span>
              <span className="ml-2">
                Loading: {isLoading ? '⏳ Loading' : '✅ Ready'}
              </span>
              <span className="ml-2">
                User: {user ? `${user.email}` : 'None'}
              </span>
              <span className="ml-2">
                Token: {accessToken ? '🔑 Present' : '❌ Missing'}
              </span>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
} 