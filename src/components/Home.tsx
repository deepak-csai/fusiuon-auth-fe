import { useAuth } from '../contexts/AuthContext';

export function Home() {
  const { isAuthenticated, user, login } = useAuth();

  const handleGetStarted = () => {
    if (isAuthenticated) {
      // Navigate to dashboard if already logged in
      window.history.pushState({}, '', '/dashboard');
      window.dispatchEvent(new PopStateEvent('popstate'));
    } else {
      // Start login flow
      login(window.location.origin);
    }
  };

  const navigate = (path: string) => {
    window.history.pushState({}, '', path);
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 sm:text-6xl">
              Modern Authentication
              <span className="text-blue-600"> Made Simple</span>
            </h1>
            <p className="mt-6 text-xl text-gray-600 max-w-3xl mx-auto">
              Experience seamless OAuth2 + PKCE authentication with FusionAuth integration. 
              Built for modern web applications with security and developer experience in mind.
            </p>
            
            {/* CTA Section */}
            <div className="mt-10">
              {isAuthenticated && user ? (
                <div className="space-y-6">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-6 max-w-lg mx-auto">
                    <div className="flex items-center justify-center space-x-4">
                      <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-lg font-medium">
                          {user.firstName?.charAt(0) || user.email?.charAt(0) || '?'}
                        </span>
                      </div>
                      <div className="text-center">
                        <p className="text-green-800 font-semibold text-lg">
                          Hello, {user.firstName || user.email?.split('@')[0] || 'User'}!
                        </p>
                        <p className="text-green-600 text-sm">{user.email}</p>
                        <p className="text-green-700 text-xs mt-1">✅ Successfully Authenticated</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button
                      onClick={handleGetStarted}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg text-lg font-medium transition-colors"
                    >
                      Go to Dashboard
                    </button>
                    <button
                      onClick={() => navigate('/profile')}
                      className="border border-gray-300 hover:border-gray-400 text-gray-700 px-8 py-3 rounded-lg text-lg font-medium transition-colors"
                    >
                      View Profile
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <button
                    onClick={handleGetStarted}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg text-lg font-medium transition-colors transform hover:scale-105"
                  >
                    Get Started - Sign In
                  </button>
                  <p className="text-gray-500 text-sm">
                    🔒 Secure OAuth2 authentication with Google
                  </p>
                  <div className="text-xs text-gray-400 max-w-md mx-auto">
                    <p>Uses endpoints: <code>/login</code>, <code>/me</code>, <code>/logout</code></p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900">
              Why Choose Our Auth Solution?
            </h2>
            <p className="mt-4 text-xl text-gray-600">
              Production-ready authentication with enterprise-grade security
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white rounded-lg shadow-lg p-8 text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl">🚀</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Simple Integration
              </h3>
              <p className="text-gray-600">
                Just 3 endpoints for complete authentication flow. No complex token management required.
              </p>
              <div className="mt-4 text-sm font-mono bg-gray-100 p-3 rounded text-left">
                <div>GET /login</div>
                <div>GET /me</div>
                <div>GET /logout</div>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="bg-white rounded-lg shadow-lg p-8 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl">🔒</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Enterprise Security
              </h3>
              <p className="text-gray-600">
                OAuth2 + PKCE, HTTPOnly cookies, automatic token refresh, and FusionAuth enterprise features.
              </p>
              <div className="mt-4 space-y-2">
                <div className="text-sm text-green-600">✓ OAuth2 + PKCE</div>
                <div className="text-sm text-green-600">✓ HTTPOnly Cookies</div>
                <div className="text-sm text-green-600">✓ Auto Token Refresh</div>
                <div className="text-sm text-green-600">✓ XSS Protection</div>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="bg-white rounded-lg shadow-lg p-8 text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl">🌐</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Multi-Provider Ready
              </h3>
              <p className="text-gray-600">
                Add Google, LinkedIn, Facebook, or any OAuth provider without changing frontend code.
              </p>
              <div className="mt-4 flex justify-center space-x-2">
                <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs">Google</span>
                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">LinkedIn</span>
                <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs">+More</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Demo Flow Section */}
      <div className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900">
              How It Works
            </h2>
            <p className="mt-4 text-xl text-gray-600">
              Simple 3-step authentication flow
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                1
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Click Sign In</h3>
              <p className="text-gray-600">
                User clicks login button, redirects to <code>/login</code>
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                2
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Authenticate</h3>
              <p className="text-gray-600">
                Secure OAuth2 + PKCE flow with Google (or other providers)
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                3
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Welcome Back</h3>
              <p className="text-gray-600">
                <code>/me</code> endpoint returns user info via cookies
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tech Stack Section */}
      <div className="bg-gray-100 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">
              Built With Modern Tech Stack
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="text-3xl mb-2">⚛️</div>
                <p className="text-gray-600 font-medium">React 18</p>
              </div>
              <div className="text-center">
                <div className="text-3xl mb-2">🚀</div>
                <p className="text-gray-600 font-medium">FastAPI</p>
              </div>
              <div className="text-center">
                <div className="text-3xl mb-2">🔐</div>
                <p className="text-gray-600 font-medium">FusionAuth</p>
              </div>
              <div className="text-center">
                <div className="text-3xl mb-2">🎨</div>
                <p className="text-gray-600 font-medium">Tailwind CSS</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h3 className="text-xl font-bold mb-4">🔐 AuthDemo</h3>
            <p className="text-gray-400 mb-6">
              Production-ready authentication for modern web applications
            </p>
            <div className="flex justify-center space-x-6">
              {import.meta.env.DEV && (
                <button
                  onClick={() => navigate('/debug')}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Debug Flow
                </button>
              )}
              <button
                onClick={() => window.open('https://fusionauth.io/docs', '_blank')}
                className="text-gray-400 hover:text-white transition-colors"
              >
                FusionAuth Docs
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
} 