// pages/PatientDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { appointmentsAPI, prescriptionsAPI } from '../services/api';
import { Link } from 'react-router-dom';

const PatientDashboard = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError('');
        const [appointmentsRes, prescriptionsRes] = await Promise.all([
          appointmentsAPI.getAll(),
          prescriptionsAPI.getAll()
        ]);
        setAppointments((appointmentsRes.data.data || []).slice(0, 3));
        setPrescriptions((prescriptionsRes.data.data || []).slice(0, 3));
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setError(error.response?.data?.message || error.message || 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return <div className="text-center py-10">Loading dashboard...</div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Welcome, {user.profile?.name || user.name}</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recent Appointments */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Appointments</h2>
          {appointments.length === 0 ? (
            <p className="text-gray-500">No appointments found.</p>
          ) : (
            <div className="space-y-3">
              {appointments.map(apt => (
                <div key={apt._id} className="border-b pb-3">
                  <p className="font-medium">Dr. {apt.doctorName}</p>
                  <p className="text-sm text-gray-600">{apt.date} at {apt.time}</p>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    apt.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                    apt.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {apt.status}
                  </span>
                </div>
              ))}
            </div>
          )}
          <Link to="/appointments" className="text-blue-600 text-sm mt-4 inline-block">View all →</Link>
        </div>

        {/* Recent Prescriptions */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Prescriptions</h2>
          {error ? (
            <p className="text-red-600">{error}</p>
          ) : prescriptions.length === 0 ? (
            <p className="text-gray-500">No prescriptions yet.</p>
          ) : (
            <div className="space-y-3">
              {prescriptions.map(pres => (
                <div key={pres._id} className="border-b pb-3">
                  <p className="font-medium">Dr. {pres.doctorName}</p>
                  <p className="text-sm text-gray-600">{pres.date}</p>
                  <p className="text-sm">{(pres.medicines || []).slice(0, 2).map(m => m.name).join(', ')}</p>
                </div>
              ))}
            </div>
          )}
          <Link to="/prescriptions" className="text-blue-600 text-sm mt-4 inline-block">View all →</Link>
        </div>
      </div>

      <div className="mt-6">
        <Link to="/book-appointment" className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition inline-block">
          Book New Appointment
        </Link>
      </div>
    </div>
  );
};

export default PatientDashboard;