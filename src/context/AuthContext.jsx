import React, { createContext, useContext, useState, useEffect } from 'react';
import { getMyProfile } from '../api/auth';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('route_social_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('route_social_token') || null);
  const [isLoading, setIsLoading] = useState(true);

  // Sync / refresh user profile data on load if token exists
  useEffect(() => {
    const loadProfile = async () => {
      if (token) {
        try {
          const res = await getMyProfile();
          if (res.data?.user) {
            setUser(res.data.user);
            localStorage.setItem('route_social_user', JSON.stringify(res.data.user));
          }
        } catch (err) {
          console.error('Failed to restore user profile session:', err);
          if (err.response?.status === 401) {
            logout();
          }
        }
      }
      setIsLoading(false);
    };

    loadProfile();
  }, [token]);

  const login = (newToken, newUser) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('route_social_token', newToken);
    localStorage.setItem('route_social_user', JSON.stringify(newUser));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('route_social_token');
    localStorage.removeItem('route_social_user');
  };

  const updateUser = (updatedFields) => {
    setUser((prev) => {
      const updated = { ...prev, ...updatedFields };
      localStorage.setItem('route_social_user', JSON.stringify(updated));
      return updated;
    });
  };

  const refreshUser = async () => {
    if (!token) return;
    try {
      const res = await getMyProfile();
      if (res.data?.user) {
        setUser(res.data.user);
        localStorage.setItem('route_social_user', JSON.stringify(res.data.user));
      }
    } catch (err) {
      console.error('Failed to refresh user:', err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token,
        isLoading,
        login,
        logout,
        updateUser,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
