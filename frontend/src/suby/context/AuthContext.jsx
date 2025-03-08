import React, { createContext, useContext, useState, useEffect } from 'react';
import { API_URL } from '../api';

// Create context
const AuthContext = createContext();

// Create provider component
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);

  // Check for existing auth on mount
  useEffect(() => {
    const checkAuthStatus = async () => {
      const savedToken = localStorage.getItem('vendorToken');
      const savedUser = localStorage.getItem('vendorInfo');
      
      if (savedToken && savedUser) {
        try {
          // Verify the token is still valid
          const response = await fetch(`${API_URL}/api/vendors/me`, {
            headers: {
              Authorization: `Bearer ${savedToken}`
            }
          });
          
          if (response.ok) {
            // Token is valid
            setToken(savedToken);
            setCurrentUser(JSON.parse(savedUser));
          } else {
            // Token is invalid, clear storage
            localStorage.removeItem('vendorToken');
            localStorage.removeItem('vendorInfo');
          }
        } catch (error) {
          console.error('Auth verification failed:', error);
        }
      }
      
      setLoading(false);
    };
    
    checkAuthStatus();
  }, []);

  // Login function
  const login = async (email, password) => {
    try {
      const response = await fetch(`${API_URL}/api/vendors/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to login');
      }

      // Store token and vendor info
      localStorage.setItem('vendorToken', data.token);
      localStorage.setItem('vendorInfo', JSON.stringify(data.vendor));
      
      // Update state
      setToken(data.token);
      setCurrentUser(data.vendor);
      
      return true;
    } catch (err) {
      console.error('Login failed:', err);
      throw err;
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('vendorToken');
    localStorage.removeItem('vendorInfo');
    setToken(null);
    setCurrentUser(null);
  };

  // Register function
  const register = async (vendorData) => {
    try {
      const response = await fetch(`${API_URL}/api/vendors/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(vendorData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to register');
      }

      // Store token and vendor info
      localStorage.setItem('vendorToken', data.token);
      localStorage.setItem('vendorInfo', JSON.stringify(data.vendor));
      
      // Update state
      setToken(data.token);
      setCurrentUser(data.vendor);
      
      return true;
    } catch (err) {
      console.error('Registration failed:', err);
      throw err;
    }
  };

  // Check if user is authenticated
  const isAuthenticated = !!currentUser;

  // Context value
  const value = {
    currentUser,
    token,
    loading,
    isAuthenticated,
    login,
    logout,
    register
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};