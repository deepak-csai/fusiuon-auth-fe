# FusionAuth React Test Application

A comprehensive React application demonstrating **multi-tenant authentication** integration with FusionAuth using the FastAPI authentication service.

## Features

- 🏢 **Multi-Tenant Authentication**: Automatic company detection from email domain
- 🔐 **Secure Authentication**: OAuth 2.0 / OpenID Connect with FusionAuth
- 🍪 **Cookie-based Sessions**: HTTPOnly cookies for secure session management
- 🔄 **Automatic Token Refresh**: Seamless token refresh without user interaction
- 📱 **Cross-domain Support**: Works across different domains and applications
- 🛡️ **Protected Routes**: Demonstrate route protection patterns
- 🎨 **Modern UI**: Built with React 19, TypeScript, and Tailwind CSS

## Tech Stack

- **React 19.1.0** with TypeScript
- **Vite 7.0.3** for build tooling
- **Tailwind CSS 4.1.11** for styling
- **Axios 1.10.0** for HTTP requests
- **FusionAuth** for authentication

## Environment Setup

Create a `.env` file in the root directory:

```env
VITE_API_URL=https://auth-api.dev.controlshiftai.com
```

## Available Scripts

```bash
# Install dependencies
bun install

# Start development server
bun run dev

# Build for production
bun run build

# Run linter
bun run lint

# Preview production build
bun run preview
```

## Multi-Tenant Authentication Flow

### 1. Login Process
1. User enters their work email address
2. Application calls `/api/v1/login?email=user@company.com` endpoint
3. Backend detects company from email domain
4. Backend returns company-specific FusionAuth OAuth URL
5. Application redirects to company's FusionAuth instance
6. User completes authentication on FusionAuth
7. FusionAuth redirects back to application with tokens
8. Application automatically fetches user data via cookies

### 2. Protected Routes
- Routes are protected using the `ProtectedRoute` component
- Automatically redirects unauthenticated users to login
- Shows loading state during authentication check

### 3. Logout Process
- **Browser Logout**: `/api/v1/logout` - Clears cookies and redirects
- **Complete Logout**: `/api/v1/auth/logout` - Invalidates tokens everywhere

## API Integration

The application demonstrates integration with all multi-tenant authentication endpoints:

### Multi-Tenant Endpoints (Primary)
- `POST /api/v1/login` - Initiate multi-tenant login with email
- `GET /api/v1/me` - Get current user info using cookies
- `GET /api/v1/logout` - Browser logout with cookie clearing

### Token Management Endpoints (Advanced)
- `GET /api/v1/tokens` - Exchange cookies for JWT tokens
- `GET /api/v1/user` - Get user info with Bearer token
- `POST /api/v1/validate` - Validate a token
- `POST /api/v1/refresh` - Refresh access token
- `POST /api/v1/auth/logout` - Complete logout (invalidates all tokens)

## Components Overview

### Core Components

#### `AuthContext` & `AuthProvider`
- Manages multi-tenant authentication state across the application
- Provides hooks for email-based login initiation and logout
- Handles automatic token refresh and error management
- Supports company detection and tenant routing

#### `Navigation`
- Main navigation bar with multi-tenant login form
- Shows current user information when authenticated
- Displays error messages from authentication operations
- Email input for company detection

#### `ProtectedRoute`
- Wrapper component for protected content
- Automatically redirects to login if not authenticated
- Shows loading state during authentication checks

#### `Router`
- Simple client-side routing
- Handles navigation between Home, Dashboard, and Profile pages
- Updates browser URL for proper navigation
- Includes debug page for development testing

### Page Components

#### `Dashboard`
- Protected dashboard page
- Demonstrates multi-tenant API testing functionality
- Shows authentication features and quick actions
- Tests new endpoints like `/tokens`

#### `UserProfile`
- Detailed user profile page
- Shows all user information from FusionAuth
- Provides token management functionality
- Demonstrates refresh and logout operations

## Usage Examples

### Multi-Tenant Authentication Check
```typescript
import { useAuth } from '../contexts/AuthContext';

function MyComponent() {
  const { isAuthenticated, user, loading, initiateLogin } = useAuth();

  if (loading) return <div>Loading...</div>;
  if (!isAuthenticated) return <div>Please log in</div>;
  
  return <div>Welcome {user?.firstName}!</div>;
}
```

### Multi-Tenant Login
```typescript
import { useAuth } from '../contexts/AuthContext';

function LoginForm() {
  const { initiateLogin } = useAuth();
  const [email, setEmail] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await initiateLogin(email);
      // Will redirect to company's FusionAuth instance
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="user@company.com"
        required
      />
      <button type="submit">Login</button>
    </form>
  );
}
```

### Protecting Routes
```typescript
import { ProtectedRoute } from '../components/ProtectedRoute';

function App() {
  return (
    <ProtectedRoute>
      <SensitiveContent />
    </ProtectedRoute>
  );
}
```

### API Calls
```typescript
import { authService } from '../services/api';

// Get current user (cookie-based)
const user = await authService.checkAuth();

// Get tokens for localStorage
const tokens = await authService.getTokens();

// Logout
await authService.logout();
```

## Testing the Application

### 1. Start the Development Server
```bash
bun run dev
```

### 2. Test Multi-Tenant Authentication Flow
1. Visit `http://localhost:5173`
2. Click "Get Started - Sign In"
3. Enter your work email (e.g., `user@company.com`)
4. Complete OAuth flow on FusionAuth
5. Return to application as authenticated user

### 3. Test Protected Routes
1. Navigate to Dashboard or Profile while authenticated
2. Logout and try accessing protected routes
3. Verify redirect to login page

### 4. Test API Endpoints
1. Use the "Test API" buttons in Dashboard
2. Try getting tokens in Profile page
3. Test refresh functionality

## Multi-Tenant Features

### Company Detection
- Automatically detects company from email domain
- Routes to company-specific FusionAuth instance
- Supports multiple tenants with different configurations

### Cross-Domain Support
- Works across different frontend and backend domains
- Secure cookie-based authentication
- CORS configuration for cross-origin requests

### Tenant Routing
- Smart routing based on email domain
- Company-specific OAuth configurations
- Seamless user experience across tenants

## Error Handling

The application includes comprehensive error handling:

- **Network Errors**: Displayed in navigation bar
- **Authentication Errors**: Automatic redirect to login
- **API Errors**: Contextual error messages with actions
- **Loading States**: Proper loading indicators
- **Multi-Tenant Errors**: Company detection failures

## Security Features

- **HTTPOnly Cookies**: Prevents XSS attacks
- **CORS Configuration**: Secure cross-origin requests
- **Token Validation**: Automatic token refresh
- **Error Boundaries**: Graceful error handling
- **Multi-Tenant Isolation**: Secure tenant separation

## Customization

### Styling
- Uses Tailwind CSS for utility-first styling
- Responsive design for mobile and desktop
- Easy to customize theme and colors

### API Configuration
- Environment-based API URL configuration
- Easy to switch between development and production
- Configurable timeout and retry settings

## Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure your API URL is correctly configured
2. **Authentication Loops**: Check cookie settings and domain configuration
3. **Network Timeouts**: Verify API server is running and accessible
4. **Company Detection Failures**: Check email domain configuration

### Debug Mode
Set `NODE_ENV=development` to enable:
- Detailed error messages
- Console logging
- Development-only features
- Debug page at `/debug`

## Integration with Other Applications

This application demonstrates patterns that can be used in:
- Single Page Applications (SPAs)
- Multi-page applications
- Mobile applications (React Native)
- Server-side rendered applications (Next.js)
- **Multi-tenant SaaS applications**

## Next Steps

- Add role-based access control per tenant
- Implement multi-factor authentication
- Add user registration flow per company
- Integrate with additional FusionAuth features
- Add automated testing
- Implement proper routing library (React Router)
- Add tenant-specific configurations

---

*This guide covers the essential integration steps for multi-tenant frontend applications. For advanced configurations or custom requirements, please refer to the API documentation or contact the development team.*
