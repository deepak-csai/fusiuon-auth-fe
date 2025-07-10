import React, { useEffect } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { Router } from './components/Router';
import { FrontendAuth } from './services/api';

function App() {
  useEffect(() => {
    // ✨ Start automatic token cleanup when app loads
    FrontendAuth.startAutoCleanup();
    
    // Clean up expired tokens immediately on startup
    FrontendAuth.cleanupExpired();
  }, []);

  return (
    <AuthProvider>
      <Router />
    </AuthProvider>
  );
}

export default App;
