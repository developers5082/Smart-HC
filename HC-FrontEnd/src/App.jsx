
// // App.jsx

// App.jsx - Temporary test
// import React from 'react';

// function App() {
//   return (
//     <div className="min-h-screen bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
//       <div className="bg-white p-8 rounded-lg shadow-2xl">
//         <h1 className="text-3xl font-bold text-gray-800 mb-4">
//           Tailwind CSS is Working! 🎉
//         </h1>
//         <p className="text-gray-600">
//           If you see this with blue/purple gradient background and styled card, 
//           Tailwind is properly configured.
//         </p>
//       </div>
//     </div>
//   );
// }

// export default App;



import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <main className="container mx-auto px-4 py-8">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/" element={<Navigate to="/dashboard" />} />
              
              <Route element={<ProtectedRoute />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/patient-dashboard" element={<PatientDashboard />} />
                <Route path="/doctor-dashboard" element={<DoctorDashboard />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/appointments" element={<Appointments />} />
                <Route path="/prescriptions" element={<Prescriptions />} />
                <Route path="/book-appointment" element={<BookAppointment />} />
                <Route path="/create-prescription/:appointmentId" element={<CreatePrescription />} />
              </Route>
            </Routes>
          </main>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;