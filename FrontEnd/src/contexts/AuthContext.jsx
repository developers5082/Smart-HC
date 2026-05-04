// contexts/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Check localStorage for existing session
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password, role) => {
    setError('');
    try {
      const response = await authAPI.login({ email, password, role });
      const { user, token } = response.data.data;
      setUser(user);
      localStorage.setItem('user', JSON.stringify({ ...user, token }));
      return user;
    } catch (error) {
      const err = error.response?.data?.message || 'Login failed';
      setError(err);
      throw new Error(err);
    }
  };

  const signup = async (userData) => {
    setError('');
    try {
      const response = await authAPI.signup(userData);
      const { user, token } = response.data.data;
      setUser(user);
      localStorage.setItem('user', JSON.stringify({ ...user, token }));
      return user;
    } catch (error) {
      const err = error.response?.data?.message || 'Signup failed';
      setError(err);
      throw new Error(err);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  const updateUserProfile = async (updatedProfile) => {
    setError('');
    try {
      const response = await authAPI.updateProfile(updatedProfile);
      const updatedUser = response.data.data.user;
      setUser(updatedUser);
      // Update localStorage while preserving token
      const storedUser = JSON.parse(localStorage.getItem('user'));
      localStorage.setItem('user', JSON.stringify({ ...updatedUser, token: storedUser?.token }));
      return updatedUser;
    } catch (error) {
      const err = error.response?.data?.message || 'Profile update failed';
      setError(err);
      throw new Error(err);
    }
  };

  const value = {
    user,
    loading,
    error,
    login,
    signup,
    logout,
    updateUserProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};