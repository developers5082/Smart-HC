
// // App.jsx

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import PatientDashboard from './pages/PatientDashboard';
import DoctorDashboard from './pages/DoctorDashboard';
import Profile from './pages/Profile';
import Appointments from './pages/Appointments';
import Prescriptions from './pages/Prescriptions';
import BookAppointment from './pages/BookAppointment';
import CreatePrescription from './pages/CreatePrescription';
import Blog from './pages/Blog';
import BlogDetail from './pages/BlogDetail';
import CreateBlog from './pages/CreateBlog';
import ErrorBoundary from './components/ErrorBoundary';

function AppContent() {
  const location = useLocation();
  const isBlogPage = location.pathname === '/blog' || location.pathname.startsWith('/blog/');

  return (
    <div className="min-h-screen bg-gray-50">
      {!isBlogPage && <Navbar />}
      <main className="container mx-auto px-4 py-8">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/" element={<Navigate to="/blog" />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:id" element={<BlogDetail />} />
          
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/patient-dashboard" element={<PatientDashboard />} />
            <Route path="/doctor-dashboard" element={<DoctorDashboard />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/appointments" element={<Appointments />} />
            <Route path="/prescriptions" element={<Prescriptions />} />
            <Route path="/book-appointment" element={<BookAppointment />} />
            <Route path="/create-prescription/:appointmentId" element={<CreatePrescription />} />
            <Route path="/create-blog" element={<CreateBlog />} />
          </Route>
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <Router>
      <ErrorBoundary>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </ErrorBoundary>
    </Router>
  );
}

export default App;