// components/Navbar.jsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return null;

  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link to="/dashboard" className="text-xl font-bold text-blue-600">
          MediCare
        </Link>
        <div className="flex items-center space-x-6">
          <Link to="/dashboard" className="text-gray-700 hover:text-blue-600">
            Dashboard
          </Link>
          <Link to="/profile" className="text-gray-700 hover:text-blue-600">
            Profile
          </Link>
          {user.role === 'patient' && (
            <Link to="/book-appointment" className="text-gray-700 hover:text-blue-600">
              Book Appointment
            </Link>
          )}
          <Link to="/appointments" className="text-gray-700 hover:text-blue-600">
            Appointments
          </Link>
          <Link to="/prescriptions" className="text-gray-700 hover:text-blue-600">
            Prescriptions
          </Link>
          {user.role === 'doctor' && (
            <Link to="/create-blog" className="text-gray-700 hover:text-blue-600">
              Enter Blog
            </Link>
          )}
          <Link to="/blog" className="text-gray-700 hover:text-blue-600">
            Blogs
          </Link>
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;