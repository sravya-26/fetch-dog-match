import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import DogSearch from './components/DogSearch';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(null); 

  useEffect(() => {
    const cookieExists = document.cookie.includes('fetch-access-token');
    setIsAuthenticated(cookieExists);

    if (cookieExists) {
      // Auto logout after 1 hour
      const timer = setTimeout(() => {
        document.cookie = 'fetch-access-token=; Max-Age=0'; // Clear cookie manually
        setIsAuthenticated(false);
        alert('Session expired. Please log in again.');
      }, 60 * 60 * 1000); 

      return () => clearTimeout(timer);
    }
  }, []);

  if (isAuthenticated === null) {
    // Still checking cookie
    return <div style={{ textAlign: 'center', marginTop: '100px' }}>⏳ Checking authentication...</div>;
  }

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={isAuthenticated ? <Navigate to="/search" /> : <Login onLogin={() => setIsAuthenticated(true)} />}
        />
        <Route
          path="/search"
          element={isAuthenticated ? <DogSearch onLogout={() => setIsAuthenticated(false)} /> : <Navigate to="/unauthorized" />}
        />
        <Route
          path="/unauthorized"
          element={
            <div style={{ textAlign: 'center', marginTop: '100px' }}>
              <h2>🚫 Unauthorized</h2>
              <p>You must be logged in to view this page.</p>
              <a href="/" style={{ textDecoration: 'underline', color: '#0077cc' }}>Go to Login</a>
            </div>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;