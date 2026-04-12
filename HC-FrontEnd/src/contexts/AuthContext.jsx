// contexts/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import { dummyUsers } from '../data/dummyData';

const AuthContext = createContext();

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
    // Simulate API call
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const foundUser = dummyUsers.find(
          u => u.email === email && u.password === password && u.role === role
        );
        if (foundUser) {
          const { password, ...userWithoutPassword } = foundUser;
          setUser(userWithoutPassword);
          localStorage.setItem('user', JSON.stringify(userWithoutPassword));
          resolve(userWithoutPassword);
        } else {
          const err = 'Invalid credentials or role mismatch';
          setError(err);
          reject(err);
        }
      }, 500);
    });
  };

  const signup = async (userData) => {
    setError('');
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const existingUser = dummyUsers.find(u => u.email === userData.email);
        if (existingUser) {
          const err = 'User already exists with this email';
          setError(err);
          reject(err);
        } else {
          const newUser = {
            id: Date.now().toString(),
            ...userData,
            profile: {
              name: userData.name,
              email: userData.email,
              phone: userData.phone || '',
              address: userData.address || '',
              ...(userData.role === 'doctor' && {
                specialization: userData.specialization || '',
                qualification: userData.qualification || '',
                experience: userData.experience || 0
              }),
              ...(userData.role === 'patient' && {
                dateOfBirth: userData.dateOfBirth || '',
                bloodGroup: userData.bloodGroup || ''
              })
            }
          };
          const { password, ...userWithoutPassword } = newUser;
          // In real app, you'd save to backend
          dummyUsers.push(newUser);
          setUser(userWithoutPassword);
          localStorage.setItem('user', JSON.stringify(userWithoutPassword));
          resolve(userWithoutPassword);
        }
      }, 500);
    });
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  const updateUserProfile = async (updatedProfile) => {
    setError('');
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (user) {
          const updatedUser = { ...user, profile: { ...user.profile, ...updatedProfile } };
          setUser(updatedUser);
          localStorage.setItem('user', JSON.stringify(updatedUser));
          
          // Update in dummyUsers array
          const index = dummyUsers.findIndex(u => u.id === user.id);
          if (index !== -1) {
            dummyUsers[index] = { ...dummyUsers[index], ...updatedProfile };
          }
          resolve(updatedUser);
        } else {
          reject('No user logged in');
        }
      }, 500);
    });
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