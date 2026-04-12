// pages/Dashboard.jsx
import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';

const Dashboard = () => {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" />;

  if (user.role === 'patient') {
    return <Navigate to="/patient-dashboard" />;
  } else {
    return <Navigate to="/doctor-dashboard" />;
  }
};

export default Dashboard;