# FusionAuth React Test Application

A comprehensive React application demonstrating authentication integration with FusionAuth using the FastAPI authentication service.

## Features

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

## Authentication Flow

### 1. Login Process
1. User clicks "Login" button
2. Application redirects to `/api/v1/login` endpoint
3. FastAPI redirects to FusionAuth OAuth flow
4. User completes authentication on FusionAuth
5. FusionAuth redirects back to application with tokens
6. Application automatically fetches user data via cookies

### 2. Protected Routes
- Routes are protected using the `ProtectedRoute` component
- Automatically redirects unauthenticated users to login
- Shows loading state during authentication check

### 3. Logout Process
- **Browser Logout**: `/api/v1/logout` - Clears cookies and redirects
- **Complete Logout**: `/api/v1/auth/logout` - Invalidates tokens everywhere

## API Integration

The application demonstrates integration with all authentication endpoints:

### Cookie-based Endpoints (Primary)
- `GET /api/v1/me` - Get current user info
- `GET /api/v1/login` - Start OAuth login flow
- `GET /api/v1/logout` - Browser logout with cookie clearing

### Token-based Endpoints (Advanced)
- `GET /api/v1/tokens` - Exchange cookies for JWT tokens
- `GET /api/v1/user` - Get user info with Bearer token
- `POST /api/v1/validate` - Validate a token
- `POST /api/v1/refresh` - Refresh access token
- `POST /api/v1/auth/logout` - Complete logout (invalidates all tokens)

## Components Overview

### Core Components

#### `AuthContext` & `AuthProvider`
- Manages authentication state across the application
- Provides hooks for login, logout, and user data
- Handles automatic token refresh and error management

#### `Navigation`
- Main navigation bar with login/logout buttons
- Shows current user information when authenticated
- Displays error messages from authentication operations

#### `ProtectedRoute`
- Wrapper component for protected content
- Automatically redirects to login if not authenticated
- Shows loading state during authentication checks

#### `Router`
- Simple client-side routing
- Handles navigation between Home, Dashboard, and Profile pages
- Updates browser URL for proper navigation

### Page Components

#### `Dashboard`
- Protected dashboard page
- Demonstrates API testing functionality
- Shows authentication features and quick actions

#### `UserProfile`
- Detailed user profile page
- Shows all user information from FusionAuth
- Provides token management functionality
- Demonstrates refresh and logout operations

## Usage Examples

### Basic Authentication Check
```typescript
import { useAuth } from '../contexts/AuthContext';

function MyComponent() {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;
  if (!isAuthenticated) return <div>Please log in</div>;
  
  return <div>Welcome {user?.firstName}!</div>;
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
const user = await authService.getCurrentUser();

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

### 2. Test Authentication Flow
1. Visit `http://localhost:5173`
2. Click "Login" to start authentication
3. Complete OAuth flow on FusionAuth
4. Return to application as authenticated user

### 3. Test Protected Routes
1. Navigate to Dashboard or Profile while authenticated
2. Logout and try accessing protected routes
3. Verify redirect to login page

### 4. Test API Endpoints
1. Use the "Test API" button in Dashboard
2. Try getting tokens in Profile page
3. Test refresh functionality

## Error Handling

The application includes comprehensive error handling:

- **Network Errors**: Displayed in navigation bar
- **Authentication Errors**: Automatic redirect to login
- **API Errors**: Contextual error messages with actions
- **Loading States**: Proper loading indicators

## Security Features

- **HTTPOnly Cookies**: Prevents XSS attacks
- **CORS Configuration**: Secure cross-origin requests
- **Token Validation**: Automatic token refresh
- **Error Boundaries**: Graceful error handling

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

### Debug Mode
Set `NODE_ENV=development` to enable:
- Detailed error messages
- Console logging
- Development-only features

## Integration with Other Applications

This application demonstrates patterns that can be used in:
- Single Page Applications (SPAs)
- Multi-page applications
- Mobile applications (React Native)
- Server-side rendered applications (Next.js)

## Next Steps

- Add role-based access control
- Implement multi-factor authentication
- Add user registration flow
- Integrate with additional FusionAuth features
- Add automated testing
- Implement proper routing library (React Router)
