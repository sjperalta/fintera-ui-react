import React, { createContext, useState, useEffect, useCallback } from 'react';
import { jwtDecode } from "jwt-decode";
import { API_URL } from '../../config';

// Shape of context data
const AuthContext = createContext({
  user: null,
  token: null,
  loading: true,
  error: null,
  login: () => {},
  logout: () => {},
  refresh: () => {},
  setUser: () => {}
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [refreshToken, setRefreshToken] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const isTokenExpired = useCallback((accessToken) => {
    try {
      const { exp } = jwtDecode(accessToken);
      // Add 30 second buffer before actual expiration
      return Date.now() >= (exp * 1000) - 30000;
    } catch (error) {
      console.error('Token decode error:', error);
      return true;
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('refresh_token');
    setUser(null);
    setToken(null);
    setRefreshToken(null);
    setError(null);
  }, []);

  const refresh = useCallback(async (storedRefreshToken) => {
    if (!storedRefreshToken) {
      console.warn('No refresh token available');
      logout();
      return false;
    }

    try {
      const response = await fetch(`${API_URL}/api/v1/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: storedRefreshToken })
      });

      const data = await response.json();
      
      if (response.ok && data.token) {
        // Update tokens and user info
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        if (data.refresh_token) {
          localStorage.setItem('refresh_token', data.refresh_token);
          setRefreshToken(data.refresh_token);
        }
        
        setToken(data.token);
        setUser(data.user);
        setError(null);
        return true;
      } else {
        console.error('Token refresh failed:', data.errors || 'Unknown error');
        setError(data.errors || 'Token refresh failed');
        logout();
        return false;
      }
    } catch (err) {
      console.error('Failed to refresh token:', err);
      setError('Failed to refresh token');
      logout();
      return false;
    }
  }, [logout]);

  // Load tokens and user from localStorage on mount
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      const storedRefresh = localStorage.getItem('refresh_token');

      if (storedToken && storedUser && storedRefresh) {
        try {
          const parsedUser = JSON.parse(storedUser);
          
          // Check if token is expired
          if (isTokenExpired(storedToken)) {
            console.log('Token expired, refreshing...');
            const refreshed = await refresh(storedRefresh);
            
            if (!refreshed) {
              // Refresh failed, clear state
              setLoading(false);
              return;
            }
          } else {
            // Token is still valid
            setToken(storedToken);
            setUser(parsedUser);
            setRefreshToken(storedRefresh);
            setError(null);
          }
        } catch (err) {
          console.error('Error initializing auth:', err);
          logout();
        }
      }
      
      setLoading(false);
    };

    initAuth();
  }, [isTokenExpired, refresh, logout]);

  // Set up automatic token refresh before expiration
  useEffect(() => {
    if (!token || !refreshToken) return;

    const checkAndRefresh = async () => {
      if (isTokenExpired(token)) {
        console.log('Token expired, auto-refreshing...');
        await refresh(refreshToken);
      }
    };

    // Check every 5 minutes
    const interval = setInterval(checkAndRefresh, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [token, refreshToken, isTokenExpired, refresh]);

  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_URL}/api/v1/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();
      
      if (response.ok && data.token && data.user) {
        // Store tokens and user
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        if (data.refresh_token) {
          localStorage.setItem('refresh_token', data.refresh_token);
          setRefreshToken(data.refresh_token);
        }

        setToken(data.token);
        setUser(data.user);
        setError(null);
        
        return { success: true, user: data.user };
      } else {
        const errorMsg = data.errors || data.error || 'Login failed';
        setError(errorMsg);
        return { success: false, error: errorMsg };
      }
    } catch (err) {
      console.error('Login error:', err);
      const errorMsg = 'Network error, please try again later';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        setUser,
        loading,
        error,
        login,
        logout,
        refresh: () => refresh(refreshToken)
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;