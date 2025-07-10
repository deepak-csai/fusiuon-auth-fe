import { useAuth } from '../contexts/AuthContext';

export function Navigation() {
  const { user, isAuthenticated, isLoading, login, logout } = useAuth();

  const handleLogin = () => {
    login(window.location.origin);
  };

  const handleLogout = () => {
    logout(window.location.origin);
  };

  const navigate = (path: string) => {
    window.history.pushState({}, '', path);
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and Main Navigation */}
          <div className="flex items-center">
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center">
              <button
                onClick={() => navigate('/')}
                className="text-2xl font-bold text-blue-600 hover:text-blue-700 transition-colors"
              >
                🔐 AuthDemo
              </button>
            </div>

            {/* Main Navigation Links - Always Visible */}
            <div className="hidden md:block ml-10">
              <div className="flex items-baseline space-x-4">
                <button
                  onClick={() => navigate('/')}
                  className="text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Home
                </button>
                
                <button
                  onClick={() => navigate('/dashboard')}
                  className="text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Dashboard
                </button>
                
                <button
                  onClick={() => navigate('/profile')}
                  className="text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Profile
                </button>
                
                {import.meta.env.DEV && (
                  <button
                    onClick={() => navigate('/debug')}
                    className="text-gray-400 hover:text-gray-600 px-3 py-2 rounded-md text-xs font-medium transition-colors"
                  >
                    Debug
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* User Menu */}
          <div className="flex items-center">
            {isLoading ? (
              <div className="flex items-center space-x-2 text-gray-500">
                <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
                <span className="text-sm">Loading...</span>
              </div>
            ) : isAuthenticated && user ? (
              <div className="flex items-center space-x-4">
                {/* User Greeting */}
                <div className="hidden md:block text-right">
                  <div className="text-sm font-medium text-gray-900">
                    Hello, {user.firstName || user.email?.split('@')[0] || 'User'}!
                  </div>
                  <div className="text-xs text-gray-500">
                    {user.email}
                  </div>
                </div>

                {/* User Avatar */}
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {user.firstName?.charAt(0) || user.email?.charAt(0) || '?'}
                  </span>
                </div>

                {/* Sign Out Button */}
                <button
                  onClick={handleLogout}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                {/* Sign In Button */}
                <button
                  onClick={handleLogin}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Sign In
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <button
              onClick={() => navigate('/')}
              className="text-gray-500 hover:text-gray-900 block px-3 py-2 rounded-md text-base font-medium w-full text-left"
            >
              Home
            </button>
            
            <button
              onClick={() => navigate('/dashboard')}
              className="text-gray-500 hover:text-gray-900 block px-3 py-2 rounded-md text-base font-medium w-full text-left"
            >
              Dashboard
            </button>
            
            <button
              onClick={() => navigate('/profile')}
              className="text-gray-500 hover:text-gray-900 block px-3 py-2 rounded-md text-base font-medium w-full text-left"
            >
              Profile
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
} 